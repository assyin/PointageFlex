"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TENANT_ID = '340a6c2a-160e-4f4b-917e-6eea8fd5ff2d';
async function main() {
    console.log('🔧 Création des types Télétravail et Mission...\n');
    const existingTeletravail = await prisma.leaveType.findFirst({
        where: {
            tenantId: TENANT_ID,
            OR: [
                { code: { contains: 'TELETRAVAIL', mode: 'insensitive' } },
                { code: { contains: 'REMOTE', mode: 'insensitive' } },
                { name: { contains: 'télétravail', mode: 'insensitive' } },
            ]
        }
    });
    if (!existingTeletravail) {
        const teletravail = await prisma.leaveType.create({
            data: {
                tenantId: TENANT_ID,
                name: 'Télétravail',
                code: 'TELETRAVAIL',
                isPaid: true,
                requiresDocument: false,
                maxDaysPerYear: null,
            }
        });
        console.log(`✅ Type "Télétravail" créé (ID: ${teletravail.id})`);
    }
    else {
        console.log(`ℹ️  Type "Télétravail" existe déjà (ID: ${existingTeletravail.id})`);
    }
    const existingMission = await prisma.leaveType.findFirst({
        where: {
            tenantId: TENANT_ID,
            OR: [
                { code: { contains: 'MISSION', mode: 'insensitive' } },
                { name: { contains: 'mission', mode: 'insensitive' } },
            ]
        }
    });
    if (!existingMission) {
        const mission = await prisma.leaveType.create({
            data: {
                tenantId: TENANT_ID,
                name: 'Mission / Déplacement',
                code: 'MISSION',
                isPaid: true,
                requiresDocument: false,
                maxDaysPerYear: null,
            }
        });
        console.log(`✅ Type "Mission" créé (ID: ${mission.id})`);
    }
    else {
        console.log(`ℹ️  Type "Mission" existe déjà (ID: ${existingMission.id})`);
    }
    console.log('\n📋 Types de congés disponibles:\n');
    const allTypes = await prisma.leaveType.findMany({
        where: { tenantId: TENANT_ID },
        orderBy: { name: 'asc' }
    });
    allTypes.forEach(t => {
        console.log(`  - ${t.name} (code: ${t.code})`);
    });
    console.log('\n✅ Configuration terminée!');
    console.log('\n💡 Pour créer un télétravail/mission pour un employé:');
    console.log('   1. Allez dans "Congés" sur le frontend');
    console.log('   2. Créez une demande avec le type "Télétravail" ou "Mission"');
    console.log('   3. Approuvez la demande');
    console.log('   4. L\'employé sera exclu des notifications d\'anomalies pendant cette période');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=create-teletravail-mission-types.js.map