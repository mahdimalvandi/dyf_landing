# سند جامع استانداردهای کدنویسی و معماری بک‌اند (Coding Standards & Architecture)
**نسخه سند:** ۳.۰  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان Go و ایجنت‌های هوش مصنوعی (AI Agents)

---

## ۱. پشته فناوری و ابزارهای هسته (Core Tech Stack)

| بخش | ابزار و نسخه | توضیحات و الزامات فنی |
| :--- | :--- | :--- |
| **زبان** | **Go (Golang) نسخه ۱.۲۶** | استفاده از قابلیت‌های مدرن، بهینه‌سازی زباله‌روب و حداقل حجم کد ممکن |
| **وب‌فریمورک** | **Fiber v3** (`github.com/gofiber/fiber/v3`) | نسخه ۳ مبتنی بر fasthttp، با قابلیت جدید `fiber.Ctx` و متد Binding |
| **پردازشگر JSON** | **jsoniter** (`github.com/json-iterator/go`) | سریع‌ترین پردازشگر JSON متصل به اینکودر و دیکودر Fiber v3 |
| **ORM** | **GORM v2** (`gorm.io/gorm`) | تنظیم NamingStrategy سفارشی camelCase و تگ انحصاری `column` در Structها |
| **پایگاه‌داده** | **PostgreSQL نسخه ۱۵+** | نام کلیه جداول و ستون‌ها در دیتابیس به صورت camelCase و با دابل‌کوتیشن |
| **سیستم مایگریشن** | **golang-migrate** (`github.com/golang-migrate/migrate/v4`) | با لاگ کامل و شفاف تمام خطاها و موفقیت‌ها |
| **اعتبارسنجی** | **validator/v10** | ولیدیشن ساختاریافته فیلدهای ورودی DTO |

---

## ۲. ساختار پروژه‌محور و قانون خانواده‌های API (API Family Architecture)

یکی از اصول ساختاری قطعی این پروژه، **تفکیک پوشه‌ها بر اساس خانواده‌های API (API Families)** است.  
به ازای هر موجودیت/جدول دیتابیس، یک خانواده API داریم (مانند `customer`, `shoes`, `category`, `accessLink`, `auth`, `catalog`).

در تک‌تک لایه‌های زیر یک پوشه به نام آن خانواده API ساخته می‌شود:

### ۲.۱. لایه DTO (`internal/dto/<family>/`)
در پوشه هر خانواده سه فایل استاندارد قرار می‌گیرد:
- **`request.go`:** شامل استراکت‌های ورودی داده به کنترلر (Request Body, Query, Params).
- **`response.go`:** شامل استراکت‌های خروجی پاسخ به کلاینت.
- **`recievers.go`:** شامل متدها و رسیورهایی که برای اعتبارسنجی، تبدیل یا محاسبات روی استراکت‌های Request و Response نوشته می‌شوند.

### ۲.۲. لایه موجودیت دامنه (`internal/entity/<family>/`)
- **`entity.go`:** تعریف دیتامدل و استراکت نگاشت‌شونده به جدول دیتابیس مربوط به آن خانواده.
- تنها تگ مجاز GORM تگ `column` است: `gorm:"column:fieldName"`.
- تمام محدودیت‌های کلید، پیش‌فرض و نات‌نال در مایگریشن‌های SQL تعیین می‌شوند.

### ۲.۳. لایه کنترلر / هندلر (`internal/handler/<family>/`)
- **ساختار تک‌استراکتی خانواده:** در فایل `handler.go`، یک استراکت واحد به نام `Handler` همراه با تابع سازنده `NewHandler(service service.Service)` تعریف می‌شود.
- **روش پیاده‌سازی APIها:** هر API به صورت یک **متد (Receiver)** روی همان استراکت `Handler` تعریف می‌شود و در فایلی مجزا به نام همان عملیات قرار می‌گیرد:
  - `internal/handler/auth/handler.go` (تعریف استراکت `Handler` و متد سازنده)
  - `internal/handler/auth/sendOTP.go` (`func (handler Handler) SendOTP(fiberContext fiber.Ctx) error`)
  - `internal/handler/auth/verifyOTP.go` (`func (handler Handler) VerifyOTP(fiberContext fiber.Ctx) error`)
- **تابع مشترک پردازش ورودی (`request.ParseBody`):** کلیه هندلرها برای عملیات بایندینگ، نرمال‌سازی و اعتبارسنجی ورودی از تابع کمکی سراسری `request.ParseBody(fiberContext, &targetStruct)` استفاده می‌کنند.

