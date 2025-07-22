import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  FileSignature, 
  Shield, 
  Calculator, 
  CheckCircle,
  Building,
  Percent,
  DollarSign,
  Calendar,
  User,
  Car,
  Printer,
  Save,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from "lucide-react";

interface FinanceProduct {
  id: string;
  name: string;
  type: 'warranty' | 'gap' | 'maintenance' | 'insurance';
  cost: number;
  monthlyPayment?: number;
  description: string;
  selected: boolean;
}

interface Lender {
  id: string;
  name: string;
  type: 'bank' | 'credit_union' | 'captive' | 'subprime';
  rates: {
    excellent: number; // 750+
    good: number;     // 680-749
    fair: number;     // 620-679
    poor: number;     // <620
  };
  maxTerm: number;
  maxLtv: number;
  approved?: boolean;
  approvedRate?: number;
  approvedTerm?: number;
  conditions?: string[];
}

const SAMPLE_LENDERS: Lender[] = [
  {
    id: 'chase',
    name: 'Chase Auto Finance',
    type: 'bank',
    rates: { excellent: 4.9, good: 6.9, fair: 9.9, poor: 14.9 },
    maxTerm: 72,
    maxLtv: 120,
    approved: true,
    approvedRate: 5.9,
    approvedTerm: 60
  },
  {
    id: 'wells_fargo',
    name: 'Wells Fargo Auto',
    type: 'bank',
    rates: { excellent: 5.1, good: 7.1, fair: 10.5, poor: 16.9 },
    maxTerm: 72,
    maxLtv: 115
  },
  {
    id: 'toyota_financial',
    name: 'Toyota Financial Services',
    type: 'captive',
    rates: { excellent: 3.9, good: 5.9, fair: 8.9, poor: 12.9 },
    maxTerm: 72,
    maxLtv: 125,
    approved: true,
    approvedRate: 4.9,
    approvedTerm: 60
  }
];

const SAMPLE_PRODUCTS: FinanceProduct[] = [
  {
    id: 'ext_warranty',
    name: 'Extended Warranty',
    type: 'warranty',
    cost: 2495,
    monthlyPayment: 41.58,
    description: '7 years/100,000 miles bumper-to-bumper coverage',
    selected: false
  },
  {
    id: 'gap_insurance',
    name: 'GAP Insurance',
    type: 'gap',
    cost: 895,
    monthlyPayment: 14.92,
    description: 'Covers difference between loan balance and insurance payout',
    selected: false
  },
  {
    id: 'maintenance',
    name: 'Maintenance Plan',
    type: 'maintenance',
    cost: 1595,
    monthlyPayment: 26.58,
    description: '5 years/75,000 miles scheduled maintenance',
    selected: false
  }
];

