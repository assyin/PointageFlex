import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Créer un nouveau terminal' })
  create(@CurrentUser() user: any, @Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(user.tenantId, createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des terminaux' })
  findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.devicesService.findAll(user.tenantId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des terminaux' })
  getStats(@CurrentUser() user: any) {
    return this.devicesService.getStats(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un terminal' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Modifier un terminal' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, user.tenantId, updateDeviceDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Supprimer un terminal' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.remove(id, user.tenantId);
  }

  @Post(':id/sync')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Synchroniser un terminal' })
  sync(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.syncDevice(id, user.tenantId);
  }
}
