import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true, // Legacy role (pour compatibilité)
        tenantId: true, // Legacy tenantId (pour compatibilité)
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Charger les rôles actifs de l'utilisateur dans le tenant du token
    // Note: Le tenantId final sera résolu par le middleware TenantResolverMiddleware
    const tenantId = payload.tenantId || user.tenantId;
    const userTenantRoles = tenantId
      ? await this.prisma.userTenantRole.findMany({
          where: {
            userId: user.id,
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
        })
      : [];

    // Extraire les codes de rôles et permissions
    const roles = userTenantRoles.map((utr) => utr.role.code);
    const permissions = new Set<string>();
    userTenantRoles.forEach((utr) => {
      utr.role.permissions.forEach((rp) => {
        if (rp.permission.isActive) {
          permissions.add(rp.permission.code);
        }
      });
    });

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role, // Legacy (pour compatibilité)
      tenantId: tenantId || user.tenantId, // Legacy (pour compatibilité)
      roles: Array.from(roles), // Nouveaux rôles multi-tenant
      permissions: Array.from(permissions), // Permissions dérivées des rôles
    };
  }
}
