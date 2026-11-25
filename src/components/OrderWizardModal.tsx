import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Home,
  MapPin,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
  Upload,
  Wallet,
  Wrench,
  X
} from 'lucide-react';
import { compressImageToBase64, createServiceRequest, updateCustomerWallet } from '../services/tandisApi';
import {
  APPLIANCE_BRANDS_BY_SERVICE,
  CAR_BRANDS_MODELS_CATALOG,
  CAR_PRODUCTION_YEARS,
  DIGITAL_INDUSTRY_DEMAND_OPTIONS,
  LEGAL_SPECIALIST_DEMAND_OPTIONS,
  MEDICAL_DOCTOR_VISIT_REASONS,
  MEDICAL_NURSING_SERVICE_TYPES,
  formatToman,
  toPersianDigits,
  toPurePersianText
} from '../services/tandisDefaults';
import type { CategorySliderItem, ServiceCategoryGroup, SubServiceItem, TandisCityInfo } from '../types/tandis';

interface OrderWizardProps {
  open: boolean;
  dark: boolean;
  group: ServiceCategoryGroup | null;
  sub: SubServiceItem | null;
  categorySliders: Record<string, CategorySliderItem[]> | null;
  cityInfo: TandisCityInfo;
  phone: string;
  customerName: string;
  walletBalance: number;
  onClose: () => void;
  onRequireLogin: () => void;
  onRequestShaparak: (
    amountToman: number,
    title: string,
    onSuccess: () => Promise<void>,
    paymentMeta?: Record<string, unknown>
  ) => void;
  onSubmitted: () => void;
  onToast: (msg: string) => void;
}

