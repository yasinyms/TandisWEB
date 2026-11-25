import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Printer,
  ReceiptText,
  ShieldCheck,
  Wallet,
  X,
  ZoomIn
} from 'lucide-react';
import { cancelRequestWithReason, payRequestInvoice } from '../services/tandisApi';
import {
  detectIranBank,
  formatToman,
  statusPersianLabel,
  toLatinDigits,
  toPersianDigits
} from '../services/tandisDefaults';
import type { ServiceRequestItem } from '../types/tandis';

export const ShaparakGatewayModal: React.FC<{
  open: boolean;
  dark: boolean;
  amountToman: number;
  title: string;
  phone?: string;
  customerName?: string;
  paymentMeta?: Record<string, unknown> | null;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
}> = ({ open, dark, amountToman, title, phone, customerName, paymentMeta, onCancel, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [pin2, setPin2] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [paying, setPaying] = useState(false);
  const [zarinpalConfigured, setZarinpalConfigured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(600);
    setErrorMsg(null);
    fetch('/api/tandis/payment/zarinpal/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setZarinpalConfigured(Boolean(d?.configured)))
      .catch(() => setZarinpalConfigured(false));
    const t = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [open]);

  if (!open) return null;

  const cleanCard = toLatinDigits(cardNumber).replace(/\D/g, '').slice(0, 16);
  const formattedCard = cleanCard.replace(/(\d{4})(?=\d)/g, '$1 - ');
  const detectedBank = detectIranBank(cleanCard);

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const handleZarinpalRedirect = async () => {
    setPaying(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/tandis/payment/zarinpal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountToman,
          title,
          phone: phone || '',
          customerName: customerName || 'مشتری تندیس',
          meta: paymentMeta || null
        })
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.gatewayUrl) {
        window.location.assign(String(data.gatewayUrl));
        return;
      }
      setErrorMsg(String(data?.message || 'خطا در اتصال به درگاه زرین‌پال'));
    } catch {
      setErrorMsg('خطا در اتصال به درگاه زرین‌پال');
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (cleanCard.length !== 16) {
      setErrorMsg('شماره کارت ۱۶ رقمی را به‌طور کامل وارد کنید.');
      return;
    }
    if (toLatinDigits(cvv2).replace(/\D/g, '').length < 3) {
      setErrorMsg('شماره شناسایی دوم کارت را صحیح وارد کنید.');
      return;
    }
    if (!expMonth || !expYear) {
      setErrorMsg('ماه و سال انقضای کارت را وارد کنید.');
      return;
    }
    if (toLatinDigits(pin2).replace(/\D/g, '').length < 4) {
      setErrorMsg('رمز دوم کارت را وارد کنید.');
      return;
    }
    setPaying(true);
    setErrorMsg(null);
    try {
      await onSuccess();
      onCancel();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'خطا در ثبت تراکنش');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${panelCls}`}>
        <div className="tandis-calm-gradient text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#FBBF24]" />
            <div>
              <div className="font-black text-base">درگاه پرداخت الکترونیک شاپرک تندیس</div>
              <div className="text-[11px] text-white/80">تراکنش امن با رمز پویا و تایید بانکی</div>
            </div>
          </div>
          <div className="text-left text-xs font-black tabular-nums bg-black/20 px-3 py-1 rounded-xl">
            {toPersianDigits(String(mins).padStart(2, '0'))}:{toPersianDigits(String(secs).padStart(2, '0'))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] opacity-70">پذیرنده: سامانه رسمی تندیس</div>
              <div className="text-xs font-extrabold mt-0.5">{title}</div>
            </div>
            <div className="text-left">
              <div className="text-base font-black text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                {formatToman(amountToman)}
              </div>
              <div className="text-[11px] opacity-65 tabular-nums">
                معادل {toPersianDigits((amountToman * 10).toLocaleString('en-US'))} ریال
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-bold text-red-500">
              {errorMsg}
            </div>
          )}

          {zarinpalConfigured && paymentMeta ? (
            <div className="space-y-3 pt-1">
              <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-4 text-xs leading-6">
                درگاه پرداخت شاپرکی زرین‌پال فعال است. با کلیک روی دکمه زیر به صفحه امن بانک هدایت می‌شوید.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={paying}
                  onClick={handleZarinpalRedirect}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 text-sm font-extrabold cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {paying ? 'در حال انتقال...' : 'انتقال به درگاه زرین‌پال'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] py-3.5 text-sm font-bold cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span>شماره کارت ۱۶ رقمی</span>
                  {detectedBank && (
                    <span className="font-black" style={{ color: detectedBank.accent }}>
                      {detectedBank.name}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute right-3.5 top-3.5 opacity-55" />
                  <input
                    type="tel"
                    value={toPersianDigits(formattedCard)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="۶۰۳۷ - ۹۹۷۵ - .... - ...."
                    className={`w-full rounded-2xl border pr-10 pl-4 py-3 text-center text-sm font-black outline-none tabular-nums ${inputCls}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold">کد امنیتی کارت</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv2}
                    onChange={(e) => setCvv2(e.target.value)}
                    placeholder="۳ یا ۴ رقم"
                    className={`w-full rounded-2xl border px-3 py-2.5 text-center text-sm outline-none tabular-nums ${inputCls}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold">ماه انقضا</label>
                  <input
                    type="tel"
                    maxLength={2}
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    placeholder="۰۸"
                    className={`w-full rounded-2xl border px-3 py-2.5 text-center text-sm outline-none tabular-nums ${inputCls}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold">سال انقضا</label>
                  <input
                    type="tel"
                    maxLength={2}
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    placeholder="۰۷"
                    className={`w-full rounded-2xl border px-3 py-2.5 text-center text-sm outline-none tabular-nums ${inputCls}`}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={8}
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value)}
                  placeholder="رمز دوم / رمز پویا"
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm outline-none tabular-nums ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={() => setOtpRequested(true)}
                  className="rounded-2xl border border-[#065A52] text-[#065A52] dark:text-[#14B8A6] px-4 py-3 text-xs font-extrabold whitespace-nowrap cursor-pointer"
                >
                  {otpRequested ? 'رمز پویا ارسال شد' : 'درخواست رمز پویا'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={paying}
                  onClick={handlePay}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 text-sm font-extrabold cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {paying ? 'در حال تایید پرداخت...' : 'پرداخت آنلاین'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] py-3.5 text-sm font-bold cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const CancelReasonModal: React.FC<{
  request: ServiceRequestItem | null;
  dark: boolean;
  onClose: () => void;
  onCancelled: (msg: string) => void;
}> = ({ request, dark, onClose, onCancelled }) => {
  const [reason, setReason] = useState('عدم توافق با مبلغ اعلام‌شده');
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  if (!request) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const presets = [
    'عدم توافق با مبلغ اعلام‌شده',
    'تغییر برنامه و انصراف از دریافت خدمت',
    'تاخیر بیش از حد در اعزام متخصص',
    'حل شدن مشکل پیش از حضور متخصص'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${panelCls}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg">ثبت دلیل لغو سفارش</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setReason(p)}
              className={`w-full text-right rounded-2xl border px-4 py-2.5 text-xs font-bold cursor-pointer ${
                reason === p ? 'border-[#065A52] bg-[#065A52]/10' : 'border-[#E2EFEF] dark:border-[#26384E]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="توضیحات بیشتر درباره دلیل لغو (اختیاری)..."
          className="w-full rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] bg-transparent p-3 text-xs outline-none"
        />

        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await cancelRequestWithReason(request, custom.trim() || reason);
              onCancelled('درخواست لغو سفارش با موفقیت در سرور ثبت شد.');
              onClose();
            } finally {
              setBusy(false);
            }
          }}
          className="w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-extrabold cursor-pointer"
        >
          {busy ? 'در حال ثبت...' : 'تایید لغو سفارش'}
        </button>
      </div>
    </div>
  );
};

export const InvoiceDetailModal: React.FC<{
  request: ServiceRequestItem | null;
  dark: boolean;
  phone: string;
  customerName: string;
  walletBalance: number;
  onClose: () => void;
  onRequestShaparak: (
    amountToman: number,
    title: string,
    onSuccess: () => Promise<void>,
    paymentMeta?: Record<string, unknown>
  ) => void;
  onRequestCancel: (req: ServiceRequestItem) => void;
  onPaid: (msg: string) => void;
}> = ({
  request,
  dark,
  phone,
  customerName,
  walletBalance,
  onClose,
  onRequestShaparak,
  onRequestCancel,
  onPaid
}) => {
  const [zoomPhoto, setZoomPhoto] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!request) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';
  const items = request.invoice_items || [];

  const handleWalletPay = async () => {
    if (walletBalance < request.price_toman) return;
    setPaying(true);
    try {
      await payRequestInvoice({
        request,
        phone,
        customerName: customerName || 'مشتری تندیس',
        methodLabel: 'کیف پول تندیس',
        newWalletBalance: walletBalance - request.price_toman
      });
      onPaid('فاکتور با موفقیت از کیف پول پرداخت شد.');
      onClose();
    } finally {
      setPaying(false);
    }
  };

  const handleGatewayPay = () => {
    onRequestShaparak(
      request.price_toman,
      `پرداخت فاکتور: ${request.service_title}`,
      async () => {
        await payRequestInvoice({
          request,
          phone,
          customerName: customerName || 'مشتری تندیس',
          methodLabel: 'درگاه آنلاین شاپرک'
        });
        onPaid('پرداخت آنلاین فاکتور با موفقیت انجام و در سرور مرکزی ثبت شد.');
        onClose();
      },
      {
        kind: 'invoice',
        phone,
        customerName: customerName || 'مشتری تندیس',
        requestId: request.id,
        specialistId: request.assigned_specialist_id || 'spec_101',
        specialistName: request.assigned_specialist_name || 'متخصص تندیس'
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E] no-print">
          <div className="flex items-center gap-2 font-black text-lg">
            <ReceiptText className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
            رسید و جزئیات فاکتور تندیس
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] dark:border-[#26384E] px-3 py-1.5 text-xs font-extrabold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              چاپ رسید رسمی
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4">
            <div className="space-y-1 text-xs">
              <div className="font-black text-base">{request.service_title}</div>
              <div className={mutedCls}>
                وضعیت: {statusPersianLabel(request.status)} · متخصص: {request.assigned_specialist_name || 'متخصص تندیس'}
              </div>
              {request.payment_reference_id && (
                <div className="font-bold text-[#10B981]">
                  کد رهگیری پرداخت: {toPersianDigits(request.payment_reference_id)}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-xs ${mutedCls}`}>مبلغ کل فاکتور</div>
              <div className="text-xl font-black text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                {formatToman(request.price_toman)}
              </div>
            </div>
          </div>

          {request.invoice_description && (
            <div className="rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] p-3.5 text-xs leading-6">
              <strong>توضیح کارشناسی متخصص: </strong>
              {request.invoice_description}
            </div>
          )}

          {items.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-[#E2EFEF] dark:border-[#26384E]">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#F3F8F8] dark:bg-[#1E2D40] font-black">
                  <tr>
                    <th className="p-3">شرح کالا یا اجرت</th>
                    <th className="p-3">تعداد</th>
                    <th className="p-3">مبلغ واحد</th>
                    <th className="p-3">جمع ردیف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EFEF] dark:divide-[#26384E]">
                  {items.map((it, idx) => {
                    const qty = it.quantity ?? 1;
                    const unitPrice = it.unit_price_toman ?? it.price_toman ?? it.amount_toman ?? 0;
                    const rowTotal = it.row_total_toman ?? it.amount_toman ?? it.price_toman ?? qty * unitPrice;
                    return (
                      <tr key={idx}>
                        <td className="p-3 font-bold">{it.title}</td>
                        <td className="p-3 tabular-nums">{toPersianDigits(qty)}</td>
                        <td className="p-3 tabular-nums">{formatToman(unitPrice)}</td>
                        <td className="p-3 font-black tabular-nums">{formatToman(rowTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {request.invoice_photo_base64 && (
            <div className="space-y-2">
              <div className="text-xs font-extrabold">تصویر فاکتور یا قطعه ثبت‌شده (برای بزرگ‌نمایی کلیک کنید):</div>
              <button
                type="button"
                onClick={() => setZoomPhoto(true)}
                className="relative group rounded-2xl overflow-hidden border border-[#E2EFEF] dark:border-[#26384E] cursor-pointer"
              >
                <img
                  src={request.invoice_photo_base64}
                  alt="تصویر فاکتور تندیس"
                  className="max-h-56 object-contain bg-black/5"
                />
                <span className="absolute bottom-2 left-2 rounded-xl bg-black/65 text-white px-2.5 py-1 text-[11px] flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  بزرگ‌نمایی
                </span>
              </button>
            </div>
          )}

          {request.has_specialist_invoice &&
            request.price_toman > 0 &&
            !request.is_paid_online &&
            !['COMPLETED', 'CANCELLED'].includes(String(request.status || '').toUpperCase()) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 no-print">
                <button
                  disabled={paying || walletBalance < request.price_toman}
                  onClick={handleWalletPay}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3 text-xs font-extrabold cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  کیف پول ({formatToman(walletBalance)})
                </button>
                <button
                  disabled={paying}
                  onClick={handleGatewayPay}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] py-3 text-xs font-black cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  درگاه شتاب
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onRequestCancel(request);
                  }}
                  className="rounded-2xl border border-red-400 text-red-500 hover:bg-red-500/10 py-3 text-xs font-extrabold cursor-pointer"
                >
                  رد فاکتور و لغو
                </button>
              </div>
            )}
        </div>
      </div>

      {zoomPhoto && request.invoice_photo_base64 && (
        <div
          onClick={() => setZoomPhoto(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 cursor-zoom-out"
        >
          <img
            src={request.invoice_photo_base64}
            alt="بزرگ‌نمایی فاکتور تندیس"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};
