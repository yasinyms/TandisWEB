#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/TandisWEB"
MAINT_FLAG="${APP_DIR}/maintenance.on"

cd "${APP_DIR}"

echo ">>> [1/5] فعال‌سازی صفحه «سایت در حال به‌روزرسانی است»..."
touch "${MAINT_FLAG}"

cleanup_on_error() {
  echo "!!! خطا در هنگام به‌روزرسانی رخ داد. حالت به‌روزرسانی فعال ماند تا مشکل بررسی شود."
}
trap cleanup_on_error ERR

echo ">>> [2/5] نصب وابستگی‌ها..."
npm install --no-audit --no-fund

echo ">>> [3/5] بیلد نسخه جدید فرانت‌اند (Vite)..."
npm run build

echo ">>> [4/5] راه‌اندازی مجدد سرور بک‌اند Node (پورت 3000 متصل به Django پورت 8000)..."
export PORT="${PORT:-3000}"
export TANDIS_DJANGO_BASE_URL="${TANDIS_DJANGO_BASE_URL:-http://127.0.0.1:8000/api/v1/}"

if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload ecosystem.config.cjs --update-env
  pm2 save
else
  pkill -f "node server.js" || true
  nohup node server.js > /var/log/tandis-web.log 2>&1 &
fi

echo ">>> [5/5] بررسی سلامت سرور و اتصال بک‌اند..."
sleep 2
HOME_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/)
APP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/app)
API_HEALTH=$(curl -s http://127.0.0.1:3000/api/tandis/health || true)

if [ "${HOME_CODE}" != "200" ] || [ "${APP_CODE}" != "200" ] || ! echo "${API_HEALTH}" | grep -q '"online":true'; then
  echo "!!! بررسی سلامت ناموفق بود: HOME=${HOME_CODE} APP=${APP_CODE} HEALTH=${API_HEALTH}"
  exit 1
fi

echo ">>> سایت با موفقیت بالا آمد! حذف خودکار صفحه به‌روزرسانی..."
rm -f "${MAINT_FLAG}"
systemctl reload nginx >/dev/null 2>&1 || nginx -s reload >/dev/null 2>&1 || true

echo ">>> ✅ به‌روزرسانی تندیس و اتصال فرانت‌اند و بک‌اند با موفقیت کامل شد!"
