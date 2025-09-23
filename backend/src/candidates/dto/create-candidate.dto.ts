import { IsString, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '01' })
  @IsString()
  candidateNumber: string;

  @ApiProperty({ example: 'Experienced leader with vision for change', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/candidate-photo.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(999)
  position: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  electionId: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
