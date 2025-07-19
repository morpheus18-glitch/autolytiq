import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Building2, 
  Car,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Settings
} from 'lucide-react';

interface WorkADealProps {
  selectedVehicle?: any;
  selectedCustomer?: any;
  onDealUpdate?: (dealData: any) => void;
}

interface LenderOption {
  id: string;
  name: string;
  minCreditScore: number;
  maxLTV: number;
  rates: {
    excellent: number; // 740+
    good: number;      // 680-739
    fair: number;      // 620-679
    poor: number;      // <620
  };
}

const PRESELECTED_LENDERS: LenderOption[] = [
  {
    id: 'chase',
    name: 'Chase Auto Finance',
    minCreditScore: 620,
    maxLTV: 120,
    rates: { excellent: 4.99, good: 6.49, fair: 9.99, poor: 14.99 }
  },
  {
    id: 'wells_fargo',
    name: 'Wells Fargo Auto',
    minCreditScore: 640,
    maxLTV: 110,
    rates: { excellent: 5.29, good: 6.79, fair: 10.49, poor: 15.49 }
  },
  {
    id: 'capital_one',
    name: 'Capital One Auto Finance',
    minCreditScore: 580,
    maxLTV: 130,
    rates: { excellent: 5.49, good: 7.99, fair: 12.99, poor: 18.99 }
  },
  {
    id: 'santander',
    name: 'Santander Consumer USA',
    minCreditScore: 550,
    maxLTV: 140,
    rates: { excellent: 6.99, good: 9.99, fair: 15.99, poor: 21.99 }
  },
  {
    id: 'ally',
    name: 'Ally Financial',
    minCreditScore: 660,
    maxLTV: 115,
    rates: { excellent: 4.79, good: 6.29, fair: 9.79, poor: 14.49 }
  },
  {
    id: 'td_auto',
    name: 'TD Auto Finance',
    minCreditScore: 650,
    maxLTV: 120,
    rates: { excellent: 5.19, good: 6.69, fair: 10.19, poor: 15.19 }
  }
];

