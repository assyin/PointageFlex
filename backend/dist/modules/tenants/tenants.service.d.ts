import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/tenant-settings.dto';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTenantDto): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            workDaysPerWeek: number;
            maxWeeklyHours: import("@prisma/client/runtime/library").Decimal;
            lateToleranceMinutes: number;
            breakDuration: number;
            alertWeeklyHoursExceeded: boolean;
            alertInsufficientRest: boolean;
            alertNightWorkRepetitive: boolean;
            alertMinimumStaffing: boolean;
            annualLeaveDays: number;
            leaveApprovalLevels: number;
            overtimeRate: import("@prisma/client/runtime/library").Decimal;
            nightShiftRate: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        email: string;
        companyName: string;
        slug: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        logo: string | null;
        address: string | null;
        country: string;
        timezone: string;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: ({
            _count: {
                users: number;
                employees: number;
            };
            settings: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                workDaysPerWeek: number;
                maxWeeklyHours: import("@prisma/client/runtime/library").Decimal;
                lateToleranceMinutes: number;
                breakDuration: number;
                alertWeeklyHoursExceeded: boolean;
                alertInsufficientRest: boolean;
                alertNightWorkRepetitive: boolean;
                alertMinimumStaffing: boolean;
                annualLeaveDays: number;
                leaveApprovalLevels: number;
                overtimeRate: import("@prisma/client/runtime/library").Decimal;
                nightShiftRate: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            email: string;
            companyName: string;
            slug: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            logo: string | null;
            address: string | null;
            country: string;
            timezone: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
            employees: number;
            sites: number;
        };
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            workDaysPerWeek: number;
            maxWeeklyHours: import("@prisma/client/runtime/library").Decimal;
            lateToleranceMinutes: number;
            breakDuration: number;
            alertWeeklyHoursExceeded: boolean;
            alertInsufficientRest: boolean;
            alertNightWorkRepetitive: boolean;
            alertMinimumStaffing: boolean;
            annualLeaveDays: number;
            leaveApprovalLevels: number;
            overtimeRate: import("@prisma/client/runtime/library").Decimal;
            nightShiftRate: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        email: string;
        companyName: string;
        slug: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        logo: string | null;
        address: string | null;
        country: string;
        timezone: string;
    }>;
    update(id: string, dto: UpdateTenantDto): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            workDaysPerWeek: number;
            maxWeeklyHours: import("@prisma/client/runtime/library").Decimal;
            lateToleranceMinutes: number;
            breakDuration: number;
            alertWeeklyHoursExceeded: boolean;
            alertInsufficientRest: boolean;
            alertNightWorkRepetitive: boolean;
            alertMinimumStaffing: boolean;
            annualLeaveDays: number;
            leaveApprovalLevels: number;
            overtimeRate: import("@prisma/client/runtime/library").Decimal;
            nightShiftRate: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        email: string;
        companyName: string;
        slug: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        logo: string | null;
        address: string | null;
        country: string;
        timezone: string;
    }>;
    remove(id: string): Promise<{
        email: string;
        companyName: string;
        slug: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        logo: string | null;
        address: string | null;
        country: string;
        timezone: string;
    }>;
    getSettings(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        workDaysPerWeek: number;
        maxWeeklyHours: import("@prisma/client/runtime/library").Decimal;
        lateToleranceMinutes: number;
        breakDuration: number;
        alertWeeklyHoursExceeded: boolean;
        alertInsufficientRest: boolean;
        alertNightWorkRepetitive: boolean;
        alertMinimumStaffing: boolean;
        annualLeaveDays: number;
        leaveApprovalLevels: number;
        overtimeRate: import("@prisma/client/runtime/library").Decimal;
        nightShiftRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateSettings(tenantId: string, dto: UpdateTenantSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        workDaysPerWeek: number;
        maxWeeklyHours: import("@prisma/client/runtime/library").Decimal;
        lateToleranceMinutes: number;
        breakDuration: number;
        alertWeeklyHoursExceeded: boolean;
        alertInsufficientRest: boolean;
        alertNightWorkRepetitive: boolean;
        alertMinimumStaffing: boolean;
        annualLeaveDays: number;
        leaveApprovalLevels: number;
        overtimeRate: import("@prisma/client/runtime/library").Decimal;
        nightShiftRate: import("@prisma/client/runtime/library").Decimal;
    }>;
}
