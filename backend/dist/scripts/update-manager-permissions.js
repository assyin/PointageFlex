"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const NEW_MANAGER_PERMISSIONS = [
    'employee.view_own',
    'attendance.view_own',
    'schedule.view_own',
    'leave.view_own',
    'leave.create',
    'leave.update',
    'overtime.view_own',
];
async function main() {
    console.log('🚀 Mise à jour des permissions du rôle MANAGER...\n');
    try {
        const tenants = await prisma.tenant.findMany();
        console.log(`📊 ${tenants.length} tenant(s) trouvé(s)\n`);
        for (const tenant of tenants) {
            console.log(`🏢 Tenant: ${tenant.companyName} (${tenant.id})`);
            const managerRole = await prisma.role.findFirst({
                where: {
                    tenantId: tenant.id,
                    code: 'MANAGER',
                },
            });
            if (!managerRole) {
                console.log('  ⚠️  Rôle MANAGER non trouvé pour ce tenant');
                continue;
            }
            console.log(`  ✓ Rôle MANAGER trouvé: ${managerRole.name}`);
            const permissions = await prisma.permission.findMany({
                where: {
                    code: { in: NEW_MANAGER_PERMISSIONS },
                },
            });
            console.log(`  📝 ${permissions.length} permission(s) à ajouter`);
            let addedCount = 0;
            for (const permission of permissions) {
                const existing = await prisma.rolePermission.findUnique({
                    where: {
                        roleId_permissionId: {
                            roleId: managerRole.id,
                            permissionId: permission.id,
                        },
                    },
                });
                if (!existing) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: managerRole.id,
                            permissionId: permission.id,
                        },
                    });
                    console.log(`    ✓ ${permission.code} ajoutée`);
                    addedCount++;
                }
                else {
                    console.log(`    ⊘ ${permission.code} déjà assignée`);
                }
            }
            console.log(`  ✅ ${addedCount} nouvelle(s) permission(s) ajoutée(s) au rôle MANAGER\n`);
        }
        console.log('✅ Mise à jour terminée avec succès!');
        console.log('\n⚠️  IMPORTANT: Les utilisateurs MANAGER doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.');
    }
    catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        throw error;
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=update-manager-permissions.js.map