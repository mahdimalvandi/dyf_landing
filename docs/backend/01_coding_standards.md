# سند استانداردهای کدنویسی و معماری بک‌اند (Coding Standards & Architecture)
**نسخه سند:** ۲.۱  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان Go و ایجنت‌های هوش مصنوعی (AI Agents)

---

## ۱. پشته فناوری و ابزارهای هسته (Core Tech Stack)

| بخش | ابزار و نسخه | توضیحات و الزامات فنی |
| :--- | :--- | :--- |
| **زبان** | **Go (Golang) نسخه ۱.۲۶** | بهره‌گیری از قابلیت‌های جدید Go 1.26، بهینه‌سازی Garbage Collector و پکیج‌های استاندارد مدرن |
| **وب‌فریمورک** | **Fiber v3** (`github.com/gofiber/fiber/v3`) | نسخه نسل سوم با رابط کاربری مدرن `fiber.Ctx`، قابلیت Binding جدید (`c.Bind().Body()`)، عملکرد بالا بر پایه Fasthttp |
| **پردازشگر JSON** | **jsoniter** (`github.com/json-iterator/go`) | جایگزین سریع `encoding/json` متصل به اینکودر و دیکودر Fiber v3 |
| **ORM** | **GORM v2** (`gorm.io/gorm`) | تنظیم استراتژی نام‌گذاری camelCase و استفاده انحصاری از تگ `column` در Structها |
| **پایگاه‌داده** | **PostgreSQL نسخه ۱۵+** | کلیه نام‌های جداول و ستون‌ها در دیتابیس به صورت camelCase و با دابل‌کوتیشن نگهداری می‌شوند |
| **سیستم مایگریشن** | **golang-migrate** (`github.com/golang-migrate/migrate/v4`) | موتور استاندارد اجرای مایگریشن‌های اتمیک SQL |
| **اعتبارسنجی** | **validator/v10** | ولیدیشن ساختاریافته DTO با تگ‌های اختصاصی مانند `iran_phone` |

---

## ۲. قواعد سفت‌وسخت نگارش کد (Strict Coding Rules)

هر توسعه‌دهنده یا AI Agent موظف است این قواعد را بدون کوچک‌ترین استثنا رعایت کند:

### ۲.۱. ممنوعیت کامل کامنت در کدها (No Comments in Code)
- **قاعده قطعی:** در هیچ‌یک از فایل‌های کد Go نباید هیچ‌گونه کامنتی (`//` یا `/* */`) درج شود.
- کد باید کاملاً خودتوضیح (Self-Documenting) و با نام‌های شفاف و دقیق نوشته شود.

### ۲.۲. ممنوعیت متغیرهای تک‌حرفی (No Single-Letter Variables)
- **قاعده قطعی:** استفاده از متغیرهای تک‌حرفی ممنوع است، مگر به عنوان شمارنده ایندکس در حلقه‌ها (مانند `index` یا `i`).
- نمونه‌های نام‌گذاری صحیح:
  - به جای `c` بنویسید: `fiberContext`
  - به جای `r` بنویسید: `customerRepository`
  - به جای `s` بنویسید: `shoeService`
  - به جای `db` بنویسید: `databaseConnection`
  - به جای `e` بنویسید: `validationError` یا `fieldError`
  - به جای `m` بنویسید: `shoeModel`

### ۲.۳. بزرگ‌نویسی کامل حروف اختصاری و مخفف‌ها (Initialisms Capitalization)
- **قاعده قطعی:** اختصارات فنی باید به صورت تمام‌بزرگ نوشته شوند و به صورت ترکیبی با camelCase قرار گیرند:
  - `ID` (نه `Id`): `categoryID`, `shoeID`, `customerID`, `adminID`
  - `URL` (نه `Url`): `imageURL`, `videoURL`, `primaryImageURL`
  - `IP` (نه `Ip`): `clientIP`
  - `OTP` (نه `Otp`): `verifyOTP`, `targetOTP`
  - `MD5` (نه `Md5`): `tokenMD5`, `rawTokenMD5`
  - `DTO` (نه `Dto`): `categoryDTO`, `shoeDTO`

