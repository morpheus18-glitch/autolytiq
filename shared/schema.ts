import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, json, primaryKey, unique, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  departmentId: integer("department_id").references(() => departments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  resource: text("resource").notNull(), // vehicles, customers, leads, sales, reports, etc.
  action: text("action").notNull(), // create, read, update, delete, export, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Role permissions junction table
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").references(() => roles.id).notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

// Updated users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  roleId: integer("role_id").references(() => roles.id),
  departmentId: integer("department_id").references(() => departments.id),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 36 }).unique().notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull().unique(),
  trim: text("trim"),
  mileage: integer("mileage"),
  price: integer("price").notNull(),
  status: text("status").notNull(), // available, pending, sold, maintenance
  description: text("description"),
  imageUrl: text("image_url"),
  media: json("media").$type<Array<{url: string; label: string; type: string}>>(),
  valuations: json("valuations").$type<{kbb?: number; mmr?: number; blackBook?: number; jdPower?: number}>(),
  auditLogs: json("audit_logs").$type<Array<{user: string; action: string; timestamp: string; details?: string}>>(),
  priceHistory: json("price_history").$type<Array<{price: number; user: string; timestamp: string; reason?: string}>>(),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  cellPhone: text("cell_phone"),
  workPhone: text("work_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  dateOfBirth: text("date_of_birth"),
  driversLicenseNumber: text("drivers_license_number"),
  driversLicenseState: text("drivers_license_state"),
  ssn: text("ssn"),
  creditScore: integer("credit_score"),
  income: decimal("income", { precision: 10, scale: 2 }),
  employment: json("employment"),
  bankingInfo: json("banking_info"),
  insurance: json("insurance"),
  preferences: json("preferences"),
  leadSource: text("lead_source"),
  referredBy: text("referred_by"),
  communicationPreferences: json("communication_preferences"),
  purchaseHistory: json("purchase_history"),
  serviceHistory: json("service_history"),
  followUpSchedule: json("follow_up_schedule"),
  tags: json("tags"),
  notes: text("notes"),
  salesConsultant: text("sales_consultant"),
  status: text("status").notNull().default("prospect"),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  name: text("name").notNull(),
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  licenseExpiry: timestamp("license_expiry"),
  profileImage: text("profile_image"),
  socialSecurityNumber: text("ssn_encrypted"), // Encrypted storage
  preferredContactMethod: text("preferred_contact_method"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit Applications
export const creditApplications = pgTable("credit_applications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  ssn: text("ssn").notNull(), // Encrypted
  employmentHistory: json("employment_history").$type<Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate?: string;
    income: number;
    phone: string;
  }>>(),
  currentIncome: decimal("current_income", { precision: 10, scale: 2 }),
  rentMortgage: decimal("rent_mortgage", { precision: 10, scale: 2 }),
  consentGiven: boolean("consent_given").default(false),
  status: text("status").notNull().default("pending"), // pending, submitted, approved, rejected
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  approvalAmount: decimal("approval_amount", { precision: 10, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  termMonths: integer("term_months"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Co-Applicants
export const coApplicants = pgTable("co_applicants", {
  id: serial("id").primaryKey(),
  creditApplicationId: integer("credit_application_id").references(() => creditApplications.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth").notNull(),
  ssn: text("ssn").notNull(), // Encrypted
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  employmentHistory: json("employment_history").$type<Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate?: string;
    income: number;
    phone: string;
  }>>(),
  currentIncome: decimal("current_income", { precision: 10, scale: 2 }),
  creditScore: integer("credit_score"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trade Vehicles
export const tradeVehicles = pgTable("trade_vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  vin: text("vin").notNull(),
  mileage: integer("mileage"),
  condition: text("condition"), // excellent, good, fair, poor
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  kbbValue: decimal("kbb_value", { precision: 10, scale: 2 }),
  mmrValue: decimal("mmr_value", { precision: 10, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
  photos: json("photos").$type<Array<{url: string; caption: string}>>(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, appraised, accepted, rejected
  appraisedAt: timestamp("appraised_at"),
  appraisedBy: text("appraised_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Showroom Visits
export const showroomVisits = pgTable("showroom_visits", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  visitDate: timestamp("visit_date").defaultNow().notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, arrived, in_meeting, test_drive, left, sold
  assignedSalesperson: text("assigned_salesperson"),
  scheduledTime: timestamp("scheduled_time"),
  arrivedTime: timestamp("arrived_time"),
  meetingStartTime: timestamp("meeting_start_time"),
  testDriveStartTime: timestamp("test_drive_start_time"),
  leftTime: timestamp("left_time"),
  soldTime: timestamp("sold_time"),
  vehicleOfInterest: text("vehicle_of_interest"),
  comments: text("comments"),
  statusHistory: json("status_history").$type<Array<{
    status: string;
    timestamp: string;
    user: string;
    comment: string;
  }>>(),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Salesperson Notes
export const salespersonNotes = pgTable("salesperson_notes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  salespersonId: integer("salesperson_id").references(() => users.id).notNull(),
  note: text("note").notNull(),
  flaggedForManager: boolean("flagged_for_manager").default(false),
  flaggedAt: timestamp("flagged_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadNumber: text("lead_number").notNull().unique(),
  source: text("source").notNull(),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("medium"),
  temperature: text("temperature").notNull().default("warm"),
  interestedVehicles: json("interested_vehicles"),
  budget: json("budget"),
  timeline: text("timeline"),
  tradeInInfo: json("trade_in_info"),
  financing: json("financing"),
  assignedTo: text("assigned_to").notNull(),
  lastActivity: timestamp("last_activity"),
  nextFollowUp: timestamp("next_follow_up"),
  activities: json("activities"),
  tags: json("tags"),
  notes: text("notes"),
  conversionProbability: decimal("conversion_probability", { precision: 5, scale: 2 }),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  competitorInfo: json("competitor_info"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  interestedIn: text("interested_in"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull().default(60),
  status: text("status").notNull().default("scheduled"),
  assignedTo: text("assigned_to").notNull(),
  location: text("location"),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  confirmationSent: boolean("confirmation_sent").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject"),
  content: text("content"),
  sentBy: text("sent_by"),
  sentTo: text("sent_to"),
  status: text("status").notNull().default("sent"),
  readAt: timestamp("read_at"),
  repliedAt: timestamp("replied_at"),
  attachments: json("attachments"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  assignedTo: text("assigned_to").notNull(),
  assignedBy: text("assigned_by"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Service Department Tables
export const serviceParts = pgTable("service_parts", {
  id: serial("id").primaryKey(),
  partNumber: text("part_number").notNull().unique(),
  partName: text("part_name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // engine, transmission, body, etc.
  supplier: text("supplier"),
  cost: decimal("cost").notNull(),
  retailPrice: decimal("retail_price").notNull(),
  quantityInStock: integer("quantity_in_stock").default(0).notNull(),
  minimumStock: integer("minimum_stock").default(0).notNull(),
  location: text("location"), // warehouse location
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceOrders = pgTable("service_orders", {
  id: serial("id").primaryKey(),
  workOrderNumber: text("work_order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  serviceAdvisorId: integer("service_advisor_id").references(() => users.id),
  technicianId: integer("technician_id").references(() => users.id),
  status: text("status").notNull(), // scheduled, in_progress, completed, cancelled
  serviceType: text("service_type").notNull(), // maintenance, repair, inspection
  description: text("description").notNull(),
  laborHours: decimal("labor_hours").default("0"),
  laborRate: decimal("labor_rate").notNull(),
  partsTotal: decimal("parts_total").default("0"),
  laborTotal: decimal("labor_total").default("0"),
  taxAmount: decimal("tax_amount").default("0"),
  totalAmount: decimal("total_amount").default("0"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceOrderParts = pgTable("service_order_parts", {
  id: serial("id").primaryKey(),
  serviceOrderId: integer("service_order_id").references(() => serviceOrders.id).notNull(),
  partId: integer("part_id").references(() => serviceParts.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  totalCost: decimal("total_cost").notNull(),
  totalPrice: decimal("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accounting Department Tables
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeNumber: text("employee_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  position: text("position").notNull(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
  hireDate: timestamp("hire_date").notNull(),
  terminationDate: timestamp("termination_date"),
  salary: decimal("salary"),
  hourlyRate: decimal("hourly_rate"),
  payrollType: text("payroll_type").notNull(), // salary, hourly
  isActive: boolean("is_active").default(true).notNull(),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  hoursWorked: decimal("hours_worked").default("0"),
  regularHours: decimal("regular_hours").default("0"),
  overtimeHours: decimal("overtime_hours").default("0"),
  grossPay: decimal("gross_pay").notNull(),
  taxes: decimal("taxes").default("0"),
  deductions: decimal("deductions").default("0"),
  netPay: decimal("net_pay").notNull(),
  status: text("status").notNull(), // draft, processed, paid
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  transactionType: text("transaction_type").notNull(), // sale, service, expense, payroll
  referenceId: integer("reference_id"), // links to sale_id, service_order_id, etc.
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  category: text("category").notNull(),
  account: text("account").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  createdBy: integer("created_by").references(() => users.id),
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

// Customer management tables
export const customerNotes = pgTable("customer_notes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  noteType: text("note_type").notNull(), // call, meeting, email, general
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerCalls = pgTable("customer_calls", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  callType: text("call_type").notNull(), // inbound, outbound
  phoneNumber: text("phone_number").notNull(),
  duration: integer("duration"), // in seconds
  callStatus: text("call_status").notNull(), // completed, missed, busy, no_answer
  notes: text("notes"),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerVehiclesOfInterest = pgTable("customer_vehicles_of_interest", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  preferredFeatures: text("preferred_features").array(),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerTradeIns = pgTable("customer_trade_ins", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage"),
  condition: text("condition").notNull(), // excellent, good, fair, poor
  estimatedValue: integer("estimated_value"),
  actualValue: integer("actual_value"),
  vin: text("vin"),
  images: text("images").array(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, appraised, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerCreditApplications = pgTable("customer_credit_applications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  applicationStatus: text("application_status").notNull(), // submitted, pending, approved, denied
  lenderName: text("lender_name"),
  creditScore: integer("credit_score"),
  approvedAmount: integer("approved_amount"),
  interestRate: decimal("interest_rate"),
  termMonths: integer("term_months"),
  monthlyPayment: integer("monthly_payment"),
  downPayment: integer("down_payment"),
  applicationData: text("application_data"), // Encrypted JSON
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const customerDocuments = pgTable("customer_documents", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  documentType: text("document_type").notNull(), // license, insurance, proof_of_income, etc.
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerLeadSources = pgTable("customer_lead_sources", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  sourceType: text("source_type").notNull(), // website, referral, walk_in, phone, social_media, etc.
  sourceName: text("source_name"), // specific source name
  campaignId: text("campaign_id"),
  referralCustomerId: integer("referral_customer_id").references(() => customers.id),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  conversionValue: integer("conversion_value"),
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

// Insert schemas
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServicePartSchema = createInsertSchema(serviceParts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceOrderPartSchema = createInsertSchema(serviceOrderParts).omit({ id: true, createdAt: true });
export const insertPayrollSchema = createInsertSchema(payroll).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, uuid: true, createdAt: true });
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
export const insertCustomerNoteSchema = createInsertSchema(customerNotes).omit({ id: true, createdAt: true });
export const insertCustomerCallSchema = createInsertSchema(customerCalls).omit({ id: true, createdAt: true });
export const insertCustomerVehicleOfInterestSchema = createInsertSchema(customerVehiclesOfInterest).omit({ id: true, createdAt: true });
export const insertCustomerTradeInSchema = createInsertSchema(customerTradeIns).omit({ id: true, createdAt: true });
export const insertCustomerCreditApplicationSchema = createInsertSchema(customerCreditApplications).omit({ id: true, submittedAt: true });
export const insertCustomerDocumentSchema = createInsertSchema(customerDocuments).omit({ id: true, createdAt: true });
export const insertCustomerLeadSourceSchema = createInsertSchema(customerLeadSources).omit({ id: true, createdAt: true });

// Showroom Manager - Daily customer tracking for showroom floor management
export const showroomSessions = pgTable("showroom_sessions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  stockNumber: varchar("stock_number", { length: 50 }),
  salespersonId: integer("salesperson_id").references(() => users.id),
  leadSource: varchar("lead_source", { length: 50 }),
  eventStatus: varchar("event_status", { length: 50 }).default("pending").notNull(), // sold, dead, working, pending, sent_to_finance
  dealStage: varchar("deal_stage", { length: 50 }).default("vehicle_selection").notNull(), // vehicle_selection, test_drive, numbers, closed_deal, finalized
  notes: text("notes"),
  timeEntered: timestamp("time_entered").defaultNow().notNull(),
  timeExited: timestamp("time_exited"),
  sessionDate: date("session_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShowroomSessionSchema = createInsertSchema(showroomSessions).omit({ id: true, createdAt: true, updatedAt: true });

// New customer detail insert schemas
export const insertCreditApplicationSchema = createInsertSchema(creditApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCoApplicantSchema = createInsertSchema(coApplicants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradeVehicleSchema = createInsertSchema(tradeVehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShowroomVisitSchema = createInsertSchema(showroomVisits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSalespersonNoteSchema = createInsertSchema(salespersonNotes).omit({ id: true, createdAt: true, updatedAt: true });

export type Department = typeof departments.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;

// New customer detail types
export type CreditApplication = typeof creditApplications.$inferSelect;
export type CoApplicant = typeof coApplicants.$inferSelect;
export type TradeVehicle = typeof tradeVehicles.$inferSelect;
export type ShowroomVisit = typeof showroomVisits.$inferSelect;
export type SalespersonNote = typeof salespersonNotes.$inferSelect;
export type ShowroomSession = typeof showroomSessions.$inferSelect;
export type User = typeof users.$inferSelect;

// Deal Management Schema
export const deals = pgTable("deals", {
  id: text("id").primaryKey().notNull(),
  dealNumber: text("deal_number").unique().notNull(),
  status: text("status").notNull().default("open"), // open, finalized, funded, cancelled
  
  // Vehicle Information
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  vin: text("vin"),
  msrp: integer("msrp"),
  salePrice: integer("sale_price"),
  
  // Customer Information
  customerId: text("customer_id").references(() => customers.id),
  buyerName: text("buyer_name").notNull(),
  coBuyerName: text("co_buyer_name"),
  
  // Trade Information
  tradeVin: text("trade_vin"),
  tradeAllowance: integer("trade_allowance").default(0),
  tradePayoff: integer("trade_payoff").default(0),
  
  // Financial Structure
  dealType: text("deal_type").notNull(), // retail, lease, cash
  cashDown: integer("cash_down").default(0),
  rebates: integer("rebates").default(0),
  salesTax: integer("sales_tax").default(0),
  docFee: integer("doc_fee").default(0),
  titleFee: integer("title_fee").default(0),
  registrationFee: integer("registration_fee").default(0),
  financeBalance: integer("finance_balance").default(0),
  
  // Credit Information
  creditStatus: text("credit_status"), // approved, pending, denied
  creditTier: text("credit_tier"), // A+, A, B, C, D
  term: integer("term"),
  rate: text("rate"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  finalizedAt: timestamp("finalized_at"),
  
  // User tracking
  salesPersonId: text("sales_person_id"),
  financeManagerId: text("finance_manager_id"),
});

export const dealProducts = pgTable("deal_products", {
  id: text("id").primaryKey().notNull(),
  dealId: text("deal_id").references(() => deals.id).notNull(),
  productName: text("product_name").notNull(),
  retailPrice: integer("retail_price").notNull(),
  cost: integer("cost").notNull(),
  category: text("category"), // warranty, gap, tire_wheel, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealGross = pgTable("deal_gross", {
  id: text("id").primaryKey().notNull(),
  dealId: text("deal_id").references(() => deals.id).notNull(),
  frontEndGross: integer("front_end_gross").default(0),
  financeReserve: integer("finance_reserve").default(0),
  productGross: integer("product_gross").default(0),
  packCost: integer("pack_cost").default(0),
  netGross: integer("net_gross").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const accountingEntries = pgTable("accounting_entries", {
  id: text("id").primaryKey().notNull(),
  dealId: text("deal_id").references(() => deals.id).notNull(),
  accountCode: text("account_code").notNull(),
  accountName: text("account_name").notNull(),
  debit: integer("debit").default(0),
  credit: integer("credit").default(0),
  memo: text("memo"),
  entryDate: timestamp("entry_date").defaultNow(),
});

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: text("id").primaryKey().notNull(),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // asset, liability, equity, revenue, expense
  subCategory: text("sub_category"),
  isActive: boolean("is_active").default(true),
});

// Deal Relations
export const dealRelations = relations(deals, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [deals.vehicleId],
    references: [vehicles.id],
  }),
  customer: one(customers, {
    fields: [deals.customerId],
    references: [customers.id],
  }),
  products: many(dealProducts),
  gross: one(dealGross),
  accountingEntries: many(accountingEntries),
}));

export const dealProductsRelations = relations(dealProducts, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProducts.dealId],
    references: [deals.id],
  }),
}));

export const dealGrossRelations = relations(dealGross, ({ one }) => ({
  deal: one(deals, {
    fields: [dealGross.dealId],
    references: [deals.id],
  }),
}));

export const accountingEntriesRelations = relations(accountingEntries, ({ one }) => ({
  deal: one(deals, {
    fields: [accountingEntries.dealId],
    references: [deals.id],
  }),
}));

// Deal Management Insert Schemas and Types
export const insertDealSchema = createInsertSchema(deals);
export const insertDealProductSchema = createInsertSchema(dealProducts);
export const insertDealGrossSchema = createInsertSchema(dealGross);
export const insertAccountingEntrySchema = createInsertSchema(accountingEntries);

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;
export type DealProduct = typeof dealProducts.$inferSelect;
export type InsertDealProduct = typeof dealProducts.$inferInsert;
export type DealGross = typeof dealGross.$inferSelect;
export type InsertDealGross = typeof dealGross.$inferInsert;
export type AccountingEntry = typeof accountingEntries.$inferSelect;
export type InsertAccountingEntry = typeof accountingEntries.$inferInsert;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type ServicePart = typeof serviceParts.$inferSelect;
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type ServiceOrderPart = typeof serviceOrderParts.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
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

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertServicePart = z.infer<typeof insertServicePartSchema>;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type InsertServiceOrderPart = z.infer<typeof insertServiceOrderPartSchema>;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
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
export type InsertCustomerNote = z.infer<typeof insertCustomerNoteSchema>;
export type InsertCustomerCall = z.infer<typeof insertCustomerCallSchema>;
export type InsertCustomerVehicleOfInterest = z.infer<typeof insertCustomerVehicleOfInterestSchema>;
export type InsertCustomerTradeIn = z.infer<typeof insertCustomerTradeInSchema>;
export type InsertCustomerCreditApplication = z.infer<typeof insertCustomerCreditApplicationSchema>;
export type InsertCustomerDocument = z.infer<typeof insertCustomerDocumentSchema>;
export type InsertCustomerLeadSource = z.infer<typeof insertCustomerLeadSourceSchema>;

export type CustomerNote = typeof customerNotes.$inferSelect;
export type CustomerCall = typeof customerCalls.$inferSelect;
export type CustomerVehicleOfInterest = typeof customerVehiclesOfInterest.$inferSelect;
export type CustomerTradeIn = typeof customerTradeIns.$inferSelect;
export type CustomerCreditApplication = typeof customerCreditApplications.$inferSelect;
export type CustomerDocument = typeof customerDocuments.$inferSelect;
export type CustomerLeadSource = typeof customerLeadSources.$inferSelect;

// Deal Desk Tables - Removed to avoid conflicts with comprehensive deal schema below

// Additional interfaces for vehicle management
export interface MediaItem {
  url: string;
  label: string;
  type: string;
}

export interface PriceHistoryEntry {
  price: number;
  user: string;
  timestamp: string;
  reason?: string;
}

export interface AuditLogEntry {
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}
