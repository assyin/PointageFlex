"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config({ path: '.env' });
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔍 Détection rétroactive des anomalies de pointage...\n');
    try {
        const tenants = await prisma.tenant.findMany();
        if (tenants.length === 0) {
            console.error('❌ Aucun tenant trouvé');
            return;
        }
        for (const tenant of tenants) {
            console.log(`\n📋 Traitement du tenant: ${tenant.companyName} (${tenant.id})\n`);
            const employees = await prisma.employee.findMany({
                where: { tenantId: tenant.id },
            });
            console.log(`✅ ${employees.length} employés trouvés\n`);
            let totalAnomalies = 0;
            for (const employee of employees) {
                const attendances = await prisma.attendance.findMany({
                    where: {
                        tenantId: tenant.id,
                        employeeId: employee.id,
                    },
                    orderBy: { timestamp: 'asc' },
                });
                if (attendances.length === 0)
                    continue;
                const attendancesByDay = new Map();
                for (const attendance of attendances) {
                    const dateKey = attendance.timestamp.toISOString().split('T')[0];
                    if (!attendancesByDay.has(dateKey)) {
                        attendancesByDay.set(dateKey, []);
                    }
                    attendancesByDay.get(dateKey).push(attendance);
                }
                for (const [dateKey, dayRecords] of attendancesByDay.entries()) {
                    const anomalies = detectDailyAnomalies(dayRecords);
                    if (anomalies.length > 0) {
                        console.log(`\n⚠️  Anomalies détectées pour ${employee.firstName} ${employee.lastName} le ${dateKey}:`);
                        for (const anomaly of anomalies) {
                            totalAnomalies++;
                            await prisma.attendance.update({
                                where: { id: anomaly.attendanceId },
                                data: {
                                    hasAnomaly: true,
                                    anomalyType: anomaly.type,
                                    anomalyNote: anomaly.note,
                                },
                            });
                            console.log(`   - ${anomaly.type}: ${anomaly.note}`);
                        }
                    }
                }
            }
            console.log(`\n✅ Total des anomalies détectées pour ${tenant.companyName}: ${totalAnomalies}\n`);
        }
        console.log('\n✅ Détection terminée avec succès!\n');
    }
    catch (error) {
        console.error('❌ Erreur lors de la détection:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
function detectDailyAnomalies(dayRecords) {
    const anomalies = [];
    const inRecords = dayRecords.filter(r => r.type === client_1.AttendanceType.IN);
    const outRecords = dayRecords.filter(r => r.type === client_1.AttendanceType.OUT);
    if (inRecords.length > 1) {
        for (let i = 1; i < inRecords.length; i++) {
            anomalies.push({
                attendanceId: inRecords[i].id,
                type: 'DOUBLE_IN',
                note: 'Double pointage d\'entrée détecté',
            });
        }
    }
    if (outRecords.length > 1) {
        for (let i = 0; i < outRecords.length - 1; i++) {
            anomalies.push({
                attendanceId: outRecords[i].id,
                type: 'DOUBLE_OUT',
                note: 'Double pointage de sortie détecté',
            });
        }
    }
    if (inRecords.length > 0 && outRecords.length === 0) {
        anomalies.push({
            attendanceId: inRecords[0].id,
            type: 'MISSING_OUT',
            note: 'Oubli de pointage de sortie',
        });
    }
    if (outRecords.length > 0 && inRecords.length === 0) {
        anomalies.push({
            attendanceId: outRecords[0].id,
            type: 'MISSING_IN',
            note: 'Pointage de sortie sans entrée',
        });
    }
    if (inRecords.length > outRecords.length && inRecords.length > 0) {
        const lastIn = inRecords[inRecords.length - 1];
        const alreadyMarked = anomalies.some(a => a.attendanceId === lastIn.id);
        if (!alreadyMarked) {
            anomalies.push({
                attendanceId: lastIn.id,
                type: 'MISSING_OUT',
                note: 'Oubli de pointage de sortie',
            });
        }
    }
    return anomalies;
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=detect-anomalies-retroactive.js.map