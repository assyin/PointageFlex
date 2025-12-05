import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    create(user: any, dto: CreateTeamDto): Promise<{
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
    findAll(user: any, page?: string, limit?: string, search?: string, rotationEnabled?: string): Promise<{
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
    findOne(user: any, id: string): Promise<{
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
    update(user: any, id: string, dto: UpdateTeamDto): Promise<{
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
    remove(user: any, id: string): Promise<{
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
