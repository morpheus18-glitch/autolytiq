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
    <div className="w-full min-h-screen pb-6">
      <div className="px-4 md:px-6 pt-4">
        <Tabs defaultValue="production" className="space-y-4">
          <div className="mobile-tabs overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <TabsList className="inline-flex w-max md:grid md:w-full md:grid-cols-7 h-12 md:h-10 gap-1">
          <TabsTrigger value="production" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Production</span>
            <span className="sm:hidden whitespace-nowrap">Prod</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <Target className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Overview</span>
            <span className="sm:hidden whitespace-nowrap">Over</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <Brain className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Intelligence</span>
            <span className="sm:hidden whitespace-nowrap">AI</span>
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Lifecycle</span>
            <span className="sm:hidden whitespace-nowrap">Life</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <Workflow className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Automation</span>
            <span className="sm:hidden whitespace-nowrap">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Reports</span>
            <span className="sm:hidden whitespace-nowrap">Rep</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4">
            <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Health</span>
            <span className="sm:hidden whitespace-nowrap">HP</span>
          </TabsTrigger>
            </TabsList>
          </div>

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
    </div>
  );
}
