# سند تحلیل فنی تسک ۵: مدیریت مشتریان و همکاران تجاری (Customer Management)
**مسیر سند:** `docs/backend/analysis/task_05_customers.md`  
**وضعیت:** در انتظار بازبینی و تأیید کاربر (Pending User Review)  
**نسخه:** ۱.۰  

---

## ۱. هدف و چشم‌انداز محصولی (Product Vision & Goals)

در مدل تجاری کارگاه DYF، ارتباط با مشتریان و همکاران تجاری به صورت B2B (بنکداران، فروشگاه‌داران و بوتیک‌های چرم) است.  
اهداف این ماژول عبارتند از:
- ثبت و نگهداری متمرکز اطلاعات هویتی و کاری خریداران (نام و نام خانوادگی به فارسی و انگلیسی، نام فروشگاه/بنکداری، شماره تلفن همراه).
- کنترل وضعیت فعالیت حساب مشتری (`isActive`).
- تضمین یکتایی شماره تلفن همراه در سیستم جهت جلوگیری از تداخل هویتی.
- فهرست‌بندی بهینه با صفحه‌بندی استاندارد (`pagination.Pagination` با GORM Scope) و جستجوی چندفیلدی (نام، فروشگاه، شماره تماس).
- ویرایش و حذف حساب مشتری.
- فعال‌سازی و غیرفعال‌سازی سریع وضعیت مشتری.

> **نکته بیزنسی:**  
> طبق مشخصات محصولی، سیستم مجوزهای دسترسی مستقیم و لینک‌های کاتالوگ در این تسک مطرح نیست و در تسک ۶ به صورت کاملاً مستقل پیاده‌سازی خواهد شد.

---

## ۲. طراحی پایگاه داده (Database Schema & Migration)

طبق استانداردهای مصوب معماری:
- ایجاد مایگریشن اختصاصی: `000006_create_customers.up.sql` و `000006_create_customers.down.sql`.
- یک جدول به ازای مایگریشن: جدول `"customers"`.
- شناسه رکورد `"ID"` از نوع `BIGINT PRIMARY KEY` (نانوثانیه با `time.Now().UnixNano()`).
- شماره موبایل `"phoneNumber"` به صورت `VARCHAR(20) NOT NULL UNIQUE`.
- وضعیت حساب `"isActive"` به صورت `BOOLEAN NOT NULL DEFAULT TRUE`.
- صفر کامنت در فایل‌های SQL.
- بدون فیلدهای `createdAt` و `updatedAt`.

### ۲.۱. ساختار جدول `"customers"`
```sql
CREATE TABLE IF NOT EXISTS "customers" (
    "ID" BIGINT PRIMARY KEY,
    "firstNameFa" VARCHAR(100) NOT NULL,
    "lastNameFa" VARCHAR(100) NOT NULL,
    "firstNameEn" VARCHAR(100) NOT NULL DEFAULT '',
    "lastNameEn" VARCHAR(100) NOT NULL DEFAULT '',
    "storeName" VARCHAR(200) NOT NULL DEFAULT '',
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "idx_customers_phoneNumber" ON "customers" ("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_customers_isActive" ON "customers" ("isActive");
```

---

## ۳. طراحی روت‌ها و قرارداد APIها (API Contracts)

خانواده مسیر: `/api/v1/customers`  
**دسترسی:** کلیه روت‌ها محافظت‌شده بوده و نیازمند توکن معتبر ادمین در هدر Authorization هستند (`RequireAdminAuth`).

### ۳.۱. جدول خلاصه مسیرها
| متد | مسیر (Endpoint) | دسترسی | شرح عملکرد |
|:---:|:---|:---:|:---|
| `GET` | `/api/v1/customers` | ادمین | فهرست مشتریان با صفحه‌بندی و جستجو |
| `GET` | `/api/v1/customers/:id` | ادمین | مشاهده جزییات یک مشتری |
| `POST` | `/api/v1/customers` | ادمین | ثبت مشتری جدید |
| `PUT` | `/api/v1/customers/:id` | ادمین | ویرایش مشخصات مشتری |
| `PATCH` | `/api/v1/customers/:id/status` | ادمین | تغییر سریع وضعیت فعال/غیرفعال بودن مشتری |
| `DELETE` | `/api/v1/customers/:id` | ادمین | حذف مشتری از سیستم |

---

### ۳.۲. جزییات ورودی و خروجی Endpointها

