# سند تحلیل فنی تسک ۱: لاگین و احراز هویت پیامکی مدیران (Admin Login & OTP)
**مسیر سند:** `docs/backend/analysis/task_01_admin_login.md`  
**وضعیت:** ویرایش دوم — اعمال بازخوردهای کاربر (Updated with User Feedback)  
**نسخه:** ۱.۱

---

## ۱. هدف تسک
پیاده‌سازی فرآیند ورود و خروج مدیران به پنل ادمین DYF با شماره تلفن همراه و کد تایید پیامکی (OTP)، اتصال کامل به وب‌سرویس سامانه «راه پیام» (MsgWay)، اعمال ریت‌لیمیتینگ سخت‌گیرانه برای جلوگیری از هدررفت هزینه پیامک، و قرار دادن جایگاه TODO جهت اتصال به جدول نشست‌ها و توکن‌ها در تسک ۲.

---

## ۲. طراحی دیتابیس (بدون `updatedAt` و بدون ایندکس‌های اضافه)

طبق سیاست پروژه و بازخورد کاربر:
- فیلد `"updatedAt"` در هیچ‌یک از جداول وجود ندارد.
- هیچ ایندکس اضافه‌ای (`CREATE INDEX`) برای جداول ساخته نمی‌شود چون حجم جدول ادمین‌ها نهایتاً ۳ الی ۴ رکورد است و سربار ایندکس بی‌مورد است.

### ۲.۱. جدول مدیران: `"adminUsers"`
```sql
CREATE TABLE IF NOT EXISTS "adminUsers" (
    "ID" BIGINT PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);
```

### ۲.۲. جدول کدهای تایید پیامکی: `"otpVerifications"`
```sql
CREATE TABLE IF NOT EXISTS "otpVerifications" (
    "ID" BIGINT PRIMARY KEY,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL DEFAULT 'ADMIN_LOGIN',
    "expiresAt" BIGINT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT FALSE
);
```

---

## ۳. امنیت هزینه پیامک و ریت‌لیمیتینگ (Rate Limiting)

به دلیل این‌که ارسال هر پیامک شامل هزینه واقعی است، مکانیزم‌های محافظتی زیر پیاده‌سازی می‌شوند:
1. **کول‌داون ارسال مجدد (Cooldown):** تا زمانی که از ارسال کد قبلی کمتر از ۱۲۰ ثانیه (۲ دقیقه) گذشته باشد، اجازه درخواست مجدد کد داده نمی‌شود و خطای `otpCooldownActive` بازگردانده می‌شود.
2. **سقف درخواست بر اساس شماره تلفن (Rate Limit):** حداکثر ۳ درخواست ارسال OTP در هر ۱۰ دقیقه برای هر شماره موبایل. در صورت تخطی خطای ۴۲۹ (Too Many Requests) با ارور `tooManyRequests` بازگردانده می‌شود.
3. **حالت ایمن تست و توسعه (Mock / MsgWay Mode):**
   - در حالت تست و بیلد (`SMS_PROVIDER=mock`)، کد تایید صرفاً در لاگ کنسول چاپ می‌شود تا کوچک‌ترین هزینه‌ای مصرف نشود.
   - کد اتصال واقعی به وب‌سرویس راه پیام (`SMS_PROVIDER=msgway`) به طور کامل نوشته شده و آماده استفاده در محیط عملیاتی است.

---

## ۴. مشخصات وب‌سرویس راه پیام (MsgWay Integration)

طبق مستندات رسمی وب‌سرویس راه پیام (`https://api.msgway.com/send`):
- **آدرس وب‌سرویس:** `POST https://api.msgway.com/send`
- **هدرها:**
  - `apiKey: 006587c3c4c9daedb39f97bd9dec59e4`
  - `Content-Type: application/json`
  - `accept-language: fa`
- **بدنه درخواست JSON:**
  ```json
  {
    "mobile": "09121234567",
    "method": "sms",
    "templateID": 0,
    "code": "12345",
    "expireTime": 120
  }
  ```
- **تنظیمات در `.env`:**
  ```env
  SMS_PROVIDER=mock # در محیط واقعی: msgway
  MSGWAY_API_KEY=006587c3c4c9daedb39f97bd9dec59e4
  MSGWAY_TEMPLATE_ID=1
  ```

---

## ۵. طراحی دقیق APIها و مشخصات DTO (API Contracts)

خانواده مسیر: `/api/v1/auth/admin`

### ۵.۱. ارسال کد تایید (`POST /api/v1/auth/admin/otp/send`)
- **کد وضعیت موفق:** `200 OK`
- **استراکت ورودی (Request):**
  ```go
  type SendOTPRequest struct {
      PhoneNumber string `json:"phoneNumber" validate:"required,iran_phone"`
  }
  ```
- **استراکت خروجی (Response):**
  ```go
  type SendOTPResponse struct {
      ExpiresInSeconds int `json:"expiresInSeconds"`
  }
  ```
