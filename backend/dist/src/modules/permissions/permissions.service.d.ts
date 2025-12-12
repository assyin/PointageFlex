import { PrismaService } from '../../database/prisma.service';
import { Permission } from '@prisma/client';
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Permission[]>;
    findByCode(code: string): Promise<Permission | null>;
    findByCategory(category: string): Promise<Permission[]>;
    getRolePermissions(roleId: string): Promise<Permission[]>;
    roleHasPermission(roleId: string, permissionCode: string): Promise<boolean>;
    userHasPermission(userId: string, tenantId: string, permissionCode: string): Promise<boolean>;
    getUserPermissions(userId: string, tenantId: string): Promise<string[]>;
}
