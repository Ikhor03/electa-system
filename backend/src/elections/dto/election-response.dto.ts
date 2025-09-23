import { ApiProperty } from '@nestjs/swagger';
import { ElectionStatus, VoterType } from '@prisma/client';

export class ElectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Presidential Election 2024' })
  name: string;

  @ApiProperty({ example: 'Presidential election for the year 2024', nullable: true })
  description?: string | null;

  @ApiProperty({ example: 'presidential-2024' })
  accessUrl: string;

  @ApiProperty({ example: 'https://example.com/election-banner.jpg', nullable: true })
  imageUrl?: string | null;

  @ApiProperty({ enum: ElectionStatus, example: ElectionStatus.DRAFT })
  status: ElectionStatus;

  @ApiProperty({ example: '2024-12-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  endDate: Date;

  @ApiProperty({ enum: VoterType, example: VoterType.NIK })
  voterType: VoterType;

  @ApiProperty({ example: true })
  requiresAuth: boolean;

  @ApiProperty({ example: 1 })
  maxVotesPerUser: number;

  @ApiProperty({ example: false })
  allowQuickCount: boolean;

  @ApiProperty({ example: false })
  showResults: boolean;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 0 })
  candidatesCount?: number;

  @ApiProperty({ example: 0 })
  votersCount?: number;

  @ApiProperty({ example: 0 })
  votesCount?: number;
}

export class PaginatedElectionsResponseDto {
  @ApiProperty({ type: [ElectionResponseDto] })
  data: ElectionResponseDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ElectionStatsDto {
  @ApiProperty({ example: 5 })
  totalElections: number;

  @ApiProperty({ example: 2 })
  activeElections: number;

  @ApiProperty({ example: 1 })
  draftElections: number;

  @ApiProperty({ example: 1 })
  completedElections: number;

  @ApiProperty({ example: 1250 })
  totalVotes: number;

  @ApiProperty({ example: 850 })
  totalVoters: number;
}
