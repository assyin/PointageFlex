import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { PrismaModule } from '../../database/prisma.module';
import { RecoveryDaysModule } from '../recovery-days/recovery-days.module';
import { DetectOvertimeJob } from './jobs/detect-overtime.job';

@Module({
  imports: [PrismaModule, RecoveryDaysModule, ScheduleModule],
  controllers: [OvertimeController],
  providers: [OvertimeService, DetectOvertimeJob],
  exports: [OvertimeService],
})
export class OvertimeModule {}
