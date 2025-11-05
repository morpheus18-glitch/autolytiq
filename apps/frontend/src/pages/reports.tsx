import { Link } from 'wouter';
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
      color: 'text-green-600',
      bg: 'bg-green-50',
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
      color: 'text-purple-600',
      bg: 'bg-purple-50',
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
      color: 'text-amber-600',
      bg: 'bg-amber-50',
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
      color: 'text-blue-600',
      bg: 'bg-blue-50',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Access and generate business intelligence reports
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCategories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <Link key={idx} href={category.href}>
                    <a className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${category.bg} shrink-0`}>
                            <Icon className={`w-6 h-6 ${category.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {category.title}
                            </h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Available Reports:</p>
                          <ul className="space-y-1">
                            {category.reports.map((report, ridx) => (
                              <li key={ridx} className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {recentReports.map((report, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {report.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{report.size}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                  View All Reports →
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Performance Insights</h3>
                  <p className="text-sm text-blue-100">
                    Reports generated this month
                  </p>
                </div>
              </div>
              <p className="text-4xl font-bold mb-2">127</p>
              <p className="text-sm text-blue-100">
                +23% vs last month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
