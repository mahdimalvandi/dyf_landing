# مستند API: دریافت فهرست لینک‌های دسترسی (Get Access Links List)
**مسیر:** `docs/apiDocs/links/list.md`  
**خانواده API:** لینک‌های دسترسی اختصاصی (`links`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه مدیریت لینک‌های دسترسی در پنل ادمین (`/admin/links`):**
  - نمایش جدول لینک‌های صادرشده، نام دریافت‌کننده، وضعیت، کد ترتیبی و مدت زمان مشاهده.
  - کپی کردن آسان آدرس لینک کاتالوگ (`/catalog/:token`) با یک کلیک جهت ارسال به خریدار در پیام‌رسان‌ها.
  - فیلتر بر اساس وضعیت لینک (`status`: `all`, `active`, `pending`, `expired`, `inactive`).
  - فیلتر لینک‌های صادرشده برای یک مشتری خاص (`customerID`).
  - جستجوی متنی در نام گیرنده، شماره تماس یا کد عددی لینک (`search`).
  - صفحه‌بندی استاندارد با استفاده از اطلاعات `pagination`.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/links`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای کوئری (Query Parameters)
| پارامتر | نوع داده | پیش‌فرض | الزامی | توضیحات |
|:---|:---:|:---:|:---:|:---|
| `page` | `int` | `1` | خیر | شماره صفحه |
| `limit` | `int` | `12` | خیر | تعداد رکورد در هر صفحه (حداکثر ۵۰) |
| `search` | `string` | - | خیر | جستجو در نام گیرنده، شماره تماس یا کد کارگاهی عددی `linkID` |
| `status` | `string` | `all` | خیر | فیلتر وضعیت: `active`, `pending`, `expired`, `inactive` یا `all` |
| `customerID` | `int64` | `0` | خیر | فیلتر پیوندهای اختصاص‌یافته به یک مشتری خاص |

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "فهرست لینک‌های دسترسی با موفقیت دریافت شد",
  "data": {
    "items": [
      {
        "ID": 1792780000000000000,
        "linkID": 1,
        "token": "495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
        "url": "/catalog/495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
        "customerID": 1792770000000000000,
        "recipientName": "بوتیک چرم پالادیوم (آقای محمدی)",
        "phoneNumber": "09121112233",
        "authMethod": "DIRECT",
        "shoesCount": 4,
        "viewingDurationMinutes": 1440,
        "expiresAt": 1793380000,
        "firstViewedAt": 0,
        "viewingExpiresAt": 0,
        "isActive": true,
        "status": "PENDING"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 1,
      "totalPages": 1
    }
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. کاربر به `/login` هدایت شود. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export interface AccessLinkItem {
  ID: number;
  linkID: number;
  token: string;
  url: string;
  customerID: number;
  recipientName: string;
  phoneNumber: string;
  authMethod: "DIRECT" | "OTP";
  shoesCount: number;
  viewingDurationMinutes: number;
  expiresAt: number;
  firstViewedAt: number;
  viewingExpiresAt: number;
  isActive: boolean;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "INACTIVE";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LinkListResponse {
  items: AccessLinkItem[];
  pagination: Pagination;
}

export async function fetchLinks(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerID?: number;
}): Promise<LinkListResponse> {
  const token = localStorage.getItem("admin_token");
  const response = await axios.get<{ data: LinkListResponse }>(
    "http://localhost:8080/api/v1/links",
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
