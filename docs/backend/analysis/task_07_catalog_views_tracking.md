# سند تحلیل فنی تسک ۷: ثبت و ردیابی بازدیدهای کاتالوگ (Catalog View Tracking)
**مسیر سند:** `docs/backend/analysis/task_07_catalog_views_tracking.md`  
**وضعیت:** در انتظار بازبینی و تأیید نهایی کاربر (Pending User Review)  
**نسخه:** ۱.۱ (ساده‌سازی نهایی بر اساس بازخورد کاربر: حذف جدول مجزا و تمرکز روی فیلد `lastAccessedAt`)  

---

## ۱. هدف و چشم‌انداز محصولی (Product Vision & Goals)

هدف این تسک، پیاده‌سازی سریع، سبک و مینیمال ردیابی ورود کاربران به کاتالوگ‌های اختصاصی است.  
طبق بازخورد و تصمیم مصوب، **نیاز به جدول مجزا یا ذخیره لاگ‌های سنگین نیست**؛ تنها با افزودن یک فیلد زمان‌سنجی به نام `lastAccessedAt` روی جدول موجود لینک‌ها (`"accessLinks"`):
1. هر زمان که کاربر با توکن اختصاصی وارد کاتالوگ شد، این فیلد با تایم‌استمپ فعلی یونیکس (`time.Now().Unix()`) پر می‌شود.
2. هم‌زمان در نخستین ورود، چرخه حیات لینک (تغییر وضعیت از `PENDING` به `ACTIVE` و محاسبه زمان انقضای مشاهده در صورت وجود سقف زمانی) فعال می‌شود.
3. در آمار پیشخوان داشبورد (تسک ۸)، تعداد لینک‌هایی که فیلد `lastAccessedAt` آن‌ها مربوط به یک هفته اخیر (۷ روز گذشته) است به عنوان شاخص بازدید نمایش داده می‌شود.
4. در فهرست و جزییات لینک‌های پنل مدیریت، مدیر می‌تواند زمان آخرین مراجعه هر مخاطب را مشاهده کند.

---

## ۲. طراحی پایگاه داده (Database Schema & Migration)

تنها یک مایگریشن سبک برای اضافه کردن فیلد `"lastAccessedAt"` و ایندکس آن روی جدول `"accessLinks"` ایجاد می‌شود:
- شماره نسخه: `000008`
- فایل رو به جلو: `backend/migrations/000008_add_last_accessed_at_to_access_links.up.sql`
- فایل بازگشت: `backend/migrations/000008_add_last_accessed_at_to_access_links.down.sql`

### ۲.۱. اسکریپت مایگریشن (`000008_add_last_accessed_at_to_access_links.up.sql`)
```sql
ALTER TABLE "accessLinks" ADD COLUMN IF NOT EXISTS "lastAccessedAt" BIGINT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "idx_accessLinks_lastAccessedAt" ON "accessLinks" ("lastAccessedAt");
```

### ۲.۲. اسکریپت بازگشت (`000008_add_last_accessed_at_to_access_links.down.sql`)
```sql
DROP INDEX IF EXISTS "idx_accessLinks_lastAccessedAt";
ALTER TABLE "accessLinks" DROP COLUMN IF EXISTS "lastAccessedAt";
```

---

## ۳. طراحی روت‌ها و قرارداد APIها (API Contracts)

### ۳.۱. جدول خلاصه مسیرها
| متد | مسیر (Endpoint) | دسترسی | شرح عملکرد |
|:---:|:---|:---:|:---|
| `POST` | `/api/v1/catalog/:token/access` | عمومی (بدون توکن ادمین) | ثبت ورود خریدار به لینک، به‌روزرسانی `lastAccessedAt` و فعال‌سازی تایمرها |
| `GET` | `/api/v1/catalog/stats/views` | ادمین (`Bearer Token`) | ارائه تعداد لینک‌های مشاهده‌شده در ۷ روز اخیر (جهت داشبورد) |

> **نکته:** همچنین فیلد `lastAccessedAt` به خروجی‌های موجود `GET /api/v1/links` و `GET /api/v1/links/:id` اضافه می‌شود تا مدیر مستقیماً زمان آخرین مراجعه را در جدول لینک‌ها ببیند.

---

### ۳.۲. جزییات ورودی و خروجی Endpointها

#### ۱. ثبت ورود و مشاهده کاتالوگ (`POST /api/v1/catalog/:token/access`)
- **دسترسی:** عمومی
- **پارامتر مسیر:** `:token` (توکن یکتای لینک)
- **منطق سرویس:**
  1. جستجوی لینک با توکن. در صورت عدم یافتن -> `404 Not Found` با ارور `linkNotFound`.
  2. اگر لینک غیرفعال باشد (`isActive == false`) -> `403 Forbidden` با ارور `catalogLinkInactive`.
  3. اگر تاریخ انقضای لینک گذشته باشد (`expiresAt > 0 && now > expiresAt`): وضعیت به `EXPIRED` تغییر یافته و خطای `410 Gone` با ارور `catalogLinkExpired` برگشت داده می‌شود.
  4. اگر مهلت مشاهده قبلاً شروع شده و منقضی شده باشد (`viewingExpiresAt > 0 && now > viewingExpiresAt`): وضعیت به `EXPIRED` تغییر یافته و خطای `410 Gone` با ارور `catalogLinkExpired` برگشت داده می‌شود.
  5. اگر اولین ورود باشد (`firstViewedAt == 0`):
     - `firstViewedAt = now`
     - وضعیت لینک برابر `ACTIVE` می‌شود.
     - در صورت وجود مدت زمان مشاهده (`viewingDurationMinutes > 0`)، زمان پایان محاسبه می‌شود: `viewingExpiresAt = now + int64(viewingDurationMinutes * 60)`.
  6. فیلد `lastAccessedAt = now` تنظیم و ذخیره می‌شود.
