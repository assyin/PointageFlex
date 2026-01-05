export interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromName: string;
    fromEmail: string;
    enabled: boolean;
}
export declare function loadMailConfig(): MailConfig;
