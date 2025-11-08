import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))'
      }}>
        <div style={{
          maxWidth: '1280px',
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
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer'
            }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          Automotive CRM, DMS & Inventory<br />Management Platform
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '2rem',
          maxWidth: '700px',
          margin: '0 auto 2rem'
        }}>
          Streamline your dealership operations with AI-powered deal optimization,
          real-time inventory management, and comprehensive customer relationship tools.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer'
            }}
          >
            Get Started
          </button>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'hsl(var(--foreground))',
              backgroundColor: 'transparent',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              cursor: 'pointer'
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        backgroundColor: 'hsl(var(--muted))',
        padding: '4rem 2rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Everything Your Dealership Needs
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                title: 'AI-Powered Deal Optimization',
                description: 'Maximize profits with ML-driven deal structuring and approval predictions'
              },
              {
                title: 'Real-Time Inventory',
                description: 'Track vehicles, manage pricing, and get competitive insights instantly'
              },
              {
                title: 'Comprehensive CRM',
                description: 'Manage leads, customers, and communications from a single platform'
              },
              {
                title: 'Finance & Compliance',
                description: 'Handle F&I products, lender submissions, and regulatory requirements'
              },
              {
                title: 'Analytics & Reporting',
                description: 'Deep insights into sales, inventory, and dealership performance'
              },
              {
                title: 'Multi-Tenant Security',
                description: 'Enterprise-grade security with role-based access control'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                backgroundColor: 'hsl(var(--card))',
                borderRadius: 'var(--radius)',
                border: '1px solid hsl(var(--border))'
              }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'hsl(var(--muted-foreground))',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Ready to Transform Your Dealership?
          </h3>
          <p style={{
            fontSize: '1.125rem',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '2rem'
          }}>
            Join modern dealerships using Autolytiq to streamline operations and boost profits.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.875rem 2.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer'
            }}
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid hsl(var(--border))',
        padding: '2rem',
        textAlign: 'center',
        color: 'hsl(var(--muted-foreground))',
        fontSize: '0.875rem'
      }}>
        <p>&copy; 2025 Autolytiq. All rights reserved.</p>
      </footer>
    </div>
  )
}
