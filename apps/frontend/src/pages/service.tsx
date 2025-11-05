import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

interface ServiceAppointment {
  id: string;
  customerName: string;
  vehicleInfo: string;
  scheduledTime: string;
  serviceType: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  technicianName: string;
  estimatedCompletion: string;
}

export default function ServiceOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Demo appointments data
  const appointments: ServiceAppointment[] = [
    {
      id: 'SA-001',
      customerName: 'Sarah Williams',
      vehicleInfo: '2023 Toyota Camry',
      scheduledTime: '10:00 AM',
      serviceType: 'Oil Change & Inspection',
      status: 'in-progress',
      technicianName: 'Mike Johnson',
      estimatedCompletion: '11:30 AM'
    },
    {
      id: 'SA-002',
      customerName: 'John Smith',
      vehicleInfo: '2022 Honda Accord',
      scheduledTime: '11:00 AM',
      serviceType: 'Brake Service',
      status: 'scheduled',
      technicianName: 'James Brown',
      estimatedCompletion: '1:00 PM'
    },
    {
      id: 'SA-003',
      customerName: 'Emily Davis',
      vehicleInfo: '2021 Ford F-150',
      scheduledTime: '1:00 PM',
      serviceType: 'Tire Rotation',
      status: 'scheduled',
      technicianName: 'Mike Johnson',
      estimatedCompletion: '2:00 PM'
    },
  ];

  const stats = [
    {
      label: "Today's Appointments",
      value: 7,
      change: '+2 from yesterday',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'In Progress',
      value: 3,
      change: '2 awaiting parts',
      trend: 'neutral',
      icon: ClipboardCheck,
      color: 'text-amber-600',
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      iconBg: 'bg-amber-500'
    },
    {
      label: 'Technicians Active',
      value: 8,
      change: '2 available',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Avg Completion',
      value: '2.3h',
      change: '15% faster than avg',
      trend: 'up',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500'
    },
  ];

  const quickActions = [
    { label: 'Schedule Appointment', icon: Calendar, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Create Service Order', icon: ClipboardCheck, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Check Parts', icon: Package, color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Scheduled' },
      'in-progress': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Activity, label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Service Center</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage appointments, orders, and technician schedules
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden lg:flex gap-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    className={`flex items-center gap-2 px-4 py-2.5 ${action.color} text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid with animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-4 ${stat.iconBg} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.iconBg} rounded-full`} style={{ width: '75%' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments - Enhanced */}
          <div className="lg:col-span-2">
            {/* Search and Filter Bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-0.5 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{appointment.customerName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1.5`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{appointment.vehicleInfo}</p>
                          <p className="text-sm font-medium text-gray-900">{appointment.serviceType}</p>
                        </div>
                      </div>
                      <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                        <p className="text-sm font-semibold text-gray-900">{appointment.scheduledTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Technician</p>
                        <p className="text-sm font-semibold text-gray-900">{appointment.technicianName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Est. Completion</p>
                        <p className="text-sm font-semibold text-gray-900">{appointment.estimatedCompletion}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/service/appointments">
              <a className="mt-6 flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all">
                View All Appointments
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>

          {/* Sidebar with Alerts and Quick Links */}
          <div className="space-y-6">
            {/* Priority Alerts */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900 mb-1">Attention Required</h3>
                  <p className="text-sm text-red-800">
                    3 service orders awaiting parts delivery
                  </p>
                </div>
              </div>
              <Link href="/service/orders">
                <a className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                  View Orders
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Access</h3>
              <div className="space-y-3">
                {[
                  { label: 'Service History', href: '/service/history', icon: FileText },
                  { label: 'Parts Inventory', href: '/service/parts', icon: Package },
                  { label: 'Technician Schedule', href: '/service/schedule', icon: Users },
                  { label: 'Service Reports', href: '/service/reports', icon: TrendingUp },
                ].map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <Link key={idx} href={link.href}>
                      <a className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <div>
                  <h3 className="font-bold mb-1">Today's Performance</h3>
                  <p className="text-sm text-green-100">
                    Revenue: $3,450
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-100">Completed</span>
                  <span className="font-bold">4 orders</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-100">Avg Ticket</span>
                  <span className="font-bold">$862</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
