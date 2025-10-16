-- Initial schema for automotive CRM/DMS multi-tenant database
-- Generated to align with Prisma schema definitions

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "TenantPlan" AS ENUM ('TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'SALES', 'FINANCE', 'SERVICE');
CREATE TYPE "PreferredContactMethod" AS ENUM ('EMAIL', 'PHONE', 'SMS');
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'WALKIN', 'PHONE', 'EMAIL', 'SOCIAL_MEDIA', 'THIRD_PARTY', 'OTHER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'HOT', 'WARM', 'COLD', 'LOST', 'CUSTOMER');
CREATE TYPE "InteractionType" AS ENUM ('CALL', 'EMAIL', 'SMS', 'VISIT', 'TEST_DRIVE', 'FOLLOW_UP');
CREATE TYPE "InteractionDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "CustomerVehicleStatus" AS ENUM ('OWNED', 'TRADED', 'SOLD');
CREATE TYPE "VehicleType" AS ENUM ('NEW', 'USED', 'CERTIFIED');
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'PENDING', 'SOLD', 'IN_TRANSIT', 'SERVICE', 'WHOLESALE');
CREATE TYPE "VehicleHistoryType" AS ENUM ('SERVICE', 'ACCIDENT', 'OWNERSHIP', 'INSPECTION');
CREATE TYPE "DealType" AS ENUM ('CASH', 'FINANCE', 'LEASE');
CREATE TYPE "DealStatus" AS ENUM ('DRAFT', 'PENDING', 'SUBMITTED', 'APPROVED', 'FUNDED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "DealDocumentType" AS ENUM ('CONTRACT', 'CREDIT_APP', 'INSURANCE', 'REGISTRATION', 'OTHER');
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE "NormalBalance" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'POSTED', 'VOID');
CREATE TYPE "LineType" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "CommissionType" AS ENUM ('FRONT', 'BACK', 'BONUS', 'SPIFF');
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CHARGEBACK');
CREATE TYPE "ReportType" AS ENUM ('SALES', 'INVENTORY', 'FINANCE', 'CUSTOM');
CREATE TYPE "NotificationType" AS ENUM ('DEAL_APPROVAL', 'FOLLOW_UP', 'INVENTORY_ALERT', 'TASK', 'SYSTEM');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW');

CREATE TABLE "Tenant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "subdomain" TEXT NOT NULL,
  "plan" "TenantPlan" NOT NULL DEFAULT 'BASIC',
  "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
  "settings" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "billingEmail" TEXT NOT NULL,
  "subscriptionEndsAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant" ("subdomain");

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'SALES',
  "permissions" JSONB NOT NULL DEFAULT jsonb_build_array(),
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User" ("tenantId", "email");
CREATE INDEX "User_tenantId_idx" ON "User" ("tenantId");

CREATE TABLE "Customer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "dateOfBirth" DATE,
  "driversLicenseNumber" TEXT,
  "driversLicenseState" TEXT,
  "ssn" TEXT,
  "addressStreet" TEXT,
  "addressCity" TEXT,
  "addressState" TEXT,
  "addressZip" TEXT,
  "addressCountry" TEXT,
  "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
  "leadSource" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
  "leadStatus" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "leadScore" INTEGER NOT NULL DEFAULT 0,
  "creditScore" INTEGER,
  "assignedToUserId" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "lifetimeValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  "search_vector" TSVECTOR DEFAULT to_tsvector('english', coalesce("firstName", '') || ' ' || coalesce("lastName", '') || ' ' || coalesce("email", '') || ' ' || coalesce("phone", '')),
  CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Customer_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "Customer_tenantId_leadStatus_idx" ON "Customer" ("tenantId", "leadStatus");
CREATE INDEX "Customer_tenantId_assignedToUserId_idx" ON "Customer" ("tenantId", "assignedToUserId");
CREATE INDEX "Customer_search_idx" ON "Customer" USING GIN ("search_vector");
CREATE INDEX "Customer_name_idx" ON "Customer" ("tenantId", "lastName", "firstName");

CREATE TABLE "CustomerInteraction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "InteractionType" NOT NULL,
  "direction" "InteractionDirection" NOT NULL,
  "subject" TEXT,
  "notes" TEXT,
  "duration" INTEGER,
  "scheduledAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "CustomerInteraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CustomerInteraction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
  CONSTRAINT "CustomerInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "CustomerInteraction_customer_idx" ON "CustomerInteraction" ("tenantId", "customerId");