export default function WorkADeal({ selectedVehicle, selectedCustomer, onDealUpdate }: WorkADealProps) {
  const [dealType, setDealType] = useState<'cash' | 'finance' | 'lease'>('finance');
  const [selectedLender, setSelectedLender] = useState<string>('');
  const [taxOverride, setTaxOverride] = useState(false);
  const [titleFeeOverride, setTitleFeeOverride] = useState(false);
  
  const form = useForm({
    defaultValues: {
      // Vehicle Information
      dealNumber: '',
      contractDate: new Date().toISOString().split('T')[0],
      finInst: '',
      stockNumber: selectedVehicle?.uuid || '',
      msrp: selectedVehicle?.price || 0,
      balloonAmount: 0,
      mileagePenalty: 0,
      cashPrice: selectedVehicle?.price || 0,
      dealerCash: 0,
      rebate: 1000,
      cashDown: 17500,
      totalTrade: 0,
      totalDown: 18500,
      aftermarketProducts: 625,
      totalFees: 292.80,
      prepaidFee: 0,
      vslFee: 0,

      // Service Contract
      serviceContract: '',
      totalInsurances: 0,
      totalTaxAmount: 1851.78,
      term: 48,
      apr: 5.50,
      daysTo1stPayment: 45,
      firstPaymentDate: '08/30/25',
      payment: 244.05,

      // Calculated Fields
      saleSubtotal: 7703.00,
      totalFinanced: 10472.58,
      financeCharge: 1241.82,
      totalOfPayments: 11714.40,
      deferredPrice: 30214.40,
      unpaidBalance: 10472.58,

      // Tax and Fees
      salesTax: 0,
      titleFee: 0,
      docFee: 599,
      registrationFee: 85,
    }
  });

  // Tax rates by zip code prefix
  const TAX_RATES: { [key: string]: number } = {
    // California
    '90': 0.0825, '91': 0.0825, '92': 0.0825, '93': 0.0825, '94': 0.0825, '95': 0.0825,
    // Texas  
    '75': 0.0825, '76': 0.0825, '77': 0.0825, '78': 0.0825, '79': 0.0825,
    // Florida
    '32': 0.06, '33': 0.06, '34': 0.06,
    // New York
    '10': 0.08, '11': 0.08, '12': 0.08, '13': 0.08, '14': 0.08,
    // Illinois
    '60': 0.0625, '61': 0.0625, '62': 0.0625,
    // Default
    'default': 0.07
  };

  // Title fees by zip code prefix  
  const TITLE_FEES: { [key: string]: number } = {
    // California
    '90': 23, '91': 23, '92': 23, '93': 23, '94': 23, '95': 23,
    // Texas
    '75': 33, '76': 33, '77': 33, '78': 33, '79': 33,
    // Florida  
    '32': 77.25, '33': 77.25, '34': 77.25,
    // New York
    '10': 50, '11': 50, '12': 50, '13': 50, '14': 50,
    // Illinois
    '60': 155, '61': 155, '62': 155,
    // Default
    'default': 75
  };

  // Calculate tax and fees based on customer zip code
  useEffect(() => {
    if (selectedCustomer?.zipCode && selectedVehicle?.price) {
      const zipPrefix = selectedCustomer.zipCode.substring(0, 2);
      const taxRate = TAX_RATES[zipPrefix] || TAX_RATES['default'];
      const titleFee = TITLE_FEES[zipPrefix] || TITLE_FEES['default'];
      
      if (!taxOverride) {
        const calculatedTax = selectedVehicle.price * taxRate;
        form.setValue('salesTax', Math.round(calculatedTax * 100) / 100);
        form.setValue('totalTaxAmount', Math.round(calculatedTax * 100) / 100);
      }
      
      if (!titleFeeOverride) {
        form.setValue('titleFee', titleFee);
      }
    }
  }, [selectedCustomer, selectedVehicle, taxOverride, titleFeeOverride, form]);

  // Auto-populate vehicle data
  useEffect(() => {
    if (selectedVehicle) {
      form.setValue('stockNumber', selectedVehicle.uuid || '');
      form.setValue('msrp', selectedVehicle.price || 0);
      form.setValue('cashPrice', selectedVehicle.price || 0);
    }
  }, [selectedVehicle, form]);

  const getCreditTier = (creditScore: number) => {
    if (creditScore >= 740) return 'excellent';
    if (creditScore >= 680) return 'good';
    if (creditScore >= 620) return 'fair';
    return 'poor';
  };

  const calculatePayment = () => {
    const principal = form.watch('totalFinanced') || 0;
    const rate = (form.watch('apr') || 0) / 100 / 12;
    const term = form.watch('term') || 60;
    
    if (rate === 0) return principal / term;
    
    const payment = principal * (rate * Math.pow(1 + rate, term)) / 
                   (Math.pow(1 + rate, term) - 1);
    
    return Math.round(payment * 100) / 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleLenderChange = (lenderId: string) => {
    setSelectedLender(lenderId);
    const lender = PRESELECTED_LENDERS.find(l => l.id === lenderId);
    if (lender && selectedCustomer?.creditScore) {
      const tier = getCreditTier(selectedCustomer.creditScore);
      form.setValue('apr', lender.rates[tier]);
      form.setValue('finInst', lender.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deal Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Purchase Information Screen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={dealType} onValueChange={(value) => setDealType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cash" className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Finance
              </TabsTrigger>
              <TabsTrigger value="lease" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Lease
              </TabsTrigger>
            </TabsList>

            {/* Cash Deal */}
            <TabsContent value="cash" className="space-y-4 mt-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cash Price:</Label>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(form.watch('cashPrice') || 0)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Sales Tax:</Label>
                    <div className="text-xl font-semibold">
                      {formatCurrency(form.watch('salesTax') || 0)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Title Fee:</Label>
                    <div className="text-xl font-semibold">
                      {formatCurrency(form.watch('titleFee') || 0)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Due:</Label>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency((form.watch('cashPrice') || 0) + (form.watch('salesTax') || 0) + (form.watch('titleFee') || 0))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Finance Deal */}
            <TabsContent value="finance" className="space-y-6 mt-6">
              {/* Main Deal Information Grid - Styled like your image */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">1. Deal Number:</Label>
                      <Input {...form.register('dealNumber')} placeholder="56564" />
                    </div>
                    <div>
                      <Label className="text-sm">16. Service Contract:</Label>
                      <Input {...form.register('serviceContract')} placeholder="" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">2. Contract Date:</Label>
                      <Input type="date" {...form.register('contractDate')} />
                    </div>
                    <div>
                      <Label className="text-sm">17. Tot Insurances 1-3:</Label>
                      <Input type="number" {...form.register('totalInsurances')} placeholder="0" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">3. Fin Inst:</Label>
                      <Select value={selectedLender} onValueChange={handleLenderChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Lender" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESELECTED_LENDERS.map((lender) => (
                            <SelectItem key={lender.id} value={lender.id}>
                              {lender.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        18. Total Tax Amount:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={taxOverride} 
                            onCheckedChange={setTaxOverride}
                          />
                          <Settings className="h-3 w-3" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        {...form.register('totalTaxAmount')} 
                        placeholder="1,851.78"
                        disabled={!taxOverride}
                        className={taxOverride ? "bg-yellow-50" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">4. Stock Number:</Label>
                      <Input {...form.register('stockNumber')} placeholder="KDT5802" readOnly />
                    </div>
                    <div>
                      <Label className="text-sm">19. Term:</Label>
                      <Select value={String(form.watch('term'))} onValueChange={(value) => form.setValue('term', parseInt(value))}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">5. M.S.R.P.:</Label>
                      <Input 
                        type="number" 
                        {...form.register('msrp')} 
                        placeholder="27,265.00"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-sm">20. APR:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('apr')} 
                        placeholder="5.50%"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">6. Balloon Rt/Amt:</Label>
                      <Input type="number" {...form.register('balloonAmount')} placeholder=".00" />
                    </div>
                    <div>
                      <Label className="text-sm">21. Days to 1st Payment:</Label>
                      <Input type="number" {...form.register('daysTo1stPayment')} placeholder="45" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">7. Mileage Penalty:</Label>
                      <Input type="number" {...form.register('mileagePenalty')} placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-sm">22. 1st Payment Date:</Label>
                      <Input {...form.register('firstPaymentDate')} placeholder="08/30/25" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">8. Cash Price:</Label>
                      <Input 
                        type="number" 
                        {...form.register('cashPrice')} 
                        placeholder="26,203.00"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">23. Payment:</Label>
                      <Input 
                        type="number" 
                        {...form.register('payment')} 
                        placeholder="244.05"
                        value={calculatePayment()}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">9. Dealer Cash:</Label>
                      <Input type="number" {...form.register('dealerCash')} placeholder="0" />
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <Label className="text-sm font-medium">Command Window</Label>
                      <div className="mt-2 text-xs text-gray-600">Command:</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">10. Rebate:</Label>
                      <Input type="number" {...form.register('rebate')} placeholder="1,000.00" />
                    </div>
                  </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-4">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Sale Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('saleSubtotal') || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Financed:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('totalFinanced') || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Finance Charge:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('financeCharge') || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total of Payments:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('totalOfPayments') || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Deferred Price:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('deferredPrice') || 0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm">Unpaid Balance:</span>
                        <span className="font-bold text-lg">{formatCurrency(form.watch('unpaidBalance') || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lender Information */}
                  {selectedLender && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Lender Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const lender = PRESELECTED_LENDERS.find(l => l.id === selectedLender);
                          if (!lender) return null;
                          
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Min Credit Score:</span>
                                <Badge variant={selectedCustomer?.creditScore >= lender.minCreditScore ? "default" : "destructive"}>
                                  {lender.minCreditScore}+
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Max LTV:</span>
                                <span>{lender.maxLTV}%</span>
                              </div>
                              {selectedCustomer?.creditScore && (
                                <div className="flex justify-between">
                                  <span>Customer Tier:</span>
                                  <Badge variant="outline">
                                    {getCreditTier(selectedCustomer.creditScore)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Lease Deal */}
            <TabsContent value="lease" className="space-y-4 mt-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Lease Structure</h3>
                  <p className="text-purple-700">Lease calculations and terms will be configured here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tax and Fee Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tax & Fee Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Sales Tax Rate:</Label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={taxOverride} 
                    onCheckedChange={setTaxOverride}
                  />
                  <Label className="text-xs">Override</Label>
                </div>
              </div>
              {selectedCustomer?.zipCode && (
                <div className="text-xs text-gray-600">
                  Based on zip: {selectedCustomer.zipCode} 
                  ({((TAX_RATES[selectedCustomer.zipCode.substring(0, 2)] || TAX_RATES['default']) * 100).toFixed(2)}%)
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  Title Fee:
                  <div className="flex items-center gap-1">
                    <Checkbox 
                      checked={titleFeeOverride} 
                      onCheckedChange={setTitleFeeOverride}
                    />
                    <Settings className="h-3 w-3" />
                  </div>
                </Label>
              </div>
              <Input 
                type="number" 
                {...form.register('titleFee')} 
                disabled={!titleFeeOverride}
                className={titleFeeOverride ? "bg-yellow-50" : ""}
              />
              {selectedCustomer?.zipCode && (
                <div className="text-xs text-gray-600">
                  Based on zip: {selectedCustomer.zipCode} 
                  (${TITLE_FEES[selectedCustomer.zipCode.substring(0, 2)] || TITLE_FEES['default']})
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}