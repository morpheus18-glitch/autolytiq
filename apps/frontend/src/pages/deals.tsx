import { useState } from 'react';
import { Link } from 'wouter';
import { designTokens } from '@repo/tokens';
import {
  Handshake,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Car,
  FileText,
  Calculator,
  Target,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

interface Deal {
  id: string;
  customerName: string;
  vehicleInfo: string;
  dealType: 'new' | 'used' | 'lease';
  status: 'in-progress' | 'pending-approval' | 'closed' | 'lost';
  potentialProfit: number;
  salesPerson: string;
  createdDate: string;
}

const { colors, spacing, shadows, borders, typography, animation } = designTokens;

export default function Deals() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      label: 'Active Deals',
      value: 18,
      change: '+5 this week',
      icon: Handshake,
      colorBg: colors.primary[50],
      colorIcon: colors.primary[600],
    },
    {
      label: 'Pending Approval',
      value: 7,
      change: '3 require attention',
      icon: Clock,
      colorBg: colors.warning[50],
      colorIcon: colors.warning[600],
    },
    {
      label: 'Closed This Month',
      value: 42,
      change: '+12% vs last month',
      icon: CheckCircle,
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
    },
    {
      label: 'Avg Deal Profit',
      value: '$3,250',
      change: '+8.5% increase',
      icon: DollarSign,
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
    },
  ];

  const deals: Deal[] = [
    {
      id: 'D-001',
      customerName: 'Robert Martinez',
      vehicleInfo: '2024 Toyota Camry XLE',
      dealType: 'new',
      status: 'in-progress',
      potentialProfit: 3500,
      salesPerson: 'Sarah Johnson',
      createdDate: '2 hours ago',
    },
    {
      id: 'D-002',
      customerName: 'Lisa Anderson',
      vehicleInfo: '2022 Honda Accord Sport',
      dealType: 'used',
      status: 'pending-approval',
      potentialProfit: 2800,
      salesPerson: 'Mike Chen',
      createdDate: '5 hours ago',
    },
    {
      id: 'D-003',
      customerName: 'James Wilson',
      vehicleInfo: '2024 Ford F-150 Lariat',
      dealType: 'new',
      status: 'in-progress',
      potentialProfit: 4200,
      salesPerson: 'Emily Davis',
      createdDate: '1 day ago',
    },
  ];

  const quickActions = [
    {
      title: 'New Deal',
      description: 'Start a new deal worksheet',
      icon: Handshake,
      href: '/deals/new',
      colorBg: colors.primary[50],
      colorIcon: colors.primary[600],
    },
    {
      title: 'Deal Pipeline',
      description: 'View deal funnel and stages',
      icon: TrendingUp,
      href: '/crm/pipeline',
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
    },
    {
      title: 'Desking Tool',
      description: 'AI-powered deal structuring',
      icon: Calculator,
      href: '/deals/desk',
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
    },
    {
      title: 'F&I Products',
      description: 'Manage finance & insurance',
      icon: FileText,
      href: '/deals/fi-products',
      colorBg: colors.warning[50],
      colorIcon: colors.warning[600],
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in-progress': { bg: colors.info[100], text: colors.info[700], icon: Clock, label: 'In Progress' },
      'pending-approval': { bg: colors.warning[100], text: colors.warning[700], icon: AlertTriangle, label: 'Pending Approval' },
      'closed': { bg: colors.success[100], text: colors.success[700], icon: CheckCircle, label: 'Closed' },
      'lost': { bg: colors.error[100], text: colors.error[700], icon: XCircle, label: 'Lost' },
    };
    return statusConfig[status] || statusConfig['in-progress'];
  };

  const getDealTypeBadge = (type: string) => {
    const typeConfig = {
      'new': { bg: colors.success[50], text: colors.success[700], label: 'New' },
      'used': { bg: colors.info[50], text: colors.info[700], label: 'Used' },
      'lease': { bg: colors.secondary[50], text: colors.secondary[700], label: 'Lease' },
    };
    return typeConfig[type] || typeConfig['new'];
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{
            padding: spacing[2.5],
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: borders.radius.lg,
            boxShadow: shadows.md
          }}>
            <Handshake style={{ width: '24px', height: '24px', color: colors.neutral[0] }} />
          </div>
          <div>
            <h1 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Deals Management</h1>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.neutral[600],
              margin: 0
            }}>
              Track and manage all sales deals in one place
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
        {/* Active Deals */}
        <div style={{ gridColumn: '1 / -1' }} className="lg:col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
            <h2 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              margin: 0
            }}>Active Deals</h2>
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
                placeholder="Search deals..."
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
            {deals.map((deal) => {
              const statusBadge = getStatusBadge(deal.status);
              const typeBadge = getDealTypeBadge(deal.dealType);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={deal.id}
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
                        }}>{deal.customerName}</h3>
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
                        <span style={{
                          padding: `${spacing[0.5]} ${spacing[2]}`,
                          borderRadius: borders.radius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          backgroundColor: typeBadge.bg,
                          color: typeBadge.text
                        }}>
                          {typeBadge.label}
                        </span>
                      </div>
                      <p style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.neutral[600],
                        margin: 0
                      }}>{deal.vehicleInfo}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: spacing[3],
                    paddingTop: spacing[3],
                    borderTop: `1px solid ${colors.neutral[200]}`
                  }}>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Deal ID</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900], margin: 0 }}>{deal.id}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Sales Person</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900], margin: 0 }}>{deal.salesPerson}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Potential Profit</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.success[600], margin: 0 }}>${deal.potentialProfit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], margin: 0 }}>Created</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.neutral[900], margin: 0 }}>{deal.createdDate}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[3] }}>
                    <Link href={`/deals/${deal.id}`}>
                      <a style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: `${spacing[2]} ${spacing[3]}`,
                        backgroundColor: colors.primary[600],
                        color: colors.neutral[0],
                        borderRadius: borders.radius.md,
                        fontWeight: typography.fontWeight.medium,
                        fontSize: typography.fontSize.sm,
                        textDecoration: 'none',
                        transition: `background-color ${animation.duration.fast}`
                      }}
                      className="hover:bg-blue-700">
                        View Details
                      </a>
                    </Link>
                    <Link href={`/deals/desk?dealId=${deal.id}`}>
                      <a style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: `${spacing[2]} ${spacing[3]}`,
                        backgroundColor: colors.neutral[0],
                        color: colors.primary[600],
                        border: `1px solid ${colors.primary[600]}`,
                        borderRadius: borders.radius.md,
                        fontWeight: typography.fontWeight.medium,
                        fontSize: typography.fontSize.sm,
                        textDecoration: 'none',
                        transition: `all ${animation.duration.fast}`
                      }}
                      className="hover:bg-blue-50">
                        Open in Desking
                      </a>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/deals/all">
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
              View All Deals
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </a>
          </Link>
        </div>

        {/* Quick Actions Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          <h2 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
            margin: 0,
            marginBottom: spacing[2]
          }}>Quick Actions</h2>

          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} href={action.href}>
                <a style={{
                  display: 'block',
                  backgroundColor: colors.neutral[0],
                  borderRadius: borders.radius.lg,
                  boxShadow: shadows.sm,
                  border: `1px solid ${colors.neutral[200]}`,
                  padding: spacing[4],
                  textDecoration: 'none',
                  transition: `all ${animation.duration.base} ${animation.easing.smooth}`
                }}
                className="hover:shadow-lg hover:-translate-y-0.5">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                    <div style={{
                      padding: spacing[2.5],
                      borderRadius: borders.radius.lg,
                      backgroundColor: action.colorBg,
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: action.colorIcon }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontWeight: typography.fontWeight.bold,
                        color: colors.neutral[900],
                        fontSize: typography.fontSize.sm,
                        marginBottom: spacing[1]
                      }}>{action.title}</h3>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[600], margin: 0 }}>{action.description}</p>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}

          {/* Performance Insight */}
          <div style={{
            marginTop: spacing[4],
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: borders.radius.lg,
            padding: spacing[4],
            color: colors.neutral[0],
            boxShadow: shadows.lg
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[2], marginBottom: spacing[3] }}>
              <Target style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontWeight: typography.fontWeight.bold, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>Monthly Goal</h3>
                <p style={{ fontSize: typography.fontSize.xs, opacity: 0.9, margin: 0 }}>
                  You're 84% to your monthly target
                </p>
              </div>
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: borders.radius.full,
              height: '8px',
              marginBottom: spacing[2]
            }}>
              <div style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borders.radius.full,
                height: '100%',
                width: '84%'
              }} />
            </div>
            <p style={{ fontSize: typography.fontSize.xs, opacity: 0.9, margin: 0 }}>
              8 more deals to hit your goal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
