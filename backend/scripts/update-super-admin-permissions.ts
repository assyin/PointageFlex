import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour mettre à jour les permissions du rôle SUPER_ADMIN
 * Assigne TOUTES les permissions disponibles au SUPER_ADMIN
 */

async function main() {
  console.log('🚀 Mise à jour des permissions du rôle SUPER_ADMIN...\n');

  try {
    // 1. Trouver le rôle SUPER_ADMIN (système, tenantId: null)
    const superAdminRole = await prisma.role.findFirst({
      where: {
        tenantId: null,
        code: 'SUPER_ADMIN',
      },
    });

    if (!superAdminRole) {
      console.log('❌ Rôle SUPER_ADMIN non trouvé. Exécutez d\'abord init-rbac.ts');
      return;
    }

    console.log(`✅ Rôle SUPER_ADMIN trouvé: ${superAdminRole.name} (${superAdminRole.id})\n`);

    // 2. Récupérer TOUTES les permissions disponibles
    const allPermissions = await prisma.permission.findMany({
      where: {
        isActive: true,
      },
    });

    console.log(`📝 ${allPermissions.length} permission(s) disponible(s)\n`);

    // 3. Assigner TOUTES les permissions au SUPER_ADMIN
    let addedCount = 0;
    let alreadyAssignedCount = 0;

    for (const permission of allPermissions) {
      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✓ ${permission.code} ajoutée`);
        addedCount++;
      } else {
        alreadyAssignedCount++;
      }
    }

    console.log(`\n✅ ${addedCount} nouvelle(s) permission(s) ajoutée(s) au rôle SUPER_ADMIN`);
    console.log(`   ${alreadyAssignedCount} permission(s) déjà assignée(s)`);
    console.log(`   Total: ${allPermissions.length} permission(s) assignée(s)\n`);

    console.log('✅ Mise à jour terminée avec succès!');
    console.log('\n⚠️  IMPORTANT: Les utilisateurs SUPER_ADMIN doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.');
  } catch (error) {
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

