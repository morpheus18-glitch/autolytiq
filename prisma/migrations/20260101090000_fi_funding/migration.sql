-- CreateTable
CREATE TABLE "FundingRequest" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "dealId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "amountRequested" DECIMAL(18,2) NOT NULL,
    "fundingMethod" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "status" TEXT NOT NULL,
    "submittedAt" TIMESTAMPTZ(6),
    "reviewedAt" TIMESTAMPTZ(6),
    "approvedAt" TIMESTAMPTZ(6),
    "fundedAt" TIMESTAMPTZ(6),
    "fundedAmount" DECIMAL(18,2),
    "lenderRefNumber" TEXT,
    "timeline" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "journalEntryId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundingRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FundingRequest_dealId_key" UNIQUE ("dealId")
);

-- AddForeignKey
ALTER TABLE "FundingRequest"
ADD CONSTRAINT "FundingRequest_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest"
ADD CONSTRAINT "FundingRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest"
ADD CONSTRAINT "FundingRequest_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "FundingRequest_tenantId_idx" ON "FundingRequest"("tenantId");

-- CreateIndex
CREATE INDEX "FundingRequest_dealId_idx" ON "FundingRequest"("dealId");

-- CreateIndex
CREATE INDEX "FundingRequest_status_idx" ON "FundingRequest"("status");
