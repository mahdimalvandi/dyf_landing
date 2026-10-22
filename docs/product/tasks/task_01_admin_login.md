# تسک ۱: لاگین و احراز هویت پیامکی مدیران در پنل ادمین
**مسیر سند:** `docs/product/tasks/task_01_admin_login.md`  
**وضعیت:** تعریف‌شده برای شروع پیاده‌سازی  
**وابستگی‌ها:** استانداردهای کدنویسی (`docs/backend/01_coding_standards.md`)

---

## ۱. هدف و خلاصه تسک

پیاده‌سازی پایگاه داده کاربران پنل مدیریت و جریان ورود دو مرحله‌ای پیامکی (OTP) برای مدیران.  
در این تسک، مدیر شماره همراه خود را وارد کرده و کد تایید ۵ رقمی از طریق وب‌سرویس پیامکی **«راه پیام»** برای او ارسال می‌شود.  
*نکته مهم:* بخش تولید، ذخیره و صدور توکن نهایی به عنوان `TODO` مشخص می‌شود تا در **تسک ۲** (سیستم احراز هویت توکن‌محور و دستگاه‌ها) تکمیل گردد.

---

## ۲. طراحی پایگاه داده

### ۲.۱. جدول کاربران پنل مدیریت (`"adminUsers"`)
این جدول اطلاعات مدیران مجاز به ورود به پنل مدیریت را نگهداری می‌کند.
- **نام جدول:** `"adminUsers"`
- **ستون‌ها:**
  - `"ID"`: از نوع `BIGINT PRIMARY KEY` (نانوثانیه زمان ایجاد رکورد)
  - `"firstName"`: از نوع `VARCHAR(100) NOT NULL` (نام مدیر)
  - `"lastName"`: از نوع `VARCHAR(100) NOT NULL` (نام خانوادگی مدیر)
  - `"phoneNumber"`: از نوع `VARCHAR(20) NOT NULL UNIQUE` (شماره همراه مجاز، فرمت استاندارد ۱۱ رقمی)
  - `"updatedAt"`: از نوع `BIGINT NOT NULL` (زمان آخرین به‌روزرسانی به ثانیه یونیکس)
- **ایندکس‌ها:**
  - ایندکس B-Tree روی ستون `"phoneNumber"` جهت جست‌وجوی سریع در زمان لاگین.

### ۲.۲. جدول کدهای تایید پیامکی (`"otpVerifications"`)
برای ذخیره موقت کدهای پیامکی ارسال‌شده:
- **نام جدول:** `"otpVerifications"`
- **ستون‌ها:**
  - `"ID"`: از نوع `BIGINT PRIMARY KEY`
  - `"phoneNumber"`: از نوع `VARCHAR(20) NOT NULL`
  - `"code"`: از نوع `VARCHAR(10) NOT NULL` (کد ۵ رقمی تولیدشده)
  - `"purpose"`: از نوع `VARCHAR(50) NOT NULL` (مثلاً `'ADMIN_LOGIN'`)
  - `"expiresAt"`: از نوع `BIGINT NOT NULL` (مهلت انقضا؛ مثلاً ۲ دقیقه پس از صدور)
  - `"attempts"`: از نوع `INT NOT NULL DEFAULT 0` (تعداد دفعات ورود اشتباه)
  - `"isUsed"`: از نوع `BOOLEAN NOT NULL DEFAULT FALSE` (استفاده‌شدن کد)
  - `"updatedAt"`: از نوع `BIGINT NOT NULL`

---

## ۳. جریان کاری ورود مدیر (Admin Login Workflow)

### ۳.۱. مرحله اول: درخواست ارسال کد (`Send OTP`)
1. دریافت شماره همراه از کلاینت.
2. جست‌وجوی شماره در جدول `"adminUsers"`.
   - اگر کاربر یافت نشد: بازگرداندن خطای `ErrUserNotFound` با متن فارسی «کاربر مورد نظر یافت نشد» (کد وضعیت ۴۰۴).
3. تولید یک کد تصادفی ۵ رقمی عددی.
4. ذخیره کد در جدول `"otpVerifications"` با مهلت اعتبار ۲ دقیقه (`expiresAt = now + 120`).
5. ارسال کد پیامکی از طریق وب‌سرویس **«راه پیام»**:
   - خواندن توکن و آدرس API راه پیام از متغیرهای محیطی (`.env`).
   - فراخوانی اندپوینت ارسال پیامک سرویس راه پیام.
   - در صورت بروز هرگونه خطای شبکه یا وب‌سرویس، ثبت لاگ و بازگرداندن خطای مناسب.
