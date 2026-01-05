import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class MissingOutManagerNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleMissingOutNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private getOpenSessions;
    private processSession;
    private isEmployeeExcluded;
    private getScheduleWithFallback;
    private calculateDetectionThreshold;
    private isNightShift;
    private parseTimeString;
    private getTimezoneOffset;
    private getEmployeeManager;
    private sendManagerNotification;
}
