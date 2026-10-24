# مستند API: فعال‌سازی مجدد لینک دسترسی (Reactivate Access Link)
**مسیر:** `docs/apiDocs/links/reactivate.md`  
**خانواده API:** لینک‌های دسترسی اختصاصی (`links`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **جدول یا صفحه جزییات لینک در پنل ادمین (`/admin/links`):**
  - هنگامی که مهلت مشاهده یک لینک پایان یافته (`EXPIRED`) یا توسط ادمین قبلاً باطل شده است (`INACTIVE`)، ادمین با کلیک بر روی «فعال‌سازی مجدد»، لینک را زنده کرده و زمان‌سنج مشاهده را ریست می‌کند.
  - این اکشن فیلد `isActive` را برابر `true`، وضعیت را برابر `PENDING` و تایم‌استمپ‌های `firstViewedAt` و `viewingExpiresAt` را صفر می‌کند تا مخاطب بتواند دوره‌ای جدید از مشاهده کاتالوگ را آغاز نماید بدون اینکه نیاز باشد توکن یا آدرس کاتالوگ تغییر کند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PATCH`
- **مسیر (URL):** `/api/v1/links/:id/reactivate`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای مسیر (Path Parameters)
| پارامتر | نوع | الزامی | توضیحات |
|:---|:---:|:---:|:---|
| `id` | `int64` | **بله** | شناسه سیستمی لینک (`ID`) |

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "لینک دسترسی با موفقیت مجدداً فعال شد",
  "data": {
    "ID": 1792780000000000000,
    "linkID": 1,
    "token": "495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
    "url": "/catalog/495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
    "customerID": 1792770000000000000,
    "recipientName": "بوتیک چرم پالادیوم VIP",
    "phoneNumber": "09121112233",
    "authMethod": "DIRECT",
    "shoesCount": 2,
    "shoeIDs": [1792761483100205500, 1792761483100205502],
    "viewingDurationMinutes": 720,
    "expiresAt": 1793500000,
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
| `400 Bad Request` | `invalidLinkID` | شناسه لینک نامعتبر است | شناسه در آدرس عددی نیست. |
| `404 Not Found` | `linkNotFound` | لینک دسترسی مورد نظر یافت نشد | لینکی با شناسه ارسالی یافت نشد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی است. |
