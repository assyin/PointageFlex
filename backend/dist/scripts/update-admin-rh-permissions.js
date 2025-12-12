"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const NEW_ADMIN_RH_PERMISSIONS = [
    'employee.view_own',
    'attendance.view_own',
    'schedule.view_own',
    'leave.view_own',
    'leave.create',
    'leave.update',
    'overtime.view_own',
];
async function main() {
    console.log('🚀 Mise à jour des permissions du rôle ADMIN_RH...\n');
    try {
        const tenants = await prisma.tenant.findMany();
        console.log(`📊 ${tenants.length} tenant(s) trouvé(s)\n`);
        for (const tenant of tenants) {
            console.log(`🏢 Tenant: ${tenant.companyName} (${tenant.id})`);
            const adminRhRole = await prisma.role.findFirst({
                where: {
                    tenantId: tenant.id,
                    code: 'ADMIN_RH',
                },
            });
            if (!adminRhRole) {
                console.log('  ⚠️  Rôle ADMIN_RH non trouvé pour ce tenant');
                continue;
            }
            console.log(`  ✓ Rôle ADMIN_RH trouvé: ${adminRhRole.name}`);
            const permissions = await prisma.permission.findMany({
                where: {
                    code: { in: NEW_ADMIN_RH_PERMISSIONS },
                },
            });
            console.log(`  📝 ${permissions.length} permission(s) à ajouter`);
            let addedCount = 0;
            for (const permission of permissions) {
                const existing = await prisma.rolePermission.findUnique({
                    where: {
                        roleId_permissionId: {
                            roleId: adminRhRole.id,
                            permissionId: permission.id,
                        },
                    },
                });
                if (!existing) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: adminRhRole.id,
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
            console.log(`  ✅ ${addedCount} nouvelle(s) permission(s) ajoutée(s) au rôle ADMIN_RH\n`);
        }
        console.log('✅ Mise à jour terminée avec succès!');
        console.log('\n⚠️  IMPORTANT: Les utilisateurs ADMIN_RH doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.');
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
//# sourceMappingURL=update-admin-rh-permissions.js.map