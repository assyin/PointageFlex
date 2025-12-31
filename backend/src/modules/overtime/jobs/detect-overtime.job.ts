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
      },
    });

    const minimumThreshold = settings?.overtimeMinimumThreshold || 30; // Défaut: 30 minutes

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

        // Créer l'Overtime
        await this.prisma.overtime.create({
          data: {
            tenantId,
            employeeId: attendance.employeeId,
            date: new Date(attendance.timestamp.toISOString().split('T')[0]),
            hours: hoursToCreate,
            type: 'STANDARD', // Par défaut, peut être amélioré pour détecter NIGHT, HOLIDAY, etc.
            status: OvertimeStatus.PENDING,
            notes: `Créé automatiquement depuis le pointage du ${attendance.timestamp.toLocaleDateString('fr-FR')}`,
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
}

