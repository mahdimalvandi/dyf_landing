# راهنمای اسناد و توسعه بک‌اند کاتالوگ خصوصی DYF
**فناوری:** Go (Golang 1.22+) + Fiber v2 + GORM v2 + PostgreSQL + JSON  
**استراتژی نام‌گذاری:** Strict camelCase (متغیرها، تگ‌های JSON، جداول و ستون‌های دیتابیس)

---

## ۱. فهرست اسناد این دایرکتوری

این اسناد به عنوان مرجع قطعی و قوانین پایه برای توسعه بک‌اند و هدایت ایجنت‌های هوش مصنوعی تدوین شده‌اند:

1. **[سند جامع استانداردهای کدنویسی و معماری (01_coding_standards.md)](./01_coding_standards.md)**
   - پشته فناوری و نسخه‌ها
   - معماری لایه‌ای تمیز و جریان یک‌طرفه داده (`Handler -> Service -> Repository -> Database`)
   - نمونه کدهای استاندارد برای لایه‌های Handler, Service, Repository, DTO, Entity
   - قانون طلایی نام‌گذاری camelCase در تمام سطوح (متغیرهای Go، تگ‌های JSON، ستون‌ها و جداول PostgreSQL)
   - ساختار استاندارد پاسخ‌ها (`response.Success`, `response.Error`)
   - اعتبارسنجی ورودی‌ها با `validator/v10`
   - قوانین و محدودیت‌های الزامی برای هوش مصنوعی (Agent Rules)

2. **[سند استانداردهای پایگاه‌داده و سیستم مایگریشن اختصاصی (02_database_and_migration_standards.md)](./02_database_and_migration_standards.md)**
   - استراتژی نگهداری اسامی camelCase در PostgreSQL با دابل‌کوتیشن
   - تنظیم سفارشی `CamelCaseNamingStrategy` در GORM
   - معماری و نحوه عملکرد سیستم مایگریشن اختصاصی Go (`cmd/migrate/main.go` و `pkg/database/migrator.go`)
   - دستورات اجرای مایگریشن (`up`, `down`, `status`)
   - راهنمای گام‌به‌گام نوشتن مایگریشن‌های جدید

---

## ۲. نحوه اجرای پروژه و ابزارها

### اجرای وب‌سرور:
```bash
cd backend
go run cmd/server/main.go
```

### تست سلامت سرویس (Health Check):
```bash
curl http://localhost:8080/api/v1/health
```

### اجرای سیستم مایگریشن دیتابیس:
```bash
cd backend
go run cmd/migrate/main.go up      # اجرای مایگریشن‌های جدید
go run cmd/migrate/main.go down    # بازگردانی آخرین مایگریشن
go run cmd/migrate/main.go status  # مشاهده وضعیت مایگریشن‌ها
```
