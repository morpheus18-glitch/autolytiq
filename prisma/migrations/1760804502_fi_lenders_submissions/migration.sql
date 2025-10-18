-- Create Lender master table
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiProvider" TEXT NOT NULL,
    "apiCredentials" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tierRange" TEXT NOT NULL,
    "maxTerm" INTEGER NOT NULL,
    "maxLtv" DECIMAL(6, 3) NOT NULL,
    "minCreditScore" INTEGER,
    "maxCreditScore" INTEGER,
    "applicationFee" DECIMAL(18, 2),
    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lender_tenantId_idx" ON "Lender"("tenantId");

ALTER TABLE "Lender"
    ADD CONSTRAINT "Lender_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extend lender submissions with full decision tracking
ALTER TABLE "LenderSubmission"
    ADD COLUMN "submittedBy" TEXT NOT NULL DEFAULT 'system',
    ADD COLUMN "requestPayload" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN "respondedAt" TIMESTAMP(3),
    ADD COLUMN "responsePayload" JSONB,
    ADD COLUMN "amountApproved" DECIMAL(18, 2),
    ADD COLUMN "apr" DECIMAL(6, 3),
    ADD COLUMN "buyRate" DECIMAL(6, 3),
    ADD COLUMN "dealerReserve" DECIMAL(6, 3),
    ADD COLUMN "maxReserve" DECIMAL(6, 3),
    ADD COLUMN "term" INTEGER,
    ADD COLUMN "monthlyPayment" DECIMAL(18, 2),
    ADD COLUMN "declineReason" TEXT,
    ADD COLUMN "declineCode" TEXT,
    ADD COLUMN "stipulations" JSONB,
    ADD COLUMN "isSelected" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "selectedAt" TIMESTAMP(3),
    ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "LenderSubmission" SET "responsePayload" = "response";

UPDATE "LenderSubmission" SET "submittedAt" = COALESCE("submittedAt", NOW());

ALTER TABLE "LenderSubmission"
    ALTER COLUMN "submittedAt" SET NOT NULL,
    ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "LenderSubmission"
    DROP COLUMN "response",
    DROP COLUMN "createdAt",
    DROP COLUMN "updatedAt";

ALTER TABLE "LenderSubmission"
    ALTER COLUMN "submittedBy" DROP DEFAULT,
    ALTER COLUMN "requestPayload" DROP DEFAULT;

CREATE INDEX "LenderSubmission_status_idx" ON "LenderSubmission"("status");

-- Link deal jackets to lenders
ALTER TABLE "DealJacket"
    ADD CONSTRAINT "DealJacket_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
