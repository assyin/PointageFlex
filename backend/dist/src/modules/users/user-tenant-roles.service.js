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
exports.UserTenantRolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let UserTenantRolesService = class UserTenantRolesService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async assignRoles(userId, tenantId, roleIds, assignedBy) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const roles = await this.prisma.role.findMany({
            where: {
                id: { in: roleIds },
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
                isActive: true,
            },
        });
        if (roles.length !== roleIds.length) {
            throw new common_1.NotFoundException('One or more roles not found');
        }
        const results = [];
        for (const roleId of roleIds) {
            const existing = await this.prisma.userTenantRole.findUnique({
                where: {
                    userId_tenantId_roleId: {
                        userId,
                        tenantId,
                        roleId,
                    },
                },
            });
            if (existing) {
                if (!existing.isActive) {
                    const updated = await this.prisma.userTenantRole.update({
                        where: { id: existing.id },
                        data: {
                            isActive: true,
                            assignedBy,
                            assignedAt: new Date(),
                        },
                        include: {
                            role: true,
                        },
                    });
                    results.push(updated);
                    await this.auditService.create(tenantId, assignedBy, {
                        action: 'ROLE_ASSIGNED',
                        entity: 'UserTenantRole',
                        entityId: updated.id,
                        newValues: {
                            userId,
                            tenantId,
                            roleId,
                            roleCode: updated.role.code,
                        },
                    });
                }
                else {
                    results.push(existing);
                }
            }
            else {
                const created = await this.prisma.userTenantRole.create({
                    data: {
                        userId,
                        tenantId,
                        roleId,
                        assignedBy,
                    },
                    include: {
                        role: true,
                    },
                });
                results.push(created);
                await this.auditService.create(tenantId, assignedBy, {
                    action: 'ROLE_ASSIGNED',
                    entity: 'UserTenantRole',
                    entityId: created.id,
                    newValues: {
                        userId,
                        tenantId,
                        roleId,
                        roleCode: created.role.code,
                    },
                });
            }
        }
        return results;
    }
    async removeRoles(userId, tenantId, roleIds, removedBy) {
        const userTenantRoles = await this.prisma.userTenantRole.findMany({
            where: {
                userId,
                tenantId,
                roleId: { in: roleIds },
                isActive: true,
            },
            include: {
                role: true,
            },
        });
        if (userTenantRoles.length === 0) {
            throw new common_1.NotFoundException('No active roles found to remove');
        }
        const results = [];
        for (const utr of userTenantRoles) {
            const updated = await this.prisma.userTenantRole.update({
                where: { id: utr.id },
                data: { isActive: false },
            });
            results.push(updated);
            await this.auditService.create(tenantId, removedBy, {
                action: 'ROLE_REMOVED',
                entity: 'UserTenantRole',
                entityId: utr.id,
                oldValues: {
                    userId,
                    tenantId,
                    roleId: utr.roleId,
                    roleCode: utr.role.code,
                },
            });
        }
        return results;
    }
    async setRoles(userId, tenantId, roleIds, assignedBy) {
        await this.prisma.userTenantRole.updateMany({
            where: {
                userId,
                tenantId,
                isActive: true,
            },
            data: { isActive: false },
        });
        return this.assignRoles(userId, tenantId, roleIds, assignedBy);
    }
    async getUserRoles(userId, tenantId) {
        return this.prisma.userTenantRole.findMany({
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
    }
    async getUserTenants(userId) {
        const userTenantRoles = await this.prisma.userTenantRole.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                        logo: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
            distinct: ['tenantId'],
        });
        const tenantsMap = new Map();
        for (const utr of userTenantRoles) {
            if (!tenantsMap.has(utr.tenantId)) {
                tenantsMap.set(utr.tenantId, {
                    tenant: utr.tenant,
                    roles: [],
                });
            }
            tenantsMap.get(utr.tenantId).roles.push(utr.role);
        }
        return Array.from(tenantsMap.values());
    }
    async userHasRole(userId, tenantId, roleCode) {
        const role = await this.prisma.role.findFirst({
            where: {
                code: roleCode,
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
        });
        if (!role) {
            return false;
        }
        const userTenantRole = await this.prisma.userTenantRole.findFirst({
            where: {
                userId,
                tenantId,
                roleId: role.id,
                isActive: true,
            },
        });
        return !!userTenantRole;
    }
};
exports.UserTenantRolesService = UserTenantRolesService;
exports.UserTenantRolesService = UserTenantRolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UserTenantRolesService);
//# sourceMappingURL=user-tenant-roles.service.js.map