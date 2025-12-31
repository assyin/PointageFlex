import { PrismaService } from '../../../database/prisma.service';
export declare class DetectAbsencesJob {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    detectAbsences(): Promise<void>;
    private detectAbsencesForTenant;
    private createAbsenceRecord;
    private parseTimeString;
    detectTechnicalAbsences(tenantId: string, date: Date): Promise<void>;
}
