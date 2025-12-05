import { IsString, IsEnum, IsOptional, IsDateString, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceType, DeviceType } from '@prisma/client';

export class WebhookAttendanceDto {
  @ApiProperty({ description: 'Matricule ou ID de l\'employé' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Type de pointage', enum: AttendanceType })
  @IsEnum(AttendanceType)
  type: AttendanceType;

  @ApiProperty({ description: 'Méthode utilisée', enum: DeviceType })
  @IsEnum(DeviceType)
  method: DeviceType;

  @ApiProperty({ description: 'Timestamp du pointage', example: '2025-01-15T08:00:00Z' })
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({ description: 'Données brutes du terminal' })
  @IsObject()
  @IsOptional()
  rawData?: any;
}
