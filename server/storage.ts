import { 
  users, vehicles, customers, leads, sales, activities, visitorSessions, pageViews, customerInteractions, competitorAnalytics, competitivePricing, pricingInsights, merchandisingStrategies, marketTrends, deals, dealDocuments, dealApprovals, creditApplications, coApplicants, tradeVehicles, showroomVisits, salespersonNotes, showroomSessions,
  // User Management Tables
  systemUsers, userSessions, systemRoles, activityLog,
  // Advanced Enterprise Tables
  customerTimeline, aiInsights, collaborationThreads, collaborationMessages, kpiMetrics, duplicateCustomers, workflowTemplates, workflowExecutions, predictiveScores, marketBenchmarks,
  // F&I Tables
  creditPulls, lenderApplications, fiProducts, financeMenus, fiAuditLog,
  type User, type Vehicle, type Customer, type Lead, type Sale, type Activity, type VisitorSession, type PageView, type CustomerInteraction, type CompetitorAnalytics, type CompetitivePricing, type PricingInsights, type MerchandisingStrategies, type MarketTrends, type Deal, type DealDocument, type DealApproval, type CreditApplication, type CoApplicant, type TradeVehicle, type ShowroomVisit, type SalespersonNote, type ShowroomSession,
  // User Management Types
  type SystemUser, type UserSession, type SystemRole, type ActivityLogEntry,
  // Advanced Enterprise Types
  type CustomerTimeline, type AiInsights, type CollaborationThreads, type CollaborationMessages, type KpiMetrics, type DuplicateCustomers, type WorkflowTemplates, type WorkflowExecutions, type PredictiveScores, type MarketBenchmarks,
  // F&I Types
  type CreditPull, type LenderApplication, type FiProduct, type FinanceMenu, type FiAuditLog,
  type InsertUser, type InsertVehicle, type InsertCustomer, type InsertLead, type InsertSale, type InsertActivity, type InsertVisitorSession, type InsertPageView, type InsertCustomerInteraction, type InsertCompetitorAnalytics, type InsertCompetitivePricing, type InsertPricingInsights, type InsertMerchandisingStrategies, type InsertMarketTrends, type InsertDeal, type InsertDealDocument, type InsertDealApproval, type UpsertUser,
  // User Management Insert Types
  type InsertSystemUser, type InsertUserSession, type InsertSystemRole, type InsertActivityLogEntry,
  // Advanced Enterprise Insert Types
  type InsertCustomerTimeline, type InsertAiInsights, type InsertCollaborationThreads, type InsertCollaborationMessages, type InsertKpiMetrics, type InsertDuplicateCustomers, type InsertWorkflowTemplates, type InsertWorkflowExecutions, type InsertPredictiveScores, type InsertMarketBenchmarks,
  // F&I Insert Types
  type InsertCreditPull, type InsertLenderApplication, type InsertFiProduct, type InsertFinanceMenu, type InsertFiAuditLog
} from "@shared/schema";

export interface IStorage {
  // User operations (OAuth users)
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // System User operations (password auth)
  getAllSystemUsers(): Promise<SystemUser[]>;
  getSystemUserById(id: string): Promise<SystemUser | undefined>;
  getSystemUserByEmail(email: string): Promise<SystemUser | undefined>;
  createSystemUser(user: InsertSystemUser & { passwordHash: string }): Promise<SystemUser>;
  updateSystemUser(id: string, updates: Partial<SystemUser>): Promise<SystemUser | undefined>;
  deleteSystemUser(id: string): Promise<void>;
  updateSystemUserLastLogin(id: string): Promise<void>;

  // User Session operations
  createUserSession(userId: string, token: string): Promise<string>;
  getUserSession(token: string): Promise<UserSession | undefined>;
  invalidateUserSession(token: string): Promise<void>;

  // Role operations
  getAllRoles(): Promise<SystemRole[]>;
  getRoleById(id: string): Promise<SystemRole | undefined>;
  createRole(role: InsertSystemRole): Promise<SystemRole>;
  updateRole(id: string, updates: Partial<SystemRole>): Promise<SystemRole | undefined>;
  deleteRole(id: string): Promise<void>;

  // Activity logging
  logActivity(activity: InsertActivityLogEntry): Promise<ActivityLogEntry>;
  getActivityLog(filters: { userId?: string; limit?: number; offset?: number }): Promise<ActivityLogEntry[]>;
  
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;
  
  // Lead operations
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<void>;
  
