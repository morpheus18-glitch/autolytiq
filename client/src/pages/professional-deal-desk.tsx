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
  Settings
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
  const [fiProducts, setFiProducts] = useState<Array<{name: string; retail: number; cost: number}>>([]);
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
  const monthlyPayment = monthlyRate > 0 
    ? (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
    : amountFinanced / term;
  
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
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Deal Desk</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
              data-testid="button-print-deal"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={() => saveDealMutation.mutate()}
              disabled={!customerId || !vehicleId || saveDealMutation.isPending}
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
              data-testid="button-save-deal"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Deal
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Data Table Structure - Clean Rows */}
        
        {/* Customer Row - FIRST */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <User className="h-5 w-5 text-blue-600" />
              <Label className="font-semibold text-base">Customer</Label>
            </div>
            <div className="flex-1">
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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ZIP: {customerZip || 'N/A'} | Credit: {selectedCustomer.creditScore || 'N/A'}
              </div>
            )}
          </div>
        </Card>
        
        {/* Vehicle Row */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Car className="h-5 w-5 text-green-600" />
              <Label className="font-semibold text-base">Vehicle</Label>
            </div>
            <div className="flex gap-2 flex-1">
              <div className="flex gap-2 items-center">
                <Label className="text-sm">Stock#</Label>
                <Input
                  value={stockNumber}
                  onChange={(e) => setStockNumber(e.target.value)}
                  onBlur={handleStockLookup}
                  className="w-32 border-2"
                  placeholder="Enter stock#"
                  data-testid="input-stock-number"
                />
              </div>
              <div className="flex-1">
                <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                  <SelectTrigger data-testid="select-vehicle" className="border-2">
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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedVehicle.mileage?.toLocaleString()} mi | {selectedVehicle.exteriorColor || ''} | {selectedVehicle.driveType || ''}
              </div>
            )}
          </div>
        </Card>
        
        {/* Pricing Row */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <Label className="font-semibold text-base">Pricing</Label>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">MSRP</Label>
                <Input
                  type="number"
                  value={msrp || ''}
                  onChange={(e) => setMsrp(parseFloat(e.target.value) || 0)}
                  className="w-32 border-2"
                  data-testid="input-msrp"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Sale Price</Label>
                <Input
                  type="number"
                  value={salePrice || ''}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-32 border-2"
                  data-testid="input-sale-price"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Rebates</Label>
                <Input
                  type="number"
                  value={rebates || ''}
                  onChange={(e) => setRebates(parseFloat(e.target.value) || 0)}
                  className="w-32 border-2"
                  data-testid="input-rebates"
                />
              </div>
            </div>
            <div className="text-sm font-semibold text-blue-600">
              Net: ${(salePrice - rebates).toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Trade Row with Drill-Down */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Car className="h-5 w-5 text-purple-600" />
              <Label className="font-semibold text-base">Trade</Label>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Allowance</Label>
                <Input
                  type="number"
                  value={tradeAllowance || ''}
                  onChange={(e) => setTradeAllowance(parseFloat(e.target.value) || 0)}
                  className="w-32 border-2"
                  data-testid="input-trade-allowance"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Payoff</Label>
                <Input
                  type="number"
                  value={tradePayoff || ''}
                  onChange={(e) => setTradePayoff(parseFloat(e.target.value) || 0)}
                  className="w-32 border-2"
                  data-testid="input-trade-payoff"
                />
              </div>
            </div>
            <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  data-testid="button-trade-details"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Trade Details</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
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
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm font-semibold">Net Trade: ${netTrade.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Allowance ${tradeAllowance.toLocaleString()} - Payoff ${tradePayoff.toLocaleString()}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-sm font-semibold text-purple-600">
              Net: ${netTrade.toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Fees Row with Drill-Down */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Receipt className="h-5 w-5 text-red-600" />
              <Label className="font-semibold text-base">Fees</Label>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Doc Fee</Label>
                <Input
                  type="number"
                  value={docFee || ''}
                  onChange={(e) => setDocFee(parseFloat(e.target.value) || 0)}
                  className="w-28 border-2"
                  data-testid="input-doc-fee"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Title</Label>
                <Input
                  type="number"
                  value={titleFee || ''}
                  onChange={(e) => setTitleFee(parseFloat(e.target.value) || 0)}
                  className="w-28 border-2"
                  data-testid="input-title-fee"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Registration</Label>
                <Input
                  type="number"
                  value={registrationFee || ''}
                  onChange={(e) => setRegistrationFee(parseFloat(e.target.value) || 0)}
                  className="w-28 border-2"
                  data-testid="input-reg-fee"
                />
              </div>
            </div>
            <Dialog open={feesDialogOpen} onOpenChange={setFeesDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  data-testid="button-add-fees"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Add Fees
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Custom Fees</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {customFees.map((fee, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={fee.name}
                        onChange={(e) => {
                          const updated = [...customFees];
                          updated[idx].name = e.target.value;
                          setCustomFees(updated);
                        }}
                        placeholder="Fee name"
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
                        className="w-32"
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
            <div className="text-sm font-semibold text-red-600">
              Total: ${totalFees.toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Products & Aftermarket Row */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Package className="h-5 w-5 text-indigo-600" />
              <Label className="font-semibold text-base">Products</Label>
            </div>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductsDialogOpen(true)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                data-testid="button-fi-products"
              >
                F&I Products ({fiProducts.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAftermarketDialogOpen(true)}
                className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                data-testid="button-aftermarket"
              >
                Aftermarket ({aftermarket.length})
              </Button>
            </div>
            <div className="text-sm font-semibold text-indigo-600">
              F&I: ${fiProductsRetail.toLocaleString()} | AM: ${aftermarketTotal.toLocaleString()}
            </div>
          </div>
        </Card>
        
        {/* Finance & Payment Row */}
        <Card className="p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <DollarSign className="h-5 w-5 text-green-600" />
              <Label className="font-semibold text-base">Finance</Label>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Term</Label>
                <Select value={term.toString()} onValueChange={(v) => setTerm(parseInt(v))}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(dealerSettings?.availableTerms || [36,48,60,72,84]).map(t => (
                      <SelectItem key={t} value={t.toString()}>{t} mo</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">APR %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={apr || ''}
                  onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                  className="w-24 border-2"
                  data-testid="input-apr"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Down Payment</Label>
                <Input
                  type="number"
                  value={downPayment || ''}
                  onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                  className="w-32 border-2"
                  data-testid="input-down-payment"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentMatrixOpen(true)}
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              data-testid="button-payment-matrix"
            >
              Payment Matrix
            </Button>
            <div className="text-lg font-bold text-green-600">
              ${monthlyPayment.toFixed(2)}/mo
            </div>
          </div>
        </Card>
        
        {/* Totals Summary Row */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Subtotal</div>
              <div className="text-xl font-bold">${subtotal.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sales Tax ({salesTaxRate}%)</div>
              <div className="text-xl font-bold">${salesTax.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Price</div>
              <div className="text-xl font-bold text-blue-600">${totalPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Amount Financed</div>
              <div className="text-xl font-bold text-green-600">${amountFinanced.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Front Gross</div>
              <div className="text-lg font-semibold">${frontGross.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Back Gross</div>
              <div className="text-lg font-semibold">${backGross.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Gross</div>
              <div className="text-lg font-bold text-emerald-600">${totalGross.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Payment Matrix Dialog - TODO: Implement payment grid */}
      <Dialog open={paymentMatrixOpen} onOpenChange={setPaymentMatrixOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Payment Matrix</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">Down Payment × Term = Monthly Payment Grid</p>
            {/* TODO: Implement payment matrix table */}
            <div className="text-center text-gray-400 py-8">Payment Matrix Coming Soon</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
