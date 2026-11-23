import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FileCheck2,
  FileText,
  KeyRound,
  Loader2,
  LocateFixed,
  LogOut,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { ALL_IRAN_CITIES } from '../../services/iranProvinces';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';
import {
  HAMKAR_LOGO_SRC,
  acquireHamkarSessionLock,
  buildHamkarSkillCatalog,
  checkHamkarNationalCode,
  compressHamkarImageStrict,
  fetchHamkarLiveState,
  normalizeIranPhone,
  normalizeShaba,
  registerHamkarTripleWrite,
  sendHamkarOtp,
  toEnglishDigits,
  validateIranNationalCode,
  validateShaba,
  verifyHamkarOtp,
} from '../../services/hamkarApi';
import type {
  HamkarApprovalStatus,
  HamkarSkillOption,
  HamkarSpecialistProfile,
} from '../../types/hamkar';

interface HamkarAuthAndWizardProps {
  initialMode?: 'login' | 'signup';
  dynamicCategories?: unknown[];
  onAuthenticated: (params: {
    phone: string;
    specialist: HamkarSpecialistProfile;
    displacedOther: boolean;
  }) => void;
  onBackToSite: () => void;
  onToast: (msg: string) => void;
}

type AuthScreen = 'LOGIN_PHONE' | 'LOGIN_OTP' | 'STATUS_GATE' | 'WIZARD';
type Step5Stage = 'CONTRACT' | 'DOSSIER' | 'PAYMENT' | 'RECEIPT';

const MEMBERSHIP_FEE_TOMAN = 499_000;

