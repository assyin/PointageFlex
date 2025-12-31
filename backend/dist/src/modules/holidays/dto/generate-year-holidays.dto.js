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
exports.GenerateYearHolidaysDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerateYearHolidaysDto {
}
exports.GenerateYearHolidaysDto = GenerateYearHolidaysDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Année pour laquelle générer les jours fériés',
        example: 2025,
        minimum: 2000,
        maximum: 2100,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], GenerateYearHolidaysDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inclure les jours fériés religieux (Aïd, etc.)',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateYearHolidaysDto.prototype, "includeReligious", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Mode de génération: "add" pour ajouter uniquement les manquants, "replace" pour remplacer tous les jours fériés de l\'année',
        enum: ['add', 'replace'],
        default: 'add',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateYearHolidaysDto.prototype, "mode", void 0);
//# sourceMappingURL=generate-year-holidays.dto.js.map