import { IsUUID, IsDateString, IsNumber, Min, IsBoolean, IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OvertimeType } from '@prisma/client';

export class CreateOvertimeDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ example: '2025-01-15', description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2.5, description: 'Number of overtime hours' })
  @IsNumber()
  @Min(0.5)
  hours: number;

  @ApiPropertyOptional({ 
    enum: OvertimeType, 
    default: OvertimeType.STANDARD,
    description: 'Type of overtime'
  })
  @IsOptional()
  @IsEnum(OvertimeType)
  type?: OvertimeType;

  @ApiPropertyOptional({ example: false, default: false, description: 'DEPRECATED: Use type instead' })
  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @ApiPropertyOptional({ example: 1.25, default: 1.25 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rate?: number;

  @ApiPropertyOptional({ 
    example: 'Travail supplémentaire pour terminer le projet urgent',
    description: 'Notes or justification for the overtime request',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
