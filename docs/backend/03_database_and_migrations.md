# پایگاه‌داده و سیستم مایگریشن اختصاصی (Database & Migration System)
**نسخه سند:** ۱.۰  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان، مهندسان DevOps و ایجنت‌های هوش مصنوعی

---

## ۱. پایگاه داده و استراتژی نام‌گذاری camelCase در PostgreSQL

طبق دستورالعمل پروژه، تمامی نام‌گذاری‌ها در پایگاه داده شامل نام جداول و نام ستون‌ها باید به صورت **camelCase** باشند.

### ۱.۱. رفتار PostgreSQL با شناسه‌های camelCase
در PostgreSQL، اسامی بدون کوتیشن به حروف کوچک تبدیل می‌شوند (`case-insensitive folding`). بنابراین برای حفظ دقیق ساختار **camelCase**، تمامی جداول و ستون‌ها در مایگریشن‌های SQL و کوئری‌های خام درون دابل کوتیشن (`"`) قرار می‌گیرند:

```sql
-- مثال ساخت جدول با ستون‌های camelCase
CREATE TABLE IF NOT EXISTS "shoeModels" (
    "id" SERIAL PRIMARY KEY,
    "shoeTitle" VARCHAR(255) NOT NULL,
    "primaryImageUrl" TEXT NOT NULL,
    "categoryIds" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ۱.۲. پیکربندی GORM برای پشتیبانی از camelCase
در GORM، استراتژی نام‌گذاری پیش‌فرض تبدیل فیلدها به `snake_case` است. برای جلوگیری از این رفتار و تطبیق ۱۰۰٪ با ستون‌های camelCase:

```go
package database

import (
    "gorm.io/gorm"
    "gorm.io/gorm/schema"
)

// استراتژی نام‌گذاری camelCase سفارشی برای GORM
type CamelCaseNamingStrategy struct {
    schema.NamingStrategy
}

func (ns CamelCaseNamingStrategy) TableName(table string) string {
    // تبدیل حرف اول به کوچک: ShoeModel -> shoeModels
    return toLowerCamelCase(table) + "s"
}

func (ns CamelCaseNamingStrategy) ColumnName(table, column string) string {
    // حفظ ساختار camelCase فیلد: ShoeTitle -> shoeTitle
    return toLowerCamelCase(column)
}
```
همچنین در تعریف تگ مدل‌های Go، تگ ستون به صورت صریح قرار می‌گیرد:
`gorm:"column:shoeTitle"`

---

## ۲. معماری سیستم مایگریشن اختصاصی (Custom Migration Runner)

### ۲.۱. نیازمندی و فلسفه طراحی
کاربر نیازمند ابزاری مشخص و مستقل است که با نوشتن فایل‌های SQL در پوشه `migrations/` و اجرای یک فرمان/سرویس، تمامی مایگریشن‌های اجرا‌نشده به ترتیب خوانده و در قالب تراکنش اجرا شوند.

### ۲.۲. ساختار فایل‌های مایگریشن
فایل‌ها در پوشه `migrations/` با شماره‌گذاری ترتیبی و پسوند `.up.sql` و `.down.sql` ذخیره می‌شوند:
```text
migrations/
├── 000001_create_schema_migrations.up.sql
├── 000002_create_admins.up.sql
├── 000002_create_admins.down.sql
├── 000003_create_categories.up.sql
├── 000003_create_categories.down.sql
├── 000004_create_shoe_models.up.sql
├── 000004_create_shoe_models.down.sql
├── 000005_create_customers.up.sql
├── 000005_create_customers.down.sql
├── 000006_create_customer_direct_permissions.up.sql
├── 000006_create_customer_direct_permissions.down.sql
├── 000007_create_access_links.up.sql
├── 000007_create_access_links.down.sql
├── 000008_create_otp_verifications.up.sql
├── 000008_create_otp_verifications.down.sql
└── 000009_create_catalog_sessions.up.sql
    └── 000009_create_catalog_sessions.down.sql
