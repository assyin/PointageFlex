import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'CREATE', description: 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)' })
  @IsString()
  action: string;

  @ApiProperty({ example: 'ATTENDANCE', description: 'Entity affected (ATTENDANCE, LEAVE, SCHEDULE, etc.)' })
  @IsString()
  entity: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Old values (JSON)' })
  @IsOptional()
  @IsObject()
  oldValues?: any;

  @ApiPropertyOptional({ description: 'New values (JSON)' })
  @IsOptional()
  @IsObject()
  newValues?: any;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
