CREATE TABLE IF NOT EXISTS "shoeModels" (
    "ID" BIGINT PRIMARY KEY,
    "modelID" BIGSERIAL UNIQUE,
    "shoeTitle" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "colors" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sizes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "images" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "videos" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "categoryIDs" JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS "idx_shoeModels_modelID" ON "shoeModels" ("modelID");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_shoeTitle" ON "shoeModels" ("shoeTitle");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_categoryIDs" ON "shoeModels" USING GIN ("categoryIDs");
