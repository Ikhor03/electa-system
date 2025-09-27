import { useMutation, useQuery } from '@tanstack/react-query'
import { api, handleApiError } from '@/lib/api'
import { User, LoginDto, RegisterDto, AuthResponse, RefreshTokenDto } from '@/types'
import { useToast } from '@/hooks/use-toast'

// Login mutation
export function useLogin() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (credentials: LoginDto): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      return response.data
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Register mutation
export function useRegister() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: RegisterDto): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/register', data)
      return response.data
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

// Refresh token mutation
export function useRefreshToken() {
  return useMutation({
    mutationFn: async (data: RefreshTokenDto): Promise<{ accessToken: string }> => {
      const response = await api.post<{ accessToken: string }>('/auth/refresh', data)
      return response.data
    },
  })
}

// Get current user query
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User> => {
      const response = await api.get<User>('/auth/me')
      return response.data
    },
    enabled: !!localStorage.getItem('accessToken'),
    retry: false,
  })
}
