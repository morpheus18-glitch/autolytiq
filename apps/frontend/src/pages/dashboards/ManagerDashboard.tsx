import { useAuth } from '../../contexts/AuthContext'

export default function ManagerDashboard() {
  const { user } = useAuth()

  const teamStats = [
    { label: 'Team Deals (MTD)', value: '47', change: '+22%', color: '#FF4A1C' },
    { label: 'Total Revenue', value: '$1.2M', change: '+18%', color: '#C87C4A' },
    { label: 'Team Members', value: '8', change: '2 on leave', color: '#3b82f6' },
    { label: 'Avg Close Rate', value: '68%', change: '+5%', color: '#22c55e' }
  ]

  const teamPerformance = [
    { name: 'John Smith', deals: 12, revenue: '$284K', closeRate: '75%', status: 'Exceeding' },
    { name: 'Sarah Johnson', deals: 9, revenue: '$218K', closeRate: '68%', status: 'On Track' },
    { name: 'Mike Wilson', deals: 8, revenue: '$195K', closeRate: '62%', status: 'On Track' },
    { name: 'Emily Chen', deals: 6, revenue: '$142K', closeRate: '55%', status: 'Needs Attention' }
  ]

  const dealsNeedingAttention = [
    { customer: 'Robert Martinez', salesperson: 'Mike Wilson', stage: 'Finance Approval', daysOpen: 8, risk: 'High' },
    { customer: 'Jennifer Lee', salesperson: 'Emily Chen', stage: 'Negotiation', daysOpen: 12, risk: 'Medium' },
    { customer: 'David Kim', salesperson: 'John Smith', stage: 'Appraisal', daysOpen: 5, risk: 'Low' }
  ]

  const inventoryAlerts = [
    { message: '12 vehicles aging over 60 days', severity: 'High', action: 'Review Pricing' },
    { message: '5 hot models low in stock', severity: 'Medium', action: 'Order Inventory' },
    { message: '8 vehicles need reconditioning', severity: 'Low', action: 'Schedule Service' }
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #C87C4A 0%, #FF4A1C 100%)',
        borderRadius: '4px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Sales Manager Dashboard
        </h1>
        <p style={{ opacity: 0.9 }}>
          Welcome back, {user?.firstName || user?.username}. Your team has 3 deals pending approval.
        </p>
      </div>

      {/* Team Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {teamStats.map((stat, i) => (
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Team Performance */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Team Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {teamPerformance.map((member, i) => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{member.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                    {member.deals} deals • {member.revenue} • {member.closeRate} close rate
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: member.status === 'Exceeding' ? '#22c55e' : member.status === 'On Track' ? '#C87C4A' : '#ef4444',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Inventory Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {inventoryAlerts.map((alert, i) => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '4px',
                borderLeft: `3px solid ${alert.severity === 'High' ? '#ef4444' : alert.severity === 'Medium' ? '#f59e0b' : '#22c55e'}`
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  {alert.message}
                </div>
                <button style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#FF4A1C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deals Needing Attention */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '4px'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Deals Needing Attention
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dealsNeedingAttention.map((deal, i) => (
            <div key={i} style={{
              padding: '1rem',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{deal.customer}</div>
                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                  Salesperson: {deal.salesperson} • Stage: {deal.stage} • {deal.daysOpen} days open
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: deal.risk === 'High' ? '#ef4444' : deal.risk === 'Medium' ? '#f59e0b' : '#22c55e',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {deal.risk} Risk
                </span>
                <button style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#C87C4A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
