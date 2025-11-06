import { Link } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Badge
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
        icon={<FileText className="w-6 h-6" />}
        title="Reports Center"
        description="Access and generate business intelligence reports"
        actions={
          <div className="hidden lg:flex gap-2">
            {quickActions.map((action, idx) => (
              <Button key={idx} variant="outline" size="md">
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Report Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Link key={idx} href={category.href}>
                  <a className="block no-underline">
                    <Card padding="lg" hover>
                      <CardContent>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-neutral-100 flex-shrink-0">
                            <Icon className="w-6 h-6 text-neutral-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-900 mb-1">
                              {category.title}
                            </h3>
                            <p className="text-sm text-neutral-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="border-t border-neutral-200 pt-4">
                          <p className="text-xs font-medium text-neutral-700 mb-2">
                            Available Reports:
                          </p>
                          <ul className="flex flex-col gap-1">
                            {category.reports.map((report, ridx) => (
                              <li key={ridx} className="text-sm text-neutral-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-neutral-400 rounded-full" />
                                {report}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Reports</h2>
          <Card padding="none">
            <CardContent>
              <div className="flex flex-col">
                {recentReports.map((report, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 text-sm mb-1">
                          {report.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-600">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{report.size}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-neutral-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-neutral-200">
                <button className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  View All Reports →
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Performance Insights</h3>
                <p className="text-sm opacity-90">
                  Reports generated this month
                </p>
              </div>
            </div>
            <p className="text-4xl font-bold mb-2">127</p>
            <p className="text-sm opacity-90">
              +23% vs last month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
