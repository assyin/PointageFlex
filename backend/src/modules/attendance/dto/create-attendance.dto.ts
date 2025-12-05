import { IsString, IsEnum, IsOptional, IsDateString, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceType, DeviceType } from '@prisma/client';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'ID de l\'employé' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Date et heure du pointage', example: '2025-01-15T08:00:00Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Type de pointage', enum: AttendanceType })
  @IsEnum(AttendanceType)
  type: AttendanceType;

  @ApiProperty({ description: 'Méthode de pointage', enum: DeviceType })
  @IsEnum(DeviceType)
  method: DeviceType;

  @ApiPropertyOptional({ description: 'ID du site' })
  @IsUUID()
  @IsOptional()
  siteId?: string;

  @ApiPropertyOptional({ description: 'ID du terminal' })
  @IsUUID()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Latitude (géolocalisation)' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude (géolocalisation)' })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Données brutes (JSON)' })
  @IsOptional()
  rawData?: any;
}
