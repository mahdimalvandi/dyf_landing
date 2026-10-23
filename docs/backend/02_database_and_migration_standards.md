# سند استانداردهای پایگاه‌داده و سیستم مایگریشن (Database & Migrations)
**نسخه سند:** ۲.۱  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان، مهندسان DevOps و ایجنت‌های هوش مصنوعی (AI Agents)

---

## ۱. پایگاه‌داده PostgreSQL و استانداردهای طراحی Schema

کلیه ساختارهای پایگاه داده و ستون‌ها باید دقیقاً مطابق با این قواعد تعریف شوند:

### ۱.۱. قاعده شناسه `"ID"` و نوع داده `BIGINT`
- **قاعده قطعی:** نام فیلد شناسه رکوردها در دیتابیس دقیقاً `"ID"` (با حروف بزرگ و درون دابل‌کوتیشن) است.
- نوع داده این ستون در PostgreSQL معادل **`BIGINT PRIMARY KEY`** است.
- در لایه کدهای Go، این فیلد برابر با **`ID int64`** است که با `time.Now().UnixNano()` تولید می‌شود.
- **حذف فیلد `createdAt`:** به دلیل این‌که زمان ساخت از روی ارقام نانوثانیه فیلد `"ID"` قابل استخراج است، هیچ ستونی با نام `createdAt` نباید در جداول ساخته شود.

### ۱.۲. نگهداری زمان‌ها با نوع `BIGINT` (Unix Timestamps)
- هیچ ستونی از نوع `TIMESTAMP` یا `TIMESTAMPTZ` استفاده نمی‌شود.
- تمامی فیلدهای زمانی (نظیر `"expiresAt"`, `"startedAt"`) از نوع **`BIGINT`** (یونیکس تایم‌استمپ برحسب ثانیه) هستند.
- **حذف فیلد `updatedAt`:** در هیچ جدولی فیلد `"updatedAt"` اضافه نمی‌شود مگر اینکه کاربر در مشخصات یک تسک صریحاً وجود آن را درخواست کرده باشد.

### ۱.۳. نام‌گذاری دقیق camelCase با دابل‌کوتیشن (`"`)
- از آنجا که PostgreSQL شناسه‌های فاقد کوتیشن را به حروف کوچک تبدیل می‌کند، در کلیه فایل‌های SQL نام تمامی جداول و ستون‌ها با دابل‌کوتیشن درج می‌شوند:
  - جدول‌ها: `"shoeModels"`, `"categories"`, `"customers"`, `"accessLinks"`, `"adminUsers"`, `"adminTokens"`, `"catalogTokens"`, `"schemaMigrations"`
  - ستون‌ها: `"ID"`, `"shoeTitle"`, `"primaryImageURL"`, `"categoryIDs"`, `"tokenHash"`

### ۱.۴. قاعده ایندکس‌گذاری (Indexing Policy)
- **قاعده قطعی:** برای جداول کم‌حجم یا موقت (مانند `"adminUsers"` با نهایتاً ۳ الی ۴ رکورد، یا `"otpVerifications"`) **هیچ ایندکس اضافه‌ای ساخته نمی‌شود** تا سربار بیهوده ایجاد نگردد.
- ساخت ایندکس تنها برای جداول پرحجم و صرفاً در صورت اعلام صریح کاربر انجام می‌شود.

---

## ۲. سیستم مایگریشن با کتابخانه استاندارد `golang-migrate`

مدیریت ساختار پایگاه داده و نسخه‌بندی آن با ابزار استاندارد Go یعنی **`golang-migrate/migrate/v4`** انجام می‌شود و از نوشتن اسکریپت‌های دستی خودداری شده است.