- **پاسخ موفق (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "ورود به کاتالوگ با موفقیت ثبت شد",
  "data": {
    "linkID": 1,
    "recipientName": "بوتیک چرم پالادیوم",
    "status": "ACTIVE",
    "viewingExpiresAt": 1793500000,
    "remainingSeconds": 7200,
    "lastAccessedAt": 1792800000
  },
  "meta": null
}
```

---

#### ۲. آمار لینک‌های مشاهده‌شده در ۷ روز اخیر (`GET /api/v1/catalog/stats/views`)
- **دسترسی:** ادمین
- **پاسخ موفق (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "آمار بازدیدهای کاتالوگ با موفقیت دریافت شد",
  "data": {
    "last7DaysViews": 14,
    "totalAccessedLinks": 42
  },
  "meta": null
}
```

---

## ۴. لایه‌بندی و ساختار فایل‌ها

برای جلوگیری از ایجاد پکیج‌های اضافی، این قابلیت در کنار خانواده موجود `link` یا پوشه سبک `catalog` قرار می‌گیرد:
- **`internal/entity/link/entity.go`:** اضافه شدن فیلد `LastAccessedAt int64` به استراکت `AccessLink`.
- **`internal/dto/link/`:** اضافه شدن `lastAccessedAt` به `LinkResponse` و تعریف DTO برای خروجی `CatalogAccessResponse` و `CatalogStatsResponse`.
- **`internal/repository/link/repository.go`:**
  - متد `CountAccessedSince(timestamp int64) (int64, error)`
- **`internal/service/link/`:**
  - `access.go`: متد ثبت ورود خریدار، کنترل انقضا و به‌روزرسانی `lastAccessedAt`.
  - `stats.go`: متد استخراج تعداد بازدیدهای ۷ روز اخیر.
- **`internal/handler/link/`:**
  - `access.go`: کنترلر عمومی `AccessCatalog`.
  - `stats.go`: کنترلر ادمین `GetAccessStats`.
- **`cmd/server/routes/link.go`:**
  - ثبت روت عمومی `apiGroup.Post("/catalog/:token/access", linkHandler.Access)`
  - ثبت روت ادمین `apiGroup.Get("/catalog/stats/views", linkHandler.Stats)`

---

## ۵. کلیدهای خطا و پیام‌های ثابت

### ۵.۱. کلیدهای خطا در `statics/errors/customErrors.go`:
- `CatalogLinkExpired = "catalogLinkExpired"`
- `CatalogLinkInactive = "catalogLinkInactive"`

### ۵.۲. ترجمه فارسی در `statics/errors/faTranslation.go`:
- `CatalogLinkExpired`: "مهلت زمان مشاهده این کاتالوگ به پایان رسیده است"
- `CatalogLinkInactive`: "این لینک دسترسی توسط مدیریت غیرفعال شده است"

### ۵.۳. پیام‌های ثابت در `statics/constants/link/constants.go`:
- `MsgCatalogAccessRecorded = "ورود به کاتالوگ با موفقیت ثبت شد"`
- `MsgCatalogStatsFetched = "آمار بازدیدهای کاتالوگ با موفقیت دریافت شد"`

---

## ۶. سناریوهای تست و لبه‌ها

1. **ثبت اولین ورود موفق:** لینک از وضعیت `PENDING` به `ACTIVE` تبدیل می‌شود، تایمر انقضای مشاهده محاسبه و `lastAccessedAt` ست می‌شود (`200 OK`).
2. **ورودهای بعدی:** فیلد `lastAccessedAt` به زمان جاری به‌روزرسانی می‌شود اما تایمرهای اولیه تغییر نمی‌کنند (`200 OK`).
3. **ورود با توکن نامعتبر:** خطای `404 Not Found` با ارور `linkNotFound`.
4. **ورود با لینک غیرفعال‌شده:** خطای `403 Forbidden` با ارور `catalogLinkInactive`.
5. **ورود پس از پایان مهلت مشاهده:** خطای `410 Gone` با ارور `catalogLinkExpired`.
6. **محاسبه آمار ۷ روز اخیر:** بررسی کوئری `lastAccessedAt >= now - 7*86400` و بازگشت عدد دقیق.
7. **مشاهده `lastAccessedAt` در فهرست لینک‌های ادمین:** اطمینان از بازگرداندن این فیلد در DTO پاسخ لیست و جزییات لینک‌ها.
