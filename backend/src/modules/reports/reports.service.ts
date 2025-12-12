import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsQueryDto, DashboardScope } from './dto/dashboard-stats.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { AttendanceType, LeaveStatus, OvertimeStatus } from '@prisma/client';
import { getManagerLevel, getManagedEmployeeIds } from '../../common/utils/manager-level.util';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(
    tenantId: string | null,
    query: DashboardStatsQueryDto,
    userId?: string,
    userRole?: string,
  ) {
    // Si aucun scope n'est spécifié, détecter automatiquement le niveau du manager
    let scope = query.scope;
    
    if (!scope && userId && tenantId) {
      const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);
      if (managerLevel.type === 'DEPARTMENT') {
        scope = DashboardScope.DEPARTMENT;
      } else if (managerLevel.type === 'SITE') {
        scope = DashboardScope.SITE;
      } else if (managerLevel.type === 'TEAM') {
        scope = DashboardScope.TEAM;
      } else {
        scope = DashboardScope.PERSONAL;
      }
    } else {
      scope = scope || DashboardScope.PERSONAL;
    }

    // Valider que l'utilisateur a accès au scope demandé
    this.validateScopeAccess(scope, userRole);

    // Router vers la bonne méthode selon le scope
    switch (scope) {
      case DashboardScope.PERSONAL:
        if (!userId) {
          throw new ForbiddenException('User ID required for personal dashboard');
        }
        return this.getPersonalDashboardStats(userId, tenantId, query);
      
      case DashboardScope.TEAM:
        if (!userId) {
          throw new ForbiddenException('User ID required for team dashboard');
        }
        return this.getTeamDashboardStats(userId, tenantId, query);
      
      case DashboardScope.DEPARTMENT:
        if (!userId || !tenantId) {
          throw new ForbiddenException('User ID and Tenant ID required for department dashboard');
        }
        return this.getDepartmentDashboardStats(userId, tenantId, query);
      
      case DashboardScope.SITE:
        if (!userId || !tenantId) {
          throw new ForbiddenException('User ID and Tenant ID required for site dashboard');
        }
        return this.getSiteDashboardStats(userId, tenantId, query);
      
      case DashboardScope.TENANT:
        if (!tenantId) {
          throw new ForbiddenException('Tenant ID required for tenant dashboard');
        }
        return this.getTenantDashboardStats(tenantId, query);
      
      case DashboardScope.PLATFORM:
        if (userRole !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Only SUPER_ADMIN can access platform dashboard');
        }
        return this.getPlatformDashboardStats(query);
      
      default:
        return this.getTenantDashboardStats(tenantId!, query);
    }
  }

  /**
   * Valide que l'utilisateur a accès au scope demandé
   */
  private validateScopeAccess(scope: DashboardScope, userRole?: string): void {
    switch (scope) {
      case DashboardScope.PERSONAL:
        // Tous les utilisateurs peuvent accéder à leur dashboard personnel
        return;

      case DashboardScope.TEAM:
        // Seuls MANAGER, ADMIN_RH et SUPER_ADMIN peuvent accéder au dashboard équipe
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN_RH' && userRole !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Insufficient permissions for team dashboard');
        }
        return;

      case DashboardScope.DEPARTMENT:
        // Seuls MANAGER (de département), ADMIN_RH et SUPER_ADMIN peuvent accéder au dashboard département
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN_RH' && userRole !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Insufficient permissions for department dashboard');
        }
        return;

      case DashboardScope.SITE:
        // Seuls MANAGER (de site), ADMIN_RH et SUPER_ADMIN peuvent accéder au dashboard site
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN_RH' && userRole !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Insufficient permissions for site dashboard');
        }
        return;

      case DashboardScope.TENANT:
        // Seuls ADMIN_RH et SUPER_ADMIN peuvent accéder au dashboard tenant
        if (userRole !== 'ADMIN_RH' && userRole !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Insufficient permissions for tenant dashboard');
        }
        return;

      case DashboardScope.PLATFORM:
        // Seul SUPER_ADMIN peut accéder au dashboard platform
        if (userRole !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Only SUPER_ADMIN can access platform dashboard');
        }
        return;

      default:
        throw new ForbiddenException('Invalid dashboard scope');
    }
  }

  /**
   * Dashboard personnel (EMPLOYEE)
   */
  async getPersonalDashboardStats(userId: string, tenantId: string | null, query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Récupérer l'employé lié à l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            department: true,
            team: true,
          },
        },
      },
    });

    if (!user || !user.employee) {
      throw new ForbiddenException('User is not linked to an employee');
    }

    const employeeId = user.employee.id;
    const empTenantId = user.employee.tenantId;

    // Statistiques personnelles
    const attendanceEntries = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        tenantId: empTenantId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        type: AttendanceType.IN,
      },
      select: {
        timestamp: true,
        hasAnomaly: true,
        anomalyType: true,
      },
    });

    const workedDays = new Set(
      attendanceEntries.map((a) => {
        const date = new Date(a.timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      })
    ).size;

    const lateCount = attendanceEntries.filter(
      (a) => a.hasAnomaly && a.anomalyType?.includes('LATE')
    ).length;

    // Heures travaillées (simplifié - à améliorer avec calcul réel)
    const totalAttendances = await this.prisma.attendance.count({
      where: {
        employeeId,
        tenantId: empTenantId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Heures supplémentaires
    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        employeeId,
        tenantId: empTenantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: OvertimeStatus.APPROVED,
      },
      _sum: { hours: true },
      _count: { id: true },
    });

    // Congés
    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        employeeId,
        tenantId: empTenantId,
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
      _sum: { days: true },
      _count: { id: true },
    });

    const pendingLeaves = await this.prisma.leave.count({
      where: {
        employeeId,
        tenantId: empTenantId,
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED],
        },
      },
    });

    const pendingOvertime = await this.prisma.overtime.count({
      where: {
        employeeId,
        tenantId: empTenantId,
        status: OvertimeStatus.PENDING,
      },
    });

    // Graphiques personnels (7 derniers jours)
    const last7Days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttendance = await this.prisma.attendance.findMany({
        where: {
          employeeId,
          tenantId: empTenantId,
          timestamp: { gte: date, lt: nextDate },
        },
      });

      const hasEntry = dayAttendance.some(a => a.type === AttendanceType.IN);
      const hasLate = dayAttendance.some(a => a.hasAnomaly && a.anomalyType?.includes('LATE'));

      last7Days.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        present: hasEntry ? 1 : 0,
        late: hasLate ? 1 : 0,
      });
    }

    return {
      scope: 'personal',
      employees: {
        total: 1,
        activeToday: workedDays > 0 ? 1 : 0,
        onLeave: 0,
      },
      pendingApprovals: {
        leaves: pendingLeaves,
        overtime: pendingOvertime,
      },
      attendance: {
        total: totalAttendances,
        anomalies: lateCount,
        anomalyRate: totalAttendances > 0 ? ((lateCount / totalAttendances) * 100).toFixed(2) : 0,
      },
      overtime: {
        totalRecords: overtimeStats._count.id,
        totalHours: overtimeStats._sum.hours || 0,
      },
      leaves: {
        totalRequests: leaveStats._count.id,
        totalDays: leaveStats._sum.days || 0,
        current: pendingLeaves,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      personal: {
        workedDays,
        totalHours: Math.floor(totalAttendances / 2), // Approximation
        lateCount,
        overtimeHours: overtimeStats._sum.hours || 0,
        leaveDays: leaveStats._sum.days || 0,
      },
      weeklyAttendance: last7Days,
    };
  }

  /**
   * Dashboard équipe (MANAGER)
   */
  async getTeamDashboardStats(userId: string, tenantId: string | null, query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Récupérer l'employé et son équipe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            team: {
              include: {
                employees: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.employee || !user.employee.team) {
      throw new ForbiddenException('User is not linked to an employee with a team');
    }

    const team = user.employee.team;
    const teamId = team.id;
    const empTenantId = user.employee.tenantId;
    const teamEmployeeIds = team.employees.map(e => e.id);

    // Statistiques de l'équipe
    const totalTeamEmployees = team.employees.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeToday = await this.prisma.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId: empTenantId,
        employeeId: { in: teamEmployeeIds },
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: AttendanceType.IN,
      },
    });

    const attendanceCount = await this.prisma.attendance.count({
      where: {
        tenantId: empTenantId,
        employeeId: { in: teamEmployeeIds },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const anomaliesCount = await this.prisma.attendance.count({
      where: {
        tenantId: empTenantId,
        employeeId: { in: teamEmployeeIds },
        hasAnomaly: true,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingLeaves = await this.prisma.leave.count({
      where: {
        tenantId: empTenantId,
        employeeId: { in: teamEmployeeIds },
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED],
        },
      },
    });

    const pendingOvertime = await this.prisma.overtime.count({
      where: {
        tenantId: empTenantId,
        employeeId: { in: teamEmployeeIds },
        status: OvertimeStatus.PENDING,
      },
    });

    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        tenantId: empTenantId,
        employeeId: { in: teamEmployeeIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: OvertimeStatus.APPROVED,
      },
      _sum: { hours: true },
      _count: { id: true },
    });

    const attendanceRate = totalTeamEmployees > 0
      ? ((activeToday.length / totalTeamEmployees) * 100).toFixed(1)
      : 0;

    // Graphiques équipe (7 derniers jours)
    const last7Days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttendance = await this.prisma.attendance.findMany({
        where: {
          tenantId: empTenantId,
          employeeId: { in: teamEmployeeIds },
          timestamp: { gte: date, lt: nextDate },
          type: AttendanceType.IN,
        },
        select: { employeeId: true, hasAnomaly: true, anomalyType: true },
      });

      const late = dayAttendance.filter(a => a.hasAnomaly && a.anomalyType?.includes('LATE')).length;
      const absent = totalTeamEmployees - new Set(dayAttendance.map(a => a.employeeId)).size;

      last7Days.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        retards: late,
        absences: absent,
      });
    }

    return {
      scope: 'team',
      team: {
        id: teamId,
        name: team.name,
      },
      employees: {
        total: totalTeamEmployees,
        activeToday: activeToday.length,
        onLeave: 0,
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
        totalRequests: 0,
        totalDays: 0,
        current: pendingLeaves,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      attendanceRate: Number(attendanceRate),
      weeklyAttendance: last7Days,
    };
  }

  /**
   * Dashboard département (Manager de Direction)
   */
  async getDepartmentDashboardStats(userId: string, tenantId: string, query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Récupérer le niveau hiérarchique du manager
    const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);
    
    if (managerLevel.type !== 'DEPARTMENT' || !managerLevel.departmentId) {
      throw new ForbiddenException('User is not a department manager');
    }

    // Récupérer le département
    const department = await this.prisma.department.findFirst({
      where: {
        id: managerLevel.departmentId,
        tenantId,
      },
      include: {
        employees: {
          where: { isActive: true },
        },
      },
    });

    if (!department) {
      throw new ForbiddenException('Department not found');
    }

    const departmentEmployeeIds = department.employees.map(e => e.id);
    const totalDepartmentEmployees = department.employees.length;

    // Récupérer tous les sites du département (via les employés)
    const sites = await this.prisma.site.findMany({
      where: {
        tenantId,
        employees: {
          some: {
            departmentId: managerLevel.departmentId,
            isActive: true,
          },
        },
      },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeToday = await this.prisma.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: AttendanceType.IN,
      },
    });

    const attendanceCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const anomaliesCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        hasAnomaly: true,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingLeaves = await this.prisma.leave.count({
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED],
        },
      },
    });

    const pendingOvertime = await this.prisma.overtime.count({
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        status: OvertimeStatus.PENDING,
      },
    });

    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: OvertimeStatus.APPROVED,
      },
      _sum: { hours: true },
      _count: { id: true },
    });

    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        tenantId,
        employeeId: { in: departmentEmployeeIds },
        startDate: {
          gte: startDate,
          lte: endDate,
        },
        status: LeaveStatus.APPROVED,
      },
      _sum: { days: true },
      _count: { id: true },
    });

    const attendanceRate = totalDepartmentEmployees > 0
      ? ((activeToday.length / totalDepartmentEmployees) * 100).toFixed(1)
      : 0;

    // Graphiques département (7 derniers jours)
    const last7Days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttendance = await this.prisma.attendance.findMany({
        where: {
          tenantId,
          employeeId: { in: departmentEmployeeIds },
          timestamp: { gte: date, lt: nextDate },
          type: AttendanceType.IN,
        },
        select: { employeeId: true, hasAnomaly: true, anomalyType: true },
      });

      const late = dayAttendance.filter(a => a.hasAnomaly && a.anomalyType?.includes('LATE')).length;
      const absent = totalDepartmentEmployees - new Set(dayAttendance.map(a => a.employeeId)).size;

      last7Days.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        retards: late,
        absences: absent,
      });
    }

    return {
      scope: 'department',
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
      },
      sites: sites.map(site => ({
        id: site.id,
        name: site.name,
        code: site.code,
        employeeCount: site._count.employees,
      })),
      employees: {
        total: totalDepartmentEmployees,
        activeToday: activeToday.length,
        onLeave: 0,
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
        current: pendingLeaves,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      attendanceRate: Number(attendanceRate),
      weeklyAttendance: last7Days,
    };
  }

  /**
   * Dashboard site (Manager Régional)
   */
  async getSiteDashboardStats(userId: string, tenantId: string, query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Récupérer le niveau hiérarchique du manager
    const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);
    
    if (managerLevel.type !== 'SITE' || !managerLevel.siteId) {
      throw new ForbiddenException('User is not a site manager');
    }

    // Récupérer le site
    const site = await this.prisma.site.findFirst({
      where: {
        id: managerLevel.siteId,
        tenantId,
      },
      include: {
        employees: {
          where: { isActive: true },
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!site) {
      throw new ForbiddenException('Site not found');
    }

    const siteEmployeeIds = site.employees.map(e => e.id);
    const totalSiteEmployees = site.employees.length;

    // Récupérer les départements présents sur le site
    const departments = await this.prisma.department.findMany({
      where: {
        tenantId,
        employees: {
          some: {
            siteId: managerLevel.siteId,
            isActive: true,
          },
        },
      },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeToday = await this.prisma.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: AttendanceType.IN,
      },
    });

    const attendanceCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const anomaliesCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        hasAnomaly: true,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingLeaves = await this.prisma.leave.count({
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED],
        },
      },
    });

    const pendingOvertime = await this.prisma.overtime.count({
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        status: OvertimeStatus.PENDING,
      },
    });

    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: OvertimeStatus.APPROVED,
      },
      _sum: { hours: true },
      _count: { id: true },
    });

    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        tenantId,
        employeeId: { in: siteEmployeeIds },
        startDate: {
          gte: startDate,
          lte: endDate,
        },
        status: LeaveStatus.APPROVED,
      },
      _sum: { days: true },
      _count: { id: true },
    });

    const attendanceRate = totalSiteEmployees > 0
      ? ((activeToday.length / totalSiteEmployees) * 100).toFixed(1)
      : 0;

    // Graphiques site (7 derniers jours)
    const last7Days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttendance = await this.prisma.attendance.findMany({
        where: {
          tenantId,
          employeeId: { in: siteEmployeeIds },
          timestamp: { gte: date, lt: nextDate },
          type: AttendanceType.IN,
        },
        select: { employeeId: true, hasAnomaly: true, anomalyType: true },
      });

      const late = dayAttendance.filter(a => a.hasAnomaly && a.anomalyType?.includes('LATE')).length;
      const absent = totalSiteEmployees - new Set(dayAttendance.map(a => a.employeeId)).size;

      last7Days.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        retards: late,
        absences: absent,
      });
    }

    return {
      scope: 'site',
      site: {
        id: site.id,
        name: site.name,
        code: site.code,
        city: site.city,
      },
      departments: departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        employeeCount: dept._count.employees,
      })),
      employees: {
        total: totalSiteEmployees,
        activeToday: activeToday.length,
        onLeave: 0,
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
        current: pendingLeaves,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      attendanceRate: Number(attendanceRate),
      weeklyAttendance: last7Days,
    };
  }

  /**
   * Dashboard plateforme (SUPER_ADMIN)
   */
  async getPlatformDashboardStats(query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Statistiques globales de la plateforme (tous les tenants)
    const totalEmployees = await this.prisma.employee.count({
      where: { isActive: true },
    });

    const totalTenants = await this.prisma.tenant.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeToday = await this.prisma.attendance.groupBy({
      by: ['employeeId'],
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: AttendanceType.IN,
      },
    });

    const attendanceCount = await this.prisma.attendance.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const anomaliesCount = await this.prisma.attendance.count({
      where: {
        hasAnomaly: true,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingLeaves = await this.prisma.leave.count({
      where: {
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED],
        },
      },
    });

    const pendingOvertime = await this.prisma.overtime.count({
      where: {
        status: OvertimeStatus.PENDING,
      },
    });

    const overtimeStats = await this.prisma.overtime.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: OvertimeStatus.APPROVED,
      },
      _sum: { hours: true },
      _count: { id: true },
    });

    const leaveStats = await this.prisma.leave.aggregate({
      where: {
        startDate: { gte: startDate },
        endDate: { lte: endDate },
        status: {
          in: [LeaveStatus.APPROVED, LeaveStatus.HR_APPROVED],
        },
      },
      _sum: { days: true },
      _count: { id: true },
    });

    const attendanceRate = totalEmployees > 0
      ? ((activeToday.length / totalEmployees) * 100).toFixed(1)
      : 0;

    return {
      scope: 'platform',
      tenants: {
        total: totalTenants,
        active: totalTenants,
      },
      employees: {
        total: totalEmployees,
        activeToday: activeToday.length,
        onLeave: 0,
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
        current: pendingLeaves,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      attendanceRate: Number(attendanceRate),
    };
  }

  /**
   * Dashboard tenant (ADMIN_RH) - Méthode existante
   */
  async getTenantDashboardStats(tenantId: string, query: DashboardStatsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Ajouter scope au retour
    const result = await this.getTenantDashboardStatsInternal(tenantId, query);
    return {
      ...result,
      scope: 'tenant',
    };
  }

  /**
   * Méthode interne pour le dashboard tenant (logique existante)
   */
  private async getTenantDashboardStatsInternal(tenantId: string, query: DashboardStatsQueryDto) {
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

    // Attendance rate calculation
    const attendanceRate = totalEmployees > 0
      ? ((activeToday.length / totalEmployees) * 100).toFixed(1)
      : 0;

    // Weekly attendance data (last 7 days)
    const last7Days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttendance = await this.prisma.attendance.findMany({
        where: {
          tenantId,
          timestamp: { gte: date, lt: nextDate },
          type: AttendanceType.IN,
        },
        select: { employeeId: true, hasAnomaly: true, anomalyType: true },
      });

      const late = dayAttendance.filter(a => a.hasAnomaly && a.anomalyType?.includes('LATE')).length;
      const absent = totalEmployees - new Set(dayAttendance.map(a => a.employeeId)).size;

      last7Days.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        retards: late,
        absences: absent,
      });
    }

    // Shift distribution
    const shifts = await this.prisma.shift.findMany({
      where: { tenantId },
      select: { id: true, name: true, _count: { select: { employees: true } } },
    });

    const shiftDistribution = shifts.map(shift => ({
      name: shift.name,
      value: shift._count.employees,
    }));

    // Overtime trend (last 4 weeks)
    const overtimeTrend = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (7 * (i + 1)));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (7 * i));

      const weekOvertime = await this.prisma.overtime.aggregate({
        where: {
          tenantId,
          date: { gte: weekStart, lt: weekEnd },
          status: OvertimeStatus.APPROVED,
        },
        _sum: { hours: true },
      });

      overtimeTrend.push({
        semaine: `S${4 - i}`,
        heures: weekOvertime._sum.hours || 0,
      });
    }

    // Late count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const lateCount = await this.prisma.attendance.count({
      where: {
        tenantId,
        timestamp: { gte: sevenDaysAgo },
        hasAnomaly: true,
        anomalyType: { contains: 'LATE' },
      },
    });

    return {
      // KPIs
      attendanceRate: Number(attendanceRate),
      lates: lateCount,
      totalPointages: attendanceCount,
      overtimeHours: overtimeStats._sum.hours || 0,

      // Detailed stats
      employees: {
        total: totalEmployees,
        activeToday: activeToday.length,
        onLeave: 0,
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
        current: pendingLeaves,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },

      // Chart data
      weeklyAttendance: last7Days,
      shiftDistribution,
      overtimeTrend,
      anomalies: anomaliesCount,
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
