import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calculator, 
  Car, 
  DollarSign,
  User,
  Save,
  Printer,
  CheckCircle,
  Loader2,
  Package,
  TrendingUp,
  FileText,
  Plus,
  X
} from 'lucide-react';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  stockNo: string;
  price: number;
  costPrice: number;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Deal {
  id?: string;
  dealNumber?: string;
  status: string;
  vehicleId?: number;
  customerId?: number;
  buyerName: string;
  dealType: 'retail' | 'lease' | 'cash';
  salePrice: number;
  cashDown: number;
  rebates: number;
  tradeAllowance: number;
  tradePayoff: number;
  salesTax: number;
  docFee: number;
  titleFee: number;
  registrationFee: number;
  financeBalance: number;
  term?: number;
  rate?: string;
  creditTier?: string;
}

interface BackendProduct {
  id?: string;
  productName: string;
  retailPrice: number;
  cost: number;
  category: string;
}

interface DealCalculation {
  jurisdiction: {
    display: string;
    state: string;
  };
  calculation: {
    fees: {
      nontaxFees: number;
      lineItems: Array<{ code: string; label: string; amount: number }>;
    };
    taxes: {
      totalTax: number;
      lineItems: Array<{ label: string; rate: number; amount: number }>;
    };
    totals: {
      vehiclePrice: number;
      totalTax: number;
      grandTotal: number;
    };
    profit?: {
      frontEnd: number;
      backEnd: number;
      total: number;
    };
  };
}

