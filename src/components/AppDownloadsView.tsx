import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Download,
  Info,
  Share,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
} from 'lucide-react';
import { toPersianDigits } from '../services/tandisDefaults';

interface AppDownloadsViewProps {
  dark: boolean;
  onToast: (msg: string) => void;
}

export const AppDownloadsView: React.FC<AppDownloadsViewProps> = ({ dark, onToast }) => {
  const [openIosGuide, setOpenIosGuide] = useState<'customer' | 'hamkar' | null>(null);

  const cardCls = dark
    ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]'
    : 'bg-white border-[#dfecec] text-[#12292c]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#5f777b]';
  const softBgCls = dark ? 'bg-[#1E2D40] border-[#26384E]' : 'bg-[#f4fafa] border-[#dfecec]';

  const apps = [
    {
      key: 'customer' as const,
      title: 'سوپر اپلیکیشن تندیس',
      logoSrc: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg',
      roleBadge: 'نسخه ویژه مشتریان',
      accentRing: 'border-[#0b5c60]/30 dark:border-[#14B8A6]/40',
      badgeCls: 'bg-[#0b5c60]/10 text-[#0b5c60] dark:bg-[#14B8A6]/15 dark:text-[#14B8A6]',
      directBtnCls: 'bg-[#0b5c60] hover:bg-[#0a8387] text-white',
      sizeLabel: `${toPersianDigits('۱۳.۷')} مگابایت`,
      downloadHref: '/api/tandis/downloads/tandis-customer.apk',
      downloadFileName: 'تندیس.apk',
      description:
        'سامانه جامع و یکپارچه مشتریان تندیس برای ثبت فوری درخواست خدمات تخصصی در محل (فنی و تعمیرات، خودرو، نظافت، حقوقی و پزشکی)، رزرو آنلاین نوبت سالن‌های زیبایی بانوان، خرید از فروشگاه قطعات اصلی، پیگیری زنده متخصص، مشاهده و پرداخت فاکتور رسمی و دریافت تسهیلات اعتباری تندیس‌پی در سراسر کشور.',
      highlights: [
        'دسترسی به بیش از ۳۰ خدمت تخصصی در تمامی ۳۱ استان کشور',
        'پیگیری لحظه‌ای وضعیت سفارش، تماس مستقیم و پرداخت امن شاپرک و کیف پول',
        'رزرو هوشمند نوبت زیبایی بانوان و خرید اقساطی با تندیس‌پی',
        'همگام‌سازی زنده و خودکار با وب‌سایت و پشتیبانی شبانه‌روزی',
      ],
      iosTitle: 'نصب نسخه iOS سوپر اپلیکیشن تندیس روی آیفون و آیپد',
      iosSteps: [
        'وب‌سایت جامع تندیس را در مرورگر سافاری آیفون یا آیپد خود باز کنید.',
        'در نوار پایین مرورگر، دکمه اشتراک‌گذاری را لمس کنید.',
        'گزینه «افزودن به صفحه اصلی» را انتخاب کرده و تایید بزنید تا سوپر اپلیکیشن تندیس مانند برنامه بومی با تمام امکانات روی گوشی شما نصب شود.',
      ],
      iosNote:
        'نسخه تحت‌وب پیش‌رونده تندیس همین الان به‌طور کامل روی آیفون قابل نصب است و نسخه فروشگاه اپل نیز به‌زودی منتشر می‌شود.',
    },
    {
      key: 'hamkar' as const,
      title: 'تندیس همکار',
      logoSrc: '/assets/aistudio/Make_logo_gold_white_background_ecbe9332_2K_bd2ed1f8.jpg',
      roleBadge: 'نسخه ویژه متخصصان و همکاران',
      accentRing: 'border-[#f2a900]/55 dark:border-[#F59E0B]/45',
      badgeCls: 'bg-[#f2a900]/15 text-[#9a6700] dark:text-[#FBBF24]',
      directBtnCls: 'bg-[#0a8387] hover:bg-[#0b5c60] text-white',
      sizeLabel: `${toPersianDigits('۱۴.۸')} مگابایت`,
      downloadHref: '/api/tandis/downloads/tandis-hamkar.apk',
      downloadFileName: 'تندیس-همکار.apk',
      description:
        'اپلیکیشن اختصاصی متخصصان، فنی‌کاران، کارشناسان و همکاران تاییدشده تندیس برای دریافت آنی سفارش‌های مشتریان اطراف، مدیریت کامل مراحل ماموریت، بارگذاری مدارک هویتی و تخصصی، صدور فاکتور رسمی اجرت و قطعات در محل، مدیریت تقویم نوبت‌دهی و تسویه سریع درآمد در کیف پول همکار.',
      highlights: [
        'دریافت لحظه‌ای سفارش‌های جدید متناسب با تخصص و شهر فعالیت شما',
        'صدور فاکتور رسمی با جزئیات قطعات و اجرت و تایید آنی پرداخت مشتری',
        'مدیریت مدارک تایید هویت، تقویم کاری و پروفایل حرفه‌ای متخصص',
        'مشاهده گزارش شفاف درآمد خالص و تسویه سریع از طریق کیف پول همکار',
      ],
      iosTitle: 'وضعیت نسخه iOS اپلیکیشن تندیس همکار',
      iosSteps: [
        'نسخه اختصاصی آیفون و آیپد «تندیس همکار» در حال آماده‌سازی نهایی و دریافت گواهی انتشار است.',
        'هم‌اکنون می‌توانید نسخه رسمی اندروید «تندیس همکار» را از طریق دکمه دانلود مستقیم نصب و استفاده کنید.',
      ],
      iosNote: 'نسخه iOS تندیس همکار به‌زودی منتشر و از همین صفحه در دسترس قرار می‌گیرد.',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* بنر معرفی صفحه دانلود برنامه‌ها */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] tandis-calm-gradient text-white p-6 sm:p-8 shadow-[0_14px_34px_rgba(11,92,96,0.16)]"
      >
        <div className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-[#f2a900]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#f2a900]">
              <Sparkles className="w-4 h-4" />
              مرکز رسمی دریافت نرم‌افزارهای تندیس
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-snug">
              دانلود اپلیکیشن‌های تندیس
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-7 max-w-2xl">
              نسخه رسمی و مستقیم «سوپر اپلیکیشن تندیس» برای مشتریان و «تندیس همکار» برای متخصصان را از همین صفحه دریافت کنید. هر دو برنامه به‌صورت زنده و لحظه‌ای با سامانه مرکزی تندیس همگام هستند.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 text-xs font-extrabold shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#f2a900] shrink-0" />
            <div>
              <div>فایل‌های اصلی و تاییدشده</div>
              <div className="text-[11px] text-white/80 font-semibold mt-0.5">
                دانلود مستقیم با لینک پرسرعت
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* کارت‌های دو برنامه: سوپر اپلیکیشن تندیس و تندیس همکار */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apps.map((appItem, idx) => {
          const isIosOpen = openIosGuide === appItem.key;
          return (
            <motion.section
              key={appItem.key}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className={`rounded-[2rem] border p-6 shadow-[0_8px_28px_rgba(11,92,96,0.06)] hover:shadow-[0_16px_38px_rgba(11,92,96,0.11)] transition-shadow flex flex-col justify-between gap-6 ${cardCls}`}
            >
              <div className="space-y-5">
                {/* سرصفحه برنامه */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-white p-1.5 border-2 shrink-0 flex items-center justify-center shadow-xs overflow-hidden ${appItem.accentRing}`}
                  >
                    <img
                      src={appItem.logoSrc}
                      alt={`لوگو ${appItem.title}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${appItem.badgeCls}`}>
                        {appItem.roleBadge}
                      </span>
                      <span className={`text-[11px] font-bold tabular-nums ${mutedCls}`}>
                        اندروید · {appItem.sizeLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-black">{appItem.title}</h3>
                  </div>
                </div>

                {/* توضیح کامل کارکرد برنامه */}
                <p className={`text-xs sm:text-sm leading-7 ${mutedCls}`}>{appItem.description}</p>

                {/* ویژگی‌های کلیدی */}
                <div className={`rounded-2xl border p-4 space-y-2.5 ${softBgCls}`}>
                  <div className="text-xs font-black">امکانات اصلی این برنامه:</div>
                  <ul className="space-y-2">
                    {appItem.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-5 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#0a8387] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ۴ گزینه دانلود زیر هر برنامه */}
              <div className="space-y-3 pt-4 border-t border-[#dfecec] dark:border-[#26384E]">
                <div className="text-xs font-black opacity-80">روش‌های دریافت و نصب {appItem.title}:</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* ۱. دانلود مستقیم */}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={appItem.downloadHref}
                    download={appItem.downloadFileName}
                    onClick={() =>
                      onToast(`در حال شروع دانلود مستقیم ${appItem.title} (${appItem.sizeLabel})...`)
                    }
                    className={`flex items-center justify-between gap-2 rounded-2xl px-4 py-3.5 text-xs font-black transition shadow-xs ${appItem.directBtnCls}`}
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 shrink-0" />
                      <span>دانلود مستقیم</span>
                    </span>
                    <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-lg tabular-nums">
                      {appItem.sizeLabel}
                    </span>
                  </motion.a>

                  {/* ۲. نسخه iOS */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setOpenIosGuide((prev) => (prev === appItem.key ? null : appItem.key))}
                    className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-xs font-black transition cursor-pointer ${
                      isIosOpen
                        ? 'border-[#0b5c60] bg-[#0b5c60]/10 text-[#0b5c60] dark:border-[#14B8A6] dark:bg-[#14B8A6]/15 dark:text-[#14B8A6]'
                        : 'border-[#cbd5e1] dark:border-[#26384E] hover:border-[#0b5c60]/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>نسخه iOS</span>
                    </span>
                    <span className="text-[10px] font-bold opacity-80">
                      {appItem.key === 'customer' ? 'راهنمای نصب' : 'به‌زودی'}
                    </span>
                  </motion.button>

                  {/* ۳. دانلود از کافه بازار - به‌زودی */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onToast(`نسخه کافه بازار ${appItem.title} به‌زودی منتشر می‌شود.`)}
                    className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-xs font-extrabold cursor-pointer opacity-85 hover:opacity-100 transition ${softBgCls}`}
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>دانلود از کافه بازار</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#f2a900]/15 text-[#9a6700] dark:text-[#FBBF24] px-2 py-0.5 text-[10px] font-black">
                      <Clock className="w-3 h-3" />
                      به‌زودی
                    </span>
                  </motion.button>

                  {/* ۴. دانلود از مایکت - به‌زودی */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onToast(`نسخه مایکت ${appItem.title} به‌زودی منتشر می‌شود.`)}
                    className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-xs font-extrabold cursor-pointer opacity-85 hover:opacity-100 transition ${softBgCls}`}
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                      <span>دانلود از مایکت</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#f2a900]/15 text-[#9a6700] dark:text-[#FBBF24] px-2 py-0.5 text-[10px] font-black">
                      <Clock className="w-3 h-3" />
                      به‌زودی
                    </span>
                  </motion.button>
                </div>

                {/* راهنمای بازشونده نسخه iOS با انیمیشن نرم */}
                <AnimatePresence initial={false}>
                  {isIosOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-[#0b5c60]/25 dark:border-[#14B8A6]/35 bg-[#0b5c60]/5 dark:bg-[#14B8A6]/10 p-4 space-y-2.5 text-xs mt-1">
                        <div className="flex items-center gap-2 font-black text-[#0b5c60] dark:text-[#14B8A6]">
                          <Share className="w-4 h-4 shrink-0" />
                          <span>{appItem.iosTitle}</span>
                        </div>
                        <ol className="space-y-1.5 list-decimal list-inside leading-6 font-semibold">
                          {appItem.iosSteps.map((stepText) => (
                            <li key={stepText}>{stepText}</li>
                          ))}
                        </ol>
                        <div className={`text-[11px] leading-5 pt-1 border-t border-[#0b5c60]/15 dark:border-[#14B8A6]/20 ${mutedCls}`}>
                          {appItem.iosNote}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* راهنمای سریع نصب فایل مستقیم اندروید */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-[2rem] border p-5 sm:p-6 space-y-3 ${cardCls}`}
      >
        <div className="flex items-center gap-2 font-black text-base">
          <Info className="w-5 h-5 text-[#0b5c60] dark:text-[#14B8A6]" />
          راهنمای نصب فایل دانلود مستقیم روی گوشی‌های اندروید
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-6">
          <div className={`rounded-2xl border p-3.5 ${softBgCls}`}>
            <div className="font-black text-[#0b5c60] dark:text-[#14B8A6] mb-1">
              {toPersianDigits('۱')}. دانلود فایل برنامه
            </div>
            روی دکمه «دانلود مستقیم» برنامه مورد نظر کلیک کنید تا فایل نصبی رسمی روی گوشی ذخیره شود.
          </div>
          <div className={`rounded-2xl border p-3.5 ${softBgCls}`}>
            <div className="font-black text-[#0b5c60] dark:text-[#14B8A6] mb-1">
              {toPersianDigits('۲')}. تایید مجوز نصب
            </div>
            فایل دانلودشده را باز کنید؛ در صورت نمایش پیام امنیتی اندروید، گزینه «اجازه نصب از این منبع» را فعال نمایید.
          </div>
          <div className={`rounded-2xl border p-3.5 ${softBgCls}`}>
            <div className="font-black text-[#0b5c60] dark:text-[#14B8A6] mb-1">
              {toPersianDigits('۳')}. ورود و همگام‌سازی زنده
            </div>
            پس از نصب، با شماره موبایل خود وارد شوید تا کیف پول، سفارش‌ها و اطلاعات شما به‌طور خودکار همگام شود.
          </div>
        </div>
      </motion.div>
    </div>
  );
};
