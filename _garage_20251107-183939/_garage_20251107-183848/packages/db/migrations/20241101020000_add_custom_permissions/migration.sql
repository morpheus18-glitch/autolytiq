-- CreateTable
CREATE TABLE IF NOT EXISTS "permission_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "permission_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "role_presets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT jsonb_build_array(),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "role_presets_pkey" PRIMARY KEY ("id")
);

-- Add new columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role_preset_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_permissions" JSONB DEFAULT jsonb_build_array();

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "permission_definitions_code_key" ON "permission_definitions"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "permission_definitions_category_idx" ON "permission_definitions"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "role_presets_tenant_id_name_key" ON "role_presets"("tenant_id", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "role_presets_tenant_id_idx" ON "role_presets"("tenant_id");

-- AddForeignKey
ALTER TABLE "role_presets" ADD CONSTRAINT "role_presets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
