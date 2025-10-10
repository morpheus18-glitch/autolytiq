import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  Car, 
  DollarSign, 
  Percent, 
  FileText, 
  Save,
  Printer,
  Search,
  MapPin,
  TrendingUp,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';
import type { Vehicle, Customer } from '@shared/schema';
import { AINext } from '@/components/ai-negotiation-assistant';

// Sales tax rates by state (simplified - in production use API)
const STATE_TAX_RATES: Record<string, { salesTax: number; titleFee: number; regFee: number }> = {
  'AL': { salesTax: 0.02, titleFee: 15, regFee: 23 },
  'AK': { salesTax: 0, titleFee: 15, regFee: 100 },
  'AZ': { salesTax: 0.056, titleFee: 4, regFee: 8 },
  'AR': { salesTax: 0.065, titleFee: 10, regFee: 17 },
  'CA': { salesTax: 0.0725, titleFee: 65, regFee: 60 },
  'CO': { salesTax: 0.029, titleFee: 7.2, regFee: 7.2 },
  'CT': { salesTax: 0.0635, titleFee: 25, regFee: 120 },
  'DE': { salesTax: 0, titleFee: 40, regFee: 40 },
  'FL': { salesTax: 0.06, titleFee: 75.25, regFee: 225 },
  'GA': { salesTax: 0.04, titleFee: 18, regFee: 20 },
  'HI': { salesTax: 0.04, titleFee: 5, regFee: 45 },
  'ID': { salesTax: 0.06, titleFee: 14, regFee: 69 },
  'IL': { salesTax: 0.0625, titleFee: 150, regFee: 151 },
  'IN': { salesTax: 0.07, titleFee: 15, regFee: 21.35 },
  'IA': { salesTax: 0.05, titleFee: 25, regFee: 30 },
  'KS': { salesTax: 0.065, titleFee: 10, regFee: 30 },
  'KY': { salesTax: 0.06, titleFee: 9, regFee: 21 },
  'LA': { salesTax: 0.04, titleFee: 68.50, regFee: 20 },
  'ME': { salesTax: 0.055, titleFee: 33, regFee: 35 },
  'MD': { salesTax: 0.06, titleFee: 100, regFee: 135 },
  'MA': { salesTax: 0.0625, titleFee: 75, regFee: 60 },
  'MI': { salesTax: 0.06, titleFee: 15, regFee: 50 },
  'MN': { salesTax: 0.065, titleFee: 8.25, regFee: 13 },
  'MS': { salesTax: 0.05, titleFee: 9, regFee: 14 },
  'MO': { salesTax: 0.04225, titleFee: 11, regFee: 18.25 },
  'MT': { salesTax: 0, titleFee: 10.50, regFee: 28 },
  'NE': { salesTax: 0.055, titleFee: 10, regFee: 15 },
  'NV': { salesTax: 0.0685, titleFee: 30.75, regFee: 33 },
  'NH': { salesTax: 0, titleFee: 25, regFee: 31.20 },
  'NJ': { salesTax: 0.06625, titleFee: 60, regFee: 35 },
  'NM': { salesTax: 0.04, titleFee: 14, regFee: 27 },
  'NY': { salesTax: 0.04, titleFee: 50, regFee: 32.50 },
  'NC': { salesTax: 0.03, titleFee: 52, regFee: 38.75 },
  'ND': { salesTax: 0.05, titleFee: 5, regFee: 49 },
  'OH': { salesTax: 0.0575, titleFee: 15, regFee: 34.50 },
  'OK': { salesTax: 0.0325, titleFee: 11, regFee: 85 },
  'OR': { salesTax: 0, titleFee: 93, regFee: 122 },
  'PA': { salesTax: 0.06, titleFee: 53, regFee: 38 },
  'RI': { salesTax: 0.07, titleFee: 52.50, regFee: 30 },
  'SC': { salesTax: 0.05, titleFee: 15, regFee: 40 },
  'SD': { salesTax: 0.04, titleFee: 28, regFee: 48 },
  'TN': { salesTax: 0.07, titleFee: 14.50, regFee: 26.50 },
  'TX': { salesTax: 0.0625, titleFee: 33, regFee: 50.75 },
  'UT': { salesTax: 0.0485, titleFee: 30, regFee: 150 },
  'VT': { salesTax: 0.06, titleFee: 35, regFee: 76 },
  'VA': { salesTax: 0.0415, titleFee: 15, regFee: 33 },
  'WA': { salesTax: 0.065, titleFee: 15, regFee: 30 },
  'WV': { salesTax: 0.06, titleFee: 15, regFee: 51.50 },
  'WI': { salesTax: 0.05, titleFee: 164.50, regFee: 85 },
  'WY': { salesTax: 0.04, titleFee: 15, regFee: 30 }
};

