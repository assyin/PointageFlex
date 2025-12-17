import { OvertimeType } from '@prisma/client';
export declare class CreateOvertimeDto {
    employeeId: string;
    date: string;
    hours: number;
    type?: OvertimeType;
    isNightShift?: boolean;
    rate?: number;
    notes?: string;
}
