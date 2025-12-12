"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function migrateUsersToRBAC() {
    console.log('🚀 Migration des utilisateurs vers le système RBAC...\n');
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
        console.log(`📊 ${users.length} utilisateur(s) trouvé(s) à migrer\n`);
        if (users.length === 0) {
            console.log('✅ Aucun utilisateur à migrer.\n');
            return;
        }
        let migrated = 0;
        let skipped = 0;
        let errors = 0;
        for (const user of users) {
            try {
                const existingRole = await prisma.userTenantRole.findFirst({
                    where: {
                        userId: user.id,
                        tenantId: user.tenantId,
                    },
                    include: {
                        role: true,
                    },
                });
                if (existingRole) {
                    console.log(`⊘ ${user.email}: Déjà migré (rôle: ${existingRole.role.code})`);
                    skipped++;
                    continue;
                }
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
                console.log(`✓ ${user.email}: Migré avec succès (rôle: ${role.code})`);
                migrated++;
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
                            migration: true,
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
        console.log('📊 Résumé de la migration :');
        console.log(`   ✓ Migrés : ${migrated}`);
        console.log(`   ⊘ Déjà migrés : ${skipped}`);
        console.log(`   ❌ Erreurs : ${errors}`);
        console.log('=========================================\n');
        if (errors === 0) {
            console.log('✅ Migration terminée avec succès !\n');
        }
        else {
            console.log('⚠️  Migration terminée avec des erreurs. Vérifiez les logs ci-dessus.\n');
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        throw error;
    }
}
migrateUsersToRBAC()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=migrate-users-to-rbac.js.map