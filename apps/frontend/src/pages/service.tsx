import { useState } from 'react';
import { Link } from 'wouter';
import { designTokens } from '@repo/tokens';
import {
  Wrench,
  Calendar,
  Users,
  Package,
  FileText,
  ClipboardCheck,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

interface ServiceAppointment {
  id: string;
  customerName: string;
  vehicleInfo: string;
  scheduledTime: string;
  serviceType: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  technicianName: string;
  estimatedCompletion: string;
}

const { colors, spacing, shadows, borders, typography, animation } = designTokens;

export default function ServiceOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Demo appointments data
  const appointments: ServiceAppointment[] = [
    {
      id: 'SA-001',
      customerName: 'Sarah Williams',
      vehicleInfo: '2023 Toyota Camry',
      scheduledTime: '10:00 AM',
      serviceType: 'Oil Change & Inspection',
      status: 'in-progress',
      technicianName: 'Mike Johnson',
      estimatedCompletion: '11:30 AM'
    },
    {
      id: 'SA-002',
      customerName: 'John Smith',
      vehicleInfo: '2022 Honda Accord',
      scheduledTime: '11:00 AM',
      serviceType: 'Brake Service',
      status: 'scheduled',
      technicianName: 'James Brown',
      estimatedCompletion: '1:00 PM'
    },
    {
      id: 'SA-003',
      customerName: 'Emily Davis',
      vehicleInfo: '2021 Ford F-150',
      scheduledTime: '1:00 PM',
      serviceType: 'Tire Rotation',
      status: 'scheduled',
      technicianName: 'Mike Johnson',
      estimatedCompletion: '2:00 PM'
    },
  ];

  const stats = [
    {
      label: "Today's Appointments",
      value: 7,
      change: '+2 from yesterday',
      trend: 'up',
      icon: Calendar,
      colorBg: colors.info[50],
      colorText: colors.info[600],
      colorIcon: colors.info[500]
    },
    {
      label: 'In Progress',
      value: 3,
      change: '2 awaiting parts',
      trend: 'neutral',
      icon: ClipboardCheck,
      colorBg: colors.warning[50],
      colorText: colors.warning[700],
      colorIcon: colors.warning[500]
    },
    {
      label: 'Technicians Active',
      value: 8,
      change: '2 available',
      trend: 'up',
      icon: Users,
      colorBg: colors.success[50],
      colorText: colors.success[700],
      colorIcon: colors.success[500]
    },
    {
      label: 'Avg Completion',
      value: '2.3h',
      change: '15% faster than avg',
      trend: 'up',
      icon: Clock,
      colorBg: colors.secondary[50],
      colorText: colors.secondary[700],
      colorIcon: colors.secondary[500]
    },
  ];

  const quickActions = [
    { label: 'Schedule Appointment', icon: Calendar, bgColor: colors.primary[600], hoverBg: colors.primary[700] },
    { label: 'Create Service Order', icon: ClipboardCheck, bgColor: colors.success[600], hoverBg: colors.success[700] },
    { label: 'Check Parts', icon: Package, bgColor: colors.secondary[600], hoverBg: colors.secondary[700] },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { bg: colors.info[100], text: colors.info[700], icon: Clock, label: 'Scheduled' },
      'in-progress': { bg: colors.warning[100], text: colors.warning[700], icon: Activity, label: 'In Progress' },
      'completed': { bg: colors.success[100], text: colors.success[700], icon: CheckCircle2, label: 'Completed' },
      'cancelled': { bg: colors.error[100], text: colors.error[700], icon: XCircle, label: 'Cancelled' },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(to bottom right, ${colors.neutral[50]}, ${colors.neutral[50]}, ${colors.info[50]})` }}>
      {/* Enhanced Header */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderBottom: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm
      }}>
        <div style={{ maxWidth: designTokens.layout.maxWidth['2xl'], margin: '0 auto', padding: `${spacing[6]} ${spacing[8]}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <div style={{
                padding: spacing[3],
                background: 'linear-gradient(to bottom right, #f59e0b, #ea580c)',
                borderRadius: borders.radius.xl,
                boxShadow: shadows.lg
              }}>
                <Wrench style={{ width: '28px', height: '28px', color: colors.neutral[0] }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: typography.fontSize['3xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900]
                }}>Service Center</h1>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[600],
                  marginTop: spacing[1]
                }}>
                  Manage appointments, orders, and technician schedules
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: spacing[3] }} className="hidden lg:flex">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      padding: `${spacing[2.5]} ${spacing[4]}`,
                      backgroundColor: action.bgColor,
                      color: colors.neutral[0],
                      borderRadius: borders.radius.lg,
                      fontWeight: typography.fontWeight.medium,
                      boxShadow: shadows.md,
                      border: 'none',
                      cursor: 'pointer',
                      transition: `all ${animation.duration.base} ${animation.easing.smooth}`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = action.hoverBg}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = action.bgColor}
                  >
                    <Icon style={{ width: '16px', height: '16px' }} />
                    <span className="hidden xl:inline">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: designTokens.layout.maxWidth['2xl'], margin: '0 auto', padding: spacing[8] }}>
        {/* Enhanced Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[6], marginBottom: spacing[8] }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borders.radius['2xl'],
                  boxShadow: shadows.md,
                  border: `1px solid ${colors.neutral[100]}`,
                  padding: spacing[6],
                  transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
                  cursor: 'pointer'
                }}
                className="group hover:shadow-xl hover:-translate-y-1"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.neutral[600],
                      marginBottom: spacing[1]
                    }}>{stat.label}</p>
                    <p style={{
                      fontSize: typography.fontSize['3xl'],
                      fontWeight: typography.fontWeight.bold,
                      color: colors.neutral[900],
                      marginBottom: spacing[1]
                    }}>{stat.value}</p>
                    <p style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.neutral[500]
                    }}>{stat.change}</p>
                  </div>
                  <div style={{
                    padding: spacing[4],
                    backgroundColor: stat.colorBg,
                    borderRadius: borders.radius.xl,
                    boxShadow: shadows.lg,
                    transition: `transform ${animation.duration.base} ${animation.easing.spring}`
                  }}
                  className="group-hover:scale-110">
                    <Icon style={{ width: '24px', height: '24px', color: stat.colorIcon }} />
                  </div>
                </div>
                <div style={{
                  height: '4px',
                  backgroundColor: colors.neutral[100],
                  borderRadius: borders.radius.full,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: stat.colorIcon,
                    borderRadius: borders.radius.full,
                    width: '75%'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing[8] }} className="lg:grid-cols-3">
          {/* Today's Appointments */}
          <div style={{ gridColumn: 'span 2' }} className="lg:col-span-2">
            {/* Search and Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[6] }}>
              <h2 style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900]
              }}>Today's Appointments</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{
                    position: 'absolute',
                    left: spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    color: colors.neutral[400]
                  }} />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: spacing[10],
                      paddingRight: spacing[4],
                      paddingTop: spacing[2],
                      paddingBottom: spacing[2],
                      backgroundColor: colors.neutral[0],
                      border: `1px solid ${colors.neutral[300]}`,
                      borderRadius: borders.radius.lg,
                      fontSize: typography.fontSize.sm,
                      transition: `all ${animation.duration.fast} ${animation.easing.smooth}`
                    }}
                    onFocus={(e) => e.currentTarget.style.boxShadow = shadows.glow}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>
                <button style={{
                  padding: spacing[2],
                  backgroundColor: colors.neutral[0],
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: borders.radius.lg,
                  cursor: 'pointer',
                  transition: `background-color ${animation.duration.fast}`
                }}>
                  <Filter style={{ width: '16px', height: '16px', color: colors.neutral[600] }} />
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {appointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={appointment.id}
                    style={{
                      backgroundColor: colors.neutral[0],
                      borderRadius: borders.radius.xl,
                      boxShadow: shadows.md,
                      border: `1px solid ${colors.neutral[100]}`,
                      padding: spacing[6],
                      transition: `all ${animation.duration.base} ${animation.easing.smooth}`
                    }}
                    className="group hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing[4] }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4], flex: 1 }}>
                        <div style={{
                          padding: spacing[3],
                          background: `linear-gradient(to bottom right, ${colors.info[50]}, ${colors.info[100]})`,
                          borderRadius: borders.radius.lg
                        }}>
                          <Wrench style={{ width: '20px', height: '20px', color: colors.info[600] }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
                            <h3 style={{
                              fontWeight: typography.fontWeight.bold,
                              color: colors.neutral[900],
                              fontSize: typography.fontSize.lg
                            }}>{appointment.customerName}</h3>
                            <span style={{
                              padding: `${spacing[1]} ${spacing[3]}`,
                              borderRadius: borders.radius.full,
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.text,
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing[1.5]
                            }}>
                              <StatusIcon style={{ width: '14px', height: '14px' }} />
                              {statusBadge.label}
                            </span>
                          </div>
                          <p style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.neutral[600],
                            marginBottom: spacing[1]
                          }}>{appointment.vehicleInfo}</p>
                          <p style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.neutral[900]
                          }}>{appointment.serviceType}</p>
                        </div>
                      </div>
                      <button style={{
                        padding: spacing[2],
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: borders.radius.lg,
                        cursor: 'pointer',
                        opacity: 0,
                        transition: `all ${animation.duration.fast}`
                      }}
                      className="group-hover:opacity-100 hover:bg-gray-100">
                        <MoreVertical style={{ width: '20px', height: '20px', color: colors.neutral[600] }} />
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: spacing[4],
                      paddingTop: spacing[4],
                      borderTop: `1px solid ${colors.neutral[100]}`
                    }}>
                      <div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], marginBottom: spacing[1] }}>Scheduled</p>
                        <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900] }}>{appointment.scheduledTime}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], marginBottom: spacing[1] }}>Technician</p>
                        <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900] }}>{appointment.technicianName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], marginBottom: spacing[1] }}>Est. Completion</p>
                        <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900] }}>{appointment.estimatedCompletion}</p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: spacing[2],
                      marginTop: spacing[4],
                      paddingTop: spacing[4],
                      borderTop: `1px solid ${colors.neutral[100]}`
                    }}>
                      <button style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing[2],
                        padding: `${spacing[2]} ${spacing[4]}`,
                        backgroundColor: colors.primary[600],
                        color: colors.neutral[0],
                        borderRadius: borders.radius.lg,
                        fontWeight: typography.fontWeight.medium,
                        border: 'none',
                        cursor: 'pointer',
                        transition: `background-color ${animation.duration.fast}`
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primary[700]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}>
                        <Eye style={{ width: '16px', height: '16px' }} />
                        View Details
                      </button>
                      <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing[2],
                        padding: `${spacing[2]} ${spacing[4]}`,
                        backgroundColor: colors.neutral[100],
                        color: colors.neutral[700],
                        borderRadius: borders.radius.lg,
                        fontWeight: typography.fontWeight.medium,
                        border: 'none',
                        cursor: 'pointer',
                        transition: `background-color ${animation.duration.fast}`
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.neutral[200]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.neutral[100]}>
                        <Edit style={{ width: '16px', height: '16px' }} />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/service/appointments">
              <a style={{
                marginTop: spacing[6],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                width: '100%',
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.neutral[0],
                border: `2px solid ${colors.neutral[300]}`,
                color: colors.neutral[700],
                borderRadius: borders.radius.xl,
                fontWeight: typography.fontWeight.semibold,
                textDecoration: 'none',
                transition: `all ${animation.duration.fast}`
              }}
              className="hover:bg-gray-50 hover:border-gray-400">
                View All Appointments
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </a>
            </Link>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
            {/* Priority Alerts */}
            <div style={{
              background: `linear-gradient(to bottom right, ${colors.error[50]}, ${colors.warning[50]})`,
              border: `2px solid ${colors.error[200]}`,
              borderRadius: borders.radius.xl,
              padding: spacing[6],
              boxShadow: shadows.md
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[4] }}>
                <div style={{
                  padding: spacing[2],
                  backgroundColor: colors.error[100],
                  borderRadius: borders.radius.lg
                }}>
                  <AlertTriangle style={{ width: '20px', height: '20px', color: colors.error[600] }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: typography.fontWeight.bold,
                    color: colors.error[900],
                    marginBottom: spacing[1]
                  }}>Attention Required</h3>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.error[800] }}>
                    3 service orders awaiting parts delivery
                  </p>
                </div>
              </div>
              <Link href="/service/orders">
                <a style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.error[600],
                  color: colors.neutral[0],
                  borderRadius: borders.radius.lg,
                  fontWeight: typography.fontWeight.medium,
                  textDecoration: 'none',
                  transition: `background-color ${animation.duration.fast}`
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.error[700]}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.error[600]}>
                  View Orders
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </a>
              </Link>
            </div>

            {/* Quick Links Card */}
            <div style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borders.radius.xl,
              boxShadow: shadows.md,
              border: `1px solid ${colors.neutral[100]}`,
              padding: spacing[6]
            }}>
              <h3 style={{
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                marginBottom: spacing[4]
              }}>Quick Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {[
                  { label: 'Service History', href: '/service/history', icon: FileText },
                  { label: 'Parts Inventory', href: '/service/parts', icon: Package },
                  { label: 'Technician Schedule', href: '/service/schedule', icon: Users },
                  { label: 'Service Reports', href: '/service/reports', icon: TrendingUp },
                ].map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <Link key={idx} href={link.href}>
                      <a style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: spacing[3],
                        borderRadius: borders.radius.lg,
                        textDecoration: 'none',
                        transition: `background-color ${animation.duration.fast}`
                      }}
                      className="group hover:bg-gray-50">
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                          <Icon style={{
                            width: '16px',
                            height: '16px',
                            color: colors.neutral[600],
                            transition: `color ${animation.duration.fast}`
                          }}
                          className="group-hover:text-blue-600" />
                          <span style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.neutral[700],
                            transition: `color ${animation.duration.fast}`
                          }}
                          className="group-hover:text-gray-900">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight style={{
                          width: '16px',
                          height: '16px',
                          color: colors.neutral[400],
                          transition: `color ${animation.duration.fast}`
                        }}
                        className="group-hover:text-blue-600" />
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Performance Card */}
            <div style={{
              background: 'linear-gradient(to bottom right, #22c55e, #10b981)',
              borderRadius: borders.radius.xl,
              padding: spacing[6],
              color: colors.neutral[0],
              boxShadow: shadows.lg
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[4] }}>
                <TrendingUp style={{ width: '24px', height: '24px' }} />
                <div>
                  <h3 style={{ fontWeight: typography.fontWeight.bold, marginBottom: spacing[1] }}>Today's Performance</h3>
                  <p style={{ fontSize: typography.fontSize.sm, opacity: 0.9 }}>
                    Revenue: $3,450
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.sm }}>
                  <span style={{ opacity: 0.9 }}>Completed</span>
                  <span style={{ fontWeight: typography.fontWeight.bold }}>4 orders</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.sm }}>
                  <span style={{ opacity: 0.9 }}>Avg Ticket</span>
                  <span style={{ fontWeight: typography.fontWeight.bold }}>$862</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
