import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        category: string;
    }[]>;
    findByCategory(category: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        category: string;
    }[]>;
    getRolePermissions(roleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
        category: string;
    }[]>;
}
