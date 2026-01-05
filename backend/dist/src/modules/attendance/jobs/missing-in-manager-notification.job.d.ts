import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class MissingInManagerNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleMissingInNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private getScheduledEmployeesToday;
    private processSchedule;
    private hasEmployeeCheckedInToday;
    private isEmployeeExcluded;
    private parseTimeString;
    private getEmployeeManager;
    private sendManagerNotification;
}
