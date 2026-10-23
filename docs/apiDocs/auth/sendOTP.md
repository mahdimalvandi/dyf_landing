# مستند API: ارسال کد تایید ورود مدیر (Send OTP)
**مسیر:** `docs/apiDocs/auth/sendOTP.md`  
**خانواده API:** احراز هویت (`auth`)  
**دسترسی:** عمومی (بدون نیاز به توکن)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه ورود مدیر (`/login`):**
  - در مرحله اول فرم ورود، کاربر شماره موبایل خود را وارد کرده و دکمه «ارسال کد تایید» را کلیک می‌کند.
  - این API شماره را بررسی کرده و در صورت صحت، کد تایید ۵ رقمی را از طریق پیامک ارسال می‌کند.
  - همچنین در مرحله دوم فرم ورود، در صورت پایان تایمر معکوس (۱۲۰ ثانیه)، دکمه «ارسال مجدد کد» نیز همین API را مجدداً صدا می‌زند.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/auth/admin/otp/send`
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json
  ```

### ۲.۱. ساختار ورودی (Request Body)
| فیلد | نوع داده | الزامی | اعتبارسنجی در فرانت | توضیحات |
|:---|:---:|:---:|:---|:---|
| `phoneNumber` | `string` | **بله** | فرمت شماره ایران (۱۱ رقم، شروع با `09`) | شماره موبایل مدیر سیستم |

**نمونه بادی درخواست:**
```json
{
  "phoneNumber": "09123456789"
}
```

---

## ۳. پاسخ موفق (Success Response - 200 OK)

در صورت موفقیت، کد وضعیت `200 OK` بازگردانده شده و مدت زمان اعتبار کد بر حسب ثانیه اعلام می‌شود:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "کد تایید با موفقیت ارسال شد",
  "data": {
    "expiresInSeconds": 120
  },
  "meta": null
}
```

### ۳.۱. اقدامات موردنیاز فرانت‌اند پس از دریافت پاسخ ۲۰۰:
1. نمایش پیام موفقیت‌آمیز (`response.message`) در قالب Toast یا SnackBar.
2. ذخیره مقدار `phoneNumber` در استیت فرم.
3. راه‌اندازی تایمر معکوس شمارنده به مدت `data.expiresInSeconds` (معادل ۲ دقیقه).
4. غیرفعال کردن دکمه ارسال مجدد تا اتمام زمان شمارنده.
5. هدایت کاربر یا تغییر فرم به مرحله دوم (ورود کد OTP).

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `400 Bad Request` | `validationFailed` | اعتبارسنجی داده‌ها با خطا مواجه شد | شماره موبایل واردشده نامعتبر است (زیر اینپوت خطای «شماره موبایل وارد شده معتبر نیست» نشان داده شود). |
| `404 Not Found` | `userNotFound` | کاربر مورد نظر یافت نشد | شماره وارد شده در سیستم به عنوان مدیر ثبت نشده است. نمایش پیام خطا در فرم ورود. |
| `403 Forbidden` | `adminInactive` | حساب کاربری مدیر غیرفعال است | مدیر توسط سیستم یا مدیر ارشد غیرفعال شده است. نمایش هشدار «حساب کاربری شما غیرفعال است، با پشتیبانی تماس بگیرید». |
| `429 Too Many Requests` | `otpCooldownActive` | لطفاً تا پایان زمان انتظار شکیبا باشید | کاربر قبل از اتمام ۱۲۰ ثانیه مجدداً درخواست ارسال کرده است. دکمه ارسال مجدد غیرفعال شود. |
| `429 Too Many Requests` | `tooManyRequests` | تعداد درخواست‌های بیش از حد مجاز، لطفاً بعداً تلاش کنید | بیش از ۳ بار در بازه ۱۰ دقیقه درخواست کد ارسال شده است. |
| `502 Bad Gateway` | `smsDeliveryFailed` | خطا در ارسال پیامک، لطفاً لحظاتی دیگر تلاش کنید | سرویس‌دهنده پیامک پاسخ نداده است. از کاربر بخواهید چند لحظه بعد مجدداً تلاش کند. |

### ۴.۱. نمونه پاسخ خطای اعتبارسنجی فرمت شماره موبایل (400):
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "validationFailed",
    "message": "اعتبارسنجی داده‌ها با خطا مواجه شد",
    "details": [
      {
        "field": "phoneNumber",
        "tag": "iran_phone",
        "message": "فرمت شماره تلفن همراه معتبر نیست (باید ۱۱ رقم و با ۰۹ شروع شود)"
      }
    ]
  }
}
```

### ۴.۲. نمونه پاسخ خطای عدم ثبت کاربر (404):
```json
{
  "success": false,
  "statusCode": 404,
  "error": {
    "code": "userNotFound",
    "message": "کاربر مورد نظر یافت نشد",
    "details": null
  }
}
```

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

interface SendOTPResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    expiresInSeconds: number;
  };
}

export async function requestAdminOTP(phoneNumber: string): Promise<number> {
  try {
    const response = await axios.post<SendOTPResponse>(
      "http://localhost:8080/api/v1/auth/admin/otp/send",
      { phoneNumber }
    );
    return response.data.data.expiresInSeconds;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error("خطا در برقراری ارتباط با سرور");
  }
}
```
