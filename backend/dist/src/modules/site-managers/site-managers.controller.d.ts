import { SiteManagersService } from './site-managers.service';
import { CreateSiteManagerDto } from './dto/create-site-manager.dto';
import { UpdateSiteManagerDto } from './dto/update-site-manager.dto';
export declare class SiteManagersController {
    private readonly siteManagersService;
    constructor(siteManagersService: SiteManagersService);
    create(user: any, dto: CreateSiteManagerDto): Promise<{
        department: {
            id: string;
            code: string;
            name: string;
        };
        site: {
            id: string;
            code: string;
            name: string;
        };
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string;
        departmentId: string;
        managerId: string;
    }>;
    findAll(user: any, siteId?: string, departmentId?: string): Promise<({
        department: {
            id: string;
            code: string;
            name: string;
        };
        site: {
            id: string;
            city: string;
            code: string;
            name: string;
        };
        manager: {
            id: string;
            email: string;
            phone: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string;
        departmentId: string;
        managerId: string;
    })[]>;
    findBySite(user: any, siteId: string): Promise<({
        department: {
            id: string;
            code: string;
            name: string;
        };
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string;
        departmentId: string;
        managerId: string;
    })[]>;
    findByManager(user: any, managerId: string): Promise<({
        department: {
            id: string;
            code: string;
            name: string;
        };
        site: {
            id: string;
            city: string;
            code: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string;
        departmentId: string;
        managerId: string;
    })[]>;
    findOne(user: any, id: string): Promise<{
        department: {
            id: string;
            code: string;
            name: string;
        };
        site: {
            id: string;
            city: string;
            code: string;
            name: string;
        };
        manager: {
            id: string;
            email: string;
            phone: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string;
        departmentId: string;
        managerId: string;
    }>;
    update(user: any, id: string, dto: UpdateSiteManagerDto): Promise<{
        department: {
            id: string;
            code: string;
            name: string;
        };
        site: {
            id: string;
            code: string;
            name: string;
        };
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            matricule: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        siteId: string;
        departmentId: string;
        managerId: string;
    }>;
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
}
