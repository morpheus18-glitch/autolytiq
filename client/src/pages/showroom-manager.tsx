import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Car,
  DollarSign,
  Eye,
  UserCheck,
  AlertCircle,
  Calendar,
  Timer,
  Activity,
  Search,
  Filter,
  MoreVertical,
  FileText,
  X,
  User,
  Calculator
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import { useLocation } from "wouter";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'interested' | 'negotiating' | 'sold' | 'lost';
  creditScore?: number;
  preferredContact: 'phone' | 'email' | 'text';
  notes?: string;
  assignedSalesperson?: string;
  source: 'website' | 'referral' | 'walk-in' | 'phone' | 'social';
  lastContact?: string;
  interestedVehicles?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ShowroomSession {
  id: string;
  customerId: number;
  status: 'active' | 'completed' | 'sold' | 'left';
  startTime: string;
  endTime?: string;
  salesConsultant: string;
  interestLevel: 'low' | 'medium' | 'high';
  vehiclesViewed: string[];
  notes: string;
  estimatedValue?: number;
  nextAction?: string;
  customerName?: string;
}

export default function ShowroomManager() {
  const { trackInteraction } = usePixelTracker();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Fetch showroom sessions
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['/api/showroom/sessions'],
  });

  // Track interactions
  useEffect(() => {
    trackInteraction('showroom_page_view', 'showroom-manager-page');
  }, [trackInteraction]);

  // Mock data for demonstration
  const mockSessions: ShowroomSession[] = [
    {
      id: 'session-1',
      customerId: 1,
      status: 'active',
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      salesConsultant: 'Mike Johnson',
      interestLevel: 'high',
      vehiclesViewed: ['2024 Toyota Camry', '2024 Honda Accord'],
      notes: 'Very interested in hybrid options, discussing financing',
      estimatedValue: 28000,
      nextAction: 'Schedule test drive',
      customerName: 'John Smith'
    },
    {
      id: 'session-2',
      customerId: 2,
      status: 'active',
      startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      salesConsultant: 'Sarah Wilson',
      interestLevel: 'medium',
      vehiclesViewed: ['2023 Ford F-150'],
      notes: 'Looking for work truck, price sensitive',
      estimatedValue: 35000,
      nextAction: 'Review trade-in value',
      customerName: 'David Johnson'
    },
    {
      id: 'session-3',
      customerId: 8,
      status: 'active',
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      salesConsultant: 'Tom Mitchell',
      interestLevel: 'high',
      vehiclesViewed: ['2024 Lexus RX'],
      notes: 'Ready to purchase, just finalizing details',
      estimatedValue: 52000,
      nextAction: 'Complete paperwork',
      customerName: 'Maria Garcia'
    },
    {
      id: 'session-4',
      customerId: 3,
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      salesConsultant: 'David Chen',
      interestLevel: 'high',
      vehiclesViewed: ['2024 BMW X5', '2024 Audi Q7'],
      notes: 'Completed visit, scheduling follow-up',
      estimatedValue: 65000,
      nextAction: 'Follow up tomorrow',
      customerName: 'Robert Williams'
    },
    {
      id: 'session-5',
      customerId: 5,
      status: 'completed',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      salesConsultant: 'Jennifer Walsh',
      interestLevel: 'medium',
      vehiclesViewed: ['2024 Subaru Outback'],
      notes: 'Customer needs time to think',
      estimatedValue: 32000,
      nextAction: 'Call back in 3 days',
      customerName: 'Lisa Brown'
    },
    {
      id: 'session-6',
      customerId: 4,
      status: 'sold',
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      salesConsultant: 'Lisa Rodriguez',
      interestLevel: 'high',
      vehiclesViewed: ['2024 Mercedes C-Class'],
      notes: 'SOLD! Customer purchased Mercedes C-Class',
      estimatedValue: 45000,
      nextAction: 'Schedule delivery',
      customerName: 'Michael Davis'
    },
    {
      id: 'session-7',
      customerId: 6,
      status: 'sold',
      startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      salesConsultant: 'Mark Stevens',
      interestLevel: 'high',
      vehiclesViewed: ['2024 Chevrolet Silverado'],
      notes: 'SOLD! Excellent deal on Silverado',
      estimatedValue: 38000,
      nextAction: 'Delivery scheduled for Friday',
      customerName: 'Jennifer Wilson'
    }
  ];

  const activeSessions = mockSessions.filter(s => s.status === 'active');
  const completedToday = mockSessions.filter(s => s.status === 'completed');
  const soldToday = mockSessions.filter(s => s.status === 'sold');
  const conversionRate = mockSessions.length > 0 ? 
    ((soldToday.length / mockSessions.length) * 100).toFixed(1) : '0';

  const getFilteredSessions = () => {
    let filtered = mockSessions;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(session => session.status === selectedFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.salesConsultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.vehiclesViewed.some(vehicle => 
          vehicle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  const handleMetricClick = (filter: string) => {
    setSelectedFilter(filter);
    trackInteraction('metric_box_click', filter);
  };

  const handleCustomerClick = (customerId: number, customerName?: string) => {
    trackInteraction('customer_detail_click', `customer-${customerId}`);
    navigate(`/customers/${customerId}`);
  };

  const handleDeskClick = (sessionId: string, customerId: number) => {
    trackInteraction('desk_session_start', `session-${sessionId}`);
    navigate(`/deal-desk?customerId=${customerId}&sessionId=${sessionId}`);
  };

  const updateInterestLevel = useMutation({
    mutationFn: async ({ sessionId, level }: { sessionId: string; level: string }) => {
      trackInteraction('interest_level_update', `${sessionId}-${level}`);
      return apiRequest(`/api/showroom/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ interestLevel: level })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/showroom/sessions'] });
    }
  });

  const updateNextAction = useMutation({
    mutationFn: async ({ sessionId, action }: { sessionId: string; action: string }) => {
      trackInteraction('next_action_update', `${sessionId}-${action}`);
      return apiRequest(`/api/showroom/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ nextAction: action })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/showroom/sessions'] });
    }
  });

  const closeVisit = useMutation({
    mutationFn: async (sessionId: string) => {
      trackInteraction('visit_closed', `session-${sessionId}`);
      return apiRequest(`/api/showroom/sessions/${sessionId}/close`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/showroom/sessions'] });
    }
  });

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getInterestColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'sold': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingCustomers || loadingSessions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading showroom data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Showroom Manager</h1>
            <p className="text-gray-600 dark:text-gray-400">Live customer activity and visit tracking</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers, consultants, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Clickable Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              selectedFilter === 'active' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => handleMetricClick('active')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{activeSessions.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              selectedFilter === 'completed' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''
            }`}
            onClick={() => handleMetricClick('completed')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{completedToday.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              selectedFilter === 'sold' ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
            }`}
            onClick={() => handleMetricClick('sold')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sold Today</p>
                  <p className="text-2xl font-bold text-purple-600">{soldToday.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              selectedFilter === 'all' ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''
            }`}
            onClick={() => handleMetricClick('all')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {selectedFilter === 'all' ? 'All Visits' : 
               selectedFilter === 'active' ? 'Active Sessions' :
               selectedFilter === 'completed' ? 'Completed Today' :
               selectedFilter === 'sold' ? 'Sold Today' : 'Visits'}
            </h2>
            <Badge variant="outline" className="text-sm">
              {getFilteredSessions().length} total
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sales Consultant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Interest Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicles Viewed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estimated Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Next Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {getFilteredSessions().map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {session.customerName?.split(' ').map(n => n[0]).join('') || 'C'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleCustomerClick(session.customerId, session.customerName)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                          {session.customerName || `Customer ${session.customerId}`}
                        </button>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {session.customerId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{session.salesConsultant}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getStatusColor(session.status)} border`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                      <Timer className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDuration(session.startTime, session.endTime)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Started: {formatTime(session.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={session.interestLevel}
                      onValueChange={(value) => updateInterestLevel.mutate({ sessionId: session.id, level: value })}
                    >
                      <SelectTrigger className={`w-24 h-8 text-xs ${getInterestColor(session.interestLevel)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-red-600">Low</SelectItem>
                        <SelectItem value="medium" className="text-yellow-600">Medium</SelectItem>
                        <SelectItem value="high" className="text-green-600">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {session.vehiclesViewed.map((vehicle, index) => (
                        <div key={index} className="flex items-center mb-1">
                          <Car className="h-3 w-3 mr-1 text-gray-400" />
                          {vehicle}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.estimatedValue ? `$${session.estimatedValue.toLocaleString()}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Select
                      value={session.nextAction || ''}
                      onValueChange={(value) => updateNextAction.mutate({ sessionId: session.id, action: value })}
                    >
                      <SelectTrigger className="w-48 h-8 text-xs">
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Schedule test drive">Schedule test drive</SelectItem>
                        <SelectItem value="Review trade-in value">Review trade-in value</SelectItem>
                        <SelectItem value="Complete paperwork">Complete paperwork</SelectItem>
                        <SelectItem value="Follow up tomorrow">Follow up tomorrow</SelectItem>
                        <SelectItem value="Call back in 3 days">Call back in 3 days</SelectItem>
                        <SelectItem value="Schedule delivery">Schedule delivery</SelectItem>
                        <SelectItem value="Send financing options">Send financing options</SelectItem>
                        <SelectItem value="Prepare quote">Prepare quote</SelectItem>
                        <SelectItem value="Manager approval needed">Manager approval needed</SelectItem>
                        <SelectItem value="Waiting for customer decision">Waiting for customer decision</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleDeskClick(session.id, session.customerId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Desk
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCustomerClick(session.customerId, session.customerName)}>
                            <User className="h-4 w-4 mr-2" />
                            View Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeskClick(session.id, session.customerId)}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Work Deal
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Add Notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {session.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => closeVisit.mutate(session.id)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Close Visit
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getFilteredSessions().length === 0 && (
          <div className="text-center py-12">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No visits found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedFilter === 'all' 
                ? 'No visits recorded yet.'
                : `No ${selectedFilter} visits found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}