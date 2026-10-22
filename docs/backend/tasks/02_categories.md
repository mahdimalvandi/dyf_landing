# تسک ۲: مدیریت دسته‌بندی‌ها و لاین‌های محصول کارگاه DYF
**مسیر سند:** `docs/backend/tasks/02_categories.md`  
**وضعیت:** آماده پیاده‌سازی  
**وابستگی‌ها:** تسک ۱ (احراز هویت مدیر) و استانداردهای کدنویسی

---

## ۱. هدف و دامنه تسک

پیاده‌سازی ماژول تعریف و مدیریت لاین‌های محصولات کارگاه چرم DYF (مانند: رسمی آکسفورد، کالج، بوت، اسلیپرز).  
طبق الزامات صریح محصولی:
- تمامی دسته‌بندی‌ها به صورت همیشگی فعال هستند (قابلیت غیرفعال‌سازی وجود ندارد).
- حذف یک دسته باید با تفکیک ایمن پیوند مدل‌های کفش همراه باشد.
- هر دسته شامل عنوان فارسی، شناسه لاتین (`slug` یکتا)، توضیحات و اولویت نمایش (`sortOrder`) است.

---

## ۲. مشخصات موجودیت و ساختار پایگاه داده

### ۲.۱. فایل مایگریشن
- `backend/migrations/000003_create_categories.up.sql`
- `backend/migrations/000003_create_categories.down.sql`

```sql
CREATE TABLE IF NOT EXISTS "categories" (
    "ID" BIGINT PRIMARY KEY,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL UNIQUE,
    "description" TEXT,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories" ("slug");
CREATE INDEX IF NOT EXISTS "idx_categories_sortOrder" ON "categories" ("sortOrder");
```

### ۲.۲. موجودیت Go (`internal/entity/category.go`)
```go
package entity

type Category struct {
	BaseEntity
	Title       string `gorm:"column:title" json:"title"`
	Slug        string `gorm:"column:slug" json:"slug"`
	Description string `gorm:"column:description" json:"description"`
	SortOrder   int    `gorm:"column:sortOrder" json:"sortOrder"`
}
```

---

## ۳. قرارداد اندپوینت‌های API (Admin Only)

تمامی مسیرهای این ماژول تحت پیشوند `/api/v1/admin/categories` بوده و نیازمند هدر `Authorization: Bearer <adminToken>` هستند.

### ۳.۱. دریافت فهرست دسته‌بندی‌ها به همراه تعداد مدل‌های منتسب
- **متد و مسیر:** `GET /api/v1/admin/categories`
- **کوئری پارامترها (اختیاری):**
  - `search`: جست‌وجوی متنی در عنوان و اسلاگ
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "فهرست دسته‌بندی‌ها دریافت شد",
    "data": [
      {
        "ID": 1729598273928192831,
        "title": "کفش رسمی آکسفورد",
        "slug": "formal-oxford",
        "description": "دست‌دوز با چرم گاوی طبیعی تبریز",
        "sortOrder": 1,
        "shoeCount": 12,
        "updatedAt": 1729598273
      }
    ]
  }
  ```

### ۳.۲. ایجاد دسته‌بندی جدید
- **متد و مسیر:** `POST /api/v1/admin/categories`
- **بدنه درخواست (JSON):**
  ```json
  {
    "title": "کالج و لوفر چرم",
    "slug": "leather-loafers",
    "description": "طراحی مدرن با کفی نرم طبی",
    "sortOrder": 2
  }
  ```
- **پاسخ موفق (201):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "دسته‌بندی با موفقیت ایجاد شد",
    "data": {
      "ID": 1729598284920192410,
      "title": "کالج و لوفر چرم",
      "slug": "leather-loafers",
      "description": "طراحی مدرن با کفی نرم طبی",
      "sortOrder": 2,
      "updatedAt": 1729598284
    }
  }
  ```
- **خطاهای محتمل:**
  - `409 Conflict`: در صورت تکراری بودن اسلاگ (`DUPLICATE_SLUG`).
  - `422 Unprocessable Entity`: در صورت خالی بودن عنوان یا اسلاگ (`VALIDATION_FAILED`).

### ۳.۳. دریافت جزئیات یک دسته‌بندی
- **متد و مسیر:** `GET /api/v1/admin/categories/:id`
- **پاسخ موفق (200):** بازگرداندن اطلاعات کامل دسته‌بندی.
- **خطا:** `404 Not Found` در صورت عدم وجود شناسه.

### ۳.۴. ویرایش دسته‌بندی
- **متد و مسیر:** `PUT /api/v1/admin/categories/:id`
- **بدنه درخواست (JSON):** فیلدهای قابل ویرایش (`title`, `slug`, `description`, `sortOrder`).
- **پاسخ موفق (200):** اطلاعات به‌روزشده دسته‌بندی.

### ۳.۵. حذف دسته‌بندی
- **متد و مسیر:** `DELETE /api/v1/admin/categories/:id`
- **منطق حذف ایمن:**
  - رکورد دسته از جدول `"categories"` حذف می‌شود.
  - پیوند این دسته‌بندی از فیلد `"categoryIDs"` در جدول `"shoeModels"` و مجوزهای دسترسی مشتریان/لینک‌ها تفکیک و پاک‌سازی می‌شود.
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "دسته‌بندی با موفقیت حذف شد"
  }
  ```

---

## ۴. چک‌لیست فایل‌های موردنیاز برای ساخت در این تسک

- [ ] `backend/internal/entity/category.go`: استراکت `Category` بدون تگ‌های اضافی GORM
- [ ] `backend/internal/dto/categoryDTO.go`: استراکت‌های `CreateCategoryRequest` و `UpdateCategoryRequest` و خروجی با فیلد `shoeCount`
- [ ] `backend/internal/repository/categoryRepo.go`: اینترفیس و پیاده‌سازی متدهای CRUD با رعایت ۳ خروجی در Get: `(Category, bool, error)`
- [ ] `backend/internal/service/categoryService.go`: اعتبارسنجی یکتایی اسلاگ، تخصیص شناسه نانوثانیه و هماهنگی حذف ایمن
- [ ] `backend/internal/handler/categoryHandler.go`: متدهای هندلر برای اتصال به Fiber v3
- [ ] رجیستر کردن روت‌ها در `backend/cmd/server/main.go` ذیل گروه ادمین محافظت‌شده با میدلور
