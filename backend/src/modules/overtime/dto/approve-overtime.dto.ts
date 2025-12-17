import { IsEnum, IsNumber, IsOptional, Min, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OvertimeStatus } from '@prisma/client';

export class ApproveOvertimeDto {
  @ApiProperty({ enum: OvertimeStatus })
  @IsEnum(OvertimeStatus)
  status: OvertimeStatus;

  @ApiPropertyOptional({ 
    description: 'Nombre d\'heures validées (si différent du nombre demandé)',
    example: 2.5,
    minimum: 0.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  approvedHours?: number;

  @ApiPropertyOptional({ 
    description: 'Raison du rejet (obligatoire si status = REJECTED)',
    example: 'Heures non justifiées ou dépassement du quota autorisé',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
