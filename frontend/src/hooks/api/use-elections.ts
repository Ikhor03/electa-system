import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError, PaginatedResponse } from '@/lib/api'
import { Election, CreateElectionDto, UpdateElectionDto, ElectionFilters, ElectionStatus } from '@/types'
import { useToast } from '@/hooks/use-toast'

// Get elections with pagination and filters
export function useElections(filters: ElectionFilters = {}) {
  return useQuery({
    queryKey: ['elections', filters],
    queryFn: async (): Promise<PaginatedResponse<Election>> => {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get<PaginatedResponse<Election>>(`/elections?${params}`)
      return response.data
    },
  })
}

// Get public elections (no auth required)
export function usePublicElections(filters: Omit<ElectionFilters, 'status'> = {}) {
  return useQuery({
    queryKey: ['elections', 'public', filters],
    queryFn: async (): Promise<PaginatedResponse<Election>> => {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get<PaginatedResponse<Election>>(`/elections/public?${params}`)
      return response.data
    },
  })
}

// Get single election
export function useElection(id: number, enabled = true) {
  return useQuery({
    queryKey: ['elections', id],
    queryFn: async (): Promise<Election> => {
      const response = await api.get<Election>(`/elections/${id}`)
      return response.data
    },
    enabled: enabled && !!id,
  })
}

// Get public election (no auth required)
export function usePublicElection(id: number, enabled = true) {
  return useQuery({
    queryKey: ['elections', 'public', id],
    queryFn: async (): Promise<Election> => {
      const response = await api.get<Election>(`/elections/${id}/public`)
      return response.data
    },
    enabled: enabled && !!id,
  })
}

// Create election mutation
export function useCreateElection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: CreateElectionDto): Promise<Election> => {
      const response = await api.post<Election>('/elections', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      toast({
        title: 'Election created',
        description: `Election "${data.title}" has been created successfully.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to create election',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Update election mutation
export function useUpdateElection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateElectionDto }): Promise<Election> => {
      const response = await api.patch<Election>(`/elections/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      queryClient.invalidateQueries({ queryKey: ['elections', data.id] })
      toast({
        title: 'Election updated',
        description: `Election "${data.title}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to update election',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Delete election mutation
export function useDeleteElection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/elections/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      toast({
        title: 'Election deleted',
        description: 'Election has been deleted successfully.',
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to delete election',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Update election status mutation
export function useUpdateElectionStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ElectionStatus }): Promise<Election> => {
      const response = await api.patch<Election>(`/elections/${id}/status`, { status })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      queryClient.invalidateQueries({ queryKey: ['elections', data.id] })
      toast({
        title: 'Election status updated',
        description: `Election status changed to ${data.status.toLowerCase()}.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to update election status',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Get election statistics
export function useElectionStats(id: number, enabled = true) {
  return useQuery({
    queryKey: ['elections', id, 'stats'],
    queryFn: async () => {
      const response = await api.get(`/elections/${id}/stats`)
      return response.data
    },
    enabled: enabled && !!id,
  })
}
