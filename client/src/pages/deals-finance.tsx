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
  Save
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

export default function DealsFinance() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const dealId = urlParams.get('dealId');

  const [activeTab, setActiveTab] = useState('structure');
  
  // Finance structure
  const [finalSalePrice, setFinalSalePrice] = useState('');
  const [finalTradeValue, setFinalTradeValue] = useState('');
  const [finalCashDown, setFinalCashDown] = useState('');
  const [finalRebates, setFinalRebates] = useState('');
  const [customerCreditScore, setCustomerCreditScore] = useState('');
  
  // Finance products
  const [financeProducts, setFinanceProducts] = useState<FinanceProduct[]>([
    {
      id: 'ext-warranty',
      name: 'Extended Warranty',
      type: 'warranty',
      cost: 2400,
      monthlyPayment: 40,
      description: '5 year/75,000 mile comprehensive coverage',
      selected: false,
    },
    {
      id: 'gap-insurance',
      name: 'GAP Insurance',
      type: 'gap',
      cost: 895,
      monthlyPayment: 15,
      description: 'Guaranteed Auto Protection coverage',
      selected: false,
    },
    {
      id: 'maintenance-plan',
      name: 'Maintenance Plan',
      type: 'maintenance',
      cost: 1800,
      monthlyPayment: 30,
      description: '3 year/45,000 mile maintenance package',
      selected: false,
    },
    {
      id: 'tire-wheel',
      name: 'Tire & Wheel Protection',
      type: 'warranty',
      cost: 1200,
      monthlyPayment: 20,
      description: 'Road hazard and cosmetic damage coverage',
      selected: false,
    },
  ]);

  // Lenders
  const [lenders] = useState<Lender[]>([
    {
      id: 'chase-auto',
      name: 'Chase Auto Finance',
      type: 'bank',
      rates: { excellent: 4.9, good: 6.2, fair: 8.9, poor: 12.5 },
      maxTerm: 72,
      maxLtv: 110,
    },
    {
      id: 'toyota-financial',
      name: 'Toyota Financial Services',
      type: 'captive',
      rates: { excellent: 3.9, good: 5.5, fair: 7.8, poor: 10.9 },
      maxTerm: 84,
      maxLtv: 120,
    },
    {
      id: 'credit-union',
      name: 'Local Credit Union',
      type: 'credit_union',
      rates: { excellent: 4.2, good: 5.8, fair: 8.2, poor: 11.8 },
      maxTerm: 75,
      maxLtv: 105,
    },
    {
      id: 'santander',
      name: 'Santander Consumer',
      type: 'subprime',
      rates: { excellent: 6.9, good: 9.2, fair: 13.5, poor: 18.9 },
      maxTerm: 84,
      maxLtv: 130,
    },
  ]);

  const [selectedLender, setSelectedLender] = useState('');
  const [finalRate, setFinalRate] = useState('');
  const [finalTerm, setFinalTerm] = useState('60');
  const [finalPayment, setFinalPayment] = useState('');

  // Fetch deal data
  const { data: deal } = useQuery({
    queryKey: ['/api/deals', dealId],
    enabled: !!dealId,
  });

  // Initialize from deal data
  useEffect(() => {
    if (deal && deal.dealStructure) {
      const structure = deal.dealStructure;
      setFinalSalePrice(structure.vehiclePrice?.toString() || '');
      setFinalTradeValue(structure.tradeValue?.toString() || '');
      setFinalCashDown(structure.cashDown?.toString() || '');
      setFinalRebates(structure.rebates?.toString() || '');
      
      if (structure.financeDetails) {
        setFinalRate(structure.financeDetails.rate?.toString() || '');
        setFinalTerm(structure.financeDetails.term?.toString() || '60');
      }
    }
  }, [deal]);

  const getCreditTier = (score: number) => {
    if (score >= 750) return 'excellent';
    if (score >= 680) return 'good';
    if (score >= 620) return 'fair';
    return 'poor';
  };

  const calculateFinancedAmount = () => {
    const salePrice = parseFloat(finalSalePrice) || 0;
    const tradeValue = parseFloat(finalTradeValue) || 0;
    const cashDown = parseFloat(finalCashDown) || 0;
    const rebates = parseFloat(finalRebates) || 0;
    const productsTotal = financeProducts.filter(p => p.selected).reduce((sum, p) => sum + p.cost, 0);
    const taxAmount = (salePrice - tradeValue - cashDown - rebates) * 0.0825; // 8.25% tax rate
    
    return salePrice - tradeValue - cashDown - rebates + productsTotal + taxAmount;
  };

  const calculatePayment = (principal: number, rate: number, term: number) => {
    if (rate === 0) return principal / term;
    const monthlyRate = rate / 100 / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  };

  const handleProductSelection = (productId: string, selected: boolean) => {
    setFinanceProducts(products =>
      products.map(p => p.id === productId ? { ...p, selected } : p)
    );
  };

  const getLenderRate = (lender: Lender, creditScore: number) => {
    const tier = getCreditTier(creditScore);
    return lender.rates[tier];
  };

  const submitForApproval = async (lenderId: string) => {
    const creditScore = parseFloat(customerCreditScore);
    const lender = lenders.find(l => l.id === lenderId);
    if (!lender || !creditScore) return;

    const rate = getLenderRate(lender, creditScore);
    const financedAmount = calculateFinancedAmount();
    const payment = calculatePayment(financedAmount, rate, parseInt(finalTerm));

    // Simulate approval process
    const approved = Math.random() > 0.3; // 70% approval rate
    
    if (approved) {
      setSelectedLender(lenderId);
      setFinalRate(rate.toString());
      setFinalPayment(Math.round(payment).toString());
      
      toast({
        title: "Approval Received",
        description: `${lender.name} approved at ${rate}% for ${finalTerm} months`,
      });
    } else {
      toast({
        title: "Application Declined",
        description: `${lender.name} declined the application`,
        variant: "destructive",
      });
    }
  };

  const finalizeContract = async () => {
    if (!selectedLender || !finalPayment) {
      toast({
        title: "Incomplete Information",
        description: "Please complete financing approval before finalizing",
        variant: "destructive",
      });
      return;
    }

    try {
      const contractData = {
        dealId,
        finalStructure: {
          salePrice: parseFloat(finalSalePrice),
          tradeValue: parseFloat(finalTradeValue),
          cashDown: parseFloat(finalCashDown),
          rebates: parseFloat(finalRebates),
          financeProducts: financeProducts.filter(p => p.selected),
          lender: lenders.find(l => l.id === selectedLender),
          rate: parseFloat(finalRate),
          term: parseInt(finalTerm),
          payment: parseFloat(finalPayment),
          financedAmount: calculateFinancedAmount(),
        },
        status: 'pending_contract',
      };

      await apiRequest('PUT', `/api/deals/${dealId}/finalize`, contractData);
      
      toast({
        title: "Deal Finalized",
        description: "Deal is ready for contract signatures",
      });

      navigate(`/deals/${dealId}/contract`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finalize deal structure",
        variant: "destructive",
      });
    }
  };

  const printFinanceWorksheet = () => {
    const selectedProducts = financeProducts.filter(p => p.selected);
    const lender = lenders.find(l => l.id === selectedLender);
    
    const printContent = `
      <html>
        <head>
          <title>Finance Worksheet - AutolytiQ</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin: 20px 0; page-break-inside: avoid; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
            .products { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AutolytiQ Finance & Insurance Worksheet</h1>
            <p>Deal ID: ${dealId}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Final Deal Structure</h2>
            <div class="row"><span>Sale Price:</span><span>$${parseFloat(finalSalePrice || '0').toLocaleString()}</span></div>
            <div class="row"><span>Trade Value:</span><span>$${parseFloat(finalTradeValue || '0').toLocaleString()}</span></div>
            <div class="row"><span>Cash Down:</span><span>$${parseFloat(finalCashDown || '0').toLocaleString()}</span></div>
            <div class="row"><span>Rebates:</span><span>$${parseFloat(finalRebates || '0').toLocaleString()}</span></div>
          </div>

          ${selectedProducts.length > 0 ? `
            <div class="products">
              <h3>Finance & Insurance Products</h3>
              ${selectedProducts.map(product => `
                <div class="row">
                  <span>${product.name}:</span>
                  <span>$${product.cost.toLocaleString()} ($${product.monthlyPayment}/mo)</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${lender ? `
            <div class="section">
              <h2>Financing Details</h2>
              <div class="row"><span>Lender:</span><span>${lender.name}</span></div>
              <div class="row"><span>APR:</span><span>${finalRate}%</span></div>
              <div class="row"><span>Term:</span><span>${finalTerm} months</span></div>
              <div class="row"><span>Amount Financed:</span><span>$${calculateFinancedAmount().toLocaleString()}</span></div>
              <div class="row total"><span>Monthly Payment:</span><span>$${finalPayment}</span></div>
            </div>
          ` : ''}
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Finance Suite</h1>
          <p className="text-gray-600">Finalize deal structure and complete financing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={printFinanceWorksheet} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print F&I Menu
          </Button>
          <Button onClick={finalizeContract} className="btn-aiq-primary">
            <FileSignature className="w-4 h-4 mr-2" />
            Finalize Contract
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="structure">Final Structure</TabsTrigger>
          <TabsTrigger value="products">F&I Products</TabsTrigger>
          <TabsTrigger value="lenders">Lender Approval</TabsTrigger>
          <TabsTrigger value="summary">Final Summary</TabsTrigger>
        </TabsList>

        {/* Final Structure Tab */}
        <TabsContent value="structure">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Final Deal Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="finalSalePrice">Final Sale Price</Label>
                    <Input
                      id="finalSalePrice"
                      type="number"
                      value={finalSalePrice}
                      onChange={(e) => setFinalSalePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalTradeValue">Trade Value</Label>
                    <Input
                      id="finalTradeValue"
                      type="number"
                      value={finalTradeValue}
                      onChange={(e) => setFinalTradeValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="finalCashDown">Cash Down</Label>
                    <Input
                      id="finalCashDown"
                      type="number"
                      value={finalCashDown}
                      onChange={(e) => setFinalCashDown(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalRebates">Rebates</Label>
                    <Input
                      id="finalRebates"
                      type="number"
                      value={finalRebates}
                      onChange={(e) => setFinalRebates(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerCreditScore">Customer Credit Score</Label>
                  <Input
                    id="customerCreditScore"
                    type="number"
                    value={customerCreditScore}
                    onChange={(e) => setCustomerCreditScore(e.target.value)}
                    placeholder="Enter credit score for rate calculation"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sale Price:</span>
                    <span>${(parseFloat(finalSalePrice) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Less Trade:</span>
                    <span>-${(parseFloat(finalTradeValue) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Less Cash Down:</span>
                    <span>-${(parseFloat(finalCashDown) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Less Rebates:</span>
                    <span>-${(parseFloat(finalRebates) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>F&I Products:</span>
                    <span>+${financeProducts.filter(p => p.selected).reduce((sum, p) => sum + p.cost, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax & Fees:</span>
                    <span>+${Math.round((parseFloat(finalSalePrice) || 0) * 0.0825).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Amount to Finance:</span>
                      <span>${calculateFinancedAmount().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* F&I Products Tab */}
        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {financeProducts.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Checkbox
                      checked={product.selected}
                      onCheckedChange={(checked) => handleProductSelection(product.id, !!checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="text-2xl font-bold text-green-600">
                      ${product.cost.toLocaleString()}
                    </div>
                    {product.monthlyPayment && (
                      <div className="text-sm text-gray-600">
                        +${product.monthlyPayment}/month
                      </div>
                    )}
                    <Badge variant={product.selected ? "default" : "secondary"}>
                      {product.selected ? "Selected" : "Available"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>F&I Menu Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span>Total F&I Products:</span>
                <span className="text-xl font-bold">
                  ${financeProducts.filter(p => p.selected).reduce((sum, p) => sum + p.cost, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Additional Monthly Payment:</span>
                <span className="text-lg font-medium">
                  +${financeProducts.filter(p => p.selected).reduce((sum, p) => sum + (p.monthlyPayment || 0), 0)}/month
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lenders Tab */}
        <TabsContent value="lenders">
          <div className="space-y-4">
            {lenders.map((lender) => {
              const creditScore = parseFloat(customerCreditScore);
              const rate = creditScore ? getLenderRate(lender, creditScore) : null;
              const financedAmount = calculateFinancedAmount();
              const payment = rate ? calculatePayment(financedAmount, rate, parseInt(finalTerm)) : null;
              
              return (
                <Card key={lender.id} className={selectedLender === lender.id ? 'border-green-500 bg-green-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="w-5 h-5 text-gray-600" />
                          <h3 className="text-lg font-semibold">{lender.name}</h3>
                          <Badge variant="outline">{lender.type.replace('_', ' ')}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Max Term:</span>
                            <div className="font-medium">{lender.maxTerm} months</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Max LTV:</span>
                            <div className="font-medium">{lender.maxLtv}%</div>
                          </div>
                          {rate && (
                            <>
                              <div>
                                <span className="text-gray-600">Your Rate:</span>
                                <div className="font-medium text-blue-600">{rate}%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Est. Payment:</span>
                                <div className="font-medium text-green-600">
                                  ${payment ? Math.round(payment).toLocaleString() : 0}/mo
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {selectedLender === lender.id ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Button 
                            onClick={() => submitForApproval(lender.id)}
                            disabled={!customerCreditScore}
                            variant="outline"
                          >
                            Submit Application
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {!customerCreditScore && (
            <Card>
              <CardContent className="p-6 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Credit Score Required</h3>
                <p className="text-gray-600">Enter customer credit score in Final Structure to see rates and submit applications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Contract Ready for Signature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Deal Structure</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sale Price:</span>
                        <span>${(parseFloat(finalSalePrice) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trade Value:</span>
                        <span>${(parseFloat(finalTradeValue) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash Down:</span>
                        <span>${(parseFloat(finalCashDown) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F&I Products:</span>
                        <span>${financeProducts.filter(p => p.selected).reduce((sum, p) => sum + p.cost, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedLender && (
                    <div>
                      <h4 className="font-semibold mb-3">Financing Terms</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Lender:</span>
                          <span>{lenders.find(l => l.id === selectedLender)?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>APR:</span>
                          <span>{finalRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Term:</span>
                          <span>{finalTerm} months</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Monthly Payment:</span>
                          <span className="text-green-600">${finalPayment}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {financeProducts.some(p => p.selected) && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Selected F&I Products</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {financeProducts.filter(p => p.selected).map(product => (
                        <div key={product.id} className="flex justify-between text-sm">
                          <span>{product.name}:</span>
                          <span>${product.cost.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}