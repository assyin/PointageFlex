import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '@prisma/client';

export class ApproveLeaveDto {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiPropertyOptional({ example: 'Approved for requested dates' })
  @IsOptional()
  @IsString()
  comment?: string;
}
