# مستند API: تعیین تصویر کاور مدل (Set Shoe Cover)
**مسیر:** `docs/apiDocs/shoes/cover.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **گالری رسانه‌های کفش در پنل مدیریت:**
  - روی هر یک از تصاویر گالری، دکمه یا بج «انتخاب به عنوان کاور» وجود دارد.
  - با کلیک روی آن، این API فراخوانی شده و تصویر سریعاً به عنوان کاور اصلی کفش ثبت می‌گردد.
  - نیازی به ارسال کل فرم یا ویرایش تمام فیلدهای دیگر نیست.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PUT`
- **مسیر (URL):** `/api/v1/shoes/:id/cover`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامتر مسیر:** `:id` (شناسه سیستمی کفش)

### ۲.۱. ساختار ورودی (Request Body)
```json
{
  "coverImage": "/uploads/shoes/1792761483100_3421.jpg"
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "تصویر کاور مدل با موفقیت به‌روزرسانی شد",
  "data": {
    "ID": 1792761483100205500,
    "modelID": 1,
    "title": "کفش آکسفورد مدل ونیز",
    "coverImage": "/uploads/shoes/1792761483100_3421.jpg"
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | آدرس تصویر کاور خالی است. |
| `404 Not Found` | `shoeNotFound` | مدل کفش مورد نظر یافت نشد | مدل کفش با این شناسه یافت نشد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین معتبر نیست. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function setShoeCover(shoeID: number, coverImage: string) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.put(
    `http://localhost:8080/api/v1/shoes/${shoeID}/cover`,
    { coverImage },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
