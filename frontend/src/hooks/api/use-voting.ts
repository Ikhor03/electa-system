import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError } from '@/lib/api'
import { 
  CastVoteDto, 
  VoterVerificationDto, 
  VoterVerificationResponse, 
  VotingResultsResponse,
  Vote 
} from '@/types'
import { useToast } from '@/hooks/use-toast'

// Cast vote mutation
export function useCastVote() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: CastVoteDto): Promise<Vote> => {
      const response = await api.post<Vote>('/voting/cast', data)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['voting', 'results', data.electionId] })
      queryClient.invalidateQueries({ queryKey: ['voting', 'verification'] })
      queryClient.invalidateQueries({ queryKey: ['elections', data.electionId, 'stats'] })
      
      toast({
        title: 'Vote cast successfully',
        description: 'Your vote has been recorded securely.',
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to cast vote',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Verify voter eligibility
export function useVerifyVoter() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: VoterVerificationDto): Promise<VoterVerificationResponse> => {
      const response = await api.post<VoterVerificationResponse>('/voting/verify-voter', data)
      return response.data
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Voter verification failed',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Get voting results for an election
export function useVotingResults(electionId: number, enabled = true) {
  return useQuery({
    queryKey: ['voting', 'results', electionId],
    queryFn: async (): Promise<VotingResultsResponse> => {
      const response = await api.get<VotingResultsResponse>(`/voting/results/${electionId}`)
      return response.data
    },
    enabled: enabled && !!electionId,
  })
}

// Get public voting results (no auth required)
export function usePublicVotingResults(electionId: number, enabled = true) {
  return useQuery({
    queryKey: ['voting', 'results', 'public', electionId],
    queryFn: async (): Promise<VotingResultsResponse> => {
      const response = await api.get<VotingResultsResponse>(`/voting/results/${electionId}/public`)
      return response.data
    },
    enabled: enabled && !!electionId,
  })
}

// Get voting statistics for admin
export function useVotingStats(electionId: number, enabled = true) {
  return useQuery({
    queryKey: ['voting', 'stats', electionId],
    queryFn: async () => {
      const response = await api.get(`/voting/stats/${electionId}`)
      return response.data
    },
    enabled: enabled && !!electionId,
  })
}

// Invalidate vote (admin only)
export function useInvalidateVote() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ voteId, reason }: { voteId: number; reason: string }): Promise<Vote> => {
      const response = await api.patch<Vote>(`/voting/invalidate/${voteId}`, { reason })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voting', 'results', data.electionId] })
      queryClient.invalidateQueries({ queryKey: ['voting', 'stats', data.electionId] })
      
      toast({
        title: 'Vote invalidated',
        description: 'The vote has been marked as invalid.',
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to invalidate vote',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Get all votes for an election (admin only)
export function useElectionVotes(electionId: number, enabled = true) {
  return useQuery({
    queryKey: ['voting', 'votes', electionId],
    queryFn: async (): Promise<Vote[]> => {
      const response = await api.get<Vote[]>(`/voting/votes/${electionId}`)
      return response.data
    },
    enabled: enabled && !!electionId,
  })
}
