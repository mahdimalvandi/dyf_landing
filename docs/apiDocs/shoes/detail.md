# مستند API: دریافت شناسنامه فنی کفش (Get Shoe Detail)
**مسیر:** `docs/apiDocs/shoes/detail.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** نیازمند توکن ادمین در هدر Authorization (در فاز حاضر)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال یا صفحه مشاهده شناسنامه فنی کفش:**
  - با کلیک روی کارت کفش یا آیکون مشاهده، مودال شناسنامه باز شده و تمامی ویژگی‌های فنی محصول (چرم، زیره، کفی، رنگ‌ها، سایزها، گالری ویدیو و تصاویر) نمایش داده می‌شود.
- **فرم ویرایش محصول:**
  - جهت پیش‌بارگذاری مقادیر فرم هنگام ویرایش یک مدل.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/shoes/:id`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامتر مسیر (`:id`):**
  - این پارامتر به صورت هوشمند از هر دو نوع **شناسه سیستمی (`ID` نانوثانیه)** یا **کد مدل کارگاهی (`modelID` عددی کوچک)** پشتیبانی می‌کند.

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "شناسنامه مدل کفش با موفقیت دریافت شد",
  "data": {
    "ID": 1792761483100205500,
    "modelID": 1,
    "title": "کفش آکسفورد مدل ونیز",
    "description": "رویه چرم طبیعی گاوی درجه یک، زیره میکرولایت با دوخت دستی",
    "coverImage": "/uploads/shoes/1792761483100_oxford.jpg",
    "categories": [
      {
        "ID": 1792757059582788000,
        "title": "کفش رسمی دست‌دوز"
      }
    ],
    "categoryIDs": [1792757059582788000],
    "colors": ["مشکی واکس‌خورده", "عسلی پتینه‌ای"],
    "colorsCount": 2,
    "sizes": [40, 41, 42, 43, 44],
    "sizesCount": 5,
    "images": [
      "/uploads/shoes/1792761483100_oxford.jpg",
      "/uploads/shoes/1792761483101_side.jpg"
    ],
    "videos": [
      "/uploads/shoes/1792761483102_making.mp4"
    ]
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidShoeID` | شناسه مدل کفش نامعتبر است | مقدار ارسالی در مسیر URL عدد معتبر نیست. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین نامعتبر یا منقضی است. |
| `404 Not Found` | `shoeNotFound` | مدل کفش مورد نظر یافت نشد | کفشی با این شناسه یا کد مدل در سیستم وجود ندارد. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function fetchShoeDetail(identifier: number) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.get(
    `http://localhost:8080/api/v1/shoes/${identifier}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
