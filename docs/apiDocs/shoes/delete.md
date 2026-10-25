# مستند API: حذف مدل کفش (Delete Shoe)
**مسیر:** `docs/apiDocs/shoes/delete.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **جدول یا کارت‌های محصولات در پنل مدیریت (`/admin/shoes`):**
  - با زدن آیکون سطل زباله، مودال تأیید حذف باز می‌شود.
  - با تأیید مدیر، این API فراخوانی شده و مدل از دیتابیس پاک می‌شود.
  - دسته‌بندی‌های منتسب به این مدل کاملاً دست‌نخورده باقی می‌مانند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `DELETE`
- **مسیر (URL):** `/api/v1/shoes/:id`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **پارامتر مسیر:** `:id` (شناسه سیستمی عددی کفش)

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "مدل کفش با موفقیت حذف شد",
  "data": null,
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidShoeID` | شناسه مدل کفش نامعتبر است | شناسه در آدرس URL عدد معتبر نیست. |
| `404 Not Found` | `shoeNotFound` | مدل کفش مورد نظر یافت نشد | مدل کفش وجود ندارد یا قبلاً حذف شده است. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین نامعتبر یا ارسال نشده است. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function deleteShoe(shoeID: number): Promise<void> {
  const token = localStorage.getItem("admin_token");
  await axios.delete(`http://localhost:8080/api/v1/shoes/${shoeID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```
