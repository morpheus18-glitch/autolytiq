import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [hoveredTile, setHoveredTile] = useState<number | null>(null)

  const tiles = [
    {
      id: 1,
      title: 'AI Deal Optimizer',
      icon: '🤖',
      description: 'ML-powered deal structuring',
      color: 'hsl(var(--accent))',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      size: 'large'
    },
    {
      id: 2,
      title: 'Inventory',
      icon: '🚗',
      description: 'Real-time vehicle tracking',
      color: 'hsl(var(--blue))',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      size: 'medium'
    },
    {
      id: 3,
      title: 'CRM',
      icon: '👥',
      description: 'Customer relationships',
      color: 'hsl(var(--purple))',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      size: 'medium'
    },
    {
      id: 4,
      title: 'Analytics',
      icon: '📊',
      description: 'Deep insights & reports',
      color: 'hsl(var(--orange))',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      size: 'small'
    },
    {
      id: 5,
      title: 'Finance',
      icon: '💰',
      description: 'F&I products',
      color: 'hsl(var(--success))',
      gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      size: 'small'
    },
    {
      id: 6,
      title: 'Communications',
      icon: '📱',
      description: 'SMS, Email & Chat',
      color: 'hsl(var(--info))',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      size: 'small'
    },
    {
      id: 7,
      title: 'Compliance',
      icon: '🔒',
      description: 'Security & RBAC',
      color: 'hsl(var(--muted-foreground))',
      gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
      size: 'small'
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, hsl(var(--accent)) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'hsla(var(--card) / 0.8)',
        borderBottom: '1px solid hsl(var(--border) / 0.3)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AutolytiQ
            </h1>
          </div>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            style={{
              padding: '0.625rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Your Dealership<br />Operating System
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: 'hsl(var(--muted-foreground))',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Everything you need to run a modern automotive dealership.<br />
            Powered by AI. Built for performance.
          </p>
        </div>

        {/* Tiles Grid - OS Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem',
          gridAutoRows: '200px'
        }}>
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onMouseEnter={() => setHoveredTile(tile.id)}
              onMouseLeave={() => setHoveredTile(null)}
              onClick={() => navigate('/login')}
              style={{
                gridColumn: tile.size === 'large' ? 'span 2' : tile.size === 'medium' ? 'span 1' : 'span 1',
                gridRow: tile.size === 'large' ? 'span 2' : 'span 1',
                background: hoveredTile === tile.id ? tile.gradient : 'hsla(var(--card) / 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: `1px solid ${hoveredTile === tile.id ? 'transparent' : 'hsl(var(--border) / 0.3)'}`,
                padding: '2rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredTile === tile.id ? 'scale(1.02)' : 'scale(1)',
                boxShadow: hoveredTile === tile.id
                  ? '0 20px 40px rgba(0, 0, 0, 0.15)'
                  : '0 4px 12px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Tile icon */}
              <div style={{
                fontSize: tile.size === 'large' ? '4rem' : '3rem',
                filter: hoveredTile === tile.id ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                transition: 'all 0.3s'
              }}>
                {tile.icon}
              </div>

              {/* Tile content */}
              <div>
                <h3 style={{
                  fontSize: tile.size === 'large' ? '1.5rem' : '1.125rem',
                  fontWeight: '700',
                  color: hoveredTile === tile.id ? '#FFFFFF' : 'hsl(var(--foreground))',
                  marginBottom: '0.5rem',
                  transition: 'color 0.3s'
                }}>
                  {tile.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: hoveredTile === tile.id ? 'rgba(255, 255, 255, 0.9)' : 'hsl(var(--muted-foreground))',
                  lineHeight: '1.5',
                  transition: 'color 0.3s'
                }}>
                  {tile.description}
                </p>
              </div>

              {/* Hover effect overlay */}
              {hoveredTile === tile.id && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {[
            { label: 'Active Dealerships', value: '500+', icon: '🏢' },
            { label: 'Deals Closed', value: '100K+', icon: '✅' },
            { label: 'Uptime SLA', value: '99.9%', icon: '⚡' },
            { label: 'Support Response', value: '<5min', icon: '💬' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'hsla(var(--card) / 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid hsl(var(--border) / 0.3)',
                padding: '1.5rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'hsl(var(--foreground))',
                marginBottom: '0.25rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'hsl(var(--muted-foreground))'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center',
          background: 'hsla(var(--card) / 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid hsl(var(--border) / 0.3)',
          padding: '3rem 2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: 'hsl(var(--foreground))'
          }}>
            Ready to Transform Your Dealership?
          </h3>
          <p style={{
            fontSize: '1.125rem',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join modern dealerships using AutolytiQ to streamline operations and boost profits.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.3s',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}
          >
            Get Started Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid hsl(var(--border) / 0.3)',
        padding: '2rem',
        textAlign: 'center',
        color: 'hsl(var(--muted-foreground))',
        fontSize: '0.875rem',
        background: 'hsla(var(--card) / 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <p>&copy; 2025 AutolytiQ. All rights reserved.</p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
          Part of the{' '}
          <a
            href="https://blackridgetools.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Blackridge Autonomy
          </a>{' '}
          ecosystem
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground) / 0.7)' }}>
          More tools from Blackridge:{' '}
          {[
            { name: 'ProposalForge', path: '/proposalforge' },
            { name: 'SiteAuditPro', path: '/siteauditpro' },
            { name: 'ShipKit', path: '/shipkit' },
            { name: 'DocParseAPI', path: '/docparseapi' }
          ].map((tool, index, arr) => (
            <span key={tool.name}>
              <a
                href={`https://blackridgetools.com${tool.path}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--primary))'
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                {tool.name}
              </a>
              {index < arr.length - 1 && <span style={{ margin: '0 0.375rem', opacity: 0.4 }}>|</span>}
            </span>
          ))}
        </p>
      </footer>
    </div>
  )
}
