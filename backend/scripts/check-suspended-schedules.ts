import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSuspendedSchedules() {
  try {
    console.log('🔍 Recherche des plannings suspendus...\n');

    const suspendedSchedules = await prisma.schedule.findMany({
      where: {
        status: 'SUSPENDED_BY_LEAVE',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        shift: {
          select: {
            name: true,
            code: true,
          },
        },
        suspendedByLeave: {
          select: {
            startDate: true,
            endDate: true,
            leaveType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    console.log(`📋 ${suspendedSchedules.length} planning(s) suspendu(s) trouvé(s)\n`);

    if (suspendedSchedules.length === 0) {
      console.log('ℹ️  Aucun planning suspendu par congé trouvé.');
      console.log('   Pour tester la fonctionnalité :');
      console.log('   1. Créez un planning pour un employé');
      console.log('   2. Créez un congé approuvé pour la même période');
      console.log('   3. Le planning devrait être automatiquement suspendu\n');
    } else {
      suspendedSchedules.forEach((schedule, index) => {
        console.log(`--- Planning ${index + 1} ---`);
        console.log(`   Employé: ${schedule.employee.firstName} ${schedule.employee.lastName} (${schedule.employee.matricule})`);
        console.log(`   Date: ${schedule.date.toISOString().split('T')[0]}`);
        console.log(`   Shift: ${schedule.shift.name} (${schedule.shift.code})`);
        console.log(`   Statut: ${schedule.status}`);
        if (schedule.suspendedByLeave) {
          console.log(`   Congé: ${schedule.suspendedByLeave.leaveType?.name || 'Type inconnu'}`);
          console.log(`   Période: ${schedule.suspendedByLeave.startDate.toISOString().split('T')[0]} - ${schedule.suspendedByLeave.endDate.toISOString().split('T')[0]}`);
        }
        console.log();
      });
    }

    // Vérifier aussi les plannings publiés pour comparaison
    const publishedCount = await prisma.schedule.count({
      where: { status: 'PUBLISHED' },
    });

    console.log(`📊 Statistiques:`);
    console.log(`   Plannings PUBLISHED: ${publishedCount}`);
    console.log(`   Plannings SUSPENDED_BY_LEAVE: ${suspendedSchedules.length}`);
    console.log(`   Total: ${publishedCount + suspendedSchedules.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuspendedSchedules();
