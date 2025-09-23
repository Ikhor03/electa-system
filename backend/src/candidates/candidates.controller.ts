import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CandidatesService } from './services/candidates.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateResponseDto, PaginatedCandidatesResponseDto, CandidateStatsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Candidate created successfully',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Candidate number already exists in this election',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async create(@Body() createCandidateDto: CreateCandidateDto): Promise<CandidateResponseDto> {
    return this.candidatesService.create(createCandidateDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all candidates with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'electionId', required: false, example: 1 })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidates retrieved successfully',
    type: PaginatedCandidatesResponseDto,
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('electionId', new ParseIntPipe({ optional: true })) electionId?: number,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
  ): Promise<PaginatedCandidatesResponseDto> {
    return this.candidatesService.findAll(page, limit, electionId, isActive);
  }

  @Get('election/:electionId')
  @Public()
  @ApiOperation({ summary: 'Get candidates by election ID (public)' })
  @ApiQuery({ name: 'includeInactive', required: false, example: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidates retrieved successfully',
    type: [CandidateResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async findByElection(
    @Param('electionId', ParseIntPipe) electionId: number,
    @Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive = false,
  ): Promise<CandidateResponseDto[]> {
    return this.candidatesService.findByElection(electionId, includeInactive);
  }

  @Get('election/:electionId/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get candidate statistics for an election' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate statistics retrieved successfully',
    type: CandidateStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async getStatsByElection(@Param('electionId', ParseIntPipe) electionId: number): Promise<CandidateStatsDto> {
    return this.candidatesService.getStatsByElection(electionId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate retrieved successfully',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CandidateResponseDto> {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update candidate by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate updated successfully',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Candidate number already exists in this election',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ): Promise<CandidateResponseDto> {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete candidate by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Candidate deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete candidate with existing votes',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.candidatesService.remove(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Activate candidate by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate activated successfully',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<CandidateResponseDto> {
    return this.candidatesService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Deactivate candidate by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate deactivated successfully',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<CandidateResponseDto> {
    return this.candidatesService.deactivate(id);
  }

  @Patch(':id/position')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update candidate position' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate position updated successfully',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid position value',
  })
  async updatePosition(
    @Param('id', ParseIntPipe) id: number,
    @Body('position', ParseIntPipe) position: number,
  ): Promise<CandidateResponseDto> {
    return this.candidatesService.updatePosition(id, position);
  }

  @Patch('election/:electionId/reorder')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Reorder candidates in an election' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidates reordered successfully',
    type: [CandidateResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Some candidates do not belong to this election',
  })
  async reorderCandidates(
    @Param('electionId', ParseIntPipe) electionId: number,
    @Body('candidateIds') candidateIds: number[],
  ): Promise<CandidateResponseDto[]> {
    return this.candidatesService.reorderCandidates(electionId, candidateIds);
  }

  @Patch('election/:electionId/recalculate-votes')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Recalculate vote counts for all candidates in an election' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote counts recalculated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async recalculateVoteCounts(@Param('electionId', ParseIntPipe) electionId: number): Promise<void> {
    return this.candidatesService.recalculateVoteCounts(electionId);
  }
}
