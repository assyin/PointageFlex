import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function suspendSchedulesInApprovedLeaves() {
  try {
    console.log('🔄 Migration: Suspension rétroactive des plannings dans les périodes de congés approuvés\n');

    // 1. Trouver tous les congés approuvés
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    console.log(`📋 ${approvedLeaves.length} congé(s) approuvé(s) trouvé(s)\n`);

    let totalSuspended = 0;
    let leavesWithSchedules = 0;

    for (const leave of approvedLeaves) {
      console.log(`\n--- Congé ${leave.id.substring(0, 8)} ---`);
      console.log(`Employé: ${leave.employee.firstName} ${leave.employee.lastName} (${leave.employee.matricule})`);
      console.log(`Type: ${leave.leaveType.name}`);
      console.log(`Période: ${leave.startDate.toISOString().split('T')[0]} → ${leave.endDate.toISOString().split('T')[0]}`);

      // 2. Trouver tous les plannings PUBLISHED dans la période du congé
      const schedulesToSuspend = await prisma.schedule.findMany({
        where: {
          tenantId: leave.tenantId,
          employeeId: leave.employeeId,
          date: {
            gte: leave.startDate,
            lte: leave.endDate,
          },
          status: 'PUBLISHED', // Seulement les plannings publiés
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

      if (schedulesToSuspend.length === 0) {
        console.log(`   ✓ Aucun planning à suspendre`);
        continue;
      }

      console.log(`   ⚠️  ${schedulesToSuspend.length} planning(s) PUBLISHED trouvé(s) dans la période:`);
      schedulesToSuspend.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.date.toISOString().split('T')[0]} - ${s.shift.name} (${s.shift.code})`);
      });

      // 3. Suspendre tous ces plannings
      const result = await prisma.schedule.updateMany({
        where: {
          id: {
            in: schedulesToSuspend.map((s) => s.id),
          },
        },
        data: {
          status: 'SUSPENDED_BY_LEAVE',
          suspendedByLeaveId: leave.id,
          suspendedAt: new Date(),
        },
      });

      console.log(`   ✅ ${result.count} planning(s) suspendu(s)`);
      totalSuspended += result.count;
      leavesWithSchedules++;
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`Total congés approuvés: ${approvedLeaves.length}`);
    console.log(`Congés avec des plannings à suspendre: ${leavesWithSchedules}`);
    console.log(`Total plannings suspendus: ${totalSuspended}`);
    console.log('='.repeat(60));

    if (totalSuspended > 0) {
      console.log('\n✅ Migration terminée avec succès!');
      console.log('   Les plannings suspendus devraient maintenant afficher l\'icône 🏖️');
    } else {
      console.log('\nℹ️  Aucun planning à suspendre.');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

suspendSchedulesInApprovedLeaves();
