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
            matricule: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        approvedHours: import("@prisma/client/runtime/library").Decimal | null;
        type: import(".prisma/client").$Enums.OvertimeType;
        isNightShift: boolean;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        notes: string | null;
        tenantId: string;
        employeeId: string;
    }>;
    findAll(tenantId: string, page?: number, limit?: number, filters?: {
        employeeId?: string;
        status?: OvertimeStatus;
        startDate?: string;
        endDate?: string;
        isNightShift?: boolean;
        type?: string;
    }, userId?: string, userPermissions?: string[]): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            totalHours?: undefined;
        };
    } | {
        data: {
            hours: any;
            approvedHours: any;
            rate: any;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            type: import(".prisma/client").$Enums.OvertimeType;
            isNightShift: boolean;
            convertedToRecovery: boolean;
            recoveryId: string;
            status: import(".prisma/client").$Enums.OvertimeStatus;
            approvedBy: string;
            approvedAt: Date;
            rejectionReason: string;
            notes: string;
            employee: {
                id: string;
                matricule: string;
                firstName: string;
                lastName: string;
                site: {
                    id: string;
                    name: string;
                    code: string;
                };
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            totalHours: number;
        };
    }>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        approvedHours: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.OvertimeType;
        isNightShift: boolean;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string;
        approvedAt: Date;
        rejectionReason: string;
        notes: string;
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            email: string;
            position: string;
        };
    }>;
    update(tenantId: string, id: string, dto: UpdateOvertimeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        approvedHours: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.OvertimeType;
        isNightShift: boolean;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string;
        approvedAt: Date;
        rejectionReason: string;
        notes: string;
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
    }>;
    approve(tenantId: string, id: string, userId: string, dto: ApproveOvertimeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        approvedHours: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.OvertimeType;
        isNightShift: boolean;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string;
        approvedAt: Date;
        rejectionReason: string;
        notes: string;
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
    }>;
    convertToRecovery(tenantId: string, id: string, conversionRate?: number, expiryDays?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        tenantId: string;
        employeeId: string;
        source: string | null;
        usedHours: import("@prisma/client/runtime/library").Decimal;
        remainingHours: import("@prisma/client/runtime/library").Decimal;
        expiryDate: Date | null;
    }>;
    getBalance(tenantId: string, employeeId: string): Promise<{
        employeeId: string;
        totalRequested: number;
        totalApproved: number;
        totalPending: number;
        totalRejected: number;
        totalPaid: number;
        totalRecovered: number;
        availableForConversion: number;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        hours: import("@prisma/client/runtime/library").Decimal;
        approvedHours: import("@prisma/client/runtime/library").Decimal | null;
        type: import(".prisma/client").$Enums.OvertimeType;
        isNightShift: boolean;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        notes: string | null;
        tenantId: string;
        employeeId: string;
    }>;
}
