import { Link } from 'wouter';
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

export default function AccountingOverview() {
  const stats = [
    {
      label: 'Monthly Revenue',
      value: '$1.2M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Outstanding AR',
      value: '$45K',
      change: '-8.3%',
      trend: 'down',
      icon: Wallet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Gross Profit Margin',
      value: '18.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Open GL Entries',
      value: 8,
      change: 'Pending Review',
      trend: 'neutral',
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const quickLinks = [
    {
      title: 'Transactions',
      description: 'View and manage transactions',
      icon: FileText,
      href: '/accounting/transactions',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Chart of Accounts',
      description: 'Manage account structure',
      icon: FolderOpen,
      href: '/accounting/chart-of-accounts',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Journal Entries',
      description: 'Create and review entries',
      icon: FileText,
      href: '/accounting/journal-entries',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Vehicle Profit',
      description: 'Track deal profitability',
      icon: DollarSign,
      href: '/accounting/vehicle-profit',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Finance Reserves',
      description: 'Monitor F&I reserves',
      icon: PiggyBank,
      href: '/accounting/finance-reserves',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'P&L Statement',
      description: 'Profit and loss reports',
      icon: BarChart3,
      href: '/accounting/pl-statement',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Calculator className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage financials, transactions, and reporting
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const trendColor =
              stat.trend === 'up'
                ? 'text-green-600'
                : stat.trend === 'down'
                ? 'text-red-600'
                : 'text-gray-600';

            return (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className={`text-sm font-medium ${trendColor}`}>{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link key={idx} href={link.href}>
                    <a className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${link.bg} shrink-0`}>
                          <Icon className={`w-6 h-6 ${link.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Recent Activity */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.event}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600">{activity.user}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{activity.time}</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
            <div className="space-y-4">
              {pendingTasks.map((task, idx) => {
                const priorityColor =
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700';

                return (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      {task.priority === 'high' ? (
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{task.dueDate}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-600">{task.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/accounting/dashboard">
              <a className="mt-6 block w-full text-center px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                Go to Full Dashboard
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
