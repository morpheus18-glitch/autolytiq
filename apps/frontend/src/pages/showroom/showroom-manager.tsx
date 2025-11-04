import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  User,
  Car,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaces
interface CustomerVisit {
  id: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    type: 'walk-in' | 'appointment' | 'return';
  };
  arrivalTime: string;
  status: 'waiting' | 'with-sales' | 'test-drive' | 'in-fi' | 'completed' | 'left';
  assignedTo?: string;
  vehicleInterest?: string;
  currentStep: string;
  events: VisitEvent[];
  estimatedValue?: number;
  notes?: string;
}

interface VisitEvent {
  id: string;
  type: 'arrival' | 'greeting' | 'needs-assessment' | 'vehicle-presentation' | 'test-drive' | 'trade-appraisal' | 'negotiation' | 'fi-process' | 'delivery';
  timestamp: string;
  completedBy?: string;
  duration?: number;
  notes?: string;
  status: 'completed' | 'in-progress' | 'pending';
}

// Demo data
const demoVisits: CustomerVisit[] = [
  {
    id: '1',
    customer: {
      id: 'C001',
      name: 'John Smith',
      phone: '555-0123',
      email: 'john.smith@email.com',
      type: 'appointment',
    },
    arrivalTime: '2024-11-04T10:00:00',
    status: 'test-drive',
    assignedTo: 'Sarah Johnson',
    vehicleInterest: '2024 Toyota Camry',
    currentStep: 'Test Drive in Progress',
    estimatedValue: 35000,
    events: [
      { id: 'e1', type: 'arrival', timestamp: '2024-11-04T10:00:00', completedBy: 'Reception', status: 'completed' },
      { id: 'e2', type: 'greeting', timestamp: '2024-11-04T10:05:00', completedBy: 'Sarah Johnson', status: 'completed', duration: 5 },
      { id: 'e3', type: 'needs-assessment', timestamp: '2024-11-04T10:10:00', completedBy: 'Sarah Johnson', status: 'completed', duration: 15 },
      { id: 'e4', type: 'vehicle-presentation', timestamp: '2024-11-04T10:25:00', completedBy: 'Sarah Johnson', status: 'completed', duration: 20 },
      { id: 'e5', type: 'test-drive', timestamp: '2024-11-04T10:45:00', completedBy: 'Sarah Johnson', status: 'in-progress' },
    ],
  },
  {
    id: '2',
    customer: {
      id: 'C002',
      name: 'Emily Davis',
      phone: '555-0124',
      type: 'walk-in',
    },
    arrivalTime: '2024-11-04T11:30:00',
    status: 'waiting',
    currentStep: 'Waiting for Sales Rep',
    estimatedValue: 28000,
    events: [
      { id: 'e6', type: 'arrival', timestamp: '2024-11-04T11:30:00', completedBy: 'Reception', status: 'completed' },
    ],
  },
  {
    id: '3',
    customer: {
      id: 'C003',
      name: 'Robert Martinez',
      phone: '555-0125',
      email: 'r.martinez@email.com',
      type: 'return',
    },
    arrivalTime: '2024-11-04T09:00:00',
    status: 'in-fi',
    assignedTo: 'Mike Chen',
    vehicleInterest: '2024 Ford F-150',
    currentStep: 'F&I Paperwork',
    estimatedValue: 45000,
    events: [
      { id: 'e7', type: 'arrival', timestamp: '2024-11-04T09:00:00', completedBy: 'Reception', status: 'completed' },
      { id: 'e8', type: 'greeting', timestamp: '2024-11-04T09:05:00', completedBy: 'Mike Chen', status: 'completed' },
      { id: 'e9', type: 'vehicle-presentation', timestamp: '2024-11-04T09:15:00', completedBy: 'Mike Chen', status: 'completed' },
      { id: 'e10', type: 'trade-appraisal', timestamp: '2024-11-04T09:45:00', completedBy: 'Mike Chen', status: 'completed' },
      { id: 'e11', type: 'negotiation', timestamp: '2024-11-04T10:15:00', completedBy: 'Mike Chen', status: 'completed' },
      { id: 'e12', type: 'fi-process', timestamp: '2024-11-04T11:00:00', completedBy: 'F&I Manager', status: 'in-progress' },
    ],
  },
];

