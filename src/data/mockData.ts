export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
  countBadge?: string;
}

export interface Listing {
  id: string;
  title: string;
  category: 'auto' | 'real_estate' | 'digital' | 'home' | 'jobs' | 'legal' | 'services' | 'industrial' | 'other';
  price: string;
  priceLabel?: string;
  location: string;
  timeAgo: string;
  image: string;
  badge?: {
    text: string;
    bgColor: string;
    textColor: string;
  };
  verified?: boolean;
  featured?: boolean;
  description: string;
  phone: string;
  specs?: { label: string; value: string }[];
}

export interface HeroSlide {
  id: number;
  tag: string;
  tagIcon: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  bgGradient: string;
  bgIcon: string;
  image: string;
}

export const CITIES = [
  'تهران و حومه',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
  'قم',
  'کرمانشاه',
  'رشت',
  'ارومیه',
  'ساری'
];

export const SEARCH_TRENDS = [
  'تعمیر کولر',
  'مکانیک سیار',
  'مبل‌شویی',
  'زیبایی',
  'وکیل'
];

export const CATEGORIES: Category[] = [
  {
    id: 'services',
    name: 'فنی و لوازم خانگی',
    description: 'تعمیر کولر، یخچال، لباسشویی، ظرفشویی، تلویزیون، لوله‌کشی و برق‌کاری',
    icon: 'build',
    bgColor: 'bg-[#effcfb]',
    textColor: 'text-[#0a8387]'
  },
  {
    id: 'auto',
    name: 'امداد و خدمات خودرو',
    description: 'مکانیک سیار، برق‌کار خودرو، یدک‌کش، جرثقیل و خودروبر',
    icon: 'directions_car',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
  {
    id: 'home',
    name: 'نظافت، شستشو و باربری',
    description: 'نظافت منزل، قالیشویی، مبل‌شویی و اتوبار',
    icon: 'cleaning_services',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700'
  },
  {
    id: 'events',
    name: 'پزشکی و پرستاری',
    description: 'ویزیت پزشک در منزل/مطب، پرستاری، تزریقات و مراقبت',
    icon: 'medical_services',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  {
    id: 'legal',
    name: 'حقوقی و اداری',
    description: 'وکیل پایه‌یک، مشاوره حقوقی، تنظیم قرارداد و عریضه‌نویسی',
    icon: 'balance',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 'apparel',
    name: 'زیبایی و سلامت',
    description: 'خدمات زیبایی بانوان، اصلاح، کراتین مو، ناخن و مراقبت پوست',
    icon: 'content_cut',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  {
    id: 'industrial',
    name: 'صنعتی، دیجیتال و کسب‌وکار',
    description: 'برق و موتور صنعتی، طراحی سایت، سئو و دکوراسیون چوب',
    icon: 'precision_manufacturing',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  }
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'خدمات تخصصی در محل تندیس',
    tagIcon: 'verified',
    title: 'اعزام فوری متخصصان تاییدشده به سراسر ایران',
    description: 'بیش از ۳۰ خدمت تخصصی فنی، لوازم خانگی، نظافت و امداد خودرو با فاکتور رسمی شفاف و ضمانت کیفیت تندیس.',
    primaryAction: 'درخواست خدمت',
    secondaryAction: 'ثبت‌نام همکار متخصص',
    bgGradient: 'from-[#0d686d] via-[#0b5256] to-[#06383b]',
    bgIcon: 'build',
    image: '/src/assets/images/media-2.jpg'
  },
  {
    id: 2,
    tag: 'فروشگاه قطعات و تندیس‌پی',
    tagIcon: 'verified',
    title: 'خرید قطعات اصلی و تسهیلات اقساطی تندیس‌پی',
    description: 'تهیه قطعات یدکی اورجینال با ضمانت اصالت به‌همراه تسهیلات اعتباری تندیس‌پی تا ۳۰۰ میلیون تومان برای تمامی خدمات.',
    primaryAction: 'مشاهده تندیس‌پی',
    secondaryAction: 'فروشگاه قطعات اصلی',
    bgGradient: 'from-[#0d686d] via-[#0b5256] to-[#06383b]',
    bgIcon: 'directions_car',
    image: '/src/assets/images/media-1.jpg'
  },
  {
    id: 3,
    tag: 'خدمات تخصصی حقوقی و پزشکی',
    tagIcon: 'gavel',
    title: 'مشاوره با وکیل پایه‌یک و خدمات پزشکی در منزل',
    description: 'تنظیم قراردادهای رسمی، مشاوره حضوری یا غیرحضوری با وکلای معتبر و اعزام پزشک و پرستار مجرب به منزل شما.',
    primaryAction: 'مشاوره حقوقی و پزشکی',
    secondaryAction: 'دانلود اپلیکیشن تندیس',
    bgGradient: 'from-[#0d686d] via-[#0b5256] to-[#06383b]',
    bgIcon: 'balance',
    image: '/src/assets/images/media-3.jpg'
  }
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'ad-1',
    title: 'پژو ۲۰۷i اتوماتیک مدل ۱۴۰۲ بدون رنگ',
    category: 'auto',
    price: '۸۹۵,۰۰۰,۰۰۰ تومان',
    priceLabel: 'قیمت:',
    location: 'تهران، سعادت‌آباد',
    timeAgo: 'فوری',
    image: '/src/assets/images/media-4.jpg',
    badge: {
      text: 'کارشناسی شده',
      bgColor: 'bg-primary',
      textColor: 'text-on-primary'
    },
    verified: true,
    featured: true,
    description: 'پژو ۲۰۷i اتوماتیک MC مدل بهمن ۱۴۰۲، کارکرد ۲۲ هزار کیلومتر. کاملاً بدون رنگ و خط و خش، دارای برگه رسمی کارشناسی تندیس. بیمه شخص ثالث ۱۰ ماه، روکش چرم فابریک، لاستیک‌ها ۹۰٪.',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    specs: [
      { label: 'مدل', value: '۱۴۰۲' },
      { label: 'کارکرد', value: '۲۲,۰۰۰ کیلومتر' },
      { label: 'گیربکس', value: 'اتوماتیک ۶ سرعته' },
      { label: 'رنگ', value: 'سفید صدفی' }
    ]
  },
  {
    id: 'ad-2',
    title: 'آپارتمان ۱۲۰ متری نیاوران کلیدنخورده ۲ خواب',
    category: 'real_estate',
    price: '۲۱,۵۰۰,۰۰۰,۰۰۰ تومان',
    priceLabel: 'قیمت کل:',
    location: 'تهران، نیاوران',
    timeAgo: 'لحظاتی پیش',
    image: '/src/assets/images/media-5.jpg',
    badge: {
      text: 'فروش فوری',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    },
    verified: true,
    featured: true,
    description: 'آپارتمان نوساز کلیدنخورده در بهترین فرعی نیاوران. نورگیر عالی جنوبی، دو خواب کینگ سایز (یک مستر)، لابی مجلل مبله، ۲ پارکینگ سندی باکس، سند تک‌برگ آماده انتقال.',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    specs: [
      { label: 'متراژ', value: '۱۲۰ متر' },
      { label: 'تعداد خواب', value: '۲ خواب (۱ مستر)' },
      { label: 'طبقه', value: '۴ از ۶' },
      { label: 'پارکینگ', value: '۲ عدد سندی باکس' }
    ]
  },
  {
    id: 'ad-3',
    title: 'آیفون ۱۵ پرو مکس ۲۵۶ گیگ رنگ نچرال تیتانیوم',
    category: 'digital',
    price: '۷۸,۵۰۰,۰۰۰ تومان',
    priceLabel: 'قیمت:',
    location: 'تهران، پونک',
    timeAgo: '۲۰ دقیقه پیش',
    image: '/src/assets/images/media-6.jpg',
    badge: {
      text: 'ضمانت اصالت',
      bgColor: 'bg-emerald-600',
      textColor: 'text-white'
    },
    verified: true,
    featured: true,
    description: 'آیفون ۱۵ پرو مکس با حافظه ۲۵۶ گیگابایت، پارت‌نامبر ZAA دو سیم‌کارت، باتری ۱۰۰٪، بدون کوچک‌ترین خط و نقطه. دارای گارانتی ۱۸ ماهه شرکتی و کد رجیستری فعال در سامانه همتا.',
    phone: '۰۹۱۲۰۱۱۲۲۳۳',
    specs: [
      { label: 'حافظه', value: '۲۵۶ گیگابایت' },
      { label: 'سلامت باتری', value: '۱۰۰٪' },
      { label: 'رنگ', value: 'Natural Titanium' },
      { label: 'پارت نامبر', value: 'ZAA (دوسیم)' }
    ]
  },
  {
    id: 'ad-4',
    title: 'استخدام مدیر ارشد مارکتینگ و رشد (فول‌تایم)',
    category: 'jobs',
    price: 'توافقی + پاداش عملکردی',
    priceLabel: 'حقوق پیشنهادی:',
    location: 'تهران، ونک',
    timeAgo: '۱ ساعت پیش',
    image: '/src/assets/images/media-7.jpg',
    badge: {
      text: 'استخدام فوری',
      bgColor: 'bg-sky-600',
      textColor: 'text-white'
    },
    verified: true,
    featured: false,
    description: 'یک هلدینگ معتبر فناوری جهت توسعه محصولات سوپراپلیکیشن خود از افراد متخصص با حداقل ۵ سال سابقه مدیریت رشد و پرفورمنس مارکتینگ دعوت به همکاری می‌نماید. بیمه تکمیلی، ناهار، پاداش فصلی.',
    phone: '۰۲۱۸۸۰۰۹۹۰۰',
    specs: [
      { label: 'نوع همکاری', value: 'تمام‌وقت حضوری / هیبرید' },
      { label: 'سابقه کار', value: 'حداقل ۵ سال مرتبط' },
      { label: 'تحصیلات', value: 'کارشناسی ارشد مدیریت یا صنایع' },
      { label: 'مزایا', value: 'بیمه تکمیلی، وام، پاداش عملکرد' }
    ]
  },
  {
    id: 'ad-5',
    title: 'مشاوره حقوقی تخصصی قراردادهای تجاری و ملکی',
    category: 'legal',
    price: 'بر اساس تعرفه کانون',
    priceLabel: 'حق‌المشاوره:',
    location: 'تهران، جردن',
    timeAgo: 'امروز',
    image: '/src/assets/images/media-3.jpg',
    badge: {
      text: 'وکیل پایه یک',
      bgColor: 'bg-purple-700',
      textColor: 'text-white'
    },
    verified: true,
    featured: true,
    description: 'دفتر وکالت دکتر فرهمند، وکیل پایه یک دادگستری و مشاور رسمی دعاوی تجاری، بازرگانی، ملکی و داوری. بررسی تخصصی قراردادهای سرمایه‌گذاری و پیش‌فروش آپارتمان با ارائه گواهی استعلام حقوقی.',
    phone: '۰۲۱۲۲۰۰۱۱۰۰',
    specs: [
      { label: 'صلاحیت', value: 'وکیل پایه یک دادگستری' },
      { label: 'حوزه تخصصی', value: 'املاک، قراردادها و داوری' },
      { label: 'امکان مشاوره', value: 'حضوری و تلفنی' }
    ]
  },
  {
    id: 'ad-6',
    title: 'ست میز ناهارخوری ۸ نفره چوب راش گرجستان',
    category: 'home',
    price: '۳۲,۰۰۰,۰۰۰ تومان',
    priceLabel: 'قیمت:',
    location: 'تهران، دلاوران',
    timeAgo: '۳ ساعت پیش',
    image: '/src/assets/images/media-8.jpg',
    badge: {
      text: 'در حد نو',
      bgColor: 'bg-amber-600',
      textColor: 'text-white'
    },
    verified: false,
    featured: false,
    description: 'میز ناهارخوری ۸ نفره سفارشی‌ساز، ساخته شده از چوب راش گرجستان درجه یک. صفحه پلی‌استر ضدخش و آب، صندلی‌های ارگونومیک با پارچه ترک نانو ضدلک. مناسب جهیزیه، فروش به علت مهاجرت.',
    phone: '۰۹۳۵۴۴۴۳۳۲۲',
    specs: [
      { label: 'تعداد نفرات', value: '۸ نفره' },
      { label: 'جنس چوب', value: 'راش سوپر گرجستان' },
      { label: 'جنس پارچه', value: 'مخمل ترک ضدلک' },
      { label: 'وضعیت', value: 'در حد نو (کمتر از ۴ ماه کارکرد)' }
    ]
  },
  {
    id: 'ad-7',
    title: 'هیوندای سانتافه ۲۰۱۷ فول آپشن سفارش اروپا',
    category: 'auto',
    price: '۳,۷۵۰,۰۰۰,۰۰۰ تومان',
    priceLabel: 'قیمت:',
    location: 'تهران، شهرک غرب',
    timeAgo: '۵ ساعت پیش',
    image: '/src/assets/images/media-9.jpg',
    badge: {
      text: 'تخفیف ویژه',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    },
    verified: true,
    featured: true,
    description: 'سانتافه ۲۰۱۷ گرند فول کامل اروپا، ۴ رادار، اتوپارک، ۵ گرمکن ۲ سردکن، سقف پانوراما، درایو مد ۳ حالته، صندوق برقی با سنسور پا، ساب جلو و عقب اینفینیتی، کارکرد واقعی ۶۸ هزار به شرط دیاگ نمایندگی.',
    phone: '۰۹۱۲۷۷۷۸۸۹۹',
    specs: [
      { label: 'سال ساخت', value: '۲۰۱۷' },
      { label: 'کارکرد', value: '۶۸,۰۰۰ کیلومتر' },
      { label: 'رادارها', value: '۴ رادار فعال' },
      { label: 'آپشن‌ها', value: 'اتوپارک، صندوق برقی، اینفینیتی' }
    ]
  },
  {
    id: 'ad-8',
    title: 'تعمیرات تخصصی آیفون و سامسونگ با قطعات اورجینال',
    category: 'services',
    price: 'طبق نرخ اتحادیه',
    priceLabel: 'اجرت کار:',
    location: 'تهران، بازار موبایل ایران',
    timeAgo: 'فوری و در حضور مشتری',
    image: '/src/assets/images/media-6.jpg',
    badge: {
      text: 'ضمانت اصالت قطعه',
      bgColor: 'bg-tertiary',
      textColor: 'text-white'
    },
    verified: true,
    featured: false,
    description: 'تعویض ال‌سی‌دی، گلس فنی و باتری انواع مدل‌های آیفون و پرچمداران سامسونگ در کمتر از ۴۵ دقیقه در حضور مشتری. استفاده انحصاری از قطعات روکاری و اورجینال همراه با ۱۲۰ روز گارانتی کتبی تعویض.',
    phone: '۰۲۱۶۶۷۰۲۰۰۰',
    specs: [
      { label: 'ضمانت', value: '۱۲۰ روز گارانتی تعویض کتبی' },
      { label: 'مدت زمان', value: '۳۰ تا ۴۵ دقیقه در حضور مشتری' },
      { label: 'تجهیزات', value: 'کلین‌روم استاندارد ضد گرد و غبار' }
    ]
  }
];

export const CATEGORY_TABS = [
  { id: 'all', label: 'همه آگهی‌ها' },
  { id: 'auto', label: 'خودرو' },
  { id: 'real_estate', label: 'املاک' },
  { id: 'digital', label: 'موبایل و دیجیتال' },
  { id: 'jobs', label: 'استخدام' },
  { id: 'legal', label: 'خدمات و حقوقی' },
  { id: 'home', label: 'خانه و آشپزخانه' }
];
