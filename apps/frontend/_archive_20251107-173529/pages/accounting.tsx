import { Link } from 'react-router-dom';
import {
  PageHeader,
  StatCard,
  Card,
  CardContent,
  Badge,
  QuickAction
} from '@repo/ui';
import {
  Calculator,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp,
  PiggyBank,
  Wallet,
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
    },
    {
      label: 'Outstanding AR',
      value: '$45K',
      change: '-8.3%',
      trend: 'down',
      icon: Wallet,
    },
    {
      label: 'Gross Profit Margin',
      value: '18.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Open GL Entries',
      value: '8',
      change: 'Pending Review',
      trend: 'neutral',
      icon: FileText,
    },
  ];

  const quickLinks = [
    {
      title: 'Transactions',
      description: 'View and manage transactions',
      icon: FileText,
      href: '/accounting/transactions',
    },
    {
      title: 'Chart of Accounts',
      description: 'Manage account structure',
      icon: FolderOpen,
      href: '/accounting/chart-of-accounts',
    },
    {
      title: 'Journal Entries',
      description: 'Create and review entries',
      icon: FileText,
      href: '/accounting/journal-entries',
    },
    {
      title: 'Vehicle Profit',
      description: 'Track deal profitability',
      icon: DollarSign,
      href: '/accounting/vehicle-profit',
    },
    {
      title: 'Finance Reserves',
      description: 'Monitor F&I reserves',
      icon: PiggyBank,
      href: '/accounting/finance-reserves',
    },
    {
      title: 'P&L Statement',
      description: 'Profit and loss reports',
      icon: BarChart3,
      href: '/accounting/pl-statement',
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

  const getPriorityVariant = (priority: string): 'error' | 'warning' | 'default' => {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'warning';
    return 'default';
  };

  return (
    <div>
      <PageHeader
        icon={<Calculator className="w-6 h-6" />}
        title="Accounting"
        description="Manage financials, transactions, and reporting"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={<stat.icon className="w-5 h-5" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <Link key={idx} to={link.href}>
                  <Card padding="lg" hover>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1">{link.title}</h3>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <Card padding="none">
            <CardContent>
              <div className="flex flex-col">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="p-4 border-b last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.event}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Pending Tasks</h2>
          <div className="flex flex-col gap-4">
            {pendingTasks.map((task, idx) => {
              const Icon = task.priority === 'high' ? AlertCircle : Clock;

              return (
                <Card key={idx} padding="md">
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          task.priority === 'high' ? 'text-error' : 'text-muted-foreground'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold mb-1">
                          {task.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{task.dueDate}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityVariant(task.priority)}>
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{task.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Link to="/accounting/dashboard" className="mt-6 block">
            <button className="w-full text-center px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity">
              Go to Full Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
