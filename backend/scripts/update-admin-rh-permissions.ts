import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour mettre à jour les permissions du rôle ADMIN_RH
 * Ajoute les permissions manquantes pour permettre au ADMIN_RH de gérer ses propres données
 */

const NEW_ADMIN_RH_PERMISSIONS = [
  'employee.view_own',              // Voir ses propres informations (cohérence)
  'attendance.view_own',            // Voir ses propres pointages (cohérence)
  'schedule.view_own',              // Voir son propre planning (cohérence)
  'leave.view_own',                 // Voir ses propres congés
  'leave.create',                   // Créer des demandes de congés
  'leave.update',                   // Modifier ses propres demandes de congés
  'overtime.view_own',              // Voir ses propres heures sup (cohérence)
];

async function main() {
  console.log('🚀 Mise à jour des permissions du rôle ADMIN_RH...\n');

  try {
    // 1. Récupérer tous les tenants
    const tenants = await prisma.tenant.findMany();
    console.log(`📊 ${tenants.length} tenant(s) trouvé(s)\n`);

    for (const tenant of tenants) {
      console.log(`🏢 Tenant: ${tenant.companyName} (${tenant.id})`);

      // 2. Trouver le rôle ADMIN_RH pour ce tenant
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

      // 3. Récupérer les permissions à ajouter
      const permissions = await prisma.permission.findMany({
        where: {
          code: { in: NEW_ADMIN_RH_PERMISSIONS },
        },
      });

      console.log(`  📝 ${permissions.length} permission(s) à ajouter`);

      // 4. Ajouter les permissions au rôle ADMIN_RH
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
        } else {
          console.log(`    ⊘ ${permission.code} déjà assignée`);
        }
      }

      console.log(`  ✅ ${addedCount} nouvelle(s) permission(s) ajoutée(s) au rôle ADMIN_RH\n`);
    }

    console.log('✅ Mise à jour terminée avec succès!');
    console.log('\n⚠️  IMPORTANT: Les utilisateurs ADMIN_RH doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.');
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

