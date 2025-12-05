import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateShiftDto) {
    // Check if shift code already exists for this tenant
    const existing = await this.prisma.shift.findFirst({
      where: {
        tenantId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Shift code already exists');
    }

    return this.prisma.shift.create({
      data: {
        ...dto,
        tenantId,
        breakDuration: dto.breakDuration || 60,
        isNightShift: dto.isNightShift || false,
      },
    });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      search?: string;
      isNightShift?: boolean;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { code: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    if (filters?.isNightShift !== undefined) {
      where.isNightShift = filters.isNightShift;
    }

    const [data, total] = await Promise.all([
      this.prisma.shift.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.shift.count({ where }),
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
    const shift = await this.prisma.shift.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  async update(tenantId: string, id: string, dto: UpdateShiftDto) {
    await this.findOne(tenantId, id);

    // Check if new code conflicts with existing shift
    if (dto.code) {
      const existing = await this.prisma.shift.findFirst({
        where: {
          tenantId,
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Shift code already exists');
      }
    }

    return this.prisma.shift.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.shift.delete({
      where: { id },
    });
  }
}
