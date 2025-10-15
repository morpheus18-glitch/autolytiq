import type { ComponentType } from 'react';
import Dashboard from '@/pages/dashboard';
import Inventory from '@/pages/inventory';
import InventoryPricing from '@/pages/inventory-pricing';
import LotManagement from '@/pages/lot-management';
import InventoryDetail from '@/pages/inventory-detail';
import Sales from '@/pages/sales';
import Customers from '@/pages/customers';
import CustomerDetail from '@/pages/customer-detail';
import TextingPortal from '@/pages/customers/texting-portal';
import PhoneCalls from '@/pages/customers/phone-calls';
import DealsPage from '@/pages/deals';
import ProfessionalDealDesk from '@/pages/professional-deal-desk';
import TradeAppraisals from '@/pages/trade-appraisals';
import ShowroomManager from '@/pages/showroom-manager';
import Reports from '@/pages/reports';
import SalesReports from '@/pages/reports/sales';
import InventoryReports from '@/pages/reports/inventory';
import ServicePerformanceReports from '@/pages/reports/service';
import FinancialPerformanceReports from '@/pages/reports/financial';
import Analytics from '@/pages/analytics';
import CustomerLifecycle from '@/pages/analytics/customer-lifecycle';
import CompetitivePricing from '@/pages/competitive-pricing';
import MarketLeads from '@/pages/market-leads';
import AutomotiveDataCenter from '@/pages/automotive-data-center';
import MLModelComparison from '@/pages/ml-model-comparison';
import FiDashboardPage from '@/pages/fi-dashboard';
import LenderManagement from '@/pages/finance/lenders';
import RateSheets from '@/pages/finance/rates';
import ComplianceManager from '@/pages/finance/compliance-manager';
import FinanceReports from '@/pages/finance/finance-reports';
import FiConfigurationPage from '@/pages/fi-configuration';
import AccountingDashboard from '@/pages/accounting/accounting-dashboard';
import DealFinalization from '@/pages/accounting/deal-finalization';
import ChartOfAccounts from '@/pages/accounting/chart-of-accounts';
import VehicleProfit from '@/pages/accounting/vehicle-profit';
import FinanceReserves from '@/pages/accounting/finance-reserves';
import MonthlyClose from '@/pages/accounting/monthly-close';
import FinancialReportsPage from '@/pages/accounting/reports';
import PayrollPage from '@/pages/accounting/payroll';
import TransactionsPage from '@/pages/accounting/transactions';
import Settings from '@/pages/settings';
import SystemSettings from '@/pages/admin/system-settings';
import UserManagement from '@/pages/admin/user-management';
import ComprehensiveSettings from '@/pages/admin/comprehensive-settings';
import DealerConfiguration from '@/pages/admin/dealer-configuration';
import IntegrationSetup from '@/pages/admin/integration-setup';
import SecurityCenter from '@/pages/admin/security-center';
import SystemHealth from '@/pages/system-health';
import LeadDistribution from '@/pages/admin/lead-distribution';
import CommunicationSettings from '@/pages/admin/communication-settings';
import SystemConfiguration from '@/pages/admin/system-configuration';
import UserProfile from '@/pages/admin/user-profile';
import RoleManagement from '@/pages/admin/role-management';
import PerformanceTracking from '@/pages/admin/performance-tracking';
import TrainingCenter from '@/pages/admin/training-center';
import MultiStoreManagement from '@/pages/multi-store-management';
import ServiceOverviewPage from '@/pages/service/service-overview';
import ServiceAppointmentsPage from '@/pages/service/appointments';
import ServiceHistoryPage from '@/pages/service/history';
import ServiceSchedulePage from '@/pages/service/schedule';
import ServiceOrdersPage from '@/pages/service/service-orders';
import PartsInventoryPage from '@/pages/service/parts';
import ServiceReportsPage from '@/pages/service/reports';
import MLDeveloperAdmin from '@/pages/ml-developer-admin';
import AISmartSearch from '@/pages/ai-smart-search';
import WorkflowAssistant from '@/pages/workflow-assistant';
import CommunicationDemo from '@/pages/communication-demo';

interface RouteDefinition {
  path: string;
  component: ComponentType<any>;
  aliases?: string[];
}

export interface ResolvedRoute {
  path: string;
  component: ComponentType<any>;
  aliasFor?: string;
}

