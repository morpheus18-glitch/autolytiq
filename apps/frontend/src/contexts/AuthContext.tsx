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
      // MOCK AUTH: Accept any credentials (even blank)
      // Just create a mock user and token
      const mockUser: User = {
        id: '1',
        email: 'demo@autolytiq.com',
        username: username || 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        tenantId: storeId || 'demo',
        role: 'admin'
      }

      const mockToken = 'mock-jwt-token-' + Date.now()

      // Store token and user
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      // Set user
      setUser(mockUser)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
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
