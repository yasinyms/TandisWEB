import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Headphones,
  Info,
  MapPin,
  MessageSquarePlus,
  Newspaper,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import { formatToman, toPersianDigits, toPurePersianText } from '../services/tandisDefaults';
import type {
  AppNotificationItem,
  OfficialSpecialistSummary,
  ServiceRequestItem,
  SupportTicket
} from '../types/tandis';

export const AboutTandisView: React.FC<{
  dark: boolean;
  supportPhone: string;
  otaVersionLabel: string;
}> = ({ dark, supportPhone, otaVersionLabel }) => {
  const cardCls = dark
    ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]'
    : 'bg-white border-[#E2EFEF] text-[#0F2926]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className={`rounded-3xl border p-6 shadow-sm ${cardCls}`}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img
            src="/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg"
            alt="نشان وب‌سایت جامع تندیس"
            className="w-24 h-24 rounded-2xl object-contain bg-white p-2 border border-[#E2EFEF]"
          />
          <div className="text-center sm:text-right space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#065A52] dark:text-[#14B8A6]">
              <Sparkles className="w-3.5 h-3.5" />
              وب‌سایت جامع تندیس — نسخه همگام ({toPurePersianText(otaVersionLabel) || toPersianDigits('۲.۷.۰')})
            </div>
            <h2 className="text-2xl font-black">درباره وب‌سایت و سامانه خدمات تندیس</h2>
            <p className={`text-sm leading-7 ${mutedCls}`}>
              تندیس سامانه هوشمند درخواست خدمات تخصصی در محل، رزرو آنلاین نوبت زیبایی بانوان، فروشگاه قطعات اصلی، خدمات حقوقی و پزشکی و تسهیلات اعتباری تندیس‌پی است که به‌صورت هم‌زمان با پنل همکاران و سامانه مدیریت مرکزی همگام‌سازی می‌شود.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <ShieldCheck className="w-6 h-6 text-[#065A52] dark:text-[#14B8A6]" />
            نماد اعتماد الکترونیکی و مجوزهای رسمی
          </div>
          <p className={`text-sm leading-7 ${mutedCls}`}>
            تمامی پرداخت‌های آنلاین، خرید قطعات و رزرو خدمات در وب‌سایت تندیس با نظارت قانونی و تحت پوشش نشان اعتماد الکترونیکی انجام می‌شود. برای استعلام اصالت، روی نشان رسمی کلیک کنید.
          </p>
          <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E2D40] border border-[#E2EFEF] dark:border-[#26384E] [&_img]:w-28 [&_img]:h-28 [&_img]:object-contain">
            <a
              referrerPolicy="origin"
              target="_blank"
              href="https://trustseal.enamad.ir/?id=8499335&Code=8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e"
            >
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=8499335&Code=8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e"
                alt=""
                style={{ cursor: 'pointer' }}
                {...({ code: '8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e' } as Record<string, string>)}
              />
            </a>
            <span className="text-xs font-bold text-[#065A52] dark:text-[#14B8A6]">
              استعلام نشان اعتماد (شناسه {toPersianDigits('8499335')})
            </span>
          </div>
        </div>

        <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <Info className="w-6 h-6 text-[#F59E0B]" />
            تماس با ما و پشتیبانی شبانه‌روزی
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
              <Phone className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
              <div>
                <div className={`text-xs ${mutedCls}`}>شماره پشتیبانی شبانه‌روزی (۲۴ ساعته)</div>
                <a href={`tel:${supportPhone}`} className="font-extrabold tabular-nums">
                  {toPersianDigits(supportPhone)}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
              <MapPin className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
              <div>
                <div className={`text-xs ${mutedCls}`}>گستره پوشش جغرافیایی</div>
                <div className="font-bold">تمامی {toPersianDigits(31)} استان و بیش از {toPersianDigits(350)} شهرستان کشور</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <div className="font-semibold">همگام‌سازی خودکار با سامانه مدیریت و همکاران</div>
            </div>
          </div>
        </div>
      </div>

      {/* قوانین خرید، رویه عودت وجه و حریم خصوصی (الزامات اینماد و درگاه پرداخت شاپرکی) */}
      <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
        <div className="flex items-center gap-2 font-extrabold text-lg">
          <ShieldCheck className="w-6 h-6 text-[#065A52] dark:text-[#14B8A6]" />
          قوانین استفاده، زمان تحویل و رویه لغو و عودت وجه
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-6">
          <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 space-y-1.5">
            <h4 className="font-black text-sm">۱. شفافیت قیمت‌گذاری و فاکتور رسمی</h4>
            <p className={mutedCls}>
              قیمت تمامی قطعات فروشگاه به‌صورت دقیق و به تومان درج شده است. برای خدمات در محل، تعرفه پایه در صفحه هر خدمت نمایش داده می‌شود و فاکتور نهایی پس از بررسی و تایید مشتری صادر و آنلاین تسویه می‌گردد.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 space-y-1.5">
            <h4 className="font-black text-sm">۲. رویه لغو سفارش و بازگشت وجه (عودت)</h4>
            <p className={mutedCls}>
              کاربران در تمامی بخش‌های خدمات، رزرو زیبایی و فروشگاه قطعات می‌توانند پیش از اعزام متخصص یا ارسال مرسوله، سفارش را لغو کنند. وجه پرداخت‌شده بلافاصله به کیف پول تندیس یا حداکثر ظرف ۷۲ ساعت کاری به شماره شبای خریدار بازگردانده می‌شود.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 space-y-1.5">
            <h4 className="font-black text-sm">۳. زمان‌بندی ارائه خدمت و ارسال کالا</h4>
            <p className={mutedCls}>
              اعزام متخصصان فنی و خودرویی طبق بازه زمانی انتخاب‌شده (معمولاً ۲۰ تا ۶۰ دقیقه) انجام می‌شود و قطعات خریداری‌شده از فروشگاه تندیس ظرف ۱ تا ۳ روز کاری با ضمانت سلامت فیزیکی تحویل می‌گردد.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 space-y-1.5">
            <h4 className="font-black text-sm">۴. حریم خصوصی و امنیت اطلاعات پرداخت</h4>
            <p className={mutedCls}>
              اطلاعات هویتی و نشانی کاربران صرفاً برای هماهنگی اعزام و ارسال سفارش استفاده می‌شود و کلیه تراکنش‌های مالی بر بستر امن شاپرک و زیر نظر نماد اعتماد الکترونیکی انجام می‌گیرد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ManagementExpertsView: React.FC<{
  dark: boolean;
  supportPhone: string;
  officialSpecialists?: OfficialSpecialistSummary[];
  onNavigate: (dest: string) => void;
  onOpenSupport: () => void;
}> = ({ dark, supportPhone, officialSpecialists = [], onNavigate, onOpenSupport }) => {
  const [cityFilter, setCityFilter] = useState('همه شهرها');
  const cardCls = dark
    ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]'
    : 'bg-white border-[#E2EFEF] text-[#12292c]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  const cities = Array.from(
    new Set(officialSpecialists.map((s) => s.serviceCity).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'fa'));

  const visibleSpecialists = officialSpecialists.filter(
    (s) => cityFilter === 'همه شهرها' || s.serviceCity === cityFilter
  );

  const units = [
    {
      title: 'مدیریت مرکزی و نظارت بر کیفیت خدمات',
      role: 'نظارت بر عملکرد متخصصان، تعرفه‌ها و دسته‌بندی‌ها',
      desc: 'بررسی لحظه‌ای درخواست‌های ثبت‌شده، مدیریت دسته‌بندی‌های خدمات، تایید صلاحیت متخصصان و رسیدگی مستقیم به تیکت‌ها و پیام‌های کاربران در سراسر کشور.'
    },
    {
      title: 'کارشناسان فنی، مهندسی و تعمیرات',
      role: 'لوازم خانگی، تاسیسات و امداد خودرو',
      desc: 'تیم کارشناسان مجرب و احراز هویت‌شده در حوزه تعمیرات تخصصی لوازم خانگی، مکانیک سیار و برق خودرو با ضمانت اصالت قطعات.'
    },
    {
      title: 'کارشناسان حقوقی، پزشکی و زیبایی',
      role: 'وکلای پایه‌یک، کادر درمان و سالن‌های زیبایی',
      desc: 'همکاری با وکلای رسمی دادگستری، پزشکان و پرستاران دارای پروانه نظام پزشکی و متخصصان برتر زیبایی و مراقبت پوست و مو.'
    },
    {
      title: 'واحد مالی، تسویه شبا و اعتبار تندیس‌پی',
      role: 'پشتیبانی تراکنش‌ها، فاکتورها و تسهیلات اقساطی',
      desc: 'مدیریت تسویه‌حساب آنی همکاران از طریق شماره شبا، بررسی پرونده‌های تسهیلات اعتباری تندیس‌پی و پشتیبانی پرداخت‌های آنلاین.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className={`rounded-3xl border p-6 sm:p-8 shadow-sm ${cardCls}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#effcfb] text-[#0a8387] border border-[#c5ecea] text-xs font-extrabold">
              <Users className="w-3.5 h-3.5" />
              ساختار اجرایی و تیم متخصصان تندیس
            </div>
            <h1 className="text-xl sm:text-2xl font-black">مدیریت و کارشناسان سامانه تندیس</h1>
            <p className={`text-xs sm:text-sm leading-7 max-w-2xl ${mutedCls}`}>
              شبکه یکپارچه مدیریت و کارشناسان تندیس متشکل از مدیران کنترل کیفیت، کارشناسان پشتیبانی و هزاران متخصص احراز هویت‌شده در ۳۱ استان کشور است.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('expert-login')}
              className="px-4 py-2.5 rounded-2xl bg-[#0a8387] hover:bg-[#086d70] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              ورود کارشناسان و همکاران
            </button>
            <button
              type="button"
              onClick={() => onNavigate('provider-signup')}
              className="px-4 py-2.5 rounded-2xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] border border-[#cde6e6] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              جذب و ثبت‌نام کارشناس جدید
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((u) => (
          <div key={u.title} className={`rounded-3xl border p-5 sm:p-6 space-y-2.5 ${cardCls}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-black text-[#0b5c60]">{u.title}</h3>
              <ShieldCheck className="w-5 h-5 text-[#0a8387] shrink-0" />
            </div>
            <div className="text-xs font-extrabold text-[#f2a900]">{u.role}</div>
            <p className={`text-xs leading-6 ${mutedCls}`}>{u.desc}</p>
          </div>
        ))}
      </div>

      {officialSpecialists.length > 0 && (
        <div className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${cardCls}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black">کارشناسان رسمی احرازشده تندیس</h3>
              <p className={`text-xs mt-0.5 ${mutedCls}`}>
                {toPersianDigits(visibleSpecialists.length)} متخصص فعال تاییدشده توسط مدیریت مرکزی
              </p>
            </div>
            {cities.length > 1 && (
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="rounded-xl border border-[#cde6e6] bg-[#f4fafa] px-3 py-2 text-xs font-bold text-[#0b5c60] outline-none"
              >
                <option value="همه شهرها">همه شهرها</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleSpecialists.slice(0, 18).map((spec, idx) => (
              <div
                key={`${spec.fullName}-${spec.serviceCity}-${idx}`}
                className="rounded-2xl border border-[#e5f0f0] bg-[#fcfefe] p-3.5 flex items-center gap-3"
              >
                {spec.profilePhoto ? (
                  <img
                    src={spec.profilePhoto}
                    alt={spec.fullName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-[#d6ebeb] shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#0a8387]/12 text-[#0b5c60] font-black text-base flex items-center justify-center shrink-0">
                    {(spec.fullName || 'ت').slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs font-black text-[#12292c] truncate">{spec.fullName}</div>
                  <div className="text-[11px] font-bold text-[#0a8387] truncate">{spec.roleTitle}</div>
                  <div className="text-[10px] text-[#5f777b] truncate">
                    {spec.businessName ? `${spec.businessName} · ` : ''}
                    {spec.serviceCity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-3xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${cardCls}`}>
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="text-sm sm:text-base font-black">ارتباط مستقیم با مدیریت و واحد کارشناسی</h3>
          <p className={`text-xs ${mutedCls}`}>
            جهت ثبت درخواست کارشناسی، پیگیری پرونده‌ها یا ارتباط با مدیریت مرکزی تندیس با ما در تماس باشید.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSupport}
            className="px-4 py-2.5 rounded-2xl bg-[#effcfb] text-[#0b5c60] border border-[#bce6e4] text-xs font-extrabold cursor-pointer"
          >
            ارسال پیام به مدیریت
          </button>
          <a
            href={`tel:${supportPhone}`}
            className="px-4 py-2.5 rounded-2xl bg-[#12292c] text-white text-xs font-extrabold flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-[#2dd4bf]" />
            <span dir="ltr">{toPersianDigits(supportPhone)}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

interface EducationalArticle {
  id: string;
  slug: string;
  title: string;
  seoSubtitle: string;
  category: string;
  readingTimeMin: number;
  publishDateJalali: string;
  author: string;
  coverImage: string;
  keywords: string[];
  summary: string;
  keyTakeaways: string[];
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const EDUCATIONAL_SEO_ARTICLES: EducationalArticle[] = [
  {
    id: 'art-1',
    slug: 'air-conditioner-maintenance-guide',
    title: 'راهنمای جامع سرویس دوره‌ای کولر گازی و اسپلیت؛ کاهش ۴۰ درصدی مصرف برق و جلوگیری از سوختن کمپرسور',
    seoSubtitle: 'آموزش گام‌به‌گام نگهداری، شست‌وشوی فیلترها، تشخیص کمبود گاز مبرد و زمان طلایی سرویس کولر گازی در مناطق گرمسیر و معتدل',
    category: 'فنی و لوازم خانگی',
    readingTimeMin: 6,
    publishDateJalali: 'آبان ۱۴۰۴',
    author: 'تحریریه فنی تندیس',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85',
    keywords: ['سرویس کولر گازی', 'تعمیر اسپلیت در محل', 'شارژ گاز کولر گازی', 'کاهش مصرف برق کولر'],
    summary:
      'سرویس به‌موقع کولر گازی و اسپلیت نه‌تنها پرتاب باد و خنک‌کنندگی دستگاه را تا دو برابر بهبود می‌دهد، بلکه از فشار مضاعف به کمپرسور و هزینه‌های سنگین تعویض برد و موتور جلوگیری می‌کند.',
    keyTakeaways: [
      'شست‌وشوی فیلترهای پنل داخلی هر ۳ هفته یک‌بار جریان هوا را تا ۳۵ درصد روانتر می‌کند.',
      'کثیفی کندانسور بیرونی اصلی‌ترین عامل افزایش آمپر مصرفی و اورلود کردن کمپرسور در تابستان است.',
      'کاهش سرمای باد خروجی یا یخ‌زدگی لوله‌های مسی نشانه مستقیم نشتی و کمبود گاز مبرد است.'
    ],
    sections: [
      {
        heading: '۱. چرا سرویس دوره‌ای کولر گازی پیش از شروع فصل گرما حیاتی است؟',
        paragraphs: [
          'کولرهای گازی و اسپلیت‌ها به دلیل مکش مداوم هوای محیط، به مرور زمان ذرات گردوغبار و پرزهای معلق را روی شبکه‌های فیلتر و فین‌های اواپراتور جذب می‌کنند. انباشت این لایه غبار مانند یک عایق حرارتی عمل کرده و مانع تبادل سرمای گاز مبرد با هوای اتاق می‌شود.',
          'زمانی که تبادل حرارتی در پنل داخلی یا یونیت بیرونی (کندانسور) مختل شود، کمپرسور مجبور است ساعات طولانی‌تری بدون وقفه کار کند. این وضعیت علاوه بر افزایش چشمگیر قبض برق، دمای سیم‌پیچ موتور را بالا برده و عمر مفید خازن و کمپرسور را به شدت کاهش می‌دهد.'
        ]
      },
      {
        heading: '۲. مراحل استاندارد سرویس کامل کولر گازی توسط متخصص',
        paragraphs: [
          'یک سرویس اصولی فراتر از تمیز کردن ظاهری قاب پنل است و باید هر دو بخش داخلی و خارجی دستگاه را شامل شود:'
        ],
        bullets: [
          'شست‌وشوی فین‌های کندانسور بیرونی با کارواش صنعتی زاویه مناسب بدون خم شدن پره‌های آلومینیومی',
          'باز کردن و ضدعفونی فیلترهای پنل داخلی و بررسی باز بودن مسیر لوله درین (خروجی آب) برای جلوگیری از نشت آب به دیوار',
          'اندازه‌گیری فشار گاز مبرد با گیج تخصصی و تست آمپر مصرفی کمپرسور با کلمپ‌متر',
          'آچارکشی کنتاکتورها، بررسی سلامت خازن راه‌انداز و کنترل سنسورهای دمایی (ترمیستورها)'
        ]
      },
      {
        heading: '۳. نشانه‌های هشداردهنده که می‌گویند کولر شما فوراً به تعمیرکار نیاز دارد',
        paragraphs: [
          'اگر هنگام روشن بودن کولر گازی با علائمی مانند باد گرم، خاموش و روشن شدن پیاپی، صدای غیرعادی از یونیت بیرونی، چکه کردن آب از زیر پنل داخلی یا نمایش کد خطا روی نمایشگر مواجه شدید، دستگاه را خاموش کرده و از دستکاری برد الکترونیکی خودداری کنید.',
          'ادامه کارکرد کولر در حالت کمبود گاز یا خرابی خازن می‌تواند یک ایراد جزئی و کم‌هزینه را به سوختن کامل کمپرسور تبدیل کند.'
        ]
      }
    ],
    faqs: [
      {
        question: 'آیا کولر گازی هر سال نیاز به شارژ گاز دارد؟',
        answer:
          'خیر؛ گاز کولر در یک مدار بسته گردش می‌کند و تنها در صورت وجود نشتی در لوله‌های مسی، مهره‌ها یا شیرها کم می‌شود. در سرویس سالانه فشار گاز تست شده و فقط در صورت افت فشار، ابتدا نشتی‌گیری و سپس شارژ مجدد انجام می‌گیرد.'
      },
      {
        question: 'بهترین دما برای تنظیم کولر گازی جهت مصرف بهینه برق چند درجه است؟',
        answer:
          'تنظیم دما بین ۲۴ تا ۲۵ درجه سانتی‌گراد روی حالت اتوماتیک بهترین تعادل بین آسایش دمایی، سلامت تنفسی و حداقل مصرف برق را فراهم می‌کند.'
      }
    ]
  },
  {
    id: 'art-2',
    slug: 'car-periodic-checkup-before-trip',
    title: 'چک‌لیست طلایی معاینه فنی و سرویس خودرو پیش از سفر؛ ۷ نقطه‌ای که مکانیک سیار باید بررسی کند',
    seoSubtitle: 'از تست سلامت باتری و دینام تا بررسی لنت ترمز، تسمه تایم و سیستم خنک‌کننده موتور برای تجربه‌ای ایمن در جاده',
    category: 'امداد و خودرو',
    readingTimeMin: 5,
    publishDateJalali: 'آبان ۱۴۰۴',
    author: 'واحد کارشناسی خودرو تندیس',
    coverImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=85',
    keywords: ['مکانیک سیار', 'سرویس دوره‌ای خودرو', 'تست باتری خودرو در محل', 'امداد خودرو تندیس'],
    summary:
      'بیش از ۷۰ درصد توقف‌های ناگهانی خودروها در جاده‌ها ناشی از نقص‌های ساده‌ای است که با یک بازدید ۲۰ دقیقه‌ای توسط مکانیک سیار در پارکینگ منزل قابل پیشگیری هستند.',
    keyTakeaways: [
      'بررسی سطح و کیفیت روغن موتور، روغن ترمز و مایع ضدیخ/ضدجوش پایه اصلی سلامت پیشرانه است.',
      'تست ولتاژ باتری و شارژ دینام از خاموش ماندن خودرو در توقف‌های بین‌راهی جلوگیری می‌کند.',
      'بازدید ضخامت لنت‌ها و سلامت شلنگ‌های رادیاتور امنیت ترمزگیری و پایداری دمای موتور را تضمین می‌کند.'
    ],
    sections: [
      {
        heading: '۱. سیستم خنک‌کننده و مایعات حیاتی موتور',
        paragraphs: [
          'جوش آوردن موتور در ترافیک یا سربالایی‌های جاده یکی از پرهزینه‌ترین اتفاقات برای رانندگان است و می‌تواند منجر به سوختن واشر سرسیلندر شود. پیش از هر سفر باید سطح آب رادیاتور، غلظت ضدیخ-ضدجوش، سلامت درب رادیاتور و عملکرد صحیح فن‌های دور کند و تند بررسی شود.',
          'همچنین روغن موتور علاوه بر روانکاری قطعات متحرک، بخش مهمی از حرارت داخلی موتور را جذب می‌کند. تعویض به‌موقع روغن موتور و فیلتر روغن از استهلاک یاتاقان‌ها و رینگ پیستون جلوگیری می‌نماید.'
        ]
      },
      {
        heading: '۲. سلامت باتری، استارت و سیستم برق‌رسانی',
        paragraphs: [
          'عمر متوسط باتری خودرو بین ۱۸ تا ۳۰ ماه است. سولفاته شدن سرباتری‌ها یا افت ولتاژ دینام باعث می‌شود خودرو در استارت صبحگاهی یا پس از توقف کوتاه روشن نشود:'
        ],
        bullets: [
          'تست ولتاژ باتری در حالت خاموش (حداقل ۱۲.۴ ولت) و در حالت روشن بودن موتور (بین ۱۳.۸ تا ۱۴.۴ ولت)',
          'بررسی سلامت تسمه دینام و تسمه تایم از نظر ترک‌خوردگی، ریش‌ریش شدن یا شل بودن',
          'کنترل عملکرد شمع‌ها و وایرها برای احتراق کامل و جلوگیری از ریپ زدن یا افزایش مصرف سوخت'
        ]
      },
      {
        heading: '۳. سیستم ترمز، جلوبندی و تایرها',
        paragraphs: [
          'ضخامت لنت‌های جلو و عقب، نبود نشتی در بوستر و چرخ‌ها، و تنظیم بودن باد لاستیک‌ها (به‌همراه لاستیک زاپاس) مستقیماً با جان سرنشینان در ارتباط است. صدای سوت یا کشیده شدن فرمان هنگام ترمزگیری نشانه پایان عمر لنت یا تاب برداشتن دیسک چرخ است که باید در محل یا تعمیرگاه برطرف شود.'
        ]
      }
    ],
    faqs: [
      {
        question: 'تسمه تایم خودرو هر چند کیلومتر باید تعویض شود؟',
        answer:
          'بسته به مدل خودرو، معمولاً هر ۵۰ تا ۶۰ هزار کیلومتر (یا هر ۳ سال یک‌بار حتی در صورت کارکرد کمتر) باید تسمه تایم و بلبرینگ تایم بازدید و تعویض شوند تا از کج شدن سوپاپ‌ها جلوگیری گردد.'
      },
      {
        question: 'آیا تعویض لنت، باتری و شمع در محل پارکینگ منزل امکان‌پذیر است؟',
        answer:
          'بله، مکانیک‌های سیار تندیس با ابزار کامل عیب‌یابی و دیاگ، خدمات تعویض باتری، لنت ترمز، شمع، تسمه و رفع ایرادات برقی را در محل شما انجام می‌دهند.'
      }
    ]
  },
  {
    id: 'art-3',
    slug: 'washing-machine-and-refrigerator-care',
    title: '۱۰ اشتباه رایج که عمر یخچال فریزر و ماشین لباسشویی را نصف می‌کند + راهکارهای پیشگیری',
    seoSubtitle: 'چگونه از سوختن برد الکترونیکی، خرابی بلبرینگ دیگ لباسشویی و یکسره کار کردن موتور یخچال جلوگیری کنیم؟',
    category: 'فنی و لوازم خانگی',
    readingTimeMin: 6,
    publishDateJalali: 'آبان ۱۴۰۴',
    author: 'تحریریه فنی تندیس',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
    keywords: ['تعمیر لباسشویی در محل', 'تعمیر یخچال فریزر', 'نگهداری لوازم خانگی', 'تعمیرکار مجاز تندیس'],
    summary:
      'یخچال و ماشین لباسشویی پرکارترین لوازم منزل هستند. رعایت چند اصل ساده در تراز بودن، جرم‌گیری و تهویه پشت دستگاه، شما را از تعمیرات پرهزینه بی‌نیاز می‌کند.',
    keyTakeaways: [
      'پر کردن بیش از ظرفیت دیگ لباسشویی عامل اصلی شکستن سه‌نظام و خرابی بلبرینگ و کمک‌فنرها است.',
      'فاصله استاندارد حداقل ۱۵ سانتی‌متری یخچال از دیوار پشتی برای گردش هوا و خنک شدن کندانسور الزامی است.',
      'تمیز کردن فیلتر پمپ تخلیه لباسشویی هر دو ماه یک‌بار از سوختن پمپ و خطای عدم تخلیه آب جلوگیری می‌کند.'
    ],
    sections: [
      {
        heading: '۱. اصول طلایی افزایش طول عمر ماشین لباسشویی اتوماتیک',
        paragraphs: [
          'لرزش و صدای شدید ماشین لباسشویی در دور تند خشک‌کن معمولاً به دلیل تراز نبودن پایه‌ها یا بارگذاری نامتعادل البسه رخ می‌دهد. همیشه حدود یک‌سوم فضای بالای دیگ را خالی بگذارید تا لباس‌ها فضای کافی برای چرخش داشته باشند و فشار غیرمتقارن به شفت و کاسه‌نمد وارد نشود.',
          'همچنین پس از پایان هر شست‌وشو، لاستیک دور درب را خشک کرده و درب دستگاه را یک ساعت نیمه‌باز بگذارید تا رطوبت داخل دیگ تبخیر شده و از ایجاد بوی نامطبوع و کپک جلوگیری شود.'
        ],
        bullets: [
          'تخلیه و شست‌وشوی فیلتر پمپ پایین لباسشویی برای خارج کردن سکه، دکمه و پرزهای مسدودکننده',
          'استفاده از پودر یا مایع استاندارد مخصوص ماشین اتوماتیک به میزان توصیه‌شده (کف زیاد به برد و سنسور سطح آب آسیب می‌زند)',
          'جرم‌گیری دوره‌ای المنت و دیگ در مناطقی که سختی و املاح آب بالا است'
        ]
      },
      {
        heading: '۲. مراقبت از کمپرسور، لاستیک دور درب و سیستم دیفراست یخچال',
        paragraphs: [
          'خرابی یا فرسودگی لاستیک دور درب یخچال باعث نفوذ دائمی هوای گرم و مرطوب محیط به داخل کابین می‌شود. نتیجه این اتفاق، برفک زدن اواپراتور، یکسره کار کردن کمپرسور و داغ شدن موتور است. برای تست سلامت لاستیک، یک برگ کاغذ لای درب بگذارید؛ اگر کاغذ به راحتی بیرون کشیده شد، لاستیک نیاز به رگلاژ یا تعویض دارد.',
          'علاوه بر این، استفاده از محافظ برق استاندارد با زمان تاخیر واقعی (۳ تا ۵ دقیقه) هنگام قطع و وصل برق شهری، از شوک ولتاژ به برد الکترونیکی و سوختن رله استارت کمپرسور جلوگیری می‌کند.'
        ]
      }
    ],
    faqs: [
      {
        question: 'علت تخلیه نشدن آب ماشین لباسشویی چیست؟',
        answer:
          'در ۸۰ درصد موارد مسدود شدن فیلتر پمپ تخلیه با اجسام ریز یا تا خوردن شلنگ خروجی علت اصلی است. اگر فیلتر تمیز بود و همچنان آب تخلیه نشد، پمپ تخلیه نیاز به بررسی و تعویض توسط متخصص دارد.'
      },
      {
        question: 'چرا فریزر خنک می‌کند اما کابین یخچال گرم است؟',
        answer:
          'این مشکل معمولاً ناشی از خرابی فن اواپراتور، مسدود شدن دمپر (دریچه انتقال سرما از فریزر به یخچال) یا اختلال در سیستم برفک‌زدایی (المنت، ترمودیسک و سنسور دیفراست) است.'
      }
    ]
  },
  {
    id: 'art-4',
    slug: 'keratin-and-hair-revival-care-guide',
    title: 'راهنمای کامل کراتین، پروتئین‌تراپی و احیای مو؛ تفاوت روش‌ها و مراقبت‌های کلیدی پس از انجام',
    seoSubtitle: 'چگونه بهترین روش احیا و صافی مو را متناسب با جنس موی خود انتخاب کنیم و ماندگاری آن را تا یک سال افزایش دهیم؟',
    category: 'زیبایی و سلامت',
    readingTimeMin: 5,
    publishDateJalali: 'آبان ۱۴۰۴',
    author: 'تیم تخصصی زیبایی و سلامت تندیس',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85',
    keywords: ['کراتین و احیای مو', 'پروتئین تراپی مو', 'رزرو نوبت سالن زیبایی', 'مراقبت بعد از کراتین'],
    summary:
      'انتخاب درست بین کراتین، بوتاکس و پروتئین‌تراپی بر اساس میزان آسیب‌دیدگی مو و رعایت روتین شست‌وشوی بدون سولفات، راز داشتن موهایی ابریشمی، سالم و درخشان است.',
    keyTakeaways: [
      'کراتین تمرکز بیشتری بر صافی و رفع وزی مو دارد، در حالی که پروتئین‌تراپی و بوتاکس ساختار ساقه موی آسیب‌دیده را بازسازی می‌کنند.',
      'استفاده از شامپوهای فاقد سولفات و خشک کردن کامل مو با باد ملایم سشوار پس از هر بار استحمام برای ماندگاری کراتین ضروری است.',
      'مشاوره با متخصص زیبایی دارای مهارت چندگانه (احیا، کراتین و رنگ مو) از تداخل شیمیایی رنگ و مواد احیا جلوگیری می‌کند.'
    ],
    sections: [
      {
        heading: '۱. تفاوت کراتین، بوتاکس مو و پروتئین‌تراپی در چیست؟',
        paragraphs: [
          'ساقه مو به مرور زمان در اثر دکلره، رنگ‌های مکرر، حرارت اتو و سشوار و تابش آفتاب، پروتئین طبیعی خود (کراتین) را از دست داده و خشک، کدر و شکننده می‌شود. تشخیص اینکه موی شما به کدام تراپی نیاز دارد، اولین قدم مهم است:',
          'کراتین صافی بالا (۸۰ تا ۱۰۰ درصد) ایجاد می‌کند و برای موهای فر، ضخیم و بسیار وز ایده‌آل است. در مقابل، پروتئین‌تراپی و بوتاکس مو برای موهای نازک، کشسان یا آسیب‌دیده در اثر دکلره طراحی شده‌اند تا ابتدا پیوندهای داخلی مو را تقویت و آبرسانی کنند.'
        ]
      },
      {
        heading: '۲. اگر هم‌زمان قصد رنگ کردن و کراتین مو را داریم، کدام اولویت دارد؟',
        paragraphs: [
          'یکی از سوالات پرتکرار بانوان زمان‌بندی بین رنگ یا لایت مو و کراتین است. متخصصان زیبایی توصیه می‌کنند ابتدا فرآیند رنگ یا دکلره انجام شود و پس از ۱۰ تا ۱۴ روز استراحت مو، عمل کراتین یا پروتئین‌تراپی صورت گیرد تا فلس‌های بازشده مو در اثر رنگ، توسط مواد احیا بسته و تثبیت شوند.'
        ]
      },
      {
        heading: '۳. مراقبت‌های طلایی در خانه برای دو برابر کردن ماندگاری احیا و صافی',
        paragraphs: [
          'نیمی از نتیجه کراتین به مهارت متخصص و کیفیت مواد، و نیمی دیگر به مراقبت خانگی شما بستگی دارد:'
        ],
        bullets: [
          'استفاده انحصاری از شامپو و ماسک موی بدون سولفات و بدون سدیم کلراید',
          'خشک کردن ۱۰۰ درصدی ساقه مو با باد سشوار بلافاصله پس از حمام (باقی ماندن رطوبت روی موی کراتین‌شده دوام مواد را کاهش می‌دهد)',
          'بستن موها با کش‌های ابریشمی (اسکرانچی) بدون ایجاد شکستگی روی ساقه مو',
          'شستن موها با آب شیرین بلافاصله پس از استخر یا شنا در دریا'
        ]
      }
    ],
    faqs: [
      {
        question: 'ماندگاری کراتین و احیای مو چقدر است؟',
        answer:
          'در صورت استفاده از مواد اورجینال توسط متخصص حرفه‌ای و رعایت روتین شامپوی بدون سولفات و خشک کردن با سشوار، ماندگاری کراتین بین ۶ تا ۱۰ ماه و پروتئین‌تراپی بین ۳ تا ۵ ماه خواهد بود.'
      },
      {
        question: 'چگونه در تندیس متخصص زیبایی مناسب را انتخاب و نوبت رزرو کنیم؟',
        answer:
          'در بخش «زیبایی و سلامت» تندیس می‌توانید مستقیماً لیست متخصصان تاییدشده، مهارت‌های هر فرد (کراتین، آرایش مو، ناخن، فیشیال)، تعرفه شفاف و تقویم نوبت‌های آزاد را مشاهده و آنلاین رزرو کنید.'
      }
    ]
  },
  {
    id: 'art-5',
    slug: 'sofa-and-carpet-deep-cleaning-guide',
    title: 'اصول علمی مبل‌شویی در محل و نظافت تخصصی منزل؛ چگونه لکه‌های سرسخت را بدون آسیب به بافت پارچه پاک کنیم؟',
    seoSubtitle: 'بررسی مزایای شست‌وشوی مکانیزه مبلمان با دستگاه راگ‌واش و وکیوم صنعتی و ترفندهای حفظ طراوت فرش و پارچه',
    category: 'نظافت و منزل',
    readingTimeMin: 5,
    publishDateJalali: 'آبان ۱۴۰۴',
    author: 'واحد خدمات منزل تندیس',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85',
    keywords: ['مبل شویی در محل', 'نظافت منزل تندیس', 'پاک کردن لکه مبل', 'شستشوی تخصصی مبلمان'],
    summary:
      'شست‌وشوی سنتی مبلمان با ابر و آب فراوان باعث نفوذ رطوبت به فوم داخلی، پوسیدگی کلاف چوبی و باقی ماندن هاله لکه می‌شود؛ در حالی که مبل‌شویی مکانیزه با شامپو نانو و مکش هم‌زمان، چرک را از عمق پارچه خارج می‌کند.',
    keyTakeaways: [
      'استفاده از آب داغ یا سفیدکننده‌های اسیدی روی پارچه‌های مخمل، شانل و مازراتی باعث تثبیت دائمی لکه و تغییر رنگ الیاف می‌شود.',
      'دستگاه‌های مبل‌شویی صنعتی با پاشش فوم کنترل‌شده و وکیوم سه‌موتوره، بیش از ۹۰ درصد رطوبت و آلودگی را در لحظه مکش می‌کنند.',
      'مبل‌شویی تخصصی سالی یک الی دو بار، آلرژن‌ها و گردوغبار نفوذکرده در اسفنج مبل را کاملاً پاک‌سازی می‌کند.'
    ],
    sections: [
      {
        heading: '۱. چرا شست‌وشوی دستی مبلمان در خانه نتیجه معکوس می‌دهد؟',
        paragraphs: [
          'زمانی که با دستمال خیس و شوینده خانگی روی لکه مبل می‌کشید، آلودگی به جای خارج شدن از پارچه، به لایه‌های زیرین و فوم مبل نفوذ می‌کند. پس از خشک شدن سطح پارچه، رطوبت محبوس در اسفنج دوباره به سمت بالا تبخیر شده و هاله‌ای زرد یا تیره و بزرگ‌تر از لکه اولیه روی مبل باقی می‌گذارد.',
          'علاوه بر این، خیس ماندن طولانی‌مدت فوم داخلی مبل محیطی مناسب برای رشد قارچ و ایجاد بوی نم ناخوشایند در فضای پذیرایی فراهم می‌سازد.'
        ]
      },
      {
        heading: '۲. مبل‌شویی مکانیزه در محل چگونه بدون ریزش آب انجام می‌شود؟',
        paragraphs: [
          'متخصصان مبل‌شویی تندیس با استفاده از دستگاه فرچه‌زن دور متغیر (متناسب با لطافت پارچه) و شامپوهای نانوی لکه‌بر، ابتدا آلودگی‌ها را به صورت کف غلیظ از بافت الیاف جدا می‌کنند. بلافاصله در مرحله دوم، دستگاه وکیوم صنعتی تمام کف، چرک و رطوبت را از عمق پارچه بیرون می‌کشد:'
        ],
        bullets: [
          'عدم ریزش آب و کثیفی روی فرش یا پارکت منزل در حین شست‌وشو',
          'خشک شدن کامل مبلمان تنها در ۳ الی ۴ ساعت پس از اتمام کار',
          'حفظ نرمی، خواب طبیعی و درخشندگی رنگ پارچه‌های حساس، تشک خوشخواب و صندلی ناهارخوری'
        ]
      },
      {
        heading: '۳. اقدام فوری هنگام ریختن چای، قهوه یا چربی روی مبل',
        paragraphs: [
          'در دقایق اول ریختن مایعات روی مبل، هرگز دستمال را روی پارچه نکشید! فقط یک دستمال کاغذی حوله‌ای سفید را به آرامی روی محل قرار دهید تا مایع اضافی جذب شود، سپس برای لکه‌بری اصولی از شوینده استاندارد یا سرویس مبل‌شویی در محل کمک بگیرید.'
        ]
      }
    ],
    faqs: [
      {
        question: 'شست‌وشوی یک دست مبلمان ۷ نفره در منزل چقدر زمان می‌برد؟',
        answer:
          'شست‌وشو و لکه‌گیری کامل یک ست مبلمان ۷ نفره به همراه کوسن‌ها با دستگاه مکانیزه معمولاً بین ۶۰ تا ۹۰ دقیقه زمان می‌برد و بدون نیاز به جابه‌جایی مبلمان انجام می‌شود.'
      },
      {
        question: 'آیا امکان شست‌وشوی تشک خوشخواب در محل نیز وجود دارد؟',
        answer:
          'بله، شست‌وشو و ضدعفونی هر دو طرف تشک خوشخواب یک‌نفره و دونفره با همان دستگاه وکیوم صنعتی و مواد ضدحساسیت در محل منزل انجام می‌گیرد.'
      }
    ]
  }
];

export const NewsArticlesView: React.FC<{
  dark: boolean;
  onNavigateHome: () => void;
  onOrderServiceClick?: () => void;
}> = ({ dark, onNavigateHome, onOrderServiceClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('همه مقالات');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  const cardCls = dark
    ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]'
    : 'bg-white border-[#e2efef] text-[#12292c]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  const categories = ['همه مقالات', 'فنی و لوازم خانگی', 'امداد و خودرو', 'زیبایی و سلامت', 'نظافت و منزل'];

  const filteredArticles =
    selectedCategory === 'همه مقالات'
      ? EDUCATIONAL_SEO_ARTICLES
      : EDUCATIONAL_SEO_ARTICLES.filter((a) => a.category === selectedCategory);

  const activeArticle = activeArticleId
    ? EDUCATIONAL_SEO_ARTICLES.find((a) => a.id === activeArticleId) || null
    : null;

  if (activeArticle) {
    return (
      <article className="max-w-4xl mx-auto py-4 space-y-6">
        {/* نوار بازگشت و مسیر مقاله */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveArticleId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#dcecec] hover:border-[#0a8387] text-xs font-extrabold text-[#0b5c60] transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فهرست مقالات آموزشی</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#5f777b] font-bold">
            <span className="px-3 py-1 rounded-xl bg-[#effcfb] text-[#0b5c60] border border-[#c5ecea] font-extrabold">
              {activeArticle.category}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0a8387]" />
              {toPersianDigits(activeArticle.readingTimeMin)} دقیقه مطالعه
            </span>
          </div>
        </div>

        {/* بدنه اصلی مقاله با طراحی مینیمال و خوانایی بالا */}
        <div className={`rounded-3xl border overflow-hidden shadow-xs ${cardCls}`}>
          <div className="relative h-60 sm:h-88 w-full overflow-hidden bg-[#0b5c60]/10">
            <img
              src={activeArticle.coverImage}
              alt={activeArticle.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#091e20]/80 via-[#091e20]/25 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 sm:bottom-6 sm:right-7 sm:left-7 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/90">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#0a8387] text-white font-extrabold">
                  {activeArticle.category}
                </span>
                <span>•</span>
                <span>{activeArticle.publishDateJalali}</span>
                <span>•</span>
                <span>{activeArticle.author}</span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black leading-snug">
                {activeArticle.title}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10 space-y-8">
            {/* خلاصه سئو و مقدمه مقاله */}
            <p className="text-sm sm:text-base font-bold leading-8 text-[#0b5c60] bg-[#f4fbfb] border-r-4 border-[#0a8387] p-4 sm:p-5 rounded-2xl">
              {activeArticle.summary}
            </p>

            {/* نکات کلیدی در یک نگاه */}
            <div className="rounded-2xl bg-[#fbfefe] border border-[#dcecec] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#12292c]">
                <Sparkles className="w-4 h-4 text-[#0a8387]" />
                <span>آنچه در این مقاله آموزشی می‌خوانید:</span>
              </div>
              <ul className="space-y-2">
                {activeArticle.keyTakeaways.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-7 text-[#284246]">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8387] shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* بخش‌های محتوایی مقاله */}
            <div className="space-y-7">
              {activeArticle.sections.map((sec, idx) => (
                <section key={idx} className="space-y-3.5">
                  <h2 className="text-base sm:text-xl font-black text-[#12292c] flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-[#0a8387] shrink-0" />
                    <span>{sec.heading}</span>
                  </h2>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className={`text-xs sm:text-[15px] leading-8 text-justify ${mutedCls}`}>
                      {p}
                    </p>
                  ))}
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-2 pr-2 pt-1">
                      {sec.bullets.map((b, bIdx) => (
                        <li
                          key={bIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm leading-7 text-[#1f3b3f] font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0a8387] mt-2.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {/* پرسش‌های متداول (سئو) */}
            <div className="pt-4 border-t border-[#e8f2f2] space-y-4">
              <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                پرسش‌های متداول کاربران
              </h2>
              <div className="space-y-3">
                {activeArticle.faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="rounded-2xl bg-[#f7fbfb] border border-[#e0eeee] p-4 space-y-1.5"
                  >
                    <h3 className="text-xs sm:text-sm font-black text-[#0b5c60]">
                      {faq.question}
                    </h3>
                    <p className={`text-xs sm:text-sm leading-7 ${mutedCls}`}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* برچسب‌های سئو و دعوت به اقدام */}
            <div className="pt-4 border-t border-[#e8f2f2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0a8387] ml-1" />
                {activeArticle.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-xl bg-[#f2f9f9] text-[#4a666a] border border-[#dcecec] text-[11px] font-bold"
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onOrderServiceClick && (
                  <button
                    type="button"
                    onClick={onOrderServiceClick}
                    className="px-5 py-2.5 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs font-black cursor-pointer transition-colors"
                  >
                    ثبت درخواست متخصص
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveArticleId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] text-xs font-extrabold cursor-pointer transition-colors"
                >
                  سایر مقالات
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      {/* هدر مینیمال مجله آموزشی تندیس */}
      <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xs ${cardCls}`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#effcfb] text-[#0b5c60] border border-[#c5ecea] text-xs font-black">
            <BookOpen className="w-3.5 h-3.5" />
            <span>مجله آموزشی و تخصصی تندیس</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#12292c]">
            مقالات آموزشی، راهنمای نگهداری و اخبار تندیس
          </h1>
          <p className={`text-xs sm:text-sm leading-7 max-w-2xl ${mutedCls}`}>
            راهنمای علمی و کاربردی نگهداری لوازم خانگی، سرویس دوره‌ای خودرو، مراقبت‌های زیبایی و سلامت و نکات تخصصی خدمات منزل؛ تدوین‌شده توسط کارشناسان رسمی تندیس.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          className="self-start md:self-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#f2f9f9] hover:bg-[#e3f3f3] border border-[#cde6e6] text-[#0b5c60] text-xs font-extrabold cursor-pointer transition-colors shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
          <span>صفحه اصلی</span>
        </button>
      </div>

      {/* فیلتر دسته‌بندی مقالات */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap border transition-all cursor-pointer ${
                active
                  ? 'bg-[#0b5c60] text-white border-[#0b5c60] shadow-2xs'
                  : 'bg-white text-[#4a666a] border-[#dcecec] hover:border-[#0a8387]/50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* کارت مقاله ویژه (مقاله اول) */}
      {filteredArticles.length > 0 && (
        <div
          onClick={() => {
            setActiveArticleId(filteredArticles[0].id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setActiveArticleId(filteredArticles[0].id);
          }}
          className={`group rounded-3xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xs hover:shadow-[0_14px_34px_rgba(11,92,96,0.1)] transition-all cursor-pointer ${cardCls}`}
        >
          <div className="lg:col-span-6 h-56 sm:h-72 lg:h-auto overflow-hidden bg-[#0b5c60]/10">
            <img
              src={filteredArticles[0].coverImage}
              alt={filteredArticles[0].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#5f777b]">
                <span className="px-3 py-1 rounded-xl bg-[#effcfb] text-[#0b5c60] border border-[#c5ecea] font-extrabold">
                  {filteredArticles[0].category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0a8387]" />
                  {toPersianDigits(filteredArticles[0].readingTimeMin)} دقیقه مطالعه
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0a8387]" />
                  {filteredArticles[0].publishDateJalali}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black leading-8 text-[#12292c] group-hover:text-[#0b5c60] transition-colors">
                {filteredArticles[0].title}
              </h2>

              <p className={`text-xs sm:text-sm leading-7 line-clamp-3 ${mutedCls}`}>
                {filteredArticles[0].summary}
              </p>
            </div>

            <div className="pt-3 border-t border-[#eef5f5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#5f777b]">{filteredArticles[0].author}</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#0b5c60] group-hover:translate-x-[-3px] transition-transform">
                <span>مطالعه کامل مقاله</span>
                <ChevronLeft className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* شبکه سایر مقالات آموزشی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredArticles.slice(1).map((article) => (
          <div
            key={article.id}
            onClick={() => {
              setActiveArticleId(article.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setActiveArticleId(article.id);
            }}
            className={`group rounded-3xl border overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-[0_14px_30px_rgba(11,92,96,0.09)] transition-all cursor-pointer ${cardCls}`}
          >
            <div>
              <div className="relative h-52 w-full overflow-hidden bg-[#0b5c60]/10">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-xs text-[#0b5c60] text-[11px] font-extrabold shadow-xs">
                  {article.category}
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#5f777b]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0a8387]" />
                    {toPersianDigits(article.readingTimeMin)} دقیقه مطالعه
                  </span>
                  <span>•</span>
                  <span>{article.publishDateJalali}</span>
                </div>

                <h3 className="text-base sm:text-lg font-black leading-7 text-[#12292c] group-hover:text-[#0b5c60] transition-colors">
                  {article.title}
                </h3>

                <p className={`text-xs leading-6 line-clamp-3 ${mutedCls}`}>
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#eef5f5] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5f777b]">{article.author}</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#0b5c60] group-hover:translate-x-[-3px] transition-transform">
                <span>مطالعه مقاله</span>
                <ChevronLeft className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NotificationsModal: React.FC<{
  open: boolean;
  dark: boolean;
  notifications: AppNotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkOneRead?: (id: string) => void;
  onClearAll: () => void;
}> = ({ open, dark, notifications, onClose, onMarkAllRead, onMarkOneRead, onClearAll }) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ADMIN' | 'ACTIVITY'>('ALL');
  if (!open) return null;

  const panelCls = dark
    ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]'
    : 'bg-white text-[#12292c] border-[#E2EFEF]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#5f777b]';

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const visibleNotifications = notifications.filter((n) => {
    if (filterTab === 'ADMIN') return n.senderRole === 'ADMIN' || n.type === 'ADMIN';
    if (filterTab === 'ACTIVITY') return n.senderRole !== 'ADMIN' && n.type !== 'ADMIN';
    return true;
  });

  const formatNotifTime = (epoch: number) => {
    if (!epoch) return 'هم‌اکنون';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(epoch));
    } catch {
      return 'امروز';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[82vh] ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div className="flex items-center gap-2 font-black text-base sm:text-lg">
            <Bell className="w-5 h-5 text-[#0a8387]" />
            مرکز اعلان‌ها و پیام‌های سیستم
          </div>
          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  disabled={unreadCount === 0}
                  onClick={onMarkAllRead}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    unreadCount > 0
                      ? 'bg-[#effcfb] hover:bg-[#ddf7f5] text-[#0b5c60] cursor-pointer'
                      : 'bg-[#f4f7f7] text-[#90a6a8] cursor-default'
                  }`}
                  title="خوانده شدن همه اعلان‌ها"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {unreadCount > 0 ? 'خوانده شدن همه' : 'همه خوانده شد'}
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 cursor-pointer"
                  title="پاک‌سازی اعلان‌ها"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 cursor-pointer"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-3 pb-1 flex items-center gap-2 border-b border-[#f0f7f7]">
          {[
            { id: 'ALL' as const, label: 'همه اعلان‌ها' },
            { id: 'ADMIN' as const, label: 'پیام‌های مدیریت' },
            { id: 'ACTIVITY' as const, label: 'فعالیت‌های من' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer mb-2 ${
                filterTab === tab.id
                  ? 'bg-[#0a8387] text-white'
                  : 'bg-[#f4fafa] text-[#527371] hover:bg-[#e7f4f4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {visibleNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-10 h-10 text-[#0a8387]/35 mx-auto" />
              <div className="text-sm font-bold">اعلان جدیدی وجود ندارد</div>
              <p className={`text-xs ${mutedCls}`}>
                تمامی فعالیت‌های شما در سایت و پیام‌های ارسالی از سامانه «تندیس مدیریت» در این بخش نمایش داده می‌شوند.
              </p>
            </div>
          ) : (
            visibleNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead && onMarkOneRead) onMarkOneRead(n.id);
                }}
                role={!n.isRead && onMarkOneRead ? 'button' : undefined}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  !n.isRead
                    ? 'bg-[#effcfb] dark:bg-[#0a8387]/15 border-[#0a8387]/35 cursor-pointer hover:border-[#0a8387]/60'
                    : 'bg-[#fcfefe] dark:bg-[#1E2D40]/40 border-[#e5f0f0] dark:border-[#26384E]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#0a8387]" />}
                    <span className="font-black text-xs sm:text-sm">{n.title}</span>
                    {n.senderRole === 'ADMIN' && (
                      <span className="px-2 py-0.5 rounded-md bg-[#0a8387] text-white text-[10px] font-black">
                        پیام مدیریت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && onMarkOneRead && (
                      <span className="text-[10px] font-extrabold text-[#0a8387]">خواندن</span>
                    )}
                    <span className={`text-[10px] font-bold ${mutedCls}`}>
                      {formatNotifTime(n.createdAtEpoch)}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-6 opacity-90">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const SupportTicketsModal: React.FC<{
  open: boolean;
  dark: boolean;
  tickets: SupportTicket[];
  onClose: () => void;
  onSubmitTicket: (subject: string, message: string) => Promise<void>;
}> = ({ open, dark, tickets, onClose, onSubmitTicket }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div className="flex items-center gap-2 font-black text-lg">
            <Headphones className="w-5 h-5 text-[#10B981]" />
            پشتیبانی برخط ۲۴ ساعته تندیس
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-3">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع پیام یا تیکت..."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="متن پیام شما مستقیم به نرم‌افزار تندیس مدیریت ارسال می‌شود..."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <button
              disabled={sending || !subject.trim() || !message.trim()}
              onClick={async () => {
                setSending(true);
                try {
                  await onSubmitTicket(subject.trim(), message.trim());
                  setSubject('');
                  setMessage('');
                } finally {
                  setSending(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3 font-extrabold text-sm cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {sending ? 'در حال ارسال به پنل مدیریت...' : 'ارسال پیام به پشتیبانی و مدیریت'}
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold opacity-75">پیام‌ها و تیکت‌های ثبت‌شده شما ({toPersianDigits(tickets.length)})</div>
            {tickets.length === 0 ? (
              <div className="text-center py-6 text-xs opacity-60">هنوز پیامی ثبت نشده است.</div>
            ) : (
              tickets.map((t, idx) => {
                const bodyText =
                  t.message ||
                  t.initial_message ||
                  (t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1].text : '');
                const isAnswered =
                  Boolean(t.admin_reply) ||
                  ['RESOLVED', 'ANSWERED', 'CLOSED'].includes(String(t.status || '').toUpperCase());

                return (
                  <div
                    key={t.id || t.ticket_id || idx}
                    className="p-3.5 rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{t.subject}</span>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                          isAnswered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isAnswered ? 'پاسخ داده‌شده' : 'در حال بررسی مدیریت'}
                      </span>
                    </div>
                    {bodyText && <p className="text-xs opacity-85 leading-5">{bodyText}</p>}
                    {t.admin_reply && (
                      <div className="p-2.5 rounded-xl bg-[#effcfb] dark:bg-[#0a8387]/20 border border-[#c5ecea] text-xs space-y-0.5">
                        <div className="font-black text-[#0b5c60] dark:text-[#2dd4bf]">پاسخ مدیریت تندیس:</div>
                        <div className="leading-5">{t.admin_reply}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RatingDialog: React.FC<{
  request: ServiceRequestItem | null;
  dark: boolean;
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => Promise<void>;
}> = ({ request, dark, onClose, onSubmit }) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (!request) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-5 space-y-4 ${panelCls}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base">ثبت امتیاز و نظر برای متخصص</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs opacity-80">
          خدمت: <span className="font-bold">{toPurePersianText(request.service_title)}</span> — متخصص:{' '}
          <span className="font-bold">{toPurePersianText(request.assigned_specialist_name) || 'متخصص تندیس'}</span>
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setStars(num)}
              className="p-1.5 cursor-pointer transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  num <= stars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="تجربه خود را از کیفیت کار، خوش‌قولی و برخورد متخصص بنویسید..."
          className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${inputCls}`}
        />

        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSubmit(stars, comment.trim() || 'رضایت کامل از انجام خدمت');
              } finally {
                setSaving(false);
              }
            }}
            className="flex-1 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white py-3 font-extrabold text-xs cursor-pointer"
          >
            {saving ? 'در حال ثبت امتیاز...' : `ثبت امتیاز ${toPersianDigits(stars)} ستاره`}
          </button>
          <button
            onClick={onClose}
            className="px-4 rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] text-xs font-bold cursor-pointer"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};
