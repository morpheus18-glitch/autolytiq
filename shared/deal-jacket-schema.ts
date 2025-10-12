import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users, vehicles } from "./schema";

// Multi-Store/Dealership Support
export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).unique().notNull(), // Unique store identifier
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  settings: jsonb("settings").$type<{
    timezone: string;
    currency: string;
    dealerLicense: string;
    taxRate: number;
    features: string[];
  }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Digital Deal Jackets - Main container for all customer/deal related data
export const dealJackets = pgTable("deal_jackets", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  dealNumber: varchar("deal_number", { length: 50 }).unique().notNull(),
  status: varchar("status", { length: 50 }).default('active'), // active, completed, cancelled
  dealType: varchar("deal_type", { length: 50 }).default('sale'), // sale, lease, trade
  salesConsultant: varchar("sales_consultant", { length: 255 }),
  financeManager: varchar("finance_manager", { length: 255 }),
  lastActivity: timestamp("last_activity").defaultNow(),
  metadata: jsonb("metadata").$type<{
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    source: string;
    notes: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("deal_jackets_store_idx").on(table.storeId),
  index("deal_jackets_customer_idx").on(table.customerId),
  index("deal_jackets_status_idx").on(table.status),
]);

// Deal Structure Components
export const dealStructures = pgTable("deal_structures", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealJacketId: uuid("deal_jacket_id").references(() => dealJackets.id).notNull(),
  saleVehicleId: integer("sale_vehicle_id").references(() => vehicles.id),
  tradeVehicleId: integer("trade_vehicle_id").references(() => vehicles.id),
  
  // Legacy pricing fields (kept for compatibility)
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  tradeValue: decimal("trade_value", { precision: 10, scale: 2 }),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }),
  financedAmount: decimal("financed_amount", { precision: 10, scale: 2 }),
  apr: decimal("apr", { precision: 5, scale: 3 }),
  termMonths: integer("term_months"),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  
  // Vehicle/Desk fields (cents-based for precision)
  msrpCents: integer("msrp_cents"),
  salePriceCents: integer("sale_price_cents"),
  vehicleCostCents: integer("vehicle_cost_cents"),
  packCents: integer("pack_cents"),
  holdbackCents: integer("holdback_cents"),
  rebatesCents: integer("rebates_cents"),
  docFeeCents: integer("doc_fee_cents"),
  deliveryFeeCents: integer("delivery_fee_cents"),
  milesIn: integer("miles_in"),
  
  // Trade fields (cents-based)
  tradeAcvCents: integer("trade_acv_cents"),
  tradeAllowanceCents: integer("trade_allowance_cents"),
  tradeReconCents: integer("trade_recon_cents"),
  tradePayoffCents: integer("trade_payoff_cents"),
  payoffGoodThru: timestamp("payoff_good_thru"),
  lienholderName: varchar("lienholder_name", { length: 255 }),
  titleState: varchar("title_state", { length: 2 }),
  
  // Finance/Lender fields
  cashDownCents: integer("cash_down_cents"),
  deferredDownCents: integer("deferred_down_cents"),
  aprBps: integer("apr_bps"), // Basis points (725 = 7.25%)
  buyRateBps: integer("buy_rate_bps"),
  reserveBasis: varchar("reserve_basis", { length: 50 }), // "APR Spread", "Flat", "None"
  reserveAmountCents: integer("reserve_amount_cents"),
  paymentFrequency: varchar("payment_frequency", { length: 20 }).default('MONTHLY'), // MONTHLY, BIWEEKLY
  
  // Tax/Compliance flags
  rebatesTaxable: boolean("rebates_taxable").default(false),
  tradeTaxCredit: boolean("trade_tax_credit").default(true),
  taxOnFees: boolean("tax_on_fees").default(true),
  taxOnDown: boolean("tax_on_down").default(false),
  
  // Compliance/Audit
  deskingNotes: text("desking_notes"),
  disclosuresJson: jsonb("disclosures_json").$type<{
    taxMethod?: string;
    rebateTaxable?: boolean;
    tradeCreditLogic?: string;
    [key: string]: any;
  }>(),
  auditId: integer("audit_id").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit Applications & Compliance
