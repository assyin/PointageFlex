import { IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateYearHolidaysDto {
  @ApiProperty({
    description: 'Année pour laquelle générer les jours fériés',
    example: 2025,
    minimum: 2000,
    maximum: 2100,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({
    description: 'Inclure les jours fériés religieux (Aïd, etc.)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeReligious?: boolean;

  @ApiPropertyOptional({
    description: 'Mode de génération: "add" pour ajouter uniquement les manquants, "replace" pour remplacer tous les jours fériés de l\'année',
    enum: ['add', 'replace'],
    default: 'add',
  })
  @IsOptional()
  mode?: 'add' | 'replace';
}

