import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Market Leads - captured from web scraping and social monitoring
export const marketLeads = pgTable("market_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  contact: varchar("contact"), // general contact info
  source: varchar("source").notNull(), // website/platform where found
  sourceUrl: varchar("source_url"), // specific URL where found
  postContent: text("post_content"), // original post/message content
  vehicleInterest: jsonb("vehicle_interest").$type<string[]>().default([]),
  intentScore: integer("intent_score").default(0), // 0-100 ML-generated score
  lifecycleStage: varchar("lifecycle_stage").notNull().default("awareness"), // awareness, consideration, intent, purchase, ownership
  region: varchar("region"),
  budgetRange: varchar("budget_range"),
  timeframe: varchar("timeframe"), // when they plan to buy
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isConverted: boolean("is_converted").default(false),
  convertedCustomerId: varchar("converted_customer_id"), // links to customers table when converted
  status: varchar("status").default("new"), // new, contacted, qualified, lost
});

// Lead Activity - track all interactions and signals
export const leadActivity = pgTable("lead_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  type: varchar("type").notNull(), // post, search, visit, inquiry, etc.
  detail: text("detail").notNull(),
  source: varchar("source"), // where this activity was found
  timestamp: timestamp("timestamp").defaultNow(),
  confidence: integer("confidence").default(100), // ML confidence in this signal
  metadata: jsonb("metadata"), // additional structured data
});

// Lead Alerts - ML-triggered notifications for hot leads
export const leadAlerts = pgTable("lead_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  trigger: varchar("trigger").notNull(), // high_intent, repeat_visits, price_shopping, etc.
  message: text("message").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("new"), // new, read, actioned, dismissed
  createdAt: timestamp("created_at").defaultNow(),
  actionedBy: varchar("actioned_by"), // user who took action
  actionedAt: timestamp("actioned_at"),
});

// Lead Sources - track where we're finding leads
export const leadSources = pgTable("lead_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  type: varchar("type").notNull(), // forum, marketplace, social, review_site, etc.
  isActive: boolean("is_active").default(true),
  lastScraped: timestamp("last_scraped"),
  totalLeadsFound: integer("total_leads_found").default(0),
  successRate: integer("success_rate").default(0), // conversion rate
  createdAt: timestamp("created_at").defaultNow(),
});

// ML Intent Scores - historical scoring for trend analysis
export const intentScores = pgTable("intent_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  score: integer("score").notNull(),
  factors: jsonb("factors").$type<string[]>(), // what drove this score
  modelVersion: varchar("model_version"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Zod schemas for validation
export const insertMarketLeadSchema = createInsertSchema(marketLeads);
export const insertLeadActivitySchema = createInsertSchema(leadActivity);
export const insertLeadAlertSchema = createInsertSchema(leadAlerts);
export const insertLeadSourceSchema = createInsertSchema(leadSources);
export const insertIntentScoreSchema = createInsertSchema(intentScores);

// Types
export type MarketLead = typeof marketLeads.$inferSelect;
export type InsertMarketLead = z.infer<typeof insertMarketLeadSchema>;

export type LeadActivity = typeof leadActivity.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;

export type LeadAlert = typeof leadAlerts.$inferSelect;
export type InsertLeadAlert = z.infer<typeof insertLeadAlertSchema>;

export type LeadSource = typeof leadSources.$inferSelect;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;

export type IntentScore = typeof intentScores.$inferSelect;
export type InsertIntentScore = z.infer<typeof insertIntentScoreSchema>;