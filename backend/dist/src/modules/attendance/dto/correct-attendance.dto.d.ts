export declare enum CorrectionReasonCode {
    FORGOT_BADGE = "FORGOT_BADGE",
    DEVICE_FAILURE = "DEVICE_FAILURE",
    SYSTEM_ERROR = "SYSTEM_ERROR",
    BADGE_MULTIPLE_PASS = "BADGE_MULTIPLE_PASS",
    EXTERNAL_MEETING = "EXTERNAL_MEETING",
    MISSION = "MISSION",
    TELEWORK = "TELEWORK",
    TRAFFIC = "TRAFFIC",
    PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
    MEDICAL_APPOINTMENT = "MEDICAL_APPOINTMENT",
    SICK_LEAVE = "SICK_LEAVE",
    FAMILY_EMERGENCY = "FAMILY_EMERGENCY",
    PERSONAL_REASON = "PERSONAL_REASON",
    AUTHORIZED_ABSENCE = "AUTHORIZED_ABSENCE",
    SCHEDULE_ERROR = "SCHEDULE_ERROR",
    SHIFT_SWAP = "SHIFT_SWAP",
    EXTRA_SHIFT = "EXTRA_SHIFT",
    PLANNED_OVERTIME = "PLANNED_OVERTIME",
    EMERGENCY_WORK = "EMERGENCY_WORK",
    MANAGER_AUTH = "MANAGER_AUTH",
    OTHER = "OTHER"
}
export declare const CORRECTION_REASON_LABELS: Record<CorrectionReasonCode, string>;
export declare class CorrectAttendanceDto {
    correctedTimestamp?: string;
    reasonCode?: CorrectionReasonCode;
    correctionNote: string;
    correctedBy?: string;
    forceApproval?: boolean;
}
