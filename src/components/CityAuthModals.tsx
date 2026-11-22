import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LocateFixed,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  X
} from 'lucide-react';
import { IRAN_PROVINCES, findNearestIranCity } from '../services/iranProvinces';
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
  const [selectedProvince, setSelectedProvince] = useState<string>('همه استان‌ها');
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const filteredCities = useMemo(() => {
    const q = query.trim();
    const list =
      selectedProvince === 'همه استان‌ها'
        ? IRAN_PROVINCES.flatMap((p) => p.cities)
        : IRAN_PROVINCES.find((p) => p.province === selectedProvince)?.cities || [];
    if (!q) return list;
    return list.filter((c) => c.name.includes(q) || c.province.includes(q));
  }, [selectedProvince, query]);

  if (!open) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  const handleAutoDetectCity = () => {
    if (!navigator.geolocation) {
      setLocError('مرورگر شما از موقعیت‌یاب پشتیبانی نمی‌کند.');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestIranCity(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        onSelectCity(nearest);
        onClose();
      },
      () => {
        setLocating(false);
        setLocError('دسترسی به موقعیت مکانی داده نشد؛ لطفاً شهر خود را از فهرست انتخاب کنید.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div className="flex items-center gap-2 font-black text-base sm:text-lg">
            <MapPin className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
            انتخاب استان و شهرستان ({toPersianDigits(31)} استان و بیش از {toPersianDigits(350)} شهر)
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#E2EFEF] dark:border-[#26384E] space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 opacity-55" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی نام شهر یا استان (مثلاً آبادان، شیراز، کرج...)"
                className={`w-full rounded-2xl border pr-10 pl-4 py-2.5 text-sm outline-none ${inputCls}`}
              />
            </div>
            <button
              onClick={handleAutoDetectCity}
              disabled={locating}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] text-white px-4 py-2.5 text-xs font-extrabold whitespace-nowrap cursor-pointer"
            >
              <LocateFixed className="w-4 h-4" />
              {locating ? 'در حال یافتن شهر شما...' : 'تشخیص خودکار شهر من'}
            </button>
          </div>
          {locError && <div className="text-xs text-red-500 font-bold">{locError}</div>}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedProvince('همه استان‌ها')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                selectedProvince === 'همه استان‌ها'
                  ? 'bg-[#065A52] text-white'
                  : 'bg-[#F3F8F8] dark:bg-[#1E2D40] opacity-80'
              }`}
            >
              همه استان‌ها
            </button>
            {IRAN_PROVINCES.map((p) => (
              <button
                key={p.province}
                onClick={() => setSelectedProvince(p.province)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedProvince === p.province
                    ? 'bg-[#065A52] text-white'
                    : 'bg-[#F3F8F8] dark:bg-[#1E2D40] opacity-80'
                }`}
              >
                {p.province}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {filteredCities.map((c) => {
            const active = c.name === selectedCityName;
            return (
              <button
                key={`${c.province}-${c.name}`}
                onClick={() => {
                  onSelectCity(c);
                  onClose();
                }}
                className={`text-right p-3 rounded-2xl border transition cursor-pointer ${
                  active
                    ? 'border-[#065A52] bg-[#065A52]/10 dark:border-[#14B8A6] dark:bg-[#14B8A6]/15'
                    : 'border-[#E2EFEF] dark:border-[#26384E] hover:border-[#065A52]/50'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center justify-between gap-1">
                  <span className="truncate">{c.name}</span>
                  {active && <CheckCircle2 className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6] shrink-0" />}
                </div>
                <div className="text-[11px] opacity-65 mt-0.5 truncate">{c.province}</div>
              </button>
            );
          })}
          {filteredCities.length === 0 && (
            <div className="col-span-full text-center py-10 text-sm opacity-65">
              شهری با این عنوان یافت نشد.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div className="flex items-center gap-2 font-black text-lg">
            <Phone className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
            ورود و ثبت‌نام پیامکی تندیس
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
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
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
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
