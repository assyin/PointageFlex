import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BiometricDataDto {
  @ApiPropertyOptional({ description: 'Données d\'empreinte digitale (hash)' })
  @IsString()
  @IsOptional()
  fingerprintData?: string;

  @ApiPropertyOptional({ description: 'Données de reconnaissance faciale (hash)' })
  @IsString()
  @IsOptional()
  faceData?: string;

  @ApiPropertyOptional({ description: 'Badge RFID' })
  @IsString()
  @IsOptional()
  rfidBadge?: string;

  @ApiPropertyOptional({ description: 'QR Code' })
  @IsString()
  @IsOptional()
  qrCode?: string;

  @ApiPropertyOptional({ description: 'Code PIN' })
  @IsString()
  @IsOptional()
  pinCode?: string;
}
