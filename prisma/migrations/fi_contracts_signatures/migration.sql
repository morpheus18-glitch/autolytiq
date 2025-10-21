CREATE TABLE IF NOT EXISTS "Contract" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "dealId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT,
    "pdfUrl" TEXT,
    "docusignEnvelopeId" TEXT,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMPTZ,
    "viewedAt" TIMESTAMPTZ,
    "signedAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "signers" JSONB NOT NULL,
    "contractData" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Contract_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Contract_tenantId_idx" ON "Contract" ("tenantId");
CREATE INDEX IF NOT EXISTS "Contract_dealId_idx" ON "Contract" ("dealId");
CREATE INDEX IF NOT EXISTS "Contract_status_idx" ON "Contract" ("status");

CREATE TABLE IF NOT EXISTS "Signature" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractId" UUID NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signerRole" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Signature_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Signature_contractId_idx" ON "Signature" ("contractId");

