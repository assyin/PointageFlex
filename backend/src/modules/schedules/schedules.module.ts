import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { AlertsService } from './alerts.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, AlertsService],
  exports: [SchedulesService, AlertsService],
})
export class SchedulesModule {}
