import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour assigner les rôles RBAC manquants aux utilisateurs
 * Résout le problème des utilisateurs qui n'ont que le legacy role
 */

async function main() {
  console.log('🚀 Assignment des rôles RBAC manquants...\n');

  try {
    // Récupérer tous les utilisateurs avec leurs rôles legacy
    const users = await prisma.user.findMany({
      where: {
        tenantId: { not: null },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    console.log(`📊 ${users.length} utilisateur(s) actif(s) trouvé(s)\n`);

    let assignedCount = 0;
    let alreadyAssignedCount = 0;
    let notFoundCount = 0;

    for (const user of users) {
      // Vérifier si l'utilisateur a déjà un rôle RBAC
      const existingRole = await prisma.userTenantRole.findFirst({
        where: {
          userId: user.id,
          tenantId: user.tenantId!,
          isActive: true,
        },
      });

      if (existingRole) {
        console.log(`  ⊘ ${user.email} - Rôle RBAC déjà assigné`);
        alreadyAssignedCount++;
        continue;
      }

      // Trouver le rôle RBAC correspondant au legacy role
      const role = await prisma.role.findFirst({
        where: {
          tenantId: user.tenantId,
          code: user.role,
          isActive: true,
        },
      });

      if (!role) {
        console.log(`  ❌ ${user.email} - Rôle ${user.role} non trouvé pour le tenant`);
        notFoundCount++;
        continue;
      }

      // Créer l'association UserTenantRole
      await prisma.userTenantRole.create({
        data: {
          userId: user.id,
          tenantId: user.tenantId!,
          roleId: role.id,
          isActive: true,
        },
      });

      console.log(`  ✓ ${user.email} - Rôle ${user.role} assigné`);
      assignedCount++;
    }

    console.log('\n========================================');
    console.log('✅ Assignment terminée!');
    console.log('========================================');
    console.log(`  Rôles assignés: ${assignedCount}`);
    console.log(`  Déjà assignés:  ${alreadyAssignedCount}`);
    console.log(`  Non trouvés:    ${notFoundCount}`);
    console.log(`  Total:          ${users.length}`);
    console.log('========================================\n');

    if (assignedCount > 0) {
      console.log('⚠️  IMPORTANT: Les utilisateurs doivent se reconnecter pour obtenir leurs nouveaux rôles.');
    }

    if (notFoundCount > 0) {
      console.log('⚠️  ATTENTION: Certains rôles n\'ont pas été trouvés. Exécutez init-rbac.ts si nécessaire.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignment:', error);
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
