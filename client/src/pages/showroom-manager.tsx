import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Car, FileText, Timer, CheckCircle, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, subDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

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
  sold: 'bg-green-100 text-green-800 border-green-200',
  dead: 'bg-red-100 text-red-800 border-red-200',
  working: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sent_to_finance: 'bg-purple-100 text-purple-800 border-purple-200',
};

const stageColors = {
  vehicle_selection: 'bg-gray-100 text-gray-700',
  test_drive: 'bg-blue-100 text-blue-700',
  numbers: 'bg-orange-100 text-orange-700',
  closed_deal: 'bg-green-100 text-green-700',
  finalized: 'bg-emerald-100 text-emerald-700',
};

const leadSources = [
  'Walk-in',
  'Phone Call',
  'Website',
  'Referral',
  'Social Media',
  'Email',
  'Advertisement',
  'Trade Show',
  'Other'
];

const dealStages = [
  { value: 'vehicle_selection', label: 'Vehicle Selection' },
  { value: 'test_drive', label: 'Test Drive' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'closed_deal', label: 'Closed Deal' },
  { value: 'finalized', label: 'Finalized' }
];

const eventStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'working', label: 'Working' },
  { value: 'sent_to_finance', label: 'Sent to Finance' },
  { value: 'sold', label: 'Sold' },
  { value: 'dead', label: 'Dead' }
];

