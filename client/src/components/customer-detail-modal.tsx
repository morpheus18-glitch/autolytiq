import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type { Customer, CreditApplication, CoApplicant, TradeVehicle, ShowroomVisit, SalespersonNote } from "@shared/schema";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [editingCreditApp, setEditingCreditApp] = useState<CreditApplication | null>(null);
  const [editingTradeVehicle, setEditingTradeVehicle] = useState<TradeVehicle | null>(null);
  const [editingShowroomVisit, setEditingShowroomVisit] = useState<ShowroomVisit | null>(null);
  const [newNote, setNewNote] = useState("");

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

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    createSalespersonNoteMutation.mutate({
      customerId: customer.id,
      salespersonId: 1, // TODO: Get from auth context
      note: newNote.trim(),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Details - {customer.firstName} {customer.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              Credit App
            </TabsTrigger>
            <TabsTrigger value="trade" className="flex items-center gap-1">
              <Car className="w-4 h-4" />
              Trade Vehicle
            </TabsTrigger>
            <TabsTrigger value="co-applicant" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Co-Applicant
            </TabsTrigger>
            <TabsTrigger value="showroom" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Showroom Log
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] w-full">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{customer.firstName} {customer.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{customer.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{customer.phone || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm">{customer.address || "Not provided"}</p>
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
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}