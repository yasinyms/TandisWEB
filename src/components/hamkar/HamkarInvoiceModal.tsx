import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from 'lucide-react';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';
import {
  compressHamkarImageStrict,
  submitSpecialistFinalPrice,
  submitSpecialistSettlementRequest,
  toEnglishDigits,
  validateShaba,
} from '../../services/hamkarApi';
import type {
  HamkarOrderItem,
  HamkarSpecialistProfile,
  InvoiceDossier,
  InvoiceEntryMode,
  InvoiceLineItem,
} from '../../types/hamkar';

/* ==================== ۱. مودال صدور فاکتور (آیتمی / مقطوع) ==================== */
interface HamkarInvoiceModalProps {
  order: HamkarOrderItem | null;
  specialist: HamkarSpecialistProfile;
  commissionPercent: number;
  onClose: () => void;
  onSubmitted: (dossier: InvoiceDossier) => void;
  onToast: (msg: string) => void;
}

export const HamkarInvoiceModal: React.FC<HamkarInvoiceModalProps> = ({
  order,
  specialist,
  commissionPercent,
  onClose,
  onSubmitted,
  onToast,
}) => {
  const [mode, setMode] = useState<InvoiceEntryMode>('ITEMIZED');
  const [items, setItems] = useState<
    Array<{ id: string; title: string; quantity: string; unitPrice: string; bySpecialist: boolean }>
  >([
    {
      id: `row_${Date.now()}`,
      title: order?.service_title ? `اجرت ${order.service_title}` : 'اجرت کارشناسی و اجرا',
      quantity: '1',
      unitPrice: '',
      bySpecialist: false,
    },
  ]);
  const [lumpSum, setLumpSum] = useState('');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const computedLineItems: InvoiceLineItem[] = useMemo(() => {
    return items
      .map((row, idx) => {
        const qty = Math.max(1, Number(toEnglishDigits(row.quantity).replace(/\D/g, '') || '1'));
        const unit = Number(toEnglishDigits(row.unitPrice).replace(/\D/g, '') || '0');
        return {
          row_index: idx + 1,
          id: row.id,
          title: row.title.trim() || `ردیف ${idx + 1}`,
          quantity: qty,
          unit_price_toman: unit,
          row_total_toman: qty * unit,
          is_purchased_by_specialist: row.bySpecialist,
        };
      })
      .filter((r) => r.unit_price_toman > 0);
  }, [items]);

  const grossToman = useMemo(() => {
    if (mode === 'LUMP_SUM') {
      return Number(toEnglishDigits(lumpSum).replace(/\D/g, '') || '0');
    }
    return computedLineItems.reduce((acc, r) => acc + r.row_total_toman, 0);
  }, [mode, lumpSum, computedLineItems]);

  const adminCommission = Math.round(grossToman * (commissionPercent / 100));
  const specialistNet = Math.max(0, grossToman - adminCommission);

  if (!order) return null;

  const handlePhotoUpload = async (file?: File) => {
    if (!file) return;
    setError('');
    try {
      const compressed = await compressHamkarImageStrict(file);
      setPhotoBase64(compressed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حجم تصویر نباید بیشتر از ۱ مگابایت باشد';
      setError(msg);
      onToast(msg);
    }
  };

  const handleSubmit = async () => {
    if (grossToman < 1000) {
      setError('حداقل مبلغ کل فاکتور باید ۱,۰۰۰ تومان باشد.');
      return;
    }
    if (mode === 'ITEMIZED' && computedLineItems.length === 0) {
      setError('حداقل یک ردیف با مبلغ معتبر وارد کنید.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const dossier = await submitSpecialistFinalPrice({
        order,
        spec: specialist,
        mode,
        lineItems: mode === 'ITEMIZED' ? computedLineItems : [],
        grossAmountToman: grossToman,
        description: description.trim() || `فاکتور رسمی ${order.service_title}`,
        invoicePhotoBase64: photoBase64,
        commissionPercent,
      });
      onSubmitted(dossier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت فاکتور در سرور مرکزی.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-[#12292c]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white border border-[#dcecec] shadow-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#eef4f5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0b5c60]/10 text-[#0b5c60] flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#12292c]">صدور فاکتور رسمی و اعلام قیمت</h3>
              <p className="text-xs text-[#5f777b]">{order.service_title} · مشتری: {order.customer_name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] flex items-center justify-center text-[#5f777b] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* انتخاب حالت آیتمی / مقطوع */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#f4fafa] border border-[#dcecec]">
          <button
            type="button"
            onClick={() => setMode('ITEMIZED')}
            className={`py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
              mode === 'ITEMIZED' ? 'bg-[#0b5c60] text-white shadow-xs' : 'text-[#5f777b]'
            }`}
          >
            فاکتور آیتمی (ردیف اجرت و قطعات)
          </button>
          <button
            type="button"
            onClick={() => setMode('LUMP_SUM')}
            className={`py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
              mode === 'LUMP_SUM' ? 'bg-[#0b5c60] text-white shadow-xs' : 'text-[#5f777b]'
            }`}
          >
            مبلغ مقطوع توافقی
          </button>
        </div>

        {mode === 'ITEMIZED' ? (
          <div className="space-y-3">
            {items.map((row, idx) => (
              <div key={row.id} className="rounded-2xl border border-[#dcecec] bg-[#f9fcfc] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black text-[#0b5c60]">ردیف {toPersianDigits(idx + 1)}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((x) => x.id !== row.id))}
                      className="text-rose-600 hover:text-rose-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <input
                    value={row.title}
                    onChange={(e) =>
                      setItems((prev) => prev.map((x) => (x.id === row.id ? { ...x, title: e.target.value } : x)))
                    }
                    placeholder="شرح خدمت یا قطعه..."
                    className="sm:col-span-6 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold outline-none"
                  />
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={row.quantity}
                    onChange={(e) =>
                      setItems((prev) => prev.map((x) => (x.id === row.id ? { ...x, quantity: e.target.value } : x)))
                    }
                    placeholder="تعداد"
                    className="sm:col-span-2 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold text-center outline-none tabular-nums"
                  />
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={row.unitPrice}
                    onChange={(e) =>
                      setItems((prev) => prev.map((x) => (x.id === row.id ? { ...x, unitPrice: e.target.value } : x)))
                    }
                    placeholder="قیمت واحد (تومان)"
                    className="sm:col-span-4 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold text-left outline-none tabular-nums"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#375155] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.bySpecialist}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x.id === row.id ? { ...x, bySpecialist: e.target.checked } : x))
                      )
                    }
                    className="accent-[#0b5c60]"
                  />
                  <span>قطعه توسط متخصص تهیه شده است</span>
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  { id: `row_${Date.now()}_${prev.length}`, title: '', quantity: '1', unitPrice: '', bySpecialist: true },
                ])
              }
              className="w-full rounded-xl border border-dashed border-[#0b5c60]/50 text-[#0b5c60] hover:bg-[#eff8f8] py-2.5 text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> افزودن ردیف جدید (اجرت یا قطعه)
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#12292c]">مبلغ کل توافقی فاکتور (تومان)</label>
            <input
              dir="ltr"
              inputMode="numeric"
              value={lumpSum}
              onChange={(e) => setLumpSum(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
              placeholder="مثلاً: 1500000"
              className="w-full rounded-2xl border border-[#cbd5e1] focus:border-[#0b5c60] bg-[#f8fbfb] px-4 py-3 text-base font-black text-left outline-none tabular-nums"
            />
          </div>
        )}

        {/* توضیحات و عکس فاکتور (<1MB) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-[#12292c]">توضیحات فنی فاکتور</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات کار انجام‌شده، ضمانت یا قطعات تعویضی..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] p-3 text-xs font-bold outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-[#12292c]">تصویر فاکتور کاغذی یا کار (اختیاری، زیر ۱MB)</label>
            <label className="h-[84px] rounded-xl border-2 border-dashed border-[#cbd5e1] hover:border-[#0b5c60] bg-[#f8fbfb] flex items-center justify-center gap-2 text-xs font-bold text-[#0b5c60] cursor-pointer overflow-hidden px-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
              {photoBase64 ? (
                <img src={photoBase64} alt="پیش‌نمایش فاکتور" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <>
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>بارگذاری عکس فاکتور</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* پیش‌نمایش زنده تفکیک مالی */}
        <div className="rounded-2xl bg-[#0b5c60] text-white p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/80">مبلغ ناخالص قابل پرداخت مشتری:</span>
            <strong className="text-base font-black tabular-nums">{formatToman(grossToman)}</strong>
          </div>
          <div className="flex items-center justify-between text-white/85">
            <span>کمیسیون سامانه تندیس ({toPersianDigits(commissionPercent)}٪):</span>
            <span className="font-bold tabular-nums">{formatToman(adminCommission)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            <span className="font-extrabold text-[#f2a900]">سهم خالص واریزی به کیف پول شما:</span>
            <strong className="text-base font-black text-[#f2a900] tabular-nums">{formatToman(specialistNet)}</strong>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#f4fafa] border border-[#dcecec] px-4 py-2.5 text-xs font-extrabold text-[#5f777b] cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="rounded-xl bg-[#f2a900] hover:bg-[#dfa000] disabled:opacity-60 text-[#12292c] px-6 py-2.5 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>ثبت نهایی و ارسال فاکتور به مشتری</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================== ۲. مودال نمایش پرونده فاکتور (Dossier Detail) ==================== */
interface HamkarDossierDetailModalProps {
  dossier: InvoiceDossier | null;
  onClose: () => void;
}

export const HamkarDossierDetailModal: React.FC<HamkarDossierDetailModalProps> = ({ dossier, onClose }) => {
  if (!dossier) return null;
  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-[#12292c]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-[2rem] bg-white border border-[#dcecec] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eef4f5]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0b5c60]" />
            <div>
              <h3 className="text-sm font-black text-[#12292c]">پرونده فاکتور رسمی</h3>
              <p dir="ltr" className="text-[11px] font-bold text-[#5f777b] text-right">{dossier.tracking_code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#f4fafa] flex items-center justify-center text-[#5f777b] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-[#f6fbfb] border border-[#dcecec] p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-[#5f777b]">خدمت:</span><strong>{dossier.service_title}</strong></div>
          <div className="flex justify-between"><span className="text-[#5f777b]">مشتری:</span><strong>{dossier.customer_name}</strong></div>
          <div className="flex justify-between"><span className="text-[#5f777b]">نوع فاکتور:</span><strong>{dossier.invoice_mode === 'ITEMIZED' ? 'آیتمی' : 'مقطوع'}</strong></div>
          <div className="flex justify-between"><span className="text-[#5f777b]">وضعیت پرداخت:</span><strong className={dossier.is_paid_online ? 'text-emerald-700' : 'text-amber-700'}>{dossier.is_paid_online ? 'پرداخت آنلاین شده' : 'در انتظار پرداخت'}</strong></div>
        </div>

        {dossier.line_items?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-black text-[#12292c]">ریز اقلام فاکتور</div>
            <div className="divide-y divide-[#eef4f5] rounded-2xl border border-[#dcecec] overflow-hidden text-xs">
              {dossier.line_items.map((item) => (
                <div key={item.id || item.row_index} className="p-3 flex items-center justify-between gap-2 bg-white">
                  <div>
                    <div className="font-bold text-[#12292c]">{item.title}</div>
                    <div className="text-[11px] text-[#5f777b]">
                      تعداد: {toPersianDigits(item.quantity)} · واحد: {formatToman(item.unit_price_toman)}
                      {item.is_purchased_by_specialist ? ' · خرید توسط متخصص' : ''}
                    </div>
                  </div>
                  <strong className="tabular-nums text-[#0b5c60]">{formatToman(item.row_total_toman)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[#0b5c60] text-white p-4 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>جمع کل فاکتور:</span><strong className="tabular-nums">{formatToman(dossier.total_amount_toman)}</strong></div>
          <div className="flex justify-between text-white/80"><span>کمیسیون ({toPersianDigits(dossier.commission_percent)}٪):</span><span className="tabular-nums">{formatToman(dossier.admin_commission_toman)}</span></div>
          <div className="flex justify-between pt-1.5 border-t border-white/15 text-[#f2a900]"><span>خالص متخصص:</span><strong className="tabular-nums">{formatToman(dossier.specialist_net_toman)}</strong></div>
        </div>

        {dossier.description && (
          <div className="text-xs text-[#375155] bg-[#f8fbfb] rounded-xl p-3 border border-[#e2efef]">
            <strong>توضیحات: </strong>{dossier.description}
          </div>
        )}

        {dossier.invoice_photo_base64 && (
          <img
            src={dossier.invoice_photo_base64}
            alt="تصویر فاکتور"
            className="w-full max-h-60 object-contain rounded-2xl border border-[#dcecec] bg-[#f8fbfb]"
          />
        )}
      </div>
    </div>
  );
};

/* ==================== ۳. مودال درخواست تسویه آنی شبا ==================== */
interface HamkarSettlementModalProps {
  open: boolean;
  specialist: HamkarSpecialistProfile;
  balanceToman: number;
  commissionPercent: number;
  completedOrders: HamkarOrderItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const HamkarSettlementModal: React.FC<HamkarSettlementModalProps> = ({
  open,
  specialist,
  balanceToman,
  commissionPercent,
  completedOrders,
  onClose,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const shabaInfo = useMemo(() => validateShaba(specialist.shabaNumber || ''), [specialist.shabaNumber]);

  if (!open) return null;

  const handleConfirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      await submitSpecialistSettlementRequest({
        spec: specialist,
        amountToman: balanceToman,
        commissionPercent,
        completedOrders,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت درخواست تسویه ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-[#12292c]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white border border-[#dcecec] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm text-[#12292c]">
            <Banknote className="w-5 h-5 text-[#0b5c60]" />
            <span>درخواست تسویه آنی به حساب شبا</span>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-[#f4fafa] flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4 text-[#5f777b]" />
          </button>
        </div>

        <div className="rounded-2xl bg-[#f6fbfb] border border-[#dcecec] p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#5f777b]">مبلغ قابل تسویه:</span>
            <strong className="text-base font-black text-[#0b5c60] tabular-nums">{formatToman(balanceToman)}</strong>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-[#e2efef]">
            <span className="text-[#5f777b]">بانک مقصد:</span>
            <span className="font-bold text-[#12292c] inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#0b5c60]" />
              {shabaInfo.valid ? shabaInfo.bankName : 'شبا ثبت نشده'}
            </span>
          </div>
          <div dir="ltr" className="text-[11px] font-black text-center bg-white rounded-xl py-2 border border-[#dcecec] tabular-nums">
            {shabaInfo.valid ? shabaInfo.normalized : 'ابتدا از تب حساب کاربری شماره شبا ثبت کنید'}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f4fafa] border border-[#dcecec] py-2.5 text-xs font-extrabold text-[#5f777b] cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={submitting || !shabaInfo.valid || balanceToman <= 0}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-50 text-white py-2.5 text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>ثبت درخواست تسویه</span>
          </button>
        </div>
      </div>
    </div>
  );
};
