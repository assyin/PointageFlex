import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { PrismaModule } from '../../database/prisma.module';
import { RecoveryDaysModule } from '../recovery-days/recovery-days.module';
import { MailModule } from '../mail/mail.module';
import { DetectOvertimeJob } from './jobs/detect-overtime.job';
import { OvertimePendingNotificationJob } from './jobs/overtime-pending-notification.job';

@Module({
  imports: [PrismaModule, RecoveryDaysModule, ScheduleModule, MailModule],
  controllers: [OvertimeController],
  providers: [OvertimeService, DetectOvertimeJob, OvertimePendingNotificationJob],
  exports: [OvertimeService],
})
export class OvertimeModule {}
