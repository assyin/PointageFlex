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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const nodemailer = require("nodemailer");
const mail_config_1 = require("./mail.config");
let MailService = MailService_1 = class MailService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = null;
        this.config = (0, mail_config_1.loadMailConfig)();
    }
    async onModuleInit() {
        if (!this.config.enabled) {
            this.logger.warn('📧 Mode SIMULATION activé - Aucun email ne sera envoyé');
            return;
        }
        try {
            this.transporter = nodemailer.createTransport({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.username,
                    pass: this.config.password,
                },
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            });
            await this.transporter.verify();
            this.logger.log(`✅ SMTP configuré avec succès (${this.config.host}:${this.config.port})`);
        }
        catch (error) {
            this.logger.error(`❌ Échec configuration SMTP: ${error.message}`, error.stack);
            this.logger.warn('⚠️ Mode SIMULATION activé suite à l\'échec SMTP');
            this.transporter = null;
        }
    }
    async sendMail(options, tenantId) {
        try {
            this.validateMailOptions(options);
            let emailConfig = null;
            if (tenantId) {
                try {
                    emailConfig = await this.prisma.emailConfig.findUnique({
                        where: { tenantId },
                    });
                }
                catch (error) {
                    this.logger.warn(`Impossible de récupérer EmailConfig pour tenant ${tenantId}, utilisation de .env`);
                }
            }
            const useDbConfig = emailConfig && emailConfig.enabled;
            const useEnvConfig = !useDbConfig && this.config.enabled && this.transporter;
            if (!useDbConfig && !useEnvConfig) {
                this.logSimulationEmail(options);
                if (tenantId) {
                    await this.logEmailToDatabase(tenantId, options, 'queued', null);
                }
                return;
            }
            let transporter;
            let fromAddress;
            if (useDbConfig) {
                transporter = nodemailer.createTransport({
                    host: emailConfig.host,
                    port: emailConfig.port,
                    secure: emailConfig.secure,
                    auth: emailConfig.username && emailConfig.password ? {
                        user: emailConfig.username,
                        pass: emailConfig.password,
                    } : undefined,
                    connectionTimeout: 10000,
                    greetingTimeout: 5000,
                    socketTimeout: 15000,
                });
                fromAddress = `"${emailConfig.fromName}" <${emailConfig.fromEmail || emailConfig.username}>`;
            }
            else {
                transporter = this.transporter;
                fromAddress = `"${this.config.fromName}" <${this.config.fromEmail}>`;
            }
            const mailOptions = {
                from: fromAddress,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                cc: options.cc?.join(', '),
                bcc: options.bcc?.join(', '),
                replyTo: options.replyTo,
            };
            const info = await transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email envoyé avec succès - To: ${mailOptions.to} | Subject: ${options.subject} | MessageID: ${info.messageId}`);
            if (tenantId) {
                await this.logEmailToDatabase(tenantId, options, 'sent', null);
            }
        }
        catch (error) {
            this.logEmailError(options, error);
            if (tenantId) {
                await this.logEmailToDatabase(tenantId, options, 'failed', error.message);
            }
        }
    }
    async logEmailToDatabase(tenantId, options, status, error) {
        try {
            await this.prisma.emailLog.create({
                data: {
                    tenantId,
                    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                    cc: options.cc?.join(', ') || null,
                    bcc: options.bcc?.join(', ') || null,
                    subject: options.subject,
                    type: options.type || 'UNKNOWN',
                    templateId: options.templateId || null,
                    status,
                    error,
                    employeeId: options.employeeId || null,
                    managerId: options.managerId || null,
                },
            });
        }
        catch (error) {
            this.logger.warn(`Impossible de logger l'email dans EmailLog: ${error.message}`);
        }
    }
    validateMailOptions(options) {
        if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
            throw new Error('Destinataire (to) requis');
        }
        if (!options.subject || options.subject.trim() === '') {
            throw new Error('Sujet (subject) requis');
        }
        if (!options.html || options.html.trim() === '') {
            throw new Error('Contenu HTML requis');
        }
    }
    logSimulationEmail(options) {
        const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        this.logger.log(`
╔════════════════════════════════════════════════════════════╗
║          📧 SIMULATION EMAIL - Aucun envoi réel           ║
╠════════════════════════════════════════════════════════════╣
║ To:      ${to.padEnd(50)}║
║ Subject: ${options.subject.substring(0, 50).padEnd(50)}║
║ HTML:    ${(options.html.length + ' caractères').padEnd(50)}║
╚════════════════════════════════════════════════════════════╝
    `);
    }
    logEmailError(options, error) {
        const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        this.logger.error(`❌ Échec envoi email - To: ${to} | Subject: ${options.subject}`);
        if (error.code === 'EAUTH') {
            this.logger.error('🔐 Erreur d\'authentification SMTP - Vérifiez MAIL_USERNAME et MAIL_PASSWORD');
        }
        else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
            this.logger.error('⏱️ Timeout SMTP - Vérifiez MAIL_HOST et MAIL_PORT');
        }
        else if (error.responseCode === 550) {
            this.logger.error('📭 Adresse email rejetée - Vérifiez le destinataire');
        }
        else {
            this.logger.error(`Erreur: ${error.message}`, error.stack);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MailService);
//# sourceMappingURL=mail.service.js.map