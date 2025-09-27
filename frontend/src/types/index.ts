// User types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VOTER = 'VOTER',
}

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface UpdateUserDto {
  email?: string
  name?: string
  role?: UserRole
  isActive?: boolean
}

// Election types
export enum ElectionStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Election {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  status: ElectionStatus
  isPublic: boolean
  allowMultipleVotes: boolean
  requireVoterRegistration: boolean
  createdBy: number
  createdAt: string
  updatedAt: string
  _count?: {
    candidates: number
    votes: number
    voterRegistrations: number
  }
}

export interface CreateElectionDto {
  title: string
  description: string
  startDate: string
  endDate: string
  isPublic: boolean
  allowMultipleVotes: boolean
  requireVoterRegistration: boolean
}

export interface UpdateElectionDto {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  isPublic?: boolean
  allowMultipleVotes?: boolean
  requireVoterRegistration?: boolean
}

// Candidate types
export interface Candidate {
  id: number
  name: string
  description?: string
  imageUrl?: string
  position: number
  electionId: number
  createdAt: string
  updatedAt: string
  election?: Election
  _count?: {
    votes: number
  }
}

export interface CreateCandidateDto {
  name: string
  description?: string
  imageUrl?: string
  electionId: number
}

export interface UpdateCandidateDto {
  name?: string
  description?: string
  imageUrl?: string
  position?: number
}

// Voting types
export interface Vote {
  id: number
  candidateId: number
  electionId: number
  voterIdentifier?: string
  isValid: boolean
  createdAt: string
  candidate?: Candidate
  election?: Election
}

export interface CastVoteDto {
  candidateId: number
  electionId: number
  voterIdentifier?: string
}

export interface VoterVerificationDto {
  voterIdentifier: string
  electionId: number
}

export interface VoterVerificationResponse {
  isEligible: boolean
  hasVoted: boolean
  voterRegistration?: {
    id: number
    voterIdentifier: string
    voterName: string
    isEligible: boolean
    hasVoted: boolean
  }
}

export interface VotingResultsResponse {
  election: Election
  totalVotes: number
  totalValidVotes: number
  totalInvalidVotes: number
  results: Array<{
    candidate: Candidate
    voteCount: number
    percentage: number
  }>
}

// Auth types
export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  email: string
  username: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query parameters
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ElectionFilters extends PaginationParams {
  status?: ElectionStatus
  isPublic?: boolean
}

export interface UserFilters extends PaginationParams {
  role?: UserRole
  isActive?: boolean
}

// Form types
export interface LoginFormData {
  username: string
  password: string
}

export interface RegisterFormData {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface ElectionFormData {
  title: string
  description: string
  startDate: string
  endDate: string
  isPublic: boolean
  allowMultipleVotes: boolean
  requireVoterRegistration: boolean
}

export interface CandidateFormData {
  name: string
  description: string
  imageUrl: string
}

// Chart data types for results visualization
export interface ChartData {
  name: string
  value: number
  percentage: number
  color?: string
}

export interface ElectionStats {
  totalElections: number
  activeElections: number
  completedElections: number
  totalVotes: number
  totalCandidates: number
  totalUsers: number
}
