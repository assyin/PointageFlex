import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateTeamDto): Promise<{
        employees: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        managerId: string | null;
        rotationEnabled: boolean;
        rotationCycleDays: number | null;
    }>;
    findAll(tenantId: string, page?: number, limit?: number, filters?: {
        search?: string;
        rotationEnabled?: boolean;
    }): Promise<{
        data: ({
            _count: {
                employees: number;
                schedules: number;
            };
            employees: {
                firstName: string;
                lastName: string;
                id: string;
                matricule: string;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            code: string;
            managerId: string | null;
            rotationEnabled: boolean;
            rotationCycleDays: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(tenantId: string, id: string): Promise<{
        _count: {
            employees: number;
            schedules: number;
        };
        employees: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
            position: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        managerId: string | null;
        rotationEnabled: boolean;
        rotationCycleDays: number | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateTeamDto): Promise<{
        employees: {
            firstName: string;
            lastName: string;
            id: string;
            matricule: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        managerId: string | null;
        rotationEnabled: boolean;
        rotationCycleDays: number | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        managerId: string | null;
        rotationEnabled: boolean;
        rotationCycleDays: number | null;
    }>;
}
