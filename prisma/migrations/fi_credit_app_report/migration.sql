DROP TABLE IF EXISTS "CreditReport";
DROP TABLE IF EXISTS "CreditApplication";

CREATE TABLE "CreditApplication" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "dealId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "middleName" TEXT,
  "lastName" TEXT NOT NULL,
  "ssn" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMPTZ NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "currentStreet" TEXT NOT NULL,
  "currentCity" TEXT NOT NULL,
  "currentState" TEXT NOT NULL,
  "currentZip" TEXT NOT NULL,
  "yearsAtAddress" INTEGER NOT NULL,
  "monthsAtAddress" INTEGER NOT NULL,
  "residenceType" TEXT NOT NULL,
  "monthlyPayment" NUMERIC(18, 2),
  "previousStreet" TEXT,
  "previousCity" TEXT,
  "previousState" TEXT,
  "previousZip" TEXT,
  "employer" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "yearsEmployed" INTEGER NOT NULL,
  "monthsEmployed" INTEGER NOT NULL,
  "monthlyIncome" NUMERIC(18, 2) NOT NULL,
  "employerPhone" TEXT NOT NULL,
  "otherIncomeSource" TEXT,
  "otherIncomeAmount" NUMERIC(18, 2),
  "coApplicant" JSONB,
  "references" JSONB NOT NULL,
  "authorizeCredit" BOOLEAN NOT NULL,
  "certifyAccuracy" BOOLEAN NOT NULL,
  "privacyConsent" BOOLEAN NOT NULL,
  "signature" TEXT,
  "signedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "CreditApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CreditApplication_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "CreditApplication_dealId_key" ON "CreditApplication" ("dealId");
CREATE INDEX "CreditApplication_tenantId_idx" ON "CreditApplication" ("tenantId");
CREATE INDEX "CreditApplication_dealId_idx" ON "CreditApplication" ("dealId");

CREATE TABLE "CreditReport" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "creditApplicationId" TEXT NOT NULL,
  "bureau" TEXT NOT NULL,
  "pullType" TEXT NOT NULL,
  "experianScore" INTEGER,
  "transUnionScore" INTEGER,
  "equifaxScore" INTEGER,
  "mergedScore" INTEGER,
  "scoreRange" TEXT,
  "totalAccounts" INTEGER NOT NULL,
  "openAccounts" INTEGER NOT NULL,
  "totalRevolvingCredit" NUMERIC(18, 2) NOT NULL,
  "totalRevolvingBalance" NUMERIC(18, 2) NOT NULL,
  "utilizationPercent" NUMERIC(5, 2) NOT NULL,
  "totalInstallmentDebt" NUMERIC(18, 2) NOT NULL,
  "monthlyDebtObligations" NUMERIC(18, 2) NOT NULL,
  "onTimePaymentPercent" NUMERIC(5, 2) NOT NULL,
  "late30Days" INTEGER NOT NULL,
  "late60Days" INTEGER NOT NULL,
  "late90PlusDays" INTEGER NOT NULL,
  "collections" INTEGER NOT NULL,
  "chargeOffs" INTEGER NOT NULL,
  "bankruptcies" INTEGER NOT NULL,
  "foreclosures" INTEGER NOT NULL,
  "hardInquiries" INTEGER NOT NULL,
  "softInquiries" INTEGER NOT NULL,
  "tradeLines" JSONB NOT NULL,
  "rawResponse" JSONB NOT NULL,
  "pdfUrl" TEXT,
  "pulledBy" TEXT NOT NULL,
  "pulledAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "CreditReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "CreditReport_creditApplicationId_fkey" FOREIGN KEY ("creditApplicationId") REFERENCES "CreditApplication"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "CreditReport_creditApplicationId_key" ON "CreditReport" ("creditApplicationId");
CREATE INDEX "CreditReport_tenantId_idx" ON "CreditReport" ("tenantId");
CREATE INDEX "CreditReport_creditApplicationId_idx" ON "CreditReport" ("creditApplicationId");
