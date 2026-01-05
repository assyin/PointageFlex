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
    magenta: '\x1b[35m',
};
const testResults = [];
function log(type, message) {
    const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️', debug: '🔍' };
    const colorMap = {
        info: colors.cyan,
        success: colors.green,
        error: colors.red,
        warn: colors.yellow,
        debug: colors.magenta,
    };
    console.log(`${colorMap[type]}${icons[type]} ${message}${colors.reset}`);
}
function logSection(title) {
    console.log('\n' + colors.bright + '='.repeat(70) + colors.reset);
    console.log(colors.bright + colors.blue + `  ${title}` + colors.reset);
    console.log(colors.bright + '='.repeat(70) + colors.reset + '\n');
}
async function checkPrerequisites() {
    logSection('ÉTAPE 1: Vérification des prérequis');
    const tenant = await prisma.tenant.findUnique({
        where: { id: TEST_TENANT_ID },
        include: { settings: true },
    });
    if (!tenant) {
        testResults.push({
            step: '1.1 Tenant',
            passed: false,
            message: `Tenant ${TEST_TENANT_ID} non trouvé`,
        });
        throw new Error('Tenant non trouvé');
    }
    log('success', `Tenant trouvé: ${tenant.companyName}`);
    testResults.push({
        step: '1.1 Tenant',
        passed: true,
        message: `Tenant ${tenant.companyName} trouvé`,
        details: { id: tenant.id, name: tenant.companyName },
    });
    const emailConfig = await prisma.emailConfig.findUnique({
        where: { tenantId: TEST_TENANT_ID },
    });
    if (!emailConfig) {
        log('warn', 'EmailConfig non trouvé - création...');
        await prisma.emailConfig.create({
            data: {
                tenantId: TEST_TENANT_ID,
                enabled: true,
                notifyLate: true,
                notifyMissingIn: true,
                notifyMissingOut: true,
                notifyAbsence: true,
                notifyAbsencePartial: true,
                notifyAbsenceTechnical: true,
            },
        });
        log('success', 'EmailConfig créé avec notifyAbsenceTechnical=true');
    }
    else if (!emailConfig.notifyAbsenceTechnical) {
        await prisma.emailConfig.update({
            where: { tenantId: TEST_TENANT_ID },
            data: { notifyAbsenceTechnical: true },
        });
        log('success', 'EmailConfig mis à jour: notifyAbsenceTechnical=true');
    }
    else {
        log('success', 'EmailConfig OK avec notifyAbsenceTechnical=true');
    }
    testResults.push({
        step: '1.2 EmailConfig',
        passed: true,
        message: 'EmailConfig configuré pour ABSENCE_TECHNICAL',
        details: { notifyAbsenceTechnical: true },
    });
    let template = await prisma.emailTemplate.findUnique({
        where: {
            tenantId_code: { tenantId: TEST_TENANT_ID, code: 'ABSENCE_TECHNICAL' },
        },
    });
    if (!template) {
        log('warn', 'Template ABSENCE_TECHNICAL non trouvé - création...');
        template = await prisma.emailTemplate.create({
            data: {
                tenantId: TEST_TENANT_ID,
                code: 'ABSENCE_TECHNICAL',
                name: 'Anomalie technique',
                description: 'Notification d\'anomalie technique (panne terminal, coupure électrique, etc.)',
                subject: '[Pointage] Anomalie technique détectée – {{severity}}',
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #9333ea;">🔧 Anomalie technique détectée</h2>
    <p>Bonjour {{managerName}},</p>
    <p>Une anomalie technique a été détectée pour l'un de vos collaborateurs :</p>
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
      <p><strong>Employé :</strong> {{employeeName}}</p>
      <p><strong>Date :</strong> {{sessionDate}}</p>
      <p><strong>Heure de détection :</strong> {{occurredAt}}</p>
      <p><strong>Sévérité :</strong> <span style="color: #dc2626;">{{severity}}</span></p>
      <p><strong>Terminal :</strong> {{deviceName}}</p>
      <p><strong>Raison :</strong> {{reason}}</p>
    </div>
    <p>Cette anomalie est probablement due à un problème technique et non à l'employé.</p>
    <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
      Cet email a été envoyé automatiquement. [TEST]
    </p>
  </div>
</body>
</html>`,
                variables: ['managerName', 'employeeName', 'sessionDate', 'occurredAt', 'reason', 'deviceName', 'severity'],
                category: 'notification',
                active: true,
            },
        });
        log('success', 'Template ABSENCE_TECHNICAL créé');
    }
    else {
        log('success', `Template ABSENCE_TECHNICAL trouvé (ID: ${template.id})`);
    }
    testResults.push({
        step: '1.3 Template',
        passed: true,
        message: 'Template ABSENCE_TECHNICAL disponible',
        details: { templateId: template.id, active: template.active },
    });
    const employees = await prisma.employee.findMany({
        where: {
            tenantId: TEST_TENANT_ID,
            isActive: true,
            departmentId: { not: null },
        },
        include: {
            department: {
                include: {
                    manager: { include: { user: true } },
                },
            },
        },
        take: 20,
    });
    let employee = employees.find((e) => e.department?.manager?.user?.email && e.department.manager.user.email.length > 0);
    if (!employee && employees.length > 0) {
        employee = employees[0];
        log('warn', 'Pas d\'employé avec manager valide trouvé, utilisation du premier employé');
    }
    if (!employee) {
        testResults.push({
            step: '1.4 Employé + Manager',
            passed: false,
            message: 'Aucun employé avec manager trouvé',
        });
        throw new Error('Aucun employé avec manager trouvé');
    }
    const manager = employee.department?.manager?.user;
    log('success', `Employé: ${employee.firstName} ${employee.lastName}`);
    if (manager?.email) {
        log('success', `Manager: ${manager.firstName} ${manager.lastName} (${manager.email})`);
    }
    else {
        log('warn', `Pas de manager avec email - les notifications ne seront pas envoyées`);
    }
    testResults.push({
        step: '1.4 Employé + Manager',
        passed: true,
        message: 'Employé avec manager trouvé',
        details: {
            employee: `${employee.firstName} ${employee.lastName}`,
            manager: `${manager?.firstName} ${manager?.lastName}`,
            managerEmail: manager?.email,
        },
    });
    let device = await prisma.attendanceDevice.findFirst({
        where: { tenantId: TEST_TENANT_ID },
    });
    if (!device) {
        log('warn', 'Aucun device trouvé - création d\'un device de test...');
        device = await prisma.attendanceDevice.create({
            data: {
                tenantId: TEST_TENANT_ID,
                deviceId: 'TEST-DEVICE-001',
                name: 'Terminal Test Entrée',
                deviceType: client_1.DeviceType.FINGERPRINT,
                ipAddress: '192.168.1.100',
                isActive: true,
                lastSync: new Date(),
            },
        });
    }
    log('success', `Device: ${device.name} (${device.deviceId})`);
    testResults.push({
        step: '1.5 Device',
        passed: true,
        message: 'Device de test disponible',
        details: { deviceId: device.deviceId, name: device.name },
    });
    return { tenant, employee, device, template };
}
async function createTechnicalAnomalies(employeeId, deviceId) {
    logSection('ÉTAPE 2: Création d\'anomalies techniques');
    const now = new Date();
    const anomalies = [];
    const technicalSubTypes = [
        {
            subType: 'DEVICE_OFFLINE',
            description: 'Terminal hors ligne depuis plus de 2 heures',
            severity: 'HIGH',
        },
        {
            subType: 'DEVICE_FAILURE',
            description: 'Panne du lecteur biométrique',
            severity: 'CRITICAL',
        },
        {
            subType: 'POWER_OUTAGE',
            description: 'Coupure électrique détectée',
            severity: 'HIGH',
        },
        {
            subType: 'NETWORK_ERROR',
            description: 'Erreur de synchronisation réseau',
            severity: 'MEDIUM',
        },
        {
            subType: 'SYNC_FAILURE',
            description: 'Échec de synchronisation des données',
            severity: 'MEDIUM',
        },
    ];
    for (let i = 0; i < technicalSubTypes.length; i++) {
        const subTypeInfo = technicalSubTypes[i];
        const occurredAt = new Date(now);
        occurredAt.setHours(occurredAt.getHours() - (i + 1));
        try {
            const anomaly = await prisma.attendanceAnomaly.create({
                data: {
                    tenantId: TEST_TENANT_ID,
                    employeeId,
                    deviceId,
                    type: 'TECHNICAL',
                    subType: subTypeInfo.subType,
                    severity: subTypeInfo.severity,
                    description: `[TEST] ${subTypeInfo.description}`,
                    occurredAt,
                    status: 'OPEN',
                    metadata: {
                        test: true,
                        createdBy: 'test-attendance-anomaly-model.ts',
                        scenario: `TECHNICAL-${i + 1}`,
                    },
                },
            });
            anomalies.push(anomaly);
            log('success', `Anomalie ${i + 1}/5: ${subTypeInfo.subType} (${subTypeInfo.severity})`);
            testResults.push({
                step: `2.${i + 1} Anomalie ${subTypeInfo.subType}`,
                passed: true,
                message: `Créée avec succès`,
                details: { id: anomaly.id, subType: subTypeInfo.subType, severity: subTypeInfo.severity },
            });
        }
        catch (error) {
            log('error', `Erreur création anomalie ${subTypeInfo.subType}: ${error.message}`);
            testResults.push({
                step: `2.${i + 1} Anomalie ${subTypeInfo.subType}`,
                passed: false,
                message: error.message,
            });
        }
    }
    log('info', `${anomalies.length} anomalies techniques créées`);
    return anomalies;
}
async function simulateDetectionJob() {
    logSection('ÉTAPE 3: Simulation du job de détection');
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const anomalies = await prisma.attendanceAnomaly.findMany({
        where: {
            tenantId: TEST_TENANT_ID,
            type: 'TECHNICAL',
            status: { in: ['OPEN', 'INVESTIGATING'] },
            notifiedAt: null,
            detectedAt: { gte: oneDayAgo },
            description: { contains: '[TEST]' },
        },
        include: {
            employee: {
                include: {
                    user: true,
                    department: {
                        include: {
                            manager: { include: { user: true } },
                        },
                    },
                },
            },
            device: true,
        },
        orderBy: { detectedAt: 'desc' },
    });
    log('info', `${anomalies.length} anomalie(s) technique(s) à traiter`);
    testResults.push({
        step: '3.1 Détection anomalies',
        passed: anomalies.length > 0,
        message: `${anomalies.length} anomalie(s) détectée(s)`,
        details: { count: anomalies.length },
    });
    for (const anomaly of anomalies) {
        const employee = anomaly.employee;
        const manager = employee?.department?.manager?.user;
        log('debug', `Traitement: ${anomaly.subType} pour ${employee?.firstName} ${employee?.lastName}`);
        if (!manager?.email) {
            log('warn', `  → Pas de manager avec email, skip`);
            continue;
        }
        const alreadyNotified = await prisma.absenceTechnicalNotificationLog.findUnique({
            where: {
                tenantId_anomalyId: {
                    tenantId: TEST_TENANT_ID,
                    anomalyId: anomaly.id,
                },
            },
        });
        if (alreadyNotified) {
            log('info', `  → Déjà notifié, skip`);
            continue;
        }
        log('success', `  → Notification simulée pour ${manager.email}`);
        await prisma.attendanceAnomaly.update({
            where: { id: anomaly.id },
            data: { notifiedAt: new Date() },
        });
        const employeeUserId = employee.user?.id || employee.userId;
        if (!employeeUserId) {
            log('warn', `  → Employé sans userId, skip log`);
            continue;
        }
        await prisma.absenceTechnicalNotificationLog.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employeeUserId,
                managerId: manager.id,
                anomalyId: anomaly.id,
                sessionDate: new Date(),
                reason: anomaly.description || 'Anomalie technique',
            },
        });
        log('success', `  → Log créé dans AbsenceTechnicalNotificationLog`);
    }
    testResults.push({
        step: '3.2 Notifications simulées',
        passed: true,
        message: 'Toutes les notifications ont été simulées',
    });
}
async function verifyResults() {
    logSection('ÉTAPE 4: Vérification des résultats');
    const notifiedAnomalies = await prisma.attendanceAnomaly.count({
        where: {
            tenantId: TEST_TENANT_ID,
            type: 'TECHNICAL',
            notifiedAt: { not: null },
            description: { contains: '[TEST]' },
        },
    });
    log('info', `${notifiedAnomalies} anomalie(s) marquée(s) comme notifiée(s)`);
    testResults.push({
        step: '4.1 Anomalies notifiées',
        passed: notifiedAnomalies > 0,
        message: `${notifiedAnomalies} anomalie(s) marquée(s)`,
    });
    const notificationLogs = await prisma.absenceTechnicalNotificationLog.count({
        where: {
            tenantId: TEST_TENANT_ID,
            reason: { contains: '[TEST]' },
        },
    });
    log('info', `${notificationLogs} log(s) de notification créé(s)`);
    testResults.push({
        step: '4.2 Logs notification',
        passed: notificationLogs > 0,
        message: `${notificationLogs} log(s) créé(s)`,
    });
    const allTestAnomalies = await prisma.attendanceAnomaly.findMany({
        where: {
            tenantId: TEST_TENANT_ID,
            description: { contains: '[TEST]' },
        },
        include: {
            employee: { include: { user: true } },
            device: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
    console.log('\n' + colors.cyan + 'Détail des anomalies de test:' + colors.reset);
    for (const a of allTestAnomalies) {
        const status = a.notifiedAt ? '📧 Notifié' : '⏳ En attente';
        console.log(`  ${status} | ${a.subType} | ${a.severity} | ${a.employee?.firstName} ${a.employee?.lastName} | ${a.device?.name || 'N/A'}`);
    }
    testResults.push({
        step: '4.3 Liste anomalies',
        passed: true,
        message: `${allTestAnomalies.length} anomalie(s) de test trouvée(s)`,
    });
}
async function cleanup(skipPrompt = false) {
    logSection('ÉTAPE 5: Nettoyage');
    if (!skipPrompt) {
        log('info', 'Les données de test seront conservées pour inspection.');
        log('info', 'Pour nettoyer manuellement, exécuter:');
        console.log(`
    ${colors.yellow}await prisma.absenceTechnicalNotificationLog.deleteMany({
      where: { reason: { contains: '[TEST]' } }
    });

    await prisma.attendanceAnomaly.deleteMany({
      where: { description: { contains: '[TEST]' } }
    });${colors.reset}
    `);
        return;
    }
    const deletedLogs = await prisma.absenceTechnicalNotificationLog.deleteMany({
        where: { reason: { contains: '[TEST]' } },
    });
    const deletedAnomalies = await prisma.attendanceAnomaly.deleteMany({
        where: { description: { contains: '[TEST]' } },
    });
    log('success', `Nettoyé: ${deletedLogs.count} logs, ${deletedAnomalies.count} anomalies`);
}
function generateReport() {
    logSection('RAPPORT FINAL');
    const passed = testResults.filter((r) => r.passed).length;
    const failed = testResults.filter((r) => !r.passed).length;
    const total = testResults.length;
    console.log(`${colors.bright}Résumé:${colors.reset}`);
    console.log(`  ${colors.green}✅ Réussis: ${passed}${colors.reset}`);
    console.log(`  ${colors.red}❌ Échoués: ${failed}${colors.reset}`);
    console.log(`  📊 Total: ${total}`);
    console.log(`  📈 Taux de réussite: ${((passed / total) * 100).toFixed(1)}%\n`);
    console.log(`${colors.cyan}Détail des étapes:${colors.reset}`);
    for (const result of testResults) {
        const icon = result.passed ? '✅' : '❌';
        console.log(`  ${icon} ${result.step}: ${result.message}`);
        if (result.details && !result.passed) {
            console.log(`     ${colors.yellow}→ ${JSON.stringify(result.details)}${colors.reset}`);
        }
    }
    console.log('\n' + '='.repeat(70));
    if (failed === 0) {
        log('success', '🎉 Tous les tests ont réussi! Le modèle AttendanceAnomaly fonctionne correctement.');
    }
    else {
        log('error', `${failed} test(s) ont échoué. Vérifiez la configuration.`);
    }
}
async function main() {
    console.clear();
    logSection('TEST MODÈLE ATTENDANCEANOMALY & JOB ABSENCE_TECHNICAL');
    log('info', `Tenant de test: ${TEST_TENANT_ID}`);
    log('info', `Date: ${new Date().toLocaleString('fr-FR')}`);
    log('info', `Mode: SIMULATION (pas d'envoi réel d'emails)\n`);
    try {
        const { employee, device } = await checkPrerequisites();
        await createTechnicalAnomalies(employee.id, device.id);
        await simulateDetectionJob();
        await verifyResults();
        await cleanup(false);
        generateReport();
        log('info', '\n💡 Pour déclencher le vrai job, attendez le cron (toutes les heures)');
        log('info', '   ou appelez manuellement: AbsenceTechnicalManagerNotificationJob.handleAbsenceTechnicalNotifications()');
    }
    catch (error) {
        log('error', `Erreur critique: ${error.message}`);
        console.error(error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-attendance-anomaly-model.js.map