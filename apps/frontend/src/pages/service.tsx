import { Link } from 'wouter';
import {
  Wrench,
  Calendar,
  Users,
  Package,
  FileText,
  ClipboardCheck,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function ServiceOverview() {
  const stats = [
    { label: "Today's Appointments", value: 7, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Service Orders', value: 12, icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Technicians On Duty', value: 8, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Completion Time', value: '2.5h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const quickLinks = [
    {
      title: "Today's Appointments",
      description: 'View and manage service appointments',
      icon: Calendar,
      href: '/service/appointments',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Service Orders',
      description: 'Track active service orders',
      icon: ClipboardCheck,
      href: '/service/orders',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Service History',
      description: 'View customer service records',
      icon: FileText,
      href: '/service/history',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Parts Inventory',
      description: 'Manage parts and supplies',
      icon: Package,
      href: '/service/parts',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Technician Schedule',
      description: 'View tech assignments and capacity',
      icon: Users,
      href: '/service/schedule',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      title: 'Service Reports',
      description: 'Performance and metrics reports',
      icon: TrendingUp,
      href: '/service/reports',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const recentActivity = [
    { time: '10 min ago', event: 'Service order #SO-2024-045 completed', tech: 'Mike Johnson' },
    { time: '25 min ago', event: 'New appointment scheduled for 2:00 PM', customer: 'Sarah Williams' },
    { time: '1 hour ago', event: 'Parts ordered for service order #SO-2024-044', tech: 'James Brown' },
    { time: '2 hours ago', event: 'Service inspection completed for VIN 1HGBH41JXMN109186', tech: 'Mike Johnson' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Wrench className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Center</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage service appointments, orders, and technician schedules
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
            return (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.event}</p>
                        {activity.tech && (
                          <p className="text-xs text-gray-600 mt-1">Tech: {activity.tech}</p>
                        )}
                        {activity.customer && (
                          <p className="text-xs text-gray-600 mt-1">Customer: {activity.customer}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900 mb-1">Attention Required</h3>
                  <p className="text-sm text-yellow-800">
                    3 service orders are awaiting parts
                  </p>
                  <Link href="/service/orders">
                    <a className="text-sm text-yellow-900 font-medium hover:underline mt-2 inline-block">
                      View Orders →
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
