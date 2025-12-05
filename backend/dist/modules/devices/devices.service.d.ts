import { PrismaService } from 'src/database/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
export declare class DevicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createDeviceDto: CreateDeviceDto): Promise<{
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        siteId: string | null;
        deviceId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        ipAddress: string | null;
        apiKey: string | null;
        lastSync: Date | null;
    }>;
    findAll(tenantId: string, filters?: any): Promise<({
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
        _count: {
            attendance: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        siteId: string | null;
        deviceId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        ipAddress: string | null;
        apiKey: string | null;
        lastSync: Date | null;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
        _count: {
            attendance: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        siteId: string | null;
        deviceId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        ipAddress: string | null;
        apiKey: string | null;
        lastSync: Date | null;
    }>;
    findByDeviceId(deviceId: string, tenantId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        siteId: string | null;
        deviceId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        ipAddress: string | null;
        apiKey: string | null;
        lastSync: Date | null;
    }>;
    update(id: string, tenantId: string, updateDeviceDto: UpdateDeviceDto): Promise<{
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        siteId: string | null;
        deviceId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        ipAddress: string | null;
        apiKey: string | null;
        lastSync: Date | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        siteId: string | null;
        deviceId: string;
        deviceType: import(".prisma/client").$Enums.DeviceType;
        ipAddress: string | null;
        apiKey: string | null;
        lastSync: Date | null;
    }>;
    getStats(tenantId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        offline: number;
    }>;
    syncDevice(id: string, tenantId: string): Promise<{
        success: boolean;
        message: string;
        device: {
            site: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                address: string | null;
                city: string | null;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            siteId: string | null;
            deviceId: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    }>;
}
