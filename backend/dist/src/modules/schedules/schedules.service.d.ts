import { PrismaService } from '../../database/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ImportScheduleResultDto } from './dto/import-schedule.dto';
export declare class SchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    private parseDateString;
    private formatDateToISO;
    private generateDateRange;
    create(tenantId: string, dto: CreateScheduleDto): Promise<{
        count: number;
        created: number;
        skipped: number;
        conflictingDates: {
            date: string;
            shift: string;
        }[];
        dateRange: {
            start: string;
            end: string;
        };
        message: string;
    }>;
    private formatDate;
    findAll(tenantId: string, page?: number, limit?: number, filters?: {
        employeeId?: string;
        teamId?: string;
        shiftId?: string;
        siteId?: string;
        startDate?: string;
        endDate?: string;
    }, userId?: string, userPermissions?: string[]): Promise<{
        data: ({
            shift: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                startTime: string;
                endTime: string;
                breakDuration: number;
                isNightShift: boolean;
                color: string | null;
            };
            employee: {
                id: string;
                matricule: string;
                firstName: string;
                lastName: string;
                position: string;
                department: {
                    id: string;
                    name: string;
                };
                site: {
                    id: string;
                    name: string;
                };
            };
            team: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            tenantId: string;
            employeeId: string;
            shiftId: string;
            teamId: string | null;
            date: Date;
            customStartTime: string | null;
            customEndTime: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(tenantId: string, id: string): Promise<{
        shift: {
            tenantId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            startTime: string;
            endTime: string;
            breakDuration: number;
            isNightShift: boolean;
            color: string | null;
        };
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            position: string;
        };
        team: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        tenantId: string;
        employeeId: string;
        shiftId: string;
        teamId: string | null;
        date: Date;
        customStartTime: string | null;
        customEndTime: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(tenantId: string, id: string, dto: UpdateScheduleDto): Promise<{
        shift: {
            tenantId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            startTime: string;
            endTime: string;
            breakDuration: number;
            isNightShift: boolean;
            color: string | null;
        };
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
        team: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        tenantId: string;
        employeeId: string;
        shiftId: string;
        teamId: string | null;
        date: Date;
        customStartTime: string | null;
        customEndTime: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(tenantId: string, id: string): Promise<{
        tenantId: string;
        employeeId: string;
        shiftId: string;
        teamId: string | null;
        date: Date;
        customStartTime: string | null;
        customEndTime: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeBulk(tenantId: string, ids: string[]): Promise<{
        count: number;
        deleted: number;
    }>;
    getWeekSchedule(tenantId: string, date: string, filters?: {
        teamId?: string;
        siteId?: string;
    }): Promise<{
        weekStart: string;
        weekEnd: string;
        schedules: ({
            shift: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                startTime: string;
                endTime: string;
                breakDuration: number;
                isNightShift: boolean;
                color: string | null;
            };
            employee: {
                id: string;
                team: {
                    id: string;
                    name: string;
                    code: string;
                };
                matricule: string;
                firstName: string;
                lastName: string;
                position: string;
                department: {
                    id: string;
                    name: string;
                };
                site: {
                    id: string;
                    name: string;
                };
            };
            team: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            tenantId: string;
            employeeId: string;
            shiftId: string;
            teamId: string | null;
            date: Date;
            customStartTime: string | null;
            customEndTime: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        leaves: ({
            employee: {
                id: string;
                firstName: string;
                lastName: string;
            };
            leaveType: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                isPaid: boolean;
                requiresDocument: boolean;
                maxDaysPerYear: number | null;
            };
        } & {
            tenantId: string;
            employeeId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            leaveTypeId: string;
            startDate: Date;
            endDate: Date;
            days: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            document: string | null;
            documentName: string | null;
            documentSize: number | null;
            documentMimeType: string | null;
            documentUploadedBy: string | null;
            documentUploadedAt: Date | null;
            documentUpdatedBy: string | null;
            documentUpdatedAt: Date | null;
            status: import(".prisma/client").$Enums.LeaveStatus;
            managerApprovedBy: string | null;
            managerApprovedAt: Date | null;
            managerComment: string | null;
            hrApprovedBy: string | null;
            hrApprovedAt: Date | null;
            hrComment: string | null;
        })[];
        replacements: ({
            shift: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                startTime: string;
                endTime: string;
                breakDuration: number;
                isNightShift: boolean;
                color: string | null;
            };
            originalEmployee: {
                id: string;
                firstName: string;
                lastName: string;
            };
            replacementEmployee: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            tenantId: string;
            shiftId: string;
            date: Date;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reason: string | null;
            status: import(".prisma/client").$Enums.ReplacementStatus;
            originalEmployeeId: string;
            replacementEmployeeId: string;
            approvedBy: string | null;
            approvedAt: Date | null;
        })[];
    }>;
    getMonthSchedule(tenantId: string, date: string, filters?: {
        teamId?: string;
        siteId?: string;
    }): Promise<{
        monthStart: string;
        monthEnd: string;
        schedules: ({
            shift: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                startTime: string;
                endTime: string;
                breakDuration: number;
                isNightShift: boolean;
                color: string | null;
            };
            employee: {
                id: string;
                team: {
                    id: string;
                    name: string;
                    code: string;
                };
                matricule: string;
                firstName: string;
                lastName: string;
                position: string;
                department: {
                    id: string;
                    name: string;
                };
                site: {
                    id: string;
                    name: string;
                };
            };
            team: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            tenantId: string;
            employeeId: string;
            shiftId: string;
            teamId: string | null;
            date: Date;
            customStartTime: string | null;
            customEndTime: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        leaves: ({
            employee: {
                id: string;
                firstName: string;
                lastName: string;
            };
            leaveType: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                isPaid: boolean;
                requiresDocument: boolean;
                maxDaysPerYear: number | null;
            };
        } & {
            tenantId: string;
            employeeId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            leaveTypeId: string;
            startDate: Date;
            endDate: Date;
            days: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            document: string | null;
            documentName: string | null;
            documentSize: number | null;
            documentMimeType: string | null;
            documentUploadedBy: string | null;
            documentUploadedAt: Date | null;
            documentUpdatedBy: string | null;
            documentUpdatedAt: Date | null;
            status: import(".prisma/client").$Enums.LeaveStatus;
            managerApprovedBy: string | null;
            managerApprovedAt: Date | null;
            managerComment: string | null;
            hrApprovedBy: string | null;
            hrApprovedAt: Date | null;
            hrComment: string | null;
        })[];
        replacements: ({
            shift: {
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                startTime: string;
                endTime: string;
                breakDuration: number;
                isNightShift: boolean;
                color: string | null;
            };
            originalEmployee: {
                id: string;
                firstName: string;
                lastName: string;
            };
            replacementEmployee: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            tenantId: string;
            shiftId: string;
            date: Date;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reason: string | null;
            status: import(".prisma/client").$Enums.ReplacementStatus;
            originalEmployeeId: string;
            replacementEmployeeId: string;
            approvedBy: string | null;
            approvedAt: Date | null;
        })[];
    }>;
    createBulk(tenantId: string, schedules: CreateScheduleDto[]): Promise<{
        count: number;
        total: number;
        skipped: number;
        message: string;
    }>;
    createReplacement(tenantId: string, dto: any): Promise<{
        shift: {
            tenantId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            startTime: string;
            endTime: string;
            breakDuration: number;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
        replacementEmployee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
    } & {
        tenantId: string;
        shiftId: string;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    findAllReplacements(tenantId: string, filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<({
        shift: {
            tenantId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            startTime: string;
            endTime: string;
            breakDuration: number;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
        replacementEmployee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
        };
    } & {
        tenantId: string;
        shiftId: string;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    })[]>;
    approveReplacement(tenantId: string, id: string, approvedBy: string): Promise<{
        shift: {
            tenantId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            startTime: string;
            endTime: string;
            breakDuration: number;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            id: string;
            firstName: string;
            lastName: string;
        };
        replacementEmployee: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        tenantId: string;
        shiftId: string;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    rejectReplacement(tenantId: string, id: string, approvedBy: string): Promise<{
        shift: {
            tenantId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            startTime: string;
            endTime: string;
            breakDuration: number;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            id: string;
            firstName: string;
            lastName: string;
        };
        replacementEmployee: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        tenantId: string;
        shiftId: string;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    private parseDate;
    importFromExcel(tenantId: string, fileBuffer: Buffer): Promise<ImportScheduleResultDto>;
}
