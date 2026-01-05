"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenants = await prisma.tenant.findMany({
        select: { id: true, companyName: true, displayName: true }
    });
    console.log('📋 Tenants disponibles:\n');
    tenants.forEach(t => {
        console.log(`  ID: ${t.id}`);
        console.log(`  Nom: ${t.displayName || t.companyName}\n`);
    });
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=list-tenants.js.map