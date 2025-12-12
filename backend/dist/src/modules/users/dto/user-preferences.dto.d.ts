export declare class NotificationPreferencesDto {
    email?: {
        leaves?: boolean;
        planning?: boolean;
        alerts?: boolean;
    };
    push?: {
        mobile?: boolean;
        desktop?: boolean;
    };
    sms?: boolean;
}
export declare class UpdateUserPreferencesDto {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    notifications?: NotificationPreferencesDto;
    theme?: string;
}
