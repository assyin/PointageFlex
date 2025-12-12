import { IsString, IsArray, IsOptional } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  userId: string;

  @IsString()
  tenantId: string;

  @IsArray()
  @IsString({ each: true })
  roleIds: string[]; // IDs des rôles à assigner
}

export class UpdateUserRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds: string[]; // IDs des rôles à assigner (remplace les rôles existants)
}

