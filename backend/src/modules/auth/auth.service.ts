import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LegacyRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Vérifier si le slug existe
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Company slug already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer tenant + user admin en transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Créer le tenant
      const tenant = await tx.tenant.create({
        data: {
          companyName: dto.companyName,
          slug: dto.slug,
          email: dto.email,
        },
      });

      // Créer les settings par défaut
      await tx.tenantSettings.create({
        data: {
          tenantId: tenant.id,
        },
      });

      // Créer l'utilisateur admin
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          tenantId: tenant.id,
          role: LegacyRole.ADMIN_RH,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
        },
      });

      return { tenant, user };
    });

    // Récupérer les rôles et permissions RBAC pour le nouvel utilisateur
    const userTenantRoles = await this.prisma.userTenantRole.findMany({
      where: {
        userId: result.user.id,
        tenantId: result.user.tenantId,
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

    const tokens = await this.generateTokens(result.user);

    return {
      ...tokens,
      user: {
        ...result.user,
        roles: Array.from(roles),
        permissions: Array.from(permissions),
      },
    };
  }

  async login(dto: LoginDto) {
    // Utiliser findUnique si email est unique, sinon findFirst
    // Note: Si email est unique dans le schéma, findUnique est plus sûr
    const user = await this.prisma.user.findFirst({
      where: { 
        email: dto.email.toLowerCase().trim(), // Normaliser l'email
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Récupérer les rôles et permissions RBAC pour le tenant de l'utilisateur
    const tenantId = user.tenantId;
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

    const tokens = await this.generateTokens(user);

    const { password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: {
        ...userWithoutPassword,
        roles: Array.from(roles),
        permissions: Array.from(permissions),
      },
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Récupérer les rôles et permissions RBAC pour le tenant de l'utilisateur
    const tenantId = user.tenantId;
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

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        roles: Array.from(roles),
        permissions: Array.from(permissions),
      },
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
