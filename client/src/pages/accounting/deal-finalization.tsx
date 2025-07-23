import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, DollarSign, FileText, Calculator, CreditCard, Send, AlertTriangle, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DealFinalizationProps {
  dealId?: string;
  customerId?: string;
  vehicleId?: string;
}

export default function DealFinalization({ dealId, customerId, vehicleId }: DealFinalizationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [financeReserves, setFinanceReserves] = useState({
    warrantyReserve: 0,
    gapReserve: 0,
    maintReserve: 0,
    serviceContractReserve: 0
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [profitCalculation, setProfitCalculation] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deal data with CRM/inventory integration
  const { data: dealData, isLoading: dealLoading } = useQuery({
    queryKey: ['/api/deals', dealId],
    enabled: !!dealId
  });

  const { data: customerData } = useQuery({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId
  });

  const { data: vehicleData } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId
  });

  const { data: chartOfAccounts } = useQuery({
    queryKey: ['/api/accounting/chart-of-accounts']
  });

  const { data: dealProfitAnalysis } = useQuery({
    queryKey: ['/api/accounting/deal-profit', dealId],
    enabled: !!dealId
  });

  // Mutations for deal finalization
  const finalizeDealMutation = useMutation({
    mutationFn: async (finalizationData) => {
      return await apiRequest("POST", `/api/accounting/finalize-deal/${dealId}`, finalizationData);
    },
    onSuccess: () => {
      toast({
        title: "Deal Finalized",
        description: "Deal has been successfully finalized and posted to accounting."
      });
      queryClient.invalidateQueries(['/api/deals']);
      queryClient.invalidateQueries(['/api/accounting']);
    }
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: async (entryData) => {
      return await apiRequest("POST", "/api/accounting/journal-entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/accounting/journal-entries']);
      toast({ title: "Journal Entry Created" });
    }
  });

  const pushToEContractMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/integrations/econtract/push/${dealId}`);
    },
    onSuccess: () => {
      toast({
        title: "eContract Pushed",
        description: "Deal documents have been sent to eContract system."
      });
    }
  });

  // Calculate total deal profit
  const calculateDealProfit = () => {
    if (!dealData || !vehicleData) return 0;
    
    const frontEndProfit = (dealData.salePrice - vehicleData.cost) || 0;
    const backEndProfit = Object.values(financeReserves).reduce((sum, reserve) => sum + reserve, 0);
    const totalProfit = frontEndProfit + backEndProfit;
    
    return {
      frontEnd: frontEndProfit,
      backEnd: backEndProfit,
      total: totalProfit,
      profitMargin: dealData.salePrice ? ((totalProfit / dealData.salePrice) * 100).toFixed(2) : 0
    };
  };

  const profit = calculateDealProfit();

  const handleFinalizeDeal = () => {
    const finalizationData = {
      dealId,
      customerId,
      vehicleId,
      financeReserves,
      journalEntries,
      profitCalculation: profit,
      status: 'finalized',
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'current-user' // Replace with actual user
    };

    finalizeDealMutation.mutate(finalizationData);
  };

  const addJournalEntry = (debitAccount, creditAccount, amount, description) => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      debitAccount,
      creditAccount,
      amount,
      description,
      dealId
    };
    setJournalEntries(prev => [...prev, entry]);
  };

  if (dealLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deal Finalization</h1>
          <p className="text-muted-foreground">
            Complete accounting integration for Deal #{dealData?.dealNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => pushToEContractMutation.mutate()}
            variant="outline"
            disabled={pushToEContractMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            Push to eContract
          </Button>
          <Button
            onClick={handleFinalizeDeal}
            disabled={finalizeDealMutation.isPending || !dealData}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalize Deal
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="reserves">Finance Reserves</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{customerData?.firstName} {customerData?.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{customerData?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Credit Score</Label>
                  <Badge variant={customerData?.creditScore >= 700 ? "default" : "destructive"}>
                    {customerData?.creditScore}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Vehicle</Label>
                  <p className="text-sm">{vehicleData?.year} {vehicleData?.make} {vehicleData?.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">VIN</Label>
                  <p className="text-sm font-mono">{vehicleData?.vin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Stock #</Label>
                  <p className="text-sm">{vehicleData?.stockNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cost</Label>
                  <p className="text-sm font-semibold">${vehicleData?.cost?.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Deal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Sale Price</Label>
                  <p className="text-lg font-bold text-green-600">${dealData?.salePrice?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trade Value</Label>
                  <p className="text-sm">${dealData?.tradeValue?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Finance Amount</Label>
                  <p className="text-sm">${dealData?.financeAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={dealData?.status === 'pending' ? "outline" : "default"}>
                    {dealData?.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Profit Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Front-End Profit</span>
                  <span className="font-semibold text-green-600">${profit.frontEnd?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Back-End Profit</span>
                  <span className="font-semibold text-blue-600">${profit.backEnd?.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Profit</span>
                  <span className="text-green-600">${profit.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Profit Margin</span>
                  <Badge variant={profit.profitMargin > 15 ? "default" : "secondary"}>
                    {profit.profitMargin}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Purchase Cost</span>
                  <span>${vehicleData?.cost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reconditioning</span>
                  <span>${vehicleData?.reconCost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pack Fee</span>
                  <span>${vehicleData?.packFee?.toLocaleString() || 599}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Investment</span>
                  <span>${((vehicleData?.cost || 0) + (vehicleData?.reconCost || 0) + (vehicleData?.packFee || 599)).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reserves" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Finance Reserve Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Warranty Reserve</Label>
                  <Input
                    type="number"
                    value={financeReserves.warrantyReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      warrantyReserve: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>GAP Insurance Reserve</Label>
                  <Input
                    type="number"
                    value={financeReserves.gapReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      gapReserve: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maintenance Reserve</Label>
                  <Input
                    type="number"
                    value={financeReserves.maintReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      maintReserve: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Contract Reserve</Label>
                  <Input
                    type="number"
                    value={financeReserves.serviceContractReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      serviceContractReserve: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Reserve Distribution Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="sm">50/50 Split</Button>
                  <Button variant="outline" size="sm">60/40 Split</Button>
                  <Button variant="outline" size="sm">70/30 Split</Button>
                  <Button variant="outline" size="sm">Custom %</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Journal Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntries.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Debit Account</Label>
                        <p className="text-sm">{entry.debitAccount}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Credit Account</Label>
                        <p className="text-sm">{entry.creditAccount}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <p className="text-sm font-semibold">${entry.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <p className="text-sm">{entry.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Journal Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Journal Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Debit Account</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {chartOfAccounts?.map(account => (
                                <SelectItem key={account.id} value={account.code}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Credit Account</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {chartOfAccounts?.map(account => (
                                <SelectItem key={account.id} value={account.code}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input placeholder="Entry description" />
                      </div>
                      <Button className="w-full">Add Entry</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>eContract Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Document Status</span>
                  <Badge variant="outline">Ready to Push</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contract Type</span>
                  <span>Retail Installment</span>
                </div>
                <Button 
                  onClick={() => pushToEContractMutation.mutate()}
                  disabled={pushToEContractMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Push to eContract
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>CRM Integration</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inventory Sync</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Accounting Posts</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Finance Reserve Calc</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}