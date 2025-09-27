'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, LoginDto, RegisterDto, AuthResponse } from '@/types'
import { api, handleApiError } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const isAuthenticated = !!user

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          await refreshUser()
        } catch (error) {
          console.error('Failed to refresh user:', error)
          logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginDto) => {
    try {
      setIsLoading(true)
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      const { user, accessToken, refreshToken } = response.data

      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      setUser(user)
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      })
    } catch (error) {
      const message = handleApiError(error)
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      })
      // Re-throw the error so the login page can handle it
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterDto) => {
    try {
      setIsLoading(true)
      const response = await api.post<AuthResponse>('/auth/register', data)
      const { user, accessToken, refreshToken } = response.data

      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      setUser(user)
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Electa, ${user.name}!`,
      })
    } catch (error) {
      const message = handleApiError(error)
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    })
  }

  const refreshUser = async () => {
    try {
      const response = await api.get<User>('/auth/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
