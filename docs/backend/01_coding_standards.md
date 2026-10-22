# سند استانداردهای کدنویسی و معماری بک‌اند (Coding Standards & Architecture)
**نسخه سند:** ۲.۰  
**پروژه:** DYF Private Catalog Backend  
**مخاطبان:** توسعه‌دهندگان Go و ایجنت‌های هوش مصنوعی (AI Agents)

---

## ۱. پشته فناوری و ابزارهای هسته (Core Tech Stack)

| بخش | ابزار و نسخه | توضیحات و الزامات فنی |
| :--- | :--- | :--- |
| **زبان** | **Go (Golang) نسخه ۱.۲۶** | بهره‌گیری از قابلیت‌های جدید Go 1.26 نظیر Range-over-function، بهینه‌سازی‌های Garbage Collector، مدیریت مدرن خطاها و پکیج‌های استاندارد به‌روزرسانی‌شده |
| **وب‌فریمورک** | **Fiber v3** (`github.com/gofiber/fiber/v3`) | نسخه نسل سوم با رابط کاربری جدید `fiber.Ctx`، قابلیت Binding مدرن (`c.Bind().Body()`)، عملکرد فوق‌العاده بالا بر پایه Fasthttp |
| **پردازشگر JSON** | **jsoniter** (`github.com/json-iterator/go`) | جایگزین سریع `encoding/json` با تنظیم `ConfigCompatibleWithStandardLibrary` متصل به اینکودر و دیکودر Fiber v3 |
| **ORM** | **GORM v2** (`gorm.io/gorm`) | تنظیم استراتژی نام‌گذاری camelCase و استفاده انحصاری از تگ `column` در Structها |
| **پایگاه‌داده** | **PostgreSQL نسخه ۱۵+** | کلیه نام‌های جداول و ستون‌ها در دیتابیس به صورت camelCase و با دابل‌کوتیشن کوئری و نگهداری می‌شوند |
| **سیستم مایگریشن** | **golang-migrate** (`github.com/golang-migrate/migrate/v4`) | موتور استاندارد اجرای مایگریشن‌های اتمیک SQL |
| **اعتبارسنجی** | **validator/v10** | ولیدیشن ساختاریافته DTO با تگ‌های اختصاصی مانند `iran_phone` |

---

## ۲. قواعد سفت‌وسخت نگارش کد (Strict Coding Rules)

هر توسعه‌دهنده یا AI Agent موظف است این قواعد را بدون کوچک‌ترین استثنا رعایت کند:

### ۲.۱. ممنوعیت کامل کامنت در کدها (No Comments in Code)
- **قاعده قطعی:** در هیچ‌یک از فایل‌های کد Go نباید هیچ‌گونه کامنتی (`//` یا `/* */`) درج شود.
- کد باید خودتوضیح (Self-Documenting) و با نام‌های شفاف و دقیق نوشته شود.

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
  - `JWT` (نه `Jwt`): `jwtSecret`, `jwtToken`

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

## ۳. سیستم مدیریت خطاها و نگاشت پیام‌های فارسی (Custom Error & Persian Mapping)

سیستم خطای بک‌اند بر پایه یک تایپ اختصاصی `CustomError` است که رابط `error` زبان Go را پیاده‌سازی می‌کند.  
لایه سرویس و ریپازیتوری تنها ارور دامنه را برمی‌گردانند؛ سپس لایه‌ای که وظیفه آماده‌سازی پاسخ کلاینت را بر عهده دارد (Response Layer / Handler)، با بررسی کد ارور در یک مپ ثبت‌شده، پیام ترجمه‌شده فارسی و کد وضعیت HTTP متناسب را استخراج کرده و به کلاینت تحویل می‌دهد.

