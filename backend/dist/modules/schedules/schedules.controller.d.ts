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
    findAll(user: any, page?: string, limit?: string, employeeId?: string, teamId?: string, shiftId?: string, startDate?: string, endDate?: string): Promise<{
        data: ({
            employee: {
                firstName: string;
                lastName: string;
                id: string;
                matricule: string;
            };
            shift: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                breakDuration: number;
                code: string;
                startTime: string;
                endTime: string;
                isNightShift: boolean;
                color: string | null;
            };
            team: {
                name: string;
                id: string;
                code: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            teamId: string | null;
            employeeId: string;
            date: Date;
            shiftId: string;
            customStartTime: string | null;
            customEndTime: string | null;
            notes: string | null;
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
            employee: {
                site: {
                    name: string;
                    id: string;
                };
                department: {
                    name: string;
                    id: string;
                };
                team: {
                    name: string;
                    id: string;
                    code: string;
                };
                firstName: string;
                lastName: string;
                id: string;
                matricule: string;
                position: string;
            };
            shift: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                breakDuration: number;
                code: string;
                startTime: string;
                endTime: string;
                isNightShift: boolean;
                color: string | null;
            };
            team: {
                name: string;
                id: string;
                code: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            teamId: string | null;
            employeeId: string;
            date: Date;
            shiftId: string;
            customStartTime: string | null;
            customEndTime: string | null;
            notes: string | null;
        })[];
        leaves: ({
            employee: {
                firstName: string;
                lastName: string;
                id: string;
            };
            leaveType: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                code: string;
                isPaid: boolean;
                requiresDocument: boolean;
                maxDaysPerYear: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            employeeId: string;
            leaveTypeId: string;
            startDate: Date;
            endDate: Date;
            days: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            document: string | null;
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                breakDuration: number;
                code: string;
                startTime: string;
                endTime: string;
                isNightShift: boolean;
                color: string | null;
            };
            originalEmployee: {
                firstName: string;
                lastName: string;
                id: string;
            };
            replacementEmployee: {
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            reason: string | null;
            status: import(".prisma/client").$Enums.ReplacementStatus;
            date: Date;
            shiftId: string;
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
            employee: {
                site: {
                    name: string;
                    id: string;
                };
                department: {
                    name: string;
                    id: string;
                };
                team: {
                    name: string;
                    id: string;
                    code: string;
                };
                firstName: string;
                lastName: string;
                id: string;
                matricule: string;
                position: string;
            };
            shift: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                breakDuration: number;
                code: string;
                startTime: string;
                endTime: string;
                isNightShift: boolean;
                color: string | null;
            };
            team: {
                name: string;
                id: string;
                code: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            teamId: string | null;
            employeeId: string;
            date: Date;
            shiftId: string;
            customStartTime: string | null;
            customEndTime: string | null;
            notes: string | null;
        })[];
        leaves: ({
            employee: {
                firstName: string;
                lastName: string;
                id: string;
            };
            leaveType: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                code: string;
                isPaid: boolean;
                requiresDocument: boolean;
                maxDaysPerYear: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            employeeId: string;
            leaveTypeId: string;
            startDate: Date;
            endDate: Date;
            days: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            document: string | null;
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                breakDuration: number;
                code: string;
                startTime: string;
                endTime: string;
                isNightShift: boolean;
                color: string | null;
            };
            originalEmployee: {
                firstName: string;
                lastName: string;
                id: string;
            };
            replacementEmployee: {
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            reason: string | null;
            status: import(".prisma/client").$Enums.ReplacementStatus;
            date: Date;
            shiftId: string;
            originalEmployeeId: string;
            replacementEmployeeId: string;
            approvedBy: string | null;
            approvedAt: Date | null;
        })[];
    }>;
    getAlerts(user: any, startDate: string, endDate: string): Promise<import("./alerts.service").LegalAlert[]>;
    createReplacement(user: any, dto: CreateReplacementDto): Promise<{
        shift: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
        replacementEmployee: {
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
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        date: Date;
        shiftId: string;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    findAllReplacements(user: any, status?: string, startDate?: string, endDate?: string): Promise<({
        shift: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
        replacementEmployee: {
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
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        date: Date;
        shiftId: string;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    })[]>;
    approveReplacement(user: any, id: string): Promise<{
        shift: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            firstName: string;
            lastName: string;
            id: string;
        };
        replacementEmployee: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        date: Date;
        shiftId: string;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    rejectReplacement(user: any, id: string): Promise<{
        shift: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        };
        originalEmployee: {
            firstName: string;
            lastName: string;
            id: string;
        };
        replacementEmployee: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        reason: string | null;
        status: import(".prisma/client").$Enums.ReplacementStatus;
        date: Date;
        shiftId: string;
        originalEmployeeId: string;
        replacementEmployeeId: string;
        approvedBy: string | null;
        approvedAt: Date | null;
    }>;
    findOne(user: any, id: string): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            position: string;
        };
        shift: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        };
        team: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        teamId: string | null;
        employeeId: string;
        date: Date;
        shiftId: string;
        customStartTime: string | null;
        customEndTime: string | null;
        notes: string | null;
    }>;
    update(user: any, id: string, dto: UpdateScheduleDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
        shift: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        };
        team: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        teamId: string | null;
        employeeId: string;
        date: Date;
        shiftId: string;
        customStartTime: string | null;
        customEndTime: string | null;
        notes: string | null;
    }>;
    remove(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        teamId: string | null;
        employeeId: string;
        date: Date;
        shiftId: string;
        customStartTime: string | null;
        customEndTime: string | null;
        notes: string | null;
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
