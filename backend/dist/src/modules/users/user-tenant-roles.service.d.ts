import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class UserTenantRolesService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    assignRoles(userId: string, tenantId: string, roleIds: string[], assignedBy: string): Promise<any[]>;
    removeRoles(userId: string, tenantId: string, roleIds: string[], removedBy: string): Promise<any[]>;
    setRoles(userId: string, tenantId: string, roleIds: string[], assignedBy: string): Promise<any[]>;
    getUserRoles(userId: string, tenantId: string): Promise<({
        role: {
            permissions: ({
                permission: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string;
                    name: string;
                    description: string | null;
                    category: string;
                    isActive: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                roleId: string;
                permissionId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            code: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        userId: string;
        roleId: string;
        assignedBy: string | null;
        assignedAt: Date;
    })[]>;
    getUserTenants(userId: string): Promise<any[]>;
    userHasRole(userId: string, tenantId: string, roleCode: string): Promise<boolean>;
}
