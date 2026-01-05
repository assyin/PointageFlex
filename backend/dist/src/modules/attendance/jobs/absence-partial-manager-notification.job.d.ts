import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class AbsencePartialManagerNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleAbsencePartialNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private getOrphanOutRecords;
    private processOutRecord;
    private getScheduleForDate;
    private isEmployeeExcluded;
    private getEmployeeManager;
    private sendManagerNotification;
}
