import { useState } from "react";
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
import Inventory from "@/pages/inventory";
import VehicleDetail from "@/pages/vehicle-detail";
import Sales from "@/pages/sales";
// Removed sales-mobile-enhanced - using unified sales page
import Customers from "@/pages/customers";
import CustomerDetail from "@/pages/customer-detail";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import CompetitivePricing from "@/pages/competitive-pricing";
import Reports from "@/pages/reports";
import MLDashboard from "@/pages/ml-dashboard";
import MLDashboardControl from "@/pages/ml-dashboard-control";
import ShowroomManager from "@/pages/showroom-manager";
// Deal Pages
import DealDeskUnified from "@/pages/deal-desk-unified";
import InventoryDetail from "@/pages/inventory-detail";
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
import AccountingDashboard from "@/pages/accounting/accounting-dashboard";
import SidebarNavigation from "@/components/sidebar-navigation";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import { TrackingPixel } from "@/components/tracking-pixel";
import AuthTest from "@/pages/auth-test";
// Communication Pages
import TextingPortal from "@/pages/customers/texting-portal";
import PhoneCalls from "@/pages/customers/phone-calls";
import CommunicationSettings from "@/pages/admin/communication-settings";
import CommunicationDemo from "@/pages/communication-demo";
import AISmartSearch from "@/pages/ai-smart-search";
import WorkflowAssistant from "@/pages/workflow-assistant";
import EnterpriseAdmin from "@/pages/enterprise-admin";
import SystemHealth from "@/pages/system-health";
import FiDashboardPage from "@/pages/fi-dashboard";
import FiConfigurationPage from "@/pages/fi-configuration";
import SystemConfiguration from "@/pages/admin/system-configuration";
import UserManagement from "@/pages/admin/user-management";
import UserProfile from "@/pages/admin/user-profile";
import DealFinalization from "@/pages/accounting/deal-finalization";
import ChartOfAccounts from "@/pages/accounting/chart-of-accounts";
import VehicleProfit from "@/pages/accounting/vehicle-profit";
import FinanceReserves from "@/pages/accounting/finance-reserves";
import MonthlyClose from "@/pages/accounting/monthly-close";
import LenderManagement from "@/pages/finance/lenders";
import RateSheets from "@/pages/finance/rates";

import { ThemeProvider } from "@/contexts/theme-context";
import { MobileFooterMenu } from "@/components/mobile-footer-menu";
import DealJacket from "@/pages/deal-jacket";
import MultiStoreManagement from "@/pages/multi-store-management";
import CustomerLifecycle from "@/pages/analytics/customer-lifecycle";
import MarketLeads from "@/pages/market-leads";
import AutomotiveDataCenter from "@/pages/automotive-data-center";
// Professional deal desk removed - using unified deal desk
import ComplianceManager from "@/pages/finance/compliance-manager";
import FinanceReports from "@/pages/finance/finance-reports";
import RoleManagement from "@/pages/admin/role-management";
import PerformanceTracking from "@/pages/admin/performance-tracking";
import TrainingCenter from "@/pages/admin/training-center";
import IntegrationSetup from "@/pages/admin/integration-setup";
import SecurityCenter from "@/pages/admin/security-center";

