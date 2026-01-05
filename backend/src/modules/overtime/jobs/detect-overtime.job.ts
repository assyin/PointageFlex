import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { AttendanceType, OvertimeStatus } from '@prisma/client';
import { OvertimeService } from '../overtime.service';

@Injectable()
export class DetectOvertimeJob {
  private readonly logger = new Logger(DetectOvertimeJob.name);

  constructor(
    private prisma: PrismaService,
    private overtimeService: OvertimeService,
  ) {}

  /**
   * Job batch quotidien pour détecter et créer automatiquement les Overtime depuis les Attendance
   * Exécution par défaut à minuit chaque jour
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async detectOvertime() {
    this.logger.log('Démarrage de la détection automatique des heures supplémentaires...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Récupérer tous les tenants
      const tenants = await this.prisma.tenant.findMany({
        include: {
          settings: true,
        },
      });

      this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);

      for (const tenant of tenants) {
        try {
          await this.detectOvertimeForTenant(tenant.id, yesterday, yesterdayEnd);
        } catch (error) {
          this.logger.error(
            `Erreur lors de la détection des heures sup pour le tenant ${tenant.id}:`,
            error,
          );
        }
      }

      this.logger.log('Détection automatique des heures supplémentaires terminée avec succès');
    } catch (error) {
      this.logger.error('Erreur lors de la détection globale des heures sup:', error);
    }
  }

  /**
   * Détecte et crée les Overtime pour un tenant spécifique
   */
  private async detectOvertimeForTenant(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: {
        overtimeMinimumThreshold: true,
        overtimeAutoDetectType: true,
        nightShiftStart: true,
        nightShiftEnd: true,
        overtimeMajorationEnabled: true,
        overtimeRateStandard: true,
        overtimeRateNight: true,
        overtimeRateHoliday: true,
        overtimeRateEmergency: true,
        // Fallback sur anciens champs
        overtimeRate: true,
        nightShiftRate: true,
      },
    });

    const minimumThreshold = settings?.overtimeMinimumThreshold || 30; // Défaut: 30 minutes
    const autoDetectType = settings?.overtimeAutoDetectType !== false; // Activé par défaut

    // Récupérer tous les Attendance avec overtimeMinutes > seuil minimum
    const attendancesWithOvertime = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        type: AttendanceType.OUT,
        overtimeMinutes: {
          gt: minimumThreshold, // Seulement si supérieur au seuil minimum
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
            isEligibleForOvertime: true,
            maxOvertimeHoursPerMonth: true,
            maxOvertimeHoursPerWeek: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    this.logger.log(
      `Analyse de ${attendancesWithOvertime.length} pointage(s) avec heures sup pour le tenant ${tenantId}...`,
    );

    // Charger les jours fériés pour la période (si détection auto activée)
    let holidays: Set<string> = new Set();
    if (autoDetectType) {
      const holidayRecords = await this.prisma.holiday.findMany({
        where: {
          tenantId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { date: true },
      });
      holidays = new Set(holidayRecords.map(h => h.date.toISOString().split('T')[0]));
      this.logger.debug(`${holidays.size} jour(s) férié(s) trouvé(s) pour la période`);
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const attendance of attendancesWithOvertime) {
      try {
        // Vérifier l'éligibilité
        if (attendance.employee.isEligibleForOvertime === false) {
          this.logger.debug(
            `Skipping overtime pour ${attendance.employee.firstName} ${attendance.employee.lastName} (non éligible)`,
          );
          skippedCount++;
          continue;
        }

        // Vérifier si un Overtime existe déjà pour cette date
        const existingOvertime = await this.prisma.overtime.findFirst({
          where: {
            tenantId,
            employeeId: attendance.employeeId,
            date: new Date(attendance.timestamp.toISOString().split('T')[0]),
          },
        });

        if (existingOvertime) {
          this.logger.debug(
            `Overtime existe déjà pour ${attendance.employee.firstName} ${attendance.employee.lastName} le ${attendance.timestamp.toISOString().split('T')[0]}`,
          );
          skippedCount++;
          continue;
        }

        // Convertir overtimeMinutes en heures
        const overtimeHours = (attendance.overtimeMinutes || 0) / 60;

        // Vérifier les plafonds si configurés
        let hoursToCreate = overtimeHours;
        if (
          attendance.employee.maxOvertimeHoursPerMonth ||
          attendance.employee.maxOvertimeHoursPerWeek
        ) {
          const limitsCheck = await this.overtimeService.checkOvertimeLimits(
            tenantId,
            attendance.employeeId,
            overtimeHours,
            new Date(attendance.timestamp.toISOString().split('T')[0]),
          );

          if (limitsCheck.exceedsLimit) {
            this.logger.warn(
              `Plafond atteint pour ${attendance.employee.firstName} ${attendance.employee.lastName}. Overtime non créé.`,
            );
            skippedCount++;
            continue;
          }

          // Si le plafond est partiellement atteint, ajuster les heures
          if (limitsCheck.adjustedHours !== undefined && limitsCheck.adjustedHours < overtimeHours) {
            hoursToCreate = limitsCheck.adjustedHours;
            this.logger.warn(
              `Plafond partiel pour ${attendance.employee.firstName} ${attendance.employee.lastName}. ${hoursToCreate.toFixed(2)}h créées au lieu de ${overtimeHours.toFixed(2)}h`,
            );
          }
        }

        // Détecter le type d'overtime si l'option est activée
        let overtimeType: 'STANDARD' | 'NIGHT' | 'HOLIDAY' | 'EMERGENCY' = 'STANDARD';
        const dateStr = attendance.timestamp.toISOString().split('T')[0];

        if (autoDetectType) {
          // Vérifier si c'est un jour férié
          if (holidays.has(dateStr)) {
            overtimeType = 'HOLIDAY';
            this.logger.debug(`Type HOLIDAY détecté pour ${dateStr} (jour férié)`);
          }
          // Vérifier si c'est un shift de nuit
          else if (this.isNightShiftTime(attendance.timestamp, settings)) {
            overtimeType = 'NIGHT';
            this.logger.debug(`Type NIGHT détecté pour ${attendance.timestamp.toISOString()}`);
          }
        }

        // Calculer le taux de majoration avec la méthode du service
        const rate = this.overtimeService.getOvertimeRate(settings, overtimeType);

        // Créer l'Overtime
        await this.prisma.overtime.create({
          data: {
            tenantId,
            employeeId: attendance.employeeId,
            date: new Date(dateStr),
            hours: hoursToCreate,
            type: overtimeType,
            rate,
            isNightShift: overtimeType === 'NIGHT', // Backward compatibility
            status: OvertimeStatus.PENDING,
            notes: `Créé automatiquement depuis le pointage du ${attendance.timestamp.toLocaleDateString('fr-FR')}${overtimeType !== 'STANDARD' ? ` (${overtimeType})` : ''}`,
          },
        });

        createdCount++;
        this.logger.log(
          `✅ Overtime créé pour ${attendance.employee.firstName} ${attendance.employee.lastName} (${attendance.employee.matricule}): ${hoursToCreate.toFixed(2)}h`,
        );
      } catch (error) {
        this.logger.error(
          `Erreur lors de la création de l'Overtime pour le pointage ${attendance.id}:`,
          error,
        );
        skippedCount++;
      }
    }

    this.logger.log(
      `Détection des heures sup pour le tenant ${tenantId} terminée. ${createdCount} créé(s), ${skippedCount} ignoré(s).`,
    );
  }

  /**
   * Vérifie si un timestamp tombe dans la plage horaire de nuit configurée
   * @param timestamp Le timestamp à vérifier
   * @param settings Configuration du tenant avec nightShiftStart et nightShiftEnd
   * @returns true si le timestamp est dans la plage de nuit
   */
  private isNightShiftTime(timestamp: Date, settings: any): boolean {
    // Valeurs par défaut: 21:00 - 06:00
    const nightStart = settings?.nightShiftStart || '21:00';
    const nightEnd = settings?.nightShiftEnd || '06:00';

    const [startHour, startMin] = nightStart.split(':').map(Number);
    const [endHour, endMin] = nightEnd.split(':').map(Number);

    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Cas où le shift de nuit traverse minuit (ex: 21:00 - 06:00)
    if (startMinutes > endMinutes) {
      // Le timestamp est dans la plage de nuit s'il est >= startMinutes OU <= endMinutes
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    } else {
      // Cas normal (ex: 22:00 - 02:00 qui serait 22:00 - 26:00 en heures continues)
      // ou cas atypique où nightEnd > nightStart (ex: 06:00 - 14:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
  }
}

