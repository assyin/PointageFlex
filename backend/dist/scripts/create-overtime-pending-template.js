"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const templateData = {
    code: 'OVERTIME_PENDING',
    name: 'Heures Supplémentaires en Attente',
    description: 'Récapitulatif des demandes d\'heures supplémentaires en attente d\'approbation',
    subject: '[Pointage] {{pendingCount}} demande(s) d\'heures supplémentaires en attente',
    category: 'notification',
    variables: ['managerName', 'pendingCount', 'totalHours', 'overtimesList', 'approvalUrl'],
    htmlContent: `<!DOCTYPE html>
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
    isDefault: true,
    active: true
};
async function main() {
    console.log('🔧 Creating OVERTIME_PENDING template for all tenants...\n');
    const tenants = await prisma.tenant.findMany({
        select: { id: true, companyName: true }
    });
    console.log(`Found ${tenants.length} tenant(s)\n`);
    for (const tenant of tenants) {
        try {
            const result = await prisma.emailTemplate.upsert({
                where: {
                    tenantId_code: {
                        tenantId: tenant.id,
                        code: 'OVERTIME_PENDING'
                    }
                },
                create: {
                    tenantId: tenant.id,
                    ...templateData
                },
                update: templateData
            });
            console.log(`✅ Template created/updated for "${tenant.companyName}" - ID: ${result.id}`);
        }
        catch (error) {
            console.error(`❌ Error for "${tenant.companyName}":`, error.message);
        }
    }
    console.log('\n✅ Done!');
}
main()
    .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=create-overtime-pending-template.js.map