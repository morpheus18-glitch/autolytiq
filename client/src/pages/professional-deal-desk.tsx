import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Car, 
  Calculator, 
  DollarSign, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Shield,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  Target,
  Percent,
  Settings,
  Save,
  Printer,
  Send,
  RefreshCw,
  Brain,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Professional Deal Desk Component for VinSolutions/DriveCentric Level Functionality
export default function ProfessionalDealDesk() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State Management
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [dealStructure, setDealStructure] = useState<any>({
    vehiclePrice: 0,
    tradeValue: 0,
    cashDown: 0,
    financeAmount: 0,
    termMonths: 60,
    apr: 6.5,
    monthlyPayment: 0,
    totalInterest: 0,
    profitMargin: 0.15,
    customerState: '',
    zipCode: '',
    creditScore: null,
    income: null,
    debtToIncome: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [mlRecommendations, setMlRecommendations] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicle');
  
  // Data Fetching
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['/api/vehicles'],
    select: (data) => data || []
  });
  
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
    select: (data) => data || []
  });
  
  const { data: leads } = useQuery({
    queryKey: ['/api/leads'],
    select: (data) => data || []
  });
  
  // ML Integration for Pricing Optimization
  const optimizeDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await fetch('http://localhost:8000/optimize/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });
      if (!response.ok) throw new Error('ML optimization failed');
      return response.json();
    },
    onSuccess: (data) => {
      setMlRecommendations(data);
      toast({
        title: "Deal Optimized",
        description: "ML recommendations are ready for review"
      });
    },
    onError: () => {
      toast({
        title: "Optimization Failed",
        description: "Unable to get ML recommendations",
        variant: "destructive"
      });
    }
  });
  
  // Calculate payment based on deal structure
  const calculatePayment = (amount: number, rate: number, term: number) => {
    if (rate === 0) return amount / term;
    const monthlyRate = rate / 100 / 12;
    return amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  };
  
  // Update deal calculations
  useEffect(() => {
    const financeAmount = dealStructure.vehiclePrice - dealStructure.tradeValue - dealStructure.cashDown;
    const monthlyPayment = calculatePayment(financeAmount, dealStructure.apr, dealStructure.termMonths);
    const totalInterest = (monthlyPayment * dealStructure.termMonths) - financeAmount;
    
    setDealStructure(prev => ({
      ...prev,
      financeAmount,
      monthlyPayment,
      totalInterest
    }));
  }, [dealStructure.vehiclePrice, dealStructure.tradeValue, dealStructure.cashDown, dealStructure.apr, dealStructure.termMonths]);
  
  // Filter vehicles based on search
  const filteredVehicles = vehicles?.filter((vehicle: any) => 
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.stockNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Handle vehicle selection
  const handleVehicleSelection = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setDealStructure(prev => ({
      ...prev,
      vehiclePrice: vehicle.price || 0
    }));
    setActiveTab('customer');
  };
  
  // Handle customer selection
  const handleCustomerSelection = (customer: any) => {
    setSelectedCustomer(customer);
    setDealStructure(prev => ({
      ...prev,
      customerState: customer.state || '',
      zipCode: customer.zipCode || '',
      creditScore: customer.creditScore || null,
      income: customer.income || null
    }));
    setActiveTab('pricing');
  };
  
  // Optimize deal with ML
  const handleOptimizeDeal = () => {
    if (!selectedVehicle || !selectedCustomer) {
      toast({
        title: "Missing Information",
        description: "Please select a vehicle and customer first",
        variant: "destructive"
      });
      return;
    }
    
    setIsOptimizing(true);
    optimizeDealMutation.mutate(dealStructure);
    setTimeout(() => setIsOptimizing(false), 2000);
  };
  
  // State tax rates (simplified)
  const getStateTaxRate = (state: string) => {
    const taxRates: Record<string, number> = {
      'CA': 0.0825, 'NY': 0.08, 'TX': 0.0625, 'FL': 0.06,
      'WA': 0.065, 'OR': 0.0, 'MT': 0.0, 'NH': 0.0, 'DE': 0.0
    };
    return taxRates[state] || 0.07;
  };
  
  // Calculate taxes and fees
  const calculateTaxesAndFees = () => {
    const stateTaxRate = getStateTaxRate(dealStructure.customerState);
    const salesTax = dealStructure.vehiclePrice * stateTaxRate;
    const docFee = 299;
    const licenseFee = 75;
    const titleFee = 50;
    return {
      salesTax,
      docFee,
      licenseFee,
      titleFee,
      total: salesTax + docFee + licenseFee + titleFee
    };
  };
  
  const taxesAndFees = calculateTaxesAndFees();
  const totalDealAmount = dealStructure.vehiclePrice + taxesAndFees.total;
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Professional Deal Desk</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Deal
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                onClick={handleOptimizeDeal}
                disabled={isOptimizing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isOptimizing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                AI Optimize
              </Button>
            </div>
          </div>
          
          {/* Quick Status */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'No vehicle selected'}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'No customer selected'}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Payment: ${dealStructure.monthlyPayment.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Deal Configuration */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="financing">Finance</TabsTrigger>
              </TabsList>
              
              {/* Vehicle Selection Tab */}
              <TabsContent value="vehicle" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by Stock#, VIN, Make, Model..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Vehicle List */}
                      <ScrollArea className="h-96">
                        <div className="grid gap-3">
                          {vehiclesLoading ? (
                            <div className="text-center py-8">Loading vehicles...</div>
                          ) : filteredVehicles.length > 0 ? (
                            filteredVehicles.map((vehicle: any) => (
                              <div
                                key={vehicle.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedVehicle?.id === vehicle.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleVehicleSelection(vehicle)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">
                                      {vehicle.year} {vehicle.make} {vehicle.model}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Stock: {vehicle.stockNumber} | VIN: {vehicle.vin}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {vehicle.mileage?.toLocaleString()} miles | {vehicle.color}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">
                                      ${vehicle.price?.toLocaleString()}
                                    </p>
                                    <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                                      {vehicle.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No vehicles found matching your search
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Customer Selection Tab */}
              <TabsContent value="customer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="grid gap-3">
                        {customersLoading ? (
                          <div className="text-center py-8">Loading customers...</div>
                        ) : customers && customers.length > 0 ? (
                          customers.map((customer: any) => (
                            <div
                              key={customer.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedCustomer?.id === customer.id 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleCustomerSelection(customer)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">
                                    {customer.firstName} {customer.lastName}
                                  </h3>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {customer.email}
                                    </p>
                                    {customer.phone && (
                                      <p className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {customer.phone}
                                      </p>
                                    )}
                                    {customer.city && customer.state && (
                                      <p className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {customer.city}, {customer.state}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {customer.creditScore && (
                                    <Badge variant="outline">
                                      Credit: {customer.creditScore}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No customers found</p>
                            <Button variant="outline" className="mt-2">
                              Add New Customer
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Deal Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Vehicle Price</Label>
                        <Input
                          type="number"
                          value={dealStructure.vehiclePrice}
                          onChange={(e) => setDealStructure(prev => ({
                            ...prev,
                            vehiclePrice: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Trade-in Value</Label>
                        <Input
                          type="number"
                          value={dealStructure.tradeValue}
                          onChange={(e) => setDealStructure(prev => ({
                            ...prev,
                            tradeValue: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Cash Down</Label>
                        <Input
                          type="number"
                          value={dealStructure.cashDown}
                          onChange={(e) => setDealStructure(prev => ({
                            ...prev,
                            cashDown: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Finance Amount</Label>
                        <Input
                          type="number"
                          value={dealStructure.financeAmount}
                          disabled
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Tax Breakdown */}
                    <div>
                      <h4 className="font-semibold mb-2">Taxes & Fees</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sales Tax ({dealStructure.customerState})</span>
                          <span>${taxesAndFees.salesTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Doc Fee</span>
                          <span>${taxesAndFees.docFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>License Fee</span>
                          <span>${taxesAndFees.licenseFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Title Fee</span>
                          <span>${taxesAndFees.titleFee.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Deal Amount</span>
                          <span>${totalDealAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Financing Tab */}
              <TabsContent value="financing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Financing Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>APR (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={dealStructure.apr}
                          onChange={(e) => setDealStructure(prev => ({
                            ...prev,
                            apr: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Term (months)</Label>
                        <Select 
                          value={dealStructure.termMonths.toString()} 
                          onValueChange={(value) => setDealStructure(prev => ({
                            ...prev,
                            termMonths: Number(value)
                          }))}
                        >
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
                        <Label>Monthly Payment</Label>
                        <Input
                          type="number"
                          value={dealStructure.monthlyPayment.toFixed(2)}
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Total Interest</Label>
                        <Input
                          type="number"
                          value={dealStructure.totalInterest.toFixed(2)}
                          disabled
                        />
                      </div>
                    </div>
                    
                    {/* Payment Options */}
                    <div>
                      <h4 className="font-semibold mb-2">Payment Options</h4>
                      <div className="grid gap-2">
                        {[48, 60, 72].map(term => {
                          const payment = calculatePayment(dealStructure.financeAmount, dealStructure.apr, term);
                          return (
                            <div 
                              key={term}
                              className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => setDealStructure(prev => ({ ...prev, termMonths: term }))}
                            >
                              <span>{term} months</span>
                              <span className="font-semibold">${payment.toFixed(2)}/mo</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Deal Summary & ML Recommendations */}
          <div className="space-y-6">
            {/* Deal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Vehicle Price</span>
                    <span>${dealStructure.vehiclePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trade Value</span>
                    <span>-${dealStructure.tradeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Down</span>
                    <span>-${dealStructure.cashDown.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>${taxesAndFees.total.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Amount to Finance</span>
                    <span>${dealStructure.financeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Monthly Payment</span>
                    <span>${dealStructure.monthlyPayment.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* ML Recommendations */}
            {mlRecommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-semibold">Deal Optimized</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm">
                        Recommended payment: ${mlRecommendations.optimized_deal?.monthly_payment?.toFixed(2) || 'N/A'}
                      </p>
                      <p className="text-sm mt-1">
                        Estimated approval: {((mlRecommendations.approval_probability || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                    {mlRecommendations.recommendations?.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Zap className="h-4 w-4 mt-0.5 text-yellow-500" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Contract
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Send to F&I
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}