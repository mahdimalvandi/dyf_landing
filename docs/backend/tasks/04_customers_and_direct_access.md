# تسک ۴: مدیریت مشتریان، همکاران تجاری و مجوزهای دسترسی مستقیم
**مسیر سند:** `docs/backend/tasks/04_customers_and_direct_access.md`  
**وضعیت:** آماده پیاده‌سازی  
**وابستگی‌ها:** تسک ۱ (احراز هویت) و تسک ۳ (مدل‌های کفش)

---

## ۱. هدف و دامنه تسک

مدیریت مشتریان منتخب و همکاران تجاری B2B کارگاه DYF (بنکداران و صاحبان بوتیک‌ها) و تنظیمات مجوز دسترسی مستقیم متصل به پروفایل آن‌ها.  
طبق سند محصول:
- مشتری با وارد کردن شماره همراه در سایت عمومی و تایید OTP شناسایی شده و اطلاعات پروفایل او بدون نیاز به ثبت‌نام مجدد بازیابی می‌شود.
- شماره تلفن همراه باید در سیستم یکتا باشد.
- هر مشتری می‌تواند یک **مجوز دسترسی مستقیم (Direct Permission)** داشته باشد که شامل دسته‌بندی‌های مجاز، مدل‌های اختصاصی مجاز، مدل‌های مستثناشده و محدودیت زمانی است.

---

## ۲. طراحی موجودیت‌ها و پایگاه‌داده

### ۲.۱. فایل مایگریشن
- `backend/migrations/000005_create_customers_and_permissions.up.sql`
- `backend/migrations/000005_create_customers_and_permissions.down.sql`

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

### ۲.۲. موجودیت‌های Go (`internal/entity/customer.go`)
```go
package entity

type Customer struct {
	BaseEntity
	FirstNameFa string `gorm:"column:firstNameFa" json:"firstNameFa"`
	LastNameFa  string `gorm:"column:lastNameFa" json:"lastNameFa"`
	FirstNameEn string `gorm:"column:firstNameEn" json:"firstNameEn"`
	LastNameEn  string `gorm:"column:lastNameEn" json:"lastNameEn"`
	StoreName   string `gorm:"column:storeName" json:"storeName"`
	PhoneNumber string `gorm:"column:phoneNumber" json:"phoneNumber"`
	IsActive    bool   `gorm:"column:isActive" json:"isActive"`
}

type CustomerDirectPermission struct {
	BaseEntity
	CustomerID         int64   `gorm:"column:customerID" json:"customerID"`
	AllowedCategoryIDs []int64 `gorm:"column:allowedCategoryIDs;serializer:json" json:"allowedCategoryIDs"`
	AllowedShoeIDs     []int64 `gorm:"column:allowedShoeIDs;serializer:json" json:"allowedShoeIDs"`
	ExcludedShoeIDs    []int64 `gorm:"column:excludedShoeIDs;serializer:json" json:"excludedShoeIDs"`
	DurationMinutes    int     `gorm:"column:durationMinutes" json:"durationMinutes"`
	ExpiresAt          int64   `gorm:"column:expiresAt" json:"expiresAt"`
	IsActive           bool    `gorm:"column:isActive" json:"isActive"`
	StartedAt          int64   `gorm:"column:startedAt" json:"startedAt"`
}
```

---

## ۳. قرارداد اندپوینت‌های API (Admin Only)

### ۳.۱. دریافت فهرست مشتریان (با وضعیت و خلاصه دسترسی)
- **متد و مسیر:** `GET /api/v1/admin/customers`
- **کوئری پارامترها:** `page`, `limit`, `search` (جستجو در نام، نام خانوادگی، شماره یا نام فروشگاه), `isActive`
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "لیست مشتریان دریافت شد",
    "data": [
      {
        "ID": 1729598284920192410,
        "firstNameFa": "مصطفی",
        "lastNameFa": "کمالی",
        "firstNameEn": "Mostafa",
        "lastNameEn": "Kamali",
        "storeName": "بوتیک چرم پالادیوم",
        "phoneNumber": "09121112233",
        "isActive": true,
        "hasDirectAccess": true,
        "directAccessActive": true,
        "updatedAt": 1729598284
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 14,
      "totalPages": 1
    }
  }
  ```

### ۳.۲. ثبت مشتری جدید
- **متد و مسیر:** `POST /api/v1/admin/customers`
- **بدنه درخواست (JSON):**
  ```json
  {
    "firstNameFa": "امید",
    "lastNameFa": "شمس",
    "firstNameEn": "Omid",
    "lastNameEn": "Shams",
    "storeName": "بنکداری شمس تبریز",
    "phoneNumber": "09123334455"
  }
  ```
- **پاسخ موفق (201):** مشخصات ذخیره‌شده مشتری.
- **خطا:** در صورت تکراری بودن شماره موبایل: `409 Conflict` با کد `DUPLICATE_PHONE`.

### ۳.۳. ویرایش اطلاعات مشتری
- **متد و مسیر:** `PUT /api/v1/admin/customers/:id`
- **بدنه درخواست (JSON):** نام، نام خانوادگی، نام فروشگاه و وضعیت.

### ۳.۴. فعال یا غیرفعال‌سازی وضعیت حساب مشتری
- **متد و مسیر:** `PATCH /api/v1/admin/customers/:id/status`
- **بدنه درخواست (JSON):**
  ```json
  {
    "isActive": false
  }
  ```
- **اثر منطقی:** به محض غیرفعال شدن حساب مشتری، تمام دسترسی‌های مستقیم و نشست‌های باز کاتالوگ او لغو می‌شوند.

### ۳.۵. دریافت و تنظیم مجوز دسترسی مستقیم مشتری
- **دریافت تنظیمات:** `GET /api/v1/admin/customers/:id/permission`
- **ذخیره/به‌روزرسانی تنظیمات:** `PUT /api/v1/admin/customers/:id/permission`
  ```json
  {
    "allowedCategoryIDs": [1729598273928192831, 1729598284920192410],
    "allowedShoeIDs": [1729598300000000001],
    "excludedShoeIDs": [1729598300000000009],
    "durationMinutes": 180,
    "expiresAt": 1732000000,
    "isActive": true
  }
  ```

---

## ۴. چک‌لیست فایل‌های موردنیاز برای ساخت در این تسک

- [ ] `backend/internal/entity/customer.go`: مدل‌های `Customer` و `CustomerDirectPermission`
- [ ] `backend/internal/dto/customerDTO.go`: استراکت‌های Create, Update, StatusToggle, PermissionRequest
- [ ] `backend/internal/repository/customerRepo.go`: کوئری‌های CRUD مشتری و متدهای جستجو با ۳ خروجی
- [ ] `backend/internal/repository/customerPermissionRepo.go`: کوئری‌های ثبت و واکشی مجوز مستقیم با ۳ خروجی
- [ ] `backend/internal/service/customerService.go`: اعتبارسنجی یکتایی تلفن، مدیریت تراکنش در ثبت هم‌زمان و تغییر وضعیت
- [ ] `backend/internal/handler/customerHandler.go`: هندلرهای REST مشتریان و مجوزهای مستقیم
