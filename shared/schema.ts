import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull().unique(),
  price: integer("price").notNull(),
  status: text("status").notNull(), // available, pending, sold, maintenance
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  interestedIn: text("interested_in"), // vehicle type or specific vehicle
  status: text("status").notNull(), // new, contacted, qualified, lost
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  salesPersonId: integer("sales_person_id").references(() => users.id).notNull(),
  salePrice: integer("sale_price").notNull(),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
  notes: text("notes"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // sale, lead, vehicle_added, etc.
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visitorSessions = pgTable("visitor_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  visitorId: text("visitor_id").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  deviceType: text("device_type"), // desktop, mobile, tablet
  browserName: text("browser_name"),
  operatingSystem: text("operating_system"),
  country: text("country"),
  city: text("city"),
  isReturningVisitor: boolean("is_returning_visitor").default(false),
  totalPageViews: integer("total_page_views").default(0),
  sessionDuration: integer("session_duration").default(0), // in seconds
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => visitorSessions.sessionId).notNull(),
  pageUrl: text("page_url").notNull(),
  pageTitle: text("page_title"),
  timeOnPage: integer("time_on_page").default(0), // in seconds
  scrollDepth: integer("scroll_depth").default(0), // percentage
  exitPage: boolean("exit_page").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerInteractions = pgTable("customer_interactions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => visitorSessions.sessionId).notNull(),
  interactionType: text("interaction_type").notNull(), // vehicle_view, lead_form, contact_click, etc.
  elementId: text("element_id"),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  data: text("data"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitorAnalytics = pgTable("competitor_analytics", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => visitorSessions.sessionId).notNull(),
  competitorDomain: text("competitor_domain").notNull(),
  visitDuration: integer("visit_duration"), // in seconds
  pagesVisited: integer("pages_visited"),
  lastVisited: timestamp("last_visited").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Competitive pricing data
export const competitivePricing = pgTable("competitive_pricing", {
  id: serial("id").primaryKey(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  trim: varchar("trim", { length: 100 }),
  mileage: integer("mileage"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: varchar("source_url", { length: 500 }),
  location: varchar("location", { length: 255 }),
  condition: varchar("condition", { length: 50 }),
  features: text("features").array(),
  images: text("images").array(),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// ML pricing insights
export const pricingInsights = pgTable("pricing_insights", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  suggestedPrice: decimal("suggested_price", { precision: 10, scale: 2 }).notNull(),
  marketAverage: decimal("market_average", { precision: 10, scale: 2 }).notNull(),
  priceRange: json("price_range").$type<{min: number, max: number}>(),
  competitorCount: integer("competitor_count").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  pricePosition: varchar("price_position", { length: 20 }).notNull(), // "below", "average", "above"
  recommendedAction: varchar("recommended_action", { length: 50 }).notNull(),
  factors: json("factors").$type<{
    mileage: number,
    age: number,
    condition: number,
    features: number,
    location: number,
    demand: number
  }>(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Merchandising strategies
export const merchandisingStrategies = pgTable("merchandising_strategies", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  strategy: varchar("strategy", { length: 100 }).notNull(),
  description: text("description").notNull(),
  priority: integer("priority").notNull(),
  estimatedImpact: varchar("estimated_impact", { length: 20 }).notNull(),
  implementationCost: decimal("implementation_cost", { precision: 10, scale: 2 }),
  expectedROI: decimal("expected_roi", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market trends
export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  trend: varchar("trend", { length: 100 }).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(), // "up", "down", "stable"
  strength: decimal("strength", { precision: 5, scale: 2 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(),
  description: text("description").notNull(),
  dataPoints: integer("data_points").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, saleDate: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertVisitorSessionSchema = createInsertSchema(visitorSessions).omit({ id: true, createdAt: true, lastActivity: true });
export const insertPageViewSchema = createInsertSchema(pageViews).omit({ id: true, createdAt: true });
export const insertCustomerInteractionSchema = createInsertSchema(customerInteractions).omit({ id: true, createdAt: true });
export const insertCompetitorAnalyticsSchema = createInsertSchema(competitorAnalytics).omit({ id: true, createdAt: true });
export const insertCompetitivePricingSchema = createInsertSchema(competitivePricing).omit({ id: true, scrapedAt: true });
export const insertPricingInsightsSchema = createInsertSchema(pricingInsights).omit({ id: true, lastUpdated: true });
export const insertMerchandisingStrategiesSchema = createInsertSchema(merchandisingStrategies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketTrendsSchema = createInsertSchema(marketTrends).omit({ id: true, lastUpdated: true });

export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type VisitorSession = typeof visitorSessions.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type CompetitorAnalytics = typeof competitorAnalytics.$inferSelect;
export type CompetitivePricing = typeof competitivePricing.$inferSelect;
export type PricingInsights = typeof pricingInsights.$inferSelect;
export type MerchandisingStrategies = typeof merchandisingStrategies.$inferSelect;
export type MarketTrends = typeof marketTrends.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertVisitorSession = z.infer<typeof insertVisitorSessionSchema>;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type InsertCustomerInteraction = z.infer<typeof insertCustomerInteractionSchema>;
export type InsertCompetitorAnalytics = z.infer<typeof insertCompetitorAnalyticsSchema>;
export type InsertCompetitivePricing = z.infer<typeof insertCompetitivePricingSchema>;
export type InsertPricingInsights = z.infer<typeof insertPricingInsightsSchema>;
export type InsertMerchandisingStrategies = z.infer<typeof insertMerchandisingStrategiesSchema>;
export type InsertMarketTrends = z.infer<typeof insertMarketTrendsSchema>;
