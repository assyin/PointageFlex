"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrectAttendanceDto = exports.CORRECTION_REASON_LABELS = exports.CorrectionReasonCode = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var CorrectionReasonCode;
(function (CorrectionReasonCode) {
    CorrectionReasonCode["FORGOT_BADGE"] = "FORGOT_BADGE";
    CorrectionReasonCode["DEVICE_FAILURE"] = "DEVICE_FAILURE";
    CorrectionReasonCode["SYSTEM_ERROR"] = "SYSTEM_ERROR";
    CorrectionReasonCode["BADGE_MULTIPLE_PASS"] = "BADGE_MULTIPLE_PASS";
    CorrectionReasonCode["EXTERNAL_MEETING"] = "EXTERNAL_MEETING";
    CorrectionReasonCode["MISSION"] = "MISSION";
    CorrectionReasonCode["TELEWORK"] = "TELEWORK";
    CorrectionReasonCode["TRAFFIC"] = "TRAFFIC";
    CorrectionReasonCode["PUBLIC_TRANSPORT"] = "PUBLIC_TRANSPORT";
    CorrectionReasonCode["MEDICAL_APPOINTMENT"] = "MEDICAL_APPOINTMENT";
    CorrectionReasonCode["SICK_LEAVE"] = "SICK_LEAVE";
    CorrectionReasonCode["FAMILY_EMERGENCY"] = "FAMILY_EMERGENCY";
    CorrectionReasonCode["PERSONAL_REASON"] = "PERSONAL_REASON";
    CorrectionReasonCode["AUTHORIZED_ABSENCE"] = "AUTHORIZED_ABSENCE";
    CorrectionReasonCode["SCHEDULE_ERROR"] = "SCHEDULE_ERROR";
    CorrectionReasonCode["SHIFT_SWAP"] = "SHIFT_SWAP";
    CorrectionReasonCode["EXTRA_SHIFT"] = "EXTRA_SHIFT";
    CorrectionReasonCode["PLANNED_OVERTIME"] = "PLANNED_OVERTIME";
    CorrectionReasonCode["EMERGENCY_WORK"] = "EMERGENCY_WORK";
    CorrectionReasonCode["MANAGER_AUTH"] = "MANAGER_AUTH";
    CorrectionReasonCode["OTHER"] = "OTHER";
})(CorrectionReasonCode || (exports.CorrectionReasonCode = CorrectionReasonCode = {}));
exports.CORRECTION_REASON_LABELS = {
    [CorrectionReasonCode.FORGOT_BADGE]: 'Oubli de badge',
    [CorrectionReasonCode.DEVICE_FAILURE]: 'Panne terminal',
    [CorrectionReasonCode.SYSTEM_ERROR]: 'Erreur système',
    [CorrectionReasonCode.BADGE_MULTIPLE_PASS]: 'Double passage badge',
    [CorrectionReasonCode.EXTERNAL_MEETING]: 'Réunion externe',
    [CorrectionReasonCode.MISSION]: 'Mission extérieure',
    [CorrectionReasonCode.TELEWORK]: 'Télétravail',
    [CorrectionReasonCode.TRAFFIC]: 'Embouteillage / Circulation',
    [CorrectionReasonCode.PUBLIC_TRANSPORT]: 'Retard transport en commun',
    [CorrectionReasonCode.MEDICAL_APPOINTMENT]: 'Rendez-vous médical',
    [CorrectionReasonCode.SICK_LEAVE]: 'Congé maladie',
    [CorrectionReasonCode.FAMILY_EMERGENCY]: 'Urgence familiale',
    [CorrectionReasonCode.PERSONAL_REASON]: 'Raison personnelle autorisée',
    [CorrectionReasonCode.AUTHORIZED_ABSENCE]: 'Absence autorisée',
    [CorrectionReasonCode.SCHEDULE_ERROR]: 'Erreur de planning',
    [CorrectionReasonCode.SHIFT_SWAP]: 'Échange de shift',
    [CorrectionReasonCode.EXTRA_SHIFT]: 'Shift supplémentaire',
    [CorrectionReasonCode.PLANNED_OVERTIME]: 'Heures supp. planifiées',
    [CorrectionReasonCode.EMERGENCY_WORK]: 'Travail urgent',
    [CorrectionReasonCode.MANAGER_AUTH]: 'Autorisation manager',
    [CorrectionReasonCode.OTHER]: 'Autre',
};
class CorrectAttendanceDto {
}
exports.CorrectAttendanceDto = CorrectAttendanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nouveau timestamp corrigé' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CorrectAttendanceDto.prototype, "correctedTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Code du motif de correction (prédéfini)', enum: CorrectionReasonCode }),
    (0, class_validator_1.IsEnum)(CorrectionReasonCode),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CorrectAttendanceDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Note de correction (détail du motif)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CorrectAttendanceDto.prototype, "correctionNote", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de l\'utilisateur qui corrige (fourni automatiquement par le système)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CorrectAttendanceDto.prototype, "correctedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Forcer la correction sans approbation (déprécié - les managers corrigent directement)' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CorrectAttendanceDto.prototype, "forceApproval", void 0);
//# sourceMappingURL=correct-attendance.dto.js.map