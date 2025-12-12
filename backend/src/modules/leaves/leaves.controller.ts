import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LegacyRole, LeaveStatus } from '@prisma/client';

@ApiTags('Leaves')
@Controller('leaves')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class LeavesController {
  constructor(private leavesService: LeavesService) {}

  @Post()
  @RequirePermissions('leave.create')
  @ApiOperation({ summary: 'Create new leave request' })
  create(@CurrentUser() user: any, @Body() dto: CreateLeaveDto) {
    return this.leavesService.create(user.tenantId, dto);
  }

  @Get()
  @RequirePermissions('leave.view_all', 'leave.view_own')
  @ApiOperation({ summary: 'Get all leaves' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('status') status?: LeaveStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leavesService.findAll(
      user.tenantId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      {
        employeeId,
        leaveTypeId,
        status,
        startDate,
        endDate,
      },
      user.userId,
      user.permissions || [],
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leavesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('leave.update')
  @ApiOperation({ summary: 'Update leave request' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveDto,
  ) {
    return this.leavesService.update(user.tenantId, id, dto);
  }

  @Post(':id/approve')
  @RequirePermissions('leave.approve')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  approve(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ApproveLeaveDto,
  ) {
    return this.leavesService.approve(
      user.tenantId,
      id,
      user.userId,
      user.role,
      dto,
    );
  }

  @Post(':id/cancel')
  @RequirePermissions('leave.cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leavesService.cancel(user.tenantId, id, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('leave.delete')
  @ApiOperation({ summary: 'Delete leave request' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leavesService.remove(user.tenantId, id);
  }
}