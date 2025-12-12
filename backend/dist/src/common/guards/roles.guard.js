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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (process.env.NODE_ENV !== 'production') {
            console.log('[RolesGuard] Checking access:', {
                requiredRoles: requiredRoles.map(r => r.toString()),
                userRole: user.role,
                userRoleType: typeof user.role,
                userRoles: user.roles,
                userRolesType: Array.isArray(user.roles),
                userId: user.userId,
                email: user.email,
            });
        }
        const userRoleStr = typeof user.role === 'string' ? user.role : user.role?.toString();
        const hasLegacyRole = userRoleStr && requiredRoles.some((reqRole) => {
            const reqRoleStr = reqRole.toString();
            return userRoleStr.toUpperCase() === reqRoleStr.toUpperCase() ||
                userRoleStr === reqRoleStr ||
                userRoleStr === reqRole;
        });
        let hasNewRole = false;
        if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
            hasNewRole = user.roles.some((roleCode) => {
                if (!roleCode)
                    return false;
                return requiredRoles.some((requiredRole) => {
                    const requiredRoleStr = requiredRole.toString();
                    const roleCodeUpper = String(roleCode).toUpperCase().trim();
                    const requiredRoleStrUpper = String(requiredRoleStr).toUpperCase().trim();
                    return roleCodeUpper === requiredRoleStrUpper ||
                        String(roleCode) === String(requiredRoleStr) ||
                        String(roleCode) === String(requiredRole);
                });
            });
        }
        const isSuperAdmin = (userRoleStr === 'SUPER_ADMIN' || userRoleStr === client_1.LegacyRole.SUPER_ADMIN) ||
            (user.roles && Array.isArray(user.roles) && user.roles.includes('SUPER_ADMIN'));
        if (isSuperAdmin || hasLegacyRole || hasNewRole) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[RolesGuard] Access granted:', {
                    isSuperAdmin,
                    hasLegacyRole,
                    hasNewRole,
                });
            }
            return true;
        }
        if (process.env.NODE_ENV !== 'production') {
            console.log('[RolesGuard] Access denied:', {
                hasLegacyRole,
                hasNewRole,
                isSuperAdmin,
                userRoleStr,
                requiredRolesStr: requiredRoles.map(r => r.toString()),
                userRolesArray: user.roles,
            });
        }
        throw new common_1.ForbiddenException('Insufficient permissions');
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map