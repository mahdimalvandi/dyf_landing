# سند جامع استانداردهای کدنویسی و معماری بک‌اند (Coding Standards & Architecture)
**نسخه سند:** ۱.۰  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان Go و هوش‌های مصنوعی همکار (AI Agents)

---

## ۱. معرفی و اهداف این سند

این سند، مرجع قطعی و غیرقابل‌تغییر برای نحوه طراحی، نگارش کد، نام‌گذاری‌ها، معماری و ساختار پروژه بک‌اند است.  
**هدف اصلی:** ایجاد یک قرارداد فنی دقیق، شفاف و کاملاً یکپارچه تا تمام بخش‌ها با سبک یکنواخت پیاده‌سازی شوند و هر توسعه‌دهنده یا AI Agent بتواند بدون نیاز به توضیحات مجدد، با بالاترین کیفیت کدهای بخش‌های مختلف را توسعه دهد.

---

## ۲. پشته فناوری و ابزارهای هسته (Core Tech Stack)

| بخش | ابزار انتخابی | نسخه | الزامات و ملاحظات |
| :--- | :--- | :--- | :--- |
| **زبان** | **Go (Golang)** | `1.22+` | استفاده از Idiomatic Go، مدیریت دقیق خطاها (`if err != nil`) و جلوگیری از پکیج‌های غیرضروری |
| **وب‌فریمورک** | **Fiber v2** | `v2.52+` | ساختار فوق‌العاده سریع مبتنی بر fasthttp، مسیریابی ساده، مدیریت میدلورها |
| **ORM** | **GORM v2** | `v1.25+` | تنظیم استراتژی نام‌گذاری سفارشی camelCase، پشتیبانی از تراکنش‌ها (`Transaction`) و Preload |
| **پایگاه‌داده** | **PostgreSQL** | `15+` | ذخیره تمامی جداول و ستون‌ها به فرمت camelCase (با کوتیشن در SQL) |
| **اعتبارسنجی** | **validator/v10** | `v10.20+` | ولیدیشن ساختاریافته فیلدهای DTO با تگ‌های اختصاصی مانند `iran_phone` |
| **قالب تبادل** | **JSON** | استاندارد | همه درخواست‌ها و پاسخ‌ها به صورت ۱۰۰٪ JSON و با کلیدهای camelCase |

---

## ۳. معماری لایه‌ای ساده و شفاف (Layered Architecture Pattern)

با توجه به این‌که تعداد اندپوینت‌های این سامانه متوسط و متمرکز است، از ایجاد لایه‌های انتزاعی پیچیده و اغراق‌آمیز (Over-Engineering) خودداری شده و از **معماری لایه‌ای تمیز (Layered Architecture)** با جریان یک‌طرفه استفاده می‌شود:

```
[ HTTP Request (JSON) ]
          │
          ▼
   [ Fiber Router ] ── (Middlewares: Recover, Logger, CORS, Auth)
          │
          ▼
   [ Handler Layer ] ── DTO Binding & Validation (pkg/validator)
          │
          ▼
   [ Service Layer ] ── Pure Business Logic, Rules, Calculations
          │
          ▼
 [ Repository Layer ] ── GORM Operations, CamelCase Mapping, DB Queries
          │
          ▼
[ PostgreSQL Database ]
```

---

## ۴. استانداردهای تفصیلی هر لایه همراه با نمونه کد

### ۴.۱. لایه انتقال داده (DTO - Data Transfer Object)
- **محل قرارگیری:** `internal/dto/`
- **وظیفه:** نگهداری ساختار داده‌های ورودی درخواست (Body، Query و Params) و فیلترهای صفحه‌بندی.
- **قوانین:**
  1. کلیه تگ‌های JSON باید با فرمت **camelCase** تعریف شوند: `json:"fieldName"`.
  2. اعتبارسنجی‌ها با تگ `validate:"..."` انجام می‌شود.
  3. DTOها از موجودیت‌های دیتابیس (Entities) کاملاً مجزا هستند.

```go
// نمونه استاندارد DTO
package dto

type CreateItemRequest struct {
    ItemTitle   string   `json:"itemTitle" validate:"required,min=3,max=150"`
    CategoryId  uint     `json:"categoryId" validate:"required"`
    PhoneNumber string   `json:"phoneNumber" validate:"required,iran_phone"`
    Tags        []string `json:"tags" validate:"omitempty,dive,min=2"`
}
```

---

### ۴.۲. لایه هندلر (Handler Layer)
- **محل قرارگیری:** `internal/handler/`
- **وظیفه:** رابط بین وب‌فریمورک Fiber و لایه سرویس.
- **قوانین:**
  1. این لایه فقط به `*fiber.Ctx` دسترسی دارد.
  2. دریافت داده، Parse کردن به DTO و اعتبارسنجی توسط `validator.ValidateStruct`.
  3. فراخوانی متد مربوطه از لایه Service.
  4. بازگرداندن پاسخ نهایی صرفاً از طریق توابع استاندارد `response.Success` یا `response.Error`.
  5. **ممنوعیت قطعی:** نوشتن هرگونه کوئری دیتابیس یا منطق محاسباتی تجاری در هندلر ممنوع است.

