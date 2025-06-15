'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  profilePicture?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (profileData: ProfileData) => Promise<boolean>
  loading: boolean
  error: string | null
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth?: string
}

interface ProfileData {
  firstName: string
  lastName: string
  dateOfBirth?: string
  profilePicture?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Check if user is authenticated on app start
  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (typeof window === 'undefined') return
    
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }
  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      setError(null)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return true
      } else {
        setError(data.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error occurred')
      return false
    }
  }
  const register = async (userData: RegisterData): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      setError(null)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return true
      } else {
        setError(data.error || 'Registration failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error occurred')
      return false
    }
  }
  const logout = async (): Promise<void> => {
    if (typeof window === 'undefined') return
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null) // Clear user even if logout request fails
    }
  }
  const updateProfile = async (profileData: ProfileData): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      setError(null)
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return true
      } else {
        setError(data.error || 'Profile update failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error occurred')
      return false
    }
  }
  
  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
  }  // Prevent hydration mismatch by ensuring consistent rendering
  if (!mounted) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
