import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LegacyRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  create(@CurrentTenant() tenantId: string | null, @Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(tenantId, createRoleDto);
  }

  @Get()
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  findAll(@CurrentTenant() tenantId: string | null) {
    return this.rolesService.findAll(tenantId);
  }

  @Get(':id')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  update(
    @CurrentTenant() tenantId: string | null,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(tenantId, id, updateRoleDto);
  }

  @Delete(':id')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionCodes: string[] },
  ) {
    return this.rolesService.assignPermissions(id, body.permissionCodes);
  }

  @Post(':id/reset-permissions')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  resetDefaultPermissions(@Param('id') id: string) {
    return this.rolesService.resetDefaultPermissions(id);
  }

  @Post('update-all-managers')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  updateAllManagerRoles() {
    return this.rolesService.updateAllManagerRoles();
  }
}

