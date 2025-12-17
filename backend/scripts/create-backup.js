const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();

const BACKUP_DIR = path.join(__dirname, '../../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
const backupFolder = path.join(BACKUP_DIR, `backup_${timestamp}`);

// Créer le dossier de backup
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

console.log('🔄 Création du backup système...');
console.log('📂 Dossier:', backupFolder);
console.log('================================================\n');

// Fonction pour sauvegarder une table
async function backupTable(modelName, data) {
  const fileName = path.join(backupFolder, `${modelName}.json`);
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log(`✅ ${modelName}: ${data.length} enregistrements sauvegardés`);
  return data.length;
}

// Fonction principale
async function createBackup() {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      tables: {},
      totalRecords: 0,
    };

    // Sauvegarder les tenants
    const tenants = await prisma.tenant.findMany();
    stats.tables.Tenant = await backupTable('Tenant', tenants);
    stats.totalRecords += stats.tables.Tenant;

    // Sauvegarder les utilisateurs (sans les mots de passe en clair)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
    stats.tables.User = await backupTable('User', users);
    stats.totalRecords += stats.tables.User;

    // Sauvegarder les départements
    const departments = await prisma.department.findMany();
    stats.tables.Department = await backupTable('Department', departments);
    stats.totalRecords += stats.tables.Department;

    // Sauvegarder les postes
    const positions = await prisma.position.findMany();
    stats.tables.Position = await backupTable('Position', positions);
    stats.totalRecords += stats.tables.Position;

    // Sauvegarder les sites
    const sites = await prisma.site.findMany();
    stats.tables.Site = await backupTable('Site', sites);
    stats.totalRecords += stats.tables.Site;

    // Sauvegarder les site managers
    const siteManagers = await prisma.siteManager.findMany();
    stats.tables.SiteManager = await backupTable('SiteManager', siteManagers);
    stats.totalRecords += stats.tables.SiteManager;

    // Sauvegarder les employés
    const employees = await prisma.employee.findMany();
    stats.tables.Employee = await backupTable('Employee', employees);
    stats.totalRecords += stats.tables.Employee;

    // Sauvegarder les plannings (limité aux 3 derniers mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: threeMonthsAgo,
        },
      },
    });
    stats.tables.Schedule = await backupTable('Schedule', schedules);
    stats.totalRecords += stats.tables.Schedule;

    // Sauvegarder les présences (limité aux 3 derniers mois)
    const attendances = await prisma.attendance.findMany({
      where: {
        timestamp: {
          gte: threeMonthsAgo,
        },
      },
    });
    stats.tables.Attendance = await backupTable('Attendance', attendances);
    stats.totalRecords += stats.tables.Attendance;

    // Sauvegarder les congés
    const leaves = await prisma.leave.findMany();
    stats.tables.Leave = await backupTable('Leave', leaves);
    stats.totalRecords += stats.tables.Leave;

    // Sauvegarder les types de congés
    const leaveTypes = await prisma.leaveType.findMany();
    stats.tables.LeaveType = await backupTable('LeaveType', leaveTypes);
    stats.totalRecords += stats.tables.LeaveType;

    // Sauvegarder les heures supplémentaires
    const overtimes = await prisma.overtime.findMany();
    stats.tables.Overtime = await backupTable('Overtime', overtimes);
    stats.totalRecords += stats.tables.Overtime;

    // Sauvegarder les shifts
    const shifts = await prisma.shift.findMany();
    stats.tables.Shift = await backupTable('Shift', shifts);
    stats.totalRecords += stats.tables.Shift;

    // Sauvegarder les équipes
    const teams = await prisma.team.findMany();
    stats.tables.Team = await backupTable('Team', teams);
    stats.totalRecords += stats.tables.Team;

    // Sauvegarder les jours fériés
    const holidays = await prisma.holiday.findMany();
    stats.tables.Holiday = await backupTable('Holiday', holidays);
    stats.totalRecords += stats.tables.Holiday;

    // Sauvegarder les rôles
    const roles = await prisma.role.findMany();
    stats.tables.Role = await backupTable('Role', roles);
    stats.totalRecords += stats.tables.Role;

    // Sauvegarder les permissions
    const permissions = await prisma.permission.findMany();
    stats.tables.Permission = await backupTable('Permission', permissions);
    stats.totalRecords += stats.tables.Permission;

    // Sauvegarder les appareils
    const devices = await prisma.attendanceDevice.findMany();
    stats.tables.AttendanceDevice = await backupTable('AttendanceDevice', devices);
    stats.totalRecords += stats.tables.AttendanceDevice;

    // Créer un fichier de statistiques
    const statsFile = path.join(backupFolder, 'backup_stats.json');
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    console.log('\n📊 Statistiques du backup:');
    console.log(`   Total d'enregistrements: ${stats.totalRecords}`);
    console.log(`   Tables sauvegardées: ${Object.keys(stats.tables).length}`);

    // Créer un README
    const readme = `# Backup PointaFlex
Date: ${new Date().toLocaleString('fr-FR')}
Timestamp: ${timestamp}

## Contenu du backup
${Object.entries(stats.tables)
  .map(([table, count]) => `- ${table}: ${count} enregistrements`)
  .join('\n')}

Total: ${stats.totalRecords} enregistrements

## Restauration
Pour restaurer ce backup, utilisez le script restore-backup.js avec ce dossier.
`;

    fs.writeFileSync(path.join(backupFolder, 'README.md'), readme);

    // Compresser le backup
    console.log('\n📦 Compression du backup...');
    const tarFile = path.join(BACKUP_DIR, `backup_${timestamp}.tar.gz`);
    await execPromise(`tar -czf "${tarFile}" -C "${BACKUP_DIR}" "backup_${timestamp}"`);

    const stats_tar = fs.statSync(tarFile);
    const fileSizeInMB = (stats_tar.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup compressé: backup_${timestamp}.tar.gz (${fileSizeInMB} MB)`);

    // Supprimer le dossier non compressé
    fs.rmSync(backupFolder, { recursive: true, force: true });

    console.log('\n================================================');
    console.log('✅ Backup système terminé avec succès!');
    console.log(`📂 Fichier: ${tarFile}`);
    console.log('================================================');

    return tarFile;
  } catch (error) {
    console.error('❌ Erreur lors de la création du backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le backup
createBackup()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
