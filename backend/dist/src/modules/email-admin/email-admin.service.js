"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const nodemailer = require("nodemailer");
let EmailAdminService = EmailAdminService_1 = class EmailAdminService {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(EmailAdminService_1.name);
    }
    async getEmailConfig(tenantId) {
        const config = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!config) {
            return {
                id: '',
                tenantId,
                enabled: false,
                provider: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                username: null,
                password: null,
                fromName: 'PointaFlex',
                fromEmail: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
        return {
            ...config,
            password: config.password ? '********' : null,
        };
    }
    async upsertEmailConfig(tenantId, dto) {
        const dataToSave = { ...dto };
        if (dataToSave.password === '********') {
            delete dataToSave.password;
        }
        const config = await this.prisma.emailConfig.upsert({
            where: { tenantId },
            create: { tenantId, ...dataToSave },
            update: dataToSave,
        });
        this.logger.log(`Configuration email ${config.enabled ? 'activée' : 'désactivée'} pour tenant ${tenantId}`);
        return {
            ...config,
            password: config.password ? '********' : null,
        };
    }
    async testSmtpConnection(dto) {
        try {
            const transporter = nodemailer.createTransport({
                host: dto.host,
                port: dto.port,
                secure: dto.secure,
                auth: dto.username && dto.password ? {
                    user: dto.username,
                    pass: dto.password,
                } : undefined,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            });
            await transporter.verify();
            this.logger.log(`✅ Test SMTP réussi: ${dto.host}:${dto.port}`);
            return {
                success: true,
                message: 'Connexion SMTP réussie',
            };
        }
        catch (error) {
            this.logger.error(`❌ Test SMTP échoué: ${error.message}`);
            return {
                success: false,
                message: `Échec de connexion SMTP: ${error.message}`,
                error: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async sendTestEmail(tenantId, dto) {
        const config = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!config) {
            throw new common_1.BadRequestException('Configuration email non trouvée. Veuillez d\'abord sauvegarder votre configuration.');
        }
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Email - PointaFlex</h1>
          </div>
          <div class="content">
            <p><strong>Bravo !</strong></p>
            <p>Votre configuration SMTP fonctionne correctement.</p>
            <p>Cet email de test a été envoyé depuis votre système PointaFlex.</p>
            <hr>
            <p><strong>Configuration:</strong></p>
            <ul>
              <li>Hôte: ${config.host}</li>
              <li>Port: ${config.port}</li>
              <li>From: ${config.fromName} &lt;${config.fromEmail}&gt;</li>
            </ul>
          </div>
          <div class="footer">
            <p>PointaFlex - Système de Gestion de Pointage</p>
          </div>
        </div>
      </body>
      </html>
    `;
        try {
            const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: config.username && config.password ? {
                    user: config.username,
                    pass: config.password,
                } : undefined,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            });
            const fromAddress = config.fromEmail
                ? `${config.fromName} <${config.fromEmail}>`
                : config.fromName;
            await transporter.sendMail({
                from: fromAddress,
                to: dto.to,
                subject: dto.subject,
                html: htmlContent,
            });
            await this.prisma.emailLog.create({
                data: {
                    tenantId,
                    to: dto.to,
                    subject: dto.subject,
                    type: 'TEST',
                    status: 'sent',
                },
            });
            return {
                success: true,
                message: `Email de test envoyé à ${dto.to}`,
            };
        }
        catch (error) {
            this.logger.error(`Échec envoi email de test: ${error.message}`);
            await this.prisma.emailLog.create({
                data: {
                    tenantId,
                    to: dto.to,
                    subject: dto.subject,
                    type: 'TEST',
                    status: 'failed',
                    error: error.message,
                },
            });
            throw new common_1.BadRequestException(`Échec envoi email: ${error.message}`);
        }
    }
    async sendTemplateTest(tenantId, dto) {
        const template = await this.prisma.emailTemplate.findUnique({
            where: { id: dto.templateId },
        });
        if (!template || template.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Template non trouvé');
        }
        const config = await this.prisma.emailConfig.findUnique({
            where: { tenantId },
        });
        if (!config) {
            throw new common_1.BadRequestException('Configuration email non trouvée. Veuillez d\'abord sauvegarder votre configuration.');
        }
        const testVariables = {
            managerName: 'Test Manager',
            employeeName: 'Test Employé',
            sessionDate: new Date().toLocaleDateString('fr-FR'),
            shiftStart: '08:00',
            shiftEnd: '17:00',
            actualIn: '08:15',
            inTime: '08:15',
            lateMinutes: '15',
        };
        let html = template.htmlContent;
        Object.keys(testVariables).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, testVariables[key]);
        });
        try {
            const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: config.username && config.password ? {
                    user: config.username,
                    pass: config.password,
                } : undefined,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            });
            const fromAddress = config.fromEmail
                ? `${config.fromName} <${config.fromEmail}>`
                : config.fromName;
            await transporter.sendMail({
                from: fromAddress,
                to: dto.to,
                subject: `[TEST] ${template.subject}`,
                html,
            });
            await this.prisma.emailLog.create({
                data: {
                    tenantId,
                    to: dto.to,
                    subject: `[TEST] ${template.subject}`,
                    type: 'TEST',
                    status: 'sent',
                    templateId: template.id,
                },
            });
            this.logger.log(`✅ Email de test envoyé avec template ${template.code} à ${dto.to}`);
            return {
                success: true,
                message: `Email de test envoyé à ${dto.to} avec le template ${template.name}`,
            };
        }
        catch (error) {
            this.logger.error(`Échec envoi email de test template: ${error.message}`);
            await this.prisma.emailLog.create({
                data: {
                    tenantId,
                    to: dto.to,
                    subject: `[TEST] ${template.subject}`,
                    type: 'TEST',
                    status: 'failed',
                    error: error.message,
                    templateId: template.id,
                },
            });
            throw new common_1.BadRequestException(`Échec envoi email: ${error.message}`);
        }
    }
    async getEmailTemplates(tenantId) {
        return this.prisma.emailTemplate.findMany({
            where: { tenantId },
            orderBy: [
                { isDefault: 'desc' },
                { category: 'asc' },
                { name: 'asc' },
            ],
        });
    }
    async getEmailTemplate(id, tenantId) {
        const template = await this.prisma.emailTemplate.findFirst({
            where: { id, tenantId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template email non trouvé');
        }
        return template;
    }
    async createEmailTemplate(tenantId, dto) {
        return this.prisma.emailTemplate.create({
            data: {
                tenantId,
                ...dto,
            },
        });
    }
    async updateEmailTemplate(id, tenantId, dto) {
        const template = await this.prisma.emailTemplate.findFirst({
            where: { id, tenantId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template email non trouvé');
        }
        if (template.isDefault) {
            throw new common_1.BadRequestException('Les templates par défaut ne peuvent pas être modifiés');
        }
        return this.prisma.emailTemplate.update({
            where: { id },
            data: dto,
        });
    }
    async deleteEmailTemplate(id, tenantId) {
        const template = await this.prisma.emailTemplate.findFirst({
            where: { id, tenantId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template email non trouvé');
        }
        if (template.isDefault) {
            throw new common_1.BadRequestException('Les templates par défaut ne peuvent pas être supprimés');
        }
        await this.prisma.emailTemplate.delete({ where: { id } });
        return { message: 'Template supprimé avec succès' };
    }
    async previewEmailTemplate(dto) {
        let html = dto.htmlContent;
        Object.keys(dto.variables).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, dto.variables[key] || '');
        });
        return { html };
    }
    async getEmailLogs(tenantId, query) {
        const where = { tenantId };
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.managerId)
            where.managerId = query.managerId;
        if (query.startDate || query.endDate) {
            where.sentAt = {};
            if (query.startDate)
                where.sentAt.gte = new Date(query.startDate);
            if (query.endDate)
                where.sentAt.lte = new Date(query.endDate);
        }
        const page = query.page || 1;
        const limit = query.limit || 50;
        const [logs, total] = await Promise.all([
            this.prisma.emailLog.findMany({
                where,
                include: {
                    employee: { select: { firstName: true, lastName: true } },
                    manager: { select: { firstName: true, lastName: true } },
                    template: { select: { name: true } },
                },
                orderBy: { sentAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.emailLog.count({ where }),
        ]);
        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getEmailStats(tenantId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [todayCount, weekCount, monthCount, totalCount, failedCount] = await Promise.all([
            this.prisma.emailLog.count({
                where: { tenantId, sentAt: { gte: startOfToday } },
            }),
            this.prisma.emailLog.count({
                where: { tenantId, sentAt: { gte: startOfWeek } },
            }),
            this.prisma.emailLog.count({
                where: { tenantId, sentAt: { gte: startOfMonth } },
            }),
            this.prisma.emailLog.count({ where: { tenantId } }),
            this.prisma.emailLog.count({ where: { tenantId, status: 'failed' } }),
        ]);
        const byType = await this.prisma.emailLog.groupBy({
            by: ['type'],
            where: { tenantId },
            _count: { id: true },
        });
        return {
            today: todayCount,
            week: weekCount,
            month: monthCount,
            total: totalCount,
            failed: failedCount,
            successRate: totalCount > 0 ? ((totalCount - failedCount) / totalCount * 100).toFixed(2) : 100,
            byType: byType.map(item => ({
                type: item.type,
                count: item._count.id,
            })),
        };
    }
    async initializeDefaultTemplates(tenantId) {
        const defaultTemplates = [
            {
                code: 'MISSING_OUT',
                name: 'Session non clôturée',
                description: 'Notification envoyée quand un employé ne ferme pas sa session',
                subject: '[Pointage] Session non clôturée – Action requise',
                category: 'notification',
                variables: ['managerName', 'employeeName', 'sessionDate', 'inTime', 'shiftEnd'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#f97316;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}</style></head>
<body>
<div class="container">
  <div class="header"><h1>⚠️ Session Non Clôturée</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>L'employé <strong>{{employeeName}}</strong> n'a pas clôturé sa session de travail.</p>
    <ul>
      <li><strong>Date:</strong> {{sessionDate}}</li>
      <li><strong>Heure d'entrée:</strong> {{inTime}}</li>
      <li><strong>Fin de shift prévue:</strong> {{shiftEnd}}</li>
    </ul>
    <p><strong>Action requise:</strong> Veuillez vérifier et corriger le pointage.</p>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
            {
                code: 'MISSING_IN',
                name: 'Absence de pointage d\'entrée',
                description: 'Notification envoyée quand un employé ne pointe pas à l\'entrée',
                subject: '[Pointage] Absence de pointage d\'entrée – Action requise',
                category: 'notification',
                variables: ['managerName', 'employeeName', 'sessionDate', 'shiftStart'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#ef4444;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}</style></head>
<body>
<div class="container">
  <div class="header"><h1>🚫 Absence de Pointage</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>L'employé <strong>{{employeeName}}</strong> n'a pas effectué de pointage d'entrée.</p>
    <ul>
      <li><strong>Date:</strong> {{sessionDate}}</li>
      <li><strong>Début de shift prévu:</strong> {{shiftStart}}</li>
    </ul>
    <p><strong>Action requise:</strong> Veuillez vérifier la présence de l'employé.</p>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
            {
                code: 'LATE',
                name: 'Retard',
                description: 'Notification envoyée quand un employé est en retard',
                subject: '[Pointage] Retard détecté – Information',
                category: 'notification',
                variables: ['managerName', 'employeeName', 'sessionDate', 'shiftStart', 'actualIn', 'lateMinutes'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#f59e0b;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}</style></head>
<body>
<div class="container">
  <div class="header"><h1>⏰ Retard Détecté</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>Un retard a été enregistré pour l'employé <strong>{{employeeName}}</strong>.</p>
    <ul>
      <li><strong>Date:</strong> {{sessionDate}}</li>
      <li><strong>Heure prévue:</strong> {{shiftStart}}</li>
      <li><strong>Heure réelle:</strong> {{actualIn}}</li>
      <li><strong>Retard:</strong> {{lateMinutes}} minutes</li>
    </ul>
    <p>Merci de prendre note de ce retard dans le cadre de la gestion des présences.</p>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
            {
                code: 'ABSENCE_PARTIAL',
                name: 'Absence partielle',
                description: 'Notification envoyée quand un employé arrive très en retard (>=2h)',
                subject: '[Pointage] Absence partielle détectée – Action requise',
                category: 'notification',
                variables: ['managerName', 'employeeName', 'sessionDate', 'shiftStart', 'actualIn', 'absenceHours'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#dc2626;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}</style></head>
<body>
<div class="container">
  <div class="header"><h1>⚠️ Absence Partielle</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>Une absence partielle a été détectée pour l'employé <strong>{{employeeName}}</strong>.</p>
    <ul>
      <li><strong>Date:</strong> {{sessionDate}}</li>
      <li><strong>Heure prévue:</strong> {{shiftStart}}</li>
      <li><strong>Heure réelle:</strong> {{actualIn}}</li>
      <li><strong>Durée d'absence:</strong> {{absenceHours}} heures</li>
    </ul>
    <p><strong>Action requise:</strong> Veuillez vérifier la situation et prendre les mesures appropriées.</p>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
            {
                code: 'ABSENCE_TECHNICAL',
                name: 'Anomalie technique',
                description: 'Notification envoyée quand une anomalie technique de pointage est détectée',
                subject: '[Pointage] Anomalie technique détectée – {{severity}}',
                category: 'notification',
                variables: ['managerName', 'employeeName', 'sessionDate', 'occurredAt', 'reason', 'deviceName', 'severity'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#7c3aed;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}.severity-high{color:#dc2626;font-weight:bold}.severity-medium{color:#f59e0b;font-weight:bold}.severity-low{color:#3b82f6}</style></head>
<body>
<div class="container">
  <div class="header"><h1>🔧 Anomalie Technique</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>Une anomalie technique a été détectée pour l'employé <strong>{{employeeName}}</strong>.</p>
    <ul>
      <li><strong>Date:</strong> {{sessionDate}}</li>
      <li><strong>Heure de l'incident:</strong> {{occurredAt}}</li>
      <li><strong>Terminal concerné:</strong> {{deviceName}}</li>
      <li><strong>Sévérité:</strong> <span class="severity-{{severity}}">{{severity}}</span></li>
    </ul>
    <p><strong>Description:</strong> {{reason}}</p>
    <p><strong>Cause probable:</strong> Problème matériel (lecteur, biométrie), coupure réseau ou électrique.</p>
    <p><strong>Actions recommandées:</strong></p>
    <ol>
      <li>Vérifier l'état du terminal de pointage</li>
      <li>Contacter l'employé pour confirmer sa présence</li>
      <li>Créer une correction manuelle si nécessaire</li>
    </ol>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
            {
                code: 'ABSENCE',
                name: 'Absence complète',
                description: 'Notification envoyée quand un employé est absent toute la journée',
                subject: '[Pointage] Absence complète détectée – Action urgente',
                category: 'notification',
                variables: ['managerName', 'employeeName', 'sessionDate', 'shiftStart'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#991b1b;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}</style></head>
<body>
<div class="container">
  <div class="header"><h1>🚨 Absence Complète</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>Une absence complète a été détectée pour l'employé <strong>{{employeeName}}</strong>.</p>
    <ul>
      <li><strong>Date:</strong> {{sessionDate}}</li>
      <li><strong>Shift prévu:</strong> {{shiftStart}}</li>
      <li><strong>Statut:</strong> Aucun pointage enregistré</li>
    </ul>
    <p><strong>Action urgente:</strong> Veuillez contacter l'employé et vérifier sa situation.</p>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
            {
                code: 'OVERTIME_PENDING',
                name: 'Heures Supplémentaires en Attente',
                description: 'Récapitulatif des demandes d\'heures supplémentaires en attente d\'approbation',
                subject: '[Pointage] {{pendingCount}} demande(s) d\'heures supplémentaires en attente',
                category: 'notification',
                variables: ['managerName', 'pendingCount', 'totalHours', 'overtimesList', 'approvalUrl'],
                htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#0052CC;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.stats{display:flex;justify-content:space-around;margin:20px 0}.stat-box{background:white;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 10px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.stat-number{font-size:28px;font-weight:bold;color:#0052CC}.stat-label{color:#666;font-size:13px}.overtime-list{background:white;padding:15px;border-radius:8px;margin:20px 0}.overtime-list pre{white-space:pre-wrap;font-family:inherit;margin:0;color:#555}.cta-button{display:inline-block;background:#0052CC;color:white;padding:12px 25px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:15px}.footer{padding:20px;text-align:center;font-size:12px;color:#6b7280}</style></head>
<body>
<div class="container">
  <div class="header"><h1>📋 Heures Supplémentaires en Attente</h1></div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>
    <p>Vous avez des demandes d'heures supplémentaires en attente d'approbation :</p>
    <div class="stats">
      <div class="stat-box"><div class="stat-number">{{pendingCount}}</div><div class="stat-label">Demande(s)</div></div>
      <div class="stat-box"><div class="stat-number">{{totalHours}}h</div><div class="stat-label">Total heures</div></div>
    </div>
    <div class="overtime-list">
      <h3 style="margin-top:0;color:#0052CC;">Détail des demandes :</h3>
      <pre>{{overtimesList}}</pre>
    </div>
    <p style="text-align:center;"><a href="{{approvalUrl}}" class="cta-button">Gérer les demandes</a></p>
    <p style="margin-top:20px;color:#666;font-size:14px;">Veuillez approuver ou rejeter ces demandes dans les meilleurs délais.</p>
  </div>
  <div class="footer"><p>PointaFlex - Système de Gestion de Pointage</p></div>
</div>
</body>
</html>`,
            },
        ];
        for (const template of defaultTemplates) {
            await this.prisma.emailTemplate.upsert({
                where: {
                    tenantId_code: {
                        tenantId,
                        code: template.code,
                    },
                },
                create: {
                    tenantId,
                    ...template,
                    isDefault: true,
                    active: true,
                },
                update: {},
            });
        }
        this.logger.log(`Templates par défaut initialisés pour tenant ${tenantId}`);
    }
};
exports.EmailAdminService = EmailAdminService;
exports.EmailAdminService = EmailAdminService = EmailAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], EmailAdminService);
//# sourceMappingURL=email-admin.service.js.map