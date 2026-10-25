# سند تحلیل فنی تسک ۶: صدور و مدیریت لینک‌های دسترسی اختصاصی به کاتالوگ (Access Links Management)
**مسیر سند:** `docs/backend/analysis/task_06_access_links.md`  
**وضعیت:** در انتظار بازبینی و تأیید نهایی کاربر (Pending User Review)  
**نسخه:** ۱.۱ (ساده‌سازی و حذف دسته‌بندی/استثنا بر اساس بازخورد کاربر)  

---

## ۱. هدف و چشم‌انداز محصولی (Product Vision & Goals)

قابلیت محوری کاتالوگ خصوصی کارگاه DYF، صدور دسترسی‌های VIP کنترل‌شده، زمان‌دار و سفارشی برای خریداران، بنکداران و بوتیک‌داران است. به جای ارسال تصاویر پراکنده در پیام‌رسان‌ها، ادمین برای هر همکار تجاری یک پیوند امن و شیک صادر می‌کند.  

بر اساس تصمیم مصوب محصولی، **دسته‌بندی‌ها صرفاً ساختار نمایشی در کاتالوگ هستند** و مجوزهای دسترسی مستقیماً و به صورت شفاف بر روی **مدل‌های کفش (`shoeIDs`)** تعریف می‌شوند. پیچیدگی‌های زائد شامل انتساب دسته و مستثناسازی مدل‌ها حذف شده است.

اهداف کلیدی این ماژول در پنل مدیریت:
- **صدور لینک اختصاصی:** ایجاد توکن امن و غیرقابل حدس با امکان اتصال اختیاری به پروفایل یک مشتری (`customerID`).
- **کنترل روش ورود:** پشتیبانی از دسترسی مستقیم (`DIRECT` بدون نیاز به لاگین) و دسترسی با تأیید پیامکی (`OTP` تطبیق شماره تلفن خریدار).
- **تخصیص مدل‌های کفش مجاز (`shoeIDs`):** انتساب مستقیم فهرستی از شناسه‌های مدل‌های کفش انتخاب‌شده (از ۱ مدل تا تمام مدل‌ها).
- **قوانین زمان‌بندی دوگانه:**
  - مهلت کلی انقضا (`expiresAt`): تاریخ و ساعت نهایی اعتبار پیوند.
  - مدت زمان مشاهده (`viewingDurationMinutes`): بازه زمانی مجاز خریدار پس از اولین ورود (مثلاً ۱۵ دقیقه، ۱ روز، یا نامحدود با مقدار `0`).
- **مدیریت وضعیت‌ها (`status`):**
  - `PENDING`: صادر شده و در انتظار اولین ورود.
  - `ACTIVE`: ورود موفق انجام شده و لینک در دوره مجاز فعال است.
  - `EXPIRED`: مهلت مشاهده یا تاریخ انقضا به پایان رسیده است.
  - `INACTIVE`: توسط ادمین به صورت دستی باطل/غیرفعال شده است (`isActive = false`).
- **امکان باطل‌سازی فوری (`Revoke`) و فعال‌سازی مجدد (`Reactivate` با شروع دوره جدید).**

---

## ۲. طراحی پایگاه داده (Database Schema & Migration)

طبق استانداردهای مصوب معماری پروژه:
- ایجاد مایگریشن اختصاصی: `000007_create_access_links.up.sql` و `000007_create_access_links.down.sql`.
- یک جدول به ازای مایگریشن: جدول `"accessLinks"`.
- شناسه فنی `"ID"` از نوع `BIGINT PRIMARY KEY` (نانوثانیه‌ای با `time.Now().UnixNano()`).
- شناسه ترتیبی و خوانا `"linkID"` از نوع `BIGSERIAL UNIQUE` (۱، ۲، ۳...).
- توکن یکتا و امن `"token"` از نوع `VARCHAR(64) NOT NULL UNIQUE` (تولید امن ۳۲ بایتی کریپتوگرافیک).
- فیلد `"shoeIDs"` از نوع `JSONB NOT NULL DEFAULT '[]'::jsonb` همراه با ایندکس GIN.
- صفر کامنت در فایل‌های مایگریشن.
- بدون فیلدهای `createdAt` و `updatedAt`.

