import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
export declare class ShiftsController {
    private shiftsService;
    constructor(shiftsService: ShiftsService);
    create(user: any, dto: CreateShiftDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        breakDuration: number;
        code: string;
        startTime: string;
        endTime: string;
        isNightShift: boolean;
        color: string | null;
    }>;
    findAll(user: any, page?: string, limit?: string, search?: string, isNightShift?: string): Promise<{
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            breakDuration: number;
            code: string;
            startTime: string;
            endTime: string;
            isNightShift: boolean;
            color: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: any, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        breakDuration: number;
        code: string;
        startTime: string;
        endTime: string;
        isNightShift: boolean;
        color: string | null;
    }>;
    update(user: any, id: string, dto: UpdateShiftDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        breakDuration: number;
        code: string;
        startTime: string;
        endTime: string;
        isNightShift: boolean;
        color: string | null;
    }>;
    remove(user: any, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        breakDuration: number;
        code: string;
        startTime: string;
        endTime: string;
        isNightShift: boolean;
        color: string | null;
    }>;
}
