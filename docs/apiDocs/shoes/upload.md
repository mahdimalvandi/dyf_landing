# مستند API: بارگذاری رسانه کارگاهی (Upload Shoe Media)
**مسیر:** `docs/apiDocs/shoes/upload.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** محافظت‌شده (نیاز به توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **کامپوننت File Uploader در فرم ثبت/ویرایش کفش:**
  - مدیر یک یا چند فایل عکس یا ویدیو را در کادر آپلود Drag & Drop کرده یا انتخاب می‌کند.
  - فرانت‌اند به ازای هر فایل، این API را فراخوانی می‌کند.
  - سرور فایل را با نام رندوم و امن روی دیسک ذخیره کرده و آدرس عمومی استاتیک بازمی‌گرداند.
  - آدرس برگشتی در آرایه `images` یا `videos` فرم قرار می‌گیرد و پیش‌نمایش آن به کاربر نشان داده می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `POST`
- **مسیر (URL):** `/api/v1/shoes/upload`
- **هدرهای الزامی:**
  ```http
  Content-Type: multipart/form-data
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **فیلد فرم (`Form Data`):**
  - `file`: فایل تصویر یا ویدیو.

### ۲.۱. قوانین اعتبارسنجی فایل
- **تصاویر مجاز:** پسوندهای `.jpg`, `.jpeg`, `.png`, `.webp` (حداکثر حجم ۱۰ مگابایت).
- **ویدیوهای مجاز:** پسوندهای `.mp4`, `.mov`, `.webm` (حداکثر حجم ۵۰ مگابایت).

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "فایل رسانه با موفقیت بارگذاری شد",
  "data": {
    "url": "/uploads/shoes/1792761483100_3421.jpg",
    "fileType": "image",
    "fileSize": 1420580
  },
  "meta": null
}
```

*آدرس فایل به صورت مستقیم در تگ `<img>` یا `<video>` قابل استفاده است: `http://localhost:8080/uploads/shoes/...`*

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد |
|:---:|:---|:---|:---|
| `400 Bad Request` | `invalidMediaFile` | فرمت فایل ارسالی مجاز نمی‌باشد (تنها تصاویر و ویدیوهای استاندارد) | فایلی با پسوند غیرمجاز (مثلاً zip، pdf یا exe) ارسال شده است. |
| `400 Bad Request` | `mediaSizeExceeded` | حجم فایل بیش از حد مجاز است | حجم تصویر بیش از ۱۰ مگابایت یا ویدیو بیش از ۵۰ مگابایت است. |
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی است. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export interface UploadResult {
  url: string;
  fileType: "image" | "video";
  fileSize: number;
}

export async function uploadShoeMedia(file: File): Promise<UploadResult> {
  const token = localStorage.getItem("admin_token");
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<{ data: UploadResult }>(
    "http://localhost:8080/api/v1/shoes/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
