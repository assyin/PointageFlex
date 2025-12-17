import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserTenantRolesService } from './user-tenant-roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/assign-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { LegacyRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private userTenantRolesService: UserTenantRolesService,
  ) {}

  @Post()
  @Roles(LegacyRole.ADMIN_RH)
  @ApiOperation({ summary: 'Create new user' })
  create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.tenantId, dto);
  }

  @Get()
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH, LegacyRole.MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: LegacyRole,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll(
      user.tenantId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      {
        search,
        role,
        isActive: isActive ? isActive === 'true' : undefined,
      },
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.tenantId, user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.tenantId, user.userId, dto, user.role);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Vérifier le type de fichier (images uniquement)
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    // Convertir l'image en base64 pour stockage
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Mettre à jour l'avatar de l'utilisateur
    return this.usersService.update(user.tenantId, user.userId, { avatar: base64Image }, user.role);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remove user avatar' })
  async removeAvatar(@CurrentUser() user: any) {
    return this.usersService.update(user.tenantId, user.userId, { avatar: null }, user.role);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      user.userId, 
      dto.currentPassword || '', 
      dto.newPassword,
      dto.forceChange || false
    );
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  getPreferences(@CurrentUser() user: any) {
    return this.usersService.getPreferences(user.userId);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  updatePreferences(@CurrentUser() user: any, @Body() dto: UpdateUserPreferencesDto) {
    return this.usersService.updatePreferences(user.userId, dto);
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'Get current user active sessions' })
  getSessions(@CurrentUser() user: any) {
    // TODO: Extraire le tokenId du JWT actuel
    return this.usersService.getSessions(user.userId);
  }

  @Delete('me/sessions/:sessionId')
  @ApiOperation({ summary: 'Revoke a specific session' })
  revokeSession(@CurrentUser() user: any, @Param('sessionId') sessionId: string) {
    return this.usersService.revokeSession(user.userId, sessionId);
  }

  @Post('me/sessions/revoke-all')
  @ApiOperation({ summary: 'Revoke all other sessions (except current)' })
  revokeAllOtherSessions(@CurrentUser() user: any) {
    // TODO: Extraire le tokenId du JWT actuel
    return this.usersService.revokeAllOtherSessions(user.userId, 'current');
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  getStats(@CurrentUser() user: any) {
    return this.usersService.getStats(user.userId, user.tenantId);
  }

  @Get('me/export')
  @ApiOperation({ summary: 'Export user data (RGPD)' })
  exportUserData(@CurrentUser() user: any) {
    return this.usersService.exportUserData(user.userId, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(LegacyRole.SUPER_ADMIN, LegacyRole.ADMIN_RH)
  @ApiOperation({ summary: 'Update user' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(LegacyRole.ADMIN_RH)
  @ApiOperation({ summary: 'Deactivate user' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.remove(user.tenantId, id);
  }

  // ============================================
  // Gestion des rôles multi-tenant
  // ============================================

  @Get(':id/roles')
  @RequirePermissions('user.view_roles')
  @ApiOperation({ summary: 'Get user roles in current tenant' })
  getUserRoles(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.userTenantRolesService.getUserRoles(id, tenantId);
  }

  @Post(':id/roles')
  @RequirePermissions('user.assign_roles')
  @ApiOperation({ summary: 'Assign roles to user in current tenant' })
  assignRoles(
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    return this.userTenantRolesService.setRoles(
      id,
      tenantId,
      dto.roleIds,
      currentUser.userId,
    );
  }

  @Patch(':id/roles')
  @RequirePermissions('user.assign_roles')
  @ApiOperation({ summary: 'Update user roles in current tenant' })
  updateRoles(
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    return this.userTenantRolesService.setRoles(
      id,
      tenantId,
      dto.roleIds,
      currentUser.userId,
    );
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions('user.remove_roles')
  @ApiOperation({ summary: 'Remove a role from user in current tenant' })
  removeRole(
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ) {
    return this.userTenantRolesService.removeRoles(
      id,
      tenantId,
      [roleId],
      currentUser.userId,
    );
  }

  @Get('me/tenants')
  @ApiOperation({ summary: 'Get all tenants for current user' })
  getMyTenants(@CurrentUser() user: any) {
    return this.userTenantRolesService.getUserTenants(user.userId);
  }
}
