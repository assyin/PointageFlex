import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteSchedule() {
  try {
    console.log('🗑️  Suppression des plannings pour le 01/01/2026...\n');

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

    // Date du 01/01/2026
    const targetDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));

    console.log(`📅 Date cible: ${targetDate.toISOString()}\n`);

    // Chercher tous les plannings pour cette date
    const schedules = await prisma.schedule.findMany({
      where: {
        employeeId: employee.id,
        date: targetDate,
      },
      include: {
        shift: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (schedules.length === 0) {
      console.log('✅ Aucun planning à supprimer');
      return;
    }

    console.log(`📋 ${schedules.length} planning(s) trouvé(s):\n`);
    schedules.forEach((s, i) => {
      console.log(`   ${i + 1}. Shift: ${s.shift.name}, Statut: ${s.status}, ID: ${s.id}`);
    });

    console.log('\n⚠️  Suppression en cours...\n');

    // Supprimer les plannings
    const result = await prisma.schedule.deleteMany({
      where: {
        employeeId: employee.id,
        date: targetDate,
      },
    });

    console.log(`✅ ${result.count} planning(s) supprimé(s) avec succès !`);
    console.log('\n💡 Vous pouvez maintenant créer un nouveau planning pour le 01/01/2026');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSchedule();
