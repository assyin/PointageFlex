import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(tenantId: string | null, createRoleDto: CreateRoleDto): Promise<{
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
    }>;
    update(tenantId: string | null, id: string, updateRoleDto: UpdateRoleDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        code: string;
        name: string;
        description: string | null;
        isActive: boolean;
        isSystem: boolean;
    }>;
    assignPermissions(id: string, body: {
        permissionCodes: string[];
    }): Promise<{
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
    }>;
    resetDefaultPermissions(id: string): Promise<{
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
    }>;
    updateAllManagerRoles(): Promise<{
        total: number;
        updated: number;
        failed: number;
        results: any[];
    }>;
}
