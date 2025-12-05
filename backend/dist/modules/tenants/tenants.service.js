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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TenantsService = class TenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.tenant.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException('Slug already exists');
        }
        const tenant = await this.prisma.tenant.create({
            data: {
                ...dto,
                settings: {
                    create: {},
                },
            },
            include: {
                settings: true,
            },
        });
        return tenant;
    }
    async findAll(page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { companyName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.tenant.findMany({
                where,
                skip,
                take: limit,
                include: {
                    settings: true,
                    _count: {
                        select: {
                            users: true,
                            employees: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.tenant.count({ where }),
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
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                settings: true,
                _count: {
                    select: {
                        users: true,
                        employees: true,
                        sites: true,
                    },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.tenant.update({
            where: { id },
            data: dto,
            include: {
                settings: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.tenant.delete({
            where: { id },
        });
    }
    async getSettings(tenantId) {
        const settings = await this.prisma.tenantSettings.findUnique({
            where: { tenantId },
        });
        if (!settings) {
            throw new common_1.NotFoundException('Settings not found');
        }
        return settings;
    }
    async updateSettings(tenantId, dto) {
        return this.prisma.tenantSettings.upsert({
            where: { tenantId },
            create: {
                tenantId,
                ...dto,
            },
            update: dto,
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map