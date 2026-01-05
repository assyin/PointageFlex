import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class LateManagerNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleLateNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private getScheduledEmployeesToday;
    private processSchedule;
    private getEmployeeInToday;
    private isEmployeeExcluded;
    private parseTimeString;
    private getEmployeeManager;
    private sendManagerNotification;
}
