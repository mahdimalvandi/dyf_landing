-- 000001_create_schema_migrations.up.sql
CREATE TABLE IF NOT EXISTS "schemaMigrations" (
    "id" SERIAL PRIMARY KEY,
    "version" INT NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
