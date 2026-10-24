# مستند API: دریافت جزییات یک دسته‌بندی (Get Category Detail)
**مسیر:** `docs/apiDocs/category/detail.md`  
**خانواده API:** دسته‌بندی‌ها (`category`)  
**دسترسی:** عمومی (بدون نیاز به توکن احراز هویت)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مودال یا صفحه ویرایش دسته‌بندی (`/admin/categories`):**
  - هنگامی که مدیر روی دکمه ویرایش یک ردیف در جدول دسته‌بندی‌ها کلیک می‌کند، برای واکشی آخرین اطلاعات تازه آن دسته‌بندی از سرور استفاده می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/categories/:id`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  ```
- **پارامترهای مسیر (Path Params):**
  - `:id` (الزامی): شناسه عددی یکتای دسته‌بندی (`int64`).

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات دسته‌بندی با موفقیت دریافت شد",
  "data": {
    "ID": 1792757059582788000,
    "title": "کفش رسمی دست‌دوز",
    "shoeCount": 12
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidIDParam` | شناسه ارسال شده در آدرس نامعتبر است | شناسه ارسالی در URL عدد معتبر نیست (مثلاً رشته یا خالی است). |
| `404 Not Found` | `categoryNotFound` | دسته‌بندی مورد نظر یافت نشد | دسته‌بندی با این شناسه در سیستم وجود ندارد یا قبلاً حذف شده است. |

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

export interface Category {
  ID: number;
  title: string;
  shoeCount: number;
}

export async function fetchCategoryDetail(categoryID: number): Promise<Category> {
  const response = await axios.get<{ data: Category }>(
    `http://localhost:8080/api/v1/categories/${categoryID}`
  );
  return response.data.data;
}
```
