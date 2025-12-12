"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const user_tenant_roles_service_1 = require("./user-tenant-roles.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const user_preferences_dto_1 = require("./dto/user-preferences.dto");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    constructor(usersService, userTenantRolesService) {
        this.usersService = usersService;
        this.userTenantRolesService = userTenantRolesService;
    }
    create(user, dto) {
        return this.usersService.create(user.tenantId, dto);
    }
    findAll(user, page, limit, search, role, isActive) {
        return this.usersService.findAll(user.tenantId, parseInt(page) || 1, parseInt(limit) || 20, {
            search,
            role,
            isActive: isActive ? isActive === 'true' : undefined,
        });
    }
    getProfile(user) {
        return this.usersService.findOne(user.tenantId, user.userId);
    }
    updateProfile(user, dto) {
        return this.usersService.update(user.tenantId, user.userId, dto, user.role);
    }
    async uploadAvatar(user, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('Invalid file type. Only images are allowed.');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File too large. Maximum size is 5MB.');
        }
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return this.usersService.update(user.tenantId, user.userId, { avatar: base64Image }, user.role);
    }
    async removeAvatar(user) {
        return this.usersService.update(user.tenantId, user.userId, { avatar: null }, user.role);
    }
    changePassword(user, dto) {
        return this.usersService.changePassword(user.userId, dto.currentPassword, dto.newPassword);
    }
    getPreferences(user) {
        return this.usersService.getPreferences(user.userId);
    }
    updatePreferences(user, dto) {
        return this.usersService.updatePreferences(user.userId, dto);
    }
    getSessions(user) {
        return this.usersService.getSessions(user.userId);
    }
    revokeSession(user, sessionId) {
        return this.usersService.revokeSession(user.userId, sessionId);
    }
    revokeAllOtherSessions(user) {
        return this.usersService.revokeAllOtherSessions(user.userId, 'current');
    }
    getStats(user) {
        return this.usersService.getStats(user.userId, user.tenantId);
    }
    exportUserData(user) {
        return this.usersService.exportUserData(user.userId, user.tenantId);
    }
    findOne(user, id) {
        return this.usersService.findOne(user.tenantId, id);
    }
    update(user, id, dto) {
        return this.usersService.update(user.tenantId, id, dto);
    }
    remove(user, id) {
        return this.usersService.remove(user.tenantId, id);
    }
    getUserRoles(user, tenantId, id) {
        return this.userTenantRolesService.getUserRoles(id, tenantId);
    }
    assignRoles(currentUser, tenantId, id, dto) {
        return this.userTenantRolesService.setRoles(id, tenantId, dto.roleIds, currentUser.userId);
    }
    updateRoles(currentUser, tenantId, id, dto) {
        return this.userTenantRolesService.setRoles(id, tenantId, dto.roleIds, currentUser.userId);
    }
    removeRole(currentUser, tenantId, id, roleId) {
        return this.userTenantRolesService.removeRoles(id, tenantId, [roleId], currentUser.userId);
    }
    getMyTenants(user) {
        return this.userTenantRolesService.getUserTenants(user.userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.ADMIN_RH),
    (0, swagger_1.ApiOperation)({ summary: 'Create new user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH, client_1.LegacyRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('role')),
    __param(5, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload user avatar' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Delete)('me/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove user avatar' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeAvatar", null);
__decorate([
    (0, common_1.Post)('me/change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change current user password' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('me/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user preferences' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Patch)('me/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user preferences' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_preferences_dto_1.UpdateUserPreferencesDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Get)('me/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user active sessions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Delete)('me/sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a specific session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Post)('me/sessions/revoke-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke all other sessions (except current)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "revokeAllOtherSessions", null);
__decorate([
    (0, common_1.Get)('me/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('me/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export user data (RGPD)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "exportUserData", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.ADMIN_RH),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/roles'),
    (0, permissions_decorator_1.RequirePermissions)('user.view_roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user roles in current tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Post)(':id/roles'),
    (0, permissions_decorator_1.RequirePermissions)('user.assign_roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign roles to user in current tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, assign_role_dto_1.UpdateUserRolesDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRoles", null);
__decorate([
    (0, common_1.Patch)(':id/roles'),
    (0, permissions_decorator_1.RequirePermissions)('user.assign_roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user roles in current tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, assign_role_dto_1.UpdateUserRolesDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateRoles", null);
__decorate([
    (0, common_1.Delete)(':id/roles/:roleId'),
    (0, permissions_decorator_1.RequirePermissions)('user.remove_roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a role from user in current tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Get)('me/tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tenants for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyTenants", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_tenant_roles_service_1.UserTenantRolesService])
], UsersController);
//# sourceMappingURL=users.controller.js.map