const ZIP_TO_STATE: Record<string, string> = {
  // This is a simplified mapping - in production use a proper ZIP to state API
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'CA',
  '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY',
  '60': 'IL', '61': 'IL', '62': 'IL',
  '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX',
  '33': 'FL', '32': 'FL', '34': 'FL',
  '30': 'GA', '31': 'GA',
  // Add more as needed
};

interface DealStructure {
  // Vehicle Info
  stockNumber: string;
  vehicleId?: number;
  vehiclePrice: number;
  
  // Customer Info
  customerId?: number;
  customerZip: string;
  customerState: string;
  
  // Trade-In
  tradeValue: number;
  tradePayoff: number;
  
  // Taxes & Fees
  salesTaxRate: number;
  salesTaxAmount: number;
  titleFee: number;
  registrationFee: number;
  dealerDocFee: number;
  
  // Down Payment
  downPayment: number;
  
  // Finance Terms
  financeRate: number;
  financeCompany: string;
  termMonths: number;
  
  // Lease Terms
  leaseMoneyFactor: number;
  leaseResidual: number;
  leaseTerm: number;
  
  // Calculations
  netTradeValue: number;
  totalFees: number;
  totalPrice: number;
  amountFinanced: number;
  cashPayment: number;
  financePayment: number;
  leasePayment: number;
}

