# مستند API: ویرایش مدل کفش (Update Shoe)
**مسیر:** `docs/apiDocs/shoes/update.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال یا صفحه «ویرایش مدل کفش» در پنل مدیریت (`/admin/shoes`):**
  - تغییر عنوان، مشخصات، رنگ‌ها، سایزها، دسته‌بندی‌ها یا رسانه‌ها.
  - با زدن دکمه «ذخیره تغییرات»، این API صدا زده می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PUT`
- **مسیر (URL):** `/api/v1/shoes/:id`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامتر مسیر:** `:id` (شناسه سیستمی عددی کفش)

### ۲.۱. ساختار بدنه درخواست (Request Body)
همانند ساختار ایجاد کفش در متد POST.

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "مدل کفش با موفقیت ویرایش شد",
  "data": {
    "ID": 1792761483100205500,
    "modelID": 1,
    "title": "کفش آکسفورد مدل ونیز اختصاصی",
    "description": "رویه چرم هورس درجه یک با پرداخت روغنی",
    "coverImage": "/uploads/shoes/1792761483100_oxford.jpg",
    "categories": [
      {
        "ID": 1792757059582788000,
        "title": "کفش رسمی دست‌دوز"
      }
    ],
    "categoryIDs": [1792757059582788000],
    "colors": ["مشکی واکس‌خورده", "زرشکی آنتیک"],
    "colorsCount": 2,
    "sizes": [40, 41, 42, 43],
    "sizesCount": 4,
    "images": ["/uploads/shoes/1792761483100_oxford.jpg"],
    "videos": []
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | فیلدهای الزامی نامعتبر هستند. |
| `400 Bad Request` | `invalidShoeID` | شناسه مدل کفش نامعتبر است | شناسه در آدرس URL عدد معتبر نیست. |
| `400 Bad Request` | `categoryNotFoundForShoe` | یک یا چند دسته‌بندی انتخاب‌شده در سیستم وجود ندارد | شناسه دسته‌بندی نامعتبر ارسال شده است. |
| `404 Not Found` | `shoeNotFound` | مدل کفش مورد نظر یافت نشد | کفشی با این شناسه در سیستم وجود ندارد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین نامعتبر یا غایب است. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";
import { CreateShoePayload } from "./create";

export async function updateShoe(shoeID: number, payload: CreateShoePayload) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.put(
    `http://localhost:8080/api/v1/shoes/${shoeID}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
