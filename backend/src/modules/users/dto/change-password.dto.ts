import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiPropertyOptional({ description: 'Mot de passe actuel (requis sauf si changement forcé)' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;

  @ApiPropertyOptional({ description: 'Forcer le changement (ignorer vérification mot de passe actuel)', default: false })
  @IsOptional()
  forceChange?: boolean;
}

