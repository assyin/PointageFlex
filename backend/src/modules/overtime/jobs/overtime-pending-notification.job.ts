import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { OvertimeStatus } from '@prisma/client';

/**
 * Job de notification OVERTIME_PENDING aux managers
 *
 * Objectif: Envoyer un email récapitulatif aux managers lorsqu'ils ont
 * des demandes d'heures supplémentaires en attente d'approbation.
 *
 * Règles métier:
 * - Exécution toutes les heures, vérifie si c'est l'heure configurée par tenant
 * - Envoie un récapitulatif par manager (pas un email par demande)
 * - Max 1 notification par manager par jour
 * - Inclut le nombre de demandes et le total d'heures en attente
 * - L'email contient toutes les heures sup des employés du département du manager
 */
@Injectable()
export class OvertimePendingNotificationJob {
  private readonly logger = new Logger(OvertimePendingNotificationJob.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Job exécuté toutes les heures
   * Vérifie l'heure configurée par tenant et envoie les notifications
   */
  @Cron('0 * * * *') // Toutes les heures à la minute 0
  async handleOvertimePendingNotifications() {
    this.logger.log('🔍 Vérification des notifications OVERTIME_PENDING...');

    try {
      const tenants = await this.getActiveTenants();
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      this.logger.log(`Heure actuelle: ${currentTime}, Traitement de ${tenants.length} tenant(s)...`);

      for (const tenant of tenants) {
        try {
          // Vérifier si c'est l'heure configurée pour ce tenant
          const configuredTime = tenant.settings?.overtimePendingNotificationTime || '09:00';
          const [configHour] = configuredTime.split(':').map(Number);

          if (currentHour === configHour) {
            this.logger.log(`Tenant ${tenant.companyName}: Heure de notification (${configuredTime})`);
            await this.processTenant(tenant.id);
          } else {
            this.logger.debug(`Tenant ${tenant.companyName}: Pas l'heure (configuré: ${configuredTime})`);
          }
        } catch (error) {
          this.logger.error(
            `Erreur lors du traitement OVERTIME_PENDING pour tenant ${tenant.id}:`,
            error,
          );
        }
      }

      this.logger.log('✅ Vérification OVERTIME_PENDING terminée');
    } catch (error) {
      this.logger.error('Erreur critique dans le job OVERTIME_PENDING:', error);
    }
  }

  /**
   * Récupère tous les tenants actifs avec leurs settings
   */
  private async getActiveTenants() {
    return this.prisma.tenant.findMany({
      include: {
        settings: true,
      },
    });
  }

  /**
   * Traite un tenant: regroupe les demandes par manager et envoie les notifications
   */
  private async processTenant(tenantId: string) {
    // 1. Vérifier si les notifications OVERTIME_PENDING sont activées
    const emailConfig = await this.prisma.emailConfig.findUnique({
      where: { tenantId },
    });

    if (!emailConfig || !emailConfig.enabled || !emailConfig.notifyOvertimePending) {
      this.logger.debug(
        `Notifications OVERTIME_PENDING désactivées pour tenant ${tenantId}, skip`,
      );
      return;
    }

    // 2. Récupérer toutes les demandes en attente groupées par département/manager
    const pendingOvertimes = await this.prisma.overtime.findMany({
      where: {
        tenantId,
        status: OvertimeStatus.PENDING,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (pendingOvertimes.length === 0) {
      this.logger.debug(`Tenant ${tenantId}: Aucune demande en attente`);
      return;
    }

    this.logger.log(
      `Tenant ${tenantId}: ${pendingOvertimes.length} demande(s) en attente`,
    );

    // 3. Regrouper par manager
    const byManager = new Map<string, {
      manager: any;
      overtimes: any[];
      totalHours: number;
    }>();

    for (const overtime of pendingOvertimes) {
      const manager = overtime.employee.department?.manager?.user;

      if (!manager || !manager.email) {
        this.logger.warn(
          `Pas de manager avec email pour ${overtime.employee.user.firstName} ${overtime.employee.user.lastName}`,
        );
        continue;
      }

      if (!byManager.has(manager.id)) {
        byManager.set(manager.id, {
          manager,
          overtimes: [],
          totalHours: 0,
        });
      }

      const group = byManager.get(manager.id)!;
      group.overtimes.push(overtime);
      group.totalHours += Number(overtime.hours);
    }

    // 4. Envoyer une notification par manager
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const [managerId, data] of byManager) {
      try {
        // Vérifier si déjà notifié aujourd'hui
        const alreadyNotified = await this.prisma.overtimePendingNotificationLog.findFirst({
          where: {
            tenantId,
            managerId,
            sentAt: {
              gte: today,
            },
          },
        });

        if (alreadyNotified) {
          this.logger.debug(
            `Manager ${data.manager.firstName} ${data.manager.lastName} déjà notifié aujourd'hui`,
          );
          continue;
        }

        await this.sendManagerNotification(
          tenantId,
          data.manager,
          data.overtimes,
          data.totalHours,
        );
      } catch (error) {
        this.logger.error(
          `Erreur envoi notification au manager ${managerId}:`,
          error,
        );
      }
    }
  }

  /**
   * Envoie la notification récapitulative au manager
   */
  private async sendManagerNotification(
    tenantId: string,
    manager: any,
    overtimes: any[],
    totalHours: number,
  ) {
    // Charger le template depuis la BDD
    const template = await this.prisma.emailTemplate.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: 'OVERTIME_PENDING',
        },
      },
    });

    if (!template || !template.active) {
      this.logger.warn(
        `Template OVERTIME_PENDING non trouvé ou inactif pour tenant ${tenantId}`,
      );
      return;
    }

    // Construire la liste des demandes pour le template
    const overtimesList = overtimes
      .map((ot) => {
        const employeeName = `${ot.employee.user.firstName} ${ot.employee.user.lastName}`;
        const date = new Date(ot.date).toLocaleDateString('fr-FR');
        const hours = Number(ot.hours).toFixed(2);
        const type = this.getOvertimeTypeLabel(ot.type);
        return `- ${employeeName}: ${hours}h le ${date} (${type})`;
      })
      .join('\n');

    // Préparer les données pour le template
    const templateData = {
      managerName: `${manager.firstName} ${manager.lastName}`,
      pendingCount: overtimes.length.toString(),
      totalHours: totalHours.toFixed(2),
      overtimesList,
      approvalUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/overtime`,
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
        subject: template.subject.replace('{{pendingCount}}', templateData.pendingCount),
        html,
        type: 'OVERTIME_PENDING',
        managerId: manager.id,
        templateId: template.id,
      },
      tenantId,
    );

    this.logger.log(
      `📧 Email OVERTIME_PENDING envoyé à ${manager.email} (${overtimes.length} demandes, ${totalHours.toFixed(2)}h)`,
    );

    // Logger dans la table d'audit
    await this.prisma.overtimePendingNotificationLog.create({
      data: {
        tenantId,
        managerId: manager.id,
        pendingCount: overtimes.length,
        totalHours,
      },
    });

    this.logger.log(
      `✅ Notification OVERTIME_PENDING enregistrée pour manager ${manager.firstName} ${manager.lastName}`,
    );
  }

  /**
   * Retourne le label français du type d'overtime
   */
  private getOvertimeTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      STANDARD: 'Standard',
      NIGHT: 'Nuit',
      HOLIDAY: 'Jour férié',
      EMERGENCY: 'Urgence',
    };
    return labels[type] || type;
  }
}
