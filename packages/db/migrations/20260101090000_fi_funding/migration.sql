DO $$
DECLARE
  camel_case_exists BOOLEAN;
  snake_case_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'FundingRequest'
  ) INTO camel_case_exists;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
  ) INTO snake_case_exists;

  IF camel_case_exists AND NOT snake_case_exists THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'dealId'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "dealId" TO deal_id';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'tenantId'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "tenantId" TO tenant_id';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'lenderId'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "lenderId" TO lender_id';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'amountRequested'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "amountRequested" TO amount_requested';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'fundingMethod'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "fundingMethod" TO funding_method';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'bankAccountId'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "bankAccountId" TO bank_account_id';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'submittedAt'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "submittedAt" TO submitted_at';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'reviewedAt'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "reviewedAt" TO reviewed_at';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'approvedAt'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "approvedAt" TO approved_at';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'fundedAt'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "fundedAt" TO funded_at';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'fundedAmount'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "fundedAmount" TO funded_amount';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'lenderRefNumber'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "lenderRefNumber" TO lender_ref_number';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'journalEntryId'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "journalEntryId" TO journal_entry_id';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'createdBy'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "createdBy" TO created_by';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'createdAt'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "createdAt" TO created_at';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'FundingRequest'
        AND column_name = 'updatedAt'
    ) THEN
      EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "updatedAt" TO updated_at';
    END IF;

    EXECUTE 'ALTER TABLE "FundingRequest" RENAME TO funding_requests';
    snake_case_exists := TRUE;
  ELSIF camel_case_exists AND snake_case_exists THEN
    RAISE EXCEPTION 'Both "FundingRequest" and "funding_requests" tables exist. Please consolidate the data before running migrati
on 20260101090000_fi_funding.';
  END IF;

  IF NOT snake_case_exists THEN
    RAISE EXCEPTION 'Expected table "funding_requests" (or legacy "FundingRequest") to exist before running migration 202601010900
00_fi_funding. Please ensure all earlier migrations have been applied.';
  END IF;
END;
$$;

ALTER TABLE funding_requests ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE funding_requests ALTER COLUMN timeline SET DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
      AND column_name = 'submitted_at'
      AND data_type <> 'timestamp with time zone'
  ) THEN
    EXECUTE 'ALTER TABLE funding_requests ALTER COLUMN submitted_at TYPE TIMESTAMPTZ(6) USING submitted_at AT TIME ZONE ''UTC''';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
      AND column_name = 'reviewed_at'
      AND data_type <> 'timestamp with time zone'
  ) THEN
    EXECUTE 'ALTER TABLE funding_requests ALTER COLUMN reviewed_at TYPE TIMESTAMPTZ(6) USING reviewed_at AT TIME ZONE ''UTC''';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
      AND column_name = 'approved_at'
      AND data_type <> 'timestamp with time zone'
  ) THEN
    EXECUTE 'ALTER TABLE funding_requests ALTER COLUMN approved_at TYPE TIMESTAMPTZ(6) USING approved_at AT TIME ZONE ''UTC''';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
      AND column_name = 'funded_at'
      AND data_type <> 'timestamp with time zone'
  ) THEN
    EXECUTE 'ALTER TABLE funding_requests ALTER COLUMN funded_at TYPE TIMESTAMPTZ(6) USING funded_at AT TIME ZONE ''UTC''';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
      AND column_name = 'created_at'
      AND data_type <> 'timestamp with time zone'
  ) THEN
    EXECUTE 'ALTER TABLE funding_requests ALTER COLUMN created_at TYPE TIMESTAMPTZ(6) USING created_at AT TIME ZONE ''UTC''';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'funding_requests'
      AND column_name = 'updated_at'
      AND data_type <> 'timestamp with time zone'
  ) THEN
    EXECUTE 'ALTER TABLE funding_requests ALTER COLUMN updated_at TYPE TIMESTAMPTZ(6) USING updated_at AT TIME ZONE ''UTC''';
  END IF;
END;
$$;

ALTER TABLE funding_requests ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE funding_requests ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "FundingRequest_dealId_key";
DROP INDEX IF EXISTS "FundingRequest_tenantId_idx";
DROP INDEX IF EXISTS "FundingRequest_dealId_idx";
DROP INDEX IF EXISTS "FundingRequest_status_idx";
DROP INDEX IF EXISTS funding_requests_deal_id_key;
DROP INDEX IF EXISTS funding_requests_tenant_id_idx;
DROP INDEX IF EXISTS funding_requests_deal_id_idx;
DROP INDEX IF EXISTS funding_requests_status_idx;

ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS "FundingRequest_dealId_fkey";
ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS "FundingRequest_tenantId_fkey";
ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS "FundingRequest_journalEntryId_fkey";
ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS funding_requests_deal_id_fkey;
ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS funding_requests_tenant_id_fkey;
ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS funding_requests_journal_entry_id_fkey;

DO $$
DECLARE
  deal_table regclass;
  tenant_table regclass;
  journal_table regclass;
BEGIN
  SELECT COALESCE(to_regclass('deal_jackets'), to_regclass('"DealJacket"')) INTO deal_table;
  IF deal_table IS NULL THEN
    RAISE EXCEPTION 'Unable to locate deal jackets table required for funding_requests foreign key.';
  END IF;

  SELECT COALESCE(to_regclass('tenants'), to_regclass('"Tenant"')) INTO tenant_table;
  IF tenant_table IS NULL THEN
    RAISE EXCEPTION 'Unable to locate tenants table required for funding_requests foreign key.';
  END IF;

  SELECT COALESCE(to_regclass('journal_entries'), to_regclass('"JournalEntry"')) INTO journal_table;
  IF journal_table IS NULL THEN
    RAISE EXCEPTION 'Unable to locate journal entries table required for funding_requests foreign key.';
  END IF;

  EXECUTE format(
    'ALTER TABLE funding_requests ADD CONSTRAINT funding_requests_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES %s(id) ON DELETE CASCADE ON UPDATE CASCADE',
    deal_table::text
  );

  EXECUTE format(
    'ALTER TABLE funding_requests ADD CONSTRAINT funding_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES %s(id) ON DELETE CASCADE ON UPDATE CASCADE',
    tenant_table::text
  );

  EXECUTE format(
    'ALTER TABLE funding_requests ADD CONSTRAINT funding_requests_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES %s(id) ON DELETE SET NULL ON UPDATE CASCADE',
    journal_table::text
  );
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS funding_requests_deal_id_key ON funding_requests(deal_id);
CREATE INDEX IF NOT EXISTS funding_requests_tenant_id_idx ON funding_requests(tenant_id);
CREATE INDEX IF NOT EXISTS funding_requests_deal_id_idx ON funding_requests(deal_id);
CREATE INDEX IF NOT EXISTS funding_requests_status_idx ON funding_requests(status);
