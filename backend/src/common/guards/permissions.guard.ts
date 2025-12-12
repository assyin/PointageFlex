import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsService } from '../../modules/permissions/permissions.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si aucune permission n'est requise, autoriser
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SUPER_ADMIN a tous les droits - bypass complet (avant vérification tenantId)
    // SUPER_ADMIN peut avoir tenantId: null (rôle système)
    const userRoleStr = typeof user.role === 'string' ? user.role : user.role?.toString();
    const isSuperAdmin = userRoleStr === 'SUPER_ADMIN' || 
                        (user.roles && Array.isArray(user.roles) && user.roles.includes('SUPER_ADMIN'));
    
    if (isSuperAdmin) {
      return true;
    }

    // Pour les autres rôles, vérifier que tenantId existe
    const tenantId = request.tenantId || user?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant not found');
    }

    // Récupérer les permissions de l'utilisateur dans ce tenant
    const userPermissions = await this.permissionsService.getUserPermissions(
      user.userId,
      tenantId,
    );

    // Vérifier si l'utilisateur a au moins une des permissions requises
    // (logique OR : avoir l'une des permissions suffit)
    // Pour une logique AND, utilisez plusieurs décorateurs @RequirePermissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

