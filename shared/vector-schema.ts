import { pgTable, text, varchar, timestamp, integer, real, vector, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Vector embeddings table for semantic search
export const customerEmbeddings = pgTable(
  "customer_embeddings",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    customerId: integer("customer_id").notNull().references(() => customers.id),
    contentType: varchar("content_type", { length: 50 }).notNull(), // 'profile', 'notes', 'conversation'
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }), // OpenAI ada-002 dimensions
    metadata: text("metadata").$type<Record<string, any>>(), // JSON for additional context
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIndex: index("embedding_idx").using("ivfflat", table.embedding.op("vector_cosine_ops")),
    customerIndex: index("customer_embedding_idx").on(table.customerId),
    contentTypeIndex: index("content_type_idx").on(table.contentType),
  })
);

// Vector embeddings for leads and notes
export const leadEmbeddings = pgTable(
  "lead_embeddings",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    leadId: integer("lead_id").notNull().references(() => leads.id),
    contentType: varchar("content_type", { length: 50 }).notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: text("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIndex: index("lead_embedding_idx").using("ivfflat", table.embedding.op("vector_cosine_ops")),
    leadIndex: index("lead_embedding_lead_idx").on(table.leadId),
    contentTypeIndex: index("lead_content_type_idx").on(table.contentType),
  })
);

// Vector embeddings for inventory with smart recommendations
export const inventoryEmbeddings = pgTable(
  "inventory_embeddings",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
    contentType: varchar("content_type", { length: 50 }).notNull(), // 'specs', 'description', 'features'
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: text("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIndex: index("inventory_embedding_idx").using("ivfflat", table.embedding.op("vector_cosine_ops")),
    vehicleIndex: index("inventory_vehicle_idx").on(table.vehicleId),
    contentTypeIndex: index("inventory_content_type_idx").on(table.contentType),
  })
);

// ML model predictions and insights
export const mlPredictions = pgTable("ml_predictions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'lead', 'customer', 'deal'
  entityId: integer("entity_id").notNull(),
  modelType: varchar("model_type", { length: 50 }).notNull(), // 'lead_score', 'price_prediction', 'churn_risk'
  prediction: real("prediction").notNull(),
  confidence: real("confidence").notNull(),
  features: text("features").$type<Record<string, any>>(),
  modelVersion: varchar("model_version", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For cache invalidation
});

// Smart search queries for learning and optimization
export const searchQueries = pgTable("search_queries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  queryText: text("query_text").notNull(),
  queryType: varchar("query_type", { length: 50 }).notNull(), // 'customer', 'inventory', 'lead'
  embedding: vector("embedding", { dimensions: 1536 }),
  resultsCount: integer("results_count").notNull(),
  clickedResults: text("clicked_results").$type<number[]>(),
  satisfaction: real("satisfaction"), // User feedback score
  responseTime: integer("response_time"), // In milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Import from main schema - these would need to be imported from the actual schema
// For now, creating placeholder references
const customers = pgTable("customers", {
  id: integer("id").primaryKey()
});

const leads = pgTable("leads", {
  id: integer("id").primaryKey()
});

const vehicles = pgTable("vehicles", {
  id: integer("id").primaryKey()
});

export type CustomerEmbedding = typeof customerEmbeddings.$inferSelect;
export type InsertCustomerEmbedding = typeof customerEmbeddings.$inferInsert;

export type LeadEmbedding = typeof leadEmbeddings.$inferSelect;
export type InsertLeadEmbedding = typeof leadEmbeddings.$inferInsert;

export type InventoryEmbedding = typeof inventoryEmbeddings.$inferSelect;
export type InsertInventoryEmbedding = typeof inventoryEmbeddings.$inferInsert;

export type MLPrediction = typeof mlPredictions.$inferSelect;
export type InsertMLPrediction = typeof mlPredictions.$inferInsert;

export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = typeof searchQueries.$inferInsert;