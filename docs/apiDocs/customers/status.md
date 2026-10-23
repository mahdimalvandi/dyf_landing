# مستند API: تغییر وضعیت حساب مشتری (Change Customer Status)
**مسیر:** `docs/apiDocs/customers/status.md`  
**خانواده API:** مشتریان و همکاران تجاری (`customers`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **کلید سوییچ (Toggle Switch) در سطر جدول مشتریان (`/admin/customers`):**
  - ادمین می‌تواند با کلیک روی سوییچ وضعیت در جدول، دسترسی مشتری را بدون ورود به فرم ویرایش فعال یا غیرفعال کند.
  - این عمل به صورت Optimistic Update یا با لودینگ سبک روی سوییچ قابل پیاده‌سازی است.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PATCH`
- **مسیر (URL):** `/api/v1/customers/:id/status`
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
| `isActive` | `boolean` | **بله** | مقدار بولی (`true` یا `false`) | وضعیت جدید حساب مشتری |

**نمونه بادی درخواست:**
```json
{
  "isActive": false
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "وضعیت حساب مشتری با موفقیت به‌روزرسانی شد",
  "data": {
    "ID": 1792770000000000000,
    "firstNameFa": "علی‌رضا",
    "lastNameFa": "محمدی‌تبار",
    "firstNameEn": "Alireza",
    "lastNameEn": "Mohammadi",
    "storeName": "بوتیک چرم پالادیوم VIP",
    "phoneNumber": "09121112233",
    "isActive": false
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidCustomerID` | شناسه مشتری نامعتبر است | شناسه در آدرس مقدار عددی معتبر ندارد. |
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | مقدار `isActive` ارسال نشده است. |
| `404 Not Found` | `customerNotFound` | مشتری مورد نظر یافت نشد | مشتری با این شناسه در پایگاه داده وجود ندارد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. |
