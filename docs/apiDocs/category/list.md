# مستند API: دریافت فهرست دسته‌بندی‌ها (Get Categories List)
**مسیر:** `docs/apiDocs/category/list.md`  
**خانواده API:** دسته‌بندی‌ها (`category`)  
**دسترسی:** عمومی (بدون نیاز به توکن احراز هویت)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه مدیریت محصولات / کفش‌ها (`/admin/shoes`):**
  - در فیلتر بالای جدول مدل‌های کفش (Select دسته‌بندی).
  - در فرم افزودن و ویرایش مدل کفش (جهت انتخاب لاین محصول).
- **صفحه مدیریت دسته‌بندی‌ها (`/admin/categories`):**
  - نمایش جدول تمام لاین‌های کارگاه جهت مشاهده، ویرایش یا حذف.
- **کاتالوگ عمومی یا اختصاصی مشتری:**
  - تب‌های ناوبری دسته‌بندی‌ها در بالای صفحه کاتالوگ (رسمی، کالج، بوت و...).

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/categories`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  ```
- **پارامترهای ورودی:** ندارد (تمام رکوردهای دسته‌بندی به ترتیب صعودی شناسه بازگردانده می‌شوند).

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "فهرست دسته‌بندی‌ها با موفقیت دریافت شد",
  "data": [
    {
      "ID": 1792757059582788000,
      "title": "کفش رسمی دست‌دوز",
      "shoeCount": 12
    },
    {
      "ID": 1792757059584828900,
      "title": "کالج و لوفر",
      "shoeCount": 5
    },
    {
      "ID": 1792757059586900000,
      "title": "بوت و نیم‌بوت",
      "shoeCount": 0
    }
  ],
  "meta": null
}
```

*نکته: در صورت نبود هیچ دسته‌بندی ثبت‌شده‌ای، فیلد `data` به صورت یک آرایه خالی `[]` بازگردانده می‌شود.*

---

## ۴. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export interface Category {
  ID: number;
  title: string;
  shoeCount: number;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await axios.get<{ data: Category[] }>(
    "http://localhost:8080/api/v1/categories"
  );
  return response.data.data;
}
```
