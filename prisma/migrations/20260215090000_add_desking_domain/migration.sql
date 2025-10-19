-- Desking domain schema additions
-- Part 8.1 - Deal worksheets, versions, optimization, counter offers, approval predictions

-- Rename existing deal status enum so new worksheet status can reuse original name
ALTER TYPE "DealStatus" RENAME TO "RetailDealStatus";

-- Core enums for desking workflows
CREATE TYPE "DealStatus" AS ENUM ('WORKING', 'PENCILED', 'SUBMITTED', 'CLOSED', 'LOST');
CREATE TYPE "CreditTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5', 'TIER_6');
CREATE TYPE "ResidenceType" AS ENUM ('OWN', 'RENT', 'LEASE', 'FAMILY', 'MILITARY', 'OTHER');
CREATE TYPE "Recommendation" AS ENUM ('STRONG', 'MODERATE', 'WEAK', 'DO_NOT_SUBMIT');
CREATE TYPE "CounterOfferOutcome" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- Ensure existing deals continue to default to draft status using renamed enum
ALTER TABLE "Deal"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "RetailDealStatus" USING "status"::text::"RetailDealStatus",
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- Worksheet snapshots for deal structuring
CREATE TABLE "DealWorksheet" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "salespersonId" TEXT,
  "structure" JSONB NOT NULL,
  "amountFinanced" DECIMAL(18, 2),
  "term" INTEGER,
  "apr" DECIMAL(6, 3),
  "payment" DECIMAL(18, 2),
  "totals" JSONB NOT NULL,
  "aiScore" DECIMAL(5, 4),
  "status" "DealStatus" NOT NULL DEFAULT 'WORKING',
  "versionPointerId" TEXT UNIQUE,
  "printablePdfUrl" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "DealWorksheet_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "DealWorksheet_deal_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "DealWorksheet_customer_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
  CONSTRAINT "DealWorksheet_vehicle_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT,
  CONSTRAINT "DealWorksheet_salesperson_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Versioned worksheet history
CREATE TABLE "DealVersion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "worksheetId" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "grossBreakdown" JSONB,
  "closeProbability" DECIMAL(5, 4),
  "approvalProbability" DECIMAL(5, 4),
  "aiScore" DECIMAL(5, 4),
  "label" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "DealVersion_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "DealVersion_deal_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "DealVersion_worksheet_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE CASCADE,
  CONSTRAINT "DealVersion_createdBy_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL
);

ALTER TABLE "DealWorksheet"
  ADD CONSTRAINT "DealWorksheet_versionPointer_fkey" FOREIGN KEY ("versionPointerId") REFERENCES "DealVersion"("id") ON DELETE SET NULL;

-- Optimization runs capturing goals/constraints and AI output
CREATE TABLE "DealOptimization" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "worksheetId" TEXT,
  "versionId" TEXT,
  "goals" JSONB NOT NULL,
  "constraints" JSONB NOT NULL,
  "recommendedStructure" JSONB NOT NULL,
  "alternatives" JSONB NOT NULL,
  "insights" TEXT[] NOT NULL DEFAULT '{}',
  "warnings" TEXT[] NOT NULL DEFAULT '{}',
  "projectedGross" DECIMAL(18, 2),
  "runById" TEXT,
  "mlTraceId" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "DealOptimization_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "DealOptimization_deal_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "DealOptimization_worksheet_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE SET NULL,
  CONSTRAINT "DealOptimization_version_fkey" FOREIGN KEY ("versionId") REFERENCES "DealVersion"("id") ON DELETE SET NULL,
  CONSTRAINT "DealOptimization_runBy_fkey" FOREIGN KEY ("runById") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Counter offer conversations with customers
CREATE TABLE "CounterOffer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "worksheetId" TEXT,
  "originalVersionId" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "aiResponse" JSONB NOT NULL,
  "selectedOption" JSONB,
  "scriptUsed" TEXT,
  "outcome" "CounterOfferOutcome" NOT NULL DEFAULT 'PENDING',
  "handledById" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "CounterOffer_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CounterOffer_deal_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "CounterOffer_worksheet_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE SET NULL,
  CONSTRAINT "CounterOffer_version_fkey" FOREIGN KEY ("originalVersionId") REFERENCES "DealVersion"("id") ON DELETE CASCADE,
  CONSTRAINT "CounterOffer_handledBy_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Lender approval predictions
CREATE TABLE "ApprovalPrediction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "worksheetId" TEXT,
  "versionId" TEXT,
  "lenderId" TEXT NOT NULL,
  "lenderName" TEXT NOT NULL,
  "approvalProbability" DECIMAL(5, 4) NOT NULL,
  "recommendedTier" "CreditTier" NOT NULL,
  "estimatedRate" DECIMAL(6, 3),
  "estimatedReserve" DECIMAL(18, 2),
  "strengths" TEXT[] NOT NULL DEFAULT '{}',
  "weaknesses" TEXT[] NOT NULL DEFAULT '{}',
  "stipulations" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "recommendation" "Recommendation" NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "ApprovalPrediction_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "ApprovalPrediction_deal_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "ApprovalPrediction_worksheet_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE SET NULL,
  CONSTRAINT "ApprovalPrediction_version_fkey" FOREIGN KEY ("versionId") REFERENCES "DealVersion"("id") ON DELETE SET NULL,
  CONSTRAINT "ApprovalPrediction_lender_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE CASCADE
);

