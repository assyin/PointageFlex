import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour mettre à jour les permissions du rôle MANAGER
 * Ajoute les permissions manquantes pour permettre au MANAGER de gérer ses propres données
 */

const NEW_MANAGER_PERMISSIONS = [
  'employee.view_own',              // Voir ses propres informations
  'attendance.view_own',            // Voir ses propres pointages
  'schedule.view_own',              // Voir son propre planning
  'leave.view_own',                 // Voir ses propres congés
  'leave.create',                   // Créer des demandes de congés
  'leave.update',                   // Modifier ses propres demandes de congés
  'overtime.view_own',              // Voir ses propres heures sup
];

async function main() {
  console.log('🚀 Mise à jour des permissions du rôle MANAGER...\n');

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

      console.log(`  ✓ Rôle MANAGER trouvé: ${managerRole.name}`);

      // 3. Récupérer les permissions à ajouter
      const permissions = await prisma.permission.findMany({
        where: {
          code: { in: NEW_MANAGER_PERMISSIONS },
        },
      });

      console.log(`  📝 ${permissions.length} permission(s) à ajouter`);

      // 4. Ajouter les permissions au rôle MANAGER
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
        } else {
          console.log(`    ⊘ ${permission.code} déjà assignée`);
        }
      }

      console.log(`  ✅ ${addedCount} nouvelle(s) permission(s) ajoutée(s) au rôle MANAGER\n`);
    }

    console.log('✅ Mise à jour terminée avec succès!');
    console.log('\n⚠️  IMPORTANT: Les utilisateurs MANAGER doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.');
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

