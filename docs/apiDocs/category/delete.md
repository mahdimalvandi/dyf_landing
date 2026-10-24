# مستند API: حذف دسته‌بندی (Delete Category)
**مسیر:** `docs/apiDocs/category/delete.md`  
**خانواده API:** دسته‌بندی‌ها (`category`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **جدول مدیریت دسته‌بندی‌ها در پنل مدیریت (`/admin/categories`):**
  - در هر سطر جدول، آیکون سطل زباله (حذف) قرار دارد.
  - با کلیک روی حذف، یک مودال تأیید (Confirmation Dialog) باز می‌شود: *«آیا از حذف دسته‌بندی [عنوان] اطمینان دارید؟»*.
  - با زدن دکمه «بله، حذف شود»، این API صدا زده می‌شود.
  - پس از دریافت پاسخ موفقیت (200 OK)، ردیف از جدول حذف شده یا جدول مجدداً بازخوانی (Refetch) می‌شود و پیام موفقیت Toast می‌گردد.

> **نکته بیزنسی مهم برای فرانت‌اند:**  
> طبق قوانین سیستم، حذف دسته‌بندی باعث حذف مدل‌های کفش ثبت‌شده نمی‌شود؛ بلکه کفش‌ها حفظ می‌شوند و صرفاً ارتباط آن‌ها با این لاین محصول برداشته می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `DELETE`
- **مسیر (URL):** `/api/v1/categories/:id`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامترهای مسیر (Path Params):**
  - `:id` (الزامی): شناسه عددی یکتای دسته‌بندی (`int64`).

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "دسته‌بندی با موفقیت حذف شد",
  "data": null,
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidIDParam` | شناسه ارسال شده در آدرس نامعتبر است | شناسه ارسالی در URL عدد معتبر نیست. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | هدر توکن ادمین ارسال نشده، نامعتبر یا منقضی است. کاربر به صفحه ورود منتقل شود. |
| `404 Not Found` | `categoryNotFound` | دسته‌بندی مورد نظر یافت نشد | دسته‌بندی با این شناسه در سیستم وجود ندارد یا قبلاً حذف شده است. جدول رفرش شود. |

### نمونه پاسخ خطای ۴۰۴:
```json
{
  "success": false,
  "statusCode": 404,
  "error": {
    "code": "categoryNotFound",
    "message": "دسته‌بندی مورد نظر یافت نشد",
    "details": null
  }
}
```

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function deleteCategory(categoryID: number): Promise<void> {
  const token = localStorage.getItem("admin_token");
  await axios.delete(
    `http://localhost:8080/api/v1/categories/${categoryID}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
```
