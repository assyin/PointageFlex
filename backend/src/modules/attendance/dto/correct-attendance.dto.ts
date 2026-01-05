import { IsString, IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Codes de motifs prédéfinis pour les corrections
 * Organisés par catégorie et cohérents avec les types d'anomalies
 */
export enum CorrectionReasonCode {
  // Motifs liés aux problèmes techniques
  FORGOT_BADGE = 'FORGOT_BADGE',                 // Oubli de badge
  DEVICE_FAILURE = 'DEVICE_FAILURE',             // Panne terminal
  SYSTEM_ERROR = 'SYSTEM_ERROR',                 // Erreur système
  BADGE_MULTIPLE_PASS = 'BADGE_MULTIPLE_PASS',   // Double passage badge

  // Motifs liés aux déplacements/réunions
  EXTERNAL_MEETING = 'EXTERNAL_MEETING',         // Réunion externe
  MISSION = 'MISSION',                           // Mission extérieure
  TELEWORK = 'TELEWORK',                         // Télétravail

  // Motifs liés aux retards
  TRAFFIC = 'TRAFFIC',                           // Embouteillage / Circulation
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',         // Retard transport en commun

  // Motifs liés aux absences/départs
  MEDICAL_APPOINTMENT = 'MEDICAL_APPOINTMENT',   // Rendez-vous médical
  SICK_LEAVE = 'SICK_LEAVE',                     // Congé maladie
  FAMILY_EMERGENCY = 'FAMILY_EMERGENCY',         // Urgence familiale
  PERSONAL_REASON = 'PERSONAL_REASON',           // Raison personnelle autorisée
  AUTHORIZED_ABSENCE = 'AUTHORIZED_ABSENCE',     // Absence autorisée

  // Motifs liés au planning
  SCHEDULE_ERROR = 'SCHEDULE_ERROR',             // Erreur de planning
  SHIFT_SWAP = 'SHIFT_SWAP',                     // Échange de shift
  EXTRA_SHIFT = 'EXTRA_SHIFT',                   // Shift supplémentaire
  PLANNED_OVERTIME = 'PLANNED_OVERTIME',         // Heures supp. planifiées
  EMERGENCY_WORK = 'EMERGENCY_WORK',             // Travail urgent

  // Motifs généraux
  MANAGER_AUTH = 'MANAGER_AUTH',                 // Autorisation manager
  OTHER = 'OTHER',                               // Autre (préciser)
}

/**
 * Labels des motifs de correction (pour affichage)
 */
export const CORRECTION_REASON_LABELS: Record<CorrectionReasonCode, string> = {
  // Problèmes techniques
  [CorrectionReasonCode.FORGOT_BADGE]: 'Oubli de badge',
  [CorrectionReasonCode.DEVICE_FAILURE]: 'Panne terminal',
  [CorrectionReasonCode.SYSTEM_ERROR]: 'Erreur système',
  [CorrectionReasonCode.BADGE_MULTIPLE_PASS]: 'Double passage badge',

  // Déplacements/réunions
  [CorrectionReasonCode.EXTERNAL_MEETING]: 'Réunion externe',
  [CorrectionReasonCode.MISSION]: 'Mission extérieure',
  [CorrectionReasonCode.TELEWORK]: 'Télétravail',

  // Retards
  [CorrectionReasonCode.TRAFFIC]: 'Embouteillage / Circulation',
  [CorrectionReasonCode.PUBLIC_TRANSPORT]: 'Retard transport en commun',

  // Absences/départs
  [CorrectionReasonCode.MEDICAL_APPOINTMENT]: 'Rendez-vous médical',
  [CorrectionReasonCode.SICK_LEAVE]: 'Congé maladie',
  [CorrectionReasonCode.FAMILY_EMERGENCY]: 'Urgence familiale',
  [CorrectionReasonCode.PERSONAL_REASON]: 'Raison personnelle autorisée',
  [CorrectionReasonCode.AUTHORIZED_ABSENCE]: 'Absence autorisée',

  // Planning
  [CorrectionReasonCode.SCHEDULE_ERROR]: 'Erreur de planning',
  [CorrectionReasonCode.SHIFT_SWAP]: 'Échange de shift',
  [CorrectionReasonCode.EXTRA_SHIFT]: 'Shift supplémentaire',
  [CorrectionReasonCode.PLANNED_OVERTIME]: 'Heures supp. planifiées',
  [CorrectionReasonCode.EMERGENCY_WORK]: 'Travail urgent',

  // Généraux
  [CorrectionReasonCode.MANAGER_AUTH]: 'Autorisation manager',
  [CorrectionReasonCode.OTHER]: 'Autre',
};

export class CorrectAttendanceDto {
  @ApiPropertyOptional({ description: 'Nouveau timestamp corrigé' })
  @IsDateString()
  @IsOptional()
  correctedTimestamp?: string;

  @ApiPropertyOptional({ description: 'Code du motif de correction (prédéfini)', enum: CorrectionReasonCode })
  @IsEnum(CorrectionReasonCode)
  @IsOptional()
  reasonCode?: CorrectionReasonCode;

  @ApiProperty({ description: 'Note de correction (détail du motif)' })
  @IsString()
  correctionNote: string;

  @ApiPropertyOptional({ description: 'ID de l\'utilisateur qui corrige (fourni automatiquement par le système)' })
  @IsString()
  @IsOptional()
  correctedBy?: string;

  @ApiPropertyOptional({ description: 'Forcer la correction sans approbation (déprécié - les managers corrigent directement)' })
  @IsBoolean()
  @IsOptional()
  forceApproval?: boolean;
}
