import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input, Card, Label, Alert } from '@repo/ui'

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
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            AutolytiQ
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to your account
          </p>
        </div>

        {/* Error Display */}
        {(error || authError) && (
          <Alert variant="error" className="mb-4">
            {error || authError}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeId">Store ID</Label>
            <Input
              id="storeId"
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              autoComplete="organization"
              placeholder="(optional - blank is fine)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Email</Label>
            <Input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="email"
              placeholder="demo@autolytiq.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="(optional - blank is fine)"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Demo Info */}
        <Card className="mt-6 p-4 bg-surface-subtle">
          <p className="font-semibold mb-2 text-xs text-text-secondary">Demo Mode:</p>
          <p className="text-xs text-text-tertiary">Just click "Sign in" - no credentials needed!</p>
          <p className="mt-2 italic text-xs text-text-tertiary">All fields are optional (leave blank or fill anything)</p>
        </Card>
      </Card>
    </div>
  )
}
