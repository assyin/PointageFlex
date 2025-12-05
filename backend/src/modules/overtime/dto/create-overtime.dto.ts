import { IsUUID, IsDateString, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @ApiPropertyOptional({ example: 1.25, default: 1.25 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rate?: number;
}
