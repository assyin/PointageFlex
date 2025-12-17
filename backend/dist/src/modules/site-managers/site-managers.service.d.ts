import { PrismaService } from '../../database/prisma.service';
import { CreateSiteManagerDto } from './dto/create-site-manager.dto';
import { UpdateSiteManagerDto } from './dto/update-site-manager.dto';
export declare class SiteManagersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateSiteManagerDto): Promise<{
        department: {
            id: string;
            name: string;
            code: string;
        };
        site: {
            id: string;
            name: string;
            code: string;
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
    findAll(tenantId: string, filters?: {
        siteId?: string;
        departmentId?: string;
    }): Promise<({
        department: {
            id: string;
            name: string;
            code: string;
        };
        site: {
            id: string;
            name: string;
            code: string;
            city: string;
        };
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
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
    findOne(tenantId: string, id: string): Promise<{
        department: {
            id: string;
            name: string;
            code: string;
        };
        site: {
            id: string;
            name: string;
            code: string;
            city: string;
        };
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
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
    update(tenantId: string, id: string, dto: UpdateSiteManagerDto): Promise<{
        department: {
            id: string;
            name: string;
            code: string;
        };
        site: {
            id: string;
            name: string;
            code: string;
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
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    findBySite(tenantId: string, siteId: string): Promise<({
        department: {
            id: string;
            name: string;
            code: string;
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
    findByManager(tenantId: string, managerId: string): Promise<({
        department: {
            id: string;
            name: string;
            code: string;
        };
        site: {
            id: string;
            name: string;
            code: string;
            city: string;
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
}