### ۲.۱. ساختار فایل‌های مایگریشن در پوشه `backend/migrations/`
- **قانون قطعی (یک جدول به ازای هر مایگریشن):** به ازای هر جدول دیتابیس، دقیقاً **یک فایل مایگریشن** مجزا (`.up.sql` و `.down.sql`) ایجاد می‌شود. به هیچ عنوان چند جدول نباید در یک فایل مایگریشن تجمیع شوند.
- **عدم ساخت مایگریشن دستی برای `schemaMigrations`:** جدول رهگیری نسخه‌ها به صورت خودکار توسط کتابخانه `golang-migrate` مدیریت و ساخته می‌شود و نسخه `000001` به اولین جدول بیزینسی پروژه اختصاص دارد.
فایل‌ها با شماره‌گذاری عددی ۶ رقمی و دو فایل رو به جلو (`.up.sql`) و بازگشت (`.down.sql`) ایجاد می‌شوند:
```text
backend/migrations/
├── 000001_create_admin_users.up.sql
├── 000001_create_admin_users.down.sql
├── 000002_create_otp_verifications.up.sql
├── 000002_create_otp_verifications.down.sql
└── ...
```

### ۲.۲. دستورات اجرایی CLI مایگریشن (`cmd/migrate/main.go`)

کلیه عملیات مایگریشن از طریق ترمینال در دایرکتوری `backend` قابل اجرا هستند:

```bash
cd backend

# ۱. اجرای کلیه مایگریشن‌های اعمال‌نشده (Up)
go run cmd/migrate/main.go up

# ۲. رول‌بک و بازگردانی آخرین نسخه مایگریشن (Down)
go run cmd/migrate/main.go down

# ۳. بررسی وضعیت و نسخه فعلی دیتابیس (Version)
go run cmd/migrate/main.go version
```

---

## ۳. طرح تفصیلی جداول دیتابیس (SQL Schema Blueprint)

### ۳.۱. جدول دسته‌بندی‌ها / لاین‌های محصول (`"categories"`)
```sql
CREATE TABLE IF NOT EXISTS "categories" (
    "ID" BIGINT PRIMARY KEY,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL UNIQUE,
    "description" TEXT,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories" ("slug");
CREATE INDEX IF NOT EXISTS "idx_categories_sortOrder" ON "categories" ("sortOrder");
```

### ۳.۲. جدول مدل‌های کفش (`"shoeModels"`)
```sql
CREATE TABLE IF NOT EXISTS "shoeModels" (
    "ID" BIGINT PRIMARY KEY,
    "shoeTitle" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "primaryImageURL" TEXT NOT NULL,
    "colors" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sizes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "images" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "videos" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "categoryIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_shoeModels_shoeTitle" ON "shoeModels" ("shoeTitle");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_categoryIDs" ON "shoeModels" USING GIN ("categoryIDs");
```

### ۳.۳. جدول مشتریان و همکاران تجاری (`"customers"`)
```sql
CREATE TABLE IF NOT EXISTS "customers" (
    "ID" BIGINT PRIMARY KEY,
    "firstNameFa" VARCHAR(100) NOT NULL,
    "lastNameFa" VARCHAR(100) NOT NULL,
    "firstNameEn" VARCHAR(100),
    "lastNameEn" VARCHAR(100),
    "storeName" VARCHAR(200),
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_customers_phoneNumber" ON "customers" ("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_customers_isActive" ON "customers" ("isActive");
```

### ۳.۴. جدول مجوز دسترسی مستقیم مشتری (`"customerDirectPermissions"`)
```sql
CREATE TABLE IF NOT EXISTS "customerDirectPermissions" (
    "ID" BIGINT PRIMARY KEY,
    "customerID" BIGINT NOT NULL UNIQUE REFERENCES "customers" ("ID") ON DELETE CASCADE,
    "allowedCategoryIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "allowedShoeIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "excludedShoeIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "durationMinutes" INT NOT NULL DEFAULT 0,
    "expiresAt" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "startedAt" BIGINT,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_cdp_customerID" ON "customerDirectPermissions" ("customerID");
CREATE INDEX IF NOT EXISTS "idx_cdp_isActive" ON "customerDirectPermissions" ("isActive");
```

