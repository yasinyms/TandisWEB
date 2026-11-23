# وب‌سایت جامع تندیس و پنل وب تندیس همکار

سامانه وب تندیس شامل فرانت‌اند React/Vite و سرور پل بک‌اند Express (`server.js`) متصل به سرور مرکزی Django تندیس.

## پیش‌نیازها روی سرور (Ubuntu)
- Node.js نسخه `20` یا بالاتر
- PM2 (`npm install -g pm2`)
- Nginx با گواهی SSL (Certbot)

## راه‌اندازی اولیه روی سرور (`/var/www/TandisWEB`)

```bash
# ۱. کلون از گیت‌هاب در مسیر وب‌سایت
git clone <YOUR_GITHUB_REPO_URL> /var/www/TandisWEB
cd /var/www/TandisWEB

# ۲. ساخت فایل محیطی از نمونه
cp .env.example .env

# ۳. نصب پکیج‌ها و بیلد فرانت‌اند
npm install
npm run build

# ۴. اجرای دائمی سرور بک‌اند + فرانت‌اند روی پورت 3000 با PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## اتصال Nginx به پورت 3000 و Django پورت 8000
```bash
cp /var/www/TandisWEB/deploy/nginx-tandiis.conf /etc/nginx/sites-available/tandiis.com
ln -sf /etc/nginx/sites-available/tandiis.com /etc/nginx/sites-enabled/tandiis.com
nginx -t && systemctl reload nginx
```

## به‌روزرسانی‌های بعدی با صفحه خودکار «سایت در حال به‌روزرسانی است»
```bash
cd /var/www/TandisWEB
git pull origin main
bash deploy/update-tandis.sh
```

## مسیرهای اصلی صفحات
- `/` صفحه اصلی
- `/app` دانلود اپلیکیشن‌ها
- `/services` خدمات در محل
- `/beauty` زیبایی بانوان
- `/store` فروشگاه قطعات
- `/tandispay` تندیس‌پی
- `/orders` پیگیری درخواست‌ها
- `/hamkar` پنل وب تندیس همکار (ورود)
- `/hamkar/signup` ثبت‌نام متخصص جدید
- `/about` درباره تندیس و نماد اعتماد
