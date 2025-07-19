import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Car, FileText, Timer, CheckCircle, AlertCircle, XCircle, ArrowRight, Receipt, Search, Filter, MoreHorizontal, Edit, Eye, ExternalLink, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { format, addDays, subDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useLocation, Link } from 'wouter';

interface ShowroomSession {
  id: number;
  customerId: number;
  vehicleId?: number;
  stockNumber?: string;
  salespersonId?: number;
  leadSource?: string;
  eventStatus: 'sold' | 'dead' | 'working' | 'pending' | 'sent_to_finance';
  dealStage: 'vehicle_selection' | 'test_drive' | 'numbers' | 'closed_deal' | 'finalized';
  notes?: string;
  timeEntered: string;
  timeExited?: string;
  sessionDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  stockNumber: string;
  price: number;
}

const statusColors = {
  sold: 'bg-green-500 text-white',
  dead: 'bg-red-500 text-white',
  working: 'bg-blue-500 text-white',
  pending: 'bg-yellow-500 text-white',
  sent_to_finance: 'bg-purple-500 text-white'
};

const eventStatuses = [
  { value: 'working', label: 'Working' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent_to_finance', label: 'Sent to Finance' },
  { value: 'sold', label: 'Sold' },
  { value: 'dead', label: 'Dead' }
];

const dealStages = [
  { value: 'vehicle_selection', label: 'Vehicle Selection' },
  { value: 'test_drive', label: 'Test Drive' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'closed_deal', label: 'Closed Deal' },
  { value: 'finalized', label: 'Finalized' }
];

export default function ShowroomManagerClean() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ShowroomSession | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();

  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    eventStatus: 'working',
    dealStage: 'vehicle_selection',
    notes: ''
  });

  // Check for URL parameters to auto-create session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const createSessionParam = urlParams.get('createSession');
    
    if (createSessionParam) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(createSessionParam));
        // Auto-populate form and open dialog
        setFormData({
          customerId: sessionData.customerId.toString(),
          vehicleId: '',
          eventStatus: sessionData.eventStatus || 'working',
          dealStage: sessionData.dealStage || 'vehicle_selection',
          notes: sessionData.notes || ''
        });
        setIsCreateDialogOpen(true);
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing session data from URL:', error);
        toast({ 
          title: 'Error', 
          description: 'Invalid session data in URL', 
          variant: 'destructive' 
        });
      }
    }
  }, [location, toast]);

  // Fetch showroom sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/showroom-sessions', `?date=${format(selectedDate, 'yyyy-MM-dd')}`],
  });

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Fetch vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  // Helper functions
  const getCustomerName = (customerId: number) => {
    const customer = safeCustomers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = safeVehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'No Vehicle';
  };

  const getSessionDuration = (session: ShowroomSession) => {
    const start = new Date(session.timeEntered);
    const end = session.timeExited ? new Date(session.timeExited) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    return `${diff}m`;
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return safeSessions.filter(session => {
      const customerName = getCustomerName(session.customerId).toLowerCase();
      const vehicleInfo = session.vehicleId ? getVehicleInfo(session.vehicleId).toLowerCase() : '';
      const searchMatch = searchTerm === '' || 
        customerName.includes(searchTerm.toLowerCase()) ||
        vehicleInfo.includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || session.eventStatus === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [safeSessions, searchTerm, statusFilter, safeCustomers, safeVehicles]);

  // Statistics
  const sessionStats = useMemo(() => {
    const active = safeSessions.filter(s => !s.timeExited).length;
    const completed = safeSessions.filter(s => s.timeExited).length;
    const sold = safeSessions.filter(s => s.eventStatus === 'sold').length;
    const working = safeSessions.filter(s => s.eventStatus === 'working').length;
    
    return { active, completed, sold, working, total: safeSessions.length };
  }, [safeSessions]);

  // Navigation
  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/showroom-sessions', {
        method: 'POST',
        body: data,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/showroom-sessions'] });
      setIsCreateDialogOpen(false);
      setFormData({
        customerId: '',
        vehicleId: '',
        eventStatus: 'working',
        dealStage: 'vehicle_selection',
        notes: ''
      });
      toast({ title: 'Customer visit created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating session', description: error.message, variant: 'destructive' });
    }
  });

  const handleCreateSession = () => {
    if (!formData.customerId) {
      toast({ title: 'Error', description: 'Please select a customer', variant: 'destructive' });
      return;
    }

    const data = {
      customerId: parseInt(formData.customerId),
      vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
      eventStatus: formData.eventStatus || 'working',
      dealStage: formData.dealStage || 'vehicle_selection',
      notes: formData.notes || undefined,
      timeEntered: new Date().toISOString(),
      sessionDate: format(selectedDate, 'yyyy-MM-dd'),
    };

    createSessionMutation.mutate(data);
  };

  // Update session status or stage
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, field, value }: { sessionId: number; field: 'eventStatus' | 'dealStage'; value: string }) => {
      const response = await apiRequest(`/api/showroom-sessions/${sessionId}`, {
        method: 'PUT',
        body: { [field]: value },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/showroom-sessions'] });
      toast({ title: 'Session updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating session', description: error.message, variant: 'destructive' });
    }
  });

  const handleStatusChange = (sessionId: number, newStatus: string) => {
    updateSessionMutation.mutate({ sessionId, field: 'eventStatus', value: newStatus });
  };

  const handleStageChange = (sessionId: number, newStage: string) => {
    updateSessionMutation.mutate({ sessionId, field: 'dealStage', value: newStage });
  };

  const handleCreateDeal = async (session: ShowroomSession) => {
    try {
      const customer = safeCustomers.find(c => c.id === session.customerId);
      const vehicle = session.vehicleId ? safeVehicles.find(v => v.id === session.vehicleId) : null;

      if (!customer) {
        toast({ title: 'Error', description: 'Customer not found', variant: 'destructive' });
        return;
      }

      const dealData = {
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        vehicleId: vehicle?.id,
        vehicleName: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : undefined,
        stockNumber: vehicle?.stockNumber,
        salePrice: vehicle?.price,
        showroomSessionId: session.id
      };

      const response = await apiRequest('/api/deals', {
        method: 'POST',
        body: dealData,
      });

      const dealResult = await response.json();
      localStorage.setItem('pendingDeal', JSON.stringify(dealResult));
      navigate('/deal-desk');
      
      toast({ title: 'Deal created', description: 'Redirecting to Deal Desk...' });
    } catch (error: any) {
      toast({ title: 'Error creating deal', description: error.message, variant: 'destructive' });
    }
  };

  if (sessionsLoading || customersLoading || vehiclesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading showroom data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Showroom Manager</h1>
            <p className="text-sm text-gray-600">Track customer visits and manage the sales floor</p>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
              {format(selectedDate, 'MMM d, yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{sessionStats.active}</div>
            <div className="text-xs text-gray-600">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{sessionStats.sold}</div>
            <div className="text-xs text-gray-600">Sold Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{sessionStats.working}</div>
            <div className="text-xs text-gray-600">Working</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{sessionStats.total}</div>
            <div className="text-xs text-gray-600">Total Today</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers or vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {eventStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9">
                <Plus className="h-4 w-4 mr-2" />
                New Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Customer Visit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerId">Customer</Label>
                    <Select 
                      value={formData.customerId} 
                      onValueChange={(value) => setFormData(prev => ({...prev, customerId: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {safeCustomers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.firstName} {customer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleId">Vehicle (Optional)</Label>
                    <Select 
                      value={formData.vehicleId} 
                      onValueChange={(value) => setFormData(prev => ({...prev, vehicleId: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {safeVehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.stockNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="eventStatus">Status</Label>
                    <Select 
                      value={formData.eventStatus} 
                      onValueChange={(value) => setFormData(prev => ({...prev, eventStatus: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventStatuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dealStage">Deal Stage</Label>
                    <Select 
                      value={formData.dealStage} 
                      onValueChange={(value) => setFormData(prev => ({...prev, dealStage: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dealStages.map(stage => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Add any relevant notes..." 
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setFormData({
                        customerId: '',
                        vehicleId: '',
                        eventStatus: 'working',
                        dealStage: 'vehicle_selection',
                        notes: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    disabled={createSessionMutation.isPending || !formData.customerId}
                    onClick={handleCreateSession}
                  >
                    {createSessionMutation.isPending ? 'Creating...' : 'Create Visit'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No sessions match your filters' : 'No customer sessions today'}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="min-w-0">
                          <Link href="/customers" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate">
                            {getCustomerName(session.customerId)}
                            <ExternalLink className="h-3 w-3 inline ml-1" />
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {session.vehicleId ? (
                          <div className="flex items-center">
                            <Car className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <Link href="/inventory" className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                              {getVehicleInfo(session.vehicleId)}
                              <ExternalLink className="h-3 w-3 inline ml-1" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-gray-400">No vehicle selected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {format(new Date(session.timeEntered), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {getSessionDuration(session)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={session.eventStatus} onValueChange={(value) => handleStatusChange(session.id, value)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <div className="flex items-center gap-1">
                            <Edit3 className="h-3 w-3" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {eventStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              <Badge className={`text-xs ${statusColors[status.value]}`}>
                                {status.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={session.dealStage} onValueChange={(value) => handleStageChange(session.id, value)}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <div className="flex items-center gap-1">
                            <Edit3 className="h-3 w-3" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {dealStages.map(stage => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSession(session);
                            setIsDetailViewOpen(true);
                          }}
                          className="h-7 px-2"
                          title="View Session Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCreateDeal(session)}
                          className="bg-green-600 hover:bg-green-700 text-white h-7 px-2"
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          Deal
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Detail View Dialog */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Complete information about this customer visit
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Customer Name</Label>
                      <div className="mt-1 text-sm text-gray-900">{getCustomerName(selectedSession.customerId)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Customer ID</Label>
                      <div className="mt-1 text-sm text-gray-900">#{selectedSession.customerId}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Vehicle</Label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedSession.vehicleId ? getVehicleInfo(selectedSession.vehicleId) : 'No vehicle selected'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stock Number</Label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedSession.stockNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Session Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Time Entered</Label>
                      <div className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedSession.timeEntered), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <div className="mt-1 text-sm text-gray-900">
                        {getSessionDuration(selectedSession)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge className={`text-xs ${statusColors[selectedSession.eventStatus]}`}>
                          {eventStatuses.find(s => s.value === selectedSession.eventStatus)?.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Deal Stage</Label>
                      <div className="mt-1 text-sm text-gray-900">
                        {dealStages.find(s => s.value === selectedSession.dealStage)?.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedSession.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedSession.notes}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleCreateDeal(selectedSession)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Deal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailViewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}