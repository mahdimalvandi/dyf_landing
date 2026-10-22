# تحلیل جامع موجودیت‌ها، منطق تجاری و قوانین دسترسی (Domain Entities & Business Rules)
**نسخه سند:** ۱.۰  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان بک‌اند و ایجنت‌های هوش مصنوعی پیاده‌ساز

---

## ۱. تحلیل موجودیت‌های سیستم (Entities & Data Model)

تمامی نام فیلدها و ستون‌ها در دیتابیس و کدهای Go با فرمت **camelCase** ذخیره و بازیابی می‌شوند.

### ۱.۱. موجودیت مدیر (Admin)
مدیران کسانی هستند که مجاز به ورود به پنل مدیریت (`/admin`) جهت ثبت محصولات، دسته‌ها، مشتریان و صدور لینک‌ها هستند.
- `id` (int/uint, Primary Key, Auto Increment)
- `firstName` (string, required)
- `lastName` (string, required)
- `phoneNumber` (string, unique, indexed, required) — فرمت استاندارد ایران (مثال: `09121234567`)
- `isActive` (bool, default: true)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ۱.۲. موجودیت دسته‌بندی / لاین محصول (Category)
لاین‌های محصول کارگاه DYF (مانند: کفش‌های رسمی، کالج و ملوانی، بوت و نیم‌بوت، صندل و اسلیپرز).
- **قاعده محصولی:** تمامی دسته‌بندی‌ها به صورت همیشگی فعال هستند (قابلیت غیرفعال‌سازی حذف شده است).
- `id` (int/uint, Primary Key, Auto Increment)
- `title` (string, required) — نام لاین به فارسی (مثال: «کفش رسمی دست‌دوز»)
- `slug` (string, unique, required) — شناسه لاتین لاین (مثال: `formal-oxford`)
- `description` (string, nullable) — توضیحات لاین
- `sortOrder` (int, default: 0) — ترتیب نمایش در کاتالوگ
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ۱.۳. موجودیت مدل کفش (ShoeModel)
شناسنامه و اطلاعات کامل هر محصول تولیدی در کارگاه DYF.
- **قاعده محصولی (انتشار مستقیم):** تمامی مدل‌های ثبت‌شده، مستقیماً و دائمی در وضعیت «منتشرشده» (فعال) قرار دارند. وضعیت پیش‌نویس، آرشیو یا غیرفعال وجود ندارد.
- `id` (int/uint, Primary Key, Auto Increment) — شناسه عددی سیستمی (در رابط کاربری به صورت `DYF-{id}` یا عدد نمایش داده می‌شود).
- `shoeTitle` (string, required) — عنوان مدل (مثال: «کفش آکسفورد تمام‌چرم برندن»)
- `description` (string, text) — توضیحات تخصصی، مشخصات چرم، کفی و زیره
- `colors` (JSONB array / string array) — آرایه‌ای از نام یا کدهای رنگ (مثال: `["مشکی واکس‌خورده", "عسلی پتینه‌شده"]`)
- `sizes` (JSONB array / int array) — آرایه‌ای از سایزهای قابل تولید (مثال: `[40, 41, 42, 43, 44, 45]`)
- `primaryImageUrl` (string, required) — تصویر شاخص/کاور محصول
- `images` (JSONB array) — آرایه‌ای از اشیای مدیا با ساختار: `[{"url": "...", "sortOrder": 1, "isPrimary": true}]`
- `videos` (JSONB array) — آرایه‌ای از ویدیوهای ژورنالی و شات کارگاهی: `[{"url": "...", "title": "..."}]`
- `categoryIds` (JSONB / Many-to-Many) — لیست دسته‌بندی‌هایی که این مدل عضو آن‌هاست.
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ۱.۴. موجودیت مشتری / همکار تجاری (Customer)
اطلاعات بنکداران، صاحبان بوتیک‌ها و همکاران B2B که توسط مدیر ثبت می‌شوند.
- `id` (int/uint, Primary Key, Auto Increment)
- `firstNameFa` (string, required) — نام فارسی (مثال: «مصطفی»)
- `lastNameFa` (string, required) — نام خانوادگی فارسی (مثال: «کمالی»)
- `firstNameEn` (string, nullable) — نام انگلیسی
- `lastNameEn` (string, nullable) — نام خانوادگی انگلیسی
- `storeName` (string, nullable) — نام بنکداری/فروشگاه (مثال: «بوتیک کفش پالادیوم»)
- `phoneNumber` (string, unique, indexed, required) — شماره تلفن همراه یکتا
- `isActive` (bool, default: true) — وضعیت حساب مشتری (در صورت غیرفعال بودن، امکان هیچ‌گونه ورودی ندارد)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ۱.۵. مجوز دسترسی مستقیم مشتری (CustomerDirectPermission)
هر مشتری می‌تواند یک دسترسی مستقیم متصل به پروفایل خود داشته باشد که با ورود مستقیم با شماره تلفن از طریق سایت عمومی (`/catalog.html`) بررسی می‌شود.
- `id` (int/uint, Primary Key, Auto Increment)
- `customerId` (uint, Foreign Key -> `customers.id`, unique)
- `allowedCategoryIds` (JSONB array of ints) — دسته‌بندی‌های مجاز
- `allowedShoeIds` (JSONB array of ints) — مدل‌های مجاز به صورت مستقل
- `excludedShoeIds` (JSONB array of ints) — مدل‌های مستثناشده
- `durationMinutes` (int, default: 0) — مدت مشاهده به دقیقه (0 یعنی نامحدود)
- `expiresAt` (timestamp, nullable) — تاریخ و ساعت انقضای نهایی
- `isActive` (bool, default: true) — فعال یا غیرفعال توسط مدیر
- `startedAt` (timestamp, nullable) — زمان اولین ورود و استارت تایمر در دوره جاری
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ۱.۶. موجودیت لینک اختصاصی (AccessLink)
پیوند امن و توکن‌دار که به مشتری یا هر شخص دریافت‌کننده‌ای داده می‌شود.
- `id` (int/uint, Primary Key, Auto Increment)
- `token` (string, unique, indexed, required) — توکن تصادفی غیرقابل‌حدس و امن (مثال: رشته هگز/رندوم حداقل ۱۶ یا ۳۲ کاراکتری)
- `title` (string, nullable) — عنوان یا برچسب لینک (جهت راحتی مدیر در پنل)
- `recipientNameFa` (string, required) — نام گیرنده لینک
- `recipientLastNameFa` (string, required) — نام خانوادگی گیرنده
- `recipientNameEn` (string, nullable)
- `recipientLastNameEn` (string, nullable)
- `customerId` (uint, Foreign Key -> `customers.id`, nullable) — پیوند اختیاری به یک مشتری موجود
- `authType` (enum/string: `'DIRECT'` | `'PHONE_OTP'`) — روش دسترسی:
  - `DIRECT`: بازکردن لینک بدون نیاز به کد تایید
  - `PHONE_OTP`: الزام ورود شماره و دریافت کد یک‌بارمصرف
