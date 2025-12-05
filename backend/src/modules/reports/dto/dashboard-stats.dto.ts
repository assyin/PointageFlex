import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01', description: 'Start date in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31', description: 'End date in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
