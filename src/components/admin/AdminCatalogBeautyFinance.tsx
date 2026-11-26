import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Eye,
  Landmark,
  Percent,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  XCircle
} from 'lucide-react';
import {
  type AdminCategory,
  type AdminLiveState,
  type AdminLoan,
  type AdminSettlement,
  type AdminSubCategory,
  deleteBeautyBookingAdmin,
  deleteBeautyProfileAdmin,
  deleteDossierAdmin,
  deleteLoanAdmin,
  deleteSettlementAdmin,
  formatPersianDateTime,
  persianBeautyBookingStatus,
  persianLoanStatus,
  persianSettlementStatus,
  runBeautyBookingActionAdmin,
  runBeautyPriceActionAdmin,
  runLoanActionAdmin,
  runSettlementActionAdmin,
  safeImageSrc,
  saveCategoriesAdmin,
  saveCommissionAdmin
} from '../../services/adminApi';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';

interface CatalogFinanceProps {
  data: AdminLiveState;
  globalQuery: string;
  onRefresh: () => Promise<void>;
  onToast: (msg: string) => void;
}

// ==================== ماژول ۵: انتشار زنده دسته‌بندی‌ها و زیرخدمات ====================
export const AdminCategoriesView: React.FC<CatalogFinanceProps> = ({
  data,
  onRefresh,
  onToast
}) => {
  const [draft, setDraft] = useState<AdminCategory[]>(() => data.categories);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatSub, setNewCatSub] = useState('');
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubPrice, setNewSubPrice] = useState('450000');
  const [newSubProblems, setNewSubProblems] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data.categories.length > 0 && draft.length === 0) {
      setDraft(data.categories);
    }
  }, [data.categories, draft.length]);

  const activeCat = draft[selectedIdx] || null;

  const handleAddCategory = () => {
    const title = newCatTitle.trim();
    if (!title) {
      onToast('عنوان دسته‌بندی جدید را وارد کنید.');
      return;
    }
    const ts = Date.now();
    const next: AdminCategory = {
      id: `cat-${ts}`,
      slug: `cat-${ts}`,
      title,
      subtitle: newCatSub.trim() || 'خدمات تخصصی تندیس در محل',
      description: newCatSub.trim() || 'خدمات تخصصی تندیس در محل',
      icon_key: 'ic_tech_wrench',
      color_hex: '#0E4D3B',
      order_index: draft.length,
      is_active: true,
      is_coming_soon: false,
      subcategories: []
    };
    const updated = [...draft, next];
    setDraft(updated);
    setSelectedIdx(updated.length - 1);
    setNewCatTitle('');
    setNewCatSub('');
  };

  const handleAddSub = () => {
    if (!activeCat || !newSubTitle.trim()) {
      onToast('ابتدا یک دسته‌بندی انتخاب کرده و عنوان زیرخدمت را وارد کنید.');
      return;
    }
    const ts = Date.now();
    const sub: AdminSubCategory = {
      id: `sub-${ts}`,
      slug: `sub-${ts}`,
      title: newSubTitle.trim(),
      subtitle: 'ارائه در محل با ضمانت تندیس',
      description: 'ارائه در محل با ضمانت تندیس',
      base_price_toman: Number(newSubPrice) || 450000,
      eta_text: '۴۵ دقیقه',
      is_coming_soon: false,
      is_active: true,
      ready_problems: newSubProblems
        .split(/[،,\n]/)
        .map((x) => x.trim())
        .filter(Boolean)
    };
    setDraft((prev) =>
      prev.map((c, idx) =>
        idx === selectedIdx ? { ...c, subcategories: [...(c.subcategories || []), sub] } : c
      )
    );
    setNewSubTitle('');
    setNewSubProblems('');
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await saveCategoriesAdmin(draft);
      onToast('تغییرات دسته‌بندی‌ها به‌صورت زنده روی سایت و اپلیکیشن‌ها منتشر شد.');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در انتشار دسته‌بندی‌ها');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#dfece8] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-[#0f2922]">انتشار زنده دسته‌بندی‌ها و زیرخدمات</h2>
          <p className="text-xs text-[#5d7970] mt-0.5">
            هر تغییر پس از انتشار بلافاصله در سایت، تندیس مشتری، تندیس همکار و تندیس مدیر اعمال می‌شود.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handlePublish}
          className="px-5 py-2.5 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'در حال انتشار...' : 'انتشار زنده روی کل سامانه'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#dfece8] p-4 space-y-3">
          <div className="text-xs font-black text-[#0E4D3B]">دسته‌بندی‌های اصلی ({toPersianDigits(draft.length)})</div>
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
            {draft.map((cat, idx) => (
              <div
                key={cat.id || idx}
                onClick={() => setSelectedIdx(idx)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-2 ${
                  idx === selectedIdx
                    ? 'bg-[#eef7f4] border-[#0E4D3B] text-[#0E4D3B]'
                    : 'bg-[#fafdfb] border-[#e6f0ec] hover:bg-[#f2f8f5]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">{cat.title}</div>
                  <div className="text-[11px] text-[#607b72]">
                    {toPersianDigits((cat.subcategories || []).length)} زیرخدمت
                    {cat.is_coming_soon ? ' · به‌زودی' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraft((prev) =>
                        prev.map((c, i) => (i === idx ? { ...c, is_coming_soon: !c.is_coming_soon } : c))
                      );
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold whitespace-nowrap cursor-pointer"
                  >
                    {cat.is_coming_soon ? 'فعال‌سازی' : 'به‌زودی'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraft((prev) => prev.filter((_, i) => i !== idx));
                      setSelectedIdx(0);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                    aria-label="حذف دسته‌بندی"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#e8f0ed] space-y-2">
            <input
              value={newCatTitle}
              onChange={(e) => setNewCatTitle(e.target.value)}
              placeholder="عنوان دسته‌بندی جدید..."
              className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] text-xs outline-none focus:border-[#0E4D3B]"
            />
            <input
              value={newCatSub}
              onChange={(e) => setNewCatSub(e.target.value)}
              placeholder="توضیح کوتاه دسته‌بندی"
              className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] text-xs outline-none focus:border-[#0E4D3B]"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="w-full py-2 rounded-xl bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] text-xs font-extrabold inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن دسته‌بندی</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dfece8] p-4 space-y-4">
          {!activeCat ? (
            <div className="py-12 text-center text-xs text-[#68837b] font-bold">
              یک دسته‌بندی انتخاب کنید یا دسته‌بندی جدید بسازید.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#0f2922]">زیرخدمات دسته «{activeCat.title}»</h3>
                <span className="text-xs text-[#5d7970]">
                  {toPersianDigits((activeCat.subcategories || []).length)} مهارت ثبت‌شده
                </span>
              </div>

              <div className="divide-y divide-[#edf4f1] max-h-[300px] overflow-y-auto">
                {(activeCat.subcategories || []).map((sub, sIdx) => (
                  <div key={sub.id || sIdx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-extrabold text-[#0f2922]">
                        {sub.title}{' '}
                        {sub.is_coming_soon && <span className="text-amber-700 font-bold">(به‌زودی)</span>}
                      </div>
                      <div className="text-[11px] text-[#5e7a71] mt-0.5">
                        پایه: {formatToman(Number(sub.base_price_toman || 0))}
                        {Array.isArray(sub.ready_problems) && sub.ready_problems.length > 0
                          ? ` · مشکلات آماده: ${sub.ready_problems.join('، ')}`
                          : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) =>
                            prev.map((c, ci) =>
                              ci === selectedIdx
                                ? {
                                    ...c,
                                    subcategories: (c.subcategories || []).map((s, si) =>
                                      si === sIdx ? { ...s, is_coming_soon: !s.is_coming_soon } : s
                                    )
                                  }
                                : c
                            )
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold whitespace-nowrap cursor-pointer"
                      >
                        {sub.is_coming_soon ? 'فعال‌سازی' : 'به‌زودی'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) =>
                            prev.map((c, ci) =>
                              ci === selectedIdx
                                ? { ...c, subcategories: (c.subcategories || []).filter((_, si) => si !== sIdx) }
                                : c
                            )
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-[#e8f0ed]">
                <input
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  placeholder="عنوان زیرخدمت جدید (مثلاً تعمیر پکیج)"
                  className="px-3 py-2 rounded-xl border border-[#cfe0da] text-xs outline-none focus:border-[#0E4D3B]"
                />
                <input
                  type="number"
                  value={newSubPrice}
                  onChange={(e) => setNewSubPrice(e.target.value)}
                  placeholder="مبلغ پایه (تومان)"
                  className="px-3 py-2 rounded-xl border border-[#cfe0da] text-xs font-bold tabular-nums outline-none focus:border-[#0E4D3B]"
                />
                <input
                  value={newSubProblems}
                  onChange={(e) => setNewSubProblems(e.target.value)}
                  placeholder="مشکلات آماده پرتکرار (با ویرگول جدا کنید)"
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-[#cfe0da] text-xs outline-none focus:border-[#0E4D3B]"
                />
                <button
                  type="button"
                  onClick={handleAddSub}
                  className="sm:col-span-2 py-2.5 rounded-xl bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] text-xs font-extrabold inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن زیرخدمت به این دسته</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ماژول ۶: مدیریت بخش زیبایی و سلامت ====================
export const AdminBeautyView: React.FC<CatalogFinanceProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [subTab, setSubTab] = useState<'prices' | 'bookings'>('prices');
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState('');

  const q = globalQuery.trim().toLowerCase();
  const filteredProfiles = useMemo(
    () =>
      data.beautyProfiles.filter(
        (p) => !q || p.specialist_name.toLowerCase().includes(q) || p.specialist_phone.includes(q) || p.city.toLowerCase().includes(q)
      ),
    [data.beautyProfiles, q]
  );

  const filteredBookings = useMemo(
    () =>
      data.beautyBookings.filter(
        (b) =>
          !q ||
          b.customer_name.toLowerCase().includes(q) ||
          b.specialist_name.toLowerCase().includes(q) ||
          b.service_title.toLowerCase().includes(q) ||
          b.customer_phone.includes(q)
      ),
    [data.beautyBookings, q]
  );

  const handlePriceDecision = async (profileId: string, skillIndex: number, status: 'APPROVED' | 'REJECTED', fallbackPrice: number) => {
    const key = `${profileId}_${skillIndex}`;
    const customAmount = Number((priceEdits[key] || String(fallbackPrice)).replace(/[^\d]/g, ''));
    setBusyKey(key);
    try {
      await runBeautyPriceActionAdmin({
        profileId,
        skillIndex,
        status,
        approvedPriceToman: customAmount || fallbackPrice
      });
      onToast(status === 'APPROVED' ? 'تعرفه خدمت زیبایی تایید و منتشر شد.' : 'تعرفه پیشنهادی رد شد.');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در بروزرسانی تعرفه');
    } finally {
      setBusyKey('');
    }
  };

  const handleBookingDecision = async (bookingId: string, status: 'COMPLETED' | 'CANCELLED_REFUNDED') => {
    setBusyKey(bookingId);
    try {
      const res = await runBeautyBookingActionAdmin({ bookingId, status });
      onToast(
        res.refundedNow
          ? 'نوبت لغو شد و مبلغ بیعانه به‌صورت خودکار به کیف پول مشتری برگشت داده شد.'
          : 'وضعیت نوبت زیبایی بروزرسانی شد.'
      );
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در بروزرسانی نوبت');
    } finally {
      setBusyKey('');
    }
  };

  const handleDeleteProfile = async (profileId: string, name: string) => {
    setBusyKey(`del_prof_${profileId}`);
    try {
      await deleteBeautyProfileAdmin(profileId);
      onToast(`پروفایل زیبایی «${name}» با موفقیت حذف شد.`);
      setConfirmDeleteKey('');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف پروفایل زیبایی');
    } finally {
      setBusyKey('');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setBusyKey(`del_book_${bookingId}`);
    try {
      await deleteBeautyBookingAdmin(bookingId);
      onToast('نوبت زیبایی با موفقیت حذف شد.');
      setConfirmDeleteKey('');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف نوبت زیبایی');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-[#dfece8] p-2 w-fit">
        <button
          type="button"
          onClick={() => setSubTab('prices')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer ${
            subTab === 'prices' ? 'bg-[#0E4D3B] text-white' : 'text-[#48675e]'
          }`}
        >
          تایید تعرفه متخصصین زیبایی ({toPersianDigits(data.beautyProfiles.length)})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer ${
            subTab === 'bookings' ? 'bg-[#0E4D3B] text-white' : 'text-[#48675e]'
          }`}
        >
          نظارت بر نوبت‌ها و استرداد بیعانه ({toPersianDigits(data.beautyBookings.length)})
        </button>
      </div>

      {subTab === 'prices' ? (
        <div className="space-y-4">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#dfece8] p-10 text-center text-xs text-[#68837b] font-bold">
              پروفایل متخصص زیبایی برای بررسی ثبت نشده است.
            </div>
          ) : (
            filteredProfiles.map((prof) => {
              const avatar = safeImageSrc(prof.avatar_url);
              return (
                <div key={prof.id} className="bg-white rounded-2xl border border-[#dfece8] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#eef7f4] overflow-hidden flex items-center justify-center shrink-0">
                        {avatar ? (
                          <img src={avatar} alt={prof.specialist_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-[#0E4D3B]" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#0f2922]">{prof.specialist_name}</div>
                        <div className="text-xs text-[#5d7970] tabular-nums">
                          {prof.city} · {toPersianDigits(prof.specialist_phone)}
                        </div>
                      </div>
                    </div>
                    {confirmDeleteKey === `prof_${prof.id}` ? (
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          disabled={busyKey === `del_prof_${prof.id}`}
                          onClick={() => handleDeleteProfile(prof.id, prof.specialist_name)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                        >
                          {busyKey === `del_prof_${prof.id}` ? 'حذف...' : 'تایید حذف پروفایل'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKey('')}
                          className="px-2.5 py-1.5 rounded-xl border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(`prof_${prof.id}`)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-extrabold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف پروفایل زیبایی</span>
                      </button>
                    )}
                  </div>

                  {prof.portfolio_items.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {prof.portfolio_items.slice(0, 6).map((item, idx) => {
                        const img = safeImageSrc(item.image_url || item.image_base64);
                        if (!img) return null;
                        return (
                          <img
                            key={idx}
                            src={img}
                            alt={item.title || 'نمونه‌کار'}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover border border-[#e3efe9] shrink-0"
                          />
                        );
                      })}
                    </div>
                  )}

                  <div className="divide-y divide-[#edf4f1] text-xs">
                    {prof.service_prices.length === 0 ? (
                      <div className="py-3 text-[#68837b]">تعرفه پیشنهادی ثبت نشده است.</div>
                    ) : (
                      prof.service_prices.map((sp, idx) => {
                        const key = `${prof.id}_${idx}`;
                        const basePrice = Number(sp.approved_price_toman || sp.proposed_price_toman || sp.price_toman || 0);
                        const st = String(sp.status || (sp.admin_approved ? 'APPROVED' : 'PENDING')).toUpperCase();
                        return (
                          <div key={key} className="py-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="font-extrabold text-[#0f2922]">{sp.skill_title || sp.title || 'خدمت زیبایی'}</div>
                              <div className="text-[11px] text-[#607b72] tabular-nums">
                                مبلغ پیشنهادی: {formatToman(Number(sp.proposed_price_toman || sp.price_toman || 0))} · وضعیت:{' '}
                                {st === 'APPROVED' ? 'تاییدشده' : st === 'REJECTED' ? 'ردشده' : 'در انتظار تایید'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={priceEdits[key] ?? String(basePrice)}
                                onChange={(e) => setPriceEdits((prev) => ({ ...prev, [key]: e.target.value }))}
                                className="w-32 px-2.5 py-1.5 rounded-lg border border-[#cfe0da] text-xs font-bold tabular-nums"
                                placeholder="مبلغ مصوب"
                              />
                              <button
                                type="button"
                                disabled={busyKey === key}
                                onClick={() => handlePriceDecision(prof.id, idx, 'APPROVED', basePrice)}
                                className="px-3 py-1.5 rounded-lg bg-[#0E4D3B] hover:bg-[#146C53] text-white font-bold whitespace-nowrap cursor-pointer"
                              >
                                تایید
                              </button>
                              <button
                                type="button"
                                disabled={busyKey === key}
                                onClick={() => handlePriceDecision(prof.id, idx, 'REJECTED', basePrice)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold whitespace-nowrap cursor-pointer"
                              >
                                رد
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
                <tr>
                  <th className="py-3 px-4 font-extrabold">خدمت و زمان نوبت</th>
                  <th className="py-3 px-4 font-extrabold">مشتری</th>
                  <th className="py-3 px-4 font-extrabold">متخصص</th>
                  <th className="py-3 px-4 font-extrabold">بیعانه پرداخت‌شده</th>
                  <th className="py-3 px-4 font-extrabold">وضعیت</th>
                  <th className="py-3 px-4 font-extrabold">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf4f1]">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#68837b] font-bold">
                      نوبت زیبایی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const st = persianBeautyBookingStatus(b.status);
                    return (
                      <tr key={b.id} className="hover:bg-[#f9fcfb]">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-[#0f2922]">{b.service_title}</div>
                          <div className="text-[11px] text-[#607b72] tabular-nums">
                            {b.appointment_date} {b.appointment_time}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold">{b.customer_name}</div>
                          <div className="text-[11px] text-[#607b72] tabular-nums" dir="ltr">
                            {toPersianDigits(b.customer_phone)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold">{b.specialist_name}</td>
                        <td className="py-3 px-4 font-extrabold text-[#0E4D3B] tabular-nums">
                          {formatToman(b.paid_amount_toman)}
                          {b.wallet_refunded && (
                            <div className="text-[10px] text-emerald-700 font-bold">مستردشده به کیف پول</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${st.tone}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {b.status !== 'COMPLETED' && (
                              <button
                                type="button"
                                disabled={busyKey === b.id}
                                onClick={() => handleBookingDecision(b.id, 'COMPLETED')}
                                className="px-2.5 py-1.5 rounded-lg bg-[#eef7f4] text-[#0E4D3B] font-bold whitespace-nowrap cursor-pointer"
                              >
                                تکمیل
                              </button>
                            )}
                            {b.status !== 'CANCELLED_REFUNDED' && (
                              <button
                                type="button"
                                disabled={busyKey === b.id}
                                onClick={() => handleBookingDecision(b.id, 'CANCELLED_REFUNDED')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold whitespace-nowrap cursor-pointer"
                              >
                                لغو و استرداد خودکار
                              </button>
                            )}
                            {confirmDeleteKey === `book_${b.id}` ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={busyKey === `del_book_${b.id}`}
                                  onClick={() => handleDeleteBooking(b.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                                >
                                  تایید حذف
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteKey('')}
                                  className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                                >
                                  انصراف
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteKey(`book_${b.id}`)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ماژول ۷: مدیریت تندیس‌پی (وام خرید خدمت) ====================
export const AdminLoansView: React.FC<CatalogFinanceProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [selected, setSelected] = useState<AdminLoan | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');

  const q = globalQuery.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      data.loans.filter(
        (l) =>
          !q ||
          l.customer_name.toLowerCase().includes(q) ||
          l.customer_phone.includes(q) ||
          l.national_code.includes(q) ||
          l.tracking_code.includes(q)
      ),
    [data.loans, q]
  );

  const handleDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await runLoanActionAdmin(selected.id, {
        status,
        rejectReason: rejectReason.trim(),
        customerPhone: selected.customer_phone,
        requestedAmount: selected.requested_amount_toman
      });
      onToast(
        status === 'APPROVED'
          ? `وام با کد رهگیری ${toPersianDigits(res.trackingCode || '')} تایید و مبلغ به کیف پول مشتری شارژ شد.`
          : 'درخواست وام رد شد.'
      );
      setSelected(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در بررسی درخواست وام');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteLoan = async (loanId: string) => {
    setBusy(true);
    try {
      await deleteLoanAdmin(loanId);
      onToast('پرونده وام تندیس‌پی با موفقیت حذف شد.');
      setConfirmDeleteId('');
      if (selected?.id === loanId) setSelected(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف پرونده وام');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
              <tr>
                <th className="py-3 px-4 font-extrabold">متقاضی و کد ملی</th>
                <th className="py-3 px-4 font-extrabold">مبلغ درخواستی</th>
                <th className="py-3 px-4 font-extrabold">اقساط</th>
                <th className="py-3 px-4 font-extrabold">کد رهگیری</th>
                <th className="py-3 px-4 font-extrabold">وضعیت</th>
                <th className="py-3 px-4 font-extrabold">بررسی مدارک</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4f1]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#68837b] font-bold">
                    درخواست وامی در سامانه ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filtered.map((ln) => {
                  const st = persianLoanStatus(ln.status);
                  return (
                    <tr key={ln.id} className="hover:bg-[#f9fcfb]">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#0f2922]">{ln.customer_name}</div>
                        <div className="text-[11px] text-[#607b72] tabular-nums">
                          {toPersianDigits(ln.customer_phone)} · کد ملی: {toPersianDigits(ln.national_code || 'ثبت نشده')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-black text-[#0E4D3B] tabular-nums whitespace-nowrap">
                        {formatToman(ln.requested_amount_toman)}
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        {toPersianDigits(ln.installments_count)} ماهه
                        {ln.monthly_installment_toman > 0 && (
                          <div className="text-[11px] text-[#607b72]">
                            هر قسط: {formatToman(ln.monthly_installment_toman)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold tabular-nums">
                        {ln.tracking_code ? toPersianDigits(ln.tracking_code) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${st.tone}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(ln);
                              setRejectReason(ln.reject_reason || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>بررسی پرونده</span>
                          </button>
                          {confirmDeleteId === ln.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDeleteLoan(ln.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                              >
                                تایید حذف
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId('')}
                                className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                              >
                                انصراف
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(ln.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#dceae5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[#e5f0ec] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0f2922]">پرونده وام تندیس‌پی: {selected.customer_name}</h3>
                <div className="text-xs text-[#5d7970] mt-0.5 tabular-nums">
                  {formatToman(selected.requested_amount_toman)} · {toPersianDigits(selected.installments_count)} قسط
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-[#f2f7f5] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f7fbf9] p-4 rounded-2xl border border-[#e3efe9]">
                <div className="space-y-1">
                  <div>
                    شماره موبایل: <strong className="tabular-nums">{toPersianDigits(selected.customer_phone)}</strong>
                  </div>
                  <div>
                    کد ملی متقاضی: <strong className="tabular-nums">{toPersianDigits(selected.national_code || 'ثبت نشده')}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToast('سرویس استعلام اعتبارسنجی دولتی با کد ملی به‌زودی متصل می‌شود.')}
                  className="px-3.5 py-2 rounded-xl bg-[#fff8eb] border border-[#f5d59c] text-[#9a5404] font-extrabold inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>اعتبارسنجی دولتی با کد ملی</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#D97706] text-white text-[10px]">به‌زودی</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'تصویر کارت ملی', raw: selected.national_card_image_base64 },
                  { label: 'تصویر شناسنامه', raw: selected.shenasnameh_image_base64 },
                  { label: 'فیش حقوقی / جواز کسب', raw: selected.income_proof_image_base64 }
                ].map((doc) => {
                  const src = safeImageSrc(doc.raw);
                  return (
                    <div key={doc.label} className="rounded-2xl border border-[#e3efe9] overflow-hidden bg-[#f8fbfa]">
                      <div className="h-32 flex items-center justify-center bg-[#eef4f2]">
                        {src ? (
                          <img src={src} alt={doc.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-[#7c968e] font-bold">بارگذاری نشده</span>
                        )}
                      </div>
                      <div className="p-2 text-center font-bold text-[#2b4a41]">{doc.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2 border-t border-[#e5f0ec]">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="توضیح یا علت رد درخواست (در صورت رد)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] outline-none focus:border-[#0E4D3B]"
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={busy || selected.status === 'APPROVED'}
                    onClick={() => handleDecision('APPROVED')}
                    className="px-5 py-2.5 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] disabled:opacity-50 text-white font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تایید وام و شارژ خودکار کیف پول</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDecision('REJECTED')}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رد درخواست</span>
                  </button>
                  {confirmDeleteId === `modal_${selected.id}` ? (
                    <div className="inline-flex items-center gap-1.5 mr-auto">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteLoan(selected.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                      >
                        تایید و حذف پرونده وام
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId('')}
                        className="px-3 py-2.5 rounded-xl border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmDeleteId(`modal_${selected.id}`)}
                      className="px-3.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer mr-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف پرونده</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ماژول ۸: مدیریت تسویه‌حساب متخصصین ====================
export const AdminSettlementsView: React.FC<CatalogFinanceProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [selected, setSelected] = useState<AdminSettlement | null>(null);
  const [bankRef, setBankRef] = useState('');
  const [sourceAcc, setSourceAcc] = useState('');
  const [payMethod, setPayMethod] = useState('نقدی / حواله پایا');
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');

  const q = globalQuery.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      data.settlements.filter(
        (s) =>
          !q ||
          s.specialist_name.toLowerCase().includes(q) ||
          s.specialist_phone.includes(q) ||
          s.shaba_number.toLowerCase().includes(q) ||
          s.bank_tracking_code.includes(q)
      ),
    [data.settlements, q]
  );

  const handleAction = async (status: 'APPROVED_FOR_PAYMENT' | 'PAID_COMPLETED' | 'REJECTED') => {
    if (!selected) return;
    if (status === 'PAID_COMPLETED' && !bankRef.trim()) {
      onToast('برای ثبت واریز نهایی، وارد کردن کد رهگیری بانکی الزامی است.');
      return;
    }
    setBusy(true);
    try {
      await runSettlementActionAdmin(selected.id, {
        status,
        bankTrackingCode: bankRef.trim(),
        sourceAccount: sourceAcc.trim(),
        paymentMethod: payMethod,
        rejectReason: rejectReason.trim(),
        specialistPhone: selected.specialist_phone,
        amountToman: selected.amount_toman
      });
      onToast(
        status === 'PAID_COMPLETED'
          ? 'واریز نهایی ثبت و مبلغ از مانده قابل برداشت متخصص کسر شد.'
          : status === 'APPROVED_FOR_PAYMENT'
          ? 'درخواست تایید و به نوبت واریز پایا ارسال شد.'
          : 'درخواست تسویه رد شد.'
      );
      setSelected(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در عملیات تسویه‌حساب');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    setBusy(true);
    try {
      await deleteSettlementAdmin(settlementId);
      onToast('درخواست تسویه‌حساب با موفقیت حذف شد.');
      setConfirmDeleteId('');
      if (selected?.id === settlementId) setSelected(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف درخواست تسویه');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
              <tr>
                <th className="py-3 px-4 font-extrabold">متخصص</th>
                <th className="py-3 px-4 font-extrabold">بانک و شماره شبا</th>
                <th className="py-3 px-4 font-extrabold">مبلغ تسویه</th>
                <th className="py-3 px-4 font-extrabold">وضعیت</th>
                <th className="py-3 px-4 font-extrabold">صورت‌حساب و واریز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4f1]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#68837b] font-bold">
                    درخواست تسویه‌حسابی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const st = persianSettlementStatus(s.status);
                  return (
                    <tr key={s.id} className="hover:bg-[#f9fcfb]">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#0f2922]">{s.specialist_name}</div>
                        <div className="text-[11px] text-[#607b72] tabular-nums" dir="ltr">
                          {toPersianDigits(s.specialist_phone)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0E4D3B] flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 shrink-0" />
                          <span>{s.bank_name}</span>
                          <span className={s.shaba_valid ? 'text-emerald-700' : 'text-rose-700'}>
                            ({s.shaba_valid ? 'شبا معتبر' : 'نیاز به بررسی'})
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5e7a71] tabular-nums mt-0.5" dir="ltr">
                          {s.shaba_number || 'ثبت نشده'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-black text-[#0f2922] tabular-nums whitespace-nowrap">
                        {formatToman(s.amount_toman)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${st.tone}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(s);
                              setBankRef(s.bank_tracking_code || '');
                              setSourceAcc(s.source_account || '');
                              setPayMethod(s.payment_method || 'نقدی / حواله پایا');
                              setRejectReason(s.reject_reason || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>بررسی و تسویه</span>
                          </button>
                          {confirmDeleteId === s.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDeleteSettlement(s.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                              >
                                تایید حذف
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId('')}
                                className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                              >
                                انصراف
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(s.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#dceae5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[#e5f0ec] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0f2922]">گزارش مالی صورت‌حساب تسویه: {selected.specialist_name}</h3>
                <div className="text-xs text-[#5d7970] mt-0.5 tabular-nums">
                  {selected.bank_name} · {selected.shaba_number || 'شبا ثبت نشده'}
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-[#f2f7f5] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div>
                <h4 className="font-black text-[#0E4D3B] mb-2">جدول ریز فاکتورهای انجام‌شده</h4>
                <div className="border border-[#e3efe9] rounded-2xl overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#e3efe9]">
                      <tr>
                        <th className="py-2.5 px-3">ردیف</th>
                        <th className="py-2.5 px-3">عنوان خدمت و شرح کار</th>
                        <th className="py-2.5 px-3">تاریخ</th>
                        <th className="py-2.5 px-3">مبلغ کل</th>
                        <th className="py-2.5 px-3">کمیسیون تندیس</th>
                        <th className="py-2.5 px-3">سهم خالص متخصص</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf4f1]">
                      {selected.invoice_breakdowns.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-3 text-center text-[#68837b]">
                            ریز فاکتور جداگانه‌ای پیوست نشده است — مبلغ کل درخواستی: {formatToman(selected.amount_toman)}
                          </td>
                        </tr>
                      ) : (
                        selected.invoice_breakdowns.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 tabular-nums">{toPersianDigits(idx + 1)}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold">{row.service_title || 'خدمت تخصصی'}</div>
                              {row.description && <div className="text-[11px] text-[#607b72]">{row.description}</div>}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums">{row.date_jalali || '—'}</td>
                            <td className="py-2.5 px-3 tabular-nums">{formatToman(Number(row.total_toman || 0))}</td>
                            <td className="py-2.5 px-3 tabular-nums text-amber-800">
                              {formatToman(Number(row.commission_toman || 0))}
                              {row.commission_percent != null ? ` (${toPersianDigits(row.commission_percent)}٪)` : ''}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-extrabold text-[#0E4D3B]">
                              {formatToman(Number(row.net_toman || 0))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f7fbf9] p-4 rounded-2xl border border-[#e3efe9]">
                <div className="space-y-1">
                  <label className="font-bold text-[#35534a]">کد رهگیری بانکی</label>
                  <input
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="شماره پیگیری پایا"
                    className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#35534a]">شماره حساب مبدا</label>
                  <input
                    value={sourceAcc}
                    onChange={(e) => setSourceAcc(e.target.value)}
                    placeholder="شماره حساب تندیس"
                    className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#35534a]">روش پرداخت</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white"
                  >
                    <option value="نقدی / حواله پایا">نقدی / حواله پایا</option>
                    <option value="قسطی">قسطی</option>
                    <option value="کیف پول">کیف پول</option>
                  </select>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold text-[#35534a]">علت رد (در صورت رد درخواست)</label>
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="علت عدم تایید..."
                    className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction('APPROVED_FOR_PAYMENT')}
                  className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-extrabold whitespace-nowrap cursor-pointer"
                >
                  ارسال به نوبت پایا
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction('PAID_COMPLETED')}
                  className="px-5 py-2 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white font-extrabold whitespace-nowrap cursor-pointer"
                >
                  ثبت واریز نهایی و کسر از مانده
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction('REJECTED')}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold whitespace-nowrap cursor-pointer"
                >
                  رد درخواست
                </button>
                {confirmDeleteId === `modal_${selected.id}` ? (
                  <div className="inline-flex items-center gap-1.5 mr-auto">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDeleteSettlement(selected.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      تایید و حذف درخواست
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId('')}
                      className="px-3 py-2 rounded-xl border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDeleteId(`modal_${selected.id}`)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف این درخواست</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ماژول ۹: گزارش جامع مالی، پرونده فاکتورها و تنظیمات کمیسیون ====================
export const AdminFinanceView: React.FC<CatalogFinanceProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const cfg = data.commissionConfig;
  const [defaultRate, setDefaultRate] = useState(String(cfg?.default_rate_percent ?? 15));
  const [note, setNote] = useState(cfg?.note || '');
  const [catRates, setCatRates] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (cfg?.category_rates) {
      for (const [k, v] of Object.entries(cfg.category_rates)) out[k] = String(v);
    }
    return out;
  });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const q = globalQuery.trim().toLowerCase();
  const filteredDossiers = useMemo(
    () =>
      data.dossiers.filter(
        (d) =>
          !q ||
          d.specialist_name.toLowerCase().includes(q) ||
          d.customer_name.toLowerCase().includes(q) ||
          d.service_title.toLowerCase().includes(q) ||
          d.specialist_phone.includes(q)
      ),
    [data.dossiers, q]
  );

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(defaultRate);
    if (!Number.isFinite(rateNum) || rateNum < 0 || rateNum > 50) {
      onToast('درصد کمیسیون باید عددی بین ۰ تا ۵۰ باشد.');
      return;
    }
    const cleanRates: Record<string, number> = {};
    for (const [k, v] of Object.entries(catRates)) {
      const n = Number(v);
      if (v.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 50) {
        cleanRates[k] = n;
      }
    }
    setSaving(true);
    try {
      await saveCommissionAdmin({
        default_rate_percent: rateNum,
        category_rates: cleanRates,
        note: note.trim()
      });
      onToast('تنظیمات حق کمیسیون با موفقیت روی سرور مرکزی ذخیره شد.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ذخیره تنظیمات کمیسیون');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDossier = async (dossierId: string) => {
    setDeletingId(dossierId);
    try {
      await deleteDossierAdmin(dossierId);
      onToast('پرونده فاکتور با موفقیت حذف شد.');
      setConfirmDeleteId('');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در حذف پرونده فاکتور');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSaveCommission} className="bg-white rounded-2xl border border-[#dfece8] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#0E4D3B]" />
            <h2 className="text-sm font-black text-[#0f2922]">تنظیمات نرخ حق کمیسیون سامانه تندیس</h2>
          </div>
          {cfg?.updated_by && (
            <span className="text-xs text-[#5d7970]">
              آخرین بروزرسانی توسط {cfg.updated_by} ({formatPersianDateTime(cfg.updated_at_epoch)})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1.5">
            <label className="font-extrabold text-[#2a4940]">نرخ کمیسیون پیش‌فرض (٪)</label>
            <input
              type="number"
              min={0}
              max={50}
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] font-black text-sm tabular-nums outline-none focus:border-[#0E4D3B]"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-extrabold text-[#2a4940]">توضیح مصوبه کمیسیون</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً نرخ مصوب فصلی کمیسیون خدمات"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm outline-none focus:border-[#0E4D3B]"
            />
          </div>
        </div>

        {data.categories.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-[#2a4940]">نرخ اختصاصی هر دسته‌بندی (اختیاری)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {data.categories.map((cat) => {
                const key = cat.slug || cat.id;
                return (
                  <div key={key} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f7fbf9] border border-[#e3efe9] text-xs">
                    <span className="font-bold text-[#1d3931] truncate">{cat.title}</span>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={catRates[key] ?? ''}
                      onChange={(e) => setCatRates((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={defaultRate}
                      className="w-16 px-2 py-1 rounded-lg border border-[#cfe0da] bg-white text-center font-bold tabular-nums"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره نرخ‌های کمیسیون'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e5f0ec] flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0f2922]">پرونده فاکتورهای صادرشده توسط متخصصین</h3>
          <span className="text-xs text-[#5d7970]">{toPersianDigits(filteredDossiers.length)} فاکتور</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
              <tr>
                <th className="py-3 px-4 font-extrabold">خدمت و متخصص</th>
                <th className="py-3 px-4 font-extrabold">مشتری</th>
                <th className="py-3 px-4 font-extrabold">اجرت / قطعات</th>
                <th className="py-3 px-4 font-extrabold">جمع کل</th>
                <th className="py-3 px-4 font-extrabold">سهم کمیسیون</th>
                <th className="py-3 px-4 font-extrabold">سهم خالص متخصص</th>
                <th className="py-3 px-4 font-extrabold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4f1]">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#68837b] font-bold">
                    پرونده فاکتوری ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr key={d.id} className="hover:bg-[#f9fcfb]">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#0f2922]">{d.service_title}</div>
                      <div className="text-[11px] text-[#607b72]">{d.specialist_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold">{d.customer_name}</div>
                      <div className="text-[11px] text-[#607b72] tabular-nums" dir="ltr">
                        {toPersianDigits(d.customer_phone)}
                      </div>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#47665d]">
                      اجرت: {formatToman(d.labor_toman)} · قطعات: {formatToman(d.parts_toman)}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#0f2922] tabular-nums whitespace-nowrap">
                      {formatToman(d.total_toman)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#D97706] tabular-nums whitespace-nowrap">
                      {formatToman(d.commission_toman || Math.round((d.total_toman * d.commission_rate) / 100))}
                    </td>
                    <td className="py-3 px-4 font-black text-[#0E4D3B] tabular-nums whitespace-nowrap">
                      {formatToman(
                        d.net_specialist_toman ||
                          Math.max(0, d.total_toman - Math.round((d.total_toman * d.commission_rate) / 100))
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {confirmDeleteId === d.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={deletingId === d.id}
                            onClick={() => handleDeleteDossier(d.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                          >
                            {deletingId === d.id ? 'حذف...' : 'تایید حذف'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId('')}
                            className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(d.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف فاکتور</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
