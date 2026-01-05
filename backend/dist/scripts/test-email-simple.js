"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TEST_TENANT_ID = '340a6c2a-160e-4f4b-917e-6eea8fd5ff2d';
async function main() {
    console.log('🧪 TEST SIMPLIFIÉ - NOTIFICATIONS EMAIL\n');
    console.log('='.repeat(50));
    try {
        const employee = await prisma.employee.findFirst({
            where: { tenantId: TEST_TENANT_ID, user: { isActive: true } },
            include: { user: true, department: { include: { manager: true } } },
        });
        if (!employee)
            throw new Error('Aucun employé trouvé');
        const shift = await prisma.shift.findFirst({
            where: { tenantId: TEST_TENANT_ID, startTime: '08:00' },
        });
        if (!shift)
            throw new Error('Aucun shift trouvé');
        console.log(`\n📋 Données de test:`);
        console.log(`   Employé: ${employee.user.firstName} ${employee.user.lastName}`);
        console.log(`   Manager: ${employee.department?.manager?.firstName} ${employee.department?.manager?.lastName}`);
        console.log(`   Shift: ${shift.name} (${shift.startTime}-${shift.endTime})`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let schedule = await prisma.schedule.findFirst({
            where: {
                employeeId: employee.id,
                shiftId: shift.id,
                date: today,
            },
        });
        if (!schedule) {
            schedule = await prisma.schedule.create({
                data: {
                    tenantId: TEST_TENANT_ID,
                    employeeId: employee.id,
                    shiftId: shift.id,
                    date: today,
                    status: client_1.ScheduleStatus.PUBLISHED,
                    notes: '[TEST] Schedule de test',
                },
            });
            console.log(`\n✅ Schedule créé pour aujourd'hui`);
        }
        else {
            console.log(`\n✅ Schedule existant trouvé pour aujourd'hui`);
        }
        const lateTime = new Date(today);
        lateTime.setHours(8, 25, 0, 0);
        const lateAttendance = await prisma.attendance.create({
            data: {
                tenantId: TEST_TENANT_ID,
                employeeId: employee.id,
                timestamp: lateTime,
                type: client_1.AttendanceType.IN,
                method: client_1.DeviceType.MANUAL,
                hasAnomaly: true,
                anomalyType: 'LATE',
                lateMinutes: 25,
                anomalyNote: '[TEST] Retard de 25 minutes',
            },
        });
        console.log(`\n✅ Pointage LATE créé (25 min de retard)`);
        console.log(`   ID: ${lateAttendance.id}`);
        console.log('\n' + '='.repeat(50));
        console.log('📊 VÉRIFICATION DES DONNÉES\n');
        const anomalies = await prisma.attendance.findMany({
            where: {
                tenantId: TEST_TENANT_ID,
                hasAnomaly: true,
                timestamp: { gte: today },
            },
            select: {
                id: true,
                anomalyType: true,
                lateMinutes: true,
                timestamp: true,
            },
        });
        console.log(`Anomalies aujourd'hui: ${anomalies.length}`);
        anomalies.forEach((a) => {
            console.log(`   - ${a.anomalyType}: ${a.lateMinutes || 0} min (${a.timestamp.toLocaleTimeString()})`);
        });
        const lateNotifs = await prisma.lateNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID, sessionDate: { gte: today } },
        });
        console.log(`\nNotifications LATE envoyées: ${lateNotifs}`);
        const absenceNotifs = await prisma.absenceNotificationLog.count({
            where: { tenantId: TEST_TENANT_ID },
        });
        console.log(`Notifications ABSENCE totales: ${absenceNotifs}`);
        const emailLogs = await prisma.emailLog.findMany({
            where: {
                tenantId: TEST_TENANT_ID,
                sentAt: { gte: today },
            },
            orderBy: { sentAt: 'desc' },
            take: 5,
        });
        console.log(`\n📧 Derniers emails envoyés aujourd'hui: ${emailLogs.length}`);
        emailLogs.forEach((e) => {
            console.log(`   - ${e.type}: ${e.subject} (${e.status})`);
        });
        console.log('\n' + '='.repeat(50));
        console.log('✅ TEST TERMINÉ');
        console.log('='.repeat(50));
        console.log('\n⚡ PROCHAINES ÉTAPES:');
        console.log('   1. Les jobs cron vont détecter les anomalies');
        console.log('   2. Les emails seront envoyés au manager');
        console.log('   3. Vérifiez les logs du backend pour les détails');
        console.log('');
        console.log('💡 Pour déclencher manuellement les jobs:');
        console.log('   - Les jobs s\'exécutent toutes les 15 minutes');
        console.log('   - Vérifiez la console backend pour les logs');
    }
    catch (error) {
        console.error('❌ Erreur:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-email-simple.js.map