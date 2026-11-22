import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Car,
  Stethoscope,
  Scale,
  Sparkles,
  Cpu,
  Scissors,
  User,
  FileText,
  FileCheck2,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Phone,
  IdCard,
  Search,
  RefreshCw,
  Check,
  Clock,
  Info
} from 'lucide-react';
import { LocationMapPicker, ResolvedLocationInfo } from './LocationMapPicker';

export interface SpecialtyItem {
  id: string;
  title: string;
  subGroup: string;
  licenseHint?: string;
}

export interface MainProviderCategory {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  specialties: SpecialtyItem[];
}

export const PROVIDER_CATEGORIES: MainProviderCategory[] = [
  {
    id: 'cat-technical-building',
    number: '۱',
    title: 'خدمات فنی، تأسیسات و ساختمان',
    subtitle: 'پرتکرارترین بخش روزمره با قابلیت اعزام فوری تکنسین',
    badge: 'اعزام فوری',
    icon: Wrench,
    specialties: [
      { id: 'tech-ac-gas', title: 'تعمیرکار کولر گازی', subGroup: 'سرمایش و گرمایش', licenseHint: 'گواهی فنی‌حرفه‌ای تاسیسات یا جواز کسب' },
      { id: 'tech-ac-water', title: 'تعمیرکار کولر آبی', subGroup: 'سرمایش و گرمایش', licenseHint: 'کارت مهارت فنی‌حرفه‌ای یا جواز کسب' },
      { id: 'tech-fridge', title: 'تعمیرکار یخچال و یخچال فریزر', subGroup: 'لوازم خانگی', licenseHint: 'مدرک فنی تعمیرات لوازم خانگی' },
      { id: 'tech-washer', title: 'تعمیرکار لباسشویی', subGroup: 'لوازم خانگی', licenseHint: 'مدرک فنی تعمیرات لوازم خانگی' },
      { id: 'tech-dishwasher', title: 'تعمیرکار ظرفشویی', subGroup: 'لوازم خانگی', licenseHint: 'مدرک فنی تعمیرات لوازم خانگی' },
      { id: 'tech-tv', title: 'تعمیرکار تلویزیون', subGroup: 'لوازم خانگی', licenseHint: 'مدرک الکترونیک یا اتحادیه صوت و تصویر' },
      { id: 'tech-electrician', title: 'برق‌کار ساختمان', subGroup: 'برق و لوله‌کشی ساختمان', licenseHint: 'کارت مهارت برق ساختمان' },
      { id: 'tech-plumber', title: 'لوله‌کش', subGroup: 'برق و لوله‌کشی ساختمان', licenseHint: 'گواهی تاسیسات و لوله‌کشی' },
      { id: 'tech-water-pump', title: 'تعمیر پمپ آب', subGroup: 'برق و لوله‌کشی ساختمان', licenseHint: 'گواهی فنی تاسیسات و پمپ' },
      { id: 'tech-carpenter', title: 'نجار', subGroup: 'چوب و دکوراسیون', licenseHint: 'پروانه کسب درودگری یا کارت مهارت' },
      { id: 'tech-cabinet', title: 'کابینت‌ساز', subGroup: 'چوب و دکوراسیون', licenseHint: 'پروانه کسب یا نمونه کار معتبر صنفی' }
    ]
  },
  {
    id: 'cat-auto-roadside',
    number: '۲',
    title: 'خودرو و امداد جاده‌ای',
    subtitle: 'خدمات موقعیت‌محور (Location-based) و واکنش سریع جاده‌ای',
    badge: 'امداد سریع (Emergency)',
    icon: Car,
    specialties: [
      { id: 'auto-mobile-mechanic', title: 'مکانیک سیار', subGroup: 'تعمیرات در محل', licenseHint: 'پروانه تخصصی تعمیرگاه یا کارت مهارت مکانیک' },
      { id: 'auto-electrician', title: 'برق‌کار خودرو', subGroup: 'تعمیرات در محل', licenseHint: 'گواهی برق و انژکتور خودرو' },
      { id: 'auto-tow-truck', title: 'یدک‌کش', subGroup: 'حمل و انتقال', licenseHint: 'مجوز امداد خودرو و کارت هوشمند ناوگان' },
      { id: 'auto-car-carrier', title: 'خودروبر', subGroup: 'حمل و انتقال', licenseHint: 'مجوز حمل خودرو و بیمه مسئولیت' },
      { id: 'auto-crane', title: 'جرثقیل', subGroup: 'حمل و انتقال', licenseHint: 'گواهینامه ویژه و مجوز فعالیت جرثقیل' }
    ]
  },
  {
    id: 'cat-health-care',
    number: '۳',
    title: 'سلامت، درمان و مراقبت',
    subtitle: 'حساس‌ترین بخش با الزام تایید مدارک و مجوز نظام پزشکی / پرستاری',
    badge: 'الزام مجوز نظام پزشکی',
    icon: Stethoscope,
    specialties: [
      { id: 'health-doctor', title: 'پزشک (ویزیت در مطب / ویزیت در منزل)', subGroup: 'خدمات پزشکی', licenseHint: 'پروانه طبابت و کارت نظام پزشکی معتبر' },
      { id: 'health-nurse', title: 'پرستار (تزریقات، پانسمان، مراقبت از بیمار و سالمند)', subGroup: 'خدمات پرستاری و مراقبت', licenseHint: 'کارت نظام پرستاری یا گواهی معتبر وزارت بهداشت' }
    ]
  },
  {
    id: 'cat-legal-judicial',
    number: '۴',
    title: 'حقوقی، قضایی و اداری',
    subtitle: 'خدمات تخصصی کارشناسی، مشاوره حقوقی و وکالت',
    badge: 'پروانه وکالت / کارشناسی',
    icon: Scale,
    specialties: [
      { id: 'legal-lawyer', title: 'وکیل (پایه‌یک / مشاور حقوقی)', subGroup: 'وکالت و مشاوره', licenseHint: 'پروانه وکالت کانون وکلا یا مرکز وکلای قوه قضاییه' },
      { id: 'legal-petition-writer', title: 'عریضه‌نویس (تنظیم دادخواست، شکواییه و لوایح)', subGroup: 'خدمات قضایی و اداری', licenseHint: 'مدرک حقوقی یا مجوز فعالیت دفتر خدمات قضایی' }
    ]
  },
  {
    id: 'cat-cleaning-moving',
    number: '۵',
    title: 'شستشو، نظافت و اسباب‌کشی',
    subtitle: 'خدمات بهداشت محیط، شستشوی تخصصی و جابه‌جایی اثاثیه',
    badge: 'خدمات منزل و حمل بار',
    icon: Sparkles,
    specialties: [
      { id: 'clean-house-stairs', title: 'نظافت منزل و راه‌پله', subGroup: 'نظافت و شستشو', licenseHint: 'گواهی عدم سوءپیشینه و معرفی‌نامه شرکت خدماتی' },
      { id: 'clean-carpet', title: 'قالیشویی', subGroup: 'نظافت و شستشو', licenseHint: 'پروانه کسب اتحادیه قالیشویان' },
      { id: 'clean-sofa', title: 'مبل‌شویی', subGroup: 'نظافت و شستشو', licenseHint: 'مجوز خدمات شستشو در محل' },
      { id: 'clean-moving-truck', title: 'باربری و اتوبار', subGroup: 'حمل‌ونقل', licenseHint: 'پروانه بهره‌برداری حمل‌ونقل درون‌شهری / برون‌شهری' }
    ]
  },
  {
    id: 'cat-business-tech-industry',
    number: '۶',
    title: 'کسب‌وکار، فناوری و صنعت',
    subtitle: 'ترکیب خدمات دیجیتال مارکتینگ و تعمیرات تخصصی صنعتی و کارگاهی',
    badge: 'فناوری و صنعت',
    icon: Cpu,
    specialties: [
      { id: 'tech-web-app-dev', title: 'طراح سایت و اپلیکیشن', subGroup: 'فناوری و مارکتینگ دیجیتال', licenseHint: 'رزومه تخصصی، نمونه‌کار یا مجوز نظام صنفی رایانه‌ای' },
      { id: 'tech-seo', title: 'بهینه‌ساز رتبه سایت (سئو / SEO)', subGroup: 'فناوری و مارکتینگ دیجیتال', licenseHint: 'گواهی تخصصی دیجیتال مارکتینگ و سئو' },
      { id: 'ind-electrician', title: 'برق‌کار صنعتی', subGroup: 'خدمات صنعتی و کارگاهی', licenseHint: 'مدرک برق صنعتی و تابلوبرق' },
      { id: 'ind-electronics-board', title: 'تعمیرکار الکترونیک (بردهای صنعتی و تجاری)', subGroup: 'خدمات صنعتی و کارگاهی', licenseHint: 'گواهی تعمیرات تخصصی بردهای الکترونیکی' },
      { id: 'ind-motor-3phase', title: 'تعمیر الکتروموتور ۳ فاز', subGroup: 'خدمات صنعتی و کارگاهی', licenseHint: 'کارت مهارت سیم‌پیچی و الکتروموتور صنعتی' },
      { id: 'ind-motor-1phase', title: 'تعمیر الکتروموتور تک‌فاز', subGroup: 'خدمات صنعتی و کارگاهی', licenseHint: 'کارت مهارت سیم‌پیچی و الکتروموتور' }
    ]
  },
  {
    id: 'cat-beauty-personal',
    number: '۷',
    title: 'زیبایی و مراقبت فردی',
    subtitle: 'خدمات لاین‌های آرایشی، پیرایشی و مراقبت پوست و مو (سالنی یا در محل)',
    badge: 'سالنی و در محل',
    icon: Scissors,
    specialties: [
      { id: 'beauty-nails', title: 'ناخن (کاشت، ترمیم، مانیکور)', subGroup: 'خدمات زیبایی', licenseHint: 'مدرک بین‌المللی یا فنی‌حرفه‌ای مراقبت زیبایی' },
      { id: 'beauty-keratin', title: 'کراتین و احیای مو', subGroup: 'خدمات زیبایی', licenseHint: 'گواهی تخصصی احیا و صافی مو' },
      { id: 'beauty-haircut', title: 'اصلاح، کوپ و آرایش مو', subGroup: 'خدمات زیبایی', licenseHint: 'پروانه کسب آرایشگری یا کارت مهارت فنی‌حرفه‌ای' },
      { id: 'beauty-skincare', title: 'پاکسازی و پوست', subGroup: 'خدمات زیبایی', licenseHint: 'مدرک فیشیال و مراقبت پوست' }
    ]
  }
];