- **منطق بیزینس:**
  1. اعتبارسنجی شماره همراه (۱۱ رقم با پیشوند ۰۹).
  2. بررسی ریت‌لیمیت و کول‌داون (حداقل ۱۲۰ ثانیه فاصله میان درخواست‌ها).
  3. بررسی وجود مدیر در جدول `"adminUsers"`:
     - در صورت عدم وجود: خطای `404 Not Found` با ارور `userNotFound`.
     - در صورت غیرفعال بودن: خطای `403 Forbidden` با ارور `adminInactive`.
  4. باطل‌کردن رکوردهای قبلی مصرف‌نشده این شماره.
  5. تولید کد ۵ رقمی تصادفی امن و ثبت در دیتابیس با انقضای ۱۲۰ ثانیه.
  6. ارسال پیامک با کلاینت پیامک (MsgWay / Mock).

---

### ۵.۲. بررسی و تایید کد پیامکی (`POST /api/v1/auth/admin/otp/verify`)
- **کد وضعیت موفق:** `200 OK`
- **استراکت ورودی (Request):**
  ```go
  type VerifyOTPRequest struct {
      PhoneNumber string `json:"phoneNumber" validate:"required,iran_phone"`
      Code        string `json:"code" validate:"required,min=4,max=6"`
  }
  ```
- **استراکت خروجی (Response):**
  ```go
  type VerifyOTPResponse struct {
      Admin AdminProfileResponse `json:"admin"`
      Token string               `json:"token,omitempty"`
  }

  type AdminProfileResponse struct {
      ID          int64  `json:"ID"`
      FirstName   string `json:"firstName"`
      LastName    string `json:"lastName"`
      PhoneNumber string `json:"phoneNumber"`
  }
  ```
- **منطق بیزینس:**
  1. واکشی آخرین رکورد فعال OTP شماره موردنظر.
  2. اعتبارسنجی:
     - رکوردی یافت نشود یا قبلاً مصرف شده باشد: خطای `400 Bad Request` با ارور `invalidOTP`.
     - زمان انقضا گذشته باشد: خطای `400 Bad Request` با ارور `otpExpired`.
     - کد مطابقت نداشته باشد: خطای `400 Bad Request` با ارور `invalidOTP` (بدون محدودیت تعداد تلاش طبق بازخورد کاربر).
  3. در صورت صحت کد:
     - علامت‌گذاری `isUsed = true`.
     - واکشی مشخصات مدیر و بازگرداندن پاسخ.
     - جایگذاری قلاب `// TODO: Task 2 - Generate MD5 token and register in devices table`.

---

### ۵.۳. خروج از حساب (`POST /api/v1/auth/admin/logout`)
- **کد وضعیت موفق:** `200 OK`
- **منطق:** دریافت درخواست و بازگرداندن پاسخ موفق (با جایگذاری قلاب تسک ۲ جهت غیرفعال‌سازی توکن در جدول `devices`).

---

## ۶. ساختار فایل‌ها در پروژه (خانواده `auth`)

```text
backend/
├── internal/
│   ├── dto/
│   │   └── auth/
│   │       ├── request.go        # ورودی‌های SendOTP, VerifyOTP, Logout
│   │       ├── response.go       # خروجی‌های پاسخ
│   │       └── recievers.go      # متدهای رسیور و نرمال‌سازی
│   ├── entity/
│   │   └── auth/
│   │       └── entity.go         # تعاریف AdminUser و OTPVerification (بدون فیلد updatedAt)
│   ├── handler/
│   │   └── auth/
│   │       ├── sendOTP.go
│   │       ├── verifyOTP.go
│   │       └── logout.go
│   ├── service/
│   │   └── auth/
│   │       ├── sendOTP.go
│   │       ├── verifyOTP.go
│   │       └── logout.go
│   └── repository/
│       └── auth/
│           └── repository.go     # کوئری‌های واکشی ادمین و OTP
├── statics/
│   ├── constants/
│   │   └── auth/
│   │       └── constants.go      # ثابت‌های انقضای ۱۲۰ ثانیه‌ای و هدف OTP
│   └── errors/
│       ├── customErrors.go
│       └── faTranslation.go
└── pkg/
    └── sms/
        ├── sms.go                # اینترفیس ارسال پیامک
        ├── mock.go               # پیاده‌سازی Mock برای تست رایگان
        └── msgway.go             # پیاده‌سازی اختصاصی وب‌سرویس راه پیام
```

---

## ۷. سناریوهای تست و صحت‌سنجی (Test Cases)

1. **اعتبارسنجی شماره تلفن:** رد شماره‌های غیرایرانی یا فرمت ناقص.
2. **بررسی وجود مدیر:** رد شماره‌های ثبت‌نشده با خطای ۴۰۴ `userNotFound`.
3. **بررسی فعال بودن مدیر:** رد مدیران غیرفعال با خطای ۴۰۳ `adminInactive`.
4. **کول‌داون و ریت‌لیمیت:** مسدودسازی درخواست‌های مکرر زیر ۱۲۰ ثانیه با خطای ۴۲۹ `otpCooldownActive`.
5. **ارسال موفقیت‌آمیز OTP:** تولید کد و انقضای ۱۲۰ ثانیه در حالت Mock و ثبت در دیتابیس.
6. **ورود کد اشتباه:** خطای ۴۰۰ `invalidOTP`.
7. **ورود کد منقضی:** خطای ۴۰۰ `otpExpired`.
8. **ورود کد صحیح:** بازگرداندن اطلاعات مدیر و ست شدن `isUsed = true`.
9. **استفاده مجدد از کد مصرف‌شده:** خطای ۴۰۰ `invalidOTP`.
10. **خروج:** بازگرداندن پاسخ موفق خروج.
