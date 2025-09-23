import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ElectionStatus, VoterType } from '@prisma/client';

export class CreateElectionDto {
  @ApiProperty({ example: 'Presidential Election 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Presidential election for the year 2024', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'presidential-2024' })
  @IsString()
  accessUrl: string;

  @ApiProperty({ example: 'https://example.com/election-banner.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: ElectionStatus, example: ElectionStatus.DRAFT })
  @IsEnum(ElectionStatus)
  status: ElectionStatus;

  @ApiProperty({ example: '2024-12-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: VoterType, example: VoterType.NIK })
  @IsEnum(VoterType)
  voterType: VoterType;

  @ApiProperty({ example: true })
  @IsBoolean()
  requiresAuth: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  maxVotesPerUser: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowQuickCount: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  showResults: boolean;
}
