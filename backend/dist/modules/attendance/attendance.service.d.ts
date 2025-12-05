import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { WebhookAttendanceDto } from './dto/webhook-attendance.dto';
import { CorrectAttendanceDto } from './dto/correct-attendance.dto';
import { AttendanceType } from '@prisma/client';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createAttendanceDto: CreateAttendanceDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            photo: string;
        };
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
        device: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            siteId: string | null;
            deviceId: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    } & {
        type: import(".prisma/client").$Enums.AttendanceType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string | null;
        timestamp: Date;
        employeeId: string;
        deviceId: string | null;
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
    }>;
    handleWebhook(tenantId: string, deviceId: string, webhookData: WebhookAttendanceDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
    } & {
        type: import(".prisma/client").$Enums.AttendanceType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string | null;
        timestamp: Date;
        employeeId: string;
        deviceId: string | null;
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
    }>;
    findAll(tenantId: string, filters?: {
        employeeId?: string;
        siteId?: string;
        startDate?: string;
        endDate?: string;
        hasAnomaly?: boolean;
        type?: AttendanceType;
    }): Promise<({
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            photo: string;
            currentShift: {
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
        };
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
        device: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            siteId: string | null;
            deviceId: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    } & {
        type: import(".prisma/client").$Enums.AttendanceType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string | null;
        timestamp: Date;
        employeeId: string;
        deviceId: string | null;
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
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        employee: {
            department: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                code: string | null;
            };
            team: {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                code: string;
                managerId: string | null;
                rotationEnabled: boolean;
                rotationCycleDays: number | null;
            };
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            photo: string;
            position: string;
        };
        site: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        };
        device: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            siteId: string | null;
            deviceId: string;
            deviceType: import(".prisma/client").$Enums.DeviceType;
            ipAddress: string | null;
            apiKey: string | null;
            lastSync: Date | null;
        };
    } & {
        type: import(".prisma/client").$Enums.AttendanceType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string | null;
        timestamp: Date;
        employeeId: string;
        deviceId: string | null;
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
    }>;
    correctAttendance(tenantId: string, id: string, correctionDto: CorrectAttendanceDto): Promise<{
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        };
    } & {
        type: import(".prisma/client").$Enums.AttendanceType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string | null;
        timestamp: Date;
        employeeId: string;
        deviceId: string | null;
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
    }>;
    getAnomalies(tenantId: string, date?: string): Promise<({
        employee: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            photo: string;
        };
    } & {
        type: import(".prisma/client").$Enums.AttendanceType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string | null;
        timestamp: Date;
        employeeId: string;
        deviceId: string | null;
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
    })[]>;
    getDailyReport(tenantId: string, date: string): Promise<{
        date: string;
        totalRecords: number;
        uniqueEmployees: number;
        lateEntries: number;
        anomalies: number;
    }>;
    private detectAnomalies;
}
