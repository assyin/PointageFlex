export interface UserSession {
    id: string;
    device: string;
    browser: string;
    os: string;
    location: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
}
