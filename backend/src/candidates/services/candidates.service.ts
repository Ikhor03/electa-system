import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateResponseDto, PaginatedCandidatesResponseDto, CandidateStatsDto } from '../dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<CandidateResponseDto> {
    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: createCandidateDto.electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if candidate number is unique within the election
    const existingCandidate = await this.prisma.candidate.findFirst({
      where: {
        candidateNumber: createCandidateDto.candidateNumber,
        electionId: createCandidateDto.electionId,
      },
    });

    if (existingCandidate) {
      throw new ConflictException('Candidate number already exists in this election');
    }

    const candidate = await this.prisma.candidate.create({
      data: {
        ...createCandidateDto,
        isActive: createCandidateDto.isActive ?? true,
      },
      include: {
        election: {
          select: { name: true },
        },
      },
    });

    return this.mapToResponseDto(candidate);
  }

  async findAll(
    page = 1,
    limit = 10,
    electionId?: number,
    isActive?: boolean,
  ): Promise<PaginatedCandidatesResponseDto> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (electionId) where.electionId = electionId;
    if (isActive !== undefined) where.isActive = isActive;

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        include: {
          election: {
            select: { name: true },
          },
        },
        orderBy: [
          { electionId: 'asc' },
          { position: 'asc' },
          { candidateNumber: 'asc' },
        ],
      }),
      this.prisma.candidate.count({ where }),
    ]);

    const data = candidates.map(candidate => this.mapToResponseDto(candidate));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<CandidateResponseDto> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        election: {
          select: { name: true },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.mapToResponseDto(candidate);
  }

  async findByElection(electionId: number, includeInactive = false): Promise<CandidateResponseDto[]> {
    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const where: any = { electionId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const candidates = await this.prisma.candidate.findMany({
      where,
      include: {
        election: {
          select: { name: true },
        },
      },
      orderBy: [
        { position: 'asc' },
        { candidateNumber: 'asc' },
      ],
    });

    return candidates.map(candidate => this.mapToResponseDto(candidate));
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto): Promise<CandidateResponseDto> {
    // Check if candidate exists
    const existingCandidate = await this.findOne(id);

    // Check candidate number uniqueness if being updated
    if (updateCandidateDto.candidateNumber) {
      const conflictingCandidate = await this.prisma.candidate.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { candidateNumber: updateCandidateDto.candidateNumber },
            { electionId: updateCandidateDto.electionId || existingCandidate.electionId },
          ],
        },
      });

      if (conflictingCandidate) {
        throw new ConflictException('Candidate number already exists in this election');
      }
    }

    // Check if election exists if being updated
    if (updateCandidateDto.electionId && updateCandidateDto.electionId !== existingCandidate.electionId) {
      const election = await this.prisma.election.findUnique({
        where: { id: updateCandidateDto.electionId },
      });

      if (!election) {
        throw new NotFoundException('Election not found');
      }
    }

    const updatedCandidate = await this.prisma.candidate.update({
      where: { id },
      data: updateCandidateDto,
      include: {
        election: {
          select: { name: true },
        },
      },
    });

    return this.mapToResponseDto(updatedCandidate);
  }

  async remove(id: number): Promise<void> {
    // Check if candidate exists
    await this.findOne(id);
    
    // Check if candidate has votes (prevent deletion if votes exist)
    const voteCount = await this.prisma.vote.count({
      where: { candidateId: id },
    });

    if (voteCount > 0) {
      throw new BadRequestException('Cannot delete candidate with existing votes');
    }

    await this.prisma.candidate.delete({
      where: { id },
    });
  }

  async activate(id: number): Promise<CandidateResponseDto> {
    const candidate = await this.update(id, { isActive: true });
    return candidate;
  }

  async deactivate(id: number): Promise<CandidateResponseDto> {
    const candidate = await this.update(id, { isActive: false });
    return candidate;
  }

  async updatePosition(id: number, position: number): Promise<CandidateResponseDto> {
    if (position < 0 || position > 999) {
      throw new BadRequestException('Position must be between 0 and 999');
    }

    const candidate = await this.update(id, { position });
    return candidate;
  }

  async reorderCandidates(electionId: number, candidateIds: number[]): Promise<CandidateResponseDto[]> {
    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Verify all candidates belong to the election
    const candidates = await this.prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        electionId,
      },
    });

    if (candidates.length !== candidateIds.length) {
      throw new BadRequestException('Some candidates do not belong to this election');
    }

    // Update positions
    const updatePromises = candidateIds.map((candidateId, index) =>
      this.prisma.candidate.update({
        where: { id: candidateId },
        data: { position: index },
      })
    );

    await Promise.all(updatePromises);

    // Return updated candidates
    return this.findByElection(electionId);
  }

  async getStatsByElection(electionId: number): Promise<CandidateStatsDto> {
    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const [
      totalCandidates,
      activeCandidates,
      inactiveCandidates,
      totalVotes,
      leadingCandidate,
    ] = await Promise.all([
      this.prisma.candidate.count({ where: { electionId } }),
      this.prisma.candidate.count({ where: { electionId, isActive: true } }),
      this.prisma.candidate.count({ where: { electionId, isActive: false } }),
      this.prisma.vote.count({ where: { electionId } }),
      this.prisma.candidate.findFirst({
        where: { electionId, isActive: true },
        orderBy: { voteCount: 'desc' },
      }),
    ]);

    return {
      totalCandidates,
      activeCandidates,
      inactiveCandidates,
      totalVotes,
      leadingCandidate: leadingCandidate?.name || 'No candidates',
      leadingVotes: leadingCandidate?.voteCount || 0,
    };
  }

  async incrementVoteCount(id: number): Promise<void> {
    await this.prisma.candidate.update({
      where: { id },
      data: {
        voteCount: {
          increment: 1,
        },
      },
    });
  }

  async decrementVoteCount(id: number): Promise<void> {
    await this.prisma.candidate.update({
      where: { id },
      data: {
        voteCount: {
          decrement: 1,
        },
      },
    });
  }

  async recalculateVoteCounts(electionId: number): Promise<void> {
    // Get all candidates for the election
    const candidates = await this.prisma.candidate.findMany({
      where: { electionId },
      select: { id: true },
    });

    // Recalculate vote counts for each candidate
    const updatePromises = candidates.map(async (candidate) => {
      const voteCount = await this.prisma.vote.count({
        where: {
          candidateId: candidate.id,
          isValid: true,
        },
      });

      return this.prisma.candidate.update({
        where: { id: candidate.id },
        data: { voteCount },
      });
    });

    await Promise.all(updatePromises);
  }

  private mapToResponseDto(candidate: any): CandidateResponseDto {
    return {
      id: candidate.id,
      name: candidate.name,
      candidateNumber: candidate.candidateNumber,
      description: candidate.description,
      imageUrl: candidate.imageUrl,
      voteCount: candidate.voteCount,
      isActive: candidate.isActive,
      position: candidate.position,
      electionId: candidate.electionId,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      electionName: candidate.election?.name,
    };
  }
}
