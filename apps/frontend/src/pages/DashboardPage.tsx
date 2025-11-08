import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const stats = [
    { label: 'Active Deals', value: '23', change: '+12%' },
    { label: 'Hot Leads', value: '47', change: '+8%' },
    { label: 'Inventory', value: '156', change: '-3%' },
    { label: 'Revenue (MTD)', value: '$847K', change: '+24%' }
  ]

  const recentActivity = [
    { type: 'deal', message: 'New deal created for John Smith', time: '5 min ago' },
    { type: 'lead', message: 'Hot lead assigned: Tesla Model 3 inquiry', time: '12 min ago' },
    { type: 'inventory', message: '2024 Honda Accord added to inventory', time: '1 hour ago' },
    { type: 'deal', message: 'Deal approved: Sarah Johnson', time: '2 hours ago' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'hsl(var(--background))'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'hsl(var(--card))',
        borderBottom: '1px solid hsl(var(--border))',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'hsl(var(--primary))'
          }}>
            Autolytiq
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{
              fontSize: '0.875rem',
              color: 'hsl(var(--muted-foreground))'
            }}>
              {user?.firstName || user?.username || user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'transparent',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Welcome Banner */}
        <div style={{
          padding: '2rem',
          marginBottom: '2rem',
          backgroundColor: 'hsl(var(--card))',
          borderRadius: 'var(--radius)',
          border: '1px solid hsl(var(--border))'
        }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {user?.firstName || user?.username || 'User'}!
          </h2>
          <p style={{
            color: 'hsl(var(--muted-foreground))'
          }}>
            Here's what's happening at your dealership today.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              backgroundColor: 'hsl(var(--card))',
              borderRadius: 'var(--radius)',
              border: '1px solid hsl(var(--border))'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: 'hsl(var(--muted-foreground))',
                marginBottom: '0.5rem'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '0.25rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: stat.change.startsWith('+') ? '#22c55e' : '#ef4444'
              }}>
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Recent Activity */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'hsl(var(--card))',
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  paddingBottom: '1rem',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid hsl(var(--border))' : 'none'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'hsl(var(--foreground))',
                    marginBottom: '0.25rem'
                  }}>
                    {activity.message}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'hsl(var(--muted-foreground))'
                  }}>
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'hsl(var(--card))',
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Create New Deal',
                'Add Lead',
                'Add Vehicle to Inventory',
                'View Appointments',
                'Run Sales Report'
              ].map((action, index) => (
                <button
                  key={index}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'hsl(var(--foreground))',
                    backgroundColor: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--muted))'
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'hsl(var(--muted))',
          borderRadius: 'var(--radius)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>Role: </span>
              <span style={{ fontWeight: '600' }}>{user?.role || 'User'}</span>
            </div>
            <div>
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>Tenant: </span>
              <span style={{ fontWeight: '600' }}>{user?.tenantId || 'N/A'}</span>
            </div>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#22c55e'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%'
            }}></div>
            All Systems Operational
          </div>
        </div>
      </div>
    </div>
  )
}