### ۲.۱. ساختار اسکریپت مایگریشن (`000007_create_access_links.up.sql`)
```sql
CREATE TABLE IF NOT EXISTS "accessLinks" (
    "ID" BIGINT PRIMARY KEY,
    "linkID" BIGSERIAL UNIQUE,
    "token" VARCHAR(64) NOT NULL UNIQUE,
    "customerID" BIGINT NOT NULL DEFAULT 0,
    "recipientName" VARCHAR(200) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL DEFAULT '',
    "authMethod" VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    "shoeIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "viewingDurationMinutes" INT NOT NULL DEFAULT 0,
    "expiresAt" BIGINT NOT NULL DEFAULT 0,
    "firstViewedAt" BIGINT NOT NULL DEFAULT 0,
    "viewingExpiresAt" BIGINT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX IF NOT EXISTS "idx_accessLinks_token" ON "accessLinks" ("token");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_linkID" ON "accessLinks" ("linkID");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_customerID" ON "accessLinks" ("customerID");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_status" ON "accessLinks" ("status");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_isActive" ON "accessLinks" ("isActive");
CREATE INDEX IF NOT EXISTS "idx_accessLinks_shoeIDs" ON "accessLinks" USING GIN ("shoeIDs");
```

---

## ۳. طراحی روت‌ها و قرارداد APIها (API Contracts)

خانواده مسیر: `/api/v1/links`  
**دسترسی:** کلیه روت‌های این ماژول در پنل مدیریت تحت محافظت میدل‌ویر `RequireAdminAuth` قرار دارند.

### ۳.۱. جدول خلاصه مسیرها
| متد | مسیر (Endpoint) | دسترسی | شرح عملکرد |
|:---:|:---|:---:|:---|
| `GET` | `/api/v1/links` | ادمین | فهرست لینک‌های دسترسی همراه با صفحه‌بندی استاندارد و فیلترها |
| `GET` | `/api/v1/links/:id` | ادمین | مشاهده شناسنامه کامل لینک (بر اساس ID سیستمی یا linkID ترتیبی) |
| `POST` | `/api/v1/links` | ادمین | صدور لینک دسترسی اختصاصی جدید با تولید توکن امن |
| `PUT` | `/api/v1/links/:id` | ادمین | ویرایش تنظیمات، مدل‌های منتسب یا زمان‌بندی لینک |
| `PATCH` | `/api/v1/links/:id/revoke` | ادمین | ابطال و لغو فوری دسترسی لینک (`isActive = false`, `status = INACTIVE`) |
| `PATCH` | `/api/v1/links/:id/reactivate` | ادمین | فعال‌سازی مجدد لینک برای شروع یک دوره دسترسی نو |
| `DELETE` | `/api/v1/links/:id` | ادمین | حذف فیزیکی رکورد لینک از پایگاه داده |

---

### ۳.۲. جزییات ورودی و خروجی Endpointها

#### ۱. فهرست لینک‌های دسترسی (`GET /api/v1/links`)
- **کوئری پارامترها (Query Params):**
  - `page`: شماره صفحه (پیش‌فرض: `1`)
  - `limit`: تعداد در هر صفحه (پیش‌فرض: `12`، حداکثر: `50`)
  - `search`: جستجو در نام دریافت‌کننده، شماره تماس یا کد عددی `linkID`.
  - `status`: فیلتر وضعیت (`all`, `active`, `pending`, `expired`, `inactive`).
  - `customerID`: فیلتر اختیاری برای مشاهده لینک‌های اختصاصی یک مشتری خاص.
- **پاسخ موفق (200 OK):**
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
        "token": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
        "url": "/catalog/a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
        "customerID": 1792770000000000000,
        "recipientName": "بوتیک چرم پالادیوم (آقای محمدی)",
        "phoneNumber": "09121112233",
        "authMethod": "DIRECT",
        "shoesCount": 5,
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

#### ۲. مشاهده جزییات کامل لینک (`GET /api/v1/links/:id`)
- **پارامتر مسیر:** `:id` (پشتیبانی هوشمند از شناسه نانوثانیه‌ای `ID` یا کد ترتیبی `linkID`).
- **پاسخ موفق (200 OK):** بازگرداندن کلیه فیلدها همراه با آرایه `shoeIDs` و تعداد مدل‌ها.

---

#### ۳. صدور لینک جدید (`POST /api/v1/links`)
- **بدنه درخواست (JSON):**
```json
{
  "customerID": 1792770000000000000,
  "recipientName": "بوتیک چرم پالادیوم",
  "phoneNumber": "09121112233",
  "authMethod": "DIRECT",
  "shoeIDs": [1792761483100205500, 1792761483100205501],
  "viewingDurationMinutes": 180,
  "expiresAt": 1793500000
}
```
- **اعتبارسنجی فرانت و سرور:**
  - `recipientName`: الزامی، حداقل ۲ کاراکتر.
  - `authMethod`: مقدار معتبر `"DIRECT"` یا `"OTP"` (پیش‌فرض: `"DIRECT"`).
  - در صورت انتخاب `authMethod = "OTP"`: `phoneNumber` الزامی بوده و اعتبارسنجی شماره ۱۱ رقمی ایران (`iran_phone`) اعمال می‌شود.
  - در صورت ارسال `customerID > 0`: بررسی می‌شود که مشتری در سیستم وجود داشته باشد.
  - فیلد `shoeIDs`: الزامی است و حداقل یک شناسه مدل کفش باید انتخاب شود (`len(shoeIDs) > 0`).
