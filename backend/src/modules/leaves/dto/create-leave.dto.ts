import { IsString, IsUUID, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Leave Type ID' })
  @IsUUID()
  leaveTypeId: string;

  @ApiProperty({ example: '2025-01-15', description: 'Start date in YYYY-MM-DD format' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-20', description: 'End date in YYYY-MM-DD format' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 5, description: 'Number of days' })
  @IsNumber()
  @Min(0.5)
  days: number;

  @ApiPropertyOptional({ example: 'Family reasons' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/document.pdf' })
  @IsOptional()
  @IsString()
  document?: string;
}
