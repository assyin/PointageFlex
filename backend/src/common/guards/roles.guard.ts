import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LegacyRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<LegacyRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Debug: Log user info (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[RolesGuard] Checking access:', {
        requiredRoles: requiredRoles.map(r => r.toString()),
        userRole: user.role,
        userRoleType: typeof user.role,
        userRoles: user.roles,
        userRolesType: Array.isArray(user.roles),
        userId: user.userId,
        email: user.email,
      });
    }

    // Vérifier le rôle legacy (pour compatibilité)
    // Le rôle legacy peut être une string ou un enum LegacyRole
    const userRoleStr = typeof user.role === 'string' ? user.role : user.role?.toString();
    const hasLegacyRole = userRoleStr && requiredRoles.some((reqRole) => {
      const reqRoleStr = reqRole.toString();
      // Comparaison case-insensitive et normalisation
      return userRoleStr.toUpperCase() === reqRoleStr.toUpperCase() || 
             userRoleStr === reqRoleStr || 
             userRoleStr === reqRole;
    });

    // Vérifier les nouveaux rôles RBAC (depuis user.roles array)
    // Les codes de rôles dans user.roles sont des strings comme "ADMIN_RH", "SUPER_ADMIN", "EMPLOYEE", etc.
    let hasNewRole = false;
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      hasNewRole = user.roles.some((roleCode: string) => {
        if (!roleCode) return false;
        // Convertir les LegacyRole enum en strings pour comparaison
        return requiredRoles.some((requiredRole) => {
          const requiredRoleStr = requiredRole.toString();
          // Comparaison case-insensitive et normalisation
          const roleCodeUpper = String(roleCode).toUpperCase().trim();
          const requiredRoleStrUpper = String(requiredRoleStr).toUpperCase().trim();
          return roleCodeUpper === requiredRoleStrUpper || 
                 String(roleCode) === String(requiredRoleStr) || 
                 String(roleCode) === String(requiredRole);
        });
      });
    }

    // SUPER_ADMIN a toujours accès
    const isSuperAdmin = (userRoleStr === 'SUPER_ADMIN' || userRoleStr === LegacyRole.SUPER_ADMIN) || 
                        (user.roles && Array.isArray(user.roles) && user.roles.includes('SUPER_ADMIN'));

    if (isSuperAdmin || hasLegacyRole || hasNewRole) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[RolesGuard] Access granted:', {
          isSuperAdmin,
          hasLegacyRole,
          hasNewRole,
        });
      }
      return true;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[RolesGuard] Access denied:', {
        hasLegacyRole,
        hasNewRole,
        isSuperAdmin,
        userRoleStr,
        requiredRolesStr: requiredRoles.map(r => r.toString()),
        userRolesArray: user.roles,
      });
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
