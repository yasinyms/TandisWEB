import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Download,
  Headphones,
  Phone,
  ReceiptText,
  Search,
  ShoppingBag,
  Star,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Header } from './components/Header';
import { SideDrawer } from './components/SideDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoriesGrid } from './components/CategoriesGrid';
import { ServiceApiIcon } from './components/ServiceApiIcon';
import { CtaBanner } from './components/CtaBanner';
import { HomeSkeleton, ServiceCatalogSkeleton } from './components/HomeSkeleton';
import { HamkarPanelShell } from './components/hamkar/HamkarPanelShell';
import { CustomerSignupView } from './components/CustomerSignupView';
import {
  AboutTandisView,
  ManagementExpertsView,
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
import { ALL_IRAN_CITIES } from './services/iranProvinces';
import {
  createTicket,
  fetchCustomerTickets,
  fetchLiveState,
  payRequestInvoice,
  rateCompletedRequest,
} from './services/tandisApi';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_ONLINE_STORE_PARTS,
  TRENDING_SEARCH_TAGS,
  formatToman,
  statusPersianLabel,
  statusStepIndex,
  toPersianDigits,
  toPurePersianText,
} from './services/tandisDefaults';
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

  // مودال‌های زنده
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
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
    (entry: { title: string; message: string; type: AppNotificationItem['type']; actionNav?: string; force?: boolean }) => {
      if (!phone && !entry.force) return;
      const nextItem: AppNotificationItem = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: entry.title,
        message: entry.message,
        type: entry.type,
        createdAtEpoch: Date.now(),
        isRead: false,
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
          data.activeCustomer?.full_name
        ) {
          const cleanName = data.activeCustomer.full_name.split('|')[0].trim();
          if (cleanName && cleanName !== customerName) {
            setCustomerName(cleanName);
            localStorage.setItem('tandis_name', cleanName);
          }
        }
        if (targetPhone) {
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
    const failsafe = window.setTimeout(() => setInitialLoading(false), 4000);
    runLiveSync(phone);
    const timer = window.setInterval(() => {
      runLiveSync(phone);
    }, 6000);
    return () => {
      window.clearTimeout(failsafe);
      window.clearInterval(timer);
    };
  }, [phone, runLiveSync]);

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
        byId.set(item.id, {
          ...item,
          isRead: Boolean(item.isRead) || readSet.has(item.id),
        });
      }
    }
    return Array.from(byId.values()).sort((a, b) => (b.createdAtEpoch || 0) - (a.createdAtEpoch || 0));
  }, [phone, liveState?.notifications, localNotifications, readNotifIds, clearedNotifIds]);

  const unreadNotificationsCount = useMemo(
    () => mergedNotifications.filter((n) => !n.isRead).length,
    [mergedNotifications]
  );

  const handleMarkAllNotificationsRead = useCallback(() => {
    const allIds = Array.from(new Set([...readNotifIds, ...mergedNotifications.map((n) => n.id)]));
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('tandis_read_notifs', JSON.stringify(allIds));
    } catch {
      // ignore
    }
  }, [readNotifIds, mergedNotifications]);

  const handleClearAllNotifications = useCallback(() => {
    const allIds = Array.from(new Set([...clearedNotifIds, ...mergedNotifications.map((n) => n.id)]));
    setClearedNotifIds(allIds);
    setLocalNotifications([]);
    try {
      localStorage.setItem('tandis_cleared_notifs', JSON.stringify(allIds));
      localStorage.setItem('tandis_local_notifs', '[]');
    } catch {
      // ignore
    }
  }, [clearedNotifIds, mergedNotifications]);

  // صرفاً اسلایدرهای واقعی دریافت‌شده از سرور مرکزی (بدون نمایش اسلایدرهای پیش‌فرض ساختگی)
  const liveSliders: PromoSlide[] = useMemo(() => {
    const raw = liveState?.sliders;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
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
    if (dest === 'store' || dest === 'tandispay' || dest === 'orders') {
      setActiveView('services');
      setServiceSubTab(dest);
      pushBrowserPath(`/${dest}`, ROUTE_TITLES[`/${dest}`]);
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
  }, []);

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

  const quickAccessCards = [
    {
      id: 'services',
      title: 'خدمات در محل',
      subtitle: '۳۱ خدمت با ضمانت',
      icon: Wrench,
      accent: 'from-[#0b5c60] to-[#0a8387]',
    },
    {
      id: 'store',
      title: 'فروشگاه قطعات',
      subtitle: 'قطعات اصلی و گارانتی',
      icon: ShoppingBag,
      accent: 'from-[#0d9488] to-[#0b5c60]',
    },
    {
      id: 'tandispay',
      title: 'تندیس‌پی',
      subtitle: 'کیف پول و اعتبار اقساطی',
      icon: Wallet,
      accent: 'from-[#d97706] to-[#f2a900]',
    },
    {
      id: 'downloads',
      title: 'اپلیکیشن تندیس',
      subtitle: 'نسخه مشتری و همکار',
      icon: Download,
      accent: 'from-[#12292c] to-[#0b5c60]',
    },
  ];

  const serviceSubTabs: Array<{ id: ServiceSubTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'catalog', label: 'خدمات', icon: Wrench },
    { id: 'store', label: 'قطعات', icon: ShoppingBag },
    { id: 'tandispay', label: 'تندیس‌پی', icon: Wallet },
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

  return (
    <MotionConfig reducedMotion="user">
      <div
        dir="rtl"
        className="min-h-screen bg-[#f2f9f9] text-[#12292c] flex flex-col selection:bg-[#0a8387]/20 selection:text-[#0b5c60]"
      >
        <OfflineIndicator />

        {/* هدر اصلی */}
        <Header
          selectedCity={selectedCityName}
          activeNav={headerActiveNav}
          onNavClick={handleNavigate}
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenCityModal={() => setShowCityModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          customerPhone={phone}
          customerName={phone ? customerName : ''}
          unreadNotificationsCount={phone ? unreadNotificationsCount : 0}
          onOpenNotifications={phone ? () => setShowNotificationsModal(true) : undefined}
          onOpenEditName={phone ? () => setShowEditNameModal(true) : undefined}
          onLogout={phone ? handleLogout : undefined}
        />

        {/* اعلان شناور بازخورد */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-20 lg:top-22 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#0b5c60] text-white px-5 py-3 text-xs font-extrabold shadow-[0_14px_34px_rgba(11,92,96,0.3)] border border-white/15 flex items-center gap-2 no-print max-w-[92vw]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#f2a900] shrink-0" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* محتوای اصلی صفحه با فاصله از هدر ثابت */}
        <main className="flex-1 pt-20 lg:pt-24 pb-24 lg:pb-10">
          {/* اعلان سراسری مدیریت */}
          {ota?.global_announcement_text && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mb-5 no-print">
              <div className="rounded-2xl bg-[#0b5c60] text-white text-xs font-bold px-4 py-2.5 flex items-center justify-center gap-2 shadow-xs">
                <BellRing className="w-4 h-4 text-[#f2a900] shrink-0" />
                <span>{toPurePersianText(ota.global_announcement_text)}</span>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <AnimatePresence mode="wait">
              {/* صفحه اصلی با Skeleton UI در زمان بارگذاری اولیه */}
              {activeView === 'home' && initialLoading && (
                <motion.div key="view-home-skeleton" {...VIEW_TRANSITION}>
                  <HomeSkeleton />
                </motion.div>
              )}

              {activeView === 'home' && !initialLoading && (
                <motion.div key="view-home" {...VIEW_TRANSITION} className="space-y-8 sm:space-y-10">
                  {/* نوار جستجو و انتخاب شهر */}
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    currentCity={selectedCityName}
                    onSearchSubmit={handleSearchSubmit}
                    onOpenCityModal={() => setShowCityModal(true)}
                  />

                  {/* بنر زنده نظرسنجی یا سفارش فعال برای کاربر واردشده */}
                  {phone && pendingRatingOrder && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-[#f2a900]/45 bg-gradient-to-l from-[#fffbeb] to-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#f2a900]/15 flex items-center justify-center shrink-0">
                          <Star className="w-6 h-6 text-[#d97706] fill-[#f2a900]" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-[#12292c]">
                            سفارش «{pendingRatingOrder.service_title}» با موفقیت تکمیل شد
                          </div>
                          <div className="text-xs text-[#5f777b] mt-0.5">
                            با ثبت امتیاز ۵ ستاره به ارتقای کیفیت متخصصان تندیس کمک کنید.
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => setRatingTarget(pendingRatingOrder)}
                        className="rounded-2xl bg-[#f2a900] hover:bg-[#dfa000] text-[#12292c] px-5 py-2.5 text-xs font-black cursor-pointer shadow-xs"
                      >
                        ثبت امتیاز و نظر
                      </motion.button>
                    </motion.div>
                  )}

                  {phone && activeOrder && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[2rem] tandis-calm-gradient text-white p-5 sm:p-6 space-y-4 shadow-[0_14px_34px_rgba(11,92,96,0.18)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-white/80 font-bold">پیگیری زنده سفارش فعال شما</div>
                          <h2 className="text-lg sm:text-xl font-black mt-0.5">{activeOrder.service_title}</h2>
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

                  {/* دسته‌بندی مینیمال خدمات تندیس (شامل دسته‌های جدید اضافه‌شده توسط مدیریت) */}
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
                        <h2 className="text-base sm:text-lg font-black text-[#12292c]">
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

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {quickAccessCards.map((card) => {
                        const Icon = card.icon;
                        return (
                          <motion.button
                            key={card.id}
                            type="button"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNavigate(card.id)}
                            className="group text-right rounded-2xl bg-white border border-[#e2efef] hover:border-[#0a8387]/50 p-4 sm:p-5 shadow-[0_4px_16px_rgba(11,92,96,0.04)] hover:shadow-[0_12px_26px_rgba(11,92,96,0.1)] transition-all flex flex-col justify-between gap-3 cursor-pointer"
                          >
                            <div
                              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} text-white flex items-center justify-center group-hover:scale-105 transition-transform`}
                            >
                              <Icon className="w-5 h-5" />
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

                  {/* بنر دعوت به عضویت متخصصان + دانلود اپلیکیشن‌ها */}
                  <CtaBanner
                    onOpenProviderSignup={() => handleNavigate('provider-signup')}
                    onExploreAllListings={() => handleNavigate('services')}
                    onOpenDownloads={() => handleNavigate('downloads')}
                  />
                </motion.div>
              )}

              {/* سامانه خدمات برخط زنده تندیس (۳۱ زیرخدمت + زیبایی + قطعات + تندیس‌پی + سفارش‌ها) */}
              {activeView === 'services' && (
                <motion.div key="view-services" {...VIEW_TRANSITION} className="space-y-6">
                  {/* نوار تب‌های خدمات برخط */}
                  <div className="rounded-3xl bg-white border border-[#dfecec] p-3 sm:p-4 shadow-[0_6px_24px_rgba(11,92,96,0.05)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {serviceSubTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = serviceSubTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setServiceSubTab(tab.id);
                              const nextPath = tab.id === 'catalog' ? '/services' : `/${tab.id}`;
                              pushBrowserPath(nextPath, ROUTE_TITLES[nextPath]);
                            }}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                              active
                                ? 'text-white'
                                : 'text-[#4a666a] hover:bg-[#f2f9f9] hover:text-[#12292c]'
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="services-subtab-bg"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className="absolute inset-0 rounded-2xl bg-[#0b5c60] shadow-xs"
                              />
                            )}
                            <Icon className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 px-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#eef4f5]">
                      <div className="text-xs">
                        <span className="text-[#5f777b]">کیف پول: </span>
                        <span className="font-black text-[#0b5c60] tabular-nums">
                          {formatToman(walletBalance)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setServiceSubTab('tandispay');
                          pushBrowserPath('/tandispay', ROUTE_TITLES['/tandispay']);
                        }}
                        className="rounded-xl bg-[#f2a900]/15 hover:bg-[#f2a900]/25 text-[#9a6700] px-3 py-1.5 text-[11px] font-black transition-colors cursor-pointer whitespace-nowrap"
                      >
                        شارژ سریع
                      </button>
                    </div>
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
                          <div className="flex items-center gap-3">
                            <ServiceApiIcon
                              iconKey={activeSelectedGroup.iconKey}
                              iconUrl={activeSelectedGroup.iconUrl}
                              groupSlug={activeSelectedGroup.slug}
                              colorHex={activeSelectedGroup.colorHex || activeSelectedGroup.accentHex}
                              iconStyle={activeSelectedGroup.iconStyle}
                              size="lg"
                              alt={activeSelectedGroup.title}
                            />
                            <div className="space-y-0.5">
                              <div className="text-[11px] font-bold text-[#0a8387]">دسته‌بندی انتخاب‌شده</div>
                              <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                                {activeSelectedGroup.title}
                              </h2>
                              <p className="text-xs text-[#5f777b]">{activeSelectedGroup.subtitle}</p>
                            </div>
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

                      {/* زیرخدمت‌های تخصصی (صرفاً پس از انتخاب دسته‌بندی یا جستجو نمایش داده می‌شوند تا صفحه خلوت و مینیمال بماند) */}
                      {(activeSelectedGroup || serviceSearchQuery.trim()) && (
                        <div className="space-y-6">
                          {filteredServiceCategories.map((group) => (
                            <section key={group.slug} className="space-y-4">
                              {(!activeSelectedGroup || group.slug === 'cat-beauty-personal') && (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  {!activeSelectedGroup && (
                                    <div>
                                      <h3 className="text-base sm:text-lg font-black text-[#12292c]">
                                        {group.title}
                                      </h3>
                                      <p className="text-xs text-[#5f777b]">{group.subtitle}</p>
                                    </div>
                                  )}
                                  {group.slug === 'cat-beauty-personal' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedGroupSlug('cat-beauty-personal');
                                        setShowBeautyBookingInsideCategory((prev) => !prev);
                                      }}
                                      className="rounded-xl bg-[#0a8387] hover:bg-[#0b5c60] text-white px-3.5 py-2 text-xs font-extrabold cursor-pointer whitespace-nowrap transition-colors"
                                    >
                                      {showBeautyBookingInsideCategory
                                        ? 'بستن تقویم نوبت‌دهی زیبایی بانوان'
                                        : 'زیرمجموعه زیبایی بانوان (نوبت‌دهی آنلاین)'}
                                    </button>
                                  )}
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
                                          <ServiceApiIcon
                                            iconKey={sub.iconKey}
                                            parentIconKey={group.iconKey}
                                            iconUrl={sub.iconUrl || group.iconUrl}
                                            subServiceId={sub.id}
                                            groupSlug={group.slug}
                                            colorHex={sub.colorHex || group.colorHex || group.accentHex}
                                            iconStyle={sub.iconStyle || group.iconStyle}
                                            size="md"
                                            alt={sub.title}
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

                            {/* زیرمجموعه زیبایی بانوان درون دسته «زیبایی و سلامت» */}
                            {group.slug === 'cat-beauty-personal' && showBeautyBookingInsideCategory && (
                              <div className="pt-2">
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
                              </div>
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

              {/* صفحه مدیریت و کارشناسان رسمی تندیس */}
              {activeView === 'management' && (
                <motion.div key="view-management" {...VIEW_TRANSITION}>
                  <ManagementExpertsView
                    dark={false}
                    supportPhone={supportPhone}
                    officialSpecialists={liveState?.officialSpecialists || []}
                    onNavigate={handleNavigate}
                    onOpenSupport={() => setShowTicketsModal(true)}
                  />
                </motion.div>
              )}

              {/* صفحه مستقل اخبار و مقالات (به‌زودی) */}
              {activeView === 'news' && (
                <motion.div key="view-news" {...VIEW_TRANSITION}>
                  <NewsArticlesView
                    dark={false}
                    onNavigateHome={() => handleNavigate('home')}
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
            if (restoredCity && restoredCity.trim()) {
              setSelectedCityName(restoredCity.trim());
              localStorage.setItem('tandis_city', restoredCity.trim());
            }
            showToast(`خوش آمدید ${name}!`);
            pushLocalNotification({
              title: 'ورود موفق به حساب تندیس',
              message: `خوش آمدید ${name}! حساب شما با شماره ${toPersianDigits(p)} فعال شد.`,
              type: 'AUTH',
              force: true,
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
