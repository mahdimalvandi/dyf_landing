# مستند API: دریافت جزییات و پروفایل مشتری (Get Customer Detail)
**مسیر:** `docs/apiDocs/customers/detail.md`  
**خانواده API:** مشتریان و همکاران تجاری (`customers`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه پروفایل مشتری در پنل مدیریت (`/admin/customers/:id`):**
  - بارگذاری اطلاعات هویتی و کاری مشتری جهت مشاهده یا پر کردن فیلدهای فرم ویرایش.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/customers/:id`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای مسیر (Path Parameters)
| پارامتر | نوع | الزامی | توضیحات |
|:---|:---:|:---:|:---|
| `id` | `int64` | **بله** | شناسه عددی مشتری در سیستم |

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات مشتری با موفقیت دریافت شد",
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
| `400 Bad Request` | `invalidCustomerID` | شناسه مشتری نامعتبر است | شناسه در آدرس مقدار عددی معتبر ندارد. |
| `404 Not Found` | `customerNotFound` | مشتری مورد نظر یافت نشد | رکوردی با این شناسه در پایگاه داده وجود ندارد. هدایت به فهرست مشتریان. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. |
