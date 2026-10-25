# مستند API: ثبت مدل کفش جدید (Create Shoe)
**مسیر:** `docs/apiDocs/shoes/create.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال یا صفحه «افزودن مدل جدید» در پنل مدیریت (`/admin/shoes`):**
  - مدیر اطلاعات محصول (عنوان، توضیحات، دسته‌بندی‌ها، رنگ‌ها، سایزها، فایل‌های آپلودشده) را وارد می‌کند.
  - با زدن دکمه «ثبت و انتشار مدل»، این API صدا زده می‌شود.
  - پس از دریافت پاسخ موفق، پیام Toast نمایش داده شده و لیست کفش‌ها به‌روزرسانی می‌گردد.

> **نکته بیزنسی:** تمام مدل‌های ثبت‌شده مستقیماً و به صورت دائمی در وضعیت فعال و منتشرشده قرار می‌گیرند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/shoes`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `title` | `string` | **بله** | ۲ تا ۲۵۵ کاراکتر | عنوان اختصاصی مدل کفش |
| `description` | `string` | خیر | متن توضیحات | مشخصات تخصصی چرم، زیره و دوخت |
| `categoryIDs` | `number[]` | خیر | آرایه شناسه‌های معتبر | شناسه‌های دسته‌بندی‌های منتسب |
| `colors` | `string[]` | خیر | آرایه رشته‌ها | رنگ‌های قابل تولید (مثلاً مشکی، عسلی) |
| `sizes` | `number[]` | خیر | آرایه اعداد | سایزبندی‌های تولیدی (مثلاً ۴۰ تا ۴۵) |
| `images` | `string[]` | خیر | آرایه URLها | آدرس تصاویر کارگاهی آپلودشده |
| `videos` | `string[]` | خیر | آرایه URLها | آدرس ویدیوهای کارگاهی آپلودشده |
| `coverImage` | `string` | خیر | آدرس URL تصویر | تصویر کاور اصلی. در صورت خالی بودن، اولین عکس `images` خودکار کاور می‌شود. |

**نمونه بدنه درخواست:**
```json
{
  "title": "کفش آکسفورد مدل ونیز",
  "description": "رویه چرم طبیعی گاوی درجه یک، زیره میکرولایت با دوخت دستی",
  "categoryIDs": [1792757059582788000],
  "colors": ["مشکی واکس‌خورده", "عسلی پتینه‌ای"],
  "sizes": [40, 41, 42, 43, 44],
  "images": [
    "/uploads/shoes/1792761483100_oxford.jpg",
    "/uploads/shoes/1792761483101_side.jpg"
  ],
  "videos": [
    "/uploads/shoes/1792761483102_making.mp4"
  ],
  "coverImage": "/uploads/shoes/1792761483100_oxford.jpg"
}
```

---

## ۳. پاسخ موفق (Success Response - 201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "مدل کفش با موفقیت ثبت شد",
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
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | عنوان کفش خالی است یا طول نامعتبر دارد. |
| `400 Bad Request` | `categoryNotFoundForShoe` | یک یا چند دسته‌بندی انتخاب‌شده در سیستم وجود ندارد | شناسه‌ای در `categoryIDs` ارسال شده که در جدول دسته‌بندی‌ها وجود ندارد. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی است. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export interface CreateShoePayload {
  title: string;
  description?: string;
  categoryIDs?: number[];
  colors?: string[];
  sizes?: number[];
  images?: string[];
  videos?: string[];
  coverImage?: string;
}

export async function createShoe(payload: CreateShoePayload) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.post(
    "http://localhost:8080/api/v1/shoes",
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
