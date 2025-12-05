import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsQueryDto } from './dto/dashboard-stats.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(tenantId: string, query: DashboardStatsQueryDto): Promise<{
        employees: {
            total: number;
            activeToday: number;
            onLeave: number;
        };
        pendingApprovals: {
            leaves: number;
            overtime: number;
        };
        attendance: {
            total: number;
            anomalies: number;
            anomalyRate: string | number;
        };
        overtime: {
            totalRecords: number;
            totalHours: number | import("@prisma/client/runtime/library").Decimal;
        };
        leaves: {
            totalRequests: number;
            totalDays: number | import("@prisma/client/runtime/library").Decimal;
        };
        period: {
            startDate: string;
            endDate: string;
        };
    }>;
    getAttendanceReport(tenantId: string, dto: AttendanceReportDto): Promise<{
        data: ({
            employee: {
                department: {
                    name: string;
                };
                team: {
                    name: string;
                };
                firstName: string;
                lastName: string;
                id: string;
                matricule: string;
            };
            site: {
                name: string;
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
        })[];
        summary: {
            total: number;
            anomalies: number;
            period: {
                startDate: string;
                endDate: string;
            };
        };
    }>;
    getEmployeeReport(tenantId: string, employeeId: string, startDate: string, endDate: string): Promise<{
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
            position: string;
            department: string;
            team: string;
            site: string;
            currentShift: string;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendance: {
            total: number;
            byType: {
                type: import(".prisma/client").$Enums.AttendanceType;
                count: number;
            }[];
        };
        overtime: {
            totalRecords: number;
            totalHours: number | import("@prisma/client/runtime/library").Decimal;
        };
        leaves: {
            totalRequests: number;
            totalDays: number | import("@prisma/client/runtime/library").Decimal;
        };
        schedules: {
            total: number;
        };
    }>;
    getTeamReport(tenantId: string, teamId: string, startDate: string, endDate: string): Promise<{
        team: {
            id: string;
            name: string;
            code: string;
            totalEmployees: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendance: {
            total: number;
        };
        overtime: {
            totalHours: number | import("@prisma/client/runtime/library").Decimal;
        };
        leaves: {
            totalDays: number | import("@prisma/client/runtime/library").Decimal;
        };
        employees: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            position: string;
        }[];
    }>;
}
