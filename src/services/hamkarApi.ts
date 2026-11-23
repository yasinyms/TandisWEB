import { ALL_IRAN_CITIES } from './iranProvinces';
import { DEFAULT_CATEGORIES } from './tandisDefaults';
import type {
  BeautySchedulePayload,
  BeautySpecialistProfileJson,
  HamkarApprovalStatus,
  HamkarBeautyAppointment,
  HamkarCommissionConfig,
  HamkarLiveStatePayload,
  HamkarOrderItem,
  HamkarSessionLock,
  HamkarSkillOption,
  HamkarSpecialistProfile,
  InvoiceDossier,
  InvoiceEntryMode,
  InvoiceLineItem,
  MissionStep,
} from '../types/hamkar';

export const HAMKAR_SESSION_KEY = 'tandis_hamkar_specialist_session_v3';
export const HAMKAR_LIFECYCLE_KEY = 'tandis_mission_lifecycle_v1';
export const HAMKAR_LOGO_SRC = '/assets/aistudio/Make_logo_gold_white_background_ecbe9332_2K_bd2ed1f8.jpg';
export const MAX_IMAGE_BYTES = 1_048_576; // دقیقاً ۱ مگابایت

export const BEAUTY_ALL_SKILLS = [
  'کراتین و احیای مو',
  'کاشت و طراحی ناخن',
  'اصلاح صورت و ابرو',
  'کوپ و کوتاهی ژورنالی',
  'آرایش و شینیون مو',
  'پاکسازی و فیشیال پوست',
  'رنگ و مش تخصصی',
  'اکستنشن مژه و لیفت',
];

export const IRAN_BANKS_BY_CODE: Record<string, string> = {
  '017': 'بانک ملی ایران',
  '012': 'بانک ملت',
  '019': 'بانک صادرات ایران',
  '018': 'بانک تجارت',
  '015': 'بانک سپه',
  '016': 'بانک کشاورزی',
  '014': 'بانک مسکن',
  '057': 'بانک پاسارگاد',
  '054': 'بانک پارسیان',
  '056': 'بانک سامان',
  '055': 'بانک اقتصاد نوین',
  '013': 'بانک رفاه کارگران',
  '061': 'بانک شهر',
  '066': 'بانک دی',
  '059': 'بانک سینا',
  '062': 'بانک آینده',
  '070': 'بانک قرض‌الحسنه رسالت',
  '060': 'بانک قرض‌الحسنه مهر ایران',
  '021': 'پست بانک ایران',
  '053': 'بانک کارآفرین',
  '058': 'بانک سرمایه',
  '064': 'بانک گردشگری',
  '069': 'بانک ایران‌زمین',
  '078': 'بانک خاورمیانه',
  '020': 'بانک توسعه صادرات',
  '022': 'بانک توسعه تعاون',
  '011': 'بانک صنعت و معدن',
};

export function toEnglishDigits(input: string): string {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return String(input || '')
    .split('')
    .map((c) => map[c] || c)
    .join('');
}

export function normalizeIranPhone(raw: string): string {
  const cleaned = toEnglishDigits(raw)
    .trim()
    .replace(/^hamkar_/i, '')
    .replace(/\D/g, '');
  if (cleaned.startsWith('989') && cleaned.length === 12) return '0' + cleaned.slice(2);
  if (cleaned.startsWith('00989') && cleaned.length === 14) return '0' + cleaned.slice(4);
  if (cleaned.startsWith('9') && cleaned.length === 10) return '0' + cleaned;
  return cleaned;
}

export function validateIranNationalCode(raw: string): boolean {
  const code = toEnglishDigits(raw).replace(/\D/g, '');
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(code[i]) * (10 - i);
  }
  const rem = sum % 11;
  const check = Number(code[9]);
  return rem < 2 ? check === rem : check === 11 - rem;
}

export function normalizeShaba(raw: string): string {
  const cleaned = toEnglishDigits(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.startsWith('IR')) return cleaned.slice(0, 26);
  const digits = cleaned.replace(/\D/g, '').slice(0, 24);
  return digits ? `IR${digits}` : '';
}

export function validateShaba(raw: string): { valid: boolean; bankName: string; normalized: string } {
  const normalized = normalizeShaba(raw);
  if (!/^IR\d{24}$/.test(normalized)) {
    return { valid: false, bankName: '', normalized };
  }
  const bankCode = normalized.slice(4, 7);
  const bankName = IRAN_BANKS_BY_CODE[bankCode] || 'بانک عضو شتاب';
  return { valid: true, bankName, normalized };
}

