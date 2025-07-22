import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory-enhanced";
import VehicleDetail from "@/pages/vehicle-detail";
import Sales from "@/pages/sales-enhanced";
import SalesMobileEnhanced from "@/pages/sales-mobile-enhanced";
import Customers from "@/pages/customers-enhanced";
import CustomerDetail from "@/pages/customer-detail";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import CompetitivePricing from "@/pages/competitive-pricing";
import Reports from "@/pages/reports";
import MLDashboard from "@/pages/ml-dashboard";
import ShowroomManager from "@/pages/showroom-manager";
// Deal Pages
import DealsPage from "@/pages/deals/index";
import DealDetailPage from "@/pages/deals/[id]/index";
import DealDesk from "@/pages/deal-desk";
import Deals from "@/pages/deals";
import DealsUnified from "@/pages/deals-unified";
// Admin Pages
import SystemSettings from "@/pages/admin/system-settings";
import ComprehensiveSettings from "@/pages/admin/comprehensive-settings";
import LeadDistribution from "@/pages/admin/lead-distribution";
// Service Pages
import ServiceOrdersPage from "@/pages/service/service-orders";
import PartsInventoryPage from "@/pages/service/parts";
import ServiceReportsPage from "@/pages/service/reports";
// Accounting Pages
import FinancialReportsPage from "@/pages/accounting/reports";
import PayrollPage from "@/pages/accounting/payroll";
import TransactionsPage from "@/pages/accounting/transactions";
import SidebarManager from "@/components/sidebar-manager";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import AuthTest from "@/pages/auth-test";
// Communication Pages
import TextingPortal from "@/pages/customers/texting-portal";
import PhoneCalls from "@/pages/customers/phone-calls";
import CommunicationSettings from "@/pages/admin/communication-settings";
import CommunicationDemo from "@/pages/communication-demo";
import AISmartSearch from "@/pages/ai-smart-search";
import WorkflowAssistant from "@/pages/workflow-assistant";
import FiDashboardPage from "@/pages/fi-dashboard";
import FiConfigurationPage from "@/pages/fi-configuration";
import SystemConfiguration from "@/pages/admin/system-configuration";
import UserManagement from "@/pages/admin/user-management";
import UserProfile from "@/pages/admin/user-profile";
import EnterpriseHeader from "@/components/enterprise-header";
import MobileNavigation from "@/components/mobile-navigation";
import { ThemeProvider } from "@/contexts/theme-context";
import { SimpleSessionBar } from "@/components/workspace/simple-session-bar";

function Router() {
  // Initialize pixel tracking for the entire app
  usePixelTracker();
  
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/auth-test" component={AuthTest} />
        <Route component={Landing} />
      </Switch>
    );
  }
  
  return (
    <SidebarManager>
      <EnterpriseHeader />
      <div className="h-full overflow-auto bg-background pb-16 md:pb-0 pt-2">
          <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/inventory/:id" component={VehicleDetail} />
          <Route path="/sales" component={Sales} />
          <Route path="/sales-mobile" component={SalesMobileEnhanced} />
          <Route path="/customers" component={Customers} />
          <Route path="/customers/:id" component={CustomerDetail} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/competitive-pricing" component={CompetitivePricing} />
          <Route path="/deals/:id" component={DealDetailPage} />
          <Route path="/deals" component={DealsUnified} />
          <Route path="/deal-desk" component={DealDesk} />
          <Route path="/showroom-manager" component={ShowroomManager} />
          <Route path="/reports" component={Reports} />
          <Route path="/ml-dashboard" component={MLDashboard} />
          <Route path="/fi-dashboard" component={FiDashboardPage} />
          <Route path="/fi-configuration" component={FiConfigurationPage} />
          <Route path="/settings" component={Settings} />
          
          {/* Admin Routes */}

          <Route path="/admin/settings" component={SystemSettings} />
          <Route path="/admin/comprehensive-settings" component={ComprehensiveSettings} />
          <Route path="/admin/lead-distribution" component={LeadDistribution} />
          <Route path="/admin/communication-settings" component={CommunicationSettings} />
          <Route path="/admin/system-configuration" component={SystemConfiguration} />
          <Route path="/admin/user-management" component={UserManagement} />
          <Route path="/admin/user-profile" component={UserProfile} />
          <Route path="/auth-test" component={AuthTest} />
          
          {/* Communication Routes */}
          <Route path="/customers/:id/texting" component={TextingPortal} />
          <Route path="/customers/:id/calls" component={PhoneCalls} />
          <Route path="/communication-demo" component={CommunicationDemo} />
          <Route path="/ai-smart-search" component={AISmartSearch} />
          <Route path="/workflow-assistant" component={WorkflowAssistant} />
          
          {/* Service Routes */}
          <Route path="/service/orders" component={ServiceOrdersPage} />
          <Route path="/service/parts" component={PartsInventoryPage} />
          <Route path="/service/reports" component={ServiceReportsPage} />
          
          {/* Accounting Routes */}
          <Route path="/accounting/reports" component={FinancialReportsPage} />
          <Route path="/accounting/payroll" component={PayrollPage} />
          <Route path="/accounting/transactions" component={TransactionsPage} />
          
          <Route component={NotFound} />
        </Switch>
      </div>
    </SidebarManager>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <SimpleSessionBar />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
