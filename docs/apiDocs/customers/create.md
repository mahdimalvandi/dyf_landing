# مستند API: افزودن مشتری جدید (Create Customer)
**مسیر:** `docs/apiDocs/customers/create.md`  
**خانواده API:** مشتریان و همکاران تجاری (`customers`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **فرم یا مودال «افزودن مشتری جدید» در پنل مدیریت (`/admin/customers`):**
  - فیلدهای نام و نام خانوادگی به فارسی، نام و نام خانوادگی به لاتین (اختیاری)، نام فروشگاه/بنکداری و شماره تلفن همراه دریافت می‌شود.
  - پس از ثبت موفق، فرم بسته شده، پیام موفقیت Toast نمایش داده می‌شود و فهرست مشتریان بازخوانی می‌گردد.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/customers`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `firstNameFa` | `string` | **بله** | ۲ تا ۱۰۰ کاراکتر | نام فارسی مشتری |
| `lastNameFa` | `string` | **بله** | ۲ تا ۱۰۰ کاراکتر | نام خانوادگی فارسی مشتری |
| `firstNameEn` | `string` | خیر | حداکثر ۱۰۰ کاراکتر | نام انگلیسی مشتری |
| `lastNameEn` | `string` | خیر | حداکثر ۱۰۰ کاراکتر | نام خانوادگی انگلیسی مشتری |
| `storeName` | `string` | خیر | حداکثر ۲۰۰ کاراکتر | نام فروشگاه یا مجموعه تجاری |
| `phoneNumber` | `string` | **بله** | فرمت شماره ایران: `^09[0-9]{9}$` | شماره موبایل یکتای مشتری |
| `isActive` | `boolean` | خیر | پیش‌فرض `true` | وضعیت اولیه فعالیت حساب |

**نمونه بادی درخواست:**
```json
{
  "firstNameFa": "علی",
  "lastNameFa": "محمدی",
  "firstNameEn": "Ali",
  "lastNameEn": "Mohammadi",
  "storeName": "بوتیک چرم پالادیوم",
  "phoneNumber": "09121112233",
  "isActive": true
}
```

---

## ۳. پاسخ موفق (Success Response - 201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "مشتری جدید با موفقیت ثبت شد",
  "data": {
    "ID": 1792770000000000000,
    "firstNameFa": "علی",
    "lastNameFa": "محمدی",
    "firstNameEn": "Ali",
    "lastNameEn": "Mohammadi",
    "storeName": "بوتیک چرم پالادیوم",
    "phoneNumber": "09121112233",
    "isActive": true
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | نام، نام خانوادگی یا شماره تلفن مطابق با الگوی معتبر نیست. |
| `409 Conflict` | `duplicatePhone` | شماره تلفن همراه از قبل در سیستم ثبت شده است | مشتری دیگری قبلاً با این شماره ثبت شده است. زیر اینپوت شماره پیام هشدار نمایش دهید. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین نامعتبر یا منقضی است. |
