import { ApiProperty } from '@nestjs/swagger';

export class CandidateResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '01' })
  candidateNumber: string;

  @ApiProperty({ example: 'Experienced leader with vision for change', nullable: true })
  description?: string | null;

  @ApiProperty({ example: 'https://example.com/candidate-photo.jpg', nullable: true })
  imageUrl?: string | null;

  @ApiProperty({ example: 0 })
  voteCount: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: 1 })
  electionId: number;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 'Presidential Election 2024', required: false })
  electionName?: string;
}

export class PaginatedCandidatesResponseDto {
  @ApiProperty({ type: [CandidateResponseDto] })
  data: CandidateResponseDto[];

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

export class CandidateStatsDto {
  @ApiProperty({ example: 5 })
  totalCandidates: number;

  @ApiProperty({ example: 4 })
  activeCandidates: number;

  @ApiProperty({ example: 1 })
  inactiveCandidates: number;

  @ApiProperty({ example: 1250 })
  totalVotes: number;

  @ApiProperty({ example: 'John Doe' })
  leadingCandidate: string;

  @ApiProperty({ example: 450 })
  leadingVotes: number;
}
