import { PrismaService } from '../../database/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
export declare class SitesService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateManagerDepartmentConstraint;
    create(tenantId: string, dto: CreateSiteDto): Promise<{
        _count: {
            employees: number;
            devices: number;
        };
        manager: {
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        phone: string | null;
        name: string;
        code: string | null;
        address: string | null;
        departmentId: string | null;
        managerId: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        timezone: string | null;
        workingDays: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(tenantId: string): Promise<{
        data: {
            _count: {
                employees: number;
                devices: number;
                attendance: number;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            phone: string | null;
            name: string;
            code: string | null;
            address: string | null;
            departmentId: string | null;
            managerId: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            timezone: string | null;
            workingDays: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        total: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        _count: {
            attendance: number;
            employees: number;
            devices: number;
        };
        employees: {
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
        }[];
        manager: {
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
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
        tenantId: string;
        phone: string | null;
        name: string;
        code: string | null;
        address: string | null;
        departmentId: string | null;
        managerId: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        timezone: string | null;
        workingDays: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateSiteDto): Promise<{
        _count: {
            employees: number;
            devices: number;
        };
        manager: {
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        phone: string | null;
        name: string;
        code: string | null;
        address: string | null;
        departmentId: string | null;
        managerId: string | null;
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
