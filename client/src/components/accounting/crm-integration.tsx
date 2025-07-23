import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, DollarSign, FileText, Calendar, Phone, Mail, CreditCard, Car, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CRMIntegrationProps {
  dealId?: string;
}

export default function CRMIntegration({ dealId }: CRMIntegrationProps) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dealStructure, setDealStructure] = useState({
    vehiclePrice: 0,
    tradeValue: 0,
    downPayment: 0,
    financeAmount: 0,
    monthlyPayment: 0,
    term: 72,
    apr: 0,
    productSales: []
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // CRM Data Queries
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers']
  });

  const { data: deals } = useQuery({
    queryKey: ['/api/deals']
  });

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles']
  });

  const { data: customerInteractions } = useQuery({
    queryKey: ['/api/customer-interactions', selectedCustomer?.id],
    enabled: !!selectedCustomer?.id
  });

  const { data: customerDeals } = useQuery({
    queryKey: ['/api/deals/customer', selectedCustomer?.id],
    enabled: !!selectedCustomer?.id
  });

  // Mutations for CRM integration
  const createDealMutation = useMutation({
    mutationFn: async (dealData) => {
      return await apiRequest("POST", "/api/deals", dealData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/deals']);
      toast({ title: "Deal Created", description: "New deal created successfully" });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ customerId, updates }) => {
      return await apiRequest("PATCH", `/api/customers/${customerId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/customers']);
      toast({ title: "Customer Updated" });
    }
  });

  const linkVehicleToDealMutation = useMutation({
    mutationFn: async ({ dealId, vehicleId }) => {
      return await apiRequest("PATCH", `/api/deals/${dealId}/vehicle`, { vehicleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/deals']);
      toast({ title: "Vehicle Linked to Deal" });
    }
  });

  // Calculate deal totals
  const calculateDealTotals = () => {
    const { vehiclePrice, tradeValue, downPayment, productSales } = dealStructure;
    const productTotal = productSales.reduce((sum, product) => sum + product.price, 0);
    const totalPrice = vehiclePrice + productTotal;
    const cashDown = downPayment + tradeValue;
    const financeAmount = totalPrice - cashDown;
    
    return {
      totalPrice,
      cashDown,
      financeAmount,
      productTotal
    };
  };

  const totals = calculateDealTotals();

  // CRM-specific deal creation
  const handleCreateDeal = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer first",
        variant: "destructive"
      });
      return;
    }

    const dealData = {
      customerId: selectedCustomer.id,
      vehicleId: dealStructure.vehicleId,
      salePrice: totals.totalPrice,
      tradeValue: dealStructure.tradeValue,
      downPayment: dealStructure.downPayment,
      financeAmount: totals.financeAmount,
      monthlyPayment: dealStructure.monthlyPayment,
      term: dealStructure.term,
      apr: dealStructure.apr,
      productSales: dealStructure.productSales,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dealType: 'retail'
    };

    createDealMutation.mutate(dealData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM Integration</h2>
        <Button onClick={handleCreateDeal} disabled={!selectedCustomer || createDealMutation.isPending}>
          <FileText className="h-4 w-4 mr-2" />
          Create Deal
        </Button>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customer Management</TabsTrigger>
          <TabsTrigger value="deals">Deal Structure</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="analytics">CRM Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Customer</Label>
                  <Select 
                    value={selectedCustomer?.id}
                    onValueChange={(value) => {
                      const customer = customers?.find(c => c.id === value);
                      setSelectedCustomer(customer);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName} - {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomer && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Credit Score</span>
                      <Badge variant={selectedCustomer.creditScore >= 700 ? "default" : "destructive"}>
                        {selectedCustomer.creditScore}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer History */}
            <Card>
              <CardHeader>
                <CardTitle>Customer History</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Previous Deals</Label>
                        <p className="text-lg font-semibold">{customerDeals?.length || 0}</p>
                      </div>
                      <div>
                        <Label>Total Purchases</Label>
                        <p className="text-lg font-semibold">
                          ${customerDeals?.reduce((sum, deal) => sum + deal.salePrice, 0).toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                    
                    {customerDeals?.length > 0 && (
                      <div className="space-y-2">
                        <Label>Recent Deals</Label>
                        {customerDeals.slice(0, 3).map(deal => (
                          <div key={deal.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{deal.vehicle?.year} {deal.vehicle?.make} {deal.vehicle?.model}</span>
                            <span className="text-sm font-semibold">${deal.salePrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a customer to view history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Deal Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle Price</Label>
                    <Input
                      type="number"
                      value={dealStructure.vehiclePrice}
                      onChange={(e) => setDealStructure(prev => ({
                        ...prev,
                        vehiclePrice: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Trade Value</Label>
                    <Input
                      type="number"
                      value={dealStructure.tradeValue}
                      onChange={(e) => setDealStructure(prev => ({
                        ...prev,
                        tradeValue: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Down Payment</Label>
                    <Input
                      type="number"
                      value={dealStructure.downPayment}
                      onChange={(e) => setDealStructure(prev => ({
                        ...prev,
                        downPayment: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>APR %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dealStructure.apr}
                      onChange={(e) => setDealStructure(prev => ({
                        ...prev,
                        apr: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Finance Term (months)</Label>
                  <Select
                    value={dealStructure.term.toString()}
                    onValueChange={(value) => setDealStructure(prev => ({
                      ...prev,
                      term: parseInt(value)
                    }))}
                  >
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
              </CardContent>
            </Card>

            {/* Deal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Vehicle Price</span>
                    <span>${dealStructure.vehiclePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product Sales</span>
                    <span>${totals.productTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Price</span>
                    <span>${totals.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Down</span>
                    <span>${totals.cashDown.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Finance Amount</span>
                    <span className="text-blue-600">${totals.financeAmount.toLocaleString()}</span>
                  </div>
                </div>

                {totals.financeAmount > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-700">
                      <p>Estimated Monthly Payment</p>
                      <p className="text-lg font-bold">${dealStructure.monthlyPayment.toLocaleString()}</p>
                      <p className="text-xs">at {dealStructure.apr}% APR for {dealStructure.term} months</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="space-y-4">
                  {customerInteractions?.map(interaction => (
                    <div key={interaction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{interaction.type}</h4>
                          <p className="text-sm text-muted-foreground">{interaction.description}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(interaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!customerInteractions || customerInteractions.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">
                      No interactions recorded for this customer
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Select a customer to view interactions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Active customer records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {deals?.filter(deal => deal.status === 'pending').length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Pending completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Deal Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${deals?.reduce((sum, deal) => sum + deal.salePrice, 0) / (deals?.length || 1) || 0}
                </div>
                <p className="text-sm text-muted-foreground">Across all deals</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}