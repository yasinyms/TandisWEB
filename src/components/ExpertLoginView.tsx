import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { AuthUser } from './AuthView';

interface ExpertLoginViewProps {
  onBackToHome: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

const toEnglishDigits = (str: string) => {
  return str
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

const extractErrorMessage = (errData: any, fallback: string): string => {
  if (!errData) return fallback;
  if (typeof errData.detail === 'string') return errData.detail;
  if (Array.isArray(errData.detail) && errData.detail[0]?.msg) {
    return errData.detail[0].msg.replace(/^Value error,\s*/i, '');
  }
  if (typeof errData.message === 'string') return errData.message;
  return fallback;
};

export const ExpertLoginView: React.FC<ExpertLoginViewProps> = ({
  onBackToHome,
  onLoginSuccess,
}) => {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nationalIdRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      nationalIdRef.current?.focus();
    }, 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNationalId = toEnglishDigits(nationalId.trim()).replace(/\D/g, '');

    if (cleanNationalId.length !== 10) {
      setError('لطفاً کد ملی ۱۰ رقمی خود را به درستی وارد نمایید');
      return;
    }

    if (!password.trim()) {
      setError('لطفاً رمز عبور خود را وارد نمایید');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/expert/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          national_id: cleanNationalId,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const accessToken: string | undefined = data?.access_token;
        const refreshToken: string | undefined = data?.refresh_token;
        const u = data?.user;

        if (accessToken) {
          localStorage.setItem('tandis_access_token', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('tandis_refresh_token', refreshToken);
        }
        localStorage.setItem('tandis_user_role', 'expert');

        const fullName =
          u?.first_name || u?.last_name
            ? `${u?.first_name || ''} ${u?.last_name || ''}`.trim()
            : 'کارشناس تندیس';

        setIsLoading(false);
        setIsSuccess(true);

        setTimeout(() => {
          onLoginSuccess({
            phone: u?.phone || cleanNationalId,
            firstName: u?.first_name,
            lastName: u?.last_name,
            nationalId: u?.national_id || cleanNationalId,
            name: fullName,
            role: 'کارشناس رسمی تندیس',
            accessToken,
            refreshToken,
          });
        }, 700);
        return;
      }

      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404 ||
        response.status === 422
      ) {
        const errData = await response.json().catch(() => null);
        setError(
          extractErrorMessage(
            errData,
            'کدملی یا رمزعبور نادرست می باشد. لطفا مجددا تلاش کنید'
          )
        );
        setIsLoading(false);
        return;
      }

      setError('خطا در برقراری ارتباط با سرور احراز هویت کارشناسان');
      setIsLoading(false);
    } catch {
      setError('خطا در برقراری ارتباط با سرور احراز هویت کارشناسان');
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="w-full max-w-md mx-auto py-4 sm:py-8">
      {/* Top Back Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#f2f9f9] border border-[#dfecec] text-xs font-bold text-[#12292c] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowRight className="w-4 h-4 text-[#0a8387]" />
          <span>بازگشت به صفحه اصلی</span>
        </button>

        <span className="px-3 py-1 rounded-full bg-[#0b5c60]/10 text-[#0b5c60] text-[11px] font-bold">
          پرتال کارشناسان
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#dfecec] shadow-[0_20px_50px_-15px_rgba(11,92,96,0.14)] p-6 sm:p-8">
        {/* Card Header */}
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-[#eef4f5]">
          <div className="w-12 h-12 rounded-2xl bg-[#0b5c60] text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#12292c] tracking-tight">
              ورود کارشناس
            </h1>
            <p className="text-xs text-[#5f777b] mt-0.5">
              احراز هویت اختصاصی کارشناسان و مدیران سامانه تندیس
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="expert-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* National ID Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#12292c]">
                  کد ملی کارشناس
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-[#5f777b] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={nationalIdRef}
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => {
                      const val = toEnglishDigits(e.target.value)
                        .replace(/\D/g, '')
                        .slice(0, 10);
                      setNationalId(val);
                      if (error) setError('');
                    }}
                    placeholder="0012345678"
                    className="w-full h-12 pr-11 pl-4 rounded-2xl bg-[#f8fbfb] border border-[#d8eaec] focus:border-[#0a8387] focus:bg-white focus:ring-4 focus:ring-[#0a8387]/10 text-left text-sm font-bold tracking-widest text-[#12292c] placeholder:text-[#94aeb2] placeholder:font-normal placeholder:tracking-normal focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#12292c]">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5f777b] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full h-12 pr-11 pl-11 rounded-2xl bg-[#f8fbfb] border border-[#d8eaec] focus:border-[#0a8387] focus:bg-white focus:ring-4 focus:ring-[#0a8387]/10 text-left text-sm font-bold text-[#12292c] placeholder:text-[#94aeb2] placeholder:font-normal focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                    className="w-8 h-8 rounded-xl text-[#5f777b] hover:text-[#12292c] flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 text-center leading-relaxed"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !nationalId.trim() || !password.trim()}
                className="w-full h-12 mt-2 rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:bg-[#f2f9f9] disabled:text-[#94aeb2] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>ورود به پنل کارشناس</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="expert-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#effcfb] text-[#0a8387] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#12292c]">
                احراز هویت کارشناس تایید شد
              </h3>
              <p className="text-xs text-[#5f777b]">
                در حال انتقال به سامانه تندیس...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
