import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
        category: string;
        isActive: boolean;
    }[]>;
    findByCategory(category: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
        category: string;
        isActive: boolean;
    }[]>;
    getRolePermissions(roleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
        category: string;
        isActive: boolean;
    }[]>;
}
