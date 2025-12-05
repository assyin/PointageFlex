import { IsString, IsBoolean, IsOptional, IsInt, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftDto {
  @ApiProperty({ example: 'Matin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  code: string;

  @ApiProperty({ example: '08:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: '16:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiPropertyOptional({ example: 60, default: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  breakDuration?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}
