import {
  pgTable,
  text,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  jsonb,
  serial,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chart of Accounts - Standard Auto Dealership Accounts
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  accountNumber: varchar("account_number", { length: 20 }).notNull().unique(),
  accountName: varchar("account_name", { length: 100 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // Asset, Liability, Equity, Revenue, Expense
  category: varchar("category", { length: 100 }).notNull(), // New Vehicle Sales, Used Vehicle Sales, Service, Parts, F&I, etc.
  subCategory: varchar("sub_category", { length: 100 }),
  parentAccountId: integer("parent_account_id").references(() => chartOfAccounts.id),
  isActive: boolean("is_active").default(true),
  normalBalance: varchar("normal_balance", { length: 10 }).notNull(), // Debit or Credit
  description: text("description"),
  taxCode: varchar("tax_code", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// General Ledger Entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  entryDate: date("entry_date").notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }), // Invoice, Deal, etc.
  dealId: integer("deal_id"),
  vehicleId: integer("vehicle_id"),
  customerId: integer("customer_id"),
  totalDebit: decimal("total_debit", { precision: 12, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 }).notNull(),
  isPosted: boolean("is_posted").default(false),
  postedAt: timestamp("posted_at"),
  postedBy: varchar("posted_by", { length: 100 }),
  memo: text("memo"),
  attachments: jsonb("attachments").default([]),
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Journal Entry Line Items
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => chartOfAccounts.id).notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }).default("0.00"),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow()
});

