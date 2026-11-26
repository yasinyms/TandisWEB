import React from 'react';
import { Shield, PhoneCall } from 'lucide-react';
import { toPersianDigits } from '../services/tandisDefaults';

const CUSTOMER_LOGO_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';
const ENAMAD_CODE = '8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e';
const ENAMAD_URL = `https://trustseal.enamad.ir/?id=8499335&Code=${ENAMAD_CODE}`;
const ENAMAD_LOGO_SRC = `https://trustseal.enamad.ir/logo.aspx?id=8499335&Code=${ENAMAD_CODE}`;

interface FooterProps {
  onNavClick: (nav: string) => void;
  onOpenSupport: () => void;
  supportPhone?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavClick,
  onOpenSupport,
  supportPhone = '09307327975',
}) => {

  return (
    <footer className="w-full bg-[#eef6f6] border-t border-[#dcecec] mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-right">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#d6ebeb] flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img
                  src={CUSTOMER_LOGO_SRC}
                  alt="لوگوی تندیس"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="text-lg font-black text-[#12292c]">تندیس</span>
            </div>

            <p className="text-xs text-[#4a666a] leading-6 max-w-xs">
              سفارش آنلاین خدمات در محل، قطعات اصلی و اعتبار تندیس‌پی در سراسر ایران.
            </p>

            <a
              href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#0b5c60] font-bold hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span dir="ltr" className="tabular-nums">
                {toPersianDigits(supportPhone)}
              </span>
            </a>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#12292c]">خدمات</h3>
            <nav className="flex flex-col space-y-2 text-xs text-[#4a666a]">
              <button
                type="button"
                onClick={() => onNavClick('home')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                خانه
              </button>
              <button
                type="button"
                onClick={() => onNavClick('services')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                خدمات در محل
              </button>
              <span
                className="text-right text-[#8aa4a8] cursor-not-allowed select-none"
                aria-disabled="true"
              >
                فروشگاه (به‌زودی)
              </span>
              <span
                className="text-right text-[#8aa4a8] cursor-not-allowed select-none"
                aria-disabled="true"
              >
                تندیس‌پی (به‌زودی)
              </span>
              <button
                type="button"
                onClick={() => onNavClick('news')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                اخبار و مقالات
              </button>
              <button
                type="button"
                onClick={() => onNavClick('downloads')}
                className="text-right font-bold text-[#0b5c60] hover:underline transition-colors cursor-pointer"
              >
                دانلود اپلیکیشن
              </button>
            </nav>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#12292c]">تندیس</h3>
            <nav className="flex flex-col space-y-2 text-xs text-[#4a666a]">
              <button
                type="button"
                onClick={() => onNavClick('provider-signup')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                ثبت‌نام همکار
              </button>
              <button
                type="button"
                onClick={() => onNavClick('expert-login')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                ورود کارشناس
              </button>
              <button
                type="button"
                onClick={() => onNavClick('management')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                مدیریت و کارشناسان
              </button>
              <button
                type="button"
                onClick={onOpenSupport}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                پشتیبانی ۲۴/۷
              </button>
              <button
                type="button"
                onClick={() => onNavClick('about')}
                className="text-right hover:text-[#0b5c60] transition-colors cursor-pointer"
              >
                درباره ما
              </button>
            </nav>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#12292c]">نماد اعتماد</h3>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 rounded-2xl bg-white border border-[#d6ebeb] hover:border-[#0a8387] flex items-center justify-center p-2 text-center transition-colors overflow-hidden [&_a]:flex [&_a]:items-center [&_a]:justify-center [&_a]:w-full [&_a]:h-full [&_img]:max-w-full [&_img]:max-h-full [&_img]:object-contain">
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  href={ENAMAD_URL}
                >
                  <img
                    referrerPolicy="origin"
                    src={ENAMAD_LOGO_SRC}
                    alt=""
                    style={{ cursor: 'pointer' }}
                    {...({ code: ENAMAD_CODE } as Record<string, string>)}
                  />
                </a>
              </div>
              <div className="w-24 h-24 rounded-2xl bg-white border border-[#d6ebeb] flex flex-col items-center justify-center p-2 text-center">
                <Shield className="w-5 h-5 text-[#f2a900] fill-[#f2a900]/20 mb-1.5" />
                <span className="text-[10px] font-bold text-[#334155]">ضمانت تندیس</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#dcecec] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5f777b]">
          <p>© تندیس — تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onNavClick('privacy')}
              className="hover:text-[#12292c] transition-colors cursor-pointer"
            >
              حریم خصوصی
            </button>
            <button
              type="button"
              onClick={() => onNavClick('terms')}
              className="hover:text-[#12292c] transition-colors cursor-pointer"
            >
              قوانین و عودت وجه
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