```

### ۲.۳. جدول ردیابی وضعیت مایگریشن‌ها (`schemaMigrations`)
جدولی اختصاصی برای ثبت تاریخچه مایگریشن‌های اعمال‌شده:
```sql
CREATE TABLE IF NOT EXISTS "schemaMigrations" (
    "id" SERIAL PRIMARY KEY,
    "version" INT NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ۲.۴. نحوه کارکرد مایگریتور (`pkg/database/migrator.go` و `cmd/migrate/main.go`)

فرمان اجرایی در ترمینال:
```bash
# اجرای مایگریشن‌های جدید (Up)
go run cmd/migrate/main.go up

# بازگردانی آخرین مایگریشن (Rollback / Down)
go run cmd/migrate/main.go down

# مشاهده وضعیت مایگریشن‌ها
go run cmd/migrate/main.go status
```

**الگوریتم اجرای `up`:**
1. بررسی اتصال به پایگاه‌داده PostgreSQL.
2. بررسی وجود جدول `"schemaMigrations"` (در صورت عدم وجود، ایجاد خودکار آن).
3. استعلام آخرین `version` اعمال‌شده از دیتابیس.
4. اسکن تمامی فایل‌های `*.up.sql` در دایرکتوری `migrations/` و مرتب‌سازی عددی نام فایل‌ها.
5. برای هر فایل که شماره نسخش بزرگتر از آخرین نسخه دیتابیس باشد:
   - باز کردن یک **Database Transaction**.
   - خواندن محتوای فایل SQL و اجرای دستورات درون تراکنش.
   - درج رکورد نسخه در جدول `"schemaMigrations"`.
   - کامیت کردن تراکنش (`COMMIT`).
   - لاگ نتیجه موفقیت‌آمیز در کنسول: `[MIGRATE] Applied 000003_create_categories.up.sql`.
6. در صورت بروز هرگونه خطا در حین اجرا:
   - رول‌بک فوری تراکنش جاری (`ROLLBACK`).
   - چاپ خطای دقیق و متوقف شدن پروسه جهت جلوگیری از ناقص ماندن ساختار دیتابیس.

---

## ۳. طرح تفصیلی جداول دیتابیس (DDL Schema Specifications)

### ۳.۱. جدول مدیران (`admins`)
```sql
CREATE TABLE IF NOT EXISTS "admins" (
    "id" SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_admins_phoneNumber" ON "admins" ("phoneNumber");
```

### ۳.۲. جدول دسته‌بندی‌ها / لاین‌ها (`categories`)
```sql
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL UNIQUE,
    "description" TEXT,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories" ("slug");
```

### ۳.۳. جدول مدل‌های کفش (`shoeModels`)
```sql
CREATE TABLE IF NOT EXISTS "shoeModels" (
    "id" SERIAL PRIMARY KEY,
    "shoeTitle" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "primaryImageUrl" TEXT NOT NULL,
    "colors" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sizes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "images" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "videos" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "categoryIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_shoeModels_shoeTitle" ON "shoeModels" ("shoeTitle");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_categoryIds" ON "shoeModels" USING GIN ("categoryIds");
```

### ۳.۴. جدول مشتریان / همکاران تجاری (`customers`)
```sql
CREATE TABLE IF NOT EXISTS "customers" (
    "id" SERIAL PRIMARY KEY,
    "firstNameFa" VARCHAR(100) NOT NULL,
    "lastNameFa" VARCHAR(100) NOT NULL,
    "firstNameEn" VARCHAR(100),
    "lastNameEn" VARCHAR(100),
    "storeName" VARCHAR(200),
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_customers_phoneNumber" ON "customers" ("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_customers_isActive" ON "customers" ("isActive");
```

### ۳.۵. جدول مجوز دسترسی مستقیم مشتری (`customerDirectPermissions`)
```sql
CREATE TABLE IF NOT EXISTS "customerDirectPermissions" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INT NOT NULL UNIQUE REFERENCES "customers" ("id") ON DELETE CASCADE,
    "allowedCategoryIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "allowedShoeIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "excludedShoeIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "durationMinutes" INT NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "startedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_cdp_customerId" ON "customerDirectPermissions" ("customerId");
```

### ۳.۶. جدول لینک‌های دسترسی اختصاصی (`accessLinks`)
```sql
CREATE TABLE IF NOT EXISTS "accessLinks" (
    "id" SERIAL PRIMARY KEY,
    "token" VARCHAR(128) NOT NULL UNIQUE,
    "title" VARCHAR(255),
    "recipientNameFa" VARCHAR(100) NOT NULL,
    "recipientLastNameFa" VARCHAR(100) NOT NULL,
    "recipientNameEn" VARCHAR(100),
    "recipientLastNameEn" VARCHAR(100),
    "customerId" INT REFERENCES "customers" ("id") ON DELETE SET NULL,
    "authType" VARCHAR(20) NOT NULL DEFAULT 'DIRECT', -- 'DIRECT' or 'PHONE_OTP'
    "requiredPhoneNumber" VARCHAR(20),
    "allowedCategoryIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "allowedShoeIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "excludedShoeIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "durationMinutes" INT NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "cycleNumber" INT NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP WITH TIME ZONE,
    "lastAccessedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_accessLinks_token" ON "accessLinks" ("token");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_authType" ON "accessLinks" ("authType");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_isActive" ON "accessLinks" ("isActive");
```

### ۳.۷. جدول کدهای یک‌بارمصرف پیامکی (`otpVerifications`)
```sql
CREATE TABLE IF NOT EXISTS "otpVerifications" (
    "id" SERIAL PRIMARY KEY,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL, -- 'ADMIN_LOGIN', 'CUSTOMER_LOGIN', 'LINK_VERIFY'
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "attempts" INT NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_otp_phone_purpose" ON "otpVerifications" ("phoneNumber", "purpose");
```

### ۳.۸. جدول سشن‌های فعال کاتالوگ (`catalogSessions`)
```sql
CREATE TABLE IF NOT EXISTS "catalogSessions" (
    "id" VARCHAR(64) PRIMARY KEY, -- Session Token / UUID
    "accessType" VARCHAR(20) NOT NULL, -- 'DIRECT_CUSTOMER' or 'LINK'
    "accessLinkId" INT REFERENCES "accessLinks" ("id") ON DELETE CASCADE,
    "customerId" INT REFERENCES "customers" ("id") ON DELETE CASCADE,
    "cycleNumber" INT NOT NULL DEFAULT 1,
    "clientIp" VARCHAR(45),
    "userAgent" TEXT,
    "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_catalogSessions_link" ON "catalogSessions" ("accessLinkId");
CREATE INDEX IF NOT EXISTS "idx_catalogSessions_expiresAt" ON "catalogSessions" ("expiresAt");
```
