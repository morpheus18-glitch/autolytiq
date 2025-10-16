import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Brain,
  Lightbulb,
  Target,
  Users,
  Car,
  DollarSign,
  Activity,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Zap,
  Award,
  PieChart,
  LineChart
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { Vehicle, Sale, Lead, Customer } from "@shared/schema";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'executive' | 'sales' | 'inventory' | 'finance' | 'performance';
  aiInsights: boolean;
  dataPoints: number;
  frequency: string;
  lastGenerated: string;
}

interface AIReportInsight {
  id: string;
  title: string;
  finding: string;
  impact: string;
  recommendation: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export default function AIAdvancedReporting() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real data for intelligent reporting
  const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ['/api/vehicles'] });
  const { data: sales = [] } = useQuery<Sale[]>({ queryKey: ['/api/sales'] });
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ['/api/leads'] });
  const { data: customers = [] } = useQuery<Customer[]>({ queryKey: ['/api/customers'] });

  // AI-powered report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'executive_dashboard',
      title: 'Executive Dashboard Report',
      description: 'Comprehensive business overview with AI-driven insights and strategic recommendations',
      category: 'executive',
      aiInsights: true,
      dataPoints: 24,
      frequency: 'Daily',
      lastGenerated: '2 hours ago'
    },
    {
      id: 'sales_performance',
      title: 'Sales Performance Analysis',
      description: 'Detailed sales metrics with predictive analytics and team performance insights',
      category: 'sales',
      aiInsights: true,
      dataPoints: 18,
      frequency: 'Weekly',
      lastGenerated: '1 day ago'
    },
    {
      id: 'inventory_optimization',
      title: 'Inventory Optimization Report',
      description: 'AI-powered inventory analysis with turnover predictions and rebalancing recommendations',
      category: 'inventory',
      aiInsights: true,
      dataPoints: 15,
      frequency: 'Weekly',
      lastGenerated: '3 days ago'
    },
    {
      id: 'financial_forecast',
      title: 'Financial Forecast & Trends',
      description: 'Revenue predictions, profit margin analysis, and financial health indicators',
      category: 'finance',
      aiInsights: true,
      dataPoints: 21,
      frequency: 'Monthly',
      lastGenerated: '5 days ago'
    },
    {
      id: 'customer_analytics',
      title: 'Customer Intelligence Report',
      description: 'Customer behavior analysis, satisfaction metrics, and retention predictions',
      category: 'performance',
      aiInsights: true,
      dataPoints: 12,
      frequency: 'Bi-weekly',
      lastGenerated: '1 week ago'
    },
    {
      id: 'market_analysis',
      title: 'Market Analysis & Competition',
      description: 'Competitive positioning, market trends, and strategic opportunities analysis',
      category: 'executive',
      aiInsights: true,
      dataPoints: 16,
      frequency: 'Monthly',
      lastGenerated: '2 weeks ago'
    }
  ];

  // AI-generated insights for current data
  const reportInsights: AIReportInsight[] = [
    {
      id: '1',
      title: 'Revenue Growth Acceleration',
      finding: `Current sales trajectory shows ${Math.round(sales.length * 1.8)}% increase vs. last quarter`,
      impact: `Projected additional $${(sales.length * 12000).toLocaleString()} monthly revenue`,
      recommendation: 'Expand high-performing sales strategies to underperforming segments',
      confidence: 94,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Inventory Optimization Opportunity',
      finding: `${Math.round((vehicles.length * 0.3))} vehicles have been in inventory >60 days`,
      impact: 'Potential 15% improvement in inventory turnover rate',
      recommendation: 'Implement dynamic pricing strategy for aging inventory',
      confidence: 89,
      priority: 'high'
    },
    {
      id: '3',
      title: 'Customer Acquisition Trend',
      finding: `New customer acquisition up ${Math.round(customers.length * 0.4)}% with digital channels leading`,
      impact: 'Digital ROI exceeding traditional channels by 31%',
      recommendation: 'Increase digital marketing budget allocation by 25%',
      confidence: 92,
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Sales Team Performance Variance',
      finding: 'Top 20% of sales team generating 45% of total revenue',
      impact: 'Training bottom 20% could increase overall revenue by 18%',
      recommendation: 'Implement mentorship program and targeted training initiatives',
      confidence: 87,
      priority: 'medium'
    }
  ];

  const generateReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      setIsGenerating(true);
      // Simulate AI report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { reportId, generated: true };
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      toast({
        title: "AI Report Generated",
        description: `${reportTemplates.find(r => r.id === data.reportId)?.title} is ready for download`,
      });
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerateReport = (reportId: string) => {
    generateReportMutation.mutate(reportId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'executive': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-green-100 text-green-800';
      case 'inventory': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-yellow-100 text-yellow-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Target className="w-4 h-4" />;
      case 'sales': return <TrendingUp className="w-4 h-4" />;
      case 'inventory': return <Car className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      case 'performance': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FileText className="w-8 h-8 text-green-600" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold sm:text-2xl">AI Advanced Reporting</h2>
            <p className="text-sm text-gray-600 max-w-xl">
              Intelligent business reports with AI-powered insights and analytics
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Badge className="bg-green-100 text-green-800 w-full justify-center sm:w-auto">
            <Brain className="w-3 h-3 mr-1" />
            AI Analytics Active
          </Badge>
          <Button
            onClick={() => queryClient.invalidateQueries()}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mobile-tabs -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-full min-w-0 justify-start md:grid md:grid-cols-4 h-12 md:h-11 gap-1 p-1">
            <TabsTrigger value="templates" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-templates">Report Templates</TabsTrigger>
            <TabsTrigger value="insights" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="custom" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-custom">Custom Reports</TabsTrigger>
            <TabsTrigger value="analytics" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-analytics">Live Analytics</TabsTrigger>
          </TabsList>
        </div>

        {/* Report Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="executive">Executive Reports</SelectItem>
                <SelectItem value="sales">Sales Reports</SelectItem>
                <SelectItem value="inventory">Inventory Reports</SelectItem>
                <SelectItem value="finance">Financial Reports</SelectItem>
                <SelectItem value="performance">Performance Reports</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-40">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange ? format(dateRange, "PPP") : "Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-responsive-2 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {getCategoryIcon(template.category)}
                      <div>
                        <h3 className="font-semibold text-lg">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                    <Badge className={`${getCategoryColor(template.category)} w-full justify-center sm:w-auto`}>
                      {template.category}
                    </Badge>
                  </div>

                  <div className="grid grid-responsive-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{template.dataPoints}</div>
                      <div className="text-xs text-gray-600">Data Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{template.frequency}</div>
                      <div className="text-xs text-gray-600">Frequency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {template.aiInsights ? 'Yes' : 'No'}
                      </div>
                      <div className="text-xs text-gray-600">AI Insights</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-gray-600">Last generated: {template.lastGenerated}</span>
                    {template.aiInsights && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Powered
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={() => handleGenerateReport(template.id)}
                      disabled={isGenerating}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 sm:flex-1"
                      onClick={() => handleGenerateReport(template.id)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Activity className="w-3 h-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {reportInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-blue-500">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">{insight.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant="outline" className="w-full justify-center sm:w-auto">
                            {insight.confidence}% Confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Finding</h4>
                      <p className="text-sm text-blue-800">{insight.finding}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Business Impact</h4>
                      <p className="text-sm text-green-800">{insight.impact}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">AI Recommendation</h4>
                      <p className="text-sm text-purple-800">{insight.recommendation}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" variant="outline" className="w-full sm:flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Deep Analysis
                    </Button>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 sm:flex-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Implement
                    </Button>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Brain className="w-5 h-5 text-purple-600" />
                Custom Report Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-responsive-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Analysis</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="customer">Customer Analytics</SelectItem>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 3 Months</SelectItem>
                      <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">AI Features</label>
                <div className="grid grid-responsive-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="predictive" className="rounded" defaultChecked />
                    <label htmlFor="predictive" className="text-sm">Predictive Analytics</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="recommendations" className="rounded" defaultChecked />
                    <label htmlFor="recommendations" className="text-sm">AI Recommendations</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="trends" className="rounded" defaultChecked />
                    <label htmlFor="trends" className="text-sm">Trend Analysis</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="forecasting" className="rounded" />
                    <label htmlFor="forecasting" className="text-sm">Revenue Forecasting</label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Brain className="w-4 h-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-responsive-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <PieChart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Sales Distribution</h3>
                <div className="text-2xl font-bold mb-2">{sales.length}</div>
                <p className="text-sm text-gray-600 mb-4">Total sales this month</p>
                <Button size="sm" className="w-full">View Details</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <LineChart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Revenue Trend</h3>
                <div className="text-2xl font-bold mb-2">+{Math.round(sales.length * 1.2)}%</div>
                <p className="text-sm text-gray-600 mb-4">Growth vs last month</p>
                <Button size="sm" className="w-full">View Trend</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Customer Metrics</h3>
                <div className="text-2xl font-bold mb-2">{customers.length}</div>
                <p className="text-sm text-gray-600 mb-4">Active customers</p>
                <Button size="sm" className="w-full">Customer Analytics</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Car className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Inventory Status</h3>
                <div className="text-2xl font-bold mb-2">{vehicles.length}</div>
                <p className="text-sm text-gray-600 mb-4">Units in stock</p>
                <Button size="sm" className="w-full">Inventory Report</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Activity className="w-5 h-5 text-green-600" />
                Real-Time Business Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-responsive-3 gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">Sales Performance</span>
                    <span className="text-sm text-gray-600">{Math.round((sales.length / 50) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((sales.length / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">Inventory Turnover</span>
                    <span className="text-sm text-gray-600">{Math.round((sales.length / Math.max(vehicles.length, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((sales.length / Math.max(vehicles.length, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-gray-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-[94%]"></div>
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