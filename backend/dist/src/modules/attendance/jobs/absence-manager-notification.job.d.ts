import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
export declare class AbsenceManagerNotificationJob {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleAbsenceNotifications(): Promise<void>;
    private getActiveTenants;
    private processTenant;
    private getScheduledEmployeesToday;
    private processSchedule;
    private hasEmployeeAttendanceToday;
    private isEmployeeExcluded;
    private getEmployeeManager;
    private sendManagerNotification;
}
