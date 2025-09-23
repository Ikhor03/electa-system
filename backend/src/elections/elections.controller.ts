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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ElectionsService } from './services/elections.service';
import { CreateElectionDto, UpdateElectionDto, ElectionResponseDto, PaginatedElectionsResponseDto, ElectionStatsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, ElectionStatus } from '@prisma/client';

@ApiTags('Elections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new election' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Election created successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Election with this access URL already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date range',
  })
  async create(@Body() createElectionDto: CreateElectionDto): Promise<ElectionResponseDto> {
    return this.electionsService.create(createElectionDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all elections with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ElectionStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Elections retrieved successfully',
    type: PaginatedElectionsResponseDto,
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: ElectionStatus,
  ): Promise<PaginatedElectionsResponseDto> {
    return this.electionsService.findAll(page, limit, status);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get election statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election statistics retrieved successfully',
    type: ElectionStatsDto,
  })
  async getStats(): Promise<ElectionStatsDto> {
    return this.electionsService.getStats();
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public elections (published and active)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Public elections retrieved successfully',
    type: PaginatedElectionsResponseDto,
  })
  async findPublicElections(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ): Promise<PaginatedElectionsResponseDto> {
    return this.electionsService.findAll(page, limit, ElectionStatus.PUBLISHED);
  }

  @Get('access/:accessUrl')
  @Public()
  @ApiOperation({ summary: 'Get election by access URL (public)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election retrieved successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async findByAccessUrl(@Param('accessUrl') accessUrl: string): Promise<ElectionResponseDto> {
    return this.electionsService.findByAccessUrl(accessUrl);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get election by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election retrieved successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ElectionResponseDto> {
    return this.electionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update election by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election updated successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Election with this access URL already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date range',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateElectionDto: UpdateElectionDto,
  ): Promise<ElectionResponseDto> {
    return this.electionsService.update(id, updateElectionDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete election by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Election deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete election with existing votes',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.electionsService.remove(id);
  }

  @Patch(':id/publish')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Publish election (make it public)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election published successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Election cannot be published',
  })
  async publish(@Param('id', ParseIntPipe) id: number): Promise<ElectionResponseDto> {
    return this.electionsService.publish(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Activate election (start voting)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election activated successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Election cannot be activated',
  })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<ElectionResponseDto> {
    return this.electionsService.activate(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Complete election (end voting)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election completed successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Election cannot be completed',
  })
  async complete(@Param('id', ParseIntPipe) id: number): Promise<ElectionResponseDto> {
    return this.electionsService.complete(id);
  }

  @Patch(':id/archive')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Archive election' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Election archived successfully',
    type: ElectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Election not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Election cannot be archived',
  })
  async archive(@Param('id', ParseIntPipe) id: number): Promise<ElectionResponseDto> {
    return this.electionsService.archive(id);
  }
}
