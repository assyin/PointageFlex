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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/tenant-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Tenants')
@Controller('tenants')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new tenant (Super Admin only)' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all tenants (Super Admin only)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.tenantsService.findAll(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_RH)
  @ApiOperation({ summary: 'Update tenant' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete tenant (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get tenant settings' })
  getSettings(@Param('id') id: string) {
    return this.tenantsService.getSettings(id);
  }

  @Patch(':id/settings')
  @Roles(Role.ADMIN_RH)
  @ApiOperation({ summary: 'Update tenant settings' })
  updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateTenantSettingsDto,
  ) {
    return this.tenantsService.updateSettings(id, dto);
  }
}
