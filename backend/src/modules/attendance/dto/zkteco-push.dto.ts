import { IsString, IsObject, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ZKTecoPushDataDto {
  @ApiProperty({ description: 'User PIN/ID in terminal' })
  @IsString()
  pin: string;

  @ApiProperty({ description: 'Timestamp of attendance' })
  @IsString()
  time: string;

  @ApiProperty({ description: 'Attendance status (0=check-in, 1=check-out, etc.)' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Verification method (0=password, 1=fingerprint, 4=face, etc.)' })
  @IsString()
  verify: string;
}

export class ZKTecoPushDto {
  @ApiProperty({ description: 'Terminal serial number' })
  @IsString()
  @IsNotEmpty()
  sn: string;

  @ApiProperty({ description: 'Table name (usually "attendance")' })
  @IsString()
  table: string;

  @ApiProperty({ description: 'Timestamp of the event' })
  @IsString()
  @IsOptional()
  stamp?: string;

  @ApiProperty({ description: 'Attendance data' })
  @IsObject()
  data: ZKTecoPushDataDto;
}
