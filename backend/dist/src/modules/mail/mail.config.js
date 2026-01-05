"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMailConfig = loadMailConfig;
function loadMailConfig() {
    return {
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_SECURE === 'true',
        username: process.env.MAIL_USERNAME || '',
        password: process.env.MAIL_PASSWORD || '',
        fromName: process.env.MAIL_FROM_NAME || 'PointaFlex',
        fromEmail: process.env.MAIL_FROM_EMAIL || 'no-reply@pointaflex.com',
        enabled: process.env.MAIL_ENABLED !== 'false',
    };
}
//# sourceMappingURL=mail.config.js.map