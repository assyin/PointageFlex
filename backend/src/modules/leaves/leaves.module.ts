import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { LeaveTypesController } from './leave-types.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeavesController, LeaveTypesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
