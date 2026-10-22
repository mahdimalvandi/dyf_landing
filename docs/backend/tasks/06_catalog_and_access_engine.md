# تسک ۶: موتور کاتالوگ خصوصی، ماتریس دسترسی و سشن‌های زمان‌دار
**مسیر سند:** `docs/backend/tasks/06_catalog_and_access_engine.md`  
**وضعیت:** آماده پیاده‌سازی  
**وابستگی‌ها:** تسک ۳ (مدل‌ها)، تسک ۴ (مشتریان) و تسک ۵ (لینک‌ها)

---

## ۱. هدف و دامنه تسک

پیاده‌سازی هسته پردازشی کاتالوگ خصوصی DYF که وظیفه احراز صلاحیت خریدار، کنترل دقیق فرمول دسترسی به کفش‌ها، مدیریت تایمر زنده نشست سمت سرور و قطع فوری دسترسی پس از پایان مهلت را بر عهده دارد.

---

## ۲. منطق‌های حیاتی هسته کاتالوگ (Core Business Rules)

### ۲.۱. فرمول قطعی فیلتر مدل‌های قابل مشاهده (Access Matrix Formula)
یک مدل کفش (`shoe`) در کاتالوگ خریدار مجاز است **اگر و تنها اگر تمام شروط زیر برقرار باشد:**

1. **اعتبار کلی دسترسی:** لینک یا دسترسی مستقیم مشتری فعال باشد (`isActive == true`) و در صورت وجود `expiresAt`، زمان فعلی کمتر از آن باشد (`now < expiresAt`).
2. **عدم اتمام تایمر:** در صورت زمان‌دار بودن (`durationMinutes > 0`)، زمان فعلی از سقف `startedAt + (durationMinutes * 60)` نگذشته باشد.
3. **شمول دسته‌بندی یا افزودن مستقیم:**
   - حداقل یکی از دسته‌بندی‌های مدل در `allowedCategoryIDs` باشد:
     $$(\text{shoe.categoryIDs} \cap \text{permission.allowedCategoryIDs} \neq \emptyset)$$
   - **یا** شناسه مدل مستقیماً در لیست مدل‌های مجاز ثبت شده باشد:
     $$(\text{shoe.ID} \in \text{permission.allowedShoeIDs})$$
4. **قانون اولویت استثنا (Exclusion Override - خط قرمز محصول):**
   - شناسه مدل **نباید** در لیست مدل‌های مستثناشده باشد:
     $$(\text{shoe.ID} \notin \text{permission.excludedShoeIDs})$$
   - *حتی اگر مدل عضو تمام دسته‌های مجاز خریدار باشد، در صورت قرار داشتن در لیست استثنائات، تحت هیچ شرایطی نباید نمایش داده شود یا در جست‌وجو بیاید.*

### ۲.۲. استارت تایمر و پایداری سشن سمت سرور
- تایمر مشاهده با اولین ورود موفق به کاتالوگ در دوره جاری آغاز می‌شود:
  ```go
  if link.StartedAt == 0 && link.DurationMinutes > 0 {
      link.StartedAt = currentUnixTime
      linkRepository.UpdateStartedAt(ctx, link.ID, currentUnixTime)
  }
  ```
- زمان پایان قطعی برابر است با:
  $$\text{AbsoluteEndTime} = \min(\text{startedAt} + (\text{durationMinutes} \times 60), \text{expiresAt})$$
- ثانیه‌های باقی‌مانده (`remainingSeconds`) در هر درخواست به صورت زنده محاسبه می‌شود:
  $$\text{remainingSeconds} = \max(0, \text{AbsoluteEndTime} - \text{currentUnixTime})$$
- رفرش صفحه یا باز کردن هم‌زمان روی چند دستگاه، تایمر را ریست نمی‌کند چون مبدأ `startedAt` در دیتابیس ثبت شده است.
- به محض رسیدن `remainingSeconds` به صفر، کلیه درخواست‌های بعدی با خطای `LINK_EXPIRED` (کد 410) مواجه می‌شوند و هیچ اطلاعاتی از کفش‌ها برگردانده نمی‌شود.

---

## ۳. طراحی موجودیت نشست کاتالوگ در دیتابیس

### ۳.۱. فایل مایگریشن
- `backend/migrations/000007_create_catalog_tokens.up.sql`
- `backend/migrations/000007_create_catalog_tokens.down.sql`

```sql
CREATE TABLE IF NOT EXISTS "catalogTokens" (
    "ID" BIGINT PRIMARY KEY,
    "tokenHash" VARCHAR(32) NOT NULL UNIQUE,
    "accessType" VARCHAR(20) NOT NULL, -- 'DIRECT_CUSTOMER' or 'LINK'
    "accessLinkID" BIGINT REFERENCES "accessLinks" ("ID") ON DELETE CASCADE,
    "customerID" BIGINT REFERENCES "customers" ("ID") ON DELETE CASCADE,
    "cycleNumber" INT NOT NULL DEFAULT 1,
    "clientIP" VARCHAR(45),
    "startedAt" BIGINT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_catalogTokens_tokenHash" ON "catalogTokens" ("tokenHash");
CREATE INDEX IF NOT EXISTS "idx_catalogTokens_linkID" ON "catalogTokens" ("accessLinkID");
CREATE INDEX IF NOT EXISTS "idx_catalogTokens_expiresAt" ON "catalogTokens" ("expiresAt");
```

