#!/bin/bash
cd "$(dirname "$0")"
PORT=3000

echo "🚀 اجرای سرور لوکال برای مشاهده مدل سه‌بعدی..."
echo "📍 آدرس: http://localhost:$PORT/3d-preview.html"

# باز کردن مرورگر پس از ۱ ثانیه
(sleep 1 && open "http://localhost:$PORT/3d-preview.html") &

# اجرای سرور پایتون
python3 -m http.server $PORT
