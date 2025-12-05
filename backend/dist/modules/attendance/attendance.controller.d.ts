import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { WebhookAttendanceDto } from './dto/webhook-attendance.dto';
import { CorrectAttendanceDto } from './dto/correct-attendance.dto';
import { AttendanceType } from '@prisma/client';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    create(tenantId: string, createAttendanceDto: CreateAttendanceDto): Promise<{
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            photo: string;
        };
        site: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            tenantId: string;
            address: string | null;
            name: string;
            city: string | null;
        };
        device: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            siteId: string | null;
            deviceId: string;
            isActive: boolean;
            name: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    }>;
    handleWebhook(deviceId: string, tenantId: string, apiKey: string, webhookData: WebhookAttendanceDto): Promise<{
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
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    }>;
    handlePushFromTerminal(body: any, headers: any): Promise<{
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
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    }>;
    private mapAttendanceType;
    private mapVerifyMode;
    findAll(tenantId: string, employeeId?: string, siteId?: string, startDate?: string, endDate?: string, hasAnomaly?: string, type?: AttendanceType): Promise<({
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            photo: string;
            currentShift: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                code: string;
                startTime: string;
                endTime: string;
                breakDuration: number;
                isNightShift: boolean;
                color: string | null;
            };
        };
        site: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            tenantId: string;
            address: string | null;
            name: string;
            city: string | null;
        };
        device: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            siteId: string | null;
            deviceId: string;
            isActive: boolean;
            name: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    })[]>;
    getAnomalies(tenantId: string, date?: string): Promise<({
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            photo: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    })[]>;
    getDailyReport(tenantId: string, date: string): Promise<{
        date: string;
        totalRecords: number;
        uniqueEmployees: number;
        lateEntries: number;
        anomalies: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        employee: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            photo: string;
            position: string;
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                code: string | null;
            };
            team: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                code: string;
                description: string | null;
                managerId: string | null;
                rotationEnabled: boolean;
                rotationCycleDays: number | null;
            };
        };
        site: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            tenantId: string;
            address: string | null;
            name: string;
            city: string | null;
        };
        device: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            siteId: string | null;
            deviceId: string;
            isActive: boolean;
            name: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    }>;
    correctAttendance(tenantId: string, id: string, correctionDto: CorrectAttendanceDto): Promise<{
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
        timestamp: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        method: import(".prisma/client").$Enums.DeviceType;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        hasAnomaly: boolean;
        anomalyType: string | null;
        anomalyNote: string | null;
        isCorrected: boolean;
        correctedBy: string | null;
        correctedAt: Date | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        employeeId: string;
        siteId: string | null;
        deviceId: string | null;
    }>;
}
