"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const NEW_MANAGER_PERMISSIONS = [
    'schedule.view_all',
    'schedule.create',
    'schedule.update',
    'schedule.delete',
];
async function main() {
    console.log('🚀 Mise à jour des permissions du rôle MANAGER pour la gestion des plannings...\n');
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
            console.log(`  ✓ Rôle MANAGER trouvé: ${managerRole.name} (${managerRole.id})`);
            const permissions = await prisma.permission.findMany({
                where: {
                    code: { in: NEW_MANAGER_PERMISSIONS },
                },
            });
            if (permissions.length !== NEW_MANAGER_PERMISSIONS.length) {
                const foundCodes = permissions.map((p) => p.code);
                const missing = NEW_MANAGER_PERMISSIONS.filter((c) => !foundCodes.includes(c));
                console.log(`  ⚠️  Permissions manquantes: ${missing.join(', ')}`);
            }
            console.log(`  📝 ${permissions.length} permission(s) à ajouter`);
            let addedCount = 0;
            let alreadyAssignedCount = 0;
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
                    alreadyAssignedCount++;
                }
            }
            console.log(`  ✅ ${addedCount} nouvelle(s) permission(s) ajoutée(s) au rôle MANAGER`);
            console.log(`     ${alreadyAssignedCount} permission(s) déjà assignée(s)\n`);
        }
        console.log('✅ Mise à jour terminée avec succès!');
        console.log('\n⚠️  IMPORTANT: Les utilisateurs MANAGER doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.');
        console.log('   Les permissions seront actives après la reconnexion.');
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
//# sourceMappingURL=update-manager-schedule-permissions.js.map