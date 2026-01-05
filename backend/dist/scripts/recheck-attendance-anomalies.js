"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config({ path: '.env' });
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔍 Re-vérification des anomalies de pointage avec les nouvelles règles...\n');
    console.log('📋 Ce script détecte les anomalies pour les weekends si requireScheduleForAttendance est activé\n');
    try {
        const tenants = await prisma.tenant.findMany();
        if (tenants.length === 0) {
            console.error('❌ Aucun tenant trouvé');
            return;
        }
        let totalProcessed = 0;
        let totalAnomaliesDetected = 0;
        let totalAnomaliesUpdated = 0;
        for (const tenant of tenants) {
            console.log(`\n📋 Traitement du tenant: ${tenant.companyName} (${tenant.id})\n`);
            const settings = await prisma.tenantSettings.findUnique({
                where: { tenantId: tenant.id },
                select: {
                    workingDays: true,
                    requireScheduleForAttendance: true,
                },
            });
            const requireSchedule = settings?.requireScheduleForAttendance ?? true;
            const workingDays = settings?.workingDays || [1, 2, 3, 4, 5, 6];
            console.log(`⚙️  Paramètres du tenant:`);
            console.log(`   - requireScheduleForAttendance: ${requireSchedule}`);
            console.log(`   - Jours ouvrables: ${workingDays.join(', ')}\n`);
            const employees = await prisma.employee.findMany({
                where: { tenantId: tenant.id },
            });
            console.log(`✅ ${employees.length} employés trouvés\n`);
            for (const employee of employees) {
                const attendances = await prisma.attendance.findMany({
                    where: {
                        tenantId: tenant.id,
                        employeeId: employee.id,
                        isCorrected: false,
                    },
                    orderBy: { timestamp: 'asc' },
                });
                if (attendances.length === 0)
                    continue;
                console.log(`   👤 ${employee.firstName} ${employee.lastName} (${employee.matricule}): ${attendances.length} pointages à vérifier`);
                for (const attendance of attendances) {
                    totalProcessed++;
                    const anomaly = await detectAnomalyForRecord(tenant.id, employee.id, attendance, requireSchedule, workingDays);
                    if (anomaly.hasAnomaly) {
                        totalAnomaliesDetected++;
                        const needsUpdate = !attendance.hasAnomaly ||
                            attendance.anomalyType !== anomaly.type ||
                            attendance.anomalyNote !== anomaly.note;
                        if (needsUpdate) {
                            await prisma.attendance.update({
                                where: { id: attendance.id },
                                data: {
                                    hasAnomaly: true,
                                    anomalyType: anomaly.type,
                                    anomalyNote: anomaly.note,
                                },
                            });
                            totalAnomaliesUpdated++;
                            console.log(`      ⚠️  Anomalie détectée/mise à jour: ${anomaly.type} - ${anomaly.note?.substring(0, 80)}...`);
                        }
                    }
                    else if (attendance.hasAnomaly) {
                        await prisma.attendance.update({
                            where: { id: attendance.id },
                            data: {
                                hasAnomaly: false,
                                anomalyType: null,
                                anomalyNote: null,
                            },
                        });
                        console.log(`      ✅ Anomalie supprimée (plus valide)`);
                    }
                }
            }
            console.log(`\n✅ Tenant ${tenant.companyName} traité\n`);
        }
        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ:');
        console.log(`   - Pointages traités: ${totalProcessed}`);
        console.log(`   - Anomalies détectées: ${totalAnomaliesDetected}`);
        console.log(`   - Anomalies mises à jour: ${totalAnomaliesUpdated}`);
        console.log('='.repeat(60));
        console.log('\n✅ Re-vérification terminée avec succès!\n');
    }
    catch (error) {
        console.error('❌ Erreur lors de la re-vérification:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
async function detectAnomalyForRecord(tenantId, employeeId, attendance, requireSchedule, workingDays) {
    const timestamp = new Date(attendance.timestamp);
    const type = attendance.type;
    const startOfDay = new Date(timestamp);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(timestamp);
    endOfDay.setHours(23, 59, 59, 999);
    const todayRecords = await prisma.attendance.findMany({
        where: {
            tenantId,
            employeeId,
            timestamp: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { timestamp: 'asc' },
    });
    if (type === client_1.AttendanceType.IN) {
        const inRecords = todayRecords.filter(r => r.type === client_1.AttendanceType.IN);
        if (inRecords.length > 1) {
            const firstIn = inRecords[0];
            if (attendance.id !== firstIn.id) {
                return {
                    hasAnomaly: true,
                    type: 'DOUBLE_IN',
                    note: 'Double pointage d\'entrée détecté',
                };
            }
        }
    }
    if (type === client_1.AttendanceType.OUT) {
        const inRecords = todayRecords.filter(r => r.type === client_1.AttendanceType.IN);
        if (inRecords.length === 0) {
            const yesterday = new Date(timestamp);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStart = new Date(yesterday);
            yesterdayStart.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date(yesterday);
            yesterdayEnd.setHours(23, 59, 59, 999);
            const yesterdayIn = await prisma.attendance.findFirst({
                where: {
                    tenantId,
                    employeeId,
                    type: client_1.AttendanceType.IN,
                    timestamp: { gte: yesterdayStart, lte: yesterdayEnd },
                },
            });
            if (!yesterdayIn) {
                return {
                    hasAnomaly: true,
                    type: 'MISSING_IN',
                    note: 'Pointage de sortie sans entrée correspondante',
                };
            }
        }
    }
    if (type === client_1.AttendanceType.IN) {
        const outRecords = todayRecords.filter(r => r.type === client_1.AttendanceType.OUT);
    }
    if (type === client_1.AttendanceType.IN) {
        const schedule = await getScheduleWithFallback(tenantId, employeeId, timestamp);
        if (schedule && schedule.id !== 'virtual' && schedule.status !== 'PUBLISHED') {
            const leave = await prisma.leave.findFirst({
                where: {
                    tenantId,
                    employeeId,
                    startDate: { lte: timestamp },
                    endDate: { gte: timestamp },
                    status: { in: ['APPROVED', 'MANAGER_APPROVED', 'HR_APPROVED'] },
                },
            });
            if (!leave) {
                return {
                    hasAnomaly: true,
                    type: 'ABSENCE_TECHNICAL',
                    note: `Absence technique : planning ${schedule.status.toLowerCase()}`,
                };
            }
        }
        if (schedule?.shift && (schedule.id === 'virtual' || schedule.status === 'PUBLISHED')) {
            const expectedStartTime = parseTimeString(schedule.customStartTime || schedule.shift.startTime);
            const expectedStart = new Date(timestamp);
            expectedStart.setHours(expectedStartTime.hours, expectedStartTime.minutes, 0, 0);
            const settings = await prisma.tenantSettings.findUnique({
                where: { tenantId },
                select: {
                    lateToleranceEntry: true,
                    absencePartialThreshold: true,
                },
            });
            const toleranceMinutes = settings?.lateToleranceEntry || 10;
            const absenceThreshold = settings?.absencePartialThreshold || 2;
            const lateHours = (timestamp.getTime() - expectedStart.getTime()) / (1000 * 60 * 60);
            const lateMinutes = (timestamp.getTime() - expectedStart.getTime()) / (1000 * 60);
            if (lateHours >= absenceThreshold) {
                return {
                    hasAnomaly: true,
                    type: 'ABSENCE_PARTIAL',
                    note: `Absence partielle détectée : arrivée ${lateHours.toFixed(1)}h après l'heure prévue`,
                };
            }
            if (lateMinutes > toleranceMinutes) {
                return {
                    hasAnomaly: true,
                    type: 'LATE',
                    note: `Retard de ${Math.round(lateMinutes)} minutes détecté`,
                };
            }
        }
        else if (!schedule) {
            const dayOfWeek = timestamp.getDay();
            const normalizedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
            const isWorkingDay = workingDays.includes(normalizedDayOfWeek);
            const shouldCheck = requireSchedule || isWorkingDay;
            if (shouldCheck) {
                const leave = await prisma.leave.findFirst({
                    where: {
                        tenantId,
                        employeeId,
                        startDate: { lte: timestamp },
                        endDate: { gte: timestamp },
                        status: { in: ['APPROVED', 'MANAGER_APPROVED', 'HR_APPROVED'] },
                    },
                });
                const recoveryDay = await prisma.recoveryDay.findFirst({
                    where: {
                        tenantId,
                        employeeId,
                        startDate: { lte: timestamp },
                        endDate: { gte: timestamp },
                        status: { in: ['APPROVED', 'PENDING'] },
                    },
                });
                if (!leave && !recoveryDay) {
                    const employee = await prisma.employee.findUnique({
                        where: { id: employeeId },
                        select: { firstName: true, lastName: true, matricule: true },
                    });
                    const employeeName = employee
                        ? `${employee.firstName} ${employee.lastName} (${employee.matricule})`
                        : `l'employé ${employeeId}`;
                    const dayType = isWorkingDay ? 'jour ouvrable' : 'weekend';
                    return {
                        hasAnomaly: true,
                        type: 'UNPLANNED_PUNCH',
                        note: `Pointage non planifié pour ${employeeName} le ${timestamp.toLocaleDateString('fr-FR')} (${dayType}) : ` +
                            `aucun planning publié, aucun shift par défaut assigné, et aucun congé/récupération approuvé. ` +
                            `Veuillez créer un planning ou assigner un shift par défaut.`,
                    };
                }
            }
        }
    }
    if (type === client_1.AttendanceType.OUT) {
        const schedule = await getScheduleWithFallback(tenantId, employeeId, timestamp);
        if (schedule?.shift && (schedule.id === 'virtual' || schedule.status === 'PUBLISHED')) {
            const expectedEndTime = parseTimeString(schedule.customEndTime || schedule.shift.endTime);
            const expectedEnd = new Date(timestamp);
            expectedEnd.setHours(expectedEndTime.hours, expectedEndTime.minutes, 0, 0);
            const settings = await prisma.tenantSettings.findUnique({
                where: { tenantId },
                select: { earlyToleranceExit: true },
            });
            const toleranceMinutes = settings?.earlyToleranceExit || 5;
            const earlyLeaveMinutes = (expectedEnd.getTime() - timestamp.getTime()) / (1000 * 60);
            if (earlyLeaveMinutes > toleranceMinutes) {
                return {
                    hasAnomaly: true,
                    type: 'EARLY_LEAVE',
                    note: `Départ anticipé de ${Math.round(earlyLeaveMinutes)} minutes détecté`,
                };
            }
        }
        else if (!schedule) {
            const dayOfWeek = timestamp.getDay();
            const normalizedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
            const isWorkingDay = workingDays.includes(normalizedDayOfWeek);
            const shouldCheck = requireSchedule || isWorkingDay;
            if (shouldCheck) {
                const leave = await prisma.leave.findFirst({
                    where: {
                        tenantId,
                        employeeId,
                        startDate: { lte: timestamp },
                        endDate: { gte: timestamp },
                        status: { in: ['APPROVED', 'MANAGER_APPROVED', 'HR_APPROVED'] },
                    },
                });
                const recoveryDay = await prisma.recoveryDay.findFirst({
                    where: {
                        tenantId,
                        employeeId,
                        startDate: { lte: timestamp },
                        endDate: { gte: timestamp },
                        status: { in: ['APPROVED', 'PENDING'] },
                    },
                });
                if (!leave && !recoveryDay) {
                    const employee = await prisma.employee.findUnique({
                        where: { id: employeeId },
                        select: { firstName: true, lastName: true, matricule: true },
                    });
                    const employeeName = employee
                        ? `${employee.firstName} ${employee.lastName} (${employee.matricule})`
                        : `l'employé ${employeeId}`;
                    const dayType = isWorkingDay ? 'jour ouvrable' : 'weekend';
                    return {
                        hasAnomaly: true,
                        type: 'UNPLANNED_PUNCH',
                        note: `Pointage non planifié pour ${employeeName} le ${timestamp.toLocaleDateString('fr-FR')} (${dayType}) : ` +
                            `aucun planning publié, aucun shift par défaut assigné, et aucun congé/récupération approuvé. ` +
                            `Veuillez créer un planning ou assigner un shift par défaut.`,
                    };
                }
            }
        }
    }
    return { hasAnomaly: false };
}
async function getScheduleWithFallback(tenantId, employeeId, timestamp) {
    const dateOnly = new Date(timestamp);
    dateOnly.setHours(0, 0, 0, 0);
    const schedule = await prisma.schedule.findFirst({
        where: {
            tenantId,
            employeeId,
            date: dateOnly,
            status: 'PUBLISHED',
        },
        include: {
            shift: true,
        },
    });
    if (schedule) {
        return schedule;
    }
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { currentShiftId: true },
    });
    if (employee?.currentShiftId) {
        const shift = await prisma.shift.findUnique({
            where: { id: employee.currentShiftId },
        });
        if (shift) {
            return {
                id: 'virtual',
                status: 'PUBLISHED',
                shift: shift,
                customStartTime: null,
                customEndTime: null,
            };
        }
    }
    return null;
}
function parseTimeString(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=recheck-attendance-anomalies.js.map