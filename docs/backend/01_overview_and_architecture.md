# سند تحلیلی و معماری بک‌اند کاتالوگ خصوصی DYF
**نسخه سند:** ۱.۰  
**وضعیت:** مصوب برای شروع زیرساخت بک‌اند  
**مخاطبان:** توسعه‌دهندگان Go، معماران نرم‌افزار و هوش‌های مصنوعی همکار (AI Agents)

---

## ۱. معرفی و اهداف فنی سامانه

سامانه **DYF Private Catalog** یک پلتفرم اختصاصی B2B برای برند لوکس چرم DYF است. هدف این سامانه ارائه دسترسی کنترل‌شده، امن، زمان‌دار و سفارشی‌شده به بنکداران، بوتیک‌داران و همکاران تجاری منتخب جهت مشاهده ژورنال و مشخصات فنی مدل‌های کفش است.

### تفاوت‌های بنیادین این سامانه با فروشگاه‌های اینترنتی رایج:
1. **عدم وجود سبد خرید، فرآیند تسویه‌حساب (Checkout) و درگاه پرداخت آنلاین.**
2. **عدم نمایش مدل‌ها به عموم:** مشاهده محصولات منوط به داشتن مجوز دسترسی معتبر (Direct Access یا Tokenized Access Link) است.
3. **انتشار مستقیم و دائمی:** مدل‌ها در وضعیت پیش‌نویس یا آرشیو قرار نمی‌گیرند؛ هر مدلی که ثبت شود منتشر و فعال است و فیلتر شدن آن صرفاً از طریق ماتریس مجوز دسترسی مشتری/لینک صورت می‌گیرد.
4. **سیستم زمان‌بندی پویا سمت سرور:** تایمر مشاهده از لحظه اولین ورود موفق فعال شده و میان تمام دستگاه‌های کاربر به صورت سرور-محور همگام است.

---

## ۲. پشته فناوری (Tech Stack)

| بخش | فناوری انتخابی | دلایل و الزامات انتخاب |
| :--- | :--- | :--- |
| **زبان برنامه‌نویسی** | **Go (Golang)** نسخه 1.22+ | سرعت اجرای بالا، مصرف بهینه منابع، تایپ‌استاتیک قوی و ساختار Concurrency عالی |
| **وب‌فریمورک** | **Fiber v2** (`github.com/gofiber/fiber/v2`) | مبتنی بر Fasthttp، فوق‌العاده سریع، سینتکس مشابه Express، اکوسیستم قدرتمند میدلورها |
| **ORM / Data Access** | **GORM v2** (`gorm.io/gorm`) | قابلیت انعطاف بالا، تعریف روابط (Associations)، پشتیبانی از مایگریشن و سفارشی‌سازی Naming Strategy |
| **قالب تبادل داده** | **JSON** | استاندارد یکپارچه تمامی درخواست‌ها و پاسخ‌ها |
| **پایگاه داده اصلی** | **PostgreSQL** نسخه 15+ | پشتیبانی از داده‌های ساختاریافته، روابط رابطه‌ای دقیق و انواع داده‌های پیشرفته مانند JSONB و Arrays |
| **کش و سشن (اختیاری/پیشنهادی)** | **Redis / In-Memory Store** | برای کنترل نشست‌های فعال، مدیریت زمان باقی‌مانده و توکن‌های OTP موقت |

---

## ۳. معماری سیستم: معماری لایه‌ای ساده و ماژولار (Layered Architecture)

با توجه به این‌که تعداد اندپوینت‌های سامانه متوسط و متمرکز است، از ایجاد لایه‌های بیش‌ازحد انتزاعی (Over-Engineering) خودداری شده و از **معماری لایه‌ای تمیز (Layered Architecture)** استفاده می‌شود. جریان داده همواره یک‌طرفه و شفاف است:

```
                  ┌────────────────────────────────────────┐
                  │          HTTP Request (JSON)           │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │              Fiber Router              │
                  │         (Middlewares, Auth, CORS)      │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             Handler Layer              │
                  │   - Parsing Request (DTO)              │
                  │   - Validation (go-playground/validator)│
                  │   - Standard Response Formatting       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             Service Layer              │
                  │   - Core Business Logic & Rules        │
                  │   - Access Matrix Formula Calculation  │
                  │   - OTP & Time Session Management      │
                  │   - Transaction Coordination           │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │            Repository Layer            │
                  │   - GORM Database Operations           │
                  │   - Query Optimization & Preloads      │
                  │   - DB-specific implementations        │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          PostgreSQL Database           │
                  └────────────────────────────────────────┘
```

