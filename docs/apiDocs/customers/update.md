# مستند API: ویرایش مشخصات مشتری (Update Customer)
**مسیر:** `docs/apiDocs/customers/update.md`  
**خانواده API:** مشتریان و همکاران تجاری (`customers`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه یا مودال «ویرایش اطلاعات مشتری» در پنل مدیریت (`/admin/customers/:id`):**
  - ویرایش نام و نام خانوادگی، نام فروشگاه، شماره تلفن و وضعیت فعالیت حساب.
  - پس از ذخیره، پیام موفقیت Toast نمایش داده شده و دیتای صفحه به‌روزرسانی می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PUT`
- **مسیر (URL):** `/api/v1/customers/:id`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای مسیر (Path Parameters)
| پارامتر | نوع | الزامی | توضیحات |
|:---|:---:|:---:|:---|
| `id` | `int64` | **بله** | شناسه عددی مشتری در سیستم |

### ۲.۲. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `firstNameFa` | `string` | **بله** | ۲ تا ۱۰۰ کاراکتر | نام فارسی مشتری |
| `lastNameFa` | `string` | **بله** | ۲ تا ۱۰۰ کاراکتر | نام خانوادگی فارسی مشتری |
| `firstNameEn` | `string` | خیر | حداکثر ۱۰۰ کاراکتر | نام انگلیسی مشتری |
| `lastNameEn` | `string` | خیر | حداکثر ۱۰۰ کاراکتر | نام خانوادگی انگلیسی مشتری |
| `storeName` | `string` | خیر | حداکثر ۲۰۰ کاراکتر | نام فروشگاه یا مجموعه تجاری |
| `phoneNumber` | `string` | **بله** | فرمت شماره ایران: `^09[0-9]{9}$` | شماره موبایل مشتری |
| `isActive` | `boolean` | خیر | وضعیت فعال بودن حساب |

**نمونه بادی درخواست:**
```json
{
  "firstNameFa": "علی‌رضا",
  "lastNameFa": "محمدی‌تبار",
  "firstNameEn": "Alireza",
  "lastNameEn": "Mohammadi",
  "storeName": "بوتیک چرم پالادیوم VIP",
  "phoneNumber": "09121112233",
  "isActive": true
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات مشتری با موفقیت ویرایش شد",
  "data": {
    "ID": 1792770000000000000,
    "firstNameFa": "علی‌رضا",
    "lastNameFa": "محمدی‌تبار",
    "firstNameEn": "Alireza",
    "lastNameEn": "Mohammadi",
    "storeName": "بوتیک چرم پالادیوم VIP",
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
| `400 Bad Request` | `invalidCustomerID` | شناسه مشتری نامعتبر است | شناسه در آدرس مقدار عددی معتبر ندارد. |
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | فیلدهای اجباری پر نشده یا شماره موبایل معتبر نیست. |
| `404 Not Found` | `customerNotFound` | مشتری مورد نظر یافت نشد | مشتری با این شناسه در سیستم وجود ندارد. |
| `409 Conflict` | `duplicatePhone` | شماره تلفن همراه از قبل در سیستم ثبت شده است | شماره تلفن جدید وارد شده به مشتری دیگری تعلق دارد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. |
