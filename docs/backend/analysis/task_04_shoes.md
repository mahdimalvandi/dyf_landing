# سند تحلیل فنی تسک ۴: مدیریت و شناسنامه مدل‌های کفش (Shoe Catalog Management)
**مسیر سند:** `docs/backend/analysis/task_04_shoes.md`  
**وضعیت:** در انتظار بازبینی و تأیید کاربر (Pending User Review)  
**نسخه:** ۱.۰  

---

## ۱. هدف و چشم‌انداز محصولی (Product Vision & Goals)

محور اصلی برند چرم لوکس DYF، ژورنال و مشخصات مدل‌های کفش دست‌دوز کارگاه است.  
اهداف این ماژول عبارتند از:
- ثبت متمرکز شناسنامه فنی محصولات شامل توضیحات چرم، زیره و دوخت.
- مدیریت تنوع رنگ‌ها و سایزهای موجود به صورت چندگانه.
- انتساب منعطف هر مدل کفش به یک یا چند لاین محصول (دسته‌بندی‌ها).
- نگهداری و مدیریت گالری تصاویر و ویدیوهای کارگاهی برای هر کفش و تعیین تصویر کاور اصلی.
- تخصیص خودکار و ترتیبی کد مدل کارگاهی (`modelID`) در کنار شناسه سیستمی (`ID`).
- فهرست‌بندی محصولات با قابلیت صفحه‌بندی (Pagination)، فیلتر بر اساس دسته‌بندی و جستجو.
- وضعیت دائمی و همیشگی «منتشرشده» برای تمام مدل‌های ثبت‌شده (حذف وضعیت‌های زائد پیش‌نویس یا آرشیو).

---

## ۲. طراحی پایگاه داده (Database Schema & Migration)

طبق استانداردهای مصوب معماری:
- ایجاد یک فایل مایگریشن رو به جلو (`000005_create_shoe_models.up.sql`) و یک فایل بازگشت (`000005_create_shoe_models.down.sql`).
- شناسه رکورد از نوع `BIGINT PRIMARY KEY` (نانوثانیه با `time.Now().UnixNano()`).
- فیلد کد کارگاهی `"modelID"` به صورت خودکار، ترتیبی و خوانا (`BIGSERIAL UNIQUE`) جهت سفارش‌گذاری و استعلام.
- استفاده از ساختار بهینه `JSONB` برای نگهداری آرایه‌های رنگ‌ها، سایزها، دسته‌بندی‌ها و رسانه‌ها (حفظ قانون یک جدول در هر مایگریشن و سرعت بالای کوئری‌ها).
- صفر کامنت در فایل‌های مایگریشن SQL.
- عدم وجود فیلدهای `createdAt` و `updatedAt` جهت سادگی، سبکی و پایبندی به استانداردهای پروژه.

### ۲.۱. ساختار جدول `"shoeModels"`
```sql
CREATE TABLE IF NOT EXISTS "shoeModels" (
    "ID" BIGINT PRIMARY KEY,
    "modelID" BIGSERIAL UNIQUE,
    "shoeTitle" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "colors" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sizes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "images" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "videos" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "categoryIDs" JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS "idx_shoeModels_modelID" ON "shoeModels" ("modelID");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_shoeTitle" ON "shoeModels" ("shoeTitle");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_categoryIDs" ON "shoeModels" USING GIN ("categoryIDs");
```

### ۲.۲. شرح فیلدهای جدول
| نام ستون | نوع داده در دیتابیس | نوع در Go | توضیحات و کارکرد |
|:---|:---:|:---:|:---|
| `"ID"` | `BIGINT PRIMARY KEY` | `int64` | شناسه فنی یکتای سیستمی بر اساس نانوثانیه |
| `"modelID"` | `BIGSERIAL UNIQUE` | `int64` | کد ترتیبی و خودکار کارگاهی (`1, 2, 3...`) جهت گفتگوی تلفنی و سفارش بنکدار |
| `"shoeTitle"` | `VARCHAR(255) NOT NULL` | `string` | نام اختصاصی مدل کفش (مثلاً «کفش آکسفورد مدل ونیز») |
| `"description"` | `TEXT NOT NULL` | `string` | مشخصات تخصصی چرم رویه، کفی طبی، جنس زیره و دوخت |
| `"coverImage"` | `TEXT NOT NULL` | `string` | آدرس تصویر کاور اصلی جهت نمایش در کارت‌ها و ویترین |
| `"colors"` | `JSONB NOT NULL` | `[]string` | لیست رنگ‌های قابل سفارش (مثلاً `["مشکی واکس‌خورده", "عسلی پتینه‌ای"]`) |
| `"sizes"` | `JSONB NOT NULL` | `[]int` | لیست سایزهای تولیدی (مثلاً `[40, 41, 42, 43, 44, 45]`) |
| `"images"` | `JSONB NOT NULL` | `[]string` | آرایه آدرس تصاویر گالری مدل |
| `"videos"` | `JSONB NOT NULL` | `[]string` | آرایه آدرس ویدیوهای نمایشی و کارگاهی |
| `"categoryIDs"` | `JSONB NOT NULL` | `[]int64` | آرایه شناسه‌های دسته‌بندی‌های منتسب به این کفش |