### وظایف هر لایه:

1. **لایه Handler (کنترلرها):**
   - دریافت درخواست HTTP و تبدیل Body/Params به Struct ورودی (DTO).
   - اعتبارسنجی اولیه ساختار داده‌ها.
   - فراخوانی متد لایه Service مربوطه.
   - ارسال پاسخ یکنواخت با کد وضعیت مناسب (HTTP Status Code).
   - **قانون:** این لایه هیچ منطق تجاری (Business Logic) یا کوئری دیتابیس ندارد.

2. **لایه Service (منطق تجاری):**
   - پیاده‌سازی فرمول‌های دسترسی، اعتبارسنجی قواعد تجاری (مثلاً عدم تکراری بودن شماره تلفن، معتبر بودن زمان لینک، اولویت استثنائات مدل بر دسته‌بندی).
   - هماهنگ‌سازی چند عملیات دیتابیسی در قالب تراکنش (Transaction).
   - مدیریت چرخه حیات سشن و زمان‌سنج مشاهده.
   - مستقل از فریمورک Fiber (قابلیت تست‌یونیت آسان).

3. **لایه Repository (داده‌ها):**
   - ارتباط مستقیم با GORM و اجرای کوئری‌های CRUD.
   - تعامل با دیتابیس و نگاشت رکوردها به ساختارهای دامنه (Entities).

---

## ۴. استانداردهای نام‌گذاری و قراردادهای فنی (Naming Conventions)

طبق دستور صریح محصول، **تمامی نام‌گذاری‌ها در سراسر پروژه باید به صورت camelCase باشند:**

### ۴.۱. نام‌گذاری فیلدهای JSON و درخواست‌ها/پاسخ‌ها:
تمامی فیلدها با فرمت **camelCase** ارسال و دریافت می‌شوند:
```json
{
  "shoeTitle": "کفش چرم رسمی مدل ونیز",
  "categoryId": 3,
  "phoneNumber": "09121234567",
  "accessDurationMinutes": 120,
  "expiresAt": "2026-11-01T12:00:00Z"
}
```

### ۴.۲. نام‌گذاری جداول و ستون‌های دیتابیس (GORM Naming Strategy):
برخلاف حالت پیش‌فرض GORM که از `snake_case` استفاده می‌کند، در این پروژه جداول و فیلدها در پایگاه‌داده به صورت **camelCase** ذخیره می‌شوند (در PostgreSQL این ستون‌ها با دابل کوتیشن کوئری می‌شوند):
- نام ستون‌ها: `shoeTitle`, `phoneNumber`, `createdAt`, `isActive`, `categoryIds`
- نام جداول: `shoeModels`, `categories`, `customers`, `accessLinks`, `accessPermissions`
- در Go Structها از تگ ستون صریح یا تنظیم `schema.NamingStrategy` سفارشی در GORM استفاده می‌شود:
```go
type ShoeModel struct {
    ID          uint      `gorm:"primaryKey;column:id" json:"id"`
    ShoeTitle   string    `gorm:"column:shoeTitle;not null" json:"shoeTitle"`
    Description string    `gorm:"column:description" json:"description"`
    CreatedAt   time.Time `gorm:"column:createdAt" json:"createdAt"`
}
```

### ۴.۳. متغیرها و توابع در کدهای Go:
- اسامی متغیرها و فیلدهای داخلی توابع: `camelCase` (مثال: `customerRepo`, `tokenString`, `remainingSeconds`).
- اسامی توابع و Structهای عمومی (Exported): `PascalCase` بر اساس اصول زبان Go.
- اسامی فیلدهای Struct عمومی: `PascalCase` همراه با تگ‌های `json:"camelCase"` و `gorm:"column:camelCase"`.

---

## ۵. استاندارد یکپارچه پاسخ‌ها و خطاهای API (Response Envelope)

کلیه پاسخ‌های خروجی سرور باید در قالبی واحد و بدون استثنا به کلاینت تحویل داده شوند تا فرانت‌اند بتواند با یک اینترسپتور ساده تمامی پاسخ‌ها را تحلیل کند.

### ۵.۱. پاسخ موفق (Success Response):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "عملیات با موفقیت انجام شد",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```
*(فیلد `meta` برای لیست‌های دارای صفحه‌بندی ارسال می‌شود و در پاسخ‌های تکی `null` است).*