export default function DealDeskUnified() {
  const { toast } = useToast();
  
  const [paymentType, setPaymentType] = useState<'cash' | 'finance' | 'lease'>('finance');
  const [deal, setDeal] = useState<DealStructure>({
    stockNumber: '',
    vehiclePrice: 0,
    customerId: undefined,
    customerZip: '',
    customerState: '',
    tradeValue: 0,
    tradePayoff: 0,
    salesTaxRate: 0,
    salesTaxAmount: 0,
    titleFee: 0,
    registrationFee: 0,
    dealerDocFee: 699,
    downPayment: 0,
    financeRate: 6.99,
    financeCompany: '',
    termMonths: 72,
    leaseMoneyFactor: 0.00125,
    leaseResidual: 0.60,
    leaseTerm: 36,
    netTradeValue: 0,
    totalFees: 0,
    totalPrice: 0,
    amountFinanced: 0,
    cashPayment: 0,
    financePayment: 0,
    leasePayment: 0
  });

  // Fetch vehicles and customers
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Calculate deal whenever inputs change
  useEffect(() => {
    calculateDeal();
  }, [
    deal.vehiclePrice, deal.tradeValue, deal.tradePayoff, deal.downPayment,
    deal.customerState, deal.dealerDocFee, deal.financeRate, deal.termMonths,
    deal.leaseMoneyFactor, deal.leaseResidual, deal.leaseTerm
  ]);

  const lookupVehicleByStock = () => {
    if (!deal.stockNumber.trim()) {
      toast({
        title: "Stock Number Required",
        description: "Please enter a stock number",
        variant: "destructive"
      });
      return;
    }

    // Try to find vehicle by stock number (assuming vehicles have a stockNumber field)
    const vehicle = vehicles.find(v => 
      v.vin?.toLowerCase().includes(deal.stockNumber.toLowerCase()) ||
      v.uuid?.toLowerCase().includes(deal.stockNumber.toLowerCase())
    );

    if (vehicle) {
      setDeal(prev => ({
        ...prev,
        vehicleId: vehicle.id,
        vehiclePrice: vehicle.price || 0
      }));
      toast({
        title: "Vehicle Found",
        description: `${vehicle.year} ${vehicle.make} ${vehicle.model} - $${vehicle.price?.toLocaleString()}`
      });
    } else {
      toast({
        title: "Vehicle Not Found",
        description: "No vehicle matches that stock number",
        variant: "destructive"
      });
    }
  };

  const lookupTaxesByZip = () => {
    if (!deal.customerZip || deal.customerZip.length < 2) {
      toast({
        title: "ZIP Code Required",
        description: "Please enter a valid ZIP code",
        variant: "destructive"
      });
      return;
    }

    const zipPrefix = deal.customerZip.substring(0, 2);
    const state = ZIP_TO_STATE[zipPrefix] || '';
    
    if (state && STATE_TAX_RATES[state]) {
      const taxInfo = STATE_TAX_RATES[state];
      setDeal(prev => ({
        ...prev,
        customerState: state,
        salesTaxRate: taxInfo.salesTax,
        titleFee: taxInfo.titleFee,
        registrationFee: taxInfo.regFee
      }));
      toast({
        title: "Tax Rates Loaded",
        description: `${state}: ${(taxInfo.salesTax * 100).toFixed(2)}% sales tax, $${taxInfo.titleFee} title, $${taxInfo.regFee} registration`
      });
    } else {
      toast({
        title: "State Not Found",
        description: "Could not determine state from ZIP code. Please select manually.",
        variant: "destructive"
      });
    }
  };

  const calculateDeal = () => {
    // Net trade value (trade minus payoff)
    const netTradeValue = Math.max(0, deal.tradeValue - deal.tradePayoff);
    
    // Sales tax on vehicle price
    const salesTaxAmount = deal.vehiclePrice * deal.salesTaxRate;
    
    // Total fees
    const totalFees = salesTaxAmount + deal.titleFee + deal.registrationFee + deal.dealerDocFee;
    
    // Total price (vehicle + fees)
    const totalPrice = deal.vehiclePrice + totalFees;
    
    // Amount financed (total - trade - down payment)
    const amountFinanced = Math.max(0, totalPrice - netTradeValue - deal.downPayment);
    
    // Cash payment (if paying cash)
    const cashPayment = totalPrice - netTradeValue;
    
    // Finance payment calculation
    let financePayment = 0;
    if (amountFinanced > 0 && deal.financeRate > 0) {
      const monthlyRate = deal.financeRate / 100 / 12;
      const numPayments = deal.termMonths;
      financePayment = amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                       (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    // Lease payment calculation
    let leasePayment = 0;
    if (deal.vehiclePrice > 0 && deal.leaseResidual > 0) {
      const residualValue = deal.vehiclePrice * deal.leaseResidual;
      const depreciation = (deal.vehiclePrice - residualValue) / deal.leaseTerm;
      const financeCharge = (deal.vehiclePrice + residualValue) * deal.leaseMoneyFactor;
      leasePayment = depreciation + financeCharge;
    }
    
    setDeal(prev => ({
      ...prev,
      netTradeValue,
      salesTaxAmount,
      totalFees,
      totalPrice,
      amountFinanced,
      cashPayment,
      financePayment: isNaN(financePayment) ? 0 : financePayment,
      leasePayment: isNaN(leasePayment) ? 0 : leasePayment
    }));
  };

  const selectedVehicle = vehicles.find(v => v.id === deal.vehicleId);
  const selectedCustomer = customers.find(c => c.id === deal.customerId);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Deal Desk</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Structure and calculate deals with precision</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" data-testid="button-save-deal">
            <Save className="h-4 w-4 mr-2" />
            Save Deal
          </Button>
          <Button variant="outline" size="sm" data-testid="button-print-deal">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Deal Inputs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Vehicle Lookup */}
          <Card data-testid="card-vehicle-lookup">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="stockNumber">Stock Number</Label>
                  <Input
                    id="stockNumber"
                    data-testid="input-stock-number"
                    value={deal.stockNumber}
                    onChange={(e) => setDeal(prev => ({ ...prev, stockNumber: e.target.value }))}
                    placeholder="Enter stock number or VIN"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={lookupVehicleByStock} data-testid="button-lookup-vehicle">
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </Button>
                </div>
              </div>
              
              {selectedVehicle && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">VIN: {selectedVehicle.vin}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="vehiclePrice"
                    data-testid="input-vehicle-price"
                    type="number"
                    value={deal.vehiclePrice || ''}
                    onChange={(e) => setDeal(prev => ({ ...prev, vehiclePrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Tax Info */}
          <Card data-testid="card-customer-tax">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Customer & Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerId">Customer</Label>
                <Select 
                  value={deal.customerId?.toString() || ''} 
                  onValueChange={(val) => {
                    const customer = customers.find(c => c.id === parseInt(val));
                    setDeal(prev => ({ 
                      ...prev, 
                      customerId: parseInt(val),
                      customerZip: customer?.zipCode || prev.customerZip
                    }));
                  }}
                >
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="customerZip">Customer ZIP Code</Label>
                  <Input
                    id="customerZip"
                    data-testid="input-customer-zip"
                    value={deal.customerZip}
                    onChange={(e) => setDeal(prev => ({ ...prev, customerZip: e.target.value }))}
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={lookupTaxesByZip} data-testid="button-lookup-taxes">
                    <Search className="h-4 w-4 mr-2" />
                    Get Taxes
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerState">State</Label>
                  <Select 
                    value={deal.customerState} 
                    onValueChange={(val) => {
                      const taxInfo = STATE_TAX_RATES[val];
                      setDeal(prev => ({ 
                        ...prev, 
                        customerState: val,
                        salesTaxRate: taxInfo?.salesTax || 0,
                        titleFee: taxInfo?.titleFee || 0,
                        registrationFee: taxInfo?.regFee || 0
                      }));
                    }}
                  >
                    <SelectTrigger data-testid="select-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATE_TAX_RATES).map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sales Tax Rate</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50 dark:bg-gray-800 text-sm" data-testid="text-sales-tax-rate">
                    {(deal.salesTaxRate * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Title Fee</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50 dark:bg-gray-800 text-sm" data-testid="text-title-fee">
                    ${deal.titleFee.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label>Registration</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50 dark:bg-gray-800 text-sm" data-testid="text-reg-fee">
                    ${deal.registrationFee.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label htmlFor="dealerDocFee">Doc Fee</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="dealerDocFee"
                      data-testid="input-doc-fee"
                      type="number"
                      value={deal.dealerDocFee || ''}
                      onChange={(e) => setDeal(prev => ({ ...prev, dealerDocFee: parseFloat(e.target.value) || 0 }))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade-In */}
          <Card data-testid="card-trade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Trade-In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tradeValue">Trade Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="tradeValue"
                      data-testid="input-trade-value"
                      type="number"
                      value={deal.tradeValue || ''}
                      onChange={(e) => setDeal(prev => ({ ...prev, tradeValue: parseFloat(e.target.value) || 0 }))}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tradePayoff">Trade Payoff</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="tradePayoff"
                      data-testid="input-trade-payoff"
                      type="number"
                      value={deal.tradePayoff || ''}
                      onChange={(e) => setDeal(prev => ({ ...prev, tradePayoff: parseFloat(e.target.value) || 0 }))}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Net Trade Equity</span>
                <span className="text-lg font-bold" data-testid="text-net-trade">
                  ${deal.netTradeValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card data-testid="card-payment-options">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Payment Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentType} onValueChange={(val) => setPaymentType(val as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cash" data-testid="tab-cash">Cash</TabsTrigger>
                  <TabsTrigger value="finance" data-testid="tab-finance">Finance</TabsTrigger>
                  <TabsTrigger value="lease" data-testid="tab-lease">Lease</TabsTrigger>
                </TabsList>

                <TabsContent value="cash" className="space-y-4">
                  <div>
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="downPayment"
                        data-testid="input-down-payment"
                        type="number"
                        value={deal.downPayment || ''}
                        onChange={(e) => setDeal(prev => ({ ...prev, downPayment: parseFloat(e.target.value) || 0 }))}
                        className="pl-9"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Cash Due at Delivery</span>
                      <span className="text-2xl font-bold text-green-900 dark:text-green-100" data-testid="text-cash-payment">
                        ${deal.cashPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="finance" className="space-y-4">
                  <div>
                    <Label htmlFor="downPayment-finance">Down Payment</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="downPayment-finance"
                        data-testid="input-down-payment-finance"
                        type="number"
                        value={deal.downPayment || ''}
                        onChange={(e) => setDeal(prev => ({ ...prev, downPayment: parseFloat(e.target.value) || 0 }))}
                        className="pl-9"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="financeCompany">Finance Company</Label>
                    <Input
                      id="financeCompany"
                      data-testid="input-finance-company"
                      value={deal.financeCompany}
                      onChange={(e) => setDeal(prev => ({ ...prev, financeCompany: e.target.value }))}
                      placeholder="e.g., Toyota Financial Services"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="financeRate">Interest Rate (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="financeRate"
                          data-testid="input-finance-rate"
                          type="number"
                          step="0.01"
                          value={deal.financeRate || ''}
                          onChange={(e) => setDeal(prev => ({ ...prev, financeRate: parseFloat(e.target.value) || 0 }))}
                          className="pl-9"
                          placeholder="6.99"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="termMonths">Term (Months)</Label>
                      <Select 
                        value={deal.termMonths.toString()} 
                        onValueChange={(val) => setDeal(prev => ({ ...prev, termMonths: parseInt(val) }))}
                      >
                        <SelectTrigger data-testid="select-term">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                          <SelectItem value="72">72 months</SelectItem>
                          <SelectItem value="84">84 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900 dark:text-blue-100">Amount Financed</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100" data-testid="text-amount-financed">
                        ${deal.amountFinanced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Monthly Payment</span>
                      <span className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-finance-payment">
                        ${deal.financePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lease" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="leaseMoneyFactor">Money Factor</Label>
                      <Input
                        id="leaseMoneyFactor"
                        data-testid="input-money-factor"
                        type="number"
                        step="0.00001"
                        value={deal.leaseMoneyFactor || ''}
                        onChange={(e) => setDeal(prev => ({ ...prev, leaseMoneyFactor: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00125"
                      />
                      <p className="text-xs text-gray-500 mt-1">APR: {(deal.leaseMoneyFactor * 2400).toFixed(2)}%</p>
                    </div>
                    <div>
                      <Label htmlFor="leaseResidual">Residual Value (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="leaseResidual"
                          data-testid="input-residual"
                          type="number"
                          step="0.01"
                          value={(deal.leaseResidual * 100) || ''}
                          onChange={(e) => setDeal(prev => ({ ...prev, leaseResidual: parseFloat(e.target.value) / 100 || 0 }))}
                          className="pl-9"
                          placeholder="60"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">${(deal.vehiclePrice * deal.leaseResidual).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="leaseTerm">Lease Term (Months)</Label>
                    <Select 
                      value={deal.leaseTerm.toString()} 
                      onValueChange={(val) => setDeal(prev => ({ ...prev, leaseTerm: parseInt(val) }))}
                    >
                      <SelectTrigger data-testid="select-lease-term">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="39">39 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-900 dark:text-purple-100">Residual at End</span>
                      <span className="font-semibold text-purple-900 dark:text-purple-100" data-testid="text-residual-value">
                        ${(deal.vehiclePrice * deal.leaseResidual).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Monthly Payment</span>
                      <span className="text-2xl font-bold text-purple-900 dark:text-purple-100" data-testid="text-lease-payment">
                        ${deal.leasePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Deal Summary */}
        <div className="space-y-4">
          <Card className="sticky top-4" data-testid="card-deal-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deal Summary
              </CardTitle>
              <CardDescription>Current deal structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vehicle Price</span>
                  <span className="font-semibold" data-testid="text-summary-vehicle-price">
                    ${deal.vehiclePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sales Tax ({(deal.salesTaxRate * 100).toFixed(2)}%)</span>
                  <span className="font-semibold" data-testid="text-summary-sales-tax">
                    ${deal.salesTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Title & Registration</span>
                  <span className="font-semibold" data-testid="text-summary-title-reg">
                    ${(deal.titleFee + deal.registrationFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Dealer Doc Fee</span>
                  <span className="font-semibold" data-testid="text-summary-doc-fee">
                    ${deal.dealerDocFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total Price</span>
                  <span className="font-bold" data-testid="text-summary-total-price">
                    ${deal.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Trade Equity</span>
                  <span className="font-semibold" data-testid="text-summary-trade-equity">
                    -${deal.netTradeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Down Payment</span>
                  <span className="font-semibold" data-testid="text-summary-down-payment">
                    -${deal.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator />
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {paymentType === 'cash' ? 'Cash Due' : 
                       paymentType === 'finance' ? 'Monthly Payment' : 
                       'Lease Payment'}
                    </span>
                    <span className="text-xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-summary-final-payment">
                      ${(paymentType === 'cash' ? deal.cashPayment : 
                         paymentType === 'finance' ? deal.financePayment : 
                         deal.leasePayment).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {selectedVehicle && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Selected Vehicle</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                      <p className="text-sm font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">VIN: {selectedVehicle.vin}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Stock: {selectedVehicle.uuid}</p>
                    </div>
                  </div>
                </>
              )}

              {selectedCustomer && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Customer</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                      <p className="text-sm font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Negotiation Assistant */}
          <AINext
            vehiclePrice={deal.vehiclePrice}
            vehicleMake={selectedVehicle?.make || ''}
            vehicleModel={selectedVehicle?.model || ''}
            vehicleYear={selectedVehicle?.year || 0}
            tradeValue={deal.tradeValue}
            downPayment={deal.downPayment}
            financeRate={deal.financeRate}
            termMonths={deal.termMonths}
            marketValue={deal.vehiclePrice}
            customerProfile={selectedCustomer ? {
              creditScore: selectedCustomer.creditScore || undefined,
              income: selectedCustomer.income ? parseFloat(selectedCustomer.income) : undefined
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