6. بازگرداندن پاسخ موفقیت‌آمیز به کلاینت شامل مهلت اعتبار کد (`expiresInSeconds: 120`).

### ۳.۲. مرحله دوم: اعتبارسنجی کد ورود (`Verify OTP`)
1. دریافت شماره تلفن و کد واردشده از کلاینت.
2. استعلام آخرین رکورد استفاده‌نشده در `"otpVerifications"` برای این شماره با هدف `'ADMIN_LOGIN'`.
3. بررسی شرایط:
   - اگر رکوردی نبود یا کد نامعتبر بود: ثبت افزایش شمارنده `attempts` و بازگرداندن خطای `ErrInvalidOTP` (کد وضعیت ۴۰۰).
   - اگر زمان فعلی از `expiresAt` گذشته باشد: بازگرداندن خطای `ErrOTPExpired` (کد وضعیت ۴۱۰).
   - اگر کد صحیح بود: علامت‌گذاری رکورد با `isUsed = true`.
4. **بخش TODO (تسک ۲):**  
   - `// TODO (Task 2): تولید توکن تصادفی، محاسبه هش MD5، ذخیره در جدول devices و بازگرداندن توکن به کلاینت`
5. بازگرداندن مشخصات هویتی مدیر به کلاینت.

### ۳.۳. مرحله سوم: خروج از حساب (`Logout`)
1. متد خروج از حساب کاربری.
2. **بخش TODO (تسک ۲):**  
   - `// TODO (Task 2): باطل‌سازی یا تغییر وضعیت توکن مربوط به دستگاه جاری در جدول devices`
3. بازگرداندن پاسخ موفقیت‌آمیز خروج به کلاینت.

---

## ۴. وب‌سرویس پیامکی «راه پیام» (Rahpayam Provider)

- پیاده‌سازی سرویس ارسال پیامک در پوشه `pkg/sms/rahpayam.go`:
  - دریافت پارامترهای ارتباطی از متغیرهای محیطی:
    - `RAHPAYAM_API_URL`: آدرس پایه وب‌سرویس راه پیام
    - `RAHPAYAM_API_TOKEN`: توکن احراز هویت اختصاصی راه پیام
    - `RAHPAYAM_SENDER_NUMBER`: شماره فرستنده پیامک
  - در حالت محیط توسعه (`APP_ENV=development` یا `OTP_PROVIDER=mock`)، کد در ترمینال لاگ شود تا تست بدون ارسال هزینه انجام گیرد.

---

## ۵. قرارداد اندپوینت‌های API

### ۵.۱. درخواست ارسال کد تایید ورود مدیر
- **مسیر:** `POST /api/v1/admin/auth/send-otp`
- **ورودی (JSON):**
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
    "message": "کد تایید با موفقیت ارسال شد",
    "data": {
      "expiresInSeconds": 120
    }
  }
  ```

### ۵.۲. اعتبارسنجی کد تایید
- **مسیر:** `POST /api/v1/admin/auth/verify-otp`
- **ورودی (JSON):**
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
    "message": "کد تایید با موفقیت بررسی شد",
    "data": {
      "user": {
        "ID": 1729598273928192831,
        "firstName": "مهدی",
        "lastName": "ملوندی",
        "phoneNumber": "09121234567"
      }
    }
  }
  ```

### ۵.۳. خروج مدیر (Logout)
- **مسیر:** `POST /api/v1/admin/auth/logout`
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "خروج با موفقیت انجام شد"
  }
  ```

---

## ۶. ساختار فایل‌های این تسک بر اساس قوانین پروژه

- `backend/internal/dto/adminUser/request.go`
- `backend/internal/dto/adminUser/response.go`
- `backend/internal/dto/adminUser/recievers.go`
- `backend/internal/entity/adminUser/entity.go`
- `backend/internal/repository/adminUser/adminUserRepo.go`
- `backend/internal/service/adminUser/sendOTP.go`
- `backend/internal/service/adminUser/verifyOTP.go`
- `backend/internal/service/adminUser/logout.go`
- `backend/internal/handler/adminUser/sendOTP.go`
- `backend/internal/handler/adminUser/verifyOTP.go`
- `backend/internal/handler/adminUser/logout.go`
- `backend/pkg/sms/rahpayam.go`
- `backend/migrations/000001_create_admin_users_and_otp.up.sql`
- `backend/migrations/000001_create_admin_users_and_otp.down.sql`
