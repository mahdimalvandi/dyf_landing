# مستند API: بررسی کد تایید و ورود مدیر (Verify OTP & Login)
**مسیر:** `docs/apiDocs/auth/verifyOTP.md`  
**خانواده API:** احراز هویت (`auth`)  
**دسترسی:** عمومی (بدون نیاز به توکن)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **مرحله دوم فرم ورود مدیر (`/login`):**
  - پس از دریافت کد تایید پیامکی، کاربر کد ۵ رقمی را در فرم وارد می‌کند (مثلاً در کامپوننت PinInput یا OTPInput).
  - این API کد ارسال‌شده را اعتبارسنجی کرده، در صورت صحت نشست دستگاه را ثبت می‌کند و توکن احراز هویت را همراه با پروفایل مدیر برمی‌گرداند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/auth/admin/otp/verify`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  ```

### ۲.۱. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی | توضیحات |
|:---|:---:|:---:|:---|:---|
| `phoneNumber` | `string` | **بله** | فرمت شماره ایران (۱۱ رقم) | شماره موبایل مدیر که کد برای آن ارسال شده |
| `code` | `string` | **بله** | رشته عددی دقیقاً ۵ رقم | کد پیامک‌شده به کاربر (اعداد فارسی/عربی خودکار انگلیسی می‌شوند) |

**نمونه بادی درخواست:**
```json
{
  "phoneNumber": "09123456789",
  "code": "58392"
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

در صورت صحت کد و معتبر بودن زمان، سرور پاسخ ۲۰۰ همراه با اطلاعات کاربر و **توکن دسترسی ۳۰ روزه** صادر می‌کند:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "ورود با موفقیت انجام شد",
  "data": {
    "admin": {
      "ID": 1792754892013944000,
      "firstName": "مهدی",
      "lastName": "مالوندی",
      "phoneNumber": "09123456789"
    },
    "token": "0ea76e8c48e4978b295bdb02288e112207ae57a205e667a4072b921ddc4e7965"
  },
  "meta": null
}
```

### ۳.۱. اقدامات موردنیاز فرانت‌اند پس از دریافت پاسخ ۲۰۰:
1. **ذخیره‌سازی توکن:** مقدار `data.token` را در یک مکان امن ذخیره کنید (پیشنهاد: `HttpOnly Cookie` در صورت SSR، یا `localStorage` / حافظه State).
2. **تنظیم هدر پیش‌فرض کلاینت:** برای کلیه درخواست‌های بعدی، مقدار توکن در هدر `Authorization: Bearer <token>` قرار گیرد.
3. **ذخیره‌سازی مشخصات مدیر:** مقدار `data.admin` در کانتکست کاربری (Zustand, Redux, Context API) ذخیره شود.
4. **انتقال به پنل:** کاربر با Router فرانت‌اند به مسیر داشبورد مدیریت (مثلاً `/admin/dashboard`) هدایت شود.

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidOTP` | کد تایید وارد شده صحیح نیست | کد ۵ رقمی واردشده با کد ارسالی مطابقت ندارد. اینپوت کد قرمز شود و کاربر مجدداً امتحان کند (محدودیت تعداد بار در ورود اشتباه وجود ندارد). |
| `400 Bad Request` | `otpExpired` | کد تایید منقضی شده است | بیش از ۱۲۰ ثانیه از ارسال کد گذشته است. فرم به حالت ارسال مجدد کد بازگردد. |
| `404 Not Found` | `userNotFound` | کاربر مورد نظر یافت نشد | شماره ثبت‌شده معتبر نیست. |
| `400 Bad Request` | `validationFailed` | اعتبارسنجی داده‌ها با خطا مواجه شد | طول کد ۵ رقم نیست یا فرمت شماره ناقص ارسال شده است. |

### ۴.۱. نمونه پاسخ خطای کد اشتباه (400):
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "invalidOTP",
    "message": "کد تایید وارد شده صحیح نیست",
    "details": null
  }
}
```

### ۴.۲. نمونه پاسخ خطای انقضای کد تایید (400):
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "otpExpired",
    "message": "کد تایید منقضی شده است",
    "details": null
  }
}
```

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

interface VerifyOTPResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    admin: {
      ID: number;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
    token: string;
  };
}

export async function verifyAdminOTP(phoneNumber: string, code: string) {
  const response = await axios.post<VerifyOTPResponse>(
    "http://localhost:8080/api/v1/auth/admin/otp/verify",
    { phoneNumber, code }
  );

  const { token, admin } = response.data.data;

  // ۱. ذخیره توکن
  localStorage.setItem("admin_token", token);

  // ۲. تنظیم پیش‌فرض هدر Axios
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  return { token, admin };
}
```
