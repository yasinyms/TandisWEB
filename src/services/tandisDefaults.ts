import type {
  BeautySpecialist,
  CategorySliderItem,
  OnlineStorePart,
  PromoSlide,
  ServiceCategoryGroup
} from '../types/tandis';
import { ALL_IRAN_CITIES } from './iranProvinces';

export const TANDIS_CITIES = ALL_IRAN_CITIES;

export const TRENDING_SEARCH_TAGS = [
  'مکانیک سیار',
  'تعمیر لباسشویی',
  'نظافت منزل',
  'کراتین مو',
  'وکیل پایه‌یک',
  'کولر گازی',
  'پزشک در منزل',
  'مبل‌شویی',
  'طراحی سایت'
];

export const DEFAULT_CATEGORIES: ServiceCategoryGroup[] = [
  {
    slug: 'cat-ride-request',
    title: 'درخواست خودرو و پیک',
    subtitle: 'سرویس سفر شهری، تشریفاتی و پیک فوری',
    isComingSoon: true,
    subcategories: [
      {
        id: 'ride-eco',
        title: 'خودرو اقتصادی تندیس',
        subtitle: 'سفر ایمن درون‌شهری با تعرفه شفاف',
        basePriceToman: 120000,
        etaText: '۸ دقیقه',
        readyProblems: ['سفر درون‌شهری فوری', 'رفت‌وآمد اداری', 'مسیر رفت و برگشت']
      },
      {
        id: 'ride-vip',
        title: 'خودرو تشریفاتی ویژه',
        subtitle: 'خودروهای مدل بالا برای تشریفات و فرودگاه',
        basePriceToman: 350000,
        etaText: '۱۲ دقیقه',
        readyProblems: ['ترانسفر فرودگاهی', 'مراسم و تشریفات رسمی', 'در اختیار ساعتی']
      },
      {
        id: 'ride-bike-courier',
        title: 'پیک موتوری فوری',
        subtitle: 'ارسال سریع بسته، مدارک و مرسولات شهری',
        basePriceToman: 95000,
        etaText: '۱۰ دقیقه',
        readyProblems: ['ارسال فوری بسته', 'تحویل مدارک اداری', 'ارسال چندمقصدی']
      }
    ]
  },
  {
    slug: 'cat-technical-repairs',
    title: 'فنی و تعمیرات لوازم خانگی',
    subtitle: 'تعمیرکاران مجرب با قطعات اصلی و گارانتی کتبی',
    subcategories: [
      {
        id: 'tech-washing-machine',
        title: 'تعمیر ماشین لباسشویی',
        subtitle: 'رفع عیب برد، پمپ تخلیه، بلبرینگ و لرزش',
        basePriceToman: 590000,
        etaText: '۳۰ دقیقه',
        readyProblems: ['آبگیری نمی‌کند یا تخلیه ندارد', 'لرزش و صدای شدید حین خشک‌کن', 'نمایش کد خطا و روشن نشدن', 'نشتی آب از زیر دستگاه']
      },
      {
        id: 'tech-refrigerator',
        title: 'تعمیر یخچال و فریزر',
        subtitle: 'شارژ گاز، تعویض کمپرسور، برد و سنسور دما',
        basePriceToman: 680000,
        etaText: '۳۵ دقیقه',
        readyProblems: ['یخچال یا فریزر خنک نمی‌کند', 'برفک‌زدگی و یخ‌زدن لوله‌ها', 'صدای غیرعادی موتور یا فن', 'یکسره کار کردن کمپرسور']
      },
      {
        id: 'tech-cooler',
        title: 'تعمیر و سرویس کولر گازی و آبی',
        subtitle: 'سرویس دوره‌ای، شستشوی کندانسور و شارژ گاز',
        basePriceToman: 540000,
        etaText: '۳۰ دقیقه',
        readyProblems: ['کولر باد گرم می‌زند', 'نشتی آب از پنل داخلی', 'نیاز به شارژ گاز و سرویس فصلی', 'خرابی برد یا خازن']
      },
      {
        id: 'tech-dishwasher',
        title: 'تعمیر ماشین ظرفشویی',
        subtitle: 'عیب‌یابی المنت حرارتی، هیدروستات و پمپ شستشو',
        basePriceToman: 620000,
        etaText: '۴۰ دقیقه',
        readyProblems: ['ظروف تمیز شسته نمی‌شوند', 'آب را گرم نمی‌کند', 'تخلیه انجام نمی‌شود', 'نشتی آب از درب یا کف']
      },
      {
        id: 'tech-tv',
        title: 'تعمیر تلویزیون و نمایشگر',
        subtitle: 'تعمیر بک‌لایت، برد تغذیه و پنل در منزل یا کارگاه',
        basePriceToman: 650000,
        etaText: '۴۵ دقیقه',
        readyProblems: ['صدا دارد اما تصویر سیاه است', 'تلویزیون روشن نمی‌شود', 'چشمک زدن چراغ آماده به کار', 'خطوط عمودی روی تصویر']
      },
      {
        id: 'tech-microwave',
        title: 'تعمیر مایکروفر و سیم‌پیچی',
        subtitle: 'تعمیر مگنترون، برد و سیم‌پیچی تخصصی موتورها',
        basePriceToman: 520000,
        etaText: '۴۰ دقیقه',
        readyProblems: ['غذا را گرم نمی‌کند', 'جرقه زدن داخل محفظه', 'دکمه‌های پنل کار نمی‌کنند', 'نیاز به سیم‌پیچی موتور']
      }
    ]
  },
  {
    slug: 'cat-automotive-mechanic',
    title: 'امداد، مکانیک سیار و خودرو',
    subtitle: 'اعزام فوری مکانیک، برق‌کار و خودروبر کفی',
    subcategories: [
      {
        id: 'auto-mobile-mechanic',
        title: 'مکانیک سیار تخصصی',
        subtitle: 'عیب‌یابی موتور، تسمه، پمپ بنزین و سرویس در محل',
        basePriceToman: 650000,
        etaText: '۲۰ دقیقه',
        readyProblems: ['خودرو روشن نمی‌شود', 'جوش آوردن موتور و نشتی رادیاتور', 'پاره شدن تسمه تایم یا دینام', 'افت توان و لرزش موتور']
      },
      {
        id: 'auto-car-towing',
        title: 'حمل خودرو و خودروبر کفی',
        subtitle: 'جابجایی ایمن خودروهای داخلی و وارداتی با بیمه',
        basePriceToman: 980000,
        etaText: '۲۵ دقیقه',
        readyProblems: ['حمل خودرو تصادفی یا خاموش', 'جابجایی با کفی هیدرولیک', 'حمل بین‌شهری به تعمیرگاه']
      },
      {
        id: 'auto-bodywork',
        title: 'صافکاری بدون رنگ و بدنه',
        subtitle: 'ترمیم حرفه‌ای فرورفتگی و قری بدنه با تجهیزات مدرن',
        basePriceToman: 1200000,
        etaText: '۴۵ دقیقه',
        readyProblems: ['صافکاری بدون رنگ تگرگ و قری', 'تنظیم درز درب و کاپوت', 'تعویض سپر و قطعات بدنه']
      },
      {
        id: 'auto-painting',
        title: 'نقاشی و پولیش تخصصی خودرو',
        subtitle: 'لیسه، رنگ‌آمیزی کوره‌ای و سرامیک بدنه',
        basePriceToman: 1400000,
        etaText: '۶۰ دقیقه',
        readyProblems: ['لیسه و قلم‌گیری خط و خش', 'رنگ‌آمیزی سپر یا گلگیر', 'احیای رنگ و پولیش سرامیکی']
      },
      {
        id: 'auto-electrical',
        title: 'برق خودرو و امداد باتری',
        subtitle: 'تست و تعویض باتری، دینام، استارت و دیاگ سیار',
        basePriceToman: 550000,
        etaText: '۲۰ دقیقه',
        readyProblems: ['باتری خالی شده و باتری به باتری', 'تعویض باتری نو در محل', 'خرابی استارت یا دینام', 'روشن شدن چراغ خطای موتور']
      }
    ]
  },
  {
    slug: 'cat-cleaning-moving',
    title: 'نظافت، شستشو و باربری',
    subtitle: 'نیروهای تایید صلاحیت‌شده با ضمانت کیفیت',
    subcategories: [
      {
        id: 'clean-house-stairs',
        title: 'نظافت منزل و راه‌پله',
        subtitle: 'نظافت کامل واحدهای مسکونی، اداری و مشاعات',
        basePriceToman: 680000,
        etaText: '۴۵ دقیقه',
        readyProblems: ['نظافت کامل منزل و آشپزخانه', 'نظافت راه‌پله و پارکینگ ساختمان', 'نظافت واحد نوساز و تخلیه', 'پذیرایی و چیدمان مجالس']
      },
      {
        id: 'clean-carpet',
        title: 'قالیشویی اعلاء و موکت',
        subtitle: 'شستشوی شرعی و تمام‌اتوماتیک بدون آسیب به بافت',
        basePriceToman: 620000,
        etaText: '۶۰ دقیقه',
        readyProblems: ['شستشوی فرش ماشینی و دستباف', 'لکه‌بری و رفوگری تخصصی', 'خشک‌شویی موکت چسبیده در محل']
      },
      {
        id: 'clean-sofa',
        title: 'مبل‌شویی و تشک در محل',
        subtitle: 'شستشو با دستگاه وکیوم پیشرفته بدون ریزش آب',
        basePriceToman: 540000,
        etaText: '۵۰ دقیقه',
        readyProblems: ['شستشوی مبلمان راحتی و استیل', 'لکه‌زدایی صندلی ناهارخوری', 'شستشوی تشک خوشخواب دونفره']
      },
      {
        id: 'clean-moving-truck',
        title: 'اسباب‌کشی و باربری ایمن',
        subtitle: 'کامیونت مسقف، کارگران مجرب و بسته‌بندی حرفه‌ای',
        basePriceToman: 1450000,
        etaText: '۶۰ دقیقه',
        readyProblems: ['اسباب‌کشی کامل منزل با کامیونت', 'بسته‌بندی با کارتن و ضربه‌گیر', 'جابجایی یخچال ساید و پیانو']
      }
    ]
  },
  {
    slug: 'cat-medical-nursing',
    title: 'پزشکی، پرستاری و سلامت',
    subtitle: 'اعزام پزشک، پرستار دارای پروانه و نمونه‌گیری در منزل',
    subcategories: [
      {
        id: 'med-home-doctor',
        title: 'ویزیت پزشک عمومی و متخصص',
        subtitle: 'معاینه در منزل و ثبت نسخه الکترونیکی بدون انتظار',
        basePriceToman: 780000,
        etaText: '۳۵ دقیقه',
        readyProblems: ['معاینه بیمار در منزل و نسخه الکترونیک', 'ویزیت اورژانسی سالمندان', 'بررسی علائم حیاتی و فشار خون']
      },
      {
        id: 'med-nursing-injection',
        title: 'پرستاری، سرم‌تراپی و تزریقات',
        subtitle: 'تزریقات، پانسمان تخصصی و وصل سرم توسط پرستار مجرب',
        basePriceToman: 390000,
        etaText: '۲۵ دقیقه',
        readyProblems: ['وصل سرم و تزریق عضلانی یا وریدی', 'پانسمان زخم و کشیدن بخیه', 'مراقبت ساعتی از بیمار یا سالمند']
      },
      {
        id: 'med-lab-test',
        title: 'نمونه‌گیری و آزمایش در منزل',
        subtitle: 'خون‌گیری در منزل و ارسال آنلاین جواب آزمایش',
        basePriceToman: 420000,
        etaText: '۴۰ دقیقه',
        readyProblems: ['آزمایش خون و ادرار در منزل', 'چکاپ کامل دوره‌ای', 'نمونه‌گیری تخصصی سالمندان']
      }
    ]
  },
  {
    slug: 'cat-legal-judicial',
    title: 'وکالت، امور حقوقی و اداری',
    subtitle: 'مشاوره با وکلای پایه‌یک و تنظیم تخصصی اوراق قضایی',
    subcategories: [
      {
        id: 'legal-lawyer',
        title: 'وکیل پایه‌یک و مشاور حقوقی',
        subtitle: 'مشاوره حضوری یا غیرحضوری در پرونده‌های حقوقی و ملکی',
        basePriceToman: 950000,
        etaText: 'هماهنگی فوری',
        isLegalMode: true,
        readyProblems: ['مشاوره پرونده ملکی و قرارداد', 'دعاوی خانواده و مطالبه مهریه', 'پرونده کیفری و کلاهبرداری', 'مطالبه چک و سفته و طلب']
      },
      {
        id: 'legal-petition-writer',
        title: 'عریضه‌نویسی، دادخواست و شکواییه',
        subtitle: 'تنظیم تخصصی لوایح دفاعیه، اظهارنامه و قرارداد رسمی',
        basePriceToman: 490000,
        etaText: 'همان روز',
        isLegalMode: true,
        readyProblems: ['تنظیم دادخواست حقوقی', 'نگارش شکواییه و لایحه دفاعیه', 'تنظیم اظهارنامه رسمی', 'بررسی و نگارش مبایعه‌نامه']
      }
    ]
  },
  {
    slug: 'cat-beauty-personal',
    title: 'زیبایی و سلامت',
    subtitle: 'خدمات زیبایی بانوان، مراقبت پوست و مو و نوبت‌دهی آنلاین سالن‌ها',
    subcategories: [
      {
        id: 'beauty-nails',
        title: 'ناخن (کاشت، ترمیم و مانیکور)',
        subtitle: 'کاشت پودر و ژل، لمینت و طراحی با مواد درجه یک',
        basePriceToman: 650000,
        etaText: 'طبق نوبت',
        readyProblems: ['کاشت ناخن و ژلیش', 'ترمیم و لمینت ناخن طبیعی', 'پدیکور و اسپا پا']
      },
      {
        id: 'beauty-keratin',
        title: 'کراتین، پروتئین و احیای مو',
        subtitle: 'صافی و احیای موهای آسیب‌دیده با مواد بدون فرمالدهید',
        basePriceToman: 1800000,
        etaText: 'طبق نوبت',
        readyProblems: ['کراتین و صافی احیا', 'پروتئین‌تراپی و بوتاکس مو', 'مشاوره حجم و قد مو']
      },
      {
        id: 'beauty-haircut',
        title: 'اصلاح، کوپ، رنگ و شینیون',
        subtitle: 'کوتاهی ژورنالی، بالیاژ، آمبره و آرایش حرفه‌ای',
        basePriceToman: 720000,
        etaText: 'طبق نوبت',
        readyProblems: ['کوپ و کوتاهی ژورنالی', 'رنگ، لایت و بالیاژ', 'شینیون و میکاپ مجلسی']
      },
      {
        id: 'beauty-skincare',
        title: 'پاکسازی و مراقبت تخصصی پوست',
        subtitle: 'فیشال تخصصی، آبرسانی عمقی و جوانسازی پوست',
        basePriceToman: 850000,
        etaText: 'طبق نوبت',
        readyProblems: ['پاکسازی و فیشال کلاسیک', 'آبرسانی و لیفت تخصصی پوست', 'رفع جای جوش و روشن‌سازی']
      }
    ]
  },
  {
    slug: 'cat-business-tech-industry',
    title: 'صنعت، دیجیتال و کافی‌نت',
    subtitle: 'طراحی وب‌سایت، سئو، تبلیغات و امور غیرحضوری کافی‌نت',
    subcategories: [
      {
        id: 'digital-web-design',
        title: 'طراحی وب‌سایت و فروشگاه اینترنتی',
        subtitle: 'راه‌اندازی وب‌سایت شرکتی و فروشگاهی با درگاه پرداخت',
        basePriceToman: 6500000,
        etaText: 'مشاوره فوری',
        readyProblems: ['طراحی فروشگاه اینترنتی کامل', 'وب‌سایت معرفی کسب‌وکار', 'اتصال درگاه بانکی و نماد اعتماد']
      },
      {
        id: 'digital-seo',
        title: 'سئو، بهینه‌سازی، رپورتاژ و بک‌لینک',
        subtitle: 'ارتقای رتبه وب‌سایت در نتایج اول جستجو و افزایش فروش',
        basePriceToman: 3200000,
        etaText: 'همان روز',
        readyProblems: ['سئو و بهینه‌سازی فنی سایت', 'انتشار رپورتاژ آگهی معتبر', 'تبلیغات کلیکی و افزایش بازدید']
      },
      {
        id: 'digital-ui-ux',
        title: 'طراحی رابط و تجربه کاربری و گرافیک',
        subtitle: 'طراحی حرفه‌ای رابط کاربری، لوگو و هویت بصری برند',
        basePriceToman: 2800000,
        etaText: 'همان روز',
        readyProblems: ['طراحی رابط کاربری سایت و موبایل', 'طراحی لوگو و ست اداری', 'طراحی بنر و پوستر تبلیغاتی']
      },
      {
        id: 'digital-cafenet',
        title: 'خدمات غیرحضوری کافی‌نت و ثبت‌نام',
        subtitle: 'ثبت‌نام‌های دانشگاهی، ثنا، ابلاغیه، وام و امور اداری',
        basePriceToman: 180000,
        etaText: '۳۰ دقیقه',
        readyProblems: ['ثبت‌نام سامانه ثنا و نوبت‌دهی', 'ثبت‌نام آزمون، کنکور و مدارک', 'تایپ، ترجمه و تنظیم فایل اداری']
      }
    ]
  }
];

