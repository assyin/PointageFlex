import { Module } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
