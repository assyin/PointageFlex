export declare class CreateEmailTemplateDto {
    code: string;
    name: string;
    description?: string;
    subject: string;
    htmlContent: string;
    variables: string[];
    category?: string;
    active?: boolean;
}
