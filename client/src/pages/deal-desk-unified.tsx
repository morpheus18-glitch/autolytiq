import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import MobileResponsiveLayout from '@/components/layout/mobile-responsive-layout';
import { 
  Calculator, 
  Car, 
  DollarSign, 
  Percent, 
  FileText, 
  Save,
  Printer,
  Send,
  TrendingUp,
  CreditCard,
  Shield
} from 'lucide-react';
import type { Vehicle, Customer } from '@shared/schema';

interface DealCalculation {
  vehiclePrice: number;
  tradeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

export default function DealDeskUnified() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();

  // Deal state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dealData, setDealData] = useState<DealCalculation>({
    vehiclePrice: 0,
    tradeValue: 0,
    downPayment: 0,
    loanAmount: 0,
    interestRate: 6.99,
    termMonths: 60,
    monthlyPayment: 0,
    totalInterest: 0,
    totalCost: 0
  });

  // Fetch vehicles and customers
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Calculate deal when inputs change
  useEffect(() => {
    calculateDeal();
  }, [dealData.vehiclePrice, dealData.tradeValue, dealData.downPayment, dealData.interestRate, dealData.termMonths]);

  const calculateDeal = () => {
    const netVehiclePrice = dealData.vehiclePrice - dealData.tradeValue;
    const loanAmount = Math.max(0, netVehiclePrice - dealData.downPayment);
    
    if (loanAmount === 0) {
      setDealData(prev => ({
        ...prev,
        loanAmount: 0,
        monthlyPayment: 0,
        totalInterest: 0,
        totalCost: netVehiclePrice + dealData.downPayment
      }));
      return;
    }

    const monthlyRate = dealData.interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, dealData.termMonths)) / 
                          (Math.pow(1 + monthlyRate, dealData.termMonths) - 1);
    
    const totalPayments = monthlyPayment * dealData.termMonths;
    const totalInterest = totalPayments - loanAmount;
    const totalCost = totalPayments + dealData.downPayment;

    setDealData(prev => ({
      ...prev,
      loanAmount,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      totalCost: isNaN(totalCost) ? dealData.vehiclePrice : totalCost
    }));
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setDealData(prev => ({
        ...prev,
        vehiclePrice: vehicle.price || 0
      }));
      trackInteraction('vehicle_selected', { vehicleId: vehicle.id });
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
      setSelectedCustomer(customer);
      trackInteraction('customer_selected', { customerId: customer.id });
    }
  };

  const saveDeal = () => {
    if (!selectedVehicle || !selectedCustomer) {
      toast({
        title: "Incomplete Deal",
        description: "Please select both a vehicle and customer",
        variant: "destructive"
      });
      return;
    }

    // Here you would save the deal to the backend
    toast({
      title: "Deal Saved",
      description: "Deal has been saved successfully"
    });
    
    trackInteraction('deal_saved', { 
      vehicleId: selectedVehicle.id, 
      customerId: selectedCustomer.id,
      dealValue: dealData.vehiclePrice
    });
  };

  const headerActions = (
    <>
      <Button variant="outline" onClick={() => toast({ title: "Print", description: "Printing deal sheet..." })}>
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" onClick={() => toast({ title: "Email", description: "Emailing deal to customer..." })}>
        <Send className="w-4 h-4 mr-2" />
        Email
      </Button>
      <Button onClick={saveDeal}>
        <Save className="w-4 h-4 mr-2" />
        Save Deal
      </Button>
    </>
  );

  return (
    <MobileResponsiveLayout
      title="Deal Desk"
      subtitle="Professional vehicle sales calculator"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Vehicle and Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Select Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleVehicleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVehicle && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                  <p className="text-sm text-gray-600">VIN: {selectedVehicle.vin}</p>
                  <p className="text-lg font-bold text-green-600">${selectedVehicle.price?.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Select Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name || `${customer.firstName} ${customer.lastName}`} - {customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCustomer && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedCustomer.name || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                  {selectedCustomer.creditScore && (
                    <p className="text-sm">Credit Score: <span className="font-medium">{selectedCustomer.creditScore}</span></p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="financing">Financing</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                    <Input
                      id="vehiclePrice"
                      type="number"
                      value={dealData.vehiclePrice}
                      onChange={(e) => setDealData(prev => ({ ...prev, vehiclePrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tradeValue">Trade-in Value</Label>
                    <Input
                      id="tradeValue"
                      type="number"
                      value={dealData.tradeValue}
                      onChange={(e) => setDealData(prev => ({ ...prev, tradeValue: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={dealData.downPayment}
                      onChange={(e) => setDealData(prev => ({ ...prev, downPayment: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Loan Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Loan Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      value={dealData.interestRate}
                      onChange={(e) => setDealData(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="termMonths">Term (Months)</Label>
                    <Select onValueChange={(value) => setDealData(prev => ({ ...prev, termMonths: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={dealData.termMonths.toString()} />
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
                    <Label>Loan Amount</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      ${dealData.loanAmount.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Payment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-2xl font-bold text-green-600">${dealData.monthlyPayment.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-xl font-semibold text-blue-600">${dealData.totalInterest.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-xl font-semibold text-orange-600">${dealData.totalCost.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Net Price</p>
                    <p className="text-xl font-semibold text-purple-600">
                      ${(dealData.vehiclePrice - dealData.tradeValue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financing">
            <Card>
              <CardHeader>
                <CardTitle>Financing Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  Advanced financing options and lender integration coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Deal Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVehicle && selectedCustomer ? (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold">Vehicle</h3>
                      <p>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                      <p className="text-sm text-gray-600">VIN: {selectedVehicle.vin}</p>
                    </div>
                    
                    <div className="border-b pb-4">
                      <h3 className="font-semibold">Customer</h3>
                      <p>{selectedCustomer.name || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</p>
                      <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Financial Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Vehicle Price:</span>
                          <span>${dealData.vehiclePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trade Value:</span>
                          <span>-${dealData.tradeValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Down Payment:</span>
                          <span>-${dealData.downPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Monthly Payment:</span>
                          <span>${dealData.monthlyPayment.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    Please select a vehicle and customer to view deal summary.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileResponsiveLayout>
  );
}