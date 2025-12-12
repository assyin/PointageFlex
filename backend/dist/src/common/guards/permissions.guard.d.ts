import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../modules/permissions/permissions.service';
import { PrismaService } from '../../database/prisma.service';
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    private permissionsService;
    private prisma;
    constructor(reflector: Reflector, permissionsService: PermissionsService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
