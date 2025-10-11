import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Workflow, BarChart3, Users, Shield } from "lucide-react";
import UniformPage from "@/components/layout/uniform-page";
import AIUnifiedDashboard from "@/components/enterprise/ai-unified-dashboard";
import AIProductionSuite from "@/components/enterprise/ai-production-suite";
import AIAdvancedReporting from "@/components/enterprise/ai-advanced-reporting";
import AICustomerIntelligence from "@/components/enterprise/ai-customer-intelligence";
import AICustomerLifecycle from "../components/enterprise/ai-customer-lifecycle";
import AIWorkflowAutomation from "@/components/enterprise/ai-workflow-automation";
import AISystemHealth from "@/components/enterprise/ai-system-health";

export default function Dashboard() {
  return (
    <UniformPage 
      title="Dashboard" 
      subtitle="Enterprise dealership overview and analytics"
    >
      <Tabs defaultValue="production" className="space-y-4">
        <div className="mobile-tabs overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <TabsList className="inline-flex w-max md:grid md:w-full md:grid-cols-7 h-12 md:h-10 gap-1">
            <TabsTrigger 
              value="production" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-production"
            >
              <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Production</span>
              <span className="sm:hidden whitespace-nowrap">Prod</span>
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-overview"
            >
              <Target className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Overview</span>
              <span className="sm:hidden whitespace-nowrap">Over</span>
            </TabsTrigger>
            <TabsTrigger 
              value="intelligence" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-intelligence"
            >
              <Brain className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Intelligence</span>
              <span className="sm:hidden whitespace-nowrap">AI</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lifecycle" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-lifecycle"
            >
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Lifecycle</span>
              <span className="sm:hidden whitespace-nowrap">Life</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workflows" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-workflows"
            >
              <Workflow className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Automation</span>
              <span className="sm:hidden whitespace-nowrap">Auto</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-reports"
            >
              <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Reports</span>
              <span className="sm:hidden whitespace-nowrap">Rep</span>
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="mobile-tab-item text-sm min-h-[48px] md:min-h-0 px-4"
              data-testid="tab-health"
            >
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
    </UniformPage>
  );
}
