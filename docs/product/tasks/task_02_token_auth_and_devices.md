# تسک ۲: سیستم احراز هویت توکن‌محور، جدول دستگاه‌ها و میدلور احراز هویت
**مسیر سند:** `docs/product/tasks/task_02_token_auth_and_devices.md`  
**وضعیت:** تعریف‌شده برای شروع پیاده‌سازی  
**وابستگی‌ها:** تسک ۱ (`task_01_admin_login.md`) و استانداردهای کدنویسی

---

## ۱. هدف و دامنه تسک

پیاده‌سازی سازوکار امن احراز هویت توکن‌محور بر پایه هش **MD5** و مدیریت نشست‌ها در یک جدول یکپارچه به نام **`devices`**.  
این سیستم مشترکاً برای نشست‌های مدیران پنل (`ADMIN`) و کاربران کاتالوگ خصوصی (`CATALOG`) استفاده شده و از طریق یک میدلور مرکزی، اعتبار توکن‌های ارسالی در هدر درخواست را بررسی می‌کند.

---

## ۲. طراحی جدول دستگاه‌ها و نشست‌ها (`"devices"`)

این جدول محل ذخیره توکن‌های فعال و دستگاه‌های متصل به سیستم است.

### ۲.۱. فایل مایگریشن
- `backend/migrations/000002_create_devices.up.sql`
- `backend/migrations/000002_create_devices.down.sql`

```sql
CREATE TABLE IF NOT EXISTS "devices" (
    "ID" BIGINT PRIMARY KEY,
    "userID" BIGINT NOT NULL,
    "userType" VARCHAR(20) NOT NULL, -- 'ADMIN' یا 'CATALOG'
    "token" VARCHAR(32) NOT NULL UNIQUE, -- هش MD5 توکن خام ارسالی به کلاینت
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'DISABLED'
    "expiresAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_devices_token" ON "devices" ("token");
CREATE INDEX IF NOT EXISTS "idx_devices_user_lookup" ON "devices" ("userID", "userType");
CREATE INDEX IF NOT EXISTS "idx_devices_status_expires" ON "devices" ("status", "expiresAt");
```

### ۲.۲. وضعیت‌های ممکن برای توکن دستگاه (`status`)
1. **`ACTIVE` (فعال):** توکن معتبر و مجاز برای ارسال درخواست.
2. **`EXPIRED` (منقضی‌شده):** زمان اعتبار توکن بر اساس `expiresAt` به پایان رسیده است.
3. **`DISABLED` (غیرفعال‌شده):** توکن توسط لاگ‌اوت کاربر یا لغو دسترسی توسط مدیر باطل شده است.

---

## ۳. چرخه تولید و مدیریت توکن

### ۳.۱. صدور توکن پس از تایید موفق OTP (تکمیل TODO تسک ۱)
1. پس از بررسی موفق کد یک‌بارمصرف:
2. تولید یک رشته تصادفی امن و غیرقابل‌حدس ۳۲ کاراکتری هگزادسیمال با `crypto/rand`: `rawToken`.
3. محاسبه هش **MD5** رشته تولیدشده:
   $$\text{tokenMD5} = \text{MD5}(\text{rawToken})$$
4. تعیین زمان انقضا بر اساس پیکربندی:
   - برای مدیر: خواندن از `AUTH_TOKEN_EXPIRATION_HOURS` در `.env` (پیش‌فرض ۷۲ ساعت).
   - برای کاتالوگ: بر اساس مدت زمان مجاز دسترسی یا مهلت لینک.
5. ذخیره رکورد در جدول `"devices"`:
   - `"ID"`: زمان فعلی به نانوثانیه
   - `"userID"`: شناسه کاربر
   - `"userType"`: نوع کاربر (`'ADMIN'` یا `'CATALOG'`)
   - `"token"`: مقدار هش `tokenMD5`
   - `"status"`: `'ACTIVE'`
   - `"expiresAt"`: زمان انقضا به ثانیه یونیکس
   - `"updatedAt"`: زمان ایجاد رکورد به ثانیه یونیکس
6. بازگرداندن `rawToken` به همراه اطلاعات کاربر در بدنه پاسخ JSON.  
   *(مقدار خام `rawToken` هرگز در دیتابیس ذخیره نمی‌شود).*

### ۳.۲. باطل‌سازی توکن در زمان خروج (Logout)
1. استخراج توکن از هدر `Authorization`.
2. محاسبه هش MD5 آن.
3. تغییر وضعیت رکورد در جدول `"devices"`:
   `status = 'DISABLED'` و به‌روزرسانی `updatedAt`.

---

## ۴. طراحی میدلور احراز هویت (`Auth Middleware`)

میدلور مسئول بررسی هدر درخواست‌ها قبل از رسیدن به هندلرها است:

### ۴.۱. الگوریتم عملکرد میدلور
1. **بررسی وجود هدر Authorization:**
   - خواندن هدر `Authorization`.
   - مقدار باید با پیشوند `Bearer ` شروع شود: `Bearer <rawToken>`.
   - در صورت عدم ارسال یا فرمت نادرست: بازگرداندن فوری خطای ۴۰۱ (`ErrUnauthorized`).
2. **محاسبه هش MD5:**
   - استخراج `rawToken` و محاسبه هش MD5 آن: `hash = MD5(rawToken)`.
3. **استعلام از جدول `"devices"`:**
   - جستجوی رکورد بر اساس `"token" = hash`.
   - اگر رکورد یافت نشد: بازگرداندن خطای ۴۰۱ (`ErrUnauthorized`).
4. **بررسی وضعیت و زمان انقضا:**
   - اگر `device.Status != "ACTIVE"`: بازگرداندن خطای ۴۰۱.
   - اگر زمان جاری بزرگتر یا مساوی `device.ExpiresAt` باشد:
     - به‌روزرسانی وضعیت رکورد در دیتابیس به `'EXPIRED'` (جهت تمیزی دیتا).
     - بازگرداندن خطای ۴۰۱ با پیام انقضا.
5. **بررسی نوع کاربر (نقش / Role Enforcement):**
   - برای روت‌های پنل مدیریت: بررسی `device.UserType == "ADMIN"`.
   - برای روت‌های کاتالوگ: بررسی `device.UserType == "CATALOG"`.
   - در صورت عدم تطابق: بازگرداندن خطای ۴۰۳ (`ErrForbidden`).
6. **تزریق مشخصات به کانتکست:**
   - در صورت تایید کامل، مقادیر زیر در `fiberContext.Locals` ست می‌شوند:
     - `currentUserID = device.UserID`
     - `currentUserType = device.UserType`
     - `currentDeviceID = device.ID`
   - فراخوانی `fiberContext.Next()` جهت اجرای هندلر مقصد.

---

## ۵. ساختار فایل‌های این تسک بر اساس قوانین پروژه

- `backend/internal/entity/device/entity.go`
- `backend/internal/dto/device/request.go`
- `backend/internal/dto/device/response.go`
- `backend/internal/dto/device/recievers.go`
- `backend/internal/repository/device/deviceRepo.go`
- `backend/internal/service/device/deviceService.go`
- `backend/internal/middleware/authAdmin.go` (میدلور محافظت از روت‌های پنل مدیریت)
- `backend/internal/middleware/authCatalog.go` (میدلور محافظت از روت‌های کاتالوگ)
- `backend/pkg/hash/md5.go` (ابزار تولید و اعتبارسنجی هش MD5)
- `backend/pkg/token/generator.go` (تولید رشته تصادفی امن)
- `backend/migrations/000002_create_devices.up.sql`
- `backend/migrations/000002_create_devices.down.sql`