export default function DealsFinance() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const dealId = urlParams.get('dealId');
  const customerId = urlParams.get('customerId');
  const vehicleId = urlParams.get('vehicleId');

  const [activeTab, setActiveTab] = useState('structure');
  
  // Finance structure
  const [finalSalePrice, setFinalSalePrice] = useState('');
  const [finalTradeValue, setFinalTradeValue] = useState('');
  const [finalCashDown, setFinalCashDown] = useState('');
  const [finalRebates, setFinalRebates] = useState('');
  const [customerCreditScore, setCustomerCreditScore] = useState('');
  
  // Finance products
  const [products, setProducts] = useState<FinanceProduct[]>(SAMPLE_PRODUCTS);
  const [lenders, setLenders] = useState<Lender[]>(SAMPLE_LENDERS);
  const [selectedLender, setSelectedLender] = useState('chase');
  
  // Final finance details
  const [finalRate, setFinalRate] = useState('5.9');
  const [finalTerm, setFinalTerm] = useState('60');
  const [monthlyPayment, setMonthlyPayment] = useState('');

  // Load deal data
  const { data: dealData } = useQuery({
    queryKey: ['/api/deals', dealId],
    enabled: !!dealId && dealId !== 'new',
    staleTime: 30000
  });

  // Load customer data
  const { data: customerData } = useQuery({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
    staleTime: 30000
  });

  // Load vehicle data
  const { data: vehicleData } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
    staleTime: 30000
  });

  // Load data when available
  useEffect(() => {
    if (dealData) {
      setFinalSalePrice(dealData.salePrice?.toString() || '');
      setFinalTradeValue(dealData.tradeAllowance?.toString() || '0');
      setFinalCashDown(dealData.cashDown?.toString() || '');
      setFinalRebates(dealData.rebates?.toString() || '0');
      setFinalRate(dealData.rate?.replace('%', '') || '5.9');
      setFinalTerm(dealData.term?.toString() || '60');
    }
    if (customerData) {
      setCustomerCreditScore(customerData.creditScore?.toString() || '');
    }
  }, [dealData, customerData]);

  // Calculate final numbers
  const calculateFinalDeal = () => {
    const price = parseFloat(finalSalePrice) || 0;
    const trade = parseFloat(finalTradeValue) || 0;
    const down = parseFloat(finalCashDown) || 0;
    const rebate = parseFloat(finalRebates) || 0;
    
    const selectedProductsCost = products
      .filter(p => p.selected)
      .reduce((sum, p) => sum + p.cost, 0);
    
    const netPrice = price - trade - down - rebate;
    const salesTax = (price - trade) * 0.0825; // 8.25% tax
    const docFee = 299;
    const financeAmount = netPrice + salesTax + docFee + selectedProductsCost;
    
    const rate = parseFloat(finalRate) / 100 / 12;
    const term = parseInt(finalTerm) || 60;
    const payment = financeAmount > 0 && rate > 0 
      ? (financeAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      : 0;

    return {
      vehiclePrice: price,
      tradeValue: trade,
      cashDown: down,
      rebates: rebate,
      selectedProductsCost,
      netPrice,
      salesTax,
      docFee,
      financeAmount,
      monthlyPayment: payment,
      totalDue: financeAmount
    };
  };

  const finalCalc = calculateFinalDeal();

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, selected: !p.selected } : p
    ));
  };

  // Finalize deal
  const finalizeDeal = useMutation({
    mutationFn: async () => {
      const finalData = {
        customerId,
        vehicleId,
        salePrice: finalCalc.vehiclePrice,
        tradeAllowance: finalCalc.tradeValue,
        cashDown: finalCalc.cashDown,
        rebates: finalCalc.rebates,
        financeAmount: finalCalc.financeAmount,
        monthlyPayment: finalCalc.monthlyPayment,
        rate: `${finalRate}%`,
        term: parseInt(finalTerm),
        lender: selectedLender,
        products: products.filter(p => p.selected),
        status: 'completed',
        finalizedAt: new Date().toISOString()
      };

      return apiRequest('POST', `/api/deals/${dealId}/finalize`, finalData);
    },
    onSuccess: () => {
      toast({
        title: "Deal Finalized",
        description: "The deal has been successfully completed and finalized.",
      });
      navigate('/deals-list');
    },
    onError: (error) => {
      toast({
        title: "Finalization Failed",
        description: error.message || "Failed to finalize deal",
        variant: "destructive",
      });
    }
  });

  const selectedLenderData = lenders.find(l => l.id === selectedLender);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/deals-desk?dealId=${dealId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Desk
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Suite</h1>
              <p className="text-gray-600">F&I Products, Lender Management & Deal Finalization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Contract
            </Button>
            <Button
              onClick={() => finalizeDeal.mutate()}
              disabled={finalizeDeal.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalize Deal
            </Button>
          </div>
        </div>

        {/* Deal Summary */}
        {(customerData || vehicleData) && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{customerData?.name || 'Loading...'}</p>
                    <p className="text-sm text-gray-500">{customerData?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium">
                      {vehicleData ? `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}` : 'Loading...'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {vehicleData?.vin ? `VIN: ${vehicleData.vin}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${finalCalc.monthlyPayment.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{finalTerm} months @ {finalRate}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Deal Structure</TabsTrigger>
            <TabsTrigger value="products">F&I Products</TabsTrigger>
            <TabsTrigger value="lenders">Lender Options</TabsTrigger>
            <TabsTrigger value="finalize">Finalize</TabsTrigger>
          </TabsList>

          {/* Deal Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Final Deal Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="finalSalePrice">Sale Price</Label>
                      <Input
                        id="finalSalePrice"
                        type="number"
                        value={finalSalePrice}
                        onChange={(e) => setFinalSalePrice(e.target.value)}
                        placeholder="28,500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="finalTradeValue">Trade Value</Label>
                      <Input
                        id="finalTradeValue"
                        type="number"
                        value={finalTradeValue}
                        onChange={(e) => setFinalTradeValue(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="finalCashDown">Cash Down</Label>
                      <Input
                        id="finalCashDown"
                        type="number"
                        value={finalCashDown}
                        onChange={(e) => setFinalCashDown(e.target.value)}
                        placeholder="3,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="finalRebates">Rebates</Label>
                      <Input
                        id="finalRebates"
                        type="number"
                        value={finalRebates}
                        onChange={(e) => setFinalRebates(e.target.value)}
                        placeholder="500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Final Calculations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sale Price:</span>
                    <span className="font-medium">${finalCalc.vehiclePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trade Value:</span>
                    <span className="font-medium text-green-600">-${finalCalc.tradeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Down:</span>
                    <span className="font-medium text-green-600">-${finalCalc.cashDown.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rebates:</span>
                    <span className="font-medium text-green-600">-${finalCalc.rebates.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">F&I Products:</span>
                    <span className="font-medium">${finalCalc.selectedProductsCost.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sales Tax:</span>
                    <span className="font-medium">${finalCalc.salesTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doc Fee:</span>
                    <span className="font-medium">${finalCalc.docFee.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Finance Amount:</span>
                    <span>${finalCalc.financeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Monthly Payment:</span>
                    <span>${finalCalc.monthlyPayment.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* F&I Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Finance & Insurance Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        product.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleProduct(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={product.selected}
                            onChange={() => toggleProduct(product.id)}
                          />
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${product.cost.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">${product.monthlyPayment?.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total F&I Products:</span>
                    <span className="text-xl font-bold">${finalCalc.selectedProductsCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Additional Monthly Payment:</span>
                    <span className="text-sm font-medium">
                      ${products.filter(p => p.selected).reduce((sum, p) => sum + (p.monthlyPayment || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lenders Tab */}
          <TabsContent value="lenders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Lenders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lenders.map((lender) => (
                    <div
                      key={lender.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedLender === lender.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLender(lender.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{lender.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {lender.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {lender.approved && (
                            <Badge className="mt-1 ml-2 bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pre-Approved
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          {lender.approved ? (
                            <div>
                              <p className="font-bold text-green-600">{lender.approvedRate}%</p>
                              <p className="text-sm text-gray-600">{lender.approvedTerm} months</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600">Rates from</p>
                              <p className="font-bold">{lender.rates.excellent}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Finance Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="finalRate">Interest Rate (%)</Label>
                      <Input
                        id="finalRate"
                        type="number"
                        step="0.1"
                        value={finalRate}
                        onChange={(e) => setFinalRate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="finalTerm">Term (months)</Label>
                      <Select value={finalTerm} onValueChange={setFinalTerm}>
                        <SelectTrigger>
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
                  </div>

                  {selectedLenderData && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {selectedLenderData.name} Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Max Term:</span>
                          <span>{selectedLenderData.maxTerm} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max LTV:</span>
                          <span>{selectedLenderData.maxLtv}%</span>
                        </div>
                        {selectedLenderData.approved && (
                          <div className="flex justify-between text-green-700 font-medium">
                            <span>Pre-Approved Rate:</span>
                            <span>{selectedLenderData.approvedRate}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Finalize Tab */}
          <TabsContent value="finalize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Summary & Finalization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Final Deal Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Vehicle Price:</span>
                        <span>${finalCalc.vehiclePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trade Value:</span>
                        <span>-${finalCalc.tradeValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash Down:</span>
                        <span>-${finalCalc.cashDown.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F&I Products:</span>
                        <span>${finalCalc.selectedProductsCost.toLocaleString()}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold">
                        <span>Finance Amount:</span>
                        <span>${finalCalc.financeAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Monthly Payment:</span>
                        <span>${finalCalc.monthlyPayment.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Selected Products</h3>
                    {products.filter(p => p.selected).length > 0 ? (
                      <div className="space-y-2">
                        {products.filter(p => p.selected).map(product => (
                          <div key={product.id} className="flex justify-between text-sm">
                            <span>{product.name}</span>
                            <span>${product.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No F&I products selected</p>
                    )}

                    <h3 className="text-lg font-medium mt-6">Finance Terms</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Lender:</span>
                        <span>{selectedLenderData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span>{finalRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Term:</span>
                        <span>{finalTerm} months</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Review all details carefully before finalizing the deal
                      </span>
                    </div>
                    <Button
                      onClick={() => finalizeDeal.mutate()}
                      disabled={finalizeDeal.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {finalizeDeal.isPending ? 'Finalizing...' : 'Finalize Deal'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}