export const DEFAULT_SLIDERS: PromoSlide[] = [
  {
    id: 'sl-1',
    title: 'پوشش سراسری تندیس در ۳۱ استان کشور',
    subtitle: 'اعزام فوری متخصصین تاییدشده با گارانتی کتبی و تعرفه شفاف',
    badge: 'پوشش سراسری',
    image_url: '/src/assets/images/media-2.jpg',
    target_category_slug: 'cat-automotive-mechanic',
    duration_seconds: 6
  },
  {
    id: 'sl-2',
    title: 'تسهیلات اعتباری ۲۰ تا ۳۰۰ میلیون تومانی تندیس‌پی',
    subtitle: 'محاسبه پلکانی اقساط ۳ تا ۲۴ ماهه و بارگذاری برخط مدارک',
    badge: 'اعتبار فوری',
    image_url: '/src/assets/images/media-1.jpg',
    target_category_slug: 'tandispay',
    duration_seconds: 6
  },
  {
    id: 'sl-3',
    title: 'خدمات تخصصی زیبایی و سلامت تندیس',
    subtitle: 'تقویم زنده ۷ روز آینده، پروفایل کامل متخصصان و رزرو آنلاین مطمئن',
    badge: 'زیبایی و سلامت',
    image_url: '/src/assets/images/media-3.jpg',
    target_category_slug: 'cat-beauty-personal',
    duration_seconds: 6
  }
];

