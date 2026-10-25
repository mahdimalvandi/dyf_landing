# مستند API: دریافت اطلاعات حساب مدیر جاری (Get Current Admin Profile)
**مسیر:** `docs/apiDocs/auth/me.md`  
**خانواده API:** احراز هویت (`auth`)  
**دسترسی:** محافظت‌شده (نیاز به توکن فعال ادمین)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **بررسی وضعیت ورود در زمان لود صفحه (App Init / Route Guard):**
  - هنگامی که کاربر وارد پنل مدیریت می‌شود یا صفحه را رفرش می‌کند، فرانت‌اند برای اعتبارسنجی معتبر بودن توکن موجود در استوریج، این API را فراخوانی می‌کند.
  - در صورت موفقیت، مشخصات مدیر (نام و نام خانوادگی) در هدر بالای پنل نمایش داده می‌شود.
  - در صورت دریافت خطای ۴۰۱، فرانت‌اند متوجه می‌شود که توکن منقضی شده یا خروج رخ داده و کاربر را خودکار به صفحه `/login` هدایت می‌کند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/auth/admin/me`
- **هدرهای الزامی:**
  ```http
  Authorization: Bearer <TOKEN_HERE>
  Accept: application/json
  ```

### ۲.۱. ساختار ورودی (Request Body / Query)
این اندپوینت **هیچ پارامتر ورودی یا بدنه‌ای ندارد**. هویت کاربر به صورت امن از روی توکن ارسالی در هدر استخراج می‌شود.

---

## ۳. پاسخ موفق (Success Response - 200 OK)

در صورت معتبر بودن توکن، کد وضعیت ۲۰۰ همراه با پروفایل مدیر بازگردانده می‌شود:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات حساب کاربری با موفقیت دریافت شد",
  "data": {
    "ID": 1792754892013944000,
    "firstName": "مهدی",
    "lastName": "مالوندی",
    "phoneNumber": "09123456789"
  },
  "meta": null
}
```

### ۳.۱. فیلدهای دیتای پاسخ:
- `ID`: شناسه یکتای مدیر سیستم (`int64` نانوثانیه).
- `firstName`: نام مدیر.
- `lastName`: نام خانوادگی مدیر.
- `phoneNumber`: شماره موبایل مدیر.

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | هدر Authorization ارسال نشده، قالب آن غیراستاندارد است، توکن دستکاری شده، از تاریخ انقضا (۳۰ روز) گذشته، یا قبلاً Logout شده است. **اقدام:** پاک کردن توکن از استوریج و هدایت به `/login`. |
| `403 Forbidden` | `forbidden` | شما دسترسی لازم برای این عملیات را ندارید | توکن معتبر است اما متعلق به ادمین نیست (مثلاً توکن مشتری کاتالوگ است). |
| `403 Forbidden` | `adminInactive` | حساب کاربری مدیر غیرفعال است | حساب کاربری مدیر غیرفعال شده است. |
| `404 Not Found` | `userNotFound` | کاربر مورد نظر یافت نشد | رکورد مدیر مربوط به این توکن حذف شده است. |

### ۴.۱. نمونه پاسخ خطای عدم احراز هویت (401):
```json
{
  "success": false,
  "statusCode": 401,
  "error": {
    "code": "unauthorized",
    "message": "احراز هویت انجام نشده است",
    "details": null
  }
}
```

---

## ۵. نمونه کد فرانت‌اند (Auth Guard / Provider Example)

```typescript
import axios from "axios";

export interface AdminProfile {
  ID: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export async function fetchCurrentAdmin(): Promise<AdminProfile | null> {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    return null;
  }

  try {
    const response = await axios.get<{ data: AdminProfile }>(
      "http://localhost:8080/api/v1/auth/admin/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // توکن نامعتبر یا منقضی شده است
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return null;
  }
}
```
