import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState } from 'react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const stats = [
    { label: 'Active Deals', value: '23', change: '+12%', icon: '🤝', positive: true, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { label: 'Hot Leads', value: '47', change: '+8%', icon: '🔥', positive: true, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    { label: 'Inventory', value: '156', change: '-3%', icon: '🚗', positive: false, gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
    { label: 'Revenue (MTD)', value: '$847K', change: '+24%', icon: '💰', positive: true, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }
  ]

  const recentActivity = [
    { type: 'deal', message: 'New deal created for John Smith', time: '5 min ago', icon: '✅' },
    { type: 'lead', message: 'Hot lead assigned: Tesla Model 3 inquiry', time: '12 min ago', icon: '🔥' },
    { type: 'inventory', message: '2024 Honda Accord added to inventory', time: '1 hour ago', icon: '📦' },
    { type: 'deal', message: 'Deal approved: Sarah Johnson', time: '2 hours ago', icon: '🎉' }
  ]

  const quickActions = [
    { label: 'Create New Deal', icon: '➕', color: '#10B981' },
    { label: 'Add Lead', icon: '👤', color: '#F59E0B' },
    { label: 'Add Vehicle to Inventory', icon: '🚙', color: '#3B82F6' },
    { label: 'View Appointments', icon: '📅', color: '#8B5CF6' },
    { label: 'Run Sales Report', icon: '📊', color: '#EC4899' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark'
        ? 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)'
        : 'linear-gradient(180deg, #F6F8FA 0%, #EAEEF2 100%)',
      transition: 'background 0.3s'
    }}>
      {/* Header */}
      <header style={{
        background: theme === 'dark'
          ? 'rgba(22, 27, 34, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(48, 54, 61, 0.5)' : 'rgba(208, 215, 222, 0.5)'}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: theme === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              ⚡
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AutolytiQ
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: theme === 'dark'
                  ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
              fontSize: '0.875rem',
              color: theme === 'dark' ? '#8C959F' : '#57606A',
              fontWeight: '500'
            }}>
              {user?.firstName || user?.username || user?.email}
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: theme === 'dark' ? '#FFFFFF' : '#24292F',
                background: theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '2.5rem 2rem'
      }}>
        {/* Welcome Banner */}
        <div style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          background: theme === 'dark'
            ? 'rgba(22, 27, 34, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: `1px solid ${theme === 'dark' ? 'rgba(48, 54, 61, 0.5)' : 'rgba(208, 215, 222, 0.5)'}`,
          boxShadow: theme === 'dark'
            ? '0 8px 24px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: '0.75rem',
            color: theme === 'dark' ? '#FFFFFF' : '#24292F'
          }}>
            Welcome back, {user?.firstName || user?.username || 'User'}! 👋
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme === 'dark' ? '#8C959F' : '#57606A'
          }}>
            Here's what's happening at your dealership today.
          </p>
        </div>

        {/* Stats Grid - OS Style Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                padding: '2rem',
                background: hoveredCard === index
                  ? stat.gradient
                  : theme === 'dark'
                    ? 'rgba(22, 27, 34, 0.6)'
                    : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: `1px solid ${
                  hoveredCard === index
                    ? 'transparent'
                    : theme === 'dark'
                      ? 'rgba(48, 54, 61, 0.5)'
                      : 'rgba(208, 215, 222, 0.5)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredCard === index ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
                boxShadow: hoveredCard === index
                  ? '0 20px 40px rgba(0, 0, 0, 0.2)'
                  : theme === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                filter: hoveredCard === index ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                transition: 'all 0.3s'
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: hoveredCard === index
                  ? 'rgba(255, 255, 255, 0.9)'
                  : theme === 'dark' ? '#8C959F' : '#57606A',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: hoveredCard === index
                  ? '#FFFFFF'
                  : theme === 'dark' ? '#FFFFFF' : '#24292F',
                marginBottom: '0.5rem',
                transition: 'color 0.3s'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: hoveredCard === index
                  ? 'rgba(255, 255, 255, 0.95)'
                  : stat.positive ? '#22c55e' : '#ef4444',
                transition: 'color 0.3s'
              }}>
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '2rem'
        }}>
          {/* Recent Activity */}
          <div style={{
            padding: '2rem',
            background: theme === 'dark'
              ? 'rgba(22, 27, 34, 0.6)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: `1px solid ${theme === 'dark' ? 'rgba(48, 54, 61, 0.5)' : 'rgba(208, 215, 222, 0.5)'}`,
            boxShadow: theme === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.2)'
              : '0 8px 24px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: theme === 'dark' ? '#FFFFFF' : '#24292F'
            }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  borderLeft: `3px solid ${theme === 'dark' ? '#10B981' : '#059669'}`,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.25rem' }}>{activity.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: theme === 'dark' ? '#FFFFFF' : '#24292F',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>
                        {activity.message}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme === 'dark' ? '#8C959F' : '#57606A'
                      }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '2rem',
            background: theme === 'dark'
              ? 'rgba(22, 27, 34, 0.6)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: `1px solid ${theme === 'dark' ? 'rgba(48, 54, 61, 0.5)' : 'rgba(208, 215, 222, 0.5)'}`,
            boxShadow: theme === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.2)'
              : '0 8px 24px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: theme === 'dark' ? '#FFFFFF' : '#24292F'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  style={{
                    padding: '1rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? '#FFFFFF' : '#24292F',
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${action.color}20`
                    e.currentTarget.style.borderColor = action.color
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)'
                    e.currentTarget.style.borderColor = theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem 1.75rem',
          background: theme === 'dark'
            ? 'rgba(22, 27, 34, 0.4)'
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: `1px solid ${theme === 'dark' ? 'rgba(48, 54, 61, 0.5)' : 'rgba(208, 215, 222, 0.5)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div>
              <span style={{ color: theme === 'dark' ? '#8C959F' : '#57606A' }}>Role: </span>
              <span style={{ fontWeight: '700', color: theme === 'dark' ? '#FFFFFF' : '#24292F' }}>
                {user?.role || 'User'}
              </span>
            </div>
            <div>
              <span style={{ color: theme === 'dark' ? '#8C959F' : '#57606A' }}>Tenant: </span>
              <span style={{ fontWeight: '700', color: theme === 'dark' ? '#FFFFFF' : '#24292F' }}>
                {user?.tenantId || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: theme === 'dark' ? '#8C959F' : '#57606A' }}>Theme: </span>
              <span style={{ fontWeight: '700', color: theme === 'dark' ? '#FFFFFF' : '#24292F' }}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </div>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#22c55e',
            fontWeight: '600'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 8px #22c55e',
              animation: 'pulse 2s infinite'
            }}></div>
            All Systems Operational
          </div>
        </div>
      </div>
    </div>
  )
}
