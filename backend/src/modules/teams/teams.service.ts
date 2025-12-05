import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTeamDto) {
    // Check if team code already exists for this tenant
    const existing = await this.prisma.team.findFirst({
      where: {
        tenantId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Team code already exists');
    }

    return this.prisma.team.create({
      data: {
        ...dto,
        tenantId,
        rotationEnabled: dto.rotationEnabled || false,
      },
      include: {
        employees: {
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
      search?: string;
      rotationEnabled?: boolean;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { code: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    if (filters?.rotationEnabled !== undefined) {
      where.rotationEnabled = filters.rotationEnabled;
    }

    const [data, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        include: {
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              matricule: true,
            },
          },
          _count: {
            select: {
              employees: true,
              schedules: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.team.count({ where }),
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
    const team = await this.prisma.team.findFirst({
      where: {
        id,
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
            email: true,
          },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(tenantId: string, id: string, dto: UpdateTeamDto) {
    await this.findOne(tenantId, id);

    // Check if new code conflicts with existing team
    if (dto.code) {
      const existing = await this.prisma.team.findFirst({
        where: {
          tenantId,
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Team code already exists');
      }
    }

    return this.prisma.team.update({
      where: { id },
      data: dto,
      include: {
        employees: {
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

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.team.delete({
      where: { id },
    });
  }
}
