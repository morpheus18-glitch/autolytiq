-- CreateTable
CREATE TABLE IF NOT EXISTS "FIProduct" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverageDetails" JSONB NOT NULL,
    "cost" DECIMAL(18,2) NOT NULL,
    "retailPrice" DECIMAL(18,2) NOT NULL,
    "markup" DECIMAL(18,2) NOT NULL,
    "term" INTEGER,
    "termType" TEXT,
    "deductible" DECIMAL(18,2),
    "minVehicleAge" INTEGER,
    "maxVehicleAge" INTEGER,
    "minMileage" INTEGER,
    "maxMileage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FIProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MenuConfiguration" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "selectedOption" TEXT,
    "selectedAt" TIMESTAMPTZ(6),
    "selectedProducts" JSONB,
    "totalProductCost" DECIMAL(18,2),
    "totalMarkup" DECIMAL(18,2),
    "paymentImpact" DECIMAL(18,2),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuConfiguration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MenuConfiguration_dealId_key" UNIQUE ("dealId")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FIProduct_tenantId_fkey'
          AND table_name = 'FIProduct'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE "FIProduct"
        ADD CONSTRAINT "FIProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'MenuConfiguration_tenantId_fkey'
          AND table_name = 'MenuConfiguration'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE "MenuConfiguration"
        ADD CONSTRAINT "MenuConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'MenuConfiguration_dealId_fkey'
          AND table_name = 'MenuConfiguration'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE "MenuConfiguration"
        ADD CONSTRAINT "MenuConfiguration_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FIProduct_tenantId_idx" ON "FIProduct"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FIProduct_category_idx" ON "FIProduct"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MenuConfiguration_tenantId_idx" ON "MenuConfiguration"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MenuConfiguration_dealId_idx" ON "MenuConfiguration"("dealId");
