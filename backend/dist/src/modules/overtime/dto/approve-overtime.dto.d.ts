import { OvertimeStatus } from '@prisma/client';
export declare class ApproveOvertimeDto {
    status: OvertimeStatus;
    approvedHours?: number;
    rejectionReason?: string;
}
