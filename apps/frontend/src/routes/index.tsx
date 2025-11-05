import { lazy, type ComponentType } from 'react';

// Lazy load all routes for optimal bundle size

// Root level pages
const Sitemap = lazy(() => import('@/pages/sitemap'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Settings = lazy(() => import('@/pages/settings'));
const Customers = lazy(() => import('@/pages/customers'));
const Inventory = lazy(() => import('@/pages/inventory'));
const Deals = lazy(() => import('@/pages/deals'));

// Dashboard pages (role-based)
const DashboardSales = lazy(() => import('@/pages/dashboard/sales'));
const DashboardService = lazy(() => import('@/pages/dashboard/service'));
const DashboardFinance = lazy(() => import('@/pages/dashboard/finance'));
const DashboardAccounting = lazy(() => import('@/pages/dashboard/accounting'));
const DashboardInventory = lazy(() => import('@/pages/dashboard/inventory'));
const DashboardDeveloper = lazy(() => import('@/pages/dashboard/developer'));
const DashboardAdmin = lazy(() => import('@/pages/dashboard/admin'));
const DemoQuickView = lazy(() => import('@/pages/demo-quick-view'));
const DealCalculator = lazy(() => import('@/pages/desking/DealCalculator'));
const DealStudioDemo = lazy(() => import('@/pages/deal-studio-demo'));
const DealStudioMobileDemo = lazy(() => import('@/pages/deal-studio-mobile-demo'));

// Admin pages
const AdminUsers = lazy(() => import('@/pages/admin/users'));
const AdminUserProfile = lazy(() => import('@/pages/admin/user-profile'));
const AdminUserManagement = lazy(() => import('@/pages/admin/user-management'));
const AdminUserPermissions = lazy(() => import('@/pages/admin/user-permissions'));
const AdminTrainingCenter = lazy(() => import('@/pages/admin/training-center'));
const AdminSystemSettings = lazy(() => import('@/pages/admin/system-settings'));
const AdminSystemConfiguration = lazy(() => import('@/pages/admin/system-configuration'));
const AdminSecurityCenter = lazy(() => import('@/pages/admin/security-center'));
const AdminRoles = lazy(() => import('@/pages/admin/roles'));
const AdminRoleManagement = lazy(() => import('@/pages/admin/role-management'));
const AdminRolePresets = lazy(() => import('@/pages/admin/role-presets'));
const AdminPerformanceTracking = lazy(() => import('@/pages/admin/performance-tracking'));
const AdminLeadDistribution = lazy(() => import('@/pages/admin/lead-distribution'));
const AdminIntegrationSetup = lazy(() => import('@/pages/admin/integration-setup'));
const AdminDepartments = lazy(() => import('@/pages/admin/departments'));
const AdminDealerConfiguration = lazy(() => import('@/pages/admin/dealer-configuration'));
const AdminComprehensiveSettings = lazy(() => import('@/pages/admin/comprehensive-settings'));
const AdminCommunicationSettings = lazy(() => import('@/pages/admin/communication-settings'));
const AdminMLDeveloper = lazy(() => import('@/pages/admin/ml-developer'));
const AdminMLModelComparison = lazy(() => import('@/pages/admin/ml-model-comparison'));
const AdminSystemHealth = lazy(() => import('@/pages/admin/system-health'));
const AdminMultiStore = lazy(() => import('@/pages/admin/multi-store'));

// Accounting pages
const AccountingVehicleProfit = lazy(() => import('@/pages/accounting/vehicle-profit'));
const AccountingTransactions = lazy(() => import('@/pages/accounting/transactions'));
const AccountingReports = lazy(() => import('@/pages/accounting/reports'));
const AccountingMonthlyClose = lazy(() => import('@/pages/accounting/monthly-close'));
const AccountingFinanceReserves = lazy(() => import('@/pages/accounting/finance-reserves'));
const AccountingDealFinalization = lazy(() => import('@/pages/accounting/deal-finalization'));
const AccountingChartOfAccounts = lazy(() => import('@/pages/accounting/chart-of-accounts'));
const AccountingDashboard = lazy(() => import('@/pages/accounting/accounting-dashboard'));
const AccountingTaxReports = lazy(() => import('@/pages/accounting/TaxReports'));
const AccountingPayrollCalculation = lazy(() => import('@/pages/accounting/PayrollCalculation'));
const AccountingPayroll = lazy(() => import('@/pages/accounting/Payroll'));
const AccountingPLStatement = lazy(() => import('@/pages/accounting/PLStatement'));
const AccountingJournalEntryForm = lazy(() => import('@/pages/accounting/JournalEntryForm'));
const AccountingJournalEntries = lazy(() => import('@/pages/accounting/JournalEntries'));
const AccountingGLAccounts = lazy(() => import('@/pages/accounting/GLAccounts'));
const AccountingGLAccountForm = lazy(() => import('@/pages/accounting/GLAccountForm'));
const AccountingCashFlowStatement = lazy(() => import('@/pages/accounting/CashFlowStatement'));
const AccountingBalanceSheet = lazy(() => import('@/pages/accounting/BalanceSheet'));
const AccountingLayout = lazy(() => import('@/pages/accounting/AccountingLayout'));
const AccountingDashboardAlt = lazy(() => import('@/pages/accounting/AccountingDashboard'));

// Analytics pages
const AnalyticsCustomerLifecycle = lazy(() => import('@/pages/analytics/customer-lifecycle'));
const AnalyticsCRM = lazy(() => import('@/pages/analytics/crm-analytics'));

// Auth pages
const AuthForgotPassword = lazy(() => import('@/pages/auth/forgot-password'));
const AuthResetPassword = lazy(() => import('@/pages/auth/reset-password'));

// Communications pages
const CommunicationsCenter = lazy(() => import('@/pages/communications/communication-center'));
const CommunicationsCallCenter = lazy(() => import('@/pages/communications/call-center'));
const CommunicationsEmail = lazy(() => import('@/pages/communications/email-composer'));
const CommunicationsSMS = lazy(() => import('@/pages/communications/sms-inbox'));
const CommunicationsDemo = lazy(() => import('@/pages/communications/demo'));

// Customers pages
const CustomersTextingPortal = lazy(() => import('@/pages/customers/texting-portal'));
const CustomersPhoneCalls = lazy(() => import('@/pages/customers/phone-calls'));
const CustomersDetail = lazy(() => import('@/pages/customers/detail'));
const CustomersProfile = lazy(() => import('@/pages/customers/profile'));

// Desking pages
const DeskingWorkspace = lazy(() => import('@/pages/desking/DeskingWorkspace'));
const DeskingApprovalAnalysis = lazy(() => import('@/pages/desking/ApprovalAnalysis'));

// Inventory pages
const InventoryDetail = lazy(() => import('@/pages/inventory/detail'));
const InventoryPricing = lazy(() => import('@/pages/inventory/pricing'));
const InventoryVehicleDetail = lazy(() => import('@/pages/inventory/vehicle-detail'));
const InventoryTradeAppraisals = lazy(() => import('@/pages/inventory/trade-appraisals'));
const InventoryCompetitivePricing = lazy(() => import('@/pages/inventory/competitive-pricing'));
const InventoryLotManagement = lazy(() => import('@/pages/inventory/lot-management'));
const TradeAppraisal = lazy(() => import('@/pages/inventory/TradeAppraisal'));

// Finance pages
const FinanceRates = lazy(() => import('@/pages/finance/rates'));
const FinanceLenders = lazy(() => import('@/pages/finance/lenders'));
const FinanceReports = lazy(() => import('@/pages/finance/finance-reports'));
const FinanceComplianceManager = lazy(() => import('@/pages/finance/compliance-manager'));

// F&I pages
const FIDealJackets = lazy(() => import('@/pages/fi/deal-jackets'));
const FILenderSubmissions = lazy(() => import('@/pages/fi/lender-submissions'));
const FIContracting = lazy(() => import('@/pages/fi/contracting'));

// Leads pages
const LeadsDashboard = lazy(() => import('@/pages/leads/LeadsDashboard'));
const LeadDetail = lazy(() => import('@/pages/leads/LeadDetail'));
const LeadsManagement = lazy(() => import('@/pages/leads/lead-management'));
const LeadsMarket = lazy(() => import('@/pages/leads/market-leads'));

// CRM pages
const LeadPipeline = lazy(() => import('@/pages/crm/lead-pipeline'));
const DealPipeline = lazy(() => import('@/pages/crm/pipeline'));

// Showroom pages
const ShowroomManager = lazy(() => import('@/pages/showroom/showroom-manager'));

// Misc pages
const MiscMultiStoreManagement = lazy(() => import('@/pages/misc/multi-store-management'));
const MiscMLModelComparison = lazy(() => import('@/pages/misc/ml-model-comparison'));
const MiscMLDeveloperAdmin = lazy(() => import('@/pages/misc/ml-developer-admin'));
const MiscMarketLeads = lazy(() => import('@/pages/misc/market-leads'));
const MiscLotManagement = lazy(() => import('@/pages/misc/lot-management'));
const MiscInventory = lazy(() => import('@/pages/misc/inventory'));
const MiscInventoryPricing = lazy(() => import('@/pages/misc/inventory-pricing'));
const MiscInventoryDetail = lazy(() => import('@/pages/misc/inventory-detail'));
const MiscForgotPassword = lazy(() => import('@/pages/misc/forgot-password'));
const MiscFIDashboard = lazy(() => import('@/pages/misc/fi-dashboard'));
const MiscFIConfiguration = lazy(() => import('@/pages/misc/fi-configuration'));
const MiscDeals = lazy(() => import('@/pages/misc/deals'));
const MiscCustomers = lazy(() => import('@/pages/misc/customers'));
const MiscCustomerDetail = lazy(() => import('@/pages/misc/customer-detail'));
const MiscCRMLeadManagement = lazy(() => import('@/pages/misc/crm-lead-management'));
const MiscCompetitivePricing = lazy(() => import('@/pages/misc/competitive-pricing'));
const MiscCommunicationDemo = lazy(() => import('@/pages/misc/communication-demo'));
const MiscAutomotiveDataCenter = lazy(() => import('@/pages/misc/automotive-data-center'));
const MiscAuthTest = lazy(() => import('@/pages/misc/auth-test'));
const MiscAnalytics = lazy(() => import('@/pages/misc/analytics'));
const MiscAISmartSearch = lazy(() => import('@/pages/misc/ai-smart-search'));
const MiscSMSInbox = lazy(() => import('@/pages/misc/SMSInbox'));
const MiscEmailComposer = lazy(() => import('@/pages/misc/EmailComposer'));
const MiscDesignShowcase = lazy(() => import('@/pages/misc/DesignShowcase'));
const MiscCustomerProfile = lazy(() => import('@/pages/misc/CustomerProfile'));
const MiscCommunicationCenter = lazy(() => import('@/pages/misc/CommunicationCenter'));
const MiscCallCenter = lazy(() => import('@/pages/misc/CallCenter'));
const MiscCRMAnalytics = lazy(() => import('@/pages/misc/CRMAnalytics'));
const MiscAppointmentCalendar = lazy(() => import('@/pages/misc/AppointmentCalendar'));
const MiscReports = lazy(() => import('@/pages/misc/reports'));
const MiscResetPassword = lazy(() => import('@/pages/misc/reset-password'));
const MiscRoleLanding = lazy(() => import('@/pages/misc/role-landing'));
const MiscSales = lazy(() => import('@/pages/misc/sales'));
const MiscShowroomManager = lazy(() => import('@/pages/misc/showroom-manager'));
const MiscSystemHealth = lazy(() => import('@/pages/misc/system-health'));
const MiscTradeAppraisals = lazy(() => import('@/pages/misc/trade-appraisals'));
const MiscVehicleDetail = lazy(() => import('@/pages/misc/vehicle-detail'));
const MiscWorkflowAssistant = lazy(() => import('@/pages/misc/workflow-assistant'));

// Reports pages
const ReportsFinancial = lazy(() => import('@/pages/reports/financial'));
const ReportsInventory = lazy(() => import('@/pages/reports/inventory'));
const ReportsSales = lazy(() => import('@/pages/reports/sales'));
const ReportsService = lazy(() => import('@/pages/reports/service'));

// Service pages
const ServiceAppointments = lazy(() => import('@/pages/service/appointments'));
const ServiceHistory = lazy(() => import('@/pages/service/history'));
const ServiceParts = lazy(() => import('@/pages/service/parts'));
const ServiceReports = lazy(() => import('@/pages/service/reports'));
const ServiceSchedule = lazy(() => import('@/pages/service/schedule'));
const ServiceOrders = lazy(() => import('@/pages/service/service-orders'));
const ServiceOverview = lazy(() => import('@/pages/service/service-overview'));

// Settings pages
const SettingsAnalytics = lazy(() => import('@/pages/settings/AnalyticsSettings'));
const SettingsBranding = lazy(() => import('@/pages/settings/BrandingSettings'));
const SettingsData = lazy(() => import('@/pages/settings/DataSettings'));
const SettingsDealership = lazy(() => import('@/pages/settings/DealershipSettings'));
const SettingsDeveloper = lazy(() => import('@/pages/settings/DeveloperSettings'));
const SettingsForms = lazy(() => import('@/pages/settings/FormsSettings'));
const SettingsIntegrations = lazy(() => import('@/pages/settings/IntegrationsSettings'));
const SettingsNotifications = lazy(() => import('@/pages/settings/NotificationsSettings'));
const SettingsPricingRules = lazy(() => import('@/pages/settings/PricingRulesSettings'));
const SettingsSecurity = lazy(() => import('@/pages/settings/SecuritySettings'));
const SettingsLayout = lazy(() => import('@/pages/settings/SettingsLayout'));
const SettingsUsers = lazy(() => import('@/pages/settings/UsersSettings'));

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
  // Root routes
  { path: '/', component: Sitemap },
  { path: '/sitemap', component: Sitemap },
  { path: '/dashboard', component: Dashboard },
  { path: '/settings/:tab?', component: Settings },
  { path: '/customers', component: Customers },
  { path: '/inventory', component: Inventory },
  { path: '/deals', component: Deals },
  { path: '/demo-quick-view', component: DemoQuickView },
  { path: '/desking/calculator', component: DealCalculator },
  { path: '/deal-studio-demo', component: DealStudioDemo },
  { path: '/deal-studio-mobile-demo', component: DealStudioMobileDemo },

  // Dashboard routes (role-based)
  { path: '/dashboard/sales', component: DashboardSales },
  { path: '/dashboard/service', component: DashboardService },
  { path: '/dashboard/finance', component: DashboardFinance },
  { path: '/dashboard/accounting', component: DashboardAccounting },
  { path: '/dashboard/inventory', component: DashboardInventory },
  { path: '/dashboard/developer', component: DashboardDeveloper },
  { path: '/dashboard/admin', component: DashboardAdmin },

  // Admin routes
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/user-profile', component: AdminUserProfile },
  { path: '/admin/user-management', component: AdminUserManagement },
  { path: '/admin/user-permissions', component: AdminUserPermissions },
  { path: '/admin/training-center', component: AdminTrainingCenter },
  { path: '/admin/system-settings', component: AdminSystemSettings },
  { path: '/admin/system-configuration', component: AdminSystemConfiguration },
  { path: '/admin/security-center', component: AdminSecurityCenter },
  { path: '/admin/roles', component: AdminRoles },
  { path: '/admin/role-management', component: AdminRoleManagement },
  { path: '/admin/role-presets', component: AdminRolePresets },
  { path: '/admin/performance-tracking', component: AdminPerformanceTracking },
  { path: '/admin/lead-distribution', component: AdminLeadDistribution },
  { path: '/admin/integration-setup', component: AdminIntegrationSetup },
  { path: '/admin/departments', component: AdminDepartments },
  { path: '/admin/dealer-configuration', component: AdminDealerConfiguration },
  { path: '/admin/comprehensive-settings', component: AdminComprehensiveSettings },
  { path: '/admin/communication-settings', component: AdminCommunicationSettings },
  { path: '/admin/ml-developer', component: AdminMLDeveloper },
  { path: '/admin/ml-model-comparison', component: AdminMLModelComparison },
  { path: '/admin/system-health', component: AdminSystemHealth },
  { path: '/admin/multi-store', component: AdminMultiStore },

  // Analytics routes
  { path: '/analytics/customer-lifecycle', component: AnalyticsCustomerLifecycle },
  { path: '/analytics/crm', component: AnalyticsCRM },

  // Auth routes
  { path: '/auth/forgot-password', component: AuthForgotPassword },
  { path: '/auth/reset-password', component: AuthResetPassword },

  // Communications routes
  { path: '/communications/center', component: CommunicationsCenter },
  { path: '/communications/call-center', component: CommunicationsCallCenter },
  { path: '/communications/email', component: CommunicationsEmail },
  { path: '/communications/sms', component: CommunicationsSMS },
  { path: '/communications/demo', component: CommunicationsDemo },

  // Customer routes
  { path: '/customers/texting-portal', component: CustomersTextingPortal },
  { path: '/customers/phone-calls', component: CustomersPhoneCalls },
  { path: '/customers/detail/:id', component: CustomersDetail },
  { path: '/customers/profile/:id', component: CustomersProfile },

  // Inventory routes
  { path: '/inventory/detail/:id', component: InventoryDetail },
  { path: '/inventory/pricing', component: InventoryPricing },
  { path: '/inventory/vehicle/:id', component: InventoryVehicleDetail },
  { path: '/inventory/trade-appraisals', component: InventoryTradeAppraisals },
  { path: '/inventory/trade-appraisal', component: TradeAppraisal },
  { path: '/inventory/competitive-pricing', component: InventoryCompetitivePricing },
  { path: '/inventory/lot-management', component: InventoryLotManagement },

  // Leads routes
  { path: '/leads/dashboard', component: LeadsDashboard },
  { path: '/leads/:id', component: LeadDetail },
  { path: '/leads/management', component: LeadsManagement },
  { path: '/leads/market', component: LeadsMarket },

  // CRM routes
  { path: '/crm/pipeline', component: LeadPipeline },
  { path: '/crm/deal-pipeline', component: DealPipeline },

  // Showroom routes
  { path: '/showroom/manager', component: ShowroomManager },

  // Accounting routes
  { path: '/accounting/vehicle-profit', component: AccountingVehicleProfit },
  { path: '/accounting/transactions', component: AccountingTransactions },
  { path: '/accounting/reports', component: AccountingReports },
  { path: '/accounting/monthly-close', component: AccountingMonthlyClose },
  { path: '/accounting/finance-reserves', component: AccountingFinanceReserves },
  { path: '/accounting/deal-finalization', component: AccountingDealFinalization },
  { path: '/accounting/chart-of-accounts', component: AccountingChartOfAccounts },
  { path: '/accounting/dashboard', component: AccountingDashboard },
  { path: '/accounting/tax-reports', component: AccountingTaxReports },
  { path: '/accounting/payroll-calculation', component: AccountingPayrollCalculation },
  { path: '/accounting/payroll', component: AccountingPayroll },
  { path: '/accounting/pl-statement', component: AccountingPLStatement },
  { path: '/accounting/journal-entry-form', component: AccountingJournalEntryForm },
  { path: '/accounting/journal-entries', component: AccountingJournalEntries },
  { path: '/accounting/gl-accounts', component: AccountingGLAccounts },
  { path: '/accounting/gl-account-form', component: AccountingGLAccountForm },
  { path: '/accounting/cash-flow-statement', component: AccountingCashFlowStatement },
  { path: '/accounting/balance-sheet', component: AccountingBalanceSheet },
  { path: '/accounting/layout', component: AccountingLayout },
  { path: '/accounting/dashboard-alt', component: AccountingDashboardAlt },

  // Analytics routes
  { path: '/analytics/customer-lifecycle', component: AnalyticsCustomerLifecycle },

  // Customers routes
  { path: '/customers/texting-portal', component: CustomersTextingPortal },
  { path: '/customers/phone-calls', component: CustomersPhoneCalls },

  // Desking routes
  { path: '/desking/workspace', component: DeskingWorkspace },
  { path: '/desking/approval-analysis', component: DeskingApprovalAnalysis },

  // Finance routes
  { path: '/finance/rates', component: FinanceRates },
  { path: '/finance/lenders', component: FinanceLenders },
  { path: '/finance/reports', component: FinanceReports },
  { path: '/finance/compliance-manager', component: FinanceComplianceManager },

  // F&I routes
  { path: '/fi/deal-jackets', component: FIDealJackets },
  { path: '/fi/lender-submissions', component: FILenderSubmissions },
  { path: '/fi/contracting', component: FIContracting },

  // Leads routes
  { path: '/leads/dashboard', component: LeadsDashboard },
  { path: '/leads/detail', component: LeadDetail },

  // Misc routes
  { path: '/misc/multi-store-management', component: MiscMultiStoreManagement },
  { path: '/misc/ml-model-comparison', component: MiscMLModelComparison },
  { path: '/misc/ml-developer-admin', component: MiscMLDeveloperAdmin },
  { path: '/misc/market-leads', component: MiscMarketLeads },
  { path: '/misc/lot-management', component: MiscLotManagement },
  { path: '/misc/inventory', component: MiscInventory },
  { path: '/misc/inventory-pricing', component: MiscInventoryPricing },
  { path: '/misc/inventory-detail', component: MiscInventoryDetail },
  { path: '/misc/forgot-password', component: MiscForgotPassword },
  { path: '/misc/fi-dashboard', component: MiscFIDashboard },
  { path: '/misc/fi-configuration', component: MiscFIConfiguration },
  { path: '/misc/deals', component: MiscDeals },
  { path: '/misc/customers', component: MiscCustomers },
  { path: '/misc/customer-detail', component: MiscCustomerDetail },
  { path: '/misc/crm-lead-management', component: MiscCRMLeadManagement },
  { path: '/misc/competitive-pricing', component: MiscCompetitivePricing },
  { path: '/misc/communication-demo', component: MiscCommunicationDemo },
  { path: '/misc/automotive-data-center', component: MiscAutomotiveDataCenter },
  { path: '/misc/auth-test', component: MiscAuthTest },
  { path: '/misc/analytics', component: MiscAnalytics },
  { path: '/misc/ai-smart-search', component: MiscAISmartSearch },
  { path: '/misc/sms-inbox', component: MiscSMSInbox },
  { path: '/misc/email-composer', component: MiscEmailComposer },
  { path: '/misc/design-showcase', component: MiscDesignShowcase },
  { path: '/misc/customer-profile', component: MiscCustomerProfile },
  { path: '/misc/communication-center', component: MiscCommunicationCenter },
  { path: '/misc/call-center', component: MiscCallCenter },
  { path: '/misc/crm-analytics', component: MiscCRMAnalytics },
  { path: '/misc/appointment-calendar', component: MiscAppointmentCalendar },
  { path: '/misc/reports', component: MiscReports },
  { path: '/misc/reset-password', component: MiscResetPassword },
  { path: '/misc/role-landing', component: MiscRoleLanding },
  { path: '/misc/sales', component: MiscSales },
  { path: '/misc/showroom-manager', component: MiscShowroomManager },
  { path: '/misc/system-health', component: MiscSystemHealth },
  { path: '/misc/trade-appraisals', component: MiscTradeAppraisals },
  { path: '/misc/vehicle-detail', component: MiscVehicleDetail },
  { path: '/misc/workflow-assistant', component: MiscWorkflowAssistant },

  // Reports routes
  { path: '/reports/financial', component: ReportsFinancial },
  { path: '/reports/inventory', component: ReportsInventory },
  { path: '/reports/sales', component: ReportsSales },
  { path: '/reports/service', component: ReportsService },

  // Service routes
  { path: '/service/appointments', component: ServiceAppointments },
  { path: '/service/history', component: ServiceHistory },
  { path: '/service/parts', component: ServiceParts },
  { path: '/service/reports', component: ServiceReports },
  { path: '/service/schedule', component: ServiceSchedule },
  { path: '/service/orders', component: ServiceOrders },
  { path: '/service/overview', component: ServiceOverview },

  // Settings routes
  { path: '/settings/analytics', component: SettingsAnalytics },
  { path: '/settings/branding', component: SettingsBranding },
  { path: '/settings/data', component: SettingsData },
  { path: '/settings/dealership', component: SettingsDealership },
  { path: '/settings/developer', component: SettingsDeveloper },
  { path: '/settings/forms', component: SettingsForms },
  { path: '/settings/integrations', component: SettingsIntegrations },
  { path: '/settings/notifications', component: SettingsNotifications },
  { path: '/settings/pricing-rules', component: SettingsPricingRules },
  { path: '/settings/security', component: SettingsSecurity },
  { path: '/settings/layout', component: SettingsLayout },
  { path: '/settings/users', component: SettingsUsers },
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
