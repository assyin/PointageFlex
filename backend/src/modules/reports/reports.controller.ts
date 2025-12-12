import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { DashboardStatsQueryDto } from './dto/dashboard-stats.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LegacyRole } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(LegacyRole.ADMIN_RH, LegacyRole.MANAGER, LegacyRole.SUPER_ADMIN, LegacyRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get dashboard statistics (supports scope: personal, team, tenant, platform)' })
  getDashboardStats(
    @CurrentUser() user: any,
    @Query() query: DashboardStatsQueryDto,
  ) {
    return this.reportsService.getDashboardStats(
      user.tenantId,
      query,
      user.userId,
      user.role,
    );
  }

  @Get('attendance')
  @Roles(LegacyRole.ADMIN_RH, LegacyRole.MANAGER)
  @ApiOperation({ summary: 'Get attendance report' })
  getAttendanceReport(
    @CurrentUser() user: any,
    @Query() dto: AttendanceReportDto,
  ) {
    return this.reportsService.getAttendanceReport(user.tenantId, dto);
  }

  @Get('employee/:id')
  @Roles(LegacyRole.ADMIN_RH, LegacyRole.MANAGER)
  @ApiOperation({ summary: 'Get employee report' })
  getEmployeeReport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getEmployeeReport(user.tenantId, id, startDate, endDate);
  }

  @Get('team/:id')
  @Roles(LegacyRole.ADMIN_RH, LegacyRole.MANAGER)
  @ApiOperation({ summary: 'Get team report' })
  getTeamReport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getTeamReport(user.tenantId, id, startDate, endDate);
  }
}