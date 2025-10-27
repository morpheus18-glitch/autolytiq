import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Customer, CreditApplication } from "@shared/schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowRightLeft,
  Calculator,
  Car,
  CreditCard,
  NotebookPen,
  Plus,
  UserPlus,
} from "lucide-react";

type CustomerQuickActionsProps = {
  customer: Customer;
  buttonVariant?: "ghost" | "outline" | "secondary" | "default";
  buttonSize?: "icon" | "sm";
  className?: string;
};

type TradeFormState = {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: string;
  estimatedValue: string;
};

type CreditFormState = {
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  currentIncome: string;
  rentMortgage: string;
  notes: string;
  consentGiven: boolean;
};

type CoBuyerFormState = {
  creditApplicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  income: string;
};

const initialTradeForm: TradeFormState = {
  year: "",
  make: "",
  model: "",
  trim: "",
  vin: "",
  mileage: "",
  estimatedValue: "",
};

const initialCreditForm = (customer: Customer): CreditFormState => ({
  fullName: `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim(),
  dateOfBirth: customer.dateOfBirth ?? "",
  ssn: "",
  currentIncome: customer.income ? String(customer.income) : "",
  rentMortgage: "",
  notes: "",
  consentGiven: false,
});

const initialCoBuyerForm: CoBuyerFormState = {
  creditApplicationId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  ssn: "",
  income: "",
};

export default function CustomerQuickActions({
  customer,
  buttonVariant = "ghost",
  buttonSize = "icon",
  className,
}: CustomerQuickActionsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [coBuyerDialogOpen, setCoBuyerDialogOpen] = useState(false);
  const [vehicleSearchDialogOpen, setVehicleSearchDialogOpen] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [tradeForm, setTradeForm] = useState<TradeFormState>(initialTradeForm);
  const [creditForm, setCreditForm] = useState<CreditFormState>(() => initialCreditForm(customer));
  const [coBuyerForm, setCoBuyerForm] = useState<CoBuyerFormState>(initialCoBuyerForm);

  const { data: creditApplications = [], isLoading: creditAppsLoading } = useQuery<CreditApplication[]>({
    queryKey: ["/api/credit-applications", customer.id],
    enabled: coBuyerDialogOpen,
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
    enabled: vehicleSearchDialogOpen,
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/customers/${customer.id}/notes`, {
        method: "POST",
        body: {
          note: noteContent.trim(),
          context: "quick_action",
          createdBy: "Customer Quick Actions",
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Note added", description: "Customer note saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setNoteContent("");
      setNoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add note",
        description: error?.message ?? "Could not save customer note.",
        variant: "destructive",
      });
    },
  });

  const addTradeMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        customerId: customer.id,
        year: Number(tradeForm.year),
        make: tradeForm.make.trim(),
        model: tradeForm.model.trim(),
        trim: tradeForm.trim.trim() || null,
        vin: tradeForm.vin.trim(),
        mileage: tradeForm.mileage ? Number(tradeForm.mileage) : null,
        estimatedValue: tradeForm.estimatedValue ? Number(tradeForm.estimatedValue) : null,
      };
      const response = await apiRequest("/api/trade-vehicles", {
        method: "POST",
        body: payload,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Trade saved", description: "Trade vehicle added to customer profile." });
      queryClient.invalidateQueries({ queryKey: ["/api/trade-vehicles", customer.id] });
      setTradeForm(initialTradeForm);
      setTradeDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add trade",
        description: error?.message ?? "Could not save trade vehicle.",
        variant: "destructive",
      });
    },
  });

  const addCreditMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/credit-applications", {
        method: "POST",
        body: {
          customerId: customer.id,
          fullName: creditForm.fullName.trim(),
          dateOfBirth: creditForm.dateOfBirth || null,
          ssn: creditForm.ssn.trim(),
          currentIncome: creditForm.currentIncome ? Number(creditForm.currentIncome) : null,
          rentMortgage: creditForm.rentMortgage ? Number(creditForm.rentMortgage) : null,
          notes: creditForm.notes.trim() || null,
          consentGiven: creditForm.consentGiven,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Credit application created", description: "Application saved to customer record." });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-applications", customer.id] });
      setCreditForm(initialCreditForm(customer));
      setCreditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create credit application",
        description: error?.message ?? "Please verify the information and try again.",
        variant: "destructive",
      });
    },
  });

  const addCoBuyerMutation = useMutation({
    mutationFn: async () => {
      if (!coBuyerForm.creditApplicationId) {
        throw new Error("Select a credit application to attach the co-buyer.");
      }
      const response = await apiRequest("/api/co-applicants", {
        method: "POST",
        body: {
          creditApplicationId: Number(coBuyerForm.creditApplicationId),
          firstName: coBuyerForm.firstName.trim(),
          lastName: coBuyerForm.lastName.trim(),
          email: coBuyerForm.email.trim() || null,
          phone: coBuyerForm.phone.trim() || null,
          dateOfBirth: coBuyerForm.dateOfBirth || null,
          ssn: coBuyerForm.ssn.trim() || null,
          employmentHistory: [],
          currentIncome: coBuyerForm.income ? Number(coBuyerForm.income) : null,
          creditScore: null,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Co-buyer added", description: "Co-buyer information stored successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-applications", customer.id] });
      setCoBuyerForm(initialCoBuyerForm);
      setCoBuyerDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add co-buyer",
        description: error?.message ?? "Unable to add co-buyer. Ensure a credit application exists.",
        variant: "destructive",
      });
    },
  });

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchTerm.trim()) return vehicles;
    const search = vehicleSearchTerm.toLowerCase();
    return vehicles.filter((vehicle: any) =>
      vehicle.make?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search) ||
      vehicle.year?.toString().includes(search) ||
      vehicle.stockNo?.toLowerCase().includes(search) ||
      vehicle.stockNumber?.toLowerCase().includes(search)
    );
  }, [vehicles, vehicleSearchTerm]);

  const actions = useMemo(
    () => [
      {
        id: "deal",
        title: "Add New Deal",
        description: "Launch the professional deal desk with this customer pre-selected.",
        icon: Calculator,
        onSelect: () => {
          setLocation(`/professional-deal-desk?customerId=${customer.id}`);
          setOpen(false);
        },
      },
      {
        id: "vehicle",
        title: "Add Vehicle of Interest",
        description: "Search and select a vehicle from inventory.",
        icon: Car,
        onSelect: () => {
          setVehicleSearchDialogOpen(true);
          setOpen(false);
        },
      },
      {
        id: "trade",
        title: "Add Trade Vehicle",
        description: "Capture a trade-in vehicle for this customer.",
        icon: ArrowRightLeft,
        onSelect: () => {
          setTradeDialogOpen(true);
          setOpen(false);
        },
      },
      {
        id: "credit",
        title: "Add Credit Application",
        description: "Begin a credit application for financing review.",
        icon: CreditCard,
        onSelect: () => {
          setCreditDialogOpen(true);
          setOpen(false);
        },
      },
      {
        id: "note",
        title: "Add Customer Note",
        description: "Log an interaction or reminder for follow-up.",
        icon: NotebookPen,
        onSelect: () => {
          setNoteDialogOpen(true);
          setOpen(false);
        },
      },
      {
        id: "coBuyer",
        title: "Add Co-Buyer",
        description: "Attach a co-buyer to an existing credit application.",
        icon: UserPlus,
        onSelect: () => {
          setCoBuyerDialogOpen(true);
          setOpen(false);
        },
      },
    ],
    [customer.id, setLocation],
  );

  return (
    <>
      <Sheet open={open} onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setNoteDialogOpen(false);
          setTradeDialogOpen(false);
          setCreditDialogOpen(false);
          setCoBuyerDialogOpen(false);
        }
      }}>
        <SheetTrigger asChild>
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={className}
            title="Quick actions"
            onClick={(event) => event.stopPropagation()}
          >
            <Plus className={buttonSize === "icon" ? "h-4 w-4" : "h-5 w-5"} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] sm:w-[380px]">
          <SheetHeader>
            <SheetTitle>Customer Quick Actions</SheetTitle>
            <SheetDescription>
              Accelerate your workflow with shortcuts tailored for {customer.firstName} {customer.lastName}.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-180px)]">
            <div className="space-y-3">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start gap-3 py-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600"
                  onClick={(event) => {
                    event.stopPropagation();
                    action.onSelect();
                  }}
                >
                  <action.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{action.title}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-left">{action.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for {customer.firstName} {customer.lastName}</DialogTitle>
            <DialogDescription>Store a quick update or reminder on the customer profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="quick-note">Note</Label>
            <Textarea
              id="quick-note"
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Enter note details..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addNoteMutation.mutate()}
              disabled={noteContent.trim().length === 0 || addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Trade Dialog */}
      <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trade Vehicle</DialogTitle>
            <DialogDescription>Capture the details for a potential trade-in.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trade-year">Year</Label>
              <Input
                id="trade-year"
                value={tradeForm.year}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, year: event.target.value }))}
                placeholder="2021"
              />
            </div>
            <div>
              <Label htmlFor="trade-make">Make</Label>
              <Input
                id="trade-make"
                value={tradeForm.make}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, make: event.target.value }))}
                placeholder="Toyota"
              />
            </div>
            <div>
              <Label htmlFor="trade-model">Model</Label>
              <Input
                id="trade-model"
                value={tradeForm.model}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, model: event.target.value }))}
                placeholder="Camry"
              />
            </div>
            <div>
              <Label htmlFor="trade-trim">Trim</Label>
              <Input
                id="trade-trim"
                value={tradeForm.trim}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, trim: event.target.value }))}
                placeholder="XSE"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="trade-vin">VIN</Label>
              <Input
                id="trade-vin"
                value={tradeForm.vin}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, vin: event.target.value }))}
                placeholder="VIN"
              />
            </div>
            <div>
              <Label htmlFor="trade-mileage">Mileage</Label>
              <Input
                id="trade-mileage"
                value={tradeForm.mileage}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, mileage: event.target.value }))}
                placeholder="65000"
              />
            </div>
            <div>
              <Label htmlFor="trade-value">Estimated Value ($)</Label>
              <Input
                id="trade-value"
                value={tradeForm.estimatedValue}
                onChange={(event) => setTradeForm((prev) => ({ ...prev, estimatedValue: event.target.value }))}
                placeholder="15000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTradeDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addTradeMutation.mutate()}
              disabled={
                addTradeMutation.isPending ||
                !tradeForm.year ||
                !tradeForm.make.trim() ||
                !tradeForm.model.trim() ||
                !tradeForm.vin.trim()
              }
            >
              {addTradeMutation.isPending ? "Saving..." : "Save Trade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credit Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Application</DialogTitle>
            <DialogDescription>Gather the essentials to start a financing review.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="credit-name">Full Name</Label>
              <Input
                id="credit-name"
                value={creditForm.fullName}
                onChange={(event) => setCreditForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credit-dob">Date of Birth</Label>
                <Input
                  id="credit-dob"
                  type="date"
                  value={creditForm.dateOfBirth}
                  onChange={(event) => setCreditForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="credit-ssn">SSN</Label>
                <Input
                  id="credit-ssn"
                  value={creditForm.ssn}
                  onChange={(event) => setCreditForm((prev) => ({ ...prev, ssn: event.target.value }))}
                  placeholder="XXX-XX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="credit-income">Annual Income ($)</Label>
                <Input
                  id="credit-income"
                  value={creditForm.currentIncome}
                  onChange={(event) => setCreditForm((prev) => ({ ...prev, currentIncome: event.target.value }))}
                  placeholder="85000"
                />
              </div>
              <div>
                <Label htmlFor="credit-housing">Monthly Housing ($)</Label>
                <Input
                  id="credit-housing"
                  value={creditForm.rentMortgage}
                  onChange={(event) => setCreditForm((prev) => ({ ...prev, rentMortgage: event.target.value }))}
                  placeholder="1250"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="credit-notes">Notes</Label>
              <Textarea
                id="credit-notes"
                value={creditForm.notes}
                onChange={(event) => setCreditForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Include any additional context for the finance team."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="credit-consent"
                checked={creditForm.consentGiven}
                onCheckedChange={(checked) =>
                  setCreditForm((prev) => ({ ...prev, consentGiven: Boolean(checked) }))
                }
              />
              <Label htmlFor="credit-consent" className="text-sm">
                Customer provided consent to pull credit
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addCreditMutation.mutate()}
              disabled={
                addCreditMutation.isPending ||
                !creditForm.fullName.trim() ||
                !creditForm.ssn.trim() ||
                !creditForm.consentGiven
              }
            >
              {addCreditMutation.isPending ? "Submitting..." : "Create Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Co-Buyer Dialog */}
      <Dialog open={coBuyerDialogOpen} onOpenChange={setCoBuyerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Co-Buyer</DialogTitle>
            <DialogDescription>Select a credit application and capture co-buyer details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="co-buyer-credit-app">Credit Application</Label>
              <select
                id="co-buyer-credit-app"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={coBuyerForm.creditApplicationId}
                onChange={(event) =>
                  setCoBuyerForm((prev) => ({ ...prev, creditApplicationId: event.target.value }))
                }
              >
                <option value="">Select application</option>
                {creditApplications.map((app) => (
                  <option key={app.id} value={app.id}>
                    Application #{app.id} • {app.fullName}
                  </option>
                ))}
              </select>
              {creditAppsLoading && (
                <p className="mt-1 text-xs text-muted-foreground">Loading applications…</p>
              )}
              {!creditAppsLoading && creditApplications.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No credit applications on file. Create one before adding a co-buyer.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="co-buyer-first">First Name</Label>
                <Input
                  id="co-buyer-first"
                  value={coBuyerForm.firstName}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, firstName: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="co-buyer-last">Last Name</Label>
                <Input
                  id="co-buyer-last"
                  value={coBuyerForm.lastName}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, lastName: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="co-buyer-email">Email</Label>
                <Input
                  id="co-buyer-email"
                  type="email"
                  value={coBuyerForm.email}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="co-buyer-phone">Phone</Label>
                <Input
                  id="co-buyer-phone"
                  value={coBuyerForm.phone}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="co-buyer-dob">Date of Birth</Label>
                <Input
                  id="co-buyer-dob"
                  type="date"
                  value={coBuyerForm.dateOfBirth}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="co-buyer-ssn">SSN</Label>
                <Input
                  id="co-buyer-ssn"
                  value={coBuyerForm.ssn}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, ssn: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="co-buyer-income">Annual Income ($)</Label>
                <Input
                  id="co-buyer-income"
                  value={coBuyerForm.income}
                  onChange={(event) => setCoBuyerForm((prev) => ({ ...prev, income: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCoBuyerDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addCoBuyerMutation.mutate()}
              disabled={
                addCoBuyerMutation.isPending ||
                !coBuyerForm.creditApplicationId ||
                !coBuyerForm.firstName.trim() ||
                !coBuyerForm.lastName.trim()
              }
            >
              {addCoBuyerMutation.isPending ? "Saving..." : "Add Co-Buyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Search Dialog */}
      <Dialog open={vehicleSearchDialogOpen} onOpenChange={(open) => {
        setVehicleSearchDialogOpen(open);
        if (!open) {
          setVehicleSearchTerm("");
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Search Vehicle Inventory</DialogTitle>
            <DialogDescription>Find and select a vehicle by make, model, year, or stock number</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by make, model, year, or stock #..."
                value={vehicleSearchTerm}
                onChange={(e) => setVehicleSearchTerm(e.target.value)}
                className="w-full pl-3 pr-3"
                autoFocus
              />
            </div>
            <ScrollArea className="flex-1 pr-4">
              {vehiclesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {vehicleSearchTerm ? "No vehicles match your search" : "No vehicles available"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredVehicles.map((vehicle: any) => (
                    <button
                      key={vehicle.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all text-left"
                      onClick={() => {
                        setLocation(`/professional-deal-desk?customerId=${customer.id}&vehicleId=${vehicle.id}`);
                        setVehicleSearchDialogOpen(false);
                        setVehicleSearchTerm("");
                      }}
                    >
                      <div className="flex-shrink-0 w-20 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                        {vehicle.images?.[0] ? (
                          <img src={vehicle.images[0]} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h4>
                          {(vehicle.stockNo || vehicle.stockNumber) && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              #{vehicle.stockNo || vehicle.stockNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          {vehicle.vin && (
                            <span className="truncate">VIN: {vehicle.vin.substring(0, 10)}...</span>
                          )}
                          {vehicle.price && (
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ${vehicle.price.toLocaleString()}
                            </span>
                          )}
                          {vehicle.msrp && (
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ${vehicle.msrp.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setVehicleSearchDialogOpen(false);
              setVehicleSearchTerm("");
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
