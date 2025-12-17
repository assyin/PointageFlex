import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permissions/permissions.service';
export declare class RolesService {
    private prisma;
    private permissionsService;
    constructor(prisma: PrismaService, permissionsService: PermissionsService);
    create(tenantId: string | null, dto: CreateRoleDto): Promise<{
        tenant: {
            id: string;
            companyName: string;
            slug: string;
        };
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    findAll(tenantId: string | null): Promise<({
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    })[]>;
    findOne(id: string): Promise<{
        tenant: {
            id: string;
            companyName: string;
            slug: string;
        };
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    findByCode(tenantId: string | null, code: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    update(tenantId: string | null, id: string, dto: UpdateRoleDto): Promise<{
        tenant: {
            id: string;
            companyName: string;
            slug: string;
        };
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    assignPermissions(roleId: string, permissionCodes: string[]): Promise<{
        tenant: {
            id: string;
            companyName: string;
            slug: string;
        };
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    setPermissions(roleId: string, permissionCodes: string[]): Promise<{
        tenant: {
            id: string;
            companyName: string;
            slug: string;
        };
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    initializeSystemRoles(): Promise<void>;
    resetDefaultPermissions(roleId: string): Promise<{
        tenant: {
            id: string;
            companyName: string;
            slug: string;
        };
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
                category: string;
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
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
    }>;
    initializeTenantRoles(tenantId: string): Promise<void>;
    updateAllManagerRoles(): Promise<{
        total: number;
        updated: number;
        failed: number;
        results: any[];
    }>;
}