CREATE INDEX "CustomerInteraction_followup_idx" ON "CustomerInteraction" ("tenantId", "scheduledAt");

CREATE TABLE "CustomerVehicle" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "vin" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "make" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "trim" TEXT,
  "purchaseDate" TIMESTAMPTZ,
  "purchasePrice" DECIMAL(18,2),
  "currentMileage" INTEGER,
  "status" "CustomerVehicleStatus" NOT NULL DEFAULT 'OWNED',
  "tradedInDate" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "CustomerVehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CustomerVehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "CustomerVehicle_tenant_vin_key" ON "CustomerVehicle" ("tenantId", "vin");
CREATE INDEX "CustomerVehicle_customer_idx" ON "CustomerVehicle" ("tenantId", "customerId");

CREATE TABLE "Vehicle" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "stockNumber" TEXT NOT NULL,
  "vin" TEXT NOT NULL,
  "type" "VehicleType" NOT NULL,
  "year" INTEGER NOT NULL,
  "make" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "trim" TEXT,
  "exteriorColor" TEXT,
  "interiorColor" TEXT,
  "mileage" INTEGER,
  "engineType" TEXT,
  "transmission" TEXT,
  "drivetrain" TEXT,
  "fuelType" "FuelType" NOT NULL,
  "msrp" DECIMAL(18,2),
  "invoiceCost" DECIMAL(18,2),
  "listPrice" DECIMAL(18,2),
  "specialPrice" DECIMAL(18,2),
  "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "location" TEXT,
  "dateReceived" TIMESTAMPTZ,
  "dateSold" TIMESTAMPTZ,
  "daysInStock" INTEGER DEFAULT 0,
  "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "certificationNumber" TEXT,
  "floorPlanId" TEXT,
  "floorPlanDate" TIMESTAMPTZ,
  "floorPlanInterestRate" DECIMAL(5,2),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  "search_vector" TSVECTOR DEFAULT to_tsvector('english', coalesce("vin", '') || ' ' || coalesce("make", '') || ' ' || coalesce("model", '')),
  CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Vehicle_tenant_stockNumber_key" ON "Vehicle" ("tenantId", "stockNumber");
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle" ("vin");
CREATE INDEX "Vehicle_status_idx" ON "Vehicle" ("tenantId", "status");
CREATE INDEX "Vehicle_make_model_idx" ON "Vehicle" ("tenantId", "make", "model");
CREATE INDEX "Vehicle_search_idx" ON "Vehicle" USING GIN ("search_vector");

CREATE TABLE "VehicleHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "type" "VehicleHistoryType" NOT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "description" TEXT NOT NULL,
  "documentUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "VehicleHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "VehicleHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE
);

CREATE INDEX "VehicleHistory_vehicle_idx" ON "VehicleHistory" ("tenantId", "vehicleId");

CREATE TABLE "Deal" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealNumber" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "salesPersonId" TEXT NOT NULL,
  "financeManagerId" TEXT,
  "dealType" "DealType" NOT NULL,
  "status" "DealStatus" NOT NULL DEFAULT 'DRAFT',
  "vehiclePrice" DECIMAL(18,2) NOT NULL,
  "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "netVehiclePrice" DECIMAL(18,2) NOT NULL,
  "tradeVehicleId" TEXT,
  "tradeAllowance" DECIMAL(18,2),
  "tradePayoff" DECIMAL(18,2),
  "tradeEquity" DECIMAL(18,2),
  "downPayment" DECIMAL(18,2),
  "amountFinanced" DECIMAL(18,2),
  "apr" DECIMAL(5,2),
  "term" INTEGER,
  "monthlyPayment" DECIMAL(18,2),
  "lenderName" TEXT,
  "lenderRate" DECIMAL(5,2),
  "dealerReserve" DECIMAL(18,2),
  "docFee" DECIMAL(18,2),
  "registrationFee" DECIMAL(18,2),
  "salesTax" DECIMAL(18,2),
  "otherFees" JSONB,
  "warrantyProduct" TEXT,
  "warrantyCost" DECIMAL(18,2),
  "gapInsurance" BOOLEAN NOT NULL DEFAULT FALSE,
  "gapCost" DECIMAL(18,2),
  "maintenancePlan" BOOLEAN NOT NULL DEFAULT FALSE,
  "maintenanceCost" DECIMAL(18,2),
  "otherProducts" JSONB,
  "frontEndGross" DECIMAL(18,2),
  "backEndGross" DECIMAL(18,2),
  "totalGross" DECIMAL(18,2),
  "packAmount" DECIMAL(18,2),
  "dealDate" TIMESTAMPTZ NOT NULL,
  "fundedDate" TIMESTAMPTZ,
  "deliveryDate" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Deal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT,
  CONSTRAINT "Deal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT,
  CONSTRAINT "Deal_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "Deal_financeManagerId_fkey" FOREIGN KEY ("financeManagerId") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "Deal_tradeVehicleId_fkey" FOREIGN KEY ("tradeVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "Deal_tenant_dealNumber_key" ON "Deal" ("tenantId", "dealNumber");
