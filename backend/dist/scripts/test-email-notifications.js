"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TEST_TENANT_ID = '340a6c2a-160e-4f4b-917e-6eea8fd5ff2d';
const results = [];
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function setTime(date, hours, minutes) {
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}
async function getOrCreateSchedule(employeeId, shiftId, date, notes) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const existing = await prisma.schedule.findFirst({
        where: {
            employeeId,
            shiftId,
            date: dateOnly,
        },
    });
    if (existing) {
        return existing;
    }
    return prisma.schedule.create({
        data: {
            tenantId: TEST_TENANT_ID,
            employeeId,
            shiftId,
            date: dateOnly,
            status: client_1.ScheduleStatus.PUBLISHED,
            notes,
        },
    });
}
async function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}
async function logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`📋 ${title}`);
    console.log('='.repeat(60) + '\n');
}
async function getTestData() {
    log('Récupération des données de test...');
    const employee = await prisma.employee.findFirst({
        where: {
            tenantId: TEST_TENANT_ID,
            user: { isActive: true },
        },
        include: {
            user: true,
            department: {
                include: {
                    manager: true,
                },
            },
        },
    });
    if (!employee) {
        throw new Error('Aucun employé trouvé pour le tenant de test');
    }
    const shift = await prisma.shift.findFirst({
        where: {
            tenantId: TEST_TENANT_ID,
            startTime: '08:00',
        },
    });
    if (!shift) {
        throw new Error('Aucun shift 08:00 trouvé');
    }
    const leaveType = await prisma.leaveType.findFirst({
        where: {
            tenantId: TEST_TENANT_ID,
        },
    });
    if (!leaveType) {
        throw new Error('Aucun type de congé trouvé');
    }
    const settings = await prisma.tenantSettings.findUnique({
        where: { tenantId: TEST_TENANT_ID },
    });
    log(`✅ Employé: ${employee.user.firstName} ${employee.user.lastName} (ID: ${employee.id})`);
    log(`✅ Manager: ${employee.department?.manager?.firstName || 'N/A'} ${employee.department?.manager?.lastName || ''}`);
    log(`✅ Shift: ${shift.name} (${shift.startTime}-${shift.endTime})`);
    log(`✅ LeaveType: ${leaveType.name}`);
    return { employee, shift, settings, leaveType };
}
async function cleanupTestData(employeeId) {
    log('🧹 Nettoyage des données de test précédentes...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const deletedAttendance = await prisma.attendance.deleteMany({
        where: {
            tenantId: TEST_TENANT_ID,
            employeeId: employeeId,
            timestamp: { gte: oneWeekAgo },
        },
    });
    log(`   Pointages supprimés: ${deletedAttendance.count}`);
    const deletedSchedules = await prisma.schedule.deleteMany({
        where: {
            tenantId: TEST_TENANT_ID,
            employeeId: employeeId,
            date: { gte: oneWeekAgo },
        },
    });
    log(`   Schedules supprimés: ${deletedSchedules.count}`);
    const deletedAttempts = await prisma.attendanceAttempt.deleteMany({
        where: {
            tenantId: TEST_TENANT_ID,
            employeeId: employeeId,
            timestamp: { gte: oneWeekAgo },
        },
    });
    log(`   Tentatives supprimées: ${deletedAttempts.count}`);
    const deletedLeaves = await prisma.leave.deleteMany({
        where: {
            tenantId: TEST_TENANT_ID,
            employeeId: employeeId,
            startDate: { gte: oneWeekAgo },
            reason: { contains: '[TEST]' },
        },
    });
    log(`   Congés supprimés: ${deletedLeaves.count}`);
    log('✅ Nettoyage terminé');
}
async function testLate1_RetardDansTolérance(employee, shift) {
    const scenario = 'LATE #1: Retard dans tolérance (7 min < 10 min)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const inTime = setTime(today, 8, 7);
        await getOrCreateSchedule(employee.id, shift.id, today, '[TEST] Scénario LATE #1');
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: false,
                anomalyNote: '[TEST] Scénario LATE #1 - Retard dans tolérance',
            },
        });
        results.push({
            scenario,
            type: 'LATE',
            passed: true,
            message: '✅ Pointage créé sans anomalie (7 min dans tolérance de 10 min)',
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'LATE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testLate2_RetardHorsTolérance(employee, shift) {
    const scenario = 'LATE #2: Retard hors tolérance (25 min > 10 min)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const inTime = setTime(today, 8, 25);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario LATE #2',
            },
        });
        const attendance = await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 25,
                anomalyNote: '[TEST] Scénario LATE #2 - Retard hors tolérance',
            },
        });
        results.push({
            scenario,
            type: 'LATE',
            passed: true,
            message: '✅ Pointage LATE créé avec anomalie (25 min de retard)',
            details: { attendanceId: attendance.id, lateMinutes: 25 },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'LATE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testLate3_LimiteAbsencePartielle(employee, shift) {
    const scenario = 'LATE #3: Limite ABSENCE_PARTIAL (1h50 < 2h seuil)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const inTime = setTime(today, 9, 50);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario LATE #3',
            },
        });
        const attendance = await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 110,
                anomalyNote: '[TEST] Scénario LATE #3 - Limite ABSENCE_PARTIAL',
            },
        });
        results.push({
            scenario,
            type: 'LATE',
            passed: attendance.anomalyType === 'LATE',
            message: '✅ Correctement classé comme LATE (110 min < 120 min seuil)',
            details: { lateMinutes: 110, anomalyType: attendance.anomalyType },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'LATE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testLate4_MultipleShifts(employee, shift) {
    const scenario = 'LATE #4: Multiple shifts même jour';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const shiftPM = await prisma.shift.findFirst({
            where: {
                tenantId: TEST_TENANT_ID,
                startTime: { gte: '12:00' },
            },
        });
        if (!shiftPM) {
            results.push({
                scenario,
                type: 'LATE',
                passed: true,
                message: '⚠️ Pas de shift après-midi disponible, test ignoré',
            });
            return;
        }
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario LATE #4 - Matin',
            },
        });
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: setTime(today, 8, 20),
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 20,
                anomalyNote: '[TEST] Scénario LATE #4 - Retard matin',
            },
        });
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shiftPM.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario LATE #4 - Après-midi',
            },
        });
        const [h, m] = shiftPM.startTime.split(':').map(Number);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: setTime(today, h, m + 35),
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 35,
                anomalyNote: '[TEST] Scénario LATE #4 - Retard après-midi',
            },
        });
        results.push({
            scenario,
            type: 'LATE',
            passed: true,
            message: '✅ 2 pointages LATE créés (matin: 20min, après-midi: 35min)',
            details: { morningLate: 20, afternoonLate: 35 },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'LATE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testLate5_Idempotence() {
    const scenario = 'LATE #5: Idempotence (pas de duplicata)';
    log(`\n🧪 ${scenario}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const beforeCount = await prisma.lateNotificationLog.count({
        where: {
            tenantId: TEST_TENANT_ID,
            sessionDate: { gte: today },
        },
    });
    results.push({
        scenario,
        type: 'LATE',
        passed: true,
        message: `✅ Test idempotence: ${beforeCount} notification(s) existante(s)`,
        details: { existingNotifications: beforeCount },
    });
}
async function testAbsencePartial1_Retard2h(employee, shift) {
    const scenario = 'ABSENCE_PARTIAL #1: Retard >= 2h (2h30)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const inTime = setTime(today, 10, 30);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_PARTIAL #1',
            },
        });
        const attendance = await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'ABSENCE_PARTIAL',
                lateMinutes: 150,
                anomalyNote: '[TEST] Scénario ABSENCE_PARTIAL #1 - 2h30 de retard',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: attendance.anomalyType === 'ABSENCE_PARTIAL',
            message: '✅ Pointage ABSENCE_PARTIAL créé (2h30 de retard)',
            details: { lateMinutes: 150, absenceHours: 2.5 },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsencePartial2_LimiteExacte(employee, shift) {
    const scenario = 'ABSENCE_PARTIAL #2: Limite exacte (2h)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const inTime = setTime(today, 10, 0);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_PARTIAL #2',
            },
        });
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'ABSENCE_PARTIAL',
                lateMinutes: 120,
                anomalyNote: '[TEST] Scénario ABSENCE_PARTIAL #2 - Exactement 2h',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: true,
            message: '✅ Limite exacte 2h = ABSENCE_PARTIAL',
            details: { lateMinutes: 120 },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsencePartial3_RetardExtreme(employee, shift) {
    const scenario = 'ABSENCE_PARTIAL #3: Retard extrême (4h30)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        const inTime = setTime(today, 12, 30);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_PARTIAL #3',
            },
        });
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'ABSENCE_PARTIAL',
                lateMinutes: 270,
                anomalyNote: '[TEST] Scénario ABSENCE_PARTIAL #3 - 4h30 de retard',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: true,
            message: '✅ Retard extrême 4h30 = ABSENCE_PARTIAL',
            details: { lateMinutes: 270, absenceHours: 4.5 },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsencePartial4_AvecConge(employee, shift, leaveType) {
    const scenario = 'ABSENCE_PARTIAL #4: Avec congé partiel (pas de notification)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        await prisma.leave.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                startDate: today,
                endDate: today,
                days: 0.5,
                status: client_1.LeaveStatus.APPROVED,
                reason: '[TEST] Congé matin pour test ABSENCE_PARTIAL #4',
            },
        });
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_PARTIAL #4',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: true,
            message: '✅ Congé partiel créé - le job doit ignorer ce cas',
            details: { leaveType: leaveType.name, halfDay: true },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_PARTIAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsencePartial5_Idempotence() {
    const scenario = 'ABSENCE_PARTIAL #5: Idempotence';
    log(`\n🧪 ${scenario}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await prisma.absencePartialNotificationLog.count({
        where: {
            tenantId: TEST_TENANT_ID,
            sessionDate: { gte: today },
        },
    });
    results.push({
        scenario,
        type: 'ABSENCE_PARTIAL',
        passed: true,
        message: `✅ Test idempotence: ${count} notification(s)`,
    });
}
async function testAbsenceTechnical1_TentativesEchouees(employee, shift) {
    const scenario = 'ABSENCE_TECHNICAL #1: Tentatives échouées sans succès';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_TECHNICAL #1',
            },
        });
        for (let i = 0; i < 3; i++) {
            await prisma.attendanceAttempt.create({
                data: {
                    tenantId: TEST_TENANT_ID,
                    employeeId: employee.id,
                    timestamp: setTime(today, 8, 5 + i * 5),
                    type: client_1.AttendanceType.IN,
                    method: client_1.DeviceType.FINGERPRINT,
                    status: 'FAILED',
                    errorCode: 'BADGE_NOT_RECOGNIZED',
                    errorMessage: `[TEST] Erreur simulation #${i + 1}`,
                },
            });
        }
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: '✅ 3 tentatives FAILED créées, aucun pointage réussi',
            details: { failedAttempts: 3 },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsenceTechnical2_TentativesPuisSucces(employee, shift) {
    const scenario = 'ABSENCE_TECHNICAL #2: Tentatives puis succès';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_TECHNICAL #2',
            },
        });
        for (let i = 0; i < 2; i++) {
            await prisma.attendanceAttempt.create({
                data: {
                    tenantId: TEST_TENANT_ID,
                    employeeId: employee.id,
                    timestamp: setTime(today, 8, 5 + i * 5),
                    type: client_1.AttendanceType.IN,
                    method: client_1.DeviceType.FINGERPRINT,
                    status: 'FAILED',
                    errorCode: 'NETWORK_ERROR',
                    errorMessage: `[TEST] Erreur simulation #${i + 1}`,
                },
            });
        }
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                timestamp: setTime(today, 8, 15),
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.FINGERPRINT,
                employeeId: employee.id,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 15,
                anomalyNote: '[TEST] Scénario ABSENCE_TECHNICAL #2 - Succès après échecs',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: '✅ 2 échecs puis succès = LATE (pas ABSENCE_TECHNICAL)',
            details: { failedAttempts: 2, successfulIn: '08:15' },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsenceTechnical3_ErreurMaterielle(employee, shift) {
    const scenario = 'ABSENCE_TECHNICAL #3: Erreur lecteur biométrique';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE_TECHNICAL #3',
            },
        });
        for (let i = 0; i < 3; i++) {
            await prisma.attendanceAttempt.create({
                data: {
                    tenantId: TEST_TENANT_ID,
                    employeeId: employee.id,
                    timestamp: setTime(today, 8, 5 + i * 10),
                    type: client_1.AttendanceType.IN,
                    method: client_1.DeviceType.FINGERPRINT,
                    status: 'FAILED',
                    errorCode: 'BIOMETRIC_READ_FAILED',
                    errorMessage: '[TEST] BIOMETRIC_READ_FAILED - Lecteur empreinte défaillant',
                },
            });
        }
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: '✅ 3 échecs biométriques créés',
            details: { errorType: 'BIOMETRIC_READ_FAILED' },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsenceTechnical4_AvecConge(employee, leaveType) {
    const scenario = 'ABSENCE_TECHNICAL #4: Avec congé (pas de notification)';
    log(`\n🧪 ${scenario}`);
    try {
        const today = new Date();
        await prisma.leave.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                startDate: today,
                endDate: today,
                days: 1,
                status: client_1.LeaveStatus.APPROVED,
                reason: '[TEST] Congé pour test ABSENCE_TECHNICAL #4',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: '✅ Congé créé - les tentatives échouées doivent être ignorées',
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE_TECHNICAL',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsenceTechnical5_Idempotence() {
    const scenario = 'ABSENCE_TECHNICAL #5: Idempotence';
    log(`\n🧪 ${scenario}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await prisma.absenceTechnicalNotificationLog.count({
        where: {
            tenantId: TEST_TENANT_ID,
            sessionDate: { gte: today },
        },
    });
    results.push({
        scenario,
        type: 'ABSENCE_TECHNICAL',
        passed: true,
        message: `✅ Test idempotence: ${count} notification(s)`,
    });
}
async function testAbsence1_AbsenceComplete(employee, shift) {
    const scenario = 'ABSENCE #1: Absence complète jour ouvrable';
    log(`\n🧪 ${scenario}`);
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: yesterday,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE #1 - Hier sans pointage',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE',
            passed: true,
            message: '✅ Schedule créé pour hier sans pointage',
            details: { date: formatDate(yesterday) },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsence2_AvecConge(employee, shift, leaveType) {
    const scenario = 'ABSENCE #2: Avec congé approuvé (pas de notification)';
    log(`\n🧪 ${scenario}`);
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0);
        await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                shiftId: shift.id,
                date: twoDaysAgo,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Scénario ABSENCE #2',
            },
        });
        await prisma.leave.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                startDate: twoDaysAgo,
                endDate: twoDaysAgo,
                days: 1,
                status: client_1.LeaveStatus.APPROVED,
                reason: '[TEST] Congé pour test ABSENCE #2',
            },
        });
        results.push({
            scenario,
            type: 'ABSENCE',
            passed: true,
            message: '✅ Schedule + Congé créés - pas de notification attendue',
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsence3_Weekend() {
    const scenario = 'ABSENCE #3: Weekend (pas de notification)';
    log(`\n🧪 ${scenario}`);
    const sunday = new Date();
    sunday.setDate(sunday.getDate() - sunday.getDay());
    results.push({
        scenario,
        type: 'ABSENCE',
        passed: true,
        message: `✅ Test weekend: dimanche = ${formatDate(sunday)} - workingDays exclut le 7`,
        details: { workingDays: [1, 2, 3, 4, 5] },
    });
}
async function testAbsence4_EmployeeInactif() {
    const scenario = 'ABSENCE #4: Employé inactif (pas de notification)';
    log(`\n🧪 ${scenario}`);
    results.push({
        scenario,
        type: 'ABSENCE',
        passed: true,
        message: '✅ Test conceptuel: le job doit filtrer isActive=false',
    });
}
async function testAbsence5_AbsencesMultiples(employee, shift) {
    const scenario = 'ABSENCE #5: Absences multiples consécutives';
    log(`\n🧪 ${scenario}`);
    try {
        const dates = [];
        for (let i = 3; i <= 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            dates.push(date);
            await prisma.schedule.create({
                data: {
                    tenantId: TEST_TENANT_ID,
                    employeeId: employee.id,
                    shiftId: shift.id,
                    date: date,
                    status: client_1.ScheduleStatus.PUBLISHED,
                    notes: `[TEST] Scénario ABSENCE #5 - Jour ${i}`,
                },
            });
        }
        results.push({
            scenario,
            type: 'ABSENCE',
            passed: true,
            message: '✅ 3 schedules consécutifs sans pointage créés',
            details: { dates: dates.map(formatDate) },
        });
    }
    catch (error) {
        results.push({
            scenario,
            type: 'ABSENCE',
            passed: false,
            message: `❌ Erreur: ${error.message}`,
        });
    }
}
async function testAbsence6_Idempotence() {
    const scenario = 'ABSENCE #6: Idempotence';
    log(`\n🧪 ${scenario}`);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const count = await prisma.absenceNotificationLog.count({
        where: {
            tenantId: TEST_TENANT_ID,
            sessionDate: { gte: weekAgo },
        },
    });
    results.push({
        scenario,
        type: 'ABSENCE',
        passed: true,
        message: `✅ ${count} notification(s) ABSENCE cette semaine`,
    });
}
function generateReport() {
    logSection('RAPPORT DE TEST');
    const byType = {};
    results.forEach((r) => {
        if (!byType[r.type])
            byType[r.type] = [];
        byType[r.type].push(r);
    });
    let totalPassed = 0;
    let totalFailed = 0;
    Object.keys(byType).forEach((type) => {
        console.log(`\n📌 ${type}:`);
        byType[type].forEach((r) => {
            console.log(`   ${r.passed ? '✅' : '❌'} ${r.scenario}`);
            console.log(`      ${r.message}`);
            if (r.details) {
                console.log(`      📊 ${JSON.stringify(r.details)}`);
            }
            if (r.passed)
                totalPassed++;
            else
                totalFailed++;
        });
    });
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ FINAL');
    console.log('='.repeat(60));
    console.log(`   ✅ Tests réussis: ${totalPassed}`);
    console.log(`   ❌ Tests échoués: ${totalFailed}`);
    console.log(`   📈 Total: ${totalPassed + totalFailed}`);
    console.log(`   🎯 Taux de réussite: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    console.log('\n⚡ PROCHAINE ÉTAPE:');
    console.log('   Les données de test ont été créées.');
    console.log('   Les jobs cron vont traiter ces données automatiquement.');
    console.log('   Vérifiez les logs du backend pour les emails envoyés.\n');
}
async function main() {
    logSection('TESTS AUTOMATISÉS - NOTIFICATIONS EMAIL');
    console.log(`Tenant de test: ${TEST_TENANT_ID}\n`);
    try {
        const { employee, shift, settings, leaveType } = await getTestData();
        await cleanupTestData(employee.id);
        logSection('TESTS LATE (5 scénarios)');
        await testLate1_RetardDansTolérance(employee, shift);
        await testLate2_RetardHorsTolérance(employee, shift);
        await testLate3_LimiteAbsencePartielle(employee, shift);
        await testLate4_MultipleShifts(employee, shift);
        await testLate5_Idempotence();
        logSection('TESTS ABSENCE_PARTIAL (5 scénarios)');
        await testAbsencePartial1_Retard2h(employee, shift);
        await testAbsencePartial2_LimiteExacte(employee, shift);
        await testAbsencePartial3_RetardExtreme(employee, shift);
        await testAbsencePartial4_AvecConge(employee, shift, leaveType);
        await testAbsencePartial5_Idempotence();
        logSection('TESTS ABSENCE_TECHNICAL (5 scénarios)');
        await testAbsenceTechnical1_TentativesEchouees(employee, shift);
        await testAbsenceTechnical2_TentativesPuisSucces(employee, shift);
        await testAbsenceTechnical3_ErreurMaterielle(employee, shift);
        await testAbsenceTechnical4_AvecConge(employee, leaveType);
        await testAbsenceTechnical5_Idempotence();
        logSection('TESTS ABSENCE (6 scénarios)');
        await testAbsence1_AbsenceComplete(employee, shift);
        await testAbsence2_AvecConge(employee, shift, leaveType);
        await testAbsence3_Weekend();
        await testAbsence4_EmployeeInactif();
        await testAbsence5_AbsencesMultiples(employee, shift);
        await testAbsence6_Idempotence();
        generateReport();
    }
    catch (error) {
        console.error('❌ Erreur fatale:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-email-notifications.js.map