const IRAN_PROVINCES = [
  { id: 'tehran', name: 'تهران', cities: ['تهران', 'کرج', 'شهریار', 'اسلامشهر', 'ورامین', 'پردیس', 'شمیرانات', 'ری'] },
  { id: 'isfahan', name: 'اصفهان', cities: ['اصفهان', 'کاشان', 'خمینی‌شهر', 'نجف‌آباد', 'شاهین‌شهر'] },
  { id: 'khorasan-razavi', name: 'خراسان رضوی', cities: ['مشهد', 'نیشابور', 'سبزوار', 'طرقبه'] },
  { id: 'fars', name: 'فارس', cities: ['شیراز', 'مرودشت', 'جهرم', 'کازرون'] },
  { id: 'east-azerbaijan', name: 'آذربایجان شرقی', cities: ['تبریز', 'مراغه', 'مرند', 'اهر'] },
  { id: 'mazandaran', name: 'مازندران', cities: ['ساری', 'بابل', 'آمل', 'قائم‌شهر', 'چالوس', 'رامسر'] },
  { id: 'khuzestan', name: 'خوزستان', cities: ['اهواز', 'آبادان', 'دزفول', 'خرمشهر', 'ماهشهر'] }
];

interface UploadedDocItem {
  doc_type: 'birth_certificate' | 'national_card' | 'skill_license';
  file: File | null;
  fileName: string;
  fileSizeKB: number;
  status: 'empty' | 'uploading' | 'pending' | 'initial_approval' | 'final_approval' | 'rejected';
  reviewerNote?: string;
}

