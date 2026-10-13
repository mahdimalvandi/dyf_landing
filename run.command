#!/bin/bash
cd "$(dirname "$0")"
PORT=8000
echo "=================================================="
echo "  🚀 سرور محلی DYF لندینگ با موفقیت راه‌اندازی شد"
echo "  🌐 آدرس: http://localhost:$PORT"
echo "=================================================="
(sleep 0.8 && open "http://localhost:$PORT/index.html") &
python3 -m http.server $PORT
