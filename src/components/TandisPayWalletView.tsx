import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  Upload,
  Wallet
} from 'lucide-react';
import { compressImageToBase64, submitTandisPayLoan, updateCustomerWallet } from '../services/tandisApi';
import {
  calculateTandisPayInstallment,
  formatToman,
  toLatinDigits,
  toPersianDigits,
  toPurePersianText
} from '../services/tandisDefaults';
import type { TandisPayLoan } from '../types/tandis';

export const TandisPayWalletView: React.FC<{
  dark: boolean;
  phone: string;
  customerName: string;
  walletBalance: number;
  loans: TandisPayLoan[];
  onRequireLogin: () => void;
  onRequestShaparak: (amountToman: number, title: string, onSuccess: () => Promise<void>) => void;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}> = ({
  dark,
  phone,
  customerName,
  walletBalance,
  loans,
  onRequireLogin,
  onRequestShaparak,
  onRefresh,
  onToast
}) => {
  const [customCharge, setCustomCharge] = useState('');
  const [loanAmount, setLoanAmount] = useState<number>(50_000_000);
  const [loanMonths, setLoanMonths] = useState<number>(12);
  const [nationalCode, setNationalCode] = useState('');
  const [docs, setDocs] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [compressingIdx, setCompressingIdx] = useState<number | null>(null);
  const [submittingLoan, setSubmittingLoan] = useState(false);

  const cardCls = dark ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]' : 'bg-white border-[#E2EFEF] text-[#0F2926]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  const calc = useMemo(
    () => calculateTandisPayInstallment(loanAmount, loanMonths),
    [loanAmount, loanMonths]
  );

  const handleChargeWallet = (amountToman: number) => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (amountToman < 10_000) {
      onToast('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.');
      return;
    }
    onRequestShaparak(amountToman, 'افزایش موجودی کیف پول تندیس', async () => {
      await updateCustomerWallet(phone, customerName || 'مشتری تندیس', walletBalance + amountToman);
      onToast(`مبلغ ${formatToman(amountToman)} با موفقیت به کیف پول شما افزوده شد.`);
      onRefresh();
    });
  };

  const handleDocUpload = async (idx: 0 | 1 | 2, file?: File) => {
    if (!file) return;
    setCompressingIdx(idx);
    try {
      const compressed = await compressImageToBase64(file, 960, 0.68);
      setDocs((prev) => {
        const next: [string | null, string | null, string | null] = [...prev];
        next[idx] = compressed;
        return next;
      });
      onToast('تصویر مدرک به‌صورت خودکار فشرده و آماده ارسال شد.');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در پردازش تصویر');
    } finally {
      setCompressingIdx(null);
    }
  };

  const cleanNational = toLatinDigits(nationalCode).replace(/\D/g, '');
  const allThreeDocsUploaded = Boolean(docs[0] && docs[1] && docs[2]);

  const handleSubmitLoan = async () => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (cleanNational.length !== 10 || !allThreeDocsUploaded) return;
    setSubmittingLoan(true);
    try {
      await submitTandisPayLoan({
        phone,
        fullName: customerName || 'مشتری تندیس',
        amountToman: calc.amountToman,
        months: calc.months,
        interestRatePercent: calc.interestRatePercent,
        monthlyInstallmentToman: calc.monthlyInstallmentToman,
        totalRepaymentToman: calc.totalRepaymentToman,
        nationalCode: cleanNational,
        docsBase64: docs.filter((d): d is string => Boolean(d))
      });
      setNationalCode('');
      setDocs([null, null, null]);
      onToast('پرونده تسهیلات تندیس‌پی همراه با ۳ مدرک فشرده‌شده با موفقیت ثبت شد.');
      onRefresh();
    } finally {
      setSubmittingLoan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* بخش کیف پول */}
      <div className={`rounded-3xl border p-6 space-y-5 ${cardCls}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#065A52] dark:text-[#14B8A6]">
              <Wallet className="w-4 h-4" />
              کیف پول یکپارچه تندیس
            </div>
            <div className="text-3xl font-black tabular-nums">{formatToman(walletBalance)}</div>
            <p className={`text-xs ${mutedCls}`}>
              همگام‌سازی لحظه‌ای با سفارش‌ها، رزرو زیبایی و فروشگاه قطعات
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[200_000, 500_000, 1_000_000, 2_000_000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleChargeWallet(amt)}
                className="rounded-2xl border border-[#065A52]/30 bg-[#065A52]/10 hover:bg-[#065A52] hover:text-white text-[#065A52] dark:text-[#14B8A6] px-4 py-2.5 text-xs font-extrabold transition cursor-pointer tabular-nums"
              >
                + {formatToman(amt)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#E2EFEF] dark:border-[#26384E]">
          <input
            type="tel"
            value={customCharge}
            onChange={(e) => setCustomCharge(e.target.value)}
            placeholder="مبلغ دلخواه شارژ به تومان (مثلاً ۷۵۰۰۰۰)"
            className={`flex-1 rounded-2xl border px-4 py-3 text-sm outline-none tabular-nums ${inputCls}`}
          />
          <button
            onClick={() => {
              const val = Number(toLatinDigits(customCharge).replace(/\D/g, ''));
              handleChargeWallet(val);
            }}
            className="rounded-2xl bg-[#065A52] hover:bg-[#054943] text-white px-6 py-3 text-xs font-extrabold cursor-pointer"
          >
            شارژ با درگاه شتاب
          </button>
        </div>
      </div>

      {/* تندیس‌پی: اعتبار و وام ۲۰ تا ۳۰۰ میلیون تومان */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`rounded-3xl border p-6 space-y-5 ${cardCls}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#D97706] dark:text-[#FBBF24]">
              <CreditCard className="w-4 h-4" />
              تسهیلات اعتباری تندیس‌پی (۲۰ تا ۳۰۰ میلیون تومان)
            </div>
            <h2 className="text-xl font-black">محاسبه‌گر پلکانی اقساط و ثبت درخواست</h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span>مبلغ اعتبار درخواستی:</span>
              <span className="text-base font-black text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                {formatToman(calc.amountToman)}
              </span>
            </div>
            <input
              type="range"
              min={20_000_000}
              max={300_000_000}
              step={5_000_000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-[#065A52] cursor-pointer"
            />
            <div className={`flex justify-between text-[11px] tabular-nums ${mutedCls}`}>
              <span>۲۰ میلیون تومان</span>
              <span>۱۵۰ میلیون تومان</span>
              <span>۳۰۰ میلیون تومان</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-extrabold">مدت بازپرداخت (نرخ پلکانی):</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[3, 6, 9, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setLoanMonths(m)}
                  className={`rounded-xl py-2.5 text-xs font-extrabold border cursor-pointer tabular-nums ${
                    loanMonths === m
                      ? 'bg-[#065A52] text-white border-[#065A52]'
                      : 'border-[#CBD5E1] dark:border-[#26384E]'
                  }`}
                >
                  {toPersianDigits(m)} ماهه
                </button>
              ))}
            </div>
            <div className={`text-[11px] leading-5 ${mutedCls}`}>
              تعرفه پلکانی مصوب: تا ۹ ماه ۴ درصد · تا ۱۸ ماه ۱۸ درصد · تا ۲۴ ماه ۲۴ درصد
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 text-xs">
            <div>
              <div className={mutedCls}>نرخ سود مصوب</div>
              <div className="font-black text-base text-[#D97706] dark:text-[#FBBF24] tabular-nums">
                {toPersianDigits(calc.interestRatePercent)} درصد
              </div>
            </div>
            <div>
              <div className={mutedCls}>قسط ماهانه</div>
              <div className="font-black text-base text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                {formatToman(calc.monthlyInstallmentToman)}
              </div>
            </div>
            <div>
              <div className={mutedCls}>مبلغ سود دوره</div>
              <div className="font-bold tabular-nums">{formatToman(calc.totalInterestToman)}</div>
            </div>
            <div>
              <div className={mutedCls}>جمع کل بازپرداخت</div>
              <div className="font-bold tabular-nums">{formatToman(calc.totalRepaymentToman)}</div>
            </div>
          </div>
        </div>

        <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2 font-black text-lg">
            <FileCheck2 className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
            بارگذاری مدارک هویتی و شغلی (فشرده‌سازی خودکار)
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold">کد ملی ۱۰ رقمی متقاضی</label>
            <input
              type="tel"
              maxLength={10}
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              placeholder="کد ملی ۱۰ رقمی"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none tabular-nums ${inputCls}`}
            />
          </div>

          <div className="space-y-2.5">
            {[
              { idx: 0 as const, label: '۱. تصویر روی کارت ملی هوشمند' },
              { idx: 1 as const, label: '۲. تصویر صفحه اول شناسنامه / احراز هویت' },
              { idx: 2 as const, label: '۳. تصویر مدرک شغلی، فیش حقوقی یا جواز کسب' }
            ].map((docItem) => {
              const uploaded = docs[docItem.idx];
              const busy = compressingIdx === docItem.idx;
              return (
                <label
                  key={docItem.idx}
                  className={`flex items-center justify-between gap-3 rounded-2xl border border-dashed p-3.5 cursor-pointer transition ${
                    uploaded
                      ? 'border-[#10B981] bg-[#10B981]/10'
                      : 'border-[#CBD5E1] dark:border-[#26384E] hover:border-[#065A52]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    {uploaded ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                    ) : (
                      <Upload className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6] shrink-0" />
                    )}
                    <span>
                      {busy
                        ? 'در حال فشرده‌سازی خودکار تصویر...'
                        : uploaded
                        ? `${docItem.label} (فشرده و آماده ارسال)`
                        : docItem.label}
                    </span>
                  </div>
                  {uploaded && (
                    <img
                      src={uploaded}
                      alt={docItem.label}
                      className="w-10 h-10 rounded-lg object-cover border border-white/30"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleDocUpload(docItem.idx, e.target.files?.[0])}
                  />
                </label>
              );
            })}
          </div>

          <button
            disabled={submittingLoan || cleanNational.length !== 10 || !allThreeDocsUploaded}
            onClick={handleSubmitLoan}
            className="w-full rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 text-sm font-extrabold cursor-pointer"
          >
            {submittingLoan ? 'در حال ارسال پرونده به کارشناسی...' : 'ارسال مدارک و ثبت نهایی پرونده تندیس‌پی'}
          </button>
        </div>
      </div>

      {/* پیگیری زنده وضعیت کارشناسی پرونده‌های تندیس‌پی */}
      <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
        <div className="flex items-center gap-2 font-black text-base">
          <ShieldCheck className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
          پیگیری زنده وضعیت کارشناسی پرونده‌های تندیس‌پی
        </div>
        {loans.length === 0 ? (
          <div className={`text-xs py-6 text-center ${mutedCls}`}>
            هنوز پرونده اعتباری در تندیس‌پی ثبت نکرده‌اید.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loans.map((ln) => (
              <div key={ln.id} className="rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-black">
                  <span className="tabular-nums">{formatToman(ln.requested_amount_toman)}</span>
                  <span className="text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {toPurePersianText(ln.status)}
                  </span>
                </div>
                <div className={mutedCls}>
                  بازپرداخت {toPersianDigits(ln.installment_months)} ماهه · کد ملی {toPersianDigits(ln.national_code)}
                </div>
                {ln.monthly_installment_toman ? (
                  <div className="font-bold text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                    قسط ماهانه: {formatToman(ln.monthly_installment_toman)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
