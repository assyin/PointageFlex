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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles.service");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const client_1 = require("@prisma/client");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
let RolesController = class RolesController {
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    create(tenantId, createRoleDto) {
        return this.rolesService.create(tenantId, createRoleDto);
    }
    findAll(tenantId) {
        return this.rolesService.findAll(tenantId);
    }
    findOne(id) {
        return this.rolesService.findOne(id);
    }
    update(tenantId, id, updateRoleDto) {
        return this.rolesService.update(tenantId, id, updateRoleDto);
    }
    remove(id) {
        return this.rolesService.remove(id);
    }
    assignPermissions(id, body) {
        return this.rolesService.assignPermissions(id, body.permissionCodes);
    }
    resetDefaultPermissions(id) {
        return this.rolesService.resetDefaultPermissions(id);
    }
    updateAllManagerRoles() {
        return this.rolesService.updateAllManagerRoles();
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/permissions'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "assignPermissions", null);
__decorate([
    (0, common_1.Post)(':id/reset-permissions'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "resetDefaultPermissions", null);
__decorate([
    (0, common_1.Post)('update-all-managers'),
    (0, roles_decorator_1.Roles)(client_1.LegacyRole.SUPER_ADMIN, client_1.LegacyRole.ADMIN_RH),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updateAllManagerRoles", null);
exports.RolesController = RolesController = __decorate([
    (0, common_1.Controller)('roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map