const routeDefinitions: RouteDefinition[] = [
  { path: '/', component: Dashboard },
  { path: '/inventory/pricing', component: InventoryPricing },
  { path: '/inventory/lot-management', component: LotManagement },
  { path: '/inventory/:id', component: InventoryDetail },
  { path: '/inventory', component: Inventory },
  { path: '/leads', component: Sales },
  { path: '/sales', component: Sales },
  { path: '/sales-mobile', component: Sales },
  { path: '/customers/:id/texting', component: TextingPortal },
  { path: '/customers/:id/calls', component: PhoneCalls },
  { path: '/customers/:id', component: CustomerDetail },
  { path: '/customers', component: Customers },
  {
    path: '/deals',
    component: DealsPage,
    aliases: ['/deals-list', '/deal-log', '/deal-pipeline']
  },
  {
    path: '/professional-deal-desk',
    component: ProfessionalDealDesk,
    aliases: ['/deals-finance', '/deal-desk', '/deal-working', '/finance/structuring']
  },
  { path: '/deals/:id', component: ProfessionalDealDesk },
  { path: '/trade-appraisals', component: TradeAppraisals },
  { path: '/showroom', component: ShowroomManager, aliases: ['/showroom-manager'] },
  { path: '/reports/sales', component: SalesReports },
  { path: '/reports/inventory', component: InventoryReports },
  { path: '/reports/service', component: ServicePerformanceReports },
  { path: '/reports/financial', component: FinancialPerformanceReports },
  { path: '/reports', component: Reports },
  { path: '/analytics/customer-lifecycle', component: CustomerLifecycle },
  { path: '/analytics', component: Analytics },
  { path: '/competitive-pricing', component: CompetitivePricing },
  { path: '/market-leads', component: MarketLeads },
  { path: '/automotive-data-center', component: AutomotiveDataCenter },
  { path: '/ml-model-comparison', component: MLModelComparison },
  { path: '/finance/lenders', component: LenderManagement },
  { path: '/finance/rates', component: RateSheets },
  { path: '/finance/compliance', component: ComplianceManager },
  { path: '/finance/reports', component: FinanceReports },
  { path: '/finance', component: FiDashboardPage, aliases: ['/fi-dashboard'] },
  { path: '/fi-configuration', component: FiConfigurationPage },
  { path: '/accounting/deals', component: DealFinalization },
  { path: '/accounting/chart', component: ChartOfAccounts },
  { path: '/accounting/profit', component: VehicleProfit },
  { path: '/accounting/reserves', component: FinanceReserves },
  { path: '/accounting/close', component: MonthlyClose },
  { path: '/accounting/reports', component: FinancialReportsPage },
  { path: '/accounting/payroll', component: PayrollPage },
  { path: '/accounting/transactions', component: TransactionsPage },
  { path: '/accounting', component: AccountingDashboard },
  { path: '/settings', component: Settings },
  { path: '/admin/settings', component: SystemSettings },
  { path: '/admin/users', component: UserManagement, aliases: ['/users', '/users/staff', '/admin/user-management'] },
  { path: '/users/roles', component: RoleManagement },
  { path: '/users/performance', component: PerformanceTracking },
  { path: '/users/training', component: TrainingCenter },
  { path: '/admin/dealership', component: ComprehensiveSettings, aliases: ['/admin/comprehensive-settings'] },
  { path: '/admin/dealer-configuration', component: DealerConfiguration },
  { path: '/admin/integrations', component: IntegrationSetup },
  { path: '/admin/security', component: SecurityCenter, aliases: ['/admin/security-center'] },
  { path: '/admin/health', component: SystemHealth },
  { path: '/admin/lead-distribution', component: LeadDistribution },
  { path: '/admin/communication-settings', component: CommunicationSettings },
  { path: '/admin/system-configuration', component: SystemConfiguration },
  { path: '/admin/user-profile', component: UserProfile },
  { path: '/multi-store-management', component: MultiStoreManagement },
  { path: '/service/appointments', component: ServiceAppointmentsPage },
  { path: '/service/history', component: ServiceHistoryPage },
  { path: '/service/schedule', component: ServiceSchedulePage },
  { path: '/service/orders', component: ServiceOrdersPage },
  { path: '/service/parts', component: PartsInventoryPage },
  { path: '/service/reports', component: ServiceReportsPage },
  { path: '/service', component: ServiceOverviewPage },
  { path: '/ml-developer-admin', component: MLDeveloperAdmin },
  { path: '/ai-smart-search', component: AISmartSearch },
  { path: '/workflow-assistant', component: WorkflowAssistant },
  { path: '/communication-demo', component: CommunicationDemo }
];

export const appRoutes: ResolvedRoute[] = routeDefinitions.flatMap((route) => {
  const resolved: ResolvedRoute[] = [
    { path: route.path, component: route.component }
  ];

  if (route.aliases) {
    for (const alias of route.aliases) {
      resolved.push({ path: alias, component: route.component, aliasFor: route.path });
    }
  }

  return resolved;
});
