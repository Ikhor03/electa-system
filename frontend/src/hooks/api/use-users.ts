import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError, PaginatedResponse } from '@/lib/api'
import { User, CreateUserDto, UpdateUserDto, UserFilters } from '@/types'
import { useToast } from '@/hooks/use-toast'

// Get users with pagination and filters
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get<PaginatedResponse<User>>(`/users?${params}`)
      return response.data
    },
  })
}

// Get single user
export function useUser(id: number, enabled = true) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async (): Promise<User> => {
      const response = await api.get<User>(`/users/${id}`)
      return response.data
    },
    enabled: enabled && !!id,
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: CreateUserDto): Promise<User> => {
      const response = await api.post<User>('/users', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'User created',
        description: `User "${data.name}" has been created successfully.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to create user',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserDto }): Promise<User> => {
      const response = await api.patch<User>(`/users/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.id] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      
      toast({
        title: 'User updated',
        description: `User "${data.name}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to update user',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully.',
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to delete user',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Activate user mutation
export function useActivateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: number): Promise<User> => {
      const response = await api.patch<User>(`/users/${id}/activate`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.id] })
      
      toast({
        title: 'User activated',
        description: `User "${data.name}" has been activated.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to activate user',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Deactivate user mutation
export function useDeactivateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: number): Promise<User> => {
      const response = await api.patch<User>(`/users/${id}/deactivate`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.id] })
      
      toast({
        title: 'User deactivated',
        description: `User "${data.name}" has been deactivated.`,
      })
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Failed to deactivate user',
        description: message,
        variant: 'destructive',
      })
    },
  })
}