export function getOrCreateDeviceId(): string {
  try {
    const raw = localStorage.getItem(HAMKAR_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed.device_unique_id) return parsed.device_unique_id;
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `web_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
    localStorage.setItem(HAMKAR_SESSION_KEY, JSON.stringify({ ...parsed, device_unique_id: id }));
    return id;
  } catch {
    return `web_${Date.now()}`;
  }
}

export function readStoredHamkarSession(): {
  logged_in_phone?: string;
  is_logged_in?: boolean;
  is_online?: boolean;
  device_unique_id?: string;
  active_session_token?: string;
  displaced_other_device?: boolean;
  cached_specialist?: HamkarSpecialistProfile | null;
} {
  try {
    const raw = localStorage.getItem(HAMKAR_SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeStoredHamkarSession(patch: Record<string, unknown>): void {
  try {
    const current = readStoredHamkarSession();
    localStorage.setItem(HAMKAR_SESSION_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {}
}

export function clearStoredHamkarLogin(): void {
  const current = readStoredHamkarSession();
  writeStoredHamkarSession({
    device_unique_id: current.device_unique_id || getOrCreateDeviceId(),
    logged_in_phone: '',
    is_logged_in: false,
    active_session_token: '',
    displaced_other_device: false,
    cached_specialist: null,
  });
}

/** فشرده‌سازی تصویر طبق قانون سخت ۱ مگابایت تندیس همکار (حداکثر 700px، JPEG 65%) */
export async function compressHamkarImageStrict(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('حجم تصویر نباید بیشتر از ۱ مگابایت باشد');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خطا در خواندن فایل تصویر'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('فرمت تصویر معتبر نیست'));
      img.onload = () => {
        const maxSide = 700;
        const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('خطا در پردازش تصویر'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        resolve(dataUrl);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

/** استخراج لیست کامل مهارت‌های قابل انتخاب (داینامیک سرور + کاتالوگ پیش‌فرض) */
export function buildHamkarSkillCatalog(dynamicCategories?: unknown[]): HamkarSkillOption[] {
  const list: HamkarSkillOption[] = [];
  const seen = new Set<string>();

  const pushOpt = (opt: HamkarSkillOption) => {
    const key = `${opt.categoryCode}::${opt.roleTitle}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(opt);
  };

  if (Array.isArray(dynamicCategories) && dynamicCategories.length > 0) {
    for (const raw of dynamicCategories as Array<Record<string, unknown>>) {
      const groupTitle = String(raw.title || raw.name || 'خدمات تخصصی').trim();
      const groupSlug = String(raw.slug || raw.id || '').trim();
      const subs = Array.isArray(raw.subcategories) ? (raw.subcategories as Array<Record<string, unknown>>) : [];
      if (subs.length > 0) {
        for (const s of subs) {
          pushOpt({
            categoryCode: String(s.id || s.slug || groupSlug),
            categoryGroup: groupTitle,
            roleTitle: String(s.title || s.name || groupTitle).trim(),
            subtitle: String(s.subtitle || s.description || '').trim(),
          });
        }
      } else if (groupSlug) {
        pushOpt({
          categoryCode: groupSlug,
          categoryGroup: groupTitle,
          roleTitle: groupTitle,
        });
      }
    }
  }

  for (const grp of DEFAULT_CATEGORIES) {
    if (grp.isComingSoon) continue;
    for (const sub of grp.subcategories) {
      pushOpt({
        categoryCode: sub.id,
        categoryGroup: grp.title,
        roleTitle: sub.title,
        subtitle: sub.subtitle,
      });
    }
  }

  return list;
}

/** نرمال‌سازی وضعیت ماموریت طبق Aliasهای تندیس همکار */
export function normalizeMissionStep(rawStatus?: string): MissionStep {
  const st = String(rawStatus || '').trim().toUpperCase();
  if (['PENDING', 'PENDING_NEARBY', 'SEARCHING', 'NEW', ''].includes(st)) return 'PENDING_NEARBY';
  if (['ACCEPTED', 'ACCEPTED_BY_SPECIALIST', 'SPECIALIST_ACCEPTED', 'ASSIGNED'].includes(st)) return 'ACCEPTED';
  if (['EN_ROUTE', 'SPECIALIST_EN_ROUTE', 'ON_THE_WAY'].includes(st)) return 'EN_ROUTE';
  if (
    [
      'IN_PROGRESS',
      'ARRIVED',
      'STARTED',
      'WORKING',
      'AWAITING_PAYMENT',
      'AWAITING_ONLINE_PAYMENT',
      'CANCEL_REQUESTED',
      'CANCEL_REQUESTED_BY_CUSTOMER',
      'PENDING_CANCEL',
      'PRICE_DISAGREEMENT',
      'REJECTED_PRICE',
    ].includes(st)
  ) {
    return 'IN_PROGRESS';
  }
  if (['COMPLETED', 'DONE', 'FINISHED'].includes(st)) return 'COMPLETED';
  if (['CANCELLED', 'CANCELED'].includes(st)) return 'CANCELLED';
  return 'PENDING_NEARBY';
}

