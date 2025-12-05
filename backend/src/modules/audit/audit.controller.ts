import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Audit')
@Controller('audit')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Post()
  @Roles(Role.ADMIN_RH, Role.MANAGER)
  @ApiOperation({ summary: 'Create audit log entry' })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateAuditLogDto,
    @Req() request: any,
  ) {
    // Extract IP and User Agent from request
    const ipAddress = dto.ipAddress || request.ip || request.connection.remoteAddress;
    const userAgent = dto.userAgent || request.headers['user-agent'];

    return this.auditService.create(user.tenantId, user.userId, {
      ...dto,
      ipAddress,
      userAgent,
    });
  }

  @Get()
  @Roles(Role.ADMIN_RH, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all audit logs' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query() filters?: QueryAuditLogDto,
  ) {
    return this.auditService.findAll(
      user.tenantId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      filters,
    );
  }

  @Get('summary/actions')
  @Roles(Role.ADMIN_RH, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit log action summary' })
  getActionSummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getActionSummary(user.tenantId, startDate, endDate);
  }

  @Get('summary/entities')
  @Roles(Role.ADMIN_RH, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit log entity summary' })
  getEntitySummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getEntitySummary(user.tenantId, startDate, endDate);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN_RH, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user activity logs' })
  getUserActivity(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getUserActivity(
      user.tenantId,
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN_RH, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit log by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.auditService.findOne(user.tenantId, id);
  }
}
