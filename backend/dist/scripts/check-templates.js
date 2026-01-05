"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const templates = await prisma.emailTemplate.findMany({
        select: {
            id: true,
            tenantId: true,
            code: true,
            name: true,
            subject: true,
            active: true,
        },
        orderBy: { code: 'asc' },
    });
    console.log('\n📧 EmailTemplates existants:');
    console.log('================================');
    if (templates.length === 0) {
        console.log('❌ AUCUN template trouvé!');
    }
    else {
        templates.forEach((t) => {
            const status = t.active ? '✅' : '❌';
            const tenantShort = t.tenantId ? t.tenantId.substring(0, 8) + '...' : 'global';
            console.log(`${status} ${t.code} - ${t.name} (tenant: ${tenantShort})`);
        });
    }
    const requiredCodes = [
        'LATE',
        'ABSENCE',
        'ABSENCE_PARTIAL',
        'ABSENCE_TECHNICAL',
        'MISSING_IN',
        'MISSING_OUT',
    ];
    console.log('\n📋 Codes requis pour les notifications:');
    requiredCodes.forEach((code) => {
        const found = templates.find((t) => t.code === code);
        const status = found ? '✅' : '❌';
        const result = found ? 'Trouvé' : 'MANQUANT';
        console.log(`${status} ${code}: ${result}`);
    });
    console.log('\n📊 Tables de notification logs:');
    const lateCount = await prisma.lateNotificationLog.count();
    console.log(`   LateNotificationLog: ${lateCount} enregistrements`);
    const absenceCount = await prisma.absenceNotificationLog.count();
    console.log(`   AbsenceNotificationLog: ${absenceCount} enregistrements`);
    const absencePartialCount = await prisma.absencePartialNotificationLog.count();
    console.log(`   AbsencePartialNotificationLog: ${absencePartialCount} enregistrements`);
    const absenceTechnicalCount = await prisma.absenceTechnicalNotificationLog.count();
    console.log(`   AbsenceTechnicalNotificationLog: ${absenceTechnicalCount} enregistrements`);
    const missingInCount = await prisma.missingInNotificationLog.count();
    console.log(`   MissingInNotificationLog: ${missingInCount} enregistrements`);
    const missingOutCount = await prisma.missingOutNotificationLog.count();
    console.log(`   MissingOutNotificationLog: ${missingOutCount} enregistrements`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-templates.js.map