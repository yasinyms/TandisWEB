import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Sparkles,
  Star,
  UserCheck,
  Wallet,
  X
} from 'lucide-react';
import { bookBeautyAppointment, cancelBeautyAppointment } from '../services/tandisApi';
import {
  DEFAULT_BEAUTY_SPECIALISTS,
  formatToman,
  getRollingSevenJalaliDays,
  toPersianDigits,
  toPurePersianText
} from '../services/tandisDefaults';
import type { BeautyBooking, BeautySpecialist } from '../types/tandis';

const DEFAULT_SKILL_FILTERS = ['همه مهارت‌ها', 'کراتین و احیا', 'آرایش و رنگ مو', 'کاشت ناخن', 'پاکسازی پوست'];

export const BeautySalonView: React.FC<{
  dark: boolean;
  phone: string;
  customerName: string;
  walletBalance: number;
  mandatoryDepositToman: number;
  liveSpecialists: BeautySpecialist[];
  bookings: BeautyBooking[];
  onRequireLogin: () => void;
  onRequestShaparak: (
    amountToman: number,
    title: string,
    onSuccess: () => Promise<void>,
    paymentMeta?: Record<string, unknown>
  ) => void;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}> = ({
  dark,
  phone,
  customerName,
  walletBalance,
  mandatoryDepositToman,
  liveSpecialists,
  bookings,
  onRequireLogin,
  onRequestShaparak,
  onRefresh,
  onToast
}) => {
  const [subTab, setSubTab] = useState<'explore' | 'appointments'>('explore');
  const calendarDays = useMemo(() => getRollingSevenJalaliDays(), []);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState('همه مهارت‌ها');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [activeProfile, setActiveProfile] = useState<BeautySpecialist | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedTariffTitle, setSelectedTariffTitle] = useState<string>('');
  const [bookingBusy, setBookingBusy] = useState(false);

  const cardCls = dark ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]' : 'bg-white border-[#E2EFEF] text-[#0F2926]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  const mergedSpecialists: BeautySpecialist[] = useMemo(() => {
    const sourceList =
      Array.isArray(liveSpecialists) && liveSpecialists.length > 0
        ? liveSpecialists
        : DEFAULT_BEAUTY_SPECIALISTS;

    return sourceList.map((s) => {
      const tariffSkills = Array.isArray(s.tariffs)
        ? s.tariffs.map((t) => toPurePersianText(t.title)).filter(Boolean)
        : [];
      const explicitSkills = Array.isArray(s.skills)
        ? s.skills.map((sk) => toPurePersianText(sk)).filter(Boolean)
        : [];
      const combinedSkills = Array.from(new Set([...explicitSkills, ...tariffSkills]));
      const finalSkills =
        combinedSkills.length > 0
          ? combinedSkills
          : ['کراتین و احیای مو', 'آرایش و رنگ مو'];

      const finalTariffs =
        s.tariffs && s.tariffs.length > 0
          ? s.tariffs.map((t) => ({
              ...t,
              title: toPurePersianText(t.title) || 'خدمت تخصصی زیبایی',
              price_toman: Number(t.price_toman || 0) > 0 ? Number(t.price_toman) : 650000,
              duration_min: Number(t.duration_min || 60)
            }))
          : finalSkills.map((sk) => ({
              title: sk,
              price_toman: 750000,
              duration_min: 60
            }));

      return {
        ...s,
        specialist_name: toPurePersianText(s.specialist_name) || 'متخصص زیبایی تندیس',
        business_name: toPurePersianText(s.business_name) || 'سالن زیبایی تاییدشده تندیس',
        role_title:
          toPurePersianText(s.role_title) ||
          finalSkills.slice(0, 2).join(' و ') ||
          'متخصص زیبایی و سلامت',
        bio:
          s.bio ||
          'ارائه‌دهنده خدمات تخصصی زیبایی و سلامت با مهارت‌های تاییدشده و نوبت‌دهی آنلاین در سامانه تندیس.',
        salon_map_status: s.salon_map_status || 'موقعیت سالن روی نقشه تایید و ثبت شده است',
        rating: s.rating || 4.8,
        review_count: s.review_count || 32,
        skills: finalSkills,
        tariffs: finalTariffs,
        portfolio_notes: s.portfolio_notes || ['استفاده از مواد استاندارد و ابزار استریل'],
        reviews:
          s.reviews || [
            {
              customer_name: 'مشتری تندیس',
              stars: 5,
              comment: 'برخورد عالی و انجام کار دقیق سر ساعت نوبت.',
              date_label: 'اخیراً'
            }
          ],
        days: s.days && s.days.length > 0 ? s.days : calendarDays
      };
    });
  }, [liveSpecialists, calendarDays]);

  const dynamicSkillFilters = useMemo(() => {
    const set = new Set<string>(DEFAULT_SKILL_FILTERS);
    for (const spec of mergedSpecialists) {
      for (const sk of spec.skills || []) {
        if (sk && sk.length <= 32) set.add(sk);
      }
    }
    return Array.from(set);
  }, [mergedSpecialists]);

  const activeDay = calendarDays[selectedDayIdx] || calendarDays[0];

  const filteredSpecialists = useMemo(() => {
    return mergedSpecialists.filter((spec) => {
      const keyword = selectedSkill.replace('و ', '').split(' ')[0];
      const skillMatch =
        selectedSkill === 'همه مهارت‌ها' ||
        (spec.skills || []).some((sk) => sk === selectedSkill || sk.includes(keyword)) ||
        (spec.tariffs || []).some((t) => t.title === selectedSkill || t.title.includes(keyword)) ||
        (spec.role_title || '').includes(keyword);
      if (!skillMatch) return false;
      if (!onlyAvailable) return true;
      const dayEntry = (spec.days || [])[selectedDayIdx] || (spec.days || [])[0];
      const slots = dayEntry?.slots || dayEntry?.time_slots || [];
      return Boolean(dayEntry?.is_open && slots.length > 0);
    });
  }, [mergedSpecialists, selectedSkill, onlyAvailable, selectedDayIdx]);

  const selectedTariff = useMemo(() => {
    const list = activeProfile?.tariffs || [];
    return (
      list.find((t) => t.title === selectedTariffTitle) ||
      list[0] || { title: 'نوبت زیبایی تندیس', price_toman: 650000, duration_min: 60 }
    );
  }, [activeProfile, selectedTariffTitle]);

  const effectiveDepositToman = useMemo(() => {
    const baseDeposit = mandatoryDepositToman > 0 ? mandatoryDepositToman : 300000;
    const servicePrice = Number(selectedTariff?.price_toman || 0);
    return servicePrice > 0 ? Math.min(baseDeposit, servicePrice) : baseDeposit;
  }, [mandatoryDepositToman, selectedTariff]);

  const completeBeautyBooking = async (methodLabel: string, newWalletBalance?: number) => {
    if (!activeProfile || !selectedSlot) return;
    await bookBeautyAppointment({
      specialist_phone: activeProfile.specialist_phone,
      specialist_name: activeProfile.specialist_name,
      business_name: activeProfile.business_name,
      service_title: selectedTariff.title,
      date_key: activeDay.date_key,
      jalali_date: activeDay.jalali_date,
      time_slot: selectedSlot,
      deposit_toman: effectiveDepositToman,
      payment_method: methodLabel,
      customer_phone: phone,
      customer_name: customerName || 'مشتری تندیس',
      newWalletBalance
    });
    onToast('نوبت زیبایی با پرداخت بیعانه با موفقیت ثبت و تایید شد.');
    setActiveProfile(null);
    setSelectedSlot('');
    setSubTab('appointments');
    onRefresh();
  };

  const handleBookWithGateway = () => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (!activeProfile || !selectedSlot) return;

    onRequestShaparak(
      effectiveDepositToman,
      `بیعانه نوبت زیبایی: ${selectedTariff.title}`,
      async () => {
        await completeBeautyBooking('درگاه آنلاین شاپرک');
      },
      {
        kind: 'beauty',
        phone,
        customerName: customerName || 'مشتری تندیس',
        specialistPhone: activeProfile.specialist_phone,
        specialistName: activeProfile.specialist_name,
        businessName: activeProfile.business_name,
        serviceTitle: selectedTariff.title,
        dateKey: activeDay.date_key,
        jalaliDate: activeDay.jalali_date,
        timeSlot: selectedSlot
      }
    );
  };

  const handleBookWithWallet = async () => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (!activeProfile || !selectedSlot || walletBalance < effectiveDepositToman) return;

    setBookingBusy(true);
    try {
      await completeBeautyBooking('کیف پول تندیس', walletBalance - effectiveDepositToman);
    } finally {
      setBookingBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={`rounded-3xl border p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 ${cardCls}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#065A52] dark:text-[#14B8A6]">
            <Sparkles className="w-4 h-4" />
            متخصصان زیبایی و سلامت تندیس
          </div>
          <h2 className="text-lg sm:text-xl font-black">لیست افراد، مهارت‌های تخصصی و رزرو آنلاین نوبت</h2>
          <p className={`text-xs ${mutedCls}`}>
            مشاهده مستقیم متخصصان زیبایی، مهارت‌های ثبت‌شده هر فرد در سرور (کراتین، آرایش مو، ناخن، پوست و...) و رزرو آنلاین
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
          <button
            onClick={() => setSubTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              subTab === 'explore' ? 'bg-[#065A52] text-white' : mutedCls
            }`}
          >
            لیست متخصصان ({toPersianDigits(filteredSpecialists.length)})
          </button>
          <button
            onClick={() => setSubTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              subTab === 'appointments' ? 'bg-[#065A52] text-white' : mutedCls
            }`}
          >
            نوبت‌های من ({toPersianDigits(bookings.length)})
          </button>
        </div>
      </div>

      {subTab === 'explore' ? (
        <>
          {/* فیلتر مهارت‌ها و تقویم ۷ روز آینده */}
          <div className={`rounded-3xl border p-4 space-y-4 ${cardCls}`}>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {dynamicSkillFilters.map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setSelectedSkill(sk)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border cursor-pointer transition-colors ${
                    selectedSkill === sk
                      ? 'bg-[#065A52] text-white border-[#065A52]'
                      : 'border-[#E2EFEF] dark:border-[#26384E] hover:border-[#065A52]/50'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#eef5f5]">
              <div className="flex items-center gap-2 text-xs font-black">
                <Calendar className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6]" />
                انتخاب روز نوبت از تقویم ۷ روز آینده:
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="accent-[#065A52]"
                />
                نمایش تنها افراد دارای نوبت آزاد در این روز
              </label>
            </div>

            <div className="grid grid-cols-7 gap-2 overflow-x-auto">
              {calendarDays.map((day, idx) => {
                const active = selectedDayIdx === idx;
                return (
                  <button
                    key={day.date_key}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`rounded-2xl p-2.5 text-center border transition cursor-pointer ${
                      active
                        ? 'bg-[#065A52] text-white border-[#065A52]'
                        : 'border-[#E2EFEF] dark:border-[#26384E] hover:border-[#065A52]/50'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{day.weekday}</div>
                    <div className="text-xs font-black mt-1 tabular-nums">{day.jalali_short}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* لیست مستقیم افراد و متخصصان زیبایی به‌همراه مهارت‌های چندگانه هر فرد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSpecialists.map((spec) => {
              const dayObj = (spec.days || [])[selectedDayIdx] || (spec.days || [])[0];
              const slots = dayObj?.is_open ? dayObj.slots || dayObj.time_slots || [] : [];
              const specSkills = Array.isArray(spec.skills) && spec.skills.length > 0
                ? spec.skills
                : (spec.tariffs || []).map((t) => t.title);

              return (
                <div
                  key={spec.specialist_phone}
                  className={`rounded-3xl border p-5 space-y-4 hover:border-[#065A52]/50 transition-all shadow-2xs ${cardCls}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {spec.avatar_url ? (
                        <img
                          src={spec.avatar_url}
                          alt={spec.specialist_name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-[#E2EFEF]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#065A52]/12 text-[#065A52] dark:text-[#14B8A6] flex items-center justify-center font-black text-lg">
                          {spec.specialist_name.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-base">{spec.specialist_name}</h3>
                        <div className="text-xs font-bold text-[#0D9488] dark:text-[#14B8A6]">
                          {spec.business_name}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${mutedCls}`}>
                          {spec.salon_address || spec.service_city || 'شهر منتخب شما'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-xs font-black text-[#D97706]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{toPersianDigits(spec.rating || 4.8)}</span>
                    </div>
                  </div>

                  {/* نمایش تگ مهارت‌های چندگانه هر متخصص (مثلاً هم کراتین و هم آرایش مو) */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-extrabold text-[#527371]">
                      مهارت‌ها و خدمات تخصصی این فرد ({toPersianDigits(specSkills.length)} مهارت):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {specSkills.map((skillName) => {
                        const matchedTariff = (spec.tariffs || []).find(
                          (t) => t.title === skillName || t.title.includes(skillName) || skillName.includes(t.title)
                        );
                        return (
                          <button
                            key={skillName}
                            type="button"
                            onClick={() => {
                              setActiveProfile(spec);
                              setSelectedSlot(slots[0] || '');
                              setSelectedTariffTitle(matchedTariff?.title || spec.tariffs?.[0]?.title || skillName);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#effcfb] hover:bg-[#ddf6f4] text-[#0b5c60] border border-[#bce6e4] text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-[#0a8387]" />
                            <span>{skillName}</span>
                            {matchedTariff && matchedTariff.price_toman > 0 && (
                              <span className="text-[10px] font-bold text-[#0a8387] tabular-nums">
                                ({formatToman(matchedTariff.price_toman)})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E2EFEF] dark:border-[#26384E]">
                    <div className="text-xs space-y-0.5">
                      <div>
                        <span className={mutedCls}>نوبت‌های آزاد {activeDay.weekday}: </span>
                        <strong className="font-black tabular-nums">{toPersianDigits(slots.length)} زمان</strong>
                      </div>
                      <div className="font-black text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                        شروع تعرفه: {formatToman(Math.min(...(spec.tariffs || []).map((t) => t.price_toman || 650000)))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProfile(spec);
                        setSelectedSlot(slots[0] || '');
                        setSelectedTariffTitle(spec.tariffs?.[0]?.title || '');
                      }}
                      className="rounded-xl bg-[#065A52] hover:bg-[#054943] text-white px-4 py-2.5 text-xs font-extrabold cursor-pointer transition-colors"
                    >
                      انتخاب مهارت و رزرو نوبت
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredSpecialists.length === 0 && (
              <div className={`col-span-full rounded-3xl border p-10 text-center text-sm ${cardCls}`}>
                در این فیلتر مهارت یا روز، متخصصی یافت نشد. فیلتر «همه مهارت‌ها» را انتخاب کنید.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className={`rounded-3xl border p-10 text-center text-sm ${cardCls}`}>
              هنوز نوبت زیبایی فعالی ثبت نکرده‌اید.
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className={`rounded-3xl border p-5 flex flex-wrap items-center justify-between gap-4 ${cardCls}`}>
                <div className="space-y-1">
                  <div className="font-black text-base">{b.business_name} — {b.specialist_name}</div>
                  <div className={`text-xs ${mutedCls}`}>
                    {b.service_title} · تاریخ {b.jalali_date} ساعت {toPersianDigits(b.time_slot)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-3 py-1.5 rounded-xl ${
                      b.status === 'CANCELLED'
                        ? 'bg-red-500/15 text-red-500'
                        : 'bg-[#10B981]/15 text-[#10B981]'
                    }`}
                  >
                    {b.status === 'CANCELLED' ? 'لغوشده و مبلغ برگشت داده شد' : 'نوبت تاییدشده'}
                  </span>
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={async () => {
                        await cancelBeautyAppointment({
                          booking: b,
                          currentWalletBalance: walletBalance
                        });
                        onToast('نوبت لغو شد و مبلغ بیعانه بلافاصله به کیف پول شما بازگشت.');
                        onRefresh();
                      }}
                      className="rounded-xl border border-red-400 text-red-500 hover:bg-red-500/10 px-3.5 py-2 text-xs font-extrabold cursor-pointer"
                    >
                      لغو آنی و بازگشت وجه
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* مودال پروفایل کامل آرایشگر و رزرو */}
      {activeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${cardCls}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
              <div className="flex items-center gap-2 font-black text-lg">
                <UserCheck className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
                پروفایل تخصصی {activeProfile.specialist_name}
              </div>
              <button onClick={() => setActiveProfile(null)} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div className="space-y-2">
                <div className="font-black text-base">{activeProfile.business_name}</div>
                <p className={`text-xs leading-6 ${mutedCls}`}>{activeProfile.bio}</p>
                <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-3 text-xs flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6]" />
                    {activeProfile.salon_address || activeProfile.service_city}
                  </span>
                  <span className="text-[#10B981] font-extrabold">{activeProfile.salon_map_status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black">انتخاب خدمت و تعرفه سالن:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(activeProfile.tariffs || []).map((t) => (
                    <button
                      key={t.title}
                      onClick={() => setSelectedTariffTitle(t.title)}
                      className={`text-right rounded-2xl border p-3.5 transition cursor-pointer space-y-1 ${
                        selectedTariffTitle === t.title
                          ? 'border-[#065A52] bg-[#065A52]/10'
                          : 'border-[#E2EFEF] dark:border-[#26384E]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{t.title}</div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-black text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                          {formatToman(t.price_toman)}
                        </span>
                        <span className={mutedCls}>
                          مدت: {toPersianDigits(t.duration_min ?? 60)} دقیقه
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6]" />
                  انتخاب ساعت نوبت ({activeDay.weekday} - {activeDay.jalali_date}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {((activeProfile.days || [])[selectedDayIdx]?.slots ||
                    (activeProfile.days || [])[selectedDayIdx]?.time_slots ||
                    []
                  ).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(toPersianDigits(slot))}
                      className={`px-4 py-2 rounded-xl text-xs font-black border cursor-pointer tabular-nums ${
                        selectedSlot === toPersianDigits(slot)
                          ? 'bg-[#065A52] text-white border-[#065A52]'
                          : 'border-[#CBD5E1] dark:border-[#26384E]'
                      }`}
                    >
                      {toPersianDigits(slot)}
                    </button>
                  ))}
                </div>
              </div>

              {(activeProfile.portfolio_notes || []).length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-black">نمونه‌کارها و استانداردهای سالن:</div>
                  <ul className={`text-xs space-y-1 list-disc pr-5 ${mutedCls}`}>
                    {activeProfile.portfolio_notes?.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(activeProfile.reviews || []).length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-black">دیدگاه مشتریان:</div>
                  {activeProfile.reviews?.map((rev, i) => (
                    <div key={i} className="rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{rev.customer_name}</span>
                        <span className="text-[#F59E0B]">{toPersianDigits(rev.stars)} از ۵</span>
                      </div>
                      <p className={mutedCls}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className={mutedCls}>مبلغ کل تعرفه انتخابی:</span>
                  <span className="font-black tabular-nums">{formatToman(selectedTariff.price_toman)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={mutedCls}>بیعانه رزرو آنلاین (قابل استرداد در صورت لغو):</span>
                  <span className="font-black text-[#065A52] dark:text-[#14B8A6] tabular-nums">
                    {formatToman(effectiveDepositToman)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  disabled={bookingBusy || !selectedSlot}
                  onClick={handleBookWithGateway}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 px-4 text-xs font-extrabold cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  پرداخت آنلاین بیعانه ({formatToman(effectiveDepositToman)})
                </button>
                <button
                  disabled={bookingBusy || !selectedSlot || walletBalance < effectiveDepositToman}
                  onClick={handleBookWithWallet}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#065A52] text-[#065A52] dark:text-[#14B8A6] hover:bg-[#065A52]/10 disabled:opacity-50 py-3.5 px-4 text-xs font-extrabold cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  {bookingBusy ? 'در حال ثبت...' : `پرداخت از کیف پول (${formatToman(walletBalance)})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
