import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Car, 
  User, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Percent,
  PiggyBank,
  Receipt,
  Shield
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, Vehicle } from "@shared/schema";

interface DealStructure {
  id?: number;
  customerId: number;
  vehicleId: number;
  salePrice: number;
  tradeInValue: number;
  cashDown: number;
  financeAmount: number;
  term: number;
  apr: number;
  payment: number;
  totalInterest: number;
  warranties: {
    extended: boolean;
    gap: boolean;
    maintenance: boolean;
  };
  insurance: {
    required: boolean;
    provider: string;
    cost: number;
  };
  fees: {
    documentation: number;
    registration: number;
    processing: number;
  };
  grossProfit: number;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'cancelled';
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  principalPaid: number;
  interestPaid: number;
  amortizationSchedule: {
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

export default function DealDesk() {
  const [activeTab, setActiveTab] = useState("deal-structure");
  const [deal, setDeal] = useState<DealStructure>({
    customerId: 0,
    vehicleId: 0,
    salePrice: 0,
    tradeInValue: 0,
    cashDown: 0,
    financeAmount: 0,
    term: 60,
    apr: 7.5,
    payment: 0,
    totalInterest: 0,
    warranties: {
      extended: false,
      gap: false,
      maintenance: false
    },
    insurance: {
      required: false,
      provider: '',
      cost: 0
    },
    fees: {
      documentation: 599,
      registration: 299,
      processing: 199
    },
    grossProfit: 0,
    status: 'draft',
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers and vehicles
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Calculate payment and deal metrics
  const calculatePayment = (principal: number, rate: number, term: number): PaymentCalculation => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term;
    
    if (monthlyRate === 0) {
      return {
        monthlyPayment: principal / numPayments,
        totalInterest: 0,
        totalCost: principal,
        principalPaid: principal,
        interestPaid: 0,
        amortizationSchedule: []
      };
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalCost = monthlyPayment * numPayments;
    const totalInterest = totalCost - principal;
    
    // Generate amortization schedule
    const schedule: PaymentCalculation['amortizationSchedule'] = [];
    let balance = principal;
    
    for (let i = 0; i < numPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return {
      monthlyPayment,
      totalInterest,
      totalCost,
      principalPaid: principal,
      interestPaid: totalInterest,
      amortizationSchedule: schedule
    };
  };

  // Update deal calculations when values change
  const updateDealCalculations = () => {
    const financeAmount = deal.salePrice - deal.tradeInValue - deal.cashDown;
    const calculation = calculatePayment(financeAmount, deal.apr, deal.term);
    
    const totalFees = deal.fees.documentation + deal.fees.registration + deal.fees.processing;
    const grossProfit = deal.salePrice - (deal.salePrice * 0.85) + totalFees; // Assuming 15% markup
    
    setDeal(prev => ({
      ...prev,
      financeAmount,
      payment: calculation.monthlyPayment,
      totalInterest: calculation.totalInterest,
      grossProfit
    }));
  };

  // Save deal
  const saveDeal = useMutation({
    mutationFn: async (dealData: DealStructure) => {
      if (dealData.id) {
        return await apiRequest(`/api/deals/${dealData.id}`, {
          method: 'PUT',
          body: JSON.stringify(dealData)
        });
      } else {
        return await apiRequest('/api/deals', {
          method: 'POST',
          body: JSON.stringify(dealData)
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Deal Saved",
        description: "Deal structure has been saved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save deal",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deal Desk</h2>
            <p className="text-gray-500">Comprehensive deal structuring and analysis</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeal({
              customerId: 0,
              vehicleId: 0,
              salePrice: 0,
              tradeInValue: 0,
              cashDown: 0,
              financeAmount: 0,
              term: 60,
              apr: 7.5,
              payment: 0,
              totalInterest: 0,
              warranties: { extended: false, gap: false, maintenance: false },
              insurance: { required: false, provider: '', cost: 0 },
              fees: { documentation: 599, registration: 299, processing: 199 },
              grossProfit: 0,
              status: 'draft',
              notes: ''
            })}>
              New Deal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => saveDeal.mutate(deal)}
              disabled={saveDeal.isPending}
            >
              {saveDeal.isPending ? 'Saving...' : 'Save Deal'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deal-structure">Deal Structure</TabsTrigger>
            <TabsTrigger value="payment-calc">Payment Calculator</TabsTrigger>
            <TabsTrigger value="profit-analysis">Profit Analysis</TabsTrigger>
            <TabsTrigger value="financing">Financing Options</TabsTrigger>
          </TabsList>

          {/* Deal Structure Tab */}
          <TabsContent value="deal-structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer & Vehicle Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer & Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={deal.customerId.toString()} onValueChange={(value) => setDeal(prev => ({ ...prev, customerId: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <Select value={deal.vehicleId.toString()} onValueChange={(value) => setDeal(prev => ({ ...prev, vehicleId: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={deal.salePrice}
                      onChange={(e) => setDeal(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tradeInValue">Trade-In Value</Label>
                    <Input
                      id="tradeInValue"
                      type="number"
                      value={deal.tradeInValue}
                      onChange={(e) => setDeal(prev => ({ ...prev, tradeInValue: parseFloat(e.target.value) || 0 }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cashDown">Cash Down</Label>
                    <Input
                      id="cashDown"
                      type="number"
                      value={deal.cashDown}
                      onChange={(e) => setDeal(prev => ({ ...prev, cashDown: parseFloat(e.target.value) || 0 }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financing Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Financing Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="term">Term (months)</Label>
                    <Select value={deal.term.toString()} onValueChange={(value) => setDeal(prev => ({ ...prev, term: parseInt(value) }))}>
                      <SelectTrigger>
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
                  
                  <div>
                    <Label htmlFor="apr">APR (%)</Label>
                    <Input
                      id="apr"
                      type="number"
                      step="0.1"
                      value={deal.apr}
                      onChange={(e) => setDeal(prev => ({ ...prev, apr: parseFloat(e.target.value) || 0 }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Calculated Payment</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">${deal.payment.toFixed(2)}/month</p>
                    <p className="text-sm text-blue-700">Finance Amount: ${deal.financeAmount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Fees */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Fees & Add-ons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="docFee">Documentation Fee</Label>
                    <Input
                      id="docFee"
                      type="number"
                      value={deal.fees.documentation}
                      onChange={(e) => setDeal(prev => ({ ...prev, fees: { ...prev.fees, documentation: parseFloat(e.target.value) || 0 } }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="regFee">Registration Fee</Label>
                    <Input
                      id="regFee"
                      type="number"
                      value={deal.fees.registration}
                      onChange={(e) => setDeal(prev => ({ ...prev, fees: { ...prev.fees, registration: parseFloat(e.target.value) || 0 } }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="procFee">Processing Fee</Label>
                    <Input
                      id="procFee"
                      type="number"
                      value={deal.fees.processing}
                      onChange={(e) => setDeal(prev => ({ ...prev, fees: { ...prev.fees, processing: parseFloat(e.target.value) || 0 } }))}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Calculator Tab */}
          <TabsContent value="payment-calc" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Payment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span>Monthly Payment</span>
                      <span className="font-bold">${deal.payment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Total Interest</span>
                      <span className="font-bold text-orange-600">${deal.totalInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Total Cost</span>
                      <span className="font-bold">${(deal.financeAmount + deal.totalInterest).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Finance Amount</span>
                      <span className="font-bold text-blue-600">${deal.financeAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Comparison Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">48 months</p>
                        <p className="font-bold">${calculatePayment(deal.financeAmount, deal.apr, 48).monthlyPayment.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-blue-600">60 months</p>
                        <p className="font-bold text-blue-900">${deal.payment.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">72 months</p>
                        <p className="font-bold">${calculatePayment(deal.financeAmount, deal.apr, 72).monthlyPayment.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profit Analysis Tab */}
          <TabsContent value="profit-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Gross Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">${deal.grossProfit.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Estimated gross profit</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {deal.salePrice > 0 ? ((deal.grossProfit / deal.salePrice) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Profit margin</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Deal Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge variant={deal.grossProfit > 3000 ? "default" : deal.grossProfit > 1500 ? "secondary" : "destructive"}>
                      {deal.grossProfit > 3000 ? "Excellent" : deal.grossProfit > 1500 ? "Good" : "Needs Work"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">Deal quality</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financing Options Tab */}
          <TabsContent value="financing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Financing & Protection Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Warranties</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deal.warranties.extended}
                          onChange={(e) => setDeal(prev => ({ ...prev, warranties: { ...prev.warranties, extended: e.target.checked } }))}
                        />
                        <span>Extended Warranty (+$1,200)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deal.warranties.gap}
                          onChange={(e) => setDeal(prev => ({ ...prev, warranties: { ...prev.warranties, gap: e.target.checked } }))}
                        />
                        <span>GAP Insurance (+$600)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deal.warranties.maintenance}
                          onChange={(e) => setDeal(prev => ({ ...prev, warranties: { ...prev.warranties, maintenance: e.target.checked } }))}
                        />
                        <span>Maintenance Plan (+$800)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Insurance</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deal.insurance.required}
                          onChange={(e) => setDeal(prev => ({ ...prev, insurance: { ...prev.insurance, required: e.target.checked } }))}
                        />
                        <span>Insurance Required</span>
                      </label>
                      <Input
                        placeholder="Insurance Provider"
                        value={deal.insurance.provider}
                        onChange={(e) => setDeal(prev => ({ ...prev, insurance: { ...prev.insurance, provider: e.target.value } }))}
                      />
                      <Input
                        type="number"
                        placeholder="Monthly Cost"
                        value={deal.insurance.cost}
                        onChange={(e) => setDeal(prev => ({ ...prev, insurance: { ...prev.insurance, cost: parseFloat(e.target.value) || 0 } }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Deal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special notes about this deal..."
                    value={deal.notes}
                    onChange={(e) => setDeal(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}