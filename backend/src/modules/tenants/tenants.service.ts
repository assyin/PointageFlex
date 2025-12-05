import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/tenant-settings.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    // Vérifier si le slug existe
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        ...dto,
        settings: {
          create: {}, // Settings par défaut
        },
      },
      include: {
        settings: true,
      },
    });

    return tenant;
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          settings: true,
          _count: {
            select: {
              users: true,
              employees: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
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

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            employees: true,
            sites: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id },
      data: dto,
      include: {
        settings: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async getSettings(tenantId: string) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    return settings;
  }

  async updateSettings(tenantId: string, dto: UpdateTenantSettingsDto) {
    return this.prisma.tenantSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...dto,
      },
      update: dto,
    });
  }
}
