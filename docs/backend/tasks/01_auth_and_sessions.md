# تسک ۱: احراز هویت توکن‌محور، سرویس OTP و میدلورهای پایه
**مسیر سند:** `docs/backend/tasks/01_auth_and_sessions.md`  
**وضعیت:** آماده پیاده‌سازی  
**وابستگی‌ها:** استانداردهای کدنویسی (`01_coding_standards.md`) و دیتابیس (`02_database_and_migration_standards.md`)

---

## ۱. هدف و دامنه تسک

پیاده‌سازی ماژول احراز هویت برای دو بخش پنل مدیریت و کاتالوگ خصوصی بدون وابستگی به JWT و بر اساس توکن‌های مات (Opaque Tokens) هش‌شده با **MD5**، به همراه سرویس ارسال و اعتبارسنجی کدهای یک‌بارمصرف (OTP) و میدلور تایم‌اوت ۱۰ ثانیه‌ای.

---

## ۲. منطق تجاری و نیازمندی‌های محصولی

1. **جریان ورود مدیر (`ADMIN_LOGIN`):**
   - مدیر شماره تلفن همراه خود را ارسال می‌کند.
   - سیستم بررسی می‌کند که آیا شماره در جدول `"admins"` وجود دارد و `isActive == true` است یا خیر. در غیر این صورت خطای `NOT_FOUND` یا `FORBIDDEN` داده می‌شود.
   - کد ۵ رقمی OTP تولید شده و با مهلت اعتبار ۲ دقیقه‌ای در جدول `"otpVerifications"` ثبت می‌شود (در محیط توسعه، کد در کنسول لاگ می‌شود).
   - با وارد کردن کد صحیح:
     - رکورد OTP به عنوان `isUsed = true` علامت‌گذاری می‌شود.
     - یک توکن تصادفی ۳۲ کاراکتری هگزادسیمال تولید می‌شود (`rawToken`).
     - هش MD5 آن محاسبه شده (`tokenHash`) و در جدول `"adminTokens"` با مهلت اعتبار ۷۲ ساعته ذخیره می‌شود.
     - مقدار `rawToken` به کلاینت تحویل داده می‌شود.

2. **جریان ورود مشتری مستقیم کاتالوگ (`CUSTOMER_LOGIN`):**
   - مشتری شماره تلفن خود را در ورودی کاتالوگ VIP ارسال می‌کند.
   - سیستم وجود مشتری و فعال بودن حساب کاربری (`isActive == true`) و وجود مجوز دسترسی مستقیم فعال را بررسی می‌کند.
   - کد OTP ارسال و بررسی می‌شود.
   - پس از تایید، یک توکن نشست کاتالوگ صادر شده و هش MD5 آن در جدول `"catalogTokens"` ذخیره می‌شود.

3. **میدلور اعتبارسنجی احراز هویت:**
   - خواندن هدر `Authorization: Bearer <token>`.
   - محاسبه هش MD5 توکن دریافتی.
   - جستجوی رکورد در دیتابیس بر اساس `"tokenHash"` و بررسی این‌که `"expiresAt" > currentUnixTimestamp`.
   - قرار دادن مشخصات هویتی (`adminID` یا `customerID`) درون `fiberContext.Locals`.

4. **میدلور تایم‌اوت ۱۰ ثانیه‌ای:**
   - بستن یک `context.WithTimeout(fiberContext.UserContext(), 10*time.Second)` روی تمام درخواست‌ها.

---

## ۳. طرح مایگریشن‌های این تسک

فایل‌های مایگریشن جدید:
- `backend/migrations/000001_create_admins_and_tokens.up.sql`
- `backend/migrations/000001_create_admins_and_tokens.down.sql`
- `backend/migrations/000002_create_otp_verifications.up.sql`
- `backend/migrations/000002_create_otp_verifications.down.sql`

```sql
-- Up: 000001_create_admins_and_tokens.up.sql
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

CREATE TABLE IF NOT EXISTS "adminTokens" (
    "ID" BIGINT PRIMARY KEY,
    "adminID" BIGINT NOT NULL REFERENCES "admins" ("ID") ON DELETE CASCADE,
    "tokenHash" VARCHAR(32) NOT NULL UNIQUE,
    "expiresAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_adminTokens_tokenHash" ON "adminTokens" ("tokenHash");
CREATE INDEX IF NOT EXISTS "idx_adminTokens_expiresAt" ON "adminTokens" ("expiresAt");
```

```sql
-- Up: 000002_create_otp_verifications.up.sql
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

---

## ۴. قرارداد اندپوینت‌های API

### ۴.۱. ارسال کد تایید ورود مدیر
- **مسیر:** `POST /api/v1/auth/admin/send-otp`
- **بدنه درخواست (JSON):**
  ```json
  {
    "phoneNumber": "09121234567"
  }
  ```
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "کد تایید پیامک شد",
    "data": {
      "expiresInSeconds": 120
    }
  }
  ```

### ۴.۲. تایید کد و دریافت توکن مدیر
- **مسیر:** `POST /api/v1/auth/admin/verify-otp`
- **بدنه درخواست (JSON):**
  ```json
  {
    "phoneNumber": "09121234567",
    "code": "12345"
  }
  ```
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "ورود با موفقیت انجام شد",
    "data": {
      "token": "a1b2c3d4e5f6...",
      "admin": {
        "ID": 1729598273928192831,
        "firstName": "مهدی",
        "lastName": "ملوندی",
        "phoneNumber": "09121234567"
      }
    }
  }
  ```

### ۴.۳. خروج مدیر و ابطال توکن
- **مسیر:** `POST /api/v1/auth/admin/logout`
- **هدر:** `Authorization: Bearer <token>`
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "خروج با موفقیت انجام شد"
  }
  ```

---

## ۵. چک‌لیست فایل‌های موردنیاز برای ساخت در این تسک

- [ ] `backend/pkg/hash/hash.go`: تابع تولید هش MD5 (`ComputeMD5(input string) string`) و تولید توکن رندوم کریپتوگرافیک
- [ ] `backend/pkg/sms/sms.go`: اینترفیس ارسال پیامک و درایور لوکال لاگر (Mock)
- [ ] `backend/internal/entity/admin.go`: ساختارهای `Admin`، `AdminToken` و `OTPVerification`
- [ ] `backend/internal/dto/authDTO.go`: ساختارهای درخواست و پاسخ لاگین و OTP
- [ ] `backend/internal/repository/adminRepo.go`: متدهای ذخیره و جستجو با ۳ خروجی `(item, found, error)`
- [ ] `backend/internal/repository/otpRepo.go`: متدهای ثبت، استعلام آخرین کد و ابطال OTP
- [ ] `backend/internal/service/authService.go`: منطق تولید OTP، اعتبارسنجی شماره، هش MD5 و ساخت سشن
- [ ] `backend/internal/middleware/timeout.go`: اعمال محدودیت زمانی ۱۰ ثانیه‌ای روی درخواست‌ها
- [ ] `backend/internal/middleware/authAdmin.go`: استخراج هدر Bearer، محاسبه هش MD5 و احراز هویت مدیر
- [ ] `backend/internal/handler/authHandler.go`: هندلرهای ارسال و تایید کد با پاسخ یکپارچه
