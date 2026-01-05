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
var MissingInManagerNotificationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingInManagerNotificationJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../../mail/mail.service");
let MissingInManagerNotificationJob = MissingInManagerNotificationJob_1 = class MissingInManagerNotificationJob {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(MissingInManagerNotificationJob_1.name);
    }
    async handleMissingInNotifications() {
        this.logger.log('🔍 Démarrage détection MISSING_IN pour notifications manager...');
        try {
            const tenants = await this.getActiveTenants();
            this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);
            for (const tenant of tenants) {
                try {
                    await this.processTenant(tenant.id);
                }
                catch (error) {
                    this.logger.error(`Erreur lors du traitement MISSING_IN pour tenant ${tenant.id}:`, error);
                }
            }
            this.logger.log('✅ Détection MISSING_IN terminée');
        }
        catch (error) {
            this.logger.error('Erreur critique dans le job MISSING_IN:', error);
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
                missingInDetectionWindowMinutes: true,
                missingInNotificationFrequencyMinutes: true,
                allowMissingInForRemoteWork: true,
                allowMissingInForMissions: true,
            },
        });
        if (!settings) {
            this.logger.warn(`Pas de settings pour tenant ${tenantId}, skip`);
            return;
        }
        const detectionWindowMinutes = settings.missingInDetectionWindowMinutes || 30;
        const scheduledEmployees = await this.getScheduledEmployeesToday(tenantId);
        this.logger.log(`Tenant ${tenantId}: ${scheduledEmployees.length} employé(s) schedulé(s) aujourd'hui`);
        for (const schedule of scheduledEmployees) {
            try {
                await this.processSchedule(tenantId, schedule, detectionWindowMinutes, settings);
            }
            catch (error) {
                this.logger.error(`Erreur traitement schedule ${schedule.id}:`, error);
            }
        }
    }
    async getScheduledEmployeesToday(tenantId) {
        const now = new Date();
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const endOfToday = new Date(startOfToday);
        endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
        endOfToday.setUTCMilliseconds(-1);
        return this.prisma.schedule.findMany({
            where: {
                tenantId,
                date: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                status: 'PUBLISHED',
                suspendedByLeaveId: null,
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
                shift: true,
            },
            orderBy: {
                shift: {
                    startTime: 'asc',
                },
            },
        });
    }
    async processSchedule(tenantId, schedule, detectionWindowMinutes, settings) {
        const { employee, shift } = schedule;
        if (!employee || !employee.user) {
            this.logger.warn(`Schedule ${schedule.id}: employé ou user manquant, skip`);
            return;
        }
        const today = new Date();
        const isExcluded = await this.isEmployeeExcluded(tenantId, employee.id, today, settings);
        if (isExcluded) {
            this.logger.debug(`[DEBUG] ${employee.user.firstName} ${employee.user.lastName} - Exclu (congé/mission/télétravail)`);
            return;
        }
        const shiftStartTime = this.parseTimeString(schedule.customStartTime || shift.startTime);
        const expectedStartTime = new Date();
        expectedStartTime.setHours(shiftStartTime.hours, shiftStartTime.minutes, 0, 0);
        const detectionThreshold = new Date(expectedStartTime.getTime() + detectionWindowMinutes * 60 * 1000);
        const now = new Date();
        if (now <= detectionThreshold) {
            this.logger.debug(`[DEBUG] ${employee.user.firstName} ${employee.user.lastName} - Trop tôt (now: ${now.toISOString()}, threshold: ${detectionThreshold.toISOString()})`);
            return;
        }
        const hasIn = await this.hasEmployeeCheckedInToday(tenantId, employee.id, expectedStartTime, detectionThreshold);
        if (hasIn) {
            this.logger.debug(`[DEBUG] ${employee.user.firstName} ${employee.user.lastName} - A fait son IN`);
            return;
        }
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const shiftStartString = schedule.customStartTime || shift.startTime;
        const alreadyNotified = await this.prisma.missingInNotificationLog.findUnique({
            where: {
                tenantId_employeeId_sessionDate_shiftStart: {
                    tenantId,
                    employeeId: employee.user.id,
                    sessionDate: startOfToday,
                    shiftStart: shiftStartString,
                },
            },
        });
        if (alreadyNotified) {
            this.logger.debug(`[DEBUG] ${employee.user.firstName} ${employee.user.lastName} - Déjà notifié pour shift ${shiftStartString}`);
            return;
        }
        const manager = await this.getEmployeeManager(employee.id);
        if (!manager || !manager.email) {
            this.logger.warn(`Pas de manager avec email pour ${employee.user.firstName} ${employee.user.lastName}`);
            return;
        }
        this.logger.log(`[DEBUG] ${employee.user.firstName} ${employee.user.lastName} - MISSING_IN détecté! Envoi notification au manager ${manager.firstName} ${manager.lastName}`);
        await this.sendManagerNotification(tenantId, employee, manager, shift, schedule, startOfToday);
    }
    async hasEmployeeCheckedInToday(tenantId, employeeId, expectedStart, detectionThreshold) {
        const inRecord = await this.prisma.attendance.findFirst({
            where: {
                tenantId,
                employeeId,
                type: client_1.AttendanceType.IN,
                timestamp: {
                    gte: new Date(expectedStart.getTime() - 60 * 60 * 1000),
                    lte: new Date(),
                },
            },
        });
        return !!inRecord;
    }
    async isEmployeeExcluded(tenantId, employeeId, date, settings) {
        const leave = await this.prisma.leave.findFirst({
            where: {
                tenantId,
                employeeId,
                status: client_1.LeaveStatus.APPROVED,
                startDate: { lte: date },
                endDate: { gte: date },
            },
            include: {
                leaveType: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });
        if (leave) {
            const leaveTypeCode = leave.leaveType?.code?.toUpperCase() || '';
            const leaveTypeName = leave.leaveType?.name?.toUpperCase() || '';
            const isTeletravail = leaveTypeCode.includes('TELETRAVAIL') ||
                leaveTypeCode.includes('REMOTE') ||
                leaveTypeName.includes('TÉLÉTRAVAIL') ||
                leaveTypeName.includes('TELETRAVAIL') ||
                leaveTypeName.includes('REMOTE');
            if (isTeletravail) {
                return settings?.allowMissingInForRemoteWork !== false;
            }
            const isMission = leaveTypeCode.includes('MISSION') ||
                leaveTypeName.includes('MISSION') ||
                leaveTypeName.includes('DÉPLACEMENT');
            if (isMission) {
                return settings?.allowMissingInForMissions !== false;
            }
            return true;
        }
        return false;
    }
    parseTimeString(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return { hours: hours || 0, minutes: minutes || 0 };
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
    async sendManagerNotification(tenantId, employee, manager, shift, schedule, sessionDate) {
        const emailConfig = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyMissingIn) {
            this.logger.debug(`Notifications MISSING_IN désactivées pour tenant ${tenantId}, skip email`);
            return;
        }
        const template = await this.prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: 'MISSING_IN',
                },
            },
        });
        if (!template || !template.active) {
            this.logger.warn(`Template MISSING_IN non trouvé ou inactif pour tenant ${tenantId}`);
            return;
        }
        const shiftStart = schedule.customStartTime || shift.startTime;
        const templateData = {
            managerName: `${manager.firstName} ${manager.lastName}`,
            employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
            sessionDate: sessionDate.toLocaleDateString('fr-FR'),
            shiftStart,
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
            type: 'MISSING_IN',
            employeeId: employee.user.id,
            managerId: manager.id,
            templateId: template.id,
        }, tenantId);
        this.logger.log(`📧 Email MISSING_IN envoyé à ${manager.email} pour ${employee.user.firstName} ${employee.user.lastName}`);
        await this.prisma.missingInNotificationLog.create({
            data: {
                tenantId,
                employeeId: employee.user.id,
                managerId: manager.id,
                sessionDate,
                shiftStart,
            },
        });
        this.logger.log(`✅ Notification MISSING_IN enregistrée pour ${employee.user.firstName} ${employee.user.lastName}`);
    }
};
exports.MissingInManagerNotificationJob = MissingInManagerNotificationJob;
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MissingInManagerNotificationJob.prototype, "handleMissingInNotifications", null);
exports.MissingInManagerNotificationJob = MissingInManagerNotificationJob = MissingInManagerNotificationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], MissingInManagerNotificationJob);
//# sourceMappingURL=missing-in-manager-notification.job.js.map