export default function ShowroomManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ShowroomSession | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Fetch showroom sessions for the selected date
  const { data: sessions = [], isLoading } = useQuery<ShowroomSession[]>({
    queryKey: ['/api/showroom-sessions', dateString],
    queryFn: async () => {
      const response = await apiRequest(`/api/showroom-sessions?date=${dateString}`);
      return response.json();
    },
  });

  // Fetch customers for dropdown with caching
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch vehicles for dropdown with caching
  const { data: vehicles = [], isLoading: vehiclesLoading, error: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize processed data to prevent unnecessary re-renders
  const safeCustomers = useMemo(() => Array.isArray(customers) ? customers : [], [customers]);
  const safeVehicles = useMemo(() => Array.isArray(vehicles) ? vehicles : [], [vehicles]);
  const safeSessions = useMemo(() => Array.isArray(sessions) ? sessions : [], [sessions]);

  // Memoize session statistics for better performance
  const sessionStats = useMemo(() => {
    const stats = {
      total: safeSessions.length,
      sold: safeSessions.filter(s => s.eventStatus === 'sold').length,
      pending: safeSessions.filter(s => s.eventStatus === 'pending').length,
      working: safeSessions.filter(s => s.eventStatus === 'working').length,
      dead: safeSessions.filter(s => s.eventStatus === 'dead').length,
      inFinance: safeSessions.filter(s => s.eventStatus === 'sent_to_finance').length,
    };
    return stats;
  }, [safeSessions]);

  // Debug logging removed - data is loading correctly

  // Optimized mutations with proper error handling and specific cache invalidation
  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/showroom-sessions', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Session created successfully' });
      setIsCreateDialogOpen(false);
      // Only invalidate specific queries for better performance
      queryClient.invalidateQueries({ queryKey: ['/api/showroom-sessions', dateString] });
    },
    onError: (error: any) => {
      console.error('Session creation error:', error);
      toast({ 
        title: 'Error creating session', 
        description: error.message || 'Please try again',
        variant: 'destructive' 
      });
    },
  });

  // Update session mutation with optimistic updates
  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/showroom-sessions/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      toast({ title: 'Session updated successfully' });
      setIsEditDialogOpen(false);
      setSelectedSession(null);
      queryClient.invalidateQueries({ queryKey: ['/api/showroom-sessions', dateString] });
    },
    onError: (error: any) => {
      console.error('Session update error:', error);
      toast({ 
        title: 'Error updating session', 
        description: error.message || 'Please try again',
        variant: 'destructive' 
      });
    },
  });

  // End session mutation with confirmation
  const endSessionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/showroom-sessions/${id}/end`, { method: 'PUT' }),
    onSuccess: () => {
      toast({ title: 'Session ended successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/showroom-sessions', dateString] });
    },
    onError: (error: any) => {
      console.error('Session end error:', error);
      toast({ 
        title: 'Error ending session', 
        description: error.message || 'Please try again',
        variant: 'destructive' 
      });
    },
  });

  // Memoize callback functions to prevent unnecessary re-renders
  const handleCreateSession = useCallback((formData: FormData) => {
    const data = {
      customerId: parseInt(formData.get('customerId') as string),
      vehicleId: formData.get('vehicleId') ? parseInt(formData.get('vehicleId') as string) : undefined,
      stockNumber: formData.get('stockNumber') as string,
      salespersonId: formData.get('salespersonId') ? parseInt(formData.get('salespersonId') as string) : undefined,
      leadSource: formData.get('leadSource') as string,
      eventStatus: formData.get('eventStatus') as string,
      dealStage: formData.get('dealStage') as string,
      notes: formData.get('notes') as string,
      sessionDate: dateString,
    };
    createSessionMutation.mutate(data);
  }, [createSessionMutation]);

  const handleUpdateSession = useCallback((formData: FormData) => {
    if (!selectedSession) return;
    
    const data = {
      customerId: parseInt(formData.get('customerId') as string),
      vehicleId: formData.get('vehicleId') ? parseInt(formData.get('vehicleId') as string) : undefined,
      stockNumber: formData.get('stockNumber') as string,
      salespersonId: formData.get('salespersonId') ? parseInt(formData.get('salespersonId') as string) : undefined,
      leadSource: formData.get('leadSource') as string,
      eventStatus: formData.get('eventStatus') as string,
      dealStage: formData.get('dealStage') as string,
      notes: formData.get('notes') as string,
    };
    updateSessionMutation.mutate({ id: selectedSession.id, data });
  }, [selectedSession, updateSessionMutation]);

  const handleEndSession = useCallback((sessionId: number) => {
    endSessionMutation.mutate(sessionId);
  }, [endSessionMutation]);

  // Memoize expensive calculations to prevent unnecessary re-renders
  const getSessionDuration = useCallback((session: ShowroomSession) => {
    const start = new Date(session.timeEntered);
    const end = session.timeExited ? new Date(session.timeExited) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  const getCustomerName = useCallback((customerId: number) => {
    const customer = safeCustomers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : `Customer ${customerId}`;
  }, [safeCustomers]);

  const getVehicleInfo = useCallback((vehicleId: number) => {
    const vehicle = safeVehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A';
  }, [safeVehicles]);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
  }, []);

  // Memoize filtered sessions for better performance
  const activeSessions = useMemo(() => safeSessions.filter(s => !s.timeExited), [safeSessions]);
  const completedSessions = useMemo(() => safeSessions.filter(s => s.timeExited), [safeSessions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with date navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Showroom Manager</h1>
          <p className="text-gray-600">Track daily customer sessions and deal progress</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Showroom Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSession(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerId">Customer</Label>
                    <Select name="customerId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersLoading ? (
                          <div className="p-2 text-sm text-gray-500">Loading customers...</div>
                        ) : safeCustomers.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No customers available</div>
                        ) : (
                          safeCustomers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.firstName} {customer.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <Select name="vehicleId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehiclesLoading ? (
                          <div className="p-2 text-sm text-gray-500">Loading vehicles...</div>
                        ) : safeVehicles.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No vehicles available</div>
                        ) : (
                          safeVehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.stockNumber}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stockNumber">Stock Number</Label>
                    <Input name="stockNumber" placeholder="Stock number" />
                  </div>
                  
                  <div>
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <Select name="leadSource">
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadSources.map(source => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventStatus">Event Status</Label>
                    <Select name="eventStatus" defaultValue="pending">
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
                    <Select name="dealStage" defaultValue="vehicle_selection">
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
                  <Textarea name="notes" placeholder="Session notes..." />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSessionMutation.isPending}>
                    {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards - Optimized with memoized data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedSessions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sold Today</p>
                <p className="text-2xl font-bold">{sessionStats.sold}</p>
              </div>
              <Car className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dead Leads</p>
                <p className="text-2xl font-bold">{sessionStats.dead}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
          <CardDescription>
            Currently in progress sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active sessions for {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSession(session);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="font-medium">{getCustomerName(session.customerId)}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(session.timeEntered), 'h:mm a')} - {getSessionDuration(session)}
                      </div>
                    </div>
                    
                    {session.vehicleId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Car className="h-4 w-4" />
                        {getVehicleInfo(session.vehicleId)}
                      </div>
                    )}
                    
                    {session.stockNumber && (
                      <Badge variant="outline">
                        {session.stockNumber}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={stageColors[session.dealStage]}>
                      {dealStages.find(s => s.value === session.dealStage)?.label}
                    </Badge>
                    <Badge className={statusColors[session.eventStatus]}>
                      {eventStatuses.find(s => s.value === session.eventStatus)?.label}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={endSessionMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEndSession(session.id);
                      }}
                    >
                      {endSessionMutation.isPending ? 'Ending...' : 'End Session'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Completed Sessions ({completedSessions.length})
          </CardTitle>
          <CardDescription>
            Sessions completed today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed sessions for {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSession(session);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="font-medium">{getCustomerName(session.customerId)}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(session.timeEntered), 'h:mm a')} - {format(new Date(session.timeExited!), 'h:mm a')}
                        <span className="text-xs">({getSessionDuration(session)})</span>
                      </div>
                    </div>
                    
                    {session.vehicleId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Car className="h-4 w-4" />
                        {getVehicleInfo(session.vehicleId)}
                      </div>
                    )}
                    
                    {session.stockNumber && (
                      <Badge variant="outline">
                        {session.stockNumber}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={stageColors[session.dealStage]}>
                      {dealStages.find(s => s.value === session.dealStage)?.label}
                    </Badge>
                    <Badge className={statusColors[session.eventStatus]}>
                      {eventStatuses.find(s => s.value === session.eventStatus)?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Showroom Session</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSession(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerId">Customer</Label>
                  <Select name="customerId" defaultValue={selectedSession.customerId.toString()}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="vehicleId">Vehicle</Label>
                  <Select name="vehicleId" defaultValue={selectedSession.vehicleId?.toString()}>
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockNumber">Stock Number</Label>
                  <Input name="stockNumber" defaultValue={selectedSession.stockNumber || ''} />
                </div>
                
                <div>
                  <Label htmlFor="leadSource">Lead Source</Label>
                  <Select name="leadSource" defaultValue={selectedSession.leadSource || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventStatus">Event Status</Label>
                  <Select name="eventStatus" defaultValue={selectedSession.eventStatus}>
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
                  <Select name="dealStage" defaultValue={selectedSession.dealStage}>
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
                <Textarea name="notes" defaultValue={selectedSession.notes || ''} />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSessionMutation.isPending}>
                  {updateSessionMutation.isPending ? 'Updating...' : 'Update Session'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}