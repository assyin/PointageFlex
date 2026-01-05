"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEmailTemplate = renderEmailTemplate;
const fs = require("fs");
const path = require("path");
function renderEmailTemplate(templateName, data) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template email introuvable: ${templatePath}`);
    }
    let html = fs.readFileSync(templatePath, 'utf-8');
    Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, data[key] || '');
    });
    return html;
}
//# sourceMappingURL=mail.utils.js.map