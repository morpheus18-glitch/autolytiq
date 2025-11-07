ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_store_id_fkey";
ALTER TABLE "password_reset_tokens" DROP COLUMN IF EXISTS "store_id";
DROP INDEX IF EXISTS "password_reset_tokens_store_idx";
