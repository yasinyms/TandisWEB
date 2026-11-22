import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LocateFixed,
  Scale,
  Upload,
  Zap,
  X
} from 'lucide-react';
import { compressImageToBase64, createServiceRequest } from '../services/tandisApi';
import { DEFAULT_CATEGORY_SLIDERS, toPersianDigits } from '../services/tandisDefaults';
import type { CategorySliderItem, ServiceCategoryGroup, SubServiceItem, TandisCityInfo } from '../types/tandis';

export const OrderWizardModal: React.FC<{
  dark: boolean;
  group: ServiceCategoryGroup | null;
  sub: SubServiceItem | null;
  cityInfo: TandisCityInfo;
  phone: string;
  customerName: string;
  walletBalance: number;
  categorySliders: Record<string, CategorySliderItem[]> | null;
  onRequireLogin: () => void;
  onRequestShaparak: (amountToman: number, title: string, onSuccess: () => Promise<void>) => void;
  onClose: () => void;
  onSubmitted: (msg: string) => void;
}> = ({
  dark,
  group,
  sub,
  cityInfo,
  phone,
  customerName,
  categorySliders,
  onRequireLogin,
  onClose,
  onSubmitted
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [desc, setDesc] = useState('');
  const [legalVisitType, setLegalVisitType] = useState<'غیرحضوری' | 'حضوری'>('غیرحضوری');
  const [legalDocBase64, setLegalDocBase64] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState(cityInfo.neighborhoods[0] || 'مرکز شهر');
  const [address, setAddress] = useState(cityInfo.defaultAddress);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: cityInfo.lat, lng: cityInfo.lng });
  const [locating, setLocating] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!sub || !group) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  const groupSliders =
    (categorySliders && categorySliders[group.slug]) ||
    DEFAULT_CATEGORY_SLIDERS[group.slug] ||
    [];

  const toggleProblem = (p: string) => {
    setSelectedProblems((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleGeoLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        if (!address.includes('موقعیت دقیق')) {
          setAddress((prev) => `${prev} (موقعیت دقیق روی نقشه ثبت شد)`);
        }
      },
      () => setLocating(false),
      { timeout: 7000 }
    );
  };

  const handleFinalSubmit = async () => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (!address.trim()) return;

    setSubmitting(true);
    try {
      const fullDescParts = [
        selectedProblems.length > 0 ? `مشکلات انتخابی: ${selectedProblems.join('، ')}` : '',
        sub.isLegalMode ? `نحوه ارائه خدمت حقوقی: ${legalVisitType}` : '',
        legalDocBase64 ? 'مدرک پیوست‌شده دارد' : '',
        desc.trim()
      ].filter(Boolean);

      await createServiceRequest({
        customer_name: customerName || 'مشتری تندیس',
        customer_phone: phone,
        service_category_id: sub.id,
        service_title: sub.title,
        car_model: model.trim() || (sub.isLegalMode ? `پرونده حقوقی (${legalVisitType})` : 'ثبت از وب‌سایت تندیس'),
        car_plate: legalDocBase64 ? 'HAS_ATTACHMENT' : '',
        issue_description: fullDescParts.join(' | ') || sub.subtitle,
        neighborhood,
        home_address: address.trim(),
        city: cityInfo.name,
        customer_lat: coords.lat,
        customer_lng: coords.lng,
        price_toman: 0,
        is_paid_online: false,
        is_urgent: urgent
      });
      onSubmitted('درخواست شما ثبت و به اپلیکیشن همکار ارسال شد.');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div>
            <div className="text-xs font-bold text-[#065A52] dark:text-[#14B8A6]">{group.title}</div>
            <h3 className="font-black text-base sm:text-lg">{sub.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {groupSliders.length > 0 && (
            <div className="rounded-2xl tandis-calm-gradient text-white p-4 space-y-1">
              {groupSliders[0].badge && (
                <span className="inline-block text-[11px] font-black text-[#FBBF24]">
                  {groupSliders[0].badge}
                </span>
              )}
              <div className="font-black text-sm">{groupSliders[0].title}</div>
              <div className="text-xs text-white/85">{groupSliders[0].subtitle}</div>
            </div>
          )}

          {/* نشانگر ۳ مرحله */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1, label: '۱. جزئیات' },
              { id: 2, label: '۲. نشانی' },
              { id: 3, label: '۳. ارسال درخواست' }
            ].map((s) => (
              <div
                key={s.id}
                className={`rounded-xl py-2 px-3 text-center text-xs font-extrabold border ${
                  step === s.id
                    ? 'bg-[#065A52] text-white border-[#065A52]'
                    : step > s.id
                    ? 'bg-[#10B981]/15 text-[#065A52] dark:text-[#14B8A6] border-[#10B981]/30'
                    : 'border-[#E2EFEF] dark:border-[#26384E] opacity-65'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              {sub.readyProblems.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold">مشکلات پرتکرار:</div>
                  <div className="flex flex-wrap gap-2">
                    {sub.readyProblems.map((prob) => {
                      const active = selectedProblems.includes(prob);
                      return (
                        <button
                          key={prob}
                          type="button"
                          onClick={() => toggleProblem(prob)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            active
                              ? 'bg-[#065A52] text-white border-[#065A52]'
                              : 'border-[#CBD5E1] dark:border-[#26384E] hover:border-[#065A52]'
                          }`}
                        >
                          {prob}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sub.isLegalMode && (
                <div className="rounded-2xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Scale className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
                    نحوه مشاوره حقوقی
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['غیرحضوری', 'حضوری'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLegalVisitType(mode)}
                        className={`py-2.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
                          legalVisitType === mode
                            ? 'bg-[#065A52] text-white border-[#065A52]'
                            : 'bg-white/60 dark:bg-[#1E2D40] border-[#CBD5E1] dark:border-[#26384E]'
                        }`}
                      >
                        مشاوره {mode}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#065A52]/50 py-3 px-4 text-xs font-bold cursor-pointer hover:bg-black/5">
                    <Upload className="w-4 h-4" />
                    <span>{legalDocBase64 ? 'مدرک پیوست شد (تغییر فایل)' : 'پیوست تصویر مدرک (اختیاری)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImageToBase64(file, 960, 0.7);
                          setLegalDocBase64(compressed);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold">
                  {sub.isLegalMode ? 'موضوع پرونده' : 'مدل دستگاه یا خودرو'}
                </label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={sub.isLegalMode ? 'مثلاً پرونده ملکی، مطالبه چک...' : 'مثلاً پژو ۲۰۶، لباسشویی ال‌جی...'}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold">توضیحات</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="جزئیات درخواست خود را بنویسید..."
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold">شهر</label>
                  <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${inputCls}`}>
                    {cityInfo.name} ({cityInfo.province})
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold">محله</label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
                  >
                    {cityInfo.neighborhoods.map((n) => (
                      <option key={n} value={n} className="text-slate-900">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold">نشانی محل</label>
                  <button
                    type="button"
                    onClick={handleGeoLocate}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#065A52] dark:text-[#14B8A6] cursor-pointer"
                  >
                    <LocateFixed className="w-4 h-4" />
                    {locating ? 'در حال دریافت موقعیت...' : 'موقعیت خودکار'}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="خیابان، کوچه، پلاک و واحد..."
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
                />
              </div>

              <label className="flex items-center justify-between rounded-2xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-3.5 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-[#D97706] dark:text-[#FBBF24]" />
                  <div>
                    <div className="text-xs font-black">اعزام فوری</div>
                    <div className="text-[11px] opacity-75">اولویت بالا برای نزدیک‌ترین متخصص</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-4 h-4 accent-[#065A52]"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">خدمت:</span>
                  <strong className="font-black">{sub.title}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">شهر و محله:</span>
                  <strong className="font-bold">{cityInfo.name} - {neighborhood}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="opacity-70 shrink-0">نشانی:</span>
                  <strong className="font-bold text-left truncate">{address}</strong>
                </div>
              </div>

              <div className="rounded-2xl border border-[#065A52]/25 bg-[#065A52]/5 p-4 flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-[#065A52] shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-black">ثبت رایگان درخواست</div>
                  <div className="opacity-75">
                    درخواست بدون پیش‌پرداخت برای متخصصان ارسال می‌شود.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#E2EFEF] dark:border-[#26384E] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="flex items-center gap-1.5 rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] px-4 py-3 text-xs font-extrabold cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              قبلی
            </button>
          ) : (
            <div className="text-xs opacity-70 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              اعزام: {toPersianDigits(sub.etaText)}
            </div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
              className="flex items-center gap-1.5 rounded-2xl bg-[#065A52] hover:bg-[#054943] text-white px-6 py-3 text-xs font-extrabold cursor-pointer"
            >
              بعدی
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !address.trim()}
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white px-6 py-3 text-xs font-extrabold cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'در حال ارسال...' : 'درخواست'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