- **تولید توکن:** تولید توکن تصادفی ۳۲ بایتی کریپتوگرافیک (۶۴ کاراکتر هگز امن).
- **پاسخ موفق (201 Created):** بازگرداندن مشخصات کامل رکورد ثبت‌شده همراه با آدرس لینک کاتالوگ.

---

#### ۴. ویرایش مشخصات لینک (`PUT /api/v1/links/:id`)
- **پارامتر مسیر:** `:id`
- **بدنه درخواست:** همان فیلدهای ثبت به همراه قابلیت تغییر زمان‌ها و مدل‌های انتخابی.
- **پاسخ موفق (200 OK):** اطلاعات اصلاح‌شده لینک.

---

#### ۵. ابطال و لغو فوری لینک (`PATCH /api/v1/links/:id/revoke`)
- **پارامتر مسیر:** `:id`
- **رفتار:** تغییر وضعیت `isActive = false` و `status = INACTIVE`.
- **پاسخ موفق (200 OK):** پیام موفقیت ابطال لینک همراه با رکورد به‌روزرسانی‌شده.

---

#### ۶. فعال‌سازی مجدد لینک (`PATCH /api/v1/links/:id/reactivate`)
- **پارامتر مسیر:** `:id`
- **رفتار:** ایجاد دوره دسترسی نو روی همان آدرس قبلی:
  - `isActive = true`
  - `firstViewedAt = 0`
  - `viewingExpiresAt = 0`
  - `status = PENDING`
- **پاسخ موفق (200 OK):** پیام موفقیت فعال‌سازی مجدد.

---

#### ۷. حذف فیزیکی لینک (`DELETE /api/v1/links/:id`)
- **پارامتر مسیر:** `:id`
- **پاسخ موفق (200 OK):** حذف رکورد از دیتابیس.

---

## ۴. معماری جریان داده و لایه‌بندی ماژول

1. **لایه Entity (`internal/entity/link/`):**
   - `entity.go`: استراکت `AccessLink` در بالای فایل.
   - `recievers.go`: متدهای `TableName() string` (با مقدار `"accessLinks"`) و هندلرهای JSONB برای آرایه `Int64List` (`shoeIDs`).
2. **لایه DTO (`internal/dto/link/`):**
   - `request.go`: استراکت‌های `CreateLinkRequest`, `UpdateLinkRequest`, `ListLinksFilter`.
   - `response.go`: استراکت‌های `LinkResponse`, `LinkDetailResponse`, `LinkListResponse` (تک‌استراکت یکپارچه شامل `Items` و `Pagination`).
   - `recievers.go`: متدهای `Normalize()` برای حذف فاصله‌ها، پاکسازی آرایه‌ها و اعمال مقادیر پیش‌فرض.
3. **لایه Repository (`internal/repository/link/repository.go`):**
   - متدهای `CreateLink`, `FindLinkByID`, `FindLinkByLinkID`, `FindLinkByIDOrLinkID`, `FindLinkByToken`, `UpdateLink`, `DeleteLink`, `ListLinks`.
   - استفاده استاندارد از `Scopes(paginationScope.GetScope())`.
4. **لایه Service (`internal/service/link/`):**
   - تفکیک فایل‌ها به ازای هر اندپوینت:
     - `create.go`: تولید توکن امن کریپتو، اعتبارسنجی شناسه‌ها و ثبت.
     - `detail.go`: بازخوانی اطلاعات تکی با پشتیبانی از ID سیستمی یا کارگاهی.
     - `update.go`: اصلاح مشخصات، مدل‌ها و زمان‌بندی.
     - `revoke.go`: باطل‌کردن دسترسی لینک.
     - `reactivate.go`: بازنشانی شمارنده‌ها و فعال‌سازی مجدد.
     - `delete.go`: حذف لینک.
     - `list.go`: ماژولار و تمیز همراه با توابع کمکی تبدیل DTO و مدیریت فیلترها.
5. **لایه Handler (`internal/handler/link/`):**
   - فایل‌های مجزا: `create.go`, `detail.go`, `update.go`, `revoke.go`, `reactivate.go`, `delete.go`, `list.go`.
6. **لایه Routing (`cmd/server/routes/link.go`):**
   - رجیستری کلیه روت‌ها با میدل‌ویر `RequireAdminAuth` در `apiGroup.Group("/links")`.

