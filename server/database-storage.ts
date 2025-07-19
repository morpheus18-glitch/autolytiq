import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { 
  departments, roles, permissions, rolePermissions,
  users, employees, serviceParts, serviceOrders, 
  payroll, financialTransactions, vehicles, customers,
  leads, sales, activities, visitorSessions, pageViews,
  customerInteractions, competitorAnalytics,
  competitivePricing, pricingInsights, merchandisingStrategies,
  marketTrends, showroomSessions
} from "@shared/schema";
import type { 
  User, InsertUser, 
  Vehicle, InsertVehicle, 
  Customer, InsertCustomer, 
  Lead, InsertLead, 
  Sale, InsertSale, 
  Activity, InsertActivity,
  VisitorSession, InsertVisitorSession,
  PageView, InsertPageView,
  CustomerInteraction, InsertCustomerInteraction,
  CompetitorAnalytics, InsertCompetitorAnalytics,
  CompetitivePricing, InsertCompetitivePricing,
  PricingInsights, InsertPricingInsights,
  MerchandisingStrategies, InsertMerchandisingStrategies,
  MarketTrends, InsertMarketTrends,
  ShowroomSession, InsertShowroomSession,
  Department, InsertDepartment,
  Role, InsertRole,
  Permission, InsertPermission,
  Employee, InsertEmployee,
  ServicePart, InsertServicePart,
  ServiceOrder, InsertServiceOrder,
  Payroll, InsertPayroll,
  FinancialTransaction, InsertFinancialTransaction
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  async updateDepartment(id: number, updates: Partial<Department>): Promise<Department> {
    const [department] = await db.update(departments).set(updates).where(eq(departments.id, id)).returning();
    return department;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRolesByDepartment(departmentId: number): Promise<Role[]> {
    return await db.select().from(roles).where(eq(roles.departmentId, departmentId));
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    return role;
  }

  async updateRole(id: number, updates: Partial<Role>): Promise<Role> {
    const [role] = await db.update(roles).set(updates).where(eq(roles.id, id)).returning();
    return role;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Permission operations
  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async createPermission(insertPermission: InsertPermission): Promise<Permission> {
    const [permission] = await db.insert(permissions).values(insertPermission).returning();
    return permission;
  }

  async updatePermission(id: number, updates: Partial<Permission>): Promise<Permission> {
    const [permission] = await db.update(permissions).set(updates).where(eq(permissions.id, id)).returning();
    return permission;
  }

  async deletePermission(id: number): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }

  // Role permission operations
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return await db.select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      resource: permissions.resource,
      action: permissions.action,
      createdAt: permissions.createdAt,
      updatedAt: permissions.updatedAt
    }).from(permissions)
      .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
  }

  async addRolePermission(roleId: number, permissionId: number): Promise<void> {
    await db.insert(rolePermissions).values({ roleId, permissionId });
  }

  async removeRolePermission(roleId: number, permissionId: number): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async upsertUser(userData: any): Promise<User> {
    try {
      console.log('DatabaseStorage: Upserting user with data:', userData);
      
      const [user] = await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          provider: userData.provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            provider: userData.provider,
            updatedAt: new Date(),
            lastLogin: new Date(),
          },
        })
        .returning();
        
      console.log('DatabaseStorage: User upserted successfully:', user);
      return user;
    } catch (error) {
      console.error('DatabaseStorage: Error upserting user:', error);
      throw error;
    }
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeesByDepartment(departmentId: number): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.departmentId, departmentId));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee> {
    const [employee] = await db.update(employees).set(updates).where(eq(employees.id, id)).returning();
    return employee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Service parts operations
  async getServiceParts(): Promise<ServicePart[]> {
    return await db.select().from(serviceParts);
  }

  async getServicePart(id: number): Promise<ServicePart | undefined> {
    const [part] = await db.select().from(serviceParts).where(eq(serviceParts.id, id));
    return part;
  }

  async createServicePart(insertPart: InsertServicePart): Promise<ServicePart> {
    const [part] = await db.insert(serviceParts).values(insertPart).returning();
    return part;
  }

  async updateServicePart(id: number, updates: Partial<ServicePart>): Promise<ServicePart> {
    const [part] = await db.update(serviceParts).set(updates).where(eq(serviceParts.id, id)).returning();
    return part;
  }

  async deleteServicePart(id: number): Promise<void> {
    await db.delete(serviceParts).where(eq(serviceParts.id, id));
  }

  // Service order operations
  async getServiceOrders(): Promise<ServiceOrder[]> {
    return await db.select().from(serviceOrders);
  }

  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return order;
  }

  async createServiceOrder(insertOrder: InsertServiceOrder): Promise<ServiceOrder> {
    const [order] = await db.insert(serviceOrders).values(insertOrder).returning();
    return order;
  }

  async updateServiceOrder(id: number, updates: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const [order] = await db.update(serviceOrders).set(updates).where(eq(serviceOrders.id, id)).returning();
    return order;
  }

  async deleteServiceOrder(id: number): Promise<void> {
    await db.delete(serviceOrders).where(eq(serviceOrders.id, id));
  }

  // Payroll operations
  async getPayroll(): Promise<Payroll[]> {
    return await db.select().from(payroll);
  }

  async getPayrollByEmployee(employeeId: number): Promise<Payroll[]> {
    return await db.select().from(payroll).where(eq(payroll.employeeId, employeeId));
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const [payrollRecord] = await db.insert(payroll).values(insertPayroll).returning();
    return payrollRecord;
  }

  async updatePayroll(id: number, updates: Partial<Payroll>): Promise<Payroll> {
    const [payrollRecord] = await db.update(payroll).set(updates).where(eq(payroll.id, id)).returning();
    return payrollRecord;
  }

  async deletePayroll(id: number): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }

  // Financial transaction operations
  async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    return await db.select().from(financialTransactions);
  }

  async createFinancialTransaction(insertTransaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const [transaction] = await db.insert(financialTransactions).values(insertTransaction).returning();
    return transaction;
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle> {
    const [vehicle] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer> {
    const [customer] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return customer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Lead operations
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    const [lead] = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
    return lead;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // Sales operations
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db.insert(sales).values(insertSale).returning();
    return sale;
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Pixel tracking operations
  async createVisitorSession(insertSession: InsertVisitorSession): Promise<VisitorSession> {
    const [session] = await db.insert(visitorSessions).values(insertSession).returning();
    return session;
  }

  async updateVisitorSession(sessionId: string, updates: Partial<VisitorSession>): Promise<VisitorSession> {
    const [session] = await db.update(visitorSessions).set(updates).where(eq(visitorSessions.sessionId, sessionId)).returning();
    return session;
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const [pageView] = await db.insert(pageViews).values(insertPageView).returning();
    return pageView;
  }

  async createCustomerInteraction(insertInteraction: InsertCustomerInteraction): Promise<CustomerInteraction> {
    const [interaction] = await db.insert(customerInteractions).values(insertInteraction).returning();
    return interaction;
  }

  async createCompetitorAnalytics(insertAnalytics: InsertCompetitorAnalytics): Promise<CompetitorAnalytics> {
    const [analytics] = await db.insert(competitorAnalytics).values(insertAnalytics).returning();
    return analytics;
  }

  // Competitive pricing operations
  async getCompetitivePricing(): Promise<CompetitivePricing[]> {
    return await db.select().from(competitivePricing);
  }

  async createCompetitivePricing(insertPricing: InsertCompetitivePricing): Promise<CompetitivePricing> {
    const [pricing] = await db.insert(competitivePricing).values(insertPricing).returning();
    return pricing;
  }

  async updateCompetitivePricing(id: number, updates: Partial<CompetitivePricing>): Promise<CompetitivePricing> {
    const [pricing] = await db.update(competitivePricing).set(updates).where(eq(competitivePricing.id, id)).returning();
    return pricing;
  }

  // Pricing insights operations
  async getPricingInsights(): Promise<PricingInsights[]> {
    return await db.select().from(pricingInsights);
  }

  async createPricingInsights(insertInsights: InsertPricingInsights): Promise<PricingInsights> {
    const [insights] = await db.insert(pricingInsights).values(insertInsights).returning();
    return insights;
  }

  async updatePricingInsights(id: number, updates: Partial<PricingInsights>): Promise<PricingInsights> {
    const [insights] = await db.update(pricingInsights).set(updates).where(eq(pricingInsights.id, id)).returning();
    return insights;
  }

  // Merchandising strategies operations
  async getMerchandisingStrategies(): Promise<MerchandisingStrategies[]> {
    return await db.select().from(merchandisingStrategies);
  }

  async createMerchandisingStrategy(insertStrategy: InsertMerchandisingStrategies): Promise<MerchandisingStrategies> {
    const [strategy] = await db.insert(merchandisingStrategies).values(insertStrategy).returning();
    return strategy;
  }

  async updateMerchandisingStrategy(id: number, updates: Partial<MerchandisingStrategies>): Promise<MerchandisingStrategies> {
    const [strategy] = await db.update(merchandisingStrategies).set(updates).where(eq(merchandisingStrategies.id, id)).returning();
    return strategy;
  }

  // Market trends operations
  async getMarketTrends(): Promise<MarketTrends[]> {
    return await db.select().from(marketTrends);
  }

  async createMarketTrend(insertTrend: InsertMarketTrends): Promise<MarketTrends> {
    const [trend] = await db.insert(marketTrends).values(insertTrend).returning();
    return trend;
  }

  async updateMarketTrend(id: number, updates: Partial<MarketTrends>): Promise<MarketTrends> {
    const [trend] = await db.update(marketTrends).set(updates).where(eq(marketTrends.id, id)).returning();
    return trend;
  }

  async deleteMarketTrend(id: number): Promise<boolean> {
    await db.delete(marketTrends).where(eq(marketTrends.id, id));
    return true;
  }

  async deleteMerchandisingStrategy(id: number): Promise<boolean> {
    await db.delete(merchandisingStrategies).where(eq(merchandisingStrategies.id, id));
    return true;
  }

  async deletePricingInsights(id: number): Promise<boolean> {
    await db.delete(pricingInsights).where(eq(pricingInsights.id, id));
    return true;
  }

  async deleteCompetitivePricing(id: number): Promise<boolean> {
    await db.delete(competitivePricing).where(eq(competitivePricing.id, id));
    return true;
  }

  // Additional methods for dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalInventory: number;
    monthlySales: number;
    activeLeads: number;
    avgDaysToSale: number;
    recentActivity: any[];
  }> {
    const vehicleCount = await db.select().from(vehicles);
    const salesCount = await db.select().from(sales);
    const leadsCount = await db.select().from(leads);
    const recentActivities = await db.select().from(activities).limit(10);

    return {
      totalInventory: vehicleCount.length,
      monthlySales: salesCount.length,
      activeLeads: leadsCount.length,
      avgDaysToSale: 14, // Default value for now
      recentActivity: recentActivities,
    };
  }

  // Additional methods for visitor analytics
  async getVisitorSession(sessionId: string): Promise<VisitorSession | undefined> {
    const [session] = await db.select().from(visitorSessions).where(eq(visitorSessions.sessionId, sessionId));
    return session;
  }

  async getVisitorSessions(): Promise<VisitorSession[]> {
    return await db.select().from(visitorSessions);
  }

  async getPageViews(): Promise<PageView[]> {
    return await db.select().from(pageViews);
  }

  async getCustomerInteractions(): Promise<CustomerInteraction[]> {
    return await db.select().from(customerInteractions);
  }

  async getCompetitorAnalytics(): Promise<CompetitorAnalytics[]> {
    return await db.select().from(competitorAnalytics);
  }

  async getVisitorAnalytics(): Promise<any> {
    const sessions = await db.select().from(visitorSessions);
    const pageViews = await db.select().from(pageViews);
    const interactions = await db.select().from(customerInteractions);
    
    return {
      totalSessions: sessions.length,
      totalPageViews: pageViews.length,
      totalInteractions: interactions.length,
      sessions,
      pageViews,
      interactions,
    };
  }

  // Showroom session operations
  async getShowroomSessions(date?: string): Promise<ShowroomSession[]> {
    try {
      let query = db.select().from(showroomSessions);
      
      if (date) {
        query = query.where(sql`DATE(${showroomSessions.sessionDate}) = ${date}`);
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching showroom sessions:', error);
      throw error;
    }
  }

  async getShowroomSession(id: number): Promise<ShowroomSession | undefined> {
    try {
      const [session] = await db.select().from(showroomSessions).where(eq(showroomSessions.id, id));
      return session;
    } catch (error) {
      console.error('Error fetching showroom session:', error);
      throw error;
    }
  }

  async createShowroomSession(sessionData: any): Promise<ShowroomSession> {
    try {
      console.log('Creating showroom session with data:', sessionData);
      
      const [session] = await db
        .insert(showroomSessions)
        .values({
          customerId: sessionData.customerId,
          vehicleId: sessionData.vehicleId,
          stockNumber: sessionData.stockNumber,
          salespersonId: sessionData.salespersonId,
          leadSource: sessionData.leadSource,
          eventStatus: sessionData.eventStatus || 'pending',
          dealStage: sessionData.dealStage || 'vehicle_selection',
          notes: sessionData.notes,
          sessionDate: sessionData.sessionDate || new Date(),
          timeEntered: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
        
      console.log('Showroom session created successfully:', session);
      return session;
    } catch (error) {
      console.error('Error creating showroom session:', error);
      throw error;
    }
  }

  async updateShowroomSession(id: number, updates: any): Promise<ShowroomSession | undefined> {
    try {
      console.log('Updating showroom session:', id, updates);
      
      const [session] = await db
        .update(showroomSessions)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(showroomSessions.id, id))
        .returning();
        
      console.log('Showroom session updated successfully:', session);
      return session;
    } catch (error) {
      console.error('Error updating showroom session:', error);
      throw error;
    }
  }

  async deleteShowroomSession(id: number): Promise<void> {
    try {
      await db.delete(showroomSessions).where(eq(showroomSessions.id, id));
      console.log('Showroom session deleted:', id);
    } catch (error) {
      console.error('Error deleting showroom session:', error);
      throw error;
    }
  }

  async endShowroomSession(id: number): Promise<ShowroomSession | undefined> {
    try {
      const [session] = await db
        .update(showroomSessions)
        .set({
          timeExited: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(showroomSessions.id, id))
        .returning();
        
      console.log('Showroom session ended:', session);
      return session;
    } catch (error) {
      console.error('Error ending showroom session:', error);
      throw error;
    }
  }
}