export const DEFAULT_CATEGORY_SLIDERS: Record<string, CategorySliderItem[]> = {
  'cat-technical-repairs': [
    { id: 'cs-tech-1', group_slug: 'cat-technical-repairs', badge: 'تعمیر در محل', title: 'عیب‌یابی تخصصی بدون جابجایی دستگاه', subtitle: 'ارائه فاکتور جزءبه‌جزء و ضمانت قطعات تعویضی' }
  ],
  'cat-automotive-mechanic': [
    { id: 'cs-auto-1', group_slug: 'cat-automotive-mechanic', badge: 'اعزام ۲۰ دقیقه‌ای', title: 'امداد فوری خودرو و مکانیک سیار', subtitle: 'پوشش ۲۴ ساعته در تمام محله‌های شهر' }
  ],
  'cat-legal-judicial': [
    { id: 'cs-legal-1', group_slug: 'cat-legal-judicial', badge: 'محرمانه و رسمی', title: 'مشاوره حضوری یا غیرحضوری با وکیل پایه‌یک', subtitle: 'امکان پیوست مستقیم تصاویر مدارک پرونده' }
  ]
};

export const DEFAULT_ONLINE_STORE_PARTS: OnlineStorePart[] = [
  { id: 'part_1', title: 'فیلتر روغن و هواکش اصلی خودرو', category: 'قطعات مصرفی خودرو', brand: 'تندیس پارت', compatibleModel: 'پژو، سمند، دنا، رانا', partCode: '۱۲۰۴-ب', warranty: '۱۲ ماه ضمانت اصالت', priceToman: 485000, inStock: true },
  { id: 'part_2', title: 'لنت ترمز جلو سرامیکی بدون صدا', category: 'سیستم ترمز خودرو', brand: 'تندیس پارت', compatibleModel: 'خانواده پژو و سمند', partCode: '۲۱۰۸-ج', warranty: '۱۸ ماه ضمانت تعویض', priceToman: 1290000, inStock: true },
  { id: 'part_3', title: 'شمع موتور دو پلاتین تقویتی', category: 'برق و احتراق خودرو', brand: 'تندیس پارت', compatibleModel: 'خودروهای انژکتوری داخلی', partCode: '۳۳۰۱-الف', warranty: '۱۲ ماه ضمانت', priceToman: 740000, inStock: true },
  { id: 'part_4', title: 'پمپ تخلیه اصلی ماشین لباسشویی', category: 'لوازم خانگی', brand: 'تندیس سرویس', compatibleModel: 'ال‌جی، سامسونگ، بوش، اسنوا', partCode: '۴۱۰۲-ل', warranty: '۱۲ ماه گارانتی تعویض', priceToman: 890000, inStock: true },
  { id: 'part_5', title: 'خازن و رله کمپرسور یخچال و کولر', category: 'برودتی و تاسیسات', brand: 'تندیس سرویس', compatibleModel: 'کولرهای گازی و یخچال خانگی', partCode: '۵۲۰۵-ک', warranty: '۱۲ ماه ضمانت عملکرد', priceToman: 620000, inStock: true },
  { id: 'part_6', title: 'باتری ۱۲ ولت ۶۶ آمپر اتمی با نصب', category: 'برق و باتری', brand: 'تندیس نیرو', compatibleModel: 'انواع خودروهای سواری', partCode: '۶۶۰۰-ن', warranty: '۱۸ ماه ضمانت بی‌قیدوشرط', priceToman: 3850000, inStock: true }
];

