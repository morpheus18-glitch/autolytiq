-- CreateTable
CREATE TABLE "ComplianceChecklist" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "federalItems" JSONB NOT NULL,
    "stateItems" JSONB NOT NULL,
    "lenderItems" JSONB NOT NULL,
    "internalItems" JSONB NOT NULL,
    "completedItems" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "percentComplete" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceChecklist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ComplianceChecklist_dealId_key" UNIQUE ("dealId")
);

-- AddForeignKey
ALTER TABLE "ComplianceChecklist"
ADD CONSTRAINT "ComplianceChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist"
ADD CONSTRAINT "ComplianceChecklist_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ComplianceChecklist_tenantId_idx" ON "ComplianceChecklist"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceChecklist_dealId_idx" ON "ComplianceChecklist"("dealId");
