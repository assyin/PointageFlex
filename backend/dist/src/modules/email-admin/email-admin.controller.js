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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_admin_service_1 = require("./email-admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const dto_1 = require("./dto");
let EmailAdminController = class EmailAdminController {
    constructor(emailAdminService) {
        this.emailAdminService = emailAdminService;
    }
    async getEmailConfig(req) {
        return this.emailAdminService.getEmailConfig(req.user.tenantId);
    }
    async createEmailConfig(req, dto) {
        return this.emailAdminService.upsertEmailConfig(req.user.tenantId, dto);
    }
    async updateEmailConfig(req, dto) {
        return this.emailAdminService.upsertEmailConfig(req.user.tenantId, dto);
    }
    async testSmtpConnection(dto) {
        return this.emailAdminService.testSmtpConnection(dto);
    }
    async sendTestEmail(req, dto) {
        return this.emailAdminService.sendTestEmail(req.user.tenantId, dto);
    }
    async getEmailTemplates(req) {
        return this.emailAdminService.getEmailTemplates(req.user.tenantId);
    }
    async getEmailTemplate(req, id) {
        return this.emailAdminService.getEmailTemplate(id, req.user.tenantId);
    }
    async createEmailTemplate(req, dto) {
        return this.emailAdminService.createEmailTemplate(req.user.tenantId, dto);
    }
    async updateEmailTemplate(req, id, dto) {
        return this.emailAdminService.updateEmailTemplate(id, req.user.tenantId, dto);
    }
    async deleteEmailTemplate(req, id) {
        return this.emailAdminService.deleteEmailTemplate(id, req.user.tenantId);
    }
    async previewEmailTemplate(dto) {
        return this.emailAdminService.previewEmailTemplate(dto);
    }
    async sendTemplateTest(req, dto) {
        return this.emailAdminService.sendTemplateTest(req.user.tenantId, dto);
    }
    async initializeDefaultTemplates(req) {
        await this.emailAdminService.initializeDefaultTemplates(req.user.tenantId);
        return { message: 'Templates par défaut initialisés avec succès' };
    }
    async getEmailLogs(req, query) {
        return this.emailAdminService.getEmailLogs(req.user.tenantId, query);
    }
    async getEmailStats(req) {
        return this.emailAdminService.getEmailStats(req.user.tenantId);
    }
};
exports.EmailAdminController = EmailAdminController;
__decorate([
    (0, common_1.Get)('config'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get email configuration for current tenant' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "getEmailConfig", null);
__decorate([
    (0, common_1.Post)('config'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create email configuration' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateEmailConfigDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "createEmailConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update email configuration' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateEmailConfigDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "updateEmailConfig", null);
__decorate([
    (0, common_1.Post)('config/test-connection'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Test SMTP connection' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TestSmtpConnectionDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "testSmtpConnection", null);
__decorate([
    (0, common_1.Post)('config/send-test'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Send test email' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SendTestEmailDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "sendTestEmail", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all email templates' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "getEmailTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get email template by ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "getEmailTemplate", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new email template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateEmailTemplateDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "createEmailTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update email template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateEmailTemplateDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "updateEmailTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete email template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "deleteEmailTemplate", null);
__decorate([
    (0, common_1.Post)('templates/preview'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview email template with variables' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PreviewEmailTemplateDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "previewEmailTemplate", null);
__decorate([
    (0, common_1.Post)('templates/send-test'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Send test email with template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SendTemplateTestDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "sendTemplateTest", null);
__decorate([
    (0, common_1.Post)('templates/initialize-defaults'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize default email templates' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "initializeDefaultTemplates", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings', 'reports.view_all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get email logs with filters and pagination' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.EmailLogsQueryDto]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "getEmailLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('tenant.update_settings', 'reports.view_all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get email statistics' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailAdminController.prototype, "getEmailStats", null);
exports.EmailAdminController = EmailAdminController = __decorate([
    (0, swagger_1.ApiTags)('Email Admin'),
    (0, common_1.Controller)('email-admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [email_admin_service_1.EmailAdminService])
], EmailAdminController);
//# sourceMappingURL=email-admin.controller.js.map