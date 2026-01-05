export declare class CreateEmailConfigDto {
    enabled: boolean;
    notifyMissingIn?: boolean;
    notifyMissingOut?: boolean;
    notifyLate?: boolean;
    notifyAbsencePartial?: boolean;
    notifyAbsenceTechnical?: boolean;
    notifyAbsence?: boolean;
    notifyOvertimePending?: boolean;
    provider?: string;
    host: string;
    port: number;
    secure: boolean;
    username?: string;
    password?: string;
    fromName: string;
    fromEmail?: string;
}
