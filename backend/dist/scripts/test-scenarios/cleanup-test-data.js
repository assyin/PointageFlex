"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🧹 Nettoyage des données de test...\n');
    try {
        const tenant = await prisma.tenant.findFirst({
            where: { slug: 'test' },
        });
        if (!tenant) {
            console.log('ℹ️  Aucun tenant de test trouvé.');
            return;
        }
        console.log(`📝 Tenant trouvé: ${tenant.companyName} (${tenant.id})\n`);
        console.log('🗑️  Suppression des pointages de test...');
        const deletedAttendances = await prisma.attendance.deleteMany({
            where: {
                tenantId: tenant.id,
                deviceId: { startsWith: 'TEST_' },
            },
        });
        console.log(`✅ ${deletedAttendances.count} pointage(s) supprimé(s)`);
        console.log('\n🗑️  Suppression des overtimes de test...');
        const deletedOvertimes = await prisma.overtime.deleteMany({
            where: {
                tenantId: tenant.id,
                notes: { contains: 'Test' },
            },
        });
        console.log(`✅ ${deletedOvertimes.count} overtime(s) supprimé(s)`);
        console.log('\n🗑️  Réinitialisation des anomalies de test...');
        const resetAnomalies = await prisma.attendance.updateMany({
            where: {
                tenantId: tenant.id,
                deviceId: { startsWith: 'TEST_' },
                hasAnomaly: true,
            },
            data: {
                hasAnomaly: false,
                anomalyType: null,
                anomalyNote: null,
            },
        });
        console.log(`✅ ${resetAnomalies.count} anomalie(s) réinitialisée(s) dans les pointages`);
        console.log('\n⚠️  Voulez-vous supprimer les employés de test ? (y/N)');
        console.log('\n' + '='.repeat(60));
        console.log('✅ Nettoyage terminé !');
        console.log('='.repeat(60));
    }
    catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=cleanup-test-data.js.map