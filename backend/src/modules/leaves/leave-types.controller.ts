import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Leave Types')
@Controller('leave-types')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class LeaveTypesController {
  constructor(private leavesService: LeavesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leave types' })
  findAll(@CurrentUser() user: any) {
    return this.leavesService.getLeaveTypes(user.tenantId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Create a new leave type' })
  create(@CurrentUser() user: any, @Body() dto: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(user.tenantId, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Update a leave type' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return this.leavesService.updateLeaveType(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Delete a leave type' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leavesService.deleteLeaveType(user.tenantId, id);
  }
}
