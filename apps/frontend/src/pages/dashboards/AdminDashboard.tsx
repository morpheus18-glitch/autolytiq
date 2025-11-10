import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()

  const systemStats = [
    { label: 'Total Users', value: '124', change: '+8 this month', color: '#3b82f6' },
    { label: 'Active Sessions', value: '42', change: 'Peak: 68', color: '#22c55e' },
    { label: 'System Health', value: '98%', change: 'All services up', color: '#C87C4A' },
    { label: 'Storage Used', value: '234 GB', change: '68% capacity', color: '#f59e0b' }
  ]

  const recentUsers = [
    { name: 'John Smith', email: 'john@dealership.com', role: 'Salesperson', status: 'Active', lastLogin: '2 min ago' },
    { name: 'Sarah Manager', email: 'sarah@dealership.com', role: 'Sales Manager', status: 'Active', lastLogin: '15 min ago' },
    { name: 'Mike Finance', email: 'mike@dealership.com', role: 'Finance Manager', status: 'Inactive', lastLogin: '2 days ago' }
  ]

  const systemEvents = [
    { type: 'Security', message: 'Failed login attempt from IP 192.168.1.100', time: '5 min ago', severity: 'High' },
    { type: 'System', message: 'Database backup completed successfully', time: '1 hour ago', severity: 'Low' },
    { type: 'User', message: 'New user registered: Emily Chen', time: '2 hours ago', severity: 'Medium' },
    { type: 'Integration', message: 'CRM sync completed: 247 records updated', time: '3 hours ago', severity: 'Low' }
  ]

  const integrationStatus = [
    { name: 'CRM Integration', status: 'Connected', lastSync: '10 min ago', health: 'Healthy' },
    { name: 'Accounting System', status: 'Connected', lastSync: '1 hour ago', health: 'Healthy' },
    { name: 'Inventory Feed', status: 'Warning', lastSync: '4 hours ago', health: 'Delayed' },
    { name: 'Credit Bureau', status: 'Connected', lastSync: '5 min ago', health: 'Healthy' }
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: '4px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          System Administration
        </h1>
        <p style={{ opacity: 0.9 }}>
          Welcome, {user?.firstName || user?.username}. All systems operational.
        </p>
      </div>

      {/* System Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {systemStats.map((stat, i) => (
          <div key={i} style={{
            padding: '1.5rem',
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '4px',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: stat.color, fontWeight: '500' }}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Recent Users */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            User Management
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentUsers.map((u, i) => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                    {u.email} • {u.role}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
                    Last login: {u.lastLogin}
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: u.status === 'Active' ? '#22c55e' : '#6b7280',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
          <button style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Manage All Users
          </button>
        </div>

        {/* Integration Status */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Integration Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {integrationStatus.map((integration, i) => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '4px',
                borderLeft: `3px solid ${integration.health === 'Healthy' ? '#22c55e' : '#f59e0b'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600' }}>{integration.name}</div>
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem',
                    backgroundColor: integration.status === 'Connected' ? '#22c55e' : '#f59e0b',
                    color: 'white',
                    borderRadius: '4px'
                  }}>
                    {integration.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                  Last sync: {integration.lastSync}
                </div>
              </div>
            ))}
          </div>
          <button style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Configure Integrations
          </button>
        </div>
      </div>

      {/* System Events */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '4px'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          System Events & Logs
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {systemEvents.map((event, i) => (
            <div key={i} style={{
              padding: '1rem',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: event.severity === 'High' ? '#ef4444' : event.severity === 'Medium' ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {event.type}
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{event.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{event.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
