import { Link } from 'wouter';
import { designTokens } from '@repo/tokens';
import {
  FileText,
  DollarSign,
  Car,
  Wrench,
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Eye
} from 'lucide-react';

const { colors, spacing, shadows, borders, typography, animation } = designTokens;

export default function ReportsOverview() {
  const reportCategories = [
    {
      title: 'Sales Reports',
      description: 'Track sales performance, deal metrics, and revenue',
      icon: DollarSign,
      href: '/reports/sales',
      colorBg: colors.success[50],
      colorIcon: colors.success[600],
      reports: [
        'Sales Summary',
        'Deal Performance',
        'Salesperson Leaderboard',
        'Gross Profit Analysis',
      ],
    },
    {
      title: 'Inventory Reports',
      description: 'Monitor inventory turnover, aging, and pricing',
      icon: Car,
      href: '/reports/inventory',
      colorBg: colors.secondary[50],
      colorIcon: colors.secondary[600],
      reports: [
        'Inventory Summary',
        'Vehicle Aging',
        'Turnover Analysis',
        'Pricing Performance',
      ],
    },
    {
      title: 'Service Reports',
      description: 'Analyze service department performance and efficiency',
      icon: Wrench,
      href: '/reports/service',
      colorBg: colors.warning[50],
      colorIcon: colors.warning[600],
      reports: [
        'Service Revenue',
        'Technician Performance',
        'Parts Usage',
        'Customer Satisfaction',
      ],
    },
    {
      title: 'Financial Reports',
      description: 'View P&L, balance sheet, and financial metrics',
      icon: BarChart3,
      href: '/reports/financial',
      colorBg: colors.info[50],
      colorIcon: colors.info[600],
      reports: [
        'P&L Statement',
        'Balance Sheet',
        'Cash Flow',
        'Budget vs Actual',
      ],
    },
  ];

  const recentReports = [
    {
      name: 'Monthly Sales Summary',
      date: 'Dec 2024',
      type: 'Sales',
      size: '2.4 MB',
    },
    {
      name: 'Inventory Aging Report',
      date: 'Dec 15, 2024',
      type: 'Inventory',
      size: '1.8 MB',
    },
    {
      name: 'Service Performance',
      date: 'Dec 10, 2024',
      type: 'Service',
      size: '1.2 MB',
    },
    {
      name: 'Q4 Financial Summary',
      date: 'Oct-Dec 2024',
      type: 'Financial',
      size: '3.1 MB',
    },
  ];

  const quickActions = [
    { label: 'Create Custom Report', icon: FileText },
    { label: 'Schedule Report', icon: Calendar },
    { label: 'Export Data', icon: Download },
  ];

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(to bottom right, ${colors.neutral[50]}, ${colors.neutral[50]}, ${colors.info[50]})` }}>
      {/* Header */}
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
                background: `linear-gradient(to bottom right, ${colors.info[400]}, ${colors.info[600]})`,
                borderRadius: borders.radius.xl,
                boxShadow: shadows.lg
              }}>
                <FileText style={{ width: '28px', height: '28px', color: colors.neutral[0] }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: typography.fontSize['3xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900]
                }}>Reports Center</h1>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[600],
                  marginTop: spacing[1]
                }}>
                  Access and generate business intelligence reports
                </p>
              </div>
            </div>

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
                      padding: `${spacing[2]} ${spacing[4]}`,
                      backgroundColor: colors.neutral[0],
                      border: `1px solid ${colors.neutral[300]}`,
                      borderRadius: borders.radius.lg,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.neutral[700],
                      cursor: 'pointer',
                      transition: `all ${animation.duration.base} ${animation.easing.smooth}`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.neutral[50]}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.neutral[0]}
                  >
                    <Icon style={{ width: '16px', height: '16px' }} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: designTokens.layout.maxWidth['2xl'], margin: '0 auto', padding: spacing[8] }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[8] }} className="lg:grid-cols-3">
          {/* Report Categories */}
          <div style={{ gridColumn: 'span 1' }} className="lg:col-span-2">
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Report Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[6] }} className="md:grid-cols-2">
              {reportCategories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <Link key={idx} href={category.href}>
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
                            backgroundColor: category.colorBg,
                            flexShrink: 0
                          }}>
                            <Icon style={{ width: '24px', height: '24px', color: category.colorIcon }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{
                              fontWeight: typography.fontWeight.bold,
                              color: colors.neutral[900],
                              marginBottom: spacing[1]
                            }}>
                              {category.title}
                            </h3>
                            <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600] }}>{category.description}</p>
                          </div>
                        </div>
                        <div style={{ borderTop: `1px solid ${colors.neutral[200]}`, paddingTop: spacing[4] }}>
                          <p style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.neutral[700],
                            marginBottom: spacing[2]
                          }}>Available Reports:</p>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                            {category.reports.map((report, ridx) => (
                              <li key={ridx} style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.neutral[600],
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing[2]
                              }}>
                                <div style={{
                                  width: '4px',
                                  height: '4px',
                                  backgroundColor: colors.neutral[400],
                                  borderRadius: borders.radius.full
                                }} />
                                {report}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              marginBottom: spacing[4]
            }}>Recent Reports</h2>
            <div style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borders.radius.xl,
              boxShadow: shadows.md,
              border: `1px solid ${colors.neutral[100]}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentReports.map((report, idx) => (
                  <div key={idx} style={{
                    padding: spacing[4],
                    borderBottom: idx < recentReports.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none',
                    transition: `background-color ${animation.duration.fast}`
                  }}
                  className="hover:bg-gray-50">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[3] }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontWeight: typography.fontWeight.medium,
                          color: colors.neutral[900],
                          fontSize: typography.fontSize.sm,
                          marginBottom: spacing[1]
                        }}>
                          {report.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[3],
                          fontSize: typography.fontSize.xs,
                          color: colors.neutral[600]
                        }}>
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                        </div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500], marginTop: spacing[1] }}>{report.size}</p>
                      </div>
                      <div style={{ display: 'flex', gap: spacing[2], flexShrink: 0 }}>
                        <button style={{
                          padding: spacing[2],
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: borders.radius.lg,
                          cursor: 'pointer',
                          transition: `background-color ${animation.duration.fast}`
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.neutral[200]}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Eye style={{ width: '16px', height: '16px', color: colors.neutral[600] }} />
                        </button>
                        <button style={{
                          padding: spacing[2],
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: borders.radius.lg,
                          cursor: 'pointer',
                          transition: `background-color ${animation.duration.fast}`
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.neutral[200]}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Download style={{ width: '16px', height: '16px', color: colors.neutral[600] }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: spacing[4], borderTop: `1px solid ${colors.neutral[200]}` }}>
                <button style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: `color ${animation.duration.fast}`
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}>
                  View All Reports →
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              marginTop: spacing[6],
              background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
              borderRadius: borders.radius.xl,
              padding: spacing[6],
              color: colors.neutral[0],
              boxShadow: shadows.lg
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[4] }}>
                <TrendingUp style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontWeight: typography.fontWeight.bold, marginBottom: spacing[1] }}>Performance Insights</h3>
                  <p style={{ fontSize: typography.fontSize.sm, opacity: 0.9 }}>
                    Reports generated this month
                  </p>
                </div>
              </div>
              <p style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing[2] }}>127</p>
              <p style={{ fontSize: typography.fontSize.sm, opacity: 0.9 }}>
                +23% vs last month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
