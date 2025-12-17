import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LegacyRole, AttendanceType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateUserDto) {
    // Vérifier si l'email existe déjà pour ce tenant
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      search?: string;
      role?: LegacyRole;
      isActive?: boolean;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' as const } },
        { lastName: { contains: filters.search, mode: 'insensitive' as const } },
        { email: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId: tenantId || undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            position: true,
            positionId: true,
            hireDate: true,
            contractType: true,
            site: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
            currentShift: {
              select: {
                id: true,
                name: true,
                startTime: true,
                endTime: true,
              },
            },
            positionRef: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
              },
            },
          },
        },
        userTenantRoles: {
          where: {
            isActive: true,
            tenantId: tenantId || undefined,
          },
          select: {
            id: true,
            role: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                isSystem: true,
                permissions: {
                  where: {
                    permission: {
                      isActive: true,
                    },
                  },
                  select: {
                    permission: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Extraire les rôles et permissions pour faciliter l'utilisation frontend
    const roles = user.userTenantRoles.map((utr) => ({
      id: utr.role.id,
      code: utr.role.code,
      name: utr.role.name,
      description: utr.role.description,
      isSystem: utr.role.isSystem,
    }));

    const permissions = new Set<string>();
    user.userTenantRoles.forEach((utr) => {
      utr.role.permissions.forEach((rp) => {
        permissions.add(rp.permission.code);
      });
    });

    return {
      ...user,
      roles: Array.from(roles),
      permissions: Array.from(permissions),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto, currentUserRole?: LegacyRole) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId: tenantId || undefined,
      },
      select: {
        id: true,
        role: true,
        employee: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier les restrictions selon le rôle
    // EMPLOYEE ne peut pas modifier firstName/lastName (seulement phone)
    if (user.role === LegacyRole.EMPLOYEE && user.id === id) {
      // L'utilisateur modifie son propre profil et il est EMPLOYEE
      if (dto.firstName !== undefined || dto.lastName !== undefined) {
        throw new ConflictException('Les employés ne peuvent pas modifier leur nom ou prénom. Contactez la RH.');
      }
    }

    // Préparer les données à mettre à jour (exclure les champs undefined)
    const updateData: any = {};
    
    // Email : seulement ADMIN_RH et SUPER_ADMIN peuvent modifier
    if (dto.email !== undefined) {
      if (currentUserRole !== LegacyRole.ADMIN_RH && currentUserRole !== LegacyRole.SUPER_ADMIN) {
        throw new ConflictException('Seuls les administrateurs RH peuvent modifier l\'email');
      }
      updateData.email = dto.email;
    }

    // Nom/Prénom : EMPLOYEE ne peut pas modifier
    if (dto.firstName !== undefined) {
      if (user.role === LegacyRole.EMPLOYEE && user.id === id) {
        throw new ConflictException('Les employés ne peuvent pas modifier leur prénom');
      }
      updateData.firstName = dto.firstName;
    }
    
    if (dto.lastName !== undefined) {
      if (user.role === LegacyRole.EMPLOYEE && user.id === id) {
        throw new ConflictException('Les employés ne peuvent pas modifier leur nom');
      }
      updateData.lastName = dto.lastName;
    }

    // Téléphone : tous peuvent modifier
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    
    // Avatar : tous peuvent modifier
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    
    // Role et isActive : seulement ADMIN_RH/SUPER_ADMIN (géré par le guard)
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    // Vérifier si l'email existe déjà pour un autre utilisateur
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          tenantId: tenantId || undefined,
          email: dto.email,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string, skipCurrentPasswordCheck: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        forcePasswordChange: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier le mot de passe actuel (sauf si changement forcé)
    if (!skipCurrentPasswordCheck) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new ConflictException('Mot de passe actuel incorrect');
      }
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et désactiver le flag forcePasswordChange
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        forcePasswordChange: false, // Désactiver le flag après changement
      },
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string) {
    let preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    // Créer des préférences par défaut si elles n'existent pas
    if (!preferences) {
      preferences = await this.prisma.userPreferences.create({
        data: {
          userId,
          language: 'fr',
          timezone: 'Africa/Casablanca',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          theme: 'light',
          notifications: {
            email: {
              leaves: true,
              planning: true,
              alerts: false,
            },
            push: {
              mobile: true,
              desktop: false,
            },
            sms: false,
          },
        },
      });
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, dto: any) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mettre à jour ou créer les préférences
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...dto,
        updatedAt: new Date(),
      },
      create: {
        userId,
        language: dto.language || 'fr',
        timezone: dto.timezone || 'Africa/Casablanca',
        dateFormat: dto.dateFormat || 'DD/MM/YYYY',
        timeFormat: dto.timeFormat || '24h',
        theme: dto.theme || 'light',
        notifications: dto.notifications || {
          email: {
            leaves: true,
            planning: true,
            alerts: false,
          },
          push: {
            mobile: true,
            desktop: false,
          },
          sms: false,
        },
      },
    });

    return preferences;
  }

  /**
   * Get user active sessions
   * Note: Pour l'instant, on retourne une session simulée basée sur le JWT actuel
   * TODO: Implémenter un vrai système de tracking de sessions avec UserSession
   */
  async getSessions(userId: string, currentTokenId?: string) {
    // Pour l'instant, retourner une session simulée
    // TODO: Récupérer les vraies sessions depuis UserSession
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActive: 'desc',
      },
    });

    // Si pas de sessions en base, créer une session par défaut pour la session actuelle
    if (sessions.length === 0) {
      return [
        {
          id: 'current',
          device: 'Unknown',
          browser: 'Unknown',
          os: 'Unknown',
          location: 'Unknown',
          ip: 'Unknown',
          lastActive: new Date().toISOString(),
          isCurrent: true,
        },
      ];
    }

    return sessions.map((session) => ({
      id: session.id,
      device: session.device || 'Unknown',
      browser: session.browser || 'Unknown',
      os: session.os || 'Unknown',
      location: session.location || 'Unknown',
      ip: session.ipAddress || 'Unknown',
      lastActive: session.lastActive.toISOString(),
      isCurrent: session.tokenId === currentTokenId,
    }));
  }

  /**
   * Revoke a user session
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return { message: 'Session révoquée avec succès' };
  }

  /**
   * Revoke all other sessions (except current)
   */
  async revokeAllOtherSessions(userId: string, currentTokenId: string) {
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        tokenId: { not: currentTokenId },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return { message: 'Toutes les autres sessions ont été révoquées' };
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
      },
    });

    if (!user || !user.employee) {
      // Si pas d'employé, retourner des stats vides
      return {
        workedDays: { value: 0, subtitle: 'Jours travaillés ce mois' },
        totalHours: { value: '0h', subtitle: 'Heures totales' },
        lateCount: { value: 0, subtitle: 'Retards' },
        overtime: { value: '0h', subtitle: 'Heures supplémentaires' },
        leaveTaken: { value: 0, subtitle: 'Congés pris' },
      };
    }

    const employeeId = user.employee.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculer les jours travaillés (pointages uniques par jour)
    // Utiliser findMany et grouper manuellement par date pour éviter les problèmes de type avec groupBy
    const attendanceEntries = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        tenantId,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        type: AttendanceType.IN,
      },
      select: {
        timestamp: true,
      },
    });

    // Compter les jours uniques (grouper par date)
    const uniqueDays = new Set(
      attendanceEntries.map((a) => {
        const date = new Date(a.timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      })
    );
    const workedDays = uniqueDays.size;

    // Calculer les heures totales (simplifié - à améliorer)
    const attendances = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        tenantId,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculer les retards (simplifié)
    const lateCount = await this.prisma.attendance.count({
      where: {
        employeeId,
        tenantId,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        hasAnomaly: true,
        anomalyType: 'LATE',
      },
    });

    // Calculer les heures supplémentaires
    const overtimeRecords = await this.prisma.overtime.findMany({
      where: {
        employeeId,
        tenantId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'APPROVED',
      },
    });

    const totalOvertimeHours = overtimeRecords.reduce((sum, ot) => {
      return sum + (ot.hours ? Number(ot.hours) : 0);
    }, 0);

    // Calculer les congés pris
    const leaves = await this.prisma.leave.findMany({
      where: {
        employeeId,
        tenantId,
        startDate: {
          lte: endOfMonth,
        },
        endDate: {
          gte: startOfMonth,
        },
        status: {
          in: ['APPROVED', 'HR_APPROVED', 'MANAGER_APPROVED'],
        },
      },
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const leaveDays = leaves.reduce((sum, leave) => {
      const start = new Date(Math.max(new Date(leave.startDate).getTime(), startOfMonth.getTime()));
      const end = new Date(Math.min(new Date(leave.endDate).getTime(), endOfMonth.getTime()));
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    return {
      workedDays: {
        value: workedDays,
        subtitle: `Jours travaillés en ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      },
      totalHours: {
        value: `${Math.round(workedDays * 8)}h`, // Approximation
        subtitle: 'Heures totales (estimation)',
      },
      lateCount: {
        value: lateCount,
        subtitle: 'Retards ce mois',
      },
      overtime: {
        value: `${totalOvertimeHours}h`,
        subtitle: 'Heures supplémentaires approuvées',
      },
      leaveTaken: {
        value: leaveDays,
        subtitle: 'Jours de congés pris ce mois',
      },
    };
  }

  /**
   * Export user data (RGPD)
   */
  async exportUserData(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: tenantId || undefined,
      },
      include: {
        employee: {
          include: {
            department: true,
            site: true,
            team: true,
            positionRef: true,
          },
        },
        userTenantRoles: {
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
        },
        preferences: true,
        auditLogs: {
          where: {
            userId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100, // Limiter à 100 derniers logs
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Récupérer les données d'attendance
    const attendance = user.employee
      ? await this.prisma.attendance.findMany({
          where: {
            employeeId: user.employee.id,
            tenantId,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 1000, // Limiter à 1000 derniers pointages
        })
      : [];

    // Récupérer les congés
    const leaves = user.employee
      ? await this.prisma.leave.findMany({
          where: {
            employeeId: user.employee.id,
            tenantId,
          },
          include: {
            leaveType: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

    // Récupérer les heures supplémentaires
    const overtime = user.employee
      ? await this.prisma.overtime.findMany({
          where: {
            employeeId: user.employee.id,
            tenantId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      employee: user.employee,
      roles: user.userTenantRoles.map((utr) => ({
        role: utr.role,
        assignedAt: utr.assignedAt,
      })),
      preferences: user.preferences,
      attendance: attendance.map((a) => ({
        timestamp: a.timestamp,
        type: a.type,
        method: a.method,
        hasAnomaly: a.hasAnomaly,
      })),
      leaves: leaves.map((l) => ({
        startDate: l.startDate,
        endDate: l.endDate,
        type: l.leaveType?.name || l.leaveType?.code || 'Unknown',
        status: l.status,
        days: l.days,
      })),
      overtime: overtime.map((ot) => ({
        date: ot.date,
        hours: ot.hours,
        status: ot.status,
      })),
      auditLogs: user.auditLogs,
      exportDate: new Date().toISOString(),
    };
  }
}
