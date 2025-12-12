import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script d'initialisation du système RBAC
 * Crée les permissions par défaut et les rôles système
 */

const PERMISSIONS = [
  // ============================================
  // Permissions - Employés
  // ============================================
  { code: 'employee.view_all', name: 'Voir tous les employés', category: 'employees' },
  { code: 'employee.view_own', name: 'Voir ses propres informations', category: 'employees' },
  { code: 'employee.view_team', name: 'Voir les employés de son équipe', category: 'employees' },
  { code: 'employee.view_department', name: 'Voir les employés de son département', category: 'employees' },
  { code: 'employee.view_site', name: 'Voir les employés de son site', category: 'employees' },
  { code: 'employee.create', name: 'Créer un employé', category: 'employees' },
  { code: 'employee.update', name: 'Modifier un employé', category: 'employees' },
  { code: 'employee.delete', name: 'Supprimer un employé', category: 'employees' },
  { code: 'employee.import', name: 'Importer des employés', category: 'employees' },
  { code: 'employee.export', name: 'Exporter des employés', category: 'employees' },
  { code: 'employee.manage_biometric', name: 'Gérer les données biométriques', category: 'employees' },

  // ============================================
  // Permissions - Pointages
  // ============================================
  { code: 'attendance.view_all', name: 'Voir tous les pointages', category: 'attendance' },
  { code: 'attendance.view_own', name: 'Voir ses propres pointages', category: 'attendance' },
  { code: 'attendance.view_team', name: 'Voir les pointages de son équipe', category: 'attendance' },
  { code: 'attendance.view_department', name: 'Voir les pointages de son département', category: 'attendance' },
  { code: 'attendance.view_site', name: 'Voir les pointages de son site', category: 'attendance' },
  { code: 'attendance.create', name: 'Créer un pointage', category: 'attendance' },
  { code: 'attendance.edit', name: 'Modifier un pointage', category: 'attendance' },
  { code: 'attendance.correct', name: 'Corriger un pointage', category: 'attendance' },
  { code: 'attendance.delete', name: 'Supprimer un pointage', category: 'attendance' },
  { code: 'attendance.import', name: 'Importer des pointages', category: 'attendance' },
  { code: 'attendance.export', name: 'Exporter des pointages', category: 'attendance' },
  { code: 'attendance.view_anomalies', name: 'Voir les anomalies de pointage', category: 'attendance' },

  // ============================================
  // Permissions - Plannings & Shifts
  // ============================================
  { code: 'schedule.view_all', name: 'Voir tous les plannings', category: 'schedules' },
  { code: 'schedule.view_own', name: 'Voir son propre planning', category: 'schedules' },
  { code: 'schedule.view_team', name: 'Voir le planning de son équipe', category: 'schedules' },
  { code: 'schedule.view_department', name: 'Voir le planning de son département', category: 'schedules' },
  { code: 'schedule.view_site', name: 'Voir le planning de son site', category: 'schedules' },
  { code: 'schedule.create', name: 'Créer un planning', category: 'schedules' },
  { code: 'schedule.update', name: 'Modifier un planning', category: 'schedules' },
  { code: 'schedule.delete', name: 'Supprimer un planning', category: 'schedules' },
  { code: 'schedule.manage_team', name: 'Gérer le planning de son équipe', category: 'schedules' },
  { code: 'schedule.approve_replacement', name: 'Approuver un remplacement', category: 'schedules' },
  { code: 'shift.view_all', name: 'Voir tous les shifts', category: 'shifts' },
  { code: 'shift.create', name: 'Créer un shift', category: 'shifts' },
  { code: 'shift.update', name: 'Modifier un shift', category: 'shifts' },
  { code: 'shift.delete', name: 'Supprimer un shift', category: 'shifts' },

  // ============================================
  // Permissions - Congés & Récupérations
  // ============================================
  { code: 'leave.view_all', name: 'Voir tous les congés', category: 'leaves' },
  { code: 'leave.view_own', name: 'Voir ses propres congés', category: 'leaves' },
  { code: 'leave.view_team', name: 'Voir les congés de son équipe', category: 'leaves' },
  { code: 'leave.view_department', name: 'Voir les congés de son département', category: 'leaves' },
  { code: 'leave.view_site', name: 'Voir les congés de son site', category: 'leaves' },
  { code: 'leave.create', name: 'Demander un congé', category: 'leaves' },
  { code: 'leave.update', name: 'Modifier une demande de congé', category: 'leaves' },
  { code: 'leave.approve', name: 'Approuver un congé', category: 'leaves' },
  { code: 'leave.reject', name: 'Refuser un congé', category: 'leaves' },
  { code: 'leave.manage_types', name: 'Gérer les types de congés', category: 'leaves' },
  { code: 'overtime.view_all', name: 'Voir toutes les heures sup', category: 'overtime' },
  { code: 'overtime.view_own', name: 'Voir ses propres heures sup', category: 'overtime' },
  { code: 'overtime.view_department', name: 'Voir les heures sup de son département', category: 'overtime' },
  { code: 'overtime.view_site', name: 'Voir les heures sup de son site', category: 'overtime' },
  { code: 'overtime.approve', name: 'Approuver des heures sup', category: 'overtime' },
  { code: 'recovery.view', name: 'Voir les récupérations', category: 'overtime' },

  // ============================================
  // Permissions - Rapports
  // ============================================
  { code: 'reports.view_all', name: 'Voir tous les rapports', category: 'reports' },
  { code: 'reports.view_attendance', name: 'Voir les rapports de présence', category: 'reports' },
  { code: 'reports.view_leaves', name: 'Voir les rapports de congés', category: 'reports' },
  { code: 'reports.view_overtime', name: 'Voir les rapports d\'heures sup', category: 'reports' },
  { code: 'reports.export', name: 'Exporter des rapports', category: 'reports' },
  { code: 'reports.view_payroll', name: 'Voir les exports paie', category: 'reports' },

  // ============================================
  // Permissions - Utilisateurs & Rôles
  // ============================================
  { code: 'user.view_all', name: 'Voir tous les utilisateurs', category: 'users' },
  { code: 'user.create', name: 'Créer un utilisateur', category: 'users' },
  { code: 'user.update', name: 'Modifier un utilisateur', category: 'users' },
  { code: 'user.delete', name: 'Supprimer un utilisateur', category: 'users' },
  { code: 'user.view_roles', name: 'Voir les rôles d\'un utilisateur', category: 'users' },
  { code: 'user.assign_roles', name: 'Assigner des rôles', category: 'users' },
  { code: 'user.remove_roles', name: 'Retirer des rôles', category: 'users' },
  { code: 'role.view_all', name: 'Voir tous les rôles', category: 'users' },
  { code: 'role.create', name: 'Créer un rôle', category: 'users' },
  { code: 'role.update', name: 'Modifier un rôle', category: 'users' },
  { code: 'role.delete', name: 'Supprimer un rôle', category: 'users' },

  // ============================================
  // Permissions - Paramètres Tenant
  // ============================================
  { code: 'tenant.view_settings', name: 'Voir les paramètres du tenant', category: 'settings' },
  { code: 'tenant.update_settings', name: 'Modifier les paramètres du tenant', category: 'settings' },
  { code: 'tenant.manage_sites', name: 'Gérer les sites', category: 'settings' },
  { code: 'tenant.manage_departments', name: 'Gérer les départements', category: 'settings' },
  { code: 'tenant.manage_positions', name: 'Gérer les postes', category: 'settings' },
  { code: 'tenant.manage_teams', name: 'Gérer les équipes', category: 'settings' },
  { code: 'tenant.manage_holidays', name: 'Gérer les jours fériés', category: 'settings' },
  { code: 'tenant.manage_devices', name: 'Gérer les terminaux', category: 'settings' },

  // ============================================
  // Permissions - Audit
  // ============================================
  { code: 'audit.view_all', name: 'Voir tous les logs d\'audit', category: 'audit' },
  { code: 'audit.view_own', name: 'Voir ses propres logs', category: 'audit' },
];

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    // ============================================
    // SUPER_ADMIN : TOUTES LES PERMISSIONS
    // Contrôle total de la plateforme
    // ============================================
    
    // Employés - Toutes les permissions
    'employee.view_all',
    'employee.view_own',
    'employee.view_team',
    'employee.create',
    'employee.update',
    'employee.delete',
    'employee.import',
    'employee.export',
    'employee.manage_biometric',
    
    // Pointages - Toutes les permissions
    'attendance.view_all',
    'attendance.view_own',
    'attendance.view_team',
    'attendance.create',
    'attendance.edit',
    'attendance.correct',
    'attendance.delete',
    'attendance.import',
    'attendance.export',
    'attendance.view_anomalies',
    
    // Plannings & Shifts - Toutes les permissions
    'schedule.view_all',
    'schedule.view_own',
    'schedule.view_team',
    'schedule.create',
    'schedule.update',
    'schedule.delete',
    'schedule.manage_team',
    'schedule.approve_replacement',
    'shift.view_all',
    'shift.create',
    'shift.update',
    'shift.delete',
    
    // Congés & Récupérations - Toutes les permissions
    'leave.view_all',
    'leave.view_own',
    'leave.view_team',
    'leave.create',
    'leave.update',
    'leave.approve',
    'leave.reject',
    'leave.manage_types',
    'overtime.view_all',
    'overtime.view_own',
    'overtime.approve',
    'recovery.view',
    
    // Rapports - Toutes les permissions
    'reports.view_all',
    'reports.view_attendance',
    'reports.view_leaves',
    'reports.view_overtime',
    'reports.export',
    'reports.view_payroll',
    
    // Utilisateurs & Rôles - Toutes les permissions
    'user.view_all',
    'user.create',
    'user.update',
    'user.delete',
    'user.view_roles',
    'user.assign_roles',
    'user.remove_roles',
    'role.view_all',
    'role.create',
    'role.update',
    'role.delete',
    
    // Paramètres Tenant - Toutes les permissions
    'tenant.view_settings',
    'tenant.update_settings',
    'tenant.manage_sites',
    'tenant.manage_departments',
    'tenant.manage_positions',
    'tenant.manage_teams',
    'tenant.manage_holidays',
    'tenant.manage_devices',
    
    // Audit - Toutes les permissions
    'audit.view_all',
    'audit.view_own',
  ],
  ADMIN_RH: [
    // Gestion complète RH
    'employee.view_all',
    'employee.view_own',              // Voir ses propres informations (cohérence)
    'employee.view_department',       // Voir les employés de son département
    'employee.view_site',             // Voir les employés de son site
    'employee.create',
    'employee.update',
    'employee.delete',
    'employee.import',
    'employee.export',
    'employee.manage_biometric',
    'attendance.view_all',
    'attendance.view_own',            // Voir ses propres pointages (cohérence)
    'attendance.view_department',     // Voir les pointages de son département
    'attendance.view_site',           // Voir les pointages de son site
    'attendance.create',
    'attendance.edit',
    'attendance.correct',
    'attendance.delete',
    'attendance.import',
    'attendance.export',
    'attendance.view_anomalies',
    'schedule.view_all',
    'schedule.view_own',              // Voir son propre planning (cohérence)
    'schedule.view_department',       // Voir le planning de son département
    'schedule.view_site',             // Voir le planning de son site
    'schedule.create',
    'schedule.update',
    'schedule.delete',
    'schedule.manage_team',
    'schedule.approve_replacement',
    'shift.view_all',
    'shift.create',
    'shift.update',
    'shift.delete',
    'leave.view_all',
    'leave.view_own',                 // Voir ses propres congés
    'leave.view_department',         // Voir les congés de son département
    'leave.view_site',                // Voir les congés de son site
    'leave.create',                   // Créer des demandes de congés
    'leave.update',                   // Modifier ses propres demandes de congés
    'leave.approve',
    'leave.reject',
    'leave.manage_types',
    'overtime.view_all',
    'overtime.view_own',              // Voir ses propres heures sup (cohérence)
    'overtime.approve',
    'recovery.view',
    'reports.view_all',
    'reports.view_attendance',
    'reports.view_leaves',
    'reports.view_overtime',
    'reports.export',
    'reports.view_payroll',
    'user.view_all',
    'user.create',
    'user.update',
    'user.delete',
    'user.view_roles',
    'user.assign_roles',
    'user.remove_roles',
    'role.view_all',
    'role.create',
    'role.update',
    'role.delete',
    'tenant.view_settings',
    'tenant.update_settings',
    'tenant.manage_sites',
    'tenant.manage_departments',
    'tenant.manage_positions',
    'tenant.manage_teams',
    'tenant.manage_holidays',
    'tenant.manage_devices',
    'audit.view_all',
  ],
  MANAGER: [
    // Gestion d'équipe, département et site
    'employee.view_team',
    'employee.view_own',              // Voir ses propres informations
    'employee.view_department',       // Voir les employés de son département (Manager de Direction)
    'employee.view_site',             // Voir les employés de son site (Manager Régional)
    'attendance.view_team',
    'attendance.view_own',            // Voir ses propres pointages
    'attendance.view_department',      // Voir les pointages de son département
    'attendance.view_site',           // Voir les pointages de son site
    'attendance.view_anomalies',
    'attendance.correct',
    'schedule.view_team',
    'schedule.view_own',              // Voir son propre planning
    'schedule.view_department',       // Voir le planning de son département
    'schedule.view_site',             // Voir le planning de son site
    'schedule.manage_team',
    'schedule.approve_replacement',
    'leave.view_team',
    'leave.view_own',                 // Voir ses propres congés
    'leave.view_department',          // Voir les congés de son département
    'leave.view_site',                // Voir les congés de son site
    'leave.create',                   // Créer des demandes de congés
    'leave.update',                   // Modifier ses propres demandes de congés
    'leave.approve',
    'leave.reject',
    'overtime.view_all',
    'overtime.view_own',              // Voir ses propres heures sup
    'overtime.view_department',       // Voir les heures sup de son département
    'overtime.view_site',             // Voir les heures sup de son site
    'overtime.approve',
    'reports.view_attendance',
    'reports.view_leaves',
    'reports.view_overtime',
    'reports.export',
  ],
  EMPLOYEE: [
    // Accès personnel uniquement
    'employee.view_own',
    'attendance.view_own',
    'attendance.create',
    'schedule.view_own',
    'leave.view_own',
    'leave.create',
    'leave.update',
    'overtime.view_own',
    'reports.view_attendance',
  ],
};

