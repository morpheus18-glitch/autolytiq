import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory-enhanced";
import VehicleDetail from "@/pages/vehicle-detail";
import Sales from "@/pages/sales-enhanced";
import Customers from "@/pages/customers-enhanced";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import CompetitivePricing from "@/pages/competitive-pricing";
import ProfessionalDealDesk from "@/pages/professional-deal-desk";
import Reports from "@/pages/reports";
import MLDashboard from "@/pages/ml-dashboard";
import ShowroomManager from "@/pages/showroom-manager";
// Admin Pages
import RolesPage from "@/pages/admin/roles";
import DepartmentsPage from "@/pages/admin/departments";
import UsersPage from "@/pages/admin/users";
// Service Pages
import ServiceOrdersPage from "@/pages/service/service-orders";
import PartsInventoryPage from "@/pages/service/parts";
import ServiceReportsPage from "@/pages/service/reports";
// Accounting Pages
import FinancialReportsPage from "@/pages/accounting/reports";
import PayrollPage from "@/pages/accounting/payroll";
import TransactionsPage from "@/pages/accounting/transactions";
import Sidebar from "@/components/sidebar";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import { useState } from "react";

function Router() {
  // Initialize pixel tracking for the entire app
  usePixelTracker();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="layout h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Main content area */}
      <div className="content flex-1 min-w-0 overflow-hidden">
        <div className="h-full overflow-auto">
          <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/inventory/:id" component={VehicleDetail} />
          <Route path="/sales" component={Sales} />
          <Route path="/customers" component={Customers} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/competitive-pricing" component={CompetitivePricing} />
          <Route path="/deal-desk" component={ProfessionalDealDesk} />
          <Route path="/showroom-manager" component={ShowroomManager} />
          <Route path="/reports" component={Reports} />
          <Route path="/ml-dashboard" component={MLDashboard} />
          <Route path="/settings" component={Settings} />
          
          {/* Admin Routes */}
          <Route path="/admin/roles" component={RolesPage} />
          <Route path="/admin/departments" component={DepartmentsPage} />
          <Route path="/admin/users" component={UsersPage} />
          
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
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
