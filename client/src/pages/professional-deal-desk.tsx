import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
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
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 no-print">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Professional Deal Desk</h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
              data-testid="button-print-deal"
            >
              <Printer className="h-4 w-4 mr-2" />
              <span>Print</span>
            </Button>
            <Button
              onClick={() => saveDealMutation.mutate()}
              disabled={!customerId || !vehicleId || saveDealMutation.isPending}
              className="flex-1 sm:flex-initial shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
              data-testid="button-save-deal"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>Save Deal</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 no-print">
        {/* Data Table Structure - Clean Rows */}
        
        {/* Customer Row - FIRST */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
              <Label className="font-semibold text-sm sm:text-base">Customer</Label>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <Select value={customerId?.toString()} onValueChange={(v) => setCustomerId(parseInt(v))}>
                <SelectTrigger data-testid="select-customer" className="border-2 w-full">
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
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                ZIP: {customerZip || 'N/A'} | Credit: {selectedCustomer.creditScore || 'N/A'}
              </div>
            )}
          </div>
        </Card>
        
        {/* Vehicle Row */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Car className="h-5 w-5 text-green-600" />
              <Label className="font-semibold text-sm sm:text-base">Vehicle</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-1 w-full sm:w-auto">
              <div className="flex gap-2 items-center">
                <Label className="text-xs sm:text-sm whitespace-nowrap">Stock#</Label>
                <Input
                  value={stockNumber}
                  onChange={(e) => setStockNumber(e.target.value)}
                  onBlur={handleStockLookup}
                  className="w-full sm:w-32 border-2"
                  placeholder="Enter stock#"
                  data-testid="input-stock-number"
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                  <SelectTrigger data-testid="select-vehicle" className="border-2 w-full">
                    <SelectValue placeholder="Or select vehicle..." />
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
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {selectedVehicle.mileage?.toLocaleString()} mi | {selectedVehicle.exteriorColor || ''} | {selectedVehicle.driveType || ''}
              </div>
            )}
          </div>
        </Card>
        
        {/* Pricing Row */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <Label className="font-semibold text-sm sm:text-base whitespace-nowrap">Pricing</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">MSRP</Label>
                <Input
                  type="number"
                  value={msrp || ''}
                  onChange={(e) => setMsrp(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-32 border-2"
                  data-testid="input-msrp"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Sale Price</Label>
                <Input
                  type="number"
                  value={salePrice || ''}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-32 border-2"
                  data-testid="input-sale-price"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Rebates</Label>
                <Input
                  type="number"
                  value={rebates || ''}
                  onChange={(e) => setRebates(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-32 border-2"
                  data-testid="input-rebates"
                />
              </div>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-blue-600 truncate">
              Net: ${(salePrice - rebates).toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Trade Row with Drill-Down */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Car className="h-5 w-5 text-purple-600" />
              <Label className="font-semibold text-sm sm:text-base whitespace-nowrap">Trade</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Allowance</Label>
                <Input
                  type="number"
                  value={tradeAllowance || ''}
                  onChange={(e) => setTradeAllowance(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-32 border-2"
                  data-testid="input-trade-allowance"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Payoff</Label>
                <Input
                  type="number"
                  value={tradePayoff || ''}
                  onChange={(e) => setTradePayoff(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-32 border-2"
                  data-testid="input-trade-payoff"
                />
              </div>
            </div>
            <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full sm:w-auto"
                  data-testid="button-trade-details"
                >
                  <Settings className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Details</span>
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
            <div className="text-xs sm:text-sm font-semibold text-purple-600 truncate">
              Net: ${netTrade.toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Fees Row with Drill-Down */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Receipt className="h-5 w-5 text-red-600" />
              <Label className="font-semibold text-sm sm:text-base whitespace-nowrap">Fees</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Doc Fee</Label>
                <Input
                  type="number"
                  value={docFee || ''}
                  onChange={(e) => setDocFee(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-28 border-2"
                  data-testid="input-doc-fee"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Title</Label>
                <Input
                  type="number"
                  value={titleFee || ''}
                  onChange={(e) => setTitleFee(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-28 border-2"
                  data-testid="input-title-fee"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Registration</Label>
                <Input
                  type="number"
                  value={registrationFee || ''}
                  onChange={(e) => setRegistrationFee(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-28 border-2"
                  data-testid="input-reg-fee"
                />
              </div>
            </div>
            <Dialog open={feesDialogOpen} onOpenChange={setFeesDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full sm:w-auto"
                  data-testid="button-add-fees"
                >
                  <Settings className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add Fees</span>
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
            <div className="text-xs sm:text-sm font-semibold text-red-600 truncate">
              Total: ${totalFees.toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Products & Aftermarket Row */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Package className="h-5 w-5 text-indigo-600" />
              <Label className="font-semibold text-sm sm:text-base whitespace-nowrap">Products</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductsDialogOpen(true)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full sm:w-auto"
                data-testid="button-fi-products"
              >
                F&I Products ({fiProducts.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAftermarketDialogOpen(true)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full sm:w-auto"
                data-testid="button-aftermarket"
              >
                Aftermarket ({aftermarket.length})
              </Button>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-indigo-600 truncate">
              F&I: ${fiProductsRetail.toLocaleString()} | AM: ${aftermarketTotal.toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Finance & Payment Row */}
        <Card className="p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <DollarSign className="h-5 w-5 text-green-600" />
              <Label className="font-semibold text-sm sm:text-base whitespace-nowrap">Finance</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Term</Label>
                <Select value={term.toString()} onValueChange={(v) => setTerm(parseInt(v))}>
                  <SelectTrigger className="w-full sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(dealerSettings?.availableTerms || [36,48,60,72,84]).map(t => (
                      <SelectItem key={t} value={t.toString()}>{t} mo</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">APR %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={apr || ''}
                  onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-24 border-2"
                  data-testid="input-apr"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs text-gray-500">Down Payment</Label>
                <Input
                  type="number"
                  value={downPayment || ''}
                  onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-32 border-2"
                  data-testid="input-down-payment"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentMatrixOpen(true)}
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full sm:w-auto"
              data-testid="button-payment-matrix"
            >
              <span className="hidden sm:inline">Payment Matrix</span>
              <span className="sm:hidden">Matrix</span>
            </Button>
            <div className="text-sm sm:text-lg font-bold text-green-600 truncate">
              ${monthlyPayment.toFixed(2)}/mo
            </div>
          </div>
        </Card>
        
        {/* Totals Summary Row */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Subtotal</div>
              <div className="text-lg sm:text-xl font-bold truncate">${subtotal.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sales Tax ({salesTaxRate}%)</div>
              <div className="text-lg sm:text-xl font-bold truncate">${salesTax.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Price</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600 truncate">${totalPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Amount Financed</div>
              <div className="text-lg sm:text-xl font-bold text-green-600 truncate">${amountFinanced.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Front Gross</div>
              <div className="text-base sm:text-lg font-semibold truncate">${frontGross.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Back Gross</div>
              <div className="text-base sm:text-lg font-semibold truncate">${backGross.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Gross</div>
              <div className="text-base sm:text-lg font-bold text-emerald-600 truncate">${totalGross.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* F&I Products Dialog */}
      <Dialog open={productsDialogOpen} onOpenChange={setProductsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">F&I Products</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-left">Product Name</th>
                    <th className="p-2 text-right">Retail</th>
                    <th className="p-2 text-right">Cost</th>
                    <th className="p-2 text-center">Term</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fiProducts.map((product, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <Input
                          value={product.name}
                          onChange={(e) => {
                            const updated = [...fiProducts];
                            updated[idx].name = e.target.value;
                            setFiProducts(updated);
                          }}
                          placeholder="Extended Warranty"
                          className="border-2"
                          data-testid={`input-fi-name-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={product.retail || ''}
                          onChange={(e) => {
                            const updated = [...fiProducts];
                            updated[idx].retail = parseFloat(e.target.value) || 0;
                            setFiProducts(updated);
                          }}
                          className="border-2 text-right"
                          data-testid={`input-fi-retail-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={product.cost || ''}
                          onChange={(e) => {
                            const updated = [...fiProducts];
                            updated[idx].cost = parseFloat(e.target.value) || 0;
                            setFiProducts(updated);
                          }}
                          className="border-2 text-right"
                          data-testid={`input-fi-cost-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={product.term || ''}
                          onChange={(e) => {
                            const updated = [...fiProducts];
                            updated[idx].term = parseInt(e.target.value) || 0;
                            setFiProducts(updated);
                          }}
                          className="border-2 text-center w-20"
                          data-testid={`input-fi-term-${idx}`}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = fiProducts.filter((_, i) => i !== idx);
                            setFiProducts(updated);
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-fi-${idx}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button
              onClick={() => setFiProducts([...fiProducts, { name: '', retail: 0, cost: 0, term: 0 }])}
              className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
              data-testid="button-add-fi-product"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add F&I Product
            </Button>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex justify-between items-center">
              <span className="font-semibold">Total F&I Retail:</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ${fiProductsRetail.toLocaleString()}
              </span>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setProductsDialogOpen(false)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Aftermarket Dialog */}
      <Dialog open={aftermarketDialogOpen} onOpenChange={setAftermarketDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Aftermarket Products</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-left">Item Name</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aftermarket.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...aftermarket];
                            updated[idx].name = e.target.value;
                            setAftermarket(updated);
                          }}
                          placeholder="Floor Mats, Window Tint, etc."
                          className="border-2"
                          data-testid={`input-am-name-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => {
                            const updated = [...aftermarket];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setAftermarket(updated);
                          }}
                          className="border-2 text-right"
                          data-testid={`input-am-price-${idx}`}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = aftermarket.filter((_, i) => i !== idx);
                            setAftermarket(updated);
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-am-${idx}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button
              onClick={() => setAftermarket([...aftermarket, { name: '', price: 0 }])}
              className="w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
              data-testid="button-add-aftermarket"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Aftermarket Item
            </Button>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg flex justify-between items-center">
              <span className="font-semibold">Total Aftermarket:</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ${aftermarketTotal.toLocaleString()}
              </span>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setAftermarketDialogOpen(false)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Print-only Deal Summary */}
      <div className="hidden print:block print-summary">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Pricing Worksheet</h1>
          <p className="text-gray-600">AutolytiQ Dealership</p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Customer Information</h2>
            <p><strong>Name:</strong> {selectedCustomer?.firstName} {selectedCustomer?.lastName}</p>
            <p><strong>Email:</strong> {selectedCustomer?.email}</p>
            <p><strong>Phone:</strong> {selectedCustomer?.phone}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Vehicle Information</h2>
            <p><strong>Stock #:</strong> {selectedVehicle?.stockNo}</p>
            <p><strong>Vehicle:</strong> {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}</p>
            <p><strong>VIN:</strong> {selectedVehicle?.vin}</p>
            <p><strong>MSRP:</strong> ${selectedVehicle?.msrp?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Price Breakdown</h2>
          <table className="w-full border-collapse mb-4">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Sale Price</td>
                <td className="py-2 text-right font-semibold">${salePrice.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Rebates</td>
                <td className="py-2 text-right text-red-600">-${rebates.toLocaleString()}</td>
              </tr>
              <tr className="border-b bg-gray-100">
                <td className="py-2 font-semibold">Subtotal</td>
                <td className="py-2 text-right font-bold">${subtotal.toLocaleString()}</td>
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
