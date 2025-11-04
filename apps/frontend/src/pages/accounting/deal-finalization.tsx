import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, FileText, Calculator, CreditCard, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DealFinalizationProps {
  dealId?: string;
  customerId?: string;
  vehicleId?: string;
}

interface FinanceReserves {
  warrantyReserve: number;
  gapReserve: number;
  maintReserve: number;
  serviceContractReserve: number;
}

interface JournalEntry {
  id: number;
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  description: string;
  dealId?: string;
}

export default function DealFinalization({ dealId, customerId, vehicleId }: DealFinalizationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [financeReserves, setFinanceReserves] = useState<FinanceReserves>({
    warrantyReserve: 0,
    gapReserve: 0,
    maintReserve: 0,
    serviceContractReserve: 0
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample data for demo
  const sampleDeal = {
    dealNumber: "D-2024-001",
    salePrice: 28500,
    cost: 22000,
    tradeValue: 5000,
    financeAmount: 23500,
    status: "pending"
  };

  const sampleCustomer = {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    creditScore: 750
  };

  const sampleVehicle = {
    year: 2024,
    make: "Toyota",
    model: "Camry",
    vin: "1N4AL3AP0HC123456",
    stockNumber: "T24-001",
    cost: 22000
  };

  const sampleChartAccounts = [
    { id: 1, accountNumber: "1000", accountName: "Cash", accountType: "Asset" },
    { id: 2, accountNumber: "4100", accountName: "Vehicle Sales", accountType: "Revenue" },
    { id: 3, accountNumber: "5000", accountName: "Cost of Goods Sold", accountType: "Expense" }
  ];

  // Calculate profit
  const calculateProfit = () => {
    const frontEnd = sampleDeal.salePrice - sampleDeal.cost;
    const backEnd = Object.values(financeReserves).reduce((sum, reserve) => sum + reserve, 0);
    const total = frontEnd + backEnd;
    const profitMargin = ((total / sampleDeal.salePrice) * 100).toFixed(2);
    
    return {
      frontEnd,
      backEnd,
      total,
      profitMargin: `${profitMargin}%`
    };
  };

  const profitCalculation = calculateProfit();

  // Finalize deal mutation
  const finalizeDealMutation = useMutation({
    mutationFn: async (finalizationData: any) => {
      return await apiRequest("POST", `/api/accounting/finalize-deal/${dealId}`, finalizationData);
    },
    onSuccess: () => {
      toast({
        title: "Deal Finalized",
        description: "Deal has been successfully finalized and posted to accounting."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting'] });
    }
  });

  const handleFinalizeDeal = () => {
    const finalizationData = {
      dealId,
      customerId,
      vehicleId,
      financeReserves,
      journalEntries,
      profitCalculation,
      finalizedAt: new Date().toISOString(),
      finalizedBy: "current_user"
    };

    finalizeDealMutation.mutate(finalizationData);
  };

  const addJournalEntry = (debitAccount: string, creditAccount: string, amount: number, description: string) => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      debitAccount,
      creditAccount,
      amount,
      description,
      dealId
    };

    setJournalEntries(prev => [...prev, newEntry]);
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-lg md:text-2xl font-bold">Deal Finalization</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Deal #{sampleDeal.dealNumber} - Complete deal processing and accounting entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleFinalizeDeal}
            disabled={finalizeDealMutation.isPending}
            size="sm"
            className="flex-1 md:flex-none"
          >
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">
              {finalizeDealMutation.isPending ? "Finalizing..." : "Finalize Deal"}
            </span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Mobile Optimized Tabs */}
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-4 w-full min-w-[400px] md:min-w-full h-auto bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="overview" className="text-xs md:text-sm px-2 md:px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs md:text-sm px-2 md:px-4 py-2">
              Profit Analysis
            </TabsTrigger>
            <TabsTrigger value="reserves" className="text-xs md:text-sm px-2 md:px-4 py-2">
              F&I Reserves
            </TabsTrigger>
            <TabsTrigger value="journal" className="text-xs md:text-sm px-2 md:px-4 py-2">
              Journal Entries
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Deal Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-3 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">{sampleCustomer.firstName} {sampleCustomer.lastName}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {sampleCustomer.email}
                </div>
                <Badge variant={sampleCustomer.creditScore >= 700 ? "default" : "secondary"} className="text-xs">
                  Credit: {sampleCustomer.creditScore}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-2">
                <div className="text-sm font-medium">
                  {sampleVehicle.year} {sampleVehicle.make} {sampleVehicle.model}
                </div>
                <div className="text-xs text-muted-foreground">
                  VIN: {sampleVehicle.vin}
                </div>
                <div className="text-xs text-muted-foreground">
                  Stock: {sampleVehicle.stockNumber}
                </div>
                <div className="text-xs font-medium">
                  Cost: ${sampleVehicle.cost.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Sale Price:</span>
                  <span className="font-medium">${sampleDeal.salePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Trade Value:</span>
                  <span className="font-medium">${sampleDeal.tradeValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Finance Amount:</span>
                  <span className="font-medium">${sampleDeal.financeAmount.toLocaleString()}</span>
                </div>
                <Badge variant={sampleDeal.status === 'finalized' ? 'default' : 'secondary'} className="text-xs">
                  {sampleDeal.status}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-lg">Profit Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-green-600">
                    ${profitCalculation.frontEnd.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Front End</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">
                    ${profitCalculation.backEnd.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Back End</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-purple-600">
                    ${profitCalculation.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Profit</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-orange-600">
                    {profitCalculation.profitMargin}
                  </div>
                  <div className="text-xs text-muted-foreground">Margin</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vehicle Cost:</span>
                    <span>${sampleVehicle.cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recon Cost:</span>
                    <span>$850</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pack Fee:</span>
                    <span>$399</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Total Cost:</span>
                    <span>${(sampleVehicle.cost + 850 + 399).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reserves" className="space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-lg">Finance & Insurance Reserves</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-xs md:text-sm">Warranty Reserve</Label>
                  <Input
                    id="warranty"
                    type="number"
                    value={financeReserves.warrantyReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      warrantyReserve: Number(e.target.value)
                    }))}
                    className="h-8 md:h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gap" className="text-xs md:text-sm">GAP Reserve</Label>
                  <Input
                    id="gap"
                    type="number"
                    value={financeReserves.gapReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      gapReserve: Number(e.target.value)
                    }))}
                    className="h-8 md:h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maint" className="text-xs md:text-sm">Maintenance Reserve</Label>
                  <Input
                    id="maint"
                    type="number"
                    value={financeReserves.maintReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      maintReserve: Number(e.target.value)
                    }))}
                    className="h-8 md:h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-xs md:text-sm">Service Contract Reserve</Label>
                  <Input
                    id="service"
                    type="number"
                    value={financeReserves.serviceContractReserve}
                    onChange={(e) => setFinanceReserves(prev => ({
                      ...prev,
                      serviceContractReserve: Number(e.target.value)
                    }))}
                    className="h-8 md:h-10 text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total F&I Reserves:</span>
                  <span className="text-lg font-bold">
                    ${Object.values(financeReserves).reduce((sum, reserve) => sum + reserve, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-lg">Journal Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-3">
                <Button
                  onClick={() => addJournalEntry("1000", "4100", sampleDeal.salePrice, "Vehicle Sale")}
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
                  <Calculator className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Auto-Generate Entries
                </Button>

                {journalEntries.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Generated Entries:</h4>
                    {journalEntries.map((entry) => (
                      <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Debit:</span> {entry.debitAccount}
                          </div>
                          <div>
                            <span className="font-medium">Credit:</span> {entry.creditAccount}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ${entry.amount.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Description:</span> {entry.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}