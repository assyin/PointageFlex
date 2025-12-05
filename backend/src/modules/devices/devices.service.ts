import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDeviceDto: CreateDeviceDto) {
    // Check if deviceId already exists for this tenant
    const existingDevice = await this.prisma.attendanceDevice.findFirst({
      where: {
        tenantId,
        deviceId: createDeviceDto.deviceId,
      },
    });

    if (existingDevice) {
      throw new ConflictException('Un terminal avec cet ID existe déjà');
    }

    return this.prisma.attendanceDevice.create({
      data: {
        ...createDeviceDto,
        tenantId,
      },
      include: {
        site: true,
      },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.deviceType) {
      where.deviceType = filters.deviceType;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    }

    if (filters?.siteId) {
      where.siteId = filters.siteId;
    }

    return this.prisma.attendanceDevice.findMany({
      where,
      include: {
        site: true,
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const device = await this.prisma.attendanceDevice.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        site: true,
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundException('Terminal non trouvé');
    }

    return device;
  }

  async findByDeviceId(deviceId: string, tenantId: string) {
    return this.prisma.attendanceDevice.findFirst({
      where: {
        deviceId,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, updateDeviceDto: UpdateDeviceDto) {
    await this.findOne(id, tenantId);

    // If updating deviceId, check for conflicts
    if (updateDeviceDto.deviceId) {
      const existingDevice = await this.prisma.attendanceDevice.findFirst({
        where: {
          tenantId,
          deviceId: updateDeviceDto.deviceId,
          NOT: { id },
        },
      });

      if (existingDevice) {
        throw new ConflictException('Un terminal avec cet ID existe déjà');
      }
    }

    return this.prisma.attendanceDevice.update({
      where: { id },
      data: updateDeviceDto,
      include: {
        site: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.attendanceDevice.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [total, active, inactive] = await Promise.all([
      this.prisma.attendanceDevice.count({ where: { tenantId } }),
      this.prisma.attendanceDevice.count({ where: { tenantId, isActive: true } }),
      this.prisma.attendanceDevice.count({ where: { tenantId, isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
      offline: 0, // Would require last sync tracking
    };
  }

  async syncDevice(id: string, tenantId: string) {
    const device = await this.findOne(id, tenantId);

    // Mettre à jour lastSync
    const updatedDevice = await this.prisma.attendanceDevice.update({
      where: { id },
      data: { lastSync: new Date() },
      include: {
        site: true,
      },
    });

    // This would trigger actual sync with physical device
    // For now, just return success
    return {
      success: true,
      message: 'Synchronisation réussie',
      device: updatedDevice,
    };
  }
}
