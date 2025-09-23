import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CastVoteDto, VerifyVoterDto, VoteResponseDto, VotingResultsDto, VoterVerificationDto, VotingStatsDto } from '../dto';
import { ElectionStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class VotingService {
  constructor(private prisma: PrismaService) {}

  async verifyVoter(verifyVoterDto: VerifyVoterDto): Promise<VoterVerificationDto> {
    const { electionId, voterIdentifier } = verifyVoterDto;

    // Check if election exists and is active
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.status !== ElectionStatus.ACTIVE) {
      throw new BadRequestException('Election is not currently active');
    }

    // Check if current time is within election period
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      throw new BadRequestException('Voting is not allowed at this time');
    }

    // Find voter registration
    const voterRegistration = await this.prisma.voterRegistration.findUnique({
      where: {
        voterIdentifier_electionId: {
          voterIdentifier,
          electionId,
        },
      },
      include: {
        electoralDistrict: true,
      },
    });

    if (!voterRegistration) {
      return {
        isEligible: false,
        hasVoted: false,
        voterName: 'Unknown',
        gender: 'UNKNOWN',
        electoralDistrict: null,
        voteTimestamp: null,
      };
    }

    return {
      isEligible: voterRegistration.isEligible,
      hasVoted: voterRegistration.hasVoted,
      voterName: voterRegistration.name,
      gender: voterRegistration.gender,
      electoralDistrict: voterRegistration.electoralDistrict?.name || null,
      voteTimestamp: voterRegistration.voteTimestamp,
    };
  }

  async castVote(castVoteDto: CastVoteDto, userId?: number, ipAddress?: string, userAgent?: string): Promise<VoteResponseDto> {
    const { electionId, candidateId, voterIdentifier } = castVoteDto;

    // Verify election is active and within time bounds
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.status !== ElectionStatus.ACTIVE) {
      throw new BadRequestException('Election is not currently active');
    }

    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      throw new BadRequestException('Voting is not allowed at this time');
    }

    // Verify voter eligibility if voterIdentifier is provided
    let voterRegistration: any = null;
    if (voterIdentifier) {
      voterRegistration = await this.prisma.voterRegistration.findUnique({
        where: {
          voterIdentifier_electionId: {
            voterIdentifier,
            electionId,
          },
        },
      });

      if (!voterRegistration) {
        throw new NotFoundException('Voter not registered for this election');
      }

      if (!voterRegistration.isEligible) {
        throw new ForbiddenException('Voter is not eligible to vote');
      }

      if (voterRegistration.hasVoted) {
        throw new BadRequestException('Voter has already voted');
      }
    }

    // Verify candidate exists and is active (if not blank vote)
    if (candidateId) {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }

      if (candidate.electionId !== electionId) {
        throw new BadRequestException('Candidate does not belong to this election');
      }

      if (!candidate.isActive) {
        throw new BadRequestException('Candidate is not active');
      }
    }

    // Check if user has already voted (for authenticated users)
    if (userId) {
      const existingVote = await this.prisma.vote.findFirst({
        where: {
          userId,
          electionId,
        },
      });

      if (existingVote) {
        throw new BadRequestException('User has already voted in this election');
      }
    }

    // Generate anonymous vote hash
    const voteHash = this.generateVoteHash(electionId, candidateId, voterIdentifier, now);

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Create vote record
      const vote = await tx.vote.create({
        data: {
          voteHash,
          candidateId: candidateId || null,
          electionId,
          userId: userId || null,
          isValid: true,
          ipAddress,
          userAgent,
        },
        include: {
          candidate: {
            select: {
              name: true,
              candidateNumber: true,
            },
          },
        },
      });

      // Update voter registration if applicable
      if (voterRegistration) {
        await tx.voterRegistration.update({
          where: { id: voterRegistration.id },
          data: {
            hasVoted: true,
            voteTimestamp: now,
          },
        });
      }

      // Increment candidate vote count if not blank vote
      if (candidateId) {
        await tx.candidate.update({
          where: { id: candidateId },
          data: {
            voteCount: {
              increment: 1,
            },
          },
        });
      }

      return vote;
    });

    return {
      id: result.id,
      voteHash: result.voteHash,
      candidateId: result.candidateId,
      electionId: result.electionId,
      isValid: result.isValid,
      createdAt: result.createdAt,
      candidateName: result.candidate?.name,
      candidateNumber: result.candidate?.candidateNumber,
    };
  }

  async getVotingResults(electionId: number): Promise<VotingResultsDto> {
    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: {
          where: { isActive: true },
          orderBy: { candidateNumber: 'asc' },
        },
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Get vote statistics
    const [totalVotes, validVotes, invalidVotes, blankVotes, lastVote] = await Promise.all([
      this.prisma.vote.count({ where: { electionId } }),
      this.prisma.vote.count({ where: { electionId, isValid: true } }),
      this.prisma.vote.count({ where: { electionId, isValid: false } }),
      this.prisma.vote.count({ where: { electionId, candidateId: null, isValid: true } }),
      this.prisma.vote.findFirst({
        where: { electionId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    // Calculate candidate results
    const candidates = election.candidates.map(candidate => {
      const percentage = validVotes > 0 ? (candidate.voteCount / validVotes) * 100 : 0;
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateNumber: candidate.candidateNumber,
        voteCount: candidate.voteCount,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      };
    });

    return {
      electionId,
      electionName: election.name,
      totalVotes,
      validVotes,
      invalidVotes,
      blankVotes,
      candidates,
      lastUpdated: lastVote?.createdAt || election.createdAt,
    };
  }

  async getVotingStats(electionId: number): Promise<VotingStatsDto> {
    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const [
      totalVotes,
      validVotes,
      invalidVotes,
      blankVotes,
      totalRegisteredVoters,
      lastVote,
    ] = await Promise.all([
      this.prisma.vote.count({ where: { electionId } }),
      this.prisma.vote.count({ where: { electionId, isValid: true } }),
      this.prisma.vote.count({ where: { electionId, isValid: false } }),
      this.prisma.vote.count({ where: { electionId, candidateId: null, isValid: true } }),
      this.prisma.voterRegistration.count({ where: { electionId } }),
      this.prisma.vote.findFirst({
        where: { electionId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const turnoutPercentage = totalRegisteredVoters > 0 
      ? Math.round((totalVotes / totalRegisteredVoters) * 10000) / 100 
      : 0;

    return {
      totalVotes,
      validVotes,
      invalidVotes,
      blankVotes,
      totalRegisteredVoters,
      turnoutPercentage,
      lastVoteTime: lastVote?.createdAt || election.startDate,
    };
  }

  async invalidateVote(voteId: number, reason: string): Promise<void> {
    const vote = await this.prisma.vote.findUnique({
      where: { id: voteId },
      include: { candidate: true },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    if (!vote.isValid) {
      throw new BadRequestException('Vote is already invalid');
    }

    await this.prisma.$transaction(async (tx) => {
      // Mark vote as invalid
      await tx.vote.update({
        where: { id: voteId },
        data: { isValid: false },
      });

      // Decrement candidate vote count if applicable
      if (vote.candidateId) {
        await tx.candidate.update({
          where: { id: vote.candidateId },
          data: {
            voteCount: {
              decrement: 1,
            },
          },
        });
      }

      // Log the invalidation (could be expanded to audit log)
      console.log(`Vote ${voteId} invalidated. Reason: ${reason}`);
    });
  }

  async getVoteByHash(voteHash: string): Promise<VoteResponseDto | null> {
    const vote = await this.prisma.vote.findUnique({
      where: { voteHash },
      include: {
        candidate: {
          select: {
            name: true,
            candidateNumber: true,
          },
        },
      },
    });

    if (!vote) {
      return null;
    }

    return {
      id: vote.id,
      voteHash: vote.voteHash,
      candidateId: vote.candidateId,
      electionId: vote.electionId,
      isValid: vote.isValid,
      createdAt: vote.createdAt,
      candidateName: vote.candidate?.name,
      candidateNumber: vote.candidate?.candidateNumber,
    };
  }

  async canUserVote(userId: number, electionId: number): Promise<boolean> {
    // Check if election is active
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election || election.status !== ElectionStatus.ACTIVE) {
      return false;
    }

    // Check time bounds
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return false;
    }

    // Check if user has already voted
    const existingVote = await this.prisma.vote.findFirst({
      where: { userId, electionId },
    });

    return !existingVote;
  }

  private generateVoteHash(electionId: number, candidateId: number | undefined, voterIdentifier: string | undefined, timestamp: Date): string {
    const data = `${electionId}-${candidateId || 'blank'}-${voterIdentifier || 'anonymous'}-${timestamp.getTime()}-${Math.random()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
