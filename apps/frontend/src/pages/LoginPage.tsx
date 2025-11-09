import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, error: authError } = useAuth()

  const [storeId, setStoreId] = useState('demo')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(storeId, username, password)
      // Always redirect to /dashboard - it will show the right dashboard based on role
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'hsl(var(--background))',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'hsl(var(--card))',
        borderRadius: 'var(--radius)',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
            marginBottom: '0.5rem'
          }}>
            Autolytiq
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))'
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Display */}
        {(error || authError) && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            backgroundColor: 'hsl(var(--destructive) / 0.1)',
            border: '1px solid hsl(var(--destructive) / 0.3)',
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--destructive))',
            fontSize: '0.875rem'
          }}>
            {error || authError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'hsl(var(--foreground))',
              marginBottom: '0.5rem'
            }}>
              Store ID
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
              autoComplete="organization"
              placeholder="demo or main"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--input))',
                borderRadius: 'var(--radius)',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'hsl(var(--ring))'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'hsl(var(--input))'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'hsl(var(--foreground))',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--input))',
                borderRadius: 'var(--radius)',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'hsl(var(--ring))'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'hsl(var(--input))'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'hsl(var(--foreground))',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--input))',
                borderRadius: 'var(--radius)',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'hsl(var(--ring))'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'hsl(var(--input))'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: isLoading ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'hsl(var(--muted))',
          borderRadius: 'var(--radius)',
          fontSize: '0.75rem',
          color: 'hsl(var(--muted-foreground))'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Demo Credentials:</p>
          <p>Store ID: demo</p>
          <p>Username: admin (or sales, manager)</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  )
}
