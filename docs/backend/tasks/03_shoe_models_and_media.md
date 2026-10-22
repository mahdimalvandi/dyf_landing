# تسک ۳: مدیریت مدل‌های کفش، گالری مدیا و سرویس ذخیره‌سازی فایل
**مسیر سند:** `docs/backend/tasks/03_shoe_models_and_media.md`  
**وضعیت:** آماده پیاده‌سازی  
**وابستگی‌ها:** تسک ۱ (احراز هویت)، تسک ۲ (دسته‌بندی‌ها) و اینترفیس `StorageService`

---

## ۱. هدف و دامنه تسک

پیاده‌سازی ماژول ثبت و مدیریت مشخصات فنی مدل‌های کفش برند DYF و آپلود رسانه‌های تصویری/ویدیویی.  
طبق اصول محصولی کارگاه:
- **انتشار مستقیم و دائمی:** تمامی مدل‌های ثبت‌شده از لحظه ایجاد، فعال و منتشرشده هستند (حذف مفاهیم زائد پیش‌نویس، بایگانی و وضعیت غیرفعال).
- **شناسنامه فنی کامل:** شامل عنوان، توضیحات، رنگ‌ها، سایزها، دسته‌بندی‌ها، گالری عکس (با تعیین کاور اصلی) و ویدیوها.
- **جست‌وجوی ترکیبی:** جستجو بر اساس عنوان مدل و شناسه عددی سیستمی (`DYF-ID`).
- **ذخیره‌سازی چندرسانه‌ای:** آپلود رسانه‌ها بر پایه اینترفیس `StorageService` روی فایل‌سیستم محلی سرور.

---

## ۲. طراحی موجودیت و پایگاه‌داده

### ۲.۱. فایل مایگریشن
- `backend/migrations/000004_create_shoe_models.up.sql`
- `backend/migrations/000004_create_shoe_models.down.sql`

```sql
CREATE TABLE IF NOT EXISTS "shoeModels" (
    "ID" BIGINT PRIMARY KEY,
    "shoeTitle" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "primaryImageURL" TEXT NOT NULL,
    "colors" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sizes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "images" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "videos" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "categoryIDs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_shoeModels_shoeTitle" ON "shoeModels" ("shoeTitle");
CREATE INDEX IF NOT EXISTS "idx_shoeModels_categoryIDs" ON "shoeModels" USING GIN ("categoryIDs");
```

### ۲.۲. موجودیت Go (`internal/entity/shoeModel.go`)
```go
package entity

type ShoeImage struct {
	URL       string `json:"url"`
	SortOrder int    `json:"sortOrder"`
	IsPrimary bool   `json:"isPrimary"`
}

type ShoeVideo struct {
	URL   string `json:"url"`
	Title string `json:"title"`
}

type ShoeModel struct {
	BaseEntity
	ShoeTitle       string      `gorm:"column:shoeTitle" json:"shoeTitle"`
	Description     string      `gorm:"column:description" json:"description"`
	PrimaryImageURL string      `gorm:"column:primaryImageURL" json:"primaryImageURL"`
	Colors          []string    `gorm:"column:colors;serializer:json" json:"colors"`
	Sizes           []int       `gorm:"column:sizes;serializer:json" json:"sizes"`
	Images          []ShoeImage `gorm:"column:images;serializer:json" json:"images"`
	Videos          []ShoeVideo `gorm:"column:videos;serializer:json" json:"videos"`
	CategoryIDs     []int64     `gorm:"column:categoryIDs;serializer:json" json:"categoryIDs"`
}
```

---

## ۳. لایه ذخیره‌سازی فایل (Media Storage Service)

### ۳.۱. اینترفیس ذخیره‌سازی (`pkg/storage/storage.go`)
```go
package storage

import "context"

type StorageService interface {
	Upload(ctx context.Context, fileBytes []byte, originalFilename string, subDirectory string) (string, error)
	Delete(ctx context.Context, fileURL string) error
}
```

### ۳.۲. پیاده‌سازی لوکال (`pkg/storage/filesystem.go`)
- ذخیره در مسیر محلی `./uploads/{subDirectory}/{timestamp}_{random}_{filename}`
- اعتبارسنجی نوع فایل (MIME Type):
  - تصاویر: `image/jpeg`, `image/png`, `image/webp` (حداکثر ۱۰ مگابایت)
  - ویدیوها: `video/mp4`, `video/webm` (حداکثر ۱۰۰ مگابایت)
- سرو کردن مسیر استاتیک در Fiber: `app.Static("/uploads", "./uploads")`

---

## ۴. قرارداد اندپوینت‌های API (Admin Only)

