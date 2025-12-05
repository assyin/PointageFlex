import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';
import { OvertimeStatus } from '@prisma/client';
export declare class OvertimeController {
    private overtimeService;
    constructor(overtimeService: OvertimeService);
    create(user: any, dto: CreateOvertimeDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        date: Date;
        isNightShift: boolean;
        approvedBy: string | null;
        approvedAt: Date | null;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
    }>;
    findAll(user: any, page?: string, limit?: string, employeeId?: string, status?: OvertimeStatus, startDate?: string, endDate?: string, isNightShift?: string): Promise<{
        data: ({
            employee: {
                firstName: string;
                lastName: string;
                id: string;
                matricule: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            employeeId: string;
            status: import(".prisma/client").$Enums.OvertimeStatus;
            date: Date;
            isNightShift: boolean;
            approvedBy: string | null;
            approvedAt: Date | null;
            hours: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            convertedToRecovery: boolean;
            recoveryId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: any, id: string): Promise<{
        employee: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            position: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        date: Date;
        isNightShift: boolean;
        approvedBy: string | null;
        approvedAt: Date | null;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
    }>;
    update(user: any, id: string, dto: UpdateOvertimeDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        date: Date;
        isNightShift: boolean;
        approvedBy: string | null;
        approvedAt: Date | null;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
    }>;
    approve(user: any, id: string, dto: ApproveOvertimeDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        date: Date;
        isNightShift: boolean;
        approvedBy: string | null;
        approvedAt: Date | null;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
    }>;
    convertToRecovery(user: any, id: string): Promise<{
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
    remove(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.OvertimeStatus;
        date: Date;
        isNightShift: boolean;
        approvedBy: string | null;
        approvedAt: Date | null;
        hours: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        convertedToRecovery: boolean;
        recoveryId: string | null;
    }>;
}
