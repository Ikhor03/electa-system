import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VotingService } from './services/voting.service';
import { CastVoteDto, VerifyVoterDto, VoteResponseDto, VotingResultsDto, VoterVerificationDto, VotingStatsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Voting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post('verify-voter')
  @Public()
  @ApiOperation({ summary: 'Verify voter eligibility (public)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voter verification result',
    type: VoterVerificationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Election is not currently active',
  })
  async verifyVoter(@Body() verifyVoterDto: VerifyVoterDto): Promise<VoterVerificationDto> {
    return this.votingService.verifyVoter(verifyVoterDto);
  }

  @Post('cast-vote')
  @Public()
  @ApiOperation({ summary: 'Cast a vote (public or authenticated)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vote cast successfully',
    type: VoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election, candidate, or voter not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid voting conditions',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Voter not eligible or already voted',
  })
  async castVote(
    @Body() castVoteDto: CastVoteDto,
    @CurrentUser() user?: any,
    @Req() req?: Request,
  ): Promise<VoteResponseDto> {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');
    
    return this.votingService.castVote(
      castVoteDto,
      user?.sub,
      ipAddress,
      userAgent,
    );
  }

  @Get('results/:electionId')
  @Public()
  @ApiOperation({ summary: 'Get voting results for an election (public)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voting results retrieved successfully',
    type: VotingResultsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async getVotingResults(@Param('electionId', ParseIntPipe) electionId: number): Promise<VotingResultsDto> {
    return this.votingService.getVotingResults(electionId);
  }

  @Get('stats/:electionId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get voting statistics for an election' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voting statistics retrieved successfully',
    type: VotingStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async getVotingStats(@Param('electionId', ParseIntPipe) electionId: number): Promise<VotingStatsDto> {
    return this.votingService.getVotingStats(electionId);
  }

  @Get('vote/:voteHash')
  @Public()
  @ApiOperation({ summary: 'Get vote details by hash (public verification)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote details retrieved successfully',
    type: VoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vote not found',
  })
  async getVoteByHash(@Param('voteHash') voteHash: string): Promise<VoteResponseDto | null> {
    return this.votingService.getVoteByHash(voteHash);
  }

  @Get('can-vote/:electionId')
  @Roles(UserRole.VOTER, UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Check if current user can vote in an election' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voting eligibility checked',
    schema: {
      type: 'object',
      properties: {
        canVote: { type: 'boolean' },
      },
    },
  })
  async canUserVote(
    @Param('electionId', ParseIntPipe) electionId: number,
    @CurrentUser() user: any,
  ): Promise<{ canVote: boolean }> {
    const canVote = await this.votingService.canUserVote(user.sub, electionId);
    return { canVote };
  }

  @Patch('invalidate/:voteId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Invalidate a vote (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote invalidated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vote not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Vote is already invalid',
  })
  async invalidateVote(
    @Param('voteId', ParseIntPipe) voteId: number,
    @Body('reason') reason: string,
  ): Promise<{ message: string }> {
    await this.votingService.invalidateVote(voteId, reason);
    return { message: 'Vote invalidated successfully' };
  }
}
