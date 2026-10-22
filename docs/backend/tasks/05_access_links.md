# تسک ۵: صدور و مدیریت لینک‌های دسترسی اختصاصی توکن‌دار
**مسیر سند:** `docs/backend/tasks/05_access_links.md`  
**وضعیت:** آماده پیاده‌سازی  
**وابستگی‌ها:** تسک ۳ (مدل‌های کفش) و تسک ۴ (مشتریان)

---

## ۱. هدف و دامنه تسک

پیاده‌سازی ماژول صدور و مدیریت لینک‌های امن کاتالوگ با توکن‌های تصادفی غیرقابل‌حدس.  
طبق سند محصول:
- **عدم نمایش اطلاعات هویتی در URL:** آدرس لینک فقط شامل توکن تصادفی است (`catalog.html?token=9b44fa71...`) و اطلاعات شخص در دیتابیس پیوند می‌خورد.
- **دو روش ورود:**
  - `DIRECT`: باز شدن مستقیم کاتالوگ با داشتن لینک بدون نیاز به وارد کردن شماره یا رمز.
  - `PHONE_OTP`: الزام وارد کردن شماره موبایل و تایید کد پیامکی که باید با شماره مجاز تعریف‌شده برای آن لینک تطبیق داده شود.
- **استقلال لینک‌ها:** یک مشتری می‌تواند چند لینک مختلف با دسترسی‌ها و زمان‌های گوناگون داشته باشد؛ انقضای یک لینک تاثیری بر سایر لینک‌ها یا دسترسی مستقیم مشتری ندارد.
- **چرخه‌های فعال‌سازی مجدد (`cycleNumber`):** مدیر می‌تواند یک لینک منقضی یا پایان‌یافته را مجدداً با زمان‌ها و مدل‌های جدید فعال کند؛ در این حالت `cycleNumber` یک واحد افزایش می‌یابد تا کلیه نشست‌های قبلی باطل شوند و زمان شروع برای اولین ورود دوره جدید ریست گردد.

---

## ۲. طراحی موجودیت و پایگاه‌داده

### ۲.۱. فایل مایگریشن
- `backend/migrations/000006_create_access_links.up.sql`
- `backend/migrations/000006_create_access_links.down.sql`

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
    "authType" VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
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

### ۲.۲. موجودیت Go (`internal/entity/accessLink.go`)
```go
package entity

type AccessLink struct {
	BaseEntity
	Token               string  `gorm:"column:token" json:"token"`
	Title               string  `gorm:"column:title" json:"title"`
	RecipientNameFa     string  `gorm:"column:recipientNameFa" json:"recipientNameFa"`
	RecipientLastNameFa string  `gorm:"column:recipientLastNameFa" json:"recipientLastNameFa"`
	RecipientNameEn     string  `gorm:"column:recipientNameEn" json:"recipientNameEn"`
	RecipientLastNameEn string  `gorm:"column:recipientLastNameEn" json:"recipientLastNameEn"`
	CustomerID          int64   `gorm:"column:customerID" json:"customerID"`
	AuthType            string  `gorm:"column:authType" json:"authType"`
	RequiredPhoneNumber string  `gorm:"column:requiredPhoneNumber" json:"requiredPhoneNumber"`
	AllowedCategoryIDs  []int64 `gorm:"column:allowedCategoryIDs;serializer:json" json:"allowedCategoryIDs"`
	AllowedShoeIDs      []int64 `gorm:"column:allowedShoeIDs;serializer:json" json:"allowedShoeIDs"`
	ExcludedShoeIDs     []int64 `gorm:"column:excludedShoeIDs;serializer:json" json:"excludedShoeIDs"`
	DurationMinutes     int     `gorm:"column:durationMinutes" json:"durationMinutes"`
	ExpiresAt           int64   `gorm:"column:expiresAt" json:"expiresAt"`
	IsActive            bool    `gorm:"column:isActive" json:"isActive"`
	CycleNumber         int     `gorm:"column:cycleNumber" json:"cycleNumber"`
	StartedAt           int64   `gorm:"column:startedAt" json:"startedAt"`
	LastAccessedAt      int64   `gorm:"column:lastAccessedAt" json:"lastAccessedAt"`
}
```

---