export const creditApplications = pgTable("credit_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealJacketId: uuid("deal_jacket_id").references(() => dealJackets.id).notNull(),
  applicationType: varchar("application_type", { length: 50 }).notNull(), // primary, co-applicant
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  ssn: varchar("ssn", { length: 50 }), // Encrypted
  dateOfBirth: timestamp("date_of_birth"),
  annualIncome: decimal("annual_income", { precision: 10, scale: 2 }),
  employmentInfo: jsonb("employment_info").$type<{
    employer: string;
    position: string;
    yearsEmployed: number;
    monthlyIncome: number;
  }>(),
  creditScore: integer("credit_score"),
  creditDecision: varchar("credit_decision", { length: 50 }), // approved, declined, pending
  lenderInfo: jsonb("lender_info").$type<{
    lenderName: string;
    approvedAmount: number;
    apr: number;
    terms: string;
  }>(),
  status: varchar("status", { length: 50 }).default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents Management
export const dealDocuments = pgTable("deal_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealJacketId: uuid("deal_jacket_id").references(() => dealJackets.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  documentCategory: varchar("document_category", { length: 50 }).notNull(), // credit, compliance, contracts, etc.
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default('pending'), // pending, completed, reviewed, signed
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewDate: timestamp("review_date"),
  isRequired: boolean("is_required").default(false),
  metadata: jsonb("metadata").$type<{
    description: string;
    version: number;
    tags: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("deal_documents_jacket_idx").on(table.dealJacketId),
  index("deal_documents_type_idx").on(table.documentType),
]);

// Deal History & Activity Log
export const dealHistory = pgTable("deal_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealJacketId: uuid("deal_jacket_id").references(() => dealJackets.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description"),
  performedBy: varchar("performed_by", { length: 255 }),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").$type<{
    ip: string;
    userAgent: string;
    module: string;
  }>(),
});

