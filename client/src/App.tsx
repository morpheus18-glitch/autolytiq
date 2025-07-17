import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Customers from "@/pages/customers";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import CompetitivePricing from "@/pages/competitive-pricing";
import ProfessionalDealDesk from "@/pages/professional-deal-desk";
// Admin Pages
import RolesPage from "@/pages/admin/roles";
import DepartmentsPage from "@/pages/admin/departments";
// Service Pages
import ServiceOrdersPage from "@/pages/service/service-orders";
import Sidebar from "@/components/sidebar";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";

function Router() {
  // Initialize pixel tracking for the entire app
  usePixelTracker();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={Sales} />
          <Route path="/customers" component={Customers} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/competitive-pricing" component={CompetitivePricing} />
          <Route path="/deal-desk" component={ProfessionalDealDesk} />
          <Route path="/settings" component={Settings} />
          
          {/* Admin Routes */}
          <Route path="/admin/roles" component={RolesPage} />
          <Route path="/admin/departments" component={DepartmentsPage} />
          
          {/* Service Routes */}
          <Route path="/service/orders" component={ServiceOrdersPage} />
          
          <Route component={NotFound} />
        </Switch>
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
