import { IsString, IsBoolean, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Équipe A' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Équipe du matin' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  rotationEnabled?: boolean;

  @ApiPropertyOptional({ example: 7, description: 'Rotation cycle in days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  rotationCycleDays?: number;
}
