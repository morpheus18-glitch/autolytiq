import { 
  users, vehicles, customers, leads, sales, activities, visitorSessions, pageViews, customerInteractions, competitorAnalytics, competitivePricing, pricingInsights, merchandisingStrategies, marketTrends, deals, dealDocuments, dealApprovals,
  type User, type Vehicle, type Customer, type Lead, type Sale, type Activity, type VisitorSession, type PageView, type CustomerInteraction, type CompetitorAnalytics, type CompetitivePricing, type PricingInsights, type MerchandisingStrategies, type MarketTrends, type Deal, type DealDocument, type DealApproval,
  type InsertUser, type InsertVehicle, type InsertCustomer, type InsertLead, type InsertSale, type InsertActivity, type InsertVisitorSession, type InsertPageView, type InsertCustomerInteraction, type InsertCompetitorAnalytics, type InsertCompetitivePricing, type InsertPricingInsights, type InsertMerchandisingStrategies, type InsertMarketTrends, type InsertDeal, type InsertDealDocument, type InsertDealApproval
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
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
    
    this.initializeDefaultData();
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
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
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
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
