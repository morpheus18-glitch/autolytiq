import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import VinDecoder from '../../../components/vin-decoder';
import EnhancedWorkADeal from '../../../components/enhanced-work-deal';
import { insertDealSchema, type Deal, type Vehicle, type Customer } from '@shared/schema';
import { 
  Car, User, DollarSign, CreditCard, MapPin, Phone, Mail, 
  Building, Shield, FileText, Save, Calendar, AlertCircle,
  CheckCircle, Truck, Calculator, Clock
} from 'lucide-react';

interface DealStructureTabProps {
  deal: Deal;
}

export default function DealStructureTab({ deal }: DealStructureTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(deal.customerId || null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(deal.vehicleId || null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch customers and vehicles for selection
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Calculate sales tax based on customer zip code
  const calculateSalesTax = (zipCode: string | null | undefined, salePrice: number) => {
    if (!zipCode || salePrice === 0) return 0;
    
    const taxRates: { [key: string]: number } = {
      '90': 0.0825, '10': 0.0825, '77': 0.0825, '60': 0.0825,
      '33': 0.06, '30': 0.07, '98': 0.065, '80': 0.0465,
      '97': 0.0, '03': 0.0, '59': 0.0, '19': 0.06,
    };

    const zipPrefix = zipCode.substring(0, 2);
    const taxRate = taxRates[zipPrefix] || 0.07;
    return salePrice * taxRate;
  };

  const form = useForm({
    resolver: zodResolver(insertDealSchema),
    defaultValues: {
      ...deal,
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      salePrice: selectedVehicle?.price || deal.salePrice || 0,
      tradeAllowance: deal.tradeAllowance || 0,
      tradePayoff: deal.tradePayoff || 0,
      cashDown: deal.cashDown || 0,
      rebates: deal.rebates || 0,
      salesTax: deal.salesTax || 0,
      docFee: deal.docFee || 599,
      financeBalance: deal.financeBalance || 0,
      rate: deal.rate || 0,
      term: deal.term || 0,
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/deals/${deal.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals', deal.id] });
      setLastSaved(new Date());
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      toast({
        title: 'Auto-save Failed',
        description: 'Changes could not be saved automatically.',
        variant: 'destructive',
      });
    },
  });

  // Auto-save functionality
  const autoSave = useCallback(() => {
    if (!autoSaveEnabled) return;
    
    const formData = form.getValues();
    updateDealMutation.mutate(formData);
  }, [autoSaveEnabled, form, updateDealMutation]);

  // Auto-save on form changes with debounce
  useEffect(() => {
    const subscription = form.watch(() => {
      if (autoSaveEnabled) {
        const timeoutId = setTimeout(autoSave, 2000); // 2 second delay
        return () => clearTimeout(timeoutId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, autoSave, autoSaveEnabled]);

  // Update form when selections change
  useEffect(() => {
    if (selectedVehicle) {
      form.setValue('vehicleId', selectedVehicle.id);
      form.setValue('salePrice', selectedVehicle.price || 0);
      form.setValue('vin', selectedVehicle.vin || '');
      
      const newSalesTax = calculateSalesTax(selectedCustomer?.zipCode, selectedVehicle.price || 0);
      form.setValue('salesTax', newSalesTax);
    }
  }, [selectedVehicle, selectedCustomer, form]);

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerId', selectedCustomer.id);
      form.setValue('buyerName', `${selectedCustomer.firstName} ${selectedCustomer.lastName}`);
      
      const currentSalePrice = form.getValues('salePrice') || 0;
      const newSalesTax = calculateSalesTax(selectedCustomer.zipCode, currentSalePrice);
      form.setValue('salesTax', newSalesTax);
    }
  }, [selectedCustomer, form]);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleTradeVinDecoded = (vehicleInfo: any) => {
    form.setValue('tradeYear', vehicleInfo.year);
    form.setValue('tradeMake', vehicleInfo.make);
    form.setValue('tradeModel', vehicleInfo.model);
    form.setValue('tradeTrim', vehicleInfo.trim || '');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Auto-Save Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Deal Structure</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Configure deal details with automatic saving</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="auto-save" 
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
            />
            <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
          <TabsTrigger value="customer" className="text-xs sm:text-sm">Customer</TabsTrigger>
          <TabsTrigger value="vehicle" className="text-xs sm:text-sm">Vehicle</TabsTrigger>
          <TabsTrigger value="work-deal" className="text-xs sm:text-sm">Work Deal</TabsTrigger>
          <TabsTrigger value="trade" className="text-xs sm:text-sm">Trade-In</TabsTrigger>
          <TabsTrigger value="payoff" className="text-xs sm:text-sm">Payoff</TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs sm:text-sm">Insurance</TabsTrigger>
        </TabsList>

        {/* Customer Tab */}
        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer-select">Select Customer</Label>
                <Select value={selectedCustomerId?.toString() || ''} onValueChange={(value) => setSelectedCustomerId(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.firstName} {customer.lastName} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCustomer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-lg mb-2">{selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-600" />
                        {selectedCustomer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-blue-600" />
                        {selectedCustomer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Credit Score:</span>
                        <Badge variant={selectedCustomer.creditScore && selectedCustomer.creditScore >= 700 ? 'default' : 'secondary'}>
                          {selectedCustomer.creditScore || 'Not provided'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Income:</span>
                        <span className="text-sm">{formatCurrency(selectedCustomer.income)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Sales Tax Rate:</span>
                        <span className="text-sm">{(calculateSalesTax(selectedCustomer.zipCode, 100) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Tab */}
        <TabsContent value="vehicle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vehicle-select">Select Vehicle</Label>
                <Select value={selectedVehicleId?.toString() || ''} onValueChange={(value) => setSelectedVehicleId(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.year} {vehicle.make} {vehicle.model} - {formatCurrency(vehicle.price)} ({vehicle.vin})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedVehicle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-lg mb-2">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">VIN:</span> {selectedVehicle.vin}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Mileage:</span> {selectedVehicle.mileage?.toLocaleString() || 'N/A'} miles
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Color:</span> {selectedVehicle.color || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">List Price:</span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(selectedVehicle.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}>
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Deal Tab */}
        <TabsContent value="work-deal" className="space-y-4">
          <EnhancedWorkADeal 
            selectedVehicle={selectedVehicle}
            selectedCustomer={selectedCustomer}
            onDealUpdate={(dealData) => {
              Object.keys(dealData).forEach(key => {
                form.setValue(key as any, dealData[key]);
              });
            }}
          />
        </TabsContent>

        {/* Trade-In Tab */}
        <TabsContent value="trade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Trade-In Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <VinDecoder 
                onVinDecoded={handleTradeVinDecoded}
                initialVin={deal.tradeVin || ''}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label>Trade VIN</Label>
                  <Input 
                    {...form.register('tradeVin')}
                    placeholder="17-character VIN"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input 
                    type="number"
                    {...form.register('tradeYear', { valueAsNumber: true })}
                    placeholder="YYYY"
                  />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input 
                    {...form.register('tradeMake')}
                    placeholder="e.g., Honda"
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input 
                    {...form.register('tradeModel')}
                    placeholder="e.g., Civic"
                  />
                </div>
                <div>
                  <Label>Trim</Label>
                  <Input 
                    {...form.register('tradeTrim')}
                    placeholder="e.g., EX-L"
                  />
                </div>
                <div>
                  <Label>Mileage</Label>
                  <Input 
                    type="number"
                    {...form.register('tradeMileage', { valueAsNumber: true })}
                    placeholder="Miles"
                  />
                </div>
                <div>
                  <Label>Condition</Label>
                  <Select value={form.watch('tradeCondition') || ''} onValueChange={(value) => form.setValue('tradeCondition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Trade Allowance</Label>
                  <Input 
                    type="number"
                    {...form.register('tradeAllowance', { valueAsNumber: true })}
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Label>Actual Cash Value</Label>
                  <Input 
                    type="number"
                    {...form.register('tradeActualCashValue', { valueAsNumber: true })}
                    placeholder="$0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payoff Tab */}
        <TabsContent value="payoff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Payoff Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label>Lender Name</Label>
                  <Input 
                    {...form.register('payoffLenderName')}
                    placeholder="e.g., Chase Auto Finance"
                  />
                </div>
                <div>
                  <Label>Lender Phone</Label>
                  <Input 
                    {...form.register('payoffLenderPhone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input 
                    {...form.register('payoffAccountNumber')}
                    placeholder="Account #"
                  />
                </div>
                <div>
                  <Label>Payoff Amount</Label>
                  <Input 
                    type="number"
                    {...form.register('payoffAmount', { valueAsNumber: true })}
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Label>Per Diem</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    {...form.register('payoffPerDiem', { valueAsNumber: true })}
                    placeholder="$0.00"
                  />
                </div>
                <div>
                  <Label>Good Through Date</Label>
                  <Input 
                    type="date"
                    {...form.register('payoffGoodThrough')}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>Lender Address</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
                  <div>
                    <Input 
                      {...form.register('payoffLenderAddress')}
                      placeholder="Street Address"
                    />
                  </div>
                  <div>
                    <Input 
                      {...form.register('payoffLenderCity')}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Input 
                      {...form.register('payoffLenderState')}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Input 
                      {...form.register('payoffLenderZip')}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label>Insurance Company</Label>
                  <Input 
                    {...form.register('insuranceCompany')}
                    placeholder="e.g., State Farm"
                  />
                </div>
                <div>
                  <Label>Agent Name</Label>
                  <Input 
                    {...form.register('insuranceAgent')}
                    placeholder="Agent Name"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    {...form.register('insurancePhone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input 
                    {...form.register('insurancePolicyNumber')}
                    placeholder="Policy #"
                  />
                </div>
                <div>
                  <Label>Effective Date</Label>
                  <Input 
                    type="date"
                    {...form.register('insuranceEffectiveDate')}
                  />
                </div>
                <div>
                  <Label>Expiration Date</Label>
                  <Input 
                    type="date"
                    {...form.register('insuranceExpirationDate')}
                  />
                </div>
                <div>
                  <Label>Deductible</Label>
                  <Input 
                    type="number"
                    {...form.register('insuranceDeductible', { valueAsNumber: true })}
                    placeholder="$500"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium mb-4 block">Coverage Types</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="liability" />
                    <Label htmlFor="liability">Liability</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="collision" />
                    <Label htmlFor="collision">Collision</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="comprehensive" />
                    <Label htmlFor="comprehensive">Comprehensive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="uninsured" />
                    <Label htmlFor="uninsured">Uninsured Motorist</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pip" />
                    <Label htmlFor="pip">Personal Injury Protection</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium mb-3">Pricing</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sale Price:</span>
                  <span>{formatCurrency(form.watch('salePrice'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trade Allowance:</span>
                  <span>{formatCurrency(form.watch('tradeAllowance'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sales Tax:</span>
                  <span>{formatCurrency(form.watch('salesTax'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Doc Fee:</span>
                  <span>{formatCurrency(form.watch('docFee'))}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Trade & Payoff</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trade Payoff:</span>
                  <span>{formatCurrency(form.watch('tradePayoff'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payoff Amount:</span>
                  <span>{formatCurrency(form.watch('payoffAmount'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Net Trade:</span>
                  <span>{formatCurrency((form.watch('tradeAllowance') || 0) - (form.watch('tradePayoff') || 0))}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Total</h4>
              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Amount Due:</span>
                  <span>{formatCurrency(
                    (form.watch('salePrice') || 0) + 
                    (form.watch('salesTax') || 0) + 
                    (form.watch('docFee') || 0) - 
                    (form.watch('tradeAllowance') || 0) + 
                    (form.watch('tradePayoff') || 0)
                  )}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}