# سند استانداردهای پایگاه‌داده و سیستم مایگریشن اختصاصی (Database & Migrations)
**نسخه سند:** ۱.۰  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان بک‌اند و ایجنت‌های هوش مصنوعی پیاده‌ساز

---

## ۱. پایگاه داده و استراتژی نام‌گذاری camelCase در PostgreSQL

طبق دستورالعمل پروژه، تمامی نام‌گذاری‌ها در پایگاه داده شامل نام جداول و نام ستون‌ها باید به صورت **camelCase** باشند.

### ۱.۱. رفتار PostgreSQL با شناسه‌های camelCase
در PostgreSQL، شناسه‌ها به صورت پیش‌فرض به حروف کوچک تبدیل می‌شوند (`case-folding`). برای حفظ دقیق بزرگی و کوچکی حروف در فرمت **camelCase**، تمامی اسامی جداول و ستون‌ها در مایگریشن‌های SQL و کوئری‌های خام درون **دابل کوتیشن (`"`)** قرار می‌گیرند:

```sql
-- نمونه استاندارد ساخت جدول با فیلدهای camelCase
CREATE TABLE IF NOT EXISTS "sampleItems" (
    "id" SERIAL PRIMARY KEY,
    "itemTitle" VARCHAR(255) NOT NULL,
    "primaryImageUrl" TEXT NOT NULL,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ۱.۲. تنظیم استراتژی نام‌گذاری GORM (`CamelCaseNamingStrategy`)
در پروژه بک‌اند (`backend/pkg/database/postgres.go`)، یک `NamingStrategy` سفارشی برای GORM پیاده‌سازی شده است:
- **نام جداول:** به صورت خودکار به فرمت camelCase جمع تبدیل می‌شوند (مثلاً `ShoeModel` -> `shoeModels`).
- **نام ستون‌ها:** به صورت خودکار به فرمت camelCase ذخیره می‌شوند (مثلاً `PrimaryImageUrl` -> `primaryImageUrl`).
- علاوه بر استراتژی عمومی، در تمام ساختارهای `entity`، تگ صریح ستون درج می‌گردد:
  ```go
  type ShoeModel struct {
      ID              uint      `gorm:"primaryKey;column:id" json:"id"`
      ShoeTitle       string    `gorm:"column:shoeTitle;not null" json:"shoeTitle"`
      PrimaryImageUrl string    `gorm:"column:primaryImageUrl" json:"primaryImageUrl"`
      CreatedAt       time.Time `gorm:"column:createdAt" json:"createdAt"`
  }
  ```

---

## ۲. معماری سیستم مایگریشن اختصاصی (Custom Migration Runner)

پروژه دارای یک سیستم مایگریشن مستقل و اختصاصی در زبان Go است که نیاز به ابزارهای خارجی را حذف کرده و عملکردی فوق‌العاده مطمئن، اتمیک و شفاف فراهم می‌کند.

### ۲.۱. ساختار فایل‌های مایگریشن در پوشه `backend/migrations/`
تمام فایل‌های تغییرات ساختار دیتابیس در پوشه `migrations/` با شماره‌گذاری ترتیبی ۶ رقمی و دو فایل رفت (`.up.sql`) و برگشت (`.down.sql`) ایجاد می‌شوند:

```text
backend/migrations/
├── 000001_create_schema_migrations.up.sql
├── 000001_create_schema_migrations.down.sql
├── 000002_create_categories.up.sql
├── 000002_create_categories.down.sql
├── 000003_create_shoe_models.up.sql
└── 000003_create_shoe_models.down.sql
```

### ۲.۲. جدول ردیابی وضعیت مایگریشن‌ها (`schemaMigrations`)
وضعیت مایگریشن‌های اجرا شده در جدول اختصاصی `"schemaMigrations"` در پایگاه داده ثبت می‌شود:
```sql
CREATE TABLE IF NOT EXISTS "schemaMigrations" (
    "id" SERIAL PRIMARY KEY,
    "version" INT NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ۲.۳. عملکرد اسکریپت مایگریتور (`backend/cmd/migrate/main.go`)

فرمان‌های اجرایی مایگریتور از ترمینال:

```bash
# رفتن به پوشه بک‌اند
cd backend

# ۱. اجرای تمام مایگریشن‌های اعمال‌نشده (Up)
go run cmd/migrate/main.go up

# ۲. بازگردانی آخرین مایگریشن اعمال‌شده (Down / Rollback)
go run cmd/migrate/main.go down

# ۳. مشاهده جدول وضعیت مایگریشن‌ها (Status)
go run cmd/migrate/main.go status
```

### ۲.۴. تضمین اتمیک بودن و امنیت اجرا (Atomic Transactions):
1. **تراکنش پایگاه داده (Database Transaction):**  
   هر فایل مایگریشن دقیقاً درون یک تراکنش (`BEGIN ... COMMIT`) اجرا می‌شود.
2. **رول‌بک خودکار در صورت خطا:**  
   چنانچه هر دستوری در فایل SQL با خطا مواجه شود، تراکنش فوراً `ROLLBACK` شده و هیچ تغییری ناقص اعمال نمی‌شود.
3. **ثبت خودکار نسخه:**  
   شماره نسخه و نام مایگریشن در همان تراکنش در جدول `"schemaMigrations"` ثبت می‌شود.

---

## ۳. راهنمای گام‌به‌گام نوشتن مایگریشن جدید برای توسعه‌دهنده و AI Agent

هنگام پیاده‌سازی تسک جدیدی که نیاز به جدول یا ستون جدید دارد، مراحل زیر را دقیقاً دنبال کنید:

### گام ۱: شماره نسخه بعدی را بررسی کنید
به پوشه `backend/migrations/` نگاه کنید و شماره آخرین فایل را بیابید (مثلاً `000003`). نسخه جدید شماره بعد خواهد بود (`000004`).

### گام ۲: فایل Up را بسازید: `000004_create_feature_name.up.sql`
- از شناسه‌های camelCase درون دابل‌کوتیشن (`"`) استفاده کنید.
- ایندکس‌های لازم را تعریف کنید.
- ستون‌های پیش‌فرض `createdAt` و `updatedAt` را قرار دهید.

```sql
CREATE TABLE IF NOT EXISTS "sampleTable" (
    "id" SERIAL PRIMARY KEY,
    "sampleName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_sampleTable_sampleName" ON "sampleTable" ("sampleName");
```

### گام ۳: فایل Down را بسازید: `000004_create_feature_name.down.sql`
دستور پاک‌سازی تغییرات را بنویسید:
```sql
DROP TABLE IF EXISTS "sampleTable";
```

### گام ۴: اجرای مایگریشن
با اجرای فرمان زیر مایگریشن را اعمال کنید:
```bash
go run cmd/migrate/main.go up
```
وضعیت را با `go run cmd/migrate/main.go status` بازبینی کنید.
