-- Domain events integration - credit submission drafts
CREATE TABLE "CreditSubmissionDraft" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "worksheetId" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "CreditSubmissionDraft_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CreditSubmissionDraft_deal_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE,
  CONSTRAINT "CreditSubmissionDraft_worksheet_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE CASCADE,
  CONSTRAINT "CreditSubmissionDraft_version_fkey" FOREIGN KEY ("versionId") REFERENCES "DealVersion"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "CreditSubmissionDraft_tenant_version_unique"
  ON "CreditSubmissionDraft" ("tenantId", "versionId");

CREATE INDEX "CreditSubmissionDraft_tenant_deal_idx"
  ON "CreditSubmissionDraft" ("tenantId", "dealId");
