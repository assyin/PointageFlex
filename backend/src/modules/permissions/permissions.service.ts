import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère toutes les permissions actives
   */
  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Récupère une permission par son code
   */
  async findByCode(code: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { code },
    });
  }

  /**
   * Récupère les permissions par catégorie
   */
  async findByCategory(category: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Récupère les permissions d'un rôle
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  /**
   * Vérifie si un rôle a une permission spécifique
   */
  async roleHasPermission(roleId: string, permissionCode: string): Promise<boolean> {
    const permission = await this.findByCode(permissionCode);
    if (!permission) {
      return false;
    }

    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId: permission.id,
      },
    });

    return !!rolePermission;
  }

  /**
   * Vérifie si un utilisateur a une permission dans un tenant donné
   */
  async userHasPermission(
    userId: string,
    tenantId: string,
    permissionCode: string,
  ): Promise<boolean> {
    // Récupérer les rôles actifs de l'utilisateur dans ce tenant
    const userTenantRoles = await this.prisma.userTenantRole.findMany({
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

    // Vérifier si l'un des rôles a la permission
    for (const utr of userTenantRoles) {
      const hasPermission = utr.role.permissions.some(
        (rp) => rp.permission.code === permissionCode && rp.permission.isActive,
      );
      if (hasPermission) {
        return true;
      }
    }

    return false;
  }

  /**
   * Récupère toutes les permissions d'un utilisateur dans un tenant
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const userTenantRoles = await this.prisma.userTenantRole.findMany({
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

    const permissionCodes = new Set<string>();

    for (const utr of userTenantRoles) {
      for (const rp of utr.role.permissions) {
        if (rp.permission.isActive) {
          permissionCodes.add(rp.permission.code);
        }
      }
    }

    return Array.from(permissionCodes);
  }
}

