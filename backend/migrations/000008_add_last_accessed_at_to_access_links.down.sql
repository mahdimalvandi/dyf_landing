DROP INDEX IF EXISTS "idx_accessLinks_lastAccessedAt";
ALTER TABLE "accessLinks" DROP COLUMN IF EXISTS "lastAccessedAt";