### ۲.۴. حداقل‌سازی پوینترها جهت جلوگیری از خطای Nil Pointer (Value-Type Policy)
- **قاعده قطعی:** تا جای ممکن از ارسال و دریافت اشاره‌گرها (Pointers) خودداری کنید.
- ساختارهای دامنه و ورودی‌ها باید به صورت مقداری (Value) پاس داده و برگردانده شوند تا ریسک خطای `nil pointer dereference` در ران‌تایم به صفر برسد.
- نمونه: تابع باید `(entity.ShoeModel, bool, error)` برگرداند، نه `(*entity.ShoeModel, error)`.

### ۲.۵. قانون ساختاری `ID` و زمان‌ها (Nanosecond ID & Unix Timestamps)
- **حذف کامل `createdAt`:** شناسه `ID` از نوع `int64` بوده و برابر با زمان ساخت رکورد به نانوثانیه (`time.Now().UnixNano()`) است. به همین دلیل هیچ فیلدی به نام `createdAt` در سیستم وجود ندارد.
- **حذف `time.Time`:** هیچ فیلدی از نوع `time.Time` در Structها و دیتابیس وجود ندارد. تمامی زمان‌ها (مانند `updatedAt`, `expiresAt`, `startedAt`) به صورت `int64` یونیکس (ثانیه) ذخیره می‌شوند.

### ۲.۶. تگ‌های GORM در موجودیت‌ها (Entity Tags)
- **قاعده قطعی:** در Structهای لایه `entity` تنها تگ مجاز GORM تگ `column` است (`gorm:"column:fieldName"`).
- محدودیت‌هایی نظیر `primaryKey`, `not null`, `unique`, `default` منحصراً در فایل‌های مایگریشن SQL تعریف می‌شوند و نباید در تگ‌های GORM نوشته شوند.

### ۲.۷. ساختار خروجی متدهای Get در ریپازیتوری (Three-Value Returns)
- **قاعده قطعی:** کلیه متدهای جستجو بر اساس شناسه یا تک‌رکورد در لایه ریپازیتوری باید ۳ پارامتر خروجی داشته باشند:
  $$\text{Output: } (\text{item}, \text{found}, \text{error})$$
- هنگامی که رکورد در پایگاه داده وجود ندارد:
  - `found = false`
  - `error = nil`
  - `item` برابر مقدار صفر اولیه Struct (نه پوینتر nil).

---

## ۳. مدیریت تراکنش‌های پایگاه داده (Database Transactions)

برای حفظ سادگی حداکثری و جلوگیری از پاس دادن مستقیم شیء دیتابیس یا پوینتر به لایه سرویس، مدیریت تراکنش‌ها از طریق **Context Injection** پیاده‌سازی می‌شود:

### ۳.۱. اینترفیس TransactionManager در لایه مخزن داده
```go
package repository

import "context"

type TransactionManager interface {
	Execute(ctx context.Context, operation func(txContext context.Context) error) error
}
```

### ۳.۲. عملکرد خودکار ریپازیتوری‌ها با تراکنش
ریپازیتوری‌ها ابتدا بررسی می‌کنند که آیا تراکنشی در `context.Context` ثبت شده است یا خیر؛ در صورت وجود، کوئری را روی همان تراکنش اجرا می‌کنند و در غیر این صورت از کانکشن پیش‌فرض دیتابیس استفاده می‌کنند:
```go
func (repositoryInstance BaseRepository) resolveDB(ctx context.Context) *gorm.DB {
	if txInstance, hasTx := ctx.Value(transactionContextKey{}).(*gorm.DB); hasTx {
		return txInstance
	}
	return repositoryInstance.DatabaseConnection.WithContext(ctx)
}
```

---

## ۴. احراز هویت توکن‌محور و اعتبارسنجی با هش MD5

احراز هویت بدون وابستگی به توکن‌های بدون وضعیت (JWT) و به صورت توکن مات (Opaque Token) پیاده‌سازی می‌شود:

### ۴.۱. نحوه تولید و اعتبارسنجی توکن
1. هنگام ورود موفق کاربر (مدیر یا دارنده مجوز کاتالوگ)، یک توکن تصادفی امن و غیرقابل‌حدس (رشته هگزادسیمال حداقل ۳۲ کاراکتری) تولید می‌شود: `rawToken`.
2. سرور مقدار هش **MD5** آن توکن را محاسبه می‌کند:
   $$\text{tokenHash} = \text{MD5}(\text{rawToken})$$