### ۳.۵. جدول لینک‌های دسترسی اختصاصی (`"accessLinks"`)
```sql
CREATE TABLE IF NOT EXISTS "accessLinks" (
    "ID" BIGINT PRIMARY KEY,
    "token" VARCHAR(128) NOT NULL UNIQUE,
    "title" VARCHAR(255),
    "recipientNameFa" VARCHAR(100) NOT NULL,
    "recipientLastNameFa" VARCHAR(100) NOT NULL,
    "recipientNameEn" VARCHAR(100),
    "recipientLastNameEn" VARCHAR(100),
    "customerID" BIGINT REFERENCES "customers" ("ID") ON DELETE SET NULL,
    "authType" VARCHAR(20) NOT NULL DEFAULT 'DIRECT', -- 'DIRECT' or 'PHONE_OTP'
    "requiredPhoneNumber" VARCHAR(20),
    "allowedCategoryIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "allowedShoeIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "excludedShoeIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "durationMinutes" INT NOT NULL DEFAULT 0,
    "expiresAt" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "cycleNumber" INT NOT NULL DEFAULT 1,
    "startedAt" BIGINT,
    "lastAccessedAt" BIGINT,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_accessLinks_token" ON "accessLinks" ("token");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_authType" ON "accessLinks" ("authType");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_isActive" ON "accessLinks" ("isActive");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_customerID" ON "accessLinks" ("customerID");
```

### ۳.۶. جدول مدیران پنل (`"admins"`)
```sql
CREATE TABLE IF NOT EXISTS "admins" (
    "ID" BIGINT PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_admins_phoneNumber" ON "admins" ("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_admins_isActive" ON "admins" ("isActive");
```

### ۳.۷. جدول توکن‌های دسترسی مدیران (`"adminTokens"`)
```sql
CREATE TABLE IF NOT EXISTS "adminTokens" (
    "ID" BIGINT PRIMARY KEY,
    "adminID" BIGINT NOT NULL REFERENCES "admins" ("ID") ON DELETE CASCADE,
    "tokenHash" VARCHAR(32) NOT NULL UNIQUE, -- هش MD5 توکن احراز هویت
    "expiresAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_adminTokens_tokenHash" ON "adminTokens" ("tokenHash");
CREATE INDEX IF NOT EXISTS "idx_adminTokens_expiresAt" ON "adminTokens" ("expiresAt");
```

### ۳.۸. جدول کدهای یک‌بارمصرف پیامکی (`"otpVerifications"`)
```sql
CREATE TABLE IF NOT EXISTS "otpVerifications" (
    "ID" BIGINT PRIMARY KEY,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "attempts" INT NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT FALSE,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_otp_phone_purpose" ON "otpVerifications" ("phoneNumber", "purpose");
CREATE INDEX IF NOT EXISTS "idx_otp_expiresAt" ON "otpVerifications" ("expiresAt");
```

### ۳.۹. جدول توکن‌های نشست کاتالوگ (`"catalogTokens"`)
```sql
CREATE TABLE IF NOT EXISTS "catalogTokens" (
    "ID" BIGINT PRIMARY KEY,
    "tokenHash" VARCHAR(32) NOT NULL UNIQUE, -- هش MD5 توکن نشست کاتالوگ
    "accessType" VARCHAR(20) NOT NULL, -- 'DIRECT_CUSTOMER' or 'LINK'
    "accessLinkID" BIGINT REFERENCES "accessLinks" ("ID") ON DELETE CASCADE,
    "customerID" BIGINT REFERENCES "customers" ("ID") ON DELETE CASCADE,
    "cycleNumber" INT NOT NULL DEFAULT 1,
    "clientIP" VARCHAR(45),
    "startedAt" BIGINT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_catalogTokens_tokenHash" ON "catalogTokens" ("tokenHash");
CREATE INDEX IF NOT EXISTS "idx_catalogTokens_linkID" ON "catalogTokens" ("accessLinkID");
CREATE INDEX IF NOT EXISTS "idx_catalogTokens_expiresAt" ON "catalogTokens" ("expiresAt");
```
