import React, { useState } from 'react';
import {
  Bell,
  Briefcase,
  CheckCheck,
  CheckCircle2,
  Headphones,
  Info,
  MapPin,
  MessageSquarePlus,
  Newspaper,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
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

export const NewsArticlesView: React.FC<{
  dark: boolean;
  onNavigateHome: () => void;
}> = ({ dark, onNavigateHome }) => {
  const cardCls = dark
    ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]'
    : 'bg-white border-[#E2EFEF] text-[#12292c]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className={`rounded-3xl border p-8 sm:p-12 text-center space-y-5 shadow-sm ${cardCls}`}>
        <div className="w-16 h-16 rounded-2xl bg-[#effcfb] border border-[#c5ecea] text-[#0a8387] flex items-center justify-center mx-auto">
          <Newspaper className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
          به‌زودی
        </div>
        <h1 className="text-xl sm:text-2xl font-black">بخش اخبار، مقالات و مجله تخصصی تندیس</h1>
        <p className={`text-xs sm:text-sm leading-7 max-w-xl mx-auto ${mutedCls}`}>
          مجله آموزشی، راهنمای نگهداری لوازم خانگی و خودرو، اطلاعیه‌های رسمی و اخبار سامانه هوشمند تندیس به‌زودی در این بخش منتشر خواهد شد.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-6 py-3 rounded-2xl bg-[#0a8387] hover:bg-[#086d70] text-white text-xs font-black cursor-pointer transition-colors"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
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
  onClearAll: () => void;
}> = ({ open, dark, notifications, onClose, onMarkAllRead, onClearAll }) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ADMIN' | 'ACTIVITY'>('ALL');
  if (!open) return null;

  const panelCls = dark
    ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]'
    : 'bg-white text-[#12292c] border-[#E2EFEF]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#5f777b]';

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
                  onClick={onMarkAllRead}
                  className="px-2.5 py-1.5 rounded-xl bg-[#effcfb] text-[#0b5c60] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="خوانده‌شدن همه"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  خوانده شد
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
                className={`p-3.5 rounded-2xl border transition-colors ${
                  !n.isRead
                    ? 'bg-[#effcfb] dark:bg-[#0a8387]/15 border-[#0a8387]/35'
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
                  <span className={`text-[10px] font-bold ${mutedCls}`}>
                    {formatNotifTime(n.createdAtEpoch)}
                  </span>
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
