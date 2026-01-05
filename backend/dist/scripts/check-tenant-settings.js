"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const settings = await prisma.tenantSettings.findMany({
        include: {
            tenant: true,
        },
    });
    console.log('\n⚙️ Configuration TenantSettings pour les notifications:');
    console.log('=========================================================\n');
    settings.forEach((s) => {
        console.log(`📌 Tenant: ${s.tenant?.name || 'N/A'} (${s.tenantId.substring(0, 8)}...)`);
        console.log('');
        console.log('   🕐 LATE (Retard):');
        console.log(`      - lateToleranceEntry: ${s.lateToleranceEntry ?? 'NON DÉFINI'} min`);
        console.log(`      - lateNotificationThresholdMinutes: ${s.lateNotificationThresholdMinutes ?? 'NON DÉFINI'} min`);
        console.log(`      - lateNotificationFrequencyMinutes: ${s.lateNotificationFrequencyMinutes ?? 'NON DÉFINI'} min`);
        console.log('');
        console.log('   ⏰ ABSENCE_PARTIAL (Absence partielle):');
        console.log(`      - absencePartialThreshold: ${s.absencePartialThreshold ?? 'NON DÉFINI'} heures`);
        console.log(`      - absencePartialNotificationFrequencyMinutes: ${s.absencePartialNotificationFrequencyMinutes ?? 'NON DÉFINI'} min`);
        console.log('');
        console.log('   ❌ ABSENCE (Absence complète):');
        console.log(`      - absenceDetectionTime: ${s.absenceDetectionTime ?? 'NON DÉFINI'}`);
        console.log(`      - absenceNotificationFrequencyMinutes: ${s.absenceNotificationFrequencyMinutes ?? 'NON DÉFINI'} min`);
        console.log(`      - absenceDetectionBufferMinutes: ${s.absenceDetectionBufferMinutes ?? 'NON DÉFINI'} min`);
        console.log('');
        console.log('   📅 Général:');
        console.log(`      - workingDays: ${JSON.stringify(s.workingDays) ?? 'NON DÉFINI'}`);
        console.log(`      - timezone (Tenant): ${s.tenant?.timezone ?? 'NON DÉFINI'}`);
        console.log('\n' + '='.repeat(60) + '\n');
    });
    console.log('📋 RÉSUMÉ:');
    console.log(`   Total tenants configurés: ${settings.length}`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-tenant-settings.js.map