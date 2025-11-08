import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  StatCard,
  Card,
  CardContent,
  Badge,
  Button,
  SearchInput,
  useMobile,
} from '@repo/ui';
import {
  Handshake,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calculator,
  FileText,
  Target,
  ArrowRight,
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

export default function Deals() {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMobile();

  const stats = [
    { label: 'Active Deals', value: 18, change: '+5 this week', icon: Handshake },
    { label: 'Pending Approval', value: 7, change: '3 require attention', icon: Clock },
    { label: 'Closed This Month', value: 42, change: '+12% vs last month', icon: CheckCircle },
    { label: 'Avg Deal Profit', value: '$3,250', change: '+8.5% increase', icon: DollarSign },
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
    { title: 'New Deal', description: 'Start a new deal worksheet', icon: Handshake, href: '/deals/new' },
    { title: 'Deal Pipeline', description: 'View deal funnel and stages', icon: TrendingUp, href: '/crm/pipeline' },
    { title: 'Desking Tool', description: 'AI-powered deal structuring', icon: Calculator, href: '/deals/desk' },
    { title: 'F&I Products', description: 'Manage finance & insurance', icon: FileText, href: '/deals/fi-products' },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      'in-progress': { variant: 'info' as const, label: 'In Progress', icon: Clock },
      'pending-approval': { variant: 'warning' as const, label: 'Pending Approval', icon: AlertTriangle },
      'closed': { variant: 'success' as const, label: 'Closed', icon: CheckCircle },
      'lost': { variant: 'error' as const, label: 'Lost', icon: XCircle },
    };
    return config[status] || config['in-progress'];
  };

  const getDealTypeBadge = (type: string) => {
    const config = {
      'new': { variant: 'success' as const, label: 'New' },
      'used': { variant: 'info' as const, label: 'Used' },
      'lease': { variant: 'secondary' as const, label: 'Lease' },
    };
    return config[type] || config['new'];
  };

  return (
    <div>
      <PageHeader
        icon={<Handshake className="w-6 h-6" />}
        title="Deals Management"
        description="Track and manage all sales deals in one place"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary m-0">
              Active Deals
            </h2>
            <SearchInput
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
          </div>

          <div className="flex flex-col gap-3">
            {deals.map((deal) => {
              const statusBadge = getStatusBadge(deal.status);
              const typeBadge = getDealTypeBadge(deal.dealType);
              const StatusIcon = statusBadge.icon;

              return (
                <Card key={deal.id} padding="md">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-text-primary text-base m-0">
                            {deal.customerName}
                          </h3>
                          <Badge variant={statusBadge.variant} icon={<StatusIcon className="w-3 h-3" />}>
                            {statusBadge.label}
                          </Badge>
                          <Badge variant={typeBadge.variant}>
                            {typeBadge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary m-0">
                          {deal.vehicleInfo}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border-base">
                      <div>
                        <p className="text-xs text-text-tertiary m-0">Deal ID</p>
                        <p className="text-sm font-semibold text-text-primary m-0">{deal.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary m-0">Sales Person</p>
                        <p className="text-sm font-semibold text-text-primary m-0">{deal.salesPerson}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary m-0">Potential Profit</p>
                        <p className="text-sm font-semibold text-status-success m-0">
                          ${deal.potentialProfit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary m-0">Created</p>
                        <p className="text-sm font-semibold text-text-primary m-0">{deal.createdDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Link href={`/deals/${deal.id}`}>
                        <Button variant="primary" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/deals/desk?dealId=${deal.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          Open in Desking
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Link href="/deals/all">
            <Button variant="primary" className="mt-4">
              View All Deals
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary m-0 mb-2">
            Quick Actions
          </h2>

          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} href={action.href}>
                <Card hover padding="md" className="cursor-pointer">
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2.5 rounded-lg bg-accent-primary/10">
                        <Icon className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-primary text-sm mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs text-text-secondary m-0">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Performance Insight */}
          <Card className="mt-4 bg-gradient-to-br from-status-success to-status-success/80 text-text-inverse">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <Target className="w-5 h-5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1 text-sm">Monthly Goal</h3>
                  <p className="text-xs opacity-90 m-0">
                    You're 84% to your monthly target
                  </p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white rounded-full h-full w-[84%]" />
              </div>
              <p className="text-xs opacity-90 m-0">
                8 more deals to hit your goal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
