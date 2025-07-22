import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Calculator, 
  DollarSign, 
  User, 
  Car,
  FileText,
  Printer,
  Save,
  Zap,
  TrendingUp,
  Target,
  CreditCard,
  Building,
  Phone,
  Mail,
  Calendar,
  Percent
} from "lucide-react";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  creditScore?: number;
}

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  vin?: string;
  mileage?: number;
}

interface DealScenario {
  id: string;
  name: string;
  salePrice: number;
  cashDown: number;
  tradeValue: number;
  rebates: number;
  financing: {
    term: number;
    rate: number;
    payment: number;
  };
  lease?: {
    term: number;
    mileage: number;
    payment: number;
    residual: number;
  };
  total: number;
}

export default function DealWorkingScreen() {
  const { toast } = useToast();
  const [location] = useLocation();
  const queryClient = useQueryClient();

  // Get customer and vehicle from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('customerId') || localStorage.getItem('selectedCustomerId');
  const vehicleId = urlParams.get('vehicleId') || localStorage.getItem('selectedVehicleId');

  const [activeTab, setActiveTab] = useState('scenarios');
  const [scenarios, setScenarios] = useState<DealScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  
  // Deal working fields
  const [salePrice, setSalePrice] = useState('');
  const [cashDown, setCashDown] = useState('');
  const [tradeValue, setTradeValue] = useState('');
  const [rebates, setRebates] = useState('');
  const [financeRate, setFinanceRate] = useState('');
  const [financeTerm, setFinanceTerm] = useState('60');
  const [leaseRate, setLeaseRate] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('36');
  const [leaseMileage, setLeaseMileage] = useState('12000');
  
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Fetch customer data
  const { data: customer } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
  });

  // Fetch vehicle data
  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
  });

  // Initialize with vehicle price
  useEffect(() => {
    if (vehicle && !salePrice) {
      setSalePrice(vehicle.price.toString());
    }
  }, [vehicle, salePrice]);

  // Calculate payment scenarios
  const calculateScenarios = () => {
    if (!salePrice) return;

    const price = parseFloat(salePrice) || 0;
    const down = parseFloat(cashDown) || 0;
    const trade = parseFloat(tradeValue) || 0;
    const rebate = parseFloat(rebates) || 0;
    const fRate = parseFloat(financeRate) || 5.9;
    const fTerm = parseInt(financeTerm) || 60;
    const lRate = parseFloat(leaseRate) || 3.9;
    const lTerm = parseInt(leaseTerm) || 36;

    const financeAmount = price - down - trade - rebate;
    const monthlyRate = fRate / 100 / 12;
    const financePayment = financeAmount * (monthlyRate * Math.pow(1 + monthlyRate, fTerm)) / (Math.pow(1 + monthlyRate, fTerm) - 1);

    // Lease calculation (simplified)
    const residualValue = price * 0.6; // 60% residual
    const leasePayment = (price - residualValue + (price * lRate / 100)) / lTerm;

    const newScenarios: DealScenario[] = [
      {
        id: 'finance-60',
        name: '60-Month Finance',
        salePrice: price,
        cashDown: down,
        tradeValue: trade,
        rebates: rebate,
        financing: {
          term: fTerm,
          rate: fRate,
          payment: Math.round(financePayment),
        },
        total: Math.round(financePayment * fTerm + down),
      },
      {
        id: 'finance-72',
        name: '72-Month Finance',
        salePrice: price,
        cashDown: down,
        tradeValue: trade,
        rebates: rebate,
        financing: {
          term: 72,
          rate: fRate + 0.5,
          payment: Math.round(financeAmount * ((fRate + 0.5) / 100 / 12 * Math.pow(1 + (fRate + 0.5) / 100 / 12, 72)) / (Math.pow(1 + (fRate + 0.5) / 100 / 12, 72) - 1)),
        },
        total: Math.round(financePayment * 72 + down),
      },
      {
        id: 'lease-36',
        name: '36-Month Lease',
        salePrice: price,
        cashDown: down,
        tradeValue: trade,
        rebates: rebate,
        lease: {
          term: lTerm,
          mileage: parseInt(leaseMileage),
          payment: Math.round(leasePayment),
          residual: Math.round(residualValue),
        },
        total: Math.round(leasePayment * lTerm + down),
      },
    ];

    setScenarios(newScenarios);
    if (!selectedScenario) {
      setSelectedScenario(newScenarios[0].id);
    }
  };

  // Generate AI-powered suggestions
  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await apiRequest('POST', '/api/ai/deal-suggestions', {
        customer: customer,
        vehicle: vehicle,
        salePrice: parseFloat(salePrice),
        scenarios: scenarios,
      });
      const suggestions = await response.json();
      setAiSuggestions(suggestions);
      
      toast({
        title: "AI Analysis Complete",
        description: "Generated deal suggestions and market insights",
      });
    } catch (error) {
      toast({
        title: "AI Analysis Unavailable",
        description: "Using standard calculations for now",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Print working sheet
  const printWorkingSheet = () => {
    const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);
    if (!selectedScenarioData) return;

    const printContent = `
      <html>
        <head>
          <title>Deal Working Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AutolytiQ Deal Working Sheet</h1>
            <p>Customer: ${customer?.firstName} ${customer?.lastName}</p>
            <p>Vehicle: ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Vehicle Information</h2>
            <div class="row"><span>Sale Price:</span><span>$${selectedScenarioData.salePrice.toLocaleString()}</span></div>
            <div class="row"><span>Trade Value:</span><span>$${selectedScenarioData.tradeValue.toLocaleString()}</span></div>
            <div class="row"><span>Rebates:</span><span>$${selectedScenarioData.rebates.toLocaleString()}</span></div>
            <div class="row"><span>Cash Down:</span><span>$${selectedScenarioData.cashDown.toLocaleString()}</span></div>
          </div>

          <div class="section">
            <h2>${selectedScenarioData.name}</h2>
            ${selectedScenarioData.financing ? `
              <div class="row"><span>Finance Term:</span><span>${selectedScenarioData.financing.term} months</span></div>
              <div class="row"><span>Interest Rate:</span><span>${selectedScenarioData.financing.rate}%</span></div>
              <div class="row"><span>Monthly Payment:</span><span>$${selectedScenarioData.financing.payment.toLocaleString()}</span></div>
            ` : ''}
            ${selectedScenarioData.lease ? `
              <div class="row"><span>Lease Term:</span><span>${selectedScenarioData.lease.term} months</span></div>
              <div class="row"><span>Annual Mileage:</span><span>${selectedScenarioData.lease.mileage.toLocaleString()}</span></div>
              <div class="row"><span>Monthly Payment:</span><span>$${selectedScenarioData.lease.payment.toLocaleString()}</span></div>
              <div class="row"><span>Residual Value:</span><span>$${selectedScenarioData.lease.residual.toLocaleString()}</span></div>
            ` : ''}
            <div class="row total"><span>Total Investment:</span><span>$${selectedScenarioData.total.toLocaleString()}</span></div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Save deal scenario
  const saveDealScenario = async () => {
    if (!customer || !vehicle || !selectedScenario) return;
    
    const scenarioData = scenarios.find(s => s.id === selectedScenario);
    if (!scenarioData) return;

    try {
      await apiRequest('POST', '/api/deals', {
        customerId: customer.id,
        vehicleId: vehicle.id,
        buyerName: `${customer.firstName} ${customer.lastName}`,
        dealType: scenarioData.lease ? 'lease' : 'retail',
        salePrice: scenarioData.salePrice,
        cashDown: scenarioData.cashDown,
        status: 'structuring',
        scenarios: scenarios,
        selectedScenario: selectedScenario,
      });

      toast({
        title: "Deal Saved",
        description: "Deal scenario has been saved to the system",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save deal scenario",
        variant: "destructive",
      });
    }
  };

  if (!customer || !vehicle) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer or Vehicle Selected</h3>
            <p className="text-gray-600 mb-4">Please select a customer and vehicle from the showroom to start deal working</p>
            <Button onClick={() => window.history.back()}>
              Go Back to Showroom
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Deal Working Screen</h1>
            <p className="text-sm md:text-base text-gray-600">Multi-scenario deal structuring and negotiation workspace</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateAISuggestions} disabled={isGeneratingAI} className="btn-aiq-secondary">
              <Zap className="w-4 h-4 mr-2" />
              {isGeneratingAI ? "Analyzing..." : "AI Insights"}
            </Button>
            <Button onClick={printWorkingSheet} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Sheet
            </Button>
            <Button onClick={saveDealScenario} className="btn-aiq-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Deal
            </Button>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{customer.firstName} {customer.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{customer.phone}</span>
                </div>
                {customer.creditScore && (
                  <div className="flex justify-between">
                    <span className="font-medium">Credit Score:</span>
                    <span className={customer.creditScore > 700 ? "text-green-600" : customer.creditScore > 600 ? "text-yellow-600" : "text-red-600"}>
                      {customer.creditScore}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Vehicle:</span>
                  <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                </div>
                {vehicle.trim && (
                  <div className="flex justify-between">
                    <span className="font-medium">Trim:</span>
                    <span>{vehicle.trim}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">MSRP:</span>
                  <span>${vehicle.price.toLocaleString()}</span>
                </div>
                {vehicle.mileage && (
                  <div className="flex justify-between">
                    <span className="font-medium">Mileage:</span>
                    <span>{vehicle.mileage.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Deal Scenarios</TabsTrigger>
          <TabsTrigger value="calculator">Payment Calculator</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Deal Scenarios Tab */}
        <TabsContent value="scenarios">
          <div className="space-y-6">
            {scenarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <Card 
                    key={scenario.id} 
                    className={`cursor-pointer transition-colors ${selectedScenario === scenario.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sale Price:</span>
                          <span>${scenario.salePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash Down:</span>
                          <span>${scenario.cashDown.toLocaleString()}</span>
                        </div>
                        {scenario.financing && (
                          <>
                            <div className="flex justify-between font-medium">
                              <span>Monthly Payment:</span>
                              <span>${scenario.financing.payment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{scenario.financing.term} months @ {scenario.financing.rate}%</span>
                            </div>
                          </>
                        )}
                        {scenario.lease && (
                          <>
                            <div className="flex justify-between font-medium">
                              <span>Lease Payment:</span>
                              <span>${scenario.lease.payment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{scenario.lease.term} months</span>
                            </div>
                          </>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold">
                            <span>Total Investment:</span>
                            <span>${scenario.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Use the Payment Calculator to generate deal scenarios</p>
                  <Button onClick={() => setActiveTab('calculator')} className="btn-aiq-primary">
                    Open Calculator
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Payment Calculator Tab */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="Enter sale price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cashDown">Cash Down</Label>
                    <Input
                      id="cashDown"
                      type="number"
                      value={cashDown}
                      onChange={(e) => setCashDown(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="rebates">Rebates</Label>
                    <Input
                      id="rebates"
                      type="number"
                      value={rebates}
                      onChange={(e) => setRebates(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="financeTerm">Finance Term (months)</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leaseRate">Lease Rate (%)</Label>
                    <Input
                      id="leaseRate"
                      type="number"
                      step="0.1"
                      value={leaseRate}
                      onChange={(e) => setLeaseRate(e.target.value)}
                      placeholder="3.9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseMileage">Annual Mileage</Label>
                    <Select value={leaseMileage} onValueChange={setLeaseMileage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10000">10,000 miles</SelectItem>
                        <SelectItem value="12000">12,000 miles</SelectItem>
                        <SelectItem value="15000">15,000 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={calculateScenarios} className="w-full btn-aiq-primary">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Scenarios
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateAISuggestions} disabled={isGeneratingAI} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  {isGeneratingAI ? "Generating AI Insights..." : "Generate AI Suggestions"}
                </Button>
                
                <Button onClick={printWorkingSheet} variant="outline" className="w-full">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Working Sheet
                </Button>
                
                <Button onClick={saveDealScenario} className="w-full btn-aiq-secondary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Deal to System
                </Button>

                {scenarios.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Generated Scenarios:</h4>
                    <div className="space-y-2">
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-gray-600">
                            {scenario.financing ? `$${scenario.financing.payment}/mo` : `$${scenario.lease?.payment}/mo lease`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI-Powered Deal Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSuggestions ? (
                <div className="space-y-4">
                  {/* AI suggestions would be displayed here */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Market Analysis</h4>
                    <p className="text-blue-700 text-sm">AI analysis is being integrated. This will provide real-time market insights, competitive pricing, and optimal deal structuring recommendations.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Available</h3>
                  <p className="text-gray-600 mb-4">Generate AI-powered deal insights and market analysis</p>
                  <Button onClick={generateAISuggestions} disabled={isGeneratingAI} className="btn-aiq-primary">
                    <Zap className="w-4 h-4 mr-2" />
                    {isGeneratingAI ? "Generating..." : "Generate AI Insights"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}