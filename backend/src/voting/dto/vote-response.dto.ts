import { ApiProperty } from '@nestjs/swagger';

export class VoteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'abc123def456' })
  voteHash: string;

  @ApiProperty({ example: 1, nullable: true })
  candidateId?: number | null;

  @ApiProperty({ example: 1 })
  electionId: number;

  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'John Doe', required: false })
  candidateName?: string;

  @ApiProperty({ example: '01', required: false })
  candidateNumber?: string;
}

export class VotingResultsDto {
  @ApiProperty({ example: 1 })
  electionId: number;

  @ApiProperty({ example: 'Presidential Election 2024' })
  electionName: string;

  @ApiProperty({ example: 1250 })
  totalVotes: number;

  @ApiProperty({ example: 1200 })
  validVotes: number;

  @ApiProperty({ example: 50 })
  invalidVotes: number;

  @ApiProperty({ example: 25 })
  blankVotes: number;

  @ApiProperty({
    example: [
      {
        candidateId: 1,
        candidateName: 'John Doe',
        candidateNumber: '01',
        voteCount: 450,
        percentage: 37.5,
      },
    ],
  })
  candidates: Array<{
    candidateId: number;
    candidateName: string;
    candidateNumber: string;
    voteCount: number;
    percentage: number;
  }>;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  lastUpdated: Date;
}

export class VoterVerificationDto {
  @ApiProperty({ example: true })
  isEligible: boolean;

  @ApiProperty({ example: false })
  hasVoted: boolean;

  @ApiProperty({ example: 'Anton Voter' })
  voterName: string;

  @ApiProperty({ example: 'MALE' })
  gender: string;

  @ApiProperty({ example: 'DAPIL 1', nullable: true })
  electoralDistrict?: string | null;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z', nullable: true })
  voteTimestamp?: Date | null;
}

export class VotingStatsDto {
  @ApiProperty({ example: 1250 })
  totalVotes: number;

  @ApiProperty({ example: 1200 })
  validVotes: number;

  @ApiProperty({ example: 50 })
  invalidVotes: number;

  @ApiProperty({ example: 25 })
  blankVotes: number;

  @ApiProperty({ example: 2000 })
  totalRegisteredVoters: number;

  @ApiProperty({ example: 62.5 })
  turnoutPercentage: number;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  lastVoteTime: Date;
}
