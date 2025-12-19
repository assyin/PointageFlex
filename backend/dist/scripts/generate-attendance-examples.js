"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config({ path: '.env' });
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Génération de pointages pour 20 employés aléatoires...\n');
    try {
        const tenants = await prisma.tenant.findMany();
        if (tenants.length === 0) {
            console.error('❌ Aucun tenant trouvé dans la base de données');
            return;
        }
        const tenant = tenants[0];
        console.log(`📋 Tenant sélectionné: ${tenant.companyName} (${tenant.id})\n`);
        const allEmployees = await prisma.employee.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true,
            },
            include: {
                site: true,
                currentShift: true,
            },
            take: 100,
        });
        if (allEmployees.length === 0) {
            console.error('❌ Aucun employé actif trouvé');
            return;
        }
        const selectedEmployees = allEmployees
            .sort(() => Math.random() - 0.5)
            .slice(0, 20);
        console.log(`✅ ${selectedEmployees.length} employés sélectionnés:\n`);
        selectedEmployees.forEach((emp, index) => {
            console.log(`   ${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.matricule})`);
        });
        console.log('');
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        console.log(`📅 Période: ${startDate.toISOString().split('T')[0]} au ${endDate.toISOString().split('T')[0]}\n`);
        const scenarios = [
            { type: 'normal', percentage: 60, name: 'Normal' },
            { type: 'late', percentage: 15, name: 'Retard' },
            { type: 'earlyLeave', percentage: 5, name: 'Départ anticipé' },
            { type: 'missingOut', percentage: 5, name: 'Oubli de sortie' },
            { type: 'doubleIn', percentage: 3, name: 'Double entrée' },
            { type: 'longBreak', percentage: 3, name: 'Pause longue' },
            { type: 'mission', percentage: 4, name: 'Mission' },
            { type: 'absence', percentage: 5, name: 'Absence' },
        ];
        console.log('📊 Distribution des scénarios:');
        scenarios.forEach(s => {
            console.log(`   - ${s.name}: ${s.percentage}%`);
        });
        console.log('');
        let totalGenerated = 0;
        const stats = {
            normal: 0,
            late: 0,
            earlyLeave: 0,
            missingOut: 0,
            doubleIn: 0,
            longBreak: 0,
            mission: 0,
            absence: 0,
        };
        for (const employee of selectedEmployees) {
            console.log(`\n👤 Génération pour ${employee.firstName} ${employee.lastName}...`);
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    continue;
                }
                const random = Math.random() * 100;
                let cumulative = 0;
                let selectedScenario = scenarios[0];
                for (const scenario of scenarios) {
                    cumulative += scenario.percentage;
                    if (random <= cumulative) {
                        selectedScenario = scenario;
                        break;
                    }
                }
                const dateStr = currentDate.toISOString().split('T')[0];
                const baseHour = 8;
                try {
                    if (selectedScenario.type === 'absence') {
                        stats.absence++;
                        console.log(`   ❌ ${dateStr}: Absence`);
                    }
                    else if (selectedScenario.type === 'normal') {
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 12, client_1.AttendanceType.BREAK_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 13, client_1.AttendanceType.BREAK_END);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 17, client_1.AttendanceType.OUT);
                        stats.normal++;
                        totalGenerated += 4;
                        console.log(`   ✅ ${dateStr}: Normal (4 pointages)`);
                    }
                    else if (selectedScenario.type === 'late') {
                        const lateMinutes = 15 + Math.floor(Math.random() * 45);
                        const lateHour = baseHour + Math.floor(lateMinutes / 60);
                        const lateMin = lateMinutes % 60;
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, lateHour, client_1.AttendanceType.IN, lateMin);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 12, client_1.AttendanceType.BREAK_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 13, client_1.AttendanceType.BREAK_END);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 17, client_1.AttendanceType.OUT);
                        stats.late++;
                        totalGenerated += 4;
                        console.log(`   ⏰ ${dateStr}: Retard de ${lateMinutes}min (4 pointages)`);
                    }
                    else if (selectedScenario.type === 'earlyLeave') {
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 12, client_1.AttendanceType.BREAK_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 13, client_1.AttendanceType.BREAK_END);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 15, client_1.AttendanceType.OUT, 30);
                        stats.earlyLeave++;
                        totalGenerated += 4;
                        console.log(`   🏃 ${dateStr}: Départ anticipé (4 pointages)`);
                    }
                    else if (selectedScenario.type === 'missingOut') {
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 12, client_1.AttendanceType.BREAK_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 13, client_1.AttendanceType.BREAK_END);
                        stats.missingOut++;
                        totalGenerated += 3;
                        console.log(`   ⚠️  ${dateStr}: Oubli de sortie (3 pointages)`);
                    }
                    else if (selectedScenario.type === 'doubleIn') {
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN, 30);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 12, client_1.AttendanceType.BREAK_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 13, client_1.AttendanceType.BREAK_END);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 17, client_1.AttendanceType.OUT);
                        stats.doubleIn++;
                        totalGenerated += 5;
                        console.log(`   🔄 ${dateStr}: Double entrée (5 pointages)`);
                    }
                    else if (selectedScenario.type === 'longBreak') {
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 12, client_1.AttendanceType.BREAK_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 14, client_1.AttendanceType.BREAK_END, 30);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 17, client_1.AttendanceType.OUT);
                        stats.longBreak++;
                        totalGenerated += 4;
                        console.log(`   ⏸️  ${dateStr}: Pause longue (4 pointages)`);
                    }
                    else if (selectedScenario.type === 'mission') {
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, baseHour, client_1.AttendanceType.IN);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 9, client_1.AttendanceType.MISSION_START);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 15, client_1.AttendanceType.MISSION_END);
                        await createAttendance(tenant.id, employee.id, employee.siteId, dateStr, 17, client_1.AttendanceType.OUT);
                        stats.mission++;
                        totalGenerated += 4;
                        console.log(`   🚗 ${dateStr}: Mission (4 pointages)`);
                    }
                }
                catch (error) {
                    console.error(`   ❌ Erreur pour ${dateStr}:`, error.message);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        console.log('\n\n📊 STATISTIQUES FINALES\n');
        console.log('═══════════════════════════════════════');
        console.log(`Total de pointages générés: ${totalGenerated}`);
        console.log(`\nRépartition par scénario:`);
        console.log(`  ✅ Normal: ${stats.normal} journées`);
        console.log(`  ⏰ Retard: ${stats.late} journées`);
        console.log(`  🏃 Départ anticipé: ${stats.earlyLeave} journées`);
        console.log(`  ⚠️  Oubli de sortie: ${stats.missingOut} journées`);
        console.log(`  🔄 Double entrée: ${stats.doubleIn} journées`);
        console.log(`  ⏸️  Pause longue: ${stats.longBreak} journées`);
        console.log(`  🚗 Mission: ${stats.mission} journées`);
        console.log(`  ❌ Absence: ${stats.absence} journées`);
        console.log('═══════════════════════════════════════\n');
        console.log('✅ Génération terminée avec succès!\n');
    }
    catch (error) {
        console.error('❌ Erreur lors de la génération:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
async function createAttendance(tenantId, employeeId, siteId, dateStr, hour, type, minutes = 0) {
    const timestamp = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    const variance = Math.floor(Math.random() * 10) - 5;
    timestamp.setMinutes(timestamp.getMinutes() + variance);
    await prisma.attendance.create({
        data: {
            tenantId,
            employeeId,
            siteId,
            timestamp,
            type: type,
            method: 'MANUAL',
            isGenerated: true,
            generatedBy: 'SCRIPT_GENERATE_ATTENDANCE_EXAMPLES',
        },
    });
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=generate-attendance-examples.js.map