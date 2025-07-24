import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Car, DollarSign, Calculator, FileText, CreditCard, Users, TrendingUp } from "lucide-react";

interface DealData {
  dealNumber: string;
  customerId: string;
  vehicleId: string;
  salespersonId: string;
  status: 'active' | 'pending' | 'approved' | 'funded' | 'delivered';
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    trim: string;
    vin: string;
    stockNumber: string;
    cost: number;
    listPrice: number;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    creditScore: number;
    ssn: string;
    address: string;
  };
  pricing: {
    salePrice: number;
    tradeValue: number;
    cashDown: number;
    netTradePayoff: number;
    financeAmount: number;
    apr: number;
    termMonths: number;
    monthlyPayment: number;
  };
  fiProducts: {
    warranty: { selected: boolean; cost: number; markup: number; };
    gap: { selected: boolean; cost: number; markup: number; };
    maintenance: { selected: boolean; cost: number; markup: number; };
    lifeDisability: { selected: boolean; cost: number; markup: number; };
  };
  profitAnalysis: {
    frontEnd: number;
    backEnd: number;
    holdback: number;
    incentives: number;
    totalProfit: number;
    profitMargin: number;
  };
}

interface ProductionDealDeskProps {
  dealId?: string;
  onDealSave?: (dealData: DealData) => void;
  onDealSubmit?: (dealData: DealData) => void;
}

