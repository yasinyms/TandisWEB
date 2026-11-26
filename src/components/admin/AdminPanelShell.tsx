import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  FileCheck2,
  Globe,
  Image as ImageIcon,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Percent,
  PhoneCall,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  X,
  BarChart3
} from 'lucide-react';
import {
  type AdminLiveAlert,
  type AdminLiveState,
  type AdminModuleId,
  type AdminUserSession,
  adminLogin,
  clearAdminToken,
  fetchAdminLiveState,
  formatPersianDateTime,
  getAdminUserSession
} from '../../services/adminApi';
import { toPersianDigits } from '../../services/tandisDefaults';
import {
  AdminCustomersOrdersView,
  AdminDashboardView,
  AdminPhoneOrderView,
  AdminSpecialistsView
} from './AdminDashboardAndOps';
import {
  AdminBeautyView,
  AdminCategoriesView,
  AdminFinanceView,
  AdminLoansView,
  AdminSettlementsView
} from './AdminCatalogBeautyFinance';
import {
  AdminAiContentView,
  AdminExpertsView,
  AdminNotificationsView,
  AdminSeoView,
  AdminSlidersView,
  AdminTicketsView,
  AdminVisitorsAnalyticsView,
  AdminViolationsView
} from './AdminCommsAndSystem';

interface AdminPanelShellProps {
  onBackToSite: () => void;
}

interface SidebarNavItem {
  id: AdminModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: (state: AdminLiveState) => number;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { id: 'dashboard', label: 'پیشخوان مدیریتی', icon: LayoutDashboard },
  { id: 'customers_orders', label: 'مشتریان و سفارش‌ها', icon: Users },
  { id: 'phone_order', label: 'ثبت درخواست تلفنی', icon: PhoneCall },
  {
    id: 'specialists',
    label: 'متخصصین و مدارک',
    icon: UserCheck,
    badge: (s) => s.stats.specialistsPending
  },
  { id: 'categories', label: 'دسته‌بندی‌ها و خدمات', icon: Layers },
  {
    id: 'beauty',
    label: 'زیبایی و سلامت',
    icon: Sparkles,
    badge: (s) => s.stats.pendingBeautyPricesCount
  },
  {
    id: 'loans',
    label: 'وام و اعتبار تندیس‌پی',
    icon: CreditCard,
    badge: (s) => s.stats.pendingLoansCount
  },
  {
    id: 'settlements',
    label: 'تسویه حساب متخصصین',
    icon: Landmark,
    badge: (s) => s.stats.pendingSettlementsCount
  },
  { id: 'finance', label: 'گزارش مالی و کمیسیون', icon: Percent },
  { id: 'notifications', label: 'ارسال پیام و اعلان‌ها', icon: Bell },
  {
    id: 'tickets',
    label: 'تیکت‌ها و پشتیبانی',
    icon: MessageSquare,
    badge: (s) => s.stats.openTicketsCount
  },
  { id: 'sliders', label: 'اسلایدر و بنرها', icon: ImageIcon },
  { id: 'seo', label: 'سئو و ثبت در گوگل', icon: Globe },
  { id: 'ai_content', label: 'هوش مصنوعی تولید محتوا', icon: Sparkles },
  { id: 'visitors', label: 'گزارش بازدیدها و ترافیک', icon: BarChart3 },
  {
    id: 'violations',
    label: 'شکایات و تخلفات',
    icon: AlertTriangle,
    badge: (s) => s.stats.openViolationsCount
  },
  { id: 'experts', label: 'مدیریت کارشناسان', icon: Shield }
];

const ALERT_CATEGORY_TABS: Array<{
  id: 'ALL' | AdminLiveAlert['category'];
  label: string;
}> = [
  { id: 'ALL', label: 'همه' },
  { id: 'TICKETS', label: 'پیام‌ها و تیکت‌ها' },
  { id: 'DOCS', label: 'تایید مدارک' },
  { id: 'VIOLATIONS', label: 'تخلفات' },
  { id: 'SETTLEMENTS', label: 'تسویه حساب' },
  { id: 'LOANS', label: 'تندیس پی' },
  { id: 'BEAUTY', label: 'زیبایی و سلامت' }
];

const TANDIS_LOGO = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';