### ۴.۱. آپلود فایل رسانه‌ای (عکس یا ویدیو)
- **متد و مسیر:** `POST /api/v1/admin/media/upload`
- **نوع بدنه:** `multipart/form-data` با فیلد `file`
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "فایل با موفقیت بارگذاری شد",
    "data": {
      "fileURL": "/uploads/shoes/1729598284_oxford_cover.jpg",
      "mimeType": "image/jpeg",
      "size": 1849200
    }
  }
  ```

### ۴.۲. دریافت فهرست مدل‌های کفش (با فیلتر و صفحه‌بندی)
- **متد و مسیر:** `GET /api/v1/admin/shoes`
- **کوئری پارامترها:**
  - `page`: شماره صفحه (پیش‌فرض: ۱)
  - `limit`: تعداد در هر صفحه (پیش‌فرض: ۲۰)
  - `categoryID`: فیلتر بر اساس شناسه دسته‌بندی
  - `search`: جستجوی زنده در عنوان یا شناسه عددی مدل
- **پاسخ موفق (200):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "لیست مدل‌ها دریافت شد",
    "data": [
      {
        "ID": 1729598284920192410,
        "shoeTitle": "کفش آکسفورد مدل برندن",
        "description": "چرم طبیعی دست‌دوز تبریز با کفی تمام‌چرم",
        "primaryImageURL": "/uploads/shoes/cover1.jpg",
        "colors": ["مشکی براق", "عسلی پتینه‌ای"],
        "sizes": [41, 42, 43, 44],
        "categoryIDs": [1729598273928192831],
        "updatedAt": 1729598284
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 35,
      "totalPages": 2
    }
  }
  ```

### ۴.۳. ثبت مدل جدید با انتشار مستقیم
- **متد و مسیر:** `POST /api/v1/admin/shoes`
- **بدنه درخواست (JSON):**
  ```json
  {
    "shoeTitle": "کفش دربی کلاسیک ناپولی",
    "description": "طراحی اصیل ایتالیایی با دوخت دست",
    "primaryImageURL": "/uploads/shoes/cover2.jpg",
    "colors": ["مشکی", "قهوه‌ای تیره"],
    "sizes": [40, 41, 42, 43, 44],
    "categoryIDs": [1729598273928192831],
    "images": [
      {
        "url": "/uploads/shoes/cover2.jpg",
        "sortOrder": 1,
        "isPrimary": true
      },
      {
        "url": "/uploads/shoes/side_view.jpg",
        "sortOrder": 2,
        "isPrimary": false
      }
    ],
    "videos": [
      {
        "url": "/uploads/videos/craft_shot.mp4",
        "title": "ویدیوی شات کارگاهی دوخت رویه"
      }
    ]
  }
  ```
- **پاسخ موفق (201):** بازگرداندن شناسنامه ایجادشده مدل به همراه شناسه عددی سیستمی `ID`.

### ۴.۴. دریافت شناسنامه یک مدل
- **متد و مسیر:** `GET /api/v1/admin/shoes/:id`
- **پاسخ موفق (200):** اطلاعات کامل مدل به همراه گالری تصاویر و ویدیوها.

### ۴.۵. ویرایش مشخصات مدل
- **متد و مسیر:** `PUT /api/v1/admin/shoes/:id`
- **بدنه درخواست (JSON):** تمامی فیلدهای قابل تغییر.
- **پاسخ موفق (200):** اطلاعات به‌روزشده مدل.

### ۴.۶. حذف مدل
- **متد و مسیر:** `DELETE /api/v1/admin/shoes/:id`
- **پاسخ موفق (200):** حذف مدل از سیستم.

---

## ۵. چک‌لیست فایل‌های موردنیاز برای ساخت در این تسک

- [ ] `backend/pkg/storage/storage.go`: تعریف اینترفیس `StorageService`
- [ ] `backend/pkg/storage/filesystem.go`: پیاده‌سازی ذخیره لوکال با متدهای `Upload` و `Delete`
- [ ] `backend/internal/entity/shoeModel.go`: ساختارهای `ShoeModel`، `ShoeImage`، `ShoeVideo`
- [ ] `backend/internal/dto/shoeDTO.go`: استراکت‌های Create, Update, Filter و خروجی با صفحه‌بندی
- [ ] `backend/internal/repository/shoeRepo.go`: متدهای CRUD و فیلترهای ترکیبی (JSONB categoryIDs و جستجوی متنی/شناسه) با ۳ خروجی
- [ ] `backend/internal/service/shoeService.go`: منطق تجاری ثبت، اعتبارسنجی تصاویر و دسته‌ها
- [ ] `backend/internal/handler/shoeHandler.go`: هندلرهای REST و هندلر آپلود مدیا
