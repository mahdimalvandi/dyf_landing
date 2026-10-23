CREATE TABLE IF NOT EXISTS "customers" (
    "ID" BIGINT PRIMARY KEY,
    "firstNameFa" VARCHAR(100) NOT NULL,
    "lastNameFa" VARCHAR(100) NOT NULL,
    "firstNameEn" VARCHAR(100) NOT NULL DEFAULT '',
    "lastNameEn" VARCHAR(100) NOT NULL DEFAULT '',
    "storeName" VARCHAR(200) NOT NULL DEFAULT '',
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "idx_customers_phoneNumber" ON "customers" ("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_customers_isActive" ON "customers" ("isActive");
