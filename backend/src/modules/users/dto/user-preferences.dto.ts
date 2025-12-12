import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  email?: {
    leaves?: boolean;
    planning?: boolean;
    alerts?: boolean;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  push?: {
    mobile?: boolean;
    desktop?: boolean;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}

export class UpdateUserPreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  notifications?: NotificationPreferencesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  theme?: string;
}

