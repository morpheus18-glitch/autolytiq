import { Link } from 'wouter';
import {
  Building,
  Users,
  Shield,
  Settings,
  Activity,
  Lock,
  School,
  Database,
  Globe,
  MessageSquare,
  TrendingUp,
  UserCog,
  Key,
  Store,
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
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Active Users',
      value: 24,
      status: 'normal',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending Approvals',
      value: 3,
      status: 'warning',
      icon: CheckCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Security Score',
      value: '95/100',
      status: 'secure',
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/user-management',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: ['Users', 'Roles', 'Permissions', 'Departments'],
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/admin/system-settings',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      items: ['General', 'Dealer Config', 'Multi-Store', 'Integrations'],
    },
    {
      title: 'Security Center',
      description: 'Manage security and compliance',
      icon: Lock,
      href: '/admin/security-center',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      items: ['Access Logs', 'Security Policies', 'Audit Trail', 'Encryption'],
    },
    {
      title: 'System Health',
      description: 'Monitor system performance',
      icon: Activity,
      href: '/admin/system-health',
      color: 'text-green-600',
      bg: 'bg-green-50',
      items: ['Performance', 'Database', 'API Status', 'Uptime'],
    },
    {
      title: 'Training Center',
      description: 'Training materials and onboarding',
      icon: School,
      href: '/admin/training-center',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      items: ['Courses', 'Materials', 'Progress', 'Certifications'],
    },
    {
      title: 'ML Developer',
      description: 'Manage ML models and analytics',
      icon: Database,
      href: '/admin/ml-developer',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Building className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-sm text-gray-600 mt-1">
                System configuration, user management, and settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Sections */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {adminSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Link key={idx} href={section.href}>
                    <a className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${section.bg} shrink-0`}>
                            <Icon className={`w-6 h-6 ${section.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                            <p className="text-sm text-gray-600">{section.description}</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {section.items.map((item, iidx) => (
                              <span
                                key={iidx}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
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
                {recentActivity.map((activity, idx) => {
                  const typeIcons = {
                    security: Shield,
                    user: Users,
                    system: Activity,
                    config: Settings,
                  };
                  const Icon = typeIcons[activity.type] || Activity;

                  return (
                    <div key={idx} className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600">{activity.user}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alerts & Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
            <div className="space-y-4 mb-6">
              {alerts.map((alert, idx) => {
                const severityColors = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-yellow-200 bg-yellow-50',
                  low: 'border-gray-200 bg-gray-50',
                };

                const severityIcons = {
                  high: AlertCircle,
                  medium: AlertCircle,
                  low: CheckCircle,
                };

                const severityIconColors = {
                  high: 'text-red-500',
                  medium: 'text-yellow-500',
                  low: 'text-gray-400',
                };

                const Icon = severityIcons[alert.severity] || AlertCircle;
                const iconColor = severityIconColors[alert.severity] || 'text-gray-400';
                const bgColor = severityColors[alert.severity] || 'border-gray-200 bg-gray-50';

                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-4 ${bgColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          {alert.title}
                        </h3>
                        <Link href={alert.href}>
                          <a className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            {alert.action} →
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/admin/role-presets">
                  <a className="block text-sm text-blue-600 hover:text-blue-700">
                    Role Presets →
                  </a>
                </Link>
                <Link href="/admin/integration-setup">
                  <a className="block text-sm text-blue-600 hover:text-blue-700">
                    Integration Setup →
                  </a>
                </Link>
                <Link href="/admin/lead-distribution">
                  <a className="block text-sm text-blue-600 hover:text-blue-700">
                    Lead Distribution →
                  </a>
                </Link>
                <Link href="/admin/performance-tracking">
                  <a className="block text-sm text-blue-600 hover:text-blue-700">
                    Performance Tracking →
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
