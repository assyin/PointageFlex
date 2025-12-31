import { PrismaService } from '../../../database/prisma.service';
export declare class DetectMissingOutJob {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private parseTimeString;
    detectMissingOuts(): Promise<void>;
    private detectMissingOutsForTenant;
}
