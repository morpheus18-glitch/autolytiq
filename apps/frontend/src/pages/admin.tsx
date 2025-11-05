import { Link } from 'wouter';
import { designTokens } from '@repo/tokens';
import {
  Building,
  Users,
  Shield,
  Settings,
  Activity,
  Lock,
  School,
  Database,
  Globe,
  MessageSquare,
  TrendingUp,
  UserCog,
  Key,
  Store,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const { colors, spacing, shadows, borders, typography, animation } = designTokens;

export default function AdminOverview() {
  const systemStats = [
    {
      label: 'System Health',
      value: '98%',
      status: 'healthy',
      icon: Activity,
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
    },
    {
      label: 'Active Users',
      value: 24,
      status: 'normal',
      icon: Users,
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
    },
    {
      label: 'Pending Approvals',
      value: 3,
      status: 'warning',
      icon: CheckCircle,
      colorBg: colors.warning[50],
      colorIcon: colors.warning[600],
    },
    {
      label: 'Security Score',
      value: '95/100',
      status: 'secure',
      icon: Shield,
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
    },
  ];

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/user-management',
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
      items: ['Users', 'Roles', 'Permissions', 'Departments'],
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/admin/system-settings',
      colorBg: colors.neutral[50],
      colorIcon: colors.neutral[600],
      items: ['General', 'Dealer Config', 'Multi-Store', 'Integrations'],
    },
    {
      title: 'Security Center',
      description: 'Manage security and compliance',
      icon: Lock,
      href: '/admin/security-center',
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
      items: ['Access Logs', 'Security Policies', 'Audit Trail', 'Encryption'],
    },
    {
      title: 'System Health',
      description: 'Monitor system performance',
      icon: Activity,
      href: '/admin/system-health',
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
      items: ['Performance', 'Database', 'API Status', 'Uptime'],
    },
    {
      title: 'Training Center',
      description: 'Training materials and onboarding',
      icon: School,
      href: '/admin/training-center',
      colorBg: colors.primary[50],
      colorIcon: colors.primary[600],
      items: ['Courses', 'Materials', 'Progress', 'Certifications'],
    },
    {
      title: 'ML Developer',
      description: 'Manage ML models and analytics',
      icon: Database,
      href: '/admin/ml-developer',
      colorBg: '#cffafe',
      colorIcon: '#0891b2',
      items: ['Models', 'Training', 'Performance', 'Comparison'],
    },
  ];

  const recentActivity = [
    {
      user: 'Sarah Johnson',
      action: 'Updated role permissions for Sales Manager',
      time: '10 min ago',
      type: 'security',
    },
    {
      user: 'Mike Chen',
      action: 'Created new user: Emily Davis',
      time: '1 hour ago',
      type: 'user',
    },
    {
      user: 'System',
      action: 'Database backup completed successfully',
      time: '2 hours ago',
      type: 'system',
    },
    {
      user: 'Admin',
      action: 'Updated dealership configuration',
      time: '3 hours ago',
      type: 'config',
    },
  ];

  const alerts = [
    {
      title: '3 users pending role assignment',
      severity: 'medium',
      action: 'Review Users',
      href: '/admin/users',
    },
    {
      title: 'System update available',
      severity: 'low',
      action: 'View Details',
      href: '/admin/system-settings',
    },
    {
      title: 'Security audit due in 5 days',
      severity: 'medium',
      action: 'Schedule',
      href: '/admin/security-center',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{
            padding: spacing[2.5],
            background: 'linear-gradient(to bottom right, #ef4444, #dc2626)',
            borderRadius: borders.radius.lg,
            boxShadow: shadows.md
          }}>
            <Building style={{ width: '24px', height: '24px', color: colors.neutral[0] }} />
          </div>
          <div>
            <h1 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Administration</h1>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.neutral[600],
              margin: 0
            }}>
              System configuration, user management, and settings
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* System Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing[6],
          marginBottom: spacing[8]
        }} className="md:grid-cols-2 lg:grid-cols-4">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
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
                  color: colors.neutral[900]
                }}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[8] }} className="lg:grid-cols-3">
          {/* Admin Sections */}
          <div style={{ gridColumn: 'span 1' }} className="lg:col-span-2">
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Administration</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[4], marginBottom: spacing[8] }} className="md:grid-cols-2">
              {adminSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Link key={idx} href={section.href}>
                    <a style={{
                      display: 'block',
                      backgroundColor: colors.neutral[0],
                      borderRadius: borders.radius.xl,
                      boxShadow: shadows.md,
                      border: `1px solid ${colors.neutral[100]}`,
                      transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
                      textDecoration: 'none'
                    }}
                    className="hover:shadow-xl hover:-translate-y-1">
                      <div style={{ padding: spacing[6] }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4], marginBottom: spacing[4] }}>
                          <div style={{
                            padding: spacing[3],
                            borderRadius: borders.radius.xl,
                            backgroundColor: section.colorBg,
                            flexShrink: 0
                          }}>
                            <Icon style={{ width: '24px', height: '24px', color: section.colorIcon }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{
                              fontWeight: typography.fontWeight.bold,
                              color: colors.neutral[900],
                              marginBottom: spacing[1]
                            }}>{section.title}</h3>
                            <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600] }}>{section.description}</p>
                          </div>
                        </div>
                        <div style={{ borderTop: `1px solid ${colors.neutral[200]}`, paddingTop: spacing[3] }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                            {section.items.map((item, iidx) => (
                              <span
                                key={iidx}
                                style={{
                                  fontSize: typography.fontSize.xs,
                                  padding: `${spacing[1]} ${spacing[2]}`,
                                  backgroundColor: colors.neutral[100],
                                  color: colors.neutral[700],
                                  borderRadius: borders.radius.md
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
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
                {recentActivity.map((activity, idx) => {
                  const typeIcons = {
                    security: Shield,
                    user: Users,
                    system: Activity,
                    config: Settings,
                  };
                  const Icon = typeIcons[activity.type] || Activity;

                  return (
                    <div key={idx} style={{
                      padding: spacing[4],
                      borderBottom: idx < recentActivity.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                        <Icon style={{
                          width: '20px',
                          height: '20px',
                          color: colors.neutral[400],
                          marginTop: '2px',
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[900] }}>{activity.action}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] }}>
                            <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[600] }}>{activity.user}</p>
                            <span style={{ fontSize: typography.fontSize.xs, color: colors.neutral[400] }}>•</span>
                            <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500] }}>{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alerts & Quick Actions */}
          <div>
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], marginBottom: spacing[6] }}>
              {alerts.map((alert, idx) => {
                const severityColors = {
                  high: { border: colors.error[200], bg: colors.error[50] },
                  medium: { border: colors.warning[200], bg: colors.warning[50] },
                  low: { border: colors.neutral[200], bg: colors.neutral[50] },
                };

                const severityIcons = {
                  high: AlertCircle,
                  medium: AlertCircle,
                  low: CheckCircle,
                };

                const severityIconColors = {
                  high: colors.error[500],
                  medium: colors.warning[500],
                  low: colors.neutral[400],
                };

                const Icon = severityIcons[alert.severity] || AlertCircle;
                const iconColor = severityIconColors[alert.severity] || colors.neutral[400];
                const bgColor = severityColors[alert.severity] || { border: colors.neutral[200], bg: colors.neutral[50] };

                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: borders.radius.xl,
                      border: `1px solid ${bgColor.border}`,
                      backgroundColor: bgColor.bg,
                      padding: spacing[4]
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                      <Icon style={{
                        width: '20px',
                        height: '20px',
                        color: iconColor,
                        marginTop: '2px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.neutral[900],
                          marginBottom: spacing[2]
                        }}>
                          {alert.title}
                        </h3>
                        <Link href={alert.href}>
                          <a style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.primary[600],
                            textDecoration: 'none',
                            transition: `color ${animation.duration.fast}`
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                          onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                            {alert.action} →
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Links */}
            <div style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borders.radius.xl,
              boxShadow: shadows.md,
              border: `1px solid ${colors.neutral[100]}`,
              padding: spacing[4]
            }}>
              <h3 style={{
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                marginBottom: spacing[3]
              }}>Quick Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                <Link href="/admin/role-presets">
                  <a style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    color: colors.primary[600],
                    textDecoration: 'none',
                    transition: `color ${animation.duration.fast}`
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                    Role Presets →
                  </a>
                </Link>
                <Link href="/admin/integration-setup">
                  <a style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    color: colors.primary[600],
                    textDecoration: 'none',
                    transition: `color ${animation.duration.fast}`
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                    Integration Setup →
                  </a>
                </Link>
                <Link href="/admin/lead-distribution">
                  <a style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    color: colors.primary[600],
                    textDecoration: 'none',
                    transition: `color ${animation.duration.fast}`
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                    Lead Distribution →
                  </a>
                </Link>
                <Link href="/admin/performance-tracking">
                  <a style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    color: colors.primary[600],
                    textDecoration: 'none',
                    transition: `color ${animation.duration.fast}`
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                    Performance Tracking →
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
