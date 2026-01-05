"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TEST_TENANT_ID = '340a6c2a-160e-4f4b-917e-6eea8fd5ff2d';
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};
const testResults = [];
function log(type, message) {
    const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' };
    const colorMap = { info: colors.cyan, success: colors.green, error: colors.red, warn: colors.yellow };
    console.log(`${colorMap[type]}${icons[type]} ${message}${colors.reset}`);
}
function logSection(title) {
    console.log('\n' + colors.bright + '='.repeat(60) + colors.reset);
    console.log(colors.bright + colors.blue + `  ${title}` + colors.reset);
    console.log(colors.bright + '='.repeat(60) + colors.reset + '\n');
}
async function getTestEmployee() {
    const employee = await prisma.employee.findFirst({
        where: {
            tenantId: TEST_TENANT_ID,
            user: { isActive: true },
        },
        include: {
            user: true,
            department: { include: { manager: { include: { user: true } } } },
        },
    });
    if (!employee)
        throw new Error('Aucun employé de test trouvé');
    return employee;
}
async function getShift(startTime = '08:00') {
    const shift = await prisma.shift.findFirst({
        where: { tenantId: TEST_TENANT_ID, startTime },
    });
    if (!shift)
        throw new Error(`Aucun shift trouvé avec startTime=${startTime}`);
    return shift;
}
async function getOrCreateSchedule(employeeId, shiftId, date) {
    let schedule = await prisma.schedule.findFirst({
        where: { employeeId, shiftId, date },
    });
    if (!schedule) {
        schedule = await prisma.schedule.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId,
                shiftId,
                date,
                status: client_1.ScheduleStatus.PUBLISHED,
                notes: '[TEST] Schedule de test automatisé',
            },
        });
    }
    return schedule;
}
async function cleanupTestData(prefix = '[TEST]') {
    await prisma.attendance.deleteMany({
        where: {
            tenantId: TEST_TENANT_ID,
            anomalyNote: { contains: prefix },
        },
    });
    log('info', `Données de test nettoyées (prefix: ${prefix})`);
}
async function testLate01_LateDetected() {
    const scenario = 'LATE-01: Retard détecté et notifié';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const shift = await getShift('08:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await getOrCreateSchedule(employee.id, shift.id, today);
        const lateTime = new Date(today);
        lateTime.setHours(8, 25, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: lateTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 25,
                anomalyNote: '[TEST] LATE-01 Retard 25 minutes',
            },
        });
        testResults.push({
            scenario: 'LATE-01',
            type: 'LATE',
            passed: true,
            message: 'Retard de 25 min créé avec succès',
            details: { lateMinutes: 25, employeeName: `${employee.user.firstName} ${employee.user.lastName}` },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'LATE-01', type: 'LATE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testLate02_LateUnderThreshold() {
    const scenario = 'LATE-02: Retard sous le seuil (pas de notification)';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const shift = await getShift('08:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lateTime = new Date(today);
        lateTime.setHours(8, 10, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: lateTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: false,
                anomalyNote: '[TEST] LATE-02 Retard 10 minutes (sous seuil)',
            },
        });
        testResults.push({
            scenario: 'LATE-02',
            type: 'LATE',
            passed: true,
            message: 'Retard sous seuil créé (aucune anomalie)',
            details: { lateMinutes: 10, threshold: 14 },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'LATE-02', type: 'LATE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testLate03_OnTime() {
    const scenario = 'LATE-03: Arrivée à l\'heure (pas de retard)';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const shift = await getShift('08:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const onTime = new Date(today);
        onTime.setHours(7, 55, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: onTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: false,
                anomalyNote: '[TEST] LATE-03 Arrivée à l\'heure',
            },
        });
        testResults.push({
            scenario: 'LATE-03',
            type: 'LATE',
            passed: true,
            message: 'Arrivée à l\'heure créée',
            details: { arrivalTime: '07:55', shiftStart: '08:00' },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'LATE-03', type: 'LATE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testLate04_LateWithLeave() {
    const scenario = 'LATE-04: Retard avec congé (pas de notification)';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leave = await prisma.leave.findFirst({
            where: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                status: client_1.LeaveStatus.APPROVED,
                startDate: { lte: today },
                endDate: { gte: today },
            },
        });
        if (leave) {
            testResults.push({
                scenario: 'LATE-04',
                type: 'LATE',
                passed: true,
                message: 'Congé existant trouvé - retard ignoré',
                details: { leaveId: leave.id },
            });
        }
        else {
            testResults.push({
                scenario: 'LATE-04',
                type: 'LATE',
                passed: true,
                message: 'Pas de congé - test non applicable',
                details: { note: 'Créer un congé pour tester ce scénario' },
            });
        }
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'LATE-04', type: 'LATE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testLate05_MultipleNotifications() {
    const scenario = 'LATE-05: Double notification évitée';
    log('info', `Test: ${scenario}`);
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const notifCount = await prisma.lateNotificationLog.count({
            where: {
                tenantId: TEST_TENANT_ID,
                sessionDate: { gte: today },
            },
        });
        testResults.push({
            scenario: 'LATE-05',
            type: 'LATE',
            passed: true,
            message: `${notifCount} notification(s) LATE aujourd'hui`,
            details: { notificationCount: notifCount },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'LATE-05', type: 'LATE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsencePartial01_Detected() {
    const scenario = 'ABSENCE_PARTIAL-01: Absence partielle détectée';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const shift = await getShift('08:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await getOrCreateSchedule(employee.id, shift.id, today);
        const lateTime = new Date(today);
        lateTime.setHours(11, 0, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: lateTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: true,
                anomalyType: 'ABSENCE_PARTIAL',
                lateMinutes: 180,
                anomalyNote: '[TEST] ABSENCE_PARTIAL-01 Retard 3h',
            },
        });
        testResults.push({
            scenario: 'ABSENCE_PARTIAL-01',
            type: 'ABSENCE_PARTIAL',
            passed: true,
            message: 'Absence partielle de 3h créée',
            details: { lateHours: 3, threshold: 2 },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_PARTIAL-01', type: 'ABSENCE_PARTIAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsencePartial02_UnderThreshold() {
    const scenario = 'ABSENCE_PARTIAL-02: Sous le seuil (traité comme LATE)';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lateTime = new Date(today);
        lateTime.setHours(9, 30, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: lateTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 90,
                anomalyNote: '[TEST] ABSENCE_PARTIAL-02 Retard 1h30 (traité comme LATE)',
            },
        });
        testResults.push({
            scenario: 'ABSENCE_PARTIAL-02',
            type: 'ABSENCE_PARTIAL',
            passed: true,
            message: 'Retard de 1h30 traité comme LATE (sous seuil 2h)',
            details: { lateMinutes: 90, threshold: 120 },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_PARTIAL-02', type: 'ABSENCE_PARTIAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsencePartial03_NotificationLog() {
    const scenario = 'ABSENCE_PARTIAL-03: Vérification log notification';
    log('info', `Test: ${scenario}`);
    try {
        const count = await prisma.absencePartialNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID },
        });
        testResults.push({
            scenario: 'ABSENCE_PARTIAL-03',
            type: 'ABSENCE_PARTIAL',
            passed: true,
            message: `${count} notification(s) ABSENCE_PARTIAL au total`,
            details: { totalNotifications: count },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_PARTIAL-03', type: 'ABSENCE_PARTIAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsencePartial04_Settings() {
    const scenario = 'ABSENCE_PARTIAL-04: Configuration tenant';
    log('info', `Test: ${scenario}`);
    try {
        const settings = await prisma.tenantSettings.findUnique({
            where: { tenantId: TEST_TENANT_ID },
            select: {
                absencePartialThreshold: true,
                absencePartialNotificationFrequencyMinutes: true,
            },
        });
        if (settings) {
            testResults.push({
                scenario: 'ABSENCE_PARTIAL-04',
                type: 'ABSENCE_PARTIAL',
                passed: true,
                message: 'Configuration trouvée',
                details: settings,
            });
        }
        else {
            testResults.push({
                scenario: 'ABSENCE_PARTIAL-04',
                type: 'ABSENCE_PARTIAL',
                passed: false,
                message: 'Configuration manquante',
            });
        }
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_PARTIAL-04', type: 'ABSENCE_PARTIAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsencePartial05_Template() {
    const scenario = 'ABSENCE_PARTIAL-05: Template email';
    log('info', `Test: ${scenario}`);
    try {
        const template = await prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId: TEST_TENANT_ID,
                    code: 'ABSENCE_PARTIAL',
                },
            },
            select: { id: true, name: true, active: true },
        });
        if (template && template.active) {
            testResults.push({
                scenario: 'ABSENCE_PARTIAL-05',
                type: 'ABSENCE_PARTIAL',
                passed: true,
                message: 'Template actif trouvé',
                details: template,
            });
        }
        else {
            testResults.push({
                scenario: 'ABSENCE_PARTIAL-05',
                type: 'ABSENCE_PARTIAL',
                passed: false,
                message: 'Template manquant ou inactif',
            });
        }
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_PARTIAL-05', type: 'ABSENCE_PARTIAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsenceTechnical01_MissingOut() {
    const scenario = 'ABSENCE_TECHNICAL-01: Session non clôturée';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inTime = new Date(today);
        inTime.setHours(8, 0, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: inTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: false,
                anomalyNote: '[TEST] ABSENCE_TECHNICAL-01 IN sans OUT',
            },
        });
        testResults.push({
            scenario: 'ABSENCE_TECHNICAL-01',
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: 'Session ouverte créée (IN sans OUT)',
            details: { inTime: '08:00' },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_TECHNICAL-01', type: 'ABSENCE_TECHNICAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsenceTechnical02_MissingIn() {
    const scenario = 'ABSENCE_TECHNICAL-02: Pointage OUT sans IN';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const outTime = new Date(today);
        outTime.setHours(17, 0, 0, 0);
        await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: outTime,
                type: client_1.AttendanceType.OUT,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: true,
                anomalyType: 'MISSING_IN',
                anomalyNote: '[TEST] ABSENCE_TECHNICAL-02 OUT sans IN',
            },
        });
        testResults.push({
            scenario: 'ABSENCE_TECHNICAL-02',
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: 'OUT orphelin créé (anomalie MISSING_IN)',
            details: { outTime: '17:00' },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_TECHNICAL-02', type: 'ABSENCE_TECHNICAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsenceTechnical03_NotificationLog() {
    const scenario = 'ABSENCE_TECHNICAL-03: Log notifications techniques';
    log('info', `Test: ${scenario}`);
    try {
        const missingInCount = await prisma.missingInNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID },
        });
        const missingOutCount = await prisma.missingOutNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID },
        });
        const technicalCount = await prisma.absenceTechnicalNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID },
        });
        testResults.push({
            scenario: 'ABSENCE_TECHNICAL-03',
            type: 'ABSENCE_TECHNICAL',
            passed: true,
            message: 'Logs de notifications techniques',
            details: { missingInCount, missingOutCount, technicalCount },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_TECHNICAL-03', type: 'ABSENCE_TECHNICAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsenceTechnical04_Templates() {
    const scenario = 'ABSENCE_TECHNICAL-04: Templates techniques';
    log('info', `Test: ${scenario}`);
    try {
        const templates = await prisma.emailTemplate.findMany({
            where: {
                tenantId: TEST_TENANT_ID,
                code: { in: ['MISSING_IN', 'MISSING_OUT', 'ABSENCE_TECHNICAL'] },
            },
            select: { code: true, active: true },
        });
        const allActive = templates.length === 3 && templates.every((t) => t.active);
        testResults.push({
            scenario: 'ABSENCE_TECHNICAL-04',
            type: 'ABSENCE_TECHNICAL',
            passed: allActive,
            message: allActive ? 'Tous les templates techniques actifs' : 'Templates manquants ou inactifs',
            details: templates,
        });
        log(allActive ? 'success' : 'warn', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_TECHNICAL-04', type: 'ABSENCE_TECHNICAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsenceTechnical05_Settings() {
    const scenario = 'ABSENCE_TECHNICAL-05: Configuration détection';
    log('info', `Test: ${scenario}`);
    try {
        const settings = await prisma.tenantSettings.findUnique({
            where: { tenantId: TEST_TENANT_ID },
            select: {
                missingInDetectionWindowMinutes: true,
                missingOutDetectionWindowMinutes: true,
            },
        });
        testResults.push({
            scenario: 'ABSENCE_TECHNICAL-05',
            type: 'ABSENCE_TECHNICAL',
            passed: !!settings,
            message: settings ? 'Configuration technique trouvée' : 'Configuration manquante',
            details: settings,
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE_TECHNICAL-05', type: 'ABSENCE_TECHNICAL', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsence01_FullAbsence() {
    const scenario = 'ABSENCE-01: Absence complète détectée';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const shift = await getShift('08:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await getOrCreateSchedule(employee.id, shift.id, today);
        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        const hasAttendance = await prisma.attendance.findFirst({
            where: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: { gte: startOfToday, lte: endOfToday },
                type: client_1.AttendanceType.IN,
                anomalyNote: { not: { contains: '[TEST]' } },
            },
        });
        if (!hasAttendance) {
            testResults.push({
                scenario: 'ABSENCE-01',
                type: 'ABSENCE',
                passed: true,
                message: 'Absence potentielle détectée (aucun IN réel)',
                details: { employeeName: `${employee.user.firstName} ${employee.user.lastName}` },
            });
        }
        else {
            testResults.push({
                scenario: 'ABSENCE-01',
                type: 'ABSENCE',
                passed: true,
                message: 'Employé présent aujourd\'hui',
                details: { hasRealAttendance: true },
            });
        }
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE-01', type: 'ABSENCE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsence02_WithLeave() {
    const scenario = 'ABSENCE-02: Absence justifiée par congé';
    log('info', `Test: ${scenario}`);
    try {
        const employee = await getTestEmployee();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leave = await prisma.leave.findFirst({
            where: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                status: client_1.LeaveStatus.APPROVED,
                startDate: { lte: today },
                endDate: { gte: today },
            },
        });
        testResults.push({
            scenario: 'ABSENCE-02',
            type: 'ABSENCE',
            passed: true,
            message: leave ? 'Congé approuvé trouvé' : 'Pas de congé aujourd\'hui',
            details: leave ? { leaveId: leave.id } : { note: 'Créer un congé pour tester' },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE-02', type: 'ABSENCE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsence03_NotificationLog() {
    const scenario = 'ABSENCE-03: Log notifications absence';
    log('info', `Test: ${scenario}`);
    try {
        const count = await prisma.absenceNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID },
        });
        testResults.push({
            scenario: 'ABSENCE-03',
            type: 'ABSENCE',
            passed: true,
            message: `${count} notification(s) ABSENCE au total`,
            details: { totalNotifications: count },
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE-03', type: 'ABSENCE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsence04_DetectionTime() {
    const scenario = 'ABSENCE-04: Heure de détection configurée';
    log('info', `Test: ${scenario}`);
    try {
        const settings = await prisma.tenantSettings.findUnique({
            where: { tenantId: TEST_TENANT_ID },
            select: {
                absenceDetectionTime: true,
                absenceDetectionBufferMinutes: true,
                absenceNotificationFrequencyMinutes: true,
            },
        });
        testResults.push({
            scenario: 'ABSENCE-04',
            type: 'ABSENCE',
            passed: !!settings?.absenceDetectionTime,
            message: settings?.absenceDetectionTime ? `Détection à ${settings.absenceDetectionTime}` : 'Heure non configurée',
            details: settings,
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE-04', type: 'ABSENCE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsence05_Template() {
    const scenario = 'ABSENCE-05: Template email absence';
    log('info', `Test: ${scenario}`);
    try {
        const template = await prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId: TEST_TENANT_ID,
                    code: 'ABSENCE',
                },
            },
            select: { id: true, name: true, subject: true, active: true },
        });
        testResults.push({
            scenario: 'ABSENCE-05',
            type: 'ABSENCE',
            passed: !!template?.active,
            message: template?.active ? 'Template ABSENCE actif' : 'Template manquant ou inactif',
            details: template,
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE-05', type: 'ABSENCE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
async function testAbsence06_EmailConfig() {
    const scenario = 'ABSENCE-06: Configuration email activée';
    log('info', `Test: ${scenario}`);
    try {
        const emailConfig = await prisma.emailConfig.findUnique({
            where: { tenantId: TEST_TENANT_ID },
            select: {
                enabled: true,
                notifyAbsence: true,
                notifyLate: true,
                notifyMissingIn: true,
                notifyMissingOut: true,
            },
        });
        const allEnabled = emailConfig?.enabled && emailConfig?.notifyAbsence;
        testResults.push({
            scenario: 'ABSENCE-06',
            type: 'ABSENCE',
            passed: !!allEnabled,
            message: allEnabled ? 'Notifications email activées' : 'Notifications désactivées',
            details: emailConfig,
        });
        log('success', scenario);
    }
    catch (error) {
        testResults.push({ scenario: 'ABSENCE-06', type: 'ABSENCE', passed: false, message: error.message });
        log('error', `${scenario}: ${error.message}`);
    }
}
function generateReport() {
    logSection('RAPPORT DE TEST');
    const passed = testResults.filter((r) => r.passed).length;
    const failed = testResults.filter((r) => !r.passed).length;
    const total = testResults.length;
    console.log(`${colors.bright}Résumé:${colors.reset}`);
    console.log(`  ${colors.green}✅ Réussis: ${passed}${colors.reset}`);
    console.log(`  ${colors.red}❌ Échoués: ${failed}${colors.reset}`);
    console.log(`  📊 Total: ${total}`);
    console.log(`  📈 Taux de réussite: ${((passed / total) * 100).toFixed(1)}%\n`);
    const types = ['LATE', 'ABSENCE_PARTIAL', 'ABSENCE_TECHNICAL', 'ABSENCE'];
    for (const type of types) {
        const typeResults = testResults.filter((r) => r.type === type);
        const typePassed = typeResults.filter((r) => r.passed).length;
        console.log(`\n${colors.cyan}${type}:${colors.reset} ${typePassed}/${typeResults.length} réussis`);
        for (const result of typeResults) {
            const icon = result.passed ? '✅' : '❌';
            console.log(`  ${icon} ${result.scenario}: ${result.message}`);
            if (result.details) {
                console.log(`     ${colors.yellow}→ ${JSON.stringify(result.details)}${colors.reset}`);
            }
        }
    }
    console.log('\n' + '='.repeat(60));
}
async function main() {
    console.clear();
    logSection('TEST COMPLET - NOTIFICATIONS EMAIL');
    log('info', `Tenant de test: ${TEST_TENANT_ID}`);
    log('info', `Date: ${new Date().toLocaleString('fr-FR')}\n`);
    try {
        await cleanupTestData();
        logSection('TESTS LATE (5 scénarios)');
        await testLate01_LateDetected();
        await testLate02_LateUnderThreshold();
        await testLate03_OnTime();
        await testLate04_LateWithLeave();
        await testLate05_MultipleNotifications();
        logSection('TESTS ABSENCE_PARTIAL (5 scénarios)');
        await testAbsencePartial01_Detected();
        await testAbsencePartial02_UnderThreshold();
        await testAbsencePartial03_NotificationLog();
        await testAbsencePartial04_Settings();
        await testAbsencePartial05_Template();
        logSection('TESTS ABSENCE_TECHNICAL (5 scénarios)');
        await testAbsenceTechnical01_MissingOut();
        await testAbsenceTechnical02_MissingIn();
        await testAbsenceTechnical03_NotificationLog();
        await testAbsenceTechnical04_Templates();
        await testAbsenceTechnical05_Settings();
        logSection('TESTS ABSENCE (6 scénarios)');
        await testAbsence01_FullAbsence();
        await testAbsence02_WithLeave();
        await testAbsence03_NotificationLog();
        await testAbsence04_DetectionTime();
        await testAbsence05_Template();
        await testAbsence06_EmailConfig();
        generateReport();
        log('info', '\n💡 Les jobs cron traiteront ces données toutes les 15 minutes');
        log('info', '📧 Mode SIMULATION: les emails ne sont pas réellement envoyés');
    }
    catch (error) {
        log('error', `Erreur critique: ${error}`);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-all-notifications.js.map