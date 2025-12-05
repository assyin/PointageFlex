import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsQueryDto } from './dto/dashboard-stats.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { AttendanceType, LeaveStatus, OvertimeStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string, query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Total employees
    const totalEmployees = await this.prisma.employee.count({
      where: { tenantId, isActive: true },
    });

    // Active employees today (with attendance)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeToday = await this.prisma.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: AttendanceType.IN,
      },
    });

    // Pending leaves
    const pendingLeaves = await this.prisma.leave.count({
      where: {
        tenantId,
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED],
        },
      },
    });

    // Pending overtime
    const pendingOvertime = await this.prisma.overtime.count({
      where: {
        tenantId,
        status: OvertimeStatus.PENDING,
      },
    });

    // Attendance summary for period
    const attendanceCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Anomalies count
    const anomaliesCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        hasAnomaly: true,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Overtime stats
    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        tenantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: OvertimeStatus.APPROVED,
      },
      _sum: {
        hours: true,
      },
      _count: {
        id: true,
      },
    });

    // Leave stats
    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        tenantId,
        startDate: {
          gte: startDate,
        },
        endDate: {
          lte: endDate,
        },
        status: {
          in: [LeaveStatus.APPROVED, LeaveStatus.HR_APPROVED],
        },
      },
      _sum: {
        days: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      employees: {
        total: totalEmployees,
        activeToday: activeToday.length,
        onLeave: 0, // Could be calculated based on current date
      },
      pendingApprovals: {
        leaves: pendingLeaves,
        overtime: pendingOvertime,
      },
      attendance: {
        total: attendanceCount,
        anomalies: anomaliesCount,
        anomalyRate: attendanceCount > 0 ? ((anomaliesCount / attendanceCount) * 100).toFixed(2) : 0,
      },
      overtime: {
        totalRecords: overtimeStats._count.id,
        totalHours: overtimeStats._sum.hours || 0,
      },
      leaves: {
        totalRequests: leaveStats._count.id,
        totalDays: leaveStats._sum.days || 0,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }

  async getAttendanceReport(tenantId: string, dto: AttendanceReportDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    const where: any = {
      tenantId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (dto.employeeId) {
      where.employeeId = dto.employeeId;
    }

    if (dto.departmentId) {
      where.employee = {
        departmentId: dto.departmentId,
      };
    }

    if (dto.teamId) {
      where.employee = {
        ...where.employee,
        teamId: dto.teamId,
      };
    }

    const attendance = await this.prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
            department: {
              select: {
                name: true,
              },
            },
            team: {
              select: {
                name: true,
              },
            },
          },
        },
        site: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { timestamp: 'desc' },
        { employee: { lastName: 'asc' } },
      ],
    });

    return {
      data: attendance,
      summary: {
        total: attendance.length,
        anomalies: attendance.filter(a => a.hasAnomaly).length,
        period: {
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
      },
    };
  }

  async getEmployeeReport(tenantId: string, employeeId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Employee info
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId,
      },
      include: {
        department: true,
        team: true,
        site: true,
        currentShift: true,
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Attendance stats
    const attendanceStats = await this.prisma.attendance.groupBy({
      by: ['type'],
      where: {
        tenantId,
        employeeId,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    // Overtime
    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        tenantId,
        employeeId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        hours: true,
      },
      _count: {
        id: true,
      },
    });

    // Leaves
    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        tenantId,
        employeeId,
        startDate: {
          gte: start,
        },
        endDate: {
          lte: end,
        },
      },
      _sum: {
        days: true,
      },
      _count: {
        id: true,
      },
    });

    // Schedules
    const scheduleCount = await this.prisma.schedule.count({
      where: {
        tenantId,
        employeeId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        matricule: employee.matricule,
        position: employee.position,
        department: employee.department?.name,
        team: employee.team?.name,
        site: employee.site?.name,
        currentShift: employee.currentShift?.name,
      },
      period: {
        startDate,
        endDate,
      },
      attendance: {
        total: attendanceStats.reduce((acc, stat) => acc + stat._count.id, 0),
        byType: attendanceStats.map(stat => ({
          type: stat.type,
          count: stat._count.id,
        })),
      },
      overtime: {
        totalRecords: overtimeStats._count.id,
        totalHours: overtimeStats._sum.hours || 0,
      },
      leaves: {
        totalRequests: leaveStats._count.id,
        totalDays: leaveStats._sum.days || 0,
      },
      schedules: {
        total: scheduleCount,
      },
    };
  }

  async getTeamReport(tenantId: string, teamId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Team info
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        tenantId,
      },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
            position: true,
          },
        },
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const employeeIds = team.employees.map(e => e.id);

    // Attendance count
    const attendanceCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        timestamp: {
          gte: start,
          lte: end,
        },
      },
    });

    // Overtime
    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        hours: true,
      },
    });

    // Leaves
    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        startDate: {
          gte: start,
        },
        endDate: {
          lte: end,
        },
      },
      _sum: {
        days: true,
      },
    });

    return {
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        totalEmployees: team.employees.length,
      },
      period: {
        startDate,
        endDate,
      },
      attendance: {
        total: attendanceCount,
      },
      overtime: {
        totalHours: overtimeStats._sum.hours || 0,
      },
      leaves: {
        totalDays: leaveStats._sum.days || 0,
      },
      employees: team.employees,
    };
  }
}
