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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.user.findFirst({
            where: {
                tenantId,
                email: dto.email,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const { password, ...rest } = dto;
        const user = await this.prisma.user.create({
            data: {
                ...rest,
                password: hashedPassword,
                tenantId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        return user;
    }
    async findAll(tenantId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (filters?.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(tenantId, id) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                tenantId: tenantId || undefined,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                employee: {
                    select: {
                        id: true,
                        matricule: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        position: true,
                        positionId: true,
                        hireDate: true,
                        contractType: true,
                        site: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        team: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        currentShift: {
                            select: {
                                id: true,
                                name: true,
                                startTime: true,
                                endTime: true,
                            },
                        },
                        positionRef: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                category: true,
                            },
                        },
                    },
                },
                userTenantRoles: {
                    where: {
                        isActive: true,
                        tenantId: tenantId || undefined,
                    },
                    select: {
                        id: true,
                        role: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                description: true,
                                isSystem: true,
                                permissions: {
                                    where: {
                                        permission: {
                                            isActive: true,
                                        },
                                    },
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                code: true,
                                                name: true,
                                                description: true,
                                                category: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const roles = user.userTenantRoles.map((utr) => ({
            id: utr.role.id,
            code: utr.role.code,
            name: utr.role.name,
            description: utr.role.description,
            isSystem: utr.role.isSystem,
        }));
        const permissions = new Set();
        user.userTenantRoles.forEach((utr) => {
            utr.role.permissions.forEach((rp) => {
                permissions.add(rp.permission.code);
            });
        });
        return {
            ...user,
            roles: Array.from(roles),
            permissions: Array.from(permissions),
        };
    }
    async update(tenantId, id, dto, currentUserRole) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                tenantId: tenantId || undefined,
            },
            select: {
                id: true,
                role: true,
                employee: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === client_1.LegacyRole.EMPLOYEE && user.id === id) {
            if (dto.firstName !== undefined || dto.lastName !== undefined) {
                throw new common_1.ConflictException('Les employés ne peuvent pas modifier leur nom ou prénom. Contactez la RH.');
            }
        }
        const updateData = {};
        if (dto.email !== undefined) {
            if (currentUserRole !== client_1.LegacyRole.ADMIN_RH && currentUserRole !== client_1.LegacyRole.SUPER_ADMIN) {
                throw new common_1.ConflictException('Seuls les administrateurs RH peuvent modifier l\'email');
            }
            updateData.email = dto.email;
        }
        if (dto.firstName !== undefined) {
            if (user.role === client_1.LegacyRole.EMPLOYEE && user.id === id) {
                throw new common_1.ConflictException('Les employés ne peuvent pas modifier leur prénom');
            }
            updateData.firstName = dto.firstName;
        }
        if (dto.lastName !== undefined) {
            if (user.role === client_1.LegacyRole.EMPLOYEE && user.id === id) {
                throw new common_1.ConflictException('Les employés ne peuvent pas modifier leur nom');
            }
            updateData.lastName = dto.lastName;
        }
        if (dto.phone !== undefined)
            updateData.phone = dto.phone;
        if (dto.avatar !== undefined)
            updateData.avatar = dto.avatar;
        if (dto.role !== undefined)
            updateData.role = dto.role;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.email) {
            const existing = await this.prisma.user.findFirst({
                where: {
                    tenantId: tenantId || undefined,
                    email: dto.email,
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async changePassword(userId, currentPassword, newPassword, skipCurrentPasswordCheck = false) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
                forcePasswordChange: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!skipCurrentPasswordCheck) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.ConflictException('Mot de passe actuel incorrect');
            }
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                forcePasswordChange: false,
            },
        });
        return { message: 'Mot de passe modifié avec succès' };
    }
    async getPreferences(userId) {
        let preferences = await this.prisma.userPreferences.findUnique({
            where: { userId },
        });
        if (!preferences) {
            preferences = await this.prisma.userPreferences.create({
                data: {
                    userId,
                    language: 'fr',
                    timezone: 'Africa/Casablanca',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '24h',
                    theme: 'light',
                    notifications: {
                        email: {
                            leaves: true,
                            planning: true,
                            alerts: false,
                        },
                        push: {
                            mobile: true,
                            desktop: false,
                        },
                        sms: false,
                    },
                },
            });
        }
        return preferences;
    }
    async updatePreferences(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const preferences = await this.prisma.userPreferences.upsert({
            where: { userId },
            update: {
                ...dto,
                updatedAt: new Date(),
            },
            create: {
                userId,
                language: dto.language || 'fr',
                timezone: dto.timezone || 'Africa/Casablanca',
                dateFormat: dto.dateFormat || 'DD/MM/YYYY',
                timeFormat: dto.timeFormat || '24h',
                theme: dto.theme || 'light',
                notifications: dto.notifications || {
                    email: {
                        leaves: true,
                        planning: true,
                        alerts: false,
                    },
                    push: {
                        mobile: true,
                        desktop: false,
                    },
                    sms: false,
                },
            },
        });
        return preferences;
    }
    async getSessions(userId, currentTokenId) {
        const sessions = await this.prisma.userSession.findMany({
            where: {
                userId,
                isActive: true,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                lastActive: 'desc',
            },
        });
        if (sessions.length === 0) {
            return [
                {
                    id: 'current',
                    device: 'Unknown',
                    browser: 'Unknown',
                    os: 'Unknown',
                    location: 'Unknown',
                    ip: 'Unknown',
                    lastActive: new Date().toISOString(),
                    isCurrent: true,
                },
            ];
        }
        return sessions.map((session) => ({
            id: session.id,
            device: session.device || 'Unknown',
            browser: session.browser || 'Unknown',
            os: session.os || 'Unknown',
            location: session.location || 'Unknown',
            ip: session.ipAddress || 'Unknown',
            lastActive: session.lastActive.toISOString(),
            isCurrent: session.tokenId === currentTokenId,
        }));
    }
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.userSession.findFirst({
            where: {
                id: sessionId,
                userId,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { isActive: false },
        });
        return { message: 'Session révoquée avec succès' };
    }
    async revokeAllOtherSessions(userId, currentTokenId) {
        await this.prisma.userSession.updateMany({
            where: {
                userId,
                tokenId: { not: currentTokenId },
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
        return { message: 'Toutes les autres sessions ont été révoquées' };
    }
    async getStats(userId, tenantId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: true,
            },
        });
        if (!user || !user.employee) {
            return {
                workedDays: { value: 0, subtitle: 'Jours travaillés ce mois' },
                totalHours: { value: '0h', subtitle: 'Heures totales' },
                lateCount: { value: 0, subtitle: 'Retards' },
                overtime: { value: '0h', subtitle: 'Heures supplémentaires' },
                leaveTaken: { value: 0, subtitle: 'Congés pris' },
            };
        }
        const employeeId = user.employee.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const attendanceEntries = await this.prisma.attendance.findMany({
            where: {
                employeeId,
                tenantId,
                timestamp: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                type: client_1.AttendanceType.IN,
            },
            select: {
                timestamp: true,
            },
        });
        const uniqueDays = new Set(attendanceEntries.map((a) => {
            const date = new Date(a.timestamp);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }));
        const workedDays = uniqueDays.size;
        const attendances = await this.prisma.attendance.findMany({
            where: {
                employeeId,
                tenantId,
                timestamp: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            orderBy: {
                timestamp: 'asc',
            },
        });
        const lateCount = await this.prisma.attendance.count({
            where: {
                employeeId,
                tenantId,
                timestamp: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                hasAnomaly: true,
                anomalyType: 'LATE',
            },
        });
        const overtimeRecords = await this.prisma.overtime.findMany({
            where: {
                employeeId,
                tenantId,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                status: 'APPROVED',
            },
        });
        const totalOvertimeHours = overtimeRecords.reduce((sum, ot) => {
            return sum + (ot.hours ? Number(ot.hours) : 0);
        }, 0);
        const leaves = await this.prisma.leave.findMany({
            where: {
                employeeId,
                tenantId,
                startDate: {
                    lte: endOfMonth,
                },
                endDate: {
                    gte: startOfMonth,
                },
                status: {
                    in: ['APPROVED', 'HR_APPROVED', 'MANAGER_APPROVED'],
                },
            },
            include: {
                leaveType: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        const leaveDays = leaves.reduce((sum, leave) => {
            const start = new Date(Math.max(new Date(leave.startDate).getTime(), startOfMonth.getTime()));
            const end = new Date(Math.min(new Date(leave.endDate).getTime(), endOfMonth.getTime()));
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return sum + days;
        }, 0);
        return {
            workedDays: {
                value: workedDays,
                subtitle: `Jours travaillés en ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            },
            totalHours: {
                value: `${Math.round(workedDays * 8)}h`,
                subtitle: 'Heures totales (estimation)',
            },
            lateCount: {
                value: lateCount,
                subtitle: 'Retards ce mois',
            },
            overtime: {
                value: `${totalOvertimeHours}h`,
                subtitle: 'Heures supplémentaires approuvées',
            },
            leaveTaken: {
                value: leaveDays,
                subtitle: 'Jours de congés pris ce mois',
            },
        };
    }
    async exportUserData(userId, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                tenantId: tenantId || undefined,
            },
            include: {
                employee: {
                    include: {
                        department: true,
                        site: true,
                        team: true,
                        positionRef: true,
                    },
                },
                userTenantRoles: {
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
                },
                preferences: true,
                auditLogs: {
                    where: {
                        userId,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 100,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const attendance = user.employee
            ? await this.prisma.attendance.findMany({
                where: {
                    employeeId: user.employee.id,
                    tenantId,
                },
                orderBy: {
                    timestamp: 'desc',
                },
                take: 1000,
            })
            : [];
        const leaves = user.employee
            ? await this.prisma.leave.findMany({
                where: {
                    employeeId: user.employee.id,
                    tenantId,
                },
                include: {
                    leaveType: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
            : [];
        const overtime = user.employee
            ? await this.prisma.overtime.findMany({
                where: {
                    employeeId: user.employee.id,
                    tenantId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
            : [];
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            },
            employee: user.employee,
            roles: user.userTenantRoles.map((utr) => ({
                role: utr.role,
                assignedAt: utr.assignedAt,
            })),
            preferences: user.preferences,
            attendance: attendance.map((a) => ({
                timestamp: a.timestamp,
                type: a.type,
                method: a.method,
                hasAnomaly: a.hasAnomaly,
            })),
            leaves: leaves.map((l) => ({
                startDate: l.startDate,
                endDate: l.endDate,
                type: l.leaveType?.name || l.leaveType?.code || 'Unknown',
                status: l.status,
                days: l.days,
            })),
            overtime: overtime.map((ot) => ({
                date: ot.date,
                hours: ot.hours,
                status: ot.status,
            })),
            auditLogs: user.auditLogs,
            exportDate: new Date().toISOString(),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map