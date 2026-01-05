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
var AbsencePartialManagerNotificationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsencePartialManagerNotificationJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../../mail/mail.service");
let AbsencePartialManagerNotificationJob = AbsencePartialManagerNotificationJob_1 = class AbsencePartialManagerNotificationJob {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(AbsencePartialManagerNotificationJob_1.name);
    }
    async handleAbsencePartialNotifications() {
        this.logger.log('🔍 Démarrage détection ABSENCE_PARTIAL pour notifications manager...');
        try {
            const tenants = await this.getActiveTenants();
            this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);
            for (const tenant of tenants) {
                try {
                    await this.processTenant(tenant.id);
                }
                catch (error) {
                    this.logger.error(`Erreur lors du traitement ABSENCE_PARTIAL pour tenant ${tenant.id}:`, error);
                }
            }
            this.logger.log('✅ Détection ABSENCE_PARTIAL terminée');
        }
        catch (error) {
            this.logger.error('Erreur critique dans le job ABSENCE_PARTIAL:', error);
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
        const settings = await this.prisma.tenantSettings.findUnique({
            where: { tenantId },
            select: {
                absencePartialNotificationFrequencyMinutes: true,
            },
        });
        const detectionWindowMinutes = 120;
        const orphanOutRecords = await this.getOrphanOutRecords(tenantId);
        this.logger.log(`Tenant ${tenantId}: ${orphanOutRecords.length} OUT orphelin(s) à analyser`);
        for (const outRecord of orphanOutRecords) {
            try {
                await this.processOutRecord(tenantId, outRecord, detectionWindowMinutes);
            }
            catch (error) {
                this.logger.error(`Erreur traitement OUT record ${outRecord.id}:`, error);
            }
        }
    }
    async getOrphanOutRecords(tenantId) {
        const now = new Date();
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const endOfToday = new Date(startOfToday);
        endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
        endOfToday.setUTCMilliseconds(-1);
        const outRecords = await this.prisma.attendance.findMany({
            where: {
                tenantId,
                type: client_1.AttendanceType.OUT,
                timestamp: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
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
                    },
                },
            },
            orderBy: {
                timestamp: 'asc',
            },
        });
        const orphanOuts = [];
        for (const outRecord of outRecords) {
            const windowStart = new Date(outRecord.timestamp);
            windowStart.setHours(windowStart.getHours() - 4);
            const hasIn = await this.prisma.attendance.findFirst({
                where: {
                    tenantId,
                    employeeId: outRecord.employeeId,
                    type: client_1.AttendanceType.IN,
                    timestamp: {
                        gte: windowStart,
                        lt: outRecord.timestamp,
                    },
                },
            });
            if (!hasIn) {
                orphanOuts.push(outRecord);
            }
        }
        return orphanOuts;
    }
    async processOutRecord(tenantId, outRecord, detectionWindowMinutes) {
        const { employee, timestamp: outTimestamp } = outRecord;
        const isExcluded = await this.isEmployeeExcluded(tenantId, employee.id, outTimestamp);
        if (isExcluded) {
            return;
        }
        const outDate = new Date(outTimestamp);
        const startOfDay = new Date(Date.UTC(outDate.getUTCFullYear(), outDate.getUTCMonth(), outDate.getUTCDate()));
        const alreadyNotified = await this.prisma.absencePartialNotificationLog.findUnique({
            where: {
                tenantId_employeeId_sessionDate_missingType: {
                    tenantId,
                    employeeId: employee.user.id,
                    sessionDate: startOfDay,
                    missingType: 'IN',
                },
            },
        });
        if (alreadyNotified) {
            return;
        }
        const schedule = await this.getScheduleForDate(tenantId, employee.id, outDate);
        if (!schedule) {
            this.logger.debug(`Pas de schedule pour ${employee.user.firstName} ${employee.user.lastName}, skip`);
            return;
        }
        const manager = await this.getEmployeeManager(employee.id);
        if (!manager || !manager.email) {
            this.logger.warn(`Pas de manager avec email pour ${employee.user.firstName} ${employee.user.lastName}`);
            return;
        }
        this.logger.log(`[DEBUG] ${employee.user.firstName} ${employee.user.lastName} - ABSENCE_PARTIAL détectée! OUT sans IN. Envoi notification au manager ${manager.firstName} ${manager.lastName}`);
        await this.sendManagerNotification(tenantId, employee, manager, outTimestamp, schedule, startOfDay);
    }
    async getScheduleForDate(tenantId, employeeId, date) {
        const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        endOfDay.setUTCMilliseconds(-1);
        return this.prisma.schedule.findFirst({
            where: {
                tenantId,
                employeeId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'PUBLISHED',
            },
            include: {
                shift: true,
            },
        });
    }
    async isEmployeeExcluded(tenantId, employeeId, date) {
        const leave = await this.prisma.leave.findFirst({
            where: {
                tenantId,
                employeeId,
                status: client_1.LeaveStatus.APPROVED,
                startDate: { lte: date },
                endDate: { gte: date },
            },
        });
        if (leave) {
            return true;
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
    async sendManagerNotification(tenantId, employee, manager, outTimestamp, schedule, sessionDate) {
        const emailConfig = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyAbsencePartial) {
            this.logger.debug(`Notifications ABSENCE_PARTIAL désactivées pour tenant ${tenantId}, skip email`);
            return;
        }
        const template = await this.prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: 'ABSENCE_PARTIAL',
                },
            },
        });
        if (!template || !template.active) {
            this.logger.warn(`Template ABSENCE_PARTIAL non trouvé ou inactif pour tenant ${tenantId}`);
            return;
        }
        const shiftStart = schedule.customStartTime || schedule.shift.startTime;
        const outTime = outTimestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const [shiftHours, shiftMinutes] = shiftStart.split(':').map(Number);
        const shiftStartDate = new Date(sessionDate);
        shiftStartDate.setHours(shiftHours, shiftMinutes, 0, 0);
        const absenceMs = outTimestamp.getTime() - shiftStartDate.getTime();
        const absenceHours = Math.max(0, Math.round(absenceMs / (1000 * 60 * 60) * 10) / 10);
        const templateData = {
            managerName: `${manager.firstName} ${manager.lastName}`,
            employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
            sessionDate: sessionDate.toLocaleDateString('fr-FR'),
            shiftStart: shiftStart,
            actualIn: 'Non pointé',
            actualOut: outTime,
            absenceHours: absenceHours.toString(),
            missingType: 'IN',
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
            type: 'ABSENCE_PARTIAL',
            employeeId: employee.user.id,
            managerId: manager.id,
            templateId: template.id,
        }, tenantId);
        this.logger.log(`📧 Email ABSENCE_PARTIAL envoyé à ${manager.email} pour ${employee.user.firstName} ${employee.user.lastName}`);
        await this.prisma.absencePartialNotificationLog.create({
            data: {
                tenantId,
                employeeId: employee.user.id,
                managerId: manager.id,
                sessionDate,
                missingType: 'IN',
                outTimestamp,
            },
        });
        this.logger.log(`✅ Notification ABSENCE_PARTIAL enregistrée pour ${employee.user.firstName} ${employee.user.lastName}`);
    }
};
exports.AbsencePartialManagerNotificationJob = AbsencePartialManagerNotificationJob;
__decorate([
    (0, schedule_1.Cron)('*/30 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbsencePartialManagerNotificationJob.prototype, "handleAbsencePartialNotifications", null);
exports.AbsencePartialManagerNotificationJob = AbsencePartialManagerNotificationJob = AbsencePartialManagerNotificationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], AbsencePartialManagerNotificationJob);
//# sourceMappingURL=absence-partial-manager-notification.job.js.map