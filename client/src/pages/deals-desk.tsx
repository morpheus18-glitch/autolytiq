import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  FileText,
  Zap,
  ArrowRight
} from "lucide-react";

interface DealScenario {
  id: string;
  name: string;
  vehiclePrice: number;
  tradeValue: number;
  cashDown: number;
  rebates: number;
  taxRate: number;
  financeDetails?: {
    amount: number;
    rate: number;
    term: number;
    payment: number;
  };
  leaseDetails?: {
    amount: number;
    rate: number;
    term: number;
    payment: number;
    residual: number;
    mileage: number;
  };
  totalDealAmount: number;
}

export default function DealsDesk() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const dealId = urlParams.get('dealId');
  const customerId = urlParams.get('customerId');
  const vehicleId = urlParams.get('vehicleId');

  // Deal structure fields
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [tradeValue, setTradeValue] = useState('');
  const [cashDown, setCashDown] = useState('');
  const [rebates, setRebates] = useState('');
  const [taxRate, setTaxRate] = useState('8.25');
  
  // Finance fields
  const [financeRate, setFinanceRate] = useState('5.9');
  const [financeTerm, setFinanceTerm] = useState('60');
  
  // Lease fields
  const [leaseRate, setLeaseRate] = useState('3.5');
  const [leaseTerm, setLeaseTerm] = useState('36');
  const [leaseMileage, setLeaseMileage] = useState('12000');
  const [residualPercent, setResidualPercent] = useState('60');

  const [scenarios, setScenarios] = useState<DealScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [dealNotes, setDealNotes] = useState('');

  // Fetch customer and vehicle data if IDs provided
  const { data: customer } = useQuery({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
  });

  const { data: vehicle } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
  });

  // Calculate scenarios
  const calculateScenarios = () => {
    const vPrice = parseFloat(vehiclePrice) || 0;
    const trade = parseFloat(tradeValue) || 0;
    const down = parseFloat(cashDown) || 0;
    const rebate = parseFloat(rebates) || 0;
    const tax = parseFloat(taxRate) / 100;
    
    const netPrice = vPrice - trade - down - rebate;
    const taxAmount = netPrice * tax;
    const totalFinanced = netPrice + taxAmount;

    // Finance scenarios
    const fRate = parseFloat(financeRate) / 100 / 12;
    const fTerm60 = parseInt(financeTerm);
    const fTerm72 = 72;
    const fTerm84 = 84;

    const calcPayment = (principal: number, rate: number, term: number) => {
      if (rate === 0) return principal / term;
      return principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    };

    // Lease scenario
    const lRate = parseFloat(leaseRate) / 100 / 12;
    const lTerm = parseInt(leaseTerm);
    const residual = vPrice * (parseFloat(residualPercent) / 100);
    const leaseAmount = vPrice - residual - trade - down - rebate;
    const leasePayment = calcPayment(leaseAmount, lRate, lTerm);

    const newScenarios: DealScenario[] = [
      {
        id: 'finance-60',
        name: '60-Month Finance',
        vehiclePrice: vPrice,
        tradeValue: trade,
        cashDown: down,
        rebates: rebate,
        taxRate: parseFloat(taxRate),
        financeDetails: {
          amount: totalFinanced,
          rate: parseFloat(financeRate),
          term: fTerm60,
          payment: calcPayment(totalFinanced, fRate, fTerm60),
        },
        totalDealAmount: totalFinanced + down + trade,
      },
      {
        id: 'finance-72',
        name: '72-Month Finance',
        vehiclePrice: vPrice,
        tradeValue: trade,
        cashDown: down,
        rebates: rebate,
        taxRate: parseFloat(taxRate),
        financeDetails: {
          amount: totalFinanced,
          rate: parseFloat(financeRate),
          term: fTerm72,
          payment: calcPayment(totalFinanced, fRate, fTerm72),
        },
        totalDealAmount: totalFinanced + down + trade,
      },
      {
        id: 'finance-84',
        name: '84-Month Finance',
        vehiclePrice: vPrice,
        tradeValue: trade,
        cashDown: down,
        rebates: rebate,
        taxRate: parseFloat(taxRate),
        financeDetails: {
          amount: totalFinanced,
          rate: parseFloat(financeRate) + 0.5,
          term: fTerm84,
          payment: calcPayment(totalFinanced, (parseFloat(financeRate) + 0.5) / 100 / 12, fTerm84),
        },
        totalDealAmount: totalFinanced + down + trade,
      },
      {
        id: 'lease-36',
        name: '36-Month Lease',
        vehiclePrice: vPrice,
        tradeValue: trade,
        cashDown: down,
        rebates: rebate,
        taxRate: parseFloat(taxRate),
        leaseDetails: {
          amount: leaseAmount,
          rate: parseFloat(leaseRate),
          term: lTerm,
          payment: leasePayment,
          residual: residual,
          mileage: parseInt(leaseMileage),
        },
        totalDealAmount: leasePayment * lTerm + down + trade,
      },
    ];

    setScenarios(newScenarios);
    if (!selectedScenario) {
      setSelectedScenario(newScenarios[0].id);
    }
  };

  // Print deal worksheet
  const printWorksheet = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    const printContent = `
      <html>
        <head>
          <title>Deal Worksheet - AutolytiQ</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
            .section { margin: 20px 0; page-break-inside: avoid; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; padding: 3px 0; }
            .row:nth-child(even) { background-color: #f9f9f9; }
            .total-row { font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 15px; }
            .payment-box { border: 2px solid #2563eb; padding: 15px; margin: 15px 0; text-align: center; }
            .payment-amount { font-size: 24px; font-weight: bold; color: #2563eb; }
            .terms { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AiQ AutolytiQ</div>
            <h2>Deal Working Worksheet</h2>
            <p>Customer: ${customer?.firstName || 'Customer'} ${customer?.lastName || ''}</p>
            <p>Vehicle: ${vehicle?.year || '2024'} ${vehicle?.make || 'Vehicle'} ${vehicle?.model || ''}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Deal Scenario: ${scenario.name}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Vehicle Information</div>
            <div class="row"><span>MSRP/Asking Price:</span><span>$${scenario.vehiclePrice.toLocaleString()}</span></div>
            <div class="row"><span>Trade-In Value:</span><span>$${scenario.tradeValue.toLocaleString()}</span></div>
            <div class="row"><span>Cash Down Payment:</span><span>$${scenario.cashDown.toLocaleString()}</span></div>
            <div class="row"><span>Rebates/Incentives:</span><span>$${scenario.rebates.toLocaleString()}</span></div>
            <div class="row"><span>Tax Rate:</span><span>${scenario.taxRate}%</span></div>
          </div>

          ${scenario.financeDetails ? `
            <div class="section">
              <div class="section-title">Financing Details</div>
              <div class="row"><span>Amount Financed:</span><span>$${scenario.financeDetails.amount.toLocaleString()}</span></div>
              <div class="row"><span>Interest Rate (APR):</span><span>${scenario.financeDetails.rate}%</span></div>
              <div class="row"><span>Term:</span><span>${scenario.financeDetails.term} months</span></div>
              
              <div class="payment-box">
                <div>Monthly Payment</div>
                <div class="payment-amount">$${Math.round(scenario.financeDetails.payment).toLocaleString()}</div>
              </div>
            </div>
          ` : ''}

          ${scenario.leaseDetails ? `
            <div class="section">
              <div class="section-title">Lease Details</div>
              <div class="row"><span>Capitalized Cost:</span><span>$${scenario.vehiclePrice.toLocaleString()}</span></div>
              <div class="row"><span>Residual Value:</span><span>$${scenario.leaseDetails.residual.toLocaleString()}</span></div>
              <div class="row"><span>Money Factor:</span><span>${(scenario.leaseDetails.rate / 2400).toFixed(5)}</span></div>
              <div class="row"><span>Term:</span><span>${scenario.leaseDetails.term} months</span></div>
              <div class="row"><span>Annual Mileage:</span><span>${scenario.leaseDetails.mileage.toLocaleString()} miles</span></div>
              
              <div class="payment-box">
                <div>Monthly Lease Payment</div>
                <div class="payment-amount">$${Math.round(scenario.leaseDetails.payment).toLocaleString()}</div>
              </div>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Deal Summary</div>
            <div class="row total-row">
              <span>Total Deal Investment:</span>
              <span>$${scenario.totalDealAmount.toLocaleString()}</span>
            </div>
          </div>

          ${dealNotes ? `
            <div class="section">
              <div class="section-title">Deal Notes</div>
              <p>${dealNotes.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}

          <div class="terms">
            <p><strong>Terms and Conditions:</strong></p>
            <p>• Prices subject to change based on final credit approval and vehicle availability</p>
            <p>• Trade-in value subject to vehicle inspection and appraisal</p>
            <p>• All financing subject to credit approval through approved lenders</p>
            <p>• Additional fees may apply (documentation, registration, extended warranties)</p>
            <p>• This worksheet is for negotiation purposes and not a binding contract</p>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p>Customer Signature: ________________________</p>
                <p>Date: ________________________</p>
              </div>
              <div>
                <p>Sales Representative: ________________________</p>
                <p>Date: ________________________</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  // Save deal structure
  const saveDealStructure = async () => {
    if (!scenarios.length || !selectedScenario) return;
    
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    try {
      const dealData = {
        customerId: customer?.id,
        vehicleId: vehicle?.id,
        dealStructure: scenario,
        notes: dealNotes,
        status: 'structured',
      };

      if (dealId) {
        await apiRequest('PUT', `/api/deals/${dealId}`, dealData);
      } else {
        await apiRequest('POST', '/api/deals', dealData);
      }

      toast({
        title: "Deal Structure Saved",
        description: "Deal has been saved and can now proceed to finance",
      });

      navigate('/deals');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save deal structure",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Deal Desk</h1>
          <p className="text-gray-600">Structure deals and create negotiation scenarios</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={printWorksheet} variant="outline" disabled={!scenarios.length}>
            <Printer className="w-4 h-4 mr-2" />
            Print Worksheet
          </Button>
          <Button onClick={saveDealStructure} className="btn-aiq-primary" disabled={!scenarios.length}>
            <Save className="w-4 h-4 mr-2" />
            Save Structure
          </Button>
        </div>
      </div>

      {/* Customer & Vehicle Info */}
      {(customer || vehicle) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {customer.firstName} {customer.lastName}</div>
                  <div><strong>Email:</strong> {customer.email}</div>
                  <div><strong>Phone:</strong> {customer.phone}</div>
                  {customer.creditScore && (
                    <div><strong>Credit Score:</strong> {customer.creditScore}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {vehicle && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Vehicle:</strong> {vehicle.year} {vehicle.make} {vehicle.model}</div>
                  <div><strong>Price:</strong> ${vehicle.price.toLocaleString()}</div>
                  {vehicle.vin && <div><strong>VIN:</strong> {vehicle.vin}</div>}
                  {vehicle.mileage && <div><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()}</div>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Deal Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Compare Scenarios</TabsTrigger>
          <TabsTrigger value="notes">Deal Notes</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                    <Input
                      id="vehiclePrice"
                      type="number"
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(e.target.value)}
                      placeholder="Enter vehicle price"
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="8.25"
                  />
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
                    <Label htmlFor="financeTerm">Finance Term</Label>
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="leaseRate">Lease Rate (%)</Label>
                    <Input
                      id="leaseRate"
                      type="number"
                      step="0.1"
                      value={leaseRate}
                      onChange={(e) => setLeaseRate(e.target.value)}
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseTerm">Lease Term</Label>
                    <Select value={leaseTerm} onValueChange={setLeaseTerm}>
                      <SelectTrigger>
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
                  <div>
                    <Label htmlFor="residualPercent">Residual %</Label>
                    <Input
                      id="residualPercent"
                      type="number"
                      value={residualPercent}
                      onChange={(e) => setResidualPercent(e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>

                <Button onClick={calculateScenarios} className="w-full btn-aiq-primary">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate All Scenarios
                </Button>
              </CardContent>
            </Card>

            {/* Preview Results */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Results</CardTitle>
              </CardHeader>
              <CardContent>
                {scenarios.length > 0 ? (
                  <div className="space-y-4">
                    {scenarios.map((scenario) => (
                      <div 
                        key={scenario.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedScenario === scenario.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedScenario(scenario.id)}
                      >
                        <h4 className="font-medium">{scenario.name}</h4>
                        <div className="text-2xl font-bold text-blue-600">
                          ${scenario.financeDetails 
                            ? Math.round(scenario.financeDetails.payment).toLocaleString()
                            : scenario.leaseDetails 
                            ? Math.round(scenario.leaseDetails.payment).toLocaleString()
                            : 0
                          }/mo
                        </div>
                        <div className="text-sm text-gray-600">
                          {scenario.financeDetails && `${scenario.financeDetails.term} months @ ${scenario.financeDetails.rate}%`}
                          {scenario.leaseDetails && `${scenario.leaseDetails.term} month lease`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Enter deal details and calculate to see scenarios</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`cursor-pointer transition-colors ${
                  selectedScenario === scenario.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vehicle Price:</span>
                      <span>${scenario.vehiclePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trade Value:</span>
                      <span>${scenario.tradeValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash Down:</span>
                      <span>${scenario.cashDown.toLocaleString()}</span>
                    </div>
                    {scenario.financeDetails && (
                      <>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Monthly Payment:</span>
                            <span className="text-lg text-blue-600">
                              ${Math.round(scenario.financeDetails.payment).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {scenario.financeDetails.term} months @ {scenario.financeDetails.rate}%
                          </div>
                        </div>
                      </>
                    )}
                    {scenario.leaseDetails && (
                      <>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Lease Payment:</span>
                            <span className="text-lg text-green-600">
                              ${Math.round(scenario.leaseDetails.payment).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {scenario.leaseDetails.term} months • {scenario.leaseDetails.mileage.toLocaleString()} mi/yr
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Deal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this deal, customer preferences, special terms, or negotiation details..."
                value={dealNotes}
                onChange={(e) => setDealNotes(e.target.value)}
                className="min-h-32"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}