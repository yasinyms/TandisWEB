import React, { useState } from 'react';
import {
  Armchair,
  Bike,
  Briefcase,
  Car,
  Cog,
  Compass,
  Droplets,
  FileText,
  Flame,
  FlaskConical,
  Globe,
  Hammer,
  HeartPulse,
  Home,
  Laptop,
  Link2,
  Megaphone,
  Newspaper,
  Package,
  Paintbrush,
  Palette,
  Scale,
  Scissors,
  Search,
  ShoppingBag,
  Smartphone,
  Snowflake,
  Sparkles,
  SprayCan,
  Stethoscope,
  Syringe,
  ThermometerSnowflake,
  Truck,
  Tv,
  Utensils,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

export interface ServiceApiIconProps {
  /** کلید آیکون دریافت‌شده از API برنامه مشتری (مانند ic_tech_wrench، ic_med_hospital و...) */
  iconKey?: string;
  /** کلید آیکون دسته والد از API برنامه مشتری */
  parentIconKey?: string;
  /** نشانی تصویر یا آیکون اختصاصی دریافت‌شده از API (در صورت وجود) */
  iconUrl?: string;
  /** شناسه زیرخدمت (برای انتخاب آیکون دقیق هر زیرخدمت زمانی که API کلید عمومی برمی‌گرداند) */
  subServiceId?: string;
  /** اسلاگ دسته‌بندی (fallback زمانی که هنوز پاسخ زنده نیامده است) */
  groupSlug?: string;
  /** رنگ اختصاصی دریافت‌شده از API برنامه مشتری (color_hex) */
  colorHex?: string;
  /** سبک آیکون از API (3D یا 2D) */
  iconStyle?: string;
  /** حالت انتخاب‌شده (مثلاً روی کارت فعال با پس‌زمینه رنگی) */
  inverted?: boolean;
  /** اندازه کانتینر آیکون */
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

type LucideIconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

/** نگاشت دقیق کلیدهای آیکون API برنامه مشتری تندیس (config_categories) */
const API_ICON_KEY_MAP: Record<string, LucideIconComponent> = {
  // کلیدهای اصلی اندروید تندیس مشتری (config_categories)
  ic_tech_wrench: Wrench,
  ic_auto_car: Car,
  ic_auto_repair: Wrench,
  ic_clean_services: SprayCan,
  ic_med_hospital: HeartPulse,
  ic_law_gavel: Scale,
  ic_beauty_sparkles: Sparkles,
  ic_dig_laptop: Laptop,
  shoppingbag: ShoppingBag,
  ic_shopping_bag: ShoppingBag,
  ic_shop: ShoppingBag,

  // کلیدهای تکمیلی و آینده‌نگر برای مدیریت دسته‌بندی‌ها
  ic_washing_machine: Droplets,
  ic_refrigerator: ThermometerSnowflake,
  ic_cooler: Wind,
  ic_dishwasher: Utensils,
  ic_tv: Tv,
  ic_microwave: Flame,
  ic_winding: Cog,
  ic_towing: Truck,
  ic_truck: Truck,
  ic_freight: Package,
  ic_bodywork: Hammer,
  ic_painting: Paintbrush,
  ic_electrical: Zap,
  ic_home: Home,
  ic_carpet: Sparkles,
  ic_sofa: Armchair,
  ic_doctor: Stethoscope,
  ic_nurse: Syringe,
  ic_lab: FlaskConical,
  ic_petition: FileText,
  ic_scissors: Scissors,
  ic_web: Globe,
  ic_app: Smartphone,
  ic_seo: Search,
  ic_uiux: Palette,
  ic_ads: Megaphone,
  ic_news: Newspaper,
  ic_backlink: Link2,
  ic_bike: Bike,
  ic_briefcase: Briefcase,
  ic_compass: Compass,

  // نام‌های استاندارد Lucide (در صورتی که مدیریت نام Lucide ارسال کند)
  wrench: Wrench,
  car: Car,
  truck: Truck,
  heartpulse: HeartPulse,
  stethoscope: Stethoscope,
  scale: Scale,
  sparkles: Sparkles,
  laptop: Laptop,
  briefcase: Briefcase,
  home: Home,
  zap: Zap,
  tv: Tv,
  wind: Wind,
  snowflake: Snowflake,
  scissors: Scissors,
  globe: Globe,
  smartphone: Smartphone,
  megaphone: Megaphone,
  paintbrush: Paintbrush,
  syringe: Syringe,
  flaskconical: FlaskConical,
  armchair: Armchair,
  package: Package,
  bike: Bike,
};

/** نگاشت آیکون اختصاصی هر زیرخدمت زمانی که API کلید پیش‌فرض عمومی ic_tech_wrench را ارسال می‌کند */
const SUB_SERVICE_SPECIFIC_ICON_MAP: Record<string, LucideIconComponent> = {
  // فنی و تعمیرات
  'tech-washing-machine': Droplets,
  'tech-refrigerator': ThermometerSnowflake,
  'tech-cooler': Wind,
  'tech-dishwasher': Utensils,
  'tech-tv': Tv,
  'tech-microwave': Flame,
  'tech-winding': Cog,

  // امداد و خودرو
  'auto-mobile-mechanic': Wrench,
  'auto-car-towing': Truck,
  'auto-bodywork': Hammer,
  'auto-painting': Paintbrush,
  'auto-electrical': Zap,

  // نظافت و باربری
  'clean-house-stairs': Home,
  'clean-carpet': SprayCan,
  'clean-sofa': Armchair,
  'clean-freight': Package,
  'clean-moving-truck': Truck,

  // پزشکی و پرستاری
  'med-home-doctor': Stethoscope,
  'med-nursing-injection': Syringe,
  'med-lab-test': FlaskConical,

  // حقوقی و اداری
  'legal-lawyer': Scale,
  'legal-petition-writer': FileText,

  // زیبایی و سلامت
  'beauty-nails': Sparkles,
  'beauty-keratin': Sparkles,
  'beauty-haircut': Scissors,
  'beauty-skincare': HeartPulse,

  // صنعت و دیجیتال
  'digital-web-design': Globe,
  'digital-app-design': Smartphone,
  'digital-seo': Search,
  'digital-ui-ux': Palette,
  'digital-advertising': Megaphone,
  'digital-reportage': Newspaper,
  'digital-backlink': Link2,

  // درخواست خودرو و پیک
  'ride-eco': Car,
  'ride-vip': Car,
  'ride-bike-courier': Bike,
};

const GROUP_FALLBACK_COLOR: Record<string, string> = {
  'cat-technical-repairs': '#EA580C',
  'cat-automotive-mechanic': '#C89B3C',
  'cat-cleaning-moving': '#16A34A',
  'cat-medical-nursing': '#DC2626',
  'cat-legal-judicial': '#0891B2',
  'cat-beauty-personal': '#DB2777',
  'cat-business-tech-industry': '#2563EB',
  'cat-ride-request': '#0E4D34',
  'cat-online-parts-store': '#065A52',
};

const GROUP_FALLBACK_ICON_KEY: Record<string, string> = {
  'cat-technical-repairs': 'ic_tech_wrench',
  'cat-automotive-mechanic': 'ic_auto_repair',
  'cat-cleaning-moving': 'ic_clean_services',
  'cat-medical-nursing': 'ic_med_hospital',
  'cat-legal-judicial': 'ic_law_gavel',
  'cat-beauty-personal': 'ic_beauty_sparkles',
  'cat-business-tech-industry': 'ic_dig_laptop',
  'cat-ride-request': 'ic_auto_car',
  'cat-online-parts-store': 'ShoppingBag',
};

function isSafeImageUrl(url?: string): boolean {
  const s = String(url || '').trim();
  if (!s) return false;
  return /^https?:\/\//i.test(s) || /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,/i.test(s);
}

function normalizeHexColor(hex?: string, fallback = '#0a8387'): string {
  const s = String(hex || '').trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return s;
  return fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(10, 131, 135, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveIconComponent(params: {
  iconKey?: string;
  parentIconKey?: string;
  subServiceId?: string;
  groupSlug?: string;
}): LucideIconComponent {
  const normKey = String(params.iconKey || '')
    .trim()
    .toLowerCase();
  const normParentKey = String(params.parentIconKey || '')
    .trim()
    .toLowerCase();
  const subId = String(params.subServiceId || '').trim();
  const slug = String(params.groupSlug || '').trim();

  // ۱. اگر زیرخدمت از API یک کلید آیکون اختصاصی (غیر از پیش‌فرض عمومی ic_tech_wrench) داشته باشد، همان اولویت اول است
  if (normKey && normKey !== 'ic_tech_wrench' && API_ICON_KEY_MAP[normKey]) {
    return API_ICON_KEY_MAP[normKey];
  }

  // ۲. برای زیرخدمت‌های مشخص، آیکون دقیق متناظر همان خدمت نمایش داده می‌شود
  if (subId && SUB_SERVICE_SPECIFIC_ICON_MAP[subId]) {
    return SUB_SERVICE_SPECIFIC_ICON_MAP[subId];
  }

  // ۳. اگر برای کلید دسته (یا زیرخدمت در دسته فنی) کلید API معتبر وجود داشت
  if (normKey && API_ICON_KEY_MAP[normKey]) {
    // اگر زیرخدمت خارج از فنی باشد و فقط کلید پیش‌فرض ic_tech_wrench داشت، از آیکون دسته والد استفاده کن
    if (subId && normKey === 'ic_tech_wrench' && slug && slug !== 'cat-technical-repairs') {
      if (normParentKey && API_ICON_KEY_MAP[normParentKey]) {
        return API_ICON_KEY_MAP[normParentKey];
      }
      const fallbackSlugKey = GROUP_FALLBACK_ICON_KEY[slug]?.toLowerCase();
      if (fallbackSlugKey && API_ICON_KEY_MAP[fallbackSlugKey]) {
        return API_ICON_KEY_MAP[fallbackSlugKey];
      }
    }
    return API_ICON_KEY_MAP[normKey];
  }

  // ۴. آیکون دسته والد از API
  if (normParentKey && API_ICON_KEY_MAP[normParentKey]) {
    return API_ICON_KEY_MAP[normParentKey];
  }

  // ۵. fallback بر اساس اسلاگ دسته‌بندی
  const fallbackKey = GROUP_FALLBACK_ICON_KEY[slug]?.toLowerCase();
  if (fallbackKey && API_ICON_KEY_MAP[fallbackKey]) {
    return API_ICON_KEY_MAP[fallbackKey];
  }

  return Wrench;
}

export const ServiceApiIcon: React.FC<ServiceApiIconProps> = ({
  iconKey,
  parentIconKey,
  iconUrl,
  subServiceId,
  groupSlug,
  colorHex,
  iconStyle,
  inverted = false,
  size = 'md',
  alt = 'آیکون خدمت تندیس',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const fallbackHex = (groupSlug && GROUP_FALLBACK_COLOR[groupSlug]) || '#0a8387';
  const resolvedHex = normalizeHexColor(colorHex, fallbackHex);
  const IconComp = resolveIconComponent({ iconKey, parentIconKey, subServiceId, groupSlug });

  const boxSizeClass =
    size === 'sm' ? 'w-9 h-9 rounded-xl' : size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-11 h-11 rounded-xl';
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const is3D = String(iconStyle || '').toUpperCase() === '3D';

  const containerStyle: React.CSSProperties = inverted
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        color: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.22)',
      }
    : {
        backgroundColor: hexToRgba(resolvedHex, 0.11),
        color: resolvedHex,
        borderColor: hexToRgba(resolvedHex, 0.22),
        boxShadow: is3D ? `0 6px 14px -6px ${hexToRgba(resolvedHex, 0.35)}` : undefined,
      };

  const canShowRemoteImg = isSafeImageUrl(iconUrl) && !imgFailed;

  return (
    <div
      style={containerStyle}
      className={`${boxSizeClass} border flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-105`}
    >
      {canShowRemoteImg ? (
        <img
          src={iconUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain p-1.5"
        />
      ) : (
        <IconComp className={iconSizeClass} />
      )}
    </div>
  );
};
