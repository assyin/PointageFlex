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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.permission.findMany({
            where: { isActive: true },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });
    }
    async findByCode(code) {
        return this.prisma.permission.findUnique({
            where: { code },
        });
    }
    async findByCategory(category) {
        return this.prisma.permission.findMany({
            where: {
                category,
                isActive: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async getRolePermissions(roleId) {
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });
        return rolePermissions.map((rp) => rp.permission);
    }
    async roleHasPermission(roleId, permissionCode) {
        const permission = await this.findByCode(permissionCode);
        if (!permission) {
            return false;
        }
        const rolePermission = await this.prisma.rolePermission.findFirst({
            where: {
                roleId,
                permissionId: permission.id,
            },
        });
        return !!rolePermission;
    }
    async userHasPermission(userId, tenantId, permissionCode) {
        const userTenantRoles = await this.prisma.userTenantRole.findMany({
            where: {
                userId,
                tenantId,
                isActive: true,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        for (const utr of userTenantRoles) {
            const hasPermission = utr.role.permissions.some((rp) => rp.permission.code === permissionCode && rp.permission.isActive);
            if (hasPermission) {
                return true;
            }
        }
        return false;
    }
    async getUserPermissions(userId, tenantId) {
        const userTenantRoles = await this.prisma.userTenantRole.findMany({
            where: {
                userId,
                tenantId,
                isActive: true,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        const permissionCodes = new Set();
        for (const utr of userTenantRoles) {
            for (const rp of utr.role.permissions) {
                if (rp.permission.isActive) {
                    permissionCodes.add(rp.permission.code);
                }
            }
        }
        return Array.from(permissionCodes);
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map