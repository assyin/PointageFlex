import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class AbsenceTechnicalManagerNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleAbsenceTechnicalNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private getTechnicalAnomalies;
    private processAnomaly;
    private isTechnicalIssue;
    private getEmployeeManager;
    private sendManagerNotification;
}