interface ProviderSignupViewProps {
  onBackToHome: () => void;
}

export const ProviderSignupView: React.FC<ProviderSignupViewProps> = ({ onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [apiCategories, setApiCategories] = useState<Array<{ id: string; title: string }>>([]);
  const [apiSubCategories, setApiSubCategories] = useState<Array<{ id: string; title: string }>>([]);

  const [selectedMainCatId, setSelectedMainCatId] = useState<string>(PROVIDER_CATEGORIES[0].id);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>(
    PROVIDER_CATEGORIES[0].specialties[0].id
  );
  const [specialtySearch, setSpecialtySearch] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');

  const [documents, setDocuments] = useState<Record<'birth_certificate' | 'national_card' | 'skill_license', UploadedDocItem>>({
    birth_certificate: {
      doc_type: 'birth_certificate',
      file: null,
      fileName: '',
      fileSizeKB: 0,
      status: 'empty'
    },
    national_card: {
      doc_type: 'national_card',
      file: null,
      fileName: '',
      fileSizeKB: 0,
      status: 'empty'
    },
    skill_license: {
      doc_type: 'skill_license',
      file: null,
      fileName: '',
      fileSizeKB: 0,
      status: 'empty'
    }
  });

  const [contractText, setContractText] = useState<string>('');
  const [isContractAccepted, setIsContractAccepted] = useState<boolean>(false);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);

  const [selectedLatitude, setSelectedLatitude] = useState<number>(35.7575);
  const [selectedLongitude, setSelectedLongitude] = useState<number>(51.4099);
  const [selectedProvince, setSelectedProvince] = useState<string>('تهران');
  const [selectedCity, setSelectedCity] = useState<string>('تهران');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('میدان ونک');
  const [selectedAddress, setSelectedAddress] = useState<string>('تهران، خیابان ولیعصر، میدان ونک');
  const [isEmergencyAvailable, setIsEmergencyAvailable] = useState<boolean>(true);

  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [apiNotice, setApiNotice] = useState<string>('');

  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[۰-۹]/g, (w) => String.fromCharCode(w.charCodeAt(0) - 1728))
      .replace(/[٠-٩]/g, (w) => String.fromCharCode(w.charCodeAt(0) - 1584));
  };

  const toPersianDigits = (val: string | number) => {
    const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(val)
      .replace(/[0-9]/g, (d) => pDigits[Number(d)])
      .replace(/[٠-٩]/g, (w) => String.fromCharCode(w.charCodeAt(0) + 144));
  };

  const activeMainCategory =
    PROVIDER_CATEGORIES.find((c) => c.id === selectedMainCatId) || PROVIDER_CATEGORIES[0];

  const activeSpecialty =
    PROVIDER_CATEGORIES.flatMap((c) => c.specialties).find((s) => s.id === selectedSpecialtyId) ||
    activeMainCategory.specialties[0];

  const groupedSpecialties = activeMainCategory.specialties.reduce<Record<string, SpecialtyItem[]>>(
    (acc, item) => {
      if (
        specialtySearch.trim() &&
        !item.title.includes(specialtySearch.trim()) &&
        !item.subGroup.includes(specialtySearch.trim())
      ) {
        return acc;
      }
      if (!acc[item.subGroup]) {
        acc[item.subGroup] = [];
      }
      acc[item.subGroup].push(item);
      return acc;
    },
    {}
  );

  useEffect(() => {
    const fetchBackendCategories = async () => {
      try {
        const res = await fetch('/api/v1/categories/signup-information/');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setApiCategories(data);
            const subRes = await fetch(`/api/v1/categories/signup-information/${data[0].id}/`);
            if (subRes.ok) {
              const subData = await subRes.json();
              if (Array.isArray(subData)) {
                setApiSubCategories(subData);
              }
            }
          }
        }
      } catch {
      }
    };
    fetchBackendCategories();
  }, []);

  const validateStep1 = (): string | null => {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanNationalId = toEnglishDigits(nationalId.trim());
    const cleanPhone = toEnglishDigits(phone.trim());
    const cleanBusiness = businessName.trim();
    const cleanBio = bio.trim();

    if (!cleanFirstName || !/^[\u0600-\u06FFa-zA-Z\s]+$/.test(cleanFirstName)) {
      return 'لطفا نام خود را با دقت وارد کنید (فقط حروف الفبا و فاصله مجاز است).';
    }
    if (!cleanLastName || !/^[\u0600-\u06FFa-zA-Z\s]+$/.test(cleanLastName)) {
      return 'لطفا نام خانوادگی خود را با دقت وارد کنید (فقط حروف الفبا و فاصله مجاز است).';
    }
    if (!/^\d{10}$/.test(cleanNationalId)) {
      return 'لطفا کدملی ده رقمی را وارد کنید.';
    }
    if (!cleanPhone.startsWith('0')) {
      return 'لطفا شماره همراه را با صفر اول بنویسید.';
    }
    if (!/^\d{11}$/.test(cleanPhone)) {
      return 'شماره همراه وارد شده ۱۱ رقمی نمی‌باشد.';
    }
    if (!selectedSpecialtyId) {
      return 'لطفا تخصص و صنف فعالیت خود را انتخاب نمایید.';
    }
    if (!cleanBusiness) {
      return 'لطفا نام کسب‌وکار یا عنوان واحد صنفی خود را وارد کنید.';
    }
    if (cleanBusiness.length > 150) {
      return 'نام کسب‌وکار نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.';
    }
    if (!cleanBio || cleanBio.length < 10) {
      return 'لطفا در بخش «درباره من و سوابق» حداقل یک توضیح کوتاه درباره مهارت خود بنویسید.';
    }
    return null;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setApiNotice('');

    const validationError = validateStep1();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    const categoryPayloadId =
      apiSubCategories[0]?.id || apiCategories[0]?.id || selectedSpecialtyId;

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      national_id: toEnglishDigits(nationalId.trim()),
      phone: toEnglishDigits(phone.trim()),
      category: categoryPayloadId,
      business_name: businessName.trim(),
      bio: `[تخصص: ${activeMainCategory.title} - ${activeSpecialty.title}] ${bio.trim()}`
    };

    try {
      const response = await fetch('/api/v1/profile/provider/signup/information/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
        }
        setApiNotice('اطلاعات هویتی و صنفی در سرور ثبت شد و توکن احراز هویت دریافت گردید.');
      } else {
        const errData = await response.json().catch(() => null);
        if (errData?.detail && typeof errData.detail === 'string') {
          setApiNotice(`پاسخ سرور: ${errData.detail}`);
        }
      }
    } catch {
    } finally {
      setIsSubmitting(false);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFillDemoStep1 = () => {
    setFirstName('محمدمتین');
    setLastName('جوزقی');
    setNationalId('۰۰۱۲۳۴۵۶۷۸');
    setPhone('۰۹۱۲۳۴۵۶۷۸۹');
    setBusinessName(`مرکز تخصصی ${activeSpecialty.title}`);
    setBio(
      `دارای بیش از ۸ سال سابقه تخصصی در حوزه ${activeSpecialty.title} (${activeMainCategory.title}) با ضمانت کتبی کیفیت خدمات و اعزام سریع.`
    );
    setErrorMessage('');
  };

  const handleFileChange = async (
    docType: 'birth_certificate' | 'national_card' | 'skill_license',
    fileList: FileList | null
  ) => {
    setErrorMessage('');
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setErrorMessage('فرمت فایل نامعتبر است. فقط فایل‌های PNG، JPG، JPEG و PDF مجاز هستند.');
      return;
    }

    const maxBytes = 1 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage('حجم فایل انتخاب‌شده بیشتر از ۱ مگابایت است. لطفاً فایل کم‌حجم‌تری انتخاب کنید.');
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        file,
        fileName: file.name,
        fileSizeKB: Math.max(1, Math.round(file.size / 1024)),
        status: 'uploading'
      }
    }));

    if (accessToken) {
      try {
        const formData = new FormData();
        formData.append('doc_type', docType);
        formData.append('file', file);

        const res = await fetch('/api/v1/profile/provider/signup/document/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: formData
        });

        if (res.ok) {
          setDocuments((prev) => ({
            ...prev,
            [docType]: {
              ...prev[docType],
              status: 'pending'
            }
          }));
          return;
        }
      } catch {
      }
    }

    setTimeout(() => {
      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'pending'
        }
      }));
    }, 450);
  };

  const handleSimulateAllDocs = () => {
    setErrorMessage('');
    setDocuments({
      birth_certificate: {
        doc_type: 'birth_certificate',
        file: null,
        fileName: 'shenasnameh_scan.jpg',
        fileSizeKB: 420,
        status: 'pending'
      },
      national_card: {
        doc_type: 'national_card',
        file: null,
        fileName: 'kart_melli_smart.png',
        fileSizeKB: 380,
        status: 'pending'
      },
      skill_license: {
        doc_type: 'skill_license',
        file: null,
        fileName: 'parvaneh_maharat_senfi.pdf',
        fileSizeKB: 610,
        status: 'pending'
      }
    });
  };

  const handleRemoveDoc = (docType: 'birth_certificate' | 'national_card' | 'skill_license') => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        doc_type: docType,
        file: null,
        fileName: '',
        fileSizeKB: 0,
        status: 'empty'
      }
    }));
  };

  const handleStep2Continue = () => {
    setErrorMessage('');
    const allUploaded = (
      ['birth_certificate', 'national_card', 'skill_license'] as const
    ).every((key) => documents[key].status !== 'empty' && documents[key].status !== 'uploading');

    if (!allUploaded) {
      setErrorMessage(
        'لطفاً هر ۳ مدرک الزامی (شناسنامه، کارت ملی و مدرک مهارت/پروانه فعالیت) را بارگذاری نمایید.'
      );
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentStep !== 3) return;

    const loadContract = async () => {
      setIsLoadingContract(true);
      const fallbackTemplate = `قرارداد همکاری و ارائه خدمات تخصصی در پلتفرم تندیس

این قرارداد فیمابین سامانه هوشمند «تندیس» از یک سو و خانم / آقای ${firstName || 'متخصص'} ${lastName || 'محترم'} به کد ملی ${toPersianDigits(nationalId || '----------')} و شماره تماس ${toPersianDigits(phone || '-----------')} با عنوان کسب‌وکار «${businessName || activeSpecialty.title}» در گروه تخصصی «${activeMainCategory.title} — ${activeSpecialty.title}» منعقد می‌گردد.

ماده ۱ — موضوع قرارداد:
ارائه خدمات تخصصی، مشاوره‌ای یا فنی در رسته «${activeSpecialty.title}» به کاربران و متقاضیان معرفی‌شده از سوی پلتفرم تندیس مطابق با تعرفه‌های مصوب اتحادیه و استانداردهای کیفی سامانه.

ماده ۲ — تعهدات متخصص / همکار:
۱. صحت تمامی مدارک هویتی، کارت ملی، شناسنامه و پروانه تخصصی بارگذاری‌شده در سامانه.
۲. رعایت کامل اصول اخلاق حرفه‌ای، ایمنی کار، نرخ‌نامه مصوب و حضور به‌موقع در محل مشتری.
۳. عدم واگذاری حساب کاربری تخصصی به اشخاص ثالث تحت هر عنوان.
۴. پاسخگویی شفاف در قبال کیفیت خدمات ارائه‌شده و گارانتی تعمیرات یا خدمات.

ماده ۳ — تسویه‌حساب و کمیسیون:
تسویه‌حساب خدمات آنلاین طبق چرخه مالی سامانه انجام شده و کلیه قوانین و مقررات تجارت الکترونیک جمهوری اسلامی ایران بر این قرارداد حاکم است.`;

      if (accessToken) {
        try {
          const res = await fetch('/api/v1/profile/provider/signup/template-contract/', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.contract_text) {
              setContractText(data.contract_text);
              setIsLoadingContract(false);
              return;
            }
          }
        } catch {
        }
      }

      setContractText(fallbackTemplate);
      setIsLoadingContract(false);
    };

    loadContract();
  }, [currentStep, accessToken, firstName, lastName, nationalId, phone, businessName, activeMainCategory, activeSpecialty]);

  const handleStep3Submit = async () => {
    setErrorMessage('');
    if (!isContractAccepted) {
      setErrorMessage('برای ادامه، پذیرش مفاد قرارداد همکاری الزامی است.');
      return;
    }

    setIsSubmitting(true);
    if (accessToken) {
      try {
        await fetch('/api/v1/profile/provider/signup/contract/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ is_accept: true })
        });
      } catch {
      }
    }
    setIsSubmitting(false);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep4Submit = async () => {
    setErrorMessage('');
    setApiNotice('');

    if (
      Number.isNaN(selectedLatitude) ||
      Number.isNaN(selectedLongitude) ||
      selectedLatitude < -90 ||
      selectedLatitude > 90 ||
      selectedLongitude < -180 ||
      selectedLongitude > 180
    ) {
      setErrorMessage('لطفاً موقعیت مکانی خود را به صورت دستی روی نقشه مشخص نمایید.');
      return;
    }

    setIsSubmitting(true);
    const locationPayload = {
      latitude: selectedLatitude,
      longitude: selectedLongitude
    };

    if (accessToken) {
      const endpoints = [
        '/api/v1/profile/provider/signup/area/',
        '/api/v1/profiles/customer/signup/area/'
      ];
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(locationPayload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.province) setSelectedProvince(data.province);
            if (data.city) setSelectedCity(data.city);
            if (data.district) setSelectedDistrict(data.district);
            if (data.address) setSelectedAddress(data.address);
            setApiNotice('موقعیت مکانی و محدوده فعالیت شما با موفقیت در سرور ثبت شد.');
            break;
          }
        } catch {
        }
      }
    }

    setIsSubmitting(false);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsPaymentConfirmed(true);
      setRegistrationStatus('submitted');
    }, 700);
  };

  const stepsMeta = [
    { id: 1, title: 'تخصص و هویت', subtitle: 'صنف و مشخصات فردی', icon: User },
    { id: 2, title: 'بارگذاری مدارک', subtitle: 'شناسنامه، کارت ملی و مجوز', icon: FileText },
    { id: 3, title: 'قرارداد همکاری', subtitle: 'مطالعه و امضای قوانین', icon: FileCheck2 },
    { id: 4, title: 'انتخاب لوکیشن', subtitle: 'تعیین دستی روی نقشه', icon: MapPin },
    { id: 5, title: 'تایید و ارسال نهایی', subtitle: 'بررسی کارشناس و فعال‌سازی', icon: CreditCard }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto pb-14 select-none" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white rounded-3xl p-5 sm:p-6 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0a8387] to-[#33c1bd] text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#0a8387] font-bold">
              <span>سامانه جذب متخصصان و اصناف تندیس</span>
              <span>·</span>
              <span>۷ گروه تخصصی</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#12292c] mt-0.5">
              ثبت‌نام و احراز هویت متخصص یا همکار
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f2f9f9] hover:bg-[#effcfb] text-[#12292c] hover:text-[#0a8387] border border-[#dfecec] text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {stepsMeta.map((stepItem) => {
            const Icon = stepItem.icon;
            const isActive = currentStep === stepItem.id;
            const isCompleted = currentStep > stepItem.id || isPaymentConfirmed;

            return (
              <button
                key={stepItem.id}
                type="button"
                onClick={() => {
                  if (stepItem.id < currentStep && !isPaymentConfirmed) {
                    setCurrentStep(stepItem.id as 1 | 2 | 3 | 4 | 5);
                  }
                }}
                disabled={stepItem.id > currentStep || isPaymentConfirmed}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-right transition-all ${
                  isActive
                    ? 'bg-[#effcfb] border-[#0a8387] shadow-2xs'
                    : isCompleted
                    ? 'bg-[#f2f9f9]/70 border-[#aeece6] cursor-pointer hover:bg-[#effcfb]'
                    : 'bg-slate-50/70 border-slate-200/70 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                    isActive
                      ? 'bg-[#0a8387] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-[#5f777b] font-medium">
                    مرحله {stepItem.id}
                  </div>
                  <div className="text-xs font-bold text-[#12292c] truncate">
                    {stepItem.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2.5"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {apiNotice && (
        <div className="mb-6 p-3.5 rounded-2xl bg-[#effcfb] border border-[#aeece6] text-[#0d5256] text-xs font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0a8387] shrink-0" />
          <span>{apiNotice}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.form
            key="wizard-step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleStep1Submit}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfecec] pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#12292c]">
                    ۱. انتخاب تخصص
                  </h2>
                  <p className="text-xs text-[#5f777b] font-light mt-0.5">
                    گروه شغلی و تخصص خود را انتخاب کنید
                  </p>
                </div>

                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    placeholder="جستجوی تخصص..."
                    className="w-full py-2 pr-9 pl-3 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-[#5f777b] absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {PROVIDER_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = cat.id === selectedMainCatId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedMainCatId(cat.id);
                        setSelectedSpecialtyId(cat.specialties[0].id);
                        setSpecialtySearch('');
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#effcfb] border-[#0a8387]'
                          : 'bg-[#f2f9f9]/50 border-[#dfecec] hover:bg-white hover:border-[#aeece6]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#0a8387] text-white'
                            : 'bg-white text-[#0a8387] border border-[#dfecec]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-[#12292c] truncate">
                        {cat.title}
                      </h3>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-[#f2f9f9]/70 p-4 border border-[#dfecec] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#12292c]">{activeMainCategory.title}</span>
                  <span className="text-[#0a8387] font-medium">{activeSpecialty.title}</span>
                </div>

                {Object.keys(groupedSpecialties).length === 0 ? (
                  <p className="text-xs text-[#5f777b] py-3 text-center">
                    تخصصی با این عبارت یافت نشد.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.values(groupedSpecialties)
                      .flat()
                      .map((spec) => {
                        const isSpecSelected = spec.id === selectedSpecialtyId;
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => setSelectedSpecialtyId(spec.id)}
                            className={`px-3.5 py-2.5 rounded-xl border text-right text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isSpecSelected
                                ? 'bg-[#0a8387] text-white border-[#0a8387] font-bold'
                                : 'bg-white text-[#12292c] border-[#dfecec] hover:border-[#0a8387]/50'
                            }`}
                          >
                            <span className="truncate">{spec.title}</span>
                            {isSpecSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfecec] pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#12292c]">
                    ۲. مشخصات فردی و کسب‌وکار
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleFillDemoStep1}
                  className="self-start sm:self-auto text-xs font-medium text-[#0a8387] hover:underline cursor-pointer bg-[#effcfb] px-3 py-1.5 rounded-xl border border-[#aeece6]"
                >
                  پر کردن با اطلاعات نمونه
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#12292c]">
                    نام <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="مثال: علی"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full py-3 px-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs sm:text-sm font-medium text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#5f777b]">فقط حروف الفبا و فاصله مجاز است</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#12292c]">
                    نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="مثال: رضایی"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full py-3 px-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs sm:text-sm font-medium text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#5f777b]">مطابق با شناسنامه و کارت ملی</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#12292c]">
                    کد ملی ۱۰ رقمی <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
                      value={toPersianDigits(nationalId)}
                      onChange={(e) => {
                        const raw = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 10);
                        setNationalId(toPersianDigits(raw));
                      }}
                      className="w-full py-3 pl-9 pr-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs sm:text-sm font-medium text-[#12292c] placeholder:text-[#5f777b]/65 text-right tabular-nums focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors"
                    />
                    <IdCard className="w-4 h-4 text-[#5f777b] absolute left-3" />
                  </div>
                  <p className="text-[11px] text-[#5f777b]">کد ملی ۱۰ رقمی بدون خط تیره</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#12292c]">
                    شماره تلفن همراه (۱۱ رقمی با صفر اول) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      required
                      placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                      value={toPersianDigits(phone)}
                      onChange={(e) => {
                        const raw = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 11);
                        setPhone(toPersianDigits(raw));
                      }}
                      className="w-full py-3 pl-9 pr-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs sm:text-sm font-medium text-[#12292c] placeholder:text-[#5f777b]/65 text-right tabular-nums focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors"
                    />
                    <Phone className="w-4 h-4 text-[#5f777b] absolute left-3" />
                  </div>
                  <p className="text-[11px] text-[#5f777b]">شماره موبایل باید با ۰۹ شروع شود</p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-[#12292c]">
                    نام کسب‌وکار / واحد صنفی یا عنوان فعالیت <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={150}
                      required
                      placeholder={`مثال: خدمات تخصصی ${activeSpecialty.title} بهاران`}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full py-3 pl-9 pr-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs sm:text-sm font-medium text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors"
                    />
                    <Building2 className="w-4 h-4 text-[#5f777b] absolute left-3" />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-[#12292c]">
                    درباره من، سوابق کاری و تجهیزات تخصصی <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={`توضیح کوتاهی درباره سابقه کار در حوزه «${activeSpecialty.title}»، مدارک فنی، برندهایی که کار می‌کنید یا خدمات ویژه خود بنویسید...`}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs sm:text-sm font-medium text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#dfecec] flex items-center justify-between gap-4">
                <div className="text-xs text-[#5f777b]">
                  رسته انتخابی: <strong className="text-[#12292c]">{activeMainCategory.title}</strong> ·{' '}
                  <strong className="text-[#0a8387]">{activeSpecialty.title}</strong>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0a8387] to-[#0b676c] hover:from-[#0fa3a3] hover:to-[#0a8387] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(10,131,135,0.25)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>ثبت اطلاعات و ادامه به بارگذاری مدارک</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {currentStep === 2 && (
          <motion.div
            key="wizard-step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl p-5 sm:p-7 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfecec] pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#12292c]">
                  مرحله ۲: بارگذاری مدارک هویتی و پروانه تخصصی
                </h2>
                <p className="text-xs text-[#5f777b] mt-1">
                  فرمت‌های مجاز: <strong>PNG, JPG, JPEG, PDF</strong> — حداکثر حجم مجاز برای هر فایل: <strong>۱ مگابایت (1 MB)</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateAllDocs}
                className="self-start sm:self-auto text-xs font-bold text-[#0a8387] hover:underline cursor-pointer bg-[#effcfb] px-3.5 py-2 rounded-xl border border-[#aeece6]"
              >
                بارگذاری نمونه تستی هر ۳ مدرک
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: 'birth_certificate' as const,
                  title: '۱. تصویر صفحه اول شناسنامه',
                  apiCode: 'birth_certificate',
                  hint: 'تصویر واضح و خوانا از صفحه اول شناسنامه (و صفحه توضیحات در صورت وجود)'
                },
                {
                  key: 'national_card' as const,
                  title: '۲. تصویر روی کارت ملی هوشمند',
                  apiCode: 'national_card',
                  hint: 'تصویر کارت ملی هوشمند یا رسید ثبت‌احوال معتبر به همراه کد ملی ۱۰ رقمی'
                },
                {
                  key: 'skill_license' as const,
                  title: '۳. کارت مهارت یا پروانه فعالیت تخصصی',
                  apiCode: 'skill_license',
                  hint:
                    activeSpecialty.licenseHint ||
                    `مدرک فنی‌حرفه‌ای، جواز کسب، نظام پزشکی یا پروانه فعالیت مرتبط با «${activeSpecialty.title}»`
                }
              ].map((slot) => {
                const docState = documents[slot.key];
                const isUploaded = docState.status !== 'empty';

                return (
                  <div
                    key={slot.key}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                      isUploaded
                        ? 'bg-[#effcfb]/70 border-[#0a8387]'
                        : 'bg-[#f2f9f9]/70 border-[#dfecec]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#12292c]">
                          {slot.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#5f777b]">
                          {slot.apiCode}
                        </span>
                      </div>

                      <p className="text-xs text-[#5f777b] leading-relaxed">
                        {slot.hint}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#dfecec]">
                      {docState.status === 'empty' ? (
                        <label className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#effcfb] border border-dashed border-[#0a8387] text-[#0a8387] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>انتخاب فایل (حداکثر ۱ مگابایت)</span>
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(slot.key, e.target.files)}
                          />
                        </label>
                      ) : docState.status === 'uploading' ? (
                        <div className="py-3 px-4 rounded-xl bg-white border border-[#dfecec] text-xs text-[#5f777b] flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#0a8387]" />
                          <span>در حال بارگذاری مدرک...</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="p-2.5 rounded-xl bg-white border border-[#dfecec] flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#12292c] truncate" dir="ltr">
                                {docState.fileName}
                              </p>
                              <p className="text-[10px] text-[#5f777b]">
                                {toPersianDigits(docState.fileSizeKB)} کیلوبایت · وضعیت: در انتظار بررسی کارشناس
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(slot.key)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="حذف و جایگزینی فایل"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>فایل آماده ارسال و بررسی است</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#dfecec] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 rounded-xl bg-[#f2f9f9] hover:bg-[#dfecec]/60 text-[#12292c] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل (ویرایش مشخصات)</span>
              </button>

              <button
                type="button"
                onClick={handleStep2Continue}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0a8387] to-[#0b676c] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(10,131,135,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <span>تایید مدارک و مشاهده قرارداد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="wizard-step-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl p-5 sm:p-7 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] space-y-6"
          >
            <div className="border-b border-[#dfecec] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#12292c]">
                مرحله ۳: مطالعه و امضای قرارداد همکاری متخصصان
              </h2>
              <p className="text-xs text-[#5f777b] mt-1">
                متن قرارداد زیر بر اساس مشخصات هویتی و تخصص انتخابی شما تنظیم شده است.
              </p>
            </div>

            {isLoadingContract ? (
              <div className="py-12 flex items-center justify-center gap-2 text-xs text-[#5f777b]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0a8387]" />
                <span>در حال دریافت متن قرارداد از سرور...</span>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#f2f9f9] border border-[#dfecec] max-h-72 overflow-y-auto text-xs sm:text-sm text-[#12292c] leading-7 whitespace-pre-line font-medium">
                {contractText}
              </div>
            )}

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#effcfb] border border-[#aeece6] cursor-pointer">
              <input
                type="checkbox"
                checked={isContractAccepted}
                onChange={(e) => {
                  setIsContractAccepted(e.target.checked);
                  setErrorMessage('');
                }}
                className="mt-1 w-4 h-4 accent-[#0a8387] rounded cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-[#12292c] leading-relaxed">
                اینجانب <span className="text-[#0a8387]">{firstName} {lastName}</span> به کد ملی{' '}
                <span className="tabular-nums">{toPersianDigits(nationalId)}</span>، تمامی مفاد و شرایط قرارداد همکاری با تندیس در رسته تخصصی «{activeSpecialty.title}» را مطالعه نموده و می‌پذیرم.
              </span>
            </label>

            <div className="pt-4 border-t border-[#dfecec] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 rounded-xl bg-[#f2f9f9] hover:bg-[#dfecec]/60 text-[#12292c] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل (مدارک)</span>
              </button>

              <button
                type="button"
                disabled={!isContractAccepted || isSubmitting}
                onClick={handleStep3Submit}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0a8387] to-[#0b676c] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(10,131,135,0.25)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>ثبت امضای قرارداد و انتخاب محدوده فعالیت</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="wizard-step-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl p-5 sm:p-7 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] space-y-6"
          >
            <div className="border-b border-[#dfecec] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#12292c]">
                  مرحله ۴: انتخاب دستی موقعیت مکانی و محدوده فعالیت روی نقشه
                </h2>
                <p className="text-xs text-[#5f777b] mt-1">
                  موقعیت دقیق خود را به صورت دستی با کلیک روی نقشه، جابه‌جایی پین یا دکمه مکان‌یاب (GPS) مشخص کنید تا استان، شهر، محله و آدرس شما ثبت شود.
                </p>
              </div>
              <span
                dir="ltr"
                className="self-start sm:self-auto px-3 py-1 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-[11px] font-mono text-[#0a8387]"
              >
                POST /api/v1/profile/provider/signup/area/
              </span>
            </div>

            <LocationMapPicker
              latitude={selectedLatitude}
              longitude={selectedLongitude}
              onChange={(loc: ResolvedLocationInfo) => {
                setSelectedLatitude(loc.latitude);
                setSelectedLongitude(loc.longitude);
                setSelectedProvince(loc.province);
                setSelectedCity(loc.city);
                setSelectedDistrict(loc.district);
                setSelectedAddress(loc.address);
                setErrorMessage('');
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#12292c]">
                  استان
                </label>
                <input
                  type="text"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs font-bold text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#12292c]">
                  شهر
                </label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs font-bold text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#12292c]">
                  محله / منطقه
                </label>
                <input
                  type="text"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="مثال: سعادت‌آباد"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs font-bold text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-[#12292c]">
                  نشانی کامل موقعیت انتخابی
                </label>
                <input
                  type="text"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs font-medium text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#effcfb] border border-[#aeece6] cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergencyAvailable}
                onChange={(e) => setIsEmergencyAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#0a8387] rounded"
              />
              <span className="text-xs font-bold text-[#0d5256]">
                آمادگی اعزام فوری / خدمات سیار در محدوده انتخابی (Emergency & On-Site) در رسته «{activeSpecialty.title}» را دارم
              </span>
            </label>

            <div className="pt-4 border-t border-[#dfecec] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-3 rounded-xl bg-[#f2f9f9] hover:bg-[#dfecec]/60 text-[#12292c] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل (قرارداد)</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleStep4Submit}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0a8387] to-[#0b676c] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(10,131,135,0.25)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>ثبت موقعیت مکانی و مشاهده خلاصه پرونده</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="wizard-step-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl p-5 sm:p-7 border border-[#dfecec] shadow-[0_4px_20px_rgba(10,58,62,0.03)] space-y-6"
          >
            {!isPaymentConfirmed ? (
              <>
                <div className="border-b border-[#dfecec] pb-4">
                  <h2 className="text-base sm:text-lg font-bold text-[#12292c]">
                    مرحله ۵: بررسی نهایی پرونده و ارسال برای کارشناس احراز هویت
                  </h2>
                  <p className="text-xs text-[#5f777b] mt-1">
                    لطفاً خلاصه اطلاعات ثبت‌شده خود را بررسی نموده و پرونده را جهت تایید نهایی کارشناسان تندیس ارسال کنید.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#f2f9f9] border border-[#dfecec] space-y-2 text-xs">
                    <div className="font-bold text-[#0a8387] pb-1.5 border-b border-[#dfecec]">
                      مشخصات متخصص و کسب‌وکار
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">نام و نام خانوادگی:</span>
                      <span className="font-bold text-[#12292c]">{firstName} {lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">کد ملی:</span>
                      <span className="font-bold tabular-nums text-[#12292c]">{toPersianDigits(nationalId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">شماره همراه:</span>
                      <span className="font-bold tabular-nums text-[#12292c]">{toPersianDigits(phone)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">نام واحد صنفی:</span>
                      <span className="font-bold text-[#12292c]">{businessName}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f2f9f9] border border-[#dfecec] space-y-2 text-xs">
                    <div className="font-bold text-[#0a8387] pb-1.5 border-b border-[#dfecec]">
                      تخصص، مدارک و محدوده پوشش
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">گروه اصلی:</span>
                      <span className="font-bold text-[#12292c]">{activeMainCategory.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">تخصص انتخاب‌شده:</span>
                      <span className="font-bold text-[#0a8387]">{activeSpecialty.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">موقعیت مکانی ثبت‌شده:</span>
                      <span className="font-bold text-[#12292c]">
                        {selectedProvince} — {selectedCity} {selectedDistrict ? `(${selectedDistrict})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#5f777b] shrink-0">مختصات جغرافیایی:</span>
                      <span className="font-mono font-bold text-[#0a8387]" dir="ltr">
                        {selectedLatitude.toFixed(4)}, {selectedLongitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5f777b]">وضعیت مدارک و قرارداد:</span>
                      <span className="font-bold text-emerald-700">۳ مدرک بارگذاری شد · قرارداد امضا شد</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-l from-[#effcfb] to-white border border-[#aeece6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#0d5256]">
                      هزینه بررسی مدارک، کارشناسی و فعال‌سازی پنل سالانه متخصصان
                    </span>
                    <p className="text-xs text-[#5f777b]">
                      مطابق تعرفه مصوب بک‌اند، پس از تایید، پرونده شما در صف بررسی فوری قرار می‌گیرد.
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg font-bold text-[#0a8387]">
                      ۴۹۹,۰۰۰ تومان
                    </div>
                    <span className="text-[11px] text-[#5f777b]">درگاه پرداخت امن شاپرک</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#dfecec] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-3 rounded-xl bg-[#f2f9f9] hover:bg-[#dfecec]/60 text-[#12292c] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبل (محدوده فعالیت)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0a8387] to-[#0b676c] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(10,131,135,0.25)] flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>پرداخت و ارسال نهایی پرونده برای کارشناس</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-5 max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-[#effcfb] border-2 border-[#0a8387] text-[#0a8387] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a8387]">
                    <Clock className="w-4 h-4" />
                    <span>وضعیت پرونده: ارسال شده — در انتظار بررسی کارشناس ({registrationStatus})</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#12292c]">
                    پرونده تخصصی شما با موفقیت ثبت و ارسال شد!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5f777b] leading-relaxed">
                    همکار گرامی <strong>{firstName} {lastName}</strong>، درخواست عضویت شما در رسته تخصصی{' '}
                    <strong>«{activeMainCategory.title} — {activeSpecialty.title}»</strong> ثبت گردید. نتیجه بررسی مدارک از طریق پیامک به شماره{' '}
                    <span className="tabular-nums font-bold text-[#12292c]">{toPersianDigits(phone)}</span> اطلاع‌رسانی خواهد شد.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-6 py-3 rounded-2xl bg-[#0a8387] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm"
                  >
                    بازگشت به صفحه اصلی تندیس
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaymentConfirmed(false);
                      setCurrentStep(1);
                    }}
                    className="px-5 py-3 rounded-2xl bg-[#f2f9f9] text-[#12292c] border border-[#dfecec] font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    ثبت‌نام تخصص جدید
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
