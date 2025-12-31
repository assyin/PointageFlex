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
exports.UpdateTenantSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateTenantSettingsDto {
}
exports.UpdateTenantSettingsDto = UpdateTenantSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "legalName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "hrEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "firstDayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Number], description: 'Array of working days (1=Monday, 2=Tuesday, ..., 7=Sunday)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], UpdateTenantSettingsDto.prototype, "workingDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "lateToleranceEntry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "earlyToleranceExit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "overtimeRounding", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Seuil minimum en minutes pour créer automatiquement un Overtime',
        example: 30,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "overtimeMinimumThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "twoLevelWorkflow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "anticipatedLeave", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "monthlyPayrollEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "sfptExport", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "requireBreakPunch", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Exiger un planning ou shift par défaut pour créer un pointage. Si false, les pointages sans planning/shift seront autorisés mais marqués comme anomalie.',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "requireScheduleForAttendance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Heures de retard pour considérer absence partielle',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "absencePartialThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Heure d\'exécution du job de détection d\'absences (format HH:mm)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "absenceDetectionTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Activer/désactiver la détection de repos insuffisant',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "enableInsufficientRestDetection", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre d\'heures légales de repos minimum requis entre deux shifts (défaut: 11h)',
        default: 11,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "minimumRestHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre d\'heures légales de repos minimum pour shift de nuit (optionnel, défaut: 12h)',
        default: 12,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "minimumRestHoursNightShift", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre de jours avant expiration du matricule temporaire (délai pour obtenir le matricule officiel)',
        example: 8,
        default: 8,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "temporaryMatriculeExpiryDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Taux de conversion heures supplémentaires -> récupération (1.0 = 1h supp = 1h récup)',
        example: 1.0,
        default: 1.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "recoveryConversionRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre de jours avant expiration de la récupération',
        example: 90,
        default: 90,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "recoveryExpiryDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre d\'heures équivalent à une journée normale de travail (par défaut: 44h/6j = 7.33h)',
        example: 7.33,
        default: 7.33,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "dailyWorkingHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Activer la majoration des heures travaillées les jours fériés',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "holidayOvertimeEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Taux de majoration pour les heures travaillées les jours fériés (défaut: 2.0 = double)',
        example: 2.0,
        default: 2.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTenantSettingsDto.prototype, "holidayOvertimeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Calculer les heures travaillées les jours fériés comme heures normales sans majoration',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantSettingsDto.prototype, "holidayOvertimeAsNormalHours", void 0);
//# sourceMappingURL=update-tenant-settings.dto.js.map