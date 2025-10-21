-- Ensure the FundingRequest table schema matches the latest expectations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'FundingRequest'
  ) THEN
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

    CREATE UNIQUE INDEX IF NOT EXISTS "FundingRequest_dealId_key" ON "FundingRequest"("dealId");
    CREATE INDEX IF NOT EXISTS "FundingRequest_tenantId_idx" ON "FundingRequest"("tenantId");
    CREATE INDEX IF NOT EXISTS "FundingRequest_dealId_idx" ON "FundingRequest"("dealId");
    CREATE INDEX IF NOT EXISTS "FundingRequest_status_idx" ON "FundingRequest"("status");

    ALTER TABLE "FundingRequest"
      ADD CONSTRAINT "FundingRequest_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE "FundingRequest"
      ADD CONSTRAINT "FundingRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE "FundingRequest"
      ADD CONSTRAINT "FundingRequest_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ELSE
    ALTER TABLE "FundingRequest" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
    ALTER TABLE "FundingRequest" ALTER COLUMN "timeline" SET DEFAULT '[]'::jsonb;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'submittedAt'
        AND data_type <> 'timestamp with time zone'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" ALTER COLUMN "submittedAt" TYPE TIMESTAMPTZ(6) USING "submittedAt" AT TIME ZONE ''UTC''';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'reviewedAt'
        AND data_type <> 'timestamp with time zone'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" ALTER COLUMN "reviewedAt" TYPE TIMESTAMPTZ(6) USING "reviewedAt" AT TIME ZONE ''UTC''';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'approvedAt'
        AND data_type <> 'timestamp with time zone'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" ALTER COLUMN "approvedAt" TYPE TIMESTAMPTZ(6) USING "approvedAt" AT TIME ZONE ''UTC''';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'fundedAt'
        AND data_type <> 'timestamp with time zone'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" ALTER COLUMN "fundedAt" TYPE TIMESTAMPTZ(6) USING "fundedAt" AT TIME ZONE ''UTC''';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'createdAt'
        AND data_type <> 'timestamp with time zone'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6) USING "createdAt" AT TIME ZONE ''UTC''';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'updatedAt'
        AND data_type <> 'timestamp with time zone'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6) USING "updatedAt" AT TIME ZONE ''UTC''';
    END IF;

    ALTER TABLE "FundingRequest" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "FundingRequest" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'FundingRequest_tenantId_fkey'
    ) THEN
      ALTER TABLE "FundingRequest"
        ADD CONSTRAINT "FundingRequest_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'FundingRequest_journalEntryId_fkey'
    ) THEN
      ALTER TABLE "FundingRequest"
        ADD CONSTRAINT "FundingRequest_journalEntryId_fkey"
        FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    CREATE UNIQUE INDEX IF NOT EXISTS "FundingRequest_dealId_key" ON "FundingRequest"("dealId");
    CREATE INDEX IF NOT EXISTS "FundingRequest_tenantId_idx" ON "FundingRequest"("tenantId");
    CREATE INDEX IF NOT EXISTS "FundingRequest_dealId_idx" ON "FundingRequest"("dealId");
    CREATE INDEX IF NOT EXISTS "FundingRequest_status_idx" ON "FundingRequest"("status");
  END IF;
END;
$$;
