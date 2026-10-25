# سند مشخصات فنی اندپوینت استعلام عمده B2B (Backend API Specification)

> **مسیر اندپوینت:** `POST /api/v1/inquiries`  
> **سطح دسترسی:** عمومی (Public — بدون نیاز به توکن احراز هویت)  
> **منبع فراخوانی:** فرم صفحه فرود (`frontend/index.html`) و ارتباط مستقیم بنکداران

---

## ۱. هدف و منطق کسب‌وکاری (Business Logic)

خریداران عمده، بنکداران و فروشگاه‌های کفش پس از مشاهده لندینگ پیج و لوک‌بوک محصولات، درخواست استعلام تیراژ و دریافت کاتالوگ خصوصی را از طریق فرم ثبت می‌کنند.  
این اطلاعات باید بلافاصله در پایگاه‌داده ذخیره شده و در پنل مدیریت (`admin.html`) برای تماس کارشناس فروش نمایش داده شود. همچنین به صورت اختیاری می‌تواند پیامک اعلان برای مدیر کارگاه یا خریدار ارسال گردد.

---

## ۲. مشخصات پروتکل و درخواست (HTTP Request)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/inquiries`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Accept: application/json
  ```

### بدنه درخواست (JSON Request Payload)

```json
{
  "store_name": "فروشگاه چرم آروین",
  "city_market": "تهران - بازار بزرگ - تیمچه حاجب‌الدوله",
  "phone_number": "09123456789",
  "line_preference": "both",
  "source": "landing_page"
}
```

### اعتبارسنجی فیلدها (Validation Rules)

| نام فیلد | نوع داده | الزامی | قوانین اعتبارسنجی | پیام خطای پیشنهادی |
| :--- | :--- | :--- | :--- | :--- |
| `store_name` | String | بله | حداقل ۲ و حداکثر ۱۰۰ کاراکتر | نام فروشگاه یا خریدار الزامی است و باید حداقل ۲ حرف باشد |
| `city_market` | String | بله | حداقل ۲ و حداکثر ۱۲۰ کاراکتر | شهر و بازار فعالیت الزامی است |
| `phone_number` | String | بله | الگوی شماره موبایل معتبر ایران: `^09\d{9}$` | شماره تماس باید یک شماره موبایل ۱۱ رقمی معتبر باشد |
| `line_preference` | String | بله | یکی از مقادیر مجاز: `both` , `executive` , `sneaker` | لاین انتخابی نامعتبر است |
| `source` | String | خیر | رشته متنی (پیش‌فرض: `landing_page`) | - |

---

## ۳. پاسخ‌های سرور (HTTP Responses)

### ۳.۱. پاسخ موفق (201 Created)

```json
{
  "success": true,
  "status": 201,
  "message": "درخواست همکاری شما با موفقیت ثبت شد",
  "data": {
    "id": 104,
    "store_name": "فروشگاه چرم آروین",
    "phone_number": "09123456789",
    "city_market": "تهران - بازار بزرگ",
    "line_preference": "both",
    "status": "pending",
    "created_at": "2026-10-25T14:32:00Z"
  }
}
```

### ۳.۲. خطای اعتبارسنجی (400 Bad Request)

```json
{
  "success": false,
  "status": 400,
  "message": "داده‌های ارسالی معتبر نمی‌باشند",
  "errors": {
    "phone_number": "شماره همراه باید ۱۱ رقم با پیش‌شماره ۰۹ باشد",
    "store_name": "نام فروشگاه الزامی است"
  }
}
```

### ۳.۳. خطای محدودیت نرخ ارسال (429 Too Many Requests)
برای جلوگیری از اسپم یا ارسال مکرر ربات‌ها، محدودیت نرخ اعمال شود (حداکثر ۵ درخواست در هر دقیقه به ازای هر IP):

```json
{
  "success": false,
  "status": 429,
  "message": "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه دیگر مجدداً تلاش کنید."
}
```

### ۳.۴. خطای داخلی سرور (500 Internal Server Error)

```json
{
  "success": false,
  "status": 500,
  "message": "خطای داخلی سرور در ثبت درخواست"
}
```

---

## ۴. طرح جدول پایگاه‌داده (Database Migration Schema)

پیشنهاد DDL جدول در PostgreSQL برای پشتیبانی از این قابلیت:

```sql
CREATE TABLE IF NOT EXISTS inquiries (
    id BIGSERIAL PRIMARY KEY,
    store_name VARCHAR(150) NOT NULL,
    city_market VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    line_preference VARCHAR(30) NOT NULL DEFAULT 'both',
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, contacted, converted, rejected
    source VARCHAR(60) NOT NULL DEFAULT 'landing_page',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(phone_number);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
```

---

## ۵. چک‌لیست تسک‌های تیم بک‌اند

- [ ] ایجاد فایل مدل `internal/model/inquiry.go` بر اساس جدول فوق
- [ ] ایجاد ریپازیتوری `internal/repository/inquiry/repository.go`
- [ ] پیاده‌سازی سرویس `internal/service/inquiry/create.go`
- [ ] پیاده‌سازی هندلر `internal/handler/inquiry/create.go`
- [ ] ثبت روت عمومی در `cmd/server/route.go` به صورت: `apiGroup.Post("/inquiries", inquiryHandler.Create)`
- [ ] اضافه کردن ارسال پیامک اطلاع‌رسانی خودکار به شماره ادمین کارگاه (اختیاری)
