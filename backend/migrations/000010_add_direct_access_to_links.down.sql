DROP INDEX IF EXISTS "idx_accessLinks_customer_direct";
ALTER TABLE "accessLinks" DROP COLUMN IF EXISTS "isDirectAccess";