### ۲.۴. لایه سرویس (`internal/service/<family>/`)
- **ساختار تک‌استراکتی خانواده:** در فایل `service.go`، یک استراکت واحد به نام `Service` همراه با تابع سازنده `NewService(...)` تعریف می‌شود.
- **روش پیاده‌سازی APIها:** هر API به صورت یک **متد (Receiver)** روی همان استراکت `Service` پیاده‌سازی شده و در فایلی به نام همان عملیات قرار می‌گیرد:
  - `internal/service/auth/service.go` (تعریف استراکت `Service` و متد سازنده)
  - `internal/service/auth/sendOTP.go` (`func (service Service) SendOTP(...) (Response, int, error)`)
- **بازگرداندن StatusCode از لایه سرویس:** لایه سرویس علاوه بر مقدار دیتای خروجی و ارور، کد وضعیت استاندارد HTTP را نیز برمی‌گرداند (`net/http` Status Codes). بدین ترتیب لایه هندلر بدون نیاز به نوشتن زنجیره‌های طویل `if/else`، کد وضعیت را به همراه پاسخ ارسال می‌کند.
- لایه سرویس هیچ وابستگی به فریمورک Fiber ندارد.

### ۲.۵. لایه ریپازیتوری (`internal/repository/<family>/`)
- **ساختار تک‌استراکتی خانواده:** در فایل `repository.go`، استراکت `Repository` و سازنده `NewRepository(databaseConnection *gorm.DB)` قرار دارند و کلیه کوئری‌ها متدهای این استراکت هستند.
- کلیه متدهای جستجوی تک‌رکورد ۳ مقدار بازمی‌گردانند: `(item, found, error)`.

---

## ۳. پوشه `statics/` (مدیریت خطاها، ترجمه فارسی و ثابت‌ها)

پوشه `backend/statics/` برای متمرکزسازی خطاها، متون فارسی و ثابت‌های خانواده‌های API طراحی شده است:

```text
backend/statics/
├── errors/
│   ├── customErrors.go      # تعریف خطاهای استاندارد Go و ثابت‌های کلید خطا
│   └── faTranslation.go     # مپ متناظر ترجمه فارسی پیام‌های خطا
└── constants/
    ├── customer/
    │   └── constants.go     # ثابت‌های اختصاصی خانواده مشتریان
    ├── shoes/
    │   └── constants.go     # ثابت‌های اختصاصی خانواده کفش‌ها
    └── ...
```

### ۳.۱. قوانین سیستم خطاها (`statics/errors/`)
1. **عدم قرار دادن Status Code در تعریف خطا:** خطاهای سیستم صرفاً از جنس `error` استاندارد Go هستند و هیچ کد وضعیت HTTP (مانند 404 یا 400) در زمان تعریف خطا درج نمی‌شود.
2. **الگوی تعریف خطا:**
   - برای هر خطا یک ثابت رشته‌ای camelCase تعریف می‌شود:
     `const UserNotFound = "userNotFound"`
   - ارور متناظر با `errors.New` از روی همان ثابت ساخته می‌شود:
     `var ErrUserNotFound = errors.New(UserNotFound)`
3. **مپ ترجمه فارسی (`faTranslation.go`):**
   - یک مپ به نام `PersianErrorRegistry` با کلید ثابت رشته‌ای خطا و مقدار متن فارسی:
     `UserNotFound: "کاربر مورد نظر یافت نشد"`
4. **جریان رسیدگی به خطا در لایه‌ها:**
   - لایه Service صرفاً خطا را برمی‌گرداند (مثلاً `return ErrUserNotFound`).
   - لایه Handler/Controller هنگام دریافت خطا از سرویس:
     - تعیین می‌کند که این خطا چه HTTP Status Code دارد (مثلاً 404).
     - با استفاده از تابع `response.FromError(fiberContext, statusCode, err, details)`، متن فارسی را از مپ ترجمه استخراج کرده و به کلاینت ارسال می‌کند.

### ۳.۲. پوشه ثابت‌ها (`statics/constants/<family>/constants.go`)
- به ازای هر خانواده API یک پوشه در `statics/constants/` قرار می‌گیرد.
- تمامی ثوابت مرتبط با همان حوزه (مانند وضعیت‌ها، طول‌ها، کدهای اختصاصی) در فایل `constants.go` همان پوشه تعریف می‌شوند.
- **پیام‌های موفقیت‌آمیز به صورت ثابت (Success Message Constants):** تمامی متون پیام‌های موفقیت‌آمیز ارسالی به کلاینت (مانند «کد تایید با موفقیت ارسال شد») باید به صورت ثابت در `constants.go` همان خانواده تعریف شده و در کنترلرها استفاده شوند. هاردکد کردن رشته پیام‌های موفقیت در کنترلرها ممنوع است.

---

## ۴. چرخه راه‌اندازی، `main.go`، `route.go` و `pkg/service/service.go`

برای حفظ سادگی، تمیزی و کاهش حجم کد در نقطه ورود برنامه:

