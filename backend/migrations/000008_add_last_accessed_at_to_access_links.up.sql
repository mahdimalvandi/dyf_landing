ALTER TABLE "accessLinks" ADD COLUMN IF NOT EXISTS "lastAccessedAt" BIGINT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "idx_accessLinks_lastAccessedAt" ON "accessLinks" ("lastAccessedAt");
