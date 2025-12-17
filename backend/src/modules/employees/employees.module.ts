import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaModule } from '../../database/prisma.module';
import { UserTenantRolesService } from '../users/user-tenant-roles.service';
import { RolesService } from '../roles/roles.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, PermissionsModule, AuditModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, UserTenantRolesService, RolesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