async function main() {
  console.log('🚀 Initialisation du système RBAC...\n');

  try {
    // 1. Créer les permissions
    console.log('📝 Création des permissions...');
    for (const perm of PERMISSIONS) {
      const existing = await prisma.permission.findUnique({
        where: { code: perm.code },
      });

      if (!existing) {
        await prisma.permission.create({
          data: {
            code: perm.code,
            name: perm.name,
            category: perm.category,
            description: perm.name,
            isActive: true,
          },
        });
        console.log(`  ✓ ${perm.code}`);
      } else {
        console.log(`  ⊘ ${perm.code} (déjà existant)`);
      }
    }

    console.log('\n✅ Permissions créées\n');

    // 2. Créer le rôle SUPER_ADMIN (système)
    console.log('👑 Création du rôle SUPER_ADMIN...');
    let superAdminRole = await prisma.role.findFirst({
      where: {
        tenantId: null,
        code: 'SUPER_ADMIN',
      },
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          tenantId: null,
          code: 'SUPER_ADMIN',
          name: 'Super Administrateur',
          description: 'Accès complet à la plateforme, gestion des tenants',
          isSystem: true,
          isActive: true,
        },
      });
      console.log('  ✓ Rôle SUPER_ADMIN créé');
    } else {
      console.log('  ⊘ Rôle SUPER_ADMIN déjà existant');
    }

    // Assigner les permissions au SUPER_ADMIN
    const superAdminPerms = await prisma.permission.findMany({
      where: {
        code: { in: ROLE_PERMISSIONS.SUPER_ADMIN },
      },
    });

    for (const perm of superAdminPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        },
        create: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
        update: {},
      });
    }
    console.log(`  ✓ ${superAdminPerms.length} permissions assignées\n`);

    // 3. Créer les rôles par défaut pour chaque tenant existant
    console.log('🏢 Création des rôles par défaut pour les tenants...');
    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      console.log(`\n  Tenant: ${tenant.companyName} (${tenant.slug})`);

      for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
        if (roleCode === 'SUPER_ADMIN') continue; // Déjà créé

        let role = await prisma.role.findFirst({
          where: {
            tenantId: tenant.id,
            code: roleCode,
          },
        });

        if (!role) {
          const roleNames: Record<string, string> = {
            ADMIN_RH: 'Administrateur RH',
            MANAGER: 'Manager',
            EMPLOYEE: 'Employé',
          };

          role = await prisma.role.create({
            data: {
              tenantId: tenant.id,
              code: roleCode,
              name: roleNames[roleCode] || roleCode,
              description: `Rôle ${roleCode} pour ${tenant.companyName}`,
              isSystem: true,
              isActive: true,
            },
          });
          console.log(`    ✓ Rôle ${roleCode} créé`);
        } else {
          console.log(`    ⊘ Rôle ${roleCode} déjà existant`);
        }

        // Assigner les permissions
        const perms = await prisma.permission.findMany({
          where: {
            code: { in: permissionCodes },
          },
        });

        for (const perm of perms) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: perm.id,
              },
            },
            create: {
              roleId: role.id,
              permissionId: perm.id,
            },
            update: {},
          });
        }
        console.log(`    ✓ ${perms.length} permissions assignées au rôle ${roleCode}`);
      }
    }

    console.log('\n✅ Initialisation RBAC terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
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

