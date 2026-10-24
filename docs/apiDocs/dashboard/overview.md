# مستند API: پیشخوان و اطلاعات کلی داشبورد (Dashboard Overview)
**مسیر:** `docs/apiDocs/dashboard/overview.md`  
**خانواده API:** پیشخوان مدیریت (`dashboard`)  
**دسترسی:** محافظت‌شده (نیازمند توکن معتبر ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه اصلی پنل مدیریت (`/admin/dashboard` یا `/admin`):**
  - به محض ورود مدیر به پنل، فرانت‌اند این اندپوینت یکپارچه را فراخوانی می‌کند.
  - با یک درخواست واحد و بدون نیاز به فراخوانی‌های متعدد و آبشاری (Waterfall):
    1. مقادیر کارت‌های ۴ گانه شاخص‌های کلیدی (مدل‌های فعال، مشتریان، پیوندهای معتبر، بازدیدهای ۷ روز اخیر) مقداردهی می‌شوند.
    2. جدول یا کارت‌های «۵ لینک دسترسی اختصاصی اخیر» پر می‌شوند.
    3. فهرست «۴ مشتری فعال اخیر» مقداردهی می‌شود.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/dashboard`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **کوئری پارامتر:** ندارد.

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات داشبورد با موفقیت دریافت شد",
  "data": {
    "stats": {
      "activeShoesCount": 24,
      "totalCustomersCount": 18,
      "activeLinksCount": 7,
      "last7DaysViewsCount": 14
    },
    "recentLinks": [
      {
        "ID": 1792780000000000000,
        "linkID": 5,
        "token": "495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
        "url": "/catalog/495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2",
        "recipientName": "بوتیک چرم پالادیوم VIP",
        "phoneNumber": "09121112233",
        "shoesCount": 3,
        "viewingDurationMinutes": 1440,
        "expiresAt": 1793500000,
        "firstViewedAt": 1792800000,
        "viewingExpiresAt": 1792886400,
        "lastAccessedAt": 1792800000,
        "isActive": true,
        "status": "ACTIVE"
      }
    ],
    "recentCustomers": [
      {
        "ID": 1792770000000000000,
        "firstNameFa": "علی",
        "lastNameFa": "محمدی",
        "firstNameEn": "Ali",
        "lastNameEn": "Mohammadi",
        "storeName": "بوتیک چرم پالادیوم",
        "phoneNumber": "09121112233",
        "isActive": true
      }
    ]
  },
  "meta": null
}
```

### ۳.۱. توضیحات فیلدهای پاسخ

#### الف) آبجکت `stats` (کارت‌های آماری):
| فیلد | نوع | توضیحات |
|:---|:---:|:---|
| `activeShoesCount` | `int64` | مجموع مدل‌های کفش ثبت‌شده و قابل مشاهده در کارگاه |
| `totalCustomersCount` | `int64` | مجموع مشتریان و همکاران تجاری ثبت‌شده |
| `activeLinksCount` | `int64` | تعداد لینک‌های فعال، معتبر و منقضی‌نشده |
| `last7DaysViewsCount` | `int64` | تعداد لینک‌هایی که طی ۷ روز گذشته باز و مشاهده شده‌اند |

#### ب) آرایه `recentLinks` (۵ لینک اخیر):
| فیلد | نوع | توضیحات |
|:---|:---:|:---|
| `ID` | `int64` | شناسه نانوثانیه‌ای رکورد لینک |
| `linkID` | `int64` | شناسه ترتیبی و خوانای لینک (`1, 2, ...`) |
| `token` | `string` | توکن یکتای لینک |
| `url` | `string` | آدرس نسبی ورود به کاتالوگ (`/catalog/:token`) |
| `recipientName` | `string` | نام یا عنوان گیرنده لینک |
| `phoneNumber` | `string` | شماره موبایل گیرنده (در صورت وجود) |
| `shoesCount` | `int` | تعداد کفش‌های تخصیص‌یافته به لینک |
| `viewingDurationMinutes` | `int` | مهلت زمان مشاهده پس از اولین ورود (به دقیقه) |
| `expiresAt` | `int64` | تایم‌استمپ یونیکس انقضای کلی لینک (0 = نامحدود) |
| `firstViewedAt` | `int64` | تایم‌استمپ یونیکس اولین ورود (0 = هنوز باز نشده) |
| `viewingExpiresAt` | `int64` | تایم‌استمپ یونیکس پایان مهلت مشاهده |
| `lastAccessedAt` | `int64` | تایم‌استمپ یونیکس آخرین بار باز شدن لینک |
| `isActive` | `bool` | وضعیت فعال بودن لینک |
| `status` | `string` | وضعیت لینک (`PENDING`, `ACTIVE`, `EXPIRED`, `INACTIVE`) |

#### ج) آرایه `recentCustomers` (۴ مشتری فعال اخیر):
| فیلد | نوع | توضیحات |
|:---|:---:|:---|
| `ID` | `int64` | شناسه سیستمی مشتری |
| `firstNameFa` | `string` | نام فارسی |
| `lastNameFa` | `string` | نام خانوادگی فارسی |
| `firstNameEn` | `string` | نام انگلیسی |
| `lastNameEn` | `string` | نام خانوادگی انگلیسی |
| `storeName` | `string` | نام فروشگاه یا بنکداری |
| `phoneNumber` | `string` | شماره تلفن همراه مشتری |
| `isActive` | `bool` | وضعیت فعال بودن حساب |

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین در هدر Authorization ارسال نشده یا نامعتبر است. کاربر به `/login` هدایت شود. |
| `500 Internal Server Error` | `internalServerError` | خطای غیرمنتظره در سرور رخ داد | خطای دیتابیس یا سرور هنگام محاسبه شاخص‌ها. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript Interface)

```typescript
export interface DashboardStats {
  activeShoesCount: number;
  totalCustomersCount: number;
  activeLinksCount: number;
  last7DaysViewsCount: number;
}

export interface DashboardRecentLink {
  ID: number;
  linkID: number;
  token: string;
  url: string;
  recipientName: string;
  phoneNumber: string;
  shoesCount: number;
  viewingDurationMinutes: number;
  expiresAt: number;
  firstViewedAt: number;
  viewingExpiresAt: number;
  lastAccessedAt: number;
  isActive: boolean;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "INACTIVE";
}

export interface DashboardRecentCustomer {
  ID: number;
  firstNameFa: string;
  lastNameFa: string;
  firstNameEn: string;
  lastNameEn: string;
  storeName: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLinks: DashboardRecentLink[];
  recentCustomers: DashboardRecentCustomer[];
}
```
