# سند تحلیل فنی تسک ۲: احراز هویت توکن‌محور و جدول نشست‌های دستگاه (Token Auth & Devices)
**مسیر سند:** `docs/backend/analysis/task_02_token_auth_and_devices.md`  
**وضعیت:** در انتظار بازبینی و تأیید کاربر (Pending User Review)  
**نسخه:** ۱.۰

---

## ۱. هدف تسک
پیاده‌سازی چرخه احراز هویت با توکن‌های مات (Opaque Token) بدون JWT، ثبت نشست‌های فعال در جدول مشترک `"devices"` برای مدیران و کاتالوگ، اعتبارسنجی توکن از طریق میدلور با تطابق هش MD5، و یکپارچه‌سازی کامل با تسک ۱ (تولید توکن در لاگین و ابطال در خروج).

---

## ۲. طراحی پایگاه داده (Schema & Migrations)

طبق قوانین مصوب:
- به ازای هر جدول یک فایل مایگریشن مجزا (`000003_create_devices.up.sql` و `down.sql`).
- عدم استفاده از `updatedAt`.
- استفاده از نام‌گذاری با دابل‌کوتیشن و camelCase.
- فیلد `"tokenHash"` به دلیل داشتن قید `UNIQUE` دارای ایندکس یکتا بوده و نیاز به ایندکس اضافه ندارد.

### ۲.۱. جدول نشست‌های دستگاه: `"devices"`
```sql
CREATE TABLE IF NOT EXISTS "devices" (
    "ID" BIGINT PRIMARY KEY,
    "userID" BIGINT NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "tokenHash" VARCHAR(32) NOT NULL UNIQUE,
    "expiresAt" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
```

**توضیح فیلدها:**
- `"ID"`: شناسه رکورد از نوع `int64` نانوثانیه.
- `"userID"`: شناسه رکورد کاربر (در ورود ادمین معادل `adminUsers.ID` و در کاتالوگ شناسه مشتری/لینک).
- `"userType"`: نوع نشست با مقادیر `'ADMIN'` یا `'CATALOG'`.
- `"tokenHash"`: مقدار ۳۲ کاراکتری هگزادسیمال حاصل از هش MD5 توکن خام.
- `"expiresAt"`: زمان انقضای یونیکس برحسب ثانیه (معادل ۳۰ روز = ۷۲۰ ساعت).
- `"status"`: وضعیت نشست با مقادیر `'ACTIVE'`, `'INACTIVE'`, `'EXPIRED'`.

---

## ۳. چرخه تولید توکن و احراز هویت با هش MD5

1. **تولید توکن خام (Raw Opaque Token):**
   - تولید یک رشته تصادفی امن و غیرقابل حدس ۳۲ بایتی (۶۴ کاراکتر هگزادسیمال با استفاده از `crypto/rand`).
2. **محاسبه هش MD5:**
   - مقدار هش MD5 توکن خام محاسبه می‌شود (`md5.Sum([]byte(rawToken))`).
   - فقط مقدار هش ۳۲ کاراکتری در جدول `"devices"` ذخیره می‌شود. توکن خام هرگز در دیتابیس ذخیره نخواهد شد.
3. **تحویل به کلاینت:**
   - توکن خام یک‌بار در پاسخ `VerifyOTP` به کلاینت تحویل داده می‌شود (مدت اعتبار: ۳۰ روز).
4. **ارسال در درخواست‌های بعدی کلاینت:**
   - کلاینت در هدر استاندارد `Authorization: Bearer <rawToken>` توکن را ارسال می‌کند.

---

## ۴. طراحی میدلور احراز هویت (`internal/middleware/auth.go`)

میدلور اعتبارسنجی مسیرهای محافظت‌شده به شرح زیر عمل می‌کند:
1. خواندن هدر `Authorization`.
2. بررسی فرمت `Bearer <token>`:
   - در صورت نبود یا فرمت نامعتبر: خطای `401 Unauthorized` با کد `unauthorized`.
3. محاسبه هش MD5 توکن دریافتی.
4. استعلام از جدول `"devices"` بر اساس `"tokenHash"`:
   - رکورد یافت نشود: خطای `401 Unauthorized`.
   - وضعیت غیر از `'ACTIVE'` باشد (مثلاً قبلاً خارج شده یا غیرفعال شده): خطای `401 Unauthorized`.
   - زمان انقضا گذشته باشد (`expiresAt < time.Now().Unix()`):
     - به‌روزرسانی وضعیت به `'EXPIRED'` در دیتابیس و بازگرداندن خطای `401 Unauthorized`.
5. در صورت معتبر بودن:
   - ثبت اطلاعات نشست در کانتکست جهت استفاده در کنترلرها:
     - `fiberContext.Locals("userID", device.UserID)`
     - `fiberContext.Locals("userType", device.UserType)`
     - `fiberContext.Locals("tokenHash", device.TokenHash)`
   - عبور به لایه بعدی (`fiberContext.Next()`).

