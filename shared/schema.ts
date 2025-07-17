import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, saleDate: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