---

## ۴. قرارداد اندپوینت‌های API کاتالوگ خریدار

### ۴.۱. اعتبارسنجی اولیه توکن لینک در لندینگ کاتالوگ
- **متد و مسیر:** `GET /api/v1/catalog/validate-token?token=9b44fa71...`
- **شرح:** بررسی توکن لینک در پایگاه‌داده و مشخص کردن روش دسترسی.
- **پاسخ در حالت ورود مستقیم (`DIRECT`):**
  - استارت تایمر (در صورت اولین ورود).
  - صدور توکن سشن کاتالوگ (`sessionToken`) و ذخیره هش MD5 آن در `"catalogTokens"`.
  - بازگرداندن اطلاعات سشن و مشخصات خریدار:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "ورود به کاتالوگ مجاز است",
    "data": {
      "requiresPhoneOTP": false,
      "sessionToken": "d41d8cd98f00b204e9800998ecf8427e...",
      "recipientName": "مهندس امید شمس",
      "remainingSeconds": 3600,
      "durationMinutes": 60
    }
  }
  ```
- **پاسخ در حالت نیازمند تایید شماره (`PHONE_OTP`):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "نیاز به واردکردن شماره تلفن و تایید کد پیامکی",
    "data": {
      "requiresPhoneOTP": true,
      "recipientName": "مصطفی کمالی"
    }
  }
  ```

### ۴.۲. تایید شماره تلفن و صدور سشن برای لینک‌های پیامکی
- **متد و مسیر:** `POST /api/v1/catalog/verify-phone`
- **بدنه درخواست (JSON):**
  ```json
  {
    "token": "9b44fa71...",
    "phoneNumber": "09121112233",
    "code": "12345"
  }
  ```
- **رفتار سرور:** تطبیق شماره با `requiredPhoneNumber` لینک، اعتبارسنجی OTP و صدور توکن نشست کاتالوگ.

### ۴.۳. دریافت اطلاعات لحظه‌ای سشن و زمان باقی‌مانده
- **متد و مسیر:** `GET /api/v1/catalog/session-info`
- **هدر:** `Authorization: Bearer <sessionToken>`
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "اطلاعات نشست معتبر است",
    "data": {
      "recipientName": "مهندس امید شمس",
      "remainingSeconds": 2840,
      "isUnlimited": false
    }
  }
  ```

### ۴.۴. دریافت دسته‌بندی‌های مجاز برای خریدار
- **متد و مسیر:** `GET /api/v1/catalog/categories`
- **هدر:** `Authorization: Bearer <sessionToken>`
- **شرح:** فقط دسته‌هایی بازگردانده می‌شوند که خریدار حداقل به یک مدل کفش در آن دسته دسترسی دارد.

### ۴.۵. دریافت لیست کفش‌های مجاز (با اعمال ماتریس دسترسی)
- **متد و مسیر:** `GET /api/v1/catalog/shoes`
- **هدر:** `Authorization: Bearer <sessionToken>`
- **کوئری پارامترها:** `page`, `limit`, `categoryID`, `search`
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "مدل‌های مجاز دریافت شد",
    "data": [
      {
        "ID": 1729598284920192410,
        "shoeTitle": "کفش آکسفورد مدل برندن",
        "description": "چرم طبیعی تبریز",
        "primaryImageURL": "/uploads/shoes/cover1.jpg",
        "colors": ["مشکی", "عسلی"],
        "sizes": [41, 42, 43],
        "categoryIDs": [1729598273928192831]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 6,
      "totalPages": 1
    }
  }
  ```

### ۴.۶. مشاهده شناسنامه و رسانه‌های یک مدل کفش مجاز
- **متد و مسیر:** `GET /api/v1/catalog/shoes/:id`
- **هدر:** `Authorization: Bearer <sessionToken>`
- **رفتار سرور:** بررسی صلاحیت دسترسی به این مدل بر اساس فرمول؛ در صورت عدم دسترسی: `403 Forbidden` با کد `FORBIDDEN`.

---

## ۵. چک‌لیست فایل‌های موردنیاز برای ساخت در این تسک

- [ ] `backend/internal/entity/catalogToken.go`: مدل ساختاری `CatalogToken`
- [ ] `backend/internal/dto/catalogDTO.go`: استراکت‌های پاسخ کاتالوگ و اعتبارسنجی
- [ ] `backend/internal/repository/catalogSessionRepo.go`: ثبت سشن و اعتبارسنجی بر اساس هش MD5
- [ ] `backend/internal/service/catalogAccessService.go`: پیاده‌سازی هسته فرمول دسترسی، تایمر زنده و اعتبارسنجی چرخه‌ها
- [ ] `backend/internal/middleware/authCatalog.go`: میدلور بررسی توکن نشست کاتالوگ، استعلام دوره و قطع دسترسی در صورت انقضا
- [ ] `backend/internal/handler/catalogHandler.go`: هندلرهای کاتالوگ برای Fiber v3
