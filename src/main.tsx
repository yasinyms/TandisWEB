import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';
import './index.css';
import App from './App';

// سنجش زنده Core Web Vitals با کتابخانه web-vitals
if (typeof window !== 'undefined') {
  const reportWebMetric = (metric: { name: string; value: number; rating: string; delta: number }) => {
    try {
      const existing = JSON.parse(localStorage.getItem('tandis_web_vitals') || '{}');
      existing[metric.name] = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        timestamp: Date.now()
      };
      localStorage.setItem('tandis_web_vitals', JSON.stringify(existing));
    } catch {}
  };
  onLCP(reportWebMetric);
  onCLS(reportWebMetric);
  onINP(reportWebMetric);
  onFCP(reportWebMetric);
  onTTFB(reportWebMetric);
}

// در محیط پیش‌نمایش (run.app / localhost)، سرویس‌ورکرهای قدیمی کش‌شده را پاک کن تا نسخه جدید همیشه بدون خطا بالا بیاید
const isPreviewHost =
  typeof window !== 'undefined' &&
  /(localhost|127\.0\.0\.1|\.run\.app)$/i.test(window.location.hostname);

if (typeof window !== 'undefined') {
  if (isPreviewHost) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((r) => r.unregister().catch(() => {}));
        })
        .catch(() => {});
    }
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => {
          keys.forEach((k) => caches.delete(k).catch(() => {}));
        })
        .catch(() => {});
    }
  } else {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        window.location.reload();
      },
    });
  }

  // بازیابی خودکار در صورت تغییر هش فایل‌های بیلد
  window.addEventListener('vite:preloadError', () => {
    window.location.reload();
  });
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || 'خطای غیرمنتظره در نمایش صفحه' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#f2f9f9] text-[#12292c] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#dcecec] shadow-lg p-6 text-center space-y-4">
            <h1 className="text-lg font-black text-[#0b5c60]">خطا در بارگذاری صفحه</h1>
            <p className="text-xs text-[#5f777b] leading-6">{this.state.errorMsg}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-6 py-3 text-xs font-black cursor-pointer"
            >
              بارگذاری مجدد صفحه
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
