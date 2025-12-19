import { PrismaClient, AttendanceType } from '@prisma/client';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

/**
 * Script pour détecter rétroactivement les anomalies dans les pointages existants
 */
async function main() {
  console.log('🔍 Détection rétroactive des anomalies de pointage...\n');

  try {
    // Récupérer tous les tenants
    const tenants = await prisma.tenant.findMany();

    if (tenants.length === 0) {
      console.error('❌ Aucun tenant trouvé');
      return;
    }

    for (const tenant of tenants) {
      console.log(`\n📋 Traitement du tenant: ${tenant.companyName} (${tenant.id})\n`);

      // Récupérer tous les employés du tenant
      const employees = await prisma.employee.findMany({
        where: { tenantId: tenant.id },
      });

      console.log(`✅ ${employees.length} employés trouvés\n`);

      let totalAnomalies = 0;

      for (const employee of employees) {
        // Récupérer tous les pointages de cet employé, groupés par jour
        const attendances = await prisma.attendance.findMany({
          where: {
            tenantId: tenant.id,
            employeeId: employee.id,
          },
          orderBy: { timestamp: 'asc' },
        });

        if (attendances.length === 0) continue;

        // Grouper par jour
        const attendancesByDay = new Map<string, typeof attendances>();

        for (const attendance of attendances) {
          const dateKey = attendance.timestamp.toISOString().split('T')[0];
          if (!attendancesByDay.has(dateKey)) {
            attendancesByDay.set(dateKey, []);
          }
          attendancesByDay.get(dateKey)!.push(attendance);
        }

        // Analyser chaque jour
        for (const [dateKey, dayRecords] of attendancesByDay.entries()) {
          const anomalies = detectDailyAnomalies(dayRecords);

          if (anomalies.length > 0) {
            console.log(`\n⚠️  Anomalies détectées pour ${employee.firstName} ${employee.lastName} le ${dateKey}:`);

            for (const anomaly of anomalies) {
              totalAnomalies++;

              // Mettre à jour le pointage avec l'anomalie
              await prisma.attendance.update({
                where: { id: anomaly.attendanceId },
                data: {
                  hasAnomaly: true,
                  anomalyType: anomaly.type,
                  anomalyNote: anomaly.note,
                },
              });

              console.log(`   - ${anomaly.type}: ${anomaly.note}`);
            }
          }
        }
      }

      console.log(`\n✅ Total des anomalies détectées pour ${tenant.companyName}: ${totalAnomalies}\n`);
    }

    console.log('\n✅ Détection terminée avec succès!\n');

  } catch (error) {
    console.error('❌ Erreur lors de la détection:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Détecte les anomalies pour une journée de pointages
 */
function detectDailyAnomalies(dayRecords: any[]): Array<{
  attendanceId: string;
  type: string;
  note: string;
}> {
  const anomalies: Array<{
    attendanceId: string;
    type: string;
    note: string;
  }> = [];

  const inRecords = dayRecords.filter(r => r.type === AttendanceType.IN);
  const outRecords = dayRecords.filter(r => r.type === AttendanceType.OUT);

  // 1. Détection des doubles entrées
  if (inRecords.length > 1) {
    // Marquer toutes les entrées sauf la première comme anomalie
    for (let i = 1; i < inRecords.length; i++) {
      anomalies.push({
        attendanceId: inRecords[i].id,
        type: 'DOUBLE_IN',
        note: 'Double pointage d\'entrée détecté',
      });
    }
  }

  // 2. Détection des doubles sorties
  if (outRecords.length > 1) {
    // Marquer toutes les sorties sauf la dernière comme anomalie
    for (let i = 0; i < outRecords.length - 1; i++) {
      anomalies.push({
        attendanceId: outRecords[i].id,
        type: 'DOUBLE_OUT',
        note: 'Double pointage de sortie détecté',
      });
    }
  }

  // 3. Détection d'entrée sans sortie (oubli de sortie)
  if (inRecords.length > 0 && outRecords.length === 0) {
    anomalies.push({
      attendanceId: inRecords[0].id,
      type: 'MISSING_OUT',
      note: 'Oubli de pointage de sortie',
    });
  }

  // 4. Détection de sortie sans entrée
  if (outRecords.length > 0 && inRecords.length === 0) {
    anomalies.push({
      attendanceId: outRecords[0].id,
      type: 'MISSING_IN',
      note: 'Pointage de sortie sans entrée',
    });
  }

  // 5. Détection d'entrée sans sortie correspondante (plus d'entrées que de sorties)
  if (inRecords.length > outRecords.length && inRecords.length > 0) {
    // La dernière entrée n'a pas de sortie correspondante
    const lastIn = inRecords[inRecords.length - 1];
    // Vérifier si ce n'est pas déjà marqué comme anomalie
    const alreadyMarked = anomalies.some(a => a.attendanceId === lastIn.id);
    if (!alreadyMarked) {
      anomalies.push({
        attendanceId: lastIn.id,
        type: 'MISSING_OUT',
        note: 'Oubli de pointage de sortie',
      });
    }
  }

  return anomalies;
}

// Exécuter le script
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
