import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  Banknote,
  BellRing,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Headphones,
  History,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Navigation,
  Phone,
  Power,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  User,
  Wallet,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { ALL_IRAN_CITIES } from '../../services/iranProvinces';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';
import {
  HAMKAR_LOGO_SRC,
  acceptOrderFromRadar,
  buildHamkarSkillCatalog,
  cancelActiveMission,
  clearStoredHamkarLogin,
  compressHamkarImageStrict,
  confirmCustomerPriceDisagreementCancellation,
  doesRequestMatchSpecialistSkillAndCity,
  fetchHamkarLiveState,
  isBeautySpecialistProfile,
  isOrderPaidOnline,
  normalizeIranPhone,
  normalizeMissionStep,
  normalizeShaba,
  readStoredHamkarSession,
  releaseHamkarSessionLock,
  resolveCommissionPercent,
  resolveOrderCity,
  settlePaidOrderCommissionIdempotent,
  submitHamkarSupportTicket,
  syncSpecialistProfileUpdate,
  updateMissionStatus,
  validateShaba,
  writeStoredHamkarSession,
} from '../../services/hamkarApi';
import type {
  HamkarLiveStatePayload,
  HamkarOrderItem,
  HamkarSpecialistProfile,
  HamkarTab,
  InvoiceDossier,
} from '../../types/hamkar';
import { HamkarAuthAndWizard } from './HamkarAuthAndWizard';
import {
  HamkarDossierDetailModal,
  HamkarInvoiceModal,
  HamkarSettlementModal,
} from './HamkarInvoiceModal';
import { HamkarBeautyTab } from './HamkarBeautyTab';

interface HamkarPanelShellProps {
  initialMode?: 'login' | 'signup';
  onBackToSite: () => void;
}

const SUPPORT_PRESET_SUBJECTS = [
  'پیگیری تسویه و کیف پول',
  'مشکل در سفارش یا مشتری',
  'اصلاح مهارت یا شهر فعالیت',
  'گزارش خطای فنی یا پیشنهاد',
];

function sanitizeDisplayField(raw?: string | null, fallback = ''): string {
  const s = String(raw || '').trim();
  if (!s) return fallback;
  if (
    /\.(jpe?g|png|webp|gif|bmp|pdf|heic)$/i.test(s) ||
    /^(shename|shenasname|melli|card|photo|img|doc|file|avatar|selfie|license)[-_]/i.test(s) ||
    /^data:image\//i.test(s) ||
    /^https?:\/\//i.test(s) ||
    /\bapi\b/i.test(s)
  ) {
    return fallback;
  }
  return s;
}

