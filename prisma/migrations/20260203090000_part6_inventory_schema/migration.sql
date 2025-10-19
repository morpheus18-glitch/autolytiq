-- CreateEnum
CREATE TYPE "VehicleAcquisitionType" AS ENUM ('TRADE_IN', 'AUCTION', 'PURCHASE', 'FLOOR_PLAN', 'CONSIGNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AppraisalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AppraisalConditionGrade" AS ENUM ('ROUGH', 'AVERAGE', 'CLEAN', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "ReconItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PriceChangeType" AS ENUM ('MANUAL', 'MARKET', 'AI_RECOMMENDATION', 'FLOOR_PLAN');

-- CreateEnum
CREATE TYPE "AuctionPurchaseStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WholesaleListingStatus" AS ENUM ('DRAFT', 'LISTED', 'UNDER_CONTRACT', 'SOLD', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MarketCompSource" AS ENUM ('RETAIL_LISTING', 'WHOLESALE_LISTING', 'AUCTION_RESULT', 'THIRD_PARTY', 'INTERNAL');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "acquisitionCost" DECIMAL(18,2),
ADD COLUMN     "acquisitionDate" TIMESTAMPTZ(6),
ADD COLUMN     "acquisitionSource" TEXT,
ADD COLUMN     "acquisitionType" "VehicleAcquisitionType",
ADD COLUMN     "agingBucket" TEXT,
ADD COLUMN     "aiPrice" DECIMAL(18,2),
ADD COLUMN     "appraisalStatus" "AppraisalStatus",
ADD COLUMN     "floorPrice" DECIMAL(18,2),
ADD COLUMN     "lastAppraisedAt" TIMESTAMPTZ(6),
ADD COLUMN     "marketValue" DECIMAL(18,2),
ADD COLUMN     "nextPriceReviewDate" TIMESTAMPTZ(6),
ADD COLUMN     "pricingNotes" TEXT,
ADD COLUMN     "reconActual" DECIMAL(18,2),
ADD COLUMN     "reconCompletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "reconEstimate" DECIMAL(18,2),
ADD COLUMN     "targetPrice" DECIMAL(18,2),
ADD COLUMN     "wholesaleValue" DECIMAL(18,2);

-- CreateTable
CREATE TABLE "Appraisal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "appraiserId" TEXT NOT NULL,
    "managerId" TEXT,
    "vin" TEXT NOT NULL,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "mileage" INTEGER,
    "conditionGrade" "AppraisalConditionGrade",
    "conditionScore" INTEGER,
    "conditionNotes" TEXT,
    "warningLights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedValue" DECIMAL(18,2),
    "marketValue" DECIMAL(18,2),
    "aiSuggestedValue" DECIMAL(18,2),
    "reconEstimate" JSONB,
    "status" "AppraisalStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMPTZ(6),
    "approvedAt" TIMESTAMPTZ(6),
    "rejectedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "appraisalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "ReconItemStatus" NOT NULL DEFAULT 'PENDING',
    "vendor" TEXT,
    "estimatedCost" DECIMAL(18,2),
    "actualCost" DECIMAL(18,2),
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "beforePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "afterPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReconItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "changedById" TEXT,
    "changeType" "PriceChangeType" NOT NULL DEFAULT 'MANUAL',
    "oldPrice" DECIMAL(18,2),
    "newPrice" DECIMAL(18,2) NOT NULL,
    "adjustment" DECIMAL(18,2),
    "sourceReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionPurchase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "provider" TEXT,
    "auctionName" TEXT NOT NULL,
    "auctionDate" TIMESTAMPTZ(6),
    "lane" TEXT,
    "runNumber" TEXT,
    "status" "AuctionPurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "hammerPrice" DECIMAL(18,2),
    "buyerFees" DECIMAL(18,2),
    "transportCost" DECIMAL(18,2),
    "reconditioningCost" DECIMAL(18,2),
    "totalCost" DECIMAL(18,2),
    "conditionGrade" TEXT,
    "inspectorNotes" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AuctionPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesaleListing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" "WholesaleListingStatus" NOT NULL DEFAULT 'DRAFT',
    "askingPrice" DECIMAL(18,2),
    "reservePrice" DECIMAL(18,2),
    "minimumAcceptable" DECIMAL(18,2),
    "publishedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "soldAt" TIMESTAMPTZ(6),
    "buyerName" TEXT,
    "buyerContact" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WholesaleListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketComp" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "source" "MarketCompSource" NOT NULL DEFAULT 'THIRD_PARTY',
    "compVin" TEXT,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "mileage" INTEGER,
    "price" DECIMAL(18,2),
    "distance" INTEGER,
    "location" TEXT,
    "listedAt" TIMESTAMPTZ(6),
    "payload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MarketComp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_status_idx" ON "Appraisal"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_vehicleId_idx" ON "Appraisal"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_vin_idx" ON "Appraisal"("tenantId", "vin");

-- CreateIndex
CREATE INDEX "ReconItem_tenantId_vehicleId_idx" ON "ReconItem"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "ReconItem_tenantId_status_idx" ON "ReconItem"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PriceHistory_tenantId_vehicleId_idx" ON "PriceHistory"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "PriceHistory_tenantId_createdAt_idx" ON "PriceHistory"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuctionPurchase_tenantId_vehicleId_idx" ON "AuctionPurchase"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "AuctionPurchase_tenantId_status_idx" ON "AuctionPurchase"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionPurchase_vehicleId_key" ON "AuctionPurchase"("vehicleId");

-- CreateIndex
CREATE INDEX "WholesaleListing_tenantId_vehicleId_idx" ON "WholesaleListing"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "WholesaleListing_tenantId_status_idx" ON "WholesaleListing"("tenantId", "status");

-- CreateIndex
CREATE INDEX "MarketComp_tenantId_vehicleId_idx" ON "MarketComp"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "MarketComp_tenantId_source_idx" ON "MarketComp"("tenantId", "source");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_acquisitionType_idx" ON "Vehicle"("tenantId", "acquisitionType");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_appraisalStatus_idx" ON "Vehicle"("tenantId", "appraisalStatus");

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_appraiserId_fkey" FOREIGN KEY ("appraiserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconItem" ADD CONSTRAINT "ReconItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconItem" ADD CONSTRAINT "ReconItem_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconItem" ADD CONSTRAINT "ReconItem_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "Appraisal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionPurchase" ADD CONSTRAINT "AuctionPurchase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionPurchase" ADD CONSTRAINT "AuctionPurchase_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleListing" ADD CONSTRAINT "WholesaleListing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleListing" ADD CONSTRAINT "WholesaleListing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketComp" ADD CONSTRAINT "MarketComp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketComp" ADD CONSTRAINT "MarketComp_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

