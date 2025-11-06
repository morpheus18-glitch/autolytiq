import { Link } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Badge,
  StatCard
} from '@repo/ui';
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

export default function ReportsOverview() {
  const reportCategories = [
    {
      title: 'Sales Reports',
      description: 'Track sales performance, deal metrics, and revenue',
      icon: DollarSign,
      href: '/reports/sales',
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
    <div>
      <PageHeader
        icon={<FileText style={{ width: '1.5rem', height: '1.5rem' }} />}
        title="Reports Center"
        description="Access and generate business intelligence reports"
        actions={
          <div style={{ display: 'none' }}>
            {quickActions.map((action, idx) => (
              <Button key={idx} variant="outline" size="md">
                <action.icon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                {action.label}
              </Button>
            ))}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Report Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reportCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Link key={idx} to={category.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Card padding="lg" hover>
                      <CardContent>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', flexShrink: 0 }}>
                            <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                              {category.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem' }}>{category.description}</p>
                          </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                            Available Reports:
                          </p>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyle: 'none', padding: 0 }}>
                            {category.reports.map((report, ridx) => (
                              <li key={ridx} style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '0.25rem', height: '0.25rem', borderRadius: '9999px' }} />
                                {report}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Reports</h2>
          <Card padding="none">
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentReports.map((report, idx) => (
                  <div
                    key={idx}
                    style={{ padding: '1rem', transition: 'background-color 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {report.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{report.size}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <Button variant="ghost" size="sm">
                          <Eye style={{ width: '1rem', height: '1rem' }} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download style={{ width: '1rem', height: '1rem' }} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <Button variant="ghost" style={{ width: '100%' }}>
                  View All Reports →
                </Button>
              </div>
            </CardContent>
          </Card>

          <StatCard
            label="Reports generated this month"
            value="127"
            change="+23% vs last month"
            icon={<TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />}
            iconBg="bg-accent-primary/10"
            iconColor="text-accent-primary"
            style={{ marginTop: '1.5rem' }}
          />
        </div>
      </div>
    </div>
  );
}