---

## ۵. کلیدهای خطا و پیام‌های ثابت

### ۵.۱. کلیدهای خطای جدید در `statics/errors/customErrors.go`:
- `LinkNotFound = "linkNotFound"`
- `InvalidLinkID = "invalidLinkID"`
- `NoShoesSelectedForLink = "noShoesSelectedForLink"`
- `InvalidAuthMethod = "invalidAuthMethod"`

### ۵.۲. ترجمه فارسی در `statics/errors/faTranslation.go`:
- `LinkNotFound`: "لینک دسترسی مورد نظر یافت نشد"
- `InvalidLinkID`: "شناسه لینک نامعتبر است"
- `NoShoesSelectedForLink`: "حداقل یک مدل کفش باید برای این لینک انتخاب شود"
- `InvalidAuthMethod`: "روش ورود انتخابی نامعتبر است (تنها DIRECT یا OTP مجاز است)"

### ۵.۳. پیام‌های ثابت در `statics/constants/link/constants.go`:
- `MsgLinkCreatedSuccessfully = "لینک دسترسی با موفقیت صادر شد"`
- `MsgLinkUpdatedSuccessfully = "اطلاعات لینک با موفقیت ویرایش شد"`
- `MsgLinkRevokedSuccessfully = "لینک دسترسی با موفقیت باطل و غیرفعال شد"`
- `MsgLinkReactivatedSuccessfully = "لینک دسترسی با موفقیت مجدداً فعال شد"`
- `MsgLinkDeletedSuccessfully = "لینک دسترسی با موفقیت حذف شد"`
- `MsgLinkFetchedSuccessfully = "اطلاعات لینک دسترسی با موفقیت دریافت شد"`
- `MsgLinkListFetchedSuccessfully = "فهرست لینک‌های دسترسی با موفقیت دریافت شد"`
- `CatalogURLPrefix = "/catalog"`

---

## ۶. سناریوهای تست و لبه‌ها (Test Scenarios & Edge Cases)

1. **امنیت ادمین:** تلاش برای فراخوانی بدون توکن یا با توکن نامعتبر (`401 Unauthorized`).
2. **اعتبارسنجی ورودی:** ارسال نام دریافت‌کننده خالی (`400 Bad Request`).
3. **اعتبارسنجی روش ورود OTP بدون شماره تماس:** (`400 Bad Request`).
4. **اعتبارسنجی عدم انتخاب مدل کفش:** ارسال آرایه خالی `shoeIDs` (`400 Bad Request` با کد `noShoesSelectedForLink`).
5. **صدور موفق لینک مستقیم (`DIRECT`):** تولید خودکار توکن امن، تخصیص `linkID` ترتیبی، انتساب مدل‌های کفش، محاسبه آدرس کاتالوگ و وضعیت اولیه `PENDING` (`201 Created`).
6. **صدور موفق لینک دوم با روش `OTP`:** بررسی انتساب به مشتری و ثبت شماره موبایل (`201 Created`).
7. **فهرست لینک‌ها با صفحه‌بندی:** بازگشت ساختار داده شامل `items` و `pagination` یکپارچه (`200 OK`).
8. **فیلتر لینک‌ها بر اساس وضعیت:** فیلتر `status=pending` یا `status=active` (`200 OK`).
9. **فیلتر لینک‌ها بر اساس مشتری (`customerID`):** واکشی پیوندهای مرتبط با یک مشتری مشخص (`200 OK`).
10. **جستجوی متنی:** جستجو در نام دریافت‌کننده یا شماره تلفن یا کد عددی `linkID` (`200 OK`).
11. **مشاهده جزییات با شناسه سیستمی ID:** (`200 OK`).
12. **مشاهده جزییات با کد ترتیبی linkID:** (`200 OK`).
13. **استعلام لینک ناموجود:** (`404 Not Found` با کد `linkNotFound`).
14. **ویرایش مشخصات لینک:** تغییر مدل‌های انتخابی، مدت زمان مشاهده یا مهلت انقضا (`200 OK`).
15. **ابطال لینک (`PATCH /revoke`):** تغییر وضعیت به `INACTIVE` و غیرفعال شدن دسترسی (`200 OK`).
16. **فعال‌سازی مجدد لینک (`PATCH /reactivate`):** بازنشانی تایمرهای ورود و تغییر وضعیت به `PENDING` (`200 OK`).
17. **حذف فیزیکی لینک:** حذف رکورد و پاکسازی از سیستم (`200 OK`).
18. **استعلام لینک حذف‌شده:** (`404 Not Found`).
19. **پاکسازی داده‌های تستی:** (`200 OK`).
