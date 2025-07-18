import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertDealSchema, type Deal, type DealProduct, type Vehicle, type Customer } from '@shared/schema';
import { Car, User, DollarSign, CreditCard, Plus, Trash2 } from 'lucide-react';

interface DealStructureTabProps {
  deal: Deal;
}

export default function DealStructureTab({ deal }: DealStructureTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertDealSchema),
    defaultValues: {
      ...deal,
      salePrice: deal.salePrice || 0,
      tradeAllowance: deal.tradeAllowance || 0,
      tradePayoff: deal.tradePayoff || 0,
      cashDown: deal.cashDown || 0,
      rebates: deal.rebates || 0,
      salesTax: deal.salesTax || 0,
      docFee: deal.docFee || 599,
      titleFee: deal.titleFee || 75,
      registrationFee: deal.registrationFee || 150,
    },
  });

  // Query for vehicles and customers for dropdowns
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: dealProducts = [] } = useQuery<DealProduct[]>({
    queryKey: ['/api/deals', deal.id, 'products'],
  });

  const updateDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/deals/${deal.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals', deal.id] });
      toast({
        title: 'Deal Updated',
        description: 'Deal structure has been successfully updated.',
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

  const addProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const response = await apiRequest('POST', `/api/deals/${deal.id}/products`, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals', deal.id, 'products'] });
      toast({
        title: 'Product Added',
        description: 'F&I product has been added to the deal.',
      });
    },
  });

  const onSubmit = (data: any) => {
    // Calculate finance balance
    const totalCharges = data.salePrice + data.salesTax + data.docFee + data.titleFee + data.registrationFee;
    const totalCredits = data.tradeAllowance + data.cashDown + data.rebates;
    const financeBalance = totalCharges - totalCredits - data.tradePayoff;

    updateDealMutation.mutate({
      ...data,
      financeBalance: Math.max(0, financeBalance),
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = () => {
    const salePrice = form.watch('salePrice') || 0;
    const salesTax = form.watch('salesTax') || 0;
    const docFee = form.watch('docFee') || 0;
    const titleFee = form.watch('titleFee') || 0;
    const registrationFee = form.watch('registrationFee') || 0;
    const tradeAllowance = form.watch('tradeAllowance') || 0;
    const tradePayoff = form.watch('tradePayoff') || 0;
    const cashDown = form.watch('cashDown') || 0;
    const rebates = form.watch('rebates') || 0;

    const totalCharges = salePrice + salesTax + docFee + titleFee + registrationFee;
    const totalCredits = tradeAllowance + cashDown + rebates;
    const financeBalance = Math.max(0, totalCharges - totalCredits - tradePayoff);

    return { totalCharges, totalCredits, financeBalance };
  };

  const totals = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Vehicle and Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select
                value={form.watch('vehicleId') || ''}
                onValueChange={(value) => form.setValue('vehicleId', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                {...form.register('vin')}
                disabled={!isEditing}
                placeholder="Vehicle VIN"
              />
            </div>

            <div>
              <Label htmlFor="msrp">MSRP</Label>
              <Input
                id="msrp"
                type="number"
                {...form.register('msrp', { valueAsNumber: true })}
                disabled={!isEditing}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="salePrice">Sale Price</Label>
              <Input
                id="salePrice"
                type="number"
                {...form.register('salePrice', { valueAsNumber: true })}
                disabled={!isEditing}
                placeholder="0"
                className="font-medium"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerId">Customer</Label>
              <Select
                value={form.watch('customerId') || ''}
                onValueChange={(value) => form.setValue('customerId', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="buyerName">Buyer Name</Label>
              <Input
                id="buyerName"
                {...form.register('buyerName')}
                disabled={!isEditing}
                placeholder="Primary buyer name"
              />
            </div>

            <div>
              <Label htmlFor="coBuyerName">Co-Buyer Name</Label>
              <Input
                id="coBuyerName"
                {...form.register('coBuyerName')}
                disabled={!isEditing}
                placeholder="Co-buyer name (optional)"
              />
            </div>

            <div>
              <Label htmlFor="dealType">Deal Type</Label>
              <Select
                value={form.watch('dealType') || ''}
                onValueChange={(value) => form.setValue('dealType', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Trade Information</h4>
                <div>
                  <Label htmlFor="tradeVin">Trade VIN</Label>
                  <Input
                    id="tradeVin"
                    {...form.register('tradeVin')}
                    disabled={!isEditing}
                    placeholder="Trade vehicle VIN"
                  />
                </div>
                <div>
                  <Label htmlFor="tradeAllowance">Trade Allowance</Label>
                  <Input
                    id="tradeAllowance"
                    type="number"
                    {...form.register('tradeAllowance', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="tradePayoff">Trade Payoff</Label>
                  <Input
                    id="tradePayoff"
                    type="number"
                    {...form.register('tradePayoff', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Down Payment & Rebates</h4>
                <div>
                  <Label htmlFor="cashDown">Cash Down</Label>
                  <Input
                    id="cashDown"
                    type="number"
                    {...form.register('cashDown', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rebates">Rebates</Label>
                  <Input
                    id="rebates"
                    type="number"
                    {...form.register('rebates', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Taxes & Fees</h4>
                <div>
                  <Label htmlFor="salesTax">Sales Tax</Label>
                  <Input
                    id="salesTax"
                    type="number"
                    {...form.register('salesTax', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="docFee">Doc Fee</Label>
                  <Input
                    id="docFee"
                    type="number"
                    {...form.register('docFee', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="599"
                  />
                </div>
                <div>
                  <Label htmlFor="titleFee">Title Fee</Label>
                  <Input
                    id="titleFee"
                    type="number"
                    {...form.register('titleFee', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="75"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationFee">Registration Fee</Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    {...form.register('registrationFee', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="150"
                  />
                </div>
              </div>
            </div>

            {/* Deal Summary */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Deal Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Charges</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(totals.totalCharges)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Credits</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totals.totalCredits)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Finance Balance</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(totals.financeBalance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Information */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credit Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="creditStatus">Credit Status</Label>
                  <Select
                    value={form.watch('creditStatus') || ''}
                    onValueChange={(value) => form.setValue('creditStatus', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creditTier">Credit Tier</Label>
                  <Select
                    value={form.watch('creditTier') || ''}
                    onValueChange={(value) => form.setValue('creditTier', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+ (Excellent)</SelectItem>
                      <SelectItem value="A">A (Good)</SelectItem>
                      <SelectItem value="B">B (Fair)</SelectItem>
                      <SelectItem value="C">C (Poor)</SelectItem>
                      <SelectItem value="D">D (Bad)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="term">Term (Months)</Label>
                  <Input
                    id="term"
                    type="number"
                    {...form.register('term', { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Interest Rate</Label>
                  <Input
                    id="rate"
                    {...form.register('rate')}
                    disabled={!isEditing}
                    placeholder="5.99%"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div>
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    disabled={deal.status === 'funded' || deal.status === 'cancelled'}
                  >
                    Edit Deal Structure
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={updateDealMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* F&I Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              F&I Products
            </span>
            <Button
              size="sm"
              onClick={() => {
                // Add product functionality would go here
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dealProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No F&I products added to this deal yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dealProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(product.retailPrice)}</span>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}