### ۵.۲. پاسخ خطا (Error Response):
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "شماره تلفن وارد شده نامعتبر است",
    "details": [
      {
        "field": "phoneNumber",
        "issue": "شماره تلفن باید با ۰۹ شروع شده و ۱۱ رقمی باشد"
      }
    ]
  }
}
```

### کدهای خطای استاندارد سامانه (`error.code`):
- `UNAUTHORIZED`: عدم ارسال توکن یا توکن نامعتبر
- `FORBIDDEN`: عدم دسترسی به منبع درخواستی
- `NOT_FOUND`: رکورد مورد نظر یافت نشد
- `VALIDATION_FAILED`: خطای اعتبارسنجی فیلدهای ورودی
- `OTP_EXPIRED`: کد تایید منقضی شده است
- `OTP_INVALID`: کد تایید وارد شده نادرست است
- `LINK_EXPIRED`: مدت زمان مشاهده یا تاریخ انقضای لینک به پایان رسیده است
- `LINK_INACTIVE`: لینک توسط مدیر غیرفعال شده است
- `CUSTOMER_INACTIVE`: حساب مشتری غیرفعال است
- `INTERNAL_SERVER_ERROR`: خطای پیش‌بینی نشده سمت سرور

---

## ۶. ساختار درختی پروژه (Project Directory Structure)

```text
backend/
├── cmd/
│   ├── server/
│   │   └── main.go                 # نقطه ورود وب‌سرور Fiber
│   └── migrate/
│       └── main.go                 # سرویس/CLI اجرای مایگریشن‌های دیتابیس
├── config/
│   └── config.go                   # لود تنظیمات از .env و متغیرهای محیطی
├── internal/
│   ├── entity/                     # تعاریف Struct موجودیت‌های دامنه
│   │   ├── admin.go
│   │   ├── shoeModel.go
│   │   ├── category.go
│   │   ├── customer.go
│   │   ├── accessLink.go
│   │   ├── accessPermission.go
│   │   └── session.go
│   ├── dto/                        # ساختارهای ورودی/خروجی درخواست‌ها (Data Transfer Objects)
│   │   ├── authDto.go
│   │   ├── shoeDto.go
│   │   ├── customerDto.go
│   │   └── linkDto.go
│   ├── handler/                    # کنترلرهای HTTP با فریمورک Fiber
│   │   ├── authHandler.go
│   │   ├── shoeHandler.go
│   │   ├── categoryHandler.go
│   │   ├── customerHandler.go
│   │   ├── linkHandler.go
│   │   └── catalogHandler.go
│   ├── service/                    # منطق تجاری و قوانین محصول
│   │   ├── authService.go
│   │   ├── shoeService.go
│   │   ├── categoryService.go
│   │   ├── customerService.go
│   │   ├── linkService.go
│   │   └── catalogService.go
│   ├── repository/                 # لایه تعامل با دیتابیس GORM
│   │   ├── shoeRepo.go
│   │   ├── categoryRepo.go
│   │   ├── customerRepo.go
│   │   ├── linkRepo.go
│   │   └── sessionRepo.go
│   └── middleware/                 # میدلورهای Fiber (Auth, CORS, Logger, RateLimit)
│       ├── authAdmin.go
│       ├── authCatalog.go
│       └── errorHandler.go
├── migrations/                     # فایل‌های مایگریشن SQL (رو به جلو و برگشت)
│   ├── 000001_create_admins.up.sql
│   ├── 000001_create_admins.down.sql
│   ├── 000002_create_categories.up.sql
│   ├── 000002_create_categories.down.sql
│   ├── 000003_create_shoe_models.up.sql
│   ├── 000003_create_shoe_models.down.sql
│   ├── 000004_create_customers.up.sql
│   ├── 000004_create_customers.down.sql
│   ├── 000005_create_access_links.up.sql
│   ├── 000005_create_access_links.down.sql
│   └── ...
├── pkg/                            # بسته‌های کمکی مستقل (Utils)
│   ├── database/
│   │   ├── postgres.go             # کانکشن GORM با تنظیمات camelCase
│   │   └── migrator.go             # ابزار خواندن و اجرای فایل‌های migrations
│   ├── response/                   # ابزار ساخت پاسخ‌های استاندارد JSON
│   │   └── response.go
│   ├── validator/                  # کاستوم ولیدیتور شماره تلفن، اسلاگ و...
│   │   └── validator.go
│   ├── token/                      # تولید توکن‌های رندوم کریپتوگرافیک برای لینک‌ها و JWT
│   │   └── token.go
│   └── sms/                        # ماژول ارسال پیامک OTP (با قابلیت Mock در حالت توسعه)
│       └── sms.go
├── uploads/                        # دایرکتوری ذخیره فایل‌های مدیا در توسعه لوکال
├── .env.example
├── go.mod
└── go.sum
```
