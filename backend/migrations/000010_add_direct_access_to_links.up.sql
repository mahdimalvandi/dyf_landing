ALTER TABLE "accessLinks" ADD COLUMN IF NOT EXISTS "isDirectAccess" BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX "idx_accessLinks_customer_direct" ON "accessLinks" ("customerID") WHERE "isDirectAccess" = TRUE;
