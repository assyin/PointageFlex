import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class OvertimePendingNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleOvertimePendingNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private sendManagerNotification;
    private getOvertimeTypeLabel;
}
