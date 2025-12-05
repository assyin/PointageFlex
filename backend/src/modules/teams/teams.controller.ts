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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Teams')
@Controller('teams')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @Roles(Role.ADMIN_RH, Role.MANAGER)
  @ApiOperation({ summary: 'Create new team' })
  create(@CurrentUser() user: any, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('rotationEnabled') rotationEnabled?: string,
  ) {
    return this.teamsService.findAll(
      user.tenantId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      {
        search,
        rotationEnabled: rotationEnabled ? rotationEnabled === 'true' : undefined,
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.teamsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN_RH, Role.MANAGER)
  @ApiOperation({ summary: 'Update team' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_RH)
  @ApiOperation({ summary: 'Delete team' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.teamsService.remove(user.tenantId, id);
  }
}
