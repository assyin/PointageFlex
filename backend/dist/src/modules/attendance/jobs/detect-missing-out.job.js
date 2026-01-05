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
var DetectMissingOutJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectMissingOutJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let DetectMissingOutJob = DetectMissingOutJob_1 = class DetectMissingOutJob {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DetectMissingOutJob_1.name);
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
    async detectMissingOuts() {
        this.logger.log('Démarrage de la détection des MISSING_OUT...');
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            const tenants = await this.prisma.tenant.findMany({
                include: {
                    settings: true,
                },
            });
            this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);
            for (const tenant of tenants) {
                try {
                    await this.detectMissingOutsForTenant(tenant.id, yesterday, endOfYesterday);
                }
                catch (error) {
                    this.logger.error(`Erreur lors de la détection des MISSING_OUT pour le tenant ${tenant.id}:`, error);
                }
            }
            this.logger.log('Détection des MISSING_OUT terminée avec succès');
        }
        catch (error) {
            this.logger.error('Erreur lors de la détection des MISSING_OUT:', error);
        }
    }
    async detectMissingOutsForTenant(tenantId, startDate, endDate) {
        const settings = await this.prisma.tenantSettings.findUnique({
            where: { tenantId },
            select: {
                missingOutDetectionWindow: true,
            },
        });
        const detectionWindowHours = settings?.missingOutDetectionWindow || 12;
        const inRecords = await this.prisma.attendance.findMany({
            where: {
                tenantId,
                type: client_1.AttendanceType.IN,
                timestamp: { gte: startDate, lte: endDate },
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        matricule: true,
                    },
                },
            },
            orderBy: { timestamp: 'asc' },
        });
        this.logger.log(`Analyse de ${inRecords.length} pointage(s) IN pour le tenant ${tenantId}...`);
        let missingOutCount = 0;
        for (const inRecord of inRecords) {
            try {
                const startOfDay = new Date(inRecord.timestamp);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(inRecord.timestamp);
                endOfDay.setHours(23, 59, 59, 999);
                const schedules = await this.prisma.schedule.findMany({
                    where: {
                        tenantId,
                        employeeId: inRecord.employeeId,
                        date: { gte: startOfDay, lte: endOfDay },
                        status: 'PUBLISHED',
                    },
                    include: {
                        shift: {
                            select: {
                                id: true,
                                startTime: true,
                                endTime: true,
                            },
                        },
                    },
                    orderBy: {
                        shift: {
                            startTime: 'asc',
                        },
                    },
                });
                let schedule = null;
                if (schedules.length > 0) {
                    if (schedules.length === 1) {
                        schedule = schedules[0];
                    }
                    else {
                        const inHour = inRecord.timestamp.getUTCHours();
                        const inMinutes = inRecord.timestamp.getUTCMinutes();
                        const inTimeInMinutes = inHour * 60 + inMinutes;
                        let closestSchedule = schedules[0];
                        let smallestDifference = Infinity;
                        const tenant = await this.prisma.tenant.findUnique({
                            where: { id: tenantId },
                            select: { timezone: true },
                        });
                        const timezoneOffset = this.getTimezoneOffset(tenant?.timezone || 'UTC', inRecord.timestamp);
                        for (const sched of schedules) {
                            const startTime = this.parseTimeString(sched.customStartTime || sched.shift.startTime);
                            const shiftStartInMinutesLocal = startTime.hours * 60 + startTime.minutes;
                            const shiftStartInMinutesUTC = shiftStartInMinutesLocal - (timezoneOffset * 60);
                            const difference = Math.abs(inTimeInMinutes - shiftStartInMinutesUTC);
                            if (difference < smallestDifference) {
                                smallestDifference = difference;
                                closestSchedule = sched;
                            }
                        }
                        schedule = closestSchedule;
                    }
                }
                let shift = schedule?.shift;
                if (!shift) {
                    const employee = await this.prisma.employee.findUnique({
                        where: { id: inRecord.employeeId },
                        include: {
                            currentShift: {
                                select: {
                                    id: true,
                                    startTime: true,
                                    endTime: true,
                                },
                            },
                        },
                    });
                    shift = employee?.currentShift || null;
                }
                let detectionWindowEnd;
                if (shift) {
                    const expectedEndTime = this.parseTimeString(schedule?.customEndTime || shift.endTime);
                    detectionWindowEnd = new Date(Date.UTC(inRecord.timestamp.getFullYear(), inRecord.timestamp.getMonth(), inRecord.timestamp.getDate(), expectedEndTime.hours, expectedEndTime.minutes, 0, 0));
                    const startTime = this.parseTimeString(schedule?.customStartTime || shift.startTime);
                    const isNightShift = startTime.hours >= 20 || expectedEndTime.hours <= 8;
                    if (isNightShift) {
                        detectionWindowEnd.setUTCDate(detectionWindowEnd.getUTCDate() + 1);
                        detectionWindowEnd.setUTCHours(12, 0, 0, 0);
                    }
                    else {
                        detectionWindowEnd.setTime(detectionWindowEnd.getTime() + detectionWindowHours * 60 * 60 * 1000);
                    }
                }
                else {
                    detectionWindowEnd = new Date(inRecord.timestamp);
                    detectionWindowEnd.setTime(detectionWindowEnd.getTime() + detectionWindowHours * 60 * 60 * 1000);
                }
                if (new Date() < detectionWindowEnd) {
                    continue;
                }
                const correspondingOut = await this.prisma.attendance.findFirst({
                    where: {
                        tenantId,
                        employeeId: inRecord.employeeId,
                        type: client_1.AttendanceType.OUT,
                        timestamp: {
                            gte: inRecord.timestamp,
                            lte: detectionWindowEnd,
                        },
                    },
                    orderBy: { timestamp: 'asc' },
                });
                if (!correspondingOut) {
                    const existingAnomaly = await this.prisma.attendance.findFirst({
                        where: {
                            id: inRecord.id,
                            hasAnomaly: true,
                            anomalyType: 'MISSING_OUT',
                        },
                    });
                    if (!existingAnomaly) {
                        await this.prisma.attendance.update({
                            where: { id: inRecord.id },
                            data: {
                                hasAnomaly: true,
                                anomalyType: 'MISSING_OUT',
                                anomalyNote: `Session ouverte depuis ${Math.round((new Date().getTime() - inRecord.timestamp.getTime()) / (1000 * 60 * 60))}h sans sortie correspondante (détecté par job batch)`,
                            },
                        });
                        missingOutCount++;
                        this.logger.warn(`MISSING_OUT détecté pour ${inRecord.employee.firstName} ${inRecord.employee.lastName} (${inRecord.employee.matricule}) - IN à ${inRecord.timestamp.toLocaleString('fr-FR')}`);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Erreur lors de la vérification du pointage IN ${inRecord.id}:`, error);
            }
        }
        if (missingOutCount > 0) {
            this.logger.warn(`✅ ${missingOutCount} MISSING_OUT détecté(s) pour le tenant ${tenantId}`);
        }
        else {
            this.logger.log(`✅ Aucun MISSING_OUT détecté pour le tenant ${tenantId}`);
        }
    }
};
exports.DetectMissingOutJob = DetectMissingOutJob;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DetectMissingOutJob.prototype, "detectMissingOuts", null);
exports.DetectMissingOutJob = DetectMissingOutJob = DetectMissingOutJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DetectMissingOutJob);
//# sourceMappingURL=detect-missing-out.job.js.map