import { 
  users, vehicles, customers, leads, sales, activities,
  type User, type Vehicle, type Customer, type Lead, type Sale, type Activity,
  type InsertUser, type InsertVehicle, type InsertCustomer, type InsertLead, type InsertSale, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Lead operations
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private customers: Map<number, Customer>;
  private leads: Map<number, Lead>;
  private sales: Map<number, Sale>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentVehicleId: number;
  private currentCustomerId: number;
  private currentLeadId: number;
  private currentSaleId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.customers = new Map();
    this.leads = new Map();
    this.sales = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentVehicleId = 1;
    this.currentCustomerId = 1;
    this.currentLeadId = 1;
    this.currentSaleId = 1;
    this.currentActivityId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "admin",
      password: "password",
      name: "John Smith",
      role: "Sales Manager"
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;
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
    const user: User = { ...insertUser, id };
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
      createdAt: new Date() 
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

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date() 
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

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
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
      createdAt: new Date() 
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

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
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
      saleDate: new Date() 
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
      createdAt: new Date() 
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
}

export const storage = new MemStorage();
