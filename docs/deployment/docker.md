# استقرار DYF با Docker Compose

## معماری و پیش‌نیاز

- سرور Linux با Docker Engine و افزونهٔ **Docker Compose v2.20 یا جدیدتر**؛ دستورها از ریشهٔ مخزن اجرا می‌شوند.
- دامنه و TLS روی reverse proxy سرور (Nginx، Caddy یا معادل آن). این Compose خودش گواهی TLS صادر نمی‌کند.
- چهار سرویس: PostgreSQL 17، مایگریشن یک‌باره، بک‌اند Go و فرانت‌اند production پشت Nginx. Node و Go روی خود سرور لازم نیست.
- پورت‌های PostgreSQL و بک‌اند روی میزبان منتشر نمی‌شوند. دسترسی خروجی بک‌اند به HTTPS برای MsgWay لازم است.
- در محیط آماده‌سازی این فایل Docker نصب نبود؛ ساخت و اجرای واقعی ایمیج‌ها باید روی سرور با دستورهای زیر تأیید شود.

## ۱. تنظیم اسرار

```sh
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
```

خروجی دو دستور آخر را جداگانه برای `DB_PASSWORD` و `MEDIA_SIGNING_KEY` در `.env` قرار دهید. کلید API راه پیام را در `MSGWAY_API_KEY` بگذارید؛ قالب فعلی `24945` است. دامنه‌های واقعی HTTPS را در `CORS_ALLOWED_ORIGINS` تنظیم کنید. این فایل ریشه با `backend/.env` محیط توسعه متفاوت است؛ Compose از فایل ریشه استفاده می‌کند.

کلیدها در Dockerfile، سورس یا ایمیج ذخیره نمی‌شوند. با این حال مدیر Docker می‌تواند environment کانتینر را ببیند؛ دسترسی به سرور و گروه docker را محدود کنید. خروجی `docker compose config` را عمومی نکنید چون شامل مقادیر اسرار است. `MEDIA_SIGNING_KEY` باید در به‌روزرسانی‌ها ثابت بماند. تغییر رمز دیتابیس در `.env` رمز یک دیتابیس از قبل ساخته‌شده را تغییر نمی‌دهد.

## ۲. ساخت و اجرا

```sh
docker compose config --quiet
docker compose build --pull
docker compose up -d
docker compose ps -a
docker compose logs --tail=100 migrate backend frontend
curl -f http://127.0.0.1:8090/healthz
curl -f http://127.0.0.1:8090/api/v1/health
```

ابتدا دیتابیس healthy می‌شود، سپس مایگریشن‌ها اجرا می‌شوند؛ بک‌اند فقط پس از موفقیت مایگریشن و فرانت فقط بعد از healthy شدن بک‌اند شروع می‌شوند. پایان `migrate` با کد ۰ طبیعی است. در صورت شکست آن، قبل از هر اقدام لاگ و نسخهٔ schema را بررسی کنید؛ rollback خودکار یا پاک‌کردن volume انجام ندهید.

### مدیر اولیه روی دیتابیس خالی

مایگریشن‌ها عمداً مدیر نمونه یا رمز پیش‌فرض نمی‌سازند. برای ثبت شمارهٔ مدیر واقعی:

```sh
docker compose exec db psql -U dyf -d dyf_catalog
```

داخل psql، با اطلاعات واقعی خودتان (شماره مطابق قالب `09xxxxxxxxx`):

```sql
INSERT INTO "adminUsers" ("ID", "firstName", "lastName", "phoneNumber", "isActive")
VALUES (1, 'نام', 'نام خانوادگی', '09xxxxxxxxx', TRUE);
```

این دستور فقط برای دیتابیس خالی است؛ روی دیتابیس موجود مدیر تکراری نسازید. سپس از `/admin/` وارد شوید. برای تأیید پیامک واقعی، ورود با شمارهٔ مجاز را انجام دهید و رسیدن پیامک را بررسی کنید؛ healthy بودن بک‌اند به معنی تأیید کلید/اعتبار/قالب راه پیام نیست.

## ۳. HTTPS روی میزبان

