import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { LeaveStatus, Role } from '@prisma/client';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLeaveDto) {
    // Verify employee belongs to tenant
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: dto.employeeId,
        tenantId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Verify leave type belongs to tenant
    const leaveType = await this.prisma.leaveType.findFirst({
      where: {
        id: dto.leaveTypeId,
        tenantId,
      },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping leaves
    const overlapping = await this.prisma.leave.findFirst({
      where: {
        employeeId: dto.employeeId,
        status: {
          notIn: [LeaveStatus.REJECTED, LeaveStatus.CANCELLED],
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Leave request overlaps with existing leave');
    }

    return this.prisma.leave.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        days: dto.days,
        reason: dto.reason,
        document: dto.document,
        status: LeaveStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      employeeId?: string;
      leaveTypeId?: string;
      status?: LeaveStatus;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.leaveTypeId) {
      where.leaveTypeId = filters.leaveTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              matricule: true,
            },
          },
          leaveType: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leave.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const leave = await this.prisma.leave.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
            position: true,
            email: true,
          },
        },
        leaveType: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    return leave;
  }

  async update(tenantId: string, id: string, dto: UpdateLeaveDto) {
    const leave = await this.findOne(tenantId, id);

    // Only allow updates if leave is still pending
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot update leave that is not pending');
    }

    // Verify leave type belongs to tenant (if provided)
    if (dto.leaveTypeId) {
      const leaveType = await this.prisma.leaveType.findFirst({
        where: {
          id: dto.leaveTypeId,
          tenantId,
        },
      });

      if (!leaveType) {
        throw new NotFoundException('Leave type not found');
      }
    }

    // Validate dates if provided
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ? new Date(dto.startDate) : leave.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : leave.endDate;

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return this.prisma.leave.update({
      where: { id },
      data: {
        ...(dto.leaveTypeId && { leaveTypeId: dto.leaveTypeId }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.days !== undefined && { days: dto.days }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.document !== undefined && { document: dto.document }),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }

  async approve(
    tenantId: string,
    id: string,
    userId: string,
    userRole: Role,
    dto: ApproveLeaveDto,
  ) {
    const leave = await this.findOne(tenantId, id);

    // Only allow approval if leave is pending or in workflow
    const allowedStatuses = [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED];
    if (!allowedStatuses.includes(leave.status as any)) {
      throw new BadRequestException('Leave cannot be approved at this stage');
    }

    const updateData: any = {};

    // Manager approval
    if (userRole === Role.MANAGER) {
      if (dto.status === LeaveStatus.MANAGER_APPROVED) {
        updateData.status = LeaveStatus.MANAGER_APPROVED;
        updateData.managerApprovedBy = userId;
        updateData.managerApprovedAt = new Date();
        updateData.managerComment = dto.comment;
      } else if (dto.status === LeaveStatus.REJECTED) {
        updateData.status = LeaveStatus.REJECTED;
        updateData.managerApprovedBy = userId;
        updateData.managerApprovedAt = new Date();
        updateData.managerComment = dto.comment;
      }
    }

    // HR approval
    if (userRole === Role.ADMIN_RH) {
      if (dto.status === LeaveStatus.APPROVED || dto.status === LeaveStatus.HR_APPROVED) {
        updateData.status = LeaveStatus.APPROVED;
        updateData.hrApprovedBy = userId;
        updateData.hrApprovedAt = new Date();
        updateData.hrComment = dto.comment;
      } else if (dto.status === LeaveStatus.REJECTED) {
        updateData.status = LeaveStatus.REJECTED;
        updateData.hrApprovedBy = userId;
        updateData.hrApprovedAt = new Date();
        updateData.hrComment = dto.comment;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Invalid status transition');
    }

    return this.prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }

  async cancel(tenantId: string, id: string, userId: string) {
    const leave = await this.findOne(tenantId, id);

    // Only allow cancellation if leave is not already rejected or cancelled
    const rejectedStatuses = [LeaveStatus.REJECTED, LeaveStatus.CANCELLED];
    if (rejectedStatuses.includes(leave.status as any)) {
      throw new BadRequestException('Leave is already rejected or cancelled');
    }

    return this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.CANCELLED,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.leave.delete({
      where: { id },
    });
  }

  async getLeaveTypes(tenantId: string) {
    return this.prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createLeaveType(tenantId: string, data: any) {
    return this.prisma.leaveType.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateLeaveType(tenantId: string, id: string, data: any) {
    // Verify leave type belongs to tenant
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, tenantId },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return this.prisma.leaveType.update({
      where: { id },
      data,
    });
  }

  async deleteLeaveType(tenantId: string, id: string) {
    // Verify leave type belongs to tenant
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, tenantId },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Check if any leaves use this type
    const leavesCount = await this.prisma.leave.count({
      where: { leaveTypeId: id },
    });

    if (leavesCount > 0) {
      throw new BadRequestException(
        `Cannot delete leave type. ${leavesCount} leave request(s) are using this type.`
      );
    }

    return this.prisma.leaveType.delete({
      where: { id },
    });
  }
}
