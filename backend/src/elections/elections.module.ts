import { Module } from '@nestjs/common';
import { ElectionsService } from './services/elections.service';
import { ElectionsController } from './elections.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElectionsController],
  providers: [ElectionsService],
  exports: [ElectionsService],
})
export class ElectionsModule {}
