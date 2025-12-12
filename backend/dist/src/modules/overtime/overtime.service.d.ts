import { PrismaService } from '../../database/prisma.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';
import { OvertimeStatus } from '@prisma/client';
export declare class OvertimeService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateOvertimeDto): Promise<{
        employee: {
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
        isNightShift: boolean;
        employeeId: string;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    findAll(tenantId: string, page?: number, limit?: number, filters?: {
        employeeId?: string;
        status?: OvertimeStatus;
        startDate?: string;
        endDate?: string;
        isNightShift?: boolean;
    }, userId?: string, userPermissions?: string[]): Promise<{
        data: ({
            employee: {
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
            isNightShift: boolean;
            employeeId: string;
            date: Date;
            hours: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            convertedToRecovery: boolean;
            recoveryId: string | null;
            status: import(".prisma/client").$Enums.OvertimeStatus;
            approvedBy: string | null;
            approvedAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(tenantId: string, id: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            matricule: string;
            position: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isNightShift: boolean;
        employeeId: string;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateOvertimeDto): Promise<{
        employee: {
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
        isNightShift: boolean;
        employeeId: string;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    approve(tenantId: string, id: string, userId: string, dto: ApproveOvertimeDto): Promise<{
        employee: {
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
        isNightShift: boolean;
        employeeId: string;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    convertToRecovery(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        hours: import("@prisma/client/runtime/library").Decimal;
        source: string | null;
        usedHours: import("@prisma/client/runtime/library").Decimal;
        remainingHours: import("@prisma/client/runtime/library").Decimal;
        expiryDate: Date | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isNightShift: boolean;
        employeeId: string;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
}
