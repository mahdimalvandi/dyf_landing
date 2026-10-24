# مستند API: آمار بازدیدهای کاتالوگ (Catalog View Statistics)
**مسیر:** `docs/apiDocs/catalog/stats.md`  
**خانواده API:** کاتالوگ اختصاصی (`catalog`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **داشبورد و پیشخوان پنل ادمین (`/admin/dashboard`):**
  - در کارت آماری شماره ۴ داشبورد (تعداد بازدید کاتالوگ در ۷ روز اخیر)، فرانت‌اند این اندپوینت را فراخوانی کرده و مقدار `last7DaysViews` را در کارت نمایش می‌دهد.
  - مقدار `totalAccessedLinks` نیز جهت گزارش‌های کلی یا سایر بخش‌های تحلیلی قابل استفاده است.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/catalog/stats/views`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

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

### ۳.۱. توضیحات فیلدهای پاسخ
| فیلد | نوع | توضیحات |
|:---|:---:|:---|
| `last7DaysViews` | `int64` | تعداد لینک‌هایی که طی ۷ روز اخیر حداقل یک بار باز و مشاهده شده‌اند |
| `totalAccessedLinks` | `int64` | تعداد کل لینک‌هایی که از ابتدای فعالیت سیستم حداقل یک بار مشاهده شده‌اند |

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی است. |
| `500 Internal Server Error` | `internalServerError` | خطای غیرمنتظره در سرور رخ داد | خطای پایگاه داده هنگام شمارش آمار. |