#### ۱. فهرست مشتریان (`GET /api/v1/customers`)
- **کوئری پارامترها (Query Params):**
  - `page`: شماره صفحه (پیش‌فرض: `1`)
  - `limit`: تعداد در صفحه (پیش‌فرض: `12`، حداکثر: `50`)
  - `search`: جستجوی اختیاری در نام فارسی، نام خانوادگی، نام فروشگاه یا شماره تماس.
  - `status`: فیلتر وضعیت اختیاری (`all`, `active`, `inactive`).
- **پاسخ موفق (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "فهرست مشتریان با موفقیت دریافت شد",
  "data": {
    "items": [
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

#### ۲. مشاهده مشخصات مشتری (`GET /api/v1/customers/:id`)
- **پارامتر مسیر:** `:id` (شناسه عددی مشتری)
- **پاسخ موفق (200 OK):** بازگرداندن اطلاعات کامل مشتری.

---

#### ۳. ثبت مشتری جدید (`POST /api/v1/customers`)
- **بدنه درخواست (JSON):**
```json
{
  "firstNameFa": "علی",
  "lastNameFa": "محمدی",
  "firstNameEn": "Ali",
  "lastNameEn": "Mohammadi",
  "storeName": "بوتیک چرم پالادیوم",
  "phoneNumber": "09121112233",
  "isActive": true
}
```
- **اعتبارسنجی فرانت و سرور:**
  - `firstNameFa`: الزامی، حداقل ۲ کاراکتر.
  - `lastNameFa`: الزامی، حداقل ۲ کاراکتر.
  - `phoneNumber`: الزامی، فرمت معتبر ۱۱ رقمی ایران (`iran_phone`: `^09[0-9]{9}$`).
  - یکتایی شماره تلفن در دیتابیس (در صورت تکراری بودن: `409 Conflict` با کد `duplicatePhone`).
- **پاسخ موفق (201 Created):** بازگرداندن رکورد ثبت‌شده مشتری همراه با `ID`.

---

#### ۴. ویرایش مشخصات مشتری (`PUT /api/v1/customers/:id`)
- **پارامتر مسیر:** `:id`
- **بدنه درخواست:** همان ساختار ثبت مشتری.
- **رفتار بیزینسی:** در صورت تغییر شماره موبایل، بررسی می‌شود که شماره جدید به مشتری دیگری تعلق نداشته باشد.
- **پاسخ موفق (200 OK):** اطلاعات اصلاح‌شده مشتری.

---

#### ۵. تغییر وضعیت فعال‌بودن مشتری (`PATCH /api/v1/customers/:id/status`)
- **پارامتر مسیر:** `:id`
- **بدنه درخواست:**
```json
{
  "isActive": false
}
```
- **پاسخ موفق (200 OK):** پیام موفقیت به همراه مشخصات مشتری با وضعیت جدید.

---

#### ۶. حذف مشتری (`DELETE /api/v1/customers/:id`)
- **پارامتر مسیر:** `:id`
- **پاسخ موفق (200 OK):** حذف رکورد مشتری از پایگاه داده.

---

## ۴. معماری جریان داده و لایه‌بندی ماژول

1. **لایه Entity (`internal/entity/customer/`):**
   - `entity.go`: استراکت `Customer` در بالای فایل.
   - `recievers.go`: متد `TableName() string` با بازگشت `"customers"`.
2. **لایه DTO (`internal/dto/customer/`):**
   - `request.go`: استراکت‌های `CreateCustomerRequest`, `UpdateCustomerRequest`, `ChangeCustomerStatusRequest`, `ListCustomersFilter`.
   - `response.go`: استراکت‌های `CustomerResponse` و `CustomerListResponse` (تک‌استراکت یکپارچه شامل `Items` و `Pagination`).
   - `recievers.go`: متدهای `Normalize()` جهت حذف فاصله‌های اضافی و یکپارچه‌سازی متون.
3. **لایه Repository (`internal/repository/customer/repository.go`):**
   - متدهای `CreateCustomer`, `FindCustomerByID`, `FindCustomerByPhone`, `UpdateCustomer`, `UpdateCustomerStatus`, `DeleteCustomer`, `ListCustomers`.
   - استفاده مستقیم از `Scopes(paginationScope.GetScope())` برای صفحه‌بندی تمیز.
   - جستجوی ILIKE در فیلدهای نام، نام خانوادگی، فروشگاه و شماره موبایل.
4. **لایه Service (`internal/service/customer/`):**
   - فایل‌های تفکیک‌شده به ازای هر API:
     - `create.go`: بررسی تکراری نبودن شماره موبایل، تولید `ID` نانوثانیه‌ای و ثبت.
     - `update.go`: بررسی وجود مشتری و عدم تداخل شماره تلفن با رکوردهای دیگر.
     - `status.go`: تغییر وضعیت `isActive`.
     - `delete.go`: حذف مشتری.
     - `detail.go`: دریافت اطلاعات تکی.
     - `list.go`: مدیریت صفحه‌بندی با اسکوپ، فراخوانی متدهای کمکی و تهیه DTO خروجی.
5. **لایه Handler (`internal/handler/customer/`):**
   - فایل‌های متناظر با هر API: `create.go`, `update.go`, `status.go`, `delete.go`, `detail.go`, `list.go`.
6. **لایه Routing (`cmd/server/routes/customer.go`):**
   - رجیستری کلیه روت‌ها با میدل‌ویر `RequireAdminAuth` در `apiGroup.Group("/customers")`.

---

## ۵. کلیدهای خطا و پیام‌های ثابت

### ۵.۱. کلیدهای خطای جدید در `statics/errors/customErrors.go`:
- `CustomerNotFound = "customerNotFound"`
- `InvalidCustomerID = "invalidCustomerID"`
*(کلیدهای `DuplicatePhone` و `CustomerInactive` از قبل در سیستم موجود هستند).*

### ۵.۲. ترجمه فارسی در `statics/errors/faTranslation.go`:
- `CustomerNotFound`: "مشتری مورد نظر یافت نشد"
- `InvalidCustomerID`: "شناسه مشتری نامعتبر است"

### ۵.۳. ثابت‌های موفقیت در `statics/constants/customer/constants.go`:
- `MsgCustomerCreatedSuccessfully = "مشتری جدید با موفقیت ثبت شد"`
- `MsgCustomerUpdatedSuccessfully = "اطلاعات مشتری با موفقیت ویرایش شد"`
- `MsgCustomerStatusUpdatedSuccessfully = "وضعیت حساب مشتری با موفقیت به‌روزرسانی شد"`
- `MsgCustomerDeletedSuccessfully = "مشتری با موفقیت حذف شد"`
- `MsgCustomerFetchedSuccessfully = "اطلاعات مشتری با موفقیت دریافت شد"`
- `MsgCustomerListFetchedSuccessfully = "فهرست مشتریان با موفقیت دریافت شد"`

---

## ۶. سناریوهای تست و لبه‌ها (Test Scenarios & Edge Cases)

1. **بررسی امنیت احراز هویت ادمین:** تلاش برای فراخوانی هر یک از متدها بدون توکن یا با توکن نامعتبر (`401 Unauthorized`).
2. **اعتبارسنجی ورودی:** ارسال نام خالی یا نامعتبر (`400 Bad Request`).
3. **اعتبارسنجی شماره تلفن همراه:** ارسال شماره نامعتبر (مثلاً ارقام کم یا بدون پیش‌شماره 09) (`400 Bad Request`).
4. **تست شماره تکراری:** تلاش برای ثبت مشتری با شماره تلفنی که از قبل ثبت شده است (`409 Conflict` با کد `duplicatePhone`).
5. **ثبت موفق مشتری:** درج رکورد و بررسی صحت فیلدهای ثبت‌شده (`201 Created`).
6. **ویرایش موفق:** تغییر نام، نام خانوادگی، نام فروشگاه (`200 OK`).
7. **تست شماره تکراری در زمان ویرایش:** تغییر شماره موبایل مشتری اول به شماره مشتری دوم (`409 Conflict`).
8. **تغییر وضعیت فعال‌سازی (`PATCH /status`):** غیرفعال‌سازی و فعال‌سازی مجدد حساب مشتری (`200 OK`).
9. **فهرست مشتریان با صفحه‌بندی:** بازگشت ساختار داده شامل `items` و `pagination` یکپارچه (`200 OK`).
10. **جستجوی متنی:** جستجو با نام فروشگاه، نام یا شماره تماس (`200 OK`).
11. **مشاهده جزییات:** دریافت رکورد مشتری با شناسه معتبر (`200 OK`).
12. **خطای شناسه نامعتبر:** ارسال رشته به جای عدد (`400 Bad Request`).
13. **خطای رکورد ناموجود:** ارسال شناسه ناموجود (`404 Not Found`).
14. **حذف موفق مشتری:** حذف رکورد و اطمینان از خروج از پایگاه داده (`200 OK`).