export const AdminPanelShell: React.FC<AdminPanelShellProps> = ({ onBackToSite }) => {
  const [session, setSession] = useState<AdminUserSession | null>(() => getAdminUserSession());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [liveState, setLiveState] = useState<AdminLiveState | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [activeModule, setActiveModule] = useState<AdminModuleId>('dashboard');
  const [globalQuery, setGlobalQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [alertCategoryFilter, setAlertCategoryFilter] = useState<'ALL' | AdminLiveAlert['category']>('ALL');
  const [toastMsg, setToastMsg] = useState('');

  const toastTimerRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(''), 4200);
  }, []);

  const handleLogout = useCallback(
    (reason?: string) => {
      clearAdminToken();
      setSession(null);
      setLiveState(null);
      setAlertsDrawerOpen(false);
      setMobileMenuOpen(false);
      setGlobalQuery('');
      if (reason) setLoginError(reason);
    },
    []
  );

  const syncLiveState = useCallback(
    async (isManual = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (isManual) setSyncingNow(true);
      try {
        const res = await fetchAdminLiveState();
        setLiveState(res);
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (message.includes('منقضی') || message.includes('نامعتبر')) {
          handleLogout();
        } else if (isManual) {
          showToast(message || 'بروزرسانی با خطا مواجه شد.');
        }
      } finally {
        isFetchingRef.current = false;
        setLoadingInitial(false);
        if (isManual) setSyncingNow(false);
      }
    },
    [handleLogout, showToast]
  );

  // همگام‌سازی زنده هر ۷ ثانیه پس از ورود موفق
  useEffect(() => {
    if (!session) return;
    setLoadingInitial(true);
    syncLiveState(false);
    const interval = window.setInterval(() => {
      syncLiveState(false);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [session, syncLiveState]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password) {
      setLoginError('نام کاربری و رمز عبور را وارد کنید.');
      return;
    }
    setLoggingIn(true);
    try {
      const { user } = await adminLogin(username.trim(), password);
      setSession(user);
      setActiveModule(user.allowedModules[0] || 'dashboard');
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'ورود ناموفق بود.');
    } finally {
      setLoggingIn(false);
    }
  };

  const allowedNavItems = useMemo(() => {
    if (!session) return [];
    return SIDEBAR_ITEMS.filter((item) => session.allowedModules.includes(item.id));
  }, [session]);

  const activeNavMeta = useMemo(
    () => allowedNavItems.find((i) => i.id === activeModule) || allowedNavItems[0],
    [allowedNavItems, activeModule]
  );

  const visibleAlerts = useMemo(() => {
    if (!liveState || !session) return [];
    const allowedSet = new Set(session.allowedModules);
    return liveState.liveAlerts.filter((al) => {
      if (!allowedSet.has(al.targetModule)) return false;
      if (alertCategoryFilter !== 'ALL' && al.category !== alertCategoryFilter) return false;
      return true;
    });
  }, [liveState, session, alertCategoryFilter]);

  const totalAllowedAlertsCount = useMemo(() => {
    if (!liveState || !session) return 0;
    const allowedSet = new Set(session.allowedModules);
    return liveState.liveAlerts.filter((al) => allowedSet.has(al.targetModule)).length;
  }, [liveState, session]);

  const handleNavigateModule = useCallback(
    (mod: AdminModuleId) => {
      if (session && session.allowedModules.includes(mod)) {
        setActiveModule(mod);
        setMobileMenuOpen(false);
      }
    },
    [session]
  );

  // ==================== صفحه ورود اختصاصی مدیریت و کارشناسان ====================
  if (!session) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-[#0b3d2f] via-[#0E4D3B] to-[#146C53] flex flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-[#0E4D3B] px-6 py-7 text-center space-y-3 relative">
            <button
              type="button"
              onClick={onBackToSite}
              className="absolute top-4 right-4 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-[11px] font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>بازگشت به سایت</span>
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-white p-1.5 shadow-lg">
              <img
                src={TANDIS_LOGO}
                alt="لوگوی رسمی تندیس"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">پنل یکپارچه مدیریت و کارشناسان تندیس</h1>
              <p className="text-xs text-emerald-100/90 mt-1">
                ورود امن کارشناسان مجاز و اتصال زنده به سرور مرکزی تندیس
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-bold text-rose-700">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">نام کاربری کارشناس</label>
              <input
                type="text"
                dir="ltr"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3.5 py-2.5 text-sm text-left font-bold text-[#12292c] focus:outline-none focus:border-[#0E4D3B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] pl-10 pr-3.5 py-2.5 text-sm text-left font-bold text-[#12292c] focus:outline-none focus:border-[#0E4D3B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d7671] hover:text-[#0E4D3B] cursor-pointer"
                  aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] disabled:opacity-60 text-white py-3 text-xs font-black flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors shadow-sm"
            >
              <Lock className="w-4 h-4 text-[#f2a900]" />
              <span>{loggingIn ? 'در حال بررسی اعتبار...' : 'ورود به میز کار مدیریت'}</span>
            </button>

            <div className="pt-2 border-t border-[#edf4f1] text-center text-[11px] text-[#5d7671] leading-relaxed">
              تمامی دسترسی‌ها بر اساس نقش سازمانی کارشناس توسط سرور مرکزی کنترل می‌شود.
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==================== میز کار کامل ۱۴ بخشی مدیریت و کارشناسان ====================
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f8f6] text-[#12292c] flex">
      {/* اعلان شناور بازخورد */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] rounded-2xl bg-[#0E4D3B] text-white px-5 py-3 text-xs font-extrabold shadow-xl border border-white/15 flex items-center gap-2 max-w-[92vw]">
          <CheckCircle2 className="w-4 h-4 text-[#f2a900] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* پس‌زمینه موبایل برای منوی کناری */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
        />
      )}

      {/* منوی کناری راست (۲۶۰ پیکسل، فیلترشده بر اساس نقش کارشناس) */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-[264px] shrink-0 bg-[#0E4D3B] text-white flex flex-col transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 overflow-hidden">
              <img
                src={TANDIS_LOGO}
                alt="لوگوی تندیس"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate">مدیریت یکپارچه تندیس</div>
              <div className="text-[10px] text-emerald-200 truncate">{session.roleTitle}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* کارت اطلاعات کارشناس واردشده */}
        <div className="mx-3 mt-3 rounded-xl bg-white/10 px-3 py-2.5 space-y-0.5">
          <div className="text-xs font-black truncate">{session.displayName}</div>
          <div className="text-[11px] text-emerald-200/90 flex items-center justify-between gap-2">
            <span>{session.roleTitle}</span>
            <span className="tabular-nums opacity-85" dir="ltr">
              {session.username}
            </span>
          </div>
        </div>

        {/* فهرست ماژول‌های مجاز */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            const count = liveState && item.badge ? item.badge(liveState) : 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateModule(item.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-xs font-extrabold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#0E4D3B] shadow-xs'
                    : 'text-emerald-50/90 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D97706]' : 'text-emerald-200'}`} />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </span>
                {count > 0 && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums whitespace-nowrap ${
                      active ? 'bg-[#D97706] text-white' : 'bg-[#D97706] text-white'
                    }`}
                  >
                    {toPersianDigits(count)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* دکمه‌های پایین منو */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به وب‌سایت تندیس</span>
          </button>
          <button
            type="button"
            onClick={() => handleLogout()}
            className="w-full rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 px-3 py-2 text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج امن از حساب</span>
          </button>
        </div>
      </aside>

      {/* ستون محتوای اصلی */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* نوار بالایی */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#dfece8] px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-xl border border-[#d6e5e0] p-2 text-[#0E4D3B] cursor-pointer"
              aria-label="باز کردن منو"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-[#12292c] truncate">
                {activeNavMeta?.label || 'پیشخوان مدیریتی'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0E4D3B] mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    liveState?.online !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="truncate">
                  {liveState?.online !== false
                    ? 'متصل به سرور مرکزی تندیس • همگام‌سازی زنده فعال'
                    : 'در حال برقراری مجدد اتصال با سرور مرکزی تندیس'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
            {/* نوار جستجوی سریع سراسری */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="w-4 h-4 text-[#6c857f] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="جستجوی سریع نام، موبایل، سفارش..."
                className="w-full rounded-xl border border-[#d6e5e0] bg-[#f8fbfa] pr-9 pl-8 py-2 text-xs font-bold text-[#12292c] focus:outline-none focus:border-[#0E4D3B]"
              />
              {globalQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6c857f] hover:text-[#12292c] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* دکمه همگام‌سازی دستی */}
            <button
              type="button"
              onClick={() => syncLiveState(true)}
              className="rounded-xl border border-[#d6e5e0] hover:border-[#0E4D3B] bg-white p-2 text-[#0E4D3B] cursor-pointer shrink-0"
              title="بروزرسانی فوری داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${syncingNow ? 'animate-spin' : ''}`} />
            </button>

            {/* دکمه کشوی هشدارهای زنده */}
            <button
              type="button"
              onClick={() => setAlertsDrawerOpen(true)}
              className="relative rounded-xl border border-[#d6e5e0] hover:border-[#0E4D3B] bg-white px-3 py-2 text-xs font-extrabold text-[#12292c] flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Bell className="w-4 h-4 text-[#D97706]" />
              <span className="hidden sm:inline">هشدارهای زنده</span>
              {totalAllowedAlertsCount > 0 && (
                <span className="rounded-md bg-rose-600 text-white px-1.5 py-0.5 text-[10px] font-black tabular-nums">
                  {toPersianDigits(totalAllowedAlertsCount)}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* بدنه ماژول فعال */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          {loadingInitial || !liveState ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white border border-[#dfece8]" />
                ))}
              </div>
              <div className="h-80 rounded-2xl bg-white border border-[#dfece8]" />
            </div>
          ) : (
            <>
              {activeModule === 'dashboard' && (
                <AdminDashboardView
                  data={liveState}
                  user={session}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                  onNavigateModule={handleNavigateModule}
                />
              )}
              {activeModule === 'customers_orders' && (
                <AdminCustomersOrdersView
                  data={liveState}
                  user={session}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                  onNavigateModule={handleNavigateModule}
                />
              )}
              {activeModule === 'phone_order' && (
                <AdminPhoneOrderView
                  data={liveState}
                  user={session}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                  onNavigateModule={handleNavigateModule}
                />
              )}
              {activeModule === 'specialists' && (
                <AdminSpecialistsView
                  data={liveState}
                  user={session}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                  onNavigateModule={handleNavigateModule}
                />
              )}
              {activeModule === 'categories' && (
                <AdminCategoriesView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'beauty' && (
                <AdminBeautyView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'loans' && (
                <AdminLoansView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'settlements' && (
                <AdminSettlementsView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'finance' && (
                <AdminFinanceView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'notifications' && (
                <AdminNotificationsView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'tickets' && (
                <AdminTicketsView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'sliders' && (
                <AdminSlidersView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'seo' && (
                <AdminSeoView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'ai_content' && (
                <AdminAiContentView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'visitors' && (
                <AdminVisitorsAnalyticsView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'violations' && (
                <AdminViolationsView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
              {activeModule === 'experts' && (
                <AdminExpertsView
                  data={liveState}
                  globalQuery={globalQuery}
                  onRefresh={() => syncLiveState(true)}
                  onToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* کشوی هشدارهای زنده عملیاتی */}
      {alertsDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/45">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#edf4f1] flex items-center justify-between gap-2 bg-[#0E4D3B] text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#f2a900]" />
                <div>
                  <h3 className="text-sm font-black">مرکز هشدارهای زنده سامانه</h3>
                  <p className="text-[11px] text-emerald-100 tabular-nums">
                    {toPersianDigits(totalAllowedAlertsCount)} مورد نیازمند رسیدگی فوری
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-[#edf4f1] flex flex-wrap gap-1.5 bg-[#f8fbfa]">
              {ALERT_CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAlertCategoryFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap cursor-pointer ${
                    alertCategoryFilter === tab.id
                      ? 'bg-[#0E4D3B] text-white'
                      : 'bg-white border border-[#dbe8e4] text-[#35524d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {visibleAlerts.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#647d78] font-bold space-y-2">
                  <FileCheck2 className="w-8 h-8 mx-auto text-emerald-600" />
                  <div>در این دسته‌بندی هیچ مورد در انتظار رسیدگی وجود ندارد.</div>
                </div>
              ) : (
                visibleAlerts.map((al) => (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => {
                      handleNavigateModule(al.targetModule);
                      setAlertsDrawerOpen(false);
                    }}
                    className="w-full text-right rounded-xl border border-[#e3efeb] hover:border-[#0E4D3B] bg-[#fcfefd] p-3.5 space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-black text-[#12292c]">{al.title}</div>
                    <div className="text-[11px] text-[#5d7671]">{al.subtitle}</div>
                    <div className="text-[10px] font-bold text-[#0E4D3B] tabular-nums pt-0.5">
                      {formatPersianDateTime(al.createdAtEpoch)} — مشاهده و رسیدگی ←
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