export function isOrderPaidOnline(order: HamkarOrderItem): boolean {
  const tags = String(order.customer_quality_tags || '');
  return Boolean(
    order.is_paid_online ||
      String(order.payment_status || '').toUpperCase() === 'PAID' ||
      String(order.payment_status || '').toUpperCase() === 'PAID_ONLINE' ||
      String(order.payment_status || '').toUpperCase() === 'SETTLED' ||
      /IS_PAID_ONLINE:1|PAY_STATUS:PAID|PAID:TRUE/i.test(tags) ||
      order.dossier?.is_paid_online
  );
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeFa(s?: string): string {
  return String(s || '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function resolveOrderCity(order: HamkarOrderItem): string {
  if (order.city && order.city.trim()) return order.city.trim();

  const haystack = normalizeFa(
    [order.car_plate, order.neighborhood, order.home_address, order.customer_name, order.issue_description].join(' ')
  );
  for (const c of ALL_IRAN_CITIES) {
    if (haystack.includes(normalizeFa(c.name))) return c.name;
  }

  if (order.customer_lat && order.customer_lng) {
    let bestCity = '';
    let bestDist = Infinity;
    for (const c of ALL_IRAN_CITIES) {
      const d = haversineKm(order.customer_lat, order.customer_lng, c.lat, c.lng);
      if (d < bestDist) {
        bestDist = d;
        bestCity = c.name;
      }
    }
    if (bestDist <= 25 && bestCity) return bestCity;
  }

  if (order.customer_city_from_profile) return order.customer_city_from_profile;
  return '';
}

export function isBeautySpecialistProfile(spec: HamkarSpecialistProfile | null): boolean {
  if (!spec) return false;
  const code = String(spec.categoryCode || '').toLowerCase();
  const grp = normalizeFa(spec.categoryGroup);
  const role = normalizeFa(spec.roleTitle);
  return (
    code === 'cat-beauty-personal' ||
    code.startsWith('beauty-') ||
    grp.includes('زیبایی') ||
    role.includes('زیبایی') ||
    role.includes('آرایش') ||
    role.includes('کراتین') ||
    role.includes('ناخن')
  );
}

/** الگوریتم دقیق تطبیق سفارش رادار با شهر و مهارت متخصص */
export function doesRequestMatchSpecialistSkillAndCity(
  order: HamkarOrderItem,
  spec: HamkarSpecialistProfile
): boolean {
  const specPhone = normalizeIranPhone(spec.phone);
  const assignedPhone = normalizeIranPhone(order.assigned_specialist_phone || order.assigned_specialist_id || '');
  if (assignedPhone && assignedPhone === specPhone) return true;

  // تطبیق سخت‌گیرانه شهر
  const orderCity = normalizeFa(resolveOrderCity(order));
  const specCity = normalizeFa(spec.serviceCity);
  if (specCity && orderCity && orderCity !== specCity) {
    return false;
  }

  // تطبیق مهارت
  const oCat = String(order.service_category_id || '').trim().toLowerCase();
  const sCat = String(spec.categoryCode || '').trim().toLowerCase();
  if (oCat && sCat && oCat === sCat) return true;

  // هم‌ارزی حقوقی
  const isLegalOrder =
    oCat.startsWith('legal-') || oCat === 'cat-legal-judicial' || normalizeFa(order.service_title).includes('وکیل');
  const isLegalSpec =
    sCat.startsWith('legal-') || sCat === 'cat-legal-judicial' || normalizeFa(spec.roleTitle).includes('وکیل');
  if (isLegalOrder && isLegalSpec) return true;

  // هم‌ارزی زیبایی
  const isBeautyOrder =
    oCat.startsWith('beauty-') ||
    oCat === 'cat-beauty-personal' ||
    normalizeFa(order.service_title).includes('زیبایی') ||
    normalizeFa(order.service_title).includes('نوبت رزرو زیبایی');
  if (isBeautyOrder && isBeautySpecialistProfile(spec)) return true;

  // هم‌ارزی مکانیک و خودرو
  const isAutoOrder = oCat === 'cat-car-mechanic' || oCat === 'auto-mobile-mechanic';
  const isAutoSpec = sCat === 'cat-car-mechanic' || sCat === 'auto-mobile-mechanic';
  if (isAutoOrder && isAutoSpec) return true;

  // تطابق متنی نرمال‌شده بین عنوان سفارش و عنوان مهارت متخصص
  const oTitle = normalizeFa(order.service_title);
  const sTitle = normalizeFa(spec.roleTitle);
  const sGroup = normalizeFa(spec.categoryGroup);
  if (oTitle && sTitle && (oTitle.includes(sTitle) || sTitle.includes(oTitle))) return true;
  if (oTitle && sGroup && oTitle.includes(sGroup)) return true;

  return false;
}

export function resolveCommissionPercent(
  config: HamkarCommissionConfig | null | undefined,
  categoryCode: string
): number {
  const defaultRate = Number(config?.default_rate_percent ?? 15);
  const rates = config?.category_rates || {};
  if (categoryCode && typeof rates[categoryCode] === 'number') {
    return rates[categoryCode];
  }
  return defaultRate;
}

export function buildFullName14(params: {
  fullName: string;
  nationalCode: string;
  birthDate: string;
  roleTitle: string;
  categoryCode: string;
  categoryGroup: string;
  businessName: string;
  serviceCity: string;
  serviceAddress: string;
  serviceLat: number;
  serviceLng: number;
  skillDescription: string;
  approvalStatus: HamkarApprovalStatus;
  trackingCode: string;
  shabaNumber: string;
  personnelCode: string;
}): string {
  const seg11 = `${params.approvalStatus}::TRACK-${params.trackingCode}::SHABA-${params.shabaNumber}`;
  const seg13 = `PERSONNEL_CODE:${params.personnelCode}`;
  return [
    params.fullName,
    params.nationalCode,
    params.birthDate || '1370/01/01',
    params.roleTitle,
    params.categoryCode,
    params.categoryGroup,
    params.businessName || 'متخصص سیار تندیس',
    params.serviceCity,
    params.serviceAddress,
    `${params.serviceLat},${params.serviceLng}`,
    params.skillDescription || 'متخصص تاییدشده تندیس',
    seg11,
    params.trackingCode,
    seg13,
  ].join(' | ');
}

async function putOrPostReview(id: string, payload: Record<string, unknown>): Promise<void> {
  const putRes = await fetch(`/api/v1/reviews/${encodeURIComponent(id)}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);
  if (!putRes || !putRes.ok) {
    await fetch('/api/v1/reviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

/* ==================== API Calls ==================== */

export async function sendHamkarOtp(phone: string): Promise<{ ok: boolean; message: string; expiresInSeconds: number }> {
  const resp = await fetch('/api/hamkar/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.ok === false) {
    throw new Error(data.message || 'ارسال کد تایید ناموفق بود.');
  }
  return {
    ok: true,
    message: data.message || 'کد تایید ۵ رقمی پیامک شد.',
    expiresInSeconds: Number(data.expiresInSeconds || 120),
  };
}

export async function verifyHamkarOtp(
  phone: string,
  code: string
): Promise<{
  ok: boolean;
  phone: string;
  approvalStatus: HamkarApprovalStatus;
  specialist: HamkarSpecialistProfile | null;
}> {
  const resp = await fetch('/api/hamkar/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.ok === false) {
    throw new Error(data.message || 'کد تایید نادرست یا منقضی است.');
  }
  return data;
}

export async function checkHamkarNationalCode(
  code: string,
  phone: string
): Promise<{ available: boolean; message?: string }> {
  const resp = await fetch(
    `/api/hamkar/check-national-code?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`
  );
  const data = await resp.json().catch(() => ({ available: false, message: 'خطا در بررسی کد ملی' }));
  return { available: Boolean(data.available), message: data.message };
}

export async function fetchHamkarLiveState(phone: string): Promise<HamkarLiveStatePayload> {
  const resp = await fetch(`/api/hamkar/live-state?phone=${encodeURIComponent(phone)}`);
  if (!resp.ok) throw new Error('خطا در همگام‌سازی زنده تندیس همکار');
  return resp.json();
}

export async function acquireHamkarSessionLock(
  phone: string,
  specialistName: string
): Promise<{ sessionToken: string; displacedOther: boolean }> {
  const deviceId = getOrCreateDeviceId();
  const sessionToken = `sess_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  let displacedOther = false;

  try {
    const existingRes = await fetch(`/api/v1/reviews/session_lock_${encodeURIComponent(phone)}/`);
    if (existingRes.ok) {
      const existing = await existingRes.json();
      const parsed: Partial<HamkarSessionLock> = JSON.parse(existing.comment || '{}');
      if (parsed.active && parsed.device_id && parsed.device_id !== deviceId) {
        displacedOther = true;
      }
    }
  } catch {}

  const lockJson: HamkarSessionLock = {
    phone,
    device_id: deviceId,
    session_token: sessionToken,
    active: true,
    updated_at_epoch: Date.now(),
  };

  await putOrPostReview(`session_lock_${phone}`, {
    id: `session_lock_${phone}`,
    request_id: 'SESSION_LOCK',
    specialist_phone: phone,
    specialist_name: specialistName || 'متخصص تندیس',
    customer_name: 'SESSION_LOCK',
    service_title: 'ACTIVE_DEVICE_SESSION',
    rating: 5,
    stars: 5,
    comment: JSON.stringify(lockJson),
    quality_tags: 'DEVICE_LOCK:ACTIVE',
    created_at_epoch: Date.now(),
    synced_with_django: true,
  });

  writeStoredHamkarSession({
    logged_in_phone: phone,
    is_logged_in: true,
    device_unique_id: deviceId,
    active_session_token: sessionToken,
    displaced_other_device: displacedOther,
  });

  return { sessionToken, displacedOther };
}

export async function releaseHamkarSessionLock(phone: string): Promise<void> {
  const session = readStoredHamkarSession();
  try {
    const existingRes = await fetch(`/api/v1/reviews/session_lock_${encodeURIComponent(phone)}/`);
    if (existingRes.ok) {
      const existing = await existingRes.json();
      const parsed: Partial<HamkarSessionLock> = JSON.parse(existing.comment || '{}');
      if (!parsed.device_id || parsed.device_id === session.device_unique_id) {
        await fetch(`/api/v1/reviews/session_lock_${encodeURIComponent(phone)}/`, { method: 'DELETE' }).catch(() => {});
      }
    }
  } catch {}
  clearStoredHamkarLogin();
}

/** ثبت‌نام سه‌مسیره (Triple-Write) متخصص جدید */
export async function registerHamkarTripleWrite(params: {
  phone: string;
  fullName: string;
  nationalCode: string;
  birthDate: string;
  roleTitle: string;
  categoryCode: string;
  categoryGroup: string;
  businessName: string;
  skillDescription: string;
  serviceCity: string;
  serviceAddress: string;
  serviceLat: number;
  serviceLng: number;
  shabaNumber: string;
  profilePhoto: string;
  shenasnamehPhoto: string;
  nationalCardPhoto: string;
  skillLicensePhoto: string;
  trackingCode: string;
  personnelCode: string;
}): Promise<void> {
  const fullName14 = buildFullName14({
    ...params,
    approvalStatus: 'PENDING_ADMIN_APPROVAL',
  });

  const docsJson = JSON.stringify({
    phone: params.phone,
    profile_photo: params.profilePhoto,
    shenasnameh_photo: params.shenasnamehPhoto,
    national_card_photo: params.nationalCardPhoto,
    skill_license_photo: params.skillLicensePhoto,
  });

  // مسیر A: customers/register/
  await fetch('/api/v1/customers/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: `hamkar_${params.phone}`,
      full_name: fullName14,
      is_active_session: false,
      profile_photo: params.profilePhoto,
      shenasnameh_photo: params.shenasnamehPhoto,
      national_card_photo: params.nationalCardPhoto,
      skill_license_photo: params.skillLicensePhoto,
      personnel_code: params.personnelCode,
      role_title: params.roleTitle,
      category_code: params.categoryCode,
      category_group: params.categoryGroup,
      service_city: params.serviceCity,
      approval_status: 'PENDING_ADMIN_APPROVAL',
      shaba_number: params.shabaNumber,
    }),
  });

  // مسیر B: reviews/docs_hamkar_{phone}/
  await putOrPostReview(`docs_hamkar_${params.phone}`, {
    id: `docs_hamkar_${params.phone}`,
    request_id: 'SPECIALIST_DOCS',
    specialist_phone: params.phone,
    specialist_name: params.fullName,
    customer_name: 'SYSTEM_DOCS',
    service_title: params.roleTitle,
    rating: 5,
    stars: 5,
    comment: docsJson,
    quality_tags: 'DOCS_UPLOADED',
    created_at_epoch: Date.now(),
    synced_with_django: true,
  });

  // مسیر C: requests/docs_hamkar_{phone}
  await fetch('/api/v1/requests/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `docs_hamkar_${params.phone}`,
      service_category_id: 'SPECIALIST_DOCS',
      service_title: 'مدارک احراز هویت متخصص',
      customer_name: params.fullName,
      customer_phone: params.phone,
      status: 'COMPLETED',
      customer_review_comment: docsJson,
      created_at_epoch: Date.now(),
      synced_with_django: true,
    }),
  }).catch(() => {});

  // ذخیره آواتار در spec_profile_{phone}
  if (params.profilePhoto) {
    await putOrPostReview(`spec_profile_${params.phone}`, {
      id: `spec_profile_${params.phone}`,
      request_id: 'SPECIALIST_PROFILE',
      specialist_phone: params.phone,
      specialist_name: params.fullName,
      customer_name: 'SYSTEM',
      service_title: 'SPECIALIST_PROFILE',
      rating: 5,
      stars: 5,
      comment: params.profilePhoto,
      quality_tags: 'AVATAR_UPDATED',
      created_at_epoch: Date.now(),
      synced_with_django: true,
    });
  }
}

