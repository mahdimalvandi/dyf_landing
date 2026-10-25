# مستند API: ویرایش اطلاعات لینک دسترسی (Update Access Link)
**مسیر:** `docs/apiDocs/links/update.md`  
**خانواده API:** لینک‌های دسترسی اختصاصی (`links`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال یا صفحه «ویرایش لینک دسترسی» در پنل مدیریت (`/admin/links`):**
  - ادمین می‌تواند مشخصات دریافت‌کننده، مدت زمان مشاهده مجاز، تاریخ انقضا و آرایه مدل‌های مجاز کفش (`shoeIDs`) را اصلاح نماید.
  - پس از ذخیره موفقیت‌آمیز، مشخصات کامل به‌روزرسانی‌شده لینک در بدنه پاسخ بازگردانده می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PUT`
- **مسیر (URL):** `/api/v1/links/:id`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای مسیر (Path Parameters)
| پارامتر | نوع | الزامی | توضیحات |
|:---|:---:|:---:|:---|
| `id` | `int64` | **بله** | شناسه سیستمی لینک (`ID`) |

### ۲.۲. ساختار بدنه درخواست (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `recipientName` | `string` | **بله** | ۲ تا ۲۰۰ کاراکتر | نام دریافت‌کننده یا فروشگاه |
| `authMethod` | `string` | خیر | پیش‌فرض `DIRECT` (مقادیر: `DIRECT` یا `OTP`) | شیوه احراز هویت خریدار |
| `phoneNumber` | `string` | در صورت `authMethod = OTP` | شماره همراه معتبر | شماره تماس جهت ارسال کد پیامکی یکبار مصرف |
| `customerID` | `int64` | خیر | عدد صحیح مثبت یا صفر | شناسه مشتری جهت اتصال به پروفایل (اختیاری) |
| `shoeIDs` | `[]int64` | **بله** | حداقل ۱ مورد | شناسه‌های مدل‌های کفش مجاز در این لینک |
| `viewingDurationMinutes` | `int` | خیر | نامنفی | سقف زمان مجاز مشاهده کاتالوگ (به دقیقه) |
| `expiresAt` | `int64` | خیر | تایم‌استمپ ثانیه | تاریخ و ساعت نهایی انقضای لینک |

**نمونه بادی درخواست:**
```json
{
  "customerID": 1792770000000000000,
  "recipientName": "بوتیک چرم پالادیوم VIP",
  "phoneNumber": "09121112233",
  "authMethod": "DIRECT",
  "shoeIDs": [1792761483100205500, 1792761483100205502],
  "viewingDurationMinutes": 720,
  "expiresAt": 1793500000
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات لینک با موفقیت ویرایش شد",
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
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | نام گیرنده خالی است یا در حالت OTP شماره تلفن خالی مانده است. |
| `400 Bad Request` | `noShoesSelectedForLink` | حداقل یک مدل کفش باید برای این لینک انتخاب شود | آرایه `shoeIDs` خالی ارسال شده است. |
| `400 Bad Request` | `invalidAuthMethod` | روش ورود انتخابی نامعتبر است (تنها DIRECT یا OTP مجاز است) | مقدار فیلد `authMethod` غیرمجاز است. |
| `400 Bad Request` | `customerNotFound` | مشتری مورد نظر یافت نشد | مقدار `customerID` ارسال‌شده در سیستم وجود ندارد. |
| `404 Not Found` | `linkNotFound` | لینک دسترسی مورد نظر یافت نشد | لینکی با شناسه مشخص‌شده وجود ندارد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین نامعتبر یا منقضی شده است. |
