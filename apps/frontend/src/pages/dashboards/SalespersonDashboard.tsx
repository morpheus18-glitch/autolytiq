import { useAuth } from '../../contexts/AuthContext'

export default function SalespersonDashboard() {
  const { user } = useAuth()

  const myStats = [
    { label: 'My Active Deals', value: '8', change: '+2 this week', color: '#FF4A1C' },
    { label: 'Hot Leads', value: '12', change: '+5 new', color: '#C87C4A' },
    { label: 'Appointments Today', value: '3', change: '2 confirmed', color: '#22c55e' },
    { label: 'Commission (MTD)', value: '$4.2K', change: '+18%', color: '#3b82f6' }
  ]

  const myDeals = [
    { customer: 'John Smith', vehicle: '2024 Honda Accord', status: 'Pending Finance', value: '$32K', probability: '85%' },
    { customer: 'Sarah Johnson', vehicle: '2023 Toyota Camry', status: 'Test Drive Scheduled', value: '$28K', probability: '60%' },
    { customer: 'Mike Wilson', vehicle: '2024 Ford F-150', status: 'Negotiating', value: '$45K', probability: '75%' }
  ]

  const upcomingAppointments = [
    { time: '10:00 AM', customer: 'Emily Chen', type: 'Test Drive', vehicle: 'Tesla Model 3' },
    { time: '2:00 PM', customer: 'David Brown', type: 'Finance Review', vehicle: 'BMW X5' },
    { time: '4:30 PM', customer: 'Lisa Garcia', type: 'Delivery', vehicle: 'Honda CR-V' }
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #FF4A1C 0%, #C87C4A 100%)',
        borderRadius: '4px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName || user?.username}!
        </h1>
        <p style={{ opacity: 0.9 }}>Let's close some deals today. You have 3 appointments scheduled.</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {myStats.map((stat, i) => (
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
        {/* My Active Deals */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            My Active Deals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myDeals.map((deal, i) => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '4px',
                borderLeft: '3px solid #FF4A1C'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{deal.customer}</div>
                  <div style={{ fontSize: '0.875rem', color: '#FF4A1C', fontWeight: '600' }}>{deal.value}</div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                  {deal.vehicle}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#C87C4A',
                    color: 'white',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {deal.status}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#22c55e' }}>
                    {deal.probability} Close Probability
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#FF4A1C',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Create New Deal
          </button>
        </div>

        {/* Today's Appointments */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Today's Appointments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingAppointments.map((apt, i) => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '4px',
                display: 'flex',
                gap: '1rem'
              }}>
                <div style={{
                  minWidth: '70px',
                  padding: '0.5rem',
                  backgroundColor: '#C87C4A',
                  color: 'white',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {apt.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{apt.customer}</div>
                  <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                    {apt.type} • {apt.vehicle}
                  </div>
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
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  )
}
