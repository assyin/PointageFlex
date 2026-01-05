import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateEmailConfigDto, UpdateEmailConfigDto, TestSmtpConnectionDto, SendTestEmailDto, SendTemplateTestDto, CreateEmailTemplateDto, UpdateEmailTemplateDto, PreviewEmailTemplateDto, EmailLogsQueryDto } from './dto';
export declare class EmailAdminService {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    getEmailConfig(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        enabled: boolean;
        provider: string;
        host: string;
        port: number;
        secure: boolean;
        username: any;
        password: any;
        fromName: string;
        fromEmail: any;
        createdAt: Date;
        updatedAt: Date;
    } | {
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        enabled: boolean;
        provider: string;
        host: string;
        port: number;
        secure: boolean;
        username: string | null;
        fromName: string;
        fromEmail: string | null;
        notifyAbsence: boolean;
        notifyAbsencePartial: boolean;
        notifyAbsenceTechnical: boolean;
        notifyLate: boolean;
        notifyMissingIn: boolean;
        notifyMissingOut: boolean;
        notifyOvertimePending: boolean;
    }>;
    upsertEmailConfig(tenantId: string, dto: CreateEmailConfigDto | UpdateEmailConfigDto): Promise<{
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        enabled: boolean;
        provider: string;
        host: string;
        port: number;
        secure: boolean;
        username: string | null;
        fromName: string;
        fromEmail: string | null;
        notifyAbsence: boolean;
        notifyAbsencePartial: boolean;
        notifyAbsenceTechnical: boolean;
        notifyLate: boolean;
        notifyMissingIn: boolean;
        notifyMissingOut: boolean;
        notifyOvertimePending: boolean;
    }>;
    testSmtpConnection(dto: TestSmtpConnectionDto): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    sendTestEmail(tenantId: string, dto: SendTestEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTemplateTest(tenantId: string, dto: SendTemplateTestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getEmailTemplates(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        name: string;
        description: string | null;
        subject: string;
        htmlContent: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        category: string;
        active: boolean;
        isDefault: boolean;
    }[]>;
    getEmailTemplate(id: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        name: string;
        description: string | null;
        subject: string;
        htmlContent: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        category: string;
        active: boolean;
        isDefault: boolean;
    }>;
    createEmailTemplate(tenantId: string, dto: CreateEmailTemplateDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        name: string;
        description: string | null;
        subject: string;
        htmlContent: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        category: string;
        active: boolean;
        isDefault: boolean;
    }>;
    updateEmailTemplate(id: string, tenantId: string, dto: UpdateEmailTemplateDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        name: string;
        description: string | null;
        subject: string;
        htmlContent: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        category: string;
        active: boolean;
        isDefault: boolean;
    }>;
    deleteEmailTemplate(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    previewEmailTemplate(dto: PreviewEmailTemplateDto): Promise<{
        html: string;
    }>;
    getEmailLogs(tenantId: string, query: EmailLogsQueryDto): Promise<{
        data: ({
            employee: {
                firstName: string;
                lastName: string;
            };
            manager: {
                firstName: string;
                lastName: string;
            };
            template: {
                name: string;
            };
        } & {
            error: string | null;
            id: string;
            tenantId: string;
            subject: string;
            managerId: string | null;
            employeeId: string | null;
            status: string;
            type: string;
            sentAt: Date;
            to: string;
            cc: string | null;
            bcc: string | null;
            templateId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getEmailStats(tenantId: string): Promise<{
        today: number;
        week: number;
        month: number;
        total: number;
        failed: number;
        successRate: string | number;
        byType: {
            type: string;
            count: number;
        }[];
    }>;
    initializeDefaultTemplates(tenantId: string): Promise<void>;
}
