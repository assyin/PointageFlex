import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsQueryDto } from './dto/dashboard-stats.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(tenantId: string | null, query: DashboardStatsQueryDto, userId?: string, userRole?: string): Promise<{
        scope: string;
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        personal: {
            workedDays: number;
            totalHours: number;
            lateCount: number;
            overtimeHours: number | import("@prisma/client/runtime/library").Decimal;
            leaveDays: number | import("@prisma/client/runtime/library").Decimal;
        };
        weeklyAttendance: any[];
    } | {
        scope: string;
        team: {
            id: string;
            name: string;
        };
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
            totalDays: number;
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
        weeklyAttendance: any[];
    } | {
        scope: string;
        department: {
            id: string;
            name: string;
            code: string;
        };
        sites: {
            id: string;
            name: string;
            code: string;
            employeeCount: number;
        }[];
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
        weeklyAttendance: any[];
    } | {
        scope: string;
        site: {
            id: string;
            name: string;
            code: string;
            city: string;
        };
        departments: {
            id: string;
            name: string;
            code: string;
            employeeCount: number;
        }[];
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
        weeklyAttendance: any[];
    } | {
        scope: string;
        attendanceRate: number;
        lates: number;
        totalPointages: number;
        overtimeHours: number | import("@prisma/client/runtime/library").Decimal;
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        weeklyAttendance: any[];
        shiftDistribution: {
            name: string;
            value: number;
        }[];
        overtimeTrend: any[];
        anomalies: number;
    } | {
        scope: string;
        tenants: {
            total: number;
            active: number;
        };
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
    }>;
    private validateScopeAccess;
    getPersonalDashboardStats(userId: string, tenantId: string | null, query: DashboardStatsQueryDto): Promise<{
        scope: string;
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        personal: {
            workedDays: number;
            totalHours: number;
            lateCount: number;
            overtimeHours: number | import("@prisma/client/runtime/library").Decimal;
            leaveDays: number | import("@prisma/client/runtime/library").Decimal;
        };
        weeklyAttendance: any[];
    }>;
    getTeamDashboardStats(userId: string, tenantId: string | null, query: DashboardStatsQueryDto): Promise<{
        scope: string;
        team: {
            id: string;
            name: string;
        };
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
            totalDays: number;
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
        weeklyAttendance: any[];
    }>;
    getDepartmentDashboardStats(userId: string, tenantId: string, query: DashboardStatsQueryDto): Promise<{
        scope: string;
        department: {
            id: string;
            name: string;
            code: string;
        };
        sites: {
            id: string;
            name: string;
            code: string;
            employeeCount: number;
        }[];
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
        weeklyAttendance: any[];
    }>;
    getSiteDashboardStats(userId: string, tenantId: string, query: DashboardStatsQueryDto): Promise<{
        scope: string;
        site: {
            id: string;
            name: string;
            code: string;
            city: string;
        };
        departments: {
            id: string;
            name: string;
            code: string;
            employeeCount: number;
        }[];
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
        weeklyAttendance: any[];
    }>;
    getPlatformDashboardStats(query: DashboardStatsQueryDto): Promise<{
        scope: string;
        tenants: {
            total: number;
            active: number;
        };
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        attendanceRate: number;
    }>;
    getTenantDashboardStats(tenantId: string, query: DashboardStatsQueryDto): Promise<{
        scope: string;
        attendanceRate: number;
        lates: number;
        totalPointages: number;
        overtimeHours: number | import("@prisma/client/runtime/library").Decimal;
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
            current: number;
        };
        period: {
            startDate: string;
            endDate: string;
        };
        weeklyAttendance: any[];
        shiftDistribution: {
            name: string;
            value: number;
        }[];
        overtimeTrend: any[];
        anomalies: number;
    }>;
    private getTenantDashboardStatsInternal;
    getAttendanceReport(tenantId: string, dto: AttendanceReportDto): Promise<{
        data: ({
            employee: {
                id: string;
                firstName: string;
                lastName: string;
                matricule: string;
                department: {
                    name: string;
                };
                team: {
                    name: string;
                };
            };
            site: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            siteId: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            type: import(".prisma/client").$Enums.AttendanceType;
            employeeId: string;
            deviceId: string | null;
            timestamp: Date;
            method: import(".prisma/client").$Enums.DeviceType;
            hasAnomaly: boolean;
            anomalyType: string | null;
            anomalyNote: string | null;
            isCorrected: boolean;
            correctedBy: string | null;
            correctedAt: Date | null;
            rawData: import("@prisma/client/runtime/library").JsonValue | null;
            generatedBy: string | null;
            isGenerated: boolean;
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
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
            position: string;
        }[];
    }>;
}
