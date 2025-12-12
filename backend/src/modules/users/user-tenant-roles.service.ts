import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UserTenantRolesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Assigne des rôles à un utilisateur dans un tenant
   */
  async assignRoles(
    userId: string,
    tenantId: string,
    roleIds: string[],
    assignedBy: string,
  ) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier que le tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Vérifier que les rôles existent et appartiennent au tenant (ou sont système)
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: roleIds },
        OR: [
          { tenantId: tenantId },
          { tenantId: null }, // Rôles système
        ],
        isActive: true,
      },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // Créer ou activer les UserTenantRole
    const results = [];
    for (const roleId of roleIds) {
      const existing = await this.prisma.userTenantRole.findUnique({
        where: {
          userId_tenantId_roleId: {
            userId,
            tenantId,
            roleId,
          },
        },
      });

      if (existing) {
        // Réactiver si désactivé
        if (!existing.isActive) {
          const updated = await this.prisma.userTenantRole.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              assignedBy,
              assignedAt: new Date(),
            },
            include: {
              role: true,
            },
          });
          results.push(updated);

          // Audit
          await this.auditService.create(tenantId, assignedBy, {
            action: 'ROLE_ASSIGNED',
            entity: 'UserTenantRole',
            entityId: updated.id,
            newValues: {
              userId,
              tenantId,
              roleId,
              roleCode: updated.role.code,
            },
          });
        } else {
          results.push(existing);
        }
      } else {
        // Créer nouveau
        const created = await this.prisma.userTenantRole.create({
          data: {
            userId,
            tenantId,
            roleId,
            assignedBy,
          },
          include: {
            role: true,
          },
        });
        results.push(created);

        // Audit
        await this.auditService.create(tenantId, assignedBy, {
          action: 'ROLE_ASSIGNED',
          entity: 'UserTenantRole',
          entityId: created.id,
          newValues: {
            userId,
            tenantId,
            roleId,
            roleCode: created.role.code,
          },
        });
      }
    }

    return results;
  }

  /**
   * Retire des rôles d'un utilisateur dans un tenant
   */
  async removeRoles(
    userId: string,
    tenantId: string,
    roleIds: string[],
    removedBy: string,
  ) {
    // Désactiver les UserTenantRole (soft delete)
    const userTenantRoles = await this.prisma.userTenantRole.findMany({
      where: {
        userId,
        tenantId,
        roleId: { in: roleIds },
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    if (userTenantRoles.length === 0) {
      throw new NotFoundException('No active roles found to remove');
    }

    const results = [];
    for (const utr of userTenantRoles) {
      const updated = await this.prisma.userTenantRole.update({
        where: { id: utr.id },
        data: { isActive: false },
      });
      results.push(updated);

      // Audit
      await this.auditService.create(tenantId, removedBy, {
        action: 'ROLE_REMOVED',
        entity: 'UserTenantRole',
        entityId: utr.id,
        oldValues: {
          userId,
          tenantId,
          roleId: utr.roleId,
          roleCode: utr.role.code,
        },
      });
    }

    return results;
  }

  /**
   * Remplace tous les rôles d'un utilisateur dans un tenant
   */
  async setRoles(
    userId: string,
    tenantId: string,
    roleIds: string[],
    assignedBy: string,
  ) {
    // Désactiver tous les rôles existants
    await this.prisma.userTenantRole.updateMany({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
      data: { isActive: false },
    });

    // Assigner les nouveaux rôles
    return this.assignRoles(userId, tenantId, roleIds, assignedBy);
  }

  /**
   * Récupère tous les rôles d'un utilisateur dans un tenant
   */
  async getUserRoles(userId: string, tenantId: string) {
    return this.prisma.userTenantRole.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Récupère tous les tenants d'un utilisateur
   */
  async getUserTenants(userId: string) {
    const userTenantRoles = await this.prisma.userTenantRole.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            logo: true,
          },
        },
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      distinct: ['tenantId'],
    });

    // Grouper par tenant
    const tenantsMap = new Map();
    for (const utr of userTenantRoles) {
      if (!tenantsMap.has(utr.tenantId)) {
        tenantsMap.set(utr.tenantId, {
          tenant: utr.tenant,
          roles: [],
        });
      }
      tenantsMap.get(utr.tenantId).roles.push(utr.role);
    }

    return Array.from(tenantsMap.values());
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique dans un tenant
   */
  async userHasRole(userId: string, tenantId: string, roleCode: string): Promise<boolean> {
    const role = await this.prisma.role.findFirst({
      where: {
        code: roleCode,
        OR: [
          { tenantId: tenantId },
          { tenantId: null },
        ],
      },
    });

    if (!role) {
      return false;
    }

    const userTenantRole = await this.prisma.userTenantRole.findFirst({
      where: {
        userId,
        tenantId,
        roleId: role.id,
        isActive: true,
      },
    });

    return !!userTenantRole;
  }
}

