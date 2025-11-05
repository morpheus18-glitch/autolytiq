import { Link } from 'wouter';
import { designTokens } from '@repo/tokens';
import {
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Send,
  Inbox,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const { colors, spacing, shadows, borders, typography, animation } = designTokens;

export default function CommunicationsOverview() {
  const stats = [
    {
      label: 'Unread Messages',
      value: 12,
      icon: MessageCircle,
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
    },
    {
      label: 'Pending Calls',
      value: 5,
      icon: Phone,
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
    },
    {
      label: 'Emails Today',
      value: 34,
      icon: Mail,
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
    },
    {
      label: 'Response Time',
      value: '1.2h',
      icon: Clock,
      colorBg: colors.warning[50],
      colorIcon: colors.warning[600],
    },
  ];

  const communicationChannels = [
    {
      title: 'Communication Center',
      description: 'Unified inbox for all messages',
      icon: MessageSquare,
      href: '/communications/center',
      colorBg: '#cffafe',
      colorIcon: '#0891b2',
      badge: '12 new',
    },
    {
      title: 'Call Center',
      description: 'Make and manage phone calls',
      icon: Phone,
      href: '/communications/call-center',
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
      badge: '5 pending',
    },
    {
      title: 'Email Composer',
      description: 'Send emails to customers',
      icon: Mail,
      href: '/communications/email',
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
      badge: null,
    },
    {
      title: 'SMS Inbox',
      description: 'Text messaging with customers',
      icon: MessageCircle,
      href: '/communications/sms',
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
      badge: '8 new',
    },
    {
      title: 'Communication Demo',
      description: 'Interactive communication demo',
      icon: Users,
      href: '/communications/demo',
      colorBg: colors.primary[50],
      colorIcon: colors.primary[600],
      badge: null,
    },
  ];

  const recentMessages = [
    {
      customer: 'Sarah Williams',
      channel: 'SMS',
      message: 'When can I schedule a test drive?',
      time: '5 min ago',
      status: 'unread',
    },
    {
      customer: 'John Smith',
      channel: 'Email',
      message: 'Question about financing options',
      time: '15 min ago',
      status: 'unread',
    },
    {
      customer: 'Emily Davis',
      channel: 'Phone',
      message: 'Missed call - wants callback',
      time: '30 min ago',
      status: 'pending',
    },
    {
      customer: 'Michael Brown',
      channel: 'SMS',
      message: 'Thanks for the quote!',
      time: '1 hour ago',
      status: 'read',
    },
  ];

  const pendingActions = [
    {
      title: 'Follow up with 3 warm leads',
      priority: 'high',
      dueTime: 'By 5:00 PM today',
    },
    {
      title: 'Respond to 5 pending SMS messages',
      priority: 'high',
      dueTime: 'Within 30 minutes',
    },
    {
      title: 'Return missed calls',
      priority: 'medium',
      dueTime: 'By end of day',
    },
    {
      title: 'Send appointment reminders',
      priority: 'low',
      dueTime: 'Tomorrow morning',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{
            padding: spacing[2.5],
            background: 'linear-gradient(to bottom right, #06b6d4, #0891b2)',
            borderRadius: borders.radius.lg,
            boxShadow: shadows.md
          }}>
            <MessageSquare style={{ width: '24px', height: '24px', color: colors.neutral[0] }} />
          </div>
          <div>
            <h1 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Communications Center</h1>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.neutral[600],
              margin: 0
            }}>
              Manage all customer communications in one place
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
            return (
              <div key={idx} style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borders.radius.xl,
                boxShadow: shadows.md,
                border: `1px solid ${colors.neutral[100]}`,
                padding: spacing[6]
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600], marginBottom: spacing[1] }}>{stat.label}</p>
                    <p style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.neutral[900] }}>{stat.value}</p>
                  </div>
                  <div style={{
                    padding: spacing[3],
                    borderRadius: borders.radius.lg,
                    backgroundColor: stat.colorBg
                  }}>
                    <Icon style={{ width: '24px', height: '24px', color: stat.colorIcon }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[8] }} className="lg:grid-cols-3">
          {/* Communication Channels */}
          <div style={{ gridColumn: 'span 1' }} className="lg:col-span-2">
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Communication Channels</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[4], marginBottom: spacing[8] }} className="md:grid-cols-2">
              {communicationChannels.map((channel, idx) => {
                const Icon = channel.icon;
                return (
                  <Link key={idx} href={channel.href}>
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
                          backgroundColor: channel.colorBg,
                          flexShrink: 0
                        }}>
                          <Icon style={{ width: '24px', height: '24px', color: channel.colorIcon }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[2], marginBottom: spacing[1] }}>
                            <h3 style={{ fontWeight: typography.fontWeight.bold, color: colors.neutral[900] }}>{channel.title}</h3>
                            {channel.badge && (
                              <span style={{
                                fontSize: typography.fontSize.xs,
                                padding: `${spacing[0.5]} ${spacing[2]}`,
                                backgroundColor: colors.error[100],
                                color: colors.error[700],
                                borderRadius: borders.radius.full,
                                fontWeight: typography.fontWeight.medium,
                                flexShrink: 0
                              }}>
                                {channel.badge}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600] }}>{channel.description}</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Recent Messages */}
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Recent Messages</h2>
            <div style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borders.radius.xl,
              boxShadow: shadows.md,
              border: `1px solid ${colors.neutral[100]}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: spacing[4],
                      backgroundColor: msg.status === 'unread' ? colors.info[50] : colors.neutral[0],
                      borderBottom: idx < recentMessages.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none',
                      transition: `background-color ${animation.duration.fast}`
                    }}
                    className="hover:bg-gray-50"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                          <h3 style={{
                            fontWeight: typography.fontWeight.bold,
                            color: colors.neutral[900],
                            fontSize: typography.fontSize.sm
                          }}>{msg.customer}</h3>
                          <span style={{
                            fontSize: typography.fontSize.xs,
                            padding: `${spacing[0.5]} ${spacing[2]}`,
                            backgroundColor: colors.neutral[100],
                            color: colors.neutral[700],
                            borderRadius: borders.radius.md
                          }}>
                            {msg.channel}
                          </span>
                          {msg.status === 'unread' && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: colors.info[600],
                              borderRadius: borders.radius.full
                            }} />
                          )}
                        </div>
                        <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[700], marginBottom: spacing[1] }}>{msg.message}</p>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500] }}>{msg.time}</p>
                      </div>
                      <button style={{
                        padding: spacing[2],
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: borders.radius.lg,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: `background-color ${animation.duration.fast}`
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.neutral[200]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Send style={{ width: '16px', height: '16px', color: colors.neutral[600] }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: spacing[4], borderTop: `1px solid ${colors.neutral[200]}` }}>
                <Link href="/communications/center">
                  <a style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.primary[600],
                    textDecoration: 'none',
                    transition: `color ${animation.duration.fast}`
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                    View All Messages →
                  </a>
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div>
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Action Items</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], marginBottom: spacing[6] }}>
              {pendingActions.map((action, idx) => {
                const priorityColor =
                  action.priority === 'high'
                    ? { bg: colors.error[100], text: colors.error[700] }
                    : action.priority === 'medium'
                    ? { bg: colors.warning[100], text: colors.warning[700] }
                    : { bg: colors.neutral[100], text: colors.neutral[700] };

                const Icon = action.priority === 'high' ? AlertCircle : CheckCircle;
                const iconColor = action.priority === 'high' ? colors.error[500] : colors.neutral[400];

                return (
                  <div key={idx} style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borders.radius.xl,
                    boxShadow: shadows.md,
                    border: `1px solid ${colors.neutral[100]}`,
                    padding: spacing[4]
                  }}>
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
                          marginBottom: spacing[1]
                        }}>{action.title}</h3>
                        <p style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.neutral[600],
                          marginBottom: spacing[2]
                        }}>{action.dueTime}</p>
                        <span style={{
                          fontSize: typography.fontSize.xs,
                          padding: `${spacing[0.5]} ${spacing[2]}`,
                          borderRadius: borders.radius.full,
                          fontWeight: typography.fontWeight.medium,
                          backgroundColor: priorityColor.bg,
                          color: priorityColor.text
                        }}>
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(to bottom right, #06b6d4, #2563eb)',
              borderRadius: borders.radius.xl,
              padding: spacing[6],
              color: colors.neutral[0],
              boxShadow: shadows.lg
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[4] }}>
                <PhoneCall style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontWeight: typography.fontWeight.bold, marginBottom: spacing[1] }}>Quick Call</h3>
                  <p style={{ fontSize: typography.fontSize.sm, opacity: 0.9 }}>
                    Start a phone call with any customer
                  </p>
                </div>
              </div>
              <Link href="/communications/call-center">
                <a style={{
                  display: 'block',
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[0],
                  color: '#06b6d4',
                  textAlign: 'center',
                  borderRadius: borders.radius.lg,
                  fontWeight: typography.fontWeight.medium,
                  textDecoration: 'none',
                  transition: `background-color ${animation.duration.fast}`
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.neutral[0]}>
                  Open Call Center
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
