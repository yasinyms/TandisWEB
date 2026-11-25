export type MainView =
  | 'home'
  | 'services'
  | 'downloads'
  | 'hamkar-panel'
  | 'customer-signup'
  | 'about'
  | 'management'
  | 'news';

export type ServiceSubTab = 'catalog' | 'store' | 'tandispay' | 'orders';

export interface ResolvedAppRoute {
  activeView: MainView;
  serviceSubTab: ServiceSubTab;
  selectedGroupSlug: string;
  showBeautyBooking: boolean;
  hamkarMode: 'login' | 'signup';
  canonicalPath: string;
  pageTitle: string;
}

export const ROUTE_TITLES: Record<string, string> = {
  '/': 'تندیس | خدمات در محل، تعمیرات، زیبایی و تندیس‌پی',
  '/app': 'دانلود اپلیکیشن تندیس و تندیس همکار | تندیس',
  '/services': 'خدمات در محل تندیس | ۳۲ خدمت تخصصی',
  '/beauty': 'زیبایی بانوان و نوبت‌دهی آنلاین | تندیس',
  '/store': 'فروشگاه قطعات اصلی تندیس | تندیس',
  '/tandispay': 'تندیس‌پی؛ کیف پول و اعتبار اقساطی | تندیس',
  '/orders': 'پیگیری درخواست‌ها و فاکتورها | تندیس',
  '/hamkar': 'پنل وب تندیس همکار | سامانه متخصصان تندیس',
  '/hamkar/signup': 'ثبت‌نام متخصص و همکار جدید | تندیس همکار',
  '/signup': 'ثبت‌نام عضویت مشتری | تندیس',
  '/about': 'درباره تندیس، قوانین و نماد اعتماد | تندیس',
  '/terms': 'قوانین، شرایط استفاده و رویه عودت وجه | تندیس',
  '/privacy': 'حریم خصوصی کاربران | تندیس',
  '/management': 'مدیریت و کارشناسان تندیس | تندیس',
  '/news': 'اخبار و مقالات تندیس (به‌زودی) | تندیس'
};

export function parseRouteFromLocation(pathnameRaw: string, hashRaw = ''): ResolvedAppRoute {
  const cleanPath = (pathnameRaw || '/').replace(/\/+$/, '').toLowerCase() || '/';
  const hash = (hashRaw || '').toLowerCase();

  // پشتیبانی از لینک‌های قدیمی با هشتگ #hamkar
  if (hash.includes('hamkar')) {
    const isSignup = hash.includes('signup') || hash.includes('register');
    return {
      activeView: 'hamkar-panel',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: isSignup ? 'signup' : 'login',
      canonicalPath: isSignup ? '/hamkar/signup' : '/hamkar',
      pageTitle: isSignup ? ROUTE_TITLES['/hamkar/signup'] : ROUTE_TITLES['/hamkar']
    };
  }

  if (cleanPath === '/app' || cleanPath === '/downloads' || cleanPath === '/download') {
    return {
      activeView: 'downloads',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/app',
      pageTitle: ROUTE_TITLES['/app']
    };
  }

  if (
    cleanPath === '/hamkar/signup' ||
    cleanPath === '/hamkar/register' ||
    cleanPath === '/provider-signup'
  ) {
    return {
      activeView: 'hamkar-panel',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'signup',
      canonicalPath: '/hamkar/signup',
      pageTitle: ROUTE_TITLES['/hamkar/signup']
    };
  }

  if (cleanPath === '/hamkar' || cleanPath === '/hamkar/login' || cleanPath === '/expert') {
    return {
      activeView: 'hamkar-panel',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/hamkar',
      pageTitle: ROUTE_TITLES['/hamkar']
    };
  }

  if (cleanPath === '/management' || cleanPath === '/experts') {
    return {
      activeView: 'management',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/management',
      pageTitle: ROUTE_TITLES['/management']
    };
  }

  if (cleanPath === '/news' || cleanPath === '/articles' || cleanPath === '/blog') {
    return {
      activeView: 'news',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/news',
      pageTitle: ROUTE_TITLES['/news']
    };
  }

  if (cleanPath === '/beauty' || cleanPath === '/services/beauty' || cleanPath === '/services/cat-beauty-personal') {
    return {
      activeView: 'services',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-beauty-personal',
      showBeautyBooking: true,
      hamkarMode: 'login',
      canonicalPath: '/beauty',
      pageTitle: ROUTE_TITLES['/beauty']
    };
  }

  if (cleanPath === '/store' || cleanPath === '/parts') {
    return {
      activeView: 'services',
      serviceSubTab: 'store',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/store',
      pageTitle: ROUTE_TITLES['/store']
    };
  }

  if (cleanPath === '/tandispay' || cleanPath === '/wallet') {
    return {
      activeView: 'services',
      serviceSubTab: 'tandispay',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/tandispay',
      pageTitle: ROUTE_TITLES['/tandispay']
    };
  }

  if (cleanPath === '/orders' || cleanPath === '/requests') {
    return {
      activeView: 'services',
      serviceSubTab: 'orders',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/orders',
      pageTitle: ROUTE_TITLES['/orders']
    };
  }

  if (cleanPath === '/services') {
    return {
      activeView: 'services',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/services',
      pageTitle: ROUTE_TITLES['/services']
    };
  }

  if (cleanPath.startsWith('/services/')) {
    const slug = pathnameRaw.replace(/\/+$/, '').slice('/services/'.length);
    return {
      activeView: 'services',
      serviceSubTab: 'catalog',
      selectedGroupSlug: slug || 'cat-technical-repairs',
      showBeautyBooking: slug === 'cat-beauty-personal',
      hamkarMode: 'login',
      canonicalPath: slug ? `/services/${slug}` : '/services',
      pageTitle: ROUTE_TITLES['/services']
    };
  }

  if (cleanPath === '/signup' || cleanPath === '/register') {
    return {
      activeView: 'customer-signup',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath: '/signup',
      pageTitle: ROUTE_TITLES['/signup']
    };
  }

  if (cleanPath === '/about' || cleanPath === '/contact' || cleanPath === '/terms' || cleanPath === '/privacy') {
    const canonicalPath =
      cleanPath === '/terms' ? '/terms' : cleanPath === '/privacy' ? '/privacy' : '/about';
    return {
      activeView: 'about',
      serviceSubTab: 'catalog',
      selectedGroupSlug: 'cat-technical-repairs',
      showBeautyBooking: false,
      hamkarMode: 'login',
      canonicalPath,
      pageTitle: ROUTE_TITLES[canonicalPath]
    };
  }

  return {
    activeView: 'home',
    serviceSubTab: 'catalog',
    selectedGroupSlug: 'cat-technical-repairs',
    showBeautyBooking: false,
    hamkarMode: 'login',
    canonicalPath: '/',
    pageTitle: ROUTE_TITLES['/']
  };
}

export function pushBrowserPath(path: string, title?: string): void {
  if (typeof window === 'undefined') return;
  const target = path.startsWith('/') ? path : `/${path}`;
  if (window.location.pathname !== target || window.location.hash) {
    window.history.pushState({ path: target }, '', target);
  }
  if (title) {
    document.title = title;
  } else if (ROUTE_TITLES[target]) {
    document.title = ROUTE_TITLES[target];
  }
}
