import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { LeaveStatus } from '@prisma/client';
import { MailService } from '../../mail/mail.service';

/**
 * Job de notification ABSENCE_TECHNICAL aux managers
 *
 * Objectif: Envoyer un email au manager lorsqu'une anomalie de pointage
 * est détectée comme étant causée par un problème technique (panne terminal,
 * coupure électrique, problème réseau, etc.).
 *
 * Règles métier critiques:
 * - Détecter les anomalies marquées comme "technique" dans AttendanceAnomaly
 * - Vérifier que l'anomalie est liée à un problème indépendant de l'employé
 * - Max 1 notification par incident technique
 * - Informer le manager pour action corrective (investigation, justification)
 * - Exclure les anomalies déjà justifiées ou corrigées
 */
@Injectable()
export class AbsenceTechnicalManagerNotificationJob {
  private readonly logger = new Logger(AbsenceTechnicalManagerNotificationJob.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Job exécuté toutes les heures (configurable par tenant)
   * IMPORTANT: Détecte les anomalies techniques récentes
   */
  @Cron('0 */1 * * *') // Toutes les heures par défaut
  async handleAbsenceTechnicalNotifications() {
    this.logger.log('🔍 Démarrage détection ABSENCE_TECHNICAL pour notifications manager...');

    try {
      const tenants = await this.getActiveTenants();
      this.logger.log(`Traitement de ${tenants.length} tenant(s)...`);

      for (const tenant of tenants) {
        try {
          await this.processTenant(tenant.id);
        } catch (error) {
          this.logger.error(
            `Erreur lors du traitement ABSENCE_TECHNICAL pour tenant ${tenant.id}:`,
            error,
          );
        }
      }

      this.logger.log('✅ Détection ABSENCE_TECHNICAL terminée');
    } catch (error) {
      this.logger.error('Erreur critique dans le job ABSENCE_TECHNICAL:', error);
    }
  }

  /**
   * Récupère tous les tenants actifs
   */
  private async getActiveTenants() {
    return this.prisma.tenant.findMany({
      where: {
        // Ajouter condition d'activation si besoin
      },
      include: {
        settings: true,
      },
    });
  }

  /**
   * Traite un tenant: détecte les anomalies techniques et envoie les notifications
   */
  private async processTenant(tenantId: string) {
    // 1. Récupérer les anomalies techniques récentes non notifiées
    const technicalAnomalies = await this.getTechnicalAnomalies(tenantId);

    this.logger.log(
      `Tenant ${tenantId}: ${technicalAnomalies.length} anomalie(s) technique(s) à traiter`,
    );

    for (const anomaly of technicalAnomalies) {
      try {
        await this.processAnomaly(tenantId, anomaly);
      } catch (error) {
        this.logger.error(
          `Erreur traitement anomalie ${anomaly.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Récupère les anomalies techniques récentes (dernières 24h)
   * qui n'ont pas encore généré de notification
   */
  private async getTechnicalAnomalies(tenantId: string): Promise<any[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Récupérer les anomalies techniques non notifiées
    const anomalies = await this.prisma.attendanceAnomaly.findMany({
      where: {
        tenantId,
        type: 'TECHNICAL',
        status: { in: ['OPEN', 'INVESTIGATING'] },
        notifiedAt: null, // Pas encore notifié
        detectedAt: { gte: oneDayAgo },
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: true,
          },
        },
        schedule: {
          include: {
            shift: true,
          },
        },
        device: true,
        attendance: true,
      },
      orderBy: { detectedAt: 'desc' },
    });

    return anomalies;
  }

  /**
   * Traite une anomalie technique individuelle
   */
  private async processAnomaly(tenantId: string, anomaly: any) {
    const { employee, schedule } = anomaly;

    if (!employee || !employee.user) {
      this.logger.debug(
        `Anomalie ${anomaly.id} sans employé/user valide, skip`,
      );
      return;
    }

    // ÉTAPE 1: Vérifier si déjà notifié pour cette anomalie
    const alreadyNotified = await this.prisma.absenceTechnicalNotificationLog.findUnique({
      where: {
        tenantId_anomalyId: {
          tenantId,
          anomalyId: anomaly.id,
        },
      },
    });

    if (alreadyNotified) {
      return; // Déjà notifié, skip
    }

    // ÉTAPE 2: Vérifier qu'il s'agit bien d'un problème technique
    const isTechnical = await this.isTechnicalIssue(tenantId, anomaly);

    if (!isTechnical) {
      return; // Pas un problème technique, skip
    }

    // ÉTAPE 3: Récupérer le manager
    const manager = await this.getEmployeeManager(employee.id);

    if (!manager || !manager.email) {
      this.logger.warn(
        `Pas de manager avec email pour ${employee.user.firstName} ${employee.user.lastName}`,
      );
      return;
    }

    this.logger.log(`[DEBUG] Anomalie technique ${anomaly.subType || anomaly.type} détectée pour ${employee.user.firstName} ${employee.user.lastName}. Envoi notification au manager ${manager.firstName} ${manager.lastName}`);

    // ÉTAPE 4: Envoyer notification
    await this.sendManagerNotification(
      tenantId,
      employee,
      manager,
      anomaly,
      schedule,
    );

    // ÉTAPE 5: Marquer l'anomalie comme notifiée
    await this.prisma.attendanceAnomaly.update({
      where: { id: anomaly.id },
      data: { notifiedAt: new Date() },
    });
  }

  /**
   * Détermine si une anomalie est d'origine technique
   * Critères:
   * - Anomalie de type TECHNICAL
   * - Multiple employés affectés au même moment (panne générale)
   * - Terminal marqué comme en panne ou hors ligne
   * - Coupure électrique signalée
   */
  private async isTechnicalIssue(
    tenantId: string,
    anomaly: any,
  ): Promise<boolean> {
    // L'anomalie est déjà de type TECHNICAL (filtré dans getTechnicalAnomalies)
    if (anomaly.type === 'TECHNICAL') {
      return true;
    }

    // Vérifier si le terminal associé est hors ligne
    if (anomaly.device) {
      const lastSync = anomaly.device.lastSync;
      if (lastSync) {
        const hoursSinceLastSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSync > 1) {
          return true; // Terminal hors ligne depuis plus d'1h
        }
      }
    }

    // Vérifier si plusieurs employés sont affectés au même moment (panne générale)
    if (anomaly.occurredAt && anomaly.deviceId) {
      const windowStart = new Date(anomaly.occurredAt);
      windowStart.setMinutes(windowStart.getMinutes() - 30);
      const windowEnd = new Date(anomaly.occurredAt);
      windowEnd.setMinutes(windowEnd.getMinutes() + 30);

      const sameTimeAnomalies = await this.prisma.attendanceAnomaly.count({
        where: {
          tenantId,
          deviceId: anomaly.deviceId,
          occurredAt: { gte: windowStart, lte: windowEnd },
          id: { not: anomaly.id },
        },
      });

      if (sameTimeAnomalies >= 3) {
        return true; // 3+ anomalies sur le même terminal en 1h = panne probable
      }
    }

    return false;
  }

  /**
   * Récupère le manager de l'employé
   */
  private async getEmployeeManager(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: {
          include: {
            manager: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return employee?.department?.manager?.user || null;
  }

  /**
   * Envoie la notification au manager et log dans la table d'audit
   */
  private async sendManagerNotification(
    tenantId: string,
    employee: any,
    manager: any,
    anomaly: any,
    schedule: any,
  ) {
    // Vérifier si les notifications ABSENCE_TECHNICAL sont activées
    const emailConfig = await this.prisma.emailConfig.findUnique({
      where: { tenantId },
    });

    if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyAbsenceTechnical) {
      this.logger.debug(
        `Notifications ABSENCE_TECHNICAL désactivées pour tenant ${tenantId}, skip email`,
      );
      return;
    }

    // Charger le template depuis la BDD
    const template = await this.prisma.emailTemplate.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: 'ABSENCE_TECHNICAL',
        },
      },
    });

    if (!template || !template.active) {
      this.logger.warn(
        `Template ABSENCE_TECHNICAL non trouvé ou inactif pour tenant ${tenantId}`,
      );
      return;
    }

    // Préparer les données pour le template
    const occurredDate = anomaly.occurredAt ? new Date(anomaly.occurredAt) : new Date();
    const sessionDate = schedule?.date
      ? new Date(schedule.date).toLocaleDateString('fr-FR')
      : occurredDate.toLocaleDateString('fr-FR');

    const deviceInfo = anomaly.device ? ` (Terminal: ${anomaly.device.name})` : '';
    const subTypeInfo = anomaly.subType ? ` - ${anomaly.subType}` : '';

    const templateData = {
      managerName: `${manager.firstName} ${manager.lastName}`,
      employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
      sessionDate: sessionDate,
      occurredAt: occurredDate.toLocaleString('fr-FR'),
      reason: anomaly.description || `Anomalie technique${subTypeInfo} détectée${deviceInfo}.`,
      deviceName: anomaly.device?.name || 'N/A',
      severity: anomaly.severity || 'MEDIUM',
    };

    // Remplacer les variables dans le template
    let html = template.htmlContent;
    Object.keys(templateData).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, templateData[key]);
    });

    // Envoyer l'email via MailService
    await this.mailService.sendMail(
      {
        to: manager.email,
        subject: template.subject,
        html,
        type: 'ABSENCE_TECHNICAL',
        employeeId: employee.user.id,
        managerId: manager.id,
        templateId: template.id,
      },
      tenantId,
    );

    this.logger.log(
      `📧 Email ABSENCE_TECHNICAL envoyé à ${manager.email} pour ${employee.user.firstName} ${employee.user.lastName}`,
    );

    // Logger dans la table d'audit
    await this.prisma.absenceTechnicalNotificationLog.create({
      data: {
        tenantId,
        employeeId: employee.user.id,
        managerId: manager.id,
        anomalyId: anomaly.id,
        sessionDate: schedule.date,
        reason: templateData.reason,
      },
    });

    this.logger.log(
      `✅ Notification ABSENCE_TECHNICAL enregistrée pour anomalie ${anomaly.id}`,
    );
  }
}
