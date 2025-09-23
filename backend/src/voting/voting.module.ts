import { Module } from '@nestjs/common';
import { VotingService } from './services/voting.service';
import { VotingController } from './voting.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VotingController],
  providers: [VotingService],
  exports: [VotingService],
})
export class VotingModule {}