### ۳.۱. پیاده‌سازی CustomError (`pkg/apperror/apperror.go`)
```go
package apperror

import (
	"errors"
)

type CustomError struct {
	errorCode string
}

func New(errorCode string) CustomError {
	return CustomError{
		errorCode: errorCode,
	}
}

func (customError CustomError) Error() string {
	return customError.errorCode
}

func (customError CustomError) Code() string {
	return customError.errorCode
}

var (
	ErrNotFound           = New("NOT_FOUND")
	ErrValidationFailed   = New("VALIDATION_FAILED")
	ErrUnauthorized       = New("UNAUTHORIZED")
	ErrForbidden          = New("FORBIDDEN")
	ErrDuplicatePhone     = New("DUPLICATE_PHONE")
	ErrInvalidOTP         = New("INVALID_OTP")
	ErrOTPExpired         = New("OTP_EXPIRED")
	ErrLinkExpired        = New("LINK_EXPIRED")
	ErrLinkInactive       = New("LINK_INACTIVE")
	ErrCustomerInactive   = New("CUSTOMER_INACTIVE")
	ErrInternalServer     = New("INTERNAL_SERVER_ERROR")
)

type ErrorDetails struct {
	StatusCode int
	MessageFa  string
}

var persianErrorRegistry = map[string]ErrorDetails{
	"NOT_FOUND": {
		StatusCode: 404,
		MessageFa:  "آیتم مورد نظر یافت نشد",
	},
	"VALIDATION_FAILED": {
		StatusCode: 422,
		MessageFa:  "داده‌های ارسالی معتبر نیستند",
	},
	"UNAUTHORIZED": {
		StatusCode: 401,
		MessageFa:  "احراز هویت انجام نشده است",
	},
	"FORBIDDEN": {
		StatusCode: 403,
		MessageFa:  "دسترسی مجاز نمی‌باشد",
	},
	"DUPLICATE_PHONE": {
		StatusCode: 409,
		MessageFa:  "شماره تلفن همراه از قبل در سیستم وجود دارد",
	},
	"INVALID_OTP": {
		StatusCode: 400,
		MessageFa:  "کد تایید وارد شده نادرست است",
	},
	"OTP_EXPIRED": {
		StatusCode: 410,
		MessageFa:  "کد تایید منقضی شده است",
	},
	"LINK_EXPIRED": {
		StatusCode: 410,
		MessageFa:  "مهلت زمانی این لینک به پایان رسیده است",
	},
	"LINK_INACTIVE": {
		StatusCode: 403,
		MessageFa:  "این لینک توسط مدیریت غیرفعال شده است",
	},
	"CUSTOMER_INACTIVE": {
		StatusCode: 403,
		MessageFa:  "حساب کاربری مشتری غیرفعال است",
	},
	"INTERNAL_SERVER_ERROR": {
		StatusCode: 500,
		MessageFa:  "خطای غیرمنتظره در سرور رخ داد",
	},
}

func Resolve(err error) (int, string, string) {
	if err == nil {
		return 200, "", ""
	}

	var customErr CustomError
	if errors.As(err, &customErr) {
		if mapping, exists := persianErrorRegistry[customErr.Code()]; exists {
			return mapping.StatusCode, customErr.Code(), mapping.MessageFa
		}
		return 400, customErr.Code(), customErr.Code()
	}

	return 500, "INTERNAL_SERVER_ERROR", "خطای غیرمنتظره در سرور رخ داد"
}
```

---

## ۴. معماری لایه‌ای و نمونه پیاده‌سازی طبق استانداردهای فوق

### ۴.۱. لایه موجودیت دامنه (`internal/entity/sample.go`)
```go
package entity

type BaseEntity struct {
	ID        int64 `gorm:"column:ID" json:"ID"`
	UpdatedAt int64 `gorm:"column:updatedAt" json:"updatedAt"`
}

type Category struct {
	BaseEntity
	Title       string `gorm:"column:title" json:"title"`
	Slug        string `gorm:"column:slug" json:"slug"`
	Description string `gorm:"column:description" json:"description"`
	SortOrder   int    `gorm:"column:sortOrder" json:"sortOrder"`
}
```

### ۴.۲. لایه DTO (`internal/dto/categoryDto.go`)
```go
package dto

type CreateCategoryRequest struct {
	Title       string `json:"title" validate:"required,min=2,max=100"`
	Slug        string `json:"slug" validate:"required,min=2,max=100"`
	Description string `json:"description" validate:"omitempty,max=500"`
	SortOrder   int    `json:"sortOrder"`
}
```

### ۴.۳. لایه ریپازیتوری با ۳ خروجی در Get (`internal/repository/categoryRepo.go`)
```go
package repository

import (
	"context"
	"errors"

	"dyf-backend/internal/entity"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	Create(ctx context.Context, category entity.Category) (entity.Category, error)
	GetByID(ctx context.Context, categoryID int64) (entity.Category, bool, error)
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
}

type categoryRepository struct {
	databaseConnection *gorm.DB
}

func NewCategoryRepository(databaseConnection *gorm.DB) CategoryRepository {
	return categoryRepository{
		databaseConnection: databaseConnection,
	}
}

func (repositoryInstance categoryRepository) Create(ctx context.Context, category entity.Category) (entity.Category, error) {
	databaseError := repositoryInstance.databaseConnection.WithContext(ctx).Create(&category).Error
	if databaseError != nil {
		return entity.Category{}, databaseError
	}
	return category, nil
}

func (repositoryInstance categoryRepository) GetByID(ctx context.Context, categoryID int64) (entity.Category, bool, error) {
	var category entity.Category
	databaseError := repositoryInstance.databaseConnection.WithContext(ctx).Where(`"ID" = ?`, categoryID).First(&category).Error
	if databaseError != nil {
		if errors.Is(databaseError, gorm.ErrRecordNotFound) {
			return entity.Category{}, false, nil
		}
		return entity.Category{}, false, databaseError
	}
	return category, true, nil
}

func (repositoryInstance categoryRepository) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	var recordCount int64
	databaseError := repositoryInstance.databaseConnection.WithContext(ctx).Model(&entity.Category{}).Where(`"slug" = ?`, slug).Count(&recordCount).Error
	if databaseError != nil {
		return false, databaseError
	}
	return recordCount > 0, nil
}
```

