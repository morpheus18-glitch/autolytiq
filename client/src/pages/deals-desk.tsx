import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Calculator, 
  Printer, 
  Save, 
  User, 
  Car, 
  DollarSign,
  Percent,
  ArrowRight,
  ArrowLeft,
  FileText,
  Check
} from "lucide-react";

export default function DealsDesk() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const dealId = urlParams.get('dealId');
  const isNewDeal = urlParams.get('new') === 'true';

  // Vehicle and Customer Selection
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  
  // Deal Structure
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [tradeValue, setTradeValue] = useState('0');
  const [cashDown, setCashDown] = useState('');
  const [rebates, setRebates] = useState('0');
  const [docFee, setDocFee] = useState('299');
  const [taxRate, setTaxRate] = useState('8.25');
  
  // Finance Options
  const [financeRate, setFinanceRate] = useState('5.9');
  const [financeTerm, setFinanceTerm] = useState('60');
  
  // Scenario Management
  const [currentScenario, setCurrentScenario] = useState('primary');
  const [scenarios, setScenarios] = useState({
    primary: { name: 'Primary Deal', saved: false },
    alternative1: { name: 'Alternative 1', saved: false },
    alternative2: { name: 'Alternative 2', saved: false }
  });

  // Fetch customers and vehicles for dropdowns
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
    staleTime: 5 * 60 * 1000
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
    staleTime: 5 * 60 * 1000
  });

  // Load existing deal if editing
  const { data: existingDeal } = useQuery({
    queryKey: ['/api/deals', dealId],
    enabled: !!dealId && !isNewDeal,
    staleTime: 30000
  });

  // Load deal data when editing
  useEffect(() => {
    if (existingDeal && !isNewDeal) {
      const deal = existingDeal as any;
      setSelectedCustomer(deal.customerId?.toString() || '');
      setSelectedVehicle(deal.vehicleId?.toString() || '');
      setVehiclePrice(deal.salePrice?.toString() || '');
      setTradeValue(deal.tradeAllowance?.toString() || '0');
      setCashDown(deal.cashDown?.toString() || '');
      setRebates(deal.rebates?.toString() || '0');
      setDocFee(deal.docFee?.toString() || '299');
      setFinanceRate(deal.rate?.replace('%', '') || '5.9');
      setFinanceTerm(deal.term?.toString() || '60');
    }
  }, [existingDeal, isNewDeal]);

  // Calculate deal numbers
  const calculateDeal = () => {
    const price = parseFloat(vehiclePrice) || 0;
    const trade = parseFloat(tradeValue) || 0;
    const down = parseFloat(cashDown) || 0;
    const rebate = parseFloat(rebates) || 0;
    const doc = parseFloat(docFee) || 0;
    const tax = parseFloat(taxRate) || 0;
    
    const netPrice = price - trade - down - rebate;
    const salesTax = (price - trade) * (tax / 100);
    const financeAmount = netPrice + salesTax + doc;
    
    const rate = parseFloat(financeRate) / 100 / 12;
    const term = parseInt(financeTerm) || 60;
    const payment = financeAmount > 0 && rate > 0 
      ? (financeAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      : 0;

    return {
      vehiclePrice: price,
      tradeValue: trade,
      cashDown: down,
      rebates: rebate,
      netPrice,
      salesTax,
      docFee: doc,
      financeAmount,
      monthlyPayment: payment,
      totalDue: financeAmount
    };
  };

  const dealCalc = calculateDeal();

  // Save scenario
  const saveScenario = useMutation({
    mutationFn: async () => {
      const dealData = {
        customerId: selectedCustomer,
        vehicleId: selectedVehicle,
        salePrice: parseFloat(vehiclePrice),
        tradeAllowance: parseFloat(tradeValue),
        cashDown: parseFloat(cashDown),
        rebates: parseFloat(rebates),
        docFee: parseFloat(docFee),
        rate: `${financeRate}%`,
        term: parseInt(financeTerm),
        scenario: currentScenario,
        calculations: dealCalc
      };

      if (dealId && !isNewDeal) {
        return apiRequest('PUT', `/api/deals/${dealId}`, dealData);
      } else {
        return apiRequest('POST', '/api/deals', dealData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Scenario Saved",
        description: `${scenarios[currentScenario as keyof typeof scenarios].name} has been saved successfully.`,
      });
      setScenarios(prev => ({
        ...prev,
        [currentScenario]: { ...prev[currentScenario as keyof typeof prev], saved: true }
      }));
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save scenario",
        variant: "destructive",
      });
    }
  });

  const handlePrintScenario = () => {
    window.print();
  };

  const handleGoToFinance = () => {
    if (!selectedCustomer || !selectedVehicle) {
      toast({
        title: "Missing Information",
        description: "Please select a customer and vehicle before proceeding to finance.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/deals-finance?dealId=${dealId || 'new'}&customerId=${selectedCustomer}&vehicleId=${selectedVehicle}`);
  };

  const selectedCustomerData = (customers as any[]).find((c: any) => c.id?.toString() === selectedCustomer);
  const selectedVehicleData = (vehicles as any[]).find((v: any) => v.id?.toString() === selectedVehicle);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/deals-list')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNewDeal ? 'New Deal Setup' : `Deal #${dealId}`}
              </h1>
              <p className="text-gray-600">AI-Powered Deal Structuring & Negotiation Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePrintScenario}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={() => saveScenario.mutate()}
              disabled={saveScenario.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Scenario
            </Button>
            <Button
              onClick={handleGoToFinance}
              className="bg-green-600 hover:bg-green-700"
            >
              Finance Suite
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer & Vehicle Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(customers as any[]).map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id?.toString()}>
                            {customer.name || `${customer.firstName} ${customer.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(vehicles as any[]).map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id?.toString()}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedCustomerData && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Customer Info</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Name:</span> {selectedCustomerData.name}
                      </div>
                      <div>
                        <span className="text-blue-700">Phone:</span> {selectedCustomerData.phone}
                      </div>
                      <div>
                        <span className="text-blue-700">Email:</span> {selectedCustomerData.email}
                      </div>
                      <div>
                        <span className="text-blue-700">Credit Score:</span> {selectedCustomerData.creditScore || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deal Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Deal Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={currentScenario} onValueChange={setCurrentScenario} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {Object.entries(scenarios).map(([key, scenario]) => (
                      <TabsTrigger key={key} value={key} className="relative">
                        {scenario.name}
                        {scenario.saved && (
                          <Check className="w-3 h-3 text-green-600 absolute -top-1 -right-1" />
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.keys(scenarios).map((scenarioKey) => (
                    <TabsContent key={scenarioKey} value={scenarioKey} className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                          <Input
                            id="vehiclePrice"
                            type="number"
                            value={vehiclePrice}
                            onChange={(e) => setVehiclePrice(e.target.value)}
                            placeholder="28,500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tradeValue">Trade Value</Label>
                          <Input
                            id="tradeValue"
                            type="number"
                            value={tradeValue}
                            onChange={(e) => setTradeValue(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cashDown">Cash Down</Label>
                          <Input
                            id="cashDown"
                            type="number"
                            value={cashDown}
                            onChange={(e) => setCashDown(e.target.value)}
                            placeholder="3,000"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="rebates">Rebates</Label>
                          <Input
                            id="rebates"
                            type="number"
                            value={rebates}
                            onChange={(e) => setRebates(e.target.value)}
                            placeholder="500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="financeRate">Finance Rate (%)</Label>
                          <Input
                            id="financeRate"
                            type="number"
                            step="0.1"
                            value={financeRate}
                            onChange={(e) => setFinanceRate(e.target.value)}
                            placeholder="5.9"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="financeTerm">Term (months)</Label>
                          <Select value={financeTerm} onValueChange={setFinanceTerm}>
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
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deal Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle Price:</span>
                    <span className="font-medium">${dealCalc.vehiclePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trade Value:</span>
                    <span className="font-medium text-green-600">-${dealCalc.tradeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Down:</span>
                    <span className="font-medium text-green-600">-${dealCalc.cashDown.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rebates:</span>
                    <span className="font-medium text-green-600">-${dealCalc.rebates.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Price:</span>
                    <span className="font-medium">${dealCalc.netPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sales Tax:</span>
                    <span className="font-medium">${dealCalc.salesTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doc Fee:</span>
                    <span className="font-medium">${dealCalc.docFee.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Finance Amount:</span>
                    <span>${dealCalc.financeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Monthly Payment:</span>
                    <span>${dealCalc.monthlyPayment.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => saveScenario.mutate()}
                  disabled={saveScenario.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Current Scenario
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handlePrintScenario}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Deal Sheet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleGoToFinance}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Finance Suite
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}