پورت پیش‌فرض `127.0.0.1:8090` فقط روی خود سرور در دسترس است. در virtual host دارای گواهی معتبر، همهٔ مسیرها را به آن proxy کنید؛ مسیر API را جدا به پورت توسعه نفرستید:

```nginx
location / {
    proxy_pass http://127.0.0.1:8090;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    client_max_body_size 55m;
}
```

در همان virtual host، `access_log off;` و `error_log /var/log/nginx/dyf-error.log crit;` بگذارید تا لینک‌های خصوصی حاوی توکن در لاگ درخواست‌ها ثبت نشوند. HTTP را به HTTPS هدایت کنید. اگر reverse proxy داخل کانتینر دیگری است، `127.0.0.1` آن کانتینر میزبان نیست؛ آن را با شبکهٔ مشترک به frontend متصل کنید یا آدرس میزبان را صریح تنظیم کنید. برای انتشار مستقیم HTTP صرفاً جهت بررسی موقت می‌توان `HTTP_BIND=0.0.0.0` گذاشت؛ این کار جای HTTPS را نمی‌گیرد و برای ورود واقعی توصیه نمی‌شود.

## ۴. انتقال داده و پشتیبان

دو volume دائمی داریم: `postgres_data` و `uploads`. سورس به‌تنهایی اطلاعات مشتریان، مدیران و عکس‌های خصوصی فعلی را منتقل نمی‌کند. اگر دادهٔ موجود دارید، ابتدا سرویس‌های قبلی را از نوشتن بازدارید، از دیتابیس با `pg_dump` خروجی بگیرید، قبل از اولین `up` کامل آن را به دیتابیس جدید restore کنید و پوشهٔ `backend/uploads` را نیز منتقل کنید. پیش از مایگریشن از دادهٔ فعلی نسخهٔ پشتیبان بگیرید.

پشتیبان دیتابیس:

```sh
mkdir -p backups
chmod 700 backups
docker compose exec -T db pg_dump -U dyf -d dyf_catalog -Fc > backups/database.dump
docker compose cp backend:/app/uploads ./backups/
```

از `.env` نیز جداگانه و رمزگذاری‌شده نگهداری کنید. پشتیبان‌ها را خارج از سرور ذخیره و بازیابی‌شان را آزمایش کنید. برای یک کپی سازگار از دیتابیس و عکس‌ها، هنگام backup نوشتن/آپلود را متوقف کنید. برای restore دیتابیس روی یک مقصد خالی و آماده:

```sh
docker compose up -d db
docker compose exec -T db pg_restore -U dyf -d dyf_catalog --no-owner --no-privileges < backups/database.dump
docker compose run --rm --no-deps --user root --entrypoint sh backend -c 'mkdir -p /app/uploads && chown 10001:10001 /app/uploads'
docker compose create backend
docker compose cp ./backups/uploads/. backend:/app/uploads/
docker compose run --rm --no-deps --user root --entrypoint sh backend -c 'chown -R 10001:10001 /app/uploads'
docker compose up -d
```

فایل‌ها باید برای UID/GID `10001` قابل نوشتن باشند. روی دیتابیس غیرخالی restore نکنید مگر برنامهٔ بازیابی مشخص داشته باشید.

## ۵. به‌روزرسانی

پس از backup و توقف نوشتن، برای جلوگیری از هم‌زمانی بک‌اند قدیمی با مایگریشن جدید:

```sh
git pull --ff-only origin main
docker compose build --pull
docker compose stop frontend backend
docker compose run --rm migrate
docker compose up -d --force-recreate migrate backend frontend
docker compose ps -a
```

مایگریشن‌ها نسخه‌دار و اجرای مجدد آن‌ها بدون تغییر بی‌اثر است. اگر مرحلهٔ مایگریشن شکست خورد، مراحل بعد را اجرا نکنید. برای توقف عادی `docker compose down` کافی است و داده‌ها حفظ می‌شوند. **`docker compose down -v` داده‌ها و آپلودها را پاک می‌کند؛ استفاده نکنید.** rollback ایمیج لزوماً schema را برنمی‌گرداند؛ بازیابی backup یا migration سازگار لازم است.
