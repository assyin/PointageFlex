export declare enum DashboardScope {
    PERSONAL = "personal",
    TEAM = "team",
    DEPARTMENT = "department",
    SITE = "site",
    TENANT = "tenant",
    PLATFORM = "platform"
}
export declare class DashboardStatsQueryDto {
    startDate?: string;
    endDate?: string;
    scope?: DashboardScope;
}
