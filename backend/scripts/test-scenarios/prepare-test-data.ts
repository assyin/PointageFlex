import { PrismaClient, AttendanceType, LegacyRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script de préparation des données de test
 * Crée : Tenant, Settings, Employés, Shifts, et configurations nécessaires
 */

interface TestEmployee {
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  isEligibleForOvertime: boolean;
  maxOvertimeHoursPerMonth?: number;
  maxOvertimeHoursPerWeek?: number;
  shiftName: string;
  departmentName?: string;
  siteName?: string;
  positionName?: string;
}

const TEST_EMPLOYEES: TestEmployee[] = [
  {
    matricule: 'EMP001',
    firstName: 'Jean',
    lastName: 'Normal',
    email: 'jean.normal@test.com',
    isEligibleForOvertime: true,
    maxOvertimeHoursPerMonth: 20,
    maxOvertimeHoursPerWeek: 5,
    shiftName: 'Matin',
    departmentName: 'Production',
    siteName: 'Site Principal',
    positionName: 'Opérateur',
  },
  {
    matricule: 'EMP002',
    firstName: 'Marie',
    lastName: 'Limite',
    email: 'marie.limite@test.com',
    isEligibleForOvertime: true,
    maxOvertimeHoursPerMonth: 10,
    maxOvertimeHoursPerWeek: 3,
    shiftName: 'Matin',
    departmentName: 'Production',
    siteName: 'Site Principal',
    positionName: 'Technicien',
  },
  {
    matricule: 'EMP003',
    firstName: 'Pierre',
    lastName: 'NonEligible',
    email: 'pierre.nonel@test.com',
    isEligibleForOvertime: false,
    shiftName: 'Matin',
    departmentName: 'RH',
    siteName: 'Site Principal',
    positionName: 'Assistant RH',
  },
  {
    matricule: 'EMP004',
    firstName: 'Sophie',
    lastName: 'Nuit',
    email: 'sophie.nuit@test.com',
    isEligibleForOvertime: true,
    maxOvertimeHoursPerMonth: 30,
    maxOvertimeHoursPerWeek: 8,
    shiftName: 'Nuit',
    departmentName: 'Production',
    siteName: 'Site Principal',
    positionName: 'Opérateur',
  },
  {
    matricule: 'EMP005',
    firstName: 'Paul',
    lastName: 'MultiShift',
    email: 'paul.multishift@test.com',
    isEligibleForOvertime: true,
    maxOvertimeHoursPerMonth: 25,
    maxOvertimeHoursPerWeek: 6,
    shiftName: 'Matin',
    departmentName: 'Logistique',
    siteName: 'Site Principal',
    positionName: 'Chef d\'équipe',
  },
];

async function main() {
  console.log('🚀 Préparation des données de test...\n');

  try {
    // 1. Créer ou récupérer le tenant de test
    console.log('📝 1. Configuration du tenant...');
    let tenant = await prisma.tenant.findFirst({
      where: { slug: 'test' },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          companyName: 'Test Company',
          slug: 'test',
          email: 'test@company.com',
          phone: '+212 600 000 000',
          address: 'Casablanca, Maroc',
          country: 'MA',
          timezone: 'Africa/Casablanca',
        },
      });
      console.log(`✅ Tenant créé: ${tenant.companyName} (${tenant.id})`);
    } else {
      console.log(`✅ Tenant existant: ${tenant.companyName} (${tenant.id})`);
    }

    // 2. Créer ou mettre à jour les TenantSettings
    console.log('\n⚙️  2. Configuration des paramètres du tenant...');
    let settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: tenant.id },
    });

    const settingsData = {
      tenantId: tenant.id,
      breakDuration: 60,
      requireBreakPunch: false,
      overtimeMinimumThreshold: 30,
      overtimeRounding: 15,
      lateToleranceEntry: 10,
      earlyToleranceExit: 5,
      dailyWorkingHours: 8,
      workDaysPerWeek: 6,
      maxWeeklyHours: 48,
      overtimeRate: 1.25,
      nightShiftRate: 1.5,
      enableDoubleInPatternDetection: true,
      enableMissingInPatternDetection: true,
      enableMissingOutPatternDetection: true,
    };

    if (!settings) {
      settings = await prisma.tenantSettings.create({
        data: settingsData,
      });
      console.log('✅ Paramètres créés');
    } else {
      settings = await prisma.tenantSettings.update({
        where: { tenantId: tenant.id },
        data: settingsData,
      });
      console.log('✅ Paramètres mis à jour');
    }

    // 3. Créer les shifts
    console.log('\n🕐 3. Création des shifts...');
    const shifts = [
      {
        name: 'Matin',
        code: 'MATIN',
        startTime: '08:00',
        endTime: '17:00',
        breakDuration: 60,
        isNightShift: false,
        color: '#3b82f6',
      },
      {
        name: 'Soir',
        code: 'SOIR',
        startTime: '14:00',
        endTime: '22:00',
        breakDuration: 60,
        isNightShift: false,
        color: '#f59e0b',
      },
      {
        name: 'Nuit',
        code: 'NUIT',
        startTime: '21:00',
        endTime: '06:00',
        breakDuration: 60,
        isNightShift: true,
        color: '#6366f1',
      },
    ];

    const createdShifts: Record<string, any> = {};

    for (const shiftData of shifts) {
      let shift = await prisma.shift.findFirst({
        where: {
          tenantId: tenant.id,
          code: shiftData.code,
        },
      });

      if (!shift) {
        shift = await prisma.shift.create({
          data: {
            ...shiftData,
            tenantId: tenant.id,
          },
        });
        console.log(`✅ Shift créé: ${shift.name} (${shift.startTime} - ${shift.endTime})`);
      } else {
        console.log(`ℹ️  Shift existant: ${shift.name}`);
      }

      createdShifts[shiftData.name] = shift;
    }

    // 4. Créer les rôles par défaut pour le tenant (si nécessaire)
    console.log('\n🔐 4. Vérification des rôles RBAC...');
    const defaultRoles = [
      {
        code: 'ADMIN_RH',
        name: 'Administrateur RH',
        description: 'Gestion complète des ressources humaines du tenant',
        isSystem: true,
      },
      {
        code: 'MANAGER',
        name: 'Manager',
        description: 'Gestion d\'équipe, validation des demandes',
        isSystem: true,
      },
      {
        code: 'EMPLOYEE',
        name: 'Employé',
        description: 'Accès limité aux données personnelles',
        isSystem: true,
      },
    ];

    const createdRoles: Record<string, any> = {};
    for (const roleData of defaultRoles) {
      let role = await prisma.role.findFirst({
        where: {
          tenantId: tenant.id,
          code: roleData.code,
        },
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            ...roleData,
            tenantId: tenant.id,
            isActive: true,
          },
        });
        console.log(`✅ Rôle créé: ${role.code} (${role.name})`);
      } else {
        console.log(`ℹ️  Rôle existant: ${role.code}`);
      }

      createdRoles[roleData.code] = role;
    }

    // Assigner les permissions au rôle ADMIN_RH si nécessaire
    const adminRole = createdRoles['ADMIN_RH'];
    if (adminRole) {
      // Liste des permissions ADMIN_RH (basée sur init-rbac.ts)
      const adminRhPermissions = [
        'employee.view_all', 'employee.view_own', 'employee.view_department', 'employee.view_site',
        'employee.create', 'employee.update', 'employee.delete', 'employee.import', 'employee.export',
        'employee.manage_biometric',
        'attendance.view_all', 'attendance.view_own', 'attendance.view_department', 'attendance.view_site',
        'attendance.create', 'attendance.edit', 'attendance.correct', 'attendance.delete',
        'attendance.import', 'attendance.export', 'attendance.view_anomalies',
        'schedule.view_all', 'schedule.view_own', 'schedule.view_department', 'schedule.view_site',
        'schedule.create', 'schedule.update', 'schedule.delete', 'schedule.manage_team',
        'schedule.approve_replacement',
        'shift.view_all', 'shift.create', 'shift.update', 'shift.delete',
        'leave.view_all', 'leave.view_own', 'leave.view_department', 'leave.view_site',
        'leave.create', 'leave.update', 'leave.approve', 'leave.reject', 'leave.manage_types',
        'overtime.view_all', 'overtime.view_own', 'overtime.approve',
        'recovery.view',
        'reports.view_all', 'reports.view_attendance', 'reports.view_leaves', 'reports.view_overtime',
        'reports.export', 'reports.view_payroll',
        'user.view_all', 'user.create', 'user.update', 'user.delete',
        'user.view_roles', 'user.assign_roles', 'user.remove_roles',
        'role.view_all', 'role.create', 'role.update', 'role.delete',
        'tenant.view_settings', 'tenant.update_settings',
        'tenant.manage_sites', 'tenant.manage_departments', 'tenant.manage_positions',
        'tenant.manage_teams', 'tenant.manage_holidays', 'tenant.manage_devices',
        'audit.view_all',
      ];

      // Récupérer les permissions existantes
      const permissions = await prisma.permission.findMany({
        where: {
          code: { in: adminRhPermissions },
        },
      });

      if (permissions.length > 0) {
        // Vérifier combien de permissions sont déjà assignées
        const existingRolePermissions = await prisma.rolePermission.findMany({
          where: {
            roleId: adminRole.id,
            permissionId: { in: permissions.map(p => p.id) },
          },
        });

        const existingPermissionIds = new Set(existingRolePermissions.map(rp => rp.permissionId));
        const permissionsToAdd = permissions.filter(p => !existingPermissionIds.has(p.id));

        if (permissionsToAdd.length > 0) {
          // Ajouter les permissions manquantes avec gestion d'erreur
          let addedCount = 0;
          for (const permission of permissionsToAdd) {
            try {
              await prisma.rolePermission.create({
                data: {
                  roleId: adminRole.id,
                  permissionId: permission.id,
                },
              });
              addedCount++;
            } catch (error: any) {
              // Ignorer les erreurs de contrainte unique (permission déjà assignée)
              if (error.code !== 'P2002') {
                console.log(`⚠️  Erreur lors de l'assignation de ${permission.code}: ${error.message}`);
              }
            }
          }
          if (addedCount > 0) {
            console.log(`✅ ${addedCount} permission(s) assignée(s) au rôle ADMIN_RH`);
          } else {
            console.log(`ℹ️  Toutes les permissions sont déjà assignées au rôle ADMIN_RH`);
          }
        } else {
          console.log(`ℹ️  Toutes les permissions sont déjà assignées au rôle ADMIN_RH`);
        }
      } else {
        console.log(`⚠️  Aucune permission trouvée. Assurez-vous que le script init-rbac.ts a été exécuté.`);
        console.log(`   Vous pouvez relancer: npx ts-node scripts/init-rbac.ts`);
      }
    }

    // 5. Créer un utilisateur admin de test
    console.log('\n👤 5. Création de l\'utilisateur admin de test...');
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    let adminUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: 'admin@test.com',
      },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@test.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'Test',
          role: LegacyRole.ADMIN_RH,
          isActive: true,
        },
      });
      console.log(`✅ Utilisateur admin créé: ${adminUser.email}`);
    } else {
      console.log(`ℹ️  Utilisateur admin existant: ${adminUser.email}`);
    }

    // Assigner le rôle admin via UserTenantRole (RBAC)
    // Réutiliser la variable adminRole déjà déclarée plus haut
    if (adminRole) {
      const existingUserRole = await prisma.userTenantRole.findUnique({
        where: {
          userId_tenantId_roleId: {
            userId: adminUser.id,
            tenantId: tenant.id,
            roleId: adminRole.id,
          },
        },
      });

      if (!existingUserRole) {
        await prisma.userTenantRole.create({
          data: {
            userId: adminUser.id,
            tenantId: tenant.id,
            roleId: adminRole.id,
            isActive: true,
            assignedBy: adminUser.id,
          },
        });
        console.log(`✅ Rôle ADMIN_RH assigné à ${adminUser.email}`);
      } else if (!existingUserRole.isActive) {
        await prisma.userTenantRole.update({
          where: { id: existingUserRole.id },
          data: {
            isActive: true,
            assignedBy: adminUser.id,
            assignedAt: new Date(),
          },
        });
        console.log(`✅ Rôle ADMIN_RH réactivé pour ${adminUser.email}`);
      } else {
        console.log(`ℹ️  Rôle ADMIN_RH déjà assigné à ${adminUser.email}`);
      }
    } else {
      console.log(`❌ Erreur: Impossible de trouver ou créer le rôle ADMIN_RH`);
    }

    // 6. Créer les départements
    console.log('\n🏭 6. Création des départements...');
    const departments = [
      { name: 'Production', code: 'PROD' },
      { name: 'RH', code: 'RH' },
      { name: 'Logistique', code: 'LOG' },
      { name: 'Qualité', code: 'QUA' },
    ];

    const createdDepartments: Record<string, any> = {};
    for (const deptData of departments) {
      let department = await prisma.department.findFirst({
        where: {
          tenantId: tenant.id,
          code: deptData.code,
        },
      });

      if (!department) {
        department = await prisma.department.create({
          data: {
            tenantId: tenant.id,
            name: deptData.name,
            code: deptData.code,
          },
        });
        console.log(`✅ Département créé: ${department.name} (${department.code})`);
      } else {
        console.log(`ℹ️  Département existant: ${department.name}`);
      }

      createdDepartments[deptData.name] = department;
    }

    // 7. Créer les sites
    console.log('\n🏢 7. Création des sites...');
    const sites = [
      {
        name: 'Site Principal',
        code: 'SITE-01',
        city: 'Casablanca',
        address: 'Boulevard Mohamed V, Casablanca',
        departmentName: 'Production',
      },
      {
        name: 'Site Secondaire',
        code: 'SITE-02',
        city: 'Rabat',
        address: 'Avenue Hassan II, Rabat',
        departmentName: 'Production',
      },
    ];

    const createdSites: Record<string, any> = {};
    for (const siteData of sites) {
      const department = createdDepartments[siteData.departmentName];
      if (!department) {
        console.error(`❌ Département "${siteData.departmentName}" non trouvé pour le site ${siteData.name}`);
        continue;
      }

      let site = await prisma.site.findFirst({
        where: {
          tenantId: tenant.id,
          code: siteData.code,
        },
      });

      if (!site) {
        site = await prisma.site.create({
          data: {
            tenantId: tenant.id,
            name: siteData.name,
            code: siteData.code,
            city: siteData.city,
            address: siteData.address,
            departmentId: department.id,
          },
        });
        console.log(`✅ Site créé: ${site.name} (${siteData.city})`);
      } else {
        console.log(`ℹ️  Site existant: ${site.name}`);
      }

      createdSites[siteData.name] = site;
    }

    // 8. Créer les positions (fonctions)
    console.log('\n💼 8. Création des positions (fonctions)...');
    const positions = [
      { name: 'Opérateur', code: 'OP', category: 'Production' },
      { name: 'Technicien', code: 'TECH', category: 'Production' },
      { name: 'Chef d\'équipe', code: 'CHEF', category: 'Production' },
      { name: 'Assistant RH', code: 'ASST-RH', category: 'RH' },
      { name: 'Responsable RH', code: 'RESP-RH', category: 'RH' },
    ];

    const createdPositions: Record<string, any> = {};
    for (const posData of positions) {
      let position = await prisma.position.findFirst({
        where: {
          tenantId: tenant.id,
          code: posData.code,
        },
      });

      if (!position) {
        position = await prisma.position.create({
          data: {
            tenantId: tenant.id,
            name: posData.name,
            code: posData.code,
            category: posData.category,
            description: `${posData.name} - Département ${posData.category}`,
          },
        });
        console.log(`✅ Position créée: ${position.name} (${position.code})`);
      } else {
        console.log(`ℹ️  Position existante: ${position.name}`);
      }

      createdPositions[posData.name] = position;
    }

    // 9. Créer les employés de test
    console.log('\n👥 9. Création des employés de test...');
    const createdEmployees: Record<string, any> = {};

    for (const empData of TEST_EMPLOYEES) {
      // Vérifier si l'employé existe déjà
      let employee = await prisma.employee.findFirst({
        where: {
          tenantId: tenant.id,
          matricule: empData.matricule,
        },
      });

      const shift = createdShifts[empData.shiftName];
      if (!shift) {
        console.error(`❌ Shift "${empData.shiftName}" non trouvé pour ${empData.matricule}`);
        continue;
      }

      // Récupérer les relations
      const department = empData.departmentName ? createdDepartments[empData.departmentName] : null;
      const site = empData.siteName ? createdSites[empData.siteName] : null;
      const position = empData.positionName ? createdPositions[empData.positionName] : null;

      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            tenantId: tenant.id,
            matricule: empData.matricule,
            firstName: empData.firstName,
            lastName: empData.lastName,
            email: empData.email,
            hireDate: new Date(),
            position: empData.positionName || 'Test Employee',
            positionId: position?.id,
            isActive: true,
            currentShiftId: shift.id,
            departmentId: department?.id,
            siteId: site?.id,
            isEligibleForOvertime: empData.isEligibleForOvertime,
            maxOvertimeHoursPerMonth: empData.maxOvertimeHoursPerMonth
              ? new Decimal(empData.maxOvertimeHoursPerMonth)
              : null,
            maxOvertimeHoursPerWeek: empData.maxOvertimeHoursPerWeek
              ? new Decimal(empData.maxOvertimeHoursPerWeek)
              : null,
          },
        });
        console.log(
          `✅ Employé créé: ${employee.matricule} - ${employee.firstName} ${employee.lastName} (HS: ${empData.isEligibleForOvertime ? 'Oui' : 'Non'})`,
        );
      } else {
        // Mettre à jour l'employé existant
        employee = await prisma.employee.update({
          where: { id: employee.id },
          data: {
            currentShiftId: shift.id,
            departmentId: department?.id,
            siteId: site?.id,
            positionId: position?.id,
            position: empData.positionName || employee.position,
            isEligibleForOvertime: empData.isEligibleForOvertime,
            maxOvertimeHoursPerMonth: empData.maxOvertimeHoursPerMonth
              ? new Decimal(empData.maxOvertimeHoursPerMonth)
              : null,
            maxOvertimeHoursPerWeek: empData.maxOvertimeHoursPerWeek
              ? new Decimal(empData.maxOvertimeHoursPerWeek)
              : null,
          },
        });
        console.log(
          `ℹ️  Employé mis à jour: ${employee.matricule} - ${employee.firstName} ${employee.lastName}`,
        );
      }

      createdEmployees[empData.matricule] = employee;
    }

    // 10. Créer les plannings pour les employés
    console.log('\n📅 10. Création des plannings pour les employés...');
    const scheduleStartDate = new Date();
    scheduleStartDate.setDate(scheduleStartDate.getDate() - 7); // 7 jours en arrière
    const scheduleEndDate = new Date();
    scheduleEndDate.setDate(scheduleEndDate.getDate() + 14); // 14 jours en avant

    let scheduleCount = 0;
    for (const [matricule, employee] of Object.entries(createdEmployees)) {
      const shift = createdShifts[TEST_EMPLOYEES.find(e => e.matricule === matricule)?.shiftName || 'Matin'];
      if (!shift) continue;

      // Créer un planning pour chaque jour ouvrable (lundi à samedi)
      const currentDate = new Date(scheduleStartDate);
      while (currentDate <= scheduleEndDate) {
        const dayOfWeek = currentDate.getDay();
        // Lundi = 1, Samedi = 6 (on exclut dimanche = 0)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          try {
            await prisma.schedule.create({
              data: {
                tenantId: tenant.id,
                employeeId: employee.id,
                shiftId: shift.id,
                date: new Date(currentDate),
                status: 'PUBLISHED',
              },
            });
            scheduleCount++;
          } catch (error: any) {
            // Ignorer les doublons (planning déjà existant)
            if (error.code !== 'P2002' && !error.message?.includes('Unique constraint')) {
              console.log(`⚠️  Erreur création planning pour ${matricule} le ${currentDate.toISOString().split('T')[0]}: ${error.message}`);
            }
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    console.log(`✅ ${scheduleCount} plannings créés pour la période du ${scheduleStartDate.toISOString().split('T')[0]} au ${scheduleEndDate.toISOString().split('T')[0]}`);

    // 11. Résumé
    console.log('\n' + '='.repeat(60));
    console.log('✅ Préparation terminée avec succès !\n');
    console.log('📋 Résumé :');
    console.log(`   - Tenant: ${tenant.companyName} (${tenant.id})`);
    console.log(`   - Settings: Configurés`);
    console.log(`   - Départements: ${Object.keys(createdDepartments).length} créés`);
    console.log(`   - Sites: ${Object.keys(createdSites).length} créés`);
    console.log(`   - Positions: ${Object.keys(createdPositions).length} créées`);
    console.log(`   - Shifts: ${Object.keys(createdShifts).length} créés`);
    console.log(`   - Employés: ${Object.keys(createdEmployees).length} créés`);
    console.log(`   - Plannings: ${scheduleCount} créés`);
    console.log(`   - Admin: ${adminUser.email} / Test123!`);
    console.log('\n📝 IDs des employés de test :');
    for (const [matricule, employee] of Object.entries(createdEmployees)) {
      console.log(`   - ${matricule}: ${employee.id}`);
    }
    console.log('\n🔑 Identifiants de connexion :');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: Test123!`);
    console.log(`   Tenant ID: ${tenant.id}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

