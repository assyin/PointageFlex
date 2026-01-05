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
var MissingOutManagerNotificationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingOutManagerNotificationJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../../mail/mail.service");
let MissingOutManagerNotificationJob = MissingOutManagerNotificationJob_1 = class MissingOutManagerNotificationJob {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(MissingOutManagerNotificationJob_1.name);
    }
    async handleMissingOutNotifications() {
        this.logger.log('🔍 Démarrage détection MISSING_OUT pour notifications manager...');
        try {
            const tenants = await this.getActiveTenants();
            this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);
            for (const tenant of tenants) {
                try {
                    await this.processTenant(tenant.id);
                }
                catch (error) {
                    this.logger.error(`Erreur lors du traitement MISSING_OUT pour tenant ${tenant.id}:`, error);
                }
            }
            this.logger.log('✅ Détection MISSING_OUT terminée');
        }
        catch (error) {
            this.logger.error('Erreur critique dans le job MISSING_OUT:', error);
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
                missingOutDetectionWindowMinutes: true,
                missingOutNotificationFrequencyMinutes: true,
                allowMissingOutForRemoteWork: true,
                allowMissingOutForMissions: true,
            },
        });
        if (!settings) {
            this.logger.warn(`Pas de settings pour tenant ${tenantId}, skip`);
            return;
        }
        const detectionWindowMinutes = settings.missingOutDetectionWindowMinutes || 120;
        const openSessions = await this.getOpenSessions(tenantId);
        this.logger.log(`Tenant ${tenantId}: ${openSessions.length} session(s) ouverte(s) à analyser`);
        for (const session of openSessions) {
            try {
                await this.processSession(tenantId, session, detectionWindowMinutes, settings);
            }
            catch (error) {
                this.logger.error(`Erreur traitement session ${session.id}:`, error);
            }
        }
    }
    async getOpenSessions(tenantId) {
        const now = new Date();
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const endOfToday = new Date(startOfToday);
        endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
        endOfToday.setUTCMilliseconds(-1);
        const inRecords = await this.prisma.attendance.findMany({
            where: {
                tenantId,
                type: client_1.AttendanceType.IN,
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
        const openSessions = [];
        for (const inRecord of inRecords) {
            const hasOut = await this.prisma.attendance.findFirst({
                where: {
                    tenantId,
                    employeeId: inRecord.employeeId,
                    type: client_1.AttendanceType.OUT,
                    timestamp: {
                        gte: inRecord.timestamp,
                        lte: endOfToday,
                    },
                },
            });
            if (!hasOut) {
                openSessions.push(inRecord);
            }
        }
        return openSessions;
    }
    async processSession(tenantId, session, detectionWindowMinutes, settings) {
        const { employee, timestamp: inTimestamp } = session;
        if (!employee || !employee.user) {
            this.logger.warn(`Session ${session.id}: employé ou user manquant, skip`);
            return;
        }
        const isExcluded = await this.isEmployeeExcluded(tenantId, employee.id, inTimestamp, settings);
        if (isExcluded) {
            return;
        }
        const schedule = await this.getScheduleWithFallback(tenantId, employee.id, inTimestamp);
        if (!schedule) {
            this.logger.warn(`Pas de schedule trouvé pour ${employee.user.firstName} ${employee.user.lastName}, skip`);
            return;
        }
        const detectionThreshold = this.calculateDetectionThreshold(inTimestamp, schedule, detectionWindowMinutes);
        const now = new Date();
        if (now <= detectionThreshold) {
            return;
        }
        const inDate = new Date(inTimestamp);
        const startOfToday = new Date(Date.UTC(inDate.getUTCFullYear(), inDate.getUTCMonth(), inDate.getUTCDate()));
        const shiftEndString = schedule.customEndTime || schedule.shift.endTime;
        const alreadyNotified = await this.prisma.missingOutNotificationLog.findUnique({
            where: {
                tenantId_employeeId_sessionDate_shiftEnd: {
                    tenantId,
                    employeeId: employee.user.id,
                    sessionDate: startOfToday,
                    shiftEnd: shiftEndString,
                },
            },
        });
        if (alreadyNotified) {
            return;
        }
        const manager = await this.getEmployeeManager(employee.id);
        if (!manager || !manager.email) {
            this.logger.warn(`Pas de manager avec email pour ${employee.user.firstName} ${employee.user.lastName}`);
            return;
        }
        await this.sendManagerNotification(tenantId, employee, manager, inTimestamp, schedule, startOfToday);
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
                return settings?.allowMissingOutForRemoteWork !== false;
            }
            const isMission = leaveTypeCode.includes('MISSION') ||
                leaveTypeName.includes('MISSION') ||
                leaveTypeName.includes('DÉPLACEMENT');
            if (isMission) {
                return settings?.allowMissingOutForMissions !== false;
            }
            return true;
        }
        return false;
    }
    async getScheduleWithFallback(tenantId, employeeId, inTimestamp) {
        const inDate = new Date(inTimestamp);
        const startOfDay = new Date(Date.UTC(inDate.getUTCFullYear(), inDate.getUTCMonth(), inDate.getUTCDate()));
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        endOfDay.setUTCMilliseconds(-1);
        const schedules = await this.prisma.schedule.findMany({
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
            orderBy: {
                shift: {
                    startTime: 'asc',
                },
            },
        });
        if (schedules.length === 0) {
            return null;
        }
        if (schedules.length === 1) {
            return schedules[0];
        }
        const inHour = inTimestamp.getUTCHours();
        const inMinutes = inTimestamp.getUTCMinutes();
        const inTimeInMinutes = inHour * 60 + inMinutes;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { timezone: true },
        });
        const timezoneOffset = this.getTimezoneOffset(tenant?.timezone || 'UTC', inTimestamp);
        let closestSchedule = schedules[0];
        let smallestDifference = Infinity;
        for (const schedule of schedules) {
            const startTime = this.parseTimeString(schedule.customStartTime || schedule.shift.startTime);
            const shiftStartInMinutes = startTime.hours * 60 + startTime.minutes;
            const shiftStartInMinutesUTC = shiftStartInMinutes - (timezoneOffset * 60);
            const difference = Math.abs(inTimeInMinutes - shiftStartInMinutesUTC);
            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestSchedule = schedule;
            }
        }
        return closestSchedule;
    }
    calculateDetectionThreshold(inTimestamp, schedule, detectionWindowMinutes) {
        const shiftEndTime = this.parseTimeString(schedule.customEndTime || schedule.shift.endTime);
        const shiftEnd = new Date(Date.UTC(inTimestamp.getUTCFullYear(), inTimestamp.getUTCMonth(), inTimestamp.getUTCDate(), shiftEndTime.hours, shiftEndTime.minutes, 0, 0));
        const threshold = new Date(shiftEnd.getTime() + detectionWindowMinutes * 60 * 1000);
        const shiftStartTime = this.parseTimeString(schedule.customStartTime || schedule.shift.startTime);
        const isNightShift = this.isNightShift(shiftStartTime, shiftEndTime);
        if (isNightShift) {
            const nextDayNoon = new Date(inTimestamp);
            nextDayNoon.setUTCDate(nextDayNoon.getUTCDate() + 1);
            nextDayNoon.setUTCHours(12, 0, 0, 0);
            return new Date(Math.max(threshold.getTime(), nextDayNoon.getTime()));
        }
        return threshold;
    }
    isNightShift(startTime, endTime) {
        const startMinutes = startTime.hours * 60 + startTime.minutes;
        const endMinutes = endTime.hours * 60 + endTime.minutes;
        if (startMinutes > endMinutes) {
            return true;
        }
        if (startTime.hours >= 20) {
            return true;
        }
        if (endTime.hours <= 8 && endTime.hours > 0 && startTime.hours >= 18) {
            return true;
        }
        const nightPeriodStart = 22 * 60;
        const nightPeriodEnd = 6 * 60;
        let nightMinutes = 0;
        let totalMinutes = 0;
        if (startMinutes <= endMinutes) {
            totalMinutes = endMinutes - startMinutes;
            if (endMinutes > nightPeriodStart) {
                nightMinutes += Math.min(endMinutes, 24 * 60) - Math.max(startMinutes, nightPeriodStart);
            }
            if (startMinutes < nightPeriodEnd) {
                nightMinutes += Math.min(endMinutes, nightPeriodEnd) - startMinutes;
            }
        }
        else {
            totalMinutes = (24 * 60 - startMinutes) + endMinutes;
            if (startMinutes < 24 * 60) {
                nightMinutes += 24 * 60 - Math.max(startMinutes, nightPeriodStart);
            }
            nightMinutes += Math.min(endMinutes, nightPeriodEnd);
        }
        return totalMinutes > 0 && (nightMinutes / totalMinutes) >= 0.5;
    }
    parseTimeString(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return { hours: hours || 0, minutes: minutes || 0 };
    }
    getTimezoneOffset(timezone, referenceDate) {
        if (!timezone || timezone === 'UTC') {
            return 0;
        }
        try {
            const date = referenceDate || new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                hourCycle: 'h23',
                timeZoneName: 'shortOffset',
            });
            const parts = formatter.formatToParts(date);
            const offsetPart = parts.find(p => p.type === 'timeZoneName');
            if (offsetPart?.value) {
                const match = offsetPart.value.match(/GMT([+-]?)(\d+)(?::(\d+))?/);
                if (match) {
                    const sign = match[1] === '-' ? -1 : 1;
                    const hours = parseInt(match[2], 10);
                    const minutes = parseInt(match[3] || '0', 10);
                    return sign * (hours + minutes / 60);
                }
            }
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
            const diffMs = tzDate.getTime() - utcDate.getTime();
            return Math.round((diffMs / (1000 * 60 * 60)) * 2) / 2;
        }
        catch (error) {
            this.logger.warn(`Timezone invalide: ${timezone}, utilisant UTC`);
            return 0;
        }
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
    async sendManagerNotification(tenantId, employee, manager, inTimestamp, schedule, sessionDate) {
        const emailConfig = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyMissingOut) {
            this.logger.debug(`Notifications MISSING_OUT désactivées pour tenant ${tenantId}, skip email`);
            return;
        }
        const template = await this.prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: 'MISSING_OUT',
                },
            },
        });
        if (!template || !template.active) {
            this.logger.warn(`Template MISSING_OUT non trouvé ou inactif pour tenant ${tenantId}`);
            return;
        }
        const shiftEnd = schedule.customEndTime || schedule.shift.endTime;
        const templateData = {
            managerName: `${manager.firstName} ${manager.lastName}`,
            employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
            sessionDate: sessionDate.toLocaleDateString('fr-FR'),
            inTime: inTimestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            shiftEnd,
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
            type: 'MISSING_OUT',
            employeeId: employee.user.id,
            managerId: manager.id,
            templateId: template.id,
        }, tenantId);
        this.logger.log(`📧 Email MISSING_OUT envoyé à ${manager.email} pour ${employee.user.firstName} ${employee.user.lastName}`);
        await this.prisma.missingOutNotificationLog.create({
            data: {
                tenantId,
                employeeId: employee.user.id,
                managerId: manager.id,
                sessionDate,
                inTimestamp,
                shiftEnd,
            },
        });
        this.logger.log(`✅ Notification MISSING_OUT enregistrée pour ${employee.user.firstName} ${employee.user.lastName}`);
    }
};
exports.MissingOutManagerNotificationJob = MissingOutManagerNotificationJob;
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MissingOutManagerNotificationJob.prototype, "handleMissingOutNotifications", null);
exports.MissingOutManagerNotificationJob = MissingOutManagerNotificationJob = MissingOutManagerNotificationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], MissingOutManagerNotificationJob);
//# sourceMappingURL=missing-out-manager-notification.job.js.map