import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SchedulesService } from './schedules.service';
import { AlertsService } from './alerts.service';
import { CreateScheduleDto, BulkScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateReplacementDto } from './dto/create-replacement.dto';
export declare class SchedulesController {
    private schedulesService;
    private alertsService;
    constructor(schedulesService: SchedulesService, alertsService: AlertsService);
    create(user: any, dto: CreateScheduleDto): Promise<{
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
    createBulk(user: any, dto: BulkScheduleDto): Promise<{
        count: number;
        total: number;
        skipped: number;
        message: string;
    }>;
    findAll(user: any, page?: string, limit?: string, employeeId?: string, teamId?: string, shiftId?: string, siteId?: string, startDate?: string, endDate?: string): Promise<{
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
    getWeek(user: any, date: string, teamId?: string, siteId?: string): Promise<{
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
    getMonth(user: any, date: string, teamId?: string, siteId?: string): Promise<{
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
    getAlerts(user: any, startDate: string, endDate: string): Promise<import("./alerts.service").LegalAlert[]>;
    createReplacement(user: any, dto: CreateReplacementDto): Promise<{
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
    findAllReplacements(user: any, status?: string, startDate?: string, endDate?: string): Promise<({
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
    approveReplacement(user: any, id: string): Promise<{
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
    rejectReplacement(user: any, id: string): Promise<{
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
    findOne(user: any, id: string): Promise<{
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
    update(user: any, id: string, dto: UpdateScheduleDto): Promise<{
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
    remove(user: any, id: string): Promise<{
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
    removeBulk(user: any, body: {
        ids: string[];
    }): Promise<{
        count: number;
        deleted: number;
    }>;
    importExcel(user: any, file: Express.Multer.File): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        data: import("./dto/import-schedule.dto").ImportScheduleResultDto;
    }>;
    downloadTemplate(res: Response): Promise<void>;
}
