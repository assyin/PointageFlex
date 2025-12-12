import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { LegacyRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DataGeneratorLeavesService } from './data-generator-leaves.service';
import { GenerateLeavesDto } from './dto/generate-leaves.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';


@ApiTags('Data Generator - Leaves')
@Controller('data-generator/leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DataGeneratorLeavesController {
  constructor(private readonly leavesService: DataGeneratorLeavesService) {}

  @Post('generate')
  @Roles(LegacyRole.ADMIN_RH, LegacyRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Générer des congés pour les employés',
    description: 'Génère automatiquement des congés pour un pourcentage d\'employés selon une distribution',
  })
  @ApiResponse({
    status: 201,
    description: 'Congés générés avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async generateLeaves(@Req() req, @Body() dto: GenerateLeavesDto) {
    const tenantId = req.user.tenantId;
    return this.leavesService.generateLeaves(tenantId, dto);
  }

  @Get('stats')
  @Roles(LegacyRole.ADMIN_RH, LegacyRole.SUPER_ADMIN, LegacyRole.MANAGER)
  @ApiOperation({
    summary: 'Obtenir les statistiques des congés',
    description: 'Retourne un résumé des congés générés',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées',
  })
  async getStats(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.leavesService.getLeavesStats(tenantId);
  }
}