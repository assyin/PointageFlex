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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TeamsService = class TeamsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.team.findFirst({
            where: {
                tenantId,
                code: dto.code,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Team code already exists');
        }
        return this.prisma.team.create({
            data: {
                ...dto,
                tenantId,
                rotationEnabled: dto.rotationEnabled || false,
            },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        matricule: true,
                    },
                },
            },
        });
    }
    async findAll(tenantId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { code: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.rotationEnabled !== undefined) {
            where.rotationEnabled = filters.rotationEnabled;
        }
        const [data, total] = await Promise.all([
            this.prisma.team.findMany({
                where,
                skip,
                take: limit,
                include: {
                    employees: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            matricule: true,
                        },
                    },
                    _count: {
                        select: {
                            employees: true,
                            schedules: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.team.count({ where }),
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
        const team = await this.prisma.team.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        matricule: true,
                        position: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        employees: true,
                        schedules: true,
                    },
                },
            },
        });
        if (!team) {
            throw new common_1.NotFoundException('Team not found');
        }
        return team;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        if (dto.code) {
            const existing = await this.prisma.team.findFirst({
                where: {
                    tenantId,
                    code: dto.code,
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Team code already exists');
            }
        }
        return this.prisma.team.update({
            where: { id },
            data: dto,
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        matricule: true,
                    },
                },
            },
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.team.delete({
            where: { id },
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map