const StructuredOrderDetails: React.FC<{ carModel?: string; issueDescription?: string }> = ({
  carModel,
  issueDescription,
}) => {
  const cleanModel = sanitizeDisplayField(carModel);
  const rawDesc = String(issueDescription || '').trim();
  const segments = rawDesc
    ? rawDesc
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
  if (!cleanModel && segments.length === 0) return null;

  return (
    <div className="rounded-xl bg-[#f8fbfb] p-3 border border-[#edf4f4] space-y-1.5 text-xs text-[#375155]">
      {cleanModel && (
        <div className="font-extrabold text-[#0b5c60]">
          مشخصات دستگاه / خودرو: <span className="text-[#12292c]">{cleanModel}</span>
        </div>
      )}
      {segments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {segments.map((seg, idx) => (
            <span
              key={`${idx}-${seg.slice(0, 16)}`}
              className="inline-block rounded-lg bg-white border border-[#e2efef] px-2.5 py-1 text-[11px] font-bold text-[#284246] leading-5"
            >
              {seg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const HamkarPanelShell: React.FC<HamkarPanelShellProps> = ({
  initialMode = 'login',
  onBackToSite,
}) => {
  const initialSession = useMemo(() => readStoredHamkarSession(), []);

  const [loggedPhone, setLoggedPhone] = useState<string>(
    initialSession.is_logged_in && initialSession.logged_in_phone ? initialSession.logged_in_phone : ''
  );
  const [specialist, setSpecialist] = useState<HamkarSpecialistProfile | null>(
    initialSession.is_logged_in ? initialSession.cached_specialist || null : null
  );
  const [liveState, setLiveState] = useState<HamkarLiveStatePayload | null>(null);
  const [initialSyncing, setInitialSyncing] = useState<boolean>(Boolean(loggedPhone));

  const [activeTab, setActiveTab] = useState<HamkarTab>('RADAR');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [forcedLogoutModal, setForcedLogoutModal] = useState<{ title: string; body: string } | null>(null);

  // مودال‌ها و وضعیت‌های عملیاتی
  const [invoiceOrder, setInvoiceOrder] = useState<HamkarOrderItem | null>(null);
  const [dossierViewer, setDossierViewer] = useState<InvoiceDossier | null>(null);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [shabaModalOpen, setShabaModalOpen] = useState(false);
  const [shabaDraft, setShabaDraft] = useState('');
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [profileInfoModalOpen, setProfileInfoModalOpen] = useState(false);
  const [birthDateDraft, setBirthDateDraft] = useState('');
  const [businessNameDraft, setBusinessNameDraft] = useState('');
  const [savingProfileInfo, setSavingProfileInfo] = useState(false);

  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [onlineSwitching, setOnlineSwitching] = useState(false);

  // تب درخواست‌های اخیر
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // تب پشتیبانی
  const [ticketSubject, setTicketSubject] = useState(SUPPORT_PRESET_SUBJECTS[0]);
  const [ticketMessage, setTicketMessage] = useState('');
  const [sendingTicket, setSendingTicket] = useState(false);

  const toastTimerRef = useRef<number | null>(null);
  const prevRadarIdsRef = useRef<Set<string>>(new Set());
  const settledOnceRef = useRef<Set<string>>(new Set());

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 4200);
  }, []);

  const handleForcedLogout = useCallback((title: string, body: string) => {
    clearStoredHamkarLogin();
    setLoggedPhone('');
    setSpecialist(null);
    setLiveState(null);
    setForcedLogoutModal({ title, body });
  }, []);

  // همگام‌سازی زنده ۲.۲ ثانیه‌ای (حتی در حالت آفلاین برای کشف Session Conflict و مسدودیت)
  const syncLive = useCallback(
    async (phoneToSync: string) => {
      if (!phoneToSync) return;
      try {
        const data = await fetchHamkarLiveState(phoneToSync);
        setLiveState(data);

        if (data.approvalStatus === 'BLOCKED' || data.approvalStatus === 'DELETED') {
          handleForcedLogout(
            'حساب کاربری غیرفعال شد',
            data.approvalStatus === 'BLOCKED'
              ? 'حساب همکار شما از سمت مدیریت مسدود شده است. جهت پیگیری با پشتیبانی تماس بگیرید.'
              : 'حساب همکار شما از سامانه حذف شده است.'
          );
          return;
        }

        // بررسی قفل تک‌دستگاهی session_lock_{phone}
        const stored = readStoredHamkarSession();
        if (
          data.sessionLock &&
          data.sessionLock.active &&
          stored.device_unique_id &&
          data.sessionLock.device_id &&
          data.sessionLock.device_id !== stored.device_unique_id
        ) {
          handleForcedLogout(
            'ورود با دستگاه دیگر شناسایی شد',
            'حساب تندیس همکار شما روی دستگاه دیگری فعال شد و نشست این مرورگر به‌صورت امن بسته شد.'
          );
          return;
        }

        if (data.specialist) {
          setSpecialist(data.specialist);
          writeStoredHamkarSession({
            cached_specialist: data.specialist,
            is_online: data.specialist.isOnline,
          });

          // تسویه خودکار و یک‌باره کمیسیون برای سفارش‌های پرداخت‌شده آنلاین
          const specPhone = normalizeIranPhone(data.specialist.phone);
          for (const ord of data.orders || []) {
            const assigned = normalizeIranPhone(ord.assigned_specialist_phone || ord.assigned_specialist_id || '');
            if (
              assigned === specPhone &&
              isOrderPaidOnline(ord) &&
              ord.price_toman > 0 &&
              !ord.is_commission_settled &&
              !settledOnceRef.current.has(ord.id)
            ) {
              settledOnceRef.current.add(ord.id);
              settlePaidOrderCommissionIdempotent(ord, data.specialist, data.commissionConfig).catch(() => {
                settledOnceRef.current.delete(ord.id);
              });
            }
          }
        }
      } catch {
        // در خطای لحظه‌ای شبکه، وضعیت فعلی حفظ می‌شود
      } finally {
        setInitialSyncing(false);
      }
    },
    [handleForcedLogout]
  );

  useEffect(() => {
    if (!loggedPhone) return;
    syncLive(loggedPhone);
    const interval = window.setInterval(() => {
      syncLive(loggedPhone);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [loggedPhone, syncLive]);

  const effectiveSpec = liveState?.specialist || specialist;
  const isBeautySpec = useMemo(() => isBeautySpecialistProfile(effectiveSpec), [effectiveSpec]);
  const orders = liveState?.orders || [];
  const commissionPercent = useMemo(
    () => resolveCommissionPercent(liveState?.commissionConfig, effectiveSpec?.categoryCode || ''),
    [liveState?.commissionConfig, effectiveSpec?.categoryCode]
  );

  // سفارش‌های مرتبط با این متخصص
  const myAssignedOrders = useMemo(() => {
    if (!effectiveSpec) return [];
    const myPhone = normalizeIranPhone(effectiveSpec.phone);
    return orders.filter(
      (o) => normalizeIranPhone(o.assigned_specialist_phone || o.assigned_specialist_id || '') === myPhone
    );
  }, [orders, effectiveSpec]);

  // ماموریت فعال (قفل تک‌ماموریتی)
  const activeMission = useMemo(() => {
    return (
      myAssignedOrders.find((o) => {
        const step = normalizeMissionStep(o.status);
        return step === 'ACCEPTED' || step === 'EN_ROUTE' || step === 'IN_PROGRESS';
      }) || null
    );
  }, [myAssignedOrders]);

  // سفارش‌های در انتظار رادار (تطبیق سخت‌گیرانه شهر + مهارت)
  const radarPendingOrders = useMemo(() => {
    if (!effectiveSpec || !effectiveSpec.isOnline || activeMission) return [];
    return orders.filter((o) => {
      const step = normalizeMissionStep(o.status);
      if (step !== 'PENDING_NEARBY') return false;
      if (o.assigned_specialist_phone && normalizeIranPhone(o.assigned_specialist_phone) !== normalizeIranPhone(effectiveSpec.phone)) {
        return false;
      }
      return doesRequestMatchSpecialistSkillAndCity(o, effectiveSpec);
    });
  }, [orders, effectiveSpec, activeMission]);

  // اعلان سفارش جدید در لیست سفارش‌ها
  useEffect(() => {
    if (!effectiveSpec?.isOnline) return;
    const currentIds = new Set(radarPendingOrders.map((o) => o.id));
    if (prevRadarIdsRef.current.size > 0) {
      const hasNew = radarPendingOrders.some((o) => !prevRadarIdsRef.current.has(o.id));
      if (hasNew) {
        showToast('سفارش جدید متناسب با مهارت و شهر شما ثبت شد!');
      }
    }
    prevRadarIdsRef.current = currentIds;
  }, [radarPendingOrders, effectiveSpec?.isOnline, showToast]);

  const completedOrders = useMemo(
    () => myAssignedOrders.filter((o) => normalizeMissionStep(o.status) === 'COMPLETED'),
    [myAssignedOrders]
  );

  const recentHistoryOrders = useMemo(() => {
    const q = historySearch.trim();
    return myAssignedOrders.filter((o) => {
      const step = normalizeMissionStep(o.status);
      if (historyFilter === 'COMPLETED' && step !== 'COMPLETED') return false;
      if (historyFilter === 'CANCELLED' && step !== 'CANCELLED') return false;
      if (!q) return true;
      return (
        (o.service_title || '').includes(q) ||
        (o.customer_name || '').includes(q) ||
        (o.home_address || '').includes(q)
      );
    });
  }, [myAssignedOrders, historySearch, historyFilter]);

  // آمار امتیاز و عملکرد رفتاری
  const reviews = liveState?.reviews || [];
  const avgRating = useMemo(() => {
    const ratings = reviews.map((r) => Number(r.rating ?? r.stars ?? 0)).filter((n) => n > 0);
    if (ratings.length === 0) return 5.0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }, [reviews]);

  const performanceStats = useMemo(() => {
    let arriveSum = 0;
    let arriveCount = 0;
    let workSum = 0;
    let workCount = 0;
    for (const o of myAssignedOrders) {
      const tags = String(o.customer_quality_tags || '');
      const a = tags.match(/ARRIVE_MIN:(\d+)/);
      const w = tags.match(/WORK_MIN:(\d+)/);
      if (a) {
        arriveSum += Number(a[1]);
        arriveCount++;
      }
      if (w) {
        workSum += Number(w[1]);
        workCount++;
      }
    }
    return {
      avgArriveMin: arriveCount > 0 ? Math.round(arriveSum / arriveCount) : 12,
      avgWorkMin: workCount > 0 ? Math.round(workSum / workCount) : 28,
      tierLabel:
        completedOrders.length >= 20 && avgRating >= 4.7
          ? 'متخصص طلایی تندیس'
          : completedOrders.length >= 5
          ? 'متخصص تاییدشده نقره‌ای'
          : 'متخصص رسمی تندیس',
    };
  }, [myAssignedOrders, completedOrders.length, avgRating]);

  // نمودار درآمد ۷ روز اخیر
  const last7DaysEarnings = useMemo(() => {
    const days: Array<{ label: string; net: number }> = [];
    const fmt = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' });
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      let sum = 0;
      for (const o of completedOrders) {
        const ts = Number(o.created_at_epoch || 0);
        if (ts >= dayStart && ts < dayEnd && o.price_toman > 0) {
          const comm = Math.round(o.price_toman * (commissionPercent / 100));
          sum += o.price_toman - comm;
        }
      }
      days.push({ label: fmt.format(d), net: sum });
    }
    return days;
  }, [completedOrders, commissionPercent]);

  const walletBalance = liveState?.wallet?.balance_toman ?? 0;
  const totalNetEarned = liveState?.wallet?.total_net_earned_toman ?? 0;
  const settlements = liveState?.settlements || [];
  const tickets = liveState?.tickets || [];
  const beautyAppointments = liveState?.beautyAppointments || [];
  const skillCatalog = useMemo(() => buildHamkarSkillCatalog(liveState?.categories), [liveState?.categories]);

  const myDossiers = useMemo(
    () => myAssignedOrders.map((o) => o.dossier).filter((d): d is InvoiceDossier => Boolean(d)),
    [myAssignedOrders]
  );

  /* ==================== اکشن‌های عملیاتی ==================== */
  const handleToggleOnline = async () => {
    if (!effectiveSpec) return;
    setOnlineSwitching(true);
    try {
      const nextOnline = !effectiveSpec.isOnline;
      const updated = await syncSpecialistProfileUpdate(effectiveSpec, { isOnline: nextOnline });
      setSpecialist(updated);
      writeStoredHamkarSession({ is_online: nextOnline, cached_specialist: updated });
      showToast(nextOnline ? 'وضعیت شما آنلاین شد · آماده دریافت سفارش‌های جدید' : 'وضعیت شما آفلاین شد.');
      syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در تغییر وضعیت آنلاین/آفلاین.');
    } finally {
      setOnlineSwitching(false);
    }
  };

  const handleChangeCity = async (cityName: string, lat: number, lng: number) => {
    if (!effectiveSpec) return;
    try {
      const updated = await syncSpecialistProfileUpdate(effectiveSpec, {
        serviceCity: cityName,
        serviceLat: lat,
        serviceLng: lng,
      });
      setSpecialist(updated);
      setCityModalOpen(false);
      showToast(`شهر فعال کاری به «${cityName}» تغییر یافت.`);
      syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در تغییر شهر فعالیت.');
    }
  };

  const handleAcceptOrder = async (order: HamkarOrderItem) => {
    if (!effectiveSpec) return;
    if (normalizeIranPhone(effectiveSpec.phone) === normalizeIranPhone(order.customer_phone)) {
      showToast('شماره موبایل متخصص و مشتری یکسان است و امکان پذیرش سفارش خودتان وجود ندارد.');
      return;
    }
    setBusyActionId(order.id);
    try {
      await acceptOrderFromRadar(order, effectiveSpec, avgRating);
      showToast('سفارش با موفقیت پذیرفته شد! می‌توانید با مشتری تماس بگیرید.');
      await syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در پذیرش سفارش.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleMissionStepUpdate = async (order: HamkarOrderItem, nextStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!effectiveSpec) return;
    setBusyActionId(order.id);
    try {
      await updateMissionStatus(order, effectiveSpec, nextStatus, liveState?.commissionConfig);
      showToast(
        nextStatus === 'IN_PROGRESS'
          ? 'شروع کار ثبت شد و به مشتری اطلاع‌رسانی گردید.'
          : 'ماموریت با موفقیت پایان یافت و درآمد به کیف پول شما اضافه شد.'
      );
      await syncLive(effectiveSpec.phone);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'بروزرسانی وضعیت ماموریت ناموفق بود.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleCancelMission = async (order: HamkarOrderItem) => {
    setBusyActionId(order.id);
    try {
      await cancelActiveMission(order);
      showToast('ماموریت لغو شد و سفارش به صف انتظار بازگشت.');
      if (effectiveSpec) await syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در لغو ماموریت.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleConfirmCustomerCancel = async (order: HamkarOrderItem) => {
    if (!effectiveSpec) return;
    setBusyActionId(order.id);
    try {
      await confirmCustomerPriceDisagreementCancellation(order, effectiveSpec);
      showToast('درخواست لغو مشتری تایید شد و پرونده بسته گردید.');
      await syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در تایید لغو مشتری.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleUploadAvatar = async (file?: File) => {
    if (!file || !effectiveSpec) return;
    try {
      const dataUrl = await compressHamkarImageStrict(file);
      const updated = await syncSpecialistProfileUpdate(effectiveSpec, { profilePhoto: dataUrl });
      setSpecialist(updated);
      showToast('تصویر پروفایل شما بروزرسانی و در سرور ذخیره شد.');
      syncLive(effectiveSpec.phone);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حجم تصویر نباید بیشتر از ۱ مگابایت باشد');
    }
  };

  const handleSaveShaba = async () => {
    if (!effectiveSpec) return;
    const check = validateShaba(shabaDraft);
    if (!check.valid) {
      showToast('شماره شبا نامعتبر است (IR و ۲۴ رقم).');
      return;
    }
    try {
      const updated = await syncSpecialistProfileUpdate(effectiveSpec, { shabaNumber: check.normalized });
      setSpecialist(updated);
      setShabaModalOpen(false);
      showToast(`شماره شبا (${check.bankName}) با موفقیت ذخیره شد.`);
      syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در ذخیره شماره شبا.');
    }
  };

  const handleChangeSkill = async (opt: { categoryCode: string; categoryGroup: string; roleTitle: string }) => {
    if (!effectiveSpec) return;
    try {
      const updated = await syncSpecialistProfileUpdate(effectiveSpec, {
        categoryCode: opt.categoryCode,
        categoryGroup: opt.categoryGroup,
        roleTitle: opt.roleTitle,
      });
      setSpecialist(updated);
      setSkillModalOpen(false);
      showToast(`مهارت تخصصی شما به «${opt.roleTitle}» تغییر یافت.`);
      syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در تغییر مهارت.');
    }
  };

  const handleSaveProfileInfo = async () => {
    if (!effectiveSpec) return;
    setSavingProfileInfo(true);
    try {
      const updated = await syncSpecialistProfileUpdate(effectiveSpec, {
        birthDate: birthDateDraft.trim(),
        businessName: businessNameDraft.trim(),
      });
      setSpecialist(updated);
      setProfileInfoModalOpen(false);
      showToast('تاریخ تولد و عنوان کسب‌وکار شما با موفقیت ذخیره شد.');
      syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در ذخیره اطلاعات پروفایل.');
    } finally {
      setSavingProfileInfo(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveSpec || !ticketMessage.trim()) return;
    setSendingTicket(true);
    try {
      await submitHamkarSupportTicket({
        phone: effectiveSpec.phone,
        fullName: effectiveSpec.fullName,
        subject: ticketSubject,
        message: ticketMessage.trim(),
      });
      setTicketMessage('');
      showToast('تیکت پشتیبانی با موفقیت برای مدیریت ارسال شد.');
      syncLive(effectiveSpec.phone);
    } catch {
      showToast('خطا در ارسال تیکت.');
    } finally {
      setSendingTicket(false);
    }
  };

  const handleLogout = async () => {
    const p = effectiveSpec?.phone || loggedPhone;
    if (p) await releaseHamkarSessionLock(p);
    setLoggedPhone('');
    setSpecialist(null);
    setLiveState(null);
    setDrawerOpen(false);
    showToast('با موفقیت از پنل تندیس همکار خارج شدید.');
  };

  /* ==================== اگر لاگین نیست: صفحه ورود/ویزارد ==================== */
  if (!loggedPhone || !effectiveSpec) {
    if (loggedPhone && initialSyncing) {
      return (
        <div dir="rtl" className="min-h-screen bg-[#f3f8f8] flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#f2a900]/40 p-2 shadow-sm">
            <img src={HAMKAR_LOGO_SRC} alt="تندیس همکار" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div className="flex items-center gap-2 text-sm font-black text-[#0b5c60]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>در حال بازیابی نشست زنده تندیس همکار...</span>
          </div>
        </div>
      );
    }

    return (
      <>
        {forcedLogoutModal && (
          <div dir="rtl" className="fixed inset-0 z-50 bg-[#12292c]/60 flex items-center justify-center p-4">
            <div className="max-w-sm w-full rounded-3xl bg-white p-6 text-center space-y-4 shadow-2xl border border-rose-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#12292c]">{forcedLogoutModal.title}</h3>
              <p className="text-xs text-[#5f777b] leading-6">{forcedLogoutModal.body}</p>
              <button
                type="button"
                onClick={() => setForcedLogoutModal(null)}
                className="w-full rounded-2xl bg-[#0b5c60] text-white py-3 text-xs font-black cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
        <HamkarAuthAndWizard
          initialMode={initialMode}
          dynamicCategories={liveState?.categories}
          onAuthenticated={({ phone: p, specialist: sp, displacedOther }) => {
            setLoggedPhone(p);
            setSpecialist(sp);
            writeStoredHamkarSession({
              logged_in_phone: p,
              is_logged_in: true,
              cached_specialist: sp,
              is_online: sp.isOnline,
            });
            showToast(
              displacedOther
                ? 'ورود انجام شد · نشست دستگاه قبلی شما به‌صورت امن بسته شد.'
                : `خوش آمدید ${sp.fullName}! پنل تندیس همکار فعال شد.`
            );
          }}
          onBackToSite={onBackToSite}
          onToast={showToast}
        />
      </>
    );
  }

  /* ==================== ناوبری پایین (۵ تب ثابت + تب شرطی زیبایی) ==================== */
  const bottomTabs: Array<{ id: HamkarTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'RADAR', label: 'میز کار', icon: ClipboardList },
    { id: 'REVIEWS_PROFILE', label: 'نظرات', icon: Star },
    { id: 'WALLET', label: 'کیف پول', icon: Wallet },
    ...(isBeautySpec ? [{ id: 'BEAUTY_DASHBOARD' as HamkarTab, label: 'زیبایی', icon: Sparkles }] : []),
    { id: 'SUPPORT', label: 'پشتیبانی', icon: Headphones },
    { id: 'ACCOUNT', label: 'حساب', icon: User },
  ];

  const activeMissionStep = activeMission ? normalizeMissionStep(activeMission.status) : null;
  const activeMissionPaid = activeMission ? isOrderPaidOnline(activeMission) : false;

  const cleanFullName = sanitizeDisplayField(effectiveSpec.fullName, 'همکار تندیس');
  const cleanRoleTitle = sanitizeDisplayField(effectiveSpec.roleTitle, 'متخصص رسمی تندیس');
  const cleanBirthDate = sanitizeDisplayField(effectiveSpec.birthDate);
  const cleanBusinessName = sanitizeDisplayField(effectiveSpec.businessName);
  const cleanNationalCode = sanitizeDisplayField(effectiveSpec.nationalCode);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f2f8f8] text-[#12292c] flex flex-col">
      {/* اعلان شناور */}
      {toastMsg && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#12292c] text-white px-5 py-3 text-xs font-extrabold shadow-xl border border-[#f2a900]/40 flex items-center gap-2 max-w-[92vw]">
          <BellRing className="w-4 h-4 text-[#f2a900] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* هدر مستقل پنل تندیس همکار (با عکس پروفایل خود همکار) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#dfecec] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="منوی پنل همکار"
              className="w-10 h-10 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] text-[#0b5c60] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ACCOUNT')}
              title="مشاهده پروفایل و تغییر تصویر"
              className="w-10 h-10 rounded-xl bg-white border border-[#f2a900]/45 shrink-0 overflow-hidden cursor-pointer flex items-center justify-center"
            >
              {effectiveSpec.profilePhoto ? (
                <img
                  src={effectiveSpec.profilePhoto}
                  alt={cleanFullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#0b5c60] text-white flex items-center justify-center text-sm font-black">
                  {cleanFullName.slice(0, 1)}
                </div>
              )}
            </button>

            <div className="min-w-0">
              <div className="text-sm font-black text-[#12292c] truncate">{cleanFullName}</div>
              <div className="text-[11px] font-bold text-[#b47b00] truncate">
                {cleanRoleTitle} · {effectiveSpec.serviceCity}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={onlineSwitching}
              onClick={handleToggleOnline}
              className={`rounded-xl px-3 py-2 text-xs font-black inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                effectiveSpec.isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{effectiveSpec.isOnline ? 'آنلاین' : 'آفلاین'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              title="بازگشت به سایت تندیس"
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] border border-[#dcecec] px-3 py-2 text-xs font-extrabold text-[#0b5c60] cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>سایت تندیس</span>
            </button>
          </div>
        </div>
      </header>

      {/* منوی کشویی اختصاصی همکار */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-[#12292c]/45 backdrop-blur-xs cursor-pointer"
          />
          <aside className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl border-l border-[#dcecec] flex flex-col z-10">
            <div className="p-4 border-b border-[#eef4f5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {effectiveSpec.profilePhoto ? (
                  <img
                    src={effectiveSpec.profilePhoto}
                    alt={effectiveSpec.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-[#f2a900]/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#0b5c60] text-white flex items-center justify-center font-black">
                    {effectiveSpec.fullName.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#12292c] truncate">{effectiveSpec.fullName}</div>
                  <div dir="ltr" className="text-[11px] font-bold text-[#5f777b] text-right">
                    {effectiveSpec.personnelCode}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#f4fafa] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-[#5f777b]" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {[
                { id: 'RADAR' as HamkarTab, label: 'میز کار و سفارش‌ها', icon: ClipboardList },
                { id: 'ACTIVE_MISSION' as HamkarTab, label: 'ماموریت فعال من', icon: Navigation },
                { id: 'RECENT_REQUESTS' as HamkarTab, label: 'درخواست‌های اخیر و بایگانی', icon: History },
                ...(isBeautySpec
                  ? [{ id: 'BEAUTY_DASHBOARD' as HamkarTab, label: 'پنل تخصصی زیبایی بانوان', icon: Sparkles }]
                  : []),
                { id: 'WALLET' as HamkarTab, label: 'کیف پول و تسویه شبا', icon: Wallet },
                { id: 'REVIEWS_PROFILE' as HamkarTab, label: 'نظرات مشتریان و عملکرد', icon: Star },
                { id: 'SUPPORT' as HamkarTab, label: 'پشتیبانی آنلاین مدیریت', icon: Headphones },
                { id: 'ACCOUNT' as HamkarTab, label: 'حساب کاربری و مدارک', icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                      active ? 'bg-[#eff8f8] text-[#0b5c60] font-black' : 'text-[#12292c] hover:bg-[#f6fbfb] font-bold'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[#eef4f5] space-y-2">
              <button
                type="button"
                onClick={onBackToSite}
                className="w-full rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] text-[#0b5c60] py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به سایت تندیس</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج امن از پنل همکار</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* محتوای اصلی تب فعال */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 pb-24 space-y-5">
        {/* ==================== تب ۱: میز کار و رادار زنده (RADAR) ==================== */}
        {activeTab === 'RADAR' && (
          <div className="space-y-5">
            {/* کارت بالایی کیف پول + شهر رادار + وضعیت آنلاین */}
            <div className="rounded-[2rem] bg-gradient-to-l from-[#0b5c60] via-[#0a7175] to-[#0b5c60] text-white p-5 sm:p-6 shadow-[0_14px_34px_rgba(11,92,96,0.2)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white/75 font-bold">موجودی قابل تسویه کیف پول همکار</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#f2a900] mt-1 tabular-nums">
                    {formatToman(walletBalance)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCityModalOpen(true)}
                    className="rounded-xl bg-white/15 hover:bg-white/25 px-3.5 py-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#f2a900]" />
                    <span>شهر: {effectiveSpec.serviceCity}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('WALLET')}
                    className="rounded-xl bg-[#f2a900] text-[#12292c] px-3.5 py-2 text-xs font-black cursor-pointer"
                  >
                    تسویه شبا
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/15 text-center">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-[11px] text-white/75 whitespace-nowrap">تکمیل‌شده</div>
                  <div className="text-xs sm:text-sm font-black mt-0.5 tabular-nums whitespace-nowrap">
                    {toPersianDigits(completedOrders.length)} ماموریت
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-[11px] text-white/75 whitespace-nowrap">امتیاز شما</div>
                  <div className="text-xs sm:text-sm font-black mt-0.5 tabular-nums whitespace-nowrap">
                    {toPersianDigits(avgRating.toFixed(1))} از ۵
                  </div>
                </div>
              </div>
            </div>

            {/* دسترسی سریع پنل زیبایی برای متخصصان زیبایی */}
            {isBeautySpec && (
              <div className="rounded-2xl bg-gradient-to-l from-[#fffbeb] to-white border border-[#f2a900]/40 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f2a900]/15 text-[#b47b00] flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#12292c]">
                      تقویم ۳۰ روزه و نوبت‌های زیبایی ({toPersianDigits(beautyAppointments.length)} نوبت)
                    </div>
                    <div className="text-[11px] text-[#5f777b]">مدیریت ساعات خالی، نمونه‌کارها و نوبت‌های رزروشده</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('BEAUTY_DASHBOARD')}
                  className="rounded-xl bg-[#0b5c60] text-white px-4 py-2 text-xs font-black cursor-pointer"
                >
                  ورود به پنل زیبایی
                </button>
              </div>
            )}

            {/* ===== کارت ماموریت فعال (قفل تک‌ماموریتی) ===== */}
            {activeMission && (
              <div className="space-y-3">
                {/* کارت هشدار درخواست لغو مشتری به علت عدم توافق قیمت */}
                {activeMission.cancel_requested_by_customer && (
                  <div className="rounded-3xl bg-rose-50 border-2 border-rose-300 p-4 sm:p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-black text-rose-800">
                          مشتری درخواست لغو سفارش ثبت کرده است
                        </h3>
                        <p className="text-xs text-rose-700 mt-1">
                          دلیل مشتری: {activeMission.customer_cancel_reason || 'عدم توافق بر سر مبلغ فاکتور'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busyActionId === activeMission.id}
                      onClick={() => handleConfirmCustomerCancel(activeMission)}
                      className="w-full sm:w-auto rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-black cursor-pointer"
                    >
                      تایید لغو درخواست و بستن پرونده
                    </button>
                  </div>
                )}

                <div className="rounded-[2rem] bg-white border-2 border-[#0b5c60] shadow-[0_14px_34px_rgba(11,92,96,0.12)] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h2 className="text-base font-black text-[#12292c]">
                        ماموریت فعال: {activeMission.service_title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ACTIVE_MISSION')}
                      className="text-xs font-black text-[#0b5c60] hover:underline cursor-pointer"
                    >
                      جزئیات کامل ماموریت ←
                    </button>
                  </div>

                  {/* نوار ۳ مرحله‌ای وضعیت */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                    {[
                      { label: '۱. تایید سفارش', active: true },
                      { label: '۲. در حال انجام', active: activeMissionStep === 'IN_PROGRESS' },
                      { label: '۳. اتمام کار', active: activeMissionStep === 'COMPLETED' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={`rounded-xl py-2 px-2 ${
                          s.active ? 'bg-[#0b5c60] text-white' : 'bg-[#eff6f6] text-[#6d8589]'
                        }`}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-[#f6fbfb] border border-[#dcecec] p-3.5 text-xs space-y-2">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span>مشتری: <strong>{activeMission.customer_name}</strong></span>
                      <span dir="ltr" className="font-bold text-[#0b5c60]">{toPersianDigits(activeMission.customer_phone)}</span>
                    </div>
                    <div className="text-[#375155]">
                      نشانی: {resolveOrderCity(activeMission) || effectiveSpec.serviceCity} · {activeMission.neighborhood} · {activeMission.home_address}
                    </div>
                    <StructuredOrderDetails
                      carModel={activeMission.car_model}
                      issueDescription={activeMission.issue_description}
                    />
                    {activeMission.price_toman > 0 && (
                      <div className="pt-1.5 border-t border-[#e2efef] flex flex-wrap items-center justify-between gap-2">
                        <span>مبلغ فاکتور: <strong className="text-[#0b5c60] tabular-nums">{formatToman(activeMission.price_toman)}</strong></span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                            activeMissionPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {activeMissionPaid ? 'پرداخت آنلاین انجام شد' : 'در انتظار پرداخت مشتری'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* دکمه‌های کناری صدور فاکتور + شروع کار / منتظر پرداخت / پایان کار */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(activeMission)}
                      className="rounded-2xl bg-[#f2a900] hover:bg-[#dfa000] text-[#12292c] py-3 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ReceiptText className="w-4 h-4" />
                      <span>{activeMission.price_toman > 0 ? 'ویرایش / صدور مجدد فاکتور' : 'صدور فاکتور'}</span>
                    </button>

                    {activeMissionStep !== 'IN_PROGRESS' ? (
                      <button
                        type="button"
                        disabled={busyActionId === activeMission.id}
                        onClick={() => handleMissionStepUpdate(activeMission, 'IN_PROGRESS')}
                        className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white py-3 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>شروع کار</span>
                      </button>
                    ) : activeMissionPaid ? (
                      <button
                        type="button"
                        disabled={busyActionId === activeMission.id}
                        onClick={() => handleMissionStepUpdate(activeMission, 'COMPLETED')}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>پایان کار و واریز به کیف پول</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="rounded-2xl bg-slate-200 text-slate-500 py-3 text-xs font-black flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" />
                        <span>منتظر پرداخت مشتری</span>
                      </button>
                    )}
                  </div>

                  {/* نوار آیکون تماس / پیامک / لغو قرمز */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eef4f5]">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${activeMission.customer_phone}`}
                        className="rounded-xl bg-[#eff8f8] hover:bg-[#dff1f1] text-[#0b5c60] px-3.5 py-2 text-xs font-black inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> تماس با مشتری
                      </a>
                      <a
                        href={`sms:${activeMission.customer_phone}`}
                        className="rounded-xl bg-[#eff8f8] hover:bg-[#dff1f1] text-[#0b5c60] px-3.5 py-2 text-xs font-black inline-flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> پیامک
                      </a>
                    </div>
                    <button
                      type="button"
                      disabled={busyActionId === activeMission.id}
                      onClick={() => handleCancelMission(activeMission)}
                      className="rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3.5 py-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> لغو ماموریت
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== لیست سفارش‌های در انتظار ===== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-black text-[#12292c] flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#0b5c60]" />
                  <span>سفارش‌های جدید متناسب با مهارت شما ({effectiveSpec.serviceCity})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => syncLive(effectiveSpec.phone)}
                  className="text-xs font-bold text-[#0b5c60] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> بروزرسانی
                </button>
              </div>

              {!effectiveSpec.isOnline ? (
                <div className="rounded-3xl bg-white border border-[#e2efef] p-8 text-center space-y-3">
                  <Power className="w-8 h-8 mx-auto text-slate-400" />
                  <div className="text-sm font-black text-[#12292c]">شما در حالت آفلاین هستید</div>
                  <p className="text-xs text-[#5f777b]">
                    برای مشاهده و پذیرش سفارش‌های جدید شهر {effectiveSpec.serviceCity}، وضعیت خود را آنلاین کنید.
                  </p>
                  <button
                    type="button"
                    onClick={handleToggleOnline}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-black cursor-pointer"
                  >
                    آنلاین شدن و دریافت سفارش
                  </button>
                </div>
              ) : activeMission ? (
                <div className="rounded-2xl bg-[#fffdf5] border border-[#f2a900]/40 p-4 text-xs font-bold text-[#8a5b00] flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>تا زمان پایان ماموریت فعال فعلی، پذیرش سفارش جدید غیرفعال است.</span>
                </div>
              ) : radarPendingOrders.length === 0 ? (
                <div className="rounded-3xl bg-white border border-[#e2efef] p-8 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#eff8f8] text-[#0b5c60] flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-black text-[#12292c]">در انتظار سفارش جدید در شهر شما</div>
                  <p className="text-xs text-[#5f777b]">
                    سفارش‌های جدید در شهر «{effectiveSpec.serviceCity}» متناسب با مهارت «{cleanRoleTitle}» به‌صورت خودکار اینجا نمایش داده می‌شوند.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {radarPendingOrders.map((order) => {
                    const isSelfOrder =
                      normalizeIranPhone(effectiveSpec.phone) === normalizeIranPhone(order.customer_phone);
                    return (
                      <div
                        key={order.id}
                        className="rounded-3xl bg-white border border-[#dcecec] hover:border-[#0b5c60]/50 p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-black text-[#12292c]">{order.service_title}</h3>
                              {order.is_urgent && (
                                <span className="rounded-lg bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-black">
                                  فوری
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#5f777b] mt-1">
                              {resolveOrderCity(order) || effectiveSpec.serviceCity} · {order.neighborhood || 'محدوده ثبت‌شده'} · {order.home_address}
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-[#0b5c60] bg-[#eff8f8] px-3 py-1 rounded-xl">
                            مشتری: {order.customer_name}
                          </span>
                        </div>

                        <StructuredOrderDetails
                          carModel={order.car_model}
                          issueDescription={order.issue_description}
                        />

                        {isSelfOrder ? (
                          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>شماره موبایل متخصص و مشتری یکسان است و امکان پذیرش سفارش خودتان وجود ندارد.</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={busyActionId === order.id}
                            onClick={() => handleAcceptOrder(order)}
                            className="w-full rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-60 text-white py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {busyActionId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-[#f2a900]" />
                            )}
                            <span>قبول سفارش و شروع اعزام</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* کارت دسترسی سریع به درخواست‌های اخیر */}
            <div className="rounded-3xl bg-white border border-[#e2efef] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff8f8] text-[#0b5c60] flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#12292c]">تاریخچه و بایگانی درخواست‌های شما</div>
                  <div className="text-[11px] text-[#5f777b]">
                    مجموع {toPersianDigits(myAssignedOrders.length)} درخواست ثبت‌شده در کارنامه
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('RECENT_REQUESTS')}
                className="rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] text-[#0b5c60] px-3.5 py-2 text-xs font-black cursor-pointer"
              >
                مشاهده همه
              </button>
            </div>
          </div>
        )}

        {/* ==================== تب ماموریت فعال (ACTIVE_MISSION) ==================== */}
        {activeTab === 'ACTIVE_MISSION' && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-[#12292c]">جزئیات کامل ماموریت فعال</h2>
            {!activeMission ? (
              <div className="rounded-3xl bg-white border border-[#e2efef] p-10 text-center space-y-3">
                <Navigation className="w-8 h-8 mx-auto text-[#0b5c60]/40" />
                <p className="text-sm font-bold text-[#5f777b]">در حال حاضر ماموریت فعالی ندارید.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('RADAR')}
                  className="rounded-xl bg-[#0b5c60] text-white px-5 py-2.5 text-xs font-black cursor-pointer"
                >
                  بازگشت به میز کار
                </button>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-[#dcecec] p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eef4f5]">
                  <div>
                    <h3 className="text-base font-black text-[#12292c]">{activeMission.service_title}</h3>
                    <div className="text-xs text-[#5f777b] mt-0.5">شناسه درخواست: {activeMission.id}</div>
                  </div>
                  <span className="rounded-xl bg-[#eff8f8] text-[#0b5c60] px-3 py-1.5 text-xs font-black">
                    {activeMissionStep === 'IN_PROGRESS' ? 'در حال انجام' : 'تاییدشده'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-[#f8fbfb] p-3.5 border border-[#e2efef]">
                    <div className="text-[#5f777b]">مشتری و تماس</div>
                    <div className="font-black text-[#12292c] mt-1">{activeMission.customer_name}</div>
                    <div dir="ltr" className="font-bold text-[#0b5c60] text-right mt-0.5">
                      {toPersianDigits(activeMission.customer_phone)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f8fbfb] p-3.5 border border-[#e2efef]">
                    <div className="text-[#5f777b]">نشانی و مسیریابی</div>
                    <div className="font-bold text-[#12292c] mt-1">
                      {resolveOrderCity(activeMission)} · {activeMission.neighborhood} · {activeMission.home_address}
                    </div>
                    {activeMission.customer_lat && activeMission.customer_lng ? (
                      <a
                        href={`https://maps.google.com/?q=${activeMission.customer_lat},${activeMission.customer_lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#0b5c60] font-black mt-1.5 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> باز کردن روی نقشه
                      </a>
                    ) : null}
                  </div>
                </div>

                <StructuredOrderDetails
                  carModel={activeMission.car_model}
                  issueDescription={activeMission.issue_description}
                />

                {activeMission.client_documents && (
                  <div className="rounded-2xl bg-[#fffdf5] p-4 border border-[#f2a900]/40 text-xs">
                    <div className="font-black text-[#8a5b00] mb-1">مدارک پرونده مشتری (خدمات حقوقی/تخصصی):</div>
                    <p className="text-[#375155] leading-6">{activeMission.client_documents}</p>
                  </div>
                )}

                {activeMission.dossier && (
                  <button
                    type="button"
                    onClick={() => setDossierViewer(activeMission.dossier || null)}
                    className="w-full rounded-2xl bg-[#eff8f8] hover:bg-[#e1f2f2] text-[#0b5c60] py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> مشاهده پرونده کامل فاکتور صادرشده
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== تب درخواست‌های اخیر (RECENT_REQUESTS) ==================== */}
        {activeTab === 'RECENT_REQUESTS' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-white border border-[#e2efef] p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5f777b] absolute right-3.5 top-3" />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="جستجو بر اساس خدمت، نام مشتری یا نشانی..."
                  className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] pr-10 pl-4 py-2.5 text-xs font-bold outline-none"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'ALL' as const, label: 'همه' },
                  { id: 'COMPLETED' as const, label: 'تکمیل‌شده' },
                  { id: 'CANCELLED' as const, label: 'لغوشده' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      historyFilter === f.id ? 'bg-[#0b5c60] text-white' : 'bg-[#f4fafa] text-[#5f777b]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {recentHistoryOrders.length === 0 ? (
              <div className="rounded-3xl bg-white border border-[#e2efef] p-8 text-center text-xs font-bold text-[#5f777b]">
                درخواستی مطابق فیلتر شما یافت نشد.
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistoryOrders.map((ord) => {
                  const st = normalizeMissionStep(ord.status);
                  return (
                    <div key={ord.id} className="rounded-3xl bg-white border border-[#dcecec] p-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-[#12292c]">{ord.service_title}</div>
                          <div className="text-xs text-[#5f777b]">
                            مشتری: {ord.customer_name} · {resolveOrderCity(ord)}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                            st === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : st === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {st === 'COMPLETED' ? 'تکمیل‌شده' : st === 'CANCELLED' ? 'لغوشده' : 'فعال'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eef4f5] text-xs">
                        <span className="font-bold text-[#0b5c60] tabular-nums">
                          {ord.price_toman > 0 ? formatToman(ord.price_toman) : 'بدون فاکتور'}
                        </span>
                        {ord.dossier && (
                          <button
                            type="button"
                            onClick={() => setDossierViewer(ord.dossier || null)}
                            className="rounded-xl bg-[#eff8f8] text-[#0b5c60] px-3 py-1.5 text-[11px] font-black cursor-pointer"
                          >
                            مشاهده فاکتور رسمی
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== تب ۲: نظرات و عملکرد رفتاری (REVIEWS_PROFILE) ==================== */}
        {activeTab === 'REVIEWS_PROFILE' && (
          <div className="space-y-5">
            <div className="rounded-[2rem] bg-white border border-[#dcecec] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#fff8e1] text-[#d97706] flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#12292c]">{performanceStats.tierLabel}</h2>
                    <p className="text-xs text-[#5f777b]">
                      کد پرسنلی: <strong dir="ltr">{effectiveSpec.personnelCode}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-[#0b5c60] tabular-nums">
                    {toPersianDigits(avgRating.toFixed(1))} ★
                  </div>
                  <div className="text-[11px] text-[#5f777b]">{toPersianDigits(reviews.length)} نظر تاییدشده</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-[#f6fbfb] border border-[#e2efef] p-3">
                  <div className="text-[11px] text-[#5f777b]">میانگین زمان رسیدن</div>
                  <div className="text-sm font-black text-[#0b5c60] mt-1 tabular-nums">
                    {toPersianDigits(performanceStats.avgArriveMin)} دقیقه
                  </div>
                </div>
                <div className="rounded-2xl bg-[#f6fbfb] border border-[#e2efef] p-3">
                  <div className="text-[11px] text-[#5f777b]">میانگین زمان اجرا</div>
                  <div className="text-sm font-black text-[#0b5c60] mt-1 tabular-nums">
                    {toPersianDigits(performanceStats.avgWorkMin)} دقیقه
                  </div>
                </div>
                <div className="rounded-2xl bg-[#f6fbfb] border border-[#e2efef] p-3">
                  <div className="text-[11px] text-[#5f777b]">ماموریت‌های موفق</div>
                  <div className="text-sm font-black text-[#0b5c60] mt-1 tabular-nums">
                    {toPersianDigits(completedOrders.length)} مورد
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#12292c]">نظرات تاییدشده مشتریان</h3>
              {reviews.length === 0 ? (
                <div className="rounded-3xl bg-white border border-[#e2efef] p-8 text-center text-xs font-bold text-[#5f777b]">
                  هنوز نظری از مشتریان ثبت نشده است.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="rounded-3xl bg-white border border-[#dcecec] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#12292c]">{rev.customer_name || 'مشتری تندیس'}</span>
                      <span className="text-xs font-black text-[#d97706] tabular-nums">
                        {toPersianDigits(rev.rating ?? rev.stars ?? 5)} ★
                      </span>
                    </div>
                    {rev.service_title && <div className="text-[11px] text-[#0b5c60] font-bold">{rev.service_title}</div>}
                    <p className="text-xs text-[#375155] leading-6">{rev.comment || 'کیفیت عالی و برخورد حرفه‌ای.'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== تب ۳: کارنامه مالی، کیف پول و تسویه (WALLET) ==================== */}
        {activeTab === 'WALLET' && (
          <div className="space-y-5">
            <div className="rounded-[2rem] bg-gradient-to-l from-[#0b5c60] to-[#0a8387] text-white p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white/80">موجودی قابل تسویه کیف پول</div>
                  <div className="text-3xl font-black text-[#f2a900] mt-1 tabular-nums">
                    {formatToman(walletBalance)}
                  </div>
                </div>
                <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-black">
                  کارمزد فعال: {toPersianDigits(commissionPercent)}٪
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15">
                <div className="text-xs">
                  <span className="text-white/75">مجموع درآمد خالص: </span>
                  <strong className="tabular-nums">{formatToman(totalNetEarned)}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSettlementModalOpen(true)}
                  className="rounded-xl bg-[#f2a900] hover:bg-[#dfa000] text-[#12292c] px-4 py-2.5 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>درخواست تسویه آنی به شبا</span>
                </button>
              </div>
            </div>

            {/* نمودار درآمد ۷ روز اخیر */}
            <div className="rounded-3xl bg-white border border-[#dcecec] p-5 space-y-4">
              <h3 className="text-sm font-black text-[#12292c]">نمودار درآمد خالص ۷ روز اخیر</h3>
              <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
                {(() => {
                  const maxVal = Math.max(1, ...last7DaysEarnings.map((d) => d.net));
                  return last7DaysEarnings.map((d) => {
                    const pct = Math.max(8, Math.round((d.net / maxVal) * 100));
                    return (
                      <div key={d.label} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          title={formatToman(d.net)}
                          style={{ height: `${pct}%` }}
                          className={`w-full max-w-[34px] rounded-t-xl transition-all ${
                            d.net > 0 ? 'bg-gradient-to-t from-[#0b5c60] to-[#0a8387]' : 'bg-[#e6f1f1]'
                          }`}
                        />
                        <span className="text-[10px] font-bold text-[#5f777b] truncate max-w-full">{d.label}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* لیست درخواست‌های تسویه */}
            <div className="rounded-3xl bg-white border border-[#dcecec] p-5 space-y-3">
              <h3 className="text-sm font-black text-[#12292c]">تاریخچه درخواست‌های تسویه شبا</h3>
              {settlements.length === 0 ? (
                <div className="text-xs text-[#5f777b] text-center py-6 font-bold">
                  هنوز درخواست تسویه‌ای ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {settlements.map((st) => (
                    <div
                      key={st.id}
                      className="rounded-2xl bg-[#f8fbfb] border border-[#e2efef] p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-black text-[#12292c] tabular-nums">{formatToman(st.amount_toman)}</div>
                        <div dir="ltr" className="text-[11px] text-[#5f777b] text-right">{st.shaba_number}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                          String(st.status).toUpperCase().includes('PAID') || String(st.status).toUpperCase().includes('APPROVED')
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {String(st.status).toUpperCase().includes('PAID') ? 'واریز شده' : 'در انتظار تایید مالی'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== تب زیبایی (شرطی) ==================== */}
        {activeTab === 'BEAUTY_DASHBOARD' && isBeautySpec && (
          <HamkarBeautyTab
            specialist={effectiveSpec}
            beautyProfile={liveState?.beautyProfile || null}
            beautySchedule={liveState?.beautySchedule || null}
            beautyAppointments={beautyAppointments}
            avgRating={avgRating}
            completedJobs={completedOrders.length}
            onRefresh={() => syncLive(effectiveSpec.phone)}
            onToast={showToast}
          />
        )}

        {/* ==================== تب ۴: پشتیبانی آنلاین (SUPPORT) ==================== */}
        {activeTab === 'SUPPORT' && (
          <div className="space-y-5">
            <form onSubmit={handleSubmitTicket} className="rounded-3xl bg-white border border-[#dcecec] p-5 space-y-4">
              <div className="flex items-center gap-2 font-black text-sm text-[#12292c]">
                <Headphones className="w-4 h-4 text-[#0b5c60]" />
                <span>ارسال تیکت پشتیبانی مستقیم به مدیریت تندیس</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUPPORT_PRESET_SUBJECTS.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setTicketSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      ticketSubject === subj
                        ? 'bg-[#0b5c60] text-white border-[#0b5c60]'
                        : 'bg-[#f8fbfb] text-[#375155] border-[#dcecec]'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="متن پیام یا درخواست خود را با جزئیات بنویسید..."
                className="w-full rounded-2xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] p-3.5 text-xs font-bold outline-none"
              />

              <button
                type="submit"
                disabled={sendingTicket || !ticketMessage.trim()}
                className="rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-50 text-white px-5 py-2.5 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
              >
                {sendingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>ارسال تیکت به واحد پشتیبانی</span>
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#12292c]">تیکت‌های ارسالی و پاسخ مدیریت</h3>
              {tickets.length === 0 ? (
                <div className="rounded-3xl bg-white border border-[#e2efef] p-8 text-center text-xs font-bold text-[#5f777b]">
                  هنوز تیکتی ثبت نکرده‌اید.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="rounded-3xl bg-white border border-[#dcecec] p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#12292c]">{t.subject}</span>
                      <span className="rounded-lg bg-[#eff8f8] text-[#0b5c60] px-2.5 py-0.5 text-[10px] font-black">
                        {t.admin_reply ? 'پاسخ داده شده' : 'در حال بررسی'}
                      </span>
                    </div>
                    <p className="text-xs text-[#375155] leading-6">{t.message}</p>
                    {t.admin_reply && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                        <strong className="block mb-1">پاسخ مدیریت تندیس:</strong>
                        {t.admin_reply}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== تب ۵: حساب کاربری (ACCOUNT) ==================== */}
        {activeTab === 'ACCOUNT' && (
          <div className="space-y-5">
            {/* کارت پروفایل و تغییر آواتار (<1MB) */}
            <div className="rounded-[2rem] bg-white border border-[#dcecec] p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <label className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#f2a900]/50 cursor-pointer group shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadAvatar(e.target.files?.[0])}
                  />
                  {effectiveSpec.profilePhoto ? (
                    <img
                      src={effectiveSpec.profilePhoto}
                      alt={effectiveSpec.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0b5c60] text-white flex items-center justify-center text-xl font-black">
                      {effectiveSpec.fullName.slice(0, 1)}
                    </div>
                  )}
                  <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </span>
                </label>

                <div>
                  <div className="text-base font-black text-[#12292c] flex items-center gap-1.5">
                    <span>{effectiveSpec.fullName}</span>
                    <BadgeCheck className="w-4 h-4 text-[#0b5c60]" />
                  </div>
                  <div className="text-xs text-[#5f777b] mt-0.5">
                    کد پرسنلی: <strong dir="ltr">{effectiveSpec.personnelCode}</strong>
                  </div>
                  <div className="text-[11px] font-bold text-[#b47b00] mt-0.5">
                    برای تغییر عکس پرسنلی (زیر ۱ مگابایت) روی آواتار کلیک کنید
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-4 py-2.5 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> خروج از حساب
              </button>
            </div>

            {/* تنظیمات قابل ویرایش (شبا، مهارت، شهر) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShabaDraft(effectiveSpec.shabaNumber || '');
                  setShabaModalOpen(true);
                }}
                className="rounded-2xl bg-white border border-[#dcecec] hover:border-[#0b5c60] p-4 text-right space-y-1 cursor-pointer"
              >
                <div className="text-xs font-black text-[#0b5c60] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> شماره شبای بانکی
                </div>
                <div dir="ltr" className="text-[11px] font-bold text-[#5f777b] truncate text-right">
                  {effectiveSpec.shabaNumber || 'ثبت نشده (کلیک جهت ثبت)'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSkillModalOpen(true)}
                className="rounded-2xl bg-white border border-[#dcecec] hover:border-[#0b5c60] p-4 text-right space-y-1 cursor-pointer"
              >
                <div className="text-xs font-black text-[#0b5c60] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> تغییر مهارت تخصصی
                </div>
                <div className="text-[11px] font-bold text-[#5f777b] truncate">{effectiveSpec.roleTitle}</div>
              </button>

              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="rounded-2xl bg-white border border-[#dcecec] hover:border-[#0b5c60] p-4 text-right space-y-1 cursor-pointer"
              >
                <div className="text-xs font-black text-[#0b5c60] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> تغییر شهر فعالیت
                </div>
                <div className="text-[11px] font-bold text-[#5f777b] truncate">{effectiveSpec.serviceCity}</div>
              </button>
            </div>

            {/* اطلاعات هویتی و شغلی */}
            <div className="rounded-3xl bg-white border border-[#dcecec] p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-black text-[#12292c] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#5f777b]" /> اطلاعات هویتی و شغلی
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBirthDateDraft(cleanBirthDate);
                    setBusinessNameDraft(cleanBusinessName);
                    setProfileInfoModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#eff8f8] hover:bg-[#dff1f1] text-[#0b5c60] px-3 py-1.5 text-[11px] font-black cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش تاریخ تولد و کسب‌وکار</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#f8fbfb] p-3 border border-[#edf4f4]">
                  <span className="text-[#5f777b]">شماره موبایل: </span>
                  <strong dir="ltr">{toPersianDigits(effectiveSpec.phone)}</strong>
                </div>
                <div className="rounded-xl bg-[#f8fbfb] p-3 border border-[#edf4f4]">
                  <span className="text-[#5f777b]">کد ملی: </span>
                  <strong dir="ltr">{cleanNationalCode ? toPersianDigits(cleanNationalCode) : 'ثبت نشده'}</strong>
                </div>
                <div className="rounded-xl bg-[#f8fbfb] p-3 border border-[#edf4f4]">
                  <span className="text-[#5f777b]">تاریخ تولد: </span>
                  <strong dir="ltr">{cleanBirthDate ? toPersianDigits(cleanBirthDate) : 'ثبت نشده'}</strong>
                </div>
                <div className="rounded-xl bg-[#f8fbfb] p-3 border border-[#edf4f4]">
                  <span className="text-[#5f777b]">کسب‌وکار: </span>
                  <strong>{cleanBusinessName || 'ثبت نشده'}</strong>
                </div>
              </div>
            </div>

            {/* بایگانی پرونده‌های فاکتور */}
            <div className="rounded-3xl bg-white border border-[#dcecec] p-5 space-y-3">
              <div className="text-xs font-black text-[#12292c] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0b5c60]" /> بایگانی پرونده‌های فاکتور رسمی ({toPersianDigits(myDossiers.length)})
              </div>
              {myDossiers.length === 0 ? (
                <div className="text-xs text-[#5f777b] text-center py-4">هنوز فاکتوری صادر نکرده‌اید.</div>
              ) : (
                <div className="space-y-2">
                  {myDossiers.map((dos) => (
                    <button
                      key={dos.request_id}
                      type="button"
                      onClick={() => setDossierViewer(dos)}
                      className="w-full rounded-2xl bg-[#f8fbfb] hover:bg-[#eff8f8] border border-[#e2efef] p-3 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="text-right">
                        <div className="font-black text-[#12292c]">{dos.service_title}</div>
                        <div className="text-[11px] text-[#5f777b]">{dos.customer_name} · {dos.tracking_code}</div>
                      </div>
                      <strong className="text-[#0b5c60] tabular-nums">{formatToman(dos.total_amount_toman)}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ناوبری پایین اختصاصی تندیس همکار */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#dfecec]">
        <div
          className={`max-w-5xl mx-auto grid ${
            bottomTabs.length === 6 ? 'grid-cols-6' : 'grid-cols-5'
          } h-16`}
        >
          {bottomTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer ${
                  active ? 'text-[#0b5c60] font-black' : 'text-[#6c8488] font-bold'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#0b5c60]' : 'text-[#6c8488]'}`} />
                <span className="truncate max-w-full px-1">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== مودال‌ها ===== */}
      <HamkarInvoiceModal
        order={invoiceOrder}
        specialist={effectiveSpec}
        commissionPercent={commissionPercent}
        onClose={() => setInvoiceOrder(null)}
        onSubmitted={() => {
          setInvoiceOrder(null);
          showToast('فاکتور رسمی با موفقیت صادر و به مشتری ارسال شد.');
          syncLive(effectiveSpec.phone);
        }}
        onToast={showToast}
      />

      <HamkarDossierDetailModal dossier={dossierViewer} onClose={() => setDossierViewer(null)} />

      <HamkarSettlementModal
        open={settlementModalOpen}
        specialist={effectiveSpec}
        balanceToman={walletBalance}
        commissionPercent={commissionPercent}
        completedOrders={completedOrders}
        onClose={() => setSettlementModalOpen(false)}
        onSpecialistUpdated={(updated) => setSpecialist(updated)}
        onSuccess={() => {
          showToast('درخواست تسویه آنی به حساب شبای شما ثبت شد.');
          syncLive(effectiveSpec.phone);
        }}
      />

      {/* مودال تغییر شهر فعالیت */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12292c]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#12292c]">انتخاب شهر فعال کاری</h3>
              <button type="button" onClick={() => setCityModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#5f777b]" />
              </button>
            </div>
            <input
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="جستجوی نام شهر یا استان..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3.5 py-2.5 text-xs font-bold outline-none"
            />
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {ALL_IRAN_CITIES.filter(
                (c) => !citySearch.trim() || c.name.includes(citySearch.trim()) || c.province.includes(citySearch.trim())
              )
                .slice(0, 30)
                .map((c) => (
                  <button
                    key={`${c.province}-${c.name}`}
                    type="button"
                    onClick={() => handleChangeCity(c.name, c.lat, c.lng)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-right text-xs font-bold flex items-center justify-between cursor-pointer ${
                      effectiveSpec.serviceCity === c.name
                        ? 'bg-[#0b5c60] text-white'
                        : 'bg-[#f8fbfb] hover:bg-[#eff8f8] text-[#12292c]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="opacity-75 text-[11px]">{c.province}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال اصلاح شماره شبا */}
      {shabaModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12292c]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#12292c]">ثبت یا ویرایش شماره شبا</h3>
              <button type="button" onClick={() => setShabaModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#5f777b]" />
              </button>
            </div>
            <input
              dir="ltr"
              value={shabaDraft}
              onChange={(e) => setShabaDraft(normalizeShaba(e.target.value))}
              placeholder="IR000000000000000000000000"
              className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-4 py-3 text-sm font-black text-left outline-none tabular-nums"
            />
            {(() => {
              const info = validateShaba(shabaDraft);
              return (
                <div className={`text-xs font-bold ${info.valid ? 'text-emerald-700' : 'text-[#5f777b]'}`}>
                  {info.valid ? `بانک تشخیص‌داده‌شده: ${info.bankName}` : 'شماره شبا باید با IR و ۲۴ رقم باشد.'}
                </div>
              );
            })()}
            <button
              type="button"
              onClick={handleSaveShaba}
              className="w-full rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white py-3 text-xs font-black cursor-pointer"
            >
              ذخیره شماره شبا
            </button>
          </div>
        </div>
      )}

      {/* مودال تغییر مهارت */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12292c]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#12292c]">تغییر مهارت تخصصی</h3>
              <button type="button" onClick={() => setSkillModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#5f777b]" />
              </button>
            </div>
            <input
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="جستجوی مهارت..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3.5 py-2.5 text-xs font-bold outline-none"
            />
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {skillCatalog
                .filter(
                  (s) =>
                    !skillSearch.trim() ||
                    s.roleTitle.includes(skillSearch.trim()) ||
                    s.categoryGroup.includes(skillSearch.trim())
                )
                .map((opt) => (
                  <button
                    key={`${opt.categoryCode}-${opt.roleTitle}`}
                    type="button"
                    onClick={() => handleChangeSkill(opt)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-right text-xs cursor-pointer ${
                      effectiveSpec.roleTitle === opt.roleTitle
                        ? 'bg-[#0b5c60] text-white font-black'
                        : 'bg-[#f8fbfb] hover:bg-[#eff8f8] text-[#12292c] font-bold'
                    }`}
                  >
                    <div>{opt.roleTitle}</div>
                    <div className="text-[10px] opacity-75">{opt.categoryGroup}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      {/* مودال ویرایش تاریخ تولد و نام کسب‌وکار */}
      {profileInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12292c]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#12292c]">ویرایش تاریخ تولد و عنوان کسب‌وکار</h3>
              <button type="button" onClick={() => setProfileInfoModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#5f777b]" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-[#12292c] block">تاریخ تولد (مثلاً ۱۳۷۰/۰۵/۱۴)</label>
                <input
                  dir="ltr"
                  value={birthDateDraft}
                  onChange={(e) => setBirthDateDraft(e.target.value)}
                  placeholder="1370/05/14"
                  className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-3.5 py-2.5 text-sm font-bold text-left outline-none tabular-nums"
                />
              </div>
              <div className="space-y-1">
                <label className="font-extrabold text-[#12292c] block">عنوان کسب‌وکار یا کارگاه</label>
                <input
                  value={businessNameDraft}
                  onChange={(e) => setBusinessNameDraft(e.target.value)}
                  placeholder="مثلاً: تعمیرگاه تخصصی لوازم خانگی..."
                  className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-3.5 py-2.5 text-xs font-bold outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={savingProfileInfo}
              onClick={handleSaveProfileInfo}
              className="w-full rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-60 text-white py-3 text-xs font-black cursor-pointer"
            >
              {savingProfileInfo ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
