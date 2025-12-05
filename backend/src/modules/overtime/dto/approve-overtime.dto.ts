import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OvertimeStatus } from '@prisma/client';

export class ApproveOvertimeDto {
  @ApiProperty({ enum: OvertimeStatus })
  @IsEnum(OvertimeStatus)
  status: OvertimeStatus;
}
