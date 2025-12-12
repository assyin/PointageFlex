import { PrismaClient, LegacyRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour corriger les rôles legacy dans la table User
 * puis réassigner les bons rôles RBAC
 */
async function fixUserLegacyRoles() {
  console.log('🔧 Correction des rôles legacy et RBAC...\n');

  try {
    // 1. Corriger les rôles legacy dans la table User
    console.log('📝 Correction des rôles legacy...\n');

    const roleMappings = [
      { email: 'admin@demo.com', legacyRole: LegacyRole.ADMIN_RH },
      { email: 'rh@demo.com', legacyRole: LegacyRole.ADMIN_RH },
      { email: 'manager@demo.com', legacyRole: LegacyRole.MANAGER },
      { email: 'employee@demo.com', legacyRole: LegacyRole.EMPLOYEE },
    ];

    for (const mapping of roleMappings) {
      const user = await prisma.user.findFirst({
        where: { email: mapping.email },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: mapping.legacyRole },
        });
        console.log(`✓ ${mapping.email}: Rôle legacy corrigé (${mapping.legacyRole})`);
      } else {
        console.log(`⚠️  ${mapping.email}: Utilisateur non trouvé`);
      }
    }

    console.log('\n');

    // 2. Supprimer tous les UserTenantRole existants
    console.log('🗑️  Suppression de tous les UserTenantRole existants...');
    const deletedCount = await prisma.userTenantRole.deleteMany({});
    console.log(`  ✓ ${deletedCount.count} UserTenantRole supprimé(s)\n`);

    // 3. Récupérer tous les utilisateurs avec leur tenantId et role legacy corrigé
    const users = await prisma.user.findMany({
      where: {
        role: { not: null },
      },
      select: {
        id: true,
        email: true,
        tenantId: true,
        role: true,
      },
    });

    console.log(`📊 ${users.length} utilisateur(s) trouvé(s) à corriger\n`);

    let fixed = 0;
    let errors = 0;

    // 4. Pour chaque utilisateur, créer le bon UserTenantRole
    for (const user of users) {
      try {
        // Trouver le rôle RBAC correspondant
        const role = await prisma.role.findFirst({
          where: {
            OR: [
              { tenantId: user.tenantId, code: user.role! },
              { tenantId: null, code: user.role! }, // Rôles système (SUPER_ADMIN)
            ],
          },
        });

        if (!role) {
          console.log(`⚠️  ${user.email}: Rôle "${user.role}" non trouvé`);
          errors++;
          continue;
        }

        // Pour SUPER_ADMIN, on peut avoir tenantId: null, donc on doit gérer ça
        const tenantIdForRole = user.role === 'SUPER_ADMIN' ? user.tenantId : user.tenantId!;

        if (!tenantIdForRole && user.role !== 'SUPER_ADMIN') {
          console.log(`⚠️  ${user.email}: Pas de tenantId`);
          errors++;
          continue;
        }

        // Créer le UserTenantRole
        await prisma.userTenantRole.create({
          data: {
            userId: user.id,
            tenantId: tenantIdForRole!,
            roleId: role.id,
            isActive: true,
            assignedBy: null, // Correction système
            assignedAt: new Date(),
          },
        });

        console.log(`✓ ${user.email}: Rôle RBAC assigné (${user.role} → ${role.code})`);
        fixed++;

        // Créer un log d'audit
        if (tenantIdForRole) {
          await prisma.auditLog.create({
            data: {
              tenantId: tenantIdForRole,
              userId: null, // Correction système
              action: 'ROLE_ASSIGNED',
              entity: 'UserTenantRole',
              entityId: user.id,
              newValues: {
                userId: user.id,
                tenantId: tenantIdForRole,
                roleId: role.id,
                roleCode: role.code,
                correction: true,
              },
            },
          });
        }
      } catch (error: any) {
        console.error(`❌ ${user.email}: Erreur - ${error.message}`);
        errors++;
      }
    }

    console.log('\n=========================================');
    console.log('📊 Résumé de la correction :');
    console.log(`   ✓ Corrigés : ${fixed}`);
    console.log(`   ❌ Erreurs : ${errors}`);
    console.log('=========================================\n');

    // 5. Afficher le résumé des rôles
    console.log('📋 Rôles assignés :\n');
    const usersWithRoles = await prisma.user.findMany({
      where: { role: { not: null } },
      select: {
        email: true,
        role: true,
        userTenantRoles: {
          where: { isActive: true },
          include: {
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    for (const user of usersWithRoles) {
      console.log(`  ${user.email}:`);
      console.log(`    - Rôle legacy: ${user.role}`);
      if (user.userTenantRoles.length > 0) {
        user.userTenantRoles.forEach((utr) => {
          console.log(`    - Rôle RBAC: ${utr.role.code} (${utr.role.name})`);
        });
      } else {
        console.log(`    - ⚠️  Aucun rôle RBAC assigné`);
      }
      console.log('');
    }

    if (errors === 0) {
      console.log('✅ Correction terminée avec succès !\n');
      console.log('⚠️  IMPORTANT: Vous devez vous reconnecter pour obtenir un nouveau JWT avec les bons rôles.\n');
    } else {
      console.log('⚠️  Correction terminée avec des erreurs. Vérifiez les logs ci-dessus.\n');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  }
}

fixUserLegacyRoles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

