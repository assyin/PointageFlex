"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixUserRoles() {
    console.log('🔧 Correction des rôles des utilisateurs...\n');
    try {
        const users = await prisma.user.findMany({
            where: {
                tenantId: { not: null },
                role: { not: null },
            },
            select: {
                id: true,
                email: true,
                tenantId: true,
                role: true,
            },
        });
        console.log(`📊 ${users.length} utilisateur(s) trouvé(s)\n`);
        if (users.length === 0) {
            console.log('✅ Aucun utilisateur à corriger.\n');
            return;
        }
        let fixed = 0;
        let errors = 0;
        for (const user of users) {
            try {
                const role = await prisma.role.findFirst({
                    where: {
                        OR: [
                            { tenantId: user.tenantId, code: user.role },
                            { tenantId: null, code: user.role },
                        ],
                    },
                });
                if (!role) {
                    console.log(`⚠️  ${user.email}: Rôle "${user.role}" non trouvé pour le tenant ${user.tenantId}`);
                    errors++;
                    continue;
                }
                await prisma.userTenantRole.deleteMany({
                    where: {
                        userId: user.id,
                        tenantId: user.tenantId,
                    },
                });
                await prisma.userTenantRole.create({
                    data: {
                        userId: user.id,
                        tenantId: user.tenantId,
                        roleId: role.id,
                        isActive: true,
                        assignedBy: null,
                        assignedAt: new Date(),
                    },
                });
                console.log(`✓ ${user.email}: Rôle corrigé (${user.role} → ${role.code})`);
                fixed++;
                await prisma.auditLog.create({
                    data: {
                        tenantId: user.tenantId,
                        userId: null,
                        action: 'ROLE_ASSIGNED',
                        entity: 'UserTenantRole',
                        entityId: user.id,
                        newValues: {
                            userId: user.id,
                            tenantId: user.tenantId,
                            roleId: role.id,
                            roleCode: role.code,
                            correction: true,
                        },
                    },
                });
            }
            catch (error) {
                console.error(`❌ ${user.email}: Erreur - ${error.message}`);
                errors++;
            }
        }
        console.log('\n=========================================');
        console.log('📊 Résumé de la correction :');
        console.log(`   ✓ Corrigés : ${fixed}`);
        console.log(`   ❌ Erreurs : ${errors}`);
        console.log('=========================================\n');
        if (errors === 0) {
            console.log('✅ Correction terminée avec succès !\n');
            console.log('⚠️  IMPORTANT: Vous devez vous reconnecter pour obtenir un nouveau JWT avec les bons rôles.\n');
        }
        else {
            console.log('⚠️  Correction terminée avec des erreurs. Vérifiez les logs ci-dessus.\n');
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
        throw error;
    }
}
fixUserRoles()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=fix-user-roles.js.map