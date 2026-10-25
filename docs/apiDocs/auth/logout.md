# مستند API: خروج مدیر از حساب کاربری (Admin Logout)
**مسیر:** `docs/apiDocs/auth/logout.md`  
**خانواده API:** احراز هویت (`auth`)  
**دسترسی:** محافظت‌شده (نیاز به توکن فعال ادمین)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **منوی پروفایل یا سایدبار پنل مدیریت:**
  - هنگامی که کاربر بر روی گزینه «خروج از حساب کاربری» کلیک می‌کند، یک دیالوگ تأیید نمایش داده می‌شود.
  - پس از تأیید، این API فراخوانی می‌شود تا نشست مربوط به این دستگاه در پایگاه داده غیرفعال (`INACTIVE`) شود.
  - پس از ابطال نشست، دسترسی این توکن برای همیشه منقضی شده و کاربر به صفحه ورود منتقل می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/auth/admin/logout`
- **هدرهای الزامی:**
  ```http
  Authorization: Bearer <TOKEN_HERE>
  Accept: application/json
  ```

### ۲.۱. ساختار ورودی (Request Body)
این اندپوینت **هیچ پارامتر ورودی یا بدنه‌ای ندارد**. توکن ارسال‌شده در هدر مستقیماً در جدول دیتابیس غیرفعال می‌گردد.

---

## ۳. پاسخ موفق (Success Response - 200 OK)

در صورت موفقیت در ابطال نشست، کد وضعیت ۲۰۰ با پیام استاندارد موفقیت بازگردانده می‌شود:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "خروج از حساب با موفقیت انجام شد",
  "data": null,
  "meta": null
}
```

### ۳.۱. اقدامات الزامی فرانت‌اند پس از دریافت پاسخ (یا حتی در صورت بروز خطای شبکه):
1. **پاکسازی کامل حافظه محلی:** حذف `admin_token` و اطلاعات کاربر از `localStorage`، `Cookie` یا `sessionStorage`.
2. **ریست کردن استیت احراز هویت:** صفر کردن استیت‌های Global کاربر (Auth Context / Zustand Store).
3. **هدایت به صفحه لاگین:** انتقال کاربر با Router به صفحه `/login`.
4. **توصیه مهم UX:** حتی اگر سرور خطای شبکه یا ۴۰۱ داد، فرانت‌اند باید خروج سمت کلاینت (حذف توکن محلی و ریدایرکت) را انجام دهد تا کاربر معلق نماند (Graceful Client Logout).

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام فرانت‌اند |
|:---:|:---|:---|:---|
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | هدر Authorization ارسال نشده، قالب نامعتبر است یا توکن قبلاً باطل شده است. در هر صورت کلاینت توکن را پاک کرده و به `/login` هدایت کند. |

### ۴.۱. نمونه پاسخ خطای ۴۰۱:
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

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export async function logoutAdmin(): Promise<void> {
  const token = localStorage.getItem("admin_token");

  try {
    if (token) {
      await axios.post(
        "http://localhost:8080/api/v1/auth/admin/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  } catch (error) {
    // حتی در صورت خطای سرور یا قطعی اینترنت، خروج محلی را انجام می‌دهیم
    console.warn("Server logout failed, proceeding with local logout", error);
  } finally {
    // ۱. حذف توکن و اطلاعات کاربر از کلاینت
    localStorage.removeItem("admin_token");
    delete axios.defaults.headers.common["Authorization"];

    // ۲. انتقال به صفحه لاگین
    window.location.href = "/login";
  }
}
```
