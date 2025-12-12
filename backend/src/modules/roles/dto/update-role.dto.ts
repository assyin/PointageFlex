import { IsString, IsOptional, IsBoolean, IsArray, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    // Filtrer les valeurs null/undefined et ne garder que les chaînes valides
    if (Array.isArray(value)) {
      return value.filter((item) => item !== null && item !== undefined && typeof item === 'string' && item.trim() !== '');
    }
    return value;
  })
  @ValidateIf((o) => o.permissionCodes !== undefined && o.permissionCodes !== null)
  @IsString({ each: true })
  permissionCodes?: string[]; // Codes des permissions à associer
}

