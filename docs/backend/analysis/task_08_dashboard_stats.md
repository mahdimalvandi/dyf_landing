# سند تحلیل فنی تسک ۸: پیشخوان و آمار کلی داشبورد پنل مدیریت (Dashboard Statistics)
**مسیر سند:** `docs/backend/analysis/task_08_dashboard_stats.md`  
**وضعیت:** در انتظار بازبینی و تأیید نهایی کاربر (Pending User Review)  
**نسخه:** ۱.۰  

---

## ۱. هدف و چشم‌انداز محصولی (Product Vision & Goals)

صفحه پیشخوان (داشبورد) اولین صفحه‌ای است که مدیر پس از ورود موفق به پنل مدیریت مشاهده می‌کند.  
هدف این بخش، ارائه یک دید متمرکز، شفاف و در یک نگاه از وضعیت حیاتی کارگاه DYF، مشتریان B2B، پیوندهای فعال و میزان استقبال از کاتالوگ است.

برای جلوگیری از ارسال ریکوئست‌های متعدد و آبشاری (Waterfall Requests) توسط فرانت‌اند به هنگام لود صفحه نخست، یک خانواده اختصاصی جدید به نام **`dashboard`** با یک اندپوینت تجمیعی، فوق‌سریع و سبک پیاده‌سازی می‌شود:
`GET /api/v1/dashboard`

خروجی این اندپوینت شامل دو بخش اصلی است:
1. **کارت‌های شاخص‌های کلیدی (KPI Cards):**
   - **`activeShoesCount`:** مجموع کل مدل‌های کفش منتشرشده و قابل‌مشاهده در کارگاه.
   - **`totalCustomersCount`:** مجموع کل مشتریان و همکاران تجاری ثبت‌شده در سیستم.
   - **`activeLinksCount`:** تعداد لینک‌های کاتالوگی که در حال حاضر فعال و معتبر هستند (وضعیت `isActive = true` و نگذشتن از مهلت تاریخ انقضا و سقف مهلت مشاهده).
   - **`last7DaysViewsCount`:** تعداد دفعات مشاهده لینک‌های کاتالوگ در ۷ روز گذشته (مبتنی بر فیلد `lastAccessedAt` پیاده‌سازی‌شده در تسک ۷).
2. **فهرست‌های دسترسی سریع و فعالیت‌های اخیر (Recent Activities):**
   - **`recentLinks` (۵ لینک اخیر):** آخرین پیوندهای صادرشده همراه با شناسه `linkID`، نام گیرنده، وضعیت لینک، مدت زمان مشاهده و زمان آخرین مراجعه (`lastAccessedAt`).
   - **`recentCustomers` (۴ مشتری اخیر):** آخرین مشتریان فعال سیستم همراه با نام، نام فروشگاه/بنکداری، شماره تلفن همراه و وضعیت حساب.

---

## ۲. تحلیل پایگاه داده (Database Analysis)

داشبورد یک ماژول تجمیعی (Aggregation & Reporting) است و داده‌های زنده را از جداول موجود استخراج می‌کند:
- جدول مدل‌های کفش: `"shoeModels"`
- جدول مشتریان: `"customers"`
- جدول پیوندهای اختصاصی: `"accessLinks"`

**نیازمندی پایگاه داده:**  
هیچ جدول یا فیلد جدیدی نیاز نیست و **هیچ فایل مایگریشن جدیدی ایجاد نمی‌شود** (Zero Database Overhead).

---

## ۳. طراحی روت‌ها و قرارداد APIها (API Contracts)

خانواده مسیر: `/api/v1/dashboard`  
**دسترسی:** کاملاً محافظت‌شده (نیازمند توکن ادمین در هدر Authorization با میدل‌ویر `RequireAdminAuth`).

### ۳.۱. جدول خلاصه مسیرها
| متد | مسیر (Endpoint) | دسترسی | شرح عملکرد |
|:---:|:---|:---:|:---|
| `GET` | `/api/v1/dashboard` | ادمین (`Bearer Token`) | دریافت یکپارچه شاخص‌های آماری کارت‌ها و آخرین فعالیت‌های لینک‌ها و مشتریان |

---

### ۳.۲. جزییات ورودی و خروجی Endpoint

