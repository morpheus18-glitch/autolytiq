import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Workflow, Zap, Star, Shield, BarChart3, Users, Settings } from "lucide-react";
import { Link } from "wouter";
import AIUnifiedDashboard from "@/components/enterprise/ai-unified-dashboard";
import AIProductionSuite from "@/components/enterprise/ai-production-suite";
import AIAdvancedReporting from "@/components/enterprise/ai-advanced-reporting";
import AICustomerIntelligence from "@/components/enterprise/ai-customer-intelligence";
import AICustomerLifecycle from "../components/enterprise/ai-customer-lifecycle";
import AIWorkflowAutomation from "@/components/enterprise/ai-workflow-automation";
import AISystemHealth from "@/components/enterprise/ai-system-health";
// Enhanced dual CRM/DMS components
// import EnhancedVehicleListing from "@/components/enhanced-vehicle-listing";
// import SmartCRMAssistant from "@/components/smart-crm-assistant";
// import IntelligentInventoryManager from "@/components/intelligent-inventory-manager";


export default function Dashboard() {
  const headerActions = (
    <Link href="/workflow-assistant">
      <Button className="flex items-center gap-2">
        <Workflow className="w-4 h-4" />
        Smart Workflows
      </Button>
    </Link>
  );

  return (
    <div className="space-y-6">


      <Tabs defaultValue="production" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-10">
          <TabsTrigger value="production" className="text-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Production</span>
            <span className="sm:hidden">Prod</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-sm">
            <Target className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Over</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="text-sm">
            <Brain className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Intelligence</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Lifecycle</span>
            <span className="sm:hidden">Life</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-sm">
            <Workflow className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Automation</span>
            <span className="sm:hidden">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Reports</span>
            <span className="sm:hidden">Rep</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="text-sm">
            <Shield className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Health</span>
            <span className="sm:hidden">HP</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production">
          <AIProductionSuite />
        </TabsContent>

        <TabsContent value="overview">
          <AIUnifiedDashboard />
        </TabsContent>

        <TabsContent value="intelligence">
          <AICustomerIntelligence />
        </TabsContent>

        <TabsContent value="lifecycle">
          <AICustomerLifecycle />
        </TabsContent>

        <TabsContent value="workflows">
          <AIWorkflowAutomation />
        </TabsContent>

        <TabsContent value="reports">
          <AIAdvancedReporting />
        </TabsContent>

        <TabsContent value="health">
          <AISystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// AI Insights Component
function AIInsightsDashboard() {
  const insightsData = {
    customerSegments: [
      { name: "High-Value Prospects", count: 23, score: 95, trend: "+12%" },
      { name: "Ready to Buy", count: 47, score: 88, trend: "+5%" },
      { name: "Price Sensitive", count: 89, score: 72, trend: "-2%" },
      { name: "Luxury Seekers", count: 31, score: 91, trend: "+8%" }
    ],
    inventoryInsights: [
      { category: "SUVs", demand: 92, supply: 76, recommendation: "Increase inventory" },
      { category: "Sedans", demand: 67, supply: 89, recommendation: "Price adjustment needed" },
      { category: "Trucks", demand: 84, supply: 82, recommendation: "Well balanced" },
      { category: "Hybrids", demand: 95, supply: 45, recommendation: "High demand, low supply" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Customer Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insightsData.customerSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{segment.name}</h4>
                    <p className="text-sm text-gray-600">{segment.count} customers</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Score: {segment.score}</Badge>
                      <Badge 
                        variant={segment.trend.startsWith('+') ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {segment.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Inventory Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insightsData.inventoryInsights.map((insight, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.category}</h4>
                    <Badge 
                      variant={
                        insight.recommendation.includes('Increase') ? 'default' : 
                        insight.recommendation.includes('adjustment') ? 'secondary' : 
                        'outline'
                      }
                      className="text-xs"
                    >
                      {insight.recommendation}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Demand:</span>
                      <span className="ml-2 font-medium">{insight.demand}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Supply:</span>
                      <span className="ml-2 font-medium">{insight.supply}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}