## ۳. ماشین وضعیت لینک‌ها (Status Determination Logic)

محاسبه وضعیت هر لینک در لایه سرویس به صورت پویا و بر اساس مقادیر فیلدها و زمان فعلی انجام می‌شود:

```go
func DetermineLinkStatus(link entity.AccessLink, currentUnixTime int64) string {
	if !link.IsActive {
		return "DISABLED"
	}
	if link.ExpiresAt > 0 && currentUnixTime >= link.ExpiresAt {
		return "EXPIRED"
	}
	if link.StartedAt == 0 {
		return "ACTIVE_UNSEEN"
	}
	if link.DurationMinutes > 0 {
		durationSeconds := int64(link.DurationMinutes * 60)
		if currentUnixTime >= (link.StartedAt + durationSeconds) {
			return "FINISHED"
		}
	}
	return "IN_USE"
}
```

---

## ۴. قرارداد اندپوینت‌های API (Admin Only)

### ۴.۱. صدور لینک جدید از ویزارد
- **متد و مسیر:** `POST /api/v1/admin/links`
- **بدنه درخواست (JSON):**
  ```json
  {
    "title": "مجموعه پاییزه - بوتیک پالادیوم",
    "recipientNameFa": "مصطفی",
    "recipientLastNameFa": "کمالی",
    "customerID": 1729598284920192410,
    "authType": "DIRECT",
    "requiredPhoneNumber": "",
    "allowedCategoryIDs": [1729598273928192831],
    "allowedShoeIDs": [],
    "excludedShoeIDs": [1729598300000000009],
    "durationMinutes": 60,
    "expiresAt": 1732000000
  }
  ```
- **رفتار سرور:** تولید یک رشته تصادفی امن ۱۶ یا ۳۲ کاراکتری به عنوان `token` و ذخیره با `cycleNumber = 1`.
- **پاسخ موفق (201):** رکورد لینک صادرشده به همراه URL دسترسی کاتالوگ (`/catalog.html?token=...`).

### ۴.۲. فهرست لینک‌های اختصاصی
- **متد و مسیر:** `GET /api/v1/admin/links`
- **کوئری پارامترها:** `page`, `limit`, `search`, `customerID`, `status`
- **پاسخ موفق (200):** لیست لینک‌ها با وضعیت محاسبه‌شده (`status`) و ثانیه‌های باقی‌مانده.

### ۴.۳. فعال یا غیرفعال‌سازی دستی لینک
- **متد و مسیر:** `PATCH /api/v1/admin/links/:id/toggle`
- **بدنه درخواست:** `{"isActive": false}`

### ۴.۴. فعال‌سازی مجدد لینک منقضی با چرخه زمانی جدید
- **متد و مسیر:** `POST /api/v1/admin/links/:id/reactivate`
- **بدنه درخواست:**
  ```json
  {
    "durationMinutes": 120,
    "expiresAt": 1735000000,
    "allowedCategoryIDs": [1729598273928192831]
  }
  ```
- **رفتار سرور:**
  - `cycleNumber = cycleNumber + 1`
  - `startedAt = 0` (آماده ورود مجدد)
  - `isActive = true`
  - کلیه نشست‌های ثبت‌شده با چرخه قبلی منقضی می‌شوند.

### ۴.۵. حذف لینک
- **متد و مسیر:** `DELETE /api/v1/admin/links/:id`

---

## ۵. چک‌لیست فایل‌های موردنیاز برای ساخت در این تسک

- [ ] `backend/pkg/token/token.go`: تابع تولید توکن تصادفی کریپتوگرافیک با `crypto/rand`
- [ ] `backend/internal/entity/accessLink.go`: مدل ساختاری `AccessLink`
- [ ] `backend/internal/dto/linkDTO.go`: استراکت‌های Create, Update, Reactivate و خروجی با فیلد وضعیت محاسباتی
- [ ] `backend/internal/repository/linkRepo.go`: متدهای CRUD و فیلترهای لینک‌ها با ۳ خروجی
- [ ] `backend/internal/service/linkService.go`: تولید توکن، محاسبه ماشین وضعیت و منطق چرخه جدید فعال‌سازی مجدد
- [ ] `backend/internal/handler/linkHandler.go`: هندلرهای REST مدیریت لینک‌ها
