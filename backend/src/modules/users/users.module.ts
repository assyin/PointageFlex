import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserTenantRolesService } from './user-tenant-roles.service';
import { PrismaModule } from '../../database/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PrismaModule, AuditModule, RolesModule, PermissionsModule],
  controllers: [UsersController],
  providers: [UsersService, UserTenantRolesService],
  exports: [UsersService, UserTenantRolesService],
})
export class UsersModule {}
