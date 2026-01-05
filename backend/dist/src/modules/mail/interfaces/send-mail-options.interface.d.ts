export interface SendMailOptions {
    to: string | string[];
    subject: string;
    html: string;
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    type?: string;
    employeeId?: string;
    managerId?: string;
    templateId?: string;
}
