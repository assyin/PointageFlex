import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryAuditLogDto {
  @ApiPropertyOptional({ example: 'CREATE' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'ATTENDANCE' })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Start date in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31', description: 'End date in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