-- Worksheet indexes for common filters and JSON search
CREATE INDEX "DealWorksheet_tenant_deal_idx" ON "DealWorksheet" ("tenantId", "dealId");
CREATE INDEX "DealWorksheet_tenant_customer_idx" ON "DealWorksheet" ("tenantId", "customerId");
CREATE INDEX "DealWorksheet_tenant_vehicle_idx" ON "DealWorksheet" ("tenantId", "vehicleId");
CREATE INDEX "DealWorksheet_tenant_status_idx" ON "DealWorksheet" ("tenantId", "status");
CREATE INDEX "DealWorksheet_deal_createdAt_idx" ON "DealWorksheet" ("dealId", "createdAt" DESC);
CREATE INDEX "DealWorksheet_tenant_version_idx" ON "DealWorksheet" ("tenantId", "versionPointerId");
CREATE INDEX "DealWorksheet_structure_gin" ON "DealWorksheet" USING GIN ("structure");
CREATE INDEX "DealWorksheet_totals_gin" ON "DealWorksheet" USING GIN ("totals");
CREATE INDEX "DealWorksheet_active_working_idx" ON "DealWorksheet" ("tenantId") WHERE "status" = 'WORKING';

-- Version indexes for retrieval
CREATE INDEX "DealVersion_tenant_deal_idx" ON "DealVersion" ("tenantId", "dealId");
CREATE INDEX "DealVersion_tenant_worksheet_idx" ON "DealVersion" ("tenantId", "worksheetId");
CREATE INDEX "DealVersion_deal_createdAt_idx" ON "DealVersion" ("dealId", "createdAt" DESC);
CREATE INDEX "DealVersion_worksheet_createdAt_idx" ON "DealVersion" ("worksheetId", "createdAt" DESC);
CREATE INDEX "DealVersion_snapshot_gin" ON "DealVersion" USING GIN ("snapshot");
CREATE INDEX "DealVersion_gross_gin" ON "DealVersion" USING GIN ("grossBreakdown");

-- Optimization indexes for analytics
CREATE INDEX "DealOptimization_tenant_deal_idx" ON "DealOptimization" ("tenantId", "dealId");
CREATE INDEX "DealOptimization_deal_createdAt_idx" ON "DealOptimization" ("dealId", "createdAt" DESC);
CREATE INDEX "DealOptimization_tenant_worksheet_idx" ON "DealOptimization" ("tenantId", "worksheetId");
CREATE INDEX "DealOptimization_tenant_version_idx" ON "DealOptimization" ("tenantId", "versionId");
CREATE INDEX "DealOptimization_tenant_trace_idx" ON "DealOptimization" ("tenantId", "mlTraceId");
CREATE INDEX "DealOptimization_goals_gin" ON "DealOptimization" USING GIN ("goals");
CREATE INDEX "DealOptimization_recommended_gin" ON "DealOptimization" USING GIN ("recommendedStructure");
CREATE INDEX "DealOptimization_alternatives_gin" ON "DealOptimization" USING GIN ("alternatives");

-- Counter offer indexes
CREATE INDEX "CounterOffer_tenant_deal_idx" ON "CounterOffer" ("tenantId", "dealId");
CREATE INDEX "CounterOffer_tenant_outcome_idx" ON "CounterOffer" ("tenantId", "outcome");
CREATE INDEX "CounterOffer_deal_createdAt_idx" ON "CounterOffer" ("dealId", "createdAt" DESC);
CREATE INDEX "CounterOffer_input_gin" ON "CounterOffer" USING GIN ("input");
CREATE INDEX "CounterOffer_aiResponse_gin" ON "CounterOffer" USING GIN ("aiResponse");

-- Approval prediction indexes
CREATE INDEX "ApprovalPrediction_tenant_deal_idx" ON "ApprovalPrediction" ("tenantId", "dealId");
CREATE INDEX "ApprovalPrediction_tenant_lender_idx" ON "ApprovalPrediction" ("tenantId", "lenderId");
CREATE INDEX "ApprovalPrediction_tenant_recommendation_idx" ON "ApprovalPrediction" ("tenantId", "recommendation");
CREATE INDEX "ApprovalPrediction_deal_createdAt_idx" ON "ApprovalPrediction" ("dealId", "createdAt" DESC);
CREATE INDEX "ApprovalPrediction_stipulations_gin" ON "ApprovalPrediction" USING GIN ("stipulations");
