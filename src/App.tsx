import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Headphones,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Header } from './components/Header';
import { SideDrawer } from './components/SideDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoriesGrid } from './components/CategoriesGrid';
import { CtaBanner } from './components/CtaBanner';
import { HomeSkeleton, ServiceCatalogSkeleton } from './components/HomeSkeleton';
import { HamkarPanelShell } from './components/hamkar/HamkarPanelShell';
const AdminPanelShell = lazy(() =>
  import('./components/admin/AdminPanelShell').then((m) => ({ default: m.AdminPanelShell }))
);
import { CustomerSignupView } from './components/CustomerSignupView';
import {
  AboutTandisView,
  EDUCATIONAL_SEO_ARTICLES,
  NewsArticlesView,
  NotificationsModal,
  RatingDialog,
  SupportTicketsModal,
} from './components/AboutSupportModals';
import { AppDownloadsView } from './components/AppDownloadsView';
import { BeautySalonView } from './components/BeautySalonView';
import { AuthModal, CitySelectorModal, EditNameModal } from './components/CityAuthModals';
import { CancelReasonModal, InvoiceDetailModal, ShaparakGatewayModal } from './components/InvoiceShaparakModals';
import { OrderWizardModal } from './components/OrderWizardModal';
import { PartsStoreView } from './components/PartsStoreView';
import { OfflineIndicator } from './components/PWAInstallBanner';
import { TandisPayWalletView } from './components/TandisPayWalletView';
import { CustomerDashboardView } from './components/CustomerDashboardView';
import { ALL_IRAN_CITIES } from './services/iranProvinces';
import {
  createTicket,
  fetchCustomerTickets,
  fetchLiveState,
  payRequestInvoice,
  rateCompletedRequest,
  saveNotificationState,
  updateCustomerName,
} from './services/tandisApi';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_ONLINE_STORE_PARTS,
  DEFAULT_SLIDERS,
  TRENDING_SEARCH_TAGS,
  formatToman,
  statusPersianLabel,
  statusStepIndex,
  toPersianDigits,
  toPurePersianText,
} from './services/tandisDefaults';
import { SeoHead } from './components/SeoHead';
import type {
  AppNotificationItem,
  LiveStatePayload,
  OnlineStorePart,
  PromoSlide,
  ServiceCategoryGroup,
  ServiceRequestItem,
  SubServiceItem,
  SupportTicket,
  TandisCityInfo,
} from './types/tandis';
import {
  ROUTE_TITLES,
  parseRouteFromLocation,
  pushBrowserPath,
  type MainView,
  type ServiceSubTab,
} from './services/routes';

const VIEW_TRANSITION = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
};

const HOME_CATEGORY_TO_SERVICE_SLUG: Record<string, string> = {
  services: 'cat-technical-repairs',
  auto: 'cat-automotive-mechanic',
  home: 'cat-cleaning-moving',
  events: 'cat-medical-nursing',
  legal: 'cat-legal-judicial',
  apparel: 'cat-beauty-personal',
  industrial: 'cat-business-tech-industry',
  'auto-request': 'cat-ride-request',
};