- `requiredPhoneNumber` (string, nullable) — شماره تلفنی که در روش `PHONE_OTP` باید تطبیق داده شود
- `allowedCategoryIds` (JSONB array of ints)
- `allowedShoeIds` (JSONB array of ints)
- `excludedShoeIds` (JSONB array of ints)
- `durationMinutes` (int, default: 0) — مدت زمان مجاز مشاهده به دقیقه (0 یعنی نامحدود)
- `expiresAt` (timestamp, nullable) — مهلت نهایی اعتبار لینک
- `isActive` (bool, default: true) — وضعیت فعال/غیرفعال توسط مدیر
- `cycleNumber` (int, default: 1) — شماره دوره فعال‌سازی (با هر بار فعال‌سازی مجدد افزایش می‌یابد تا نشست‌های قبلی باطل شوند)
- `startedAt` (timestamp, nullable) — زمان اولین ورود موفق به کاتالوگ در دوره جاری
- `lastAccessedAt` (timestamp, nullable) — آخرین زمان ارتباط با سرور
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### ۱.۷. نشست فعال و سشن کاتالوگ (CatalogSession)
برای ردیابی حضور مشتریان در کاتالوگ و کنترل زمان باقی‌مانده سمت سرور:
- `id` (uuid / string, Primary Key)
- `accessType` (enum/string: `'DIRECT_CUSTOMER'` | `'LINK'`)
- `accessLinkId` (uint, nullable)
- `customerId` (uint, nullable)
- `cycleNumber` (int) — تطبیق با دوره فعال‌سازی لینک
- `clientIp` (string)
- `userAgent` (string)
- `startedAt` (timestamp)
- `expiresAt` (timestamp) — دقیقاً لحظه پایان مهلت مشاهده
- `createdAt` (timestamp)

### ۱.۸. کدهای یک‌بارمصرف پیامکی (OtpVerification)
- `id` (int/uint, Primary Key, Auto Increment)
- `phoneNumber` (string, indexed)
- `code` (string) — کد ۵ رقمی
- `purpose` (string: `'ADMIN_LOGIN'` | `'CUSTOMER_LOGIN'` | `'LINK_VERIFY'`)
- `expiresAt` (timestamp) — اعتبار ۲ دقیقه‌ای
- `attempts` (int, default: 0) — شمارنده تلاش‌های ناموفق
- `isUsed` (bool, default: false)
- `createdAt` (timestamp)

---

## ۲. قوانین تجاری و فرمول‌های دسترسی (Business Rules)

### ۲.۱. فرمول طلایی تعیین محصولات قابل نمایش (Access Resolution Formula)
هنگامی که یک مشتری یا دارنده لینک قصد دارد لیست کفش‌های کاتالوگ را دریافت کند، سرور فیلترینگ را بر اساس این منطق دقیق پیاده‌سازی می‌کند:

یک مدل کفش (`shoe`) در کاتالوگ نمایش داده می‌شود **اگر و تنها اگر تمام شروط زیر برقرار باشد:**