export const OrderWizardModal: React.FC<OrderWizardProps> = ({
  open,
  dark,
  group,
  sub,
  cityInfo,
  phone,
  customerName,
  walletBalance,
  onClose,
  onRequireLogin,
  onRequestShaparak,
  onSubmitted,
  onToast
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [problemSelectValue, setProblemSelectValue] = useState('');
  const [description, setDescription] = useState('');

  // ۱. فنی و تعمیرات لوازم خانگی: انتخاب مارک دستگاه
  const [applianceBrand, setApplianceBrand] = useState('');

  // ۲. امداد و تعمیرات خودرو: برند خودرو، مدل خودرو، سال ساخت، پلاک
  const [carBrand, setCarBrand] = useState('');
  const [carModelName, setCarModelName] = useState('');
  const [carYear, setCarYear] = useState('۱۴۰۲ (۲۰۲۳)');
  const [carPlate, setCarPlate] = useState('');

  // ۳. نظافت منزل: خانه ویلایی یا آپارتمانی
  const [houseType, setHouseType] = useState<'آپارتمانی' | 'خانه ویلایی'>('آپارتمانی');
  const [villaMeters, setVillaMeters] = useState('۱۵۰ متر');
  const [villaRooms, setVillaRooms] = useState('۳ اتاق');
  const [aptFloors, setAptFloors] = useState('۴ طبقه');
  const [aptUnitMeters, setAptUnitMeters] = useState('۱۰۰ متر');

  // ۴. قالیشویی: تعداد فرش و متراژ فرش‌ها
  const [carpetCount, setCarpetCount] = useState('۲ تخته');
  const [carpetDimension, setCarpetDimension] = useState('۱۲ متری');

  // ۵. مبل‌شویی: چند نفره
  const [sofaSeats, setSofaSeats] = useState('۷ نفره (ست کامل)');

  // ۶. باربری و اتوبار: نوع بار، نوع ماشین، مبدا و مقصد
  const [cargoServiceType, setCargoServiceType] = useState('اسباب‌کشی کامل منزل');
  const [cargoVehicleType, setCargoVehicleType] = useState('ماشین بزرگ (کامیونت مسقف خاور / ایسوزو)');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // ۷. پزشکی و پرستاری: نوع بیماری / خدمت پرستاری
  const [medicalReason, setMedicalReason] = useState('');

  // ۸. وکالت و حقوقی / صنعت و دیجیتال: خواسته دقیق مشتری از متخصص
  const [specialistDemand, setSpecialistDemand] = useState('');
  const [legalConsultType, setLegalConsultType] = useState<'غیرحضوری / تلفنی' | 'حضوری در دفتر وکیل'>('غیرحضوری / تلفنی');
  const [legalDocs, setLegalDocs] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // مرحله ۲: نشانی و زمان
  const [neighborhood, setNeighborhood] = useState(cityInfo.neighborhoods[0] || '');
  const [address, setAddress] = useState(cityInfo.defaultAddress);
  const [lat] = useState(cityInfo.lat);
  const [lng] = useState(cityInfo.lng);
  const [isUrgent, setIsUrgent] = useState(true);
  const [scheduleSlot, setScheduleSlot] = useState('فردا صبح (۰۹:۰۰ تا ۱۲:۰۰)');
  const [paymentMethod, setPaymentMethod] = useState<'ON_SITE' | 'WALLET' | 'SHAPARAK'>('ON_SITE');
  const [submitting, setSubmitting] = useState(false);

  const subId = sub?.id || '';
  const groupSlug = group?.slug || '';

  const isApplianceService = Boolean(subId && APPLIANCE_BRANDS_BY_SERVICE[subId]);
  const applianceBrands = useMemo(
    () => (subId && APPLIANCE_BRANDS_BY_SERVICE[subId]) || [],
    [subId]
  );

  const isAutoService = groupSlug === 'cat-automotive-mechanic' || subId.startsWith('auto-');
  const carBrandsList = useMemo(() => Object.keys(CAR_BRANDS_MODELS_CATALOG), []);
  const availableCarModels = useMemo(
    () => (carBrand ? CAR_BRANDS_MODELS_CATALOG[carBrand] || [] : []),
    [carBrand]
  );

  const isHouseCleaning = subId === 'clean-house-stairs';
  const isCarpetCleaning = subId === 'clean-carpet';
  const isSofaCleaning = subId === 'clean-sofa';
  const isFreightOnly = subId === 'clean-freight';
  const isAutobarMoving = subId === 'clean-moving-truck' || subId === 'clean-autobar';
  const isMovingOrFreight = isFreightOnly || isAutobarMoving;

  const isDoctorVisit = subId === 'med-home-doctor';
  const isNursingService = subId === 'med-nursing-injection';
  const isLegalService = Boolean(sub?.isLegalMode || groupSlug === 'cat-legal-judicial');
  const isDigitalIndustryService = groupSlug === 'cat-business-tech-industry' || subId.startsWith('digital-');

  useEffect(() => {
    if (open && sub) {
      setStep(1);
      setSelectedProblems(sub.readyProblems.slice(0, 1));
      setProblemSelectValue('');
      setDescription('');

      // پیش‌فرض برند لوازم خانگی
      const brands = APPLIANCE_BRANDS_BY_SERVICE[sub.id];
      setApplianceBrand(brands && brands.length > 0 ? brands[0] : '');

      // پیش‌فرض خودرو
      const firstCarBrand = Object.keys(CAR_BRANDS_MODELS_CATALOG)[0] || '';
      setCarBrand(firstCarBrand);
      const firstModels = CAR_BRANDS_MODELS_CATALOG[firstCarBrand] || [];
      setCarModelName(firstModels[0] || '');
      setCarYear('۱۴۰۲ (۲۰۲۳)');
      setCarPlate('');

      // پیش‌فرض نظافت و باربری
      setHouseType('آپارتمانی');
      setVillaMeters('۱۵۰ متر');
      setVillaRooms('۳ اتاق');
      setAptFloors('۴ طبقه');
      setAptUnitMeters('۱۰۰ متر');
      setCarpetCount('۲ تخته');
      setCarpetDimension('۱۲ متری');
      setSofaSeats('۷ نفره (ست کامل)');

      if (sub.id === 'clean-freight') {
        setCargoServiceType('بار کوچک / خرده‌بار');
        setCargoVehicleType('وانت / نیسان بار');
      } else {
        setCargoServiceType('اسباب‌کشی کامل منزل');
        setCargoVehicleType('ماشین بزرگ (کامیونت مسقف خاور / ایسوزو)');
      }
      setOriginAddress(`${cityInfo.name}، `);
      setDestinationAddress(`${cityInfo.name}، `);

      // پیش‌فرض پزشکی و پرستاری
      if (sub.id === 'med-home-doctor') {
        setMedicalReason(MEDICAL_DOCTOR_VISIT_REASONS[0]);
      } else if (sub.id === 'med-nursing-injection') {
        setMedicalReason(MEDICAL_NURSING_SERVICE_TYPES[0]);
      } else {
        setMedicalReason('');
      }

      // پیش‌فرض حقوقی و صنعت/دیجیتال
      if (sub.isLegalMode || group?.slug === 'cat-legal-judicial') {
        setSpecialistDemand(LEGAL_SPECIALIST_DEMAND_OPTIONS[0]);
      } else if (group?.slug === 'cat-business-tech-industry' || sub.id.startsWith('digital-')) {
        setSpecialistDemand(DIGITAL_INDUSTRY_DEMAND_OPTIONS[0]);
      } else {
        setSpecialistDemand('');
      }

      setLegalConsultType('غیرحضوری / تلفنی');
      setLegalDocs([null, null, null]);
      setNeighborhood(cityInfo.neighborhoods[0] || '');
      setAddress(cityInfo.defaultAddress);
      setIsUrgent(true);
      setPaymentMethod('ON_SITE');
    }
  }, [open, sub, group, cityInfo]);

  if (!open || !group || !sub) return null;

  const basePrice = Math.max(0, Number(sub.basePriceToman || 0)) || 580000;
  const totalAmount = isUrgent ? Math.round(basePrice * 1.15) : basePrice;

  const toggleProblem = (p: string) => {
    setSelectedProblems((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleAddProblemFromSelect = (val: string) => {
    setProblemSelectValue('');
    if (!val) return;
    setSelectedProblems((prev) => (prev.includes(val) ? prev : [...prev, val]));
  };

  const handleLegalDocUpload = async (idx: 0 | 1 | 2, file?: File) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const b64 = await compressImageToBase64(file, 960, 0.7);
      setLegalDocs((prev) => {
        const next: [string | null, string | null, string | null] = [...prev];
        next[idx] = b64;
        return next;
      });
    } catch {
      onToast('خطا در بارگذاری تصویر مدرک');
    } finally {
      setUploadingIdx(null);
    }
  };

  // ساخت خلاصه ساختاریافته مشخصات فنی برای نمایش یکسان در اپلیکیشن تندیس مشتری، تندیس همکار، تندیس مدیریت و وب‌سایت
  const buildStructuredOrderSummary = (): { modelSummary: string; fullIssueDescription: string } => {
    const problemsStr = selectedProblems.length > 0 ? selectedProblems.join('، ') : toPurePersianText(sub.title);
    const timeTag = isUrgent ? '[اعزام فوری]' : `[نوبت: ${scheduleSlot}]`;
    const detailsLines: string[] = [];
    let modelSummary = toPurePersianText(sub.title);

    if (isApplianceService) {
      modelSummary = `برند دستگاه: ${applianceBrand || 'نامشخص'}`;
      detailsLines.push(`مارک / برند دستگاه: ${applianceBrand || 'ثبت‌نشده'}`);
    } else if (isAutoService) {
      modelSummary = `${carBrand} - ${carModelName} | سال ${carYear}`;
      detailsLines.push(`برند خودرو: ${carBrand}`);
      detailsLines.push(`مدل خودرو: ${carModelName}`);
      detailsLines.push(`سال ساخت: ${carYear}`);
      if (carPlate.trim()) {
        detailsLines.push(`پلاک خودرو: ${carPlate.trim()}`);
      }
    } else if (isHouseCleaning) {
      if (houseType === 'خانه ویلایی') {
        modelSummary = `خانه ویلایی | متراژ: ${villaMeters} | ${villaRooms}`;
        detailsLines.push(`نوع ملک: خانه ویلایی`);
        detailsLines.push(`متراژ خانه ویلایی: ${villaMeters}`);
        detailsLines.push(`تعداد اتاق‌ها: ${villaRooms}`);
      } else {
        modelSummary = `ساختمان آپارتمانی | ${aptFloors} | متراژ واحد: ${aptUnitMeters}`;
        detailsLines.push(`نوع ملک: آپارتمانی`);
        detailsLines.push(`تعداد طبقات: ${aptFloors}`);
        detailsLines.push(`متراژ واحد آپارتمان: ${aptUnitMeters}`);
      }
    } else if (isCarpetCleaning) {
      modelSummary = `قالیشویی | تعداد: ${carpetCount} | ابعاد: ${carpetDimension}`;
      detailsLines.push(`تعداد فرش‌ها: ${carpetCount}`);
      detailsLines.push(`ابعاد / متراژ فرش‌ها: ${carpetDimension}`);
    } else if (isSofaCleaning) {
      modelSummary = `مبل‌شویی | ظرفیت: ${sofaSeats}`;
      detailsLines.push(`تعداد نشیمن مبل: ${sofaSeats}`);
    } else if (isMovingOrFreight) {
      modelSummary = `${cargoServiceType} | خودرو: ${cargoVehicleType}`;
      detailsLines.push(`نوع بار و درخواست: ${cargoServiceType}`);
      detailsLines.push(`نوع خودروی باربری: ${cargoVehicleType}`);
      if (originAddress.trim()) {
        detailsLines.push(`نشانی مبدا بارگیری: ${originAddress.trim()}`);
      }
      if (destinationAddress.trim()) {
        detailsLines.push(`نشانی مقصد تخلیه: ${destinationAddress.trim()}`);
      }
    } else if (isDoctorVisit) {
      modelSummary = `ویزیت پزشک | علت: ${medicalReason}`;
      detailsLines.push(`نوع بیماری / علت ویزیت پزشک: ${medicalReason}`);
    } else if (isNursingService) {
      modelSummary = `خدمات پرستاری | خدمت: ${medicalReason}`;
      detailsLines.push(`نوع خدمت پرستاری درخواستی: ${medicalReason}`);
    } else if (isLegalService) {
      modelSummary = `امور حقوقی (${legalConsultType}) | خواسته: ${specialistDemand}`;
      detailsLines.push(`درخواست مشتری از وکیل/کارشناس حقوقی: ${specialistDemand}`);
      detailsLines.push(`شیوه مشاوره: ${legalConsultType}`);
      const docsCount = legalDocs.filter(Boolean).length;
      if (docsCount > 0) {
        detailsLines.push(`مدارک پیوست‌شده: ${toPersianDigits(docsCount)} تصویر`);
      }
    } else if (isDigitalIndustryService) {
      modelSummary = `صنعت و دیجیتال | خواسته: ${specialistDemand}`;
      detailsLines.push(`درخواست مشتری از متخصص: ${specialistDemand}`);
    }

    detailsLines.push(`مشکلات / موارد انتخاب‌شده: ${problemsStr}`);
    if (description.trim()) {
      detailsLines.push(`توضیحات تکمیلی مشتری: ${description.trim()}`);
    }

    const fullIssueDescription = `${timeTag} ${detailsLines.join(' | ')}`.trim();
    return { modelSummary, fullIssueDescription };
  };

  const executeOrderCreation = async (isPaidOnline: boolean, newWallet?: number) => {
    const { modelSummary, fullIssueDescription } = buildStructuredOrderSummary();
    const effectiveHomeAddress =
      isMovingOrFreight && originAddress.trim()
        ? `مبدا: ${originAddress.trim()} -> مقصد: ${destinationAddress.trim() || address}`
        : address;

    await createServiceRequest({
      customer_name: customerName || 'مشتری تندیس',
      customer_phone: phone,
      service_category_id: sub.id,
      service_title: toPurePersianText(sub.title),
      car_model: modelSummary,
      car_plate: isAutoService ? carPlate.trim() : '',
      issue_description: fullIssueDescription,
      neighborhood,
      home_address: effectiveHomeAddress,
      city: cityInfo.name,
      customer_lat: lat,
      customer_lng: lng,
      price_toman: totalAmount,
      is_paid_online: isPaidOnline,
      ...(isPaidOnline ? { payment_reference_id: `تندیس-${String(Date.now()).slice(-6)}` } : {}),
      is_urgent: isUrgent
    });

    if (typeof newWallet === 'number') {
      await updateCustomerWallet(phone, customerName || 'مشتری تندیس', newWallet);
    }

    onToast('درخواست شما با موفقیت ثبت و برای متخصصان شهر ارسال شد.');
    onSubmitted();
    onClose();
  };

  const handleFinalSubmit = async () => {
    if (!phone) {
      onRequireLogin();
      return;
    }

    if (paymentMethod === 'WALLET') {
      if (walletBalance < totalAmount) {
        onToast('موجودی کیف پول شما کافی نیست. لطفاً پرداخت آنلاین را انتخاب کنید.');
        return;
      }
      setSubmitting(true);
      try {
        await executeOrderCreation(true, walletBalance - totalAmount);
      } catch (err: unknown) {
        onToast(err instanceof Error ? err.message : 'خطا در ثبت درخواست');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (paymentMethod === 'SHAPARAK') {
      const { modelSummary, fullIssueDescription } = buildStructuredOrderSummary();
      const effectiveHomeAddress =
        isMovingOrFreight && originAddress.trim()
          ? `مبدا: ${originAddress.trim()} -> مقصد: ${destinationAddress.trim() || address}`
          : address;

      onRequestShaparak(
        totalAmount,
        `پیش‌پرداخت خدمت ${toPurePersianText(sub.title)}`,
        async () => {
          await executeOrderCreation(true);
        },
        {
          kind: 'service',
          phone,
          customerName: customerName || 'مشتری تندیس',
          serviceCategoryId: sub.id,
          serviceTitle: toPurePersianText(sub.title),
          carModel: modelSummary,
          carPlate: isAutoService ? carPlate.trim() : '',
          issueDescription: fullIssueDescription,
          neighborhood,
          address: effectiveHomeAddress,
          city: cityInfo.name,
          lat,
          lng,
          isUrgent
        }
      );
      return;
    }

    setSubmitting(true);
    try {
      await executeOrderCreation(false);
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'خطا در ثبت درخواست');
    } finally {
      setSubmitting(false);
    }
  };

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  const { modelSummary: previewSummary } = buildStructuredOrderSummary();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4 backdrop-blur-xs">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${panelCls}`}>
        {/* هدر مینیمال بدون اسلایدر تبلیغاتی بالا */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div>
            <div className="text-[11px] font-bold text-[#0a8387]">
              {toPurePersianText(group.title)} • مرحله {toPersianDigits(step)} از ۳
            </div>
            <h3 className="font-black text-base sm:text-lg mt-0.5">{toPurePersianText(sub.title)}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 cursor-pointer transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نوار پیشرفت مراحل */}
        <div className="grid grid-cols-3 gap-2 px-5 py-2.5 bg-[#0a8387]/5 border-b border-[#E2EFEF] dark:border-[#26384E] text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#0a8387] font-black' : 'opacity-45'}`}>
            <span className="w-5 h-5 rounded-full bg-[#0a8387] text-white flex items-center justify-center text-[11px]">۱</span>
            مشخصات و جزئیات
          </div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#0a8387] font-black' : 'opacity-45'}`}>
            <span className="w-5 h-5 rounded-full bg-[#0a8387] text-white flex items-center justify-center text-[11px]">۲</span>
            نشانی و زمان
          </div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#0a8387] font-black' : 'opacity-45'}`}>
            <span className="w-5 h-5 rounded-full bg-[#0a8387] text-white flex items-center justify-center text-[11px]">۳</span>
            تایید و ثبت نهایی
          </div>
        </div>

        {/* محتوای مرحله */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {step === 1 && (
            <>
              {/* ۱. بخش اختصاصی فنی و تعمیرات لوازم خانگی (انتخاب مارک دستگاه به صورت لیست‌باکس) */}
              {isApplianceService && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Wrench className="w-4 h-4" />
                    انتخاب مدل و مارک دستگاه ({toPurePersianText(sub.title)}):
                  </label>
                  <div className="relative">
                    <select
                      value={applianceBrand}
                      onChange={(e) => setApplianceBrand(e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                    >
                      {applianceBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </div>
              )}

              {/* ۲. بخش اختصاصی امداد و تعمیرات خودرو (برند خودرو -> مدل خودرو -> سال ساخت) */}
              {isAutoService && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Car className="w-4 h-4" />
                    مشخصات خودرو (برند، مدل و سال ساخت)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">۱. انتخاب برند خودرو:</label>
                      <div className="relative">
                        <select
                          value={carBrand}
                          onChange={(e) => {
                            const nextBrand = e.target.value;
                            setCarBrand(nextBrand);
                            const nextModels = CAR_BRANDS_MODELS_CATALOG[nextBrand] || [];
                            setCarModelName(nextModels[0] || '');
                          }}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {carBrandsList.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">۲. انتخاب نام و مدل خودرو:</label>
                      <div className="relative">
                        <select
                          value={carModelName}
                          onChange={(e) => setCarModelName(e.target.value)}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {availableCarModels.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">۳. سال ساخت / تاریخ تولید خودرو:</label>
                      <div className="relative">
                        <select
                          value={carYear}
                          onChange={(e) => setCarYear(e.target.value)}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {CAR_PRODUCTION_YEARS.map((yr) => (
                            <option key={yr} value={yr}>
                              سال {yr}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">شماره پلاک خودرو (اختیاری):</label>
                      <input
                        value={carPlate}
                        onChange={(e) => setCarPlate(e.target.value)}
                        placeholder="مثال: ۱۴ ب ۳۶۵ ایران ۲۴"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ۳. بخش اختصاصی نظافت منزل (ویلایی یا آپارتمانی) */}
              {isHouseCleaning && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Home className="w-4 h-4" />
                    مشخصات ساختمان (خانه ویلایی یا آپارتمانی)
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {(['آپارتمانی', 'خانه ویلایی'] as const).map((ht) => (
                      <button
                        key={ht}
                        type="button"
                        onClick={() => setHouseType(ht)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          houseType === ht
                            ? 'bg-[#0a8387] text-white border-[#0a8387] shadow-sm'
                            : 'border-[#CBD5E1] dark:border-[#26384E] hover:border-[#0a8387]'
                        }`}
                      >
                        {ht === 'خانه ویلایی' ? <Home className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                        {ht}
                      </button>
                    ))}
                  </div>

                  {houseType === 'خانه ویلایی' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-80">متراژ خانه ویلایی چند متر است؟</label>
                        <div className="relative">
                          <select
                            value={villaMeters}
                            onChange={(e) => setVillaMeters(e.target.value)}
                            className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                          >
                            {['زیر ۱۰۰ متر', '۱۰۰ تا ۱۵۰ متر', '۱۵۰ تا ۲۰۰ متر', '۲۰۰ تا ۳۰۰ متر', '۳۰۰ تا ۵۰۰ متر', 'بالای ۵۰۰ متر (دوبلکس/باغ‌ویلا)'].map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-80">تعداد اتاق‌ها چند اتاق است؟</label>
                        <div className="relative">
                          <select
                            value={villaRooms}
                            onChange={(e) => setVillaRooms(e.target.value)}
                            className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                          >
                            {['۱ اتاق خواب', '۲ اتاق خواب', '۳ اتاق خواب', '۴ اتاق خواب', '۵ اتاق و بیشتر'].map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-80">ساختمان آپارتمانی چند طبقه است؟</label>
                        <div className="relative">
                          <select
                            value={aptFloors}
                            onChange={(e) => setAptFloors(e.target.value)}
                            className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                          >
                            {['۱ طبقه', '۲ طبقه', '۳ طبقه', '۴ طبقه', '۵ طبقه', '۶ تا ۸ طبقه', 'برج / بالای ۸ طبقه'].map((fl) => (
                              <option key={fl} value={fl}>{fl}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-80">متراژ واحد یا بخش مورد نظر:</label>
                        <div className="relative">
                          <select
                            value={aptUnitMeters}
                            onChange={(e) => setAptUnitMeters(e.target.value)}
                            className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                          >
                            {['واحد زیر ۷۵ متر', 'واحد ۷۵ تا ۱۱۰ متر', 'واحد ۱۱۰ تا ۱۵۰ متر', 'واحد بالای ۱۵۰ متر', 'فقط راه‌پله و مشاعات ساختمان'].map((um) => (
                              <option key={um} value={um}>{um}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ۴. بخش اختصاصی قالیشویی (تعداد فرش و متراژ فرش‌ها) */}
              {isCarpetCleaning && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Sparkles className="w-4 h-4" />
                    مشخصات فرش‌ها جهت قالیشویی
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">تعداد فرش‌ها چند تخته است؟</label>
                      <div className="relative">
                        <select
                          value={carpetCount}
                          onChange={(e) => setCarpetCount(e.target.value)}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {['۱ تخته فرش', '۲ تخته فرش', '۳ تخته فرش', '۴ تخته فرش', '۵ تخته فرش', '۶ تخته و بیشتر'].map((cnt) => (
                            <option key={cnt} value={cnt}>{cnt}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">فرش‌ها چند متری هستند؟</label>
                      <div className="relative">
                        <select
                          value={carpetDimension}
                          onChange={(e) => setCarpetDimension(e.target.value)}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {[
                            '۱۲ متری',
                            '۹ متری',
                            '۶ متری',
                            '۴ متری و قالیچه / کناره',
                            'ترکیبی (چند سایز مختلف ۶، ۹ و ۱۲ متری)',
                            'موکت (متراژی)'
                          ].map((dim) => (
                            <option key={dim} value={dim}>{dim}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ۵. بخش اختصاصی مبل‌شویی (تعداد نفرات مبل) */}
              {isSofaCleaning && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Sparkles className="w-4 h-4" />
                    مبلمان شما چند نفره است؟
                  </label>
                  <div className="relative">
                    <select
                      value={sofaSeats}
                      onChange={(e) => setSofaSeats(e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                    >
                      {[
                        '۵ نفره',
                        '۷ نفره (ست کامل)',
                        '۸ نفره (مبل راحتی / تخت‌خواب‌شو)',
                        '۹ نفره (مبل استیل / سلطنتی)',
                        '۱۲ نفره یا دو دست مبلمان کامل',
                        'مبل ال (L) + صندلی ناهارخوری',
                        'فقط صندلی ناهارخوری یا خوشخواب'
                      ].map((seat) => (
                        <option key={seat} value={seat}>{seat}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </div>
              )}

              {/* ۶. بخش اختصاصی باربری و اتوبار (نوع بار، نوع ماشین، مبدا و مقصد) */}
              {isMovingOrFreight && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Truck className="w-4 h-4" />
                    جزئیات باربری، خودروی حمل و مسیر (مبدا و مقصد)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">نوع بار یا سرویس درخواستی چیست؟</label>
                      <div className="relative">
                        <select
                          value={cargoServiceType}
                          onChange={(e) => setCargoServiceType(e.target.value)}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {[
                            'اسباب‌کشی کامل منزل',
                            'بار کوچک / خرده‌بار و لوازم تکی',
                            'اسباب‌کشی دفتر کار و شرکت',
                            'حمل لوازم سنگین (یخچال ساید، گاوصندوق، پیانو)',
                            'حمل بار تجاری، کارگاهی یا فروشگاهی'
                          ].map((ct) => (
                            <option key={ct} value={ct}>{ct}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">چه خودرویی نیاز دارید؟ (ماشین بزرگ یا وانت)</label>
                      <div className="relative">
                        <select
                          value={cargoVehicleType}
                          onChange={(e) => setCargoVehicleType(e.target.value)}
                          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                        >
                          {[
                            'ماشین بزرگ (کامیونت مسقف خاور / ایسوزو ۶ متری)',
                            'وانت سبک (پراید وانت / پیکان وانت / آریسان)',
                            'نیسان بار (روباز یا چادری نیمه‌سنگین)',
                            'خاور روباز / کامیون تک',
                            'فقط کارگر ماهر اسباب‌کشی (بدون ماشین)'
                          ].map((vt) => (
                            <option key={vt} value={vt}>{vt}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">نشانی دقیق مبدا (محل بارگیری):</label>
                      <input
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        placeholder="محله، خیابان، کوچه و طبقه مبدا..."
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-80">نشانی دقیق مقصد (محل تخلیه بار):</label>
                      <input
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        placeholder="محله، خیابان، کوچه و طبقه مقصد..."
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ۷. بخش اختصاصی پزشکی و پرستاری */}
              {(isDoctorVisit || isNursingService) && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Stethoscope className="w-4 h-4" />
                    {isDoctorVisit
                      ? 'نوع بیماری یا علت درخواست ویزیت پزشک را مشخص کنید:'
                      : 'نوع خدمت پرستاری یا تزریقات مورد نیاز را انتخاب کنید:'}
                  </label>
                  <div className="relative">
                    <select
                      value={medicalReason}
                      onChange={(e) => setMedicalReason(e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                    >
                      {(isDoctorVisit ? MEDICAL_DOCTOR_VISIT_REASONS : MEDICAL_NURSING_SERVICE_TYPES).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </div>
              )}

              {/* ۸. بخش اختصاصی وکالت و امور حقوقی */}
              {isLegalService && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <Scale className="w-4 h-4" />
                    مشخص کنید دقیقاً چه درخواستی از وکیل یا کارشناس حقوقی دارید:
                  </div>

                  <div className="relative">
                    <select
                      value={specialistDemand}
                      onChange={(e) => setSpecialistDemand(e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                    >
                      {LEGAL_SPECIALIST_DEMAND_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {(['غیرحضوری / تلفنی', 'حضوری در دفتر وکیل'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLegalConsultType(t)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer ${
                          legalConsultType === t
                            ? 'bg-[#0a8387] text-white border-[#0a8387]'
                            : 'border-[#CBD5E1] dark:border-[#26384E]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="text-[11px] font-bold mb-1.5 opacity-80">پیوست تصویر مدارک یا مستندات پرونده (اختیاری):</div>
                    <div className="grid grid-cols-3 gap-2">
                      {([0, 1, 2] as const).map((idx) => (
                        <label
                          key={idx}
                          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-dashed border-[#0a8387]/50 cursor-pointer hover:bg-[#0a8387]/5 text-center"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLegalDocUpload(idx, e.target.files?.[0])}
                          />
                          {legalDocs[idx] ? (
                            <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> مدرک {toPersianDigits(idx + 1)}
                            </span>
                          ) : (
                            <span className="text-[11px] opacity-75 flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              {uploadingIdx === idx ? 'فشرده‌سازی...' : `مدرک ${toPersianDigits(idx + 1)}`}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ۹. بخش اختصاصی صنعت، دیجیتال و کافی‌نت */}
              {isDigitalIndustryService && (
                <div className="p-4 rounded-2xl border border-[#dcecec] bg-[#f8fcfc] dark:bg-[#1E2D40]/50 dark:border-[#26384E] space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-black text-[#0b5c60] dark:text-[#2dd4bf]">
                    <FileText className="w-4 h-4" />
                    مشخص کنید دقیقاً چه خدمتی از متخصص صنعت و دیجیتال می‌خواهید:
                  </label>
                  <div className="relative">
                    <select
                      value={specialistDemand}
                      onChange={(e) => setSpecialistDemand(e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                    >
                      {DIGITAL_INDUSTRY_DEMAND_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </div>
              )}

              {/* لیست‌باکس مشکلات پرتکرار و موارد آماده (با تعداد گزینه‌های کامل و قابلیت انتخاب چندتایی) */}
              <div className="p-4 rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-black text-[#12292c] dark:text-white flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#0a8387]" />
                    مشکلات پرتکرار و جزئیات درخواست (انتخاب از لیست‌باکس):
                  </label>
                  <span className="text-[11px] font-bold text-[#0a8387]">
                    {toPersianDigits(selectedProblems.length)} مورد انتخاب‌شده
                  </span>
                </div>

                {/* منوی بازشونده لیست‌باکس برای افزودن سریع مشکل */}
                <div className="relative">
                  <select
                    value={problemSelectValue}
                    onChange={(e) => handleAddProblemFromSelect(e.target.value)}
                    className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer ${inputCls}`}
                  >
                    <option value="">+ انتخاب از لیست مشکلات پرتکرار ({toPersianDigits(sub.readyProblems.length)} مورد)...</option>
                    {sub.readyProblems.map((p) => (
                      <option key={p} value={p}>
                        {selectedProblems.includes(p) ? `✓ ${toPurePersianText(p)}` : toPurePersianText(p)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>

                {/* لیست باکس اسکرول‌دار چک‌باکسی برای مشاهده و تیک زدن مستقیم مشکلات پرتکرار */}
                <div className="max-h-44 overflow-y-auto rounded-xl border border-[#e2efef] dark:border-[#26384E] divide-y divide-[#eef6f6] dark:divide-[#26384E]">
                  {sub.readyProblems.map((p) => {
                    const active = selectedProblems.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProblem(p)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-right text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#effcfb] dark:bg-[#0a8387]/20 text-[#0b5c60] dark:text-[#2dd4bf]'
                            : 'hover:bg-[#f8fcfc] dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="leading-5">{toPurePersianText(p)}</span>
                        <span
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                            active
                              ? 'bg-[#0a8387] border-[#0a8387] text-white'
                              : 'border-[#cbd5e1] dark:border-[#475569]'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* توضیحات تکمیلی درباره اتفاق افتاده یا خواسته مشتری */}
              <div>
                <label className="block text-xs font-black mb-1.5">
                  توضیحات تکمیلی (چه اتفاقی افتاده یا چه انتظاری از متخصص دارید؟):
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="لطفاً شرح دقیقی از مشکل پیش‌آمده، علائم خرابی یا جزئیات درخواست خود بنویسید تا متخصص با ابزار و قطعه کامل اعزام شود..."
                  className={`w-full rounded-2xl border px-4 py-2.5 text-xs leading-6 outline-none ${inputCls}`}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">شهر انتخاب‌شده:</label>
                  <div className="px-4 py-2.5 rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] text-xs font-extrabold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0a8387]" />
                    {cityInfo.name} ({cityInfo.province})
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">انتخاب محله:</label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ${inputCls}`}
                  >
                    {cityInfo.neighborhoods.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold">نشانی دقیق محل اعزام متخصص (خیابان، کوچه، پلاک، واحد):</label>
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="نشانی دقیق خود را وارد کنید..."
                  className={`w-full rounded-2xl border px-4 py-2.5 text-xs outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">زمان اعزام متخصص:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUrgent(true)}
                    className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                      isUrgent
                        ? 'bg-[#0a8387] text-white border-[#0a8387]'
                        : 'border-[#CBD5E1] dark:border-[#26384E]'
                    }`}
                  >
                    <div className="font-black text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> اعزام فوری
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">در کمتر از {toPurePersianText(sub.etaText)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUrgent(false)}
                    className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                      !isUrgent
                        ? 'bg-[#0a8387] text-white border-[#0a8387]'
                        : 'border-[#CBD5E1] dark:border-[#26384E]'
                    }`}
                  >
                    <div className="font-black text-xs">رزرو زمان‌بندی‌شده</div>
                    <div className="text-[11px] opacity-80 mt-0.5">انتخاب روز و بازه ساعت</div>
                  </button>
                </div>

                {!isUrgent && (
                  <select
                    value={scheduleSlot}
                    onChange={(e) => setScheduleSlot(e.target.value)}
                    className={`mt-2.5 w-full rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ${inputCls}`}
                  >
                    <option value="امروز عصر (۱۶:۰۰ تا ۲۰:۰۰)">امروز عصر (۱۶:۰۰ تا ۲۰:۰۰)</option>
                    <option value="فردا صبح (۰۹:۰۰ تا ۱۲:۰۰)">فردا صبح (۰۹:۰۰ تا ۱۲:۰۰)</option>
                    <option value="فردا ظهر (۱۲:۰۰ تا ۱۶:۰۰)">فردا ظهر (۱۲:۰۰ تا ۱۶:۰۰)</option>
                    <option value="فردا عصر (۱۶:۰۰ تا ۲۰:۰۰)">فردا عصر (۱۶:۰۰ تا ۲۰:۰۰)</option>
                  </select>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="p-4 rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <span className={mutedCls}>خدمت انتخابی:</span>
                  <span className="font-black">{toPurePersianText(sub.title)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className={mutedCls}>مشخصات ثبت‌شده:</span>
                  <span className="font-bold text-left">{previewSummary}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className={mutedCls}>موارد انتخابی:</span>
                  <span className="font-bold text-left">
                    {selectedProblems.map((item) => toPurePersianText(item)).join('، ') || 'بررسی عمومی'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className={mutedCls}>شهر و محله:</span>
                  <span className="font-bold">
                    {cityInfo.name} - {neighborhood}
                  </span>
                </div>
                {isMovingOrFreight && originAddress.trim() && (
                  <div className="flex justify-between gap-3">
                    <span className={mutedCls}>مسیر باربری:</span>
                    <span className="font-bold text-left">
                      مبدا: {originAddress} | مقصد: {destinationAddress}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className={mutedCls}>زمان اعزام:</span>
                  <span className="font-bold">{isUrgent ? 'اعزام فوری' : scheduleSlot}</span>
                </div>
                <div className="pt-2 border-t border-[#E2EFEF] dark:border-[#26384E] flex justify-between items-center text-sm">
                  <span className="font-black">برآورد پایه تعرفه تندیس:</span>
                  <span className="font-black text-[#0a8387] text-base">{formatToman(totalAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">شیوه تسویه وجه:</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ON_SITE')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'ON_SITE'
                        ? 'border-[#10B981] bg-[#10B981]/10'
                        : 'border-[#CBD5E1] dark:border-[#26384E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-right">
                      <ShieldCheck className="w-5 h-5 text-[#0a8387]" />
                      <div>
                        <div className="text-xs font-black">پرداخت پس از انجام کار و صدور فاکتور متخصص</div>
                        <div className={`text-[11px] ${mutedCls}`}>تسویه پس از رضایت کامل شما از خدمت</div>
                      </div>
                    </div>
                    {paymentMethod === 'ON_SITE' && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'WALLET'
                        ? 'border-[#10B981] bg-[#10B981]/10'
                        : 'border-[#CBD5E1] dark:border-[#26384E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-right">
                      <Wallet className="w-5 h-5 text-[#F59E0B]" />
                      <div>
                        <div className="text-xs font-black">کسر از کیف پول تندیس</div>
                        <div className={`text-[11px] ${mutedCls}`}>موجودی فعلی: {formatToman(walletBalance)}</div>
                      </div>
                    </div>
                    {paymentMethod === 'WALLET' && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('SHAPARAK')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'SHAPARAK'
                        ? 'border-[#10B981] bg-[#10B981]/10'
                        : 'border-[#CBD5E1] dark:border-[#26384E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-right">
                      <CreditCard className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <div className="text-xs font-black">پرداخت آنلاین از طریق درگاه بانکی شاپرک</div>
                        <div className={`text-[11px] ${mutedCls}`}>ثبت آنی کد رهگیری پرداخت در پرونده سفارش</div>
                      </div>
                    </div>
                    {paymentMethod === 'SHAPARAK' && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* فوتر دکمه‌ها */}
        <div className="px-5 py-3.5 border-t border-[#E2EFEF] dark:border-[#26384E] flex items-center justify-between gap-2.5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="px-5 py-2.5 rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] text-xs font-extrabold cursor-pointer"
            >
              مرحله قبل
            </button>
          ) : (
            <div className="text-xs font-bold">
              تعرفه پایه: <span className="text-[#0a8387] font-black">{formatToman(totalAmount)}</span>
            </div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && isMovingOrFreight && (!originAddress.trim() || !destinationAddress.trim())) {
                  onToast('لطفاً نشانی مبدا و مقصد باربری را وارد کنید.');
                  return;
                }
                if (step === 2 && !address.trim()) {
                  onToast('لطفاً نشانی دقیق محل خدمت را وارد کنید.');
                  return;
                }
                setStep((s) => (s === 1 ? 2 : 3));
              }}
              className="px-6 py-2.5 rounded-2xl bg-[#0a8387] hover:bg-[#086d70] text-white text-xs font-extrabold cursor-pointer transition-colors"
            >
              ادامه و مرحله بعد
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="px-6 py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-xs font-black cursor-pointer transition-colors"
            >
              {submitting
                ? 'در حال ثبت و ارسال درخواست برای متخصصان...'
                : paymentMethod === 'SHAPARAK'
                ? 'ورود به درگاه شاپرک و ثبت سفارش'
                : 'تایید نهایی و اعزام متخصص'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
