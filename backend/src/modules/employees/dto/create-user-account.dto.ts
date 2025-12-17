import { IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserAccountDto {
  @ApiPropertyOptional({ description: 'Email pour le compte (si différent de employee.email)' })
  @IsEmail()
  @IsOptional()
  userEmail?: string;
}