export function getRollingSevenJalaliDays() {
  const weekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const result = [];
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(Date.now() + offset * 86400000);
    const jalali = formatter.format(d);
    const parts = jalali.split('/');
    const short = parts.length === 3 ? `${parts[1]}/${parts[2]}` : jalali;
    result.push({
      date_key: jalali,
      jalali_date: jalali,
      jalali_short: short,
      weekday: offset === 0 ? 'امروز' : offset === 1 ? 'فردا' : weekdays[d.getDay()],
      day_offset: offset,
      is_open: d.getDay() !== 5,
      slots: d.getDay() !== 5 ? ['۰۹:۳۰', '۱۱:۰۰', '۱۳:۳۰', '۱۵:۳۰', '۱۷:۰۰', '۱۸:۳۰'] : []
    });
  }
  return result;
}

export const DEFAULT_BEAUTY_SPECIALISTS: BeautySpecialist[] = [
  {
    specialist_phone: '09160001122',
    specialist_name: 'سارا رادمهر',
    business_name: 'سالن تخصصی زیبایی یاس تندیس',
    category_code: 'beauty-keratin',
    role_title: 'متخصص کراتین، احیا و رنگ مو',
    service_city: 'آبادان',
    bio: 'دارای مدرک بین‌المللی احیا و صافی مو با بیش از ۸ سال سابقه تخصصی و استفاده انحصاری از مواد بدون فرمالدهید.',
    salon_address: 'آبادان، خیابان امیری، مجتمع تجاری تندیس، طبقه دوم',
    salon_map_status: 'موقعیت سالن روی نقشه تایید و ثبت شده است',
    rating: 4.9,
    review_count: 142,
    skills: ['کراتین و احیا', 'رنگ و بالیاژ', 'پروتئین‌تراپی'],
    tariffs: [
      { title: 'پروتئین‌تراپی و احیای سرد', price_toman: 1450000, duration_min: 90 },
      { title: 'کراتین و صافی کامل (مو متوسط)', price_toman: 2400000, duration_min: 150 },
      { title: 'بالیاژ و آمبره ژورنالی', price_toman: 2900000, duration_min: 180 }
    ],
    portfolio_notes: ['احیای ۹۵ درصدی موهای دکلره‌شده با مواد گیاهی', 'صافی شلاقی و براقیت طبیعی بدون گاز'],
    reviews: [
      { customer_name: 'نگار بهرامی', stars: 5, comment: 'کارشون فوق‌العاده تمیز و باحوصله بود، دقیقاً سر ساعت پذیرش شدم.', date_label: 'هفته گذشته' },
      { customer_name: 'مریم کاظمی', stars: 5, comment: 'برخورد بسیار محترمانه و کیفیت مواد عالی.', date_label: 'دو هفته پیش' }
    ],
    days: getRollingSevenJalaliDays()
  },
  {
    specialist_phone: '09160003344',
    specialist_name: 'نازنین شریفی',
    business_name: 'آکادمی ناخن و پوست نیلوفر',
    category_code: 'beauty-nails',
    role_title: 'ناخن‌کار حرفه‌ای و فیشال پوست',
    service_city: 'اهواز',
    bio: 'طراحی و کاشت ژل و پودر با متریال استریل‌شده اتوکلاو و خدمات پاکسازی تخصصی پوست صورت.',
    salon_address: 'اهواز، کیانپارس، خیابان ۱۴ غربی، ساختمان مهر',
    salon_map_status: 'موقعیت سالن روی نقشه تایید و ثبت شده است',
    rating: 4.8,
    review_count: 98,
    skills: ['کاشت ناخن', 'ژلیش و لمینت', 'پاکسازی پوست'],
    tariffs: [
      { title: 'کاشت پودر یا ژل به همراه لاک‌ژل', price_toman: 690000, duration_min: 75 },
      { title: 'ترمیم و لمینت ناخن طبیعی', price_toman: 480000, duration_min: 60 },
      { title: 'فیشال و پاکسازی عمقی پوست', price_toman: 890000, duration_min: 60 }
    ],
    portfolio_notes: ['استریل کامل ابزار پیش از هر مراجعه', 'طراحی مینیمال، فرنچ و کروم روز'],
    reviews: [
      { customer_name: 'الهام موسوی', stars: 5, comment: 'بهداشت سالن و ظرافت کارشون بی‌نظیر بود.', date_label: '۳ روز پیش' }
    ],
    days: getRollingSevenJalaliDays()
  }
];