---

## ۳. طراحی روت‌ها و قرارداد APIها (API Contracts)

خانواده مسیر: `/api/v1/shoes`

### ۳.۱. جدول خلاصه مسیرها (کلیه روت‌ها در این فاز مخصوص ادمین و نیازمند توکن هستند)
| متد | مسیر (Endpoint) | دسترسی | شرح عملکرد |
|:---:|:---|:---:|:---|
| `GET` | `/api/v1/shoes` | **ادمین** | دریافت فهرست مدل‌های کفش با صفحه‌بندی، فیلتر و جستجو |
| `GET` | `/api/v1/shoes/:id` | **ادمین** | دریافت شناسنامه فنی کامل یک مدل کفش |
| `POST` | `/api/v1/shoes` | **ادمین** | ثبت مدل کفش جدید در سیستم |
| `PUT` | `/api/v1/shoes/:id` | **ادمین** | ویرایش اطلاعات، رنگ‌ها، سایزها و مشخصات کفش |
| `DELETE` | `/api/v1/shoes/:id` | **ادمین** | حذف دائم یک مدل کفش |
| `POST` | `/api/v1/shoes/upload` | **ادمین** | آپلود فایل تصویر یا ویدیو و دریافت آدرس استاتیک |
| `PUT` | `/api/v1/shoes/:id/cover` | **ادمین** | تغییر سریع تصویر کاور اصلی مدل |
| `DELETE` | `/api/v1/shoes/:id/media` | **ادمین** | حذف یک فایل رسانه مشخص از گالری مدل |

> **نکته بیزنسی و امنیتی فاز فعلی:**  
> طبق تصمیم کارفرما، کلیه روت‌های کفش‌ها (شامل مشاهده لیست و جزییات) در این فاز اختصاصاً برای پنل ادمین فعال شده و نیازمند توکن معتبر ادمین در هدر Authorization هستند. در فازهای بعدی، روت‌های عمومی/کاتالوگ مشتری بر اساس توکن مجوزهای دسترسی (Task 06) اضافه خواهند شد.

### ۳.۲. کوئری کارآمد روی `categoryIDs` در PostgreSQL
برای فیلتر کردن کفش‌ها بر اساس یک دسته‌بندی مشخص (`categoryID = 12`)، به لطف ایندکس `GIN` روی ستون `categoryIDs`، پایگاه داده PostgreSQL مستقیماً و با حداکثر سرعت از عملگر Containment (`@>`) استفاده می‌کند:
```sql
SELECT * FROM "shoeModels" WHERE "categoryIDs" @> '[12]'::jsonb;
```
این قابلیت در دیتابیس به صورت کامپایل‌شده و با درخت جستجوی معکوس (Inverted Index) اجرا می‌شود و هیچ نیازی به Joinهای سنگین چندجدولی ندارد.

---

### ۳.۲. جزییات ورودی و خروجی Endpointها

#### ۱. فهرست مدل‌های کفش (`GET /api/v1/shoes`)
- **کوئری پارامترها (Query Params):**
  - `page`: شماره صفحه (پیش‌فرض: `1`)
  - `limit`: تعداد در هر صفحه (پیش‌فرض: `12`، حداکثر: `50`)
  - `categoryID`: فیلتر اختیاری بر اساس شناسه عددی یک دسته‌بندی
  - `search`: جستجوی اختیاری در عنوان کفش یا جستجوی دقیق در `modelID`
