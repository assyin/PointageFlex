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
var OvertimePendingNotificationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OvertimePendingNotificationJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const mail_service_1 = require("../../mail/mail.service");
const client_1 = require("@prisma/client");
let OvertimePendingNotificationJob = OvertimePendingNotificationJob_1 = class OvertimePendingNotificationJob {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(OvertimePendingNotificationJob_1.name);
    }
    async handleOvertimePendingNotifications() {
        this.logger.log('🔍 Vérification des notifications OVERTIME_PENDING...');
        try {
            const tenants = await this.getActiveTenants();
            const currentHour = new Date().getHours();
            const currentMinute = new Date().getMinutes();
            const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            this.logger.log(`Heure actuelle: ${currentTime}, Traitement de ${tenants.length} tenant(s)...`);
            for (const tenant of tenants) {
                try {
                    const configuredTime = tenant.settings?.overtimePendingNotificationTime || '09:00';
                    const [configHour] = configuredTime.split(':').map(Number);
                    if (currentHour === configHour) {
                        this.logger.log(`Tenant ${tenant.companyName}: Heure de notification (${configuredTime})`);
                        await this.processTenant(tenant.id);
                    }
                    else {
                        this.logger.debug(`Tenant ${tenant.companyName}: Pas l'heure (configuré: ${configuredTime})`);
                    }
                }
                catch (error) {
                    this.logger.error(`Erreur lors du traitement OVERTIME_PENDING pour tenant ${tenant.id}:`, error);
                }
            }
            this.logger.log('✅ Vérification OVERTIME_PENDING terminée');
        }
        catch (error) {
            this.logger.error('Erreur critique dans le job OVERTIME_PENDING:', error);
        }
    }
    async getActiveTenants() {
        return this.prisma.tenant.findMany({
            include: {
                settings: true,
            },
        });
    }
    async processTenant(tenantId) {
        const emailConfig = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyOvertimePending) {
            this.logger.debug(`Notifications OVERTIME_PENDING désactivées pour tenant ${tenantId}, skip`);
            return;
        }
        const pendingOvertimes = await this.prisma.overtime.findMany({
            where: {
                tenantId,
                status: client_1.OvertimeStatus.PENDING,
            },
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        department: {
                            include: {
                                manager: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                email: true,
                                                firstName: true,
                                                lastName: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: 'asc',
            },
        });
        if (pendingOvertimes.length === 0) {
            this.logger.debug(`Tenant ${tenantId}: Aucune demande en attente`);
            return;
        }
        this.logger.log(`Tenant ${tenantId}: ${pendingOvertimes.length} demande(s) en attente`);
        const byManager = new Map();
        for (const overtime of pendingOvertimes) {
            const manager = overtime.employee.department?.manager?.user;
            if (!manager || !manager.email) {
                this.logger.warn(`Pas de manager avec email pour ${overtime.employee.user.firstName} ${overtime.employee.user.lastName}`);
                continue;
            }
            if (!byManager.has(manager.id)) {
                byManager.set(manager.id, {
                    manager,
                    overtimes: [],
                    totalHours: 0,
                });
            }
            const group = byManager.get(manager.id);
            group.overtimes.push(overtime);
            group.totalHours += Number(overtime.hours);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (const [managerId, data] of byManager) {
            try {
                const alreadyNotified = await this.prisma.overtimePendingNotificationLog.findFirst({
                    where: {
                        tenantId,
                        managerId,
                        sentAt: {
                            gte: today,
                        },
                    },
                });
                if (alreadyNotified) {
                    this.logger.debug(`Manager ${data.manager.firstName} ${data.manager.lastName} déjà notifié aujourd'hui`);
                    continue;
                }
                await this.sendManagerNotification(tenantId, data.manager, data.overtimes, data.totalHours);
            }
            catch (error) {
                this.logger.error(`Erreur envoi notification au manager ${managerId}:`, error);
            }
        }
    }
    async sendManagerNotification(tenantId, manager, overtimes, totalHours) {
        const template = await this.prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: 'OVERTIME_PENDING',
                },
            },
        });
        if (!template || !template.active) {
            this.logger.warn(`Template OVERTIME_PENDING non trouvé ou inactif pour tenant ${tenantId}`);
            return;
        }
        const overtimesList = overtimes
            .map((ot) => {
            const employeeName = `${ot.employee.user.firstName} ${ot.employee.user.lastName}`;
            const date = new Date(ot.date).toLocaleDateString('fr-FR');
            const hours = Number(ot.hours).toFixed(2);
            const type = this.getOvertimeTypeLabel(ot.type);
            return `- ${employeeName}: ${hours}h le ${date} (${type})`;
        })
            .join('\n');
        const templateData = {
            managerName: `${manager.firstName} ${manager.lastName}`,
            pendingCount: overtimes.length.toString(),
            totalHours: totalHours.toFixed(2),
            overtimesList,
            approvalUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/overtime`,
        };
        let html = template.htmlContent;
        Object.keys(templateData).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, templateData[key]);
        });
        await this.mailService.sendMail({
            to: manager.email,
            subject: template.subject.replace('{{pendingCount}}', templateData.pendingCount),
            html,
            type: 'OVERTIME_PENDING',
            managerId: manager.id,
            templateId: template.id,
        }, tenantId);
        this.logger.log(`📧 Email OVERTIME_PENDING envoyé à ${manager.email} (${overtimes.length} demandes, ${totalHours.toFixed(2)}h)`);
        await this.prisma.overtimePendingNotificationLog.create({
            data: {
                tenantId,
                managerId: manager.id,
                pendingCount: overtimes.length,
                totalHours,
            },
        });
        this.logger.log(`✅ Notification OVERTIME_PENDING enregistrée pour manager ${manager.firstName} ${manager.lastName}`);
    }
    getOvertimeTypeLabel(type) {
        const labels = {
            STANDARD: 'Standard',
            NIGHT: 'Nuit',
            HOLIDAY: 'Jour férié',
            EMERGENCY: 'Urgence',
        };
        return labels[type] || type;
    }
};
exports.OvertimePendingNotificationJob = OvertimePendingNotificationJob;
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OvertimePendingNotificationJob.prototype, "handleOvertimePendingNotifications", null);
exports.OvertimePendingNotificationJob = OvertimePendingNotificationJob = OvertimePendingNotificationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], OvertimePendingNotificationJob);
//# sourceMappingURL=overtime-pending-notification.job.js.map