export default function ProductionDealDesk({ dealId, onDealSave, onDealSubmit }: ProductionDealDeskProps) {
  const [activeTab, setActiveTab] = useState("customer");
  const [dealData, setDealData] = useState<DealData>({
    dealNumber: `D-${Date.now()}`,
    customerId: "",
    vehicleId: "",
    salespersonId: "",
    status: "active",
    vehicleInfo: {
      year: 2024,
      make: "Toyota",
      model: "Camry",
      trim: "XLE",
      vin: "4T1K61AK5PU123456",
      stockNumber: "T24-8947",
      cost: 24500,
      listPrice: 32900
    },
    customerInfo: {
      firstName: "Michael",
      lastName: "Rodriguez",
      email: "michael.rodriguez@email.com",
      phone: "(555) 123-4567",
      creditScore: 750,
      ssn: "***-**-****",
      address: "123 Main St, Austin, TX 78701"
    },
    pricing: {
      salePrice: 32900,
      tradeValue: 8500,
      cashDown: 3000,
      netTradePayoff: 6200,
      financeAmount: 27600,
      apr: 4.29,
      termMonths: 72,
      monthlyPayment: 445.67
    },
    fiProducts: {
      warranty: { selected: true, cost: 1850, markup: 750 },
      gap: { selected: true, cost: 695, markup: 295 },
      maintenance: { selected: false, cost: 1200, markup: 450 },
      lifeDisability: { selected: true, cost: 890, markup: 380 }
    },
    profitAnalysis: {
      frontEnd: 8400,
      backEnd: 1425,
      holdback: 650,
      incentives: 1000,
      totalProfit: 11475,
      profitMargin: 25.8
    }
  });

  // Auto-calculate payments when pricing changes
  useEffect(() => {
    calculatePayment();
  }, [dealData.pricing.financeAmount, dealData.pricing.apr, dealData.pricing.termMonths]);

  // Auto-calculate profit when data changes
  useEffect(() => {
    calculateProfit();
  }, [dealData.pricing, dealData.fiProducts, dealData.vehicleInfo]);

  const calculatePayment = () => {
    const { financeAmount, apr, termMonths } = dealData.pricing;
    if (financeAmount > 0 && apr > 0 && termMonths > 0) {
      const monthlyRate = apr / 100 / 12;
      const payment = (financeAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                     (Math.pow(1 + monthlyRate, termMonths) - 1);
      
      setDealData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          monthlyPayment: Math.round(payment * 100) / 100
        }
      }));
    }
  };

  const calculateProfit = () => {
    const frontEnd = dealData.pricing.salePrice - dealData.vehicleInfo.cost;
    const backEnd = Object.values(dealData.fiProducts)
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.markup, 0);
    const totalProfit = frontEnd + backEnd + dealData.profitAnalysis.holdback + dealData.profitAnalysis.incentives;
    const profitMargin = ((totalProfit / dealData.pricing.salePrice) * 100);

    setDealData(prev => ({
      ...prev,
      profitAnalysis: {
        ...prev.profitAnalysis,
        frontEnd,
        backEnd,
        totalProfit,
        profitMargin: Math.round(profitMargin * 100) / 100
      }
    }));
  };

  const updatePricing = (field: keyof typeof dealData.pricing, value: number) => {
    setDealData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const updateFiProduct = (product: keyof typeof dealData.fiProducts, field: 'selected' | 'cost' | 'markup', value: boolean | number) => {
    setDealData(prev => ({
      ...prev,
      fiProducts: {
        ...prev.fiProducts,
        [product]: {
          ...prev.fiProducts[product],
          [field]: value
        }
      }
    }));
  };

  const handleSaveDeal = () => {
    onDealSave?.(dealData);
  };

  const handleSubmitDeal = () => {
    onDealSubmit?.(dealData);
  };

  return (
    <div className="p-3 md:p-6 space-y-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Deal Desk</h2>
          <p className="text-sm text-muted-foreground">
            Deal #{dealData.dealNumber} - {dealData.vehicleInfo.year} {dealData.vehicleInfo.make} {dealData.vehicleInfo.model}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDeal} size="sm">
            Save Draft
          </Button>
          <Button onClick={handleSubmitDeal} size="sm">
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">${dealData.profitAnalysis.totalProfit.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Profit</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">${dealData.pricing.monthlyPayment}</div>
              <div className="text-xs text-muted-foreground">Monthly Payment</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{dealData.pricing.apr}%</div>
              <div className="text-xs text-muted-foreground">APR</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{dealData.pricing.termMonths}</div>
              <div className="text-xs text-muted-foreground">Months</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{dealData.profitAnalysis.profitMargin}%</div>
              <div className="text-xs text-muted-foreground">Margin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-5 w-full min-w-[500px] bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="customer" className="text-xs md:text-sm">Customer</TabsTrigger>
            <TabsTrigger value="vehicle" className="text-xs md:text-sm">Vehicle</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs md:text-sm">Pricing</TabsTrigger>
            <TabsTrigger value="finance" className="text-xs md:text-sm">F&I</TabsTrigger>
            <TabsTrigger value="summary" className="text-xs md:text-sm">Summary</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={dealData.customerInfo.firstName}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, firstName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={dealData.customerInfo.lastName}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, lastName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={dealData.customerInfo.email}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, email: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={dealData.customerInfo.phone}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={dealData.customerInfo.address}
                  onChange={(e) => setDealData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, address: e.target.value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditScore">Credit Score</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    value={dealData.customerInfo.creditScore}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, creditScore: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN</Label>
                  <Input
                    id="ssn"
                    value={dealData.customerInfo.ssn}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, ssn: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={dealData.vehicleInfo.year}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      vehicleInfo: { ...prev.vehicleInfo, year: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Select value={dealData.vehicleInfo.make} onValueChange={(value) => 
                    setDealData(prev => ({ ...prev, vehicleInfo: { ...prev.vehicleInfo, make: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Toyota">Toyota</SelectItem>
                      <SelectItem value="Honda">Honda</SelectItem>
                      <SelectItem value="Ford">Ford</SelectItem>
                      <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                      <SelectItem value="Nissan">Nissan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={dealData.vehicleInfo.model}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      vehicleInfo: { ...prev.vehicleInfo, model: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    value={dealData.vehicleInfo.vin}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      vehicleInfo: { ...prev.vehicleInfo, vin: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockNumber">Stock Number</Label>
                  <Input
                    id="stockNumber"
                    value={dealData.vehicleInfo.stockNumber}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      vehicleInfo: { ...prev.vehicleInfo, stockNumber: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={dealData.vehicleInfo.cost}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      vehicleInfo: { ...prev.vehicleInfo, cost: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listPrice">List Price</Label>
                  <Input
                    id="listPrice"
                    type="number"
                    value={dealData.vehicleInfo.listPrice}
                    onChange={(e) => setDealData(prev => ({
                      ...prev,
                      vehicleInfo: { ...prev.vehicleInfo, listPrice: Number(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Deal Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={dealData.pricing.salePrice}
                    onChange={(e) => updatePricing('salePrice', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeValue">Trade Value</Label>
                  <Input
                    id="tradeValue"
                    type="number"
                    value={dealData.pricing.tradeValue}
                    onChange={(e) => updatePricing('tradeValue', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashDown">Cash Down</Label>
                  <Input
                    id="cashDown"
                    type="number"
                    value={dealData.pricing.cashDown}
                    onChange={(e) => updatePricing('cashDown', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netTradePayoff">Net Trade Payoff</Label>
                  <Input
                    id="netTradePayoff"
                    type="number"
                    value={dealData.pricing.netTradePayoff}
                    onChange={(e) => updatePricing('netTradePayoff', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financeAmount">Finance Amount</Label>
                  <Input
                    id="financeAmount"
                    type="number"
                    value={dealData.pricing.financeAmount}
                    onChange={(e) => updatePricing('financeAmount', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apr">APR (%)</Label>
                  <Input
                    id="apr"
                    type="number"
                    step="0.01"
                    value={dealData.pricing.apr}
                    onChange={(e) => updatePricing('apr', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termMonths">Term (Months)</Label>
                  <Select value={dealData.pricing.termMonths.toString()} onValueChange={(value) => 
                    updatePricing('termMonths', Number(value))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="36">36</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="72">72</SelectItem>
                      <SelectItem value="84">84</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Payment</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-xl font-bold">${dealData.pricing.monthlyPayment}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Finance & Insurance Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(dealData.fiProducts).map(([key, product]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={product.selected}
                        onChange={(e) => updateFiProduct(key as keyof typeof dealData.fiProducts, 'selected', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label className="text-sm font-medium capitalize">
                        {key === 'lifeDisability' ? 'Life & Disability' : key}
                      </Label>
                    </div>
                    <Badge variant={product.selected ? "default" : "secondary"}>
                      {product.selected ? "Included" : "Available"}
                    </Badge>
                  </div>
                  {product.selected && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Cost</Label>
                        <Input
                          type="number"
                          value={product.cost}
                          onChange={(e) => updateFiProduct(key as keyof typeof dealData.fiProducts, 'cost', Number(e.target.value))}
                          className="h-8"
                          size="sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Markup</Label>
                        <Input
                          type="number"
                          value={product.markup}
                          onChange={(e) => updateFiProduct(key as keyof typeof dealData.fiProducts, 'markup', Number(e.target.value))}
                          className="h-8"
                          size="sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Front End Profit:</span>
                    <span className="font-medium text-green-600">${dealData.profitAnalysis.frontEnd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Back End Profit:</span>
                    <span className="font-medium text-blue-600">${dealData.profitAnalysis.backEnd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Holdback:</span>
                    <span className="font-medium">${dealData.profitAnalysis.holdback.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Incentives:</span>
                    <span className="font-medium">${dealData.profitAnalysis.incentives.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total Profit:</span>
                    <span className="text-lg font-bold text-green-600">${dealData.profitAnalysis.totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Profit Margin:</span>
                    <span className="text-lg font-bold">{dealData.profitAnalysis.profitMargin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Customer:</div>
                  <div className="text-sm text-muted-foreground">
                    {dealData.customerInfo.firstName} {dealData.customerInfo.lastName}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Vehicle:</div>
                  <div className="text-sm text-muted-foreground">
                    {dealData.vehicleInfo.year} {dealData.vehicleInfo.make} {dealData.vehicleInfo.model} {dealData.vehicleInfo.trim}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Payment:</div>
                  <div className="text-sm text-muted-foreground">
                    ${dealData.pricing.monthlyPayment}/mo for {dealData.pricing.termMonths} months at {dealData.pricing.apr}% APR
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">F&I Products:</div>
                  <div className="text-sm text-muted-foreground">
                    {Object.entries(dealData.fiProducts)
                      .filter(([, product]) => product.selected)
                      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                      .join(', ') || 'None selected'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deal Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1">
                  Print Deal Summary
                </Button>
                <Button variant="outline" className="flex-1">
                  Send to F&I Manager
                </Button>
                <Button variant="outline" className="flex-1">
                  Generate Contracts
                </Button>
                <Button className="flex-1">
                  Submit for Funding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}