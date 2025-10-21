-- F&I initialization: deal jackets and document management
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SALES_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FI_MANAGER';

DROP TABLE IF EXISTS "DealDocument";
DROP TYPE IF EXISTS "DealDocumentType";

CREATE TABLE IF NOT EXISTS "DealJacket" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealNumber" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "salespersonId" TEXT NOT NULL,
  "fiManagerId" TEXT,
  "sellingPrice" DECIMAL(18,2) NOT NULL,
  "tradeValue" DECIMAL(18,2),
  "tradePayoff" DECIMAL(18,2),
  "netTrade" DECIMAL(18,2),
  "cashDown" DECIMAL(18,2) NOT NULL,
  "amountFinanced" DECIMAL(18,2) NOT NULL,
  "lenderId" TEXT,
  "apr" DECIMAL(6,3),
  "term" INTEGER,
  "monthlyPayment" DECIMAL(18,2),
  "fiProducts" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "totalFiGross" DECIMAL(18,2),
  "status" TEXT NOT NULL,
  "dealDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "contractDate" TIMESTAMPTZ,
  "fundedDate" TIMESTAMPTZ,
  "deliveredDate" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "DealJacket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "DealJacket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT,
  CONSTRAINT "DealJacket_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT,
  CONSTRAINT "DealJacket_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "DealJacket_fiManagerId_fkey" FOREIGN KEY ("fiManagerId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "DealJacket_dealNumber_key" ON "DealJacket" ("dealNumber");
CREATE INDEX IF NOT EXISTS "DealJacket_tenantId_idx" ON "DealJacket" ("tenantId");
CREATE INDEX IF NOT EXISTS "DealJacket_customerId_idx" ON "DealJacket" ("customerId");
CREATE INDEX IF NOT EXISTS "DealJacket_status_idx" ON "DealJacket" ("status");

CREATE TABLE IF NOT EXISTS "DealDocument" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "dealId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "DealDocument_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "DealDocument_dealId_idx" ON "DealDocument" ("dealId");
CREATE INDEX IF NOT EXISTS "DealDocument_type_idx" ON "DealDocument" ("type");

CREATE TABLE IF NOT EXISTS "CreditApplication" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "details" JSONB,
  "decision" JSONB,
  "submittedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "CreditApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CreditApplication_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditApplication_dealId_key" ON "CreditApplication" ("dealId");
CREATE INDEX IF NOT EXISTS "CreditApplication_tenantId_idx" ON "CreditApplication" ("tenantId");

CREATE TABLE IF NOT EXISTS "LenderSubmission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "lenderId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "submittedAt" TIMESTAMPTZ,
  "response" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "LenderSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "LenderSubmission_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "LenderSubmission_tenantId_idx" ON "LenderSubmission" ("tenantId");
CREATE INDEX IF NOT EXISTS "LenderSubmission_dealId_idx" ON "LenderSubmission" ("dealId");

CREATE TABLE IF NOT EXISTS "Contract" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "contractNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "documentUrl" TEXT,
  "executedAt" TIMESTAMPTZ,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Contract_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Contract'
      AND column_name = 'contractNumber'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "Contract_dealId_contractNumber_key" ON "Contract" ("dealId", "contractNumber");
  END IF;
END
$$;
CREATE INDEX IF NOT EXISTS "Contract_tenantId_idx" ON "Contract" ("tenantId");
CREATE INDEX IF NOT EXISTS "Contract_dealId_idx" ON "Contract" ("dealId");

CREATE TABLE IF NOT EXISTS "FundingChecklist" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "completedAt" TIMESTAMPTZ,
  "reviewerId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FundingChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "FundingChecklist_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE,
  CONSTRAINT "FundingChecklist_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "FundingChecklist_dealId_key" ON "FundingChecklist" ("dealId");
CREATE INDEX IF NOT EXISTS "FundingChecklist_tenantId_idx" ON "FundingChecklist" ("tenantId");
