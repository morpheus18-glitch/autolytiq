import { Link } from 'wouter';
import {
  PageHeader,
  StatCard,
  Card,
  CardContent,
  Badge,
  Alert
} from '@repo/ui';
import {
  Building,
  Users,
  Shield,
  Settings,
  Activity,
  Lock,
  School,
  Database,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminOverview() {
  const systemStats = [
    {
      label: 'System Health',
      value: '98%',
      status: 'healthy',
      icon: Activity,
    },
    {
      label: 'Active Users',
      value: '24',
      status: 'normal',
      icon: Users,
    },
    {
      label: 'Pending Approvals',
      value: '3',
      status: 'warning',
      icon: CheckCircle,
    },
    {
      label: 'Security Score',
      value: '95/100',
      status: 'secure',
      icon: Shield,
    },
  ];

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/user-management',
      items: ['Users', 'Roles', 'Permissions', 'Departments'],
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/admin/system-settings',
      items: ['General', 'Dealer Config', 'Multi-Store', 'Integrations'],
    },
    {
      title: 'Security Center',
      description: 'Manage security and compliance',
      icon: Lock,
      href: '/admin/security-center',
      items: ['Access Logs', 'Security Policies', 'Audit Trail', 'Encryption'],
    },
    {
      title: 'System Health',
      description: 'Monitor system performance',
      icon: Activity,
      href: '/admin/system-health',
      items: ['Performance', 'Database', 'API Status', 'Uptime'],
    },
    {
      title: 'Training Center',
      description: 'Training materials and onboarding',
      icon: School,
      href: '/admin/training-center',
      items: ['Courses', 'Materials', 'Progress', 'Certifications'],
    },
    {
      title: 'ML Developer',
      description: 'Manage ML models and analytics',
      icon: Database,
      href: '/admin/ml-developer',
      items: ['Models', 'Training', 'Performance', 'Comparison'],
    },
  ];

  const recentActivity = [
    {
      user: 'Sarah Johnson',
      action: 'Updated role permissions for Sales Manager',
      time: '10 min ago',
      type: 'security',
    },
    {
      user: 'Mike Chen',
      action: 'Created new user: Emily Davis',
      time: '1 hour ago',
      type: 'user',
    },
    {
      user: 'System',
      action: 'Database backup completed successfully',
      time: '2 hours ago',
      type: 'system',
    },
    {
      user: 'Admin',
      action: 'Updated dealership configuration',
      time: '3 hours ago',
      type: 'config',
    },
  ];

  const alerts = [
    {
      title: '3 users pending role assignment',
      severity: 'medium',
      action: 'Review Users',
      href: '/admin/users',
    },
    {
      title: 'System update available',
      severity: 'low',
      action: 'View Details',
      href: '/admin/system-settings',
    },
    {
      title: 'Security audit due in 5 days',
      severity: 'medium',
      action: 'Schedule',
      href: '/admin/security-center',
    },
  ];

  const getSeverityVariant = (severity: string): 'error' | 'warning' | 'info' => {
    if (severity === 'high') return 'error';
    if (severity === 'medium') return 'warning';
    return 'info';
  };

  return (
    <div>
      <PageHeader
        icon={<Building className="w-6 h-6" />}
        title="Administration"
        description="System configuration, user management, and settings"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            icon={<stat.icon className="w-5 h-5" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {adminSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Link key={idx} href={section.href}>
                  <a className="block no-underline">
                    <Card padding="lg" hover>
                      <CardContent>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-neutral-100 flex-shrink-0">
                            <Icon className="w-6 h-6 text-neutral-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-900 mb-1">
                              {section.title}
                            </h3>
                            <p className="text-sm text-neutral-600">{section.description}</p>
                          </div>
                        </div>
                        <div className="border-t border-neutral-200 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {section.items.map((item, iidx) => (
                              <Badge key={iidx} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Activity</h2>
          <Card padding="none">
            <CardContent>
              <div className="flex flex-col">
                {recentActivity.map((activity, idx) => {
                  const typeIcons = {
                    security: Shield,
                    user: Users,
                    system: Activity,
                    config: Settings,
                  };
                  const Icon = typeIcons[activity.type] || Activity;

                  return (
                    <div
                      key={idx}
                      className="p-4 border-b border-neutral-200 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-900">{activity.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-neutral-600">{activity.user}</p>
                            <span className="text-xs text-neutral-400">•</span>
                            <p className="text-xs text-neutral-500">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Alerts</h2>
          <div className="flex flex-col gap-4 mb-6">
            {alerts.map((alert, idx) => (
              <Alert
                key={idx}
                variant={getSeverityVariant(alert.severity)}
                title={alert.title}
              >
                <Link href={alert.href}>
                  <a className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors no-underline">
                    {alert.action} →
                  </a>
                </Link>
              </Alert>
            ))}
          </div>

          <Card padding="md">
            <CardContent>
              <h3 className="font-bold text-neutral-900 mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/admin/role-presets">
                  <a className="block text-sm text-primary-600 hover:text-primary-700 transition-colors no-underline">
                    Role Presets →
                  </a>
                </Link>
                <Link href="/admin/integration-setup">
                  <a className="block text-sm text-primary-600 hover:text-primary-700 transition-colors no-underline">
                    Integration Setup →
                  </a>
                </Link>
                <Link href="/admin/lead-distribution">
                  <a className="block text-sm text-primary-600 hover:text-primary-700 transition-colors no-underline">
                    Lead Distribution →
                  </a>
                </Link>
                <Link href="/admin/performance-tracking">
                  <a className="block text-sm text-primary-600 hover:text-primary-700 transition-colors no-underline">
                    Performance Tracking →
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
