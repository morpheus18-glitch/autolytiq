DO $$
DECLARE
    tenant_exists BOOLEAN := to_regclass('public."Tenant"') IS NOT NULL;
BEGIN
    -- If the baseline schema has not been applied yet, skip this migration.
    IF NOT tenant_exists THEN
        RAISE NOTICE 'Skipping migration 1760804502_fi_lenders_submissions because baseline tables are absent.';
        RETURN;
    END IF;

    -- Create Lender master table when upgrading an existing installation.
    IF to_regclass('public."Lender"') IS NULL THEN
        EXECUTE $SQL$
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
            )
        $SQL$;

        EXECUTE $SQL$ CREATE INDEX "Lender_tenantId_idx" ON "Lender"("tenantId") $SQL$;

        EXECUTE $SQL$
            ALTER TABLE "Lender"
                ADD CONSTRAINT "Lender_tenantId_fkey"
                FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
                ON DELETE CASCADE ON UPDATE CASCADE
        $SQL$;
    END IF;

    -- Extend lender submissions with decision tracking when the legacy table exists.
    IF to_regclass('public."LenderSubmission"') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'LenderSubmission'
              AND column_name = 'submittedBy'
        ) THEN
            EXECUTE format($SQL$
                ALTER TABLE "LenderSubmission"
                    ADD COLUMN "submittedBy" TEXT NOT NULL DEFAULT %L,
                    ADD COLUMN "requestPayload" JSONB NOT NULL DEFAULT %L::jsonb,
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
                    ADD COLUMN "expiresAt" TIMESTAMP(3)
            $SQL$, 'system', '{}');
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'LenderSubmission'
              AND column_name = 'response'
        ) THEN
            EXECUTE $SQL$ UPDATE "LenderSubmission" SET "responsePayload" = "response" $SQL$;
            EXECUTE $SQL$ ALTER TABLE "LenderSubmission" DROP COLUMN "response" $SQL$;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'LenderSubmission'
              AND column_name = 'submittedAt'
        ) THEN
            EXECUTE $SQL$ UPDATE "LenderSubmission" SET "submittedAt" = COALESCE("submittedAt", NOW()) $SQL$;
            EXECUTE $SQL$ ALTER TABLE "LenderSubmission" ALTER COLUMN "submittedAt" SET NOT NULL $SQL$;
            EXECUTE $SQL$ ALTER TABLE "LenderSubmission" ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP $SQL$;
        END IF;

        EXECUTE $SQL$ ALTER TABLE "LenderSubmission" DROP COLUMN IF EXISTS "createdAt" $SQL$;
        EXECUTE $SQL$ ALTER TABLE "LenderSubmission" DROP COLUMN IF EXISTS "updatedAt" $SQL$;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'LenderSubmission'
              AND column_name = 'submittedBy'
        ) THEN
            EXECUTE $SQL$ ALTER TABLE "LenderSubmission" ALTER COLUMN "submittedBy" DROP DEFAULT $SQL$;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'LenderSubmission'
              AND column_name = 'requestPayload'
        ) THEN
            EXECUTE $SQL$ ALTER TABLE "LenderSubmission" ALTER COLUMN "requestPayload" DROP DEFAULT $SQL$;
        END IF;

        EXECUTE $SQL$ CREATE INDEX IF NOT EXISTS "LenderSubmission_status_idx" ON "LenderSubmission"("status") $SQL$;
    END IF;

    -- Link deal jackets to lenders when both tables are present.
    IF to_regclass('public."DealJacket"') IS NOT NULL
       AND to_regclass('public."Lender"') IS NOT NULL
       AND NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = 'public'
              AND table_name = 'DealJacket'
              AND constraint_name = 'DealJacket_lenderId_fkey'
        ) THEN
        EXECUTE $SQL$
            ALTER TABLE "DealJacket"
                ADD CONSTRAINT "DealJacket_lenderId_fkey"
                FOREIGN KEY ("lenderId") REFERENCES "Lender"("id")
                ON DELETE SET NULL ON UPDATE CASCADE
        $SQL$;
    END IF;
END;
$$;
