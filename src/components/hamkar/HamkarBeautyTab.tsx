import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Scissors,
  Sparkles,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';
import {
  BEAUTY_ALL_SKILLS,
  buildDefault30DayBeautySchedule,
  cancelHamkarBeautyAppointment,
  compressHamkarImageStrict,
  saveBeauty30DaySchedule,
  saveBeautySpecialistProfile,
  toEnglishDigits,
} from '../../services/hamkarApi';
import type {
  BeautySchedulePayload,
  BeautySpecialistProfileJson,
  HamkarBeautyAppointment,
  HamkarSpecialistProfile,
} from '../../types/hamkar';

interface HamkarBeautyTabProps {
  specialist: HamkarSpecialistProfile;
  beautyProfile: BeautySpecialistProfileJson | null;
  beautySchedule: BeautySchedulePayload | null;
  beautyAppointments: HamkarBeautyAppointment[];
  avgRating: number;
  completedJobs: number;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}

type BeautySubTab = 'SKILLS' | 'PORTFOLIO' | 'PRICES' | 'WEEKLY' | 'CALENDAR_30D' | 'APPOINTMENTS';

const WEEKDAYS = [
  { key: 'day_0', label: 'شنبه' },
  { key: 'day_1', label: 'یکشنبه' },
  { key: 'day_2', label: 'دوشنبه' },
  { key: 'day_3', label: 'سه‌شنبه' },
  { key: 'day_4', label: 'چهارشنبه' },
  { key: 'day_5', label: 'پنج‌شنبه' },
  { key: 'day_6', label: 'جمعه' },
];

