import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CastVoteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  electionId: number;

  @ApiProperty({ example: 1, description: 'Candidate ID (null for blank vote)' })
  @IsOptional()
  @IsInt()
  candidateId?: number;

  @ApiProperty({ example: '12345678901234567890', description: 'Voter identifier (NIK, NPM, etc.)', required: false })
  @IsOptional()
  @IsString()
  voterIdentifier?: string;
}

export class VerifyVoterDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  electionId: number;

  @ApiProperty({ example: '12345678901234567890', description: 'Voter identifier (NIK, NPM, etc.)' })
  @IsString()
  voterIdentifier: string;
}
