"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const OVERTIME_PENDING_TEMPLATE = {
    code: 'OVERTIME_PENDING',
    name: 'Heures Supplémentaires en Attente',
    description: 'Notification récapitulative des demandes d\'heures supplémentaires en attente d\'approbation',
    subject: '[PointageFlex] {{pendingCount}} demande(s) d\'heures supplémentaires en attente',
    htmlContent: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heures Supplémentaires en Attente</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0052CC, #0747A6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat-box { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; margin: 0 10px; }
    .stat-number { font-size: 32px; font-weight: bold; color: #0052CC; }
    .stat-label { color: #666; font-size: 14px; }
    .overtime-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .overtime-list pre { white-space: pre-wrap; font-family: inherit; margin: 0; color: #555; }
    .cta-button { display: inline-block; background: #0052CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .cta-button:hover { background: #0047B3; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Heures Supplémentaires en Attente</h1>
  </div>
  <div class="content">
    <p>Bonjour <strong>{{managerName}}</strong>,</p>

    <p>Vous avez des demandes d'heures supplémentaires en attente d'approbation :</p>

    <div class="stats">
      <div class="stat-box">
        <div class="stat-number">{{pendingCount}}</div>
        <div class="stat-label">Demande(s)</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">{{totalHours}}h</div>
        <div class="stat-label">Total heures</div>
      </div>
    </div>

    <div class="overtime-list">
      <h3 style="margin-top: 0; color: #0052CC;">Détail des demandes :</h3>
      <pre>{{overtimesList}}</pre>
    </div>

    <p style="text-align: center;">
      <a href="{{approvalUrl}}" class="cta-button">Gérer les demandes</a>
    </p>

    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      Veuillez approuver ou rejeter ces demandes dans les meilleurs délais.
    </p>
  </div>
  <div class="footer">
    <p>Cet email a été envoyé automatiquement par PointageFlex.</p>
    <p>Ne pas répondre à cet email.</p>
  </div>
</body>
</html>`,
    active: true,
};
async function main() {
    console.log('🚀 Ajout du template OVERTIME_PENDING...');
    const tenants = await prisma.tenant.findMany({
        select: { id: true, companyName: true },
    });
    console.log(`📋 ${tenants.length} tenant(s) trouvé(s)`);
    for (const tenant of tenants) {
        const existing = await prisma.emailTemplate.findUnique({
            where: {
                tenantId_code: {
                    tenantId: tenant.id,
                    code: OVERTIME_PENDING_TEMPLATE.code,
                },
            },
        });
        if (existing) {
            console.log(`⏭️  Template déjà existant pour tenant ${tenant.companyName}`);
            continue;
        }
        await prisma.emailTemplate.create({
            data: {
                tenant: { connect: { id: tenant.id } },
                code: OVERTIME_PENDING_TEMPLATE.code,
                name: OVERTIME_PENDING_TEMPLATE.name,
                description: OVERTIME_PENDING_TEMPLATE.description,
                subject: OVERTIME_PENDING_TEMPLATE.subject,
                htmlContent: OVERTIME_PENDING_TEMPLATE.htmlContent,
                active: OVERTIME_PENDING_TEMPLATE.active,
                variables: ['managerName', 'pendingCount', 'totalHours', 'overtimesList', 'approvalUrl'],
            },
        });
        console.log(`✅ Template créé pour tenant ${tenant.companyName}`);
        const emailConfig = await prisma.emailConfig.findUnique({
            where: { tenantId: tenant.id },
        });
        if (emailConfig) {
            console.log(`📧 EmailConfig existe pour tenant ${tenant.companyName}`);
        }
    }
    console.log('🎉 Script terminé avec succès!');
}
main()
    .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add-overtime-pending-template.js.map