export const HamkarBeautyTab: React.FC<HamkarBeautyTabProps> = ({
  specialist,
  beautyProfile,
  beautySchedule,
  beautyAppointments,
  avgRating,
  completedJobs,
  onRefresh,
  onToast,
}) => {
  const [subTab, setSubTab] = useState<BeautySubTab>('SKILLS');
  const [saving, setSaving] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    beautyProfile?.selected_skills?.length ? beautyProfile.selected_skills : [BEAUTY_ALL_SKILLS[0]]
  );
  const [portfolioItems, setPortfolioItems] = useState(beautyProfile?.portfolio_items || []);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioSkill, setPortfolioSkill] = useState(BEAUTY_ALL_SKILLS[0]);

  const [servicePrices, setServicePrices] = useState(beautyProfile?.service_prices || []);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const [weeklySlots, setWeeklySlots] = useState<Record<string, string[]>>(
    beautyProfile?.open_slots_by_date || {
      day_0: ['۱۰:۰۰', '۱۴:۰۰', '۱۷:۰۰'],
      day_1: ['۱۰:۰۰', '۱۴:۰۰', '۱۷:۰۰'],
      day_2: ['۱۰:۰۰', '۱۴:۰۰', '۱۷:۰۰'],
      day_3: ['۱۰:۰۰', '۱۴:۰۰', '۱۷:۰۰'],
      day_4: ['۱۰:۰۰', '۱۴:۰۰', '۱۷:۰۰'],
      day_5: ['۱۰:۰۰', '۱۴:۰۰'],
      day_6: [],
    }
  );
  const [newWeeklyTime, setNewWeeklyTime] = useState('۱۶:۳۰');

  const [schedule30, setSchedule30] = useState<BeautySchedulePayload>(
    () => beautySchedule || buildDefault30DayBeautySchedule(specialist.phone)
  );
  const [customSlotByDay, setCustomSlotByDay] = useState<Record<string, string>>({});
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);

  useEffect(() => {
    if (beautyProfile) {
      if (beautyProfile.selected_skills?.length) setSelectedSkills(beautyProfile.selected_skills);
      if (Array.isArray(beautyProfile.portfolio_items)) setPortfolioItems(beautyProfile.portfolio_items);
      if (Array.isArray(beautyProfile.service_prices)) setServicePrices(beautyProfile.service_prices);
      if (beautyProfile.open_slots_by_date && Object.keys(beautyProfile.open_slots_by_date).length > 0) {
        setWeeklySlots(beautyProfile.open_slots_by_date);
      }
    }
  }, [beautyProfile]);

  useEffect(() => {
    if (beautySchedule?.days?.length) {
      setSchedule30(beautySchedule);
    }
  }, [beautySchedule]);

  const persistProfile = async (overrides?: Partial<BeautySpecialistProfileJson>) => {
    setSaving(true);
    try {
      const payload: BeautySpecialistProfileJson = {
        specialist_id: specialist.phone,
        phone: specialist.phone,
        full_name: specialist.fullName,
        category_slug: 'cat-beauty-personal',
        avatar_url: specialist.profilePhoto || null,
        rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : 5.0,
        completed_jobs: completedJobs,
        selected_skills: overrides?.selected_skills ?? selectedSkills,
        portfolio_items: overrides?.portfolio_items ?? portfolioItems,
        service_prices: overrides?.service_prices ?? servicePrices,
        open_slots_by_date: overrides?.open_slots_by_date ?? weeklySlots,
      };
      await saveBeautySpecialistProfile(payload);
      onToast('تنظیمات پنل زیبایی در سرور مرکزی ذخیره شد.');
      onRefresh();
    } catch {
      onToast('خطا در ذخیره اطلاعات پنل زیبایی.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? (prev.length > 1 ? prev.filter((s) => s !== skill) : prev) : [...prev, skill]
    );
  };

  const handleUploadPortfolio = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await compressHamkarImageStrict(file);
      const next = [
        {
          id: `pf_${Date.now()}`,
          title: portfolioTitle.trim() || portfolioSkill,
          skill_title: portfolioSkill,
          image_url: dataUrl,
          created_at_epoch: Date.now(),
        },
        ...portfolioItems,
      ];
      setPortfolioItems(next);
      setPortfolioTitle('');
      await persistProfile({ portfolio_items: next });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'حجم تصویر نباید بیشتر از ۱ مگابایت باشد');
    }
  };

  const handleSavePriceProposals = async () => {
    const nextPrices = selectedSkills.map((skill, idx) => {
      const existing = servicePrices.find((p) => p.skill_title === skill);
      const draftVal = priceDrafts[skill];
      const proposed =
        draftVal !== undefined
          ? Number(toEnglishDigits(draftVal).replace(/\D/g, '') || '0')
          : existing?.proposed_price_toman || 0;
      const changed = existing ? proposed !== existing.proposed_price_toman : proposed > 0;
      return {
        skill_id: existing?.skill_id || `beauty_skill_${idx + 1}`,
        skill_title: skill,
        proposed_price_toman: proposed,
        approved_price_toman: changed ? existing?.approved_price_toman || 0 : existing?.approved_price_toman || 0,
        admin_approved: changed ? false : Boolean(existing?.admin_approved),
        status: changed ? 'PENDING_ADMIN_APPROVAL' : existing?.status || 'PENDING_ADMIN_APPROVAL',
      };
    });
    setServicePrices(nextPrices);
    await persistProfile({ service_prices: nextPrices });
  };

  const handleSave30DaySchedule = async () => {
    setSaving(true);
    try {
      await saveBeauty30DaySchedule(specialist, { ...schedule30, updated_at_epoch: Date.now() });
      onToast('برنامه ۳۰ روزه نوبت‌دهی زیبایی با موفقیت در سرور ذخیره شد.');
      onRefresh();
    } catch {
      onToast('خطا در ذخیره تقویم ۳۰ روزه.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAppointment = async (apt: HamkarBeautyAppointment) => {
    setCancellingAptId(apt.id);
    try {
      await cancelHamkarBeautyAppointment(apt);
      onToast('نوبت لغو شد و ساعت آن دوباره برای رزرو مشتریان آزاد گردید.');
      onRefresh();
    } catch {
      onToast('خطا در لغو نوبت.');
    } finally {
      setCancellingAptId(null);
    }
  };

  const tabs: Array<{ id: BeautySubTab; label: string }> = [
    { id: 'SKILLS', label: 'مهارت‌ها' },
    { id: 'PORTFOLIO', label: 'نمونه‌کارها' },
    { id: 'PRICES', label: 'قیمت‌ها' },
    { id: 'WEEKLY', label: 'ساعت‌های هفته' },
    { id: 'CALENDAR_30D', label: 'تقویم ۳۰ روزه' },
    { id: 'APPOINTMENTS', label: `نوبت‌ها (${toPersianDigits(beautyAppointments.length)})` },
  ];

  return (
    <div className="space-y-5">
      {/* هدر پنل زیبایی */}
      <div className="rounded-3xl bg-gradient-to-l from-[#0b5c60] to-[#0a8387] text-white p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#f2a900]" />
          </div>
          <div>
            <h2 className="text-base font-black">داشبورد تخصصی زیبایی بانوان تندیس</h2>
            <p className="text-xs text-white/80">
              مدیریت مهارت‌ها، نمونه‌کارها، تعرفه پیشنهادی، تقویم ۳۰ روزه و نوبت‌های رزروشده
            </p>
          </div>
        </div>
        <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-black">
          {toPersianDigits(selectedSkills.length)} مهارت فعال
        </span>
      </div>

      {/* زیرتب‌ها */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-colors cursor-pointer ${
              subTab === t.id
                ? 'bg-[#0b5c60] text-white border-[#0b5c60]'
                : 'bg-white text-[#4a666a] border-[#dcecec] hover:border-[#0a8387]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ۱. مهارت‌های زیبایی */}
      {subTab === 'SKILLS' && (
        <div className="rounded-3xl bg-white border border-[#e2efef] p-5 space-y-4">
          <div className="flex items-center gap-2 font-black text-sm text-[#12292c]">
            <Scissors className="w-4 h-4 text-[#0b5c60]" />
            <span>انتخاب مهارت‌های زیبایی قابل ارائه (۸ شاخه تخصصی)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BEAUTY_ALL_SKILLS.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className={`rounded-2xl border p-3.5 text-right flex items-center justify-between transition-colors cursor-pointer ${
                    active ? 'bg-[#eff8f8] border-[#0b5c60] text-[#0b5c60]' : 'bg-white border-[#e2efef] text-[#12292c]'
                  }`}
                >
                  <span className="text-xs font-black">{skill}</span>
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      active ? 'bg-[#0b5c60] text-white' : 'border border-[#cbd5e1]'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => persistProfile()}
            className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-5 py-3 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ذخیره مهارت‌ها در سرور</span>
          </button>
        </div>
      )}

      {/* ۲. نمونه‌کارها (<1MB) */}
      {subTab === 'PORTFOLIO' && (
        <div className="rounded-3xl bg-white border border-[#e2efef] p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              placeholder="عنوان نمونه‌کار (مثلاً: کراتین احیا موی بلند)"
              className="rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3 py-2.5 text-xs font-bold outline-none"
            />
            <select
              value={portfolioSkill}
              onChange={(e) => setPortfolioSkill(e.target.value)}
              className="rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3 py-2.5 text-xs font-bold outline-none"
            >
              {BEAUTY_ALL_SKILLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <label className="rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-4 py-2.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              <span>افزودن عکس (زیر ۱ مگابایت)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadPortfolio(e.target.files?.[0])}
              />
            </label>
          </div>

          {portfolioItems.length === 0 ? (
            <div className="rounded-2xl bg-[#f8fbfb] border border-dashed border-[#cbd5e1] p-8 text-center text-xs text-[#5f777b] font-bold">
              هنوز نمونه‌کاری بارگذاری نکرده‌اید.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {portfolioItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#e2efef] overflow-hidden bg-[#f9fcfc]">
                  <img src={item.image_url} alt={item.title} className="w-full h-36 object-cover" />
                  <div className="p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#12292c] truncate">{item.title}</div>
                      <div className="text-[10px] text-[#5f777b] truncate">{item.skill_title}</div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const next = portfolioItems.filter((p) => p.id !== item.id);
                        setPortfolioItems(next);
                        await persistProfile({ portfolio_items: next });
                      }}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ۳. قیمت پیشنهادی و وضعیت تایید مدیر */}
      {subTab === 'PRICES' && (
        <div className="rounded-3xl bg-white border border-[#e2efef] p-5 space-y-4">
          <div className="flex items-center gap-2 font-black text-sm text-[#12292c]">
            <Tag className="w-4 h-4 text-[#0b5c60]" />
            <span>تعرفه پیشنهادی خدمات (ارسال جهت تایید مدیریت)</span>
          </div>
          <div className="space-y-3">
            {selectedSkills.map((skill) => {
              const existing = servicePrices.find((p) => p.skill_title === skill);
              const val = priceDrafts[skill] ?? (existing?.proposed_price_toman ? String(existing.proposed_price_toman) : '');
              return (
                <div
                  key={skill}
                  className="rounded-2xl border border-[#e2efef] bg-[#f9fcfc] p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-black text-[#12292c]">{skill}</div>
                    <div className="text-[11px] mt-0.5">
                      {existing?.admin_approved ? (
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" /> تایید مدیر: {formatToman(existing.approved_price_toman)}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold">در انتظار تایید مدیریت</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      dir="ltr"
                      inputMode="numeric"
                      value={val}
                      onChange={(e) => setPriceDrafts((p) => ({ ...p, [skill]: e.target.value }))}
                      placeholder="قیمت پیشنهادی (تومان)"
                      className="w-40 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold text-left outline-none tabular-nums"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSavePriceProposals}
            className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-5 py-3 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ثبت و ارسال تعرفه‌ها برای تایید مدیریت</span>
          </button>
        </div>
      )}

      {/* ۴. ساعت‌های استاندارد هفته (day_0 تا day_6) */}
      {subTab === 'WEEKLY' && (
        <div className="rounded-3xl bg-white border border-[#e2efef] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-[#12292c]">
              <Clock className="w-4 h-4 text-[#0b5c60]" />
              <span>ساعت‌های کاری ثابت ایام هفته</span>
            </div>
            <input
              value={newWeeklyTime}
              onChange={(e) => setNewWeeklyTime(e.target.value)}
              placeholder="مثلاً ۱۶:۳۰"
              className="w-28 rounded-xl border border-[#cbd5e1] bg-[#f8fbfb] px-3 py-1.5 text-xs font-bold text-center outline-none"
            />
          </div>

          <div className="space-y-2.5">
            {WEEKDAYS.map((day) => {
              const slots = weeklySlots[day.key] || [];
              return (
                <div key={day.key} className="rounded-2xl border border-[#e2efef] p-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#12292c] w-20">{day.label}</span>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          setWeeklySlots((prev) => ({
                            ...prev,
                            [day.key]: (prev[day.key] || []).filter((s) => s !== slot),
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#eff8f8] text-[#0b5c60] text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{slot}</span>
                        <span className="text-rose-500">×</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const t = newWeeklyTime.trim();
                        if (!t) return;
                        setWeeklySlots((prev) => ({
                          ...prev,
                          [day.key]: Array.from(new Set([...(prev[day.key] || []), t])),
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg border border-dashed border-[#0b5c60]/50 text-[#0b5c60] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> افزودن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => persistProfile()}
            className="rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white px-5 py-3 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ذخیره ساعت‌های هفته</span>
          </button>
        </div>
      )}

      {/* ۵. تقویم ۳۰ روزه نوبت‌دهی */}
      {subTab === 'CALENDAR_30D' && (
        <div className="rounded-3xl bg-white border border-[#e2efef] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-[#12292c]">
              <CalendarDays className="w-4 h-4 text-[#0b5c60]" />
              <span>تقویم ۳۰ روزه نوبت‌دهی آنلاین</span>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave30DaySchedule}
              className="rounded-xl bg-[#f2a900] hover:bg-[#dfa000] text-[#12292c] px-4 py-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>ذخیره برنامه ۳۰ روزه در سرور</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-0.5">
            {schedule30.days.map((day, idx) => (
              <div
                key={day.date_key}
                className={`rounded-2xl border p-3.5 space-y-2.5 ${
                  day.is_open ? 'bg-white border-[#dcecec]' : 'bg-[#f8fafa] border-[#e6efef] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#12292c]">{day.weekday_fa}</span>
                    <span className="text-[11px] text-[#5f777b] mr-2 tabular-nums">{day.jalali_label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSchedule30((prev) => ({
                        ...prev,
                        days: prev.days.map((d, i) => (i === idx ? { ...d, is_open: !d.is_open } : d)),
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                      day.is_open ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {day.is_open ? 'فعال' : 'تعطیل'}
                  </button>
                </div>

                {day.is_open && (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {day.time_slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() =>
                            setSchedule30((prev) => ({
                              ...prev,
                              days: prev.days.map((d, i) =>
                                i === idx ? { ...d, time_slots: d.time_slots.filter((s) => s !== slot) } : d
                              ),
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg bg-[#eff8f8] text-[#0b5c60] text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{slot}</span>
                          <span className="text-rose-500">×</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        value={customSlotByDay[day.date_key] || ''}
                        onChange={(e) =>
                          setCustomSlotByDay((prev) => ({ ...prev, [day.date_key]: e.target.value }))
                        }
                        placeholder="مثلاً ۱۹:۳۰"
                        className="flex-1 rounded-lg border border-[#cbd5e1] bg-[#f8fbfb] px-2.5 py-1.5 text-[11px] font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (customSlotByDay[day.date_key] || '').trim();
                          if (!val) return;
                          setSchedule30((prev) => ({
                            ...prev,
                            days: prev.days.map((d, i) =>
                              i === idx ? { ...d, time_slots: Array.from(new Set([...d.time_slots, val])) } : d
                            ),
                          }));
                          setCustomSlotByDay((prev) => ({ ...prev, [day.date_key]: '' }));
                        }}
                        className="rounded-lg bg-[#0b5c60] text-white px-2.5 py-1.5 text-[11px] font-black cursor-pointer"
                      >
                        افزودن ساعت
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ۶. نوبت‌های رزروشده مشتریان */}
      {subTab === 'APPOINTMENTS' && (
        <div className="rounded-3xl bg-white border border-[#e2efef] p-5 space-y-3">
          <div className="font-black text-sm text-[#12292c]">نوبت‌های رزروشده زیبایی</div>
          {beautyAppointments.length === 0 ? (
            <div className="rounded-2xl bg-[#f8fbfb] p-8 text-center text-xs font-bold text-[#5f777b]">
              هنوز نوبت زیبایی فعالی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {beautyAppointments.map((apt) => {
                const cancelled = String(apt.status || '').toUpperCase().includes('CANCEL');
                return (
                  <div
                    key={apt.id}
                    className="rounded-2xl border border-[#dcecec] bg-[#f9fcfc] p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-black text-[#12292c]">
                        {apt.skill_title || apt.service_title || 'نوبت زیبایی'}
                      </div>
                      <div className="text-xs text-[#5f777b]">
                        مشتری: <strong>{apt.customer_name}</strong> ·{' '}
                        <span dir="ltr">{toPersianDigits(apt.customer_phone)}</span>
                      </div>
                      <div className="text-xs font-bold text-[#0b5c60]">
                        تاریخ: {apt.jalali_date || apt.date_label || 'ثبت‌شده'} · ساعت: {apt.time_slot}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cancelled ? (
                        <span className="rounded-xl bg-rose-50 text-rose-700 px-3 py-1.5 text-xs font-black">
                          لغو شده و ساعت آزاد شد
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={cancellingAptId === apt.id}
                          onClick={() => handleCancelAppointment(apt)}
                          className="rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3.5 py-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {cancellingAptId === apt.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>لغو و آزادی ساعت نوبت</span>
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
    </div>
  );
};
