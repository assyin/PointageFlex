const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreBackup(backupFolder) {
  if (!backupFolder) {
    console.error('❌ Erreur: Veuillez spécifier le dossier de backup');
    console.log('Usage: node restore-backup.js <chemin_vers_dossier_backup>');
    process.exit(1);
  }

  if (!fs.existsSync(backupFolder)) {
    console.error(`❌ Erreur: Le dossier ${backupFolder} n'existe pas`);
    process.exit(1);
  }

  console.log('🔄 Restauration du backup...');
  console.log('📂 Source:', backupFolder);
  console.log('================================================\n');

  try {
    // Lire les statistiques du backup
    const statsFile = path.join(backupFolder, 'backup_stats.json');
    if (fs.existsSync(statsFile)) {
      const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
      console.log('📊 Informations du backup:');
      console.log(`   Date: ${new Date(stats.timestamp).toLocaleString('fr-FR')}`);
      console.log(`   Total d'enregistrements: ${stats.totalRecords}`);
      console.log(`   Tables: ${Object.keys(stats.tables).length}\n`);
    }

    // Ordre de restauration (important pour les clés étrangères)
    const restoreOrder = [
      'Tenant',
      'User',
      'Department',
      'Position',
      'Site',
      'SiteManager',
      'Employee',
      'Shift',
      'Team',
      'LeaveType',
      'Schedule',
      'Attendance',
      'Leave',
      'Overtime',
      'Holiday',
      'Role',
      'Permission',
      'AttendanceDevice',
    ];

    let totalRestored = 0;

    for (const tableName of restoreOrder) {
      const fileName = path.join(backupFolder, `${tableName}.json`);

      if (!fs.existsSync(fileName)) {
        console.log(`⚠️  ${tableName}: Fichier non trouvé, ignoré`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));

      if (data.length === 0) {
        console.log(`⚠️  ${tableName}: Aucune donnée à restaurer`);
        continue;
      }

      // Nom du modèle Prisma (première lettre en minuscule)
      const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);

      try {
        // Utiliser createMany pour l'insertion en masse
        const result = await prisma[modelName].createMany({
          data: data,
          skipDuplicates: true, // Ignorer les doublons
        });

        console.log(`✅ ${tableName}: ${result.count} enregistrements restaurés`);
        totalRestored += result.count;
      } catch (error) {
        console.error(`❌ ${tableName}: Erreur lors de la restauration`);
        console.error(`   ${error.message}`);

        // Essayer une restauration ligne par ligne en cas d'erreur
        console.log(`   Tentative de restauration ligne par ligne...`);
        let restored = 0;
        let skipped = 0;

        for (const record of data) {
          try {
            await prisma[modelName].create({
              data: record,
            });
            restored++;
          } catch (err) {
            skipped++;
          }
        }

        if (restored > 0) {
          console.log(`✅ ${tableName}: ${restored} restaurés, ${skipped} ignorés`);
          totalRestored += restored;
        }
      }
    }

    console.log('\n================================================');
    console.log('✅ Restauration terminée!');
    console.log(`📊 Total restauré: ${totalRestored} enregistrements`);
    console.log('================================================');
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer le chemin du dossier de backup depuis les arguments
const backupFolder = process.argv[2];

restoreBackup(backupFolder)
  .then(() => {
    console.log('\n✅ Script de restauration terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
