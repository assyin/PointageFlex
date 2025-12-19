import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { LeaveTypesController } from './leave-types.controller';
import { PrismaModule } from '../../database/prisma.module';
import { FileStorageService } from './services/file-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeavesController, LeaveTypesController],
  providers: [LeavesService, FileStorageService],
  exports: [LeavesService],
})
export class LeavesModule {}
