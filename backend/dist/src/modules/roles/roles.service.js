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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const permissions_service_1 = require("../permissions/permissions.service");
let RolesService = class RolesService {
    constructor(prisma, permissionsService) {
        this.prisma = prisma;
        this.permissionsService = permissionsService;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.role.findFirst({
            where: {
                tenantId: tenantId || null,
                code: dto.code,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Role with code ${dto.code} already exists`);
        }
        if (!tenantId && dto.code !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only SUPER_ADMIN role can be created at system level');
        }
        const role = await this.prisma.role.create({
            data: {
                tenantId: tenantId || null,
                name: dto.name,
                code: dto.code,
                description: dto.description,
                isSystem: dto.isSystem || false,
            },
        });
        if (dto.permissionCodes && dto.permissionCodes.length > 0) {
            await this.assignPermissions(role.id, dto.permissionCodes);
        }
        return this.findOne(role.id);
    }
    async findAll(tenantId) {
        return this.prisma.role.findMany({
            where: {
                tenantId: tenantId || null,
                isActive: true,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: {
                        userRoles: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                    },
                },
                _count: {
                    select: {
                        userRoles: true,
                    },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async findByCode(tenantId, code) {
        return this.prisma.role.findFirst({
            where: {
                tenantId: tenantId || null,
                code,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    async update(tenantId, id, dto) {
        const role = await this.findOne(id);
        if (role.tenantId !== tenantId && role.tenantId !== null) {
            throw new common_1.ForbiddenException('Role does not belong to your tenant');
        }
        const isSystemRole = role.isSystem && role.code !== 'SUPER_ADMIN';
        if (isSystemRole) {
            if ((dto.name !== undefined && dto.name !== null && dto.name !== role.name) ||
                (dto.description !== undefined && dto.description !== null && dto.description !== role.description) ||
                (dto.isActive !== undefined && dto.isActive !== null && dto.isActive !== role.isActive)) {
                throw new common_1.ForbiddenException('System roles cannot have their name, description, or active status modified. Only permissions can be updated.');
            }
        }
        const updateData = {};
        if (!isSystemRole) {
            if (dto.name !== undefined && dto.name !== null)
                updateData.name = dto.name;
            if (dto.description !== undefined && dto.description !== null)
                updateData.description = dto.description;
            if (dto.isActive !== undefined && dto.isActive !== null)
                updateData.isActive = dto.isActive;
        }
        if (Object.keys(updateData).length > 0) {
            await this.prisma.role.update({
                where: { id },
                data: updateData,
            });
        }
        if (dto.permissionCodes !== undefined && dto.permissionCodes !== null) {
            if (Array.isArray(dto.permissionCodes)) {
                const validCodes = dto.permissionCodes.filter((code) => code !== null && code !== undefined && typeof code === 'string' && code.trim() !== '');
                await this.setPermissions(id, validCodes);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const role = await this.findOne(id);
        if (role.isSystem) {
            throw new common_1.ForbiddenException('System roles cannot be deleted');
        }
        const userCount = await this.prisma.userTenantRole.count({
            where: { roleId: id, isActive: true },
        });
        if (userCount > 0) {
            throw new common_1.ConflictException(`Cannot delete role: ${userCount} user(s) still have this role`);
        }
        return this.prisma.role.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async assignPermissions(roleId, permissionCodes) {
        const permissions = await this.prisma.permission.findMany({
            where: {
                code: { in: permissionCodes },
                isActive: true,
            },
        });
        if (permissions.length !== permissionCodes.length) {
            const foundCodes = permissions.map((p) => p.code);
            const missing = permissionCodes.filter((c) => !foundCodes.includes(c));
            throw new common_1.NotFoundException(`Permissions not found: ${missing.join(', ')}`);
        }
        await this.prisma.rolePermission.deleteMany({
            where: { roleId },
        });
        await this.prisma.rolePermission.createMany({
            data: permissions.map((p) => ({
                roleId,
                permissionId: p.id,
            })),
        });
        return this.findOne(roleId);
    }
    async setPermissions(roleId, permissionCodes) {
        return this.assignPermissions(roleId, permissionCodes);
    }
    async initializeSystemRoles() {
        const systemRoles = [
            {
                code: 'SUPER_ADMIN',
                name: 'Super Administrateur',
                description: 'Accès complet à la plateforme, gestion des tenants',
                isSystem: true,
            },
        ];
        for (const roleData of systemRoles) {
            const existing = await this.prisma.role.findFirst({
                where: {
                    tenantId: null,
                    code: roleData.code,
                },
            });
            if (!existing) {
                await this.prisma.role.create({
                    data: roleData,
                });
            }
        }
    }
    async resetDefaultPermissions(roleId) {
        const role = await this.findOne(roleId);
        if (!role.isSystem) {
            throw new common_1.ForbiddenException('Only system roles can have default permissions reset');
        }
        const defaultPermissions = {
            SUPER_ADMIN: [
                'employee.view_all',
                'employee.view_own',
                'employee.create',
                'employee.update',
                'employee.delete',
                'employee.import',
                'employee.export',
                'attendance.view_all',
                'attendance.view_own',
                'attendance.view_team',
                'attendance.create',
                'attendance.edit',
                'attendance.correct',
                'attendance.delete',
                'attendance.import',
                'attendance.export',
                'attendance.view_anomalies',
                'schedule.view_all',
                'schedule.view_own',
                'schedule.view_team',
                'schedule.create',
                'schedule.update',
                'schedule.delete',
                'schedule.manage_team',
                'schedule.approve_replacement',
                'shift.view_all',
                'shift.create',
                'shift.update',
                'shift.delete',
                'leave.view_all',
                'leave.view_own',
                'leave.view_team',
                'leave.create',
                'leave.update',
                'leave.approve',
                'leave.reject',
                'leave.manage_types',
                'overtime.view_all',
                'overtime.view_own',
                'overtime.approve',
                'recovery.view',
                'reports.view_all',
                'reports.view_attendance',
                'reports.view_leaves',
                'reports.view_overtime',
                'reports.export',
                'reports.view_payroll',
                'user.view_all',
                'user.create',
                'user.update',
                'user.delete',
                'user.view_roles',
                'user.assign_roles',
                'user.remove_roles',
                'role.view_all',
                'role.create',
                'role.update',
                'role.delete',
                'tenant.view_settings',
                'tenant.update_settings',
                'tenant.manage_sites',
                'tenant.manage_departments',
                'tenant.manage_positions',
                'tenant.manage_teams',
                'tenant.manage_holidays',
                'tenant.manage_devices',
                'audit.view_all',
            ],
            ADMIN_RH: [
                'employee.view_all',
                'employee.view_own',
                'employee.create',
                'employee.update',
                'employee.delete',
                'employee.import',
                'employee.export',
                'attendance.view_all',
                'attendance.view_own',
                'attendance.view_team',
                'attendance.create',
                'attendance.edit',
                'attendance.correct',
                'attendance.delete',
                'attendance.import',
                'attendance.export',
                'attendance.view_anomalies',
                'schedule.view_all',
                'schedule.view_own',
                'schedule.view_team',
                'schedule.create',
                'schedule.update',
                'schedule.delete',
                'schedule.manage_team',
                'schedule.approve_replacement',
                'shift.view_all',
                'shift.create',
                'shift.update',
                'shift.delete',
                'leave.view_all',
                'leave.view_own',
                'leave.view_team',
                'leave.create',
                'leave.update',
                'leave.approve',
                'leave.reject',
                'leave.manage_types',
                'overtime.view_all',
                'overtime.approve',
                'recovery.view',
                'reports.view_all',
                'reports.view_attendance',
                'reports.view_leaves',
                'reports.view_overtime',
                'reports.export',
                'reports.view_payroll',
                'user.view_all',
                'user.create',
                'user.update',
                'user.delete',
                'user.view_roles',
                'user.assign_roles',
                'user.remove_roles',
                'role.view_all',
                'role.create',
                'role.update',
                'role.delete',
                'tenant.view_settings',
                'tenant.update_settings',
                'tenant.manage_sites',
                'tenant.manage_departments',
                'tenant.manage_positions',
                'tenant.manage_teams',
                'tenant.manage_holidays',
                'tenant.manage_devices',
                'audit.view_all',
            ],
            MANAGER: [
                'employee.view_team',
                'attendance.view_team',
                'attendance.view_anomalies',
                'attendance.correct',
                'schedule.view_team',
                'schedule.view_all',
                'schedule.create',
                'schedule.update',
                'schedule.delete',
                'schedule.manage_team',
                'schedule.approve_replacement',
                'leave.view_team',
                'leave.approve',
                'leave.reject',
                'overtime.view_all',
                'overtime.approve',
                'reports.view_attendance',
                'reports.view_leaves',
                'reports.view_overtime',
                'reports.export',
            ],
            EMPLOYEE: [
                'employee.view_own',
                'attendance.view_own',
                'attendance.create',
                'schedule.view_own',
                'leave.view_own',
                'leave.create',
                'leave.update',
                'overtime.view_own',
                'reports.view_attendance',
            ],
        };
        const permissionCodes = defaultPermissions[role.code];
        if (!permissionCodes) {
            throw new common_1.NotFoundException(`No default permissions defined for role ${role.code}`);
        }
        await this.setPermissions(roleId, permissionCodes);
        return this.findOne(roleId);
    }
    async initializeTenantRoles(tenantId) {
        const defaultRoles = [
            {
                code: 'ADMIN_RH',
                name: 'Administrateur RH',
                description: 'Gestion complète des ressources humaines du tenant',
                isSystem: true,
            },
            {
                code: 'MANAGER',
                name: 'Manager',
                description: 'Gestion d\'équipe, validation des demandes',
                isSystem: true,
            },
            {
                code: 'EMPLOYEE',
                name: 'Employé',
                description: 'Accès limité aux données personnelles',
                isSystem: true,
            },
        ];
        for (const roleData of defaultRoles) {
            const existing = await this.prisma.role.findFirst({
                where: {
                    tenantId,
                    code: roleData.code,
                },
            });
            if (!existing) {
                const role = await this.prisma.role.create({
                    data: {
                        ...roleData,
                        tenantId,
                    },
                });
                try {
                    await this.resetDefaultPermissions(role.id);
                }
                catch (error) {
                }
            }
        }
    }
    async updateAllManagerRoles() {
        const managerRoles = await this.prisma.role.findMany({
            where: {
                code: 'MANAGER',
                isSystem: true,
                isActive: true,
            },
        });
        const results = [];
        for (const role of managerRoles) {
            try {
                await this.resetDefaultPermissions(role.id);
                results.push({ roleId: role.id, tenantId: role.tenantId, status: 'success' });
            }
            catch (error) {
                results.push({ roleId: role.id, tenantId: role.tenantId, status: 'error', error: error.message });
            }
        }
        return {
            total: managerRoles.length,
            updated: results.filter((r) => r.status === 'success').length,
            failed: results.filter((r) => r.status === 'error').length,
            results,
        };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        permissions_service_1.PermissionsService])
], RolesService);
//# sourceMappingURL=roles.service.js.map