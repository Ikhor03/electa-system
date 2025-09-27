import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError, PaginatedResponse } from '@/lib/api'
import { Candidate, CreateCandidateDto, UpdateCandidateDto, PaginationParams } from '@/types'
import { useToast } from '@/hooks/use-toast'

// Get candidates for an election
export function useCandidates(electionId: number, params: PaginationParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['candidates', electionId, params],
    queryFn: async (): Promise<PaginatedResponse<Candidate>> => {
      const searchParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
      
      const response = await api.get<PaginatedResponse<Candidate>>(
        `/candidates/election/${electionId}?${searchParams}`
      )
      return response.data
    },
    enabled: enabled && !!electionId,
  })
}

// Get public candidates (no auth required)
export function usePublicCandidates(electionId: number, params: PaginationParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['candidates', 'public', electionId, params],
    queryFn: async (): Promise<PaginatedResponse<Candidate>> => {
      const searchParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
      
      const response = await api.get<PaginatedResponse<Candidate>>(
        `/candidates/election/${electionId}/public?${searchParams}`
      )
      return response.data
    },
    enabled: enabled && !!electionId,
  })
}

// Get single candidate
export function useCandidate(id: number, enabled = true) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: async (): Promise<Candidate> => {
      const response = await api.get<Candidate>(`/candidates/${id}`)
      return response.data
    },
    enabled: enabled && !!id,
  })
}

// Create candidate mutation
export function useCreateCandidate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: CreateCandidateDto): Promise<Candidate> => {
      const response = await api.post<Candidate>('/candidates', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', data.electionId] })
      queryClient.invalidateQueries({ queryKey: ['candidates', 'public', data.electionId] })
      
      toast({
        title: 'Candidate created',
        description: `Candidate "${data.name}" has been added successfully.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to create candidate',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Update candidate mutation
export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCandidateDto }): Promise<Candidate> => {
      const response = await api.patch<Candidate>(`/candidates/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['candidates', data.id] })
      
      toast({
        title: 'Candidate updated',
        description: `Candidate "${data.name}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to update candidate',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Delete candidate mutation
export function useDeleteCandidate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/candidates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast({
        title: 'Candidate deleted',
        description: 'Candidate has been deleted successfully.',
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to delete candidate',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Reorder candidates mutation
export function useReorderCandidates() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ 
      electionId, 
      candidateIds 
    }: { 
      electionId: number; 
      candidateIds: number[] 
    }): Promise<Candidate[]> => {
      const response = await api.patch<Candidate[]>(`/candidates/reorder/${electionId}`, {
        candidateIds
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.electionId] })
      queryClient.invalidateQueries({ queryKey: ['candidates', 'public', variables.electionId] })
      
      toast({
        title: 'Candidates reordered',
        description: 'Candidate order has been updated successfully.',
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to reorder candidates',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Get candidate statistics
export function useCandidateStats(id: number, enabled = true) {
  return useQuery({
    queryKey: ['candidates', id, 'stats'],
    queryFn: async () => {
      const response = await api.get(`/candidates/${id}/stats`)
      return response.data
    },
    enabled: enabled && !!id,
  })
}