function Router() {
  // Initialize pixel tracking for the entire app
  usePixelTracker();
  
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SidebarNavigation 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-auto">
        <div className="h-full bg-background pb-20 md:pb-0">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/inventory/:id" component={InventoryDetail} />
            <Route path="/leads" component={Sales} />
            <Route path="/customers" component={Customers} />
            <Route path="/customers/:id" component={CustomerDetail} />
            <Route path="/deals" component={DealDeskUnified} />
            <Route path="/showroom" component={ShowroomManager} />
            <Route path="/reports" component={Reports} />
            <Route path="/sales-mobile" component={Sales} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/analytics/customer-lifecycle" component={CustomerLifecycle} />
            <Route path="/competitive-pricing" component={CompetitivePricing} />
            <Route path="/market-leads" component={MarketLeads} />
            <Route path="/automotive-data-center" component={AutomotiveDataCenter} />
            <Route path="/deals-list" component={DealDeskUnified} />

            {/* Finance Routes */}
            <Route path="/finance" component={FiDashboardPage} />
            <Route path="/finance/structuring" component={DealDeskUnified} />
            <Route path="/finance/lenders" component={() => <LenderManagement />} />
            <Route path="/finance/rates" component={() => <RateSheets />} />
            <Route path="/finance/compliance" component={ComplianceManager} />
            <Route path="/finance/reports" component={FinanceReports} />

            {/* Accounting Routes */}
            <Route path="/accounting" component={AccountingDashboard} />
            <Route path="/accounting/deals" component={() => <DealFinalization />} />
            <Route path="/accounting/chart" component={() => <ChartOfAccounts />} />
            <Route path="/accounting/profit" component={() => <VehicleProfit />} />
            <Route path="/accounting/reserves" component={() => <FinanceReserves />} />
            <Route path="/accounting/close" component={() => <MonthlyClose />} />
            <Route path="/accounting/reports" component={FinancialReportsPage} />
            <Route path="/accounting/payroll" component={PayrollPage} />
            <Route path="/accounting/transactions" component={TransactionsPage} />

            {/* Admin Routes */}
            <Route path="/admin/settings" component={SystemSettings} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/dealership" component={ComprehensiveSettings} />
            <Route path="/admin/integrations" component={IntegrationSetup} />
            <Route path="/admin/security" component={SecurityCenter} />
            <Route path="/admin/health" component={SystemHealth} />
            <Route path="/admin/comprehensive-settings" component={ComprehensiveSettings} />
            <Route path="/admin/lead-distribution" component={LeadDistribution} />
            <Route path="/admin/communication-settings" component={CommunicationSettings} />
            <Route path="/admin/system-configuration" component={SystemConfiguration} />

            {/* User Management Routes */}
            <Route path="/users/staff" component={UserManagement} />
            <Route path="/users/roles" component={RoleManagement} />
            <Route path="/users/performance" component={PerformanceTracking} />
            <Route path="/users/training" component={TrainingCenter} />
            <Route path="/users" component={UserManagement} />
            <Route path="/admin/user-management" component={UserManagement} />
            <Route path="/admin/user-profile" component={UserProfile} />

            {/* Legacy Routes */}
            <Route path="/deals-finance" component={DealDeskUnified} />
            <Route path="/deals/:id" component={DealDeskUnified} />
            <Route path="/deal-desk" component={DealDeskUnified} />
            <Route path="/deal-working" component={DealDeskUnified} />
            <Route path="/showroom-manager" component={ShowroomManager} />
            <Route path="/ml-dashboard" component={MLDashboard} />
            <Route path="/ml-control" component={MLDashboardControl} />
            <Route path="/fi-dashboard" component={FiDashboardPage} />
            <Route path="/fi-configuration" component={FiConfigurationPage} />
            <Route path="/settings" component={Settings} />
            <Route path="/auth-test" component={AuthTest} />
            
            {/* Communication Routes */}
            <Route path="/customers/:id/texting" component={TextingPortal} />
            <Route path="/customers/:id/calls" component={PhoneCalls} />
            <Route path="/communication-demo" component={CommunicationDemo} />
            <Route path="/ai-smart-search" component={AISmartSearch} />
            <Route path="/workflow-assistant" component={WorkflowAssistant} />
            <Route path="/enterprise-admin" component={EnterpriseAdmin} />
            
            {/* Deal Jacket & Multi-Store Routes */}
            <Route path="/deal-jackets/:id" component={DealJacket} />
            <Route path="/multi-store-management" component={MultiStoreManagement} />
            
            {/* Service Routes */}
            <Route path="/service/orders" component={ServiceOrdersPage} />
            <Route path="/service/parts" component={PartsInventoryPage} />
            <Route path="/service/reports" component={ServiceReportsPage} />
            
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <TrackingPixel />
          <MobileFooterMenu />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
