import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  X
} from 'lucide-react';
import { ALL_IRAN_CITIES, IRAN_PROVINCES } from '../services/iranProvinces';

const CUSTOMER_LOGO_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';
import {
  registerCustomer,
  sendOtp,
  updateCustomerName,
  verifyOtp
} from '../services/tandisApi';
import { toLatinDigits, toPersianDigits } from '../services/tandisDefaults';
import type { TandisCityInfo } from '../types/tandis';

export const CitySelectorModal: React.FC<{
  open: boolean;
  dark: boolean;
  selectedCityName: string;
  onClose: () => void;
  onSelectCity: (city: TandisCityInfo) => void;
}> = ({ open, dark, selectedCityName, onClose, onSelectCity }) => {
  // اگر null باشد یعنی در مرحله اول (انتخاب استان) هستیم؛ اگر نام استان باشد، شهرهای داخل آن استان نمایش داده می‌شوند
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      setActiveProvince(null);
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeProvince && !query.trim()) {
          setActiveProvince(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, activeProvince, query, onClose]);

  const currentCityObj = useMemo(
    () => ALL_IRAN_CITIES.find((c) => c.name === selectedCityName) || ALL_IRAN_CITIES[0],
    [selectedCityName]
  );

  const selectedProvinceGroup = useMemo(
    () => (activeProvince ? IRAN_PROVINCES.find((p) => p.province === activeProvince) || null : null),
    [activeProvince]
  );

  // در حالت جستجو، مستقیماً شهرهایی که با عبارت مطابقت دارند نمایش داده می‌شوند
  const searchMatchedCities = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const baseList = selectedProvinceGroup ? selectedProvinceGroup.cities : ALL_IRAN_CITIES;
    return baseList.filter((c) => c.name.includes(q) || c.province.includes(q));
  }, [query, selectedProvinceGroup]);

  if (!open) return null;

  const panelCls = dark
    ? 'bg-[#111c29] text-[#F8FAFC] border-[#243447]'
    : 'bg-white text-[#12292c] border-[#e2efef]';
  const borderCls = dark ? 'border-[#243447]' : 'border-[#eef5f5]';
  const mutedTextCls = dark ? 'text-[#94A3B8]' : 'text-[#647d81]';

  const handlePickCity = (city: TandisCityInfo) => {
    onSelectCity(city);
    onClose();
  };

  const isSearching = query.trim().length > 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#091e20]/45 p-0 sm:p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-[0_20px_50px_rgba(11,92,96,0.16)] overflow-hidden flex flex-col max-h-[85vh] ${panelCls}`}
      >
        {/* هدر ساده و خلوت */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${borderCls}`}>
          <div className="flex items-center gap-2.5">
            {selectedProvinceGroup && !isSearching ? (
              <button
                type="button"
                onClick={() => setActiveProvince(null)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  dark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-[#f2f9f9] hover:bg-[#e3f2f2] text-[#0b5c60]'
                }`}
                aria-label="بازگشت به لیست استان‌ها"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#0b5c60]/10 text-[#0b5c60] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
            )}

            <div>
              <h2 className="font-black text-sm sm:text-base">
                {selectedProvinceGroup && !isSearching
                  ? `استان ${selectedProvinceGroup.province}`
                  : 'انتخاب استان و شهر'}
              </h2>
              <p className={`text-[11px] ${mutedTextCls}`}>
                {selectedProvinceGroup && !isSearching
                  ? 'شهر مورد نظر خود را انتخاب کنید'
                  : `شهر فعلی شما: ${currentCityObj?.name || selectedCityName}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              dark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-[#f2f9f9] text-[#5f777b]'
            }`}
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* جستجوی یکپارچه */}
        <div className={`px-5 py-3 border-b ${borderCls}`}>
          <div className="relative flex items-center">
            <Search className={`w-4 h-4 absolute right-3.5 pointer-events-none ${mutedTextCls}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                selectedProvinceGroup
                  ? `جستجو در شهرهای ${selectedProvinceGroup.province}...`
                  : 'جستجوی نام شهر یا استان...'
              }
              className={`w-full rounded-xl border pr-10 pl-8 py-2.5 text-xs sm:text-sm outline-none transition-all ${
                dark
                  ? 'bg-[#182638] border-[#26384E] text-white placeholder-[#94A3B8] focus:border-[#14B8A6]'
                  : 'bg-[#f7fbfb] border-[#dceaea] text-[#12292c] placeholder-[#82989c] focus:bg-white focus:border-[#0b5c60]'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-2.5 p-1 rounded-lg hover:bg-black/5 text-[#5f777b] cursor-pointer"
                aria-label="پاک کردن"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* محتوای اصلی: یا لیست استان‌ها، یا شهرهای داخل استان انتخاب‌شده */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* حالت ۱: جستجوی مستقیم */}
          {isSearching && (
            <div className="space-y-1.5">
              {searchMatchedCities.map((city) => {
                const active = city.name === selectedCityName;
                return (
                  <button
                    key={`${city.province}-${city.name}`}
                    type="button"
                    onClick={() => handlePickCity(city)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      active
                        ? 'border-[#0b5c60] bg-[#0b5c60]/8 text-[#0b5c60]'
                        : dark
                          ? 'border-transparent hover:bg-white/5 text-slate-200'
                          : 'border-transparent hover:bg-[#f4fafa] text-[#12292c]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm">{city.name}</span>
                      <span className={`text-xs ${mutedTextCls}`}>({city.province})</span>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#0b5c60] shrink-0" />}
                  </button>
                );
              })}

              {searchMatchedCities.length === 0 && (
                <div className={`text-center py-10 text-xs ${mutedTextCls}`}>
                  شهری با عبارت «{query}» پیدا نشد.
                </div>
              )}
            </div>
          )}

          {/* حالت ۲: مرحله اول — لیست استان‌ها */}
          {!isSearching && !selectedProvinceGroup && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {IRAN_PROVINCES.map((prov) => {
                const containsSelectedCity = prov.cities.some((c) => c.name === selectedCityName);
                return (
                  <button
                    key={prov.province}
                    type="button"
                    onClick={() => setActiveProvince(prov.province)}
                    className={`group flex items-center justify-between px-4 py-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      containsSelectedCity
                        ? 'border-[#0b5c60]/40 bg-[#f2f9f9]'
                        : dark
                          ? 'border-[#243447] bg-[#162334] hover:border-[#14B8A6]/40'
                          : 'border-[#eef5f5] bg-white hover:border-[#0a8387]/40 hover:bg-[#f9fdfd]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          containsSelectedCity ? 'bg-[#0b5c60]' : 'bg-[#cfe3e3] group-hover:bg-[#0a8387]'
                        }`}
                      />
                      <span className="font-bold text-xs sm:text-sm truncate">{prov.province}</span>
                    </div>

                    <ChevronLeft className={`w-4 h-4 shrink-0 ${mutedTextCls} group-hover:-translate-x-0.5 transition-transform`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* حالت ۳: مرحله دوم — شهرهای داخل استان انتخاب‌شده */}
          {!isSearching && selectedProvinceGroup && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedProvinceGroup.cities.map((city) => {
                const active = city.name === selectedCityName;
                return (
                  <button
                    key={`${city.province}-${city.name}`}
                    type="button"
                    onClick={() => handlePickCity(city)}
                    className={`flex items-center justify-between gap-2 px-3.5 py-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      active
                        ? 'border-[#0b5c60] bg-[#0b5c60] text-white font-black shadow-2xs'
                        : dark
                          ? 'border-[#243447] bg-[#162334] hover:border-[#14B8A6]/50 text-slate-200 font-bold'
                          : 'border-[#e8f2f2] bg-[#fbfefe] hover:bg-[#f2f9f9] hover:border-[#0a8387]/50 text-[#12292c] font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm truncate">{city.name}</span>
                    {active && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AuthModal: React.FC<{
  open: boolean;
  dark: boolean;
  selectedCityName: string;
  onClose: () => void;
  onAuthenticated: (phone: string, fullName: string, restoredCity?: string) => void;
}> = ({ open, dark, selectedCityName, onClose, onAuthenticated }) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [storedCityFromServer, setStoredCityFromServer] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [needsName, setNeedsName] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || step !== 'otp' || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, step, secondsLeft]);

  useEffect(() => {
    if (!open) {
      setStep('phone');
      setOtpCode('');
      setSecondsLeft(0);
      setErrorMsg(null);
      setInfoMsg(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  const normalizedPhone = toLatinDigits(phoneInput).replace(/\D/g, '');

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return toPersianDigits(`${mm}:${ss}`);
  };

  const handleSendOtp = async (isResend = false) => {
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setErrorMsg('لطفاً شماره موبایل ۱۱ رقمی معتبر با شروع ۰۹ وارد کنید.');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    if (!isResend) {
      setInfoMsg(null);
    }
    try {
      const res = await sendOtp(normalizedPhone);
      setNeedsName(!res.existsAsCustomer);
      if (res.fullName) {
        setFullNameInput(res.fullName);
      } else if (!res.existsAsCustomer) {
        setFullNameInput('');
      }
      setStoredCityFromServer(res.city || '');
      setOtpCode('');
      setStep('otp');
      setSecondsLeft(res.expiresInSeconds && res.expiresInSeconds > 0 ? res.expiresInSeconds : 120);

      if (res.hasHamkarCollision) {
        setInfoMsg(
          'کد تایید ۶ رقمی پیامک شد. حساب همکار برای این شماره شناسایی شد و ورود شما به‌صورت مجزا در حساب مشتری انجام می‌شود.'
        );
      } else {
        setInfoMsg(res.message || 'کد تایید ۶ رقمی به شماره شما پیامک شد.');
      }
    } catch (err) {
      // در صورت خطای درگاه پیامک، کاربر در مرحله ورود شماره باقی می‌ماند (یا هنگام ارسال مجدد خطا نمایش داده می‌شود)
      setErrorMsg(err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سامانه پیامک تندیس');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanCode = toLatinDigits(otpCode).replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMsg('لطفاً کد تایید ۶ رقمی پیامک‌شده را به‌طور کامل وارد کنید.');
      return;
    }
    if (needsName && fullNameInput.trim().length < 2) {
      setErrorMsg('برای تکمیل ثبت‌نام، نام و نام خانوادگی خود را وارد کنید.');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const verified = await verifyOtp(normalizedPhone, cleanCode);
      const serverName = String(verified.fullName || fullNameInput.trim() || 'مشتری تندیس')
        .split('|')[0]
        .trim();
      const restoredCity = String(verified.city || storedCityFromServer || '').trim();

      if (!verified.existsAsCustomer) {
        await registerCustomer({
          phone: normalizedPhone,
          full_name: serverName,
          city: selectedCityName
        });
      }
      onAuthenticated(normalizedPhone, serverName, restoredCity || undefined);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'کد تایید نامعتبر یا منقضی است.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${panelCls}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div className="flex items-center gap-2 font-black text-base sm:text-lg">
            <Phone className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
            ورود به حساب کاربری تندیس
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* لوگو موشن اختصاصی تندیس در پنجره ورود (موبایل و دسکتاپ) */}
        <div className="pt-6 pb-2 px-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* حلقه موج‌دار بیرونی */}
            <motion.div
              animate={{
                scale: [1, 1.32, 1],
                opacity: [0.35, 0.06, 0.35]
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0b5c60] to-[#0a8387]"
            />
            {/* حلقه چرخشی ملایم میانی */}
            <motion.div
              animate={{
                rotate: [0, 8, -8, 0],
                scale: [1, 1.07, 1]
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-1.5 rounded-2xl border-2 border-[#0a8387]/35 bg-[#effcfb]"
            />
            {/* کارت لوگو با حرکت شناور نرم */}
            <motion.div
              initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
              animate={{
                scale: 1,
                rotate: 0,
                opacity: 1,
                y: [0, -4, 0]
              }}
              transition={{
                scale: { type: 'spring', stiffness: 320, damping: 18 },
                rotate: { type: 'spring', stiffness: 260, damping: 18 },
                y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative z-10 w-18 h-18 rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_rgba(11,92,96,0.22)] border-2 border-[#0a8387]/30 flex items-center justify-center overflow-hidden"
            >
              <img
                src={CUSTOMER_LOGO_SRC}
                alt="لوگوی تندیس"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-2.5 space-y-0.5"
          >
            <div className="text-base font-black text-[#0b5c60] dark:text-[#14B8A6]">
              سامانه هوشمند تندیس
            </div>
            <p className="text-[11px] text-[#5f777b] dark:text-[#94A3B8]">
              برای ورود سریع، شماره موبایل خود را وارد کنید
            </p>
          </motion.div>
        </div>

        <div className="p-6 pt-3 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-bold text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {infoMsg && (
            <div className="flex items-start gap-2 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 p-3 text-xs font-bold text-[#065A52] dark:text-[#14B8A6]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {step === 'phone' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold">شماره موبایل</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !busy) handleSendOtp(false);
                  }}
                  placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none tabular-nums ${inputCls}`}
                />
              </div>
              <button
                disabled={busy}
                onClick={() => handleSendOtp(false)}
                className="w-full rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 font-extrabold text-sm cursor-pointer"
              >
                {busy ? 'در حال بررسی و ارسال پیامک...' : 'دریافت کد تایید پیامکی'}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs opacity-80">
                <div>
                  شماره موبایل: <strong className="tabular-nums">{toPersianDigits(normalizedPhone)}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpCode('');
                    setSecondsLeft(0);
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-[#065A52] dark:text-[#14B8A6] underline font-bold cursor-pointer"
                >
                  تغییر شماره
                </button>
              </div>
              {needsName && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold">نام و نام خانوادگی</label>
                  <input
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="نام کامل خود را بنویسید"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold">کد تایید ۶ رقمی ارسال‌شده</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !busy) handleVerifyOtp();
                  }}
                  placeholder="کد ۶ رقمی پیامکی را وارد کنید"
                  className={`w-full rounded-2xl border px-4 py-3 text-center tracking-widest text-base font-black outline-none tabular-nums ${inputCls}`}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] px-3.5 py-2.5 text-xs">
                {secondsLeft > 0 ? (
                  <div className="flex items-center gap-1.5 font-bold opacity-80">
                    <Clock className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6]" />
                    <span>اعتبار کد و ارسال مجدد تا {formatCountdown(secondsLeft)} دیگر</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-bold opacity-75">کد پیامکی را دریافت نکردید؟</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSendOtp(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#065A52]/12 dark:bg-[#14B8A6]/15 px-3 py-1.5 font-extrabold text-[#065A52] dark:text-[#14B8A6] hover:opacity-85 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      ارسال مجدد کد پیامکی
                    </button>
                  </div>
                )}
              </div>

              <button
                disabled={busy}
                onClick={handleVerifyOtp}
                className="w-full rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 font-extrabold text-sm cursor-pointer"
              >
                {busy ? 'در حال تایید کد...' : 'ورود به حساب کاربری تندیس'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const EditNameModal: React.FC<{
  open: boolean;
  dark: boolean;
  phone: string;
  currentName: string;
  city: string;
  onClose: () => void;
  onSaved: (newName: string) => void;
}> = ({ open, dark, phone, currentName, city, onClose, onSaved }) => {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
      <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${panelCls}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-lg">
            <UserCheck className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
            ویرایش نام کاربری
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام و نام خانوادگی جدید"
          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
        />
        <button
          disabled={saving || name.trim().length < 2}
          onClick={async () => {
            setSaving(true);
            try {
              await updateCustomerName({ phone, fullName: name.trim(), city });
              onSaved(name.trim());
              onClose();
            } finally {
              setSaving(false);
            }
          }}
          className="w-full rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3 font-extrabold text-sm cursor-pointer"
        >
          {saving ? 'در حال همگام‌سازی...' : 'ذخیره و همگام‌سازی نام'}
        </button>
      </div>
    </div>
  );
};