  // Sale operations
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalInventory: number;
    monthlySales: number;
    activeLeads: number;
    avgDaysToSale: number;
  }>;
  
  // Visitor tracking operations
  createVisitorSession(session: InsertVisitorSession): Promise<VisitorSession>;
  updateVisitorSession(sessionId: string, session: Partial<InsertVisitorSession>): Promise<VisitorSession | undefined>;
  getVisitorSession(sessionId: string): Promise<VisitorSession | undefined>;
  getVisitorSessions(): Promise<VisitorSession[]>;
  
  // Page view tracking
  createPageView(pageView: InsertPageView): Promise<PageView>;
  getPageViews(sessionId?: string): Promise<PageView[]>;
  
  // Customer interaction tracking
  createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction>;
  getCustomerInteractions(sessionId?: string): Promise<CustomerInteraction[]>;
  
  // Competitor analytics
  createCompetitorAnalytics(analytics: InsertCompetitorAnalytics): Promise<CompetitorAnalytics>;
  getCompetitorAnalytics(sessionId?: string): Promise<CompetitorAnalytics[]>;
  
  // Analytics metrics
  getVisitorAnalytics(): Promise<{
    totalVisitors: number;
    returningVisitors: number;
    avgSessionDuration: number;
    topReferrers: Array<{ referrer: string; count: number }>;
    topPages: Array<{ page: string; views: number }>;
    deviceTypes: Array<{ type: string; count: number }>;
    competitorInsights: Array<{ domain: string; visitors: number; avgDuration: number }>;
  }>;

  // Competitive pricing operations
  createCompetitivePricing(pricing: InsertCompetitivePricing): Promise<CompetitivePricing>;
  getCompetitivePricing(filters?: { make?: string; model?: string; year?: number; source?: string }): Promise<CompetitivePricing[]>;
  updateCompetitivePricing(id: number, pricing: Partial<InsertCompetitivePricing>): Promise<CompetitivePricing | undefined>;
  deleteCompetitivePricing(id: number): Promise<boolean>;

  // Pricing insights operations
  createPricingInsights(insights: InsertPricingInsights): Promise<PricingInsights>;
  getPricingInsights(vehicleId?: number): Promise<PricingInsights[]>;
  updatePricingInsights(id: number, insights: Partial<InsertPricingInsights>): Promise<PricingInsights | undefined>;
  deletePricingInsights(id: number): Promise<boolean>;

  // Merchandising strategies operations
  createMerchandisingStrategy(strategy: InsertMerchandisingStrategies): Promise<MerchandisingStrategies>;
  getMerchandisingStrategies(vehicleId?: number): Promise<MerchandisingStrategies[]>;
  updateMerchandisingStrategy(id: number, strategy: Partial<InsertMerchandisingStrategies>): Promise<MerchandisingStrategies | undefined>;
  deleteMerchandisingStrategy(id: number): Promise<boolean>;

  // Market trends operations
  createMarketTrend(trend: InsertMarketTrends): Promise<MarketTrends>;
  getMarketTrends(category?: string): Promise<MarketTrends[]>;
  updateMarketTrend(id: number, trend: Partial<InsertMarketTrends>): Promise<MarketTrends | undefined>;
  deleteMarketTrend(id: number): Promise<boolean>;
  
  // Credit application operations
  getCreditApplications(customerId: number): Promise<CreditApplication[]>;
  getCreditApplication(id: number): Promise<CreditApplication | undefined>;
  createCreditApplication(application: any): Promise<CreditApplication>;
  updateCreditApplication(id: number, application: any): Promise<CreditApplication | undefined>;
  deleteCreditApplication(id: number): Promise<void>;
  
  // Co-applicant operations
  getCoApplicants(customerId: number): Promise<CoApplicant[]>;
  getCoApplicant(id: number): Promise<CoApplicant | undefined>;
  createCoApplicant(coApplicant: any): Promise<CoApplicant>;
  updateCoApplicant(id: number, coApplicant: any): Promise<CoApplicant | undefined>;
  deleteCoApplicant(id: number): Promise<void>;
  
  // Trade vehicle operations
  getTradeVehicles(customerId: number): Promise<TradeVehicle[]>;
  getTradeVehicle(id: number): Promise<TradeVehicle | undefined>;
  createTradeVehicle(tradeVehicle: any): Promise<TradeVehicle>;
  updateTradeVehicle(id: number, tradeVehicle: any): Promise<TradeVehicle | undefined>;
  deleteTradeVehicle(id: number): Promise<void>;
  
  // Showroom visit operations
  getShowroomVisits(customerId: number): Promise<ShowroomVisit[]>;
  getShowroomVisit(id: number): Promise<ShowroomVisit | undefined>;
  createShowroomVisit(visit: any): Promise<ShowroomVisit>;
  updateShowroomVisit(id: number, visit: any): Promise<ShowroomVisit | undefined>;
  deleteShowroomVisit(id: number): Promise<void>;
  
  // Salesperson note operations
  getSalespersonNotes(customerId: number): Promise<SalespersonNote[]>;
  getSalespersonNote(id: number): Promise<SalespersonNote | undefined>;
  createSalespersonNote(note: any): Promise<SalespersonNote>;
  updateSalespersonNote(id: number, note: any): Promise<SalespersonNote | undefined>;
  deleteSalespersonNote(id: number): Promise<void>;
  
  // Showroom session operations
  getShowroomSessions(date?: string): Promise<ShowroomSession[]>;
  getShowroomSession(id: number): Promise<ShowroomSession | undefined>;
  createShowroomSession(session: any): Promise<ShowroomSession>;
  
  // Customer lifecycle methods
  getCustomerPageViews(customerId: number): Promise<PageView[]>;
  getCustomerInteractionsByCustomerId(customerId: number): Promise<CustomerInteraction[]>;
  getCustomerSessions(customerId: number): Promise<VisitorSession[]>;
  getDealsByCustomer(customerId: number): Promise<Deal[]>;
  getSalesByCustomer(customerId: number): Promise<Sale[]>;
  updateShowroomSession(id: number, session: any): Promise<ShowroomSession | undefined>;
  deleteShowroomSession(id: number): Promise<void>;
  endShowroomSession(id: number): Promise<ShowroomSession | undefined>;

  // Deal Management
  getAllDeals(): Promise<any[]>;
  getDeal(id: string): Promise<any>;
  createDeal(deal: any): Promise<any>;
  updateDeal(id: string, updates: any): Promise<any>;
  updateDealStatus(id: string, status: string): Promise<any>;
  getDealProducts(dealId: string): Promise<any[]>;
  addDealProduct(dealId: string, product: any): Promise<any>;
  getDealGross(dealId: string): Promise<any>;
  getDealAccountingEntries(dealId: string): Promise<any[]>;
  finalizeDeal(dealId: string): Promise<any>;
  
  // F&I (Finance & Insurance) operations
  getCreditPulls(): Promise<CreditPull[]>;
  getCreditPull(id: number): Promise<CreditPull | undefined>;
  createCreditPull(creditPull: InsertCreditPull): Promise<CreditPull>;
  updateCreditPull(id: number, creditPull: Partial<InsertCreditPull>): Promise<CreditPull | undefined>;
  
  getLenderApplications(): Promise<LenderApplication[]>;
  getLenderApplication(id: number): Promise<LenderApplication | undefined>;
  createLenderApplication(application: InsertLenderApplication): Promise<LenderApplication>;
  updateLenderApplication(id: number, application: Partial<InsertLenderApplication>): Promise<LenderApplication | undefined>;
  
  getFiProducts(): Promise<FiProduct[]>;
  getFiProduct(id: number): Promise<FiProduct | undefined>;
  createFiProduct(product: InsertFiProduct): Promise<FiProduct>;
  updateFiProduct(id: number, product: Partial<InsertFiProduct>): Promise<FiProduct | undefined>;
  
  getFinanceMenus(): Promise<FinanceMenu[]>;
  getFinanceMenu(id: number): Promise<FinanceMenu | undefined>;
  createFinanceMenu(menu: InsertFinanceMenu): Promise<FinanceMenu>;
  updateFinanceMenu(id: number, menu: Partial<InsertFinanceMenu>): Promise<FinanceMenu | undefined>;
  
  createFiAuditLog(log: InsertFiAuditLog): Promise<FiAuditLog>;
  getFiAuditLogs(entityType?: string, entityId?: number): Promise<FiAuditLog[]>;
  
  // Advanced Enterprise Features
  
  // Customer 360° Intelligence
  getCustomerTimeline(customerId: number): Promise<CustomerTimeline[]>;
  createCustomerTimelineEvent(event: InsertCustomerTimeline): Promise<CustomerTimeline>;
  
  // AI-Powered Decision Support
  getAiInsights(entityType?: string, entityId?: number): Promise<AiInsights[]>;
  createAiInsight(insight: InsertAiInsights): Promise<AiInsights>;
  updateAiInsightStatus(id: number, status: string, reviewedBy?: string): Promise<AiInsights | undefined>;
  
  // Real-Time Collaboration
  getCollaborationThreads(entityType?: string, entityId?: number): Promise<CollaborationThreads[]>;
  createCollaborationThread(thread: InsertCollaborationThreads): Promise<CollaborationThreads>;
  getCollaborationMessages(threadId: number): Promise<CollaborationMessages[]>;
  createCollaborationMessage(message: InsertCollaborationMessages): Promise<CollaborationMessages>;
  
  // Advanced Analytics & KPIs
  getKpiMetrics(metricType?: string, period?: string): Promise<KpiMetrics[]>;
  createKpiMetric(metric: InsertKpiMetrics): Promise<KpiMetrics>;
  
  // Smart Deduplication System
  getDuplicateCustomers(status?: string): Promise<DuplicateCustomers[]>;
  createDuplicateCustomerDetection(duplicate: InsertDuplicateCustomers): Promise<DuplicateCustomers>;
  
  // Workflow Automation System
  getWorkflowTemplates(): Promise<WorkflowTemplates[]>;
  createWorkflowTemplate(template: InsertWorkflowTemplates): Promise<WorkflowTemplates>;
  getWorkflowExecutions(templateId?: number): Promise<WorkflowExecutions[]>;
  createWorkflowExecution(execution: InsertWorkflowExecutions): Promise<WorkflowExecutions>;
  
  // Predictive Analytics
  getPredictiveScores(entityType?: string, entityId?: number, scoreType?: string): Promise<PredictiveScores[]>;
  createPredictiveScore(score: InsertPredictiveScores): Promise<PredictiveScores>;
  
  // Market Benchmarking
  getMarketBenchmarks(metricName?: string, timeframe?: string): Promise<MarketBenchmarks[]>;
  createMarketBenchmark(benchmark: InsertMarketBenchmarks): Promise<MarketBenchmarks>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private customers: Map<number, Customer>;
  private leads: Map<number, Lead>;
  private sales: Map<number, Sale>;
  private activities: Map<number, Activity>;
  private visitorSessions: Map<string, VisitorSession>;
  private pageViews: Map<number, PageView>;
  private customerInteractions: Map<number, CustomerInteraction>;
  private competitorAnalytics: Map<number, CompetitorAnalytics>;
  private competitivePricing: Map<number, CompetitivePricing>;
  private pricingInsights: Map<number, PricingInsights>;
  private merchandisingStrategies: Map<number, MerchandisingStrategies>;
  private marketTrends: Map<number, MarketTrends>;
  private creditApplications: Map<number, CreditApplication>;
  private coApplicants: Map<number, CoApplicant>;
  private tradeVehicles: Map<number, TradeVehicle>;
  private showroomVisits: Map<number, ShowroomVisit>;
  private salespersonNotes: Map<number, SalespersonNote>;
  private showroomSessions: Map<number, ShowroomSession>;
  private deals: Map<string, any>;
  private dealProducts: Map<string, any[]>;
  private dealGross: Map<string, any>;
  private accountingEntries: Map<string, any[]>;
  
  // F&I Storage Maps
  private creditPulls: Map<number, CreditPull>;
  private lenderApplications: Map<number, LenderApplication>;
  private fiProducts: Map<number, FiProduct>;
  private financeMenus: Map<number, FinanceMenu>;
  private fiAuditLogs: Map<number, FiAuditLog>;
  
  // System User Management Storage
  private systemUsers: Map<string, SystemUser>;
  private userSessions: Map<string, UserSession>;
  private systemRoles: Map<string, SystemRole>;
  private activityLogs: Map<string, ActivityLogEntry>;
  
  // Advanced Enterprise Feature Storage
  private customerTimeline: Map<number, CustomerTimeline>;
  private aiInsights: Map<number, AiInsights>;
  private collaborationThreads: Map<number, CollaborationThreads>;
  private collaborationMessages: Map<number, CollaborationMessages>;
  private kpiMetrics: Map<number, KpiMetrics>;
  private duplicateCustomers: Map<number, DuplicateCustomers>;
  private workflowTemplates: Map<number, WorkflowTemplates>;
  private workflowExecutions: Map<number, WorkflowExecutions>;
  private predictiveScores: Map<number, PredictiveScores>;
  private marketBenchmarks: Map<number, MarketBenchmarks>;
  
  private currentUserId: number;
  private currentVehicleId: number;
  private currentCustomerId: number;
  private currentLeadId: number;
  private currentSaleId: number;
  private currentActivityId: number;
  private currentPageViewId: number;
  private currentInteractionId: number;
  private currentCompetitorId: number;
  private currentCompetitivePricingId: number;
  private currentPricingInsightsId: number;
  private currentMerchandisingStrategyId: number;
  private currentMarketTrendId: number;
  private currentCreditApplicationId: number;
  private currentCoApplicantId: number;
  private currentTradeVehicleId: number;
  private currentShowroomVisitId: number;
  private currentSalespersonNoteId: number;
  private currentShowroomSessionId: number;
  private currentCustomerTimelineId: number;
  private currentAiInsightsId: number;
  private currentCollaborationThreadId: number;
  private currentCollaborationMessageId: number;
  private currentKpiMetricId: number;
  private currentDuplicateCustomerId: number;
  private currentWorkflowTemplateId: number;
  private currentWorkflowExecutionId: number;
  private currentPredictiveScoreId: number;
  private currentMarketBenchmarkId: number;
  
  // F&I ID Counters
  private currentCreditPullId: number;
  private currentLenderApplicationId: number;
  private currentFiProductId: number;
  private currentFinanceMenuId: number;
  private currentFiAuditLogId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.customers = new Map();
    this.leads = new Map();
    this.sales = new Map();
    this.activities = new Map();
    this.visitorSessions = new Map();
    this.pageViews = new Map();
    this.customerInteractions = new Map();
    this.competitorAnalytics = new Map();
    this.competitivePricing = new Map();
    this.pricingInsights = new Map();
    this.merchandisingStrategies = new Map();
    this.marketTrends = new Map();
    this.creditApplications = new Map();
    this.coApplicants = new Map();
    this.tradeVehicles = new Map();
    this.showroomVisits = new Map();
    this.salespersonNotes = new Map();
    this.showroomSessions = new Map();
    this.deals = new Map();
    this.dealProducts = new Map();
    this.dealGross = new Map();
    this.accountingEntries = new Map();
    
    // System User Management Map Initialization
    this.systemUsers = new Map();
    this.userSessions = new Map();
    this.systemRoles = new Map();
    this.activityLogs = new Map();
    
    // F&I Map Initialization
    this.creditPulls = new Map();
    this.lenderApplications = new Map();
    this.fiProducts = new Map();
    this.financeMenus = new Map();
    this.fiAuditLogs = new Map();
    
    this.currentUserId = 1;
    this.currentVehicleId = 1;
    this.currentCustomerId = 1;
    this.currentLeadId = 1;
    this.currentSaleId = 1;
    this.currentActivityId = 1;
    this.currentPageViewId = 1;
    this.currentInteractionId = 1;
    this.currentCompetitorId = 1;
    this.currentCompetitivePricingId = 1;
    this.currentPricingInsightsId = 1;
    this.currentMerchandisingStrategyId = 1;
    this.currentMarketTrendId = 1;
    this.currentCreditApplicationId = 1;
    this.currentCoApplicantId = 1;
    this.currentTradeVehicleId = 1;
    this.currentShowroomVisitId = 1;
    this.currentSalespersonNoteId = 1;
    this.currentShowroomSessionId = 1;
    
    // F&I ID Counter Initialization
    this.currentCreditPullId = 1;
    this.currentLenderApplicationId = 1;
    this.currentFiProductId = 1;
    this.currentFinanceMenuId = 1;
    this.currentFiAuditLogId = 1;
    
    this.initializeDefaultData();
    this.initializeSystemUserData();
  }

  private initializeDefaultData() {
    // Create default users
    const users: User[] = [
      {
        id: 1,
        username: "admin",
        password: "password",
        name: "John Smith",
        email: "admin@dealership.com",
        phone: "(555) 123-4567",
        roleId: 1,
        departmentId: 1,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: "sarah.jones",
        password: "password",
        name: "Sarah Jones",
        email: "sarah@dealership.com",
        phone: "(555) 123-4568",
        roleId: 2,
        departmentId: 1,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        username: "mike.wilson",
        password: "password",
        name: "Mike Wilson",
        email: "mike@dealership.com",
        phone: "(555) 123-4569",
        roleId: 3,
        departmentId: 2,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    users.forEach(user => this.users.set(user.id, user));
    this.currentUserId = 4;

    // Create sample vehicles
    const vehicles: Vehicle[] = [
      {
        id: 1,
        make: "Toyota",
        model: "Camry",
        year: 2023,
        vin: "1HGBH41JXMN109186",
        price: 28500,
        status: "available",
        description: "Excellent condition, low mileage",
        imageUrl: null,
        createdAt: new Date()
      },
      {
        id: 2,
        make: "Honda",
        model: "Civic",
        year: 2022,
        vin: "2HGFC2F59MH123456",
        price: 24900,
        status: "available",
        description: "Clean carfax, one owner",
        imageUrl: null,
        createdAt: new Date()
      },
      {
        id: 3,
        make: "Ford",
        model: "F-150",
        year: 2023,
        vin: "1FTFW1ET5MFC12345",
        price: 45000,
        status: "pending",
        description: "Crew cab, loaded with options",
        imageUrl: null,
        createdAt: new Date()
      },
      {
        id: 4,
        make: "Chevrolet",
        model: "Silverado",
        year: 2022,
        vin: "1GCRYDED5MZ123456",
        price: 42000,
        status: "available",
        description: "4WD, leather interior",
        imageUrl: null,
        createdAt: new Date()
      },
      {
        id: 5,
        make: "BMW",
        model: "3 Series",
        year: 2023,
        vin: "WBA8E9G59MNU12345",
        price: 52000,
        status: "available",
        description: "Premium package, sport line",
        imageUrl: null,
        createdAt: new Date()
      }
    ];
    
    vehicles.forEach(vehicle => this.vehicles.set(vehicle.id, vehicle));
    this.currentVehicleId = 6;

    // Create sample customers
    const customers: Customer[] = [
      {
        id: 1,
        firstName: "Robert",
        lastName: "Johnson",
        name: "Robert Johnson",
        email: "robert.johnson@email.com",
        phone: "(555) 234-5678",
        cellPhone: "(555) 234-5679",
        workPhone: null,
        address: "123 Main St",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        dateOfBirth: null,
        driversLicenseNumber: null,
        driversLicenseState: null,
        ssn: null,
        creditScore: 750,
        income: 75000,
        employment: null,
        bankingInfo: null,
        insurance: null,
        preferences: null,
        leadSource: "website",
        referredBy: null,
        communicationPreferences: null,
        purchaseHistory: null,
        serviceHistory: null,
        followUpSchedule: null,
        tags: null,
        notes: "Interested in SUVs, good credit",
        salesConsultant: "Sarah Jones",
        status: "hot",
        lastContactDate: null,
        nextFollowUpDate: null,
        licenseNumber: null,
        licenseState: null,
        licenseExpiry: null,
        profileImage: null,
        socialSecurityNumber: null,
        preferredContactMethod: null,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 2,
        firstName: "Emily",
        lastName: "Davis",
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "(555) 345-6789",
        cellPhone: "(555) 345-6790",
        workPhone: null,
        address: "456 Oak Ave",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        dateOfBirth: null,
        driversLicenseNumber: null,
        driversLicenseState: null,
        ssn: null,
        creditScore: 680,
        income: 55000,
        employment: null,
        bankingInfo: null,
        insurance: null,
        preferences: null,
        leadSource: "referral",
        referredBy: null,
        communicationPreferences: null,
        purchaseHistory: null,
        serviceHistory: null,
        followUpSchedule: null,
        tags: null,
        notes: "First-time buyer, needs financing",
        salesConsultant: "Mike Wilson",
        status: "warm",
        lastContactDate: null,
        nextFollowUpDate: null,
        licenseNumber: null,
        licenseState: null,
        licenseExpiry: null,
        profileImage: null,
        socialSecurityNumber: null,
        preferredContactMethod: null,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 3,
        firstName: "Michael",
        lastName: "Brown",
        name: "Michael Brown",
        email: "michael.brown@email.com",
        phone: "(555) 456-7890",
        cellPhone: "(555) 456-7891",
        workPhone: null,
        address: "789 Pine St",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        dateOfBirth: null,
        driversLicenseNumber: null,
        driversLicenseState: null,
        ssn: null,
        creditScore: 720,
        income: 85000,
        employment: null,
        bankingInfo: null,
        insurance: null,
        preferences: null,
        leadSource: "walk-in",
        referredBy: null,
        communicationPreferences: null,
        purchaseHistory: null,
        serviceHistory: null,
        followUpSchedule: null,
        tags: null,
        notes: "Interested in trucks, cash buyer",
        salesConsultant: "John Smith",
        status: "customer",
        lastContactDate: null,
        nextFollowUpDate: null,
        licenseNumber: null,
        licenseState: null,
        licenseExpiry: null,
        profileImage: null,
        socialSecurityNumber: null,
        preferredContactMethod: null,
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    customers.forEach(customer => this.customers.set(customer.id, customer));
    this.currentCustomerId = 4;

    // Create sample leads
    const leads: Lead[] = [
      {
        id: 1,
        customerId: 1,
        leadNumber: "L-2024-001",
        source: "website",
        status: "new",
        priority: "high",
        temperature: "hot",
        interestedVehicles: null,
        budget: null,
        timeline: "immediate",
        tradeInInfo: null,
        financing: null,
        assignedTo: "Sarah Jones",
        lastActivity: new Date(),
        nextFollowUp: new Date(),
        activities: null,
        tags: null,
        notes: "Very interested in Toyota Camry",
        conversionProbability: 85,
        estimatedValue: 28500,
        competitorInfo: null,
        customerName: "Robert Johnson",
        customerEmail: "robert.johnson@email.com",
        customerPhone: "(555) 234-5678",
        interestedIn: "Toyota Camry",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        customerId: 2,
        leadNumber: "L-2024-002",
        source: "referral",
        status: "contacted",
        priority: "medium",
        temperature: "warm",
        interestedVehicles: null,
        budget: null,
        timeline: "within_month",
        tradeInInfo: null,
        financing: null,
        assignedTo: "Mike Wilson",
        lastActivity: new Date(),
        nextFollowUp: new Date(),
        activities: null,
        tags: null,
        notes: "Needs financing options",
        conversionProbability: 65,
        estimatedValue: 24900,
        competitorInfo: null,
        customerName: "Emily Davis",
        customerEmail: "emily.davis@email.com",
        customerPhone: "(555) 345-6789",
        interestedIn: "Honda Civic",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    leads.forEach(lead => this.leads.set(lead.id, lead));
    this.currentLeadId = 3;

    // Create sample sales
    const sales: Sale[] = [
      {
        id: 1,
        customerId: 3,
        vehicleId: 1,
        salesPersonId: 1,
        saleDate: new Date(),
        salePrice: 28500,
        downPayment: 5000,
        financeAmount: 23500,
        interestRate: 4.5,
        loanTerm: 60,
        monthlyPayment: 438,
        tradeInValue: 0,
        taxes: 2000,
        fees: 500,
        totalAmount: 31000,
        status: "completed",
        financeCompany: "Toyota Financial",
        notes: "Smooth transaction",
        createdAt: new Date()
      }
    ];
    
    sales.forEach(sale => this.sales.set(sale.id, sale));
    this.currentSaleId = 2;

    // Create sample activities
    const activities: Activity[] = [
      {
        id: 1,
        type: "sale_completed",
        description: "Sale completed for Toyota Camry - $28,500",
        userId: 1,
        relatedId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        type: "lead_created",
        description: "New lead: Robert Johnson interested in Toyota Camry",
        userId: 2,
        relatedId: 1,
        createdAt: new Date()
      },
      {
        id: 3,
        type: "customer_contacted",
        description: "Follow-up call with Emily Davis",
        userId: 3,
        relatedId: 2,
        createdAt: new Date()
      }
    ];
    
    activities.forEach(activity => this.activities.set(activity.id, activity));
    this.currentActivityId = 4;

    // Create sample showroom sessions
    const showroomSessions: ShowroomSession[] = [
      {
        id: 1,
        customerId: 1,
        vehicleId: 1,
        stockNumber: "STK001",
        salespersonId: 1,
        leadSource: "walk-in",
        eventStatus: "pending",
        dealStage: "test_drive",
        notes: "Customer interested in test drive",
        timeEntered: new Date().toISOString(),
        timeExited: null,
        sessionDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        customerId: 2,
        vehicleId: 3,
        stockNumber: "STK003",
        salespersonId: 2,
        leadSource: "website",
        eventStatus: "sold",
        dealStage: "finalized",
        notes: "Deal completed - financing approved",
        timeEntered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        timeExited: new Date().toISOString(),
        sessionDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        customerId: 3,
        vehicleId: 2,
        stockNumber: "STK002",
        salespersonId: 3,
        leadSource: "referral",
        eventStatus: "dead",
        dealStage: "vehicle_selection",
        notes: "Customer decided not to purchase",
        timeEntered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        timeExited: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        sessionDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        customerId: 4,
        vehicleId: 4,
        stockNumber: "STK004",
        salespersonId: 1,
        leadSource: "phone",
        eventStatus: "pending",
        dealStage: "numbers",
        notes: "Working on financing options",
        timeEntered: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        timeExited: null,
        sessionDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    showroomSessions.forEach(session => this.showroomSessions.set(session.id, session));
    this.currentShowroomSessionId = 5;
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Update existing user
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      // Remove old entry if ID type changed
      Array.from(this.users.entries()).forEach(([key, value]) => {
        if (value.id === userData.id) {
          this.users.delete(key);
        }
      });
      this.users.set(userData.id as any, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser = {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLogin: null,
        roleId: null,
        departmentId: null,
        phone: null,
        username: null,
        password: null,
        name: null,
        ...userData,
      };
      this.users.set(userData.id as any, newUser);
      return newUser;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id: String(id),
      phone: insertUser.phone || null,
      departmentId: insertUser.departmentId || null,
      roleId: insertUser.roleId || null,
      isActive: insertUser.isActive ?? true,
      lastLogin: insertUser.lastLogin || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      uuid: crypto.randomUUID(),
      createdAt: new Date(),
      description: insertVehicle.description || null,
      imageUrl: insertVehicle.imageUrl || null
    };
    this.vehicles.set(id, vehicle);
    
    // Create activity
    await this.createActivity({
      type: "vehicle_added",
      description: `Added new vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      userId: 1
    });
    
    return vehicle;
  }

  async updateVehicle(id: number, updateVehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...updateVehicle };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    this.vehicles.delete(id);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    try {
      return Array.from(this.customers.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      return this.customers.get(id);
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date(),
      phone: insertCustomer.phone || null,
      cellPhone: insertCustomer.cellPhone || null,
      workPhone: insertCustomer.workPhone || null,
      address: insertCustomer.address || null,
      city: insertCustomer.city || null,
      state: insertCustomer.state || null,
      zipCode: insertCustomer.zipCode || null,
      isActive: insertCustomer.isActive ?? true,
      notes: insertCustomer.notes || null,
      licenseNumber: insertCustomer.licenseNumber || null,
      licenseState: insertCustomer.licenseState || null,
      licenseExpiry: insertCustomer.licenseExpiry || null,
      profileImage: insertCustomer.profileImage || null,
      socialSecurityNumber: insertCustomer.socialSecurityNumber || null,
      preferredContactMethod: insertCustomer.preferredContactMethod || null,
      creditScore: insertCustomer.creditScore || null,
      income: insertCustomer.income || null,
      leadSource: insertCustomer.leadSource || null,
      salesConsultant: insertCustomer.salesConsultant || null,
      status: insertCustomer.status || "prospect",
      tags: insertCustomer.tags || null,
      dateOfBirth: insertCustomer.dateOfBirth || null,
      driversLicenseNumber: insertCustomer.driversLicenseNumber || null,
      driversLicenseState: insertCustomer.driversLicenseState || null,
      ssn: insertCustomer.ssn || null,
      employment: insertCustomer.employment || null,
      bankingInfo: insertCustomer.bankingInfo || null,
      insurance: insertCustomer.insurance || null,
      preferences: insertCustomer.preferences || null,
      referredBy: insertCustomer.referredBy || null,
      communicationPreferences: insertCustomer.communicationPreferences || null,
      purchaseHistory: insertCustomer.purchaseHistory || null,
      serviceHistory: insertCustomer.serviceHistory || null,
      followUpSchedule: insertCustomer.followUpSchedule || null,
      lastContactDate: insertCustomer.lastContactDate || null,
      nextFollowUpDate: insertCustomer.nextFollowUpDate || null
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateCustomer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updateCustomer };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    this.customers.delete(id);
  }

  // Lead operations
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = { 
      ...insertLead, 
      id, 
      createdAt: new Date(),
      customerId: insertLead.customerId || null,
      customerPhone: insertLead.customerPhone || null,
      interestedIn: insertLead.interestedIn || null,
      notes: insertLead.notes || null
    };
    this.leads.set(id, lead);
    
    // Create activity
    await this.createActivity({
      type: "lead_created",
      description: `New lead: ${lead.customerName} interested in ${lead.interestedIn || 'vehicles'}`,
      userId: 1
    });
    
    return lead;
  }

  async updateLead(id: number, updateLead: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updateLead };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<void> {
    this.leads.delete(id);
  }

  // Sale operations
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values()).sort((a, b) => 
      new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    );
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = { 
      ...insertSale, 
      id, 
      saleDate: new Date(),
      notes: insertSale.notes || null
    };
    this.sales.set(id, sale);
    
    // Update vehicle status to sold
    await this.updateVehicle(sale.vehicleId, { status: "sold" });
    
    // Create activity
    const vehicle = await this.getVehicle(sale.vehicleId);
    const customer = await this.getCustomer(sale.customerId);
    const salesperson = await this.getUser(sale.salesPersonId);
    
    if (vehicle && customer && salesperson) {
      await this.createActivity({
        type: "sale_completed",
        description: `${salesperson.name} sold ${vehicle.year} ${vehicle.make} ${vehicle.model} to ${customer.name} for $${sale.salePrice.toLocaleString()}`,
        userId: sale.salesPersonId
      });
    }
    
    return sale;
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10); // Return only the 10 most recent activities
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date(),
      userId: insertActivity.userId || null
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalInventory: number;
    monthlySales: number;
    activeLeads: number;
    avgDaysToSale: number;
  }> {
    const vehicles = await this.getVehicles();
    const sales = await this.getSales();
    const leads = await this.getLeads();
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlySales = sales
      .filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + sale.salePrice, 0);
    
    const activeLeads = leads.filter(lead => lead.status === "new" || lead.status === "contacted").length;
    
    // Calculate average days to sale (simplified calculation)
    const avgDaysToSale = 28; // Placeholder calculation
    
    return {
      totalInventory: vehicles.filter(v => v.status === "available").length,
      monthlySales,
      activeLeads,
      avgDaysToSale
    };
  }

  // Visitor tracking operations
  async createVisitorSession(insertSession: InsertVisitorSession): Promise<VisitorSession> {
    const session: VisitorSession = {
      ...insertSession,
      id: Date.now(), // Using timestamp as ID for simplicity
      lastActivity: new Date(),
      createdAt: new Date(),
      userAgent: insertSession.userAgent || null,
      ipAddress: insertSession.ipAddress || null,
      referrer: insertSession.referrer || null,
      landingPage: insertSession.landingPage || null,
      deviceType: insertSession.deviceType || null,
      browserName: insertSession.browserName || null,
      operatingSystem: insertSession.operatingSystem || null,
      country: insertSession.country || null,
      city: insertSession.city || null,
      isReturningVisitor: insertSession.isReturningVisitor || false,
      totalPageViews: insertSession.totalPageViews || 0,
      sessionDuration: insertSession.sessionDuration || 0
    };
    this.visitorSessions.set(session.sessionId, session);
    return session;
  }

  async updateVisitorSession(sessionId: string, updateSession: Partial<InsertVisitorSession>): Promise<VisitorSession | undefined> {
    const session = this.visitorSessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updateSession, lastActivity: new Date() };
    this.visitorSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async getVisitorSession(sessionId: string): Promise<VisitorSession | undefined> {
    return this.visitorSessions.get(sessionId);
  }

  async getVisitorSessions(): Promise<VisitorSession[]> {
    return Array.from(this.visitorSessions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Page view tracking
  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const id = this.currentPageViewId++;
    const pageView: PageView = {
      ...insertPageView,
      id,
      createdAt: new Date(),
      pageTitle: insertPageView.pageTitle || null,
      timeOnPage: insertPageView.timeOnPage || null,
      scrollDepth: insertPageView.scrollDepth || null,
      exitPage: insertPageView.exitPage || null
    };
    this.pageViews.set(id, pageView);
    return pageView;
  }

  async getPageViews(sessionId?: string): Promise<PageView[]> {
    const views = Array.from(this.pageViews.values());
    if (sessionId) {
      return views.filter(view => view.sessionId === sessionId);
    }
    return views.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Customer interaction tracking
  async createCustomerInteraction(insertInteraction: InsertCustomerInteraction): Promise<CustomerInteraction> {
    const id = this.currentInteractionId++;
    const interaction: CustomerInteraction = {
      ...insertInteraction,
      id,
      createdAt: new Date(),
      vehicleId: insertInteraction.vehicleId || null,
      elementId: insertInteraction.elementId || null,
      data: insertInteraction.data || null
    };
    this.customerInteractions.set(id, interaction);
    return interaction;
  }

  async getCustomerInteractions(sessionId?: string): Promise<CustomerInteraction[]> {
    const interactions = Array.from(this.customerInteractions.values());
    if (sessionId) {
      return interactions.filter(interaction => interaction.sessionId === sessionId);
    }
    return interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Competitor analytics
  async createCompetitorAnalytics(insertAnalytics: InsertCompetitorAnalytics): Promise<CompetitorAnalytics> {
    const id = this.currentCompetitorId++;
    const analytics: CompetitorAnalytics = {
      ...insertAnalytics,
      id,
      createdAt: new Date(),
      visitDuration: insertAnalytics.visitDuration || null,
      pagesVisited: insertAnalytics.pagesVisited || null
    };
    this.competitorAnalytics.set(id, analytics);
    return analytics;
  }

  async getCompetitorAnalytics(sessionId?: string): Promise<CompetitorAnalytics[]> {
    const analytics = Array.from(this.competitorAnalytics.values());
    if (sessionId) {
      return analytics.filter(analytic => analytic.sessionId === sessionId);
    }
    return analytics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Analytics metrics
  async getVisitorAnalytics(): Promise<{
    totalVisitors: number;
    returningVisitors: number;
    avgSessionDuration: number;
    topReferrers: Array<{ referrer: string; count: number }>;
    topPages: Array<{ page: string; views: number }>;
    deviceTypes: Array<{ type: string; count: number }>;
    competitorInsights: Array<{ domain: string; visitors: number; avgDuration: number }>;
  }> {
    const sessions = await this.getVisitorSessions();
    const pageViews = await this.getPageViews();
    const competitorData = await this.getCompetitorAnalytics();

    // Calculate metrics
    const totalVisitors = sessions.length;
    const returningVisitors = sessions.filter(s => s.isReturningVisitor).length;
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / sessions.length || 0;

    // Top referrers
    const referrerCounts = new Map<string, number>();
    sessions.forEach(session => {
      if (session.referrer) {
        referrerCounts.set(session.referrer, (referrerCounts.get(session.referrer) || 0) + 1);
      }
    });
    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top pages
    const pageCounts = new Map<string, number>();
    pageViews.forEach(view => {
      pageCounts.set(view.pageUrl, (pageCounts.get(view.pageUrl) || 0) + 1);
    });
    const topPages = Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Device types
    const deviceCounts = new Map<string, number>();
    sessions.forEach(session => {
      if (session.deviceType) {
        deviceCounts.set(session.deviceType, (deviceCounts.get(session.deviceType) || 0) + 1);
      }
    });
    const deviceTypes = Array.from(deviceCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Competitor insights
    const competitorCounts = new Map<string, { visitors: number; totalDuration: number }>();
    competitorData.forEach(comp => {
      const existing = competitorCounts.get(comp.competitorDomain) || { visitors: 0, totalDuration: 0 };
      competitorCounts.set(comp.competitorDomain, {
        visitors: existing.visitors + 1,
        totalDuration: existing.totalDuration + (comp.visitDuration || 0)
      });
    });
    const competitorInsights = Array.from(competitorCounts.entries())
      .map(([domain, data]) => ({
        domain,
        visitors: data.visitors,
        avgDuration: data.totalDuration / data.visitors
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    return {
      totalVisitors,
      returningVisitors,
      avgSessionDuration,
      topReferrers,
      topPages,
      deviceTypes,
      competitorInsights
    };
  }

  // Competitive pricing operations
  async createCompetitivePricing(insertPricing: InsertCompetitivePricing): Promise<CompetitivePricing> {
    const id = this.currentCompetitivePricingId++;
    const pricing: CompetitivePricing = { 
      ...insertPricing, 
      id, 
      scrapedAt: new Date(),
      isActive: insertPricing.isActive ?? true,
      trim: insertPricing.trim || null,
      mileage: insertPricing.mileage || null,
      sourceUrl: insertPricing.sourceUrl || null,
      location: insertPricing.location || null,
      condition: insertPricing.condition || null,
      features: insertPricing.features || null,
      images: insertPricing.images || null
    };
    this.competitivePricing.set(id, pricing);
    return pricing;
  }

  async getCompetitivePricing(filters?: { make?: string; model?: string; year?: number; source?: string }): Promise<CompetitivePricing[]> {
    let pricing = Array.from(this.competitivePricing.values())
      .filter(p => p.isActive)
      .sort((a, b) => new Date(b.scrapedAt || 0).getTime() - new Date(a.scrapedAt || 0).getTime());
    
    if (filters) {
      if (filters.make) {
        pricing = pricing.filter(p => p.make.toLowerCase().includes(filters.make!.toLowerCase()));
      }
      if (filters.model) {
        pricing = pricing.filter(p => p.model.toLowerCase().includes(filters.model!.toLowerCase()));
      }
      if (filters.year) {
        pricing = pricing.filter(p => p.year === filters.year);
      }
      if (filters.source) {
        pricing = pricing.filter(p => p.source.toLowerCase().includes(filters.source!.toLowerCase()));
      }
    }
    
    return pricing;
  }

  async updateCompetitivePricing(id: number, updatePricing: Partial<InsertCompetitivePricing>): Promise<CompetitivePricing | undefined> {
    const pricing = this.competitivePricing.get(id);
    if (!pricing) return undefined;
    
    const updatedPricing = { ...pricing, ...updatePricing };
    this.competitivePricing.set(id, updatedPricing);
    return updatedPricing;
  }

  async deleteCompetitivePricing(id: number): Promise<boolean> {
    return this.competitivePricing.delete(id);
  }

  // Pricing insights operations
  async createPricingInsights(insertInsights: InsertPricingInsights): Promise<PricingInsights> {
    const id = this.currentPricingInsightsId++;
    const insights: PricingInsights = { 
      ...insertInsights, 
      id, 
      lastUpdated: new Date(),
      vehicleId: insertInsights.vehicleId || null,
      priceRange: insertInsights.priceRange || null,
      recommendedAction: insertInsights.recommendedAction || "",
      factors: insertInsights.factors || null
    };
    this.pricingInsights.set(id, insights);
    return insights;
  }

  async getPricingInsights(vehicleId?: number): Promise<PricingInsights[]> {
    let insights = Array.from(this.pricingInsights.values())
      .sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime());
    
    if (vehicleId) {
      insights = insights.filter(i => i.vehicleId === vehicleId);
    }
    
    return insights;
  }

  async updatePricingInsights(id: number, updateInsights: Partial<InsertPricingInsights>): Promise<PricingInsights | undefined> {
    const insights = this.pricingInsights.get(id);
    if (!insights) return undefined;
    
    const updatedInsights = { ...insights, ...updateInsights, lastUpdated: new Date() };
    this.pricingInsights.set(id, updatedInsights);
    return updatedInsights;
  }

  async deletePricingInsights(id: number): Promise<boolean> {
    return this.pricingInsights.delete(id);
  }

  // Merchandising strategies operations
  async createMerchandisingStrategy(insertStrategy: InsertMerchandisingStrategies): Promise<MerchandisingStrategies> {
    const id = this.currentMerchandisingStrategyId++;
    const strategy: MerchandisingStrategies = { 
      ...insertStrategy, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertStrategy.status || null,
      vehicleId: insertStrategy.vehicleId || null,
      implementationCost: insertStrategy.implementationCost || null,
      expectedROI: insertStrategy.expectedROI || null
    };
    this.merchandisingStrategies.set(id, strategy);
    return strategy;
  }

  async getMerchandisingStrategies(vehicleId?: number): Promise<MerchandisingStrategies[]> {
    let strategies = Array.from(this.merchandisingStrategies.values())
      .sort((a, b) => b.priority - a.priority);
    
    if (vehicleId) {
      strategies = strategies.filter(s => s.vehicleId === vehicleId);
    }
    
    return strategies;
  }

  async updateMerchandisingStrategy(id: number, updateStrategy: Partial<InsertMerchandisingStrategies>): Promise<MerchandisingStrategies | undefined> {
    const strategy = this.merchandisingStrategies.get(id);
    if (!strategy) return undefined;
    
    const updatedStrategy = { ...strategy, ...updateStrategy, updatedAt: new Date() };
    this.merchandisingStrategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  async deleteMerchandisingStrategy(id: number): Promise<boolean> {
    return this.merchandisingStrategies.delete(id);
  }

  // Market trends operations
  async createMarketTrend(insertTrend: InsertMarketTrends): Promise<MarketTrends> {
    const id = this.currentMarketTrendId++;
    const trend: MarketTrends = { 
      ...insertTrend, 
      id, 
      lastUpdated: new Date()
    };
    this.marketTrends.set(id, trend);
    return trend;
  }

  async getMarketTrends(category?: string): Promise<MarketTrends[]> {
    let trends = Array.from(this.marketTrends.values())
      .sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime());
    
    if (category) {
      trends = trends.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    return trends;
  }

  async updateMarketTrend(id: number, updateTrend: Partial<InsertMarketTrends>): Promise<MarketTrends | undefined> {
    const trend = this.marketTrends.get(id);
    if (!trend) return undefined;
    
    const updatedTrend = { ...trend, ...updateTrend, lastUpdated: new Date() };
    this.marketTrends.set(id, updatedTrend);
    return updatedTrend;
  }

  async deleteMarketTrend(id: number): Promise<boolean> {
    return this.marketTrends.delete(id);
  }

  // Credit Application operations
  async getCreditApplications(customerId: number): Promise<CreditApplication[]> {
    return Array.from(this.creditApplications.values()).filter(app => app.customerId === customerId);
  }

  async getCreditApplication(id: number): Promise<CreditApplication | undefined> {
    return this.creditApplications.get(id);
  }

  async createCreditApplication(application: any): Promise<CreditApplication> {
    const newApp: CreditApplication = {
      id: this.currentCreditApplicationId++,
      customerId: application.customerId,
      applicationDate: new Date().toISOString(),
      fullName: application.fullName,
      dateOfBirth: application.dateOfBirth,
      ssn: application.ssn,
      employmentHistory: application.employmentHistory || [],
      currentIncome: application.currentIncome,
      rentMortgage: application.rentMortgage,
      consentGiven: application.consentGiven || false,
      status: "pending",
      submittedAt: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      approvalAmount: null,
      interestRate: null,
      termMonths: null,
      notes: application.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.creditApplications.set(newApp.id, newApp);
    return newApp;
  }

  async updateCreditApplication(id: number, application: any): Promise<CreditApplication | undefined> {
    const existing = this.creditApplications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...application, updatedAt: new Date().toISOString() };
    this.creditApplications.set(id, updated);
    return updated;
  }

  async deleteCreditApplication(id: number): Promise<void> {
    this.creditApplications.delete(id);
  }

  // Co-Applicant operations
  async getCoApplicants(customerId: number): Promise<CoApplicant[]> {
    return Array.from(this.coApplicants.values()).filter(app => {
      const creditApp = Array.from(this.creditApplications.values()).find(ca => ca.customerId === customerId);
      return creditApp && app.creditApplicationId === creditApp.id;
    });
  }

  async getCoApplicant(id: number): Promise<CoApplicant | undefined> {
    return this.coApplicants.get(id);
  }

  async createCoApplicant(coApplicant: any): Promise<CoApplicant> {
    const newCoApplicant: CoApplicant = {
      id: this.currentCoApplicantId++,
      creditApplicationId: coApplicant.creditApplicationId,
      firstName: coApplicant.firstName,
      lastName: coApplicant.lastName,
      email: coApplicant.email || null,
      phone: coApplicant.phone || null,
      dateOfBirth: coApplicant.dateOfBirth,
      ssn: coApplicant.ssn,
      address: coApplicant.address || null,
      city: coApplicant.city || null,
      state: coApplicant.state || null,
      zipCode: coApplicant.zipCode || null,
      employmentHistory: coApplicant.employmentHistory || [],
      currentIncome: coApplicant.currentIncome || null,
      creditScore: coApplicant.creditScore || null,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.coApplicants.set(newCoApplicant.id, newCoApplicant);
    return newCoApplicant;
  }

  async updateCoApplicant(id: number, coApplicant: any): Promise<CoApplicant | undefined> {
    const existing = this.coApplicants.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...coApplicant, updatedAt: new Date().toISOString() };
    this.coApplicants.set(id, updated);
    return updated;
  }

  async deleteCoApplicant(id: number): Promise<void> {
    this.coApplicants.delete(id);
  }

  // Trade Vehicle operations
  async getTradeVehicles(customerId: number): Promise<TradeVehicle[]> {
    return Array.from(this.tradeVehicles.values()).filter(vehicle => vehicle.customerId === customerId);
  }

  async getTradeVehicle(id: number): Promise<TradeVehicle | undefined> {
    return this.tradeVehicles.get(id);
  }

  async createTradeVehicle(tradeVehicle: any): Promise<TradeVehicle> {
    const newTradeVehicle: TradeVehicle = {
      id: this.currentTradeVehicleId++,
      customerId: tradeVehicle.customerId,
      year: tradeVehicle.year,
      make: tradeVehicle.make,
      model: tradeVehicle.model,
      trim: tradeVehicle.trim || null,
      vin: tradeVehicle.vin,
      mileage: tradeVehicle.mileage || null,
      condition: tradeVehicle.condition || null,
      estimatedValue: tradeVehicle.estimatedValue || null,
      kbbValue: tradeVehicle.kbbValue || null,
      mmrValue: tradeVehicle.mmrValue || null,
      actualValue: tradeVehicle.actualValue || null,
      photos: tradeVehicle.photos || [],
      notes: tradeVehicle.notes || null,
      status: "pending",
      appraisedAt: null,
      appraisedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tradeVehicles.set(newTradeVehicle.id, newTradeVehicle);
    return newTradeVehicle;
  }

  async updateTradeVehicle(id: number, tradeVehicle: any): Promise<TradeVehicle | undefined> {
    const existing = this.tradeVehicles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...tradeVehicle, updatedAt: new Date().toISOString() };
    this.tradeVehicles.set(id, updated);
    return updated;
  }

  async deleteTradeVehicle(id: number): Promise<void> {
    this.tradeVehicles.delete(id);
  }

  // Showroom Visit operations
  async getShowroomVisits(customerId: number): Promise<ShowroomVisit[]> {
    return Array.from(this.showroomVisits.values()).filter(visit => visit.customerId === customerId);
  }

  async getShowroomVisit(id: number): Promise<ShowroomVisit | undefined> {
    return this.showroomVisits.get(id);
  }

  async createShowroomVisit(visit: any): Promise<ShowroomVisit> {
    const newVisit: ShowroomVisit = {
      id: this.currentShowroomVisitId++,
      customerId: visit.customerId,
      visitDate: visit.visitDate || new Date().toISOString(),
      status: "scheduled",
      assignedSalesperson: visit.assignedSalesperson || null,
      scheduledTime: visit.scheduledTime || null,
      arrivedTime: null,
      meetingStartTime: null,
      testDriveStartTime: null,
      leftTime: null,
      soldTime: null,
      vehicleOfInterest: visit.vehicleOfInterest || null,
      comments: visit.comments || null,
      statusHistory: [],
      followUpRequired: visit.followUpRequired || false,
      followUpDate: visit.followUpDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.showroomVisits.set(newVisit.id, newVisit);
    return newVisit;
  }

  async updateShowroomVisit(id: number, visit: any): Promise<ShowroomVisit | undefined> {
    const existing = this.showroomVisits.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...visit, updatedAt: new Date().toISOString() };
    this.showroomVisits.set(id, updated);
    return updated;
  }

  async deleteShowroomVisit(id: number): Promise<void> {
    this.showroomVisits.delete(id);
  }

  // Salesperson Note operations
  async getSalespersonNotes(customerId: number): Promise<SalespersonNote[]> {
    return Array.from(this.salespersonNotes.values()).filter(note => note.customerId === customerId);
  }

  async getSalespersonNote(id: number): Promise<SalespersonNote | undefined> {
    return this.salespersonNotes.get(id);
  }

  async createSalespersonNote(note: any): Promise<SalespersonNote> {
    const newNote: SalespersonNote = {
      id: this.currentSalespersonNoteId++,
      customerId: note.customerId,
      salespersonId: note.salespersonId,
      note: note.note,
      flaggedForManager: note.flaggedForManager || false,
      flaggedAt: note.flaggedForManager ? new Date().toISOString() : null,
      reviewedAt: null,
      reviewedBy: null,
      isPrivate: note.isPrivate || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.salespersonNotes.set(newNote.id, newNote);
    return newNote;
  }

  async updateSalespersonNote(id: number, note: any): Promise<SalespersonNote | undefined> {
    const existing = this.salespersonNotes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...note, updatedAt: new Date().toISOString() };
    this.salespersonNotes.set(id, updated);
    return updated;
  }

  async deleteSalespersonNote(id: number): Promise<void> {
    this.salespersonNotes.delete(id);
  }

  // Showroom session operations
  async getShowroomSessions(date?: string): Promise<ShowroomSession[]> {
    const sessions = Array.from(this.showroomSessions.values());
    if (date) {
      return sessions.filter(session => session.sessionDate === date);
    }
    return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getShowroomSession(id: number): Promise<ShowroomSession | undefined> {
    return this.showroomSessions.get(id);
  }

  async createShowroomSession(session: any): Promise<ShowroomSession> {
    const newSession: ShowroomSession = {
      id: this.currentShowroomSessionId++,
      customerId: session.customerId,
      vehicleId: session.vehicleId || null,
      stockNumber: session.stockNumber || null,
      salespersonId: session.salespersonId || null,
      leadSource: session.leadSource || null,
      eventStatus: session.eventStatus || "pending",
      dealStage: session.dealStage || "vehicle_selection",
      notes: session.notes || null,
      timeEntered: new Date().toISOString(),
      timeExited: null,
      sessionDate: session.sessionDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.showroomSessions.set(newSession.id, newSession);
    return newSession;
  }

  async updateShowroomSession(id: number, session: any): Promise<ShowroomSession | undefined> {
    const existing = this.showroomSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...session, updatedAt: new Date().toISOString() };
    this.showroomSessions.set(id, updated);
    return updated;
  }

  async deleteShowroomSession(id: number): Promise<void> {
    this.showroomSessions.delete(id);
  }

  async endShowroomSession(id: number): Promise<ShowroomSession | undefined> {
    const existing = this.showroomSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, timeExited: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.showroomSessions.set(id, updated);
    return updated;
  }

  // Deal Management Implementation
  private deals: Map<string, any> = new Map();
  private dealProducts: Map<string, any[]> = new Map();
  private dealGross: Map<string, any> = new Map();
  private accountingEntries: Map<string, any[]> = new Map();

  async getAllDeals(): Promise<any[]> {
    return Array.from(this.deals.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDeal(id: string): Promise<any> {
    return this.deals.get(id);
  }

  async createDeal(dealData: any): Promise<any> {
    const deal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      dealNumber: this.generateDealNumber(),
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...dealData,
    };
    this.deals.set(deal.id, deal);
    
    // Initialize related data
    this.dealProducts.set(deal.id, []);
    this.accountingEntries.set(deal.id, []);
    
    return deal;
  }

  async updateDeal(id: string, updates: any): Promise<any> {
    const existing = this.deals.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.deals.set(id, updated);
    
    // Recalculate gross if financial data changed
    await this.calculateDealGross(id);
    
    return updated;
  }

  async updateDealStatus(id: string, status: string): Promise<any> {
    const deal = await this.updateDeal(id, { 
      status,
      ...(status === 'finalized' ? { finalizedAt: new Date().toISOString() } : {})
    });
    
    // Generate accounting entries when deal is finalized
    if (status === 'finalized' && deal) {
      await this.generateAccountingEntries(deal);
    }
    
    return deal;
  }

  async getDealProducts(dealId: string): Promise<any[]> {
    return this.dealProducts.get(dealId) || [];
  }

  async addDealProduct(dealId: string, productData: any): Promise<any> {
    const product = {
      id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      dealId,
      createdAt: new Date().toISOString(),
      ...productData,
    };
    
    const products = this.dealProducts.get(dealId) || [];
    products.push(product);
    this.dealProducts.set(dealId, products);
    
    // Recalculate deal gross
    await this.calculateDealGross(dealId);
    
    return product;
  }

  async getDealGross(dealId: string): Promise<any> {
    return this.dealGross.get(dealId);
  }

  async getDealAccountingEntries(dealId: string): Promise<any[]> {
    return this.accountingEntries.get(dealId) || [];
  }

  async finalizeDeal(dealId: string): Promise<any> {
    return await this.updateDealStatus(dealId, 'finalized');
  }

  private generateDealNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `${year}${month}${day}-${random}`;
  }

  private async calculateDealGross(dealId: string): Promise<void> {
    const deal = this.deals.get(dealId);
    const products = this.dealProducts.get(dealId) || [];
    
    if (!deal) return;

    // Front-end gross calculation
    const vehicleCost = 25000; // Would typically come from inventory
    const tradeAdjustment = (deal.tradeAllowance || 0) - (deal.tradePayoff || 0);
    const frontEndGross = (deal.salePrice || 0) - vehicleCost - Math.max(0, tradeAdjustment);

    // Finance reserve (2 points over buy rate)
    const financeAmount = deal.financeBalance || 0;
    const financeReserve = financeAmount * 0.02 * ((deal.term || 60) / 12);

    // Product gross
    const productGross = products.reduce((total, product) => {
      return total + (product.retailPrice - product.cost);
    }, 0);

    // Pack cost
    const packCost = 300; // Standard used vehicle pack

    // Net gross
    const netGross = frontEndGross + financeReserve + productGross - packCost;

    const grossRecord = {
      id: `gross_${dealId}`,
      dealId,
      frontEndGross,
      financeReserve,
      productGross,
      packCost,
      netGross,
      calculatedAt: new Date().toISOString(),
    };

    this.dealGross.set(dealId, grossRecord);
  }

  private async generateAccountingEntries(deal: any): Promise<void> {
    const entries: any[] = [];

    // Vehicle sale revenue
    if (deal.salePrice) {
      entries.push({
        id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        dealId: deal.id,
        accountCode: '4010',
        accountName: 'Vehicle Sales Revenue',
        debit: 0,
        credit: deal.salePrice,
        memo: `Sale of VIN ${deal.vin} to ${deal.buyerName}`,
        entryDate: new Date().toISOString(),
      });

      entries.push({
        id: `entry_${Date.now() + 1}_${Math.random().toString(36).substring(2, 8)}`,
        dealId: deal.id,
        accountCode: '1210',
        accountName: 'Accounts Receivable',
        debit: deal.salePrice,
        credit: 0,
        memo: `Receivable for deal #${deal.dealNumber}`,
        entryDate: new Date().toISOString(),
      });
    }

    // Additional entries for taxes, fees, etc.
    if (deal.salesTax) {
      entries.push({
        id: `entry_${Date.now() + 2}_${Math.random().toString(36).substring(2, 8)}`,
        dealId: deal.id,
        accountCode: '2210',
        accountName: 'Sales Tax Payable',
        debit: 0,
        credit: deal.salesTax,
        memo: `Sales tax for deal #${deal.dealNumber}`,
        entryDate: new Date().toISOString(),
      });
    }

    // Store all entries
    this.accountingEntries.set(deal.id, entries);
  }

  // Customer lifecycle methods implementation
  async getCustomerPageViews(customerId: number): Promise<PageView[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer) return [];
    
    return Array.from(this.pageViews.values())
      .filter(pageView => pageView.userId === customerId.toString())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getCustomerInteractionsByCustomerId(customerId: number): Promise<CustomerInteraction[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer) return [];
    
    return Array.from(this.customerInteractions.values())
      .filter(interaction => interaction.customerId === customerId.toString())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getCustomerSessions(customerId: number): Promise<VisitorSession[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer) return [];
    
    return Array.from(this.visitorSessions.values())
      .filter(session => session.userId === customerId.toString())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getDealsByCustomer(customerId: number): Promise<Deal[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer) return [];
    
    return Array.from(this.deals.values())
      .filter(deal => deal.customerId === customerId);
  }

  async getSalesByCustomer(customerId: number): Promise<Sale[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer) return [];
    
    return Array.from(this.sales.values())
      .filter(sale => sale.customerId === customerId);
  }

  // Enterprise Features Methods
  async getCustomerTimeline(customerId: number) {
    // Mock timeline data for demonstration
    return [
      {
        id: 1,
        customerId,
        eventType: 'contact',
        eventData: { method: 'phone', subject: 'Initial inquiry' },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'System'
      },
      {
        id: 2,
        customerId,
        eventType: 'visit',
        eventData: { location: 'showroom', vehicles: ['Vehicle 1', 'Vehicle 2'] },
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        createdBy: 'Sales Rep'
      }
    ];
  }

  async createCustomerTimelineEvent(eventData: any) {
    return {
      id: Date.now(),
      ...eventData,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }

  // ============================================
  // F&I (Finance & Insurance) Implementations
  // ============================================
  
  async getCreditPulls(): Promise<CreditPull[]> {
    return Array.from(this.creditPulls.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getCreditPull(id: number): Promise<CreditPull | undefined> {
    return this.creditPulls.get(id);
  }
  
  async createCreditPull(insertCreditPull: InsertCreditPull): Promise<CreditPull> {
    const id = this.currentCreditPullId++;
    const creditPull: CreditPull = {
      ...insertCreditPull,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.creditPulls.set(id, creditPull);
    
    // Log audit entry
    await this.createFiAuditLog({
      userId: insertCreditPull.pulledBy,
      action: "credit_pull",
      entityType: "customer",
      entityId: insertCreditPull.customerId,
      details: { bureau: insertCreditPull.bureau, provider: insertCreditPull.provider },
      ipAddress: null,
      userAgent: null
    });
    
    return creditPull;
  }
  
  async updateCreditPull(id: number, updateCreditPull: Partial<InsertCreditPull>): Promise<CreditPull | undefined> {
    const creditPull = this.creditPulls.get(id);
    if (!creditPull) return undefined;
    
    const updatedCreditPull = { ...creditPull, ...updateCreditPull, updatedAt: new Date() };
    this.creditPulls.set(id, updatedCreditPull);
    return updatedCreditPull;
  }
  
  async getLenderApplications(): Promise<LenderApplication[]> {
    return Array.from(this.lenderApplications.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getLenderApplication(id: number): Promise<LenderApplication | undefined> {
    return this.lenderApplications.get(id);
  }
  
  async createLenderApplication(insertApplication: InsertLenderApplication): Promise<LenderApplication> {
    const id = this.currentLenderApplicationId++;
    const application: LenderApplication = {
      ...insertApplication,
      id,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.lenderApplications.set(id, application);
    
    // Log audit entry
    await this.createFiAuditLog({
      userId: insertApplication.submittedBy,
      action: "lender_submit",
      entityType: "customer",
      entityId: insertApplication.customerId,
      details: { lenderName: insertApplication.lenderName },
      ipAddress: null,
      userAgent: null
    });
    
    return application;
  }
  
  async updateLenderApplication(id: number, updateApplication: Partial<InsertLenderApplication>): Promise<LenderApplication | undefined> {
    const application = this.lenderApplications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updateApplication, updatedAt: new Date() };
    this.lenderApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async getFiProducts(): Promise<FiProduct[]> {
    return Array.from(this.fiProducts.values()).filter(product => product.isActive);
  }
  
  async getFiProduct(id: number): Promise<FiProduct | undefined> {
    return this.fiProducts.get(id);
  }
  
  async createFiProduct(insertProduct: InsertFiProduct): Promise<FiProduct> {
    const id = this.currentFiProductId++;
    const product: FiProduct = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.fiProducts.set(id, product);
    return product;
  }
  
  async updateFiProduct(id: number, updateProduct: Partial<InsertFiProduct>): Promise<FiProduct | undefined> {
    const product = this.fiProducts.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updateProduct, updatedAt: new Date() };
    this.fiProducts.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async getFinanceMenus(): Promise<FinanceMenu[]> {
    return Array.from(this.financeMenus.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getFinanceMenu(id: number): Promise<FinanceMenu | undefined> {
    return this.financeMenus.get(id);
  }
  
  async createFinanceMenu(insertMenu: InsertFinanceMenu): Promise<FinanceMenu> {
    const id = this.currentFinanceMenuId++;
    const menu: FinanceMenu = {
      ...insertMenu,
      id,
      presentedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.financeMenus.set(id, menu);
    
    // Log audit entry
    await this.createFiAuditLog({
      userId: insertMenu.presentedBy,
      action: "menu_present",
      entityType: "customer",
      entityId: insertMenu.customerId,
      details: { basePayment: insertMenu.basePayment, totalProductCost: insertMenu.totalProductCost },
      ipAddress: null,
      userAgent: null
    });
    
    return menu;
  }
  
  async updateFinanceMenu(id: number, updateMenu: Partial<InsertFinanceMenu>): Promise<FinanceMenu | undefined> {
    const menu = this.financeMenus.get(id);
    if (!menu) return undefined;
    
    const updatedMenu = { ...menu, ...updateMenu, updatedAt: new Date() };
    this.financeMenus.set(id, updatedMenu);
    return updatedMenu;
  }
  
  async createFiAuditLog(insertLog: InsertFiAuditLog): Promise<FiAuditLog> {
    const id = this.currentFiAuditLogId++;
    const log: FiAuditLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.fiAuditLogs.set(id, log);
    return log;
  }
  
  async getFiAuditLogs(entityType?: string, entityId?: number): Promise<FiAuditLog[]> {
    const logs = Array.from(this.fiAuditLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (entityType && entityId) {
      return logs.filter(log => log.entityType === entityType && log.entityId === entityId);
    }
    
    return logs;
  }

  async getAiInsights(entityType?: string, entityId?: number) {
    // Mock AI insights data
    return [
      {
        id: 1,
        entityType: entityType || 'customer',
        entityId: entityId || 1,
        insightType: 'risk_assessment',
        title: 'High Purchase Likelihood',
        description: 'Customer shows 85% likelihood to purchase within 30 days',
        confidence: 0.85,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        entityType: entityType || 'deal',
        entityId: entityId || 1,
        insightType: 'compliance_check',
        title: 'Financing Documentation Complete',
        description: 'All required documents verified and compliant',
        confidence: 0.95,
        status: 'approved',
        createdAt: new Date().toISOString()
      }
    ];
  }

  async createAiInsight(insightData: any) {
    return {
      id: Date.now(),
      ...insightData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  async updateAiInsightStatus(insightId: number, status: string, reviewedBy?: string) {
    return {
      id: insightId,
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    };
  }

  async getCollaborationThreads(entityType?: string, entityId?: number) {
    // Mock collaboration threads
    return [
      {
        id: 1,
        entityType: entityType || 'customer',
        entityId: entityId || 1,
        title: 'Customer financing discussion',
        status: 'active',
        priority: 'high',
        createdBy: 'Sales Manager',
        assignedTo: 'Finance Specialist',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 2,
        entityType: entityType || 'deal',
        entityId: entityId || 1,
        title: 'Trade-in valuation review',
        status: 'active',
        priority: 'normal',
        createdBy: 'Sales Rep',
        assignedTo: 'Appraiser',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  async createCollaborationThread(threadData: any) {
    return {
      id: Date.now(),
      ...threadData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getCollaborationMessages(threadId: number) {
    // Mock collaboration messages
    return [
      {
        id: 1,
        threadId,
        userId: '1',
        message: 'I reviewed the customer\'s credit application. Looks good for approval.',
        messageType: 'comment',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        attachments: []
      },
      {
        id: 2,
        threadId,
        userId: '2', 
        message: 'Great! I\'ll proceed with the financing paperwork.',
        messageType: 'comment',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        attachments: []
      }
    ];
  }

  async createCollaborationMessage(messageData: any) {
    return {
      id: Date.now(),
      ...messageData,
      timestamp: new Date().toISOString()
    };
  }

  async getKpiMetrics(metricType?: string, period?: string) {
    // Mock KPI metrics data
    return [
      {
        id: 1,
        metricName: 'Monthly Sales',
        metricType: metricType || 'sales',
        value: 1250000,
        period: period || 'monthly',
        target: 1200000,
        variance: 4.17,
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        metricName: 'Customer Satisfaction',
        metricType: metricType || 'operations',
        value: 4.6,
        period: period || 'monthly',
        target: 4.5,
        variance: 2.22,
        timestamp: new Date().toISOString()
      }
    ];
  }

  async createKpiMetric(metricData: any) {
    return {
      id: Date.now(),
      ...metricData,
      timestamp: new Date().toISOString()
    };
  }

  async getDuplicateCustomers(status?: string) {
    // Mock duplicate customer detection data
    return [
      {
        id: 1,
        primaryCustomerId: 1,
        duplicateCustomerId: 5,
        confidenceScore: 0.92,
        matchingFields: ['email', 'phone', 'lastName'],
        status: status || 'pending',
        createdAt: new Date().toISOString()
      }
    ];
  }

  async createDuplicateCustomerDetection(duplicateData: any) {
    return {
      id: Date.now(),
      ...duplicateData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  async getWorkflowTemplates() {
    // Mock workflow templates
    return [
      {
        id: 1,
        name: 'Customer Onboarding',
        description: 'Standard process for new customer setup',
        steps: [
          'Collect customer information',
          'Credit check',
          'Documentation review',
          'Account setup'
        ],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  async createWorkflowTemplate(templateData: any) {
    return {
      id: Date.now(),
      ...templateData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  async getWorkflowExecutions(templateId?: number) {
    // Mock workflow executions
    return [
      {
        id: 1,
        templateId: templateId || 1,
        entityId: 1,
        entityType: 'customer',
        status: 'in_progress',
        currentStep: 2,
        totalSteps: 4,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  }

  async createWorkflowExecution(executionData: any) {
    return {
      id: Date.now(),
      ...executionData,
      status: 'started',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getPredictiveScores(entityType?: string, entityId?: number, scoreType?: string) {
    // Mock predictive scores
    return [
      {
        id: 1,
        entityType: entityType || 'customer',
        entityId: entityId || 1,
        scoreType: scoreType || 'purchase_likelihood',
        score: 0.85,
        confidence: 0.92,
        factors: ['credit_score', 'previous_purchases', 'engagement_level'],
        calculatedAt: new Date().toISOString()
      },
      {
        id: 2,
        entityType: entityType || 'deal',
        entityId: entityId || 1,
        scoreType: scoreType || 'close_probability',
        score: 0.78,
        confidence: 0.88,
        factors: ['customer_interest', 'financing_approved', 'trade_value'],
        calculatedAt: new Date().toISOString()
      }
    ];
  }

  async createPredictiveScore(scoreData: any) {
    return {
      id: Date.now(),
      ...scoreData,
      calculatedAt: new Date().toISOString()
    };
  }

  async getMarketBenchmarks(metricName?: string, timeframe?: string) {
    // Mock market benchmark data
    return [
      {
        id: 1,
        metricName: metricName || 'average_sale_time',
        ourValue: 32,
        industryAverage: 38,
        percentile: 72,
        timeframe: timeframe || 'monthly',
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        metricName: metricName || 'customer_satisfaction',
        ourValue: 4.6,
        industryAverage: 4.2,
        percentile: 85,
        timeframe: timeframe || 'monthly',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createMarketBenchmark(benchmarkData: any) {
    return {
      id: Date.now(),
      ...benchmarkData,
      updatedAt: new Date().toISOString()
    };
  }

  async getAllDeals() {
    // Return mock deals data for active deals endpoint
    return [
      {
        id: 'D-2025-001',
        customerId: 1,
        customerName: 'John Smith',
        vehicleDescription: '2024 Honda Accord LX',
        totalAmount: 28500,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'D-2025-002',
        customerId: 2,
        customerName: 'Sarah Johnson', 
        vehicleDescription: '2024 Toyota Camry SE',
        totalAmount: 31200,
        status: 'in_progress',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'D-2025-003',
        customerId: 3,
        customerName: 'Mike Davis',
        vehicleDescription: '2023 Ford F-150 XLT',
        totalAmount: 42800,
        status: 'completed',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 14400000).toISOString()
      }
    ];
  }

  // System User Management Methods
  private initializeSystemUserData() {
    // Create default system users with password authentication
    const defaultUsers: SystemUser[] = [
      {
        id: 'admin_001',
        email: 'admin@autolytiq.com',
        firstName: 'System',
        lastName: 'Administrator',
        username: 'admin',
        passwordHash: '$2b$10$rJ6O7x5h8xP0d2V9L1uKHOt3gMvW8.N5cX4kL6hS9rE2wQ4mT6uYi', // "admin123"
        role: 'Administrator',
        department: 'IT',
        phone: '(555) 123-0001',
        address: null,
        bio: 'System administrator with full access',
        profileImage: null,
        isActive: true,
        permissions: ['*'], // Full permissions
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true,
          timezone: 'America/New_York'
        },
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sales_001',
        email: 'sarah@autolytiq.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: 'sarah.johnson',
        passwordHash: '$2b$10$rJ6O7x5h8xP0d2V9L1uKHOt3gMvW8.N5cX4kL6hS9rE2wQ4mT6uYi', // "password123"
        role: 'Sales Manager',
        department: 'Sales',
        phone: '(555) 123-0002',
        address: null,
        bio: 'Senior sales manager with 8 years of experience',
        profileImage: null,
        isActive: true,
        permissions: ['sales.*', 'customers.*', 'leads.*'],
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: false,
          timezone: 'America/New_York'
        },
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const defaultRoles: SystemRole[] = [
      {
        id: 'role_admin',
        name: 'Administrator',
        description: 'Full system access and management capabilities',
        permissions: ['*'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'role_sales',
        name: 'Sales Manager',
        description: 'Sales operations and customer management',
        permissions: ['sales.*', 'customers.*', 'leads.*', 'inventory.read'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultUsers.forEach(user => this.systemUsers.set(user.id, user));
    defaultRoles.forEach(role => this.systemRoles.set(role.id, role));
  }

  async getAllSystemUsers(): Promise<SystemUser[]> {
    return Array.from(this.systemUsers.values()).map(user => ({
      ...user,
      passwordHash: undefined // Don't return password hash
    })) as SystemUser[];
  }

  async getSystemUserById(id: string): Promise<SystemUser | undefined> {
    const user = this.systemUsers.get(id);
    if (user) {
      return { ...user, passwordHash: undefined } as SystemUser;
    }
    return undefined;
  }

  async getSystemUserByEmail(email: string): Promise<SystemUser | undefined> {
    return Array.from(this.systemUsers.values()).find(user => user.email === email);
  }

  async createSystemUser(userData: InsertSystemUser & { passwordHash: string }): Promise<SystemUser> {
    const user: SystemUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.systemUsers.set(user.id, user);
    return { ...user, passwordHash: undefined } as SystemUser;
  }

  async updateSystemUser(id: string, updates: Partial<SystemUser>): Promise<SystemUser | undefined> {
    const user = this.systemUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.systemUsers.set(id, updatedUser);
    return { ...updatedUser, passwordHash: undefined } as SystemUser;
  }

  async deleteSystemUser(id: string): Promise<void> {
    this.systemUsers.delete(id);
  }

  async updateSystemUserLastLogin(id: string): Promise<void> {
    const user = this.systemUsers.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.systemUsers.set(id, user);
    }
  }

  async createUserSession(userId: string, token: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const session: UserSession = {
      id: sessionId,
      userId,
      sessionToken: token,
      expiresAt,
      createdAt: new Date()
    };
    
    this.userSessions.set(token, session);
    return sessionId;
  }

  async getUserSession(token: string): Promise<UserSession | undefined> {
    return this.userSessions.get(token);
  }

  async invalidateUserSession(token: string): Promise<void> {
    this.userSessions.delete(token);
  }

  async getAllRoles(): Promise<SystemRole[]> {
    return Array.from(this.systemRoles.values());
  }

  async getRoleById(id: string): Promise<SystemRole | undefined> {
    return this.systemRoles.get(id);
  }

  async createRole(roleData: InsertSystemRole): Promise<SystemRole> {
    const role: SystemRole = {
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.systemRoles.set(role.id, role);
    return role;
  }

  async updateRole(id: string, updates: Partial<SystemRole>): Promise<SystemRole | undefined> {
    const role = this.systemRoles.get(id);
    if (!role) return undefined;
    
    const updatedRole = { ...role, ...updates, updatedAt: new Date() };
    this.systemRoles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: string): Promise<void> {
    this.systemRoles.delete(id);
  }

  async logActivity(activityData: InsertActivityLogEntry): Promise<ActivityLogEntry> {
    const activity: ActivityLogEntry = {
      ...activityData,
      timestamp: new Date()
    };
    this.activityLogs.set(activity.id, activity);
    return activity;
  }

  async getActivityLog(filters: { userId?: string; limit?: number; offset?: number }): Promise<ActivityLogEntry[]> {
    let activities = Array.from(this.activityLogs.values());
    
    if (filters.userId) {
      activities = activities.filter(activity => activity.userId === filters.userId);
    }
    
    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    return activities.slice(offset, offset + limit);
  }
}

export const storage = new MemStorage();
