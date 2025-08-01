import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Car, FileText, Timer, CheckCircle, AlertCircle, XCircle, ArrowRight, Receipt, Menu, Search, Filter, RefreshCw, Download, Grid, List, MoreHorizontal, Edit, Eye, ExternalLink, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('live-dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const urlProcessedRef = useRef(false);

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

  // End session mutation with notes and reason
  const endSessionMutation = useMutation({
    mutationFn: ({ id, endNotes, endReason }: { id: number, endNotes?: string, endReason?: string }) => 
      apiRequest(`/api/showroom-sessions/${id}/end`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endNotes, endReason })
      }),
    onSuccess: () => {
      toast({ title: 'Session ended successfully' });
      setIsEndDialogOpen(false);
      setSelectedSession(null);
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

  // Quick update mutations
  const quickUpdateMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number, field: string, value: string }) => {
      console.log('Sending quick update request:', { id, field, value });
      return apiRequest(`/api/showroom-sessions/${id}/quick-update`, { 
        method: 'PUT',
        body: { field, value }
      });
    },
    onSuccess: () => {
      toast({ title: 'Session updated successfully' });
      setIsStatusDialogOpen(false);
      setIsStageDialogOpen(false);
      setSelectedSession(null);
      queryClient.invalidateQueries({ queryKey: ['/api/showroom-sessions', dateString] });
    },
    onError: (error: any) => {
      console.error('Quick update error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({ 
        title: 'Error updating session', 
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
    trackInteraction('session_create', 'new-session-form', data.customerId);
    createSessionMutation.mutate(data);
  }, [createSessionMutation, trackInteraction, dateString]);

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
    trackInteraction('session_update', `session-${selectedSession.id}`, selectedSession.id);
    updateSessionMutation.mutate({ id: selectedSession.id, data });
  }, [selectedSession, updateSessionMutation, trackInteraction]);

  const handleEndSession = useCallback((session: ShowroomSession) => {
    trackInteraction('session_end', `session-${session.id}`, session.id);
    setSelectedSession(session);
    setIsEndDialogOpen(true);
  }, [trackInteraction]);

  const handleQuickStatusUpdate = useCallback((session: ShowroomSession) => {
    setSelectedSession(session);
    setIsStatusDialogOpen(true);
    trackInteraction('quick_status_click', 'status-badge', session.id);
  }, [trackInteraction]);

  const handleQuickStageUpdate = useCallback((session: ShowroomSession) => {
    setSelectedSession(session);
    setIsStageDialogOpen(true);
  }, []);

  const handleEndSessionSubmit = useCallback((formData: FormData) => {
    if (!selectedSession) return;
    
    const endNotes = formData.get('endNotes') as string;
    const endReason = formData.get('endReason') as string;
    
    endSessionMutation.mutate({ 
      id: selectedSession.id, 
      endNotes, 
      endReason 
    });
  }, [selectedSession, endSessionMutation]);

  // Create deal from session
  const handleCreateDeal = useCallback((session: ShowroomSession) => {
    // Generate deal number based on current date and session ID
    const dealNumber = `D${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(session.id).padStart(3, '0')}`;
    
    // Create deal data structure based on session information
    const dealData = {
      dealNumber,
      customerId: session.customerId,
      vehicleId: session.vehicleId,
      stockNumber: session.stockNumber,
      salespersonId: session.salespersonId,
      leadSource: session.leadSource,
      notes: `Created from showroom session #${session.id}. Original notes: ${session.notes || 'None'}`,
      sessionId: session.id, // Reference to original session
      dealStage: session.dealStage,
      eventStatus: session.eventStatus
    };

    // Store deal data in localStorage for transfer to deal desk
    localStorage.setItem('pendingDeal', JSON.stringify(dealData));
    
    // Track the action
    trackInteraction('deal_creation', 'showroom-to-deal', session.customerId);
    
    // Show success message
    toast({
      title: 'Deal Created Successfully',
      description: `Deal ${dealNumber} created. Redirecting to Deal Desk...`,
    });
    
    // Navigate to deal desk after a brief delay
    setTimeout(() => {
      navigate('/deal-desk');
    }, 1500);
  }, [trackInteraction, toast, navigate]);

  // Handle URL parameter for automatic session creation from customer pages (once only)
  useEffect(() => {
    trackInteraction('showroom_page_view', 'showroom-manager-page');
    
    if (urlProcessedRef.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const createSessionParam = urlParams.get('createSession');
    
    if (createSessionParam) {
      urlProcessedRef.current = true;
      
      // Clear the URL parameter immediately to prevent duplicate calls
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
      
      try {
        const sessionData = JSON.parse(decodeURIComponent(createSessionParam));
        
        // Create the session with a slight delay to ensure mutations are ready
        setTimeout(() => {
          createSessionMutation.mutate(sessionData, {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Showroom visit started successfully!",
              });
            },
            onError: (error) => {
              console.error('Session creation error:', error);
              toast({
                title: "Error",
                description: "Failed to start showroom visit.",
                variant: "destructive",
              });
            }
          });
        }, 100);
      } catch (error) {
        console.error('Error parsing session data from URL:', error);
        toast({
          title: "Error",
          description: "Invalid session data in URL.",
          variant: "destructive",
        });
      }
    }
  }, [createSessionMutation, trackInteraction, toast]);

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
    trackInteraction('date_navigation', `date-${direction}`, selectedDate.getTime());
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
  }, [trackInteraction, selectedDate]);

  const handleTabChange = useCallback((tab: string) => {
    trackInteraction('tab_change', `showroom-tab-${tab}`);
    setActiveTab(tab);
  }, [trackInteraction]);

  // Add missing handler functions for the professional interface
  const handleStatusChange = useCallback((sessionId: number, newStatus: string) => {
    quickUpdateMutation.mutate({ 
      id: sessionId, 
      field: 'eventStatus', 
      value: newStatus 
    });
    trackInteraction('status_change', `status-${newStatus}`, sessionId);
  }, [quickUpdateMutation, trackInteraction]);

  const handleStageChange = useCallback((sessionId: number, newStage: string) => {
    quickUpdateMutation.mutate({ 
      id: sessionId, 
      field: 'dealStage', 
      value: newStage 
    });
    trackInteraction('stage_change', `stage-${newStage}`, sessionId);
  }, [quickUpdateMutation, trackInteraction]);



  // Memoize filtered sessions for better performance
  const activeSessions = useMemo(() => safeSessions.filter(s => !s.timeExited), [safeSessions]);
  const completedSessions = useMemo(() => safeSessions.filter(s => s.timeExited), [safeSessions]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay for Sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Professional Sidebar Navigation */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">Showroom Manager</h1>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Live command center</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 lg:p-4 space-y-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Customer Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 lg:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg lg:text-xl">Create New Customer Visit</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSession(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="flex flex-col md:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full md:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSessionMutation.isPending} className="w-full md:w-auto">
                    {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 lg:p-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                handleTabChange('live-dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'live-dashboard' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Timer className="h-3 w-3 lg:h-4 lg:w-4 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="truncate">Live Dashboard</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                handleTabChange('active-customers');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'active-customers' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <User className="h-3 w-3 lg:h-4 lg:w-4 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="truncate">Active Customers</span>
                <Badge className="ml-auto bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 h-4">{activeSessions.length}</Badge>
              </div>
            </button>
            
            <button
              onClick={() => {
                handleTabChange('completed-today');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'completed-today' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="truncate">Completed Today</span>
                <Badge className="ml-auto bg-green-100 text-green-800 text-xs px-1.5 py-0.5 h-4">{completedSessions.length}</Badge>
              </div>
            </button>
          </div>
        </nav>

        {/* Date Navigation Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Date</span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate('prev')}
              className="p-2 h-8 w-8"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex-1 text-center">
              <p className="text-xs font-medium text-gray-900">{format(selectedDate, 'MMM d')}</p>
              <p className="text-xs text-gray-600">{format(selectedDate, 'EEEE')}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate('next')}
              className="p-2 h-8 w-8"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="text-center flex-1">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {activeTab === 'live-dashboard' && 'Live Dashboard'}
                {activeTab === 'active-customers' && 'Active Customers'}
                {activeTab === 'completed-today' && 'Completed Today'}
              </h2>
              <p className="text-xs text-gray-600 truncate">{format(selectedDate, 'MMM d, yyyy')}</p>
            </div>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
              {sessionStats.total}
            </Badge>
          </div>
        </div>

        {/* Desktop Header Bar */}
        <div className="hidden lg:block bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'live-dashboard' && 'Live Dashboard'}
                {activeTab === 'active-customers' && 'Active Customers'}
                {activeTab === 'completed-today' && 'Completed Today'}
              </h2>
              <p className="text-sm text-gray-600">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {sessionStats.total} total sessions
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-3 lg:p-6">
          {/* Live Dashboard Content */}
          {activeTab === 'live-dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Active Sessions</p>
                        <p className="text-xl lg:text-2xl font-bold">{activeSessions.length}</p>
                      </div>
                      <Timer className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Completed</p>
                        <p className="text-xl lg:text-2xl font-bold">{completedSessions.length}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Sold Today</p>
                        <p className="text-xl lg:text-2xl font-bold">{sessionStats.sold}</p>
                      </div>
                      <Car className="h-6 w-6 lg:h-8 lg:w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Conv. Rate</p>
                        <p className="text-xl lg:text-2xl font-bold">
                          {sessionStats.total > 0 ? Math.round((sessionStats.sold / sessionStats.total) * 100) : 0}%
                        </p>
                      </div>
                      <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {safeSessions.slice(0, 5).map(session => (
                        <div key={session.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{getCustomerName(session.customerId)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${statusColors[session.eventStatus]}`}>
                              {eventStatuses.find(s => s.value === session.eventStatus)?.label}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(session.timeEntered), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Sessions</span>
                        <Badge variant="outline">{sessionStats.total}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active</span>
                        <Badge className="bg-blue-100 text-blue-800">{activeSessions.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completed</span>
                        <Badge className="bg-green-100 text-green-800">{completedSessions.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Sold</span>
                        <Badge className="bg-emerald-100 text-emerald-800">{sessionStats.sold}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Dead Leads</span>
                        <Badge className="bg-red-100 text-red-800">{sessionStats.dead}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Active Customers Content */}
          {activeTab === 'active-customers' && (
            <div className="space-y-6">
              {/* Professional CRM-Style Toolbar */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Active Customer Sessions</h3>
                      <Badge variant="outline" className="ml-2">{activeSessions.length}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                      <Button size="sm" variant="outline" className="h-8">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search and Filter Bar */}
                  <div className="flex flex-col lg:flex-row gap-4 mt-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search customers, vehicles, or notes..."
                        className="pl-9 h-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40 h-9">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="working">Working</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="sent_to_finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-36 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stages</SelectItem>
                          <SelectItem value="vehicle_selection">Selection</SelectItem>
                          <SelectItem value="test_drive">Test Drive</SelectItem>
                          <SelectItem value="numbers">Numbers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Professional Table View */}
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
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading sessions...</td>
                        </tr>
                      ) : activeSessions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            No active sessions for {format(selectedDate, 'MMMM d, yyyy')}
                          </td>
                        </tr>
                      ) : (
                        activeSessions.map((session) => (
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
                                    setIsEditDialogOpen(true);
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
            </div>
          )}



          {/* Completed Today Content */}
          {activeTab === 'completed-today' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Completed Sessions Today ({completedSessions.length})
                  </CardTitle>
                  <CardDescription>
                    Sessions completed on {format(selectedDate, 'MMMM d, yyyy')}
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
                          className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <div className="font-medium">{getCustomerName(session.customerId)}</div>
                                <div className="text-sm text-gray-600">
                                  {format(new Date(session.timeEntered), 'h:mm a')} - {format(new Date(session.timeExited!), 'h:mm a')}
                                  <span className="ml-2">({getSessionDuration(session)})</span>
                                </div>
                              </div>
                            </div>
                            
                            {session.vehicleId && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Car className="h-4 w-4" />
                                <span>{getVehicleInfo(session.vehicleId)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={statusColors[session.eventStatus]}>
                              {eventStatuses.find(s => s.value === session.eventStatus)?.label}
                            </Badge>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSession(session);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* All Dialogs */}
      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Showroom Session</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSession(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="flex flex-col md:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full md:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSessionMutation.isPending} className="w-full md:w-auto">
                  {updateSessionMutation.isPending ? 'Updating...' : 'Update Session'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* End Visit Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Visit</DialogTitle>
            <DialogDescription>
              {selectedSession && `End visit for ${getCustomerName(selectedSession.customerId)}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleEndSessionSubmit(formData);
          }}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="endNotes" className="text-right">
                  Visit Notes
                </Label>
                <Textarea
                  id="endNotes"
                  name="endNotes"
                  placeholder="What happened during this visit? Customer feedback, concerns, next steps..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="endReason" className="text-right">
                  Visit Outcome
                </Label>
                <Select name="endReason">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select visit outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase_completed">Purchase Completed</SelectItem>
                    <SelectItem value="test_drive_only">Test Drive Only</SelectItem>
                    <SelectItem value="information_gathering">Information Gathering</SelectItem>
                    <SelectItem value="pricing_concerns">Pricing Concerns</SelectItem>
                    <SelectItem value="credit_issues">Credit Issues</SelectItem>
                    <SelectItem value="needs_time_to_decide">Needs Time to Decide</SelectItem>
                    <SelectItem value="looking_at_other_dealers">Looking at Other Dealers</SelectItem>
                    <SelectItem value="trade_value_concerns">Trade Value Concerns</SelectItem>
                    <SelectItem value="financing_concerns">Financing Concerns</SelectItem>
                    <SelectItem value="spouse_approval_needed">Spouse Approval Needed</SelectItem>
                    <SelectItem value="will_return_later">Will Return Later</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEndDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={endSessionMutation.isPending}>
                {endSessionMutation.isPending ? 'Ending Visit...' : 'End Visit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent aria-describedby="status-dialog-description" className="w-11/12 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Update Status</DialogTitle>
            <DialogDescription id="status-dialog-description" className="text-sm text-gray-600">
              {selectedSession && `Update status for ${getCustomerName(selectedSession.customerId)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              {eventStatuses.map(status => (
                <Button
                  key={status.value}
                  variant={selectedSession?.eventStatus === status.value ? "default" : "outline"}
                  className="w-full justify-start text-sm py-3 h-auto"
                  onClick={() => {
                    if (selectedSession) {
                      quickUpdateMutation.mutate({
                        id: selectedSession.id,
                        field: 'eventStatus',
                        value: status.value
                      });
                    }
                  }}
                  disabled={quickUpdateMutation.isPending}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Stage Update Dialog */}
      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent aria-describedby="stage-dialog-description" className="w-11/12 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Update Deal Stage</DialogTitle>
            <DialogDescription id="stage-dialog-description" className="text-sm text-gray-600">
              {selectedSession && `Update deal stage for ${getCustomerName(selectedSession.customerId)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              {dealStages.map(stage => (
                <Button
                  key={stage.value}
                  variant={selectedSession?.dealStage === stage.value ? "default" : "outline"}
                  className="w-full justify-start text-sm py-3 h-auto"
                  onClick={() => {
                    if (selectedSession) {
                      quickUpdateMutation.mutate({
                        id: selectedSession.id,
                        field: 'dealStage',
                        value: stage.value
                      });
                    }
                  }}
                  disabled={quickUpdateMutation.isPending}
                >
                  {stage.label}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStageDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
