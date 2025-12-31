import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { LeaveStatus, LegacyRole, RecoveryDayStatus } from '@prisma/client';
import { getManagerLevel, getManagedEmployeeIds } from '../../common/utils/manager-level.util';
import { FileStorageService } from './services/file-storage.service';

@Injectable()
export class LeavesService {
  constructor(
    private prisma: PrismaService,
    private fileStorageService: FileStorageService,
  ) {}

  /**
   * Suspend les plannings existants pour la période du congé
   */
  private async suspendSchedulesForLeave(
    tenantId: string,
    employeeId: string,
    leaveId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    console.log(`[suspendSchedulesForLeave] Suspension des plannings pour le congé ${leaveId}`);
    console.log(`[suspendSchedulesForLeave] Période: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    // Trouver tous les plannings PUBLISHED dans la période du congé
    const affectedSchedules = await this.prisma.schedule.findMany({
      where: {
        tenantId,
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PUBLISHED', // Suspendre uniquement les plannings publiés
      },
      select: {
        id: true,
        date: true,
      },
    });

    if (affectedSchedules.length === 0) {
      console.log(`[suspendSchedulesForLeave] Aucun planning à suspendre`);
      return 0;
    }

    console.log(`[suspendSchedulesForLeave] ${affectedSchedules.length} planning(s) trouvé(s) à suspendre`);

    // Suspendre tous les plannings trouvés
    const result = await this.prisma.schedule.updateMany({
      where: {
        id: {
          in: affectedSchedules.map((s) => s.id),
        },
      },
      data: {
        status: 'SUSPENDED_BY_LEAVE',
        suspendedByLeaveId: leaveId,
        suspendedAt: new Date(),
      },
    });

    console.log(`[suspendSchedulesForLeave] ${result.count} planning(s) suspendu(s)`);
    return result.count;
  }

  /**
   * Réactive les plannings qui étaient suspendus par ce congé
   */
  private async reactivateSchedulesForLeave(
    tenantId: string,
    leaveId: string,
  ): Promise<number> {
    console.log(`[reactivateSchedulesForLeave] Réactivation des plannings pour le congé ${leaveId}`);

    // Trouver tous les plannings suspendus par ce congé
    const suspendedSchedules = await this.prisma.schedule.findMany({
      where: {
        tenantId,
        suspendedByLeaveId: leaveId,
        status: 'SUSPENDED_BY_LEAVE',
      },
      select: {
        id: true,
        date: true,
      },
    });

    if (suspendedSchedules.length === 0) {
      console.log(`[reactivateSchedulesForLeave] Aucun planning à réactiver`);
      return 0;
    }

    console.log(`[reactivateSchedulesForLeave] ${suspendedSchedules.length} planning(s) à réactiver`);

    // Réactiver tous les plannings
    const result = await this.prisma.schedule.updateMany({
      where: {
        id: {
          in: suspendedSchedules.map((s) => s.id),
        },
      },
      data: {
        status: 'PUBLISHED',
        suspendedByLeaveId: null,
        suspendedAt: null,
      },
    });

    console.log(`[reactivateSchedulesForLeave] ${result.count} planning(s) réactivé(s)`);
    return result.count;
  }

  /**
   * Ajuste les suspensions lors de la modification des dates d'un congé
   */
  private async adjustScheduleSuspensionsForLeaveUpdate(
    tenantId: string,
    employeeId: string,
    leaveId: string,
    oldStartDate: Date,
    oldEndDate: Date,
    newStartDate: Date,
    newEndDate: Date,
  ): Promise<void> {
    console.log(`[adjustScheduleSuspensionsForLeaveUpdate] Ajustement pour le congé ${leaveId}`);
    console.log(`[adjustScheduleSuspensionsForLeaveUpdate] Anciennes dates: ${oldStartDate.toISOString()} - ${oldEndDate.toISOString()}`);
    console.log(`[adjustScheduleSuspensionsForLeaveUpdate] Nouvelles dates: ${newStartDate.toISOString()} - ${newEndDate.toISOString()}`);

    // Étape 1: Réactiver tous les plannings qui étaient suspendus par ce congé
    await this.reactivateSchedulesForLeave(tenantId, leaveId);

    // Étape 2: Suspendre les plannings dans la nouvelle période
    await this.suspendSchedulesForLeave(tenantId, employeeId, leaveId, newStartDate, newEndDate);
  }

  async create(tenantId: string, dto: CreateLeaveDto) {
    // Verify employee belongs to tenant
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: dto.employeeId,
        tenantId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Verify leave type belongs to tenant
    const leaveType = await this.prisma.leaveType.findFirst({
      where: {
        id: dto.leaveTypeId,
        tenantId,
      },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate days if not provided
    let days = dto.days;
    if (!days) {
      const timeDiff = endDate.getTime() - startDate.getTime();
      days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    }

    // Check for overlapping leaves
    const overlapping = await this.prisma.leave.findFirst({
      where: {
        employeeId: dto.employeeId,
        status: {
          notIn: [LeaveStatus.REJECTED, LeaveStatus.CANCELLED],
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Leave request overlaps with existing leave');
    }

    // AJOUT: Vérifier les chevauchements avec les récupérations
    const conflictingRecoveryDays = await this.prisma.recoveryDay.findMany({
      where: {
        tenantId,
        employeeId: dto.employeeId,
        status: {
          in: [RecoveryDayStatus.APPROVED, RecoveryDayStatus.PENDING],
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (conflictingRecoveryDays.length > 0) {
      const dates = conflictingRecoveryDays
        .map(
          (rd) =>
            `${rd.startDate.toISOString().split('T')[0]} - ${rd.endDate.toISOString().split('T')[0]}`,
        )
        .join(', ');
      throw new BadRequestException(
        `Conflit avec des journées de récupération existantes : ${dates}. Veuillez choisir d'autres dates ou annuler les récupérations concernées.`,
      );
    }

