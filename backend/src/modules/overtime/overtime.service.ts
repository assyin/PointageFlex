import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';
import { OvertimeStatus } from '@prisma/client';
import { getManagerLevel, getManagedEmployeeIds } from '../../common/utils/manager-level.util';

@Injectable()
export class OvertimeService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateOvertimeDto) {
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

    // Get tenant settings for default rates
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    const rate = dto.rate || (dto.isNightShift
      ? Number(settings?.nightShiftRate || 1.5)
      : Number(settings?.overtimeRate || 1.25));

    return this.prisma.overtime.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        hours: dto.hours,
        isNightShift: dto.isNightShift || false,
        rate,
        status: OvertimeStatus.PENDING,
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
      },
    });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      employeeId?: string;
      status?: OvertimeStatus;
      startDate?: string;
      endDate?: string;
      isNightShift?: boolean;
    },
    userId?: string,
    userPermissions?: string[],
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    // Filtrer par employé si l'utilisateur n'a que la permission 'overtime.view_own'
    const hasViewAll = userPermissions?.includes('overtime.view_all');
    const hasViewOwn = userPermissions?.includes('overtime.view_own');
    const hasViewDepartment = userPermissions?.includes('overtime.view_department');
    const hasViewSite = userPermissions?.includes('overtime.view_site');

    if (!hasViewAll && hasViewOwn && userId) {
      // Récupérer l'employé lié à cet utilisateur
      const employee = await this.prisma.employee.findFirst({
        where: { userId, tenantId },
        select: { id: true },
      });

      if (employee) {
        where.employeeId = employee.id;
      } else {
        // Si pas d'employé lié, retourner vide
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
    } else if (!hasViewAll && userId && (hasViewDepartment || hasViewSite)) {
      // Détecter le niveau hiérarchique du manager
      const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);

      if (managerLevel.type === 'DEPARTMENT' && hasViewDepartment) {
        // Manager de département : filtrer par les employés du département
        const managedEmployeeIds = await getManagedEmployeeIds(this.prisma, managerLevel, tenantId);
        if (managedEmployeeIds.length === 0) {
          return {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
        where.employeeId = { in: managedEmployeeIds };
      } else if (managerLevel.type === 'SITE' && hasViewSite) {
        // Manager de site : filtrer par les employés du site
        const managedEmployeeIds = await getManagedEmployeeIds(this.prisma, managerLevel, tenantId);
        if (managedEmployeeIds.length === 0) {
          return {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
        where.employeeId = { in: managedEmployeeIds };
      } else if (managerLevel.type) {
        // Manager détecté mais pas la permission correspondante
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
    } else if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isNightShift !== undefined) {
      where.isNightShift = filters.isNightShift;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.overtime.findMany({
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
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.overtime.count({ where }),
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
    const overtime = await this.prisma.overtime.findFirst({
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
      },
    });

    if (!overtime) {
      throw new NotFoundException('Overtime record not found');
    }

    return overtime;
  }

  async update(tenantId: string, id: string, dto: UpdateOvertimeDto) {
    const overtime = await this.findOne(tenantId, id);

    // Only allow updates if overtime is still pending
    if (overtime.status !== OvertimeStatus.PENDING) {
      throw new BadRequestException('Cannot update overtime that is not pending');
    }

    return this.prisma.overtime.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.hours !== undefined && { hours: dto.hours }),
        ...(dto.isNightShift !== undefined && { isNightShift: dto.isNightShift }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
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
      },
    });
  }

  async approve(
    tenantId: string,
    id: string,
    userId: string,
    dto: ApproveOvertimeDto,
  ) {
    const overtime = await this.findOne(tenantId, id);

    // Only allow approval/rejection if overtime is pending
    if (overtime.status !== OvertimeStatus.PENDING) {
      throw new BadRequestException('Overtime can only be approved or rejected when pending');
    }

    return this.prisma.overtime.update({
      where: { id },
      data: {
        status: dto.status,
        approvedBy: dto.status === OvertimeStatus.APPROVED ? userId : undefined,
        approvedAt: dto.status === OvertimeStatus.APPROVED ? new Date() : undefined,
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
      },
    });
  }

  async convertToRecovery(tenantId: string, id: string) {
    const overtime = await this.findOne(tenantId, id);

    // Only convert approved overtime
    if (overtime.status !== OvertimeStatus.APPROVED) {
      throw new BadRequestException('Only approved overtime can be converted to recovery');
    }

    // Check if already converted
    if (overtime.convertedToRecovery) {
      throw new BadRequestException('Overtime already converted to recovery');
    }

    // Create recovery record
    const recovery = await this.prisma.recovery.create({
      data: {
        tenantId,
        employeeId: overtime.employeeId,
        hours: overtime.hours,
        source: 'OVERTIME',
        usedHours: 0,
        remainingHours: overtime.hours,
      },
    });

    // Update overtime record
    await this.prisma.overtime.update({
      where: { id },
      data: {
        convertedToRecovery: true,
        recoveryId: recovery.id,
      },
    });

    return recovery;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.overtime.delete({
      where: { id },
    });
  }
}
