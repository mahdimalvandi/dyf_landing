# مستند API: حذف یک رسانه از گالری مدل (Remove Shoe Media)
**مسیر:** `docs/apiDocs/shoes/media.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **گالری رسانه‌های کفش در فرم محصول:**
  - روی هر تصویر یا ویدیوی بندانگشتی، دکمه ضربدر یا سطل زباله (حذف رسانه) قرار دارد.
  - با زدن حذف، این API صدا زده می‌شود تا صرفاً همان رسانه از مدل حذف گردد (بدون حذف کل محصول).
  - اگر فایل حذف‌شده، کاور اصلی محصول بوده باشد، سیستم به صورت هوشمند اولین تصویر باقی‌مانده در گالری را به عنوان کاور جدید انتخاب می‌کند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `DELETE`
- **مسیر (URL):** `/api/v1/shoes/:id/media`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامتر مسیر:** `:id` (شناسه سیستمی کفش)

### ۲.۱. ساختار ورودی (Request Body)
```json
{
  "mediaURL": "/uploads/shoes/old_sample.jpg"
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "فایل رسانه با موفقیت از مدل حذف شد",
  "data": {
    "ID": 1792761483100205500,
    "modelID": 1,
    "title": "کفش آکسفورد مدل ونیز",
    "coverImage": "/uploads/shoes/1792761483101_side.jpg",
    "images": [
      "/uploads/shoes/1792761483101_side.jpg"
    ],
    "videos": []
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | آدرس رسانه ارسالی خالی است. |
| `404 Not Found` | `mediaNotFound` | فایل رسانه مورد نظر در این مدل کفش یافت نشد | رسانه‌ای با این آدرس در گالری مدل وجود ندارد. |
| `404 Not Found` | `shoeNotFound` | مدل کفش مورد نظر یافت نشد | کفشی با این شناسه یافت نشد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین معتبر نیست. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function removeShoeMedia(shoeID: number, mediaURL: string) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.delete(
    `http://localhost:8080/api/v1/shoes/${shoeID}/media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        mediaURL,
      },
    }
  );
  return response.data.data;
}
```
