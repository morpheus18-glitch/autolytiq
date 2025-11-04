import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  ArrowUpDown,
  CreditCard,
  ClipboardPlus,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
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
  status?: string;
  startTime: string;
  endTime?: string;
  salesConsultant?: string;
  interestLevel?: 'low' | 'medium' | 'high';
  vehiclesViewed?: string[];
  notes?: string;
  estimatedValue?: number;
  nextAction?: string;
  tradeInVehicle?: string;
  tradeInValue?: number;
  vehicleId?: number;
  stockNumber?: string;
  creditStatus?: 'pending' | 'submitted' | 'approved' | 'declined';
}

type SessionViewStatus = 'active' | 'sold' | 'unsold';

interface ShowroomManagerProps {
  mode?: 'showroom' | 'deals';
}

export function ShowroomManagerPage({ mode = 'showroom' }: ShowroomManagerProps) {
  const { trackInteraction } = usePixelTracker();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFilter, setSelectedFilter] = useState<SessionViewStatus | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ShowroomSession | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [tradeInInfo, setTradeInInfo] = useState({ vehicle: '', value: '' });
  const [stockNumberEntry, setStockNumberEntry] = useState('');
  const [creditForm, setCreditForm] = useState({ income: '', housing: '', notes: '', consent: true });
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
        stockNumber: 'STK001',
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
        stockNumber: 'STK455',
      },
    ],
  });

  const deriveStatus = (session: ShowroomSession): SessionViewStatus => {
    const base = session.status?.toLowerCase();
    if (base === 'sold') return 'sold';
    if (base === 'completed' || base === 'left' || base === 'unsold' || base === 'dead') {
      return 'unsold';
    }
    return 'active';
  };

  const statusSummary = useMemo(() => {
    const summary: Record<SessionViewStatus, number> = {
      active: 0,
      sold: 0,
      unsold: 0,
    };

    sessions.forEach((session) => {
      const status = deriveStatus(session);
      summary[status] += 1;
    });

    return summary;
  }, [sessions]);

  const conversionRate = useMemo(() => {
    if (!sessions.length) return '0.0';
    const sold = sessions.filter(session => deriveStatus(session) === 'sold').length;
    return ((sold / sessions.length) * 100).toFixed(1);
  }, [sessions]);

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (selectedFilter !== 'all' && deriveStatus(session) !== selectedFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        session.customerName?.toLowerCase().includes(search) ||
        session.salesConsultant?.toLowerCase().includes(search) ||
        session.notes?.toLowerCase().includes(search) ||
        session.stockNumber?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const statusPriority: Record<SessionViewStatus, number> = {
    active: 0,
    sold: 1,
    unsold: 2,
  };

  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      const statusDiff = statusPriority[deriveStatus(a)] - statusPriority[deriveStatus(b)];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [filteredSessions]);

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
      const params = new URLSearchParams();
      params.set('customerId', data.customerId?.toString() || '');
      if (data.vehicleId) {
        params.set('vehicleId', data.vehicleId.toString());
      }
      setLocation(`/professional-deal-desk?${params.toString()}`);
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
      vehicleId: session.vehicleId,
    });
  };

  const handleAddVehicle = (session: ShowroomSession) => {
    setSelectedSession(session);
    setShowVehicleDialog(true);
    setStockNumberEntry(session.stockNumber || '');
    setSelectedVehicleId(session.vehicleId || null);
  };

  const handleVehicleDialogChange = (open: boolean) => {
    setShowVehicleDialog(open);
    if (!open) {
      setSelectedVehicleId(null);
      setStockNumberEntry('');
      setSelectedSession(null);
    }
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

  const handleAddCredit = (session: ShowroomSession) => {
    setSelectedSession(session);
    setCreditForm({ income: '', housing: '', notes: '', consent: true });
    setShowCreditDialog(true);
  };

  const handleCreditDialogChange = (open: boolean) => {
    setShowCreditDialog(open);
    if (!open) {
      setSelectedSession(null);
    }
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
      const customer = customers.find(c => c.id === selectedSession.customerId);
      if (customer) {
        apiRequest(`/api/customers/${customer.id}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: noteText,
            context: 'showroom_visit',
            sessionId: selectedSession.id,
            createdBy: 'Showroom Manager',
          }),
        }).catch(() => {
          toast({
            title: 'Customer note sync failed',
            description: 'The visit note was saved on the log but not synced to the customer profile.',
            variant: 'destructive',
          });
        });
      }
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
            vehiclesViewed: [...(selectedSession.vehiclesViewed || []), vehicleDisplay],
            estimatedValue: vehicle.price,
            vehicleId: vehicle.id,
            stockNumber: vehicle.stockNumber,
          },
        });
      }
      setShowVehicleDialog(false);
      setSelectedSession(null);
      setSelectedVehicleId(null);
      setStockNumberEntry('');
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

  const updateStatus = (session: ShowroomSession, status: SessionViewStatus) => {
    updateSessionMutation.mutate({
      sessionId: session.id,
      updates: {
        status: status === 'unsold' ? 'unsold' : status,
        endTime: status === 'active' ? undefined : new Date().toISOString(),
      },
    });
    trackInteraction('status_change', { sessionId: session.id, status });
  };

  const saveCreditApplication = async () => {
    if (!selectedSession) return;

    const customer = customers.find(c => c.id === selectedSession.customerId);
    try {
      await apiRequest('/api/credit-applications', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedSession.customerId,
          fullName: customer ? `${customer.firstName} ${customer.lastName}` : undefined,
          currentIncome: creditForm.income ? parseFloat(creditForm.income) : undefined,
          rentMortgage: creditForm.housing ? parseFloat(creditForm.housing) : undefined,
          notes: creditForm.notes,
          consentGiven: creditForm.consent,
          vehicleId: selectedSession.vehicleId,
          sessionId: selectedSession.id,
        }),
      });

      updateSessionMutation.mutate({
        sessionId: selectedSession.id,
        updates: {
          creditStatus: 'submitted',
          nextAction: 'Review credit application',
        },
      });

      toast({
        title: 'Credit application started',
        description: 'Application synced to the customer profile and deal desk.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to start credit application',
        description: error?.message || 'Try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setShowCreditDialog(false);
      setSelectedSession(null);
    }
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

  const getStatusBadge = (status: SessionViewStatus) => {
    const colors: Record<SessionViewStatus, string> = {
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sold: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      unsold: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <UniformPage
        title={mode === 'deals' ? 'Deal Pipeline' : 'Showroom Manager'}
        subtitle="Live customer tracking"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </UniformPage>
    );
  }

  const pageTitle = mode === 'deals' ? 'Deal Pipeline' : 'Showroom Manager';
  const pageSubtitle = mode === 'deals'
    ? 'Manage showroom traffic, prioritize deals, and launch desking workflows in one place'
    : 'Live customer tracking and sales floor management';

  return (
    <UniformPage
      title={pageTitle}
      subtitle={pageSubtitle}
      showSearch
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      actions={(
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/showroom/sessions'] })}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => setLocation('/professional-deal-desk')}>
            <Calculator className="h-4 w-4 mr-1" />
            Open Deal Desk
          </Button>
        </div>
      )}
    >
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
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusSummary.active}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statusSummary.sold}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'unsold' ? 'ring-2 ring-amber-500' : ''
            }`}
            onClick={() => setSelectedFilter('unsold')}
            data-testid="metric-unsold"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unsold Follow Up</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{statusSummary.unsold}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
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

        {/* Active Customer Cards */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {sortedSessions.length === 0 ? (
            <Card className="lg:col-span-2 xl:col-span-3">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No {selectedFilter === 'all' ? 'sessions' : `${selectedFilter} sessions`} found</p>
              </CardContent>
            </Card>
          ) : (
            sortedSessions.map((session) => {
              const status = deriveStatus(session);
              return (
                <Card key={session.id} className="border border-gray-200 dark:border-gray-700 hover:border-blue-500/60 transition-shadow shadow-sm hover:shadow-lg" data-testid={`card-session-${session.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <button
                          onClick={() => handleCustomerClick(session.customerId)}
                          className="text-left"
                          data-testid={`link-customer-${session.customerId}`}
                        >
                          <CardTitle className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                            {session.customerName || `Customer #${session.customerId}`}
                          </CardTitle>
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">With {session.salesConsultant || 'Unassigned'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Badge className={`${getStatusBadge(status)} capitalize`}>
                          {status === 'unsold' ? 'Unsold' : status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(session.startTime)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {session.stockNumber && (
                      <div className="flex items-center justify-between rounded-lg border border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">Attached Vehicle</p>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Stock #{session.stockNumber}</p>
                        </div>
                        <Car className="h-5 w-5 text-blue-500" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Interest Level</p>
                        <Select
                          value={session.interestLevel || 'medium'}
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
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Deal Value</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          ${session.estimatedValue?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>

                    {session.vehiclesViewed && session.vehiclesViewed.length > 0 && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">Vehicles Reviewed</p>
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

                    {session.notes && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{session.notes}</p>
                      </div>
                    )}

                    {status === 'active' && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Status:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            onClick={() => updateStatus(session, 'sold')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                            data-testid={`button-mark-sold-${session.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Sold
                          </Button>
                          <Button
                            onClick={() => updateStatus(session, 'unsold')}
                            variant="outline"
                            size="sm"
                            data-testid={`button-mark-completed-${session.id}`}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Unsold
                          </Button>
                          <Button
                            onClick={() => updateStatus(session, 'unsold')}
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

                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 pt-2 border-t dark:border-gray-700">
                      <Button
                        onClick={() => handleWorkDeal(session)}
                        className="w-full"
                        size="sm"
                        disabled={createDealMutation.isPending}
                        data-testid={`button-work-deal-${session.id}`}
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        {createDealMutation.isPending ? 'Creating...' : 'Start Deal'}
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
                        onClick={() => handleAddCredit(session)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        data-testid={`button-credit-${session.id}`}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Add Credit
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
              );
            })
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
      <Dialog open={showVehicleDialog} onOpenChange={handleVehicleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle to Visit</DialogTitle>
            <DialogDescription>
              Select a vehicle the customer viewed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Stock Number</label>
              <Input
                value={stockNumberEntry}
                onChange={(e) => {
                  const value = e.target.value;
                  setStockNumberEntry(value);
                  const match = vehicles.find(v => v.stockNumber?.toLowerCase() === value.toLowerCase());
                  if (match) {
                    setSelectedVehicleId(match.id);
                  }
                }}
                placeholder="Enter or scan stock number"
                data-testid="input-stock-number"
              />
              {stockNumberEntry && !vehicles.some(v => v.stockNumber?.toLowerCase() === stockNumberEntry.toLowerCase()) && (
                <p className="mt-1 text-xs text-amber-600">No inventory match yet. The vehicle will be attached once it exists.</p>
              )}
            </div>
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
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.stockNumber ? `(#${vehicle.stockNumber})` : ''} - ${vehicle.price.toLocaleString()}
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

      {/* Start Credit Application Dialog */}
      <Dialog open={showCreditDialog} onOpenChange={handleCreditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Credit Application</DialogTitle>
            <DialogDescription>
              Capture consent and financing details before sending to the desk.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Gross Monthly Income</label>
                <Input
                  type="number"
                  min={0}
                  value={creditForm.income}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, income: e.target.value }))}
                  placeholder="0"
                  data-testid="input-credit-income"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Housing Payment</label>
                <Input
                  type="number"
                  min={0}
                  value={creditForm.housing}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, housing: e.target.value }))}
                  placeholder="0"
                  data-testid="input-credit-housing"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Application Notes</label>
              <Textarea
                value={creditForm.notes}
                onChange={(e) => setCreditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Stipulations, lender preferences, co-applicant info..."
                rows={3}
                data-testid="textarea-credit-notes"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Checkbox
                checked={creditForm.consent}
                onCheckedChange={(checked) => setCreditForm(prev => ({ ...prev, consent: Boolean(checked) }))}
              />
              Customer granted credit pull consent
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleCreditDialogChange(false)}>
                Cancel
              </Button>
              <Button onClick={saveCreditApplication} data-testid="button-save-credit">
                <ClipboardPlus className="h-4 w-4 mr-1" />
                Save &amp; Launch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </UniformPage>
  );
}

export default function ShowroomManager() {
  return <ShowroomManagerPage />;
}
