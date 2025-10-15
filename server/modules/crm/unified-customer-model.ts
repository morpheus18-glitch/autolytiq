import { eq, desc } from "drizzle-orm";
import {
  customers,
  leads,
  customerNotes,
  customerCalls,
  customerVehiclesOfInterest,
  customerTradeIns,
  customerTimeline,
  deals,
  sales,
  type Customer,
  type Lead,
  type CustomerNote,
  type CustomerCall,
  type CustomerVehicleOfInterest,
  type CustomerTradeIn,
  type CustomerTimeline,
  type Deal,
  type Sale,
} from "@shared/schema";
import { db } from "../../db";

export interface UnifiedCustomerProfile {
  customer: Customer;
  leads: Lead[];
  notes: CustomerNote[];
  calls: CustomerCall[];
  vehiclesOfInterest: CustomerVehicleOfInterest[];
  tradeIns: CustomerTradeIn[];
  deals: Deal[];
  sales: Sale[];
  timeline: CustomerTimeline[];
}

export async function loadUnifiedCustomerProfile(customerId: number): Promise<UnifiedCustomerProfile | undefined> {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) {
    return undefined;
  }

  const [
    customerLeads,
    notes,
    calls,
    vehiclesOfInterest,
    tradeIns,
    customerDeals,
    customerSales,
    timeline,
  ] = await Promise.all([
    db.select().from(leads).where(eq(leads.customerId, customerId)).orderBy(desc(leads.createdAt)),
    db
      .select()
      .from(customerNotes)
      .where(eq(customerNotes.customerId, customerId))
      .orderBy(desc(customerNotes.createdAt)),
    db
      .select()
      .from(customerCalls)
      .where(eq(customerCalls.customerId, customerId))
      .orderBy(desc(customerCalls.createdAt)),
    db
      .select()
      .from(customerVehiclesOfInterest)
      .where(eq(customerVehiclesOfInterest.customerId, customerId))
      .orderBy(desc(customerVehiclesOfInterest.createdAt)),
    db
      .select()
      .from(customerTradeIns)
      .where(eq(customerTradeIns.customerId, customerId))
      .orderBy(desc(customerTradeIns.createdAt)),
    db
      .select()
      .from(deals)
      .where(eq(deals.customerId, customerId.toString()))
      .orderBy(desc(deals.createdAt)),
    db
      .select()
      .from(sales)
      .where(eq(sales.customerId, customerId))
      .orderBy(desc(sales.saleDate)),
    db
      .select()
      .from(customerTimeline)
      .where(eq(customerTimeline.customerId, customerId))
      .orderBy(desc(customerTimeline.timestamp)),
  ]);

  return {
    customer,
    leads: customerLeads,
    notes,
    calls,
    vehiclesOfInterest,
    tradeIns,
    deals: customerDeals,
    sales: customerSales,
    timeline,
  };
}