export default function App() {
  const initialRoute = useMemo(() => {
    if (typeof window !== 'undefined') {
      return parseRouteFromLocation(window.location.pathname, window.location.hash);
    }
    return parseRouteFromLocation('/', '');
  }, []);

  const [activeView, setActiveView] = useState<MainView>(initialRoute.activeView);
  const [hamkarInitialMode, setHamkarInitialMode] = useState<'login' | 'signup'>(initialRoute.hamkarMode);
  const [serviceSubTab, setServiceSubTab] = useState<ServiceSubTab>(initialRoute.serviceSubTab);

  // هویت و شهر ذخیره‌شده (صرفاً در صورت وجود نشست تاییدشده معتبر)
  const initialVerifiedAuth = useMemo(() => {
    try {
      const verified = localStorage.getItem('tandis_customer_auth_verified') === '1';
      const savedPhone = (localStorage.getItem('tandis_phone') || '').trim();
      const savedName = (localStorage.getItem('tandis_name') || '').trim();
      if (verified && /^09\d{9}$/.test(savedPhone)) {
        return { phone: savedPhone, name: savedName };
      }
      // پاکسازی نشست‌های ناقص یا قدیمی تاییدنشده برای جلوگیری از نمایش نام پیش از ورود
      localStorage.removeItem('tandis_phone');
      localStorage.removeItem('tandis_name');
      localStorage.removeItem('tandis_customer_auth_verified');
    } catch {
      // ignore storage errors
    }
    return { phone: '', name: '' };
  }, []);

  const [phone, setPhone] = useState<string>(initialVerifiedAuth.phone);
  const [customerName, setCustomerName] = useState<string>(initialVerifiedAuth.name);
  const [selectedCityName, setSelectedCityName] = useState<string>(
    () => localStorage.getItem('tandis_city') || 'آبادان'
  );

  // جستجو و فیلتر خدمات
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string>(initialRoute.selectedGroupSlug);
  const [showBeautyBookingInsideCategory, setShowBeautyBookingInsideCategory] = useState(
    initialRoute.showBeautyBooking
  );

  // منوی کشویی
  const [drawerOpen, setDrawerOpen] = useState(false);

  // داده‌های زنده سرور مرکزی تندیس
  const [liveState, setLiveState] = useState<LiveStatePayload | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // مرکز اعلان‌ها (فعالیت‌های سایت + پیام‌های ارسالی مدیریت)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<AppNotificationItem[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tandis_local_notifs') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tandis_read_notifs') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [clearedNotifIds, setClearedNotifIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tandis_cleared_notifs') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [readAllBeforeEpoch, setReadAllBeforeEpoch] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('tandis_read_all_before') || '0');
      return Number.isFinite(saved) && saved > 0 ? saved : 0;
    } catch {
      return 0;
    }
  });

  // مودال‌های زنده
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [showIntroLogoMotion, setShowIntroLogoMotion] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntroLogoMotion(false);
    }, 1350);
    return () => window.clearTimeout(timer);
  }, []);
  const [wizardTarget, setWizardTarget] = useState<{
    group: ServiceCategoryGroup;
    sub: SubServiceItem;
  } | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<ServiceRequestItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ServiceRequestItem | null>(null);
  const [ratingTarget, setRatingTarget] = useState<ServiceRequestItem | null>(null);
  const [shaparakState, setShaparakState] = useState<{
    open: boolean;
    amountToman: number;
    title: string;
    onSuccess: () => Promise<void>;
    paymentMeta?: Record<string, unknown> | null;
  }>({
    open: false,
    amountToman: 0,
    title: '',
    onSuccess: async () => {},
    paymentMeta: null,
  });

  const seenInvoiceSignaturesRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<number | null>(null);

  const pushLocalNotification = useCallback(
    (entry: {
      title: string;
      message: string;
      type: AppNotificationItem['type'];
      actionNav?: string;
      force?: boolean;
      isRead?: boolean;
    }) => {
      if (!phone && !entry.force) return;
      const nextItem: AppNotificationItem = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: entry.title,
        message: entry.message,
        type: entry.type,
        createdAtEpoch: Date.now(),
        isRead: Boolean(entry.isRead),
        senderRole: 'SYSTEM',
        actionNav: entry.actionNav,
      };
      setLocalNotifications((prev) => {
        const updated = [nextItem, ...prev].slice(0, 40);
        try {
          localStorage.setItem('tandis_local_notifs', JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
        return updated;
      });
    },
    [phone]
  );

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 4200);
  }, []);

  const cityInfo: TandisCityInfo = useMemo(() => {
    return ALL_IRAN_CITIES.find((c) => c.name === selectedCityName) || ALL_IRAN_CITIES[0];
  }, [selectedCityName]);

  const runLiveSync = useCallback(
    async (targetPhone = phone) => {
      try {
        const data = await fetchLiveState(targetPhone);
        setLiveState(data);
        if (data.isBlocked && targetPhone) {
          localStorage.removeItem('tandis_phone');
          localStorage.removeItem('tandis_name');
          localStorage.removeItem('tandis_customer_auth_verified');
          setPhone('');
          setCustomerName('');
          setShowNotificationsModal(false);
          showToast('حساب کاربری شما از سمت مدیریت مسدود شده است.');
        } else if (
          targetPhone &&
          /^09\d{9}$/.test(targetPhone) &&
          localStorage.getItem('tandis_customer_auth_verified') === '1' &&
          data.activeCustomer
        ) {
          if (data.activeCustomer.full_name) {
            const cleanName = data.activeCustomer.full_name.split('|')[0].trim();
            if (cleanName && cleanName !== customerName) {
              setCustomerName(cleanName);
              localStorage.setItem('tandis_name', cleanName);
            }
          }
          const srvCity = (data.activeCustomer.city || '').trim();
          const userSavedCity = (localStorage.getItem(`tandis_city_${targetPhone}`) || '').trim();
          const effectiveCity = userSavedCity || srvCity;
          if (effectiveCity && ALL_IRAN_CITIES.some((c) => c.name === effectiveCity)) {
            setSelectedCityName((prev) => {
              if (prev !== effectiveCity) {
                localStorage.setItem('tandis_city', effectiveCity);
                localStorage.setItem(`tandis_city_${targetPhone}`, effectiveCity);
              }
              return effectiveCity;
            });
          }
        }
        if (targetPhone) {
          if (data.notificationState) {
            const srvRead = Array.isArray(data.notificationState.readIds) ? data.notificationState.readIds : [];
            const srvCleared = Array.isArray(data.notificationState.clearedIds) ? data.notificationState.clearedIds : [];
            const srvBefore = Number(data.notificationState.readAllBeforeEpoch || 0);
            if (srvRead.length > 0) {
              setReadNotifIds((prev) => {
                const merged = Array.from(new Set([...prev, ...srvRead]));
                try {
                  localStorage.setItem('tandis_read_notifs', JSON.stringify(merged));
                } catch {}
                return merged.length === prev.length ? prev : merged;
              });
            }
            if (srvCleared.length > 0) {
              setClearedNotifIds((prev) => {
                const merged = Array.from(new Set([...prev, ...srvCleared]));
                try {
                  localStorage.setItem('tandis_cleared_notifs', JSON.stringify(merged));
                } catch {}
                return merged.length === prev.length ? prev : merged;
              });
            }
            if (srvBefore > 0) {
              setReadAllBeforeEpoch((prev) => {
                const next = Math.max(prev, srvBefore);
                if (next !== prev) {
                  try {
                    localStorage.setItem('tandis_read_all_before', String(next));
                  } catch {}
                }
                return next;
              });
            }
          }
          if (Array.isArray(data.tickets) && data.tickets.length > 0) {
            setTickets(data.tickets);
          }
          fetchCustomerTickets(targetPhone)
            .then((list) => {
              if (list.length > 0 || !data.tickets?.length) setTickets(list);
            })
            .catch(() => {});
        }
      } catch {
        // در صورت اختلال لحظه‌ای شبکه، داده فعلی حفظ می‌شود
      } finally {
        setInitialLoading(false);
      }
    },
    [phone, customerName, showToast]
  );

  useEffect(() => {
    // پنل مدیریت و پنل همکار سامانه‌های کاملاً مجزا هستند و نباید همگام‌سازی مشتری برایشان اجرا شود
    if (activeView === 'management' || activeView === 'hamkar-panel') {
      return;
    }
    const failsafe = window.setTimeout(() => setInitialLoading(false), 4000);
    runLiveSync(phone);
    const timer = window.setInterval(() => {
      runLiveSync(phone);
    }, 6000);
    return () => {
      window.clearTimeout(failsafe);
      window.clearInterval(timer);
    };
  }, [activeView, phone, runLiveSync]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = initialRoute.pageTitle;
    }
    if (typeof window !== 'undefined' && window.location.search) {
      const qs = new URLSearchParams(window.location.search);
      const zpStatus = qs.get('zarinpal');
      const zpRef = qs.get('ref_id');
      if (zpStatus === 'success') {
        showToast(
          zpRef
            ? `پرداخت آنلاین زرین‌پال با موفقیت انجام شد. کد رهگیری: ${toPersianDigits(zpRef)}`
            : 'پرداخت آنلاین زرین‌پال با موفقیت انجام شد.'
        );
        window.history.replaceState({}, '', window.location.pathname);
      } else if (zpStatus === 'cancelled') {
        showToast('پرداخت در درگاه زرین‌پال توسط کاربر لغو شد.');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (zpStatus === 'failed') {
        showToast('پرداخت در درگاه زرین‌پال تایید نشد. در صورت کسر وجه، تا ۷۲ ساعت عودت داده می‌شود.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    const syncFromBrowserUrl = () => {
      const resolved = parseRouteFromLocation(window.location.pathname, window.location.hash);
      setActiveView(resolved.activeView);
      setServiceSubTab(resolved.serviceSubTab);
      setSelectedGroupSlug(resolved.selectedGroupSlug);
      setShowBeautyBookingInsideCategory(resolved.showBeautyBooking);
      setHamkarInitialMode(resolved.hamkarMode);
      document.title = resolved.pageTitle;
    };
    window.addEventListener('popstate', syncFromBrowserUrl);
    window.addEventListener('hashchange', syncFromBrowserUrl);
    return () => {
      window.removeEventListener('popstate', syncFromBrowserUrl);
      window.removeEventListener('hashchange', syncFromBrowserUrl);
    };
  }, [initialRoute.pageTitle, showToast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('tandis_phone');
    localStorage.removeItem('tandis_name');
    localStorage.removeItem('tandis_customer_auth_verified');
    setPhone('');
    setCustomerName('');
    setShowNotificationsModal(false);
    setInvoiceTarget(null);
    setCancelTarget(null);
    setRatingTarget(null);
    setTickets([]);
    seenInvoiceSignaturesRef.current.clear();
    setLiveState((prev) =>
      prev
        ? {
            ...prev,
            requests: [],
            activeCustomer: null,
            walletBalanceToman: 0,
            beautyAppointments: [],
            customerLoans: [],
            partInquiries: [],
            notifications: [],
          }
        : prev
    );
    showToast('از حساب کاربری خارج شدید.');
  }, [showToast]);

  // باز شدن خودکار پنجره فاکتور صرفاً برای کاربر واردشده و سفارش فعال دارای فاکتور صادرشده از سمت متخصص
  useEffect(() => {
    if (!phone) {
      setInvoiceTarget(null);
      return;
    }
    const reqs = liveState?.requests || [];
    const pendingInvoice = reqs.find((r) => {
      const st = String(r.status || '').toUpperCase();
      return (
        Boolean(r.has_specialist_invoice) &&
        r.price_toman > 0 &&
        !r.is_paid_online &&
        !['COMPLETED', 'CANCELLED'].includes(st)
      );
    });
    if (pendingInvoice) {
      const sig = `${pendingInvoice.id}:${pendingInvoice.price_toman}:${pendingInvoice.invoice_updated_at || 0}`;
      if (!seenInvoiceSignaturesRef.current.has(sig)) {
        seenInvoiceSignaturesRef.current.add(sig);
        setInvoiceTarget(pendingInvoice);
      }
    }
  }, [phone, liveState?.requests]);

  // ترکیب دسته‌بندی‌های استاندارد با دسته‌بندی‌ها، آیکون‌ها و رنگ‌های زنده دریافت‌شده از API برنامه مشتری
  const categories: ServiceCategoryGroup[] = useMemo(() => {
    const raw = liveState?.categories;
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORIES;

    const readStr = (obj: Record<string, unknown>, ...keys: string[]): string | undefined => {
      for (const k of keys) {
        const v = obj[k];
        if (typeof v === 'string' && v.trim()) return v.trim();
      }
      return undefined;
    };

    const mergedDefaults = DEFAULT_CATEGORIES.map((defGroup) => {
      const remoteGroup = raw.find((r) => String(r.slug || r.id || '') === defGroup.slug);
      if (!remoteGroup) return defGroup;
      const remoteSubs = Array.isArray(remoteGroup.subcategories)
        ? (remoteGroup.subcategories as Array<Record<string, unknown>>)
        : [];
      const knownSubIds = new Set(defGroup.subcategories.map((s) => s.id));
      const groupColorHex = readStr(remoteGroup, 'color_hex', 'colorHex', 'accent_hex', 'accentHex') || defGroup.accentHex;
      const groupIconKey = readStr(remoteGroup, 'icon_key', 'iconKey', 'icon_name', 'iconName');
      const groupIconUrl = readStr(remoteGroup, 'icon_url', 'iconUrl', 'image_url', 'imageUrl', 'icon_base64');
      const groupIconStyle = readStr(remoteGroup, 'icon_style', 'iconStyle');

      const mergedSubs: SubServiceItem[] = defGroup.subcategories.map((defSub) => {
        const rs = remoteSubs.find((x) => String(x.id || x.slug || '') === defSub.id);
        if (!rs) {
          return {
            ...defSub,
            colorHex: defSub.colorHex || groupColorHex,
          };
        }
        const remotePrice = Number(rs.basePriceToman ?? rs.base_price_toman ?? rs.price_toman ?? 0);
        const rawSubColor = readStr(rs, 'color_hex', 'colorHex');
        const effectiveSubColor =
          rawSubColor && rawSubColor.toUpperCase() !== '#0E4D34'
            ? rawSubColor
            : groupColorHex || rawSubColor;
        return {
          ...defSub,
          title: toPurePersianText(String(rs.title || rs.name || defSub.title)) || defSub.title,
          subtitle:
            toPurePersianText(String(rs.subtitle || rs.description || defSub.subtitle)) || defSub.subtitle,
          basePriceToman: remotePrice > 0 ? remotePrice : defSub.basePriceToman,
          etaText: toPurePersianText(String(rs.etaText || rs.eta_text || defSub.etaText)) || defSub.etaText,
          isComingSoon: Boolean(rs.is_coming_soon ?? rs.isComingSoon ?? defSub.isComingSoon),
          iconKey: readStr(rs, 'icon_key', 'iconKey', 'icon_name', 'iconName') || defSub.iconKey,
          iconUrl: readStr(rs, 'icon_url', 'iconUrl', 'image_url', 'imageUrl', 'icon_base64') || defSub.iconUrl,
          iconStyle: readStr(rs, 'icon_style', 'iconStyle') || groupIconStyle,
          colorHex: effectiveSubColor,
        };
      });

      // افزودن زیرخدمت‌های جدیدی که توسط مدیر به این دسته‌بندی اضافه شده است
      for (const rs of remoteSubs) {
        const subId = String(rs.id || rs.slug || '').trim();
        const subTitle = toPurePersianText(String(rs.title || rs.name || '')).trim();
        if (!subId || !subTitle || knownSubIds.has(subId)) continue;
        knownSubIds.add(subId);
        const remotePrice = Number(rs.basePriceToman ?? rs.base_price_toman ?? rs.price_toman ?? 0);
        const readyProblems = Array.isArray(rs.readyProblems || rs.ready_problems)
          ? ((rs.readyProblems || rs.ready_problems) as unknown[]).map((p) => String(p)).filter(Boolean)
          : ['نیاز به کارشناسی و بررسی تخصصی در محل', 'سرویس و نگهداری دوره‌ای', 'تعمیر یا تعویض قطعه معیوب'];
        const rawSubColor = readStr(rs, 'color_hex', 'colorHex');
        const effectiveSubColor =
          rawSubColor && rawSubColor.toUpperCase() !== '#0E4D34'
            ? rawSubColor
            : groupColorHex || rawSubColor;
        mergedSubs.push({
          id: subId,
          title: subTitle,
          subtitle: toPurePersianText(String(rs.subtitle || rs.description || 'ارائه خدمت تخصصی در محل توسط متخصصان تندیس')),
          basePriceToman: remotePrice > 0 ? remotePrice : 350000,
          etaText: toPurePersianText(String(rs.etaText || rs.eta_text || '۴۵ دقیقه')),
          readyProblems,
          isComingSoon: Boolean(rs.is_coming_soon ?? rs.isComingSoon ?? false),
          iconKey: readStr(rs, 'icon_key', 'iconKey', 'icon_name', 'iconName') || groupIconKey,
          iconUrl: readStr(rs, 'icon_url', 'iconUrl', 'image_url', 'imageUrl', 'icon_base64'),
          iconStyle: readStr(rs, 'icon_style', 'iconStyle') || groupIconStyle,
          colorHex: effectiveSubColor,
        });
      }

      return {
        ...defGroup,
        title: toPurePersianText(String(remoteGroup.title || remoteGroup.name || defGroup.title)) || defGroup.title,
        subtitle:
          toPurePersianText(String(remoteGroup.subtitle || remoteGroup.description || defGroup.subtitle)) ||
          defGroup.subtitle,
        isComingSoon: Boolean(remoteGroup.is_coming_soon ?? remoteGroup.isComingSoon ?? defGroup.isComingSoon),
        colorHex: groupColorHex,
        accentHex: groupColorHex || defGroup.accentHex,
        iconKey: groupIconKey || defGroup.iconKey,
        iconUrl: groupIconUrl || defGroup.iconUrl,
        iconStyle: groupIconStyle || defGroup.iconStyle,
        subcategories: mergedSubs,
      };
    });

    // افزودن دسته‌بندی‌های کاملاً جدیدی که از نرم‌افزار تندیس مدیریت ساخته شده‌اند
    const defaultSlugs = new Set(DEFAULT_CATEGORIES.map((g) => g.slug));
    const extraRemoteGroups: ServiceCategoryGroup[] = [];
    for (const rg of raw) {
      const slug = String(rg.slug || rg.id || '').trim();
      const title = toPurePersianText(String(rg.title || rg.name || '')).trim();
      if (!slug || !title || defaultSlugs.has(slug)) continue;
      defaultSlugs.add(slug);
      const groupColorHex = readStr(rg, 'color_hex', 'colorHex', 'accent_hex', 'accentHex');
      const groupIconKey = readStr(rg, 'icon_key', 'iconKey', 'icon_name', 'iconName');
      const groupIconUrl = readStr(rg, 'icon_url', 'iconUrl', 'image_url', 'imageUrl', 'icon_base64');
      const groupIconStyle = readStr(rg, 'icon_style', 'iconStyle');
      const remoteSubs = Array.isArray(rg.subcategories)
        ? (rg.subcategories as Array<Record<string, unknown>>)
        : [];
      const mappedSubs: SubServiceItem[] =
        remoteSubs.length > 0
          ? remoteSubs
              .map((rs, idx) => {
                const subId = String(rs.id || rs.slug || `${slug}_sub_${idx + 1}`).trim();
                const subTitle = toPurePersianText(String(rs.title || rs.name || '')).trim();
                if (!subTitle) return null;
                const remotePrice = Number(rs.basePriceToman ?? rs.base_price_toman ?? rs.price_toman ?? 0);
                const rawSubColor = readStr(rs, 'color_hex', 'colorHex');
                return {
                  id: subId,
                  title: subTitle,
                  subtitle: toPurePersianText(String(rs.subtitle || rs.description || 'خدمات تخصصی تندیس در محل')),
                  basePriceToman: remotePrice > 0 ? remotePrice : 350000,
                  etaText: toPurePersianText(String(rs.etaText || rs.eta_text || '۴۵ دقیقه')),
                  readyProblems: Array.isArray(rs.readyProblems || rs.ready_problems)
                    ? ((rs.readyProblems || rs.ready_problems) as unknown[]).map((p) => String(p)).filter(Boolean)
                    : ['نیاز به کارشناسی در محل', 'سفارش خدمت تخصصی'],
                  isComingSoon: Boolean(rs.is_coming_soon ?? rs.isComingSoon ?? false),
                  iconKey: readStr(rs, 'icon_key', 'iconKey', 'icon_name', 'iconName') || groupIconKey,
                  iconUrl: readStr(rs, 'icon_url', 'iconUrl', 'image_url', 'imageUrl', 'icon_base64'),
                  iconStyle: readStr(rs, 'icon_style', 'iconStyle') || groupIconStyle,
                  colorHex:
                    rawSubColor && rawSubColor.toUpperCase() !== '#0E4D34'
                      ? rawSubColor
                      : groupColorHex || rawSubColor,
                } as SubServiceItem;
              })
              .filter((x): x is SubServiceItem => Boolean(x))
          : [
              {
                id: `${slug}_default`,
                title,
                subtitle: toPurePersianText(String(rg.subtitle || rg.description || 'ثبت درخواست خدمت در محل')),
                basePriceToman: Number(rg.base_price_toman || rg.price_toman || 350000),
                etaText: '۴۵ دقیقه',
                readyProblems: ['نیاز به کارشناسی و انجام خدمت در محل'],
                isComingSoon: Boolean(rg.is_coming_soon ?? rg.isComingSoon ?? false),
                iconKey: groupIconKey,
                iconUrl: groupIconUrl,
                iconStyle: groupIconStyle,
                colorHex: groupColorHex,
              },
            ];

      extraRemoteGroups.push({
        slug,
        title,
        subtitle: toPurePersianText(String(rg.subtitle || rg.description || 'دسته‌بندی تخصصی مدیریت تندیس')),
        isComingSoon: Boolean(rg.is_coming_soon ?? rg.isComingSoon ?? false),
        colorHex: groupColorHex,
        accentHex: groupColorHex,
        iconKey: groupIconKey,
        iconUrl: groupIconUrl,
        iconStyle: groupIconStyle,
        subcategories: mappedSubs,
      });
    }

    return [...mergedDefaults, ...extraRemoteGroups];
  }, [liveState?.categories]);

  // ترکیب اعلان‌های محلی کاربر با پیام‌های زنده ارسال‌شده از سامانه تندیس مدیریت (فقط پس از ورود به حساب)
  const mergedNotifications: AppNotificationItem[] = useMemo(() => {
    if (!phone) return [];
    const clearedSet = new Set(clearedNotifIds);
    const readSet = new Set(readNotifIds);
    const byId = new Map<string, AppNotificationItem>();
    for (const item of [...(liveState?.notifications || []), ...localNotifications]) {
      if (!item?.id || clearedSet.has(item.id)) continue;
      if (!byId.has(item.id)) {
        const epoch = Number(item.createdAtEpoch || 0);
        byId.set(item.id, {
          ...item,
          isRead:
            Boolean(item.isRead) ||
            readSet.has(item.id) ||
            (readAllBeforeEpoch > 0 && epoch > 0 && epoch <= readAllBeforeEpoch),
        });
      }
    }
    return Array.from(byId.values()).sort((a, b) => (b.createdAtEpoch || 0) - (a.createdAtEpoch || 0));
  }, [phone, liveState?.notifications, localNotifications, readNotifIds, clearedNotifIds, readAllBeforeEpoch]);

  const unreadNotificationsCount = useMemo(
    () => mergedNotifications.filter((n) => !n.isRead).length,
    [mergedNotifications]
  );

  const handleMarkOneNotificationRead = useCallback(
    (notifId: string) => {
      if (!notifId) return;
      const nextReadIds = Array.from(new Set([...readNotifIds, notifId]));
      setReadNotifIds(nextReadIds);
      setLocalNotifications((prev) => {
        const updated = prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
        try {
          localStorage.setItem('tandis_local_notifs', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      try {
        localStorage.setItem('tandis_read_notifs', JSON.stringify(nextReadIds));
      } catch {}
      if (phone) {
        saveNotificationState(phone, {
          readIds: nextReadIds,
          clearedIds: clearedNotifIds,
          readAllBeforeEpoch,
        });
      }
    },
    [phone, readNotifIds, clearedNotifIds, readAllBeforeEpoch]
  );

  const handleMarkAllNotificationsRead = useCallback(() => {
    const maxEpoch = mergedNotifications.reduce((acc, n) => Math.max(acc, Number(n.createdAtEpoch || 0)), 0);
    const nextReadBefore = Math.max(readAllBeforeEpoch, Date.now(), maxEpoch);
    const allIds = Array.from(new Set([...readNotifIds, ...mergedNotifications.map((n) => n.id)]));
    setReadNotifIds(allIds);
    setReadAllBeforeEpoch(nextReadBefore);
    setLocalNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      try {
        localStorage.setItem('tandis_local_notifs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      localStorage.setItem('tandis_read_notifs', JSON.stringify(allIds));
      localStorage.setItem('tandis_read_all_before', String(nextReadBefore));
    } catch {
      // ignore
    }
    if (phone) {
      saveNotificationState(phone, {
        readIds: allIds,
        clearedIds: clearedNotifIds,
        readAllBeforeEpoch: nextReadBefore,
      });
    }
  }, [phone, readNotifIds, clearedNotifIds, readAllBeforeEpoch, mergedNotifications]);

  const handleClearAllNotifications = useCallback(() => {
    const maxEpoch = mergedNotifications.reduce((acc, n) => Math.max(acc, Number(n.createdAtEpoch || 0)), 0);
    const nextReadBefore = Math.max(readAllBeforeEpoch, Date.now(), maxEpoch);
    const allIds = Array.from(new Set([...clearedNotifIds, ...mergedNotifications.map((n) => n.id)]));
    const allRead = Array.from(new Set([...readNotifIds, ...mergedNotifications.map((n) => n.id)]));
    setClearedNotifIds(allIds);
    setReadNotifIds(allRead);
    setReadAllBeforeEpoch(nextReadBefore);
    setLocalNotifications([]);
    try {
      localStorage.setItem('tandis_cleared_notifs', JSON.stringify(allIds));
      localStorage.setItem('tandis_read_notifs', JSON.stringify(allRead));
      localStorage.setItem('tandis_read_all_before', String(nextReadBefore));
      localStorage.setItem('tandis_local_notifs', '[]');
    } catch {
      // ignore
    }
    if (phone) {
      saveNotificationState(phone, {
        readIds: allRead,
        clearedIds: allIds,
        readAllBeforeEpoch: nextReadBefore,
      });
    }
  }, [phone, readNotifIds, clearedNotifIds, readAllBeforeEpoch, mergedNotifications]);

  // اسلایدرهای تبلیغاتی (دریافت از سرور مرکزی یا استفاده از اسلایدرهای پیش‌فرض باکیفیت)
  const liveSliders: PromoSlide[] = useMemo(() => {
    const raw = liveState?.sliders;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return DEFAULT_SLIDERS;
  }, [liveState?.sliders]);

  const ota = liveState?.otaConfig;
  const isStoreEnabled = ota?.is_online_store_enabled ?? ota?.online_store_enabled ?? true;
  const rawSupportPhone = String(ota?.support_phone || '').trim();
  const supportPhone =
    !rawSupportPhone || rawSupportPhone === '061-53220000' ? '09307327975' : rawSupportPhone;

  const storeParts: OnlineStorePart[] = useMemo(() => {
    const remote = ota?.online_store_parts;
    if (Array.isArray(remote) && remote.length > 0) {
      return remote.map((p, i) => {
        const fallbackPrice = DEFAULT_ONLINE_STORE_PARTS[i % DEFAULT_ONLINE_STORE_PARTS.length]?.priceToman || 580000;
        const parsedPrice = Number(p.price_toman || 0);
        return {
          id: p.id || `remote_part_${i}`,
          title: toPurePersianText(p.title) || 'قطعه اصلی تندیس',
          category: toPurePersianText(p.category) || 'قطعات اصلی تندیس',
          brand: toPurePersianText(p.brand) || 'تندیس',
          compatibleModel: toPurePersianText(p.compatible_model) || 'انواع مدل‌های استاندارد',
          partCode: toPurePersianText(p.part_code) || `کد-${toPersianDigits(i + 101)}`,
          warranty: toPurePersianText(p.warranty) || '۱۲ ماه ضمانت',
          priceToman: parsedPrice > 0 ? parsedPrice : fallbackPrice,
          inStock: p.in_stock ?? true,
        };
      });
    }
    return DEFAULT_ONLINE_STORE_PARTS;
  }, [ota]);

  const requests = liveState?.requests || [];
  const activeOrder = useMemo(
    () => requests.find((r) => !['COMPLETED', 'CANCELLED'].includes(String(r.status || '').toUpperCase())) || null,
    [requests]
  );
  const pendingRatingOrder = useMemo(
    () => requests.find((r) => String(r.status || '').toUpperCase() === 'COMPLETED' && !r.customer_rating) || null,
    [requests]
  );
  const walletBalance = liveState?.walletBalanceToman ?? 0;

  const filteredServiceCategories = useMemo(() => {
    const q = serviceSearchQuery.trim();
    return categories
      .filter((g) => selectedGroupSlug === 'all' || g.slug === selectedGroupSlug)
      .map((g) => ({
        ...g,
        subcategories: g.subcategories.filter(
          (s) => !q || s.title.includes(q) || s.subtitle.includes(q) || g.title.includes(q)
        ),
      }))
      .filter((g) => g.subcategories.length > 0);
  }, [categories, serviceSearchQuery, selectedGroupSlug]);

  const openShaparak = (
    amountToman: number,
    title: string,
    onSuccess: () => Promise<void>,
    paymentMeta?: Record<string, unknown>
  ) => {
    setShaparakState({ open: true, amountToman, title, onSuccess, paymentMeta: paymentMeta || null });
  };

  const handleOpenSubService = (group: ServiceCategoryGroup, sub: SubServiceItem) => {
    if (sub.isComingSoon || group.isComingSoon) {
      showToast(`سرویس «${sub.title}» به‌زودی در شهر شما فعال می‌شود.`);
      return;
    }
    if (group.slug === 'cat-beauty-personal') {
      setSelectedGroupSlug('cat-beauty-personal');
      setShowBeautyBookingInsideCategory(true);
      setActiveView('services');
      setServiceSubTab('catalog');
      pushBrowserPath('/beauty', ROUTE_TITLES['/beauty']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setWizardTarget({ group, sub });
  };

  const handleNavigate = useCallback((dest: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (dest === 'hamkar-panel' || dest === 'expert-login') {
      setHamkarInitialMode('login');
      setActiveView('hamkar-panel');
      pushBrowserPath('/hamkar', ROUTE_TITLES['/hamkar']);
      return;
    }
    if (dest === 'provider-signup') {
      setHamkarInitialMode('signup');
      setActiveView('hamkar-panel');
      pushBrowserPath('/hamkar/signup', ROUTE_TITLES['/hamkar/signup']);
      return;
    }
    if (dest === 'beauty') {
      setSelectedGroupSlug('cat-beauty-personal');
      setShowBeautyBookingInsideCategory(true);
      setActiveView('services');
      setServiceSubTab('catalog');
      pushBrowserPath('/beauty', ROUTE_TITLES['/beauty']);
      return;
    }
    if (dest === 'dashboard') {
      setActiveView('dashboard');
      pushBrowserPath('/dashboard', ROUTE_TITLES['/dashboard']);
      return;
    }
    if (dest === 'store') {
      showToast('فروشگاه تندیس به‌زودی فعال می‌شود.');
      return;
    }
    if (dest === 'tandispay') {
      showToast('تندیس‌پی به‌زودی فعال می‌شود.');
      return;
    }
    if (dest === 'orders') {
      setActiveView('services');
      setServiceSubTab('orders');
      pushBrowserPath('/orders', ROUTE_TITLES['/orders']);
      return;
    }
    if (dest === 'services') {
      setSelectedGroupSlug('all');
      setShowBeautyBookingInsideCategory(false);
      setActiveView('services');
      setServiceSubTab('catalog');
      pushBrowserPath('/services', ROUTE_TITLES['/services']);
      return;
    }
    if (dest === 'management') {
      setActiveView('management');
      pushBrowserPath('/management', ROUTE_TITLES['/management']);
      return;
    }
    if (dest === 'news') {
      setActiveView('news');
      pushBrowserPath('/news', ROUTE_TITLES['/news']);
      return;
    }
    if (dest === 'downloads') {
      setActiveView('downloads');
      pushBrowserPath('/app', ROUTE_TITLES['/app']);
      return;
    }
    if (dest === 'customer-signup') {
      setActiveView('customer-signup');
      pushBrowserPath('/signup', ROUTE_TITLES['/signup']);
      return;
    }
    if (dest === 'about' || dest === 'terms' || dest === 'privacy') {
      const targetPath = dest === 'terms' ? '/terms' : dest === 'privacy' ? '/privacy' : '/about';
      setActiveView('about');
      pushBrowserPath(targetPath, ROUTE_TITLES[targetPath]);
      return;
    }
    setActiveView('home');
    pushBrowserPath('/', ROUTE_TITLES['/']);
  }, [showToast]);

  const handleSelectHomeCategory = (catSlugOrId: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetSlug = HOME_CATEGORY_TO_SERVICE_SLUG[catSlugOrId] || catSlugOrId || 'all';
    const matchedGroup = categories.find((g) => g.slug === targetSlug);
    if (catSlugOrId === 'auto-request' || matchedGroup?.isComingSoon) {
      showToast(`سرویس «${matchedGroup?.title || 'درخواست خودرو و پیک'}» به‌زودی در شهر شما فعال می‌شود.`);
      return;
    }
    setSelectedGroupSlug(targetSlug);
    setShowBeautyBookingInsideCategory(targetSlug === 'cat-beauty-personal');
    setServiceSearchQuery('');
    setActiveView('services');
    setServiceSubTab('catalog');
    if (targetSlug === 'cat-beauty-personal') {
      pushBrowserPath('/beauty', ROUTE_TITLES['/beauty']);
    } else if (targetSlug && targetSlug !== 'all') {
      pushBrowserPath(`/services/${targetSlug}`, ROUTE_TITLES['/services']);
    } else {
      pushBrowserPath('/services', ROUTE_TITLES['/services']);
    }
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    setServiceSearchQuery(q);
    setSelectedGroupSlug('all');
    setActiveView('services');
    setServiceSubTab('catalog');
    pushBrowserPath('/services', ROUTE_TITLES['/services']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const headerActiveNav =
    activeView === 'services'
      ? serviceSubTab === 'catalog'
        ? selectedGroupSlug === 'cat-beauty-personal' && showBeautyBookingInsideCategory
          ? 'beauty'
          : 'services'
        : serviceSubTab
      : activeView;

  const activeSelectedGroup = useMemo(
    () => (selectedGroupSlug !== 'all' ? categories.find((g) => g.slug === selectedGroupSlug) || null : null),
    [categories, selectedGroupSlug]
  );

  const quickAccessCards: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    comingSoon?: boolean;
    disabled?: boolean;
  }> = [
    {
      id: 'services',
      title: 'خدمات در محل',
      subtitle: '۳۱ خدمت با ضمانت',
      icon: Wrench,
      accent: 'from-[#0b5c60] to-[#0a8387]',
    },
    {
      id: 'store',
      title: 'فروشگاه',
      subtitle: 'به‌زودی فعال می‌شود',
      icon: ShoppingBag,
      accent: 'from-[#0d9488] to-[#0b5c60]',
      comingSoon: true,
      disabled: true,
    },
    {
      id: 'tandispay',
      title: 'تندیس‌پی',
      subtitle: 'به‌زودی فعال می‌شود',
      icon: Wallet,
      accent: 'from-[#d97706] to-[#f2a900]',
      comingSoon: true,
      disabled: true,
    },
    {
      id: 'downloads',
      title: 'اپلیکیشن تندیس',
      subtitle: 'نسخه مشتری و همکار',
      icon: Download,
      accent: 'from-[#12292c] to-[#0b5c60]',
    },
  ];

  const serviceSubTabs: Array<{
    id: ServiceSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    comingSoon?: boolean;
    disabled?: boolean;
  }> = [
    { id: 'catalog', label: 'خدمات', icon: Wrench },
    { id: 'store', label: 'فروشگاه', icon: ShoppingBag, comingSoon: true, disabled: true },
    { id: 'tandispay', label: 'تندیس‌پی', icon: Wallet, comingSoon: true, disabled: true },
    { id: 'orders', label: 'درخواست‌ها', icon: ReceiptText },
  ];

  // پنل مستقل تندیس همکار (کاملاً مجزا از نمای مشتری سایت)
  if (activeView === 'hamkar-panel') {
    return (
      <MotionConfig reducedMotion="user">
        <HamkarPanelShell
          initialMode={hamkarInitialMode}
          onBackToSite={() => handleNavigate('home')}
        />
      </MotionConfig>
    );
  }

  // پنل یکپارچه مدیریت و کارشناسان تندیس (۱۴ ماژول عملیاتی همگام با سرور مرکزی)
  if (activeView === 'management') {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div
              dir="rtl"
              className="min-h-screen bg-[#0E4D3B] text-white flex items-center justify-center text-sm font-black"
            >
              در حال بارگذاری پنل یکپارچه مدیریت و کارشناسان تندیس...
            </div>
          }
        >
          <AdminPanelShell onBackToSite={() => handleNavigate('home')} />
        </Suspense>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <SeoHead
        title={initialRoute.pageTitle}
        canonicalUrl={`https://tandiis.com${typeof window !== 'undefined' ? window.location.pathname : ''}`}
      />
      <div
        dir="rtl"
        className="min-h-screen bg-[#f4f7f8] lg:bg-[#f2f9f9] text-[#12292c] flex flex-col selection:bg-[#0a8387]/20 selection:text-[#0b5c60]"
      >
        {/* لوگو موشن رسمی تندیس در ابتدای ورود به سایت (رفع کامل باگ لوگو اولیه و نمایش انیمیشن برند تندیس) */}
        <AnimatePresence>
          {showIntroLogoMotion && (
            <motion.div
              key="tandis-intro-logo-motion"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setShowIntroLogoMotion(false)}
              className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-gradient-to-b from-[#0d6e72] via-[#094245] to-[#052527] text-white select-none cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: [0.92, 1.18, 0.96], opacity: [0.45, 0.2, 0.45] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-36 h-36 rounded-[38px] border-2 border-teal-300/40"
                />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [1, 1.28, 1], opacity: [0.25, 0.08, 0.25] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  className="absolute w-44 h-44 rounded-[46px] border border-[#f2a900]/35"
                />
                <motion.div
                  initial={{ scale: 0.55, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-white p-1.5 shadow-[0_24px_55px_rgba(0,0,0,0.45)] ring-4 ring-white/20 overflow-hidden"
                >
                  <img
                    src="/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg"
                    alt="لوگوی رسمی تندیس | tandiis.com"
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.38 }}
                className="mt-6 text-center space-y-1.5"
              >
                <div className="text-2xl sm:text-3xl font-black tracking-tight">تندیس</div>
                <div className="text-xs sm:text-sm font-bold text-teal-100/90">
                  سامانه هوشمند خدمات در محل • <span dir="ltr">tandiis.com</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 148, opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.9, ease: 'easeOut' }}
                className="mt-5 h-1 rounded-full bg-gradient-to-r from-emerald-300 via-[#f2a900] to-teal-200"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <OfflineIndicator />

        {/* هدر اصلی */}
        <Header
          selectedCity={selectedCityName}
          activeNav={headerActiveNav}
          onNavClick={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenCityModal={() => setShowCityModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          customerPhone={phone}
          customerName={phone ? customerName : ''}
          unreadNotificationsCount={phone ? unreadNotificationsCount : 0}
          onOpenNotifications={phone ? () => setShowNotificationsModal(true) : undefined}
          pendingRatingServiceTitle={phone && pendingRatingOrder ? pendingRatingOrder.service_title : undefined}
          onOpenRating={phone && pendingRatingOrder ? () => setRatingTarget(pendingRatingOrder) : undefined}
          onOpenEditName={phone ? () => setShowEditNameModal(true) : undefined}
          onLogout={phone ? handleLogout : undefined}
        />

        {/* بار جستجو و شهر در موبایل (زیر هدر) */}
        <div className="lg:hidden px-3.5 py-2.5 bg-white border-b border-slate-200/70 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCityModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f2f9f9] text-[#0b5c60] text-xs font-black shrink-0 border border-[#d6ebeb]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0a8387]" />
            <span>{selectedCityName}</span>
          </button>
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#7c9296] absolute right-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              placeholder="جستجوی خدمت، تعمیرات، زیبایی..."
              className="w-full rounded-xl bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0b5c60] pr-10 pl-3 py-2 text-xs font-bold text-[#12292c] placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* اعلان شناور بازخورد */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 lg:top-22 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#0b5c60] text-white px-5 py-3 text-xs font-extrabold shadow-[0_14px_34px_rgba(11,92,96,0.3)] border border-white/15 flex items-center gap-2 no-print max-w-[92vw]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#f2a900] shrink-0" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* محتوای اصلی صفحه */}
        <main className="flex-1 pt-2.5 sm:pt-4 pb-24 lg:pb-10">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10">
            <AnimatePresence mode="wait">
              {/* صفحه اصلی با Skeleton UI در زمان بارگذاری اولیه */}
              {activeView === 'home' && initialLoading && (
                <motion.div key="view-home-skeleton" {...VIEW_TRANSITION}>
                  <HomeSkeleton />
                </motion.div>
              )}

              {activeView === 'home' && !initialLoading && (
                <motion.div key="view-home" {...VIEW_TRANSITION} className="space-y-4 lg:space-y-7">
                  {/* ==================== نسخه وب‌موبایل اختصاصی آیفون (iOS Minimal Experience - lg:hidden) ==================== */}
                  <div className="lg:hidden space-y-4">
                    {/* نوار خوش‌آمدگویی و وضعیت زنده سفارش به سبک iOS Live Activity */}
                    {phone && (
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black text-[#12292c]">
                          سلام، {customerName || 'کاربر تندیس'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavigate('dashboard')}
                          className="text-[11px] font-extrabold text-[#0a8387] bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs cursor-pointer"
                        >
                          داشبورد من
                        </button>
                      </div>
                    )}

                    {phone && activeOrder && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleNavigate('orders')}
                        className="rounded-[24px] bg-gradient-to-l from-[#0b5c60] to-[#0a8387] text-white p-3.5 shadow-[0_10px_24px_-8px_rgba(11,92,96,0.35)] flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#f2a900] animate-ping" />
                            <span className="text-[10px] font-bold text-teal-100">سفارش فعال در جریان</span>
                          </div>
                          <div className="text-xs font-black truncate mt-0.5">{activeOrder.service_title}</div>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#f2a900] text-[#12292c] px-3 py-1 text-[11px] font-black">
                          {statusPersianLabel(activeOrder.status)}
                        </span>
                      </motion.div>
                    )}

                    {/* اسلایدر بنر با گوشه‌های گرد iOS */}
                    <HeroCarousel
                      slides={liveSliders}
                      onSlideAction={(slide) => {
                        const slug = String(slide.target_category_slug || '').trim();
                        if (slug === 'tandispay') {
                          handleNavigate('tandispay');
                        } else if (slug === 'store') {
                          handleNavigate('store');
                        } else if (slug === 'beauty' || slug === 'cat-beauty-personal') {
                          handleNavigate('beauty');
                        } else if (slug) {
                          handleSelectHomeCategory(slug);
                        } else {
                          handleNavigate('services');
                        }
                      }}
                    />

                    {/* گرید ۴ ستونه آیکون‌های خدمات به سبک iOS */}
                    <CategoriesGrid
                      categories={categories}
                      selectedCategoryId="all"
                      onSelectCategory={handleSelectHomeCategory}
                    />

                    {/* ویجت‌های ۲×۲ مینیمال آیفون (Bento iOS Widgets) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('beauty')}
                        className="rounded-[22px] bg-gradient-to-br from-[#0b5c60] to-[#0a8387] text-white p-3.5 text-right shadow-xs flex flex-col justify-between min-h-[96px] cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="w-8 h-8 rounded-[12px] bg-white/15 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[#f2a900]" />
                        </div>
                        <div>
                          <div className="text-xs font-black">زیبایی و سلامت</div>
                          <div className="text-[10px] text-teal-100/90 mt-0.5">رزرو متخصصان چندمهارتی</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate('news')}
                        className="rounded-[22px] bg-white/95 border border-slate-200/80 text-[#12292c] p-3.5 text-right shadow-2xs flex flex-col justify-between min-h-[96px] cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="w-8 h-8 rounded-[12px] bg-[#effcfb] text-[#0a8387] flex items-center justify-center border border-[#d2eceb]">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black">مقالات و آموزش‌ها</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {toPersianDigits(EDUCATIONAL_SEO_ARTICLES.length)} راهنمای تخصصی
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate('downloads')}
                        className="rounded-[22px] bg-white/95 border border-slate-200/80 text-[#12292c] p-3.5 text-right shadow-2xs flex flex-col justify-between min-h-[92px] cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="w-8 h-8 rounded-[12px] bg-slate-100 text-[#12292c] flex items-center justify-center">
                          <Download className="w-4 h-4 text-[#0a8387]" />
                        </div>
                        <div>
                          <div className="text-xs font-black">دانلود اپلیکیشن</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">نسخه مشتری و همکار</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate('provider-signup')}
                        className="rounded-[22px] bg-white/95 border border-slate-200/80 text-[#12292c] p-3.5 text-right shadow-2xs flex flex-col justify-between min-h-[92px] cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="w-8 h-8 rounded-[12px] bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black">ثبت‌نام متخصصان</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">کسب درآمد در تندیس</div>
                        </div>
                      </button>
                    </div>

                    {/* نوار کپسولی سرویس‌های به‌زودی (فروشگاه و تندیس‌پی) به سبک iOS */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div
                        aria-disabled="true"
                        className="rounded-2xl bg-white/75 border border-slate-200/70 px-3 py-2.5 flex items-center justify-between opacity-75 select-none"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px] font-extrabold text-slate-600">فروشگاه</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black">
                          به‌زودی
                        </span>
                      </div>

                      <div
                        aria-disabled="true"
                        className="rounded-2xl bg-white/75 border border-slate-200/70 px-3 py-2.5 flex items-center justify-between opacity-75 select-none"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px] font-extrabold text-slate-600">تندیس‌پی</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black">
                          به‌زودی
                        </span>
                      </div>
                    </div>

                    {/* اسلایدر افقی مقالات و آموزش‌های سئو شده در موبایل آیفون */}
                    <section className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-4 bg-[#0a8387] rounded-full" />
                          <h2 className="text-sm font-black text-[#12292c]">مقالات و آموزش‌های تندیس</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNavigate('news')}
                          className="text-[11px] font-extrabold text-[#0a8387] flex items-center gap-1 cursor-pointer"
                        >
                          <span>مشاهده همه</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                        {EDUCATIONAL_SEO_ARTICLES.slice(0, 5).map((art) => (
                          <button
                            key={art.id}
                            type="button"
                            onClick={() => {
                              pushBrowserPath(`/news?article=${art.slug}`, `${art.title} | تندیس`);
                              setActiveView('news');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-60 shrink-0 rounded-[22px] bg-white/95 border border-slate-200/80 overflow-hidden text-right shadow-2xs flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform"
                          >
                            <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                              <img
                                src={art.coverImage}
                                alt={art.title}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-extrabold">
                                {art.contentType === 'TUTORIAL' ? 'آموزش گام‌به‌گام' : art.category}
                              </span>
                            </div>
                            <div className="p-3 space-y-1.5">
                              <h3 className="text-xs font-black text-[#12292c] line-clamp-2 leading-5">
                                {art.title}
                              </h3>
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#0a8387]" />
                                  {toPersianDigits(art.readingTimeMin)} دقیقه مطالعه
                                </span>
                                <span className="text-[#0a8387] font-extrabold">مطالعه ←</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* ==================== نسخه دسکتاپ وب‌سایت (hidden lg:block) ==================== */}
                  <div className="hidden lg:block space-y-7">
                    {/* پیام خوش‌آمدگویی بلافاصله زیر هدر */}
                    {phone && (
                      <div className="px-1 text-base font-black text-[#12292c]">
                        سلام {customerName || 'کاربر گرامی'}
                      </div>
                    )}

                    {phone && activeOrder && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2rem] tandis-calm-gradient text-white p-6 space-y-4 shadow-[0_14px_34px_rgba(11,92,96,0.18)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-xs text-white/80 font-bold">پیگیری زنده سفارش فعال شما</div>
                            <h2 className="text-xl font-black mt-0.5">{activeOrder.service_title}</h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-black">
                              {statusPersianLabel(activeOrder.status)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleNavigate('orders')}
                              className="rounded-xl bg-[#f2a900] text-[#12292c] px-3.5 py-1.5 text-xs font-black cursor-pointer"
                            >
                              مشاهده جزئیات
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {['۱. تایید متخصص', '۲. در مسیر محل', '۳. در حال انجام'].map((label, idx) => {
                            const stepActive = statusStepIndex(activeOrder.status) >= idx + 1;
                            return (
                              <div
                                key={label}
                                className={`rounded-2xl p-2.5 text-center text-xs font-extrabold ${
                                  stepActive ? 'bg-[#f2a900] text-[#12292c]' : 'bg-white/12 text-white/80'
                                }`}
                              >
                                {label}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* اسلایدر عکس‌دار زنده متصل به سامانه مدیریت تندیس */}
                    <HeroCarousel
                      slides={liveSliders}
                      onSlideAction={(slide) => {
                        const slug = String(slide.target_category_slug || '').trim();
                        if (slug === 'tandispay') {
                          handleNavigate('tandispay');
                        } else if (slug === 'store') {
                          handleNavigate('store');
                        } else if (slug === 'beauty' || slug === 'cat-beauty-personal') {
                          setSelectedGroupSlug('cat-beauty-personal');
                          setShowBeautyBookingInsideCategory(true);
                          setActiveView('services');
                          setServiceSubTab('catalog');
                          pushBrowserPath('/beauty', ROUTE_TITLES['/beauty']);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (slug) {
                          setSelectedGroupSlug(slug);
                          setShowBeautyBookingInsideCategory(false);
                          setActiveView('services');
                          setServiceSubTab('catalog');
                          pushBrowserPath(`/services/${slug}`, ROUTE_TITLES['/services']);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          handleNavigate('services');
                        }
                      }}
                    />

                    {/* دسته‌بندی خدمات تندیس */}
                    <CategoriesGrid
                      categories={categories}
                      selectedCategoryId="all"
                      onSelectCategory={handleSelectHomeCategory}
                    />

                    {/* نوار دسترسی سریع */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-5 bg-[#0a8387] rounded-full" />
                          <h2 className="text-lg font-black text-[#12292c]">
                            سرویس‌های تندیس
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNavigate('services')}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0b5c60] hover:text-[#0a8387] cursor-pointer"
                        >
                          <span>همه خدمات</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {quickAccessCards.map((card) => {
                          const Icon = card.icon;
                          const isDisabled = Boolean(card.disabled);
                          return (
                            <motion.button
                              key={card.id}
                              type="button"
                              disabled={isDisabled}
                              whileHover={isDisabled ? undefined : { y: -3 }}
                              whileTap={isDisabled ? undefined : { scale: 0.98 }}
                              onClick={() => {
                                if (isDisabled) return;
                                handleNavigate(card.id);
                              }}
                              className={`group text-right rounded-2xl bg-white border border-[#e2efef] p-5 shadow-[0_4px_16px_rgba(11,92,96,0.04)] transition-all flex flex-col justify-between gap-3 ${
                                isDisabled
                                  ? 'opacity-70 cursor-not-allowed'
                                  : 'hover:border-[#0a8387]/50 hover:shadow-[0_12px_26px_rgba(11,92,96,0.1)] cursor-pointer'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 w-full">
                                <div
                                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} text-white flex items-center justify-center ${
                                    isDisabled ? '' : 'group-hover:scale-105'
                                  } transition-transform`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                {card.comingSoon && (
                                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                                    به‌زودی
                                  </span>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <h3 className="text-sm font-black text-[#12292c] group-hover:text-[#0b5c60] transition-colors">
                                  {card.title}
                                </h3>
                                <p className="text-xs text-[#5f777b]">{card.subtitle}</p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>

                    {/* ویترین مقالات و آموزش‌های تخصصی تندیس (سئو شده) در صفحه اصلی دسکتاپ */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-5 bg-[#0a8387] rounded-full" />
                          <h2 className="text-lg font-black text-[#12292c]">
                            مقالات و آموزش‌های تخصصی تندیس
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNavigate('news')}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0b5c60] hover:text-[#0a8387] cursor-pointer"
                        >
                          <span>مشاهده همه {toPersianDigits(EDUCATIONAL_SEO_ARTICLES.length)} مقاله و آموزش</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {EDUCATIONAL_SEO_ARTICLES.slice(0, 3).map((art) => (
                          <button
                            key={art.id}
                            type="button"
                            onClick={() => {
                              pushBrowserPath(`/news?article=${art.slug}`, `${art.title} | تندیس`);
                              setActiveView('news');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group text-right rounded-2xl bg-white border border-[#e2efef] hover:border-[#0a8387]/50 overflow-hidden shadow-[0_4px_16px_rgba(11,92,96,0.04)] hover:shadow-[0_12px_28px_rgba(11,92,96,0.1)] transition-all flex flex-col justify-between cursor-pointer"
                          >
                            <div>
                              <div className="relative h-44 w-full overflow-hidden bg-[#0b5c60]/10">
                                <img
                                  src={art.coverImage}
                                  alt={art.title}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#0b5c60]/90 backdrop-blur-md text-white text-[11px] font-extrabold">
                                  {art.contentType === 'TUTORIAL' ? 'آموزش گام‌به‌گام' : art.category}
                                </span>
                              </div>
                              <div className="p-4 space-y-2">
                                <h3 className="text-sm font-black text-[#12292c] group-hover:text-[#0a8387] leading-6 line-clamp-2 transition-colors">
                                  {art.title}
                                </h3>
                                <p className="text-xs text-[#5f777b] line-clamp-2 leading-5">
                                  {art.summary}
                                </p>
                              </div>
                            </div>
                            <div className="px-4 pb-4 pt-2 border-t border-[#f0f7f7] flex items-center justify-between text-xs font-bold text-[#5f777b]">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#0a8387]" />
                                {toPersianDigits(art.readingTimeMin)} دقیقه مطالعه
                              </span>
                              <span className="text-[#0a8387] font-black">مطالعه کامل ←</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* بنر دعوت به عضویت متخصصان + دانلود اپلیکیشن‌ها */}
                    <CtaBanner
                      onOpenProviderSignup={() => handleNavigate('provider-signup')}
                      onExploreAllListings={() => handleNavigate('services')}
                      onOpenDownloads={() => handleNavigate('downloads')}
                    />
                  </div>
                </motion.div>
              )}

              {/* سامانه خدمات برخط زنده تندیس (۳۱ زیرخدمت + زیبایی + سفارش‌ها) */}
              {activeView === 'services' && (
                <motion.div key="view-services" {...VIEW_TRANSITION} className="space-y-6">
                  {/* نوار تب‌های خدمات برخط */}
                  <div className="rounded-3xl bg-white border border-[#dfecec] p-3 sm:p-4 shadow-[0_6px_24px_rgba(11,92,96,0.05)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {serviceSubTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = serviceSubTab === tab.id;
                        const isDisabled = Boolean(tab.disabled);
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;
                              setServiceSubTab(tab.id);
                              const nextPath = tab.id === 'catalog' ? '/services' : `/${tab.id}`;
                              pushBrowserPath(nextPath, ROUTE_TITLES[nextPath]);
                            }}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors ${
                              isDisabled
                                ? 'text-[#8ea5a8] bg-[#f8fbfb] cursor-not-allowed opacity-75'
                                : active
                                  ? 'text-white cursor-pointer'
                                  : 'text-[#4a666a] hover:bg-[#f2f9f9] hover:text-[#12292c] cursor-pointer'
                            }`}
                          >
                            {active && !isDisabled && (
                              <motion.span
                                layoutId="services-subtab-bg"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className="absolute inset-0 rounded-2xl bg-[#0b5c60] shadow-xs"
                              />
                            )}
                            <Icon className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                            {tab.comingSoon && (
                              <span className="relative z-10 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black">
                                به‌زودی
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {phone && (
                      <div className="flex items-center justify-between md:justify-end gap-3 px-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#eef4f5]">
                        <button
                          type="button"
                          onClick={() => handleNavigate('dashboard')}
                          className="rounded-xl bg-[#0b5c60]/10 hover:bg-[#0b5c60]/20 text-[#0b5c60] px-3.5 py-1.5 text-[11px] font-black transition-colors cursor-pointer whitespace-nowrap"
                        >
                          مشاهده داشبورد مشتری
                        </button>
                      </div>
                    )}
                  </div>

                  {/* زیرتب ۱: کاتالوگ ۸ گروه و ۳۱ خدمت تخصصی */}
                  {serviceSubTab === 'catalog' && initialLoading && <ServiceCatalogSkeleton />}

                  {serviceSubTab === 'catalog' && !initialLoading && (
                    <div className="space-y-6">
                      {/* کارت پیگیری سفارش فعال در صورت وجود */}
                      {phone && activeOrder && (
                        <div className="rounded-[2rem] tandis-calm-gradient text-white p-5 sm:p-6 space-y-5 shadow-md">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs text-white/80 font-bold">پیگیری زنده سفارش فعال</div>
                              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                                {activeOrder.service_title}
                              </h2>
                            </div>
                            <span className="rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-black">
                              {statusPersianLabel(activeOrder.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {['۱. تایید متخصص', '۲. در مسیر محل', '۳. در حال انجام'].map((label, idx) => {
                              const stepActive = statusStepIndex(activeOrder.status) >= idx + 1;
                              return (
                                <div
                                  key={label}
                                  className={`rounded-2xl p-2.5 text-center text-xs font-extrabold ${
                                    stepActive ? 'bg-[#f2a900] text-[#12292c]' : 'bg-white/12 text-white/80'
                                  }`}
                                >
                                  {label}
                                </div>
                              );
                            })}
                          </div>

                          {activeOrder.assigned_specialist_name && (
                            <div className="rounded-2xl bg-black/20 p-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {activeOrder.specialist_avatar_url ? (
                                  <img
                                    src={activeOrder.specialist_avatar_url}
                                    alt={activeOrder.assigned_specialist_name}
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 rounded-2xl object-cover border border-white/25"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center font-black text-lg">
                                    {activeOrder.assigned_specialist_name.slice(0, 1)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-black text-sm">
                                    {activeOrder.assigned_specialist_name}
                                  </div>
                                  <div className="text-xs text-white/80">
                                    {activeOrder.clean_specialist_specialty || 'متخصص تاییدشده تندیس'}
                                  </div>
                                </div>
                              </div>
                              {activeOrder.assigned_specialist_phone && (
                                <a
                                  href={`tel:${activeOrder.assigned_specialist_phone}`}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#0b5c60] px-4 py-2.5 text-xs font-black"
                                >
                                  <Phone className="w-4 h-4" />
                                  تماس مستقیم با متخصص
                                </a>
                              )}
                            </div>
                          )}

                          {activeOrder.has_specialist_invoice &&
                            activeOrder.price_toman > 0 &&
                            !activeOrder.is_paid_online && (
                              <div className="rounded-2xl bg-[#05453F] border border-white/15 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <div className="text-xs text-white/75">فاکتور صادرشده در محل</div>
                                    <div className="text-2xl font-black text-[#f2a900] tabular-nums">
                                      {formatToman(activeOrder.price_toman)}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setInvoiceTarget(activeOrder)}
                                    className="rounded-xl bg-white/15 hover:bg-white/25 px-3.5 py-2 text-xs font-extrabold cursor-pointer"
                                  >
                                    مشاهده جزئیات کامل فاکتور
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (walletBalance >= activeOrder.price_toman) {
                                        payRequestInvoice({
                                          request: activeOrder,
                                          phone,
                                          customerName: customerName || 'مشتری تندیس',
                                          methodLabel: 'کیف پول تندیس',
                                          newWalletBalance: walletBalance - activeOrder.price_toman,
                                        }).then(() => {
                                          showToast('پرداخت درجا از کیف پول انجام شد.');
                                          runLiveSync(phone);
                                        });
                                      } else {
                                        openShaparak(
                                          activeOrder.price_toman,
                                          `پرداخت فاکتور: ${activeOrder.service_title}`,
                                          async () => {
                                            await payRequestInvoice({
                                              request: activeOrder,
                                              phone,
                                              customerName: customerName || 'مشتری تندیس',
                                              methodLabel: 'درگاه آنلاین شاپرک',
                                            });
                                            showToast('پرداخت آنلاین فاکتور در سرور مرکزی ثبت شد.');
                                            runLiveSync(phone);
                                          },
                                          {
                                            kind: 'invoice',
                                            phone,
                                            customerName: customerName || 'مشتری تندیس',
                                            requestId: activeOrder.id,
                                            specialistId: activeOrder.assigned_specialist_id || 'spec_101',
                                            specialistName: activeOrder.assigned_specialist_name || 'متخصص تندیس',
                                          }
                                        );
                                      }
                                    }}
                                    className="rounded-2xl bg-[#f2a900] hover:bg-[#dfa000] text-[#12292c] py-3 font-black text-xs sm:text-sm cursor-pointer"
                                  >
                                    پرداخت درجا فاکتور (
                                    {walletBalance >= activeOrder.price_toman ? 'از کیف پول' : 'درگاه شتاب'})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCancelTarget(activeOrder)}
                                    className="rounded-2xl border border-red-300/60 text-red-100 hover:bg-red-500/20 py-3 font-bold text-xs sm:text-sm cursor-pointer"
                                  >
                                    رد فاکتور و ثبت دلیل لغو
                                  </button>
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* جستجوی خدمات تخصصی */}
                      <div className="rounded-3xl bg-white border border-[#dfecec] p-4 sm:p-5 space-y-3.5 shadow-2xs">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute right-4 top-3.5 text-[#5f777b]" />
                          <input
                            value={serviceSearchQuery}
                            onChange={(e) => setServiceSearchQuery(e.target.value)}
                            placeholder="جستجوی خدمت..."
                            className="w-full rounded-2xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] pr-11 pl-4 py-3 text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                          <span className="text-xs font-semibold text-[#5f777b] whitespace-nowrap">
                            پرتقاضا:
                          </span>
                          {TRENDING_SEARCH_TAGS.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setServiceSearchQuery((prev) => (prev === tag ? '' : tag))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors cursor-pointer ${
                                serviceSearchQuery === tag
                                  ? 'bg-[#0b5c60] text-white border-[#0b5c60]'
                                  : 'bg-[#f4fafa] border-[#dfecec] text-[#12292c] hover:border-[#0a8387]/50'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* نمایش مینیمال دسته‌بندی‌ها: هنگام انتخاب یک دسته، فقط همان دسته نمایش داده می‌شود */}
                      {activeSelectedGroup ? (
                        <div className="rounded-2xl bg-white border border-[#dfecec] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-bold text-[#0a8387]">دسته‌بندی انتخاب‌شده</div>
                            <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                              {activeSelectedGroup.title}
                            </h2>
                            <p className="text-xs text-[#5f777b]">{activeSelectedGroup.subtitle}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGroupSlug('all');
                              setShowBeautyBookingInsideCategory(false);
                              pushBrowserPath('/services', ROUTE_TITLES['/services']);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f2f9f9] hover:bg-[#e3f3f3] border border-[#cde6e6] px-3.5 py-2 text-xs font-extrabold text-[#0b5c60] transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span>همه دسته‌بندی‌ها</span>
                          </button>
                        </div>
                      ) : (
                        !serviceSearchQuery.trim() && (
                          <CategoriesGrid
                            categories={categories}
                            selectedCategoryId={selectedGroupSlug}
                            onSelectCategory={(slug) => {
                              const picked = categories.find((g) => g.slug === slug);
                              if (picked?.isComingSoon) {
                                showToast(`سرویس «${picked.title}» به‌زودی در شهر شما فعال می‌شود.`);
                                return;
                              }
                              setSelectedGroupSlug(slug);
                              setShowBeautyBookingInsideCategory(slug === 'cat-beauty-personal');
                              pushBrowserPath(
                                slug === 'cat-beauty-personal' ? '/beauty' : `/services/${slug}`,
                                slug === 'cat-beauty-personal' ? ROUTE_TITLES['/beauty'] : ROUTE_TITLES['/services']
                              );
                            }}
                          />
                        )
                      )}

                      {/* زیرخدمت‌های تخصصی یا لیست مستقیم متخصصان زیبایی و سلامت */}
                      {(activeSelectedGroup || serviceSearchQuery.trim()) && (
                        <div className="space-y-6">
                          {filteredServiceCategories.map((group) => (
                            <section key={group.slug} className="space-y-4">
                              {/* اگر دسته‌بندی «زیبایی و سلامت» است، مستقیماً لیست متخصصان و مهارت‌های دریافتی از سرور نمایش داده می‌شود */}
                              {group.slug === 'cat-beauty-personal' ? (
                                <BeautySalonView
                                  dark={false}
                                  phone={phone}
                                  customerName={customerName}
                                  walletBalance={walletBalance}
                                  mandatoryDepositToman={ota?.beauty_mandatory_deposit_toman || 300000}
                                  liveSpecialists={liveState?.beautySpecialists || []}
                                  bookings={liveState?.beautyAppointments || []}
                                  onRequireLogin={() => setShowAuthModal(true)}
                                  onRequestShaparak={openShaparak}
                                  onRefresh={() => runLiveSync(phone)}
                                  onToast={showToast}
                                />
                              ) : (
                                <>
                                  {!activeSelectedGroup && (
                                    <div>
                                      <h3 className="text-base sm:text-lg font-black text-[#12292c]">
                                        {group.title}
                                      </h3>
                                      <p className="text-xs text-[#5f777b]">{group.subtitle}</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {group.subcategories.map((sub) => {
                                      const soon = Boolean(sub.isComingSoon || group.isComingSoon);
                                      return (
                                        <motion.div
                                          key={sub.id}
                                          whileHover={{ y: -3 }}
                                          className="rounded-3xl bg-white border border-[#dfecec] p-5 flex flex-col justify-between gap-4 hover:shadow-[0_12px_28px_rgba(11,92,96,0.09)] transition-shadow"
                                        >
                                          <div className="space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                              <img
                                                src="/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg"
                                                alt="تندیس"
                                                className="w-8 h-8 rounded-lg object-cover border border-[#dfecec]"
                                              />
                                              {soon && (
                                                <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-black">
                                                  به‌زودی
                                                </span>
                                              )}
                                            </div>
                                            <h4 className="font-black text-base text-[#12292c]">{sub.title}</h4>
                                            <p className="text-xs leading-5 text-[#5f777b]">{sub.subtitle}</p>
                                          </div>

                                          <div className="pt-3 border-t border-[#eef4f5] space-y-2.5">
                                            {!soon && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#5f777b]">تعرفه پایه مصوب:</span>
                                                <span className="font-black text-[#0b5c60] tabular-nums">
                                                  از {formatToman(sub.basePriceToman)}
                                                </span>
                                              </div>
                                            )}
                                            <motion.button
                                              whileTap={{ scale: 0.97 }}
                                              type="button"
                                              onClick={() => handleOpenSubService(group, sub)}
                                              className={`w-full rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer transition-colors ${
                                                soon
                                                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                  : 'bg-[#0b5c60] hover:bg-[#0a8387] text-white'
                                              }`}
                                            >
                                              {soon ? 'به‌زودی فعال می‌شود' : 'ثبت سفارش خدمت'}
                                            </motion.button>
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </section>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* زیرتب ۳: فروشگاه قطعات */}
                  {serviceSubTab === 'store' && (
                    <PartsStoreView
                      dark={false}
                      loading={initialLoading}
                      isStoreEnabled={isStoreEnabled}
                      parts={storeParts}
                      inquiries={liveState?.partInquiries || []}
                      phone={phone}
                      customerName={customerName}
                      cityInfo={cityInfo}
                      walletBalance={walletBalance}
                      onRequireLogin={() => setShowAuthModal(true)}
                      onRequestShaparak={openShaparak}
                      onRefresh={() => runLiveSync(phone)}
                      onToast={showToast}
                    />
                  )}

                  {/* زیرتب ۴: تندیس‌پی و کیف پول */}
                  {serviceSubTab === 'tandispay' && (
                    <TandisPayWalletView
                      dark={false}
                      phone={phone}
                      customerName={customerName}
                      walletBalance={walletBalance}
                      loans={liveState?.customerLoans || []}
                      onRequireLogin={() => setShowAuthModal(true)}
                      onRequestShaparak={openShaparak}
                      onRefresh={() => runLiveSync(phone)}
                      onToast={showToast}
                    />
                  )}

                  {/* زیرتب ۵: سفارش‌ها و فاکتورها */}
                  {serviceSubTab === 'orders' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-white border border-[#e2efef] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                          درخواست‌ها و فاکتورها
                        </h2>
                        <span className="text-xs font-bold text-[#0b5c60] tabular-nums">
                          {toPersianDigits(requests.length)} درخواست
                        </span>
                      </div>

                      {requests.length === 0 ? (
                        <div className="rounded-3xl bg-white border border-[#dfecec] p-10 text-center space-y-4">
                          <p className="text-sm text-[#5f777b] font-semibold">
                            {phone
                              ? 'هنوز سفارشی ثبت نکرده‌اید.'
                              : 'برای مشاهده تاریخچه سفارش‌ها و فاکتورهای خود وارد حساب کاربری شوید.'}
                          </p>
                          {!phone && (
                            <button
                              type="button"
                              onClick={() => setShowAuthModal(true)}
                              className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-6 py-2.5 text-xs font-black cursor-pointer"
                            >
                              ورود پیامکی به حساب تندیس
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {requests.map((req) => (
                            <div
                              key={req.id}
                              className="rounded-3xl bg-white border border-[#dfecec] p-5 space-y-3 shadow-2xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <div className="font-black text-base text-[#12292c]">
                                    {req.service_title}
                                  </div>
                                  <div className="text-xs text-[#5f777b] mt-0.5">
                                    {req.city || selectedCityName} · {req.neighborhood || 'محله ثبت‌شده'} ·{' '}
                                    {req.home_address}
                                  </div>
                                </div>
                                <span className="text-xs font-black text-[#0b5c60] bg-[#eff8f8] px-3 py-1 rounded-xl">
                                  {statusPersianLabel(req.status)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#eef4f5]">
                                <div className="text-xs font-bold tabular-nums text-[#12292c]">
                                  {req.price_toman > 0
                                    ? `مبلغ فاکتور: ${formatToman(req.price_toman)}`
                                    : 'در انتظار اعلام فاکتور'}
                                  {req.is_paid_online ? ' · پرداخت‌شده' : ''}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setInvoiceTarget(req)}
                                    className="rounded-xl border border-[#cbd5e1] hover:border-[#0b5c60] px-3.5 py-2 text-xs font-extrabold cursor-pointer transition-colors"
                                  >
                                    فاکتور و رسید رسمی
                                  </button>
                                  {!['COMPLETED', 'CANCELLED'].includes(
                                    String(req.status || '').toUpperCase()
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() => setCancelTarget(req)}
                                      className="rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 px-3.5 py-2 text-xs font-extrabold cursor-pointer transition-colors"
                                    >
                                      لغو سفارش
                                    </button>
                                  )}
                                  {String(req.status || '').toUpperCase() === 'COMPLETED' &&
                                    !req.customer_rating && (
                                      <button
                                        type="button"
                                        onClick={() => setRatingTarget(req)}
                                        className="rounded-xl bg-[#f2a900] text-[#12292c] px-3.5 py-2 text-xs font-black cursor-pointer"
                                      >
                                        ثبت امتیاز ۵ ستاره
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}


              {/* صفحه رسمی دانلود اپلیکیشن‌ها (سوپر اپلیکیشن تندیس و تندیس همکار) */}
              {activeView === 'downloads' && (
                <motion.div key="view-downloads" {...VIEW_TRANSITION}>
                  <AppDownloadsView dark={false} onToast={showToast} />
                </motion.div>
              )}

              {/* ثبت‌نام مشتری */}
              {activeView === 'customer-signup' && (
                <motion.div key="view-customer-signup" {...VIEW_TRANSITION}>
                  <CustomerSignupView
                    onBackToHome={() => handleNavigate('home')}
                    onSwitchToLogin={() => setShowAuthModal(true)}
                    onSwitchToProviderSignup={() => handleNavigate('provider-signup')}
                    onSignupSuccess={(authUser) => {
                      const cleanPhone = authUser.phone || '';
                      const fullName =
                        `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() ||
                        authUser.name ||
                        'کاربر تندیس';
                      if (cleanPhone && /^09\d{9}$/.test(cleanPhone)) {
                        const chosenCity = (authUser.city || '').trim();
                        if (chosenCity && ALL_IRAN_CITIES.some((c) => c.name === chosenCity)) {
                          setSelectedCityName(chosenCity);
                          localStorage.setItem('tandis_city', chosenCity);
                          localStorage.setItem(`tandis_city_${cleanPhone}`, chosenCity);
                        }
                        setPhone(cleanPhone);
                        setCustomerName(fullName);
                        localStorage.setItem('tandis_phone', cleanPhone);
                        localStorage.setItem('tandis_name', fullName);
                        localStorage.setItem('tandis_customer_auth_verified', '1');
                        runLiveSync(cleanPhone);
                      }
                      showToast(`خوش آمدید ${fullName}!`);
                      handleNavigate('home');
                    }}
                  />
                </motion.div>
              )}

              {/* داشبورد اختصاصی مشتری (سفارشات، اقساط تندیس‌پی در صورت وجود وام، گزارش و چاپ فاکتور، و تیکت‌ها) */}
              {activeView === 'dashboard' && (
                <motion.div key="view-dashboard" {...VIEW_TRANSITION}>
                  <CustomerDashboardView
                    customerPhone={phone}
                    customerName={customerName}
                    selectedCity={selectedCityName}
                    walletBalance={walletBalance}
                    requests={requests}
                    loans={liveState?.customerLoans || []}
                    tickets={tickets}
                    onNavigateHome={() => handleNavigate('home')}
                    onNavigateServices={() => handleNavigate('services')}
                    onOpenInvoice={(req) => setInvoiceTarget(req)}
                    onOpenRating={(req) => setRatingTarget(req)}
                    onRequireLogin={() => setShowAuthModal(true)}
                    onSubmitTicket={async (subj, msg) => {
                      if (!phone) {
                        setShowAuthModal(true);
                        return;
                      }
                      await createTicket({
                        user_phone: phone,
                        user_name: customerName || 'مشتری تندیس',
                        subject: subj,
                        message: msg,
                      });
                      showToast('تیکت پشتیبانی شما با موفقیت ثبت و به پنل مدیریت ارسال شد.');
                      pushLocalNotification({
                        title: 'ثبت تیکت پشتیبانی',
                        message: `تیکت «${subj}» با موفقیت ثبت شد.`,
                        type: 'SUPPORT',
                      });
                      const refreshed = await fetchCustomerTickets(phone);
                      setTickets(refreshed);
                    }}
                  />
                </motion.div>
              )}

              {/* صفحه مستقل اخبار و مقالات آموزشی سئو شده تندیس */}
              {activeView === 'news' && (
                <motion.div key="view-news" {...VIEW_TRANSITION}>
                  <NewsArticlesView
                    dark={false}
                    onNavigateHome={() => handleNavigate('home')}
                    onOrderServiceClick={() => handleNavigate('services')}
                  />
                </motion.div>
              )}

              {/* درباره تندیس و نماد اعتماد */}
              {activeView === 'about' && (
                <motion.div key="view-about" {...VIEW_TRANSITION}>
                  <AboutTandisView
                    dark={false}
                    supportPhone={supportPhone}
                    otaVersionLabel={ota?.ota_version_label || '۲.۷.۰'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* فوتر */}
        <Footer
          onNavClick={handleNavigate}
          onOpenSupport={() => setShowTicketsModal(true)}
          supportPhone={supportPhone}
        />

        {/* منوی کشویی کناری */}
        <SideDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeNav={headerActiveNav}
          onNavClick={handleNavigate}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSupport={() => setShowTicketsModal(true)}
          onOpenEditName={() => setShowEditNameModal(true)}
          onOpenNotifications={phone ? () => setShowNotificationsModal(true) : undefined}
          unreadNotificationsCount={phone ? unreadNotificationsCount : 0}
          onLogout={handleLogout}
          selectedCity={selectedCityName}
          customerPhone={phone}
          customerName={customerName}
          supportPhone={supportPhone}
        />

        {/* ناوبری پایین موبایل */}
        <MobileBottomNav
          activeNav={headerActiveNav}
          onNavClick={handleNavigate}
          onOpenSupport={() => setShowTicketsModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenDrawer={() => setDrawerOpen(true)}
          isLoggedIn={Boolean(phone)}
        />

        {/* دکمه واحد پشتیبانی ۲۴ ساعته */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowTicketsModal(true)}
          className="fixed bottom-20 lg:bottom-6 left-5 z-40 flex items-center gap-2 rounded-full bg-[#0b5c60] hover:bg-[#0a8387] text-white px-4 py-3 shadow-[0_8px_24px_rgba(11,92,96,0.25)] cursor-pointer no-print"
          aria-label="پشتیبانی ۲۴ ساعته"
        >
          <Headphones className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold">پشتیبانی</span>
        </motion.button>

        {/* ===== مودال‌های زنده متصل به سرور تندیس و ایران‌پیامک ===== */}
        <CitySelectorModal
          open={showCityModal}
          dark={false}
          selectedCityName={selectedCityName}
          onClose={() => setShowCityModal(false)}
          onSelectCity={(c) => {
            setSelectedCityName(c.name);
            localStorage.setItem('tandis_city', c.name);
            if (phone && /^09\d{9}$/.test(phone)) {
              localStorage.setItem(`tandis_city_${phone}`, c.name);
              updateCustomerName({
                phone,
                fullName: customerName || 'مشتری تندیس',
                city: c.name,
              }).catch(() => {});
            }
            showToast(`شهر فعال به ${c.name} (${c.province}) تغییر یافت.`);
            pushLocalNotification({
              title: 'تغییر شهر فعال',
              message: `شهر فعال خدمات شما به ${c.name} (${c.province}) تغییر یافت.`,
              type: 'SYSTEM',
            });
          }}
        />

        <AuthModal
          open={showAuthModal}
          dark={false}
          selectedCityName={selectedCityName}
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={(p, name, restoredCity) => {
            setPhone(p);
            setCustomerName(name);
            localStorage.setItem('tandis_phone', p);
            localStorage.setItem('tandis_name', name);
            localStorage.setItem('tandis_customer_auth_verified', '1');
            const userSavedCity = (localStorage.getItem(`tandis_city_${p}`) || '').trim();
            const candidateCity = userSavedCity || (restoredCity || '').trim();
            if (candidateCity && ALL_IRAN_CITIES.some((c) => c.name === candidateCity)) {
              setSelectedCityName(candidateCity);
              localStorage.setItem('tandis_city', candidateCity);
              localStorage.setItem(`tandis_city_${p}`, candidateCity);
            } else {
              localStorage.setItem(`tandis_city_${p}`, selectedCityName);
            }
            showToast(`خوش آمدید ${name}!`);
            pushLocalNotification({
              title: 'ورود موفق به حساب تندیس',
              message: `خوش آمدید ${name}! حساب شما با شماره ${toPersianDigits(p)} فعال شد.`,
              type: 'AUTH',
              force: true,
              isRead: true,
            });
            runLiveSync(p);
          }}
        />

        <EditNameModal
          open={showEditNameModal}
          dark={false}
          phone={phone}
          currentName={customerName}
          city={selectedCityName}
          onClose={() => setShowEditNameModal(false)}
          onSaved={(newName) => {
            setCustomerName(newName);
            localStorage.setItem('tandis_name', newName);
            showToast('نام کاربری با موفقیت به‌روزرسانی و همگام‌سازی شد.');
            pushLocalNotification({
              title: 'ویرایش مشخصات کاربری',
              message: `نام پروفایل شما به «${newName}» تغییر یافت.`,
              type: 'SYSTEM',
            });
            runLiveSync(phone);
          }}
        />

        <OrderWizardModal
          open={Boolean(wizardTarget)}
          dark={false}
          group={wizardTarget?.group || null}
          sub={wizardTarget?.sub || null}
          cityInfo={cityInfo}
          phone={phone}
          customerName={customerName}
          walletBalance={walletBalance}
          categorySliders={liveState?.categorySliders || null}
          onRequireLogin={() => setShowAuthModal(true)}
          onRequestShaparak={openShaparak}
          onClose={() => setWizardTarget(null)}
          onToast={showToast}
          onSubmitted={() => {
            const submittedTitle = wizardTarget?.sub?.title || 'خدمت تخصصی تندیس';
            setWizardTarget(null);
            pushLocalNotification({
              title: 'ثبت موفق سفارش جدید',
              message: `سفارش «${submittedTitle}» در شهر ${selectedCityName} ثبت و برای متخصصان ارسال شد.`,
              type: 'ORDER',
              actionNav: 'orders',
            });
            setActiveView('services');
            setServiceSubTab('orders');
            pushBrowserPath('/orders', ROUTE_TITLES['/orders']);
            runLiveSync(phone);
          }}
        />

        <InvoiceDetailModal
          request={invoiceTarget}
          dark={false}
          phone={phone}
          customerName={customerName}
          walletBalance={walletBalance}
          onClose={() => setInvoiceTarget(null)}
          onRequestShaparak={openShaparak}
          onRequestCancel={(req) => setCancelTarget(req)}
          onPaid={(msg) => {
            showToast(msg);
            pushLocalNotification({
              title: 'پرداخت موفق فاکتور',
              message: msg,
              type: 'PAYMENT',
              actionNav: 'orders',
            });
            runLiveSync(phone);
          }}
        />

        <CancelReasonModal
          request={cancelTarget}
          dark={false}
          onClose={() => setCancelTarget(null)}
          onCancelled={(msg) => {
            showToast(msg);
            pushLocalNotification({
              title: 'لغو سفارش',
              message: msg,
              type: 'ORDER',
            });
            runLiveSync(phone);
          }}
        />

        <ShaparakGatewayModal
          open={shaparakState.open}
          dark={false}
          amountToman={shaparakState.amountToman}
          title={shaparakState.title}
          phone={phone}
          customerName={customerName}
          paymentMeta={shaparakState.paymentMeta}
          onCancel={() => setShaparakState((s) => ({ ...s, open: false }))}
          onSuccess={shaparakState.onSuccess}
        />

        <NotificationsModal
          open={Boolean(phone) && showNotificationsModal}
          dark={false}
          notifications={mergedNotifications}
          onClose={() => setShowNotificationsModal(false)}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onMarkOneRead={handleMarkOneNotificationRead}
          onClearAll={handleClearAllNotifications}
        />

        <SupportTicketsModal
          open={showTicketsModal}
          dark={false}
          tickets={tickets}
          onClose={() => setShowTicketsModal(false)}
          onSubmitTicket={async (subj, msg) => {
            if (!phone) {
              setShowTicketsModal(false);
              setShowAuthModal(true);
              return;
            }
            await createTicket({
              user_phone: phone,
              user_name: customerName || 'مشتری تندیس',
              subject: subj,
              message: msg,
            });
            showToast('پیام شما با موفقیت به پنل مدیریت ارسال شد.');
            pushLocalNotification({
              title: 'ارسال تیکت پشتیبانی',
              message: `تیکت «${subj}» به پشتیبانی و سامانه تندیس مدیریت ارسال شد.`,
              type: 'SUPPORT',
            });
            const refreshed = await fetchCustomerTickets(phone);
            setTickets(refreshed);
          }}
        />

        <RatingDialog
          request={ratingTarget}
          dark={false}
          onClose={() => setRatingTarget(null)}
          onSubmit={async (stars, comment) => {
            if (!ratingTarget) return;
            await rateCompletedRequest(ratingTarget.id, stars, comment);
            setRatingTarget(null);
            showToast('امتیاز شما با موفقیت ثبت شد.');
            pushLocalNotification({
              title: 'ثبت امتیاز متخصص',
              message: `امتیاز ${toPersianDigits(stars)} ستاره شما با موفقیت ثبت شد.`,
              type: 'ORDER',
            });
            runLiveSync(phone);
          }}
        />
      </div>
    </MotionConfig>
  );
}
