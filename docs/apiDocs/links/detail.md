# مستند API: دریافت جزییات کامل لینک دسترسی (Get Link Detail)
**مسیر:** `docs/apiDocs/links/detail.md`  
**خانواده API:** لینک‌های دسترسی اختصاصی (`links`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه یا مودال جزییات لینک در پنل مدیریت (`/admin/links/:id`):**
  - بارگذاری مشخصات کامل لینک، آمار زمانی و فهرست شناسه‌های مدل‌های کفش اختصاص‌یافته (`shoeIDs`).

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/links/:id`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای مسیر (Path Parameters)
| پارامتر | نوع | الزامی | توضیحات |
|:---|:---:|:---:|:---|
| `id` | `int64` | **بله** | شناسه سیستمی (`ID`) یا کد ترتیبی کارگاهی (`linkID`) |

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات لینک دسترسی با موفقیت دریافت شد",
  "data": {
    "ID": 1792780000000000000,
    "linkID": 1,
    "token": "495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
    "url": "/catalog/495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
    "customerID": 1792770000000000000,
    "recipientName": "بوتیک چرم پالادیوم (آقای محمدی)",
    "phoneNumber": "09121112233",
    "authMethod": "DIRECT",
    "shoesCount": 2,
    "shoeIDs": [1792761483100205500, 1792761483100205501],
    "viewingDurationMinutes": 1440,
    "expiresAt": 1793380000,
    "firstViewedAt": 0,
    "viewingExpiresAt": 0,
    "isActive": true,
    "status": "PENDING"
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidLinkID` | شناسه لینک نامعتبر است | شناسه در آدرس مقدار عددی معتبر ندارد. |
| `404 Not Found` | `linkNotFound` | لینک دسترسی مورد نظر یافت نشد | رکوردی با این شناسه در سیستم وجود ندارد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. |
