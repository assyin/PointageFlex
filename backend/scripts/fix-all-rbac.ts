import { PrismaClient, LegacyRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script complet pour corriger le RBAC :
 * 1. S'assure que tous les rôles existent pour chaque tenant
 * 2. Supprime tous les UserTenantRole existants
 * 3. Réassigne les bons rôles basés sur le rôle legacy
 */
async function fixAllRBAC() {
  console.log('🔧 Correction complète du système RBAC...\n');

  try {
    // 1. Récupérer tous les tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        companyName: true,
        slug: true,
      },
    });

    console.log(`📊 ${tenants.length} tenant(s) trouvé(s)\n`);

    // 2. Pour chaque tenant, s'assurer que les rôles existent
    for (const tenant of tenants) {
      console.log(`\n🏢 Tenant: ${tenant.companyName} (${tenant.id})`);
      
      // Rôles à créer pour chaque tenant
      const rolesToCreate = [
        { code: 'ADMIN_RH', name: 'Administrateur RH', description: 'Administrateur des ressources humaines', isSystem: true },
        { code: 'MANAGER', name: 'Manager', description: 'Manager d\'équipe', isSystem: true },
        { code: 'EMPLOYEE', name: 'Employé', description: 'Employé standard', isSystem: true },
      ];

      for (const roleData of rolesToCreate) {
        const existingRole = await prisma.role.findFirst({
          where: {
            tenantId: tenant.id,
            code: roleData.code,
          },
        });

        if (!existingRole) {
          const role = await prisma.role.create({
            data: {
              tenantId: tenant.id,
              code: roleData.code,
              name: roleData.name,
              description: roleData.description,
              isSystem: roleData.isSystem,
              isActive: true,
            },
          });
          console.log(`  ✓ Rôle créé: ${role.code}`);
        } else {
          console.log(`  ⊘ Rôle existe déjà: ${existingRole.code}`);
        }
      }
    }

    // 3. S'assurer que SUPER_ADMIN existe (rôle système, tenantId: null)
    const superAdminRole = await prisma.role.findFirst({
      where: {
        tenantId: null,
        code: 'SUPER_ADMIN',
      },
    });

    if (!superAdminRole) {
      await prisma.role.create({
        data: {
          tenantId: null,
          code: 'SUPER_ADMIN',
          name: 'Super Administrateur',
          description: 'Super administrateur de la plateforme',
          isSystem: true,
          isActive: true,
        },
      });
      console.log(`\n✓ Rôle système créé: SUPER_ADMIN`);
    } else {
      console.log(`\n⊘ Rôle système existe déjà: SUPER_ADMIN`);
    }

    // 4. Supprimer TOUS les UserTenantRole existants
    console.log('\n🗑️  Suppression de tous les UserTenantRole existants...');
    const deletedCount = await prisma.userTenantRole.deleteMany({});
    console.log(`  ✓ ${deletedCount.count} UserTenantRole supprimé(s)\n`);

    // 5. Récupérer tous les utilisateurs avec leur tenantId et role legacy
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

    // 6. Pour chaque utilisateur, créer le bon UserTenantRole
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

        console.log(`✓ ${user.email}: Rôle assigné (${user.role} → ${role.code})`);
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

fixAllRBAC()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