/** بروزرسانی پروفایل متخصص (آنلاین/آفلاین، شهر، شبا، مهارت، آواتار) */
export async function syncSpecialistProfileUpdate(
  spec: HamkarSpecialistProfile,
  patch: Partial<HamkarSpecialistProfile>
): Promise<HamkarSpecialistProfile> {
  const updated: HamkarSpecialistProfile = { ...spec, ...patch };
  const fullName14 = buildFullName14(updated);

  await fetch('/api/v1/customers/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: `hamkar_${updated.phone}`,
      full_name: fullName14,
      is_active_session: updated.isOnline,
      profile_photo: updated.profilePhoto || undefined,
      personnel_code: updated.personnelCode,
      role_title: updated.roleTitle,
      category_code: updated.categoryCode,
      category_group: updated.categoryGroup,
      service_city: updated.serviceCity,
      approval_status: updated.approvalStatus,
      shaba_number: updated.shabaNumber,
    }),
  });

  if (patch.profilePhoto) {
    await putOrPostReview(`spec_profile_${updated.phone}`, {
      id: `spec_profile_${updated.phone}`,
      request_id: 'SPECIALIST_PROFILE',
      specialist_phone: updated.phone,
      specialist_name: updated.fullName,
      customer_name: 'SYSTEM',
      service_title: 'SPECIALIST_PROFILE',
      rating: 5,
      stars: 5,
      comment: patch.profilePhoto,
      quality_tags: 'AVATAR_UPDATED',
      created_at_epoch: Date.now(),
      synced_with_django: true,
    });
  }

  return updated;
}

