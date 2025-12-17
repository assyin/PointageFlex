import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DashboardScope {
  PERSONAL = 'personal',
  TEAM = 'team',
  DEPARTMENT = 'department',
  SITE = 'site',
  TENANT = 'tenant',
  PLATFORM = 'platform',
}

export class DashboardStatsQueryDto {
  @ApiPropertyOptional({ 
    example: '2025-01-01', 
    description: 'Start date in YYYY-MM-DD format' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2025-01-31', 
    description: 'End date in YYYY-MM-DD format' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: DashboardScope,
    example: DashboardScope.TENANT,
    description: 'Scope of dashboard data: personal, team, tenant, or platform'
  })
  @IsOptional()
  @IsEnum(DashboardScope)
  scope?: DashboardScope;

  @ApiPropertyOptional({
    example: 'uuid-site-123',
    description: 'Site ID for site-specific dashboard (for managers managing multiple sites)'
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;
}
