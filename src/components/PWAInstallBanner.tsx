import React, { useEffect, useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install
  };
}

export const PWAInstallButton: React.FC<{ dark: boolean }> = ({ dark }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-[#065A52]/10 dark:bg-[#14B8A6]/15 text-[#065A52] dark:text-[#14B8A6] px-3 py-2 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#065A52]/20 transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>افزودن میان‌بر سایت</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] dark:border-[#26384E] px-3 py-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>نصب میان‌بر</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
            <div className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 shadow-2xl ${dark ? 'bg-[#152232] border-[#26384E] text-white' : 'bg-white border-[#E2EFEF] text-[#0F2926]'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base">افزودن وب‌سایت تندیس به صفحه اصلی</h3>
                <button onClick={() => setShowIOSGuide(false)} className="p-1.5 rounded-xl cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs leading-6 opacity-80">
                ۱. در نوار پایین مرورگر سافاری روی دکمه اشتراک‌گذاری بزنید.
                <br />
                ۲. گزینه «افزودن به صفحه اصلی» را انتخاب و تایید کنید.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-[#065A52] text-white py-2.5 text-xs font-extrabold cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#D97706] px-4 py-2 text-xs font-black text-white shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span>اتصال اینترنت قطع است؛ نمایش داده‌های ذخیره‌شده</span>
    </div>
  );
};