### ۴.۴. لایه سرویس بدون وابستگی به Fiber (`internal/service/categoryService.go`)
```go
package service

import (
	"context"

	"dyf-backend/internal/dto"
	"dyf-backend/internal/entity"
	"dyf-backend/internal/repository"
	"dyf-backend/pkg/apperror"
)

type CategoryService interface {
	CreateCategory(ctx context.Context, request dto.CreateCategoryRequest) (entity.Category, error)
	GetCategoryByID(ctx context.Context, categoryID int64) (entity.Category, error)
}

type categoryService struct {
	categoryRepository repository.CategoryRepository
}

func NewCategoryService(categoryRepository repository.CategoryRepository) CategoryService {
	return categoryService{
		categoryRepository: categoryRepository,
	}
}

func (serviceInstance categoryService) CreateCategory(ctx context.Context, request dto.CreateCategoryRequest) (entity.Category, error) {
	isExisting, checkError := serviceInstance.categoryRepository.ExistsBySlug(ctx, request.Slug)
	if checkError != nil {
		return entity.Category{}, checkError
	}
	if isExisting {
		return entity.Category{}, apperror.New("DUPLICATE_SLUG")
	}

	newCategory := entity.Category{
		BaseEntity: entity.BaseEntity{
			ID:        entity.GenerateNanosecondID(),
			UpdatedAt: entity.CurrentUnixTimestamp(),
		},
		Title:       request.Title,
		Slug:        request.Slug,
		Description: request.Description,
		SortOrder:   request.SortOrder,
	}

	return serviceInstance.categoryRepository.Create(ctx, newCategory)
}

func (serviceInstance categoryService) GetCategoryByID(ctx context.Context, categoryID int64) (entity.Category, error) {
	category, isFound, fetchError := serviceInstance.categoryRepository.GetByID(ctx, categoryID)
	if fetchError != nil {
		return entity.Category{}, fetchError
	}
	if !isFound {
		return entity.Category{}, apperror.ErrNotFound
	}
	return category, nil
}
```

### ۴.۵. لایه هندلر با سینتکس Fiber v3 (`internal/handler/categoryHandler.go`)
```go
package handler

import (
	"strconv"

	"dyf-backend/internal/dto"
	"dyf-backend/internal/service"
	"dyf-backend/pkg/apperror"
	"dyf-backend/pkg/response"
	"dyf-backend/pkg/validator"

	"github.com/gofiber/fiber/v3"
)

type CategoryHandler struct {
	categoryService service.CategoryService
}

func NewCategoryHandler(categoryService service.CategoryService) CategoryHandler {
	return CategoryHandler{
		categoryService: categoryService,
	}
}

func (handlerInstance CategoryHandler) Create(fiberContext fiber.Ctx) error {
	var request dto.CreateCategoryRequest
	if bindingError := fiberContext.Bind().Body(&request); bindingError != nil {
		return response.Error(fiberContext, fiber.StatusBadRequest, "INVALID_BODY", "ساختار داده ورودی نامعتبر است", nil)
	}

	if validationIssues := validator.ValidateStruct(request); len(validationIssues) > 0 {
		return response.Error(fiberContext, fiber.StatusUnprocessableEntity, "VALIDATION_FAILED", "خطای اعتبارسنجی ورودی‌ها", validationIssues)
	}

	createdCategory, serviceError := handlerInstance.categoryService.CreateCategory(fiberContext.UserContext(), request)
	if serviceError != nil {
		return response.FromAppError(fiberContext, serviceError, nil)
	}

	return response.Success(fiberContext, fiber.StatusCreated, "دسته‌بندی با موفقیت ایجاد شد", createdCategory, nil)
}

func (handlerInstance CategoryHandler) GetByID(fiberContext fiber.Ctx) error {
	rawID := fiberContext.Params("id")
	categoryID, parseError := strconv.ParseInt(rawID, 10, 64)
	if parseError != nil {
		return response.FromAppError(fiberContext, apperror.ErrValidationFailed, nil)
	}

	category, fetchError := handlerInstance.categoryService.GetCategoryByID(fiberContext.UserContext(), categoryID)
	if fetchError != nil {
		return response.FromAppError(fiberContext, fetchError, nil)
	}

	return response.Success(fiberContext, fiber.StatusOK, "اطلاعات دسته‌بندی دریافت شد", category, nil)
}
```