const statusConfig = {
  waiting: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'with-sales': { label: 'With Sales', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'test-drive': { label: 'Test Drive', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  'in-fi': { label: 'In F&I', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  left: { label: 'Left', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

const customerTypeConfig = {
  'walk-in': { label: 'Walk-In', icon: MapPin },
  'appointment': { label: 'Appointment', icon: Clock },
  'return': { label: 'Return Visit', icon: TrendingUp },
};

const eventLabels = {
  arrival: 'Arrival',
  greeting: 'Greeted',
  'needs-assessment': 'Needs Assessment',
  'vehicle-presentation': 'Vehicle Presentation',
  'test-drive': 'Test Drive',
  'trade-appraisal': 'Trade Appraisal',
  negotiation: 'Negotiation',
  'fi-process': 'F&I Process',
  delivery: 'Delivery',
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getTimeSince = (dateString: string) => {
  const ms = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ShowroomManager() {
  const [visits, setVisits] = useState<CustomerVisit[]>(demoVisits);
  const [selectedVisit, setSelectedVisit] = useState<CustomerVisit | null>(null);
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);

  const { data = visits } = useQuery({
    queryKey: ['showroom-visits'],
    queryFn: async () => visits,
  });

  // Calculate stats
  const stats = {
    active: visits.filter(v => !['completed', 'left'].includes(v.status)).length,
    testDrives: visits.filter(v => v.status === 'test-drive').length,
    inFI: visits.filter(v => v.status === 'in-fi').length,
    totalValue: visits.filter(v => !['left'].includes(v.status)).reduce((sum, v) => sum + (v.estimatedValue || 0), 0),
  };

  return (
    <div className="p-4 space-y-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Showroom Manager</h1>
          <p className="text-sm text-muted-foreground">Track customer visits and buying process in real-time</p>
        </div>
        <Button onClick={() => setShowNewVisitModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Check In Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Test Drives</p>
              <p className="text-2xl font-bold">{stats.testDrives}</p>
            </div>
            <Car className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In F&I</p>
              <p className="text-2xl font-bold">{stats.inFI}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Active Visits */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Active Visits</h2>
        <div className="grid gap-3">
          {visits.filter(v => !['completed', 'left'].includes(v.status)).map((visit) => {
            const TypeIcon = customerTypeConfig[visit.customer.type].icon;
            return (
              <Card
                key={visit.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedVisit(visit)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{visit.customer.name}</h3>
                      <Badge className={statusConfig[visit.status].color}>
                        {statusConfig[visit.status].label}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TypeIcon className="w-4 h-4" />
                        <span>{customerTypeConfig[visit.customer.type].label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Arrival</p>
                        <p className="text-sm font-medium">{formatTime(visit.arrivalTime)}</p>
                        <p className="text-xs text-muted-foreground">{getTimeSince(visit.arrivalTime)} ago</p>
                      </div>
                      {visit.vehicleInterest && (
                        <div>
                          <p className="text-xs text-muted-foreground">Interest</p>
                          <p className="text-sm font-medium">{visit.vehicleInterest}</p>
                        </div>
                      )}
                      {visit.assignedTo && (
                        <div>
                          <p className="text-xs text-muted-foreground">Sales Rep</p>
                          <p className="text-sm font-medium">{visit.assignedTo}</p>
                        </div>
                      )}
                      {visit.estimatedValue && (
                        <div>
                          <p className="text-xs text-muted-foreground">Est. Value</p>
                          <p className="text-sm font-medium">{formatCurrency(visit.estimatedValue)}</p>
                        </div>
                      )}
                    </div>

                    {/* Progress Timeline */}
                    <div className="flex items-center gap-2">
                      {visit.events.map((event, idx) => (
                        <div key={event.id} className="flex items-center">
                          <div className="flex flex-col items-center">
                            {event.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : event.status === 'in-progress' ? (
                              <div className="w-5 h-5 rounded-full border-2 border-blue-600 animate-pulse" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-xs text-muted-foreground mt-1">{eventLabels[event.type]}</span>
                          </div>
                          {idx < visit.events.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedVisit(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedVisit.customer.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedVisit.currentStep}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVisit(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedVisit.customer.phone}</span>
                  </div>
                  {selectedVisit.customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedVisit.customer.email}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Type</p>
                    <p className="font-medium">{customerTypeConfig[selectedVisit.customer.type].label}</p>
                  </div>
                  {selectedVisit.estimatedValue && (
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Deal Value</p>
                      <p className="font-medium">{formatCurrency(selectedVisit.estimatedValue)}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Visit Timeline */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Visit Timeline</h3>
                <div className="space-y-3">
                  {selectedVisit.events.map((event, idx) => (
                    <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className="mt-1">
                        {event.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : event.status === 'in-progress' ? (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-600 animate-pulse" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{eventLabels[event.type]}</p>
                          <span className="text-sm text-muted-foreground">{formatTime(event.timestamp)}</span>
                        </div>
                        {event.completedBy && (
                          <p className="text-sm text-muted-foreground">Completed by {event.completedBy}</p>
                        )}
                        {event.duration && (
                          <p className="text-sm text-muted-foreground">Duration: {event.duration} minutes</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Note
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <FileText className="w-4 h-4" />
                  Start Deal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Visit Modal */}
      {showNewVisitModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowNewVisitModal(false)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Check In Customer</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Customer Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="555-0123"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Visit Type</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                  <option value="walk-in">Walk-In</option>
                  <option value="appointment">Appointment</option>
                  <option value="return">Return Visit</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewVisitModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => setShowNewVisitModal(false)}>
                  Check In
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