CREATE INDEX "Deal_status_idx" ON "Deal" ("tenantId", "status");
CREATE INDEX "Deal_customer_idx" ON "Deal" ("tenantId", "customerId");
CREATE INDEX "Deal_salesperson_idx" ON "Deal" ("tenantId", "salesPersonId");

CREATE TABLE "DealDocument" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "type" "DealDocumentType" NOT NULL,
  "name" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "signedAt" TIMESTAMPTZ,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "DealDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "DealDocument_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "DealDocument_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE INDEX "DealDocument_deal_idx" ON "DealDocument" ("tenantId", "dealId");

CREATE TABLE "GLAccount" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountType" "AccountType" NOT NULL,
  "normalBalance" "NormalBalance" NOT NULL,
  "parentAccountId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "balance" DECIMAL(18,2),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "GLAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "GLAccount_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "GLAccount"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "GLAccount_tenant_accountNumber_key" ON "GLAccount" ("tenantId", "accountNumber");
CREATE INDEX "GLAccount_parent_idx" ON "GLAccount" ("tenantId", "parentAccountId");

CREATE TABLE "JournalEntry" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "entryNumber" TEXT NOT NULL,
  "dealId" TEXT,
  "entryDate" TIMESTAMPTZ NOT NULL,
  "description" TEXT NOT NULL,
  "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
  "postedById" TEXT NOT NULL,
  "postedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "JournalEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "JournalEntry_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL,
  CONSTRAINT "JournalEntry_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "JournalEntry_tenant_entryNumber_key" ON "JournalEntry" ("tenantId", "entryNumber");
CREATE INDEX "JournalEntry_deal_idx" ON "JournalEntry" ("tenantId", "dealId");

CREATE TABLE "JournalEntryLine" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "journalEntryId" TEXT NOT NULL,
  "glAccountId" TEXT NOT NULL,
  "type" "LineType" NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "JournalEntryLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE,
  CONSTRAINT "JournalEntryLine_glAccountId_fkey" FOREIGN KEY ("glAccountId") REFERENCES "GLAccount"("id") ON DELETE RESTRICT
);

CREATE INDEX "JournalEntryLine_journal_idx" ON "JournalEntryLine" ("tenantId", "journalEntryId");
CREATE INDEX "JournalEntryLine_account_idx" ON "JournalEntryLine" ("tenantId", "glAccountId");

CREATE TABLE "Commission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "commissionType" "CommissionType" NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "rate" DECIMAL(5,2),
  "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
  "paidDate" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Commission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Commission_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Commission_user_idx" ON "Commission" ("tenantId", "userId");
CREATE INDEX "Commission_status_idx" ON "Commission" ("tenantId", "status");

CREATE TABLE "Report" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "ReportType" NOT NULL,
  "parameters" JSONB,
  "schedule" TEXT,
  "lastRunAt" TIMESTAMPTZ,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE INDEX "Report_type_idx" ON "Report" ("tenantId", "type");

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "actionUrl" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "readAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Notification_user_idx" ON "Notification" ("tenantId", "userId", "isRead");

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "userId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "changes" JSONB NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "AuditLog_entity_idx" ON "AuditLog" ("tenantId", "entityType", "entityId");
CREATE INDEX "AuditLog_user_idx" ON "AuditLog" ("tenantId", "userId");

CREATE TABLE "SystemSetting" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedById" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "SystemSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "SystemSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "SystemSetting_tenant_key_unique" ON "SystemSetting" ("tenantId", "key");

