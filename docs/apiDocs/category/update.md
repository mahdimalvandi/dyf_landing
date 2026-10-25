# مستند API: ویرایش عنوان دسته‌بندی (Update Category)
**مسیر:** `docs/apiDocs/category/update.md`  
**خانواده API:** دسته‌بندی‌ها (`category`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال «ویرایش دسته‌بندی» در پنل مدیریت (`/admin/categories`):**
  - با کلیک روی آیکون مداد (ویرایش) در سطر جدول، مودال با عنوان فعلی باز می‌شود.
  - مدیر عنوان جدید را وارد کرده و دکمه «ذخیره تغییرات» را می‌زند.
  - این API صدا زده شده و در صورت موفقیت، ردیف جدول به‌روزرسانی شده و پیام موفقیت نمایش داده می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `PUT`
- **مسیر (URL):** `/api/v1/categories/:id`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامتر مسیر:** `:id` (شناسه عددی دسته‌بندی)

### ۲.۱. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `title` | `string` | **بله** | طول بین ۲ تا ۱۰۰ کاراکتر | عنوان جدید لاین محصول |

**نمونه بادی درخواست:**
```json
{
  "title": "کفش مجلسی و دامادی"
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "دسته‌بندی با موفقیت ویرایش شد",
  "data": {
    "ID": 1792757059582788000,
    "title": "کفش مجلسی و دامادی"
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | عنوان خالی است یا کوتاه‌تر از ۲ کاراکتر است. |
| `400 Bad Request` | `invalidIDParam` | شناسه ارسال شده در آدرس نامعتبر است | شناسه ارسالی در URL عدد معتبر نیست. |
| `404 Not Found` | `categoryNotFound` | دسته‌بندی مورد نظر یافت نشد | دسته‌بندی با این شناسه در پایگاه داده وجود ندارد. |
| `409 Conflict` | `categoryTitleDuplicate` | دسته‌بندی با این عنوان از قبل وجود دارد | عنوان جدید قبلاً برای دسته‌بندی دیگری ثبت شده است. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function updateCategory(categoryID: number, title: string) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.put(
    `http://localhost:8080/api/v1/categories/${categoryID}`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