export default function ProfessionalDealDesk() {
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Core deal state
  const [dealId, setDealId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerZip, setCustomerZip] = useState('');
  const [jurisdictionData, setJurisdictionData] = useState<any[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<any | null>(null);
  
  // Deal structure
  const [dealType, setDealType] = useState<'retail' | 'lease' | 'cash'>('retail');
  const [salePrice, setSalePrice] = useState(0);
  const [vehicleCost, setVehicleCost] = useState(0);
  const [cashDown, setCashDown] = useState(0);
  const [rebates, setRebates] = useState(0);
  
  // Trade-in
  const [tradeValue, setTradeValue] = useState(0);
  const [tradePayoff, setTradePayoff] = useState(0);
  
  // Financing
  const [term, setTerm] = useState(72);
  const [apr, setApr] = useState(6.99);
  const [creditTier, setCreditTier] = useState<string>('A');
  
  // Backend products
  const [products, setProducts] = useState<BackendProduct[]>([]);
  
  // Autosave state
  const [autosaving, setAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Fetch vehicles
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });
  
  // Selected vehicle and customer
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedCustomer = customers.find(c => c.id === customerId);
  
  // Calculate deal - include ALL backend products in vehicle price only (no double-counting)
  const totalBackendProducts = products.reduce((sum, p) => sum + p.retailPrice, 0);
  const calcInput = {
    zip: customerZip,
    dealType: 'purchase',
    vehiclePrice: salePrice + totalBackendProducts, // All products included here
    vehicleCost: vehicleCost,
    tradeValue: tradeValue,
    tradePayoff: tradePayoff,
    downPayment: cashDown,
    rebates: rebates,
    warrantyPrice: 0, // Already included in vehiclePrice above
    gapPrice: 0, // Already included in vehiclePrice above
    financeReserveAmount: 0,
    financeReserveType: 'percent' as const
  };
  
  const { data: calc, isLoading: calcLoading } = useQuery<DealCalculation>({
    queryKey: ['/api/deals/calculate', calcInput],
    queryFn: async () => {
      const response = await apiRequest('/api/deals/calculate', {
        method: 'POST',
        body: JSON.stringify(calcInput)
      });
      return response.json();
    },
    enabled: customerZip.length >= 5 && salePrice > 0,
    staleTime: 0,
    retry: 1,
  });
  
  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    if (!calc) return 0;
    
    const netTrade = tradeValue - tradePayoff;
    const amountFinanced = calc.calculation.totals.grandTotal - netTrade - cashDown;
    
    if (amountFinanced <= 0 || term <= 0) return 0;
    
    const monthlyRate = (apr / 100) / 12;
    const payment = amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                    (Math.pow(1 + monthlyRate, term) - 1);
    
    return Math.round(payment);
  };
  
  const monthlyPayment = calculateMonthlyPayment();
  
  // Auto-populate from vehicle
  useEffect(() => {
    if (selectedVehicle) {
      setSalePrice(selectedVehicle.price);
      setVehicleCost(selectedVehicle.costPrice || 0);
    }
  }, [selectedVehicle]);

  // Auto-select customer from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const customerIdParam = params.get('customerId');
    if (customerIdParam) {
      setCustomerId(parseInt(customerIdParam));
      toast({
        title: "Customer Selected",
        description: "Customer pre-selected from profile",
      });
    }
  }, [location, toast]);

  // Debounced autosave - triggers 2 seconds after user stops editing
  useEffect(() => {
    if (!selectedCustomer || !salePrice) return;
    
    setAutosaving(true);
    const timer = setTimeout(() => {
      autosaveMutation.mutate();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [salePrice, vehicleCost, cashDown, rebates, tradeValue, tradePayoff, term, apr, products, dealType]);

  // Lookup jurisdiction when ZIP is entered
  useEffect(() => {
    if (customerZip.length === 5) {
      fetch(`/api/jurisdictions/lookup?zip=${customerZip}`)
        .then(res => res.json())
        .then(data => {
          if (data.jurisdictions && data.jurisdictions.length > 0) {
            setJurisdictionData(data.jurisdictions);
            
            // Auto-select if only one jurisdiction
            if (data.jurisdictions.length === 1) {
              setSelectedJurisdiction(data.jurisdictions[0]);
              toast({
                title: "Location Found",
                description: `${data.jurisdictions[0].city}, ${data.jurisdictions[0].state}`,
              });
            } else {
              toast({
                title: "Multiple Locations Found",
                description: `Please select your city/county`,
              });
            }
          }
        })
        .catch(err => {
          console.error("Error looking up ZIP:", err);
          setJurisdictionData([]);
          setSelectedJurisdiction(null);
        });
    } else {
      setJurisdictionData([]);
      setSelectedJurisdiction(null);
    }
  }, [customerZip, toast]);
  
  // Autosave mutation (saves draft)
  const autosaveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer) return null;
      
      const draftData: Partial<Deal> = {
        dealNumber: dealId ? undefined : `DRAFT-${Date.now()}`,
        status: 'draft',
        vehicleId: vehicleId || undefined,
        customerId: customerId || undefined,
        buyerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        dealType: dealType,
        salePrice: salePrice,
        cashDown: cashDown,
        rebates: rebates,
        tradeAllowance: tradeValue,
        tradePayoff: tradePayoff,
        salesTax: calc?.calculation.taxes.totalTax || 0,
        docFee: calc?.calculation.fees.lineItems.find(f => f.code === 'DOC')?.amount || 0,
        titleFee: calc?.calculation.fees.lineItems.find(f => f.code === 'TITLE')?.amount || 0,
        registrationFee: calc?.calculation.fees.lineItems.find(f => f.code === 'REG')?.amount || 0,
        financeBalance: calc?.calculation.totals.grandTotal || 0,
        term: term,
        rate: apr.toString(),
        creditTier: creditTier,
      };
      
      if (dealId) {
        // Update existing deal
        const response = await apiRequest(`/api/deals/${dealId}`, {
          method: 'PATCH',
          body: JSON.stringify(draftData)
        });
        return response.json();
      } else {
        // Create new draft deal
        const response = await apiRequest('/api/deals', {
          method: 'POST',
          body: JSON.stringify(draftData)
        });
        const savedDeal = await response.json();
        setDealId(savedDeal.id);
        return savedDeal;
      }
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setAutosaving(false);
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: () => {
      setAutosaving(false);
    }
  });

  // Save deal mutation (final save)
  const saveDealMutation = useMutation({
    mutationFn: async () => {
      if (!calc || !selectedCustomer) {
        throw new Error('Missing required data');
      }
      
      const dealData: Deal = {
        dealNumber: `DEAL-${Date.now()}`,
        status: 'open',
        vehicleId: vehicleId || undefined,
        customerId: customerId || undefined,
        buyerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        dealType: dealType,
        salePrice: salePrice,
        cashDown: cashDown,
        rebates: rebates,
        tradeAllowance: tradeValue,
        tradePayoff: tradePayoff,
        salesTax: calc.calculation.taxes.totalTax,
        docFee: calc.calculation.fees.lineItems.find(f => f.code === 'DOC')?.amount || 0,
        titleFee: calc.calculation.fees.lineItems.find(f => f.code === 'TITLE')?.amount || 0,
        registrationFee: calc.calculation.fees.lineItems.find(f => f.code === 'REG')?.amount || 0,
        financeBalance: calc.calculation.totals.grandTotal - (tradeValue - tradePayoff) - cashDown,
        term: term,
        rate: apr.toString(),
        creditTier: creditTier,
      };
      
      const response = await apiRequest('/api/deals', {
        method: 'POST',
        body: JSON.stringify(dealData),
      });
      const savedDeal = await response.json();
      
      // Save backend products if any
      if (products.length > 0 && savedDeal.id) {
        for (const product of products) {
          await apiRequest(`/api/deals/${savedDeal.id}/products`, {
            method: 'POST',
            body: JSON.stringify({
              productName: product.productName,
              retailPrice: product.retailPrice,
              cost: product.cost,
              category: product.category,
            }),
          });
        }
      }
      
      return savedDeal;
    },
    onSuccess: (data) => {
      setDealId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${data.id}/products`] });
      toast({
        title: 'Deal Saved',
        description: `Deal ${data.dealNumber} has been saved with ${products.length} backend product(s).`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save deal',
        variant: 'destructive',
      });
    },
  });
  
  // Add product
  const addProduct = (category: 'warranty' | 'gap' | 'maintenance' | 'tire_wheel') => {
    const newProduct: BackendProduct = {
      productName: category === 'warranty' ? 'Extended Warranty' : 
                   category === 'gap' ? 'GAP Insurance' :
                   category === 'maintenance' ? 'Maintenance Plan' : 'Tire & Wheel',
      retailPrice: 0,
      cost: 0,
      category: category,
    };
    setProducts([...products, newProduct]);
  };
  
  const updateProduct = (index: number, field: 'retailPrice' | 'cost', value: number) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };
  
  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };
  
  const netTrade = tradeValue - tradePayoff;
  const frontEndProfit = salePrice - vehicleCost;
  const backEndProfit = products.reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);
  const totalProfit = frontEndProfit + backEndProfit;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Professional Deal Desk
            </h1>
            {dealId && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Deal ID: {dealId}
              </p>
            )}
            {/* Autosave status indicator */}
            {autosaving && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Autosaving draft...
              </p>
            )}
            {!autosaving && lastSaved && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Draft saved
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.print()}
              data-testid="button-print-deal"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button 
              size="sm"
              onClick={() => saveDealMutation.mutate()}
              disabled={!selectedCustomer || !calc || saveDealMutation.isPending || dealId !== null}
              data-testid="button-save-deal"
            >
              {saveDealMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : dealId ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {dealId ? 'Saved' : 'Save Deal'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="structure" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure" data-testid="tab-structure">
              <Car className="h-4 w-4 mr-2" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="backend" data-testid="tab-backend">
              <Package className="h-4 w-4 mr-2" />
              Backend
            </TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">
              <FileText className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="profit" data-testid="tab-profit">
              <TrendingUp className="h-4 w-4 mr-2" />
              Profit
            </TabsTrigger>
          </TabsList>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">Select Vehicle</Label>
                    <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                      <SelectTrigger id="vehicle" data-testid="select-vehicle">
                        <SelectValue placeholder="Choose vehicle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {v.year} {v.make} {v.model} - ${v.price.toLocaleString()} (Stock: {v.stockNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedVehicle && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        VIN: {selectedVehicle.vin} | Stock: {selectedVehicle.stockNo}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salePrice">Sale Price</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={salePrice || ''}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                        data-testid="input-sale-price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleCost">Cost</Label>
                      <Input
                        id="vehicleCost"
                        type="number"
                        value={vehicleCost || ''}
                        onChange={(e) => setVehicleCost(parseFloat(e.target.value) || 0)}
                        data-testid="input-vehicle-cost"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select value={customerId?.toString()} onValueChange={(v) => setCustomerId(parseInt(v))}>
                      <SelectTrigger id="customer" data-testid="select-customer">
                        <SelectValue placeholder="Choose customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.firstName} {c.lastName} - {c.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedCustomer && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {selectedCustomer.email} | {selectedCustomer.phone}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="customerZip">ZIP Code</Label>
                    <Input
                      id="customerZip"
                      value={customerZip}
                      onChange={(e) => setCustomerZip(e.target.value)}
                      placeholder="60601"
                      maxLength={5}
                      data-testid="input-customer-zip"
                    />
                  </div>

                  {/* Show city/state when jurisdiction is found */}
                  {selectedJurisdiction && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        📍 {selectedJurisdiction.city}, {selectedJurisdiction.state}
                      </p>
                      {selectedJurisdiction.county && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {selectedJurisdiction.county} County
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show jurisdiction selector if multiple matches */}
                  {jurisdictionData.length > 1 && (
                    <div>
                      <Label htmlFor="jurisdiction">Select City/County</Label>
                      <Select 
                        value={selectedJurisdiction?.id?.toString()} 
                        onValueChange={(v) => {
                          const selected = jurisdictionData.find(j => j.id.toString() === v);
                          setSelectedJurisdiction(selected || null);
                        }}
                      >
                        <SelectTrigger id="jurisdiction" data-testid="select-jurisdiction">
                          <SelectValue placeholder="Choose location..." />
                        </SelectTrigger>
                        <SelectContent>
                          {jurisdictionData.map((j) => (
                            <SelectItem key={j.id} value={j.id.toString()}>
                              {j.display}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trade & Financing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Trade-In</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tradeValue">Trade Value</Label>
                      <Input
                        id="tradeValue"
                        type="number"
                        value={tradeValue || ''}
                        onChange={(e) => setTradeValue(parseFloat(e.target.value) || 0)}
                        data-testid="input-trade-value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradePayoff">Payoff</Label>
                      <Input
                        id="tradePayoff"
                        type="number"
                        value={tradePayoff || ''}
                        onChange={(e) => setTradePayoff(parseFloat(e.target.value) || 0)}
                        data-testid="input-trade-payoff"
                      />
                    </div>
                  </div>
                  {netTrade !== 0 && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm font-medium">
                        Net Trade: <span className={netTrade > 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(netTrade).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Financing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="term">Term (months)</Label>
                      <Select value={term.toString()} onValueChange={(v) => setTerm(parseInt(v))}>
                        <SelectTrigger id="term" data-testid="select-term">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                          <SelectItem value="72">72 months</SelectItem>
                          <SelectItem value="84">84 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="apr">APR %</Label>
                      <Input
                        id="apr"
                        type="number"
                        step="0.01"
                        value={apr}
                        onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                        data-testid="input-apr"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cashDown">Down Payment</Label>
                      <Input
                        id="cashDown"
                        type="number"
                        value={cashDown || ''}
                        onChange={(e) => setCashDown(parseFloat(e.target.value) || 0)}
                        data-testid="input-cash-down"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rebates">Rebates</Label>
                      <Input
                        id="rebates"
                        type="number"
                        value={rebates || ''}
                        onChange={(e) => setRebates(parseFloat(e.target.value) || 0)}
                        data-testid="input-rebates"
                      />
                    </div>
                  </div>
                  
                  {monthlyPayment > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${monthlyPayment.toLocaleString()}/mo
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backend Products Tab */}
          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Backend Products
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => addProduct('warranty')} data-testid="button-add-warranty">
                      <Plus className="h-4 w-4 mr-1" /> Warranty
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addProduct('gap')} data-testid="button-add-gap">
                      <Plus className="h-4 w-4 mr-1" /> GAP
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addProduct('maintenance')} data-testid="button-add-maintenance">
                      <Plus className="h-4 w-4 mr-1" /> Maintenance
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No backend products added yet</p>
                  </div>
                ) : (
                  products.map((product, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{product.productName}</h4>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeProduct(index)}
                          data-testid={`button-remove-product-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Retail Price</Label>
                          <Input
                            type="number"
                            value={product.retailPrice || ''}
                            onChange={(e) => updateProduct(index, 'retailPrice', parseFloat(e.target.value) || 0)}
                            data-testid={`input-product-retail-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Cost</Label>
                          <Input
                            type="number"
                            value={product.cost || ''}
                            onChange={(e) => updateProduct(index, 'cost', parseFloat(e.target.value) || 0)}
                            data-testid={`input-product-cost-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Profit</Label>
                          <div className="flex items-center h-10 px-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <span className="font-medium text-green-600 dark:text-green-400">
                              ${(product.retailPrice - product.cost).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {calcLoading && !calc ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calculating...</p>
                </CardContent>
              </Card>
            ) : calc ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Deal Summary</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{calc.jurisdiction.display}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Vehicle Price:</span>
                      <span className="font-medium">${salePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trade-In:</span>
                      <span className="font-medium">${netTrade.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Down Payment:</span>
                      <span className="font-medium">${cashDown.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rebates:</span>
                      <span className="font-medium">${rebates.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>Sales Tax:</span>
                      <span className="font-medium">${calc.calculation.taxes.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fees:</span>
                      <span className="font-medium">${calc.calculation.fees.nontaxFees.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${calc.calculation.totals.grandTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Amount Financed:</span>
                      <span className="text-green-600 dark:text-green-400">
                        ${(calc.calculation.totals.grandTotal - netTrade - cashDown).toLocaleString()}
                      </span>
                    </div>
                    {monthlyPayment > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${monthlyPayment.toLocaleString()}/mo
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {term} months @ {apr}% APR
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Tax & Fee Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Taxes</p>
                      {calc.calculation.taxes.lineItems.map((tax, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>{tax.label}</span>
                          <span>${tax.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Fees</p>
                      {calc.calculation.fees.lineItems.map((fee, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>{fee.label}</span>
                          <span>${fee.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter vehicle price and customer ZIP to see deal summary
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profit Tab */}
          <TabsContent value="profit" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Front-End Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${frontEndProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Sale Price - Cost
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Back-End Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${backEndProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {products.length} product{products.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Total Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ${totalProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Front + Back
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
