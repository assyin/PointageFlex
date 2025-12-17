import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour mettre à jour les permissions du rôle MANAGER
 * Ajoute les permissions manquantes pour la gestion complète des plannings
 * (schedule.create, schedule.update, schedule.delete, schedule.view_all)
 */

const NEW_MANAGER_PERMISSIONS = [
  'schedule.view_all', // Permet de voir tous les plannings des employés gérés
  'schedule.create',   // Permet de créer des plannings
  'schedule.update',   // Permet de modifier des plannings
  'schedule.delete',   // Permet de supprimer des plannings
];

async function main() {
  console.log('🚀 Mise à jour des permissions du rôle MANAGER pour la gestion des plannings...\n');

  try {
    // 1. Récupérer tous les tenants
    const tenants = await prisma.tenant.findMany();
    console.log(`📊 ${tenants.length} tenant(s) trouvé(s)\n`);

    for (const tenant of tenants) {
      console.log(`🏢 Tenant: ${tenant.companyName} (${tenant.id})`);

      // 2. Trouver le rôle MANAGER pour ce tenant
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

      // 3. Récupérer les permissions à ajouter
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

      // 4. Ajouter les permissions au rôle MANAGER
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
        } else {
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