3. تنها مقدار `tokenHash` به همراه `userID` / `customerID` و زمان انقضا در جدول دیتابیس ذخیره می‌شود. مقدار خام `rawToken` هرگز در دیتابیس ذخیره نمی‌شود.
4. مقدار خام `rawToken` به کلاینت تحویل داده می‌شود.
5. در درخواست‌های بعدی، کلاینت توکن را در هدر `Authorization: Bearer <rawToken>` ارسال می‌کند.
6. میدلور احراز هویت مقدار MD5 توکن ورودی را محاسبه کرده و در جدول جستجو می‌کند:
   ```sql
   SELECT * FROM "adminTokens" WHERE "tokenHash" = $1 AND "expiresAt" > $2
   ```

---

## ۵. اینترفیس ذخیره‌سازی رسانه‌ها (Storage Interface & FileSystem)

برای ذخیره‌سازی تصاویر ژورنالی و ویدیوها، از الگوی اینترفیس با پیاده‌سازی اولیه روی فایل‌سیستم محلی سرور استفاده می‌شود تا در آینده در صورت نیاز به S3 یا MinIO، بدون دستکاری منطق تجاری سوییچ شود.

```go
package storage

import "context"

type StorageService interface {
	Upload(ctx context.Context, fileBytes []byte, originalFilename string, subDirectory string) (fileURL string, storageError error)
	Delete(ctx context.Context, fileURL string) error
}
```
پیاده‌سازی محلی (`FileSystemStorage`) فایل‌ها را در پوشه مشخص (مانند `./uploads/shoes/...`) ذخیره کرده و نشانی دسترسی استاتیک آن را بازمی‌گرداند.

---

## ۶. تایم‌اوت پیش‌فرض Context (۱۰ ثانیه)

برای جلوگیری از معلق ماندن اتصالات و مصرف بی‌رویه منابع دیتابیس:
- یک میدلور سراسری در Fiber تعبیه شده است که برای هر درخواست ورودی یک تایم‌اوت قطعی **۱۰ ثانیه‌ای** روی `context.Context` تنظیم می‌کند (`context.WithTimeout(ctx, 10*time.Second)`).
- کلیه عملیات دیتابیس، آپلود و سرویس‌ها باید این context را دریافت و رعایت کنند.

---

## ۷. سیستم مدیریت خطاها و نگاشت پیام‌های فارسی (Custom Error & Persian Mapping)

سیستم خطای بک‌اند بر پایه یک تایپ اختصاصی `CustomError` است که رابط `error` زبان Go را پیاده‌سازی می‌کند.  
لایه سرویس و ریپازیتوری تنها ارور دامنه را برمی‌گردانند؛ سپس لایه پاسخ‌دهی (`response.FromAppError`) با بررسی کد ارور در یک مپ ثبت‌شده، پیام ترجمه‌شده فارسی و کد وضعیت HTTP متناسب را استخراج کرده و به کلاینت تحویل می‌دهد.

### جدول مپ خطاهای فارسی سیستم:
| کد خطا (`CustomError`) | وضعیت HTTP | پیام فارسی کلاینت |
| :--- | :---: | :--- |
| `NOT_FOUND` | 404 | آیتم مورد نظر یافت نشد |
| `VALIDATION_FAILED` | 422 | داده‌های ارسالی معتبر نیستند |
| `UNAUTHORIZED` | 401 | احراز هویت انجام نشده است |
| `FORBIDDEN` | 403 | دسترسی مجاز نمی‌باشد |
| `DUPLICATE_PHONE` | 409 | شماره تلفن همراه از قبل در سیستم وجود دارد |
| `DUPLICATE_SLUG` | 409 | شناسه لاتین دسته‌بندی تکراری است |
| `INVALID_OTP` | 400 | کد تایید وارد شده نادرست است |
| `OTP_EXPIRED` | 410 | کد تایید منقضی شده است |
| `LINK_EXPIRED` | 410 | مهلت زمانی این لینک به پایان رسیده است |
| `LINK_INACTIVE` | 403 | این لینک توسط مدیریت غیرفعال شده است |
| `CUSTOMER_INACTIVE` | 403 | حساب کاربری مشتری غیرفعال است |
| `INTERNAL_SERVER_ERROR`| 500 | خطای غیرمنتظره در سرور رخ داد |
