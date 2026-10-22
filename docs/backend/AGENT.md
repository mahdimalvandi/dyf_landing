# راهنمای جامع ایجنت‌های هوش مصنوعی (AI AGENT PLAYBOOK)
**پروژه:** DYF Private Catalog Backend  
**مخاطب:** هر دستیار هوش مصنوعی و مدل زبانی (LLM) که در این پروژه وظیفه توسعه کد، بازبینی یا عیب‌یابی دارد.

---

## ۱. اصول رفتاری و قوانین غیرقابل‌تغییر برای Agent

هنگام کار بر روی این پروژه، الزامات زیر باید به صورت ۱۰۰٪ و بدون استثنا رعایت شوند:

1. **نسخه زبان و فریمورک:**
   - زبان برنامه نویسی: **Go 1.26**
   - وب فریمورک: **Fiber v3** (`github.com/gofiber/fiber/v3`)
   - کتابخانه جیسون: **jsoniter** (`github.com/json-iterator/go`)
   - ابزار مایگریشن: **golang-migrate** (`github.com/golang-migrate/migrate/v4`)

2. **قانون ممنوعیت کامنت (Zero Comments):**
   - در هیچ فایل کدی در پوشه `backend/` نباید هیچ‌گونه کامنتی (`//` یا `/* */`) درج شود.

3. **قانون ممنوعیت متغیرهای تک‌حرفی (No Single-Letter Variables):**
   - نام تمامی متغیرها باید توصیفی باشد (مثلاً `fiberContext` به جای `c`، `customerRepo` به جای `r`، `validationError` به جای `e`).
   - تنها استثنا: شمارنده‌های ایندکس حلقه (`index` یا `i`).

4. **قانون نام‌گذاری و اختصارات (Strict camelCase & Capitalized Initialisms):**
   - تمامی نام‌گذاری‌ها در JSON، متغیرها، ستون‌های دیتابیس و جداول با camelCase است.
   - کلیه اختصارات فنی باید تمام‌بزرگ باشند: `categoryID`, `shoeID`, `customerID`, `adminID`, `primaryImageURL`, `clientIP`, `verifyOTP`.

5. **قانون پوینترها (Value-Type Policy):**
   - تا جای ممکن از ساختارهای مقداری (Value) استفاده کنید و از تعریف پوینترهای غیرضروری پرهیز کنید تا ریسک `nil pointer dereference` از بین برود.

6. **قانون ساختار شناسه و زمان:**
   - فیلد `"ID"` از نوع `int64` (در دیتابیس `bigint`) است و زمان ساخت رکورد به نانوثانیه (`time.Now().UnixNano()`) است.
   - **هیچ فیلدی به نام `createdAt` وجود ندارد.**
   - هیچ فیلد `time.Time` وجود ندارد؛ تمام زمان‌ها `int64` یونیکس هستند.

7. **تگ‌های GORM در Entity:**
   - در Structهای موجودیت‌ها تنها تگ مجاز GORM، تگ `column` است: `gorm:"column:fieldName"`.
   - کلیه محدودیت‌های کلید اصلی، پیش‌فرض، یکتایی و نات‌نال منحصراً در فایل‌های مایگریشن SQL قرار می‌گیرند.

8. **قرارداد ۳ خروجی در Get های ریپازیتوری:**
   - هر متد جستجوی رکورد در ریپازیتوری باید ۳ مقدار برگرداند: `(item, found, error)`.
   - در صورت عدم یافتن: `found = false` و `error = nil`.

9. **مدیریت خطای فارسی:**
   - سرویس و ریپازیتوری ارورهای دامنه را از طریق `apperror.New(...)` یا سنتینل ارورها برمی‌گردانند.
   - لایه پاسخ‌دهی (`response.FromAppError`) با رجوع به مپ خطاها، متن فارسی و Status Code متناظر را در انولوپ JSON تحویل می‌دهد.

---

## ۲. فهرست اسناد فنی پروژه

- **[سند استانداردهای کدنویسی (01_coding_standards.md)](./01_coding_standards.md):**
  معماری لایه‌ای، نمونه کدهای دقیق لایه‌ها، مدیریت خطا و قوانین Fiber v3.
- **[سند استانداردهای دیتابیس و مایگریشن (02_database_and_migration_standards.md)](./02_database_and_migration_standards.md):**
  نحوه نام‌گذاری ستون‌ها با دابل‌کوتیشن، ایندکس‌گذاری اجباری و اجرای مایگریشن‌ها با `golang-migrate`.

---

## ۳. دستورات پرکاربرد محیط توسعه

```bash
# رفتن به پوشه بک‌اند
cd backend

# اجرای تست بیلد و کامپایل
go build ./...

# اجرای وب‌سرور Fiber
go run cmd/server/main.go

# فرامین مایگریشن دیتابیس
go run cmd/migrate/main.go up
go run cmd/migrate/main.go down
go run cmd/migrate/main.go version
```
