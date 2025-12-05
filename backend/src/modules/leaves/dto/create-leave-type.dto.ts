import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'Congé Annuel' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  code: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDaysPerYear?: number;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  requiresDocument?: boolean;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