    return this.prisma.leave.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        days,
        reason: dto.reason,
        document: dto.document,
        status: LeaveStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      employeeId?: string;
      leaveTypeId?: string;
      status?: LeaveStatus;
      startDate?: string;
      endDate?: string;
    },
    userId?: string,
    userPermissions?: string[],
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    // Filtrer par employé si l'utilisateur n'a que la permission 'leave.view_own'
    const hasViewAll = userPermissions?.includes('leave.view_all');
    const hasViewOwn = userPermissions?.includes('leave.view_own');
    const hasViewTeam = userPermissions?.includes('leave.view_team');
    const hasViewDepartment = userPermissions?.includes('leave.view_department');
    const hasViewSite = userPermissions?.includes('leave.view_site');

    // IMPORTANT: Détecter si l'utilisateur est un manager, mais seulement s'il n'a pas 'view_all'
    // Les admins avec 'view_all' doivent voir toutes les données, indépendamment de leur statut de manager
    // PRIORITÉ: La permission 'view_all' prime sur le statut de manager
    if (userId && !hasViewAll) {
      const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);

      // Si l'utilisateur est un manager, appliquer le filtrage selon son niveau hiérarchique
      if (managerLevel.type === 'DEPARTMENT') {
        // Manager de département : filtrer par les employés du département
        const managedEmployeeIds = await getManagedEmployeeIds(this.prisma, managerLevel, tenantId);
        if (managedEmployeeIds.length === 0) {
          return {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
        where.employeeId = { in: managedEmployeeIds };
      } else if (managerLevel.type === 'SITE') {
        // Manager régional : filtrer par les employés du site ET département
        const managedEmployeeIds = await getManagedEmployeeIds(this.prisma, managerLevel, tenantId);
        if (managedEmployeeIds.length === 0) {
          return {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
        where.employeeId = { in: managedEmployeeIds };
      } else if (managerLevel.type === 'TEAM') {
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
          // Si pas d'équipe, retourner vide
          return {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
      } else if (!hasViewAll && hasViewOwn) {
        // Si pas manager et a seulement 'view_own', filtrer par son propre ID
        const employee = await this.prisma.employee.findFirst({
          where: { userId, tenantId },
          select: { id: true },
        });

        if (employee) {
          where.employeeId = employee.id;
        } else {
          // Si pas d'employé lié, retourner vide
          return {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
      }
    }

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.leaveTypeId) {
      where.leaveTypeId = filters.leaveTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              matricule: true,
              site: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          leaveType: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leave.count({ where }),
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
    const leave = await this.prisma.leave.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
            position: true,
            email: true,
          },
        },
        leaveType: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    return leave;
  }

  async update(tenantId: string, id: string, dto: UpdateLeaveDto) {
    const leave = await this.findOne(tenantId, id);

    // Only allow updates if leave is still pending or approved
    // Les congés approuvés peuvent être modifiés (ex: ajustement de dates)
    const allowedStatuses: LeaveStatus[] = [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.MANAGER_APPROVED];
    if (!allowedStatuses.includes(leave.status)) {
      throw new BadRequestException('Cannot update leave that is rejected or cancelled');
    }

    // Verify leave type belongs to tenant (if provided)
    if (dto.leaveTypeId) {
      const leaveType = await this.prisma.leaveType.findFirst({
        where: {
          id: dto.leaveTypeId,
          tenantId,
        },
      });

      if (!leaveType) {
        throw new NotFoundException('Leave type not found');
      }
    }

    // Validate dates if provided
    const oldStartDate = leave.startDate;
    const oldEndDate = leave.endDate;
    let datesChanged = false;

    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ? new Date(dto.startDate) : leave.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : leave.endDate;

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      // Vérifier si les dates ont changé
      datesChanged =
        (dto.startDate && new Date(dto.startDate).getTime() !== oldStartDate.getTime()) ||
        (dto.endDate && new Date(dto.endDate).getTime() !== oldEndDate.getTime());
    }

    const updatedLeave = await this.prisma.leave.update({
      where: { id },
      data: {
        ...(dto.leaveTypeId && { leaveTypeId: dto.leaveTypeId }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.days !== undefined && { days: dto.days }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.document !== undefined && { document: dto.document }),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });

    // Si le congé est approuvé ET que les dates ont changé, ajuster les suspensions
    if (leave.status === LeaveStatus.APPROVED && datesChanged) {
      console.log(`[update] Dates modifiées pour un congé approuvé → Ajustement des suspensions`);
      await this.adjustScheduleSuspensionsForLeaveUpdate(
        tenantId,
        updatedLeave.employeeId,
        updatedLeave.id,
        oldStartDate,
        oldEndDate,
        updatedLeave.startDate,
        updatedLeave.endDate,
      );
    }

    return updatedLeave;
  }

  async approve(
    tenantId: string,
    id: string,
    userId: string,
    userRole: LegacyRole,
    dto: ApproveLeaveDto,
  ) {
    const leave = await this.findOne(tenantId, id);

    // Only allow approval if leave is pending or in workflow
    const allowedStatuses = [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED];
    if (!allowedStatuses.includes(leave.status as any)) {
      throw new BadRequestException('Leave cannot be approved at this stage');
    }

    const updateData: any = {};

    // SUPER_ADMIN can approve at any level
    if (userRole === LegacyRole.SUPER_ADMIN) {
      if (dto.status === LeaveStatus.MANAGER_APPROVED) {
        updateData.status = LeaveStatus.MANAGER_APPROVED;
        updateData.managerApprovedBy = userId;
        updateData.managerApprovedAt = new Date();
        updateData.managerComment = dto.comment;
      } else if (dto.status === LeaveStatus.APPROVED || dto.status === LeaveStatus.HR_APPROVED) {
        updateData.status = LeaveStatus.APPROVED;
        updateData.hrApprovedBy = userId;
        updateData.hrApprovedAt = new Date();
        updateData.hrComment = dto.comment;
      } else if (dto.status === LeaveStatus.REJECTED) {
        updateData.status = LeaveStatus.REJECTED;
        // For rejection, only set comment without approval timestamps
        updateData.hrComment = dto.comment;
      }
    }
    // Manager approval
    else if (userRole === LegacyRole.MANAGER) {
      if (dto.status === LeaveStatus.MANAGER_APPROVED) {
        updateData.status = LeaveStatus.MANAGER_APPROVED;
        updateData.managerApprovedBy = userId;
        updateData.managerApprovedAt = new Date();
        updateData.managerComment = dto.comment;
      } else if (dto.status === LeaveStatus.REJECTED) {
        updateData.status = LeaveStatus.REJECTED;
        // For rejection, only set comment without approval timestamps
        updateData.managerComment = dto.comment;
      }
    }
    // HR approval - ONLY after manager approval
    else if (userRole === LegacyRole.ADMIN_RH) {
      // IMPORTANT: RH can only approve/reject if the leave has been approved by manager first
      if (leave.status !== LeaveStatus.MANAGER_APPROVED) {
        throw new ForbiddenException(
          'Vous ne pouvez pas approuver ou rejeter ce congé. Le manager doit d\'abord approuver la demande.'
        );
      }

      if (dto.status === LeaveStatus.APPROVED || dto.status === LeaveStatus.HR_APPROVED) {
        updateData.status = LeaveStatus.APPROVED;
        updateData.hrApprovedBy = userId;
        updateData.hrApprovedAt = new Date();
        updateData.hrComment = dto.comment;
      } else if (dto.status === LeaveStatus.REJECTED) {
        updateData.status = LeaveStatus.REJECTED;
        // For rejection, only set comment without approval timestamps
        updateData.hrComment = dto.comment;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Invalid status transition');
    }

    const updatedLeave = await this.prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });

    // Si le congé est approuvé (statut final), suspendre les plannings
    if (updateData.status === LeaveStatus.APPROVED) {
      console.log(`[approve] Congé approuvé → Suspension des plannings`);
      await this.suspendSchedulesForLeave(
        tenantId,
        updatedLeave.employeeId,
        updatedLeave.id,
        updatedLeave.startDate,
        updatedLeave.endDate,
      );
    }

    return updatedLeave;
  }

  async cancel(tenantId: string, id: string, userId: string) {
    const leave = await this.findOne(tenantId, id);

    // Only allow cancellation if leave is not already rejected or cancelled
    const rejectedStatuses = [LeaveStatus.REJECTED, LeaveStatus.CANCELLED];
    if (rejectedStatuses.includes(leave.status as any)) {
      throw new BadRequestException('Leave is already rejected or cancelled');
    }

    const cancelledLeave = await this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.CANCELLED,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });

    // Si le congé était approuvé, réactiver les plannings suspendus
    if (leave.status === LeaveStatus.APPROVED) {
      console.log(`[cancel] Congé annulé → Réactivation des plannings`);
      await this.reactivateSchedulesForLeave(tenantId, id);
    }

    return cancelledLeave;
  }

  async remove(tenantId: string, id: string) {
    const leave = await this.findOne(tenantId, id);

    // Réactiver les plannings suspendus avant de supprimer le congé
    if (leave.status === LeaveStatus.APPROVED) {
      console.log(`[remove] Congé supprimé → Réactivation des plannings`);
      await this.reactivateSchedulesForLeave(tenantId, id);
    }

    return this.prisma.leave.delete({
      where: { id },
    });
  }

  async getLeaveTypes(tenantId: string) {
    return this.prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createLeaveType(tenantId: string, data: any) {
    return this.prisma.leaveType.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateLeaveType(tenantId: string, id: string, data: any) {
    // Verify leave type belongs to tenant
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, tenantId },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return this.prisma.leaveType.update({
      where: { id },
      data,
    });
  }

  async deleteLeaveType(tenantId: string, id: string) {
    // Verify leave type belongs to tenant
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, tenantId },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Check if any leaves use this type
    const leavesCount = await this.prisma.leave.count({
      where: { leaveTypeId: id },
    });

    if (leavesCount > 0) {
      throw new BadRequestException(
        `Cannot delete leave type. ${leavesCount} leave request(s) are using this type.`
      );
    }

    return this.prisma.leaveType.delete({
      where: { id },
    });
  }

  /**
   * Upload un document pour un congé
   */
  async uploadDocument(
    tenantId: string,
    leaveId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    // Vérifier que le congé existe
    const leave = await this.prisma.leave.findFirst({
      where: {
        id: leaveId,
        tenantId,
      },
      include: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    // Vérifier les permissions
    // L'employé peut uploader seulement pour sa propre demande et si PENDING
    const employee = await this.prisma.employee.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (employee && employee.id === leave.employeeId) {
      if (leave.status !== LeaveStatus.PENDING) {
        throw new ForbiddenException(
          'You can only upload documents for pending leave requests',
        );
      }
    }

    // Supprimer l'ancien document s'il existe
    if (leave.document) {
      await this.fileStorageService.deleteFile(leave.document);
    }

    // Sauvegarder le nouveau fichier
    const { filePath, fileName } = await this.fileStorageService.saveFile(
      tenantId,
      leaveId,
      file,
    );

    const now = new Date();
    const isUpdate = !!leave.document;

    // Mettre à jour le congé
    return this.prisma.leave.update({
      where: { id: leaveId },
      data: {
        document: filePath,
        documentName: fileName,
        documentSize: file.size,
        documentMimeType: file.mimetype,
        documentUploadedBy: isUpdate ? leave.documentUploadedBy : userId,
        documentUploadedAt: isUpdate ? leave.documentUploadedAt : now,
        documentUpdatedBy: userId,
        documentUpdatedAt: now,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }

  /**
   * Télécharge un document de congé
   */
  async downloadDocument(
    tenantId: string,
    leaveId: string,
    userId: string,
    userPermissions: string[],
  ) {
    // Vérifier que le congé existe
    const leave = await this.prisma.leave.findFirst({
      where: {
        id: leaveId,
        tenantId,
      },
      include: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    if (!leave.document) {
      throw new NotFoundException('No document attached to this leave request');
    }

    // Vérifier les permissions
    const hasViewAll = userPermissions.includes('leave.view_all');
    const hasViewOwn = userPermissions.includes('leave.view_own');
    const hasViewTeam = userPermissions.includes('leave.view_team');

    if (!hasViewAll) {
      const employee = await this.prisma.employee.findFirst({
        where: {
          userId,
          tenantId,
        },
      });

      if (employee) {
        // Vérifier si c'est son propre congé
        if (employee.id === leave.employeeId && !hasViewOwn) {
          throw new ForbiddenException('You do not have permission to view this document');
        }

        // Vérifier si c'est un manager qui peut voir l'équipe
        if (hasViewTeam) {
          const managerLevel = await getManagerLevel(this.prisma, userId, tenantId);
          if (managerLevel.type !== null) {
            const managedEmployeeIds = await getManagedEmployeeIds(
              this.prisma,
              managerLevel,
              tenantId,
            );
            if (!managedEmployeeIds.includes(leave.employeeId)) {
              throw new ForbiddenException('You do not have permission to view this document');
            }
          } else {
            throw new ForbiddenException('You do not have permission to view this document');
          }
        } else if (employee.id !== leave.employeeId) {
          throw new ForbiddenException('You do not have permission to view this document');
        }
      } else {
        throw new ForbiddenException('You do not have permission to view this document');
      }
    }

    // Récupérer le fichier
    const fileData = await this.fileStorageService.getFile(leave.document);

    return {
      buffer: fileData.buffer,
      fileName: leave.documentName || fileData.fileName,
      mimeType: leave.documentMimeType || fileData.mimeType,
    };
  }

  /**
   * Supprime un document de congé
   */
  async deleteDocument(
    tenantId: string,
    leaveId: string,
    userId: string,
  ) {
    // Vérifier que le congé existe
    const leave = await this.prisma.leave.findFirst({
      where: {
        id: leaveId,
        tenantId,
      },
      include: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    if (!leave.document) {
      throw new NotFoundException('No document attached to this leave request');
    }

    // Vérifier les permissions
    const employee = await this.prisma.employee.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    // L'employé peut supprimer seulement si PENDING
    if (employee && employee.id === leave.employeeId) {
      if (leave.status !== LeaveStatus.PENDING) {
        throw new ForbiddenException(
          'You can only delete documents for pending leave requests',
        );
      }
    }

    // Supprimer le fichier
    await this.fileStorageService.deleteFile(leave.document);

    // Mettre à jour le congé
    return this.prisma.leave.update({
      where: { id: leaveId },
      data: {
        document: null,
        documentName: null,
        documentSize: null,
        documentMimeType: null,
        documentUpdatedBy: userId,
        documentUpdatedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        leaveType: true,
      },
    });
  }
}