// F&I Products & Add-ons
export const dealProducts = pgTable("deal_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealJacketId: uuid("deal_jacket_id").references(() => dealJackets.id).notNull(),
  productCode: varchar("product_code", { length: 50 }), // WARRANTY, GAP, MAINT, WHEEL_TIRE, THEFT, VSC (nullable for backwards compatibility)
  productType: varchar("product_type", { length: 100 }).notNull(), // warranty, insurance, accessories, etc.
  productName: varchar("product_name", { length: 255 }).notNull(),
  providerName: varchar("provider_name", { length: 255 }),
  
  // Pricing (cents-based for precision)
  retailCents: integer("retail_cents"),
  costCents: integer("cost_cents"),
  
  // Legacy decimal fields (kept for compatibility)
  cost: decimal("cost", { precision: 10, scale: 2 }),
  markup: decimal("markup", { precision: 10, scale: 2 }),
  customerPrice: decimal("customer_price", { precision: 10, scale: 2 }),
  
  // Terms and conditions
  termMonths: integer("term_months"),
  milesLimit: integer("miles_limit"),
  cancelable: boolean("cancelable").default(true),
  taxable: boolean("taxable").default(false),
  
  isFinanced: boolean("is_financed").default(false),
  status: varchar("status", { length: 50 }).default('quoted'), // quoted, sold, declined
  details: jsonb("details").$type<{
    coverage?: string;
    term?: string;
    deductible?: number;
    features?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Deal Fees - DMV, doc fees, etc.
export const dealFees = pgTable("deal_fees", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealJacketId: uuid("deal_jacket_id").references(() => dealJackets.id).notNull(),
  code: varchar("code", { length: 50 }).notNull(), // DOC, TITLE, REG, ELEC, TIRE, SMOG, OTHER
  description: varchar("description", { length: 255 }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  taxable: boolean("taxable").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const storesRelations = relations(stores, ({ many }) => ({
  dealJackets: many(dealJackets),
}));

export const dealJacketsRelations = relations(dealJackets, ({ one, many }) => ({
  store: one(stores, {
    fields: [dealJackets.storeId],
    references: [stores.id],
  }),
  customer: one(users, {
    fields: [dealJackets.customerId],
    references: [users.id],
  }),
  dealStructure: one(dealStructures),
  creditApplications: many(creditApplications),
  documents: many(dealDocuments),
  history: many(dealHistory),
  products: many(dealProducts),
  fees: many(dealFees),
}));

export const dealStructuresRelations = relations(dealStructures, ({ one }) => ({
  dealJacket: one(dealJackets, {
    fields: [dealStructures.dealJacketId],
    references: [dealJackets.id],
  }),
  saleVehicle: one(vehicles, {
    fields: [dealStructures.saleVehicleId],
    references: [vehicles.id],
  }),
  tradeVehicle: one(vehicles, {
    fields: [dealStructures.tradeVehicleId],
    references: [vehicles.id],
  }),
}));

export const creditApplicationsRelations = relations(creditApplications, ({ one }) => ({
  dealJacket: one(dealJackets, {
    fields: [creditApplications.dealJacketId],
    references: [dealJackets.id],
  }),
}));

export const dealDocumentsRelations = relations(dealDocuments, ({ one }) => ({
  dealJacket: one(dealJackets, {
    fields: [dealDocuments.dealJacketId],
    references: [dealJackets.id],
  }),
}));

export const dealHistoryRelations = relations(dealHistory, ({ one }) => ({
  dealJacket: one(dealJackets, {
    fields: [dealHistory.dealJacketId],
    references: [dealJackets.id],
  }),
}));

export const dealProductsRelations = relations(dealProducts, ({ one }) => ({
  dealJacket: one(dealJackets, {
    fields: [dealProducts.dealJacketId],
    references: [dealJackets.id],
  }),
}));

export const dealFeesRelations = relations(dealFees, ({ one }) => ({
  dealJacket: one(dealJackets, {
    fields: [dealFees.dealJacketId],
    references: [dealJackets.id],
  }),
}));

// Store Lenders - Dealer-specific lender configurations
export const storeLenders = pgTable("store_lenders", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  lenderName: varchar("lender_name", { length: 255 }).notNull(),
  lenderCode: varchar("lender_code", { length: 50 }),
  isActive: boolean("is_active").default(true),
  isPreferred: boolean("is_preferred").default(false),
  creditTiers: jsonb("credit_tiers").$type<Array<{
    tier: string; // A+, A, B, C, D
    minScore: number;
    maxScore: number;
    baseRate: number;
    maxLTV: number;
    maxTerm: number;
  }>>(),
  contactInfo: jsonb("contact_info").$type<{
    primaryContact: string;
    phone: string;
    email: string;
    submissionUrl?: string;
  }>(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("store_lenders_store_idx").on(table.storeId),
]);

// Store Product Presets - Dealer-specific backend product defaults
export const storeProductPresets = pgTable("store_product_presets", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  productType: varchar("product_type", { length: 100 }).notNull(), // warranty, gap, maintenance, tire_wheel
  productName: varchar("product_name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  defaultRetailPrice: decimal("default_retail_price", { precision: 10, scale: 2 }),
  defaultCost: decimal("default_cost", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  terms: jsonb("terms").$type<{
    coverageMonths?: number;
    mileageLimit?: number;
    deductible?: number;
    features?: string[];
  }>(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("store_product_presets_store_idx").on(table.storeId),
  index("store_product_presets_type_idx").on(table.productType),
]);

// Store Finance Settings - Dealer-specific finance configurations
export const storeFinanceSettings = pgTable("store_finance_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  defaultTerm: integer("default_term").default(72), // months
  availableTerms: integer("available_terms").array().notNull().default([36, 48, 60, 72, 84]),
  defaultAPR: decimal("default_apr", { precision: 5, scale: 3 }).default('6.990'),
  minDownPaymentPercent: decimal("min_down_payment_percent", { precision: 5, scale: 2 }).default('0.00'),
  maxLTV: decimal("max_ltv", { precision: 5, scale: 2 }).default('125.00'), // Loan to value %
  financeReservePercent: decimal("finance_reserve_percent", { precision: 5, scale: 2 }).default('2.00'),
  taxCalculation: jsonb("tax_calculation").$type<{
    includeTrade: boolean;
    includeBackend: boolean;
    roundTax: boolean;
  }>().default({ includeTrade: true, includeBackend: true, roundTax: true }),
  fees: jsonb("fees").$type<{
    docFee: number;
    titleFee: number;
    registrationFee: number;
    electronFilingFee?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("store_finance_settings_store_idx").on(table.storeId),
]);

// Store Page Settings - Page-specific UI/UX preferences
export const storePageSettings = pgTable("store_page_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  pageName: varchar("page_name", { length: 100 }).notNull(), // deal-desk, inventory, showroom-manager, etc.
  settings: jsonb("settings").$type<{
    defaultValues?: Record<string, any>;
    visibleFields?: string[];
    requiredFields?: string[];
    layout?: string;
    customizations?: Record<string, any>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("store_page_settings_store_idx").on(table.storeId),
  index("store_page_settings_page_idx").on(table.pageName),
]);

// Relations
export const storeLendersRelations = relations(storeLenders, ({ one }) => ({
  store: one(stores, {
    fields: [storeLenders.storeId],
    references: [stores.id],
  }),
}));

export const storeProductPresetsRelations = relations(storeProductPresets, ({ one }) => ({
  store: one(stores, {
    fields: [storeProductPresets.storeId],
    references: [stores.id],
  }),
}));

export const storeFinanceSettingsRelations = relations(storeFinanceSettings, ({ one }) => ({
  store: one(stores, {
    fields: [storeFinanceSettings.storeId],
    references: [stores.id],
  }),
}));

export const storePageSettingsRelations = relations(storePageSettings, ({ one }) => ({
  store: one(stores, {
    fields: [storePageSettings.storeId],
    references: [stores.id],
  }),
}));

// Zod Schemas
export const insertStoreSchema = createInsertSchema(stores);
export const selectStoreSchema = createSelectSchema(stores);
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = z.infer<typeof selectStoreSchema>;

export const insertStoreLenderSchema = createInsertSchema(storeLenders).omit({ id: true, createdAt: true, updatedAt: true });
export const selectStoreLenderSchema = createSelectSchema(storeLenders);
export type InsertStoreLender = z.infer<typeof insertStoreLenderSchema>;
export type StoreLender = z.infer<typeof selectStoreLenderSchema>;

export const insertStoreProductPresetSchema = createInsertSchema(storeProductPresets).omit({ id: true, createdAt: true, updatedAt: true });
export const selectStoreProductPresetSchema = createSelectSchema(storeProductPresets);
export type InsertStoreProductPreset = z.infer<typeof insertStoreProductPresetSchema>;
export type StoreProductPreset = z.infer<typeof selectStoreProductPresetSchema>;

export const insertStoreFinanceSettingsSchema = createInsertSchema(storeFinanceSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const selectStoreFinanceSettingsSchema = createSelectSchema(storeFinanceSettings);
export type InsertStoreFinanceSettings = z.infer<typeof insertStoreFinanceSettingsSchema>;
export type StoreFinanceSettings = z.infer<typeof selectStoreFinanceSettingsSchema>;

export const insertStorePageSettingsSchema = createInsertSchema(storePageSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const selectStorePageSettingsSchema = createSelectSchema(storePageSettings);
export type InsertStorePageSettings = z.infer<typeof insertStorePageSettingsSchema>;
export type StorePageSettings = z.infer<typeof selectStorePageSettingsSchema>;

export const insertDealJacketSchema = createInsertSchema(dealJackets);
export const selectDealJacketSchema = createSelectSchema(dealJackets);
export type InsertDealJacket = z.infer<typeof insertDealJacketSchema>;
export type DealJacket = z.infer<typeof selectDealJacketSchema>;

export const insertDealStructureSchema = createInsertSchema(dealStructures);
export const selectDealStructureSchema = createSelectSchema(dealStructures);
export type InsertDealStructure = z.infer<typeof insertDealStructureSchema>;
export type DealStructure = z.infer<typeof selectDealStructureSchema>;

export const insertCreditApplicationSchema = createInsertSchema(creditApplications);
export const selectCreditApplicationSchema = createSelectSchema(creditApplications);
export type InsertCreditApplication = z.infer<typeof insertCreditApplicationSchema>;
export type CreditApplication = z.infer<typeof selectCreditApplicationSchema>;

export const insertDealDocumentSchema = createInsertSchema(dealDocuments);
export const selectDealDocumentSchema = createSelectSchema(dealDocuments);
export type InsertDealDocument = z.infer<typeof insertDealDocumentSchema>;
export type DealDocument = z.infer<typeof selectDealDocumentSchema>;

export const insertDealHistorySchema = createInsertSchema(dealHistory);
export const selectDealHistorySchema = createSelectSchema(dealHistory);
export type InsertDealHistory = z.infer<typeof insertDealHistorySchema>;
export type DealHistory = z.infer<typeof selectDealHistorySchema>;

export const insertDealProductSchema = createInsertSchema(dealProducts);
export const selectDealProductSchema = createSelectSchema(dealProducts);
export type InsertDealProduct = z.infer<typeof insertDealProductSchema>;
export type DealProduct = z.infer<typeof selectDealProductSchema>;

export const insertDealFeeSchema = createInsertSchema(dealFees);
export const selectDealFeeSchema = createSelectSchema(dealFees);
export type InsertDealFee = z.infer<typeof insertDealFeeSchema>;
export type DealFee = z.infer<typeof selectDealFeeSchema>;