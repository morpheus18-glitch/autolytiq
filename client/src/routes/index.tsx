import { lazy, type ComponentType } from 'react';

// Eager load critical routes for initial render
import RoleLanding from '@/pages/role-landing';
import Dashboard from '@/pages/dashboard';

// Lazy load all other routes for code splitting
const Inventory = lazy(() => import('@/pages/inventory'));
const InventoryPricing = lazy(() => import('@/pages/inventory-pricing'));
const LotManagement = lazy(() => import('@/pages/lot-management'));
const InventoryDetail = lazy(() => import('@/pages/inventory-detail'));
const Sales = lazy(() => import('@/pages/sales'));
const LeadsDashboard = lazy(() => import('@/pages/leads/LeadsDashboard'));
const LeadDetail = lazy(() => import('@/pages/leads/LeadDetail'));
const Customers = lazy(() => import('@/pages/customers'));
const CustomerDetail = lazy(() => import('@/pages/customer-detail'));
const TextingPortal = lazy(() => import('@/pages/customers/texting-portal'));
const PhoneCalls = lazy(() => import('@/pages/customers/phone-calls'));
const CRMLeadManagement = lazy(() => import('@/pages/crm-lead-management'));
const DealsPage = lazy(() => import('@/pages/deals'));
const ProfessionalDealDesk = lazy(() => import('@/pages/professional-deal-desk'));
const DeskingWorkspace = lazy(() => import('@/pages/desking/DeskingWorkspace'));
const TradeAppraisals = lazy(() => import('@/pages/trade-appraisals'));
const ShowroomManager = lazy(() => import('@/pages/showroom-manager'));
const Reports = lazy(() => import('@/pages/reports'));
const SalesReports = lazy(() => import('@/pages/reports/sales'));
const InventoryReports = lazy(() => import('@/pages/reports/inventory'));
const ServicePerformanceReports = lazy(() => import('@/pages/reports/service'));
const FinancialPerformanceReports = lazy(() => import('@/pages/reports/financial'));
const Analytics = lazy(() => import('@/pages/analytics'));
const CustomerLifecycle = lazy(() => import('@/pages/analytics/customer-lifecycle'));
const CompetitivePricing = lazy(() => import('@/pages/competitive-pricing'));
const MarketLeads = lazy(() => import('@/pages/market-leads'));
const AutomotiveDataCenter = lazy(() => import('@/pages/automotive-data-center'));
const MLModelComparison = lazy(() => import('@/pages/ml-model-comparison'));
const DesignShowcase = lazy(() => import('@/pages/DesignShowcase'));
const FiDashboardPage = lazy(() => import('@/pages/fi-dashboard'));
const LenderManagement = lazy(() => import('@/pages/finance/lenders'));
const RateSheets = lazy(() => import('@/pages/finance/rates'));
const ComplianceEngine = lazy(() => import('@/features/fi/pages/ComplianceEngine'));
const FinanceReports = lazy(() => import('@/pages/finance/finance-reports'));
const FiConfigurationPage = lazy(() => import('@/pages/fi-configuration'));
const AccountingDashboardPage = lazy(() => import('@/pages/accounting/AccountingDashboard'));
const DealFinalization = lazy(() => import('@/pages/accounting/deal-finalization'));
const ChartOfAccounts = lazy(() => import('@/pages/accounting/chart-of-accounts'));
const VehicleProfit = lazy(() => import('@/pages/accounting/vehicle-profit'));
const FinanceReserves = lazy(() => import('@/pages/accounting/finance-reserves'));
const MonthlyClose = lazy(() => import('@/pages/accounting/monthly-close'));
const FinancialReportsPage = lazy(() => import('@/pages/accounting/reports'));
const TransactionsPage = lazy(() => import('@/pages/accounting/transactions'));
const PLStatement = lazy(() => import('@/pages/accounting/PLStatement'));
const BalanceSheet = lazy(() => import('@/pages/accounting/BalanceSheet'));
const CashFlowStatement = lazy(() => import('@/pages/accounting/CashFlowStatement'));
const JournalEntries = lazy(() => import('@/pages/accounting/JournalEntries'));
const JournalEntryForm = lazy(() => import('@/pages/accounting/JournalEntryForm'));
const GLAccounts = lazy(() => import('@/pages/accounting/GLAccounts'));
const GLAccountForm = lazy(() => import('@/pages/accounting/GLAccountForm'));
const Payroll = lazy(() => import('@/pages/accounting/Payroll'));
const PayrollCalculation = lazy(() => import('@/pages/accounting/PayrollCalculation'));
const TaxReports = lazy(() => import('@/pages/accounting/TaxReports'));
const Settings = lazy(() => import('@/pages/settings'));
const UserManagement = lazy(() => import('@/pages/admin/user-management'));
const SystemHealth = lazy(() => import('@/pages/system-health'));
const RoleManagement = lazy(() => import('@/pages/admin/role-management'));
const PerformanceTracking = lazy(() => import('@/pages/admin/performance-tracking'));
const TrainingCenter = lazy(() => import('@/pages/admin/training-center'));
const MultiStoreManagement = lazy(() => import('@/pages/multi-store-management'));
const ServiceOverviewPage = lazy(() => import('@/pages/service/service-overview'));
const ServiceAppointmentsPage = lazy(() => import('@/pages/service/appointments'));
const ServiceHistoryPage = lazy(() => import('@/pages/service/history'));
const ServiceSchedulePage = lazy(() => import('@/pages/service/schedule'));
const ServiceOrdersPage = lazy(() => import('@/pages/service/service-orders'));
const PartsInventoryPage = lazy(() => import('@/pages/service/parts'));
const ServiceReportsPage = lazy(() => import('@/pages/service/reports'));
const MLDeveloperAdmin = lazy(() => import('@/pages/ml-developer-admin'));
const AISmartSearch = lazy(() => import('@/pages/ai-smart-search'));
const WorkflowAssistant = lazy(() => import('@/pages/workflow-assistant'));
const CommunicationDemo = lazy(() => import('@/pages/communication-demo'));
const CommunicationCenter = lazy(() => import('@/pages/CommunicationCenter'));
const CallCenter = lazy(() => import('@/pages/CallCenter'));
const SMSInbox = lazy(() => import('@/pages/SMSInbox'));
const EmailComposer = lazy(() => import('@/pages/EmailComposer'));
const AppointmentCalendar = lazy(() => import('@/pages/AppointmentCalendar'));
const CustomerProfile = lazy(() => import('@/pages/CustomerProfile'));
const CRMAnalytics = lazy(() => import('@/pages/CRMAnalytics'));
const DealJacketPage = lazy(() => import('@/features/fi/pages/DealJacket'));
const LenderSubmissionPage = lazy(() => import('@/features/fi/pages/LenderSubmission'));
const MenuPresentationPage = lazy(() => import('@/features/fi/pages/MenuPresentation'));
const DealFundingPage = lazy(() => import('@/features/fi/pages/DealFunding'));

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
  { path: '/', component: RoleLanding },
  { path: '/dashboard', component: Dashboard },
  { path: '/inventory/pricing', component: InventoryPricing },
  { path: '/inventory/lot-management', component: LotManagement },
  { path: '/inventory/:id', component: InventoryDetail },
  { path: '/inventory', component: Inventory },
  { path: '/crm', component: CRMLeadManagement },
  { path: '/leads', component: LeadsDashboard },
  { path: '/leads/:id', component: LeadDetail },
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
  {
    path: '/desking/workspace',
    component: DeskingWorkspace,
    aliases: ['/desking', '/deals/desking']
  },
  { path: '/professional-deal-desk/:id', component: ProfessionalDealDesk },
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
  { path: '/design-system', component: DesignShowcase },
  { path: '/finance/lenders', component: LenderManagement },
  { path: '/finance/rates', component: RateSheets },
  { path: '/finance/compliance', component: ComplianceEngine },
  { path: '/finance/reports', component: FinanceReports },
  { path: '/finance', component: FiDashboardPage, aliases: ['/fi-dashboard'] },
  { path: '/fi-configuration', component: FiConfigurationPage },
  { path: '/fi/deal-jackets/:id', component: DealJacketPage, aliases: ['/fi/deals/:id'] },
  { path: '/fi/deals/:id/lenders', component: LenderSubmissionPage },
  { path: '/fi/deals/:id/menu', component: MenuPresentationPage },
  { path: '/fi/deals/:id/funding', component: DealFundingPage },
  { path: '/accounting/deals', component: DealFinalization },
  { path: '/accounting/chart', component: ChartOfAccounts },
  { path: '/accounting/profit', component: VehicleProfit },
  { path: '/accounting/reserves', component: FinanceReserves },
  { path: '/accounting/close', component: MonthlyClose },
  { path: '/accounting/reports', component: FinancialReportsPage },
  { path: '/accounting/journal-entries/new', component: JournalEntryForm },
  { path: '/accounting/journal-entries/:id', component: JournalEntryForm },
  { path: '/accounting/journal-entries', component: JournalEntries },
  { path: '/accounting/gl-accounts/new', component: GLAccountForm },
  { path: '/accounting/gl-accounts/:id/edit', component: GLAccountForm },
  { path: '/accounting/gl-accounts', component: GLAccounts },
  { path: '/accounting/pl-statement', component: PLStatement },
  { path: '/accounting/balance-sheet', component: BalanceSheet },
  { path: '/accounting/cash-flow', component: CashFlowStatement },
  { path: '/accounting/tax-reports', component: TaxReports },
  { path: '/accounting/payroll/calculate', component: PayrollCalculation },
  { path: '/accounting/payroll', component: Payroll },
  { path: '/accounting/transactions', component: TransactionsPage },
  { path: '/accounting', component: AccountingDashboardPage },
  { path: '/settings/:tab?', component: Settings },
  { path: '/admin/settings', component: Settings },
  { path: '/admin/system-settings', component: Settings },
  {
    path: '/admin/users',
    component: UserManagement,
    aliases: ['/users', '/users/staff', '/admin/user-management']
  },
  { path: '/users/roles', component: RoleManagement },
  { path: '/users/performance', component: PerformanceTracking },
  { path: '/users/training', component: TrainingCenter },
  { path: '/admin/dealership', component: Settings, aliases: ['/admin/comprehensive-settings'] },
  { path: '/admin/dealer-configuration', component: Settings },
  { path: '/admin/integrations', component: Settings },
  { path: '/admin/security', component: Settings, aliases: ['/admin/security-center'] },
  { path: '/admin/health', component: SystemHealth },
  { path: '/admin/lead-distribution', component: Settings },
  { path: '/admin/communication-settings', component: Settings },
  { path: '/admin/system-configuration', component: Settings },
  { path: '/admin/user-profile', component: Settings },
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
  { path: '/communication-demo', component: CommunicationDemo },
  { path: '/communication-center', component: CommunicationCenter },
  { path: '/call-center', component: CallCenter },
  { path: '/sms-inbox', component: SMSInbox },
  { path: '/email-composer', component: EmailComposer },
  { path: '/appointment-calendar', component: AppointmentCalendar },
  { path: '/customer-profile', component: CustomerProfile },
  { path: '/crm-analytics', component: CRMAnalytics }
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