---

## ۵. یکپارچه‌سازی با تسک ۱ و افزودن اندپوینت‌های محافظت‌شده

### ۵.۱. تکمیل `VerifyOTP`:
- پس از تایید موفقیت‌آمیز کد پیامکی:
  1. تولید توکن تصادفی خام.
  2. محاسبه هش MD5.
  3. ذخیره رکورد در `"devices"` با:
     - `userID = adminUser.ID`
     - `userType = "ADMIN"`
     - `tokenHash = md5Hash`
     - `expiresAt = time.Now().Unix() + (30 * 24 * 3600)`
     - `status = "ACTIVE"`
  4. قرار دادن توکن خام در پاسخ: `dtoauth.VerifyOTPResponse{ Admin: ..., Token: rawToken }`.

### ۵.۲. تکمیل `Logout`:
- مسیر `POST /api/v1/auth/admin/logout` تحت پوشش میدلور احراز هویت قرار می‌گیرد.
- توکن هش از کانتکست درخواست استخراج شده و وضعیت آن در جدول `"devices"` برابر با `'INACTIVE'` تنظیم می‌شود.
- در درخواست‌های بعدی، استفاده مجدد از این توکن منجر به خطای ۴۰۱ خواهد شد.

### ۵.۳. افزودن اندپوینت پروفایل جاری (`GET /api/v1/auth/admin/me`):
- مسیر محافظت‌شده جهت دریافت مشخصات ادمین لاگین‌شده.
- واکشی مشخصات با `userID` ذخیره‌شده در کانتکست و بازگرداندن پاسخ ۲۰۰ با مشخصات ادمین.

---

## ۶. ساختار فایل‌ها و بسته‌ها

```text
backend/
├── cmd/server/
│   └── routes/
│       └── auth.go               # افزودن میدلور احراز هویت به روت logout
├── internal/
│   ├── entity/
│   │   └── auth/
│   │       └── entity.go         # افزودن Device struct
│   ├── middleware/
│   │   └── auth.go               # پیاده‌سازی RequireAdminAuth middleware
│   ├── repository/
│   │   └── auth/
│   │       └── repository.go     # متدهای CreateDevice, FindDeviceByTokenHash, DeactivateDevice
│   ├── service/
│   │   └── auth/
│   │       ├── verifyOTP.go      # تولید توکن و ثبت رکورد دستگاه
│   │       └── logout.go         # غیرفعال‌سازی رکورد دستگاه با tokenHash
├── migrations/
│   ├── 000003_create_devices.up.sql
│   └── 000003_create_devices.down.sql
└── statics/
    └── constants/
        └── auth/
            └── constants.go      # مقادیر ثابت UserTypeAdmin, DeviceStatusActive و...
```

---

## ۷. سناریوهای تست و لبه‌ها (Edge Cases)

1. **ورود موفق با OTP:** ایجاد توکن خام، ثبت هش MD5 در دیتابیس و دریافت توکن در خروجی.
2. **درخواست بدون هدر Authorization به روت محافظت‌شده:** پاسخ 401 Unauthorized.
3. **درخواست با فرمت نامعتبر هدر (فاقد Bearer):** پاسخ 401 Unauthorized.
4. **درخواست با توکن نامعتبر/دستکاری‌شده:** پاسخ 401 Unauthorized.
5. **درخواست با توکن منقضی‌شده:** پاسخ 401 Unauthorized و تبدیل وضعیت به EXPIRED.
6. **خروج (Logout):** تغییر وضعیت توکن به INACTIVE و پاسخ 200 با پیام `MsgLogoutSuccessfully`.
7. **تلاش برای استفاده مجدد از توکن باطل‌شده بعد از Logout:** پاسخ 401 Unauthorized.

---

## ۸. سوالات و نقاط تصمیم‌گیری جهت بررسی شما:

۱. **فیلد وضعیت نشست:** در جدول فیلد `"status"` با مقادیر `'ACTIVE'`, `'INACTIVE'`, `'EXPIRED'` در نظر گرفته شده است؛ آیا مورد تایید است یا مدل بولین (`"isActive" BOOLEAN`) را ترجیح می‌دهید؟  
۲. **اعتبار پیش‌فرض توکن ادمین:** مقدار پیش‌فرض ۷۲ ساعت (۳ روز) از کانفیگ خوانده می‌شود؛ آیا این زمان مناسب است؟  
۳. **روت‌های محافظت‌شده فعلی:** آیا علاوه بر روت `POST /api/v1/auth/admin/logout`، روت دیگری مانند `GET /api/v1/auth/admin/me` جهت دریافت اطلاعات ادمین لاگین‌شده هم اضافه شود؟
