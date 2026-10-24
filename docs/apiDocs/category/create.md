# مستند API: افزودن دسته‌بندی جدید (Create Category)
**مسیر:** `docs/apiDocs/category/create.md`  
**خانواده API:** دسته‌بندی‌ها (`category`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال «افزودن دسته‌بندی جدید» در پنل مدیریت (`/admin/categories`):**
  - با زدن دکمه «+ افزودن دسته‌بندی» مودالی باز می‌شود که عنوان لاین محصول را دریافت می‌کند.
  - با زدن دکمه «ثبت دسته‌بندی»، این API صدا زده می‌شود.
  - پس از پاسخ موفق، مودال بسته شده، پیام موفقیت Toast می‌شود و جدول دسته‌بندی‌ها بازخوانی (Refetch) می‌گردد.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/categories`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `title` | `string` | **بله** | طول بین ۲ تا ۱۰۰ کاراکتر (فاصله‌های اضافی خودکار حذف می‌شوند) | عنوان لاین محصول |

**نمونه بادی درخواست:**
```json
{
  "title": "نیم‌بوت دست‌دوز"
}
```

---

## ۳. پاسخ موفق (Success Response - 201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "دسته‌بندی با موفقیت ایجاد شد",
  "data": {
    "ID": 1792757059582788000,
    "title": "نیم‌بوت دست‌دوز"
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | داده‌های ارسالی معتبر نیستند | عنوان خالی است یا طول آن کمتر از ۲ کاراکتر است. اینپوت عنوان قرمز شود. |
| `409 Conflict` | `categoryTitleDuplicate` | دسته‌بندی با این عنوان از قبل وجود دارد | دسته‌بندی دیگری با همین نام در سیستم وجود دارد. پیام خطا در فرم نشان داده شود. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. کاربر به `/login` هدایت شود. |

### ۴.۱. نمونه پاسخ خطای عنوان تکراری (409):
```json
{
  "success": false,
  "statusCode": 409,
  "error": {
    "code": "categoryTitleDuplicate",
    "message": "دسته‌بندی با این عنوان از قبل وجود دارد",
    "details": null
  }
}
```

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function createCategory(title: string) {
  const token = localStorage.getItem("admin_token");
  const response = await axios.post(
    "http://localhost:8080/api/v1/categories",
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
