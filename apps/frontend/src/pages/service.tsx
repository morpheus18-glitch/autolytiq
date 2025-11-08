import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  StatCard,
  Card,
  CardContent,
  Badge,
  SearchInput,
  Alert,
  QuickAction
} from '@repo/ui';
import {
  Wrench,
  Calendar,
  Users,
  Package,
  FileText,
  ClipboardCheck,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Activity,
  AlertTriangle,
  ArrowRight
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
    { label: "Today's Appointments", value: '7', change: '+2 from yesterday', icon: Calendar },
    { label: 'In Progress', value: '3', change: '2 awaiting parts', icon: ClipboardCheck },
    { label: 'Technicians Active', value: '8', change: '2 available', icon: Users },
    { label: 'Avg Completion', value: '2.3h', change: '15% faster', icon: Clock },
  ];

  const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
    const statusMap: Record<string, 'default' | 'success' | 'error' | 'warning' | 'info'> = {
      'scheduled': 'info',
      'in-progress': 'warning',
      'completed': 'success',
      'cancelled': 'error',
    };
    return statusMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons = {
      'scheduled': Clock,
      'in-progress': Activity,
      'completed': CheckCircle2,
      'cancelled': XCircle,
    };
    return statusIcons[status] || Clock;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'scheduled': 'Scheduled',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return labels[status] || status;
  };

  const quickLinks = [
    { icon: FileText, title: 'Service History', description: 'View service history', badge: null },
    { icon: Package, title: 'Parts Inventory', description: 'Manage parts', badge: null },
    { icon: Users, title: 'Technician Schedule', description: 'View schedules', badge: null },
    { icon: TrendingUp, title: 'Service Reports', description: 'View reports', badge: null },
  ];

  return (
    <div>
      <PageHeader
        icon={<Wrench className="w-6 h-6" />}
        title="Service Center"
        description="Manage appointments, orders, and technician schedules"
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Today's Appointments</h2>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <div className="flex flex-col gap-3">
            {appointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.status);
              const statusVariant = getStatusBadgeVariant(appointment.status);

              return (
                <Card key={appointment.id} padding="md">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900 text-base">
                            {appointment.customerName}
                          </h3>
                          <Badge variant={statusVariant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {appointment.vehicleInfo} • {appointment.serviceType}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-200">
                      <div>
                        <p className="text-xs text-neutral-500">Scheduled</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {appointment.scheduledTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Technician</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {appointment.technicianName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Est. Done</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {appointment.estimatedCompletion}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Link href="/service/appointments">
            <a className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md font-medium text-sm hover:bg-primary-700 transition-colors no-underline">
              View All Appointments
              <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <Alert variant="error" title="Attention Required">
            <p className="text-sm mb-3">3 orders awaiting parts</p>
            <Link href="/service/orders">
              <a className="inline-flex items-center gap-2 px-3 py-1.5 bg-error-600 text-white rounded-md font-medium text-sm hover:bg-error-700 transition-colors no-underline">
                View Orders
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Link>
          </Alert>

          <Card padding="md">
            <CardContent>
              <h3 className="font-bold text-neutral-900 text-sm mb-3">Quick Access</h3>
              <div className="flex flex-col gap-2">
                {quickLinks.map((link, idx) => (
                  <QuickAction
                    key={idx}
                    icon={<link.icon className="w-4 h-4" />}
                    title={link.title}
                    description={link.description}
                    badge={link.badge}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