export function toPersianDigits(input: string | number): string {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input ?? '').replace(/\d/g, (d) => map[Number(d)] ?? d);
}

export function toLatinDigits(input: string | number): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  return String(input ?? '')
    .split('')
    .map((ch) => {
      const p = persian.indexOf(ch);
      if (p >= 0) return String(p);
      const a = arabic.indexOf(ch);
      if (a >= 0) return String(a);
      return ch;
    })
    .join('');
}

export function toPurePersianText(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return '';
  let str = String(raw);
  const replacements: Array<[RegExp, string]> = [
    [/VIP/gi, 'تشریفاتی ویژه'],
    [/UI-UX|UI\/UX/gi, 'رابط و تجربه کاربری'],
    [/OEM/gi, 'اصلی کارخانه'],
    [/OTA-LIVE|OTA/gi, 'نسخه زنده'],
    [/SEO/gi, 'بهینه‌سازی جستجو'],
    [/ONLINE/gi, 'برخط'],
    [/PENDING_NEARBY|PENDING/gi, 'در حال بررسی'],
    [/COMPLETED/gi, 'تکمیل‌شده'],
    [/CANCELLED/gi, 'لغوشده'],
    [/CONFIRMED/gi, 'تاییدشده'],
    [/TP-BRK-/gi, 'تندیس-ترمز-'],
    [/TP-BAT-/gi, 'تندیس-باتری-'],
    [/TP-/gi, 'تندیس-']
  ];
  for (const [pattern, target] of replacements) {
    str = str.replace(pattern, target);
  }
  str = str.replace(/[A-Za-z]+/g, '').replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  return toPersianDigits(str);
}

