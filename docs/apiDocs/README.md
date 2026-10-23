# راهنمای جامع اتصال و مستندات API (Frontend Developer Guide)
**پروژه:** کاتالوگ اختصاصی کفش DYF (DYF Private Catalog)  
**نسخه API:** `v1`  
**آدرس پایه در محیط لوکال:** `http://localhost:8080/api/v1`

---

## ۱. ساختار استاندارد پاسخ‌ها (Response Envelope)

کلیه پاسخ‌های سرور (چه موفقیت‌آمیز و چه خطا) در قالب ساختار یکپارچه پاکت (`Envelope`) به شرح زیر بازگردانده می‌شوند:

### ۱.۱. پاسخ‌های موفق (`success: true`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "پیام عملیات به فارسی",
  "data": {
    "field": "value"
  },
  "meta": null
}
```

### ۱.۲. پاسخ‌های خطا (`success: false`)
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "invalidOTP",
    "message": "کد تایید وارد شده صحیح نیست",
    "details": null
  }
}
```

---

## ۲. هدرهای ضروری درخواست (Request Headers)

1. **برای کلیه درخواست‌های JSON (مانند POST و PUT):**
   ```http
   Content-Type: application/json
   Accept: application/json
   ```

2. **برای مسیرهای محافظت‌شده (نیاز به احراز هویت ادمین):**
   توکن دریافت شده از مرحله لاگین باید در هدر استاندارد Authorization ارسال شود:
   ```http
   Authorization: Bearer <TOKEN_HERE>
   ```

---

## ۳. لیست APIهای پیاده‌سازی شده

### خانواده احراز هویت ادمین (`auth`):
| ردیف | متد | مسیر (Endpoint) | نیاز به توکن | فایل داکیومنت اختصاصی |
|:---:|:---:|:---|:---:|:---|
| ۱ | `POST` | `/api/v1/auth/admin/otp/send` | خیر | [مستند sendOTP.md](./auth/sendOTP.md) |
| ۲ | `POST` | `/api/v1/auth/admin/otp/verify` | خیر | [مستند verifyOTP.md](./auth/verifyOTP.md) |
| ۳ | `GET` | `/api/v1/auth/admin/me` | **بله** | [مستند me.md](./auth/me.md) |
| ۴ | `POST` | `/api/v1/auth/admin/logout` | **بله** | [مستند logout.md](./auth/logout.md) |

---

## ۴. چرخه احراز هویت در فرانت‌اند (Authentication Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as کاربر مدیر
    participant UI as فرانت‌اند (Next.js/React)
    participant API as سرور بک‌اند (Go Fiber)

    User->>UI: وارد کردن شماره موبایل
    UI->>API: POST /auth/admin/otp/send { phoneNumber }
    API-->>UI: 200 OK { expiresInSeconds: 120 }
    Note over UI: شروع تایمر معکوس ۱۲۰ ثانیه

    User->>UI: وارد کردن کد پیامک‌شده
    UI->>API: POST /auth/admin/otp/verify { phoneNumber, code }
    API-->>UI: 200 OK { token, admin }
    Note over UI: ذخیره Token در Cookie یا LocalStorage

    UI->>API: GET /auth/admin/me (با هدر Authorization: Bearer <token>)
    API-->>UI: 200 OK { admin }

    User->>UI: کلیک روی خروج از حساب
    UI->>API: POST /auth/admin/logout (با هدر Authorization)
    API-->>UI: 200 OK
    Note over UI: حذف Token و انتقال به صفحه لاگین
```