$$\text{Visible}(shoe) \iff \text{Condition}_1 \land \text{Condition}_2 \land \text{Condition}_3 \land \text{Condition}_4$$

1. **شرط ۱ (مجوز کلی فعال باشد):**
   - برای لینک: `link.isActive == true` و در صورتی که `expiresAt != null` باشد، `now() < link.expiresAt`.
   - برای مشتری مستقیم: `customer.isActive == true` و `permission.isActive == true` و `now() < permission.expiresAt`.
2. **شرط ۲ (تایمر مشاهده تمام نشده باشد):**
   - اگر `durationMinutes > 0` و `startedAt != null`:
     $$\text{now}() < (\text{startedAt} + \text{durationMinutes} \times 60)$$
3. **شرط ۳ (شمول دسته‌بندی یا افزودن مستقیم):**
   - مدل حداقل در یکی از دسته‌بندی‌های مجاز باشد:
     $$(\text{shoe.categoryIds} \cap \text{permission.allowedCategoryIds} \neq \emptyset)$$
   - **یا** مدل مستقیماً در لیست مدل‌های مجاز ثبت شده باشد:
     $$(\text{shoe.id} \in \text{permission.allowedShoeIds})$$
4. **شرط ۴ (قانون اولویت استثنا - Exclusion Override):**
   - مدل **نباید** در لیست مدل‌های مستثناشده باشد:
     $$(\text{shoe.id} \notin \text{permission.excludedShoeIds})$$
   - *نکته حیاتی:* حتی اگر مدل عضو تمامی دسته‌بندی‌های مجاز کاربر باشد، چنانچه در `excludedShoeIds` قرار داشته باشد، **به هیچ وجه** نباید به کلاینت تحویل داده شود یا در جست‌وجو بیاید.

---

## ۳. قوانین مدیریت زمان و تایمر مشاهده (Time & Timer Rules)

1. **مبدأ آغاز تایمر (Timer Start):**
   - تایمر از لحظه باز کردن صفحه کاتالوگ و دریافت موفق پاسخ احراز هویت آغاز می‌شود (`startedAt = now()`).
   - تا قبل از اولین مشاهده موفق، وضعیت لینک: `ACTIVE_UNSEEN` (فعال، استفاده‌نشده) است.
2. **پایداری تایمر (State Persistence):**
   - رفرش صفحه، بستن مرورگر یا تغییر دستگاه به هیچ وجه تایمر را از نو شروع نمی‌کند.
   - زمان پایان مطلق است:
     $$\text{AbsoluteEndTime} = \min(\text{startedAt} + \text{durationMinutes}, \text{expiresAt})$$
   - سرور در هر درخواست کاتالوگ، مقدار ثانیه‌های باقی‌مانده (`remainingSeconds`) را به صورت زنده محاسبه کرده و در هدر یا متای پاسخ برمی‌گرداند.
3. **انقضا در لحظه (Instant Cut-off):**
   - به محض رسیدن ثانیه‌ها به صفر، کلیه درخواست‌های بعدی کلاینت با خطای `LINK_EXPIRED` (کد 403 یا 410) مواجه می‌شوند و هیچ اطلاعاتی از کفش‌ها برگشت داده نمی‌شود.
4. **فعال‌سازی مجدد توسط مدیر (Reactivation):**
   - مدیر می‌تواند یک لینک منقضی یا غیرفعال را با زمان‌های جدید مجدداً فعال کند.
   - با فعال‌سازی مجدد:
     - `cycleNumber = cycleNumber + 1` می‌شود تا کلیه نشست‌های قبلی بی‌اعتبار شوند.
     - `startedAt = null` می‌شود تا شمارش فقط با اولین ورود دوره جدید آغاز گردد.
     - `isActive = true` می‌شود.

---

## ۴. ماتریس وضعیت‌های عملیاتی دسترسی (Link Status State Machine)

| نام وضعیت | کد انگلیسی | شرایط در دیتابیس | پیام به کاربر |
| :--- | :--- | :--- | :--- |
| **غیرفعال** | `DISABLED` | `isActive == false` | دسترسی به این کاتالوگ توسط مدیریت متوقف شده است. |
| **فعال و استفاده‌نشده** | `ACTIVE_UNSEEN` | `isActive == true` AND `startedAt == null` AND (`expiresAt == null` OR `now() < expiresAt`) | دسترسی آماده استفاده است و با ورود فعال می‌شود. |
| **در حال استفاده** | `IN_USE` | `isActive == true` AND `startedAt != null` AND `now() < AbsoluteEndTime` | کاتالوگ فعال است و تایمر شمارش معکوس دارد. |
| **منقضی‌شده (مهلت انقضا)** | `EXPIRED` | `expiresAt != null` AND `now() >= expiresAt` | مهلت تقویمی اعتبار این لینک به پایان رسیده است. |
| **پایان‌یافته (اتمام تایمر)** | `FINISHED` | `durationMinutes > 0` AND `now() >= (startedAt + durationMinutes)` | مدت زمان مجاز مشاهده این کاتالوگ به پایان رسیده است. |
