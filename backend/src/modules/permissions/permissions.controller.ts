import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LegacyRole } from '@prisma/client';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('category/:category')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  findByCategory(@Param('category') category: string) {
    return this.permissionsService.findByCategory(category);
  }

  @Get('role/:roleId')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getRolePermissions(roleId);
  }
}