- **پاسخ موفق (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "فهرست مدل‌های کفش با موفقیت دریافت شد",
  "data": [
    {
      "ID": 1792759000000000000,
      "modelID": 1,
      "title": "کفش آکسفورد مدل ونیز",
      "description": "رویه چرم طبیعی گاوی درجه یک، زیره میکرولایت با دوخت دستی",
      "coverImage": "/uploads/shoes/venice_cover.jpg",
      "categories": [
        {
          "ID": 1792757059582788000,
          "title": "کفش رسمی دست‌دوز"
        }
      ],
      "colors": ["مشکی واکس‌خورده", "عسلی پتینه‌ای"],
      "colorsCount": 2,
      "sizes": [40, 41, 42, 43, 44],
      "sizesCount": 5,
      "images": ["/uploads/shoes/venice_1.jpg", "/uploads/shoes/venice_2.jpg"],
      "videos": ["/uploads/shoes/venice_making.mp4"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 35,
    "totalPages": 3
  }
}
```

---

#### ۲. دریافت شناسنامه فنی کفش (`GET /api/v1/shoes/:id`)
- **پارامتر مسیر:** `:id` (پشتیبانی هوشمند از شناسه نانوثانیه‌ای `ID` یا کد کارگاهی `modelID`).
- **پاسخ موفق (200 OK):** بازگرداندن کلیه جزییات مدل، اطلاعات کامل دسته‌بندی‌ها و رسانه‌ها.

---

#### ۳. ثبت مدل جدید (`POST /api/v1/shoes`)
- **هدر:** `Authorization: Bearer <ADMIN_TOKEN>`
- **ساختار بدنه درخواست (JSON):**
```json
{
  "title": "کفش آکسفورد مدل ونیز",
  "description": "رویه چرم طبیعی گاوی، آستر بزی آنتی‌باکتریال",
  "categoryIDs": [1792757059582788000],
  "colors": ["مشکی واکس‌خورده", "عسلی پتینه‌ای"],
  "sizes": [40, 41, 42, 43, 44],
  "images": ["/uploads/shoes/img1.jpg", "/uploads/shoes/img2.jpg"],
  "videos": ["/uploads/shoes/vid1.mp4"],
  "coverImage": "/uploads/shoes/img1.jpg"
}
```
*نکته: در صورتی که `coverImage` خالی ارسال شود اما در آرایه `images` تصویری وجود داشته باشد، به صورت خودکار اولین تصویر به عنوان کاور انتخاب می‌شود.*
- **اعتبارسنجی:** فیلد `title` الزامی است (حداقل ۲ کاراکتر). شناسه‌های موجود در `categoryIDs` در صورت ارسال، در دیتابیس بررسی می‌شوند تا معتبر باشند.
- **پاسخ موفق (201 Created):** شناسنامه ثبت‌شده به همراه `ID` و `modelID` تولیدشده.

---

#### ۴. ویرایش مدل (`PUT /api/v1/shoes/:id`)
- **هدر:** `Authorization: Bearer <ADMIN_TOKEN>`
- **بدنه درخواست:** همان ساختار ثبت با مقادیر اصلاح‌شده.
- **پاسخ موفق (200 OK):** اطلاعات به‌روزشده مدل.

---

#### ۵. حذف مدل (`DELETE /api/v1/shoes/:id`)
- **هدر:** `Authorization: Bearer <ADMIN_TOKEN>`
- **پاسخ موفق (200 OK):** حذف رکورد مدل از دیتابیس بدون آسیب به دسته‌بندی‌ها.

---

#### ۶. آپلود رسانه کارگاهی (`POST /api/v1/shoes/upload`)
- **هدر:** `Authorization: Bearer <ADMIN_TOKEN>`
- **ورودی:** `multipart/form-data` حاوی فیلد فایل `file`.
- **اعتبارسنجی فرانت و سرور:**
  - فرمت‌های مجاز تصویر: `image/jpeg`, `image/png`, `image/webp` (حداکثر ۱۰ مگابایت).
  - فرمت‌های مجاز ویدیو: `video/mp4`, `video/webm`, `video/quicktime` (حداکثر ۵۰ مگابایت).
- **محل ذخیره روی سرور:** ذخیره در دایرکتوری `./uploads/shoes/{timestamp}_{random}.{ext}`.
- **دسترس‌پذیری فایل‌ها:** فایبر دایرکتوری `./uploads` را به صورت روت استاتیک سرو می‌کند: `fiberApp.Static("/uploads", "./uploads")`.
- **پاسخ موفق (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "فایل با موفقیت بارگذاری شد",
  "data": {
    "url": "/uploads/shoes/1792759000_oxford.jpg",
    "fileType": "image",
    "fileSize": 1420580
  },
  "meta": null
}
```

---

#### ۷. تغییر سریع تصویر کاور (`PUT /api/v1/shoes/:id/cover`)
- **هدر:** `Authorization: Bearer <ADMIN_TOKEN>`
- **بدنه درخواست:**
```json
{
  "coverImage": "/uploads/shoes/venice_2.jpg"
}
```
- **رفتار بیزینسی:** فیلد `coverImage` برای مدل مربوطه مستقیماً به‌روزرسانی می‌شود. در صورتی که این آدرس در آرایه `images` نباشد، به گالری تصاویر نیز اضافه می‌گردد.
- **پاسخ موفق (200 OK)**

---

#### ۸. حذف یک رسانه از مدل (`DELETE /api/v1/shoes/:id/media`)
- **هدر:** `Authorization: Bearer <ADMIN_TOKEN>`
- **بدنه یا کوئری درخواست:**
```json
{
  "mediaURL": "/uploads/shoes/old_sample.jpg"
}
```
- **رفتار بیزینسی:** آدرس مورد نظر از آرایه `images` یا `videos` خارج می‌شود. اگر آدرس حذف‌شده همان `coverImage` باشد، کاور به اولین تصویر باقی‌مانده گالری تغییر می‌یابد (یا خالی می‌شود).
- **پاسخ موفق (200 OK)**

---

## ۴. معماری جریان داده و لایه‌بندی ماژول

1. **لایه Entity (`internal/entity/shoe/entity.go`):**
   - استراکت `ShoeModel` با تگ‌های GORM و نگاشت ستون‌های دیتابیس و پشتیبانی از آرایه‌های JSONB.
2. **لایه DTO (`internal/dto/shoe/`):**
   - `request.go`: استراکت‌های `CreateShoeRequest`, `UpdateShoeRequest`, `SetCoverRequest`, `RemoveMediaRequest`, `ListShoesQuery`.
   - `response.go`: استراکت‌های `ShoeResponse`, `ShoeListItemResponse`, `UploadMediaResponse`, `PaginationMeta`.
   - `recievers.go`: متدهای `Normalize()` برای Trim کردن فاصله‌های متنی و اعتبارسنجی ساختاری.
3. **لایه Repository (`internal/repository/shoe/repository.go`):**
   - متدهای `CreateShoe`, `UpdateShoe`, `DeleteShoe`, `FindShoeByID`, `FindShoeByModelID`, `ListShoes`, `CountShoes`.
   - کوئری پویا بر اساس فیلتر دسته‌بندی با عملگر JSONB (`categoryIDs @> ?`) و جستجوی متنی.
4. **لایه Service (`internal/service/shoe/`):**
   - هماهنگی واکشی نام دسته‌بندی‌ها از `categoryRepository` جهت تشکیل خروجی غنی.
   - اعمال منطق انتخاب هوشمند کاور و مدیریت آرایه‌های رسانه.
   - ذخیره فایل‌های چندرسانه‌ای با نام‌گذاری امن و غیرقابل بازنویسی.
5. **لایه Handler (`internal/handler/shoe/`):**
   - پارس بدنه با `request.ParseBody`، خواندن کوئری پارامترها و پاسخ با `response.Success` / `response.FromError`.
6. **لایه Routing (`cmd/server/routes/shoe.go`):**
   - ثبت روت‌ها در `apiGroup.Group("/shoes")`.
   - اعمال میدل‌ویر `RequireAdminAuth` روی متدهای `POST`, `PUT`, `DELETE`.
   - افزودن هندلر استاتیک در سرور: `fiberApp.Static("/uploads", "./uploads")`.

---

## ۵. کلیدهای خطای جدید و ترجمه فارسی

در `statics/errors/customErrors.go`:
```go
const (
    ShoeNotFound              = "shoeNotFound"
    InvalidShoeID             = "invalidShoeID"
    CategoryNotFoundForShoe   = "categoryNotFoundForShoe"
    MediaNotFound             = "mediaNotFound"
    InvalidMediaFile          = "invalidMediaFile"
    MediaSizeExceeded         = "mediaSizeExceeded"
    UploadFailed              = "uploadFailed"
)
```

در `statics/errors/faTranslation.go`:
```go
ShoeNotFound:            "مدل کفش مورد نظر یافت نشد",
InvalidShoeID:           "شناسه مدل کفش نامعتبر است",
CategoryNotFoundForShoe: "یک یا چند دسته‌بندی انتخاب‌شده در سیستم وجود ندارد",
MediaNotFound:           "فایل رسانه مورد نظر در این مدل کفش یافت نشد",
InvalidMediaFile:        "فرمت فایل ارسالی مجاز نمی‌باشد (تنها تصاویر و ویدیوهای استاندارد)",
MediaSizeExceeded:       "حجم فایل بیش از حد مجاز است",
UploadFailed:            "خطا در بارگذاری و ذخیره فایل رسانه",
```

---

## ۶. پیام‌های ثابت موفقیت

در `statics/constants/shoe/constants.go`:
```go
package shoe

const (
    MsgShoeCreatedSuccessfully     = "مدل کفش با موفقیت ثبت شد"
    MsgShoeUpdatedSuccessfully     = "مدل کفش با موفقیت ویرایش شد"
    MsgShoeDeletedSuccessfully     = "مدل کفش با موفقیت حذف شد"
    MsgShoeFetchedSuccessfully     = "شناسنامه مدل کفش با موفقیت دریافت شد"
    MsgShoeListFetchedSuccessfully = "فهرست مدل‌های کفش با موفقیت دریافت شد"
    MsgMediaUploadedSuccessfully   = "فایل رسانه با موفقیت بارگذاری شد"
    MsgCoverUpdatedSuccessfully    = "تصویر کاور مدل با موفقیت به‌روزرسانی شد"
    MsgMediaRemovedSuccessfully    = "فایل رسانه با موفقیت از مدل حذف شد"
)
```

---

## ۷. سناریوهای تست و لبه‌ها (Test Scenarios & Edge Cases)

1. **مشاهده عمومی فهرست کفش‌ها:** بدون نیاز به توکن، دریافت صفحه اول با متادیتا صفحه‌بندی (`total`, `page`, `limit`).
2. **فیلتر دسته‌بندی:** اعمال `categoryID` و اطمینان از بازگشت صرفاً کفش‌های منتسب به آن دسته.
3. **جستجو در عنوان یا کد کارگاهی:** جستجو با نام مدل یا عدد `modelID`.
4. **تست احراز هویت ادمین:** تلاش برای ثبت، ویرایش، حذف یا آپلود بدون هدر یا با توکن نامعتبر (`401 Unauthorized`).
5. **اعتبارسنجی ورودی ثبت کفش:** عنوان خالی یا خیلی کوتاه (`400 Bad Request`).
6. **بررسی صحت دسته‌بندی‌ها:** اگر شناسه‌ای ناموجود در `categoryIDs` ارسال شود (`400 Bad Request`).
7. **کد کارگاهی خودکار (`modelID`):** تضمین تخصیص عدد ترتیبی پیوسته و افزایشی.
8. **تعیین هوشمند کاور:** در صورت عدم ارسال کاور، اولین عکس گالری کاور شود.
9. **آپلود موفق رسانه:** ذخیره روی دیسک و دسترسی از طریق آدرس استاتیک.
10. **کنترل فرمت و حجم آپلود:** تلاش برای ارسال فرمت نامعتبر یا فایل بیش از سقف مجاز (`400 Bad Request`).
11. **ویرایش اطلاعات:** تغییر موفق رنگ‌ها، سایزها و توضیحات.
12. **تغییر تصویر کاور (`PUT /cover`):** تغییر موفق کاور اصلی مدل.
13. **حذف یک رسانه (`DELETE /media`):** خروج آدرس از گالری و بررسی تغییر خودکار کاور در صورت حذف عکس کاور.
14. **حذف کامل مدل کفش (`DELETE /:id`):** حذف رکورد بدون آسیب به رکوردهای جدول دسته‌بندی‌ها.
15. **تلاش برای مشاهده یا حذف شناسه ناموجود (`404 Not Found`).**
