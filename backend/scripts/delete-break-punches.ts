import { PrismaClient, AttendanceType } from '@prisma/client';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

/**
 * Script pour supprimer les pointages de pause des 7 derniers jours
 */
async function main() {
  console.log('🗑️  Suppression des pointages de pause des 7 derniers jours...\n');

  try {
    // Calculer la date il y a 7 jours
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    console.log(`📅 Période: ${sevenDaysAgo.toISOString().split('T')[0]} au ${today.toISOString().split('T')[0]}\n`);

    // Compter d'abord les pointages à supprimer
    const breakStartCount = await prisma.attendance.count({
      where: {
        type: AttendanceType.BREAK_START,
        timestamp: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
    });

    const breakEndCount = await prisma.attendance.count({
      where: {
        type: AttendanceType.BREAK_END,
        timestamp: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
    });

    const totalToDelete = breakStartCount + breakEndCount;

    console.log(`📊 Pointages à supprimer:`);
    console.log(`   - Début pause (BREAK_START): ${breakStartCount}`);
    console.log(`   - Fin pause (BREAK_END): ${breakEndCount}`);
    console.log(`   - Total: ${totalToDelete}\n`);

    if (totalToDelete === 0) {
      console.log('✅ Aucun pointage de pause à supprimer.\n');
      return;
    }

    // Supprimer les pointages de début de pause
    const deletedBreakStart = await prisma.attendance.deleteMany({
      where: {
        type: AttendanceType.BREAK_START,
        timestamp: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
    });

    console.log(`✅ ${deletedBreakStart.count} pointages de début de pause supprimés`);

    // Supprimer les pointages de fin de pause
    const deletedBreakEnd = await prisma.attendance.deleteMany({
      where: {
        type: AttendanceType.BREAK_END,
        timestamp: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
    });

    console.log(`✅ ${deletedBreakEnd.count} pointages de fin de pause supprimés`);

    const totalDeleted = deletedBreakStart.count + deletedBreakEnd.count;
    console.log(`\n✅ Total supprimé: ${totalDeleted} pointages\n`);

    console.log('✅ Suppression terminée avec succès!\n');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