```go
// نمونه استاندارد Handler
package handler

import (
    "dyf-backend/internal/dto"
    "dyf-backend/internal/service"
    "dyf-backend/pkg/response"
    "dyf-backend/pkg/validator"

    "github.com/gofiber/fiber/v2"
)

type ItemHandler struct {
    itemService service.ItemService
}

func NewItemHandler(itemService service.ItemService) *ItemHandler {
    return &ItemHandler{itemService: itemService}
}

func (h *ItemHandler) Create(c *fiber.Ctx) error {
    var req dto.CreateItemRequest
    if err := c.BodyParser(&req); err != nil {
        return response.Error(c, fiber.StatusBadRequest, "INVALID_BODY", "ساختار بدنه درخواست نامعتبر است", nil)
    }

    if issues := validator.ValidateStruct(req); len(issues) > 0 {
        return response.Error(c, fiber.StatusUnprocessableEntity, "VALIDATION_FAILED", "خطای اعتبارسنجی داده‌های ورودی", issues)
    }

    createdItem, err := h.itemService.CreateItem(c.Context(), req)
    if err != nil {
        return response.Error(c, fiber.StatusBadRequest, "OPERATION_FAILED", err.Error(), nil)
    }

    return response.Success(c, fiber.StatusCreated, "آیتم با موفقیت ایجاد شد", createdItem, nil)
}
```

---

### ۴.۳. لایه سرویس (Service Layer)
- **محل قرارگیری:** `internal/service/`
- **وظیفه:** هسته اصلی برنامه؛ شامل کلیه قوانین کسب‌وکار، فرمول‌ها، اعتبارسنجی‌های منطقی و هماهنگی ترنزکشن‌ها.
- **قوانین:**
  1. این لایه مستقل از فریمورک Fiber است (هیچ `import "github.com/gofiber/fiber/v2"` در سرویس وجود ندارد).
  2. ورودی متدها شامل `context.Context` و DTO یا مقادیر پرایمتیو است.
  3. خروجی متدها شامل ساختار خروجی و `error` تمیز است.
  4. در صورت نیاز به تراکنش دیتابیسی، هماهنگی در این لایه انجام می‌شود.

```go
// نمونه استاندارد Service
package service

import (
    "context"
    "errors"

    "dyf-backend/internal/dto"
    "dyf-backend/internal/entity"
    "dyf-backend/internal/repository"
)

type ItemService interface {
    CreateItem(ctx context.Context, req dto.CreateItemRequest) (*entity.Item, error)
}

type itemService struct {
    itemRepo repository.ItemRepository
}

func NewItemService(itemRepo repository.ItemRepository) ItemService {
    return &itemService{itemRepo: itemRepo}
}

func (s *itemService) CreateItem(ctx context.Context, req dto.CreateItemRequest) (*entity.Item, error) {
    // 1. بررسی قواعد تجاری (مثلاً تکراری نبودن شماره یا عنوان)
    exists, err := s.itemRepo.ExistsByTitle(ctx, req.ItemTitle)
    if err != nil {
        return nil, err
    }
    if exists {
        return nil, errors.New("آیتمی با این عنوان از قبل ثبت شده است")
    }

    // 2. ساخت موجودیت
    item := &entity.Item{
        ItemTitle:   req.ItemTitle,
        CategoryId:  req.CategoryId,
        PhoneNumber: req.PhoneNumber,
        IsActive:    true,
    }

    // 3. ذخیره در ریپازیتوری
    if err := s.itemRepo.Create(ctx, item); err != nil {
        return nil, err
    }

    return item, nil
}
```

---

### ۴.۴. لایه ریپازیتوری (Repository Layer)
- **محل قرارگیری:** `internal/repository/`
- **وظیفه:** تعامل مستقیم با پایگاه‌داده PostgreSQL از طریق GORM.
- **قوانین:**
  1. این لایه فقط و فقط عملیات CRUD، فیلترها، تراکنش‌ها و کوئری‌های دیتابیس را انجام می‌دهد.
  2. متدها همواره `context.Context` را دریافت می‌کنند: `db.WithContext(ctx)`.
  3. اسامی جداول و ستون‌ها در کوئری‌های خام یا شرطی همواره به صورت **camelCase** و با دابل‌کوتیشن نوشته می‌شوند: `"shoeTitle" = ?`.

```go
// نمونه استاندارد Repository
package repository

import (
    "context"
    "errors"

    "dyf-backend/internal/entity"
    "gorm.io/gorm"
)

type ItemRepository interface {
    Create(ctx context.Context, item *entity.Item) error
    GetByID(ctx context.Context, id uint) (*entity.Item, error)
    ExistsByTitle(ctx context.Context, title string) (bool, error)
}

type itemRepository struct {
    db *gorm.DB
}

func NewItemRepository(db *gorm.DB) ItemRepository {
    return &itemRepository{db: db}
}

func (r *itemRepository) Create(ctx context.Context, item *entity.Item) error {
    return r.db.WithContext(ctx).Create(item).Error
}

func (r *itemRepository) GetByID(ctx context.Context, id uint) (*entity.Item, error) {
    var item entity.Item
    err := r.db.WithContext(ctx).First(&item, id).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &item, nil
}

func (r *itemRepository) ExistsByTitle(ctx context.Context, title string) (bool, error) {
    var count int64
    // رعایت camelCase در شرط کوئری دیتابیس
    err := r.db.WithContext(ctx).Model(&entity.Item{}).Where(`"itemTitle" = ?`, title).Count(&count).Error
    return count > 0, err
}
```

