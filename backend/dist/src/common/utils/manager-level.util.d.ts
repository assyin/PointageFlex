import { PrismaService } from 'src/database/prisma.service';
export interface ManagerLevel {
    type: 'DEPARTMENT' | 'SITE' | 'TEAM' | null;
    departmentId?: string;
    siteId?: string;
    teamId?: string;
}
export declare function getManagerLevel(prisma: PrismaService, userId: string, tenantId: string): Promise<ManagerLevel>;
export declare function getManagedEmployeeIds(prisma: PrismaService, managerLevel: ManagerLevel, tenantId: string): Promise<string[]>;