### ۴.۱. وظیفه `cmd/server/main.go`
فایل `main.go` بسیار کم‌حجم و متمرکز است:
1. بارگذاری متغیرهای محیطی از فایل `.env` با `config.Load()`.
2. فراخوانی تابع سازنده `service.New(appConfig)` از پکیج `dyf-backend/pkg/service`. این پکیج مسئول متصل کردن پایگاه‌داده GORM، پیکربندی jsoniter، نمونه‌سازی فریمورک Fiber v3، تنظیم لاگر، ریکاوری، CORS و میدلور تایم‌اوت ۱۰ ثانیه‌ای است.
3. فراخوانی `SetupRoutes(coreService.FiberApp, coreService.DatabaseConnection)`.
4. آغاز به کار سرور روی پورت مشخص‌شده در `.env`.

### ۴.۲. تفکیک و ثبت ماژولار مسیرها (`cmd/server/routes/` و `route.go`)
- برای جلوگیری از شلوغی و تداخل در `route.go`، به ازای هر خانواده API یک فایل در پوشه `cmd/server/routes/` قرار می‌گیرد (مثال: `routes/auth.go`).
- تمامی مراحل آماده‌سازی ریپازیتوری، سرویس و هندلر در تابع `Register<Family>Routes(apiGroup, databaseConnection)` همان فایل انجام می‌شود.
- فایل `cmd/server/route.go` صرفاً توابع ثبت مسیر ماژولار پکیج `routes` را صدا می‌زند:
  ```go
  func SetupRoutes(fiberApp *fiber.App, databaseConnection *gorm.DB) {
      baseHandler := handler.NewBaseHandler()
      apiGroup := fiberApp.Group("/api/v1")
      apiGroup.Get("/health", baseHandler.HealthCheck)

      routes.RegisterAuthRoutes(apiGroup, databaseConnection)
      // routes.RegisterCustomerRoutes(...)
  }
  ```

### ۴.۳. دسترسی سراسری به پیکربندی (`config.Get()`)
- برای جلوگیری از ارسال مکرر شیء کانفیگ در زنجیره ورودی توابع و سازنده‌ها، متد `config.Get()` در دسترس کل پروژه قرار دارد.
- هر سرویس یا پکیجی که به مقادیر محیطی یا تنظیمی نیاز دارد، مستقیماً `config.Get()` را ایمپورت و استفاده می‌کند.

---

## ۵. احراز هویت توکن‌محور با هش MD5 (حذف کامل JWT)

پروژه به هیچ عنوان از توکن‌های بدون وضعیت (JWT) استفاده نمی‌کند:
1. تمامی احراز هویت‌ها بر اساس **توکن تصادفی مات (Opaque Token)** است.
2. سرور هنگام ایجاد توکن، هش **MD5** آن را محاسبه کرده و در دیتابیس (`adminTokens` و `catalogTokens`) ذخیره می‌کند. مقدار خام توکن هرگز در دیتابیس ذخیره نمی‌شود.
3. کاربر توکن خام را در هدر `Authorization: Bearer <token>` ارسال می‌کند.
4. سرور مقدار MD5 هدر را محاسبه کرده و در دیتابیس جستجو می‌کند.

---

## ۶. سیستم مایگریشن و لاگ‌گیری شفاف (`pkg/database/migrator.go`)

- مایگریشن‌ها با استفاده از `golang-migrate` اجرا می‌شوند.
- کلیه خطاها با پیشوند `[MIGRATE ERROR]` در خروجی لاگ می‌شوند.
- وضعیت موفقیت با پیشوند `[MIGRATE SUCCESS]` لاگ می‌شود.
- دستورات اجرایی: `go run cmd/migrate/main.go up|down|version`.

---

## ۷. قوانین غیرقابل‌تغییر برای کیفیت و حجم کد (Strict Code Quality Rules)

1. **ممنوعیت کامل کامنت در کدها:** در هیچ کدی نباید کامنت وجود داشته باشد.
2. **ممنوعیت متغیرهای تک‌حرفی:** متغیرها باید توصیفی باشند (مگر شمارنده حلقه `i` یا `index`).
3. **شناسه `"ID"` نانوثانیه و حذف `createdAt` و `updatedAt`:** فیلد `"ID"` از نوع `int64` (در دیتابیس `bigint`) معادل `time.Now().UnixNano()` است و فیلدهای `createdAt` و `updatedAt` وجود ندارند (مگر درخواست صریح کاربر). تمامی زمان‌ها `int64` یونیکس هستند.
4. **سیاست مقداری (Value-Type):** تا جای ممکن از ساختارهای مقداری استفاده کنید و از تعریف پوینترهای غیرضروری پرهیز کنید.
5. **۳ مقدار خروجی در Getهای ریپازیتوری:** `(item, found, error)` که در صورت نیافتن رکورد `found = false` و `error = nil` است.
6. **پیکربندی کامل از طریق `.env`:** هیچ اطلاعات کانفیگ، دیتابیس یا پورتی نباید در کد هاردکد شود.