---

### ۴.۵. لایه موجودیت دامنه (Entity Layer)
- **محل قرارگیری:** `internal/entity/`
- **وظیفه:** تعریف مدل داده‌های ذخیره‌شده در جداول دیتابیس.
- **قوانین:**
  1. فیلدهای Struct باید دارای هر دو تگ `gorm:"column:camelCase"` و `json:"camelCase"` باشند.
  2. فیلدهای مشترک از `BaseEntity` ارث‌بری می‌شوند.

```go
// نمونه استاندارد Entity
package entity

import "time"

type Item struct {
    ID          uint      `gorm:"primaryKey;column:id" json:"id"`
    ItemTitle   string    `gorm:"column:itemTitle;not null" json:"itemTitle"`
    CategoryId  uint      `gorm:"column:categoryId;not null" json:"categoryId"`
    PhoneNumber string    `gorm:"column:phoneNumber;not null" json:"phoneNumber"`
    IsActive    bool      `gorm:"column:isActive;default:true" json:"isActive"`
    CreatedAt   time.Time `gorm:"column:createdAt" json:"createdAt"`
    UpdatedAt   time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}
```

---

## ۵. قانون طلایی نام‌گذاری (Strict camelCase Everywhere)

طبق الزام صریح پروژه، **کلیه نام‌گذاری‌ها در سراسر پروژه باید با فرمت camelCase باشند:**

### ۵.۱. فیلدهای JSON:
تمامی کلیدهای درخواست و پاسخ در APIها باید **camelCase** باشند:
- `firstName`, `phoneNumber`, `storeName`, `accessDurationMinutes`, `expiresAt`
- استفاده از `snake_case` (مانند `first_name`) در هر سطحی از JSON **اکیداً ممنوع** است.

### ۵.۲. جداول و ستون‌های پایگاه‌داده:
- نام جداول: `"shoeModels"`, `"categories"`, `"customers"`, `"accessLinks"`, `"schemaMigrations"`
- نام ستون‌ها: `"id"`, `"shoeTitle"`, `"primaryImageUrl"`, `"createdAt"`, `"updatedAt"`
- در PostgreSQL برای حفظ حالت camelCase ستون‌ها، حتماً از کوتیشن دوگانه (`"`) استفاده می‌شود.

### ۵.۳. کدهای Go:
- اسامی متغیرها و پارامترها: `camelCase` (مثال: `customerRepo`, `accessToken`, `cycleNumber`).
- توابع عمومی و استراکت‌های Exported: `PascalCase` بر اساس دستور زبان Go (مثال: `CreateCustomer`, `ItemService`).
- فیلدهای داخلی استراکت‌ها: `PascalCase` همراه با تگ‌های صریح `json:"camelCase"` و `gorm:"column:camelCase"`.

---

## ۶. قالب استاندارد پاسخ‌ها و خطاها (Response Envelope)

کلیه پاسخ‌های خروجی سرور به صورت خودکار توسط `pkg/response/response.go` تولید می‌شوند:

### ۶.۱. پاسخ موفق (Success):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "عملیات با موفقیت انجام شد",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### ۶.۲. پاسخ خطا (Error):
```json
{
  "success": false,
  "statusCode": 422,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "خطای اعتبارسنجی داده‌های ورودی",
    "details": [
      {
        "field": "phoneNumber",
        "issue": "شماره تلفن باید ۱۱ رقم بوده و با ۰۹ شروع شود"
      }
    ]
  }
}
```

---

## ۷. قوانین و محدودیت‌های الزامی برای هوش مصنوعی (Agent Operational Rules)

1. **ممنوعیت پرش لایه‌ها (No Layer Skipping):** هندلر هرگز نباید ریپازیتوری را مستقیم صدا بزند؛ دسترسی به دیتابیس فقط از مسیر `Handler -> Service -> Repository` مجاز است.
2. **استقلال لایه سرویس:** لایه Service نباید به پکیج‌های فریمورک Fiber وابسته باشد تا تست‌پذیری ۱۰۰٪ حفظ شود.
3. **رعایت صددرصدی camelCase:** هرگونه ساخت ستون یا کلید JSON با `snake_case` نقص استاندارد سیستم محسوب می‌شود.
4. **کوئری‌های ایمن:** هیچ کوئری خام بدون پارامترایز نباید اجرا شود؛ همیشه از `?` در GORM یا `$1, $2` در SQL خام استفاده کنید.
5. **مدیریت صریح خطاها:** هیچ خطایی در Go نباید نادیده گرفته شود (`_ = err` در منطق تجاری ممنوع است).