// Deal Finalization and Profitability
export const dealProfitability = pgTable("deal_profitability", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().unique(),
  vehicleId: integer("vehicle_id").notNull(),
  customerId: integer("customer_id").notNull(),
  
  // Vehicle Cost Information
  vehicleCost: decimal("vehicle_cost", { precision: 12, scale: 2 }).notNull(),
  reconCost: decimal("recon_cost", { precision: 12, scale: 2 }).default("0.00"),
  packCost: decimal("pack_cost", { precision: 12, scale: 2 }).default("0.00"),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  
  // Selling Price Information
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }).notNull(),
  tradeAllowance: decimal("trade_allowance", { precision: 12, scale: 2 }).default("0.00"),
  tradeActualValue: decimal("trade_actual_value", { precision: 12, scale: 2 }).default("0.00"),
  cashDown: decimal("cash_down", { precision: 12, scale: 2 }).default("0.00"),
  netTradePosition: decimal("net_trade_position", { precision: 12, scale: 2 }).default("0.00"),
  
  // Front End Gross
  frontEndGross: decimal("front_end_gross", { precision: 12, scale: 2 }).notNull(),
  
  // F&I Products and Backend Gross
  warrantyRevenue: decimal("warranty_revenue", { precision: 12, scale: 2 }).default("0.00"),
  gapRevenue: decimal("gap_revenue", { precision: 12, scale: 2 }).default("0.00"),
  maintenanceRevenue: decimal("maintenance_revenue", { precision: 12, scale: 2 }).default("0.00"),
  insuranceRevenue: decimal("insurance_revenue", { precision: 12, scale: 2 }).default("0.00"),
  otherFiProducts: decimal("other_fi_products", { precision: 12, scale: 2 }).default("0.00"),
  backEndGross: decimal("back_end_gross", { precision: 12, scale: 2 }).default("0.00"),
  
  // Finance Reserve
  financeReserve: decimal("finance_reserve", { precision: 12, scale: 2 }).default("0.00"),
  reserveRate: decimal("reserve_rate", { precision: 5, scale: 4 }).default("0.0000"), // Percentage
  buyRate: decimal("buy_rate", { precision: 5, scale: 4 }).default("0.0000"),
  sellRate: decimal("sell_rate", { precision: 5, scale: 4 }).default("0.0000"),
  financeCompany: varchar("finance_company", { length: 100 }),
  
  // Reserve Split Configuration
  reserveSplitType: varchar("reserve_split_type", { length: 20 }).default("percentage"), // percentage or flat
  salesPersonSplit: decimal("salesperson_split", { precision: 5, scale: 2 }).default("50.00"), // Percentage or flat amount
  managerSplit: decimal("manager_split", { precision: 5, scale: 2 }).default("25.00"),
  houseSplit: decimal("house_split", { precision: 5, scale: 2 }).default("25.00"),
  
  // Calculated Reserve Amounts
  salesPersonReserve: decimal("salesperson_reserve", { precision: 12, scale: 2 }).default("0.00"),
  managerReserve: decimal("manager_reserve", { precision: 12, scale: 2 }).default("0.00"),
  houseReserve: decimal("house_reserve", { precision: 12, scale: 2 }).default("0.00"),
  
  // Total Deal Profit
  totalGross: decimal("total_gross", { precision: 12, scale: 2 }).notNull(),
  totalProfit: decimal("total_profit", { precision: 12, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).notNull(),
  
  // Deal Status
  isFinalized: boolean("is_finalized").default(false),
  finalizedAt: timestamp("finalized_at"),
  finalizedBy: varchar("finalized_by", { length: 100 }),
  
  // eContract Integration
  econtractStatus: varchar("econtract_status", { length: 50 }).default("pending"), // pending, sent, signed, completed
  econtractId: varchar("econtract_id", { length: 100 }),
  econtractSentAt: timestamp("econtract_sent_at"),
  econtractSignedAt: timestamp("econtract_signed_at"),
  
  // Accounting Integration
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id),
  isPostedToBooks: boolean("is_posted_to_books").default(false),
  postedToBooksAt: timestamp("posted_to_books_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Monthly Financial Statements
export const monthlyFinancials = pgTable("monthly_financials", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  accountId: integer("account_id").references(() => chartOfAccounts.id).notNull(),
  
  // Monthly Balances
  beginningBalance: decimal("beginning_balance", { precision: 12, scale: 2 }).default("0.00"),
  monthlyDebits: decimal("monthly_debits", { precision: 12, scale: 2 }).default("0.00"),
  monthlyCredits: decimal("monthly_credits", { precision: 12, scale: 2 }).default("0.00"),
  endingBalance: decimal("ending_balance", { precision: 12, scale: 2 }).default("0.00"),
  
  // Year-to-Date
  ytdDebits: decimal("ytd_debits", { precision: 12, scale: 2 }).default("0.00"),
  ytdCredits: decimal("ytd_credits", { precision: 12, scale: 2 }).default("0.00"),
  ytdBalance: decimal("ytd_balance", { precision: 12, scale: 2 }).default("0.00"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// F&I Product Configurations
export const fiProductConfigs = pgTable("fi_product_configs", {
  id: serial("id").primaryKey(),
  productName: varchar("product_name", { length: 100 }).notNull(),
  productType: varchar("product_type", { length: 50 }).notNull(), // warranty, gap, maintenance, insurance
  provider: varchar("provider", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  
  // Pricing Configuration
  costPercentage: decimal("cost_percentage", { precision: 5, scale: 2 }).default("0.00"),
  baseCommission: decimal("base_commission", { precision: 5, scale: 2 }).default("0.00"),
  tierCommissions: jsonb("tier_commissions").default([]), // Volume-based commissions
  
  // Coverage Details
  coverageMonths: integer("coverage_months"),
  coverageMiles: integer("coverage_miles"),
  deductible: decimal("deductible", { precision: 12, scale: 2 }),
  maxClaim: decimal("max_claim", { precision: 12, scale: 2 }),
  
  description: text("description"),
  terms: text("terms"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// eContract Templates and Documents
export const econtractTemplates = pgTable("econtract_templates", {
  id: serial("id").primaryKey(),
  templateName: varchar("template_name", { length: 100 }).notNull(),
  templateType: varchar("template_type", { length: 50 }).notNull(), // sales_contract, finance_contract, trade_agreement
  isActive: boolean("is_active").default(true),
  
  // Template Content
  templateContent: text("template_content").notNull(),
  requiredFields: jsonb("required_fields").default([]),
  optionalFields: jsonb("optional_fields").default([]),
  
  // Signature Configuration
  signaturePages: jsonb("signature_pages").default([]),
  witnessRequired: boolean("witness_required").default(false),
  notaryRequired: boolean("notary_required").default(false),
  
  // Compliance
  state: varchar("state", { length: 2 }),
  complianceNotes: text("compliance_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Schema Validation
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines);
export const insertDealProfitabilitySchema = createInsertSchema(dealProfitability);
export const insertMonthlyFinancialsSchema = createInsertSchema(monthlyFinancials);
export const insertFiProductConfigSchema = createInsertSchema(fiProductConfigs);
export const insertEcontractTemplateSchema = createInsertSchema(econtractTemplates);

// Types
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountsSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
export type DealProfitability = typeof dealProfitability.$inferSelect;
export type InsertDealProfitability = z.infer<typeof insertDealProfitabilitySchema>;
export type MonthlyFinancials = typeof monthlyFinancials.$inferSelect;
export type InsertMonthlyFinancials = z.infer<typeof insertMonthlyFinancialsSchema>;
export type FiProductConfig = typeof fiProductConfigs.$inferSelect;
export type InsertFiProductConfig = z.infer<typeof insertFiProductConfigSchema>;
export type EcontractTemplate = typeof econtractTemplates.$inferSelect;
export type InsertEcontractTemplate = z.infer<typeof insertEcontractTemplateSchema>;