import { PrismaService } from '../../database/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { GenerateYearHolidaysDto } from './dto/generate-year-holidays.dto';
export declare class HolidaysService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateHolidayDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        name: string;
        date: Date;
        type: import(".prisma/client").$Enums.HolidayType;
        isRecurring: boolean;
    }>;
    findAll(tenantId: string, year?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            date: Date;
            isRecurring: boolean;
        }[];
        total: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        name: string;
        date: Date;
        type: import(".prisma/client").$Enums.HolidayType;
        isRecurring: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateHolidayDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        name: string;
        date: Date;
        type: import(".prisma/client").$Enums.HolidayType;
        isRecurring: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    importFromCsv(tenantId: string, fileBuffer: Buffer): Promise<{
        success: number;
        skipped: number;
        errors: string[];
        total: number;
    }>;
    generateYearHolidays(tenantId: string, dto: GenerateYearHolidaysDto): Promise<{
        message: string;
        total: number;
        created: number;
        skipped: number;
        errors: string[];
        success: boolean;
        year: number;
        country: string;
        mode: "replace" | "add";
    }>;
}