export function formatToman(amount: number): string {
  const clean = Math.max(0, Math.round(Number(amount) || 0));
  return `${toPersianDigits(clean.toLocaleString('en-US'))} تومان`;
}

export function statusPersianLabel(statusCode: string): string {
  switch (String(statusCode || '').toUpperCase()) {
    case 'PENDING_NEARBY':
    case 'PENDING':
      return 'در حال جستجوی متخصص';
    case 'ACCEPTED_BY_SPECIALIST':
      return 'تایید متخصص';
    case 'SPECIALIST_EN_ROUTE':
      return 'متخصص در مسیر است';
    case 'IN_PROGRESS':
      return 'در حال انجام';
    case 'COMPLETED':
      return 'پایان کار';
    case 'CANCELLED':
      return 'لغوشده';
    default:
      return 'در حال پیگیری';
  }
}

export function statusStepIndex(statusCode: string): number {
  switch (String(statusCode || '').toUpperCase()) {
    case 'PENDING_NEARBY':
    case 'PENDING':
      return 0;
    case 'ACCEPTED_BY_SPECIALIST':
    case 'SPECIALIST_EN_ROUTE':
      return 1;
    case 'IN_PROGRESS':
      return 2;
    case 'COMPLETED':
      return 3;
    default:
      return 0;
  }
}

