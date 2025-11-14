import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  tenantId: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (storeId: string, username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (token && storedUser) {
        try {
          // MOCK AUTH: Just restore from localStorage
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (err) {
          console.error('Auth restore failed:', err)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (storeId: string, username: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // Call the real Go backend login API
      // Backend expects "email" field (not username/tenantId)
      // Use username as email or default to demo@example.com
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username || 'demo@autolytiq.com',
          password: password || 'demo123'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }))
        throw new Error(errorData.error || `Login failed with status ${response.status}`)
      }

      const data = await response.json()

      // Extract user and token from response
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.email, // Go backend doesn't have username, use email
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        tenantId: data.user.tenantId,
        role: data.user.role
      }

      // Store token and user
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      // Set user
      setUser(user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
