import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertDealSchema, type Deal, type Vehicle, type Customer } from '@shared/schema';
import { Car, User, DollarSign, CreditCard, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';

interface DealStructureTabProps {
  deal: Deal;
}

export default function DealStructureTab({ deal }: DealStructureTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(deal.customerId || null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(deal.vehicleId || null);

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
    
    // Sales tax rates by ZIP code prefix
    const taxRates: { [key: string]: number } = {
      '90': 0.0825, // CA
      '10': 0.0825, // NY
      '77': 0.0825, // TX
      '60': 0.0825, // IL
      '33': 0.06,   // FL
      '30': 0.07,   // GA
      '98': 0.065,  // WA
      '80': 0.0465, // CO
      '97': 0.0,    // OR (no sales tax)
      '03': 0.0,    // NH (no sales tax)
    };

    const zipPrefix = zipCode.substring(0, 2);
    const taxRate = taxRates[zipPrefix] || 0.07; // Default 7% if not found
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

  // Update form when selections change
  useEffect(() => {
    if (selectedVehicle) {
      form.setValue('vehicleId', selectedVehicle.id);
      form.setValue('salePrice', selectedVehicle.price || 0);
      form.setValue('vin', selectedVehicle.vin || '');
      
      // Recalculate sales tax
      const newSalesTax = calculateSalesTax(selectedCustomer?.zipCode, selectedVehicle.price || 0);
      form.setValue('salesTax', newSalesTax);
    }
  }, [selectedVehicle, selectedCustomer, form]);

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerId', selectedCustomer.id);
      form.setValue('buyerName', `${selectedCustomer.firstName} ${selectedCustomer.lastName}`);
      
      // Recalculate sales tax
      const currentSalePrice = form.getValues('salePrice') || 0;
      const newSalesTax = calculateSalesTax(selectedCustomer.zipCode, currentSalePrice);
      form.setValue('salesTax', newSalesTax);
    }
  }, [selectedCustomer, form]);

  const updateDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/deals/${deal.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals', deal.id] });
      toast({
        title: 'Deal Updated',
        description: 'Deal structure has been updated successfully.',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update deal structure.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    const formData = form.getValues();
    updateDealMutation.mutate(formData);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (rate: number | null) => {
    if (!rate) return '0%';
    return `${rate.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Structure</h2>
          <p className="text-gray-600 mt-1">Configure deal details, customer, and vehicle information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updateDealMutation.isPending} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Structure
            </Button>
          )}
        </div>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
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
                    <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                    <div className="mt-2 space-y-1">
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
                    <Label className="text-sm font-medium text-gray-700">Customer Details</Label>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Credit Score:</span> {selectedCustomer.creditScore || 'Not provided'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Income:</span> {formatCurrency(selectedCustomer.income)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Sales Tax Rate:</span> {formatPercent(calculateSalesTax(selectedCustomer.zipCode, 100) * 100)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedCustomer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-lg">{selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {selectedCustomer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {selectedCustomer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No customer selected
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
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
                    <Label className="text-sm font-medium text-gray-700">Vehicle Details</Label>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Year:</span> {selectedVehicle.year}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Make:</span> {selectedVehicle.make}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Model:</span> {selectedVehicle.model}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">VIN:</span> {selectedVehicle.vin}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Pricing</Label>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">List Price:</span> {formatCurrency(selectedVehicle.price)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Mileage:</span> {selectedVehicle.mileage?.toLocaleString() || 'N/A'} miles
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Status:</span> 
                        <Badge className="ml-2" variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}>
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedVehicle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-lg">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">VIN:</span> {selectedVehicle.vin}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Mileage:</span> {selectedVehicle.mileage?.toLocaleString() || 'N/A'} miles
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> 
                        <Badge className="ml-2" variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}>
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">List Price:</span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(selectedVehicle.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No vehicle selected
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal Financial Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Sale Price</Label>
              <Input 
                type="number" 
                {...form.register('salePrice', { valueAsNumber: true })}
                disabled={!isEditing}
                className="text-lg font-semibold"
              />
            </div>
            <div>
              <Label>Trade Allowance</Label>
              <Input 
                type="number" 
                {...form.register('tradeAllowance', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Trade Payoff</Label>
              <Input 
                type="number" 
                {...form.register('tradePayoff', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Cash Down</Label>
              <Input 
                type="number" 
                {...form.register('cashDown', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Rebates</Label>
              <Input 
                type="number" 
                {...form.register('rebates', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Sales Tax</Label>
              <Input 
                type="number" 
                {...form.register('salesTax', { valueAsNumber: true })}
                disabled={!isEditing}
                className="bg-yellow-50"
              />
            </div>
            <div>
              <Label>Doc Fee</Label>
              <Input 
                type="number" 
                {...form.register('docFee', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Finance Balance</Label>
              <Input 
                type="number" 
                {...form.register('financeBalance', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Rate (%)</Label>
              <Input 
                type="number" 
                step="0.01"
                {...form.register('rate', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Term (months)</Label>
              <Input 
                type="number" 
                {...form.register('term', { valueAsNumber: true })}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Deal Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Deal Summary</h4>
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
                  <span>Trade Payoff:</span>
                  <span>-{formatCurrency(form.watch('tradePayoff'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash Down:</span>
                  <span>{formatCurrency(form.watch('cashDown'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rebates:</span>
                  <span>{formatCurrency(form.watch('rebates'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sales Tax:</span>
                  <span>{formatCurrency(form.watch('salesTax'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Doc Fee:</span>
                  <span>{formatCurrency(form.watch('docFee'))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount Due:</span>
                  <span>{formatCurrency(
                    (form.watch('salePrice') || 0) + 
                    (form.watch('salesTax') || 0) + 
                    (form.watch('docFee') || 0) - 
                    (form.watch('tradeAllowance') || 0) + 
                    (form.watch('tradePayoff') || 0) - 
                    (form.watch('cashDown') || 0) - 
                    (form.watch('rebates') || 0)
                  )}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Finance Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Finance Balance:</span>
                  <span>{formatCurrency(form.watch('financeBalance'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Interest Rate:</span>
                  <span>{formatPercent(form.watch('rate'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Term:</span>
                  <span>{form.watch('term')} months</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Monthly Payment:</span>
                  <span>{formatCurrency(
                    form.watch('financeBalance') && form.watch('rate') && form.watch('term') ? 
                    (form.watch('financeBalance') * (form.watch('rate') / 100 / 12) * 
                    Math.pow(1 + (form.watch('rate') / 100 / 12), form.watch('term'))) /
                    (Math.pow(1 + (form.watch('rate') / 100 / 12), form.watch('term')) - 1) : 0
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