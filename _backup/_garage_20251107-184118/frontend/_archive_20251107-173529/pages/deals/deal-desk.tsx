import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useSearch } from 'react-router-dom';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Card } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui';
import { ModuleHeader } from '@repo/ui';
import { CollapsibleSection } from '@repo/ui';
import { TabNavigation } from '@repo/ui';
import { useToast } from '@repo/ui';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calculator, 
  Car, 
  User,
  Save,
  Printer,
  DollarSign,
  Receipt,
  Package,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

interface Vehicle {
  id: number;
  stockNo: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  msrp?: number | null;
  price: number;
  costPrice?: number | null;
  mileage?: number | null;
  exteriorColor?: string | null;
  driveType?: string | null;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  zipCode?: string | null;
  creditScore?: number | null;
  vehicleOfInterest?: string | null;
}

interface DealerSettings {
  id: number;
  docFeeCents: number;
  titleFeeCents: number;
  registrationFeeCents: number;
  defaultSalesTaxPercent: string;
  availableTerms: number[];
  defaultTermMonths: number;
}

export default function ProfessionalDealDesk() {
  const { toast } = useToast();
  const searchParams = new URLSearchParams(useSearch());
  
  // URL params for pre-population
  const urlCustomerId = searchParams.get('customerId');
  const urlVehicleId = searchParams.get('vehicleId');
  
  // UI State
  const [activeTab, setActiveTab] = useState<string>('deal');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    vehicle: true,
    tradeIn: false,
    payment: true,
    fiProducts: false,
    aftermarket: false,
  });
  
  // Customer & Vehicle Selection
  const [customerId, setCustomerId] = useState<number | null>(urlCustomerId ? parseInt(urlCustomerId) : null);
  const [vehicleId, setVehicleId] = useState<number | null>(urlVehicleId ? parseInt(urlVehicleId) : null);
  const [stockNumber, setStockNumber] = useState<string>('');
  
  // Vehicle Data
  const [msrp, setMsrp] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [vehicleCost, setVehicleCost] = useState<number>(0);
  const [rebates, setRebates] = useState<number>(0);
  
  // Customer & Tax
  const [customerZip, setCustomerZip] = useState<string>('');
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  
  // Trade
  const [tradeAllowance, setTradeAllowance] = useState<number>(0);
  const [tradePayoff, setTradePayoff] = useState<number>(0);
  const [tradeAcv, setTradeAcv] = useState<number>(0);
  const [tradeRecon, setTradeRecon] = useState<number>(0);
  
  // Fees (from dealer defaults)
  const [docFee, setDocFee] = useState<number>(0);
  const [titleFee, setTitleFee] = useState<number>(0);
  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const [customFees, setCustomFees] = useState<Array<{name: string; amount: number}>>([]);
  
  // Finance
  const [term, setTerm] = useState<number>(72);
  const [apr, setApr] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  
  // Products
  const [fiProducts, setFiProducts] = useState<Array<{name: string; retail: number; cost: number; term: number}>>([]);
  const [aftermarket, setAftermarket] = useState<Array<{name: string; price: number}>>([]);
  
  // Dialog states
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [feesDialogOpen, setFeesDialogOpen] = useState(false);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [aftermarketDialogOpen, setAftermarketDialogOpen] = useState(false);
  const [paymentMatrixOpen, setPaymentMatrixOpen] = useState(false);
  
  // Data Queries
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });
  
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  const { data: dealerSettings } = useQuery<DealerSettings>({
    queryKey: ['/api/dealer-settings'],
  });
  
  const selectedCustomer = customers.find(c => c.id === customerId);
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  
  // Toggle collapsible section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Auto-populate from dealer settings
  useEffect(() => {
    if (dealerSettings) {
      setDocFee(dealerSettings.docFeeCents / 100);
      setTitleFee(dealerSettings.titleFeeCents / 100);
      setRegistrationFee(dealerSettings.registrationFeeCents / 100);
      setSalesTaxRate(parseFloat(dealerSettings.defaultSalesTaxPercent));
      setTerm(dealerSettings.defaultTermMonths);
    }
  }, [dealerSettings]);
  
  // Auto-populate from customer (ZIP-based tax lookup would go here)
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerZip(selectedCustomer.zipCode || '');
      // TODO: Implement ZIP-based tax jurisdiction lookup
      // For now, using dealer default
    }
  }, [selectedCustomer]);
  
  // Auto-populate from vehicle by ID or stock number
  useEffect(() => {
    if (selectedVehicle) {
      setMsrp(selectedVehicle.msrp || 0);
      setSalePrice(selectedVehicle.price);
      setVehicleCost(selectedVehicle.costPrice || 0);
      setStockNumber(selectedVehicle.stockNo || '');
    }
  }, [selectedVehicle]);
  
  // Stock number lookup
  const handleStockLookup = () => {
    const vehicle = vehicles.find(v => v.stockNo === stockNumber);
    if (vehicle) {
      setVehicleId(vehicle.id);
      toast({
        title: "Vehicle Found",
        description: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      });
    } else {
      toast({
        title: "Not Found",
        description: `No vehicle with stock# ${stockNumber}`,
        variant: "destructive",
      });
    }
  };
  
  // Calculations
  const netTrade = tradeAllowance - tradePayoff;
  const totalFees = docFee + titleFee + registrationFee + customFees.reduce((sum, f) => sum + f.amount, 0);
  const aftermarketTotal = aftermarket.reduce((sum, a) => sum + a.price, 0);
  const fiProductsRetail = fiProducts.reduce((sum, p) => sum + p.retail, 0);
  const subtotal = salePrice + aftermarketTotal - rebates;
  const salesTax = (subtotal + totalFees) * (salesTaxRate / 100);
  const totalPrice = subtotal + totalFees + salesTax + fiProductsRetail;
  const amountFinanced = Math.max(0, totalPrice - netTrade - downPayment);
  
  // Monthly payment calculation
  const monthlyRate = apr / 100 / 12;
  let monthlyPayment = 0;
  if (!term || term === 0) {
    monthlyPayment = 0;
  } else if (apr === 0) {
    // Zero APR: simple division
    monthlyPayment = amountFinanced / term;
  } else {
    // Standard amortization formula
    monthlyPayment = (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  }
  
  // Profit calculations
  const frontGross = salePrice - vehicleCost;
  const backGross = fiProducts.reduce((sum, p) => sum + (p.retail - p.cost), 0);
  const totalGross = frontGross + backGross;
  
  // Save Deal
  const saveDealMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/deals', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          vehicleId,
          salePrice,
          msrp,
          rebates,
          tradeAllowance,
          tradePayoff,
          docFee,
          titleFee,
          registrationFee,
          salesTax,
          term,
          rate: apr.toString(),
          cashDown: downPayment,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      toast({
        title: "Deal Saved",
        description: "Successfully saved the deal",
      });
    },
  });
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="min-h-0 w-full max-w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Module Header */}
      <ModuleHeader
        module="desking"
        title="Professional Deal Desk"
        icon={Calculator}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] bg-white text-gray-900 hover:bg-gray-100"
              data-testid="button-print-deal"
            >
              <Printer className="h-4 w-4 mr-2" />
              <span>Print</span>
            </Button>
            <Button
              onClick={() => saveDealMutation.mutate()}
              disabled={!customerId || !vehicleId || saveDealMutation.isPending}
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
              data-testid="button-save-deal"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>Save Deal</span>
            </Button>
          </div>
        }
      />
      
      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'deal', label: 'Deal Structure' },
          { id: 'summary', label: 'Summary' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 no-print">
        {activeTab === 'deal' ? (
          <div className="space-y-3">
            {/* Customer Selection */}
            <CollapsibleSection
              title="Customer Selection"
              icon={User}
              iconColor="text-blue-600"
              isExpanded={expandedSections.customer}
              onToggle={() => toggleSection('customer')}
              badge={selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Select customer'}
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label>Select Customer</Label>
                  <Select value={customerId?.toString()} onValueChange={(v) => setCustomerId(parseInt(v))}>
                    <SelectTrigger data-testid="select-customer" className="border-2">
                      <SelectValue placeholder="Select customer first..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.firstName} {c.lastName} {c.phone ? `- ${c.phone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCustomer && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-1 text-sm">
                    <div><span className="font-medium">ZIP Code:</span> {customerZip || 'N/A'}</div>
                    <div><span className="font-medium">Credit Score:</span> {selectedCustomer.creditScore || 'N/A'}</div>
                    {selectedCustomer.email && <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Vehicle Selection */}
            <CollapsibleSection
              title="Vehicle Selection"
              icon={Car}
              iconColor="text-blue-600"
              isExpanded={expandedSections.vehicle}
              onToggle={() => toggleSection('vehicle')}
              badge={selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'Select vehicle'}
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Label>Stock Number</Label>
                    <Input
                      value={stockNumber}
                      onChange={(e) => setStockNumber(e.target.value)}
                      onBlur={handleStockLookup}
                      className="border-2"
                      placeholder="Enter stock#"
                      data-testid="input-stock-number"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Or Select Vehicle</Label>
                    <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                      <SelectTrigger data-testid="select-vehicle" className="border-2">
                        <SelectValue placeholder="Select from list..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {v.stockNo} - {v.year} {v.make} {v.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedVehicle && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-1 text-sm">
                    <div><span className="font-medium">VIN:</span> {selectedVehicle.vin}</div>
                    <div><span className="font-medium">Mileage:</span> {selectedVehicle.mileage?.toLocaleString()} mi</div>
                    <div><span className="font-medium">Color:</span> {selectedVehicle.exteriorColor || 'N/A'}</div>
                    <div><span className="font-medium">Drive Type:</span> {selectedVehicle.driveType || 'N/A'}</div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>MSRP</Label>
                    <Input
                      type="number"
                      value={msrp || ''}
                      onChange={(e) => setMsrp(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-msrp"
                    />
                  </div>
                  <div>
                    <Label>Sale Price</Label>
                    <Input
                      type="number"
                      value={salePrice || ''}
                      onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-sale-price"
                    />
                  </div>
                  <div>
                    <Label>Rebates</Label>
                    <Input
                      type="number"
                      value={rebates || ''}
                      onChange={(e) => setRebates(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-rebates"
                    />
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <span className="font-semibold">Net Price:</span> ${(salePrice - rebates).toLocaleString()}
                </div>
              </div>
            </CollapsibleSection>

            {/* Trade-In */}
            <CollapsibleSection
              title="Trade-In"
              icon={Package}
              iconColor="text-blue-600"
              isExpanded={expandedSections.tradeIn}
              onToggle={() => toggleSection('tradeIn')}
              badge={`Net: $${netTrade.toLocaleString()}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Trade Allowance</Label>
                    <Input
                      type="number"
                      value={tradeAllowance || ''}
                      onChange={(e) => setTradeAllowance(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-trade-allowance"
                    />
                  </div>
                  <div>
                    <Label>Payoff</Label>
                    <Input
                      type="number"
                      value={tradePayoff || ''}
                      onChange={(e) => setTradePayoff(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-trade-payoff"
                    />
                  </div>
                </div>
                <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full"
                      data-testid="button-trade-details"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Trade Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Trade Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Actual Cash Value (ACV)</Label>
                        <Input
                          type="number"
                          value={tradeAcv || ''}
                          onChange={(e) => setTradeAcv(parseFloat(e.target.value) || 0)}
                          data-testid="input-trade-acv"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reconditioning</Label>
                        <Input
                          type="number"
                          value={tradeRecon || ''}
                          onChange={(e) => setTradeRecon(parseFloat(e.target.value) || 0)}
                          data-testid="input-trade-recon"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trade Allowance</Label>
                        <Input
                          type="number"
                          value={tradeAllowance || ''}
                          onChange={(e) => setTradeAllowance(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Payoff Amount</Label>
                        <Input
                          type="number"
                          value={tradePayoff || ''}
                          onChange={(e) => setTradePayoff(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                      <div className="text-sm font-semibold">Net Trade: ${netTrade.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Allowance ${tradeAllowance.toLocaleString()} - Payoff ${tradePayoff.toLocaleString()}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <span className="font-semibold">Net Trade Value:</span> ${netTrade.toLocaleString()}
                </div>
              </div>
            </CollapsibleSection>

            {/* Payment Calculator */}
            <CollapsibleSection
              title="Payment Calculator"
              icon={Calculator}
              iconColor="text-blue-600"
              isExpanded={expandedSections.payment}
              onToggle={() => toggleSection('payment')}
              badge={`$${monthlyPayment.toFixed(2)}/mo`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Doc Fee</Label>
                    <Input
                      type="number"
                      value={docFee || ''}
                      onChange={(e) => setDocFee(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-doc-fee"
                    />
                  </div>
                  <div>
                    <Label>Title Fee</Label>
                    <Input
                      type="number"
                      value={titleFee || ''}
                      onChange={(e) => setTitleFee(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-title-fee"
                    />
                  </div>
                  <div>
                    <Label>Registration</Label>
                    <Input
                      type="number"
                      value={registrationFee || ''}
                      onChange={(e) => setRegistrationFee(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-reg-fee"
                    />
                  </div>
                </div>
                
                <Dialog open={feesDialogOpen} onOpenChange={setFeesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full"
                      data-testid="button-add-fees"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Fees
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Custom Fees</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {customFees.map((fee, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={fee.name}
                            onChange={(e) => {
                              const updated = [...customFees];
                              updated[idx].name = e.target.value;
                              setCustomFees(updated);
                            }}
                            placeholder="Fee name"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={fee.amount}
                            onChange={(e) => {
                              const updated = [...customFees];
                              updated[idx].amount = parseFloat(e.target.value) || 0;
                              setCustomFees(updated);
                            }}
                            placeholder="Amount"
                            className="w-full sm:w-32"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const updated = customFees.filter((_, i) => i !== idx);
                              setCustomFees(updated);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => setCustomFees([...customFees, {name: '', amount: 0}])}
                        className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                      >
                        Add Fee
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Term (months)</Label>
                    <Select value={term.toString()} onValueChange={(v) => setTerm(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(dealerSettings?.availableTerms || [36,48,60,72,84]).map(t => (
                          <SelectItem key={t} value={t.toString()}>{t} mo</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>APR %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={apr || ''}
                      onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-apr"
                    />
                  </div>
                  <div>
                    <Label>Down Payment</Label>
                    <Input
                      type="number"
                      value={downPayment || ''}
                      onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                      className="border-2"
                      data-testid="input-down-payment"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPaymentMatrixOpen(true)}
                  className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  data-testid="button-payment-matrix"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  View Payment Matrix
                </Button>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Fees:</span>
                    <span>${totalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sales Tax ({salesTaxRate}%):</span>
                    <span>${salesTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Financed:</span>
                    <span>${amountFinanced.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Monthly Payment:</span>
                    <span className="font-bold text-green-600">${monthlyPayment.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* F&I Products */}
            <CollapsibleSection
              title="F&I Products"
              icon={Receipt}
              iconColor="text-blue-600"
              isExpanded={expandedSections.fiProducts}
              onToggle={() => toggleSection('fiProducts')}
              badge={`${fiProducts.length} products - $${fiProductsRetail.toLocaleString()}`}
            >
              <div className="space-y-4">
                <Dialog open={productsDialogOpen} onOpenChange={setProductsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                      data-testid="button-fi-products"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add F&I Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>F&I Products</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {fiProducts.map((product, idx) => (
                        <div key={idx} className="border p-3 rounded-lg space-y-2">
                          <Input
                            value={product.name}
                            onChange={(e) => {
                              const updated = [...fiProducts];
                              updated[idx].name = e.target.value;
                              setFiProducts(updated);
                            }}
                            placeholder="Product name"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              type="number"
                              value={product.retail}
                              onChange={(e) => {
                                const updated = [...fiProducts];
                                updated[idx].retail = parseFloat(e.target.value) || 0;
                                setFiProducts(updated);
                              }}
                              placeholder="Retail"
                            />
                            <Input
                              type="number"
                              value={product.cost}
                              onChange={(e) => {
                                const updated = [...fiProducts];
                                updated[idx].cost = parseFloat(e.target.value) || 0;
                                setFiProducts(updated);
                              }}
                              placeholder="Cost"
                            />
                            <Input
                              type="number"
                              value={product.term}
                              onChange={(e) => {
                                const updated = [...fiProducts];
                                updated[idx].term = parseInt(e.target.value) || 0;
                                setFiProducts(updated);
                              }}
                              placeholder="Term (mo)"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const updated = fiProducts.filter((_, i) => i !== idx);
                              setFiProducts(updated);
                            }}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => setFiProducts([...fiProducts, {name: '', retail: 0, cost: 0, term: term}])}
                        className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                      >
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {fiProducts.length > 0 && (
                  <div className="space-y-2">
                    {fiProducts.map((product, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{product.term} months</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${product.retail.toLocaleString()}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Gross: ${(product.retail - product.cost).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Aftermarket */}
            <CollapsibleSection
              title="Aftermarket"
              icon={Settings}
              iconColor="text-blue-600"
              isExpanded={expandedSections.aftermarket}
              onToggle={() => toggleSection('aftermarket')}
              badge={`${aftermarket.length} items - $${aftermarketTotal.toLocaleString()}`}
            >
              <div className="space-y-4">
                <Dialog open={aftermarketDialogOpen} onOpenChange={setAftermarketDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                      data-testid="button-aftermarket"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Aftermarket Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aftermarket Items</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {aftermarket.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...aftermarket];
                              updated[idx].name = e.target.value;
                              setAftermarket(updated);
                            }}
                            placeholder="Item name"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...aftermarket];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setAftermarket(updated);
                            }}
                            placeholder="Price"
                            className="w-32"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const updated = aftermarket.filter((_, i) => i !== idx);
                              setAftermarket(updated);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => setAftermarket([...aftermarket, {name: '', price: 0}])}
                        className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                      >
                        Add Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {aftermarket.length > 0 && (
                  <div className="space-y-2">
                    {aftermarket.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                        <div className="font-medium">{item.name}</div>
                        <div className="font-semibold">${item.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>
        ) : (
          /* Summary Tab */
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4">Deal Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Vehicle Price</span>
                  <span className="font-semibold">${salePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Rebates</span>
                  <span className="text-red-600">-${rebates.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Aftermarket</span>
                  <span className="font-semibold">${aftermarketTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Total Fees</span>
                  <span className="font-semibold">${totalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Sales Tax ({salesTaxRate}%)</span>
                  <span className="font-semibold">${salesTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>F&I Products</span>
                  <span className="font-semibold">${fiProductsRetail.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 bg-blue-50 dark:bg-blue-900/20 -mx-4 px-4">
                  <span className="font-bold text-lg">Total Price</span>
                  <span className="font-bold text-lg text-blue-600">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4">Trade-In</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Trade Allowance</span>
                  <span className="font-semibold">${tradeAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Trade Payoff</span>
                  <span className="text-red-600">-${tradePayoff.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 bg-green-50 dark:bg-green-900/20 -mx-4 px-4">
                  <span className="font-bold">Net Trade Value</span>
                  <span className="font-bold text-green-600">${netTrade.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4">Financing</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Down Payment</span>
                  <span className="font-semibold">${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Net Trade Applied</span>
                  <span className="font-semibold">${netTrade.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-orange-50 dark:bg-orange-900/20 -mx-4 px-4">
                  <span className="font-bold">Amount Financed</span>
                  <span className="font-bold text-orange-600">${amountFinanced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Term</span>
                  <span>{term} months</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>APR</span>
                  <span>{apr}%</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 bg-green-50 dark:bg-green-900/20 -mx-4 px-4">
                  <span className="font-bold text-lg">Monthly Payment</span>
                  <span className="font-bold text-lg text-green-600">${monthlyPayment.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4">Profit Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Front Gross</span>
                  <span className="font-semibold">${frontGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Back Gross</span>
                  <span className="font-semibold">${backGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 bg-green-50 dark:bg-green-900/20 -mx-4 px-4">
                  <span className="font-bold">Total Gross</span>
                  <span className="font-bold text-green-600">${totalGross.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Print Summary - Hidden on screen, shown in print */}
      <div className="print-summary hidden">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Deal Summary</h1>
          {selectedCustomer && selectedVehicle && (
            <p className="text-lg">
              {selectedCustomer.firstName} {selectedCustomer.lastName} - {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </p>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Vehicle Information</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Stock #</td>
                <td className="py-2 text-right">{selectedVehicle?.stockNo}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">VIN</td>
                <td className="py-2 text-right">{selectedVehicle?.vin}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Vehicle</td>
                <td className="py-2 text-right">{selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">MSRP</td>
                <td className="py-2 text-right">${msrp.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Sale Price</td>
                <td className="py-2 text-right">${salePrice.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Customer Information</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Name</td>
                <td className="py-2 text-right">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Phone</td>
                <td className="py-2 text-right">{selectedCustomer?.phone}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Email</td>
                <td className="py-2 text-right">{selectedCustomer?.email}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">ZIP Code</td>
                <td className="py-2 text-right">{customerZip}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Price Breakdown</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Vehicle Price</td>
                <td className="py-2 text-right">${salePrice.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Rebates</td>
                <td className="py-2 text-right text-red-600">-${rebates.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Aftermarket</td>
                <td className="py-2 text-right">${aftermarketTotal.toLocaleString()}</td>
              </tr>
              <tr className="border-b bg-gray-100">
                <td className="py-2 font-semibold">Subtotal</td>
                <td className="py-2 text-right font-semibold">${subtotal.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Doc Fee</td>
                <td className="py-2 text-right">${docFee.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Title Fee</td>
                <td className="py-2 text-right">${titleFee.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Registration Fee</td>
                <td className="py-2 text-right">${registrationFee.toLocaleString()}</td>
              </tr>
              {customFees.map((fee, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{fee.name}</td>
                  <td className="py-2 text-right">${fee.amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="border-b">
                <td className="py-2">Sales Tax ({salesTaxRate}%)</td>
                <td className="py-2 text-right">${salesTax.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">F&I Products</td>
                <td className="py-2 text-right">${fiProductsRetail.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Aftermarket</td>
                <td className="py-2 text-right">${aftermarketTotal.toLocaleString()}</td>
              </tr>
              <tr className="border-b bg-blue-50">
                <td className="py-3 font-bold text-lg">Total Price</td>
                <td className="py-3 text-right font-bold text-lg text-blue-600">${totalPrice.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Trade-In Information</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Trade Allowance</td>
                <td className="py-2 text-right">${tradeAllowance.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Trade Payoff</td>
                <td className="py-2 text-right text-red-600">-${tradePayoff.toLocaleString()}</td>
              </tr>
              <tr className="border-b bg-green-50">
                <td className="py-2 font-semibold">Net Trade Value</td>
                <td className="py-2 text-right font-bold text-green-600">${netTrade.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Financing Details</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Down Payment</td>
                <td className="py-2 text-right">${downPayment.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Net Trade Applied</td>
                <td className="py-2 text-right">${netTrade.toLocaleString()}</td>
              </tr>
              <tr className="border-b bg-orange-50">
                <td className="py-2 font-semibold">Amount Financed</td>
                <td className="py-2 text-right font-bold text-orange-600">${amountFinanced.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Term</td>
                <td className="py-2 text-right">{term} months</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">APR</td>
                <td className="py-2 text-right">{apr}%</td>
              </tr>
              <tr className="border-b bg-green-50">
                <td className="py-3 font-bold text-lg">Monthly Payment</td>
                <td className="py-3 text-right font-bold text-lg text-green-600">${monthlyPayment.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {fiProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">F&I Products</h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 text-left">Product</th>
                  <th className="py-2 text-right">Retail</th>
                  <th className="py-2 text-right">Term</th>
                </tr>
              </thead>
              <tbody>
                {fiProducts.map((product, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{product.name}</td>
                    <td className="py-2 text-right">${product.retail.toLocaleString()}</td>
                    <td className="py-2 text-right">{product.term} mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {aftermarket.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Aftermarket Items</h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 text-left">Item</th>
                  <th className="py-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {aftermarket.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-right">${item.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="text-center mt-12 pt-8 border-t-2 border-gray-300">
          <p className="text-sm text-gray-600">Customer Signature: ___________________________ Date: _______________</p>
        </div>
      </div>
      
      {/* Payment Matrix Dialog */}
      <Dialog open={paymentMatrixOpen} onOpenChange={setPaymentMatrixOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Payment Matrix Calculator</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
                  <span className="ml-2 font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Net Trade:</span>
                  <span className="ml-2 font-semibold">${netTrade.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">APR:</span>
                  <span className="ml-2 font-semibold">{apr}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Current Down:</span>
                  <span className="ml-2 font-semibold">${downPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-700 p-2 text-left font-semibold">
                      Down Payment
                    </th>
                    {(dealerSettings?.availableTerms || [36,48,60,72,84]).map(termMonths => (
                      <th key={termMonths} className="border border-gray-300 dark:border-gray-700 p-2 text-center font-semibold">
                        {termMonths} months
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 2500, 5000, 7500, 10000, 15000, 20000].map((downPmt) => {
                    // Use same calculation as main deal: totalPrice - netTrade - downPmt
                    const amtFinanced = Math.max(0, totalPrice - netTrade - downPmt);
                    
                    return (
                      <tr key={downPmt} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-700 p-2 font-medium">
                          ${downPmt.toLocaleString()}
                        </td>
                        {(dealerSettings?.availableTerms || [36,48,60,72,84]).map(termMonths => {
                          const monthlyRate = apr / 100 / 12;
                          
                          // Handle zero APR case and zero/undefined term (matches main deal logic)
                          let payment = 0;
                          if (!termMonths || termMonths === 0) {
                            payment = 0;
                          } else if (apr === 0) {
                            // Zero APR: simple division
                            payment = amtFinanced / termMonths;
                          } else {
                            // Standard amortization formula
                            payment = (amtFinanced * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
                          }
                          
                          const isCurrentSelection = downPmt === downPayment && termMonths === term;
                          
                          return (
                            <td 
                              key={termMonths} 
                              className={`border border-gray-300 dark:border-gray-700 p-2 text-center cursor-pointer transition-colors ${
                                isCurrentSelection 
                                  ? 'bg-green-100 dark:bg-green-900/30 font-bold text-green-700 dark:text-green-400' 
                                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              onClick={() => {
                                setDownPayment(downPmt);
                                setTerm(termMonths);
                                setPaymentMatrixOpen(false);
                              }}
                              data-testid={`payment-cell-${downPmt}-${termMonths}`}
                            >
                              ${payment.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Click any cell to apply that down payment and term to your deal. Green cell indicates current selection.
            </div>
            
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setPaymentMatrixOpen(false)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                data-testid="button-print-matrix"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Matrix
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Print-specific CSS */}
      <style>{`
        @media print {
          /* Hide all UI elements */
          .no-print,
          header, nav, button,
          [role="dialog"],
          [role="alertdialog"] {
            display: none !important;
          }
          
          /* Show only print summary */
          .print-summary {
            display: block !important;
            padding: 20px;
            max-width: 100%;
            color: black !important;
            background: white !important;
          }
          
          /* Override dark mode for print */
          .print-summary * {
            color: black !important;
            background: white !important;
          }
          
          /* Special colors for highlights */
          .print-summary .text-blue-600,
          .print-summary .text-green-600,
          .print-summary .text-red-600,
          .print-summary .text-orange-600 {
            color: black !important;
            font-weight: bold;
          }
          
          /* Keep background colors for table rows */
          .print-summary .bg-gray-100,
          .print-summary .bg-blue-50,
          .print-summary .bg-green-50,
          .print-summary .bg-orange-50 {
            background: #f3f4f6 !important;
          }
          
          /* Clean table borders for print */
          .print-summary table {
            page-break-inside: avoid;
            border-collapse: collapse;
          }
          
          .print-summary table td,
          .print-summary table th {
            border: 1px solid #d1d5db !important;
          }
          
          /* Ensure proper page breaks */
          .print-summary h2 {
            page-break-after: avoid;
          }
          
          /* Remove shadows */
          .print-summary * {
            box-shadow: none !important;
          }
          
          /* Set page margins */
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
