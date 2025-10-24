-- Drop legacy GIN indexes that referenced the tsvector columns
DROP INDEX IF EXISTS "Customer_search_idx";
DROP INDEX IF EXISTS "Vehicle_search_idx";

-- Recreate the search_vector columns as nullable TEXT fields so application logic can manage them
ALTER TABLE "Customer" DROP COLUMN "search_vector";
ALTER TABLE "Customer" ADD COLUMN "search_vector" TEXT;

ALTER TABLE "Vehicle" DROP COLUMN "search_vector";
ALTER TABLE "Vehicle" ADD COLUMN "search_vector" TEXT;

-- Replace the old single-column GIN indexes with composite btree indexes that align with the new Prisma schema
CREATE INDEX "Customer_tenantId_search_vector_idx" ON "Customer"("tenantId", "search_vector");
CREATE INDEX "Vehicle_tenantId_search_vector_idx" ON "Vehicle"("tenantId", "search_vector");
