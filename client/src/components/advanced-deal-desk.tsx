import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calculator, 
  FileText, 
  DollarSign, 
  CreditCard, 
  User, 
  Car,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Brain,
  Target,
  Zap,
  Save,
  Send,
  Download,
  RefreshCw,
  Settings,
  Shield,
  Award,
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface DealData {
  id: string;
  customerId: number;
  vehicleId: number;
  customerName: string;
  vehicleInfo: string;
  salePrice: number;
  tradeValue: number;
  downPayment: number;
  financingTerms: {
    lender: string;
    rate: number;
    term: number;
    monthlyPayment: number;
    totalAmount: number;
  };
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  aiInsights?: {
    profitMargin: number;
    riskScore: number;
    recommendations: string[];
    competitiveAnalysis: string;
    approvalProbability: number;
  };
}

interface AdvancedDealDeskProps {
  dealId?: string;
  customerId?: number;
  vehicleId?: number;
  onDealComplete?: (deal: DealData) => void;
}

export default function AdvancedDealDesk({ 
  dealId, 
  customerId, 
  vehicleId, 
  onDealComplete 
}: AdvancedDealDeskProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("calculator");
  const [dealData, setDealData] = useState<Partial<DealData>>({
    salePrice: 0,
    tradeValue: 0,
    downPayment: 0,
    status: 'draft'
  });

  // Fetch deal data if editing existing deal
  const { data: deal, isLoading: dealLoading } = useQuery<DealData>({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });

  // Fetch customer data
  const { data: customer } = useQuery({
    queryKey: [`/api/customers/${customerId || deal?.customerId}`],
    enabled: !!(customerId || deal?.customerId),
  });

  // Fetch vehicle data
  const { data: vehicle } = useQuery({
    queryKey: [`/api/vehicles/${vehicleId || deal?.vehicleId}`],
    enabled: !!(vehicleId || deal?.vehicleId),
  });

  // Fetch AI insights for deal
  const { data: aiInsights } = useQuery({
    queryKey: [`/api/deals/${dealId}/ai-insights`],
    enabled: !!dealId,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch available lenders
  const { data: lenders = [] } = useQuery({
    queryKey: ['/api/lenders'],
  });

  // Calculate financing
  const calculateFinancingMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", `/api/deals/calculate-financing`, params);
      return response.json();
    },
    onSuccess: (data) => {
      setDealData(prev => ({
        ...prev,
        financingTerms: data
      }));
    },
  });

  // Save deal
  const saveDealMutation = useMutation({
    mutationFn: async (data: Partial<DealData>) => {
      const url = dealId ? `/api/deals/${dealId}` : '/api/deals';
      const method = dealId ? 'PUT' : 'POST';
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Deal saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      onDealComplete?.(data);
    },
  });

  // Generate AI recommendations
  const generateAIInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/deals/${dealId}/generate-insights`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}/ai-insights`] });
      toast({ title: "AI insights generated" });
    },
  });

  useEffect(() => {
    if (deal) {
      setDealData(deal);
    }
  }, [deal]);

  const handleFieldChange = (field: string, value: any) => {
    setDealData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePayment = () => {
    const { salePrice = 0, tradeValue = 0, downPayment = 0 } = dealData;
    const financeAmount = salePrice - tradeValue - downPayment;
    
    calculateFinancingMutation.mutate({
      amount: financeAmount,
      customerId: customerId || deal?.customerId,
      vehicleId: vehicleId || deal?.vehicleId
    });
  };

  const totalDue = (dealData.salePrice || 0) - (dealData.tradeValue || 0);
  const financeAmount = totalDue - (dealData.downPayment || 0);
  const monthlyPayment = dealData.financingTerms?.monthlyPayment || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calculator className="w-6 h-6 mr-2" />
            Advanced Deal Desk
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {customer ? `${(customer as any).firstName} ${(customer as any).lastName}` : 'Customer Deal'} 
            {vehicle && ` - ${(vehicle as any).year} ${(vehicle as any).make} ${(vehicle as any).model}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={dealData.status === 'completed' ? 'default' : 'secondary'}>
            {dealData.status}
          </Badge>
          <Button 
            onClick={() => saveDealMutation.mutate(dealData)}
            disabled={saveDealMutation.isPending}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Deal
          </Button>
          {dealId && (
            <Button 
              onClick={() => generateAIInsightsMutation.mutate()}
              disabled={generateAIInsightsMutation.isPending}
              variant="outline"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </Button>
          )}
        </div>
      </div>

      {/* Main Deal Desk Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="financing">Financing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Deal Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sale-price">Sale Price</Label>
                  <Input
                    id="sale-price"
                    type="number"
                    value={dealData.salePrice || ''}
                    onChange={(e) => handleFieldChange('salePrice', parseFloat(e.target.value) || 0)}
                    placeholder="Enter sale price"
                  />
                </div>

                <div>
                  <Label htmlFor="trade-value">Trade Value</Label>
                  <Input
                    id="trade-value"
                    type="number"
                    value={dealData.tradeValue || ''}
                    onChange={(e) => handleFieldChange('tradeValue', parseFloat(e.target.value) || 0)}
                    placeholder="Trade-in value"
                  />
                </div>

                <div>
                  <Label htmlFor="down-payment">Down Payment</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    value={dealData.downPayment || ''}
                    onChange={(e) => handleFieldChange('downPayment', parseFloat(e.target.value) || 0)}
                    placeholder="Down payment amount"
                  />
                </div>

                <Button 
                  onClick={calculatePayment}
                  disabled={calculateFinancingMutation.isPending}
                  className="w-full"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Payment
                </Button>
              </CardContent>
            </Card>

            {/* Deal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sale Price:</span>
                    <span className="font-semibold">${(dealData.salePrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trade Value:</span>
                    <span className="font-semibold">-${(dealData.tradeValue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total Due:</span>
                    <span className="font-bold text-lg">${totalDue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Down Payment:</span>
                    <span className="font-semibold">-${(dealData.downPayment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Amount to Finance:</span>
                    <span className="font-bold text-lg text-blue-600">${financeAmount.toLocaleString()}</span>
                  </div>
                  {monthlyPayment > 0 && (
                    <div className="flex justify-between border-t pt-2">
                      <span>Monthly Payment:</span>
                      <span className="font-bold text-lg text-green-600">${monthlyPayment.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Vehicle Info */}
          {(customer || vehicle) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {customer && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <p className="font-semibold">{(customer as any).firstName} {(customer as any).lastName}</p>
                      <p className="text-gray-600">{(customer as any).email}</p>
                      <p className="text-gray-600">{(customer as any).phone}</p>
                      {(customer as any).creditScore && (
                        <p className="text-sm">Credit Score: <span className="font-medium">{(customer as any).creditScore}</span></p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {vehicle && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <p className="font-semibold">{(vehicle as any).year} {(vehicle as any).make} {(vehicle as any).model}</p>
                      <p className="text-gray-600">VIN: {(vehicle as any).vin}</p>
                      <p className="text-gray-600">Mileage: {(vehicle as any).mileage?.toLocaleString()} mi</p>
                      <p className="text-gray-600">Price: ${(vehicle as any).price.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Financing Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lender">Select Lender</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose lender" />
                    </SelectTrigger>
                    <SelectContent>
                      {(lenders as any[]).map((lender: any) => (
                        <SelectItem key={lender.id} value={lender.id}>
                          {lender.name} - {lender.rate}% APR
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="term">Loan Term (months)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
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

                <div>
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5.99"
                  />
                </div>

                <Button className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Terms
                </Button>
              </CardContent>
            </Card>

            {/* Financing Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Current Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dealData.financingTerms ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Lender:</span>
                      <span className="font-semibold">{dealData.financingTerms.lender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-semibold">{dealData.financingTerms.rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Term:</span>
                      <span className="font-semibold">{dealData.financingTerms.term} months</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Monthly Payment:</span>
                      <span className="font-bold text-lg text-green-600">
                        ${dealData.financingTerms.monthlyPayment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-semibold">${dealData.financingTerms.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No financing terms calculated yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Sales Contract", status: "pending", type: "contract" },
              { name: "Credit Application", status: "completed", type: "credit" },
              { name: "Trade Documentation", status: "pending", type: "trade" },
              { name: "Insurance Verification", status: "pending", type: "insurance" },
              { name: "Registration Forms", status: "pending", type: "registration" },
              { name: "F&I Products", status: "pending", type: "fi" }
            ].map((doc, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {doc.name}
                    </span>
                    <Badge variant={doc.status === 'completed' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          {aiInsights || dealData.aiInsights ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Profit Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Profit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profit Margin</span>
                      <span>{dealData.aiInsights?.profitMargin || 0}%</span>
                    </div>
                    <Progress value={dealData.aiInsights?.profitMargin || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Approval Probability</span>
                      <span>{dealData.aiInsights?.approvalProbability || 0}%</span>
                    </div>
                    <Progress value={dealData.aiInsights?.approvalProbability || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Risk Score</span>
                      <span>{dealData.aiInsights?.riskScore || 0}/100</span>
                    </div>
                    <Progress 
                      value={dealData.aiInsights?.riskScore || 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dealData.aiInsights?.recommendations?.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    )) || (
                      <p className="text-gray-600 text-center py-4">No recommendations available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Competitive Analysis */}
              {dealData.aiInsights?.competitiveAnalysis && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Competitive Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{dealData.aiInsights.competitiveAnalysis}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No AI insights available yet</p>
                <Button 
                  onClick={() => generateAIInsightsMutation.mutate()}
                  disabled={generateAIInsightsMutation.isPending}
                >
                  Generate AI Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Deal Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Financial Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sale Price:</span>
                      <span>${(dealData.salePrice || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trade Value:</span>
                      <span>${(dealData.tradeValue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment:</span>
                      <span>${(dealData.downPayment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Monthly Payment:</span>
                      <span>${(dealData.financingTerms?.monthlyPayment || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Status & Actions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Deal Status:</span>
                      <Badge variant={dealData.status === 'completed' ? 'default' : 'secondary'}>
                        {dealData.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Deal
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}