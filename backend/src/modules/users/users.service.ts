import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateUserDto) {
    // Vérifier si l'email existe déjà pour ce tenant
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      search?: string;
      role?: Role;
      isActive?: boolean;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' as const } },
        { lastName: { contains: filters.search, mode: 'insensitive' as const } },
        { email: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