/** پذیرش سفارش از رادار + آینه mission_ + پیامک مشتری آفلاین */
export async function acceptOrderFromRadar(
  order: HamkarOrderItem,
  spec: HamkarSpecialistProfile,
  avgRating: number
): Promise<void> {
  const now = Date.now();
  const distKm =
    order.customer_lat && order.customer_lng && spec.serviceLat && spec.serviceLng
      ? Math.max(0.4, Number(haversineKm(spec.serviceLat, spec.serviceLng, order.customer_lat, order.customer_lng).toFixed(1)))
      : 1.4;
  const etaMin = Math.max(5, Math.round(distKm * 4));
  const tags = `TS_ACCEPT:${now}`;

  const payload = {
    specialist_id: spec.phone,
    specialist_name: spec.fullName,
    specialist_phone: spec.phone,
    specialist_plate: spec.roleTitle,
    specialist_rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : 5.0,
    specialist_lat: spec.serviceLat,
    specialist_lng: spec.serviceLng,
    distance_km: distKm,
    eta_minutes: etaMin,
    status: 'ACCEPTED',
    assigned_specialist_id: spec.phone,
    assigned_specialist_name: spec.fullName,
    assigned_specialist_phone: spec.phone,
    assigned_specialist_plate: spec.roleTitle,
    assigned_specialist_rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : 5.0,
    customer_quality_tags: tags,
  };

  let res = await fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/accept/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res || !res.ok) {
    res = await fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);
  }
  if (!res || !res.ok) {
    await fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, ...payload }),
    }).catch(() => {});
  }

  await putOrPostReview(`mission_${order.id}`, {
    id: `mission_${order.id}`,
    request_id: order.id,
    specialist_phone: spec.phone,
    specialist_name: spec.fullName,
    customer_name: order.customer_name || 'مشتری تندیس',
    service_title: 'MISSION_SYNC',
    rating: 5,
    stars: 5,
    comment: JSON.stringify({
      request_id: order.id,
      status: 'ACCEPTED',
      specialist_name: spec.fullName,
      specialist_phone: spec.phone,
      specialist_plate: spec.roleTitle,
      specialty: spec.roleTitle,
      specialist_avatar: spec.profilePhoto || null,
      updated_at_epoch: now,
    }),
    quality_tags: tags,
    created_at_epoch: now,
    synced_with_django: true,
  });

  // پیامک پذیرش برای مشتری آفلاین
  await fetch('/api/hamkar/notify-customer-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerPhone: order.customer_phone,
      specialistName: spec.fullName,
      serviceTitle: order.service_title,
    }),
  }).catch(() => {});
}

/** تغییر وضعیت ماموریت (IN_PROGRESS / COMPLETED) */
export async function updateMissionStatus(
  order: HamkarOrderItem,
  spec: HamkarSpecialistProfile,
  nextStatus: 'IN_PROGRESS' | 'COMPLETED',
  commissionConfig?: HamkarCommissionConfig
): Promise<void> {
  if (nextStatus === 'COMPLETED' && !isOrderPaidOnline(order)) {
    throw new Error('اتمام کار تا زمان پرداخت آنلاین فاکتور توسط مشتری قفل است.');
  }

  const now = Date.now();
  const prevTags = String(order.customer_quality_tags || '');
  const acceptMatch = prevTags.match(/TS_ACCEPT:(\d+)/);
  const startMatch = prevTags.match(/TS_START:(\d+)/);
  let nextTags = prevTags;

  if (nextStatus === 'IN_PROGRESS') {
    const arriveMin = acceptMatch ? Math.max(1, Math.round((now - Number(acceptMatch[1])) / 60000)) : 10;
    nextTags = [prevTags, `TS_START:${now}`, `ARRIVE_MIN:${arriveMin}`].filter(Boolean).join('|');
  } else if (nextStatus === 'COMPLETED') {
    const workMin = startMatch ? Math.max(1, Math.round((now - Number(startMatch[1])) / 60000)) : 20;
    nextTags = [prevTags, `TS_DONE:${now}`, `WORK_MIN:${workMin}`].filter(Boolean).join('|');
  }

  const payload = {
    status: nextStatus,
    specialist_lat: spec.serviceLat,
    specialist_lng: spec.serviceLng,
    distance_km: 0.1,
    eta_minutes: 1,
    customer_quality_tags: nextTags,
  };

  let res = await fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/status/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res || !res.ok) {
    await fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  await putOrPostReview(`mission_${order.id}`, {
    id: `mission_${order.id}`,
    request_id: order.id,
    specialist_phone: spec.phone,
    specialist_name: spec.fullName,
    customer_name: order.customer_name || 'مشتری تندیس',
    service_title: 'MISSION_SYNC',
    rating: 5,
    stars: 5,
    comment: JSON.stringify({
      request_id: order.id,
      status: nextStatus,
      specialist_name: spec.fullName,
      specialist_phone: spec.phone,
      specialist_plate: spec.roleTitle,
      specialist_avatar: spec.profilePhoto || null,
      price_toman: order.price_toman,
      is_paid_online: isOrderPaidOnline(order),
      updated_at_epoch: now,
    }),
    quality_tags: nextTags,
    created_at_epoch: now,
    synced_with_django: true,
  });

  if (nextStatus === 'COMPLETED' && !order.is_commission_settled && order.price_toman > 0) {
    await settlePaidOrderCommissionIdempotent(order, spec, commissionConfig);
  }
}

/** لغو ماموریت فعال توسط متخصص و بازگشت به رادار */
export async function cancelActiveMission(order: HamkarOrderItem): Promise<void> {
  const payload = {
    status: 'PENDING_NEARBY',
    assigned_specialist_id: '',
    assigned_specialist_name: '',
    assigned_specialist_phone: '',
    assigned_specialist_plate: '',
    specialist_id: '',
    specialist_name: '',
    specialist_phone: '',
    specialist_plate: '',
  };
  await Promise.all([
    fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}),
    fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}),
    fetch(`/api/v1/reviews/mission_${encodeURIComponent(order.id)}/`, { method: 'DELETE' }).catch(() => {}),
  ]);
}

