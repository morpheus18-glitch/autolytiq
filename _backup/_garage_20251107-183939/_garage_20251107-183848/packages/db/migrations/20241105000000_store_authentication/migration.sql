CREATE TABLE IF NOT EXISTS "stores" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  "address" TEXT,
  "phone" VARCHAR(50),
  "email" VARCHAR(255),
  "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
  "settings" JSONB,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "stores_code_key" ON "stores"("code");
CREATE INDEX IF NOT EXISTS "stores_tenant_idx" ON "stores"("tenant_id");
CREATE INDEX IF NOT EXISTS "stores_code_idx" ON "stores"("code");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='store_id') THEN
    ALTER TABLE "users" ADD COLUMN "store_id" UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='feature_flags') THEN
    ALTER TABLE "users" ADD COLUMN "feature_flags" TEXT[] NOT NULL DEFAULT ARRAY[]::text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='access_overrides') THEN
    ALTER TABLE "users" ADD COLUMN "access_overrides" JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='users_store_id_fkey') THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" VARCHAR(256) NOT NULL,
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "user_id" VARCHAR NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_idx" ON "password_reset_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_store_idx" ON "password_reset_tokens"("store_id");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_tenant_idx" ON "password_reset_tokens"("tenant_id");
