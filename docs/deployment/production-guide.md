# راهنمای استقرار و تنظیمات Production برند DYF

این سند شامل الزامات استقرار پایدار، هدرهای امنیتی، کشینگ دارایی‌ها، HTTPS و مدیریت خطاهای HTTP برای پروژه DYF است.

---

## ۱. معماری کلی استقرار (System Architecture)

- **وب سرور / پروکسی معکوس:** Nginx یا Caddy در لایه ورودی اینترنت (پورت 80 و 443)
- **فرانت‌اند استاتیک:** فایل‌های خروجی بیلد Vite در مسیر `/var/www/dyf/frontend/dist`
- **بک‌اند API (Go Fiber):** در حال اجرا روی سرویس داخلی (Systemd یا Docker) روی پورت `8080` (مسیر `/api/v1/`)
- **فایل‌های آپلود رسانه:** مسیر `/var/www/dyf/backend/uploads`

---

## ۲. نمونه پیکربندی Nginx برای محیط Production

```nginx
# هدایت خودکار ترافیک HTTP به HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name dyfshoes.com www.dyfshoes.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# سرور اصلی HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dyfshoes.com www.dyfshoes.com;

    # ۱. گواهی‌نامه SSL/TLS (Let's Encrypt یا گواهی تجاری)
    ssl_certificate /etc/letsencrypt/live/dyfshoes.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dyfshoes.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # پروتکل‌های ایمن
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # ۲. هدرهای امنیتی (Security Headers)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # فشرده‌سازی Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml font/woff2 image/svg+xml;

    # ریشه فرانت‌اند
    root /var/www/dyf/frontend/dist;
    index index.html;

    # ۳. قوانین کشینگ فایل‌های هش‌شده فرانت‌اند (Cache-Control)
    location ~* \.(?:css|js|woff2|webp|jpg|jpeg|png|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # فایل‌های HTML همواره اعتبارسنجی شوند تا کاربر نسخه جدید را بلافاصله دریافت کند
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # ۴. مسیر API بک‌اند (Reverse Proxy به Go Fiber)
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    # فایل‌های آپلود شده
    location /uploads/ {
        proxy_pass http://127.0.0.1:8080/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # مسیردهی SPA و صفحات چندگانه
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ۵. مدیریت خطاهای HTTP
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## ۳. چک‌لیست اعتبارسنجی استقرار (Production Checklist)

1. **فونت‌های محلی:** مطمئن شوید درخواست به هیچ سرور خارجی (Google Fonts, jsDelivr CDN) زده نمی‌شود و تمام فایل‌های `.woff2` از مسیر `/assets/` با کد وضعیت `200` لود می‌شوند.
2. **بررسی گواهی HTTPS:** امتیاز SSL Labs باید حداقل `A` یا `A+` باشد.
3. **متادیتای شبکه‌های اجتماعی:** با ابزار Telegram Webpage Bot و Facebook Sharing Debugger آدرس صفحه تست شود تا تصویر بندانگشتی و توضیحات فارسی نمایش یابند.
4. **فرم استعلام:** در صورت عدم پاسخگویی سرور، خطای ارتباط به همراه لینک واتساپ پیش‌پرشده باید بدون نمایش پیام تایید ظاهر شود.