/** تایید لغو مشتری بابت عدم توافق قیمت */
export async function confirmCustomerPriceDisagreementCancellation(
  order: HamkarOrderItem,
  spec: HamkarSpecialistProfile
): Promise<void> {
  const nextTags = [order.customer_quality_tags || '', 'CANCEL_CONFIRMED_BY_SPECIALIST:1'].filter(Boolean).join('|');
  const payload = {
    status: 'CANCELLED',
    cancel_requested_by_customer: false,
    customer_quality_tags: nextTags,
  };

  await Promise.all([
    fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}),
    fetch(`/api/v1/requests/${encodeURIComponent(order.id)}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}),
    putOrPostReview(`mission_${order.id}`, {
      id: `mission_${order.id}`,
      request_id: order.id,
      specialist_phone: spec.phone,
      specialist_name: spec.fullName,
      customer_name: order.customer_name || 'مشتری تندیس',
      service_title: 'MISSION_SYNC',
      rating: 5,
      stars: 5,
      comment: JSON.stringify({
        request_id: order.id,
        status: 'CANCELLED',
        note: 'CUSTOMER_CANCEL_CONFIRMED',
        updated_at_epoch: Date.now(),
      }),
      quality_tags: 'CUSTOMER_CANCEL_CONFIRMED',
      created_at_epoch: Date.now(),
      synced_with_django: true,
    }),
    fetch(`/api/v1/reviews/cancel_req_${encodeURIComponent(order.id)}/`, { method: 'DELETE' }).catch(() => {}),
  ]);
}

/** صدور فاکتور ۴-مسیره (requests + pricing_ + dossier_ + mission_) */
export async function submitSpecialistFinalPrice(params: {
  order: HamkarOrderItem;
  spec: HamkarSpecialistProfile;
  mode: InvoiceEntryMode;
  lineItems: InvoiceLineItem[];
  grossAmountToman: number;
  description: string;
  invoicePhotoBase64?: string | null;
  commissionPercent: number;
}): Promise<InvoiceDossier> {
  if (params.grossAmountToman < 1000) {
    throw new Error('حداقل مبلغ فاکتور ۱,۰۰۰ تومان است.');
  }

  const now = Date.now();
  const adminCommissionToman = Math.round(params.grossAmountToman * (params.commissionPercent / 100));
  const specialistNetToman = params.grossAmountToman - adminCommissionToman;
  const partsDesc =
    params.mode === 'ITEMIZED'
      ? params.lineItems.map((l) => `${l.title} (${l.quantity} عدد)`).join('، ')
      : params.description || 'مبلغ توافقی';

  const qualityTags = [
    `PRICE_TOMAN:${params.grossAmountToman}`,
    `COMM_PCT:${params.commissionPercent}`,
    `ADMIN_COMM:${adminCommissionToman}`,
    `SPEC_NET:${specialistNetToman}`,
    'PAY_STATUS:AWAITING_ONLINE_PAYMENT',
    'PAY_MODE:ONLINE',
    'IS_PAID_ONLINE:0',
    `INVOICE_DESC:${params.description.slice(0, 120)}`,
  ].join('|');

  const dossier: InvoiceDossier = {
    request_id: params.order.id,
    tracking_code: `TND-${params.order.id.slice(-6).toUpperCase()}`,
    service_title: params.order.service_title,
    customer_name: params.order.customer_name,
    customer_phone: params.order.customer_phone,
    specialist_name: params.spec.fullName,
    specialist_phone: params.spec.phone,
    invoice_mode: params.mode,
    line_items: params.lineItems,
    total_amount_toman: params.grossAmountToman,
    commission_percent: params.commissionPercent,
    admin_commission_toman: adminCommissionToman,
    specialist_net_toman: specialistNetToman,
    description: params.description,
    invoice_photo_base64: params.invoicePhotoBase64 || null,
    issued_at_epoch: now,
    is_paid_online: false,
  };

  // ۱. PATCH requests/{id}/
  await fetch(`/api/v1/requests/${encodeURIComponent(params.order.id)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_toman: params.grossAmountToman,
      invoice_description: params.description,
      parts_description: partsDesc,
      is_paid_online: false,
      customer_quality_tags: qualityTags,
    }),
  }).catch(() => {});

  // ۲. pricing_{id}
  await putOrPostReview(`pricing_${params.order.id}`, {
    id: `pricing_${params.order.id}`,
    request_id: params.order.id,
    specialist_phone: params.spec.phone,
    specialist_name: params.spec.fullName,
    customer_name: params.order.customer_name,
    service_title: 'SPECIALIST_PRICE_ENTRY',
    rating: 5,
    stars: 5,
    comment: JSON.stringify({
      request_id: params.order.id,
      price_toman: params.grossAmountToman,
      commission_percent: params.commissionPercent,
      admin_commission_toman: adminCommissionToman,
      specialist_net_toman: specialistNetToman,
      invoice_description: params.description,
      invoice_mode: params.mode,
      is_paid_online: false,
      payment_status: 'UNPAID',
      updated_at_epoch: now,
    }),
    quality_tags: qualityTags,
    created_at_epoch: now,
    synced_with_django: true,
  });

  // ۳. dossier_{id} (تکرار بدون عکس در صورت خطا)
  const dossierBody = {
    id: `dossier_${params.order.id}`,
    request_id: params.order.id,
    specialist_phone: params.spec.phone,
    specialist_name: params.spec.fullName,
    customer_name: params.order.customer_name,
    service_title: 'INVOICE_DOSSIER',
    rating: 5,
    stars: 5,
    comment: JSON.stringify(dossier),
    quality_tags: qualityTags,
    created_at_epoch: now,
    synced_with_django: true,
  };
  const dRes = await fetch(`/api/v1/reviews/dossier_${encodeURIComponent(params.order.id)}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dossierBody),
  }).catch(() => null);
  if (!dRes || !dRes.ok) {
    const pRes = await fetch('/api/v1/reviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dossierBody),
    }).catch(() => null);
    if ((!pRes || !pRes.ok) && params.invoicePhotoBase64) {
      await putOrPostReview(`dossier_${params.order.id}`, {
        ...dossierBody,
        comment: JSON.stringify({ ...dossier, invoice_photo_base64: null }),
      });
    }
  }

  // ۴. mission_{id}
  await putOrPostReview(`mission_${params.order.id}`, {
    id: `mission_${params.order.id}`,
    request_id: params.order.id,
    specialist_phone: params.spec.phone,
    specialist_name: params.spec.fullName,
    customer_name: params.order.customer_name,
    service_title: 'MISSION_SYNC',
    rating: 5,
    stars: 5,
    comment: JSON.stringify({
      request_id: params.order.id,
      status: normalizeMissionStep(params.order.status),
      specialist_name: params.spec.fullName,
      specialist_phone: params.spec.phone,
      specialist_plate: params.spec.roleTitle,
      specialist_avatar: params.spec.profilePhoto || null,
      price_toman: params.grossAmountToman,
      invoice_mode: params.mode,
      invoice_items: params.lineItems,
      invoice_description: params.description,
      is_paid_online: false,
      updated_at_epoch: now,
    }),
    quality_tags: qualityTags,
    created_at_epoch: now,
    synced_with_django: true,
  });

  return dossier;
}

/** تقسیم خودکار کمیسیون و شارژ کیف پول متخصص و مدیر (Idempotent) */
export async function settlePaidOrderCommissionIdempotent(
  order: HamkarOrderItem,
  spec: HamkarSpecialistProfile,
  commissionConfig?: HamkarCommissionConfig
): Promise<void> {
  if (!order.price_toman || order.price_toman <= 0) return;

  // بررسی عدم ثبت قبلی tx_settlement_
  const txCheck = await fetch(`/api/v1/reviews/tx_settlement_${encodeURIComponent(order.id)}/`).catch(() => null);
  if (txCheck && txCheck.ok) return;

  const rate = resolveCommissionPercent(commissionConfig, order.service_category_id || spec.categoryCode);
  const adminCommission = Math.round(order.price_toman * (rate / 100));
  const specialistNet = order.price_toman - adminCommission;
  const now = Date.now();

  await putOrPostReview(`tx_settlement_${order.id}`, {
    id: `tx_settlement_${order.id}`,
    request_id: order.id,
    specialist_phone: spec.phone,
    specialist_name: spec.fullName,
    customer_name: order.customer_name,
    service_title: 'COMMISSION_SETTLEMENT',
    rating: 5,
    stars: 5,
    comment: JSON.stringify({
      type: 'COMMISSION_SPLIT_SETTLEMENT',
      request_id: order.id,
      gross_toman: order.price_toman,
      commission_percent: rate,
      admin_commission_toman: adminCommission,
      specialist_net_toman: specialistNet,
      settled_at_epoch: now,
    }),
    quality_tags: 'SETTLED:TRUE',
    created_at_epoch: now,
    synced_with_django: true,
  });

  // بروزرسانی کیف پول متخصص
  let curSpecBal = 0;
  let curSpecTotal = 0;
  let curSpecIds: string[] = [];
  try {
    const wRes = await fetch(`/api/v1/reviews/wallet_hamkar_${encodeURIComponent(spec.phone)}/`);
    if (wRes.ok) {
      const wData = await wRes.json();
      const parsed = JSON.parse(wData.comment || '{}');
      curSpecBal = Number(parsed.balance_toman ?? parsed.wallet_balance_toman ?? 0);
      curSpecTotal = Number(parsed.total_net_earned_toman ?? 0);
      curSpecIds = Array.isArray(parsed.settled_request_ids) ? parsed.settled_request_ids : [];
    }
  } catch {}

  if (!curSpecIds.includes(order.id)) {
    const nextBal = curSpecBal + specialistNet;
    const nextTotal = curSpecTotal + specialistNet;
    const nextIds = [...curSpecIds, order.id].slice(-200);
    await putOrPostReview(`wallet_hamkar_${spec.phone}`, {
      id: `wallet_hamkar_${spec.phone}`,
      request_id: `WALLET_${spec.phone}`,
      specialist_phone: spec.phone,
      specialist_name: spec.fullName,
      customer_name: 'SYSTEM',
      service_title: 'WALLET_LEDGER',
      rating: 5,
      stars: 5,
      comment: JSON.stringify({
        balance_toman: nextBal,
        wallet_balance_toman: nextBal,
        total_net_earned_toman: nextTotal,
        settled_request_ids: nextIds,
        updated_at_epoch: now,
      }),
      quality_tags: 'WALLET_LEDGER',
      created_at_epoch: now,
      synced_with_django: true,
    });
  }

  // بروزرسانی کیف پول مدیر
  let curAdminBal = 0;
  let curAdminTotal = 0;
  let curAdminIds: string[] = [];
  try {
    const aRes = await fetch('/api/v1/reviews/wallet_admin/');
    if (aRes.ok) {
      const aData = await aRes.json();
      const parsed = JSON.parse(aData.comment || '{}');
      curAdminBal = Number(parsed.balance_toman ?? parsed.wallet_balance_toman ?? 0);
      curAdminTotal = Number(parsed.total_commission_toman ?? 0);
      curAdminIds = Array.isArray(parsed.settled_request_ids) ? parsed.settled_request_ids : [];
    }
  } catch {}

  if (!curAdminIds.includes(order.id)) {
    const nextAdminBal = curAdminBal + adminCommission;
    const nextAdminTotal = curAdminTotal + adminCommission;
    const nextIds = [...curAdminIds, order.id].slice(-200);
    await putOrPostReview('wallet_admin', {
      id: 'wallet_admin',
      request_id: 'SYSTEM_WALLET_ADMIN',
      specialist_phone: 'admin',
      specialist_name: 'تندیس مدیر',
      customer_name: 'SYSTEM',
      service_title: 'WALLET_LEDGER',
      rating: 5,
      stars: 5,
      comment: JSON.stringify({
        balance_toman: nextAdminBal,
        wallet_balance_toman: nextAdminBal,
        total_commission_toman: nextAdminTotal,
        settled_request_ids: nextIds,
        updated_at_epoch: now,
      }),
      quality_tags: 'WALLET_LEDGER',
      created_at_epoch: now,
      synced_with_django: true,
    });
  }
}

/** درخواست تسویه آنی به شبا */
export async function submitSpecialistSettlementRequest(params: {
  spec: HamkarSpecialistProfile;
  amountToman: number;
  commissionPercent: number;
  completedOrders: HamkarOrderItem[];
}): Promise<void> {
  if (params.amountToman <= 0) throw new Error('موجودی قابل تسویه صفر است.');
  const shabaCheck = validateShaba(params.spec.shabaNumber);
  if (!shabaCheck.valid) throw new Error('ابتدا شماره شبای معتبر در حساب کاربری ثبت کنید.');

  const now = Date.now();
  const settlementId = `settlement_${params.spec.phone}_${now}`;
  const payload = {
    settlement_id: settlementId,
    specialist_phone: params.spec.phone,
    specialist_name: params.spec.fullName,
    shaba_number: shabaCheck.normalized,
    amount_toman: params.amountToman,
    commission_percent: params.commissionPercent,
    status: 'PENDING_APPROVAL',
    payment_method: 'CASH',
    requested_at_epoch: now,
    invoice_breakdowns: params.completedOrders.slice(0, 15).map((o) => {
      const comm = Math.round((o.price_toman || 0) * (params.commissionPercent / 100));
      return {
        request_id: o.id,
        service_title: o.service_title,
        gross_toman: o.price_toman || 0,
        commission_toman: comm,
        net_toman: (o.price_toman || 0) - comm,
      };
    }),
  };

  await Promise.all([
    fetch('/api/v1/reviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: settlementId,
        request_id: 'SPECIALIST_SETTLEMENT',
        specialist_phone: params.spec.phone,
        specialist_name: params.spec.fullName,
        customer_name: 'SYSTEM',
        service_title: 'SPECIALIST_SETTLEMENT',
        rating: 5,
        stars: 5,
        comment: JSON.stringify(payload),
        quality_tags: 'SETTLEMENT:PENDING_APPROVAL:CASH',
        created_at_epoch: now,
        synced_with_django: true,
      }),
    }),
    fetch('/api/v1/settlements/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}),
  ]);
}

/** ارسال تیکت پشتیبانی به مدیریت (با Fallback به tkt_req_*) */
export async function submitHamkarSupportTicket(params: {
  phone: string;
  fullName: string;
  subject: string;
  message: string;
}): Promise<void> {
  const id = `tkt_${Math.random().toString(16).slice(2, 10)}`;
  const res = await fetch('/api/v1/support/tickets/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      sender_phone: params.phone,
      sender_name: params.fullName,
      sender_role: 'SPECIALIST',
      subject: params.subject,
      message: params.message,
      status: 'OPEN',
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    await fetch('/api/v1/requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `tkt_req_${Math.random().toString(16).slice(2, 10)}`,
        service_category_id: 'support_ticket',
        service_title: params.subject,
        customer_name: params.fullName,
        customer_phone: params.phone,
        issue_description: params.message,
        status: 'PENDING_NEARBY',
        created_at_epoch: Date.now(),
        synced_with_django: true,
      }),
    });
  }
}

/** ذخیره پروفایل جامع زیبایی در reviews/spec_profile_{phone} */
export async function saveBeautySpecialistProfile(profile: BeautySpecialistProfileJson): Promise<void> {
  await putOrPostReview(`spec_profile_${profile.phone}`, {
    id: `spec_profile_${profile.phone}`,
    request_id: 'BEAUTY_SPECIALIST_PROFILE',
    specialist_phone: profile.phone,
    specialist_name: profile.full_name,
    customer_name: 'SYSTEM',
    service_title: 'BEAUTY_SPECIALIST_PROFILE',
    rating: Math.round(profile.rating || 5),
    stars: Math.round(profile.rating || 5),
    comment: JSON.stringify(profile),
    quality_tags: 'BEAUTY_PROFILE_SYNCED',
    created_at_epoch: Date.now(),
    synced_with_django: true,
  });
}

/** ذخیره تقویم ۳۰ روزه نوبت‌دهی زیبایی در reviews/beauty_slots_{phone} */
export async function saveBeauty30DaySchedule(
  spec: HamkarSpecialistProfile,
  schedule: BeautySchedulePayload
): Promise<void> {
  await putOrPostReview(`beauty_slots_${spec.phone}`, {
    id: `beauty_slots_${spec.phone}`,
    request_id: 'BEAUTY_SCHEDULE',
    specialist_phone: spec.phone,
    specialist_name: spec.fullName,
    customer_name: 'SYSTEM',
    service_title: 'BEAUTY_SCHEDULE',
    rating: 5,
    stars: 5,
    comment: JSON.stringify(schedule),
    quality_tags: 'BEAUTY_SCHEDULE_30D',
    created_at_epoch: Date.now(),
    synced_with_django: true,
  });
}

/** لغو و آزادی ساعت نوبت زیبایی */
export async function cancelHamkarBeautyAppointment(apt: HamkarBeautyAppointment): Promise<void> {
  const updated = { ...apt, status: 'CANCELLED_REFUNDED' };
  await putOrPostReview(apt.id, {
    id: apt.id,
    request_id: 'BEAUTY_BOOKING',
    specialist_phone: apt.specialist_phone,
    customer_name: apt.customer_name,
    service_title: 'BEAUTY_APPOINTMENT_BOOKING',
    rating: 5,
    stars: 5,
    comment: JSON.stringify(updated),
    quality_tags: 'STATUS:CANCELLED_REFUNDED',
    created_at_epoch: Date.now(),
    synced_with_django: true,
  });
}

/** تولید تقویم ۳۰ روز آینده شمسی برای پنل زیبایی */
export function buildDefault30DayBeautySchedule(phone: string): BeautySchedulePayload {
  const weekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const jalali = formatter.format(d);
    const isFri = d.getDay() === 5;
    days.push({
      date_key: d.toISOString().slice(0, 10),
      jalali_label: jalali,
      weekday_fa: i === 0 ? 'امروز' : i === 1 ? 'فردا' : weekdays[d.getDay()],
      is_open: !isFri,
      time_slots: isFri ? [] : ['۱۰:۰۰', '۱۲:۰۰', '۱۶:۰۰', '۱۸:۰۰'],
    });
  }
  return {
    specialist_phone: phone,
    updated_at_epoch: Date.now(),
    days,
  };
}
