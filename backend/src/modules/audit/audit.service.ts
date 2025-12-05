import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        oldValues: dto.oldValues,
        newValues: dto.newValues,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: QueryAuditLogDto,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.entity) {
      where.entity = filters.entity;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
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
    const auditLog = await this.prisma.auditLog.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }

    return auditLog;
  }

  async getActionSummary(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const actionSummary = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return actionSummary.map(item => ({
      action: item.action,
      count: item._count.id,
    }));
  }

  async getEntitySummary(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const entitySummary = await this.prisma.auditLog.groupBy({
      by: ['entity'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return entitySummary.map(item => ({
      entity: item.entity,
      count: item._count.id,
    }));
  }

  async getUserActivity(tenantId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      userId,
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
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
}
