import { IsString, IsUUID, IsOptional, IsDateString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Shift ID' })
  @IsUUID()
  shiftId: string;

  @ApiPropertyOptional({ description: 'Team ID' })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiProperty({ example: '2025-01-15', description: 'Date de début (ou date unique) au format YYYY-MM-DD' })
  @IsDateString()
  dateDebut: string;

  @ApiPropertyOptional({ example: '2025-01-31', description: 'Date de fin (optionnel, pour créer un intervalle). Si non fourni, crée un planning pour une seule journée.' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ example: '08:30', description: 'Heure de début personnalisée (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'customStartTime must be in HH:mm format',
  })
  customStartTime?: string;

  @ApiPropertyOptional({ example: '16:30', description: 'Heure de fin personnalisée (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'customEndTime must be in HH:mm format',
  })
  customEndTime?: string;

  @ApiPropertyOptional({ example: 'Remote work' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkScheduleDto {
  @ApiProperty({ type: [CreateScheduleDto], description: 'Array of schedules to create' })
  schedules: CreateScheduleDto[];
}
