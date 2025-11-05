import { Link } from 'wouter';
import { designTokens } from '@repo/tokens';
import {
  Calculator,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp,
  PiggyBank,
  Wallet,
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle,
  FolderOpen
} from 'lucide-react';

const { colors, spacing, shadows, borders, typography, animation } = designTokens;

export default function AccountingOverview() {
  const stats = [
    {
      label: 'Monthly Revenue',
      value: '$1.2M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
    },
    {
      label: 'Outstanding AR',
      value: '$45K',
      change: '-8.3%',
      trend: 'down',
      icon: Wallet,
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
    },
    {
      label: 'Gross Profit Margin',
      value: '18.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
    },
    {
      label: 'Open GL Entries',
      value: 8,
      change: 'Pending Review',
      trend: 'neutral',
      icon: FileText,
      colorBg: colors.warning[50],
      colorIcon: colors.warning[600],
    },
  ];

  const quickLinks = [
    {
      title: 'Transactions',
      description: 'View and manage transactions',
      icon: FileText,
      href: '/accounting/transactions',
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
    },
    {
      title: 'Chart of Accounts',
      description: 'Manage account structure',
      icon: FolderOpen,
      href: '/accounting/chart-of-accounts',
      colorBg: colors.primary[50],
      colorIcon: colors.primary[600],
    },
    {
      title: 'Journal Entries',
      description: 'Create and review entries',
      icon: FileText,
      href: '/accounting/journal-entries',
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
    },
    {
      title: 'Vehicle Profit',
      description: 'Track deal profitability',
      icon: DollarSign,
      href: '/accounting/vehicle-profit',
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
    },
    {
      title: 'Finance Reserves',
      description: 'Monitor F&I reserves',
      icon: PiggyBank,
      href: '/accounting/finance-reserves',
      colorBg: '#d1fae5',
      colorIcon: '#059669',
    },
    {
      title: 'P&L Statement',
      description: 'Profit and loss reports',
      icon: BarChart3,
      href: '/accounting/pl-statement',
      colorBg: '#cffafe',
      colorIcon: '#0891b2',
    },
  ];

  const pendingTasks = [
    {
      title: 'Monthly Close for December',
      dueDate: 'Due in 3 days',
      priority: 'high',
      status: 'In Progress',
    },
    {
      title: '8 Journal Entries awaiting approval',
      dueDate: 'Review by EOD',
      priority: 'medium',
      status: 'Pending',
    },
    {
      title: 'Reconcile bank statements',
      dueDate: 'Due today',
      priority: 'high',
      status: 'Not Started',
    },
    {
      title: 'Process payroll for sales team',
      dueDate: 'Due in 5 days',
      priority: 'low',
      status: 'Scheduled',
    },
  ];

  const recentActivity = [
    { time: '15 min ago', event: 'Journal entry #JE-2024-156 posted', user: 'Sarah Johnson' },
    { time: '1 hour ago', event: 'Deal #D-2024-089 finalized - $2,500 profit', user: 'System' },
    { time: '2 hours ago', event: 'Monthly close checklist updated', user: 'Mike Chen' },
    { time: '3 hours ago', event: 'Invoice #INV-2024-234 paid', user: 'Accounts Receivable' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{
            padding: spacing[2.5],
            background: 'linear-gradient(to bottom right, #14b8a6, #0d9488)',
            borderRadius: borders.radius.lg,
            boxShadow: shadows.md
          }}>
            <Calculator style={{ width: '24px', height: '24px', color: colors.neutral[0] }} />
          </div>
          <div>
            <h1 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Accounting</h1>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.neutral[600],
              margin: 0
            }}>
              Manage financials, transactions, and reporting
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing[6],
          marginBottom: spacing[8]
        }} className="md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const trendColor =
              stat.trend === 'up'
                ? colors.success[600]
                : stat.trend === 'down'
                ? colors.error[600]
                : colors.neutral[600];

            return (
              <div key={idx} style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borders.radius.xl,
                boxShadow: shadows.md,
                border: `1px solid ${colors.neutral[100]}`,
                padding: spacing[6]
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600] }}>{stat.label}</p>
                  <div style={{
                    padding: spacing[2],
                    borderRadius: borders.radius.lg,
                    backgroundColor: stat.colorBg
                  }}>
                    <Icon style={{ width: '20px', height: '20px', color: stat.colorIcon }} />
                  </div>
                </div>
                <p style={{
                  fontSize: typography.fontSize['3xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                  marginBottom: spacing[1]
                }}>{stat.value}</p>
                <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: trendColor }}>{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[8] }} className="lg:grid-cols-3">
          {/* Quick Links */}
          <div style={{ gridColumn: 'span 1' }} className="lg:col-span-2">
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Quick Access</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[4], marginBottom: spacing[8] }} className="md:grid-cols-2">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link key={idx} href={link.href}>
                    <a style={{
                      display: 'block',
                      backgroundColor: colors.neutral[0],
                      borderRadius: borders.radius.xl,
                      boxShadow: shadows.md,
                      border: `1px solid ${colors.neutral[100]}`,
                      padding: spacing[6],
                      transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
                      textDecoration: 'none'
                    }}
                    className="hover:shadow-xl hover:-translate-y-1">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
                        <div style={{
                          padding: spacing[3],
                          borderRadius: borders.radius.xl,
                          backgroundColor: link.colorBg,
                          flexShrink: 0
                        }}>
                          <Icon style={{ width: '24px', height: '24px', color: link.colorIcon }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontWeight: typography.fontWeight.bold,
                            color: colors.neutral[900],
                            marginBottom: spacing[1]
                          }}>{link.title}</h3>
                          <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600] }}>{link.description}</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Recent Activity */}
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Recent Activity</h2>
            <div style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borders.radius.xl,
              boxShadow: shadows.md,
              border: `1px solid ${colors.neutral[100]}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivity.map((activity, idx) => (
                  <div key={idx} style={{
                    padding: spacing[4],
                    borderBottom: idx < recentActivity.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                      <CheckCircle style={{
                        width: '20px',
                        height: '20px',
                        color: colors.success[500],
                        marginTop: '2px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[900] }}>{activity.event}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] }}>
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[600] }}>{activity.user}</p>
                          <span style={{ fontSize: typography.fontSize.xs, color: colors.neutral[400] }}>•</span>
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500] }}>{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div>
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Pending Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {pendingTasks.map((task, idx) => {
                const priorityColor =
                  task.priority === 'high'
                    ? { bg: colors.error[100], text: colors.error[700] }
                    : task.priority === 'medium'
                    ? { bg: colors.warning[100], text: colors.warning[700] }
                    : { bg: colors.neutral[100], text: colors.neutral[700] };

                return (
                  <div key={idx} style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borders.radius.xl,
                    boxShadow: shadows.md,
                    border: `1px solid ${colors.neutral[100]}`,
                    padding: spacing[4]
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                      {task.priority === 'high' ? (
                        <AlertCircle style={{
                          width: '20px',
                          height: '20px',
                          color: colors.error[500],
                          marginTop: '2px',
                          flexShrink: 0
                        }} />
                      ) : (
                        <Clock style={{
                          width: '20px',
                          height: '20px',
                          color: colors.neutral[400],
                          marginTop: '2px',
                          flexShrink: 0
                        }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.neutral[900],
                          marginBottom: spacing[1]
                        }}>{task.title}</h3>
                        <p style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.neutral[600],
                          marginBottom: spacing[2]
                        }}>{task.dueDate}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <span style={{
                            fontSize: typography.fontSize.xs,
                            padding: `${spacing[0.5]} ${spacing[2]}`,
                            borderRadius: borders.radius.full,
                            fontWeight: typography.fontWeight.medium,
                            backgroundColor: priorityColor.bg,
                            color: priorityColor.text
                          }}>
                            {task.priority}
                          </span>
                          <span style={{ fontSize: typography.fontSize.xs, color: colors.neutral[600] }}>{task.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/accounting/dashboard">
              <a style={{
                marginTop: spacing[6],
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: `${spacing[3]} ${spacing[4]}`,
                background: 'linear-gradient(to right, #14b8a6, #0d9488)',
                color: colors.neutral[0],
                borderRadius: borders.radius.xl,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                transition: `transform ${animation.duration.base}`,
                boxShadow: shadows.lg
              }}
              className="hover:opacity-90">
                Go to Full Dashboard
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
