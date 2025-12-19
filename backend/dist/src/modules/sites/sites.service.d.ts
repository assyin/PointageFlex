import { PrismaService } from '../../database/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
export declare class SitesService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateManagerDepartmentConstraint;
    create(tenantId: string, dto: CreateSiteDto): Promise<{
        manager: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            employees: number;
            devices: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        tenantId: string;
        managerId: string | null;
        phone: string | null;
        address: string | null;
        departmentId: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        timezone: string | null;
        workingDays: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(tenantId: string, userId?: string, userPermissions?: string[]): Promise<{
        data: {
            _count: {
                employees: number;
                devices: number;
                attendance: number;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string | null;
            tenantId: string;
            managerId: string | null;
            phone: string | null;
            address: string | null;
            departmentId: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            timezone: string | null;
            workingDays: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        total: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        manager: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
        employees: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        }[];
        _count: {
            employees: number;
            attendance: number;
            devices: number;
        };
        devices: {
            id: string;
            name: string;
            deviceId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        tenantId: string;
        managerId: string | null;
        phone: string | null;
        address: string | null;
        departmentId: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        timezone: string | null;
        workingDays: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateSiteDto): Promise<{
        manager: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            employees: number;
            devices: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        tenantId: string;
        managerId: string | null;
        phone: string | null;
        address: string | null;
        departmentId: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        timezone: string | null;
        workingDays: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
