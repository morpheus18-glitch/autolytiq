import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SalespersonDashboard from './dashboards/SalespersonDashboard'
import ManagerDashboard from './dashboards/ManagerDashboard'
import AdminDashboard from './dashboards/AdminDashboard'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Determine which dashboard to show based on role
  const getDashboardComponent = () => {
    const role = user?.role?.toLowerCase() || ''

    if (role.includes('admin') || role === 'administrator') {
      return <AdminDashboard />
    }

    if (role.includes('manager') || role === 'sales_manager' || role === 'finance_manager' || role === 'gm') {
      return <ManagerDashboard />
    }

    // Default to salesperson dashboard
    return <SalespersonDashboard />
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B0C10' // Charcoal Canvas from theme
    }}>
      {/* Navigation Header */}
      <header style={{
        backgroundColor: '#171A20', // Slate Surface from theme
        borderBottom: '1px solid rgba(255, 74, 28, 0.2)', // Infrared border
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #FF4A1C 0%, #C87C4A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Autolytiq
            </h1>

            {/* Navigation */}
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/dashboard" style={{
                color: '#FF4A1C',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '0.5rem',
                borderBottom: '2px solid #FF4A1C'
              }}>
                Dashboard
              </a>
              <a href="/crm" style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                padding: '0.5rem'
              }}>
                CRM
              </a>
              <a href="/deals" style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                padding: '0.5rem'
              }}>
                Deals
              </a>
              <a href="/inventory" style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                padding: '0.5rem'
              }}>
                Inventory
              </a>
            </nav>
          </div>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#e5e7eb'
              }}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || user?.email}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#C87C4A', // Cognac accent
                fontWeight: '500'
              }}>
                {user?.role || 'User'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#FF4A1C',
                backgroundColor: 'transparent',
                border: '1px solid #FF4A1C',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF4A1C'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#FF4A1C'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      {getDashboardComponent()}
    </div>
  )
}
