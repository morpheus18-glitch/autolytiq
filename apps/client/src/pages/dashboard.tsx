import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Workflow, Shield, BarChart3, Users } from "lucide-react";
import AIUnifiedDashboard from "@/components/enterprise/ai-unified-dashboard";
import AIProductionSuite from "@/components/enterprise/ai-production-suite";
import AIAdvancedReporting from "@/components/enterprise/ai-advanced-reporting";
import AICustomerIntelligence from "@/components/enterprise/ai-customer-intelligence";
import AICustomerLifecycle from "../components/enterprise/ai-customer-lifecycle";
import AIWorkflowAutomation from "@/components/enterprise/ai-workflow-automation";
import AISystemHealth from "@/components/enterprise/ai-system-health";

export default function Dashboard() {
  return (
    <section className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="production" className="space-y-4 sm:space-y-6">
        <TabsList className="md:grid md:grid-cols-7">
          <TabsTrigger
            value="production"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-production"
          >
            <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Production</span>
            <span className="sm:hidden whitespace-nowrap">Prod</span>
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-overview"
          >
            <Target className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Overview</span>
            <span className="sm:hidden whitespace-nowrap">Over</span>
          </TabsTrigger>
          <TabsTrigger
            value="intelligence"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-intelligence"
          >
            <Brain className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Intelligence</span>
            <span className="sm:hidden whitespace-nowrap">AI</span>
          </TabsTrigger>
          <TabsTrigger
            value="lifecycle"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-lifecycle"
          >
            <Users className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Lifecycle</span>
            <span className="sm:hidden whitespace-nowrap">Life</span>
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-workflows"
          >
            <Workflow className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Automation</span>
            <span className="sm:hidden whitespace-nowrap">Auto</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-reports"
          >
            <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Reports</span>
            <span className="sm:hidden whitespace-nowrap">Rep</span>
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="min-h-[52px] md:min-h-0 data-[state=active]:shadow-sm"
            data-testid="tab-health"
          >
            <Shield className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Health</span>
            <span className="sm:hidden whitespace-nowrap">HP</span>
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
    </section>
  );
}
