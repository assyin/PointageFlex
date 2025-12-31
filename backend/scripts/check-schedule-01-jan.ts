import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchedule() {
  try {
    console.log('🔍 Recherche des plannings pour le 01/01/2026...\n');

    // Chercher l'employé FARID NABI
    const employee = await prisma.employee.findFirst({
      where: { matricule: 'TEMP-003' },
      select: { id: true, firstName: true, lastName: true, matricule: true },
    });

    if (!employee) {
      console.error('❌ Employé TEMP-003 non trouvé');
      return;
    }

    console.log(`✅ Employé trouvé: ${employee.firstName} ${employee.lastName} (${employee.matricule})`);
    console.log(`   ID: ${employee.id}\n`);

    // Date du 01/01/2026 avec plage
    const targetDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));
    const startOfDay = new Date(Date.UTC(2025, 11, 31, 0, 0, 0, 0)); // 31 déc
    const endOfDay = new Date(Date.UTC(2026, 0, 2, 23, 59, 59, 999)); // 2 jan

    console.log(`📅 Date cible: ${targetDate.toISOString()}`);
    console.log(`   Plage de recherche: ${startOfDay.toISOString()} à ${endOfDay.toISOString()}\n`);

    // Chercher TOUS les plannings dans cette plage
    const schedules = await prisma.schedule.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        shift: {
          select: {
            name: true,
            code: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    console.log(`📋 Nombre de plannings trouvés: ${schedules.length}\n`);

    if (schedules.length === 0) {
      console.log('✅ Aucun planning trouvé pour cette date');
      return;
    }

    schedules.forEach((schedule, index) => {
      console.log(`--- Planning ${index + 1} ---`);
      console.log(`   ID: ${schedule.id}`);
      console.log(`   Statut: ${schedule.status}`);
      console.log(`   Date: ${schedule.date.toISOString()}`);
      console.log(`   Shift: ${schedule.shift.name} (${schedule.shift.code})`);
      console.log(`   Horaires: ${schedule.shift.startTime} - ${schedule.shift.endTime}`);
      console.log(`   Custom Start: ${schedule.customStartTime || 'N/A'}`);
      console.log(`   Custom End: ${schedule.customEndTime || 'N/A'}`);
      console.log(`   Créé le: ${schedule.createdAt.toISOString()}`);
      console.log(`   Mis à jour le: ${schedule.updatedAt.toISOString()}`);
      console.log();
    });

    // Proposer de supprimer
    console.log('\n⚠️  Pour supprimer ces plannings, utilisez la commande :');
    console.log(`   npm run ts-node scripts/delete-schedule.ts ${schedules.map(s => s.id).join(' ')}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchedule();
