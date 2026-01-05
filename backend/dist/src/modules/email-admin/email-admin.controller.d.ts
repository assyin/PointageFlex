import { EmailAdminService } from './email-admin.service';
import { CreateEmailConfigDto, UpdateEmailConfigDto, TestSmtpConnectionDto, SendTestEmailDto, SendTemplateTestDto, CreateEmailTemplateDto, UpdateEmailTemplateDto, PreviewEmailTemplateDto, EmailLogsQueryDto } from './dto';
export declare class EmailAdminController {
    private readonly emailAdminService;
    constructor(emailAdminService: EmailAdminService);
    getEmailConfig(req: any): Promise<{
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
    createEmailConfig(req: any, dto: CreateEmailConfigDto): Promise<{
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
    updateEmailConfig(req: any, dto: UpdateEmailConfigDto): Promise<{
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
    sendTestEmail(req: any, dto: SendTestEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getEmailTemplates(req: any): Promise<{
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
    getEmailTemplate(req: any, id: string): Promise<{
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
    createEmailTemplate(req: any, dto: CreateEmailTemplateDto): Promise<{
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
    updateEmailTemplate(req: any, id: string, dto: UpdateEmailTemplateDto): Promise<{
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
    deleteEmailTemplate(req: any, id: string): Promise<{
        message: string;
    }>;
    previewEmailTemplate(dto: PreviewEmailTemplateDto): Promise<{
        html: string;
    }>;
    sendTemplateTest(req: any, dto: SendTemplateTestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    initializeDefaultTemplates(req: any): Promise<{
        message: string;
    }>;
    getEmailLogs(req: any, query: EmailLogsQueryDto): Promise<{
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
    getEmailStats(req: any): Promise<{
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
}
