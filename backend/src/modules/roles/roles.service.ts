import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  /**
   * Crée un rôle système (SUPER_ADMIN uniquement) ou un rôle tenant
   */
  async create(tenantId: string | null, dto: CreateRoleDto) {
    // Vérifier l'unicité du code
    const existing = await this.prisma.role.findFirst({
      where: {
        tenantId: tenantId || null,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(`Role with code ${dto.code} already exists`);
    }

    // Si c'est un rôle système, seul SUPER_ADMIN peut le créer
    if (!tenantId && dto.code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN role can be created at system level');
    }

    // Créer le rôle
    const role = await this.prisma.role.create({
      data: {
        tenantId: tenantId || null,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        isSystem: dto.isSystem || false,
      },
    });

    // Associer les permissions si fournies
    if (dto.permissionCodes && dto.permissionCodes.length > 0) {
      await this.assignPermissions(role.id, dto.permissionCodes);
    }

    return this.findOne(role.id);
  }

  /**
   * Récupère tous les rôles d'un tenant (ou rôles système si tenantId est null)
   */
  async findAll(tenantId: string | null) {
    return this.prisma.role.findMany({
      where: {
        tenantId: tenantId || null,
        isActive: true,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Récupère un rôle par ID
   */
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
            slug: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Récupère un rôle par code
   */
  async findByCode(tenantId: string | null, code: string) {
    return this.prisma.role.findFirst({
      where: {
        tenantId: tenantId || null,
        code,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Met à jour un rôle
   */
  async update(tenantId: string | null, id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    // Vérifier que le rôle appartient au bon tenant (sauf pour SUPER_ADMIN)
    if (role.tenantId !== tenantId && role.tenantId !== null) {
      throw new ForbiddenException('Role does not belong to your tenant');
    }

    // Pour les rôles système, on permet uniquement la modification des permissions
    // On bloque la modification du nom, description et isActive pour préserver l'intégrité
    const isSystemRole = role.isSystem && role.code !== 'SUPER_ADMIN';
    
    if (isSystemRole) {
      // Vérifier si l'utilisateur essaie de modifier autre chose que les permissions
      if (
        (dto.name !== undefined && dto.name !== null && dto.name !== role.name) ||
        (dto.description !== undefined && dto.description !== null && dto.description !== role.description) ||
        (dto.isActive !== undefined && dto.isActive !== null && dto.isActive !== role.isActive)
      ) {
        throw new ForbiddenException(
          'System roles cannot have their name, description, or active status modified. Only permissions can be updated.',
        );
      }
    }

    // Préparer les données à mettre à jour (exclure les champs undefined)
    const updateData: any = {};
    if (!isSystemRole) {
      // Pour les rôles non-système, on permet la modification de tous les champs
      if (dto.name !== undefined && dto.name !== null) updateData.name = dto.name;
      if (dto.description !== undefined && dto.description !== null) updateData.description = dto.description;
      if (dto.isActive !== undefined && dto.isActive !== null) updateData.isActive = dto.isActive;
    }

    // Ne pas permettre la modification du code (pour éviter les conflits)
    // Le code est immuable une fois créé

    if (Object.keys(updateData).length > 0) {
      await this.prisma.role.update({
        where: { id },
        data: updateData,
      });
    }

    // Mettre à jour les permissions si fournies (autorisé pour tous les rôles, y compris système)
    if (dto.permissionCodes !== undefined && dto.permissionCodes !== null) {
      // Si c'est un tableau vide, on supprime toutes les permissions
      if (Array.isArray(dto.permissionCodes)) {
        // Filtrer les valeurs null/undefined et ne garder que les chaînes valides
        const validCodes = dto.permissionCodes.filter(
          (code) => code !== null && code !== undefined && typeof code === 'string' && code.trim() !== '',
        );
        await this.setPermissions(id, validCodes);
      }
    }

    return this.findOne(id);
  }

  /**
   * Supprime un rôle (soft delete)
   */
  async remove(id: string) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    // Vérifier si le rôle est utilisé
    const userCount = await this.prisma.userTenantRole.count({
      where: { roleId: id, isActive: true },
    });

    if (userCount > 0) {
      throw new ConflictException(
        `Cannot delete role: ${userCount} user(s) still have this role`,
      );
    }

    return this.prisma.role.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Assigne des permissions à un rôle
   */
  async assignPermissions(roleId: string, permissionCodes: string[]) {
    // Récupérer les IDs des permissions
    const permissions = await this.prisma.permission.findMany({
      where: {
        code: { in: permissionCodes },
        isActive: true,
      },
    });

    if (permissions.length !== permissionCodes.length) {
      const foundCodes = permissions.map((p) => p.code);
      const missing = permissionCodes.filter((c) => !foundCodes.includes(c));
      throw new NotFoundException(`Permissions not found: ${missing.join(', ')}`);
    }

    // Supprimer les anciennes permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Créer les nouvelles associations
    await this.prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId,
        permissionId: p.id,
      })),
    });

    return this.findOne(roleId);
  }

  /**
   * Définit les permissions d'un rôle (remplace toutes les permissions existantes)
   */
  async setPermissions(roleId: string, permissionCodes: string[]) {
    return this.assignPermissions(roleId, permissionCodes);
  }

  /**
   * Initialise les rôles système par défaut
   */
  async initializeSystemRoles() {
    const systemRoles = [
      {
        code: 'SUPER_ADMIN',
        name: 'Super Administrateur',
        description: 'Accès complet à la plateforme, gestion des tenants',
        isSystem: true,
      },
    ];

    for (const roleData of systemRoles) {
      const existing = await this.prisma.role.findFirst({
        where: {
          tenantId: null,
          code: roleData.code,
        },
      });

      if (!existing) {
        await this.prisma.role.create({
          data: roleData,
        });
      }
    }
  }

  /**
   * Réinitialise les permissions par défaut d'un rôle système
   */
  async resetDefaultPermissions(roleId: string) {
    const role = await this.findOne(roleId);

    // Vérifier que c'est un rôle système
    if (!role.isSystem) {
      throw new ForbiddenException('Only system roles can have default permissions reset');
    }

    // Définir les permissions par défaut selon le code du rôle
    const defaultPermissions: Record<string, string[]> = {
      SUPER_ADMIN: [
        'employee.view_all',
        'employee.view_own',
        'employee.create',
        'employee.update',
        'employee.delete',
        'employee.import',
        'employee.export',
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
      ADMIN_RH: [
        'employee.view_all',
        'employee.view_own',
        'employee.create',
        'employee.update',
        'employee.delete',
        'employee.import',
        'employee.export',
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
        'leave.view_all',
        'leave.view_own',
        'leave.view_team',
        'leave.create',
        'leave.update',
        'leave.approve',
        'leave.reject',
        'leave.manage_types',
        'overtime.view_all',
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
        'employee.view_team',
        'attendance.view_team',
        'attendance.view_anomalies',
        'attendance.correct',
        'schedule.view_team',
        'schedule.manage_team',
        'schedule.approve_replacement',
        'leave.view_team',
        'leave.approve',
        'leave.reject',
        'overtime.view_all',
        'overtime.approve',
        'reports.view_attendance',
        'reports.view_leaves',
        'reports.view_overtime',
        'reports.export',
      ],
      EMPLOYEE: [
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

    const permissionCodes = defaultPermissions[role.code];
    if (!permissionCodes) {
      throw new NotFoundException(`No default permissions defined for role ${role.code}`);
    }

    // Réinitialiser les permissions
    await this.setPermissions(roleId, permissionCodes);

    return this.findOne(roleId);
  }

  /**
   * Initialise les rôles par défaut pour un tenant
   */
  async initializeTenantRoles(tenantId: string) {
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

    for (const roleData of defaultRoles) {
      const existing = await this.prisma.role.findFirst({
        where: {
          tenantId,
          code: roleData.code,
        },
      });

      if (!existing) {
        await this.prisma.role.create({
          data: {
            ...roleData,
            tenantId,
          },
        });
      }
    }
  }
}

