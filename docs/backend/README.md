# مستندات جامع بک‌اند کاتالوگ خصوصی DYF
**تکنولوژی:** Go (Golang) + Fiber + GORM + PostgreSQL + JSON  
**قرارداد نام‌گذاری:** Strict camelCase (متغیرها، JSON، جداول و ستون‌های دیتابیس)

---

## راهنمای اسناد این دایرکتوری (Table of Contents)

این مجموعه مستندات به گونه‌ای تدوین شده است که تمامی ابعاد معماری، پایگاه داده، قوانین محصولی و اندپوینت‌ها به صورت ساختاریافته و با جزئیات کامل در دسترس باشد تا هر دولوپر یا ایجنت هوش مصنوعی بتواند بدون ابهام پروژه را پیاده‌سازی کند:

1. **[سند معماری، ساختار و استانداردها (01_overview_and_architecture.md)](./01_overview_and_architecture.md)**
   - پشته فناوری (Tech Stack)
   - معماری لایه‌ای ساده (Layered Architecture: Handler -> Service -> Repository)
   - قراردادهای نام‌گذاری camelCase در تمام سطوح
   - استاندارد یکپارچه پاسخ‌ها (`success`, `data`, `error`, `meta`) و مدیریت خطاها
   - ساختار کامل پوشه‌ها و فایل‌های پروژه Go

2. **[تحلیل موجودیت‌ها، منطق تجاری و ماتریس دسترسی (02_domain_analysis_and_entities.md)](./02_domain_analysis_and_entities.md)**
   - تشریح جامع فیلدهای هر موجودیت (Admin, Category, ShoeModel, Customer, AccessLink, AccessPermission, Session, OTP)
   - فرمول قطعی فیلتر محصولات مجاز (قانون اولویت استثنا بر دسته‌بندی)
   - منطق تایمر سرور-محور، پایداری در رفرش و سشن‌های چند دستگاهی
   - چرخه حیات و ماشین وضعیت وضعیت‌های دسترسی (Disabled, Active Unseen, In Use, Expired, Finished)

3. **[پایگاه داده و سیستم مایگریشن اختصاصی (03_database_and_migrations.md)](./03_database_and_migrations.md)**
   - استراتژی پیاده‌سازی camelCase در PostgreSQL با دابل کوتیشن
   - پیکربندی سفارشی `NamingStrategy` در GORM
   - طراحی سیستم مایگریشن اختصاصی و سرویس `cmd/migrate/main.go`
   - ساختار فایل‌های `.up.sql` و `.down.sql`
   - اسکریپت‌های DDL کامل تمام جداول، روابط و ایندکس‌ها

4. **[چک‌لیست شروع پروژه و نقشه راه اندپوینت‌ها (04_kickoff_checklist.md)](./04_kickoff_checklist.md)**
   - پیش‌نیازهای محیطی و تنظیمات ضروری قبل از کدنویسی
   - فهرست کامل اندپوینت‌های RESTful برای پنل مدیریت، احراز هویت و کاتالوگ خریدار
   - فازبندی گام‌به‌گام پیاده‌سازی (۷ فاز اجرایی)
