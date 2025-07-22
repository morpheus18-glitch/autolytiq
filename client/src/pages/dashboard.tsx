import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Workflow, Zap, Star } from "lucide-react";
import { Link } from "wouter";
import UnifiedDashboard from "@/components/unified-dashboard";
import WorkflowIntegration from "@/components/workflow-integration";
import { EnterpriseDashboardIntegration } from "@/components/enterprise/enterprise-dashboard-integration";
// Enhanced dual CRM/DMS components
// import EnhancedVehicleListing from "@/components/enhanced-vehicle-listing";
// import SmartCRMAssistant from "@/components/smart-crm-assistant";
// import IntelligentInventoryManager from "@/components/intelligent-inventory-manager";
// import AdvancedDealDesk from "@/components/advanced-deal-desk";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Comprehensive view of your dealership operations</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link href="/workflow-assistant">
            <Button className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
              <Workflow className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Smart Workflows</span>
              <span className="sm:hidden">Workflows</span>
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-2">Overview</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs sm:text-sm px-1 sm:px-2">Workflows</TabsTrigger>
          <TabsTrigger value="enterprise" className="text-xs sm:text-sm px-1 sm:px-2">Enterprise</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm px-1 sm:px-2">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UnifiedDashboard />
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowIntegration />
        </TabsContent>

        <TabsContent value="enterprise">
          <EnterpriseDashboardIntegration />
        </TabsContent>

        <TabsContent value="insights">
          <AIInsightsDashboard />
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