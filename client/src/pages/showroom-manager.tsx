import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Car,
  DollarSign,
  Phone,
  MessageSquare,
  User,
  Calculator,
  PlusCircle,
  FileText,
  ArrowUpDown
} from "lucide-react";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import { useToast } from "@/hooks/use-toast";
import UniformPage from "@/components/layout/uniform-page";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status?: string;
  notes?: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin?: string;
  price: number;
  stockNumber?: string;
}

interface ShowroomSession {
  id: string;
  customerId: number;
  customerName?: string;
  status: 'active' | 'completed' | 'sold' | 'left';
  startTime: string;
  endTime?: string;
  salesConsultant: string;
  interestLevel: 'low' | 'medium' | 'high';
  vehiclesViewed: string[];
  notes: string;
  estimatedValue?: number;
  nextAction?: string;
  tradeInVehicle?: string;
  tradeInValue?: number;
}

export default function ShowroomManager() {
  const { trackInteraction } = usePixelTracker();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFilter, setSelectedFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ShowroomSession | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [tradeInInfo, setTradeInInfo] = useState({ vehicle: '', value: '' });
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time timer update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch data
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: sessions = [], isLoading } = useQuery<ShowroomSession[]>({
    queryKey: ['/api/showroom/sessions'],
    // Mock data fallback for demo
    initialData: [
      {
        id: 'session-1',
        customerId: 1,
        customerName: 'John Smith',
        status: 'active',
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        salesConsultant: 'Mike Johnson',
        interestLevel: 'high',
        vehiclesViewed: ['2024 Toyota Camry'],
        notes: 'Interested in hybrid options',
        estimatedValue: 28000,
        nextAction: 'Schedule test drive',
      },
      {
        id: 'session-2',
        customerId: 2,
        customerName: 'Sarah Davis',
        status: 'active',
        startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        salesConsultant: 'Tom Wilson',
        interestLevel: 'medium',
        vehiclesViewed: ['2023 Ford F-150'],
        notes: 'Looking for work truck',
        estimatedValue: 35000,
        nextAction: 'Review financing options',
        tradeInVehicle: '2018 Ford F-150',
        tradeInValue: 18000,
      },
    ],
  });

  // Metrics
  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedToday = sessions.filter(s => s.status === 'completed');
  const soldToday = sessions.filter(s => s.status === 'sold');
  const conversionRate = sessions.length > 0 ? 
    ((soldToday.length / sessions.length) * 100).toFixed(1) : '0';

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (selectedFilter !== 'all' && session.status !== selectedFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        session.customerName?.toLowerCase().includes(search) ||
        session.salesConsultant.toLowerCase().includes(search) ||
        session.notes.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Mutations
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<ShowroomSession> }) => {
      return await apiRequest(`/api/showroom/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/showroom/sessions'] });
      toast({ title: "Updated successfully" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  // Handlers
  const handleCustomerClick = (customerId: number) => {
    trackInteraction('customer_click', { customerId });
    setLocation(`/customers/${customerId}`);
  };

  const createDealMutation = useMutation({
    mutationFn: async (data: { customerId: number; customerName: string; vehicleId?: number; sessionId: string }) => {
      return await apiRequest('/api/deals', {
        method: 'POST',
        body: JSON.stringify({
          customerId: data.customerId.toString(),
          vehicleId: data.vehicleId?.toString(),
          buyerName: data.customerName,
          status: 'structuring',
          dealType: 'retail',
        }),
      });
    },
    onSuccess: (data: any) => {
      toast({ title: "Deal created", description: `Deal #${data.dealNumber || data.id} created successfully` });
      trackInteraction('deal_created', { dealId: data.id });
      setLocation(`/professional-deal-desk/${data.id}`);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create deal";
      toast({ 
        title: "Failed to create deal", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const handleWorkDeal = (session: ShowroomSession) => {
    trackInteraction('work_deal', { sessionId: session.id });
    // Disable button while creating deal
    if (createDealMutation.isPending) return;
    
    // Create a deal in the database
    createDealMutation.mutate({
      customerId: session.customerId,
      customerName: session.customerName || `Customer #${session.customerId}`,
      sessionId: session.id,
    });
  };

  const handleAddVehicle = (session: ShowroomSession) => {
    setSelectedSession(session);
    setShowVehicleDialog(true);
  };

  const handleAddNote = (session: ShowroomSession) => {
    setSelectedSession(session);
    setNoteText(session.notes || '');
    setShowNoteDialog(true);
  };

  const handleAddTrade = (session: ShowroomSession) => {
    setSelectedSession(session);
    setTradeInInfo({
      vehicle: session.tradeInVehicle || '',
      value: session.tradeInValue?.toString() || '',
    });
    setShowTradeDialog(true);
  };

  const handleCall = (session: ShowroomSession) => {
    const customer = customers.find(c => c.id === session.customerId);
    if (customer?.phone) {
      window.location.href = `tel:${customer.phone}`;
      trackInteraction('call_customer', { customerId: session.customerId });
    }
  };

  const handleText = (session: ShowroomSession) => {
    const customer = customers.find(c => c.id === session.customerId);
    if (customer?.phone) {
      setLocation(`/customers/texting-portal?customerId=${session.customerId}`);
      trackInteraction('text_customer', { customerId: session.customerId });
    }
  };

  const saveNote = () => {
    if (selectedSession) {
      updateSessionMutation.mutate({
        sessionId: selectedSession.id,
        updates: { notes: noteText },
      });
      setShowNoteDialog(false);
      setSelectedSession(null);
      setNoteText('');
    }
  };

  const saveVehicle = () => {
    if (selectedSession && selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        updateSessionMutation.mutate({
          sessionId: selectedSession.id,
          updates: { 
            vehiclesViewed: [...selectedSession.vehiclesViewed, vehicleDisplay],
            estimatedValue: vehicle.price,
          },
        });
      }
      setShowVehicleDialog(false);
      setSelectedSession(null);
      setSelectedVehicleId(null);
    }
  };

  const saveTrade = () => {
    if (selectedSession) {
      updateSessionMutation.mutate({
        sessionId: selectedSession.id,
        updates: { 
          tradeInVehicle: tradeInInfo.vehicle,
          tradeInValue: parseFloat(tradeInInfo.value) || 0,
        },
      });
      setShowTradeDialog(false);
      setSelectedSession(null);
      setTradeInInfo({ vehicle: '', value: '' });
    }
  };

  const updateInterestLevel = (sessionId: string, level: string) => {
    updateSessionMutation.mutate({
      sessionId,
      updates: { interestLevel: level as any },
    });
  };

  const updateStatus = (sessionId: string, status: 'active' | 'completed' | 'sold' | 'left') => {
    updateSessionMutation.mutate({
      sessionId,
      updates: { 
        status,
        endTime: status !== 'active' ? new Date().toISOString() : undefined,
      },
    });
    trackInteraction('status_change', { sessionId, status });
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getInterestBadge = (level: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      sold: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      left: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.left;
  };

  if (isLoading) {
    return (
      <UniformPage title="Showroom Manager" subtitle="Live customer tracking">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </UniformPage>
    );
  }

  return (
    <UniformPage title="Showroom Manager" subtitle="Live customer tracking and sales floor management">
      <div className="space-y-6">
        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'active' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedFilter('active')}
            data-testid="metric-active"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Now</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeSessions.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'completed' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setSelectedFilter('completed')}
            data-testid="metric-completed"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedToday.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'sold' ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedFilter('sold')}
            data-testid="metric-sold"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sold Today</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{soldToday.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'all' ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setSelectedFilter('all')}
            data-testid="metric-conversion"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Close Rate</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search customers, consultants, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            data-testid="input-search"
          />
        </div>

        {/* Active Customer Cards */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No {selectedFilter === 'all' ? 'sessions' : selectedFilter} sessions found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow" data-testid={`card-session-${session.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="cursor-pointer hover:underline"
                        onClick={() => handleCustomerClick(session.customerId)}
                        data-testid={`link-customer-${session.customerId}`}
                      >
                        <CardTitle className="text-lg text-blue-600 dark:text-blue-400">
                          {session.customerName || `Customer #${session.customerId}`}
                        </CardTitle>
                      </div>
                      <Badge className={getStatusBadge(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {formatDuration(session.startTime)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Session Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Sales Consultant</p>
                      <p className="font-medium">{session.salesConsultant}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Interest Level</p>
                      <Select
                        value={session.interestLevel}
                        onValueChange={(value) => updateInterestLevel(session.id, value)}
                      >
                        <SelectTrigger className="w-full" data-testid={`select-interest-${session.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Estimated Value</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        ${session.estimatedValue?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>

                  {/* Vehicles Viewed */}
                  {session.vehiclesViewed.length > 0 && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">Vehicles Viewed</p>
                      <div className="flex flex-wrap gap-2">
                        {session.vehiclesViewed.map((vehicle, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Car className="h-3 w-3 mr-1" />
                            {vehicle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trade-In */}
                  {session.tradeInVehicle && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Trade-In</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700 dark:text-blue-300">{session.tradeInVehicle}</p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                          ${session.tradeInValue?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{session.notes}</p>
                    </div>
                  )}

                  {/* Status Change Buttons */}
                  {session.status === 'active' && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Status:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => updateStatus(session.id, 'sold')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                          data-testid={`button-mark-sold-${session.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Sold
                        </Button>
                        <Button
                          onClick={() => updateStatus(session.id, 'completed')}
                          variant="outline"
                          size="sm"
                          data-testid={`button-mark-completed-${session.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Button>
                        <Button
                          onClick={() => updateStatus(session.id, 'left')}
                          variant="destructive"
                          size="sm"
                          data-testid={`button-mark-dead-${session.id}`}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Dead/Left
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t dark:border-gray-700">
                    <Button
                      onClick={() => handleWorkDeal(session)}
                      className="w-full"
                      size="sm"
                      disabled={createDealMutation.isPending}
                      data-testid={`button-work-deal-${session.id}`}
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      {createDealMutation.isPending ? 'Creating...' : 'Work Deal'}
                    </Button>
                    <Button
                      onClick={() => handleAddVehicle(session)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-add-vehicle-${session.id}`}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Vehicle
                    </Button>
                    <Button
                      onClick={() => handleAddNote(session)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-add-note-${session.id}`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Notes
                    </Button>
                    <Button
                      onClick={() => handleAddTrade(session)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-trade-in-${session.id}`}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      Trade-In
                    </Button>
                    <Button
                      onClick={() => handleCall(session)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-call-${session.id}`}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      onClick={() => handleText(session)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-text-${session.id}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                    <Button
                      onClick={() => handleCustomerClick(session.customerId)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-profile-${session.id}`}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Visit Notes</DialogTitle>
            <DialogDescription>
              Record notes about this customer visit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter visit notes..."
              rows={4}
              data-testid="textarea-notes"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveNote} data-testid="button-save-note">
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle to Visit</DialogTitle>
            <DialogDescription>
              Select a vehicle the customer viewed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={selectedVehicleId?.toString()}
              onValueChange={(value) => setSelectedVehicleId(parseInt(value))}
            >
              <SelectTrigger data-testid="select-vehicle">
                <SelectValue placeholder="Select vehicle..." />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveVehicle} disabled={!selectedVehicleId} data-testid="button-save-vehicle">
                Add Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Trade-In Dialog */}
      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trade-In</DialogTitle>
            <DialogDescription>
              Record trade-in vehicle information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Vehicle Description</label>
              <Input
                value={tradeInInfo.vehicle}
                onChange={(e) => setTradeInInfo({ ...tradeInInfo, vehicle: e.target.value })}
                placeholder="e.g., 2018 Honda Civic"
                data-testid="input-trade-vehicle"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Trade Value</label>
              <Input
                type="number"
                value={tradeInInfo.value}
                onChange={(e) => setTradeInInfo({ ...tradeInInfo, value: e.target.value })}
                placeholder="0"
                data-testid="input-trade-value"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTradeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveTrade} data-testid="button-save-trade">
                Save Trade-In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </UniformPage>
  );
}
