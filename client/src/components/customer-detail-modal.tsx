import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Customer, CreditApplication, CoApplicant, TradeVehicle, ShowroomVisit, SalespersonNote, Vehicle } from "@shared/schema";
import {
  CreditCard,
  Car,
  Users,
  Calendar,
  MessageCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  ShoppingCart,
  Eye,
  MousePointer,
  TrendingUp,
  Camera,
  Save,
  X,
} from "lucide-react";

interface CustomerDetailModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerDetailModal({ customer, open, onOpenChange }: CustomerDetailModalProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingCreditApp, setEditingCreditApp] = useState<CreditApplication | null>(null);
  const [editingTradeVehicle, setEditingTradeVehicle] = useState<TradeVehicle | null>(null);
  const [editingShowroomVisit, setEditingShowroomVisit] = useState<ShowroomVisit | null>(null);
  const [newNote, setNewNote] = useState("");
  const [dealFormData, setDealFormData] = useState({
    dealType: 'finance',
    vehicleId: null as number | null,
    salePrice: 0,
    salesConsultant: ''
  });

  // Customer lifecycle data
  const { data: lifecycle, isLoading: loadingLifecycle } = useQuery({
    queryKey: ["/api/customers", customer.id, "lifecycle"],
    enabled: open,
  });

  // Available vehicles for deal creation
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: open,
  });

  // Credit Applications
  const { data: creditApplications = [], isLoading: loadingCreditApps } = useQuery({
    queryKey: ["/api/credit-applications", customer.id],
    enabled: open,
  });

  // Co-Applicants
  const { data: coApplicants = [], isLoading: loadingCoApplicants } = useQuery({
    queryKey: ["/api/co-applicants", customer.id],
    enabled: open,
  });

  // Trade Vehicles
  const { data: tradeVehicles = [], isLoading: loadingTradeVehicles } = useQuery({
    queryKey: ["/api/trade-vehicles", customer.id],
    enabled: open,
  });

  // Showroom Visits
  const { data: showroomVisits = [], isLoading: loadingShowroomVisits } = useQuery({
    queryKey: ["/api/showroom-visits", customer.id],
    enabled: open,
  });

  // Salesperson Notes
  const { data: salespersonNotes = [], isLoading: loadingSalespersonNotes } = useQuery({
    queryKey: ["/api/salesperson-notes", customer.id],
    enabled: open,
  });

  // Mutations
  const createCreditAppMutation = useMutation({
    mutationFn: async (data: Partial<CreditApplication>) => {
      return apiRequest(`/api/credit-applications`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-applications", customer.id] });
      toast({ title: "Credit application created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error creating credit application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTradeVehicleMutation = useMutation({
    mutationFn: async (data: Partial<TradeVehicle>) => {
      return apiRequest(`/api/trade-vehicles`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trade-vehicles", customer.id] });
      toast({ title: "Trade vehicle added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error adding trade vehicle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createShowroomVisitMutation = useMutation({
    mutationFn: async (data: Partial<ShowroomVisit>) => {
      return apiRequest(`/api/showroom-visits`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showroom-visits", customer.id] });
      toast({ title: "Showroom visit logged successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error logging showroom visit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createSalespersonNoteMutation = useMutation({
    mutationFn: async (data: Partial<SalespersonNote>) => {
      return apiRequest(`/api/salesperson-notes`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salesperson-notes", customer.id] });
      setNewNote("");
      toast({ title: "Note added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      return apiRequest(`/api/customers/${customer.id}/deals`, "POST", dealData);
    },
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "lifecycle"] });
      toast({ title: "Deal created successfully!" });
      onOpenChange(false);
      setLocation(`/deals/${deal.id}`);
    },
    onError: () => {
      toast({ title: "Failed to create deal", variant: "destructive" });
    }
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    createSalespersonNoteMutation.mutate({
      customerId: customer.id,
      salespersonId: 1, // TODO: Get from auth context
      note: newNote.trim(),
    });
  };

  const handleCreateDeal = () => {
    if (!dealFormData.vehicleId) {
      toast({ title: "Please select a vehicle", variant: "destructive" });
      return;
    }
    if (!dealFormData.salePrice || dealFormData.salePrice <= 0) {
      toast({ title: "Please enter a valid sale price", variant: "destructive" });
      return;
    }
    if (!dealFormData.salesConsultant.trim()) {
      toast({ title: "Please enter a sales consultant name", variant: "destructive" });
      return;
    }
    
    createDealMutation.mutate({
      dealType: dealFormData.dealType,
      vehicleId: dealFormData.vehicleId,
      salePrice: dealFormData.salePrice,
      salesConsultant: dealFormData.salesConsultant.trim(),
      customerId: customer.id,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "arrived": return "bg-green-100 text-green-800";
      case "in_meeting": return "bg-purple-100 text-purple-800";
      case "test_drive": return "bg-orange-100 text-orange-800";
      case "left": return "bg-gray-100 text-gray-800";
      case "sold": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Lifecycle timeline helper functions
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return 'border-blue-500 text-blue-600';
      case 'vehicle_view': return 'border-green-500 text-green-600';
      case 'contact_form': return 'border-orange-500 text-orange-600';
      case 'phone_call': return 'border-purple-500 text-purple-600';
      case 'email_sent': return 'border-pink-500 text-pink-600';
      case 'showroom_visit': return 'border-indigo-500 text-indigo-600';
      case 'test_drive': return 'border-yellow-500 text-yellow-600';
      case 'deal_created': return 'border-emerald-500 text-emerald-600';
      case 'financing_app': return 'border-cyan-500 text-cyan-600';
      case 'trade_appraisal': return 'border-teal-500 text-teal-600';
      default: return 'border-gray-500 text-gray-600';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return <Eye className="w-4 h-4" />;
      case 'vehicle_view': return <Car className="w-4 h-4" />;
      case 'contact_form': return <Mail className="w-4 h-4" />;
      case 'phone_call': return <Phone className="w-4 h-4" />;
      case 'email_sent': return <Mail className="w-4 h-4" />;
      case 'showroom_visit': return <MapPin className="w-4 h-4" />;
      case 'test_drive': return <Car className="w-4 h-4" />;
      case 'deal_created': return <ShoppingCart className="w-4 h-4" />;
      case 'financing_app': return <CreditCard className="w-4 h-4" />;
      case 'trade_appraisal': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventTitle = (eventType: string, event: any) => {
    switch (eventType) {
      case 'page_view': return `Viewed ${event.pageTitle || 'Page'}`;
      case 'vehicle_view': return `Viewed ${event.vehicleInfo || 'Vehicle'}`;
      case 'contact_form': return 'Submitted Contact Form';
      case 'phone_call': return 'Phone Call Made';
      case 'email_sent': return 'Email Sent';
      case 'showroom_visit': return 'Showroom Visit';
      case 'test_drive': return 'Test Drive Scheduled';
      case 'deal_created': return 'Deal Created';
      case 'financing_app': return 'Financing Application';
      case 'trade_appraisal': return 'Trade-in Appraisal';
      default: return 'Customer Activity';
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.type) {
      case 'page_view': 
        return `Spent ${Math.round((event.timeOnPage || 0) / 60)} minutes on ${event.pageUrl || 'this page'}`;
      case 'vehicle_view': 
        return `Interested in ${event.vehicleInfo || 'vehicle details'} - viewed for ${Math.round((event.timeOnPage || 0) / 60)} minutes`;
      case 'contact_form': 
        return `Form submitted with inquiry: ${event.message || 'No message provided'}`;
      case 'phone_call': 
        return `${event.duration || 'Unknown'} minute call with ${event.salesperson || 'sales team'}`;
      case 'showroom_visit': 
        return `In-person visit to showroom - ${event.status || 'status unknown'}`;
      case 'test_drive': 
        return `Test drive of ${event.vehicleInfo || 'vehicle'} - ${event.duration || 'duration unknown'}`;
      case 'deal_created': 
        return `Deal initiated for ${event.vehicleInfo || 'vehicle'} - $${event.amount || 'amount pending'}`;
      default: 
        return event.description || 'Customer engagement activity';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] md:w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <User className="w-5 h-5" />
            <span className="truncate">Customer Details - {customer.firstName} {customer.lastName}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-8 gap-1 h-auto md:h-10">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-1 text-xs md:text-sm">
              <Activity className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Lifecycle</span>
              <span className="md:hidden">Life</span>
            </TabsTrigger>
            <TabsTrigger value="create-deal" className="flex items-center gap-1 text-xs md:text-sm">
              <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Create Deal</span>
              <span className="md:hidden">Deal</span>
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-1 text-xs md:text-sm">
              <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Credit App</span>
              <span className="md:hidden">Credit</span>
            </TabsTrigger>
            <TabsTrigger value="trade" className="flex items-center gap-1 text-xs md:text-sm">
              <Car className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Trade Vehicle</span>
              <span className="md:hidden">Trade</span>
            </TabsTrigger>
            <TabsTrigger value="co-applicant" className="flex items-center gap-1 text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Co-Applicant</span>
              <span className="md:hidden">Co-App</span>
            </TabsTrigger>
            <TabsTrigger value="showroom" className="flex items-center gap-1 text-xs md:text-sm">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Showroom Log</span>
              <span className="md:hidden">Showroom</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1 text-xs md:text-sm">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Notes</span>
              <span className="md:hidden">Notes</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] md:h-[600px] w-full">
            <TabsContent value="lifecycle" className="space-y-4 p-2 md:p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Customer Lifecycle Timeline
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {lifecycle?.totalEvents || 0} Events Tracked
                  </Badge>
                  {(!lifecycle?.events || lifecycle.events.length === 0) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/customers/${customer.id}/demo-tracking`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                          });
                          if (response.ok) {
                            queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "lifecycle"] });
                            toast({ title: "Demo tracking data created successfully!", variant: "default" });
                          }
                        } catch (error) {
                          toast({ title: "Failed to create demo data", variant: "destructive" });
                        }
                      }}
                    >
                      <Camera className="w-3 h-3 mr-1" />
                      Generate Demo
                    </Button>
                  )}
                </div>
              </div>

              {loadingLifecycle ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading customer journey...</p>
                </div>
              ) : lifecycle && lifecycle.events?.length > 0 ? (
                <div className="space-y-4">
                  {/* Timeline Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Page Views</p>
                          <p className="text-lg font-semibold">{lifecycle.stats?.totalPageViews || 0}</p>
                        </div>
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Vehicle Views</p>
                          <p className="text-lg font-semibold">{lifecycle.stats?.vehicleViews || 0}</p>
                        </div>
                        <Car className="w-4 h-4 text-green-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Session Duration</p>
                          <p className="text-lg font-semibold">{Math.round((lifecycle.stats?.avgSessionDuration || 0) / 60)}m</p>
                        </div>
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Interactions</p>
                          <p className="text-lg font-semibold">{lifecycle.stats?.totalInteractions || 0}</p>
                        </div>
                        <MousePointer className="w-4 h-4 text-purple-600" />
                      </div>
                    </Card>
                  </div>

                  {/* Timeline Events */}
                  <div className="relative">
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    
                    {lifecycle.events.map((event: any, index: number) => (
                      <div key={`${event.type}-${event.timestamp}-${index}`} className="relative flex items-start space-x-4 pb-6">
                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${getEventColor(event.type)} bg-white`}>
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="flex-grow">
                          <Card className="p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-sm">{getEventTitle(event.type, event)}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {event.type.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-gray-600 mb-2">{getEventDescription(event)}</p>
                                
                                {event.metadata && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                    {event.deviceType && (
                                      <span className="text-gray-500">Device: {event.deviceType}</span>
                                    )}
                                    {event.pageUrl && (
                                      <span className="text-gray-500">Page: {event.pageUrl.substring(event.pageUrl.lastIndexOf('/') + 1) || 'Home'}</span>
                                    )}
                                    {event.timeOnPage && (
                                      <span className="text-gray-500">Time: {Math.round(event.timeOnPage / 60)}m {event.timeOnPage % 60}s</span>
                                    )}
                                    {event.vehicleInfo && (
                                      <span className="text-gray-500">Vehicle: {event.vehicleInfo}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                                {new Date(event.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No Activity Tracked</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    This customer's online activity will appear here once they start browsing your inventory
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Pixel tracking is active and ready
                  </Badge>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overview" className="space-y-4 p-2 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs md:text-sm font-medium">Name</Label>
                        <p className="text-sm md:text-base">{customer.firstName} {customer.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-xs md:text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs md:text-sm font-medium">Email</Label>
                        <p className="text-sm md:text-base break-all">{customer.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-xs md:text-sm font-medium">Phone</Label>
                        <p className="text-sm md:text-base">{customer.phone || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs md:text-sm font-medium">Address</Label>
                      <p className="text-sm md:text-base">{customer.address || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Credit Score</Label>
                        <p className="text-sm">{customer.creditScore || "Not available"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Annual Income</Label>
                        <p className="text-sm">{customer.income ? `$${customer.income}` : "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sales Consultant</Label>
                      <p className="text-sm">{customer.salesConsultant || "Not assigned"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Last Contact: {customer.lastContactDate ? new Date(customer.lastContactDate).toLocaleDateString() : "Never"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Next Follow-up: {customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate).toLocaleDateString() : "Not scheduled"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credit" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Credit Applications</h3>
                <Button onClick={() => setEditingCreditApp({} as CreditApplication)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </div>

              {loadingCreditApps ? (
                <div className="text-center py-8">Loading credit applications...</div>
              ) : creditApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No credit applications found</div>
              ) : (
                <div className="space-y-4">
                  {creditApplications.map((app: CreditApplication) => (
                    <Card key={app.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Application #{app.id}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                            <Button size="sm" variant="outline" onClick={() => setEditingCreditApp(app)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Current Income</Label>
                            <p className="text-sm">{app.currentIncome ? `$${app.currentIncome}` : "Not provided"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Monthly Rent/Mortgage</Label>
                            <p className="text-sm">{app.rentMortgage ? `$${app.rentMortgage}` : "Not provided"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Approval Amount</Label>
                            <p className="text-sm">{app.approvalAmount ? `$${app.approvalAmount}` : "Pending"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Interest Rate</Label>
                            <p className="text-sm">{app.interestRate ? `${app.interestRate}%` : "Pending"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trade" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Trade Vehicles</h3>
                <Button onClick={() => setEditingTradeVehicle({} as TradeVehicle)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trade Vehicle
                </Button>
              </div>

              {loadingTradeVehicles ? (
                <div className="text-center py-8">Loading trade vehicles...</div>
              ) : tradeVehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No trade vehicles found</div>
              ) : (
                <div className="space-y-4">
                  {tradeVehicles.map((vehicle: TradeVehicle) => (
                    <Card key={vehicle.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                            <Button size="sm" variant="outline" onClick={() => setEditingTradeVehicle(vehicle)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium">VIN</Label>
                            <p className="text-sm">{vehicle.vin}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Mileage</Label>
                            <p className="text-sm">{vehicle.mileage?.toLocaleString() || "Unknown"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Condition</Label>
                            <p className="text-sm">{vehicle.condition || "Not assessed"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Estimated Value</Label>
                            <p className="text-sm">{vehicle.estimatedValue ? `$${vehicle.estimatedValue}` : "Not appraised"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="co-applicant" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Co-Applicants</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Co-Applicant
                </Button>
              </div>

              {loadingCoApplicants ? (
                <div className="text-center py-8">Loading co-applicants...</div>
              ) : coApplicants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No co-applicants found</div>
              ) : (
                <div className="space-y-4">
                  {coApplicants.map((coApplicant: CoApplicant) => (
                    <Card key={coApplicant.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{coApplicant.firstName} {coApplicant.lastName}</span>
                          <Badge className={getStatusColor(coApplicant.status)}>{coApplicant.status}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm">{coApplicant.email || "Not provided"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p className="text-sm">{coApplicant.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Income</Label>
                            <p className="text-sm">{coApplicant.currentIncome ? `$${coApplicant.currentIncome}` : "Not provided"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="showroom" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Showroom Visits</h3>
                <Button onClick={() => setEditingShowroomVisit({} as ShowroomVisit)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Visit
                </Button>
              </div>

              {loadingShowroomVisits ? (
                <div className="text-center py-8">Loading showroom visits...</div>
              ) : showroomVisits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No showroom visits found</div>
              ) : (
                <div className="space-y-4">
                  {showroomVisits.map((visit: ShowroomVisit) => (
                    <Card key={visit.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Visit - {new Date(visit.visitDate).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getVisitStatusColor(visit.status)}>{visit.status}</Badge>
                            <Button size="sm" variant="outline" onClick={() => setEditingShowroomVisit(visit)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Salesperson</Label>
                            <p className="text-sm">{visit.assignedSalesperson || "Not assigned"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Vehicle of Interest</Label>
                            <p className="text-sm">{visit.vehicleOfInterest || "Not specified"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Follow-up Required</Label>
                            <p className="text-sm">{visit.followUpRequired ? "Yes" : "No"}</p>
                          </div>
                        </div>
                        {visit.comments && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Comments</Label>
                            <p className="text-sm mt-1">{visit.comments}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Salesperson Notes</h3>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter your note here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddNote} disabled={!newNote.trim() || createSalespersonNoteMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                      <Button variant="outline" onClick={() => setNewNote("")}>
                        <X className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loadingSalespersonNotes ? (
                <div className="text-center py-8">Loading notes...</div>
              ) : salespersonNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notes found</div>
              ) : (
                <div className="space-y-4">
                  {salespersonNotes.map((note: SalespersonNote) => (
                    <Card key={note.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {new Date(note.createdAt).toLocaleDateString()} - {new Date(note.createdAt).toLocaleTimeString()}
                          </span>
                          <div className="flex items-center gap-2">
                            {note.flaggedForManager && (
                              <Badge variant="destructive">Flagged</Badge>
                            )}
                            {note.isPrivate && (
                              <Badge variant="secondary">Private</Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{note.note}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            {/* Customer Lifecycle Tab */}
            <TabsContent value="lifecycle" className="space-y-4 p-2 md:p-4">
              {loadingLifecycle ? (
                <div className="text-center py-8">Loading customer lifecycle...</div>
              ) : !lifecycle ? (
                <div className="text-center py-8 text-gray-500">No lifecycle data available</div>
              ) : (
                <div className="space-y-6">
                  {/* Shopping Journey Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Shopping Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{lifecycle?.totalSessions || 0}</div>
                          <div className="text-sm text-gray-500">Total Sessions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{lifecycle?.totalPageViews || 0}</div>
                          <div className="text-sm text-gray-500">Page Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{lifecycle?.totalInteractions || 0}</div>
                          <div className="text-sm text-gray-500">Interactions</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">First Visit</Label>
                          <p className="text-sm">{lifecycle?.shoppingJourney?.firstVisit ? new Date(lifecycle.shoppingJourney.firstVisit).toLocaleDateString() : "Never"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Last Visit</Label>
                          <p className="text-sm">{lifecycle?.shoppingJourney?.lastVisit ? new Date(lifecycle.shoppingJourney.lastVisit).toLocaleDateString() : "Never"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Avg Session Duration</Label>
                          <p className="text-sm">{Math.round((lifecycle?.shoppingJourney?.averageSessionDuration || 0) / 1000 / 60)} minutes</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Conversion Status</Label>
                          <Badge className={lifecycle?.shoppingJourney?.conversionStatus === 'converted' ? 'bg-green-100 text-green-800' : lifecycle?.shoppingJourney?.conversionStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {lifecycle?.shoppingJourney?.conversionStatus || 'browsing'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Page Views */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Recent Page Views
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(lifecycle?.recentPageViews || []).map((view: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="truncate">{view.pagePath}</span>
                            <span className="text-gray-500 text-xs">{new Date(view.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Interactions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MousePointer className="w-5 h-5" />
                        Recent Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(lifecycle?.recentInteractions || []).map((interaction: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="truncate">{interaction.interactionType}: {interaction.elementId}</span>
                            <span className="text-gray-500 text-xs">{new Date(interaction.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Create Deal Tab */}
            <TabsContent value="create-deal" className="space-y-4 p-2 md:p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Create New Deal for {customer.firstName} {customer.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deal-type">Deal Type</Label>
                      <Select value={dealFormData.dealType} onValueChange={(value) => setDealFormData({...dealFormData, dealType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="lease">Lease</SelectItem>
                          <SelectItem value="trade">Trade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="vehicle">Vehicle</Label>
                      <Select value={dealFormData.vehicleId?.toString() || ""} onValueChange={(value) => setDealFormData({...dealFormData, vehicleId: value ? parseInt(value) : null})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingVehicles ? (
                            <SelectItem value="" disabled>Loading vehicles...</SelectItem>
                          ) : vehicles && vehicles.length > 0 ? (
                            vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No vehicles available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sale-price">Sale Price</Label>
                      <Input
                        id="sale-price"
                        type="number"
                        value={dealFormData.salePrice}
                        onChange={(e) => setDealFormData({...dealFormData, salePrice: parseFloat(e.target.value) || 0})}
                        placeholder="Enter sale price"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sales-consultant">Sales Consultant</Label>
                      <Input
                        id="sales-consultant"
                        value={dealFormData.salesConsultant}
                        onChange={(e) => setDealFormData({...dealFormData, salesConsultant: e.target.value})}
                        placeholder="Enter sales consultant name"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setActiveTab("overview")}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateDeal}
                      disabled={createDealMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createDealMutation.isPending ? "Creating..." : "Create Deal"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}