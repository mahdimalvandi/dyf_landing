CREATE TABLE IF NOT EXISTS "accessLinks" (
    "ID" BIGINT PRIMARY KEY,
    "linkID" BIGSERIAL UNIQUE,
    "token" VARCHAR(64) NOT NULL UNIQUE,
    "customerID" BIGINT NOT NULL DEFAULT 0,
    "recipientName" VARCHAR(200) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL DEFAULT '',
    "authMethod" VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    "shoeIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "viewingDurationMinutes" INT NOT NULL DEFAULT 0,
    "expiresAt" BIGINT NOT NULL DEFAULT 0,
    "firstViewedAt" BIGINT NOT NULL DEFAULT 0,
    "viewingExpiresAt" BIGINT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX IF NOT EXISTS "idx_accessLinks_token" ON "accessLinks" ("token");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_linkID" ON "accessLinks" ("linkID");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_customerID" ON "accessLinks" ("customerID");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_status" ON "accessLinks" ("status");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_isActive" ON "accessLinks" ("isActive");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_shoeIDs" ON "accessLinks" USING GIN ("shoeIDs");