export function calculateTandisPayInstallment(amountToman: number, months: number) {
  const safeAmount = Math.min(300_000_000, Math.max(20_000_000, amountToman));
  const safeMonths = Math.min(24, Math.max(3, months));
  const interestRate = safeMonths <= 9 ? 4 : safeMonths <= 18 ? 18 : 24;
  const totalInterest = Math.round((safeAmount * interestRate) / 100);
  const totalRepayment = safeAmount + totalInterest;
  const monthlyInstallment = Math.round(totalRepayment / safeMonths);
  return {
    amountToman: safeAmount,
    months: safeMonths,
    interestRatePercent: interestRate,
    totalInterestToman: totalInterest,
    totalRepaymentToman: totalRepayment,
    monthlyInstallmentToman: monthlyInstallment
  };
}

const IRAN_BANK_BINS: Record<string, { name: string; accent: string }> = {
  '603799': { name: 'بانک ملی ایران', accent: '#B45309' },
  '589210': { name: 'بانک سپه', accent: '#047857' },
  '627648': { name: 'بانک توسعه صادرات', accent: '#0F766E' },
  '627961': { name: 'بانک صنعت و معدن', accent: '#0369A1' },
  '603770': { name: 'بانک کشاورزی', accent: '#15803D' },
  '628023': { name: 'بانک مسکن', accent: '#C2410C' },
  '627760': { name: 'پست بانک ایران', accent: '#0E7490' },
  '502908': { name: 'بانک توسعه تعاون', accent: '#0D9488' },
  '627412': { name: 'بانک اقتصاد نوین', accent: '#6D28D9' },
  '622106': { name: 'بانک پارسیان', accent: '#B91C1C' },
  '502229': { name: 'بانک پاسارگاد', accent: '#CA8A04' },
  '627488': { name: 'بانک کارآفرین', accent: '#047857' },
  '621986': { name: 'بانک سامان', accent: '#0284C7' },
  '639346': { name: 'بانک سینا', accent: '#0F766E' },
  '639607': { name: 'بانک سرمایه', accent: '#4338CA' },
  '502806': { name: 'بانک شهر', accent: '#DC2626' },
  '504706': { name: 'بانک شهر', accent: '#DC2626' },
  '502938': { name: 'بانک دی', accent: '#0369A1' },
  '603769': { name: 'بانک صادرات ایران', accent: '#1D4ED8' },
  '610433': { name: 'بانک ملت', accent: '#BE123C' },
  '991975': { name: 'بانک ملت', accent: '#BE123C' },
  '627353': { name: 'بانک تجارت', accent: '#1E40AF' },
  '585983': { name: 'بانک تجارت', accent: '#1E40AF' },
  '589463': { name: 'بانک رفاه کارگران', accent: '#047857' },
  '627381': { name: 'بانک انصار (سپه)', accent: '#0F766E' },
  '639370': { name: 'بانک مهر اقتصاد', accent: '#059669' },
  '636214': { name: 'بانک آینده', accent: '#7C2D12' },
  '505416': { name: 'بانک گردشگری', accent: '#B45309' },
  '505785': { name: 'بانک ایران زمین', accent: '#0D9488' },
  '504172': { name: 'بانک قرض‌الحسنه رسالت', accent: '#0284C7' },
  '606373': { name: 'بانک قرض‌الحسنه مهر ایران', accent: '#059669' },
  '639599': { name: 'بانک قوامین', accent: '#065F46' },
  '505801': { name: 'موسسه اعتباری کوثر', accent: '#047857' },
  '628157': { name: 'موسسه اعتباری توسعه', accent: '#0369A1' },
  '585947': { name: 'بانک خاورمیانه', accent: '#0F766E' }
};

export function detectIranBank(rawCardNumber: string): { name: string; accent: string } | null {
  const digits = toLatinDigits(rawCardNumber).replace(/\D/g, '');
  if (digits.length < 6) return null;
  const bin = digits.slice(0, 6);
  return IRAN_BANK_BINS[bin] || { name: 'شبکه بانکی شتاب', accent: '#065A52' };
}
