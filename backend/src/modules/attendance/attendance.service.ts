import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { WebhookAttendanceDto } from './dto/webhook-attendance.dto';
import { CorrectAttendanceDto } from './dto/correct-attendance.dto';
import { AttendanceType } from '@prisma/client';
import { findEmployeeByMatriculeFlexible } from '../../common/utils/matricule.util';
import { getManagerLevel, getManagedEmployeeIds } from '../../common/utils/manager-level.util';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createAttendanceDto: CreateAttendanceDto) {
    // Vérifier que l'employé existe
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: createAttendanceDto.employeeId,
        tenantId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Détecter les anomalies
    const anomaly = await this.detectAnomalies(
      tenantId,
      createAttendanceDto.employeeId,
      new Date(createAttendanceDto.timestamp),
      createAttendanceDto.type,
    );

    return this.prisma.attendance.create({
      data: {
        ...createAttendanceDto,
        tenantId,
        timestamp: new Date(createAttendanceDto.timestamp),
        hasAnomaly: anomaly.hasAnomaly,
        anomalyType: anomaly.type,
        anomalyNote: anomaly.note,
      },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
        site: true,
        device: true,
      },
    });
  }

  async handleWebhook(
    tenantId: string,
    deviceId: string,
    webhookData: WebhookAttendanceDto,
  ) {
    // Vérifier que le terminal existe
    const device = await this.prisma.attendanceDevice.findFirst({
      where: { deviceId, tenantId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Trouver l'employé par matricule ou ID
    // D'abord, essayer de trouver par ID (UUID)
    let employee = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        id: webhookData.employeeId,
      },
    });

    // Si pas trouvé par ID, chercher par matricule avec gestion des zéros à gauche
    if (!employee) {
      try {
        employee = await findEmployeeByMatriculeFlexible(
          this.prisma,
          tenantId,
          webhookData.employeeId,
        );
      } catch (error) {
        // Log l'erreur pour le débogage mais continue
        console.error(`[AttendanceService] Erreur lors de la recherche flexible du matricule ${webhookData.employeeId}:`, error);
      }
    }

    if (!employee) {
      throw new NotFoundException(`Employee ${webhookData.employeeId} not found`);
    }

    // Détecter les anomalies
    const anomaly = await this.detectAnomalies(
      tenantId,
      employee.id,
      new Date(webhookData.timestamp),
      webhookData.type,
    );

    // Mettre à jour lastSync du terminal pour indiquer qu'il est connecté
    await this.prisma.attendanceDevice.update({
      where: { id: device.id },
      data: { lastSync: new Date() },
    });

    return this.prisma.attendance.create({
      data: {
        tenantId,
        employeeId: employee.id,
        deviceId: device.id,
        siteId: device.siteId,
        timestamp: new Date(webhookData.timestamp),
        type: webhookData.type,
        method: webhookData.method,
        rawData: webhookData.rawData,
        hasAnomaly: anomaly.hasAnomaly,
        anomalyType: anomaly.type,
        anomalyNote: anomaly.note,
      },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    filters?: {
      employeeId?: string;
      siteId?: string;
      startDate?: string;
      endDate?: string;
      hasAnomaly?: boolean;
      type?: AttendanceType;
    },
    userId?: string,
    userPermissions?: string[],
  ) {
    const where: any = { tenantId };

    // Filtrer par employé si l'utilisateur n'a que la permission 'attendance.view_own'
    const hasViewAll = userPermissions?.includes('attendance.view_all');
    const hasViewOwn = userPermissions?.includes('attendance.view_own');
    const hasViewTeam = userPermissions?.includes('attendance.view_team');
    const hasViewDepartment = userPermissions?.includes('attendance.view_department');
    const hasViewSite = userPermissions?.includes('attendance.view_site');

    if (!hasViewAll && hasViewOwn && userId) {
      // Récupérer l'employé lié à cet utilisateur
      const employee = await this.prisma.employee.findFirst({
        where: { userId, tenantId },
        select: { id: true },
      });

      if (employee) {
        where.employeeId = employee.id;
      } else {
        // Si pas d'employé lié, retourner tableau vide
        return [];
      }
    } else if (!hasViewAll && userId && (hasViewTeam || hasViewDepartment || hasViewSite)) {
      // Détecter le niveau hiérarchique du manager
      const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);

      if (managerLevel.type === 'DEPARTMENT' && hasViewDepartment) {
        // Manager de département : filtrer par les employés du département
        const managedEmployeeIds = await getManagedEmployeeIds(this.prisma, managerLevel, tenantId);
        if (managedEmployeeIds.length === 0) {
          return [];
        }
        where.employeeId = { in: managedEmployeeIds };
      } else if (managerLevel.type === 'SITE' && hasViewSite) {
        // Manager de site : filtrer par les employés du site
        const managedEmployeeIds = await getManagedEmployeeIds(this.prisma, managerLevel, tenantId);
        if (managedEmployeeIds.length === 0) {
          return [];
        }
        where.employeeId = { in: managedEmployeeIds };
      } else if (managerLevel.type === 'TEAM' && hasViewTeam) {
        // Manager d'équipe : filtrer par l'équipe de l'utilisateur
        const employee = await this.prisma.employee.findFirst({
          where: { userId, tenantId },
          select: { teamId: true },
        });

        if (employee?.teamId) {
          // Récupérer tous les employés de la même équipe
          const teamMembers = await this.prisma.employee.findMany({
            where: { teamId: employee.teamId, tenantId },
            select: { id: true },
          });

          where.employeeId = {
            in: teamMembers.map(m => m.id),
          };
        } else {
          // Si pas d'équipe, retourner tableau vide
          return [];
        }
      } else if (managerLevel.type) {
        // Manager détecté mais pas la permission correspondante
        return [];
      }
    }

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.siteId) where.siteId = filters.siteId;
    if (filters?.hasAnomaly !== undefined) where.hasAnomaly = filters.hasAnomaly;
    if (filters?.type) where.type = filters.type;

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        // Start of day (00:00:00)
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // End of day (23:59:59.999)
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.timestamp.lte = endDate;
      }
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            photo: true,
            currentShift: true,
          },
        },
        site: true,
        device: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 1000, // Limite pour performance
    });
  }

  async findOne(tenantId: string, id: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            photo: true,
            position: true,
            department: true,
            team: true,
          },
        },
        site: true,
        device: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record ${id} not found`);
    }

    return attendance;
  }

  async correctAttendance(
    tenantId: string,
    id: string,
    correctionDto: CorrectAttendanceDto,
  ) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, tenantId },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record ${id} not found`);
    }

    return this.prisma.attendance.update({
      where: { id },
      data: {
        isCorrected: true,
        correctedBy: correctionDto.correctedBy,
        correctedAt: new Date(),
        anomalyNote: correctionDto.correctionNote,
        timestamp: correctionDto.correctedTimestamp
          ? new Date(correctionDto.correctedTimestamp)
          : attendance.timestamp,
      },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getAnomalies(tenantId: string, date?: string) {
    const where: any = {
      tenantId,
      hasAnomaly: true,
      isCorrected: false,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.timestamp = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getDailyReport(tenantId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [totalRecords, uniqueEmployees, lateEntries, anomalies] = await Promise.all([
      this.prisma.attendance.count({
        where: {
          tenantId,
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),

      this.prisma.attendance.findMany({
        where: {
          tenantId,
          timestamp: { gte: startOfDay, lte: endOfDay },
          type: AttendanceType.IN,
        },
        distinct: ['employeeId'],
        select: { employeeId: true },
      }),

      this.prisma.attendance.count({
        where: {
          tenantId,
          timestamp: { gte: startOfDay, lte: endOfDay },
          hasAnomaly: true,
          anomalyType: { contains: 'LATE' },
        },
      }),

      this.prisma.attendance.count({
        where: {
          tenantId,
          timestamp: { gte: startOfDay, lte: endOfDay },
          hasAnomaly: true,
        },
      }),
    ]);

    return {
      date,
      totalRecords,
      uniqueEmployees: uniqueEmployees.length,
      lateEntries,
      anomalies,
    };
  }

  private async detectAnomalies(
    tenantId: string,
    employeeId: string,
    timestamp: Date,
    type: AttendanceType,
  ): Promise<{ hasAnomaly: boolean; type?: string; note?: string }> {
    const startOfDay = new Date(timestamp);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(timestamp);
    endOfDay.setHours(23, 59, 59, 999);

    // Récupérer les pointages du jour
    const todayRecords = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        employeeId,
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Vérifier double entrée
    if (type === AttendanceType.IN) {
      const hasIn = todayRecords.some(r => r.type === AttendanceType.IN);
      if (hasIn) {
        return {
          hasAnomaly: true,
          type: 'DOUBLE_IN',
          note: 'Double pointage d\'entrée détecté',
        };
      }
    }

    // Vérifier sortie sans entrée
    if (type === AttendanceType.OUT) {
      const hasIn = todayRecords.some(r => r.type === AttendanceType.IN);
      if (!hasIn) {
        return {
          hasAnomaly: true,
          type: 'MISSING_IN',
          note: 'Pointage de sortie sans entrée',
        };
      }
    }

    // TODO: Vérifier retards (nécessite le planning de l'employé)
    // TODO: Vérifier repos insuffisant entre shifts

    return { hasAnomaly: false };
  }
}
