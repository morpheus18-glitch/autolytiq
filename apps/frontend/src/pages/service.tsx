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
  Search,
  Filter,
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
    { label: "Today's Appointments", value: 7, change: '+2 from yesterday', icon: Calendar, colorBg: colors.info[50], colorIcon: colors.info[500] },
    { label: 'In Progress', value: 3, change: '2 awaiting parts', icon: ClipboardCheck, colorBg: colors.warning[50], colorIcon: colors.warning[500] },
    { label: 'Technicians Active', value: 8, change: '2 available', icon: Users, colorBg: colors.success[50], colorIcon: colors.success[500] },
    { label: 'Avg Completion', value: '2.3h', change: '15% faster', icon: Clock, colorBg: colors.secondary[50], colorIcon: colors.secondary[500] },
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
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{
            padding: spacing[2.5],
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            borderRadius: borders.radius.lg,
            boxShadow: shadows.md
          }}>
            <Wrench style={{ width: '24px', height: '24px', color: colors.neutral[0] }} />
          </div>
          <div>
            <h1 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Service Center</h1>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.neutral[600],
              margin: 0
            }}>
              Manage appointments, orders, and technician schedules
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borders.radius.xl,
                boxShadow: shadows.md,
                border: `1px solid ${colors.neutral[200]}`,
                padding: spacing[4],
                transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
                cursor: 'pointer'
              }}
              className="hover:shadow-lg hover:-translate-y-0.5"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.neutral[600],
                    marginBottom: spacing[1]
                  }}>{stat.label}</p>
                  <p style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.neutral[900],
                    margin: 0
                  }}>{stat.value}</p>
                  <p style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.neutral[500],
                    margin: 0
                  }}>{stat.change}</p>
                </div>
                <div style={{
                  padding: spacing[3],
                  backgroundColor: stat.colorBg,
                  borderRadius: borders.radius.lg,
                  boxShadow: shadows.sm
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: stat.colorIcon }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[6] }} className="lg:grid-cols-3">
        {/* Appointments */}
        <div style={{ gridColumn: '1 / -1' }} className="lg:col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
            <h2 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Today's Appointments</h2>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: spacing[2],
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: colors.neutral[400]
              }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: spacing[8],
                  paddingRight: spacing[3],
                  paddingTop: spacing[1.5],
                  paddingBottom: spacing[1.5],
                  backgroundColor: colors.neutral[0],
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: borders.radius.md,
                  fontSize: typography.fontSize.sm
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {appointments.map((appointment) => {
              const statusBadge = getStatusBadge(appointment.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={appointment.id}
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borders.radius.lg,
                    boxShadow: shadows.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    padding: spacing[4]
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing[3] }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                        <h3 style={{
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.neutral[900],
                          fontSize: typography.fontSize.base,
                          margin: 0
                        }}>{appointment.customerName}</h3>
                        <span style={{
                          padding: `${spacing[0.5]} ${spacing[2]}`,
                          borderRadius: borders.radius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.text,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: spacing[1]
                        }}>
                          <StatusIcon style={{ width: '12px', height: '12px' }} />
                          {statusBadge.label}
                        </span>
                      </div>
                      <p style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.neutral[600],
                        margin: 0
                      }}>{appointment.vehicleInfo} • {appointment.serviceType}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing[3],
                    paddingTop: spacing[3],
                    borderTop: `1px solid ${colors.neutral[200]}`
                  }}>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Scheduled</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900], margin: 0 }}>{appointment.scheduledTime}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Technician</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900], margin: 0 }}>{appointment.technicianName}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Est. Done</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900], margin: 0 }}>{appointment.estimatedCompletion}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/service/appointments">
            <a style={{
              marginTop: spacing[4],
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              borderRadius: borders.radius.md,
              fontWeight: typography.fontWeight.medium,
              fontSize: typography.fontSize.sm,
              textDecoration: 'none',
              transition: `background-color ${animation.duration.fast}`
            }}
            className="hover:bg-blue-700">
              View All Appointments
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </a>
          </Link>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Alert */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.error[50]}, ${colors.warning[50]})`,
            border: `2px solid ${colors.error[200]}`,
            borderRadius: borders.radius.lg,
            padding: spacing[4]
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[2], marginBottom: spacing[3] }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: colors.error[600] }} />
              <div>
                <h3 style={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.error[900],
                  fontSize: typography.fontSize.sm,
                  margin: 0,
                  marginBottom: spacing[1]
                }}>Attention Required</h3>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.error[800], margin: 0 }}>
                  3 orders awaiting parts
                </p>
              </div>
            </div>
            <Link href="/service/orders">
              <a style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[1.5]} ${spacing[3]}`,
                backgroundColor: colors.error[600],
                color: colors.neutral[0],
                borderRadius: borders.radius.md,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.sm,
                textDecoration: 'none'
              }}>
                View Orders
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </a>
            </Link>
          </div>

          {/* Quick Links */}
          <div style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borders.radius.lg,
            boxShadow: shadows.sm,
            border: `1px solid ${colors.neutral[200]}`,
            padding: spacing[4]
          }}>
            <h3 style={{
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              fontSize: typography.fontSize.sm,
              margin: 0,
              marginBottom: spacing[3]
            }}>Quick Access</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
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
                      padding: spacing[2],
                      borderRadius: borders.radius.md,
                      textDecoration: 'none',
                      fontSize: typography.fontSize.sm,
                      color: colors.neutral[700],
                      transition: `background-color ${animation.duration.fast}`
                    }}
                    className="hover:bg-gray-50">
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icon style={{ width: '16px', height: '16px', color: colors.neutral[500] }} />
                        <span>{link.label}</span>
                      </div>
                      <ArrowRight style={{ width: '14px', height: '14px', color: colors.neutral[400] }} />
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
