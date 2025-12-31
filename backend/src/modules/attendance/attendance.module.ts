import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../../database/prisma.module';
import { DetectAbsencesJob } from './jobs/detect-absences.job';
import { DetectMissingOutJob } from './jobs/detect-missing-out.job';

@Module({
  imports: [PrismaModule, ScheduleModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, DetectAbsencesJob, DetectMissingOutJob],
  exports: [AttendanceService],
})
export class AttendanceModule {}
