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
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Building2, 
  Car,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Settings,
  Clock,
  Percent
} from 'lucide-react';

interface EnhancedWorkADealProps {
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
    excellent: number;
    good: number;
    fair: number;
    poor: number;
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
    id: 'ally',
    name: 'Ally Financial',
    minCreditScore: 660,
    maxLTV: 115,
    rates: { excellent: 4.79, good: 6.29, fair: 9.79, poor: 14.49 }
  }
];

export default function EnhancedWorkADeal({ selectedVehicle, selectedCustomer, onDealUpdate }: EnhancedWorkADealProps) {
  const [dealType, setDealType] = useState<'cash' | 'finance' | 'lease'>('finance');
  const [selectedLender, setSelectedLender] = useState<string>('');
  const [taxOverride, setTaxOverride] = useState(false);
  const [titleFeeOverride, setTitleFeeOverride] = useState(false);
  
  const form = useForm({
    defaultValues: {
      dealNumber: `${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      contractDate: new Date().toISOString().split('T')[0],
      finInst: '',
      stockNumber: selectedVehicle?.uuid || '',
      msrp: selectedVehicle?.price || 0,
      cashPrice: selectedVehicle?.price || 0,
      rebate: 1000,
      cashDown: 5000,
      totalDown: 6000,
      aftermarketProducts: 1250,
      docFee: 599,
      salesTax: 0,
      titleFee: 0,
      totalTaxAmount: 0,
      // Finance fields
      term: 60,
      apr: 6.99,
      payment: 0,
      totalFinanced: 0,
      financeCharge: 0,
      totalOfPayments: 0,
      // Lease fields
      leaseResidual: selectedVehicle?.price ? selectedVehicle.price * 0.55 : 0,
      residualPercent: 55,
      moneyFactor: 0.00125,
      leasePayment: 0,
      totalLeasePayments: 0,
      totalCapCost: 0,
      capCostReduction: 0,
      adjustedCapCost: 0,
      // Cash deal totals
      totalCashDue: 0,
    }
  });

  // Tax rates by zip code prefix
  const TAX_RATES: { [key: string]: number } = {
    '90': 0.0825, '91': 0.0825, '92': 0.0825, '93': 0.0825, '94': 0.0825, '95': 0.0825,
    '75': 0.0825, '76': 0.0825, '77': 0.0825, '78': 0.0825, '79': 0.0825,
    '32': 0.06, '33': 0.06, '34': 0.06,
    '10': 0.08, '11': 0.08, '12': 0.08, '13': 0.08, '14': 0.08,
    '60': 0.0625, '61': 0.0625, '62': 0.0625,
    'default': 0.07
  };

  const TITLE_FEES: { [key: string]: number } = {
    '90': 23, '91': 23, '92': 23, '93': 23, '94': 23, '95': 23,
    '75': 33, '76': 33, '77': 33, '78': 33, '79': 33,
    '32': 77.25, '33': 77.25, '34': 77.25,
    '10': 50, '11': 50, '12': 50, '13': 50, '14': 50,
    '60': 155, '61': 155, '62': 155,
    'default': 75
  };

  // Auto-calculate tax and fees
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
      
      // Recalculate totals
      calculateTotals();
    }
  }, [selectedVehicle, form]);

  // Watch for changes and recalculate
  const watchedValues = form.watch();
  useEffect(() => {
    calculateTotals();
  }, [
    watchedValues.cashPrice, watchedValues.rebate, watchedValues.cashDown, 
    watchedValues.aftermarketProducts, watchedValues.salesTax, watchedValues.docFee, 
    watchedValues.titleFee, watchedValues.apr, watchedValues.term, 
    watchedValues.residualPercent, watchedValues.moneyFactor, dealType
  ]);

  const calculateTotals = () => {
    const cashPrice = form.getValues('cashPrice') || 0;
    const rebate = form.getValues('rebate') || 0;
    const cashDown = form.getValues('cashDown') || 0;
    const aftermarket = form.getValues('aftermarketProducts') || 0;
    const salesTax = form.getValues('salesTax') || 0;
    const docFee = form.getValues('docFee') || 0;
    const titleFee = form.getValues('titleFee') || 0;
    
    const netPrice = cashPrice - rebate;
    
    if (dealType === 'finance') {
      // Finance calculations
      const totalFinanced = netPrice - cashDown + aftermarket + salesTax + docFee + titleFee;
      form.setValue('totalFinanced', Math.round(totalFinanced * 100) / 100);
      form.setValue('totalDown', cashDown + rebate);
      
      const principal = totalFinanced;
      const rate = (form.getValues('apr') || 0) / 100 / 12;
      const term = form.getValues('term') || 60;
      
      let payment = 0;
      if (rate === 0) {
        payment = principal / term;
      } else {
        payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      }
      
      const totalOfPayments = payment * term;
      const financeCharge = totalOfPayments - principal;
      
      form.setValue('payment', Math.round(payment * 100) / 100);
      form.setValue('totalOfPayments', Math.round(totalOfPayments * 100) / 100);
      form.setValue('financeCharge', Math.round(financeCharge * 100) / 100);
      
    } else if (dealType === 'lease') {
      // Lease calculations
      const residualPercent = form.getValues('residualPercent') || 55;
      const moneyFactor = form.getValues('moneyFactor') || 0.00125;
      const term = form.getValues('term') || 36;
      
      const residualValue = cashPrice * (residualPercent / 100);
      const capCostReduction = cashDown + rebate;
      const adjustedCapCost = cashPrice - capCostReduction + aftermarket;
      const totalCapCost = adjustedCapCost + salesTax + docFee + titleFee;
      
      // Lease payment calculation: (Cap Cost - Residual) / Term + (Cap Cost + Residual) * Money Factor
      const depreciationPayment = (totalCapCost - residualValue) / term;
      const financePayment = (totalCapCost + residualValue) * moneyFactor;
      const leasePayment = depreciationPayment + financePayment;
      
      form.setValue('leaseResidual', Math.round(residualValue * 100) / 100);
      form.setValue('capCostReduction', Math.round(capCostReduction * 100) / 100);
      form.setValue('adjustedCapCost', Math.round(adjustedCapCost * 100) / 100);
      form.setValue('totalCapCost', Math.round(totalCapCost * 100) / 100);
      form.setValue('leasePayment', Math.round(leasePayment * 100) / 100);
      form.setValue('totalLeasePayments', Math.round(leasePayment * term * 100) / 100);
      
    } else if (dealType === 'cash') {
      // Cash deal calculations - same as finance but no financing
      const totalCashDue = netPrice + aftermarket + salesTax + docFee + titleFee;
      form.setValue('totalCashDue', Math.round(totalCashDue * 100) / 100);
      form.setValue('totalDown', rebate); // Only rebate counts as "down" in cash deal
    }
  };

  const getCreditTier = (creditScore: number) => {
    if (creditScore >= 740) return 'excellent';
    if (creditScore >= 680) return 'good';
    if (creditScore >= 620) return 'fair';
    return 'poor';
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
      {/* Header with Deal Type Selection */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
              Purchase Information Screen
            </CardTitle>
            <Tabs value={dealType} onValueChange={(value) => setDealType(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cash" className="flex items-center gap-2 text-sm">
                  <PiggyBank className="h-3 w-3" />
                  Cash
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-3 w-3" />
                  Finance
                </TabsTrigger>
                <TabsTrigger value="lease" className="flex items-center gap-2 text-sm">
                  <Car className="h-3 w-3" />
                  Lease
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {dealType === 'finance' && (
            <div className="space-y-6">
              {/* Professional Layout Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Input Fields */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">1. Deal Number:</Label>
                      <Input {...form.register('dealNumber')} className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">2. Contract Date:</Label>
                      <Input type="date" {...form.register('contractDate')} className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">3. Fin Inst:</Label>
                      <Select value={selectedLender} onValueChange={handleLenderChange}>
                        <SelectTrigger className="text-sm">
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
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">4. Stock Number:</Label>
                      <Input {...form.register('stockNumber')} className="text-sm" readOnly />
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">5. M.S.R.P.:</Label>
                      <Input 
                        type="number" 
                        {...form.register('msrp', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">6. Cash Price:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('cashPrice', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">7. Rebate:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('rebate', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">8. Cash Down:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('cashDown', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Finance Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        9. Sales Tax:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={taxOverride} 
                            onCheckedChange={setTaxOverride}
                            className="h-3 w-3"
                          />
                          <Settings className="h-3 w-3 text-gray-400" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('salesTax', { valueAsNumber: true })} 
                        disabled={!taxOverride}
                        className={`text-sm ${taxOverride ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                      {selectedCustomer?.zipCode && (
                        <div className="text-xs text-gray-500">
                          {selectedCustomer.zipCode}: {((TAX_RATES[selectedCustomer.zipCode.substring(0, 2)] || TAX_RATES['default']) * 100).toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        10. Title Fee:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={titleFeeOverride} 
                            onCheckedChange={setTitleFeeOverride}
                            className="h-3 w-3"
                          />
                          <Settings className="h-3 w-3 text-gray-400" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('titleFee', { valueAsNumber: true })} 
                        disabled={!titleFeeOverride}
                        className={`text-sm ${titleFeeOverride ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                      {selectedCustomer?.zipCode && (
                        <div className="text-xs text-gray-500">
                          {selectedCustomer.zipCode}: ${TITLE_FEES[selectedCustomer.zipCode.substring(0, 2)] || TITLE_FEES['default']}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">11. Doc Fee:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('docFee', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">12. Products:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('aftermarketProducts', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Loan Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        13. Term (months):
                      </Label>
                      <Select value={String(form.watch('term'))} onValueChange={(value) => form.setValue('term', parseInt(value))}>
                        <SelectTrigger className="text-sm">
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
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        14. APR:
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('apr', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        15. Payment:
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={form.watch('payment') || 0}
                        className="text-sm font-bold text-green-700 bg-green-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-4">
                  {/* Financial Summary */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-800 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Financial Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Total Down:</span>
                        <span className="font-semibold text-green-700">{formatCurrency(form.watch('totalDown') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Amount Financed:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('totalFinanced') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Finance Charge:</span>
                        <span className="font-semibold text-orange-600">{formatCurrency(form.watch('financeCharge') || 0)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3">
                        <span className="text-sm font-medium">Monthly Payment:</span>
                        <span className="text-xl font-bold text-green-800">{formatCurrency(form.watch('payment') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Total of Payments:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('totalOfPayments') || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lender Information */}
                  {selectedLender && (
                    <Card className="border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Lender Details
                        </CardTitle>
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
                                <span className="font-medium">{lender.maxLTV}%</span>
                              </div>
                              {selectedCustomer?.creditScore && (
                                <div className="flex justify-between">
                                  <span>Customer Tier:</span>
                                  <Badge variant="outline" className="text-xs">
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

                  {/* Customer Info Quick View */}
                  {selectedCustomer && (
                    <Card className="border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-purple-800">Customer Info</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Credit Score:</span>
                            <Badge variant={selectedCustomer.creditScore >= 700 ? 'default' : 'secondary'}>
                              {selectedCustomer.creditScore || 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="text-xs">{selectedCustomer.city}, {selectedCustomer.state}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {dealType === 'cash' && (
            <div className="space-y-6">
              {/* Cash Deal Layout - Similar to Finance but no loan terms */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Input Fields */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">1. Deal Number:</Label>
                      <Input {...form.register('dealNumber')} className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">2. Contract Date:</Label>
                      <Input type="date" {...form.register('contractDate')} className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">3. Payment Method:</Label>
                      <Select value="cash" disabled>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Cash Payment" />
                        </SelectTrigger>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">4. Stock Number:</Label>
                      <Input {...form.register('stockNumber')} className="text-sm" readOnly />
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">5. M.S.R.P.:</Label>
                      <Input 
                        type="number" 
                        {...form.register('msrp', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">6. Cash Price:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('cashPrice', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">7. Rebate:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('rebate', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">8. Net Price:</Label>
                      <Input 
                        value={formatCurrency((form.watch('cashPrice') || 0) - (form.watch('rebate') || 0))}
                        className="text-sm font-semibold bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Taxes and Fees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        9. Sales Tax:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={taxOverride} 
                            onCheckedChange={setTaxOverride}
                            className="h-3 w-3"
                          />
                          <Settings className="h-3 w-3 text-gray-400" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('salesTax', { valueAsNumber: true })} 
                        disabled={!taxOverride}
                        className={`text-sm ${taxOverride ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        10. Title Fee:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={titleFeeOverride} 
                            onCheckedChange={setTitleFeeOverride}
                            className="h-3 w-3"
                          />
                          <Settings className="h-3 w-3 text-gray-400" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('titleFee', { valueAsNumber: true })} 
                        disabled={!titleFeeOverride}
                        className={`text-sm ${titleFeeOverride ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">11. Doc Fee:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('docFee', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">12. Products:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('aftermarketProducts', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Cash Summary */}
                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Cash Deal Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Vehicle Price:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('cashPrice') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Rebate:</span>
                        <span className="font-semibold text-green-600">-{formatCurrency(form.watch('rebate') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Products:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('aftermarketProducts') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Sales Tax:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('salesTax') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Doc Fee:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('docFee') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Title Fee:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('titleFee') || 0)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3">
                        <span className="text-sm font-medium">Total Cash Due:</span>
                        <span className="text-xl font-bold text-blue-800">{formatCurrency(form.watch('totalCashDue') || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {dealType === 'lease' && (
            <div className="space-y-6">
              {/* Lease Deal Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Input Fields */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">1. Deal Number:</Label>
                      <Input {...form.register('dealNumber')} className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">2. Contract Date:</Label>
                      <Input type="date" {...form.register('contractDate')} className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">3. Lease Company:</Label>
                      <Select value={selectedLender} onValueChange={handleLenderChange}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select Lease Company" />
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
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">4. Stock Number:</Label>
                      <Input {...form.register('stockNumber')} className="text-sm" readOnly />
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">5. M.S.R.P.:</Label>
                      <Input 
                        type="number" 
                        {...form.register('msrp', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">6. Cap Cost (Price):</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('cashPrice', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">7. Rebate:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('rebate', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">8. Cap Cost Reduction:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('cashDown', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Lease Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        9. Lease Term (months):
                      </Label>
                      <Select value={String(form.watch('term'))} onValueChange={(value) => form.setValue('term', parseInt(value))}>
                        <SelectTrigger className="text-sm">
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
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        10. Residual %:
                      </Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...form.register('residualPercent', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                        placeholder="55.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">11. Money Factor:</Label>
                      <Input 
                        type="number" 
                        step="0.00001"
                        {...form.register('moneyFactor', { valueAsNumber: true })} 
                        className="text-sm font-semibold"
                        placeholder="0.00125"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">12. Residual Value:</Label>
                      <Input 
                        value={formatCurrency(form.watch('leaseResidual') || 0)}
                        className="text-sm font-semibold bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Taxes and Fees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        13. Sales Tax:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={taxOverride} 
                            onCheckedChange={setTaxOverride}
                            className="h-3 w-3"
                          />
                          <Settings className="h-3 w-3 text-gray-400" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('salesTax', { valueAsNumber: true })} 
                        disabled={!taxOverride}
                        className={`text-sm ${taxOverride ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        14. Title Fee:
                        <div className="flex items-center gap-1">
                          <Checkbox 
                            checked={titleFeeOverride} 
                            onCheckedChange={setTitleFeeOverride}
                            className="h-3 w-3"
                          />
                          <Settings className="h-3 w-3 text-gray-400" />
                        </div>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('titleFee', { valueAsNumber: true })} 
                        disabled={!titleFeeOverride}
                        className={`text-sm ${titleFeeOverride ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">15. Doc Fee:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('docFee', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">16. Products:</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...form.register('aftermarketProducts', { valueAsNumber: true })} 
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Lease Summary */}
                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-purple-800 flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Lease Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Gross Cap Cost:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('cashPrice') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Cap Cost Reduction:</span>
                        <span className="font-semibold text-green-600">-{formatCurrency(form.watch('capCostReduction') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Adjusted Cap Cost:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('adjustedCapCost') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Residual Value:</span>
                        <span className="font-semibold">{formatCurrency(form.watch('leaseResidual') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Depreciation:</span>
                        <span className="font-semibold text-orange-600">{formatCurrency((form.watch('adjustedCapCost') || 0) - (form.watch('leaseResidual') || 0))}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Money Factor:</span>
                        <span className="font-semibold">{form.watch('moneyFactor') || 0} ({((form.watch('moneyFactor') || 0) * 2400).toFixed(1)}% APR)</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3">
                        <span className="text-sm font-medium">Monthly Payment:</span>
                        <span className="text-xl font-bold text-purple-800">{formatCurrency(form.watch('leasePayment') || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Total Payments ({form.watch('term')} mo):</span>
                        <span className="font-semibold">{formatCurrency(form.watch('totalLeasePayments') || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lease Terms Info */}
                  <Card className="border-indigo-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-indigo-800">Lease Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Lease Term:</span>
                          <span className="font-medium">{form.watch('term')} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Mileage:</span>
                          <span className="font-medium">12,000 miles</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Excess Mileage:</span>
                          <span className="font-medium">$0.25/mile</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disposition Fee:</span>
                          <span className="font-medium">$395</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}