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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN_RH)
  @ApiOperation({ summary: 'Create new user' })
  create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN_RH, Role.MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll(
      user.tenantId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      {
        search,
        role,
        isActive: isActive ? isActive === 'true' : undefined,
      },
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.tenantId, user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.tenantId, user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN_RH)
  @ApiOperation({ summary: 'Update user' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_RH)
  @ApiOperation({ summary: 'Deactivate user' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.remove(user.tenantId, id);
  }
}
