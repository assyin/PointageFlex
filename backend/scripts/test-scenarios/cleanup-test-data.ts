import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de nettoyage des données de test
 * Supprime les pointages, overtimes et autres données de test
 */

async function main() {
  console.log('🧹 Nettoyage des données de test...\n');

  try {
    // 1. Trouver le tenant de test
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'test' },
    });

    if (!tenant) {
      console.log('ℹ️  Aucun tenant de test trouvé.');
      return;
    }

    console.log(`📝 Tenant trouvé: ${tenant.companyName} (${tenant.id})\n`);

    // 2. Supprimer les pointages de test
    console.log('🗑️  Suppression des pointages de test...');
    const deletedAttendances = await prisma.attendance.deleteMany({
      where: {
        tenantId: tenant.id,
        deviceId: { startsWith: 'TEST_' },
      },
    });
    console.log(`✅ ${deletedAttendances.count} pointage(s) supprimé(s)`);

    // 3. Supprimer les overtimes de test
    console.log('\n🗑️  Suppression des overtimes de test...');
    const deletedOvertimes = await prisma.overtime.deleteMany({
      where: {
        tenantId: tenant.id,
        notes: { contains: 'Test' },
      },
    });
    console.log(`✅ ${deletedOvertimes.count} overtime(s) supprimé(s)`);

    // 4. Réinitialiser les anomalies dans les pointages de test
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

    // 5. Optionnel : Supprimer les employés de test
    console.log('\n⚠️  Voulez-vous supprimer les employés de test ? (y/N)');
    // Pour automatisation, on peut commenter cette partie
    // const shouldDelete = process.argv.includes('--delete-employees');
    // if (shouldDelete) {
    //   const deletedEmployees = await prisma.employee.deleteMany({
    //     where: {
    //       tenantId: tenant.id,
    //       matricule: { in: ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'] },
    //     },
    //   });
    //   console.log(`✅ ${deletedEmployees.count} employé(s) supprimé(s)`);
    // }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Nettoyage terminé !');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