#### مشخصات درخواست (`GET /api/v1/dashboard`)
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```
- **کوئری پارامتر:** ندارد (بدون پارامتر و فوق‌سریع).

#### پاسخ موفق (200 OK):
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
        "recipientName": "بوتیک چرم پالادیوم",
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

---

## ۴. معماری جریان داده و لایه‌بندی ماژول (`dashboard`)

طبق استانداردهای معماری خانواده‌های API:
```text
backend/
├── internal/
│   ├── dto/
│   │   └── dashboard/
│   │       ├── response.go         # ساختارهای DashboardResponse، DashboardStats، RecentLinkItem، RecentCustomerItem
│   │       └── recievers.go        # توابع نگاشت و تبدیل
│   ├── repository/
│   │   └── dashboard/
│   │       └── repository.go       # کوئری‌های بهینه دیتابیس برای شمارش و استخراج موارد اخیر
│   ├── service/
│   │   └── dashboard/
│   │       ├── service.go          # تعریف Service و NewService
│   │       └── overview.go         # لاجیک تجمیع شاخص‌ها و فعالیت‌ها با زمان‌بندی ۷ روزه
│   ├── handler/
│   │   └── dashboard/
│   │       ├── handler.go          # تعریف Handler و NewHandler
│   │       └── overview.go         # کنترلر GetOverview (Fiber Ctx)
│   └── cmd/server/routes/
│       └── dashboard.go            # رجیستری روت با میدل‌ویر RequireAdminAuth
└── statics/
    └── constants/
        └── dashboard/
            └── constants.go        # پیام‌های موفقیت و محدودیت‌های نمایش (۵ لینک، ۴ مشتری، ۷ روز)
```

### ۴.۱. وظایف لایه Repository (`internal/repository/dashboard/repository.go`)
برای حداکثر کارایی و پرهیز از وابستگی‌های متقاطع، ریپازیتوری داشبورد متدهای زیر را مستقیماً روی اتصال دیتابیس اجرا می‌کند:
1. `CountActiveShoes() (int64, error)`: شمارش مدل‌های کفش در جدول `"shoeModels"`.
2. `CountTotalCustomers() (int64, error)`: شمارش تعداد مشتریان در جدول `"customers"`.
3. `CountActiveValidLinks(currentTimestamp int64) (int64, error)`: شمارش لینک‌های معتبر با شرط:
   `"isActive" = true AND ("expiresAt" = 0 OR "expiresAt" > currentTimestamp) AND ("viewingExpiresAt" = 0 OR "viewingExpiresAt" > currentTimestamp)`
4. `CountAccessedLinksSince(sinceTimestamp int64) (int64, error)`: شمارش با شرط `"lastAccessedAt" >= sinceTimestamp`.
5. `FindRecentLinks(limit int) ([]entityLink.AccessLink, error)`: ۵ لینک آخر مرتب‌شده با `"linkID" DESC`.
6. `FindRecentActiveCustomers(limit int) ([]entityCustomer.Customer, error)`: ۴ مشتری فعال آخر با شرط `"isActive" = true` مرتب‌شده با `"ID" DESC`.

---

## ۵. کلیدهای خطا و پیام‌های ثابت

### ۵.۱. کلیدهای خطا
این اندپوینت از خطاهای عمومی موجود پروژه (`Unauthorized`, `InternalServerError`) استفاده می‌کند و به کلید خطای جدیدی نیاز ندارد.

### ۵.۲. ثابت‌های اختصاصی در `statics/constants/dashboard/constants.go`:
```go
const (
    MsgDashboardDataFetched = "اطلاعات داشبورد با موفقیت دریافت شد"

    RecentLinksLimit       = 5
    RecentCustomersLimit   = 4
    DashboardStatsDaysSpan = 7
)
```

---

## ۶. سناریوهای تست و حالت‌های لبه (Test Scenarios & Edge Cases)

1. **احراز هویت ادمین:** فراخوانی بدون توکن یا با توکن نامعتبر باید خطای `401 Unauthorized` بازگرداند.
2. **پاسخ موفق تجمیعی (200 OK):** بررسی حضور همزمان آبجکت `stats` و آرایه‌های `recentLinks` و `recentCustomers`.
3. **دقت شمارنده‌های کارت‌ها:**
   - تعداد کفش‌ها برابر کل مدل‌های ثبت‌شده در کارگاه باشد.
   - تعداد مشتریان برابر کل مشتریان سیستم باشد.
   - لینک‌های منقضی‌شده یا غیرفعال در شمارش `activeLinksCount` لحاظ نشوند.
   - شمارش `last7DaysViewsCount` تنها لینک‌هایی را در بر گیرد که `lastAccessedAt` آن‌ها در بازه ۷ روز اخیر باشد.
4. **تعداد آیتم‌های اخیر:** حداکثر ۵ لینک در `recentLinks` و حداکثر ۴ مشتری در `recentCustomers` برگردانده شود.
5. **داشبورد با دیتابیس خالی:** در صورت خالی بودن دیتابیس، شمارنده‌ها صفر و آرایه‌ها خالی (`[]`) باشند (بدون خطای `null pointer` یا `500`).
