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
var AbsenceTechnicalManagerNotificationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsenceTechnicalManagerNotificationJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const mail_service_1 = require("../../mail/mail.service");
let AbsenceTechnicalManagerNotificationJob = AbsenceTechnicalManagerNotificationJob_1 = class AbsenceTechnicalManagerNotificationJob {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(AbsenceTechnicalManagerNotificationJob_1.name);
    }
    async handleAbsenceTechnicalNotifications() {
        this.logger.log('🔍 Démarrage détection ABSENCE_TECHNICAL pour notifications manager...');
        try {
            const tenants = await this.getActiveTenants();
            this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);
            for (const tenant of tenants) {
                try {
                    await this.processTenant(tenant.id);
                }
                catch (error) {
                    this.logger.error(`Erreur lors du traitement ABSENCE_TECHNICAL pour tenant ${tenant.id}:`, error);
                }
            }
            this.logger.log('✅ Détection ABSENCE_TECHNICAL terminée');
        }
        catch (error) {
            this.logger.error('Erreur critique dans le job ABSENCE_TECHNICAL:', error);
        }
    }
    async getActiveTenants() {
        return this.prisma.tenant.findMany({
            where: {},
            include: {
                settings: true,
            },
        });
    }
    async processTenant(tenantId) {
        const technicalAnomalies = await this.getTechnicalAnomalies(tenantId);
        this.logger.log(`Tenant ${tenantId}: ${technicalAnomalies.length} anomalie(s) technique(s) à traiter`);
        for (const anomaly of technicalAnomalies) {
            try {
                await this.processAnomaly(tenantId, anomaly);
            }
            catch (error) {
                this.logger.error(`Erreur traitement anomalie ${anomaly.id}:`, error);
            }
        }
    }
    async getTechnicalAnomalies(tenantId) {
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        const anomalies = await this.prisma.attendanceAnomaly.findMany({
            where: {
                tenantId,
                type: 'TECHNICAL',
                status: { in: ['OPEN', 'INVESTIGATING'] },
                notifiedAt: null,
                detectedAt: { gte: oneDayAgo },
            },
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        department: true,
                    },
                },
                schedule: {
                    include: {
                        shift: true,
                    },
                },
                device: true,
                attendance: true,
            },
            orderBy: { detectedAt: 'desc' },
        });
        return anomalies;
    }
    async processAnomaly(tenantId, anomaly) {
        const { employee, schedule } = anomaly;
        if (!employee || !employee.user) {
            this.logger.debug(`Anomalie ${anomaly.id} sans employé/user valide, skip`);
            return;
        }
        const alreadyNotified = await this.prisma.absenceTechnicalNotificationLog.findUnique({
            where: {
                tenantId_anomalyId: {
                    tenantId,
                    anomalyId: anomaly.id,
                },
            },
        });
        if (alreadyNotified) {
            return;
        }
        const isTechnical = await this.isTechnicalIssue(tenantId, anomaly);
        if (!isTechnical) {
            return;
        }
        const manager = await this.getEmployeeManager(employee.id);
        if (!manager || !manager.email) {
            this.logger.warn(`Pas de manager avec email pour ${employee.user.firstName} ${employee.user.lastName}`);
            return;
        }
        this.logger.log(`[DEBUG] Anomalie technique ${anomaly.subType || anomaly.type} détectée pour ${employee.user.firstName} ${employee.user.lastName}. Envoi notification au manager ${manager.firstName} ${manager.lastName}`);
        await this.sendManagerNotification(tenantId, employee, manager, anomaly, schedule);
        await this.prisma.attendanceAnomaly.update({
            where: { id: anomaly.id },
            data: { notifiedAt: new Date() },
        });
    }
    async isTechnicalIssue(tenantId, anomaly) {
        if (anomaly.type === 'TECHNICAL') {
            return true;
        }
        if (anomaly.device) {
            const lastSync = anomaly.device.lastSync;
            if (lastSync) {
                const hoursSinceLastSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
                if (hoursSinceLastSync > 1) {
                    return true;
                }
            }
        }
        if (anomaly.occurredAt && anomaly.deviceId) {
            const windowStart = new Date(anomaly.occurredAt);
            windowStart.setMinutes(windowStart.getMinutes() - 30);
            const windowEnd = new Date(anomaly.occurredAt);
            windowEnd.setMinutes(windowEnd.getMinutes() + 30);
            const sameTimeAnomalies = await this.prisma.attendanceAnomaly.count({
                where: {
                    tenantId,
                    deviceId: anomaly.deviceId,
                    occurredAt: { gte: windowStart, lte: windowEnd },
                    id: { not: anomaly.id },
                },
            });
            if (sameTimeAnomalies >= 3) {
                return true;
            }
        }
        return false;
    }
    async getEmployeeManager(employeeId) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
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
        });
        return employee?.department?.manager?.user || null;
    }
    async sendManagerNotification(tenantId, employee, manager, anomaly, schedule) {
        const emailConfig = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyAbsenceTechnical) {
            this.logger.debug(`Notifications ABSENCE_TECHNICAL désactivées pour tenant ${tenantId}, skip email`);
            return;
        }
        const template = await this.prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: 'ABSENCE_TECHNICAL',
                },
            },
        });
        if (!template || !template.active) {
            this.logger.warn(`Template ABSENCE_TECHNICAL non trouvé ou inactif pour tenant ${tenantId}`);
            return;
        }
        const occurredDate = anomaly.occurredAt ? new Date(anomaly.occurredAt) : new Date();
        const sessionDate = schedule?.date
            ? new Date(schedule.date).toLocaleDateString('fr-FR')
            : occurredDate.toLocaleDateString('fr-FR');
        const deviceInfo = anomaly.device ? ` (Terminal: ${anomaly.device.name})` : '';
        const subTypeInfo = anomaly.subType ? ` - ${anomaly.subType}` : '';
        const templateData = {
            managerName: `${manager.firstName} ${manager.lastName}`,
            employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
            sessionDate: sessionDate,
            occurredAt: occurredDate.toLocaleString('fr-FR'),
            reason: anomaly.description || `Anomalie technique${subTypeInfo} détectée${deviceInfo}.`,
            deviceName: anomaly.device?.name || 'N/A',
            severity: anomaly.severity || 'MEDIUM',
        };
        let html = template.htmlContent;
        Object.keys(templateData).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, templateData[key]);
        });
        await this.mailService.sendMail({
            to: manager.email,
            subject: template.subject,
            html,
            type: 'ABSENCE_TECHNICAL',
            employeeId: employee.user.id,
            managerId: manager.id,
            templateId: template.id,
        }, tenantId);
        this.logger.log(`📧 Email ABSENCE_TECHNICAL envoyé à ${manager.email} pour ${employee.user.firstName} ${employee.user.lastName}`);
        await this.prisma.absenceTechnicalNotificationLog.create({
            data: {
                tenantId,
                employeeId: employee.user.id,
                managerId: manager.id,
                anomalyId: anomaly.id,
                sessionDate: schedule.date,
                reason: templateData.reason,
            },
        });
        this.logger.log(`✅ Notification ABSENCE_TECHNICAL enregistrée pour anomalie ${anomaly.id}`);
    }
};
exports.AbsenceTechnicalManagerNotificationJob = AbsenceTechnicalManagerNotificationJob;
__decorate([
    (0, schedule_1.Cron)('0 */1 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbsenceTechnicalManagerNotificationJob.prototype, "handleAbsenceTechnicalNotifications", null);
exports.AbsenceTechnicalManagerNotificationJob = AbsenceTechnicalManagerNotificationJob = AbsenceTechnicalManagerNotificationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], AbsenceTechnicalManagerNotificationJob);
//# sourceMappingURL=absence-technical-manager-notification.job.js.map