export const HamkarAuthAndWizard: React.FC<HamkarAuthAndWizardProps> = ({
  initialMode = 'login',
  dynamicCategories,
  onAuthenticated,
  onBackToSite,
  onToast,
}) => {
  const [screen, setScreen] = useState<AuthScreen>(initialMode === 'signup' ? 'WIZARD' : 'LOGIN_PHONE');

  // ورود پیامکی ۵ رقمی
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // وضعیت پس از OTP (در انتظار تایید / مسدود / رد شده / یافت نشد)
  const [gateStatus, setGateStatus] = useState<HamkarApprovalStatus>('NOT_FOUND');
  const [gateSpecialist, setGateSpecialist] = useState<HamkarSpecialistProfile | null>(null);
  const [gatePhone, setGatePhone] = useState('');
  const [recheckingStatus, setRecheckingStatus] = useState(false);

  // ویزارد ثبت‌نام ۵ مرحله‌ای
  const [wizStep, setWizStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [step5Stage, setStep5Stage] = useState<Step5Stage>('CONTRACT');
  const [wizPhone, setWizPhone] = useState('');
  const [wizPhoneVerified, setWizPhoneVerified] = useState(false);
  const [wizOtpSent, setWizOtpSent] = useState(false);
  const [wizOtpCode, setWizOtpCode] = useState('');
  const [wizOtpTimer, setWizOtpTimer] = useState(0);

  // مرحله ۱: هویت
  const [fullName, setFullName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [birthDate, setBirthDate] = useState('1370/01/01');
  const [ncCheckState, setNcCheckState] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [ncCheckMsg, setNcCheckMsg] = useState('');

  // مرحله ۲: مهارت
  const skillCatalog = useMemo(() => buildHamkarSkillCatalog(dynamicCategories), [dynamicCategories]);
  const [skillQuery, setSkillQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<HamkarSkillOption | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');

  // مرحله ۳: ۴ مدرک تصویری (<1MB)
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [shenasnamehPhoto, setShenasnamehPhoto] = useState<string>('');
  const [nationalCardPhoto, setNationalCardPhoto] = useState<string>('');
  const [skillLicensePhoto, setSkillLicensePhoto] = useState<string>('');
  const [uploadError, setUploadError] = useState('');

  // مرحله ۴: شهر و آدرس
  const [cityQuery, setCityQuery] = useState('');
  const [serviceCity, setServiceCity] = useState('آبادان');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceLat, setServiceLat] = useState(30.3392);
  const [serviceLng, setServiceLng] = useState(48.3043);
  const [geoLoading, setGeoLoading] = useState(false);

  // مرحله ۵: قرارداد، پرونده، شبا، پرداخت حق عضویت و رسید
  const [contractAccepted, setContractAccepted] = useState(false);
  const [shabaInput, setShabaInput] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardCvv2, setCardCvv2] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regError, setRegError] = useState('');
  const [receiptData, setReceiptData] = useState<{
    trackingCode: string;
    personnelCode: string;
    phone: string;
    fullName: string;
  } | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = window.setInterval(() => setOtpTimer((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [otpTimer]);

  useEffect(() => {
    if (wizOtpTimer <= 0) return;
    const t = window.setInterval(() => setWizOtpTimer((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [wizOtpTimer]);

  const filteredSkills = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    if (!q) return skillCatalog;
    return skillCatalog.filter(
      (s) =>
        s.roleTitle.toLowerCase().includes(q) ||
        s.categoryGroup.toLowerCase().includes(q) ||
        (s.subtitle || '').toLowerCase().includes(q)
    );
  }, [skillCatalog, skillQuery]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim();
    if (!q) return ALL_IRAN_CITIES.slice(0, 18);
    return ALL_IRAN_CITIES.filter((c) => c.name.includes(q) || c.province.includes(q)).slice(0, 24);
  }, [cityQuery]);

  const shabaValidation = useMemo(() => validateShaba(shabaInput), [shabaInput]);

  /* ==================== ورود OTP ==================== */
  const handleSendLoginOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const norm = normalizeIranPhone(phoneInput);
    if (!/^09\d{9}$/.test(norm)) {
      setAuthError('شماره موبایل معتبر ۱۱ رقمی (با شروع ۰۹) وارد کنید.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await sendHamkarOtp(norm);
      setPhoneInput(norm);
      setOtpInput('');
      setOtpTimer(res.expiresInSeconds || 120);
      setScreen('LOGIN_OTP');
      onToast(res.message);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'ارسال کد تایید ناموفق بود.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const normPhone = normalizeIranPhone(phoneInput);
    const code = toEnglishDigits(otpInput).replace(/\D/g, '');
    if (code.length !== 5) {
      setAuthError('کد تایید باید دقیقاً ۵ رقم باشد.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await verifyHamkarOtp(normPhone, code);
      if (res.approvalStatus === 'APPROVED' && res.specialist) {
        const lock = await acquireHamkarSessionLock(normPhone, res.specialist.fullName);
        onAuthenticated({
          phone: normPhone,
          specialist: res.specialist,
          displacedOther: lock.displacedOther,
        });
        return;
      }
      setGatePhone(normPhone);
      setGateStatus(res.approvalStatus);
      setGateSpecialist(res.specialist);
      if (res.approvalStatus === 'NOT_FOUND') {
        setWizPhone(normPhone);
        setWizPhoneVerified(true);
      }
      setScreen('STATUS_GATE');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'کد تایید نادرست یا منقضی است.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRecheckApproval = async () => {
    if (!gatePhone) return;
    setRecheckingStatus(true);
    try {
      const live = await fetchHamkarLiveState(gatePhone);
      setGateStatus(live.approvalStatus);
      setGateSpecialist(live.specialist);
      if (live.approvalStatus === 'APPROVED' && live.specialist) {
        const lock = await acquireHamkarSessionLock(gatePhone, live.specialist.fullName);
        onToast('حساب متخصص شما توسط مدیریت تایید شد! خوش آمدید.');
        onAuthenticated({
          phone: gatePhone,
          specialist: live.specialist,
          displacedOther: lock.displacedOther,
        });
      } else {
        onToast('وضعیت پرونده شما هنوز در انتظار بررسی مدیریت است.');
      }
    } catch {
      onToast('خطا در بررسی وضعیت سرور.');
    } finally {
      setRecheckingStatus(false);
    }
  };

  /* ==================== ویزارد ثبت‌نام ۵ مرحله‌ای ==================== */
  const handleSendWizardOtp = async () => {
    const norm = normalizeIranPhone(wizPhone);
    if (!/^09\d{9}$/.test(norm)) {
      setRegError('شماره موبایل معتبر ۱۱ رقمی وارد کنید.');
      return;
    }
    setRegError('');
    setAuthLoading(true);
    try {
      const res = await sendHamkarOtp(norm);
      setWizPhone(norm);
      setWizOtpSent(true);
      setWizOtpTimer(res.expiresInSeconds || 120);
      onToast(res.message);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'ارسال کد پیامکی ناموفق بود.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyWizardOtp = async () => {
    const norm = normalizeIranPhone(wizPhone);
    const code = toEnglishDigits(wizOtpCode).replace(/\D/g, '');
    if (code.length !== 5) {
      setRegError('کد تایید ۵ رقمی را وارد کنید.');
      return;
    }
    setRegError('');
    setAuthLoading(true);
    try {
      const res = await verifyHamkarOtp(norm, code);
      if (res.approvalStatus === 'APPROVED' && res.specialist) {
        const lock = await acquireHamkarSessionLock(norm, res.specialist.fullName);
        onToast('این شماره قبلاً به عنوان متخصص تایید شده است. وارد پنل شدید.');
        onAuthenticated({ phone: norm, specialist: res.specialist, displacedOther: lock.displacedOther });
        return;
      }
      if (res.approvalStatus === 'PENDING_ADMIN_APPROVAL' || res.approvalStatus === 'BLOCKED') {
        setGatePhone(norm);
        setGateStatus(res.approvalStatus);
        setGateSpecialist(res.specialist);
        setScreen('STATUS_GATE');
        return;
      }
      setWizPhoneVerified(true);
      onToast('شماره موبایل با موفقیت تایید شد.');
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'کد تایید نادرست است.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCheckNationalCodeLive = async (rawCode: string) => {
    const clean = toEnglishDigits(rawCode).replace(/\D/g, '').slice(0, 10);
    setNationalCode(clean);
    setNcCheckMsg('');
    if (clean.length < 10) {
      setNcCheckState('idle');
      return;
    }
    if (!validateIranNationalCode(clean)) {
      setNcCheckState('error');
      setNcCheckMsg('کد ملی واردشده نامعتبر است (الگوریتم رسمی ثبت احوال).');
      return;
    }
    setNcCheckState('checking');
    try {
      const res = await checkHamkarNationalCode(clean, normalizeIranPhone(wizPhone));
      if (res.available) {
        setNcCheckState('ok');
        setNcCheckMsg('کد ملی معتبر و قابل ثبت‌نام است.');
      } else {
        setNcCheckState('error');
        setNcCheckMsg(res.message || 'این کد ملی قبلاً در سامانه تندیس همکار ثبت شده است.');
      }
    } catch {
      setNcCheckState('ok');
      setNcCheckMsg('کد ملی از نظر ساختاری معتبر است.');
    }
  };

  const handleUploadKycImage = async (
    file: File | undefined,
    setter: (dataUrl: string) => void
  ) => {
    if (!file) return;
    setUploadError('');
    try {
      const compressed = await compressHamkarImageStrict(file);
      setter(compressed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حجم تصویر نباید بیشتر از ۱ مگابایت باشد';
      setUploadError(msg);
      onToast(msg);
    }
  };

  const handleUseBrowserGeo = () => {
    if (!navigator.geolocation) {
      onToast('مرورگر شما از موقعیت‌یاب پشتیبانی نمی‌کند.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setServiceLat(Number(pos.coords.latitude.toFixed(6)));
        setServiceLng(Number(pos.coords.longitude.toFixed(6)));
        setGeoLoading(false);
        onToast('موقعیت جغرافیایی شما ثبت شد.');
      },
      () => {
        setGeoLoading(false);
        onToast('دسترسی به موقعیت مکانی داده نشد؛ مختصات شهر انتخابی استفاده می‌شود.');
      },
      { timeout: 8000 }
    );
  };

  const validateAndNextStep = async () => {
    setRegError('');
    if (wizStep === 1) {
      const norm = normalizeIranPhone(wizPhone);
      if (!/^09\d{9}$/.test(norm)) {
        setRegError('ابتدا شماره موبایل معتبر ۱۱ رقمی وارد کنید.');
        return;
      }
      if (!wizPhoneVerified) {
        setRegError('ابتدا شماره موبایل خود را با کد پیامکی ۵ رقمی تایید کنید.');
        return;
      }
      if (fullName.trim().length < 3) {
        setRegError('نام و نام خانوادگی کامل خود را وارد کنید.');
        return;
      }
      if (!validateIranNationalCode(nationalCode)) {
        setRegError('کد ملی ۱۰ رقمی معتبر وارد کنید.');
        return;
      }
      if (ncCheckState === 'error') {
        setRegError(ncCheckMsg || 'این کد ملی قبلاً ثبت شده است.');
        return;
      }
      if (ncCheckState === 'idle') {
        const res = await checkHamkarNationalCode(nationalCode, norm);
        if (!res.available) {
          setNcCheckState('error');
          setNcCheckMsg(res.message || 'این کد ملی قبلاً ثبت شده است.');
          setRegError(res.message || 'این کد ملی قبلاً ثبت شده است.');
          return;
        }
      }
      setWizStep(2);
      return;
    }

    if (wizStep === 2) {
      if (!selectedSkill) {
        setRegError('لطفاً مهارت تخصصی اصلی خود را از لیست انتخاب کنید.');
        return;
      }
      setWizStep(3);
      return;
    }

    if (wizStep === 3) {
      if (!profilePhoto || !shenasnamehPhoto || !nationalCardPhoto || !skillLicensePhoto) {
        setRegError('بارگذاری هر ۴ تصویر (عکس پرسنلی، شناسنامه، کارت ملی و مدرک مهارت) الزامی است.');
        return;
      }
      setWizStep(4);
      return;
    }

    if (wizStep === 4) {
      if (!serviceCity.trim() || serviceAddress.trim().length < 6) {
        setRegError('شهر محل فعالیت و نشانی کامل کارگاه یا محل استقرار را وارد کنید.');
        return;
      }
      setWizStep(5);
      setStep5Stage('CONTRACT');
    }
  };

  const handleFinalSubmitRegistration = async () => {
    if (!selectedSkill) return;
    if (!shabaValidation.valid) {
      setRegError('شماره شبا نامعتبر است (IR و ۲۴ رقم).');
      return;
    }
    const cleanCard = toEnglishDigits(cardNumber).replace(/\D/g, '');
    if (cleanCard.length < 16 || toEnglishDigits(cardCvv2).replace(/\D/g, '').length < 3) {
      setRegError('شماره کارت ۱۶ رقمی و CVV2 معتبر جهت تایید پرداخت عضویت وارد کنید.');
      return;
    }

    setRegError('');
    setSubmittingReg(true);
    try {
      const normPhone = normalizeIranPhone(wizPhone);
      const trackingCode = `TND-${Math.floor(100000 + Math.random() * 900000)}`;
      const personnelCode = `HM-${normPhone.slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

      await registerHamkarTripleWrite({
        phone: normPhone,
        fullName: fullName.trim(),
        nationalCode,
        birthDate: birthDate.trim() || '1370/01/01',
        roleTitle: selectedSkill.roleTitle,
        categoryCode: selectedSkill.categoryCode,
        categoryGroup: selectedSkill.categoryGroup,
        businessName: businessName.trim() || 'متخصص سیار تندیس',
        skillDescription: skillDescription.trim() || 'متخصص تاییدشده تندیس',
        serviceCity: serviceCity.trim(),
        serviceAddress: serviceAddress.trim(),
        serviceLat,
        serviceLng,
        shabaNumber: shabaValidation.normalized,
        profilePhoto,
        shenasnamehPhoto,
        nationalCardPhoto,
        skillLicensePhoto,
        trackingCode,
        personnelCode,
      });

      setReceiptData({
        trackingCode,
        personnelCode,
        phone: normPhone,
        fullName: fullName.trim(),
      });
      setStep5Stage('RECEIPT');
      onToast('پرونده ثبت‌نام سه‌مسیره شما با موفقیت در سرور مرکزی ثبت شد.');
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'خطا در ثبت نهایی پرونده متخصص.');
    } finally {
      setSubmittingReg(false);
    }
  };

  /* ==================== UI ==================== */
  return (
    <div dir="rtl" className="min-h-screen bg-[#f3f8f8] text-[#12292c] flex flex-col">
      {/* نوار بالای اختصاصی پنل همکار */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e2efef]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#f2a900]/40 p-1 shadow-2xs overflow-hidden">
              <img
                src={HAMKAR_LOGO_SRC}
                alt="لوگوی تندیس همکار"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="font-black text-base text-[#12292c] leading-tight">پنل وب تندیس همکار</div>
              <div className="text-[11px] font-bold text-[#b47b00]">سامانه رسمی متخصصان و کارشناسان تندیس</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] border border-[#dcecec] px-3.5 py-2 text-xs font-extrabold text-[#0b5c60] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سایت تندیس</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ===== صفحه ۱: ورود شماره موبایل ===== */}
        {screen === 'LOGIN_PHONE' && (
          <div className="max-w-md mx-auto">
            <div className="rounded-[2rem] bg-white border border-[#e2efef] shadow-[0_18px_46px_rgba(11,92,96,0.08)] p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-[#fffdf5] border border-[#f2a900]/40 p-2 shadow-xs">
                  <img
                    src={HAMKAR_LOGO_SRC}
                    alt="تندیس همکار"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <h1 className="text-xl font-black text-[#12292c]">ورود به پنل تندیس همکار</h1>
                <p className="text-xs text-[#5f777b] leading-6">
                  شماره موبایل ثبت‌شده خود را وارد کنید تا کد تایید ۵ رقمی پیامکی ارسال شود.
                </p>
              </div>

              <form onSubmit={handleSendLoginOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#12292c] block">شماره موبایل متخصص</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#0b5c60] absolute right-3.5 top-3.5" />
                    <input
                      dir="ltr"
                      type="tel"
                      inputMode="numeric"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="09123456789"
                      className="w-full rounded-2xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] pr-10 pl-4 py-3 text-sm font-bold text-left outline-none tabular-nums"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-60 text-white py-3.5 text-sm font-black shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>ارسال کد تایید ۵ رقمی</span>
                </button>
              </form>

              <div className="pt-4 border-t border-[#eef4f5] space-y-3 text-center">
                <p className="text-xs text-[#5f777b]">هنوز به عنوان متخصص در تندیس عضو نشده‌اید؟</p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setRegError('');
                    setWizStep(1);
                    setScreen('WIZARD');
                  }}
                  className="w-full rounded-2xl bg-[#fff8e1] hover:bg-[#ffefba] border border-[#f2a900]/45 text-[#8a5b00] py-3 text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>شروع ثبت‌نام متخصص جدید (۵ مرحله‌ای)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== صفحه ۲: ورود کد OTP ۵ رقمی ===== */}
        {screen === 'LOGIN_OTP' && (
          <div className="max-w-md mx-auto">
            <div className="rounded-[2rem] bg-white border border-[#e2efef] shadow-[0_18px_46px_rgba(11,92,96,0.08)] p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0b5c60]/10 text-[#0b5c60] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-black text-[#12292c]">تایید کد پیامکی ۵ رقمی</h2>
                <p className="text-xs text-[#5f777b]">
                  کد تایید به شماره <span dir="ltr" className="font-black text-[#12292c]">{toPersianDigits(phoneInput)}</span> ارسال شد.
                </p>
              </div>

              <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                <input
                  ref={otpInputRef}
                  dir="ltr"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={otpInput}
                  onChange={(e) => setOtpInput(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 5))}
                  placeholder="_ _ _ _ _"
                  className="w-full rounded-2xl border-2 border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] py-3.5 text-center text-2xl font-black tracking-[0.55em] outline-none tabular-nums"
                />

                {authError && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-60 text-white py-3.5 text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>تایید کد و ورود به پنل همکار</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setScreen('LOGIN_PHONE')}
                  className="text-[#5f777b] hover:text-[#12292c] font-bold cursor-pointer"
                >
                  ویرایش شماره موبایل
                </button>
                {otpTimer > 0 ? (
                  <span className="text-[#5f777b] font-bold flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    ارسال مجدد تا {toPersianDigits(otpTimer)} ثانیه
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendLoginOtp()}
                    className="text-[#0b5c60] font-black hover:underline cursor-pointer"
                  >
                    ارسال مجدد کد
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== صفحه ۳: دروازه وضعیت (NOT_FOUND / PENDING / BLOCKED / REJECTED) ===== */}
        {screen === 'STATUS_GATE' && (
          <div className="max-w-lg mx-auto">
            <div className="rounded-[2rem] bg-white border border-[#e2efef] shadow-[0_18px_46px_rgba(11,92,96,0.08)] p-6 sm:p-8 text-center space-y-5">
              {gateStatus === 'PENDING_ADMIN_APPROVAL' && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-black text-[#12292c]">پرونده شما در صف بررسی مدیریت است</h2>
                  <p className="text-xs text-[#5f777b] leading-6">
                    {gateSpecialist?.fullName ? `همکار گرامی ${gateSpecialist.fullName}، ` : ''}
                    مدارک احراز هویت و تخصص شما ثبت شده و در انتظار تایید نهایی واحد عملیات تندیس است. پس از تایید، بلافاصله به رادار سفارش‌ها دسترسی خواهید داشت.
                  </p>
                  {gateSpecialist?.trackingCode && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-[#f4fafa] border border-[#dcecec] px-4 py-2 text-xs font-black text-[#0b5c60]">
                      <span>کد پیگیری پرونده:</span>
                      <span dir="ltr">{gateSpecialist.trackingCode}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={recheckingStatus}
                      onClick={handleRecheckApproval}
                      className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${recheckingStatus ? 'animate-spin' : ''}`} />
                      <span>بررسی مجدد وضعیت تایید</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreen('LOGIN_PHONE')}
                      className="rounded-2xl bg-[#f4fafa] hover:bg-[#e7f4f4] text-[#12292c] border border-[#dcecec] py-3 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج و تغییر شماره</span>
                    </button>
                  </div>
                </>
              )}

              {gateStatus === 'BLOCKED' && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-black text-rose-700">حساب همکار شما مسدود شده است</h2>
                  <p className="text-xs text-[#5f777b] leading-6">
                    دسترسی شما به پنل تندیس همکار توسط مدیریت سامانه غیرفعال شده است. جهت پیگیری و رفع مسدودیت با واحد پشتیبانی تندیس تماس بگیرید.
                  </p>
                  <button
                    type="button"
                    onClick={() => setScreen('LOGIN_PHONE')}
                    className="rounded-2xl bg-[#12292c] text-white px-6 py-3 text-xs font-black cursor-pointer"
                  >
                    بازگشت به صفحه ورود
                  </button>
                </>
              )}

              {(gateStatus === 'NOT_FOUND' || gateStatus === 'REJECTED' || gateStatus === 'DELETED') && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#fff8e1] border border-[#f2a900]/40 text-[#b47b00] flex items-center justify-center">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-black text-[#12292c]">
                    {gateStatus === 'REJECTED'
                      ? 'پرونده قبلی شما نیاز به ثبت‌نام مجدد دارد'
                      : 'شماره شما هنوز به عنوان متخصص ثبت نشده است'}
                  </h2>
                  <p className="text-xs text-[#5f777b] leading-6">
                    شماره <span dir="ltr" className="font-black text-[#12292c]">{toPersianDigits(gatePhone)}</span> تایید شد. برای فعالیت و دریافت سفارش‌های زنده، فرم ۵ مرحله‌ای استخدام متخصص را تکمیل کنید.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWizPhone(gatePhone);
                        setWizPhoneVerified(true);
                        setWizStep(1);
                        setScreen('WIZARD');
                      }}
                      className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#f2a900]" />
                      <span>شروع ثبت‌نام متخصص</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreen('LOGIN_PHONE')}
                      className="rounded-2xl bg-[#f4fafa] text-[#12292c] border border-[#dcecec] py-3 text-xs font-extrabold cursor-pointer"
                    >
                      تغییر شماره موبایل
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ===== صفحه ۴: ویزارد ثبت‌نام ۵ مرحله‌ای متخصص ===== */}
        {screen === 'WIZARD' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* نوار پیشرفت ۵ مرحله */}
            <div className="rounded-3xl bg-white border border-[#e2efef] p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="text-base sm:text-lg font-black text-[#12292c]">
                    ثبت‌نام و احراز هویت متخصص تندیس همکار
                  </h1>
                  <p className="text-xs text-[#5f777b]">
                    مرحله {toPersianDigits(wizStep)} از ۵ · ذخیره سه‌مسیره زنده در سرور مرکزی
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen('LOGIN_PHONE')}
                  className="text-xs font-extrabold text-[#0b5c60] hover:underline cursor-pointer"
                >
                  حساب دارید؟ ورود با شماره موبایل
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { n: 1, t: 'هویت' },
                  { n: 2, t: 'مهارت' },
                  { n: 3, t: 'مدارک' },
                  { n: 4, t: 'محدوده' },
                  { n: 5, t: 'قرارداد و ثبت' },
                ].map((s) => (
                  <div
                    key={s.n}
                    className={`rounded-xl py-2 px-1 text-center text-[11px] font-black transition-colors ${
                      wizStep === s.n
                        ? 'bg-[#0b5c60] text-white shadow-xs'
                        : wizStep > s.n
                        ? 'bg-[#e6f5f5] text-[#0b5c60]'
                        : 'bg-[#f4f8f8] text-[#7c9498]'
                    }`}
                  >
                    {toPersianDigits(s.n)}. {s.t}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white border border-[#e2efef] shadow-[0_14px_38px_rgba(11,92,96,0.06)] p-5 sm:p-7 space-y-5">
              {/* --- مرحله ۱: اطلاعات هویتی و تایید شماره --- */}
              {wizStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                    <User className="w-4 h-4" />
                    <span>اطلاعات هویتی و اصالت کد ملی</span>
                  </div>

                  {/* تایید موبایل اگر هنوز تایید نشده */}
                  <div className="rounded-2xl bg-[#f6fbfb] border border-[#dcecec] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-extrabold text-[#12292c]">شماره موبایل متخصص (احراز پیامکی)</label>
                      {wizPhoneVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <BadgeCheck className="w-3.5 h-3.5" /> تایید شده
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        dir="ltr"
                        type="tel"
                        disabled={wizPhoneVerified}
                        value={wizPhone}
                        onChange={(e) => setWizPhone(e.target.value)}
                        placeholder="09123456789"
                        className="flex-1 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-sm font-bold text-left outline-none disabled:opacity-70"
                      />
                      {!wizPhoneVerified && (
                        <button
                          type="button"
                          disabled={authLoading || wizOtpTimer > 0}
                          onClick={handleSendWizardOtp}
                          className="rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-60 text-white px-4 py-2.5 text-xs font-black whitespace-nowrap cursor-pointer"
                        >
                          {wizOtpTimer > 0 ? `ارسال مجدد (${toPersianDigits(wizOtpTimer)})` : 'ارسال کد ۵ رقمی'}
                        </button>
                      )}
                    </div>

                    {!wizPhoneVerified && wizOtpSent && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <input
                          dir="ltr"
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={wizOtpCode}
                          onChange={(e) => setWizOtpCode(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 5))}
                          placeholder="کد ۵ رقمی پیامک‌شده"
                          className="flex-1 rounded-xl border border-[#0b5c60] bg-white px-3.5 py-2.5 text-sm font-black text-center tracking-widest outline-none"
                        />
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={handleVerifyWizardOtp}
                          className="rounded-xl bg-[#f2a900] hover:bg-[#dfa000] text-[#12292c] px-5 py-2.5 text-xs font-black whitespace-nowrap cursor-pointer"
                        >
                          تایید کد
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#12292c]">نام و نام خانوادگی کامل</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثلاً: علی محمدی"
                        className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-3.5 py-2.5 text-sm font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#12292c]">تاریخ تولد (شمسی)</label>
                      <input
                        dir="ltr"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        placeholder="1370/05/15"
                        className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-3.5 py-2.5 text-sm font-bold text-left outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#12292c]">کد ملی ۱۰ رقمی (استعلام آنی یکتایی)</label>
                    <input
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={10}
                      value={nationalCode}
                      onChange={(e) => handleCheckNationalCodeLive(e.target.value)}
                      placeholder="1234567890"
                      className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-3.5 py-2.5 text-sm font-bold text-left outline-none tabular-nums"
                    />
                    {ncCheckState === 'checking' && (
                      <p className="text-[11px] font-bold text-[#0b5c60]">در حال استعلام یکتایی کد ملی از سرور...</p>
                    )}
                    {ncCheckState === 'ok' && (
                      <p className="text-[11px] font-bold text-emerald-700">{ncCheckMsg}</p>
                    )}
                    {ncCheckState === 'error' && (
                      <p className="text-[11px] font-bold text-rose-600">{ncCheckMsg}</p>
                    )}
                  </div>
                </div>
              )}

              {/* --- مرحله ۲: انتخاب مهارت تخصصی داینامیک --- */}
              {wizStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                    <Wrench className="w-4 h-4" />
                    <span>انتخاب مهارت اصلی و معرفی کسب‌وکار</span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-[#5f777b] absolute right-3.5 top-3" />
                    <input
                      value={skillQuery}
                      onChange={(e) => setSkillQuery(e.target.value)}
                      placeholder="جستجو در مهارت‌ها (مثلاً برق، مکانیک، کولر، زیبایی، وکیل...)"
                      className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] pr-10 pl-4 py-2.5 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-0.5">
                    {filteredSkills.map((opt) => {
                      const active =
                        selectedSkill?.categoryCode === opt.categoryCode &&
                        selectedSkill?.roleTitle === opt.roleTitle;
                      return (
                        <button
                          key={`${opt.categoryCode}-${opt.roleTitle}`}
                          type="button"
                          onClick={() => setSelectedSkill(opt)}
                          className={`text-right rounded-2xl border p-3 transition-all cursor-pointer ${
                            active
                              ? 'border-[#0b5c60] bg-[#eff8f8] ring-2 ring-[#0b5c60]/20'
                              : 'border-[#e2efef] bg-white hover:border-[#0a8387]/50'
                          }`}
                        >
                          <div className="text-xs font-black text-[#12292c]">{opt.roleTitle}</div>
                          <div className="text-[11px] text-[#5f777b] mt-0.5">{opt.categoryGroup}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#12292c]">نام کارگاه یا عنوان فعالیت (اختیاری)</label>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="مثلاً: خدمات فنی و سیار تندیس"
                        className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3.5 py-2.5 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#12292c]">شرح سوابق و تخصص</label>
                      <input
                        value={skillDescription}
                        onChange={(e) => setSkillDescription(e.target.value)}
                        placeholder="مثلاً: ۱۰ سال سابقه تعمیرات تخصصی"
                        className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3.5 py-2.5 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- مرحله ۳: بارگذاری ۴ مدرک احراز هویت (سقف ۱ مگابایت) --- */}
              {wizStep === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                      <Camera className="w-4 h-4" />
                      <span>بارگذاری ۴ تصویر احراز هویت</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#b47b00] bg-[#fff8e1] px-3 py-1 rounded-lg">
                      حداکثر حجم مجاز هر تصویر: ۱ مگابایت
                    </span>
                  </div>

                  {uploadError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                      {uploadError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: '۱. عکس پرسنلی متخصص', val: profilePhoto, set: setProfilePhoto },
                      { label: '۲. تصویر صفحه اول شناسنامه', val: shenasnamehPhoto, set: setShenasnamehPhoto },
                      { label: '۳. تصویر روی کارت ملی', val: nationalCardPhoto, set: setNationalCardPhoto },
                      { label: '۴. مدرک فنی‌حرفه‌ای / جواز کسب', val: skillLicensePhoto, set: setSkillLicensePhoto },
                    ].map((doc) => (
                      <label
                        key={doc.label}
                        className={`rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-colors ${
                          doc.val
                            ? 'border-emerald-400 bg-emerald-50/40'
                            : 'border-[#cbd5e1] hover:border-[#0b5c60] bg-[#f8fbfb]'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadKycImage(e.target.files?.[0], doc.set)}
                        />
                        {doc.val ? (
                          <img
                            src={doc.val}
                            alt={doc.label}
                            className="w-full h-28 object-cover rounded-xl border border-emerald-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-white border border-[#dcecec] text-[#0b5c60] flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                        )}
                        <div className="text-xs font-black text-[#12292c]">{doc.label}</div>
                        <span className="text-[11px] font-bold text-[#0b5c60]">
                          {doc.val ? 'تصویر فشرده و ثبت شد (تغییر)' : 'انتخاب تصویر (زیر ۱ مگابایت)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* --- مرحله ۴: شهر فعالیت و نشانی کارگاه --- */}
              {wizStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>تعیین شهر فعالیت و نشانی استقرار</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-[#12292c]">جستجو و انتخاب شهر فعالیت</label>
                    <input
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="نام شهر را جستجو کنید (مثلاً آبادان، اهواز، تهران، شیراز...)"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3.5 py-2.5 text-xs font-bold outline-none"
                    />
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pt-1">
                      {filteredCities.map((c) => (
                        <button
                          key={`${c.province}-${c.name}`}
                          type="button"
                          onClick={() => {
                            setServiceCity(c.name);
                            setServiceLat(c.lat);
                            setServiceLng(c.lng);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                            serviceCity === c.name
                              ? 'bg-[#0b5c60] text-white border-[#0b5c60]'
                              : 'bg-white text-[#12292c] border-[#dcecec] hover:border-[#0a8387]'
                          }`}
                        >
                          {c.name} ({c.province})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#12292c]">نشانی کامل محل کار یا استقرار</label>
                    <textarea
                      rows={3}
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      placeholder="خیابان، کوچه، پلاک و محدوده دقیق سرویس‌دهی..."
                      className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] p-3 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f4fafa] border border-[#dcecec] p-3.5">
                    <div className="text-xs">
                      <div className="font-black text-[#12292c]">مختصات جغرافیایی (رادار هوشمند)</div>
                      <div dir="ltr" className="text-[11px] text-[#5f777b] tabular-nums text-right">
                        {serviceLat.toFixed(4)}, {serviceLng.toFixed(4)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseBrowserGeo}
                      disabled={geoLoading}
                      className="rounded-xl bg-white hover:bg-[#e7f4f4] border border-[#0b5c60]/30 text-[#0b5c60] px-3.5 py-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <LocateFixed className="w-4 h-4" />
                      <span>{geoLoading ? 'در حال دریافت...' : 'ثبت موقعیت فعلی من'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- مرحله ۵: قرارداد، پرونده+شبا، پرداخت ۴۹۹,۰۰۰ تومان، رسید --- */}
              {wizStep === 5 && (
                <div className="space-y-5">
                  {step5Stage === 'CONTRACT' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                        <FileText className="w-4 h-4" />
                        <span>توافق‌نامه رسمی همکاری با سامانه تندیس</span>
                      </div>
                      <div className="rounded-2xl bg-[#f8fbfb] border border-[#dcecec] p-4 text-xs leading-7 text-[#375155] max-h-56 overflow-y-auto space-y-2">
                        <p>۱. متخصص متعهد می‌شود کلیه خدمات را با رعایت نرخ مصوب، اخلاق حرفه‌ای و ضمانت کیفیت تندیس ارائه نماید.</p>
                        <p>۲. تسویه مالی کلیه سفارش‌ها صرفاً از طریق فاکتور رسمی آنلاین تندیس انجام شده و سهم متخصص پس از کسر کارمزد مصوب، به کیف پول و شماره شبای ثبت‌شده واریز می‌گردد.</p>
                        <p>۳. هر حساب کاربری همکار صرفاً روی یک دستگاه فعال قابل استفاده است و ورود در دستگاه جدید، نشست قبلی را به‌صورت خودکار لغو می‌کند.</p>
                        <p>۴. صحت مدارک هویتی و فنی بارگذاری‌شده بر عهده متخصص بوده و فعال‌سازی نهایی پس از تایید واحد عملیات تندیس انجام می‌شود.</p>
                      </div>
                      <label className="flex items-center gap-2.5 text-xs font-extrabold text-[#12292c] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contractAccepted}
                          onChange={(e) => setContractAccepted(e.target.checked)}
                          className="w-4 h-4 accent-[#0b5c60]"
                        />
                        <span>کلیه مفاد قرارداد همکاری تندیس همکار را مطالعه کرده و می‌پذیرم.</span>
                      </label>
                      <button
                        type="button"
                        disabled={!contractAccepted}
                        onClick={() => setStep5Stage('DOSSIER')}
                        className="w-full rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-50 text-white py-3.5 text-sm font-black cursor-pointer"
                      >
                        تایید قرارداد و بررسی پرونده
                      </button>
                    </div>
                  )}

                  {step5Stage === 'DOSSIER' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                        <FileCheck2 className="w-4 h-4" />
                        <span>بازبینی پرونده و ثبت شماره شبای تسویه</span>
                      </div>

                      <div className="rounded-2xl bg-[#f6fbfb] border border-[#dcecec] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div><span className="text-[#5f777b]">نام متخصص: </span><strong className="text-[#12292c]">{fullName}</strong></div>
                        <div><span className="text-[#5f777b]">شماره موبایل: </span><strong dir="ltr">{toPersianDigits(wizPhone)}</strong></div>
                        <div><span className="text-[#5f777b]">کد ملی: </span><strong dir="ltr">{toPersianDigits(nationalCode)}</strong></div>
                        <div><span className="text-[#5f777b]">مهارت: </span><strong>{selectedSkill?.roleTitle}</strong></div>
                        <div><span className="text-[#5f777b]">شهر فعالیت: </span><strong>{serviceCity}</strong></div>
                        <div><span className="text-[#5f777b]">کسب‌وکار: </span><strong>{businessName || 'متخصص سیار تندیس'}</strong></div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-[#12292c]">شماره شبای ۲۶ کاراکتری جهت تسویه درآمد (با IR)</label>
                        <input
                          dir="ltr"
                          value={shabaInput}
                          onChange={(e) => setShabaInput(normalizeShaba(e.target.value))}
                          placeholder="IR000000000000000000000000"
                          className="w-full rounded-xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-4 py-3 text-sm font-black text-left outline-none tabular-nums tracking-wider"
                        />
                        {shabaInput && (
                          <div className={`text-xs font-bold flex items-center gap-1.5 ${shabaValidation.valid ? 'text-emerald-700' : 'text-rose-600'}`}>
                            <Building2 className="w-3.5 h-3.5" />
                            <span>
                              {shabaValidation.valid
                                ? `شبای معتبر · ${shabaValidation.bankName}`
                                : 'شماره شبا باید شامل IR و ۲۴ رقم باشد.'}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!shabaValidation.valid}
                        onClick={() => setStep5Stage('PAYMENT')}
                        className="w-full rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-50 text-white py-3.5 text-sm font-black cursor-pointer"
                      >
                        تایید پرونده و مرحله پرداخت حق عضویت ({formatToman(MEMBERSHIP_FEE_TOMAN)})
                      </button>
                    </div>
                  )}

                  {step5Stage === 'PAYMENT' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0b5c60] font-black text-sm">
                          <CreditCard className="w-4 h-4" />
                          <span>درگاه پرداخت حق عضویت و احراز صلاحیت</span>
                        </div>
                        <span className="rounded-xl bg-[#fff8e1] border border-[#f2a900]/40 px-3 py-1 text-xs font-black text-[#8a5b00] tabular-nums">
                          {formatToman(MEMBERSHIP_FEE_TOMAN)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-extrabold text-[#12292c]">شماره کارت ۱۶ رقمی عضو شتاب</label>
                          <input
                            dir="ltr"
                            inputMode="numeric"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 16))}
                            placeholder="6037997500000000"
                            className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-4 py-2.5 text-sm font-black text-left outline-none tabular-nums"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-[#12292c]">CVV2</label>
                          <input
                            dir="ltr"
                            inputMode="numeric"
                            maxLength={4}
                            value={cardCvv2}
                            onChange={(e) => setCardCvv2(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-4 py-2.5 text-sm font-black text-left outline-none tabular-nums"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-[#12292c]">رمز دوم پویا</label>
                          <input
                            dir="ltr"
                            type="password"
                            inputMode="numeric"
                            maxLength={8}
                            value={cardPin}
                            onChange={(e) => setCardPin(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 8))}
                            placeholder="••••••"
                            className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-4 py-2.5 text-sm font-black text-left outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={submittingReg}
                        onClick={handleFinalSubmitRegistration}
                        className="w-full rounded-2xl bg-[#f2a900] hover:bg-[#dfa000] disabled:opacity-60 text-[#12292c] py-3.5 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submittingReg ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>پرداخت {formatToman(MEMBERSHIP_FEE_TOMAN)} و ارسال پرونده به مدیریت</span>
                      </button>
                    </div>
                  )}

                  {step5Stage === 'RECEIPT' && receiptData && (
                    <div className="text-center space-y-4 py-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                        <BadgeCheck className="w-9 h-9" />
                      </div>
                      <h2 className="text-lg font-black text-[#12292c]">ثبت‌نام شما با موفقیت انجام شد</h2>
                      <p className="text-xs text-[#5f777b] leading-6 max-w-md mx-auto">
                        همکار گرامی {receiptData.fullName}، پرونده و ۴ مدرک شما به‌صورت همزمان در سرور مرکزی ثبت شد و اکنون در وضعیت «در انتظار تایید مدیریت» قرار دارد.
                      </p>
                      <div className="max-w-sm mx-auto rounded-2xl bg-[#f6fbfb] border border-[#dcecec] p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#5f777b]">کد پیگیری:</span>
                          <strong dir="ltr" className="text-[#0b5c60]">{receiptData.trackingCode}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5f777b]">کد پرسنلی اختصاصی:</span>
                          <strong dir="ltr" className="text-[#12292c]">{receiptData.personnelCode}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGatePhone(receiptData.phone);
                          setGateStatus('PENDING_ADMIN_APPROVAL');
                          setScreen('STATUS_GATE');
                        }}
                        className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-6 py-3 text-xs font-black cursor-pointer"
                      >
                        مشاهده وضعیت تایید پرونده
                      </button>
                    </div>
                  )}
                </div>
              )}

              {regError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* دکمه‌های قبلی / بعدی ویزارد */}
              {!(wizStep === 5 && step5Stage === 'RECEIPT') && (
                <div className="flex items-center justify-between pt-4 border-t border-[#eef4f5]">
                  <button
                    type="button"
                    onClick={() => {
                      setRegError('');
                      if (wizStep === 5 && step5Stage === 'PAYMENT') {
                        setStep5Stage('DOSSIER');
                      } else if (wizStep === 5 && step5Stage === 'DOSSIER') {
                        setStep5Stage('CONTRACT');
                      } else if (wizStep > 1) {
                        setWizStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5);
                      } else {
                        setScreen('LOGIN_PHONE');
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] border border-[#dcecec] px-4 py-2.5 text-xs font-extrabold text-[#12292c] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>مرحله قبل</span>
                  </button>

                  {wizStep < 5 && (
                    <button
                      type="button"
                      onClick={validateAndNextStep}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-5 py-2.5 text-xs font-black cursor-pointer"
                    >
                      <span>مرحله بعد</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
