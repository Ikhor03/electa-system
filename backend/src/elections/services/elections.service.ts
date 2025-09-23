import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateElectionDto, UpdateElectionDto, ElectionResponseDto, PaginatedElectionsResponseDto, ElectionStatsDto } from '../dto';
import { ElectionStatus } from '@prisma/client';

@Injectable()
export class ElectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createElectionDto: CreateElectionDto): Promise<ElectionResponseDto> {
    // Validate dates
    const startDate = new Date(createElectionDto.startDate);
    const endDate = new Date(createElectionDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check if accessUrl is unique
    const existingElection = await this.prisma.election.findUnique({
      where: { accessUrl: createElectionDto.accessUrl },
    });

    if (existingElection) {
      throw new ConflictException('Election with this access URL already exists');
    }

    const election = await this.prisma.election.create({
      data: {
        ...createElectionDto,
        startDate,
        endDate,
      },
    });

    return this.mapToResponseDto(election);
  }

  async findAll(page = 1, limit = 10, status?: ElectionStatus): Promise<PaginatedElectionsResponseDto> {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};

    const [elections, total] = await Promise.all([
      this.prisma.election.findMany({
        where,
        skip,
        take: limit,
        include: {
          candidates: { where: { isActive: true } },
          votes: true,
          voterRegistrations: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.election.count({ where }),
    ]);

    const data = elections.map(election => ({
      ...this.mapToResponseDto(election),
      candidatesCount: election.candidates.length,
      votersCount: election.voterRegistrations.length,
      votesCount: election.votes.length,
    }));

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

  async findOne(id: number): Promise<ElectionResponseDto> {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        candidates: { where: { isActive: true } },
        votes: true,
        voterRegistrations: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    return {
      ...this.mapToResponseDto(election),
      candidatesCount: election.candidates.length,
      votersCount: election.voterRegistrations.length,
      votesCount: election.votes.length,
    };
  }

  async findByAccessUrl(accessUrl: string): Promise<ElectionResponseDto> {
    const election = await this.prisma.election.findUnique({
      where: { accessUrl },
      include: {
        candidates: { where: { isActive: true } },
        votes: true,
        voterRegistrations: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    return {
      ...this.mapToResponseDto(election),
      candidatesCount: election.candidates.length,
      votersCount: election.voterRegistrations.length,
      votesCount: election.votes.length,
    };
  }

  async update(id: number, updateElectionDto: UpdateElectionDto): Promise<ElectionResponseDto> {
    // Check if election exists
    await this.findOne(id);

    // Validate dates if provided
    if (updateElectionDto.startDate || updateElectionDto.endDate) {
      const currentElection = await this.prisma.election.findUnique({ where: { id } });
      const startDate = updateElectionDto.startDate ? new Date(updateElectionDto.startDate) : currentElection!.startDate;
      const endDate = updateElectionDto.endDate ? new Date(updateElectionDto.endDate) : currentElection!.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Check accessUrl uniqueness if being updated
    if (updateElectionDto.accessUrl) {
      const existingElection = await this.prisma.election.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { accessUrl: updateElectionDto.accessUrl },
          ],
        },
      });

      if (existingElection) {
        throw new ConflictException('Election with this access URL already exists');
      }
    }

    const updateData: any = { ...updateElectionDto };
    
    if (updateElectionDto.startDate) {
      updateData.startDate = new Date(updateElectionDto.startDate);
    }
    if (updateElectionDto.endDate) {
      updateData.endDate = new Date(updateElectionDto.endDate);
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: updateData,
    });

    return this.mapToResponseDto(updatedElection);
  }

  async remove(id: number): Promise<void> {
    // Check if election exists
    await this.findOne(id);
    
    // Check if election has votes (prevent deletion if votes exist)
    const voteCount = await this.prisma.vote.count({
      where: { electionId: id },
    });

    if (voteCount > 0) {
      throw new BadRequestException('Cannot delete election with existing votes');
    }

    await this.prisma.election.delete({
      where: { id },
    });
  }

  async publish(id: number): Promise<ElectionResponseDto> {
    const election = await this.findOne(id);
    
    if (election.status !== ElectionStatus.DRAFT) {
      throw new BadRequestException('Only draft elections can be published');
    }

    // Check if election has at least 2 candidates
    const candidateCount = await this.prisma.candidate.count({
      where: { electionId: id, isActive: true },
    });

    if (candidateCount < 2) {
      throw new BadRequestException('Election must have at least 2 active candidates to be published');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { status: ElectionStatus.PUBLISHED },
    });

    return this.mapToResponseDto(updatedElection);
  }

  async activate(id: number): Promise<ElectionResponseDto> {
    const election = await this.findOne(id);
    
    if (election.status !== ElectionStatus.PUBLISHED) {
      throw new BadRequestException('Only published elections can be activated');
    }

    const now = new Date();
    if (now < election.startDate) {
      throw new BadRequestException('Election cannot be activated before start date');
    }

    if (now > election.endDate) {
      throw new BadRequestException('Election cannot be activated after end date');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { status: ElectionStatus.ACTIVE },
    });

    return this.mapToResponseDto(updatedElection);
  }

  async complete(id: number): Promise<ElectionResponseDto> {
    const election = await this.findOne(id);
    
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new BadRequestException('Only active elections can be completed');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { status: ElectionStatus.COMPLETED },
    });

    return this.mapToResponseDto(updatedElection);
  }

  async archive(id: number): Promise<ElectionResponseDto> {
    const election = await this.findOne(id);
    
    if (election.status !== ElectionStatus.COMPLETED) {
      throw new BadRequestException('Only completed elections can be archived');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { status: ElectionStatus.ARCHIVED },
    });

    return this.mapToResponseDto(updatedElection);
  }

  async getStats(): Promise<ElectionStatsDto> {
    const [
      totalElections,
      activeElections,
      draftElections,
      completedElections,
      totalVotes,
      totalVoters,
    ] = await Promise.all([
      this.prisma.election.count(),
      this.prisma.election.count({ where: { status: ElectionStatus.ACTIVE } }),
      this.prisma.election.count({ where: { status: ElectionStatus.DRAFT } }),
      this.prisma.election.count({ where: { status: ElectionStatus.COMPLETED } }),
      this.prisma.vote.count(),
      this.prisma.voterRegistration.count(),
    ]);

    return {
      totalElections,
      activeElections,
      draftElections,
      completedElections,
      totalVotes,
      totalVoters,
    };
  }

  async isElectionActive(id: number): Promise<boolean> {
    const election = await this.prisma.election.findUnique({
      where: { id },
      select: { status: true, startDate: true, endDate: true },
    });

    if (!election || election.status !== ElectionStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    return now >= election.startDate && now <= election.endDate;
  }

  private mapToResponseDto(election: any): ElectionResponseDto {
    return {
      id: election.id,
      name: election.name,
      description: election.description,
      accessUrl: election.accessUrl,
      imageUrl: election.imageUrl,
      status: election.status,
      startDate: election.startDate,
      endDate: election.endDate,
      voterType: election.voterType,
      requiresAuth: election.requiresAuth,
      maxVotesPerUser: election.maxVotesPerUser,
      allowQuickCount: election.allowQuickCount,
      showResults: election.showResults,
      createdAt: election.createdAt,
      updatedAt: election.updatedAt,
    };
  }
}
