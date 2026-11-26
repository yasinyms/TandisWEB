import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import { createAdminRouter } from './adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DJANGO_BASE_URL =
  (
    process.env.TANDIS_DJANGO_BASE_URL ||
    process.env.TANDIS_API_URL ||
    'http://62.3.42.195:8000/api/v1/'
  ).replace(/\/+$/, '') + '/';

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '20mb' }));

function normalizePhone(raw) {
  if (!raw) return '';
  const map = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  const cleaned = String(raw)
    .trim()
    .replace(/^hamkar_/i, '')
    .replace(/^tandispay_/i, '')
    .split('')
    .map((c) => map[c] || c)
    .filter((c) => /\d/.test(c))
    .join('');
  if (cleaned.startsWith('989') && cleaned.length === 12) return '0' + cleaned.slice(2);
  if (cleaned.startsWith('00989') && cleaned.length === 14) return '0' + cleaned.slice(4);
  if (cleaned.startsWith('9') && cleaned.length === 10) return '0' + cleaned;
  return cleaned;
}

function toStandardDigits(raw) {
  if (raw == null) return '';
  const map = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return String(raw)
    .split('')
    .map((c) => map[c] || c)
    .join('');
}

function normalizeStrictIranPhone(raw) {
  const digits = toStandardDigits(raw).trim().replace(/\D/g, '');
  return /^09\d{9}$/.test(digits) ? digits : '';
}

function isSmsGatewayConfigRecord(rec) {
  const id = String(rec?.id || '').trim().toLowerCase();
  const reqId = String(rec?.request_id || '').trim().toUpperCase();
  const cat = String(rec?.service_category_id || '').trim().toUpperCase();
  const specName = String(rec?.specialist_name || '').trim();
  return (
    id === 'config_sms_gateway' ||
    reqId === 'SYSTEM_SMS_CONFIG' ||
    cat === 'SYSTEM_SMS_CONFIG' ||
    specName === 'تنظیمات درگاه پیامک تندیس'
  );
}

function isSystemOrNonCustomerRecord(req) {
  if (isSmsGatewayConfigRecord(req)) return true;
  const id = String(req?.id || '').trim().toLowerCase();
  const cat = String(req?.service_category_id || '').trim().toUpperCase();
  const reqId = String(req?.request_id || '').trim().toUpperCase();
  const model = String(req?.car_model || '').trim().toUpperCase();
  return (
    id.startsWith('ticket_') ||
    id.startsWith('tkt_') ||
    id.startsWith('docs_') ||
    id.startsWith('hamkar_') ||
    id.startsWith('admin_') ||
    id.startsWith('config_') ||
    id.startsWith('wallet_') ||
    id.startsWith('slider_') ||
    id.startsWith('catslider_') ||
    id.startsWith('mission_') ||
    id.startsWith('dossier_') ||
    id.startsWith('pricing_') ||
    id.startsWith('payment_') ||
    id.startsWith('cancel_req_') ||
    id.startsWith('spec_profile_') ||
    id.startsWith('presence_') ||
    id.startsWith('loan_') ||
    id.startsWith('settlement_') ||
    id.startsWith('session_lock_') ||
    id.startsWith('name_override_') ||
    id.startsWith('beauty_apt_') ||
    id.startsWith('beauty_booking_') ||
    id.startsWith('beauty_slots_') ||
    id.startsWith('beauty_spec_') ||
    id.startsWith('part_inquiry_') ||
    id.startsWith('parts_order_') ||
    id.startsWith('blocked_') ||
    id.startsWith('notif_') ||
    id.startsWith('user_notif_state_') ||
    [
      'SUPPORT_TICKET', 'SPECIALIST_DOCS', 'SYSTEM_CONFIG', 'SYSTEM_SMS_CONFIG', 'SYSTEM_CATEGORIES',
      'SYSTEM_SLIDERS', 'CATEGORY_SLIDERS', 'CUSTOMER_WALLET', 'WALLET',
      'MISSION_SYNC', 'SPECIALIST_PROFILE', 'SPECIALIST_SETTLEMENT',
      'LOAN', 'TANDIS_PAY', 'TANDIS_PAY_LOAN', 'CUSTOMER_PRESENCE', 'SESSION_LOCK',
      'NAME_OVERRIDE', 'BEAUTY_SCHEDULE', 'BEAUTY_SPECIALIST_PROFILE',
      'BEAUTY_APPOINTMENT', 'PART_INQUIRY', 'PARTS_ORDER',
      'ADMIN_NOTIFICATION', 'SYSTEM_NOTIFICATION', 'BROADCAST_NOTIFICATION', 'USER_NOTIF_STATE'
    ].includes(cat) ||
    reqId === 'SYSTEM_SMS_CONFIG' ||
    model === 'SPECIALIST_DOCS' ||
    model === 'SYSTEM_CONFIG'
  );
}

function sanitizeSpecialtyText(raw) {
  if (!raw) return '';
  const cleaned = String(raw)
    .replace(/\s*\|\s*AVATAR[:;].*$/i, '')
    .replace(/\bAVATAR[:;].*$/i, '')
    .replace(/data:image.*$/i, '')
    .split('|')[0]
    .trim();
  if (!cleaned || /^(http|data:image|AVATAR)/i.test(cleaned)) return '';
  return cleaned;
}

function extractAvatarUrl(rawPlate, rawName) {
  for (const src of [rawPlate, rawName]) {
    if (!src) continue;
    const str = String(src);
    const match = str.match(/AVATAR[:;]([^|]+)/i);
    if (match && match[1]?.trim()) return match[1].trim();
    if (/^(https?:\/\/|data:image)/i.test(str.trim())) return str.trim();
  }
  return null;
}

async function fetchDjangoJson(subPath, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const targetUrl = DJANGO_BASE_URL + subPath.replace(/^\/+/, '');
    const resp = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await resp.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    return { ok: resp.ok, status: resp.status, data: json };
  } finally {
    clearTimeout(timer);
  }
}

const APK_DOWNLOAD_CATALOG = {
  'tandis-customer.apk': {
    driveId: '19toi3KhoZqldyXxWMHUKz3p4tl2A1a4y',
    asciiFilename: 'Tandis-SuperApp.apk',
    utf8Filename: 'تندیس.apk'
  },
  'tandis-hamkar.apk': {
    driveId: '1rvSKNOef_EnpnN7kwnMW_cgoojvqaF1W',
    asciiFilename: 'Tandis-Hamkar.apk',
    utf8Filename: 'تندیس-همکار.apk'
  }
};

app.get('/api/tandis/downloads/:appKey', async (req, res) => {
  const entry = APK_DOWNLOAD_CATALOG[String(req.params.appKey || '').trim()];
  if (!entry) {
    return res.status(404).json({ ok: false, message: 'فایل برنامه مورد نظر یافت نشد.' });
  }
  const driveUrl = `https://drive.usercontent.google.com/download?id=${entry.driveId}&export=download&confirm=t`;
  try {
    const upstream = await fetch(driveUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({
        ok: false,
        message: 'دریافت فایل نصب از مخزن مرکزی موقتاً با خطا روبرو شد. لطفاً لحظاتی دیگر تلاش کنید.'
      });
    }
    const contentLength = upstream.headers.get('content-length');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${entry.asciiFilename}"; filename*=UTF-8''${encodeURIComponent(entry.utf8Filename)}`
    );
    res.setHeader('Cache-Control', 'public, max-age=300');
    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on('error', () => {
      if (!res.headersSent) {
        res.status(502).end();
      } else {
        res.end();
      }
    });
    nodeStream.pipe(res);
  } catch {
    return res.status(502).json({
      ok: false,
      message: 'خطا در برقراری ارتباط برای دانلود فایل برنامه. لطفاً مجدداً تلاش کنید.'
    });
  }
});

app.get('/api/tandis/health', async (_req, res) => {
  try {
    const result = await fetchDjangoJson('health/');
    res.status(result.status).json({
      online: result.ok,
      upstream: result.data,
      serverTimestamp: Date.now()
    });
  } catch (err) {
    res.status(503).json({
      online: false,
      error: String(err?.message || err),
      serverTimestamp: Date.now()
    });
  }
});

const OTP_TTL_MS = 120 * 1000;
const SMS_CONFIG_CACHE_TTL_MS = 60 * 1000;
const IRANPAYAMAK_PATTERN_URL = 'https://api.iranpayamak.com/ws/v1/sms/pattern';

// حافظه موقت سرور رابط برای نشست‌های کد تایید و تنظیمات درگاه پیامک (هرگز به مرورگر ارسال نمی‌شود)
const otpSessions = new Map();
let smsGatewayConfigCache = null;
let smsGatewayConfigLoadedAt = 0;

function cleanupExpiredOtpSessions() {
  const now = Date.now();
  for (const [phoneKey, entry] of otpSessions.entries()) {
    if (!entry || entry.expiresAt <= now) {
      otpSessions.delete(phoneKey);
    }
  }
}

function parseSmsGatewayConfigFromReviews(allReviews) {
  const matched = (Array.isArray(allReviews) ? allReviews : [])
    .filter((r) => isSmsGatewayConfigRecord(r))
    .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0));

  for (let i = matched.length - 1; i >= 0; i -= 1) {
    const rawComment = String(matched[i]?.comment || '').trim();
    if (!rawComment) continue;
    const stripped = rawComment.replace(/^SMS_CONFIG_JSON\s*:\s*/i, '').trim();
    try {
      const parsed = JSON.parse(stripped);
      const apiKey = String(parsed.api_key || '').trim();
      const patternCode = String(parsed.pattern_code || '').trim();
      const lineNumber = String(parsed.line_number || '').trim();
      const backupLineNumber = String(parsed.backup_line_number || '').trim();
      if (apiKey && patternCode && (lineNumber || backupLineNumber)) {
        return {
          api_key: apiKey,
          pattern_code: patternCode,
          line_number: lineNumber || backupLineNumber,
          backup_line_number: backupLineNumber && backupLineNumber !== lineNumber ? backupLineNumber : ''
        };
      }
    } catch {}
  }
  return null;
}

async function getSmsGatewayConfig(preloadedReviews = null, forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    smsGatewayConfigCache &&
    now - smsGatewayConfigLoadedAt < SMS_CONFIG_CACHE_TTL_MS
  ) {
    return smsGatewayConfigCache;
  }

  let reviews = preloadedReviews;
  if (!Array.isArray(reviews)) {
    const revRes = await fetchDjangoJson('reviews/');
    reviews = Array.isArray(revRes.data) ? revRes.data : [];
  }

  const parsed = parseSmsGatewayConfigFromReviews(reviews);
  if (parsed) {
    smsGatewayConfigCache = parsed;
    smsGatewayConfigLoadedAt = now;
    return parsed;
  }

  if (smsGatewayConfigCache) {
    return smsGatewayConfigCache;
  }
  return null;
}

function extractIranPayamakErrorMessage(payload, httpStatus) {
  if (!payload || typeof payload !== 'object') {
    return httpStatus >= 500
      ? 'درگاه پیامک موقتاً پاسخگو نیست. لطفاً چند لحظه دیگر تلاش کنید.'
      : 'ارسال پیامک از سوی درگاه ناموفق بود. لطفاً مجدداً تلاش کنید.';
  }
  const msg = payload.message ?? payload.error ?? payload.detail;
  if (typeof msg === 'string' && msg.trim()) {
    return /[\u0600-\u06FF]/.test(msg)
      ? msg.trim()
      : 'ارسال پیامک از سوی درگاه با خطا مواجه شد. لطفاً لحظاتی دیگر مجدداً تلاش کنید.';
  }
  if (msg && typeof msg === 'object') {
    const firstList = Object.values(msg).flat().filter((v) => typeof v === 'string' && v.trim());
    if (firstList.length > 0 && /[\u0600-\u06FF]/.test(firstList[0])) {
      return firstList[0].trim();
    }
  }
  return 'ارسال پیامک از سوی درگاه ناموفق بود. لطفاً دقایقی دیگر تلاش کنید.';
}

async function sendIranPayamakSingleLine(cfg, lineNumber, phone, numericCode) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch(IRANPAYAMAK_PATTERN_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Api-Key': cfg.api_key
      },
      body: JSON.stringify({
        code: cfg.pattern_code,
        attributes: { code: numericCode },
        recipient: phone,
        line_number: lineNumber,
        number_format: 'english'
      })
    });
    const text = await resp.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    const statusStr = String(data?.status || '').toLowerCase();
    const succeeded = resp.ok && statusStr !== 'error' && statusStr !== 'failed' && data?.ok !== false;
    if (succeeded) {
      return { ok: true };
    }
    return {
      ok: false,
      error: extractIranPayamakErrorMessage(data, resp.status)
    };
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return {
      ok: false,
      error: isAbort
        ? 'پاسخ‌گویی درگاه پیامک بیش از حد طول کشید. لطفاً مجدداً تلاش کنید.'
        : 'برقراری ارتباط با درگاه پیامک ناموفق بود. لطفاً اتصال اینترنت را بررسی کرده و دوباره تلاش کنید.'
    };
  } finally {
    clearTimeout(timer);
  }
}

async function dispatchOtpViaIranPayamak(cfg, phone, otpCode) {
  const numericCode = Number(otpCode);
  const lines = [cfg.line_number, cfg.backup_line_number].filter(
    (line, idx, arr) => Boolean(line) && arr.indexOf(line) === idx
  );
  if (lines.length === 0) {
    return { ok: false, error: 'خط ارسال پیامک در تنظیمات سامانه تعریف نشده است.' };
  }

  let lastError = 'ارسال پیامک کد تایید ناموفق بود.';
  for (const line of lines) {
    const attempt = await sendIranPayamakSingleLine(cfg, line, phone, numericCode);
    if (attempt.ok) {
      return { ok: true };
    }
    lastError = attempt.error || lastError;
  }
  return { ok: false, error: lastError };
}

function inspectCustomerAccountData(phone, allCustomers, allReviews) {
  const customerRecord =
    allCustomers.find(
      (c) => normalizePhone(c.phone) === phone && !String(c.phone || '').toLowerCase().startsWith('hamkar_')
    ) || null;

  const hamkarRecord =
    allCustomers.find(
      (c) => String(c.phone || '').toLowerCase() === `hamkar_${phone}`
    ) || null;

  const blockReview = allReviews
    .filter(
      (r) =>
        (String(r.id || '') === `blocked_${phone}` ||
          String(r.request_id || '').toUpperCase() === 'ACCOUNT_BLOCK') &&
        normalizePhone(r.customer_phone) === phone
    )
    .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0))
    .pop();

  let isBlocked = Boolean(
    customerRecord?.is_blocked || String(customerRecord?.status || '').toUpperCase() === 'BLOCKED'
  );
  let blockReason = '';
  if (blockReview?.comment) {
    try {
      const parsed = JSON.parse(blockReview.comment);
      if (typeof parsed.is_blocked === 'boolean') isBlocked = parsed.is_blocked;
      blockReason = String(parsed.reason || '').trim();
    } catch {}
  }

  // استخراج نام و شهر ثبت‌شده کاربر (با اولویت رکورد تغییر نام)
  let cleanFullName = '';
  let storedCity = '';
  if (customerRecord) {
    const rawParts = String(customerRecord.full_name || '').split('|');
    cleanFullName = (rawParts[0] || '').trim();
    const cityFromName = (rawParts[1] || '').trim();
    storedCity = String(customerRecord.city || '').trim() || cityFromName;
  }

  const nameOverrideRev = allReviews
    .filter(
      (r) =>
        String(r.id || '') === `name_override_${phone}` ||
        (String(r.request_id || '').toUpperCase() === 'NAME_OVERRIDE' &&
          normalizePhone(r.customer_phone) === phone)
    )
    .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0))
    .pop();

  if (nameOverrideRev?.comment) {
    try {
      const nObj = JSON.parse(nameOverrideRev.comment);
      if (nObj.full_name && String(nObj.full_name).trim()) {
        cleanFullName = String(nObj.full_name).split('|')[0].trim();
      }
      if (nObj.city && String(nObj.city).trim()) {
        storedCity = String(nObj.city).trim();
      }
    } catch {}
  }

  return {
    phone,
    existsAsCustomer: Boolean(customerRecord),
    hasHamkarCollision: Boolean(hamkarRecord && !customerRecord),
    hasDualAccount: Boolean(hamkarRecord && customerRecord),
    isBlocked,
    blockReason,
    cleanFullName,
    storedCity,
    customer: customerRecord
  };
}

app.get('/api/tandis/account-check', async (req, res) => {
  const phone = normalizePhone(req.query.phone || '');
  if (!phone) {
    return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  }
  try {
    const [customersRes, reviewsRes] = await Promise.all([
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }))
    ]);
    const allCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];
    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    const info = inspectCustomerAccountData(phone, allCustomers, allReviews);

    res.json({
      phone: info.phone,
      existsAsCustomer: info.existsAsCustomer,
      hasHamkarCollision: info.hasHamkarCollision,
      hasDualAccount: info.hasDualAccount,
      isBlocked: info.isBlocked,
      blockReason: info.blockReason,
      customer: info.customer,
      fullName: info.cleanFullName,
      city: info.storedCity
    });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// مسیر اختصاصی ارسال کد تایید پیامکی واقعی (هماهنگ با نسخه موبایل تندیس)
app.post('/api/tandis/auth/send-otp', async (req, res) => {
  cleanupExpiredOtpSessions();
  const phone = normalizeStrictIranPhone(req.body?.phone || '');
  if (!phone) {
    return res.status(400).json({
      ok: false,
      message: 'شماره موبایل معتبر نیست. شماره باید دقیقاً ۱۱ رقم باشد و با ۰۹ شروع شود.'
    });
  }

  try {
    const [customersRes, reviewsRes] = await Promise.all([
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }))
    ]);
    const allCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];
    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

    const account = inspectCustomerAccountData(phone, allCustomers, allReviews);
    if (account.isBlocked) {
      return res.status(403).json({
        ok: false,
        message:
          account.blockReason ||
          'حساب کاربری شما مسدود شده است و امکان ورود وجود ندارد. لطفاً با پشتیبانی تندیس تماس بگیرید.'
      });
    }

    const smsCfg = await getSmsGatewayConfig(allReviews, allReviews.length > 0);
    if (!smsCfg) {
      return res.status(503).json({
        ok: false,
        message: 'تنظیمات درگاه پیامک تندیس در سرور مرکزی یافت نشد. لطفاً با پشتیبانی تماس بگیرید.'
      });
    }

    const otpCode = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + OTP_TTL_MS;

    // ذخیره موقت کد ۶ رقمی با مهلت اعتبار ۱۲۰ ثانیه در حافظه سرور رابط
    otpSessions.set(phone, {
      code: otpCode,
      createdAt: Date.now(),
      expiresAt
    });

    // فراخوانی هم‌زمان مسیر ارسال کد سرور مرکزی و ارسال پیامک الگویی ایران‌پیامک
    const [, smsResult] = await Promise.all([
      fetchDjangoJson('auth/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone })
      }).catch(() => ({ ok: false })),
      dispatchOtpViaIranPayamak(smsCfg, phone, otpCode)
    ]);

    if (!smsResult.ok) {
      otpSessions.delete(phone);
      return res.status(502).json({
        ok: false,
        message: smsResult.error || 'ارسال پیامک کد تایید از طریق درگاه ناموفق بود. لطفاً مجدداً تلاش کنید.'
      });
    }

    return res.json({
      ok: true,
      message: 'کد تایید ۶ رقمی با موفقیت به شماره موبایل شما پیامک شد.',
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      existsAsCustomer: account.existsAsCustomer,
      hasHamkarCollision: account.hasHamkarCollision,
      fullName: account.cleanFullName,
      city: account.storedCity
    });
  } catch {
    otpSessions.delete(phone);
    return res.status(500).json({
      ok: false,
      message: 'خطا در برقراری ارتباط با سامانه پیامک تندیس. لطفاً لحظاتی دیگر تلاش کنید.'
    });
  }
});

// مسیر اختصاصی تایید کد پیامکی ۶ رقمی روی سرور رابط
app.post('/api/tandis/auth/verify-otp', async (req, res) => {
  cleanupExpiredOtpSessions();
  const phone = normalizeStrictIranPhone(req.body?.phone || '');
  const cleanCode = toStandardDigits(req.body?.code || '').trim().replace(/\D/g, '');

  if (!phone) {
    return res.status(400).json({
      ok: false,
      message: 'شماره موبایل معتبر نیست. شماره باید دقیقاً ۱۱ رقم باشد و با ۰۹ شروع شود.'
    });
  }
  if (!/^\d{6}$/.test(cleanCode)) {
    return res.status(400).json({
      ok: false,
      message: 'لطفاً کد تایید ۶ رقمی پیامک‌شده را به‌طور کامل وارد کنید.'
    });
  }

  const session = otpSessions.get(phone);
  if (!session) {
    return res.status(400).json({
      ok: false,
      message: 'کد تایید فعالی برای این شماره یافت نشد یا منقضی شده است. لطفاً دوباره درخواست کد دهید.'
    });
  }
  if (Date.now() > session.expiresAt) {
    otpSessions.delete(phone);
    return res.status(400).json({
      ok: false,
      message: 'مهلت دو دقیقه‌ای کد تایید به پایان رسیده است. لطفاً کد جدید دریافت کنید.'
    });
  }
  if (session.code !== cleanCode) {
    return res.status(400).json({
      ok: false,
      message: 'کد تایید واردشده نادرست است. لطفاً پیامک دریافتی را دوباره بررسی کنید.'
    });
  }

  // حذف نشست موقت پس از تایید موفق
  otpSessions.delete(phone);

  try {
    const [, customersRes, reviewsRes] = await Promise.all([
      fetchDjangoJson('auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone, code: cleanCode })
      }).catch(() => ({ ok: false })),
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }))
    ]);

    const allCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];
    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    const account = inspectCustomerAccountData(phone, allCustomers, allReviews);

    if (account.isBlocked) {
      return res.status(403).json({
        ok: false,
        message:
          account.blockReason ||
          'حساب کاربری شما مسدود شده است. لطفاً با پشتیبانی تندیس تماس بگیرید.'
      });
    }

    return res.json({
      ok: true,
      phone,
      existsAsCustomer: account.existsAsCustomer,
      fullName: account.cleanFullName,
      city: account.storedCity,
      message: 'ورود به حساب کاربری با موفقیت تایید شد.'
    });
  } catch {
    return res.json({
      ok: true,
      phone,
      existsAsCustomer: false,
      fullName: '',
      city: '',
      message: 'ورود با موفقیت تایید شد.'
    });
  }
});

app.get('/api/tandis/live-state', async (req, res) => {
  const phone = normalizePhone(req.query.phone || '');
  try {
    const [reviewsRes, requestsRes, customersRes, categoriesRes, directSupportRes] = await Promise.all([
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('requests/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('categories/').catch(() => ({ ok: false, data: [] })),
      phone
        ? fetchDjangoJson(`support/tickets/?phone=${encodeURIComponent(phone)}`).catch(() => ({ ok: false, data: [] }))
        : Promise.resolve({ ok: false, data: [] })
    ]);

    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    const allRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
    const allCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];

    // ۱. استخراج تصویر پروفایل همکاران از پروفایل و مدارک
    const avatarByPhone = new Map();
    for (const c of allCustomers) {
      const cp = normalizePhone(c.phone);
      const av = extractAvatarUrl('', c.full_name);
      if (cp && av) avatarByPhone.set(cp, av);
    }
    for (const r of allReviews) {
      const rid = String(r.id || '');
      if (rid.startsWith('spec_profile_') || r.request_id === 'SPECIALIST_PROFILE' || rid.startsWith('docs_hamkar_') || r.request_id === 'SPECIALIST_DOCS') {
        try {
          const obj = JSON.parse(r.comment || '{}');
          const p = normalizePhone(obj.phone || r.customer_phone || rid.replace('docs_hamkar_', ''));
          const av = obj.avatar_url || obj.photo_url || obj.image_url || obj.profile_photo;
          if (p && av) avatarByPhone.set(p, av);
        } catch {}
      }
    }

    // ۲. استخراج تنظیمات از راه دور (OTA)
    let otaConfig = null;
    const otaReviews = allReviews
      .filter((r) => ['app_ota_config_customer', 'app_ota_config'].includes(String(r.id || '').toLowerCase()))
      .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0));
    if (otaReviews.length > 0) {
      try {
        otaConfig = JSON.parse(otaReviews[otaReviews.length - 1].comment || '{}');
      } catch {}
    }

    // ۳. استخراج دسته‌بندی‌ها و اسلایدرهای پویا (ادغام config_categories و مسیر /categories/)
    let categories = null;
    const catRev = allReviews
      .filter((r) => r.id === 'config_categories' || r.request_id === 'SYSTEM_CATEGORIES')
      .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0))
      .pop();
    if (catRev?.comment) {
      try {
        categories = JSON.parse(catRev.comment);
      } catch {}
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      if (Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
        categories = categoriesRes.data;
      }
    }

    let sliders = null;
    const sliderRev = allReviews
      .filter((r) => r.id === 'config_sliders' || r.request_id === 'SYSTEM_SLIDERS')
      .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0))
      .pop();
    if (sliderRev?.comment) {
      try {
        sliders = JSON.parse(sliderRev.comment);
      } catch {}
    }

    let categorySliders = null;
    const catSliderRev = allReviews
      .filter((r) => r.id === 'config_category_sliders' || r.request_id === 'CATEGORY_SLIDERS')
      .sort((a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0))
      .pop();
    if (catSliderRev?.comment) {
      try {
        categorySliders = JSON.parse(catSliderRev.comment);
      } catch {}
    }

    // ۴. استخراج پرونده ماموریت‌ها، فاکتورها و لغو سفارش‌ها
    const missionMap = new Map();
    const cancelledRequestIds = new Set();
    const sortedReviews = [...allReviews].sort(
      (a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0)
    );
    for (const rev of sortedReviews) {
      const rid = String(rev.id || '');
      if (rid.startsWith('cancel_req_')) {
        const cancelledId = rid.slice('cancel_req_'.length).trim();
        if (cancelledId) cancelledRequestIds.add(cancelledId);
        continue;
      }
      const prefix = ['dossier_', 'pricing_', 'payment_', 'mission_'].find((p) => rid.startsWith(p));
      if (!prefix) continue;
      const targetId = rid.slice(prefix.length);
      if (!targetId || targetId.startsWith('docs_') || targetId.startsWith('tkt_')) continue;
      const prev = missionMap.get(targetId) || {};
      let parsed = {};
      if (String(rev.comment || '').trim().startsWith('{')) {
        try {
          parsed = JSON.parse(rev.comment);
        } catch {}
      }
      const qualityTagsStr = String(rev.quality_tags || '');
      const price = Number(
        parsed.total_amount_toman || parsed.final_price_toman || parsed.price_toman || parsed.amount_toman || prev.price_toman || 0
      );
      const isPaid = Boolean(
        parsed.is_paid_online ||
        parsed.payment_status === 'PAID_ONLINE' ||
        parsed.payment_status === 'PAID' ||
        parsed.payment_status === 'SETTLED' ||
        /PAID:true|PAY_STATUS:PAID_ONLINE|PAY_STATUS:SETTLED|IS_PAID_ONLINE:true/i.test(qualityTagsStr) ||
        prev.is_paid_online
      );
      const isExplicitInvoiceRecord =
        prefix === 'pricing_' ||
        prefix === 'dossier_' ||
        /PAY_STATUS:AWAITING_ONLINE_PAYMENT/i.test(qualityTagsStr) ||
        Boolean(parsed.invoice_mode);
      const revStatus = String(parsed.status || '').trim().toUpperCase();
      if (revStatus === 'CANCELLED') {
        cancelledRequestIds.add(targetId);
      }
      missionMap.set(targetId, {
        status: revStatus || prev.status || '',
        specialist_name: parsed.specialist_name || parsed.assigned_specialist_name || rev.specialist_name || prev.specialist_name || '',
        specialist_phone: parsed.specialist_phone || parsed.assigned_specialist_phone || prev.specialist_phone || '',
        specialist_specialty: sanitizeSpecialtyText(parsed.specialty || parsed.specialist_plate || prev.specialist_specialty),
        specialist_avatar: parsed.specialist_avatar || parsed.avatar_url || prev.specialist_avatar || null,
        price_toman: price > 0 ? price : (prev.price_toman || 0),
        has_specialist_invoice: Boolean(prev.has_specialist_invoice || (isExplicitInvoiceRecord && price > 0)),
        invoice_items: Array.isArray(parsed.invoice_items) && parsed.invoice_items.length > 0 ? parsed.invoice_items : (prev.invoice_items || []),
        diagnosis_description: parsed.invoice_description || parsed.diagnosis_description || parsed.description || prev.diagnosis_description || '',
        invoice_photo_base64: parsed.invoice_photo_base64 || parsed.photo_base64 || prev.invoice_photo_base64 || null,
        is_paid_online: isPaid,
        payment_reference_id: parsed.payment_reference_id || prev.payment_reference_id || '',
        invoice_updated_at: Number(parsed.updated_at_epoch || rev.created_at_epoch || prev.invoice_updated_at || 0)
      });
    }

    const STATUS_RANK = {
      PENDING: 1,
      PENDING_NEARBY: 1,
      SEARCHING: 1,
      ACCEPTED: 2,
      ASSIGNED: 2,
      ARRIVED: 3,
      IN_PROGRESS: 4,
      AWAITING_PAYMENT: 5,
      AWAITING_ONLINE_PAYMENT: 5,
      COMPLETED: 10,
      CANCELLED: 10
    };

    function resolveEffectiveStatus(reqId, reqStatusRaw, missionStatusRaw) {
      const reqStatus = String(reqStatusRaw || '').trim().toUpperCase();
      const missionStatus = String(missionStatusRaw || '').trim().toUpperCase();
      if (cancelledRequestIds.has(reqId) || reqStatus === 'CANCELLED' || missionStatus === 'CANCELLED') {
        return 'CANCELLED';
      }
      if (reqStatus === 'COMPLETED' || missionStatus === 'COMPLETED') {
        return 'COMPLETED';
      }
      const reqRank = STATUS_RANK[reqStatus] || 0;
      const misRank = STATUS_RANK[missionStatus] || 0;
      if (misRank > reqRank && missionStatus) return missionStatus;
      return reqStatus || missionStatus || 'PENDING_NEARBY';
    }

    // ۵. فیلتر کامل پرونده‌های سیستمی و تمیزسازی سفارش‌های مشتری (کاربر مهمان بدون ورود هیچ سفارشی دریافت نمی‌کند)
    const cleanRequests = phone
      ? allRequests
          .filter((r) => !isSystemOrNonCustomerRecord(r))
          .filter((r) => normalizePhone(r.customer_phone) === phone)
          .map((r) => {
            const m = missionMap.get(r.id) || {};
            const effectiveStatus = resolveEffectiveStatus(r.id, r.status, m.status);
            const specPhone = normalizePhone(m.specialist_phone || r.assigned_specialist_phone);
            const cleanSpecialty = sanitizeSpecialtyText(m.specialist_specialty || r.assigned_specialist_plate) || 'متخصص تاییدشده تندیس';
            const avatar = m.specialist_avatar || extractAvatarUrl(r.assigned_specialist_plate, r.assigned_specialist_name) || (specPhone ? avatarByPhone.get(specPhone) : null);
            const effectivePrice = Number(m.price_toman || r.price_toman || 0);
            const isPaid = Boolean(m.is_paid_online || r.is_paid_online || /PAID_ONLINE/i.test(r.customer_quality_tags || ''));
            return {
              ...r,
              status: effectiveStatus,
              assigned_specialist_name: (m.specialist_name || r.assigned_specialist_name || '').split('|')[0].trim() || null,
              assigned_specialist_phone: m.specialist_phone || r.assigned_specialist_phone || null,
              clean_specialist_specialty: cleanSpecialty,
              specialist_avatar_url: avatar || null,
              price_toman: effectivePrice,
              has_specialist_invoice: Boolean(m.has_specialist_invoice && effectivePrice > 0),
              invoice_items: m.invoice_items || [],
              invoice_description: m.diagnosis_description || r.invoice_description || '',
              invoice_photo_base64: m.invoice_photo_base64 || null,
              is_paid_online: isPaid,
              payment_reference_id: m.payment_reference_id || r.payment_reference_id || '',
              invoice_updated_at: m.invoice_updated_at || r.created_at_epoch || 0
            };
          })
          .sort((a, b) => Number(b.created_at_epoch || 0) - Number(a.created_at_epoch || 0))
      : [];

    // ۶. کیف پول و نام کاربری مشتری فعال
    let walletBalanceToman = 0;
    let activeCustomer = null;
    let isBlocked = false;
    if (phone) {
      activeCustomer = allCustomers.find(
        (c) => normalizePhone(c.phone) === phone && !String(c.phone || '').toLowerCase().startsWith('hamkar_')
      ) || null;
      const walletRev = sortedReviews.filter((r) => r.id === `wallet_${phone}`).pop();
      if (walletRev?.comment) {
        try {
          const wObj = JSON.parse(walletRev.comment);
          walletBalanceToman = Number(wObj.balance_toman ?? wObj.wallet_balance_toman ?? 0);
        } catch {}
      } else if (activeCustomer?.wallet_balance_toman != null) {
        walletBalanceToman = Number(activeCustomer.wallet_balance_toman);
      }

      const nameOverrideRev = sortedReviews.filter((r) => r.id === `name_override_${phone}` || (r.request_id === 'NAME_OVERRIDE' && normalizePhone(r.customer_phone) === phone)).pop();
      if (nameOverrideRev?.comment) {
        try {
          const nObj = JSON.parse(nameOverrideRev.comment);
          if (nObj.full_name && activeCustomer) {
            activeCustomer = {
              ...activeCustomer,
              full_name: nObj.city ? `${nObj.full_name} | ${nObj.city}` : nObj.full_name
            };
          }
        } catch {}
      }

      const blockRev = sortedReviews.filter((r) => r.id === `blocked_${phone}`).pop();
      if (blockRev?.comment) {
        try {
          const bObj = JSON.parse(blockRev.comment);
          isBlocked = Boolean(bObj.is_blocked);
        } catch {}
      }
      if (activeCustomer?.is_blocked || String(activeCustomer?.status || '').toUpperCase() === 'BLOCKED') {
        isBlocked = true;
      }
    }

    // ۷. پروفایل‌های زیبایی، مهارت‌های چندگانه (کراتین، آرایش مو، ناخن، پوست و...) و تقویم نوبت‌های زنده
    const beautyMap = new Map();

    // ابتدا همکاران تاییدشده در دسته «زیبایی و سلامت» را از جدول customers استخراج می‌کنیم
    for (const c of allCustomers) {
      if (!String(c.phone || '').toLowerCase().startsWith('hamkar_')) continue;
      const parsedHamkar = parseHamkarCustomerRecord(c);
      if (!parsedHamkar || parsedHamkar.approvalStatus !== 'APPROVED') continue;
      const catCode = String(parsedHamkar.categoryCode || '').toLowerCase();
      const catGroup = String(parsedHamkar.categoryGroup || '');
      const roleStr = String(parsedHamkar.roleTitle || '');
      const isBeautySpecialist =
        catCode.includes('beauty') ||
        catGroup.includes('زیبایی') ||
        /آرایش|کراتین|ناخن|پوست|فیشیال|مو|میکاپ|سالن زیبایی/i.test(`${catGroup} ${roleStr}`);
      if (!isBeautySpecialist) continue;

      const key = parsedHamkar.phone;
      if (!key) continue;
      const initialSkills = [];
      if (parsedHamkar.roleTitle && parsedHamkar.roleTitle !== 'متخصص تندیس') {
        initialSkills.push(parsedHamkar.roleTitle);
      }
      if (parsedHamkar.skillDescription) {
        for (const token of parsedHamkar.skillDescription.split(/[،,|/]+/)) {
          const cleanToken = token.trim();
          if (cleanToken && cleanToken.length >= 3 && cleanToken.length <= 45) {
            initialSkills.push(cleanToken);
          }
        }
      }
      beautyMap.set(key, {
        specialist_phone: key,
        specialist_name: parsedHamkar.fullName || 'متخصص زیبایی تندیس',
        business_name: parsedHamkar.businessName || `سالن زیبایی ${parsedHamkar.fullName}`,
        category_code: parsedHamkar.categoryCode || 'cat-beauty-personal',
        role_title: parsedHamkar.roleTitle || 'متخصص زیبایی و سلامت',
        service_city: parsedHamkar.serviceCity || 'آبادان',
        city: parsedHamkar.serviceCity || 'آبادان',
        salon_address: parsedHamkar.serviceAddress || parsedHamkar.serviceCity || 'آبادان',
        bio: parsedHamkar.skillDescription || 'متخصص رسمی زیبایی و سلامت با مدارک تاییدشده در سامانه تندیس.',
        rating: 4.9,
        review_count: 18,
        avatar_url: parsedHamkar.profilePhoto || avatarByPhone.get(key) || null,
        skills: Array.from(new Set(initialSkills)),
        tariffs: []
      });
    }

    // سپس اطلاعات کامل پروفایل زیبایی (spec_profile_* و beauty_spec_*) و مهارت‌های چندگانه را ادغام می‌کنیم
    for (const r of sortedReviews) {
      const rid = String(r.id || '');
      const titleUpper = String(r.service_title || '').trim().toUpperCase();
      if (
        rid.startsWith('beauty_spec_') ||
        rid.startsWith('spec_profile_') ||
        r.request_id === 'BEAUTY_SPECIALIST_PROFILE' ||
        titleUpper === 'BEAUTY_SPECIALIST_PROFILE'
      ) {
        try {
          const rawComment = String(r.comment || '').trim();
          if (!rawComment.startsWith('{')) continue;
          const obj = JSON.parse(rawComment);
          const isBeautyRecord =
            rid.startsWith('beauty_spec_') ||
            r.request_id === 'BEAUTY_SPECIALIST_PROFILE' ||
            titleUpper === 'BEAUTY_SPECIALIST_PROFILE' ||
            obj.category_slug === 'cat-beauty-personal' ||
            String(obj.category_code || '').includes('beauty') ||
            Array.isArray(obj.selected_skills) ||
            Array.isArray(obj.skills) ||
            Array.isArray(obj.service_prices) ||
            Array.isArray(obj.tariffs);

          const key =
            normalizePhone(
              obj.specialist_phone ||
                obj.phone ||
                r.customer_phone ||
                rid.replace(/^(beauty_spec_|spec_profile_)/i, '')
            ) || rid;

          if (!isBeautyRecord && !beautyMap.has(key)) continue;

          const prev = beautyMap.get(key) || {};
          const rawSkills = [
            ...(Array.isArray(prev.skills) ? prev.skills : []),
            ...(Array.isArray(obj.skills) ? obj.skills : []),
            ...(Array.isArray(obj.selected_skills) ? obj.selected_skills : []),
            ...(Array.isArray(obj.specialties) ? obj.specialties : [])
          ]
            .map((s) => (typeof s === 'string' ? s.trim() : String(s?.title || s?.name || '').trim()))
            .filter(Boolean);

          const rawTariffs = [
            ...(Array.isArray(obj.tariffs) ? obj.tariffs : []),
            ...(Array.isArray(obj.service_prices) ? obj.service_prices : []),
            ...(Array.isArray(prev.tariffs) ? prev.tariffs : [])
          ]
            .map((t) => ({
              title: String(t?.title || t?.skill_title || t?.service_title || t?.name || '').trim(),
              price_toman: Number(t?.price_toman || t?.amount_toman || t?.price || 650000),
              duration_min: Number(t?.duration_min || t?.duration || 60)
            }))
            .filter((t) => Boolean(t.title));

          // هر مهارتی که در تعرفه‌ها ثبت شده نیز به لیست مهارت‌های متخصص اضافه می‌شود
          for (const t of rawTariffs) {
            rawSkills.push(t.title);
          }

          const uniqueSkills = Array.from(new Set(rawSkills));
          const uniqueTariffsMap = new Map();
          for (const t of rawTariffs) {
            uniqueTariffsMap.set(t.title, t);
          }
          for (const sk of uniqueSkills) {
            if (!uniqueTariffsMap.has(sk)) {
              uniqueTariffsMap.set(sk, {
                title: sk,
                price_toman: 750000,
                duration_min: 60
              });
            }
          }

          beautyMap.set(key, {
            ...prev,
            ...obj,
            specialist_phone: normalizePhone(obj.specialist_phone || obj.phone || prev.specialist_phone || key),
            specialist_name:
              obj.specialist_name || obj.full_name || prev.specialist_name || r.specialist_name || 'متخصص زیبایی تندیس',
            business_name:
              obj.business_name ||
              obj.salon_name ||
              prev.business_name ||
              `سالن زیبایی ${obj.specialist_name || prev.specialist_name || 'تندیس'}`,
            role_title:
              obj.role_title ||
              prev.role_title ||
              (uniqueSkills.length > 0 ? uniqueSkills.slice(0, 2).join(' و ') : 'متخصص زیبایی و سلامت'),
            service_city: obj.service_city || obj.city || prev.service_city || 'آبادان',
            city: obj.city || obj.service_city || prev.city || 'آبادان',
            salon_address: obj.salon_address || obj.address || prev.salon_address || obj.city || 'آبادان',
            avatar_url: obj.avatar_url || obj.profile_photo || prev.avatar_url || avatarByPhone.get(key) || null,
            skills: uniqueSkills,
            tariffs: Array.from(uniqueTariffsMap.values())
          });
        } catch {}
      } else if (rid.startsWith('beauty_slots_') || r.request_id === 'BEAUTY_SCHEDULE') {
        try {
          const obj = JSON.parse(r.comment || '{}');
          const key = normalizePhone(obj.specialist_phone || rid.replace('beauty_slots_', '')) || rid;
          const prev = beautyMap.get(key) || {};
          beautyMap.set(key, {
            ...prev,
            ...obj,
            specialist_phone: normalizePhone(obj.specialist_phone || prev.specialist_phone || key),
            avatar_url: prev.avatar_url || obj.avatar_url || avatarByPhone.get(key) || null
          });
        } catch {}
      }
    }
    const beautySpecialists = Array.from(beautyMap.values());

    // ۸. نوبت‌های زیبایی ثبت‌شده مشتری
    const beautyAppointments = phone
      ? sortedReviews
          .filter(
            (r) =>
              (String(r.id || '').startsWith('beauty_apt_') ||
                String(r.id || '').startsWith('beauty_booking_') ||
                r.request_id === 'BEAUTY_APPOINTMENT') &&
              normalizePhone(r.customer_phone) === phone
          )
          .map((r) => {
            try {
              return { id: r.id, ...JSON.parse(r.comment || '{}') };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .reverse()
      : [];

    // ۹. وام‌های تندیس پی و اقساط مشتری (همگام با سرور مرکزی)
    const customerLoansMap = new Map();
    if (phone) {
      for (const r of sortedReviews) {
        const rid = String(r.id || '');
        const reqId = String(r.request_id || '').toUpperCase();
        const titleUpper = String(r.service_title || '').toUpperCase();
        if (rid.startsWith('loan_') || reqId === 'TANDIS_PAY_LOAN' || titleUpper === 'TANDIS_PAY_LOAN') {
          try {
            const obj = JSON.parse(r.comment || '{}');
            const loanPhone = normalizePhone(obj.customer_phone || obj.phone || r.customer_phone || '');
            if (loanPhone !== phone) continue;
            const amount = Number(obj.requested_amount_toman || obj.amount_toman || 0);
            const months = Number(obj.installment_months || obj.installments_count || obj.months || 12);
            const interestRate = Number(obj.interest_rate_percent ?? 4);
            const totalRepayment = Number(
              obj.total_repayment_toman || Math.round(amount * (1 + interestRate / 100))
            );
            const monthlyAmount = Number(
              obj.monthly_installment_toman || (months > 0 ? Math.round(totalRepayment / months) : 0)
            );
            const paidIndices = Array.isArray(obj.paid_installments)
              ? obj.paid_installments.map(Number).filter((n) => Number.isFinite(n) && n >= 1)
              : [];
            const paidCount = Number(obj.paid_installments_count ?? paidIndices.length ?? 0);

            customerLoansMap.set(rid, {
              id: rid,
              ...obj,
              customer_phone: loanPhone,
              customer_name: String(obj.customer_name || obj.full_name || r.customer_name || 'مشتری تندیس'),
              requested_amount_toman: amount,
              installment_months: months,
              installments_count: months,
              interest_rate_percent: interestRate,
              monthly_installment_toman: monthlyAmount,
              total_repayment_toman: totalRepayment,
              paid_installments_count: paidCount,
              paid_installments: paidIndices,
              national_code: String(obj.national_code || obj.national_id || ''),
              status: String(obj.status || 'PENDING_REVIEW').toUpperCase(),
              approved_at_epoch: Number(obj.approved_at_epoch || obj.updated_at_epoch || obj.created_at_epoch || r.created_at_epoch || Date.now()),
              updated_at_epoch: Number(obj.updated_at_epoch || r.created_at_epoch || Date.now()),
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || Date.now())
            });
          } catch {}
        }
      }
    }
    const customerLoans = Array.from(customerLoansMap.values()).reverse();

    const partInquiries = phone
      ? sortedReviews
          .filter(
            (r) =>
              (String(r.id || '').startsWith('part_inquiry_') || r.request_id === 'PART_INQUIRY') &&
              normalizePhone(r.customer_phone) === phone
          )
          .map((r) => {
            try {
              return { id: r.id, ...JSON.parse(r.comment || '{}') };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .reverse()
      : [];

    // ۱۰. اعلان‌های ارسال‌شده از تندیس مدیریت (همگانی و اختصاصی مشتری)
    const adminNotifications = [];
    for (const r of sortedReviews) {
      const rid = String(r.id || '');
      const reqId = String(r.request_id || '').toUpperCase();
      if (
        !rid.startsWith('notif_') &&
        !['ADMIN_NOTIFICATION', 'SYSTEM_NOTIFICATION', 'BROADCAST_NOTIFICATION'].includes(reqId)
      ) {
        continue;
      }
      try {
        const obj = String(r.comment || '').trim().startsWith('{')
          ? JSON.parse(r.comment)
          : { message: String(r.comment || '') };
        const targetPhone = normalizePhone(obj.target_phone || obj.user_phone || r.customer_phone || '');
        const audience = String(obj.target_audience || obj.audience || 'ALL').toUpperCase();
        if (audience === 'SPECIALIST' || audience === 'HAMKAR') continue;
        if (targetPhone && targetPhone !== phone) continue;
        adminNotifications.push({
          id: rid || `notif_${r.created_at_epoch || Date.now()}`,
          title: String(obj.title || r.service_title || 'اطلاعیه مدیریت تندیس'),
          message: String(obj.message || obj.body || obj.text || ''),
          type: 'ADMIN',
          createdAtEpoch: Number(obj.created_at_epoch || r.created_at_epoch || Date.now()),
          isRead: false,
          senderRole: 'ADMIN',
          actionNav: obj.action_nav ? String(obj.action_nav) : undefined
        });
      } catch {}
    }
    if (otaConfig?.global_announcement_text) {
      adminNotifications.push({
        id: `ota_announce_${String(otaConfig.global_announcement_text).slice(0, 24)}`,
        title: 'اطلاعیه سراسری تندیس',
        message: String(otaConfig.global_announcement_text),
        type: 'ADMIN',
        createdAtEpoch: Number(otaConfig.updated_at_epoch || 1700000000000),
        isRead: false,
        senderRole: 'ADMIN'
      });
    }

    // خواندن وضعیت خوانده‌شده/پاک‌شده اعلان‌های همین کاربر از سرور
    let notificationState = { readIds: [], clearedIds: [], readAllBeforeEpoch: 0 };
    if (phone) {
      const notifStateRev = sortedReviews
        .filter((r) => String(r.id || '') === `user_notif_state_${phone}` || (String(r.request_id || '').toUpperCase() === 'USER_NOTIF_STATE' && normalizePhone(r.customer_phone) === phone))
        .pop();
      if (notifStateRev?.comment) {
        try {
          const parsed = JSON.parse(notifStateRev.comment);
          notificationState = {
            readIds: Array.isArray(parsed.readIds) ? parsed.readIds.map(String) : [],
            clearedIds: Array.isArray(parsed.clearedIds) ? parsed.clearedIds.map(String) : [],
            readAllBeforeEpoch: Number(parsed.readAllBeforeEpoch || 0)
          };
        } catch {}
      }
    }

    const serverReadSet = new Set(notificationState.readIds);
    const serverClearedSet = new Set(notificationState.clearedIds);
    const readBefore = notificationState.readAllBeforeEpoch || 0;
    const resolvedNotifications = adminNotifications
      .filter((n) => !serverClearedSet.has(n.id))
      .map((n) => ({
        ...n,
        isRead: Boolean(n.isRead) || serverReadSet.has(n.id) || (readBefore > 0 && Number(n.createdAtEpoch || 0) <= readBefore)
      }))
      .sort((a, b) => b.createdAtEpoch - a.createdAtEpoch);

    // ۱۱. تیکت‌های پشتیبانی یکپارچه مشتری (support/tickets + tkt_req_* + reviews/ticket_*)
    const mergedCustomerTickets = [];
    if (phone) {
      const seenTkt = new Set();
      const pushTicket = (t) => {
        const key = String(t.id || t.ticket_id || `${t.subject}_${t.created_at_epoch || ''}`);
        if (seenTkt.has(key)) return;
        seenTkt.add(key);
        mergedCustomerTickets.push(t);
      };
      const directList = Array.isArray(directSupportRes?.data) ? directSupportRes.data : [];
      for (const t of directList) {
        pushTicket({
          id: t.id || t.ticket_id,
          user_phone: t.sender_phone || t.user_phone || phone,
          user_name: t.sender_name || t.user_name || 'مشتری تندیس',
          subject: t.subject || 'پشتیبانی',
          message: t.message || t.initial_message || '',
          admin_reply: t.admin_reply || null,
          status: t.admin_reply ? 'RESOLVED' : (t.status || 'OPEN'),
          messages: Array.isArray(t.messages)
            ? t.messages
            : [
                ...(t.message || t.initial_message ? [{ sender: 'USER', text: t.message || t.initial_message }] : []),
                ...(t.admin_reply ? [{ sender: 'ADMIN', text: t.admin_reply }] : [])
              ],
          created_at_epoch: Number(t.created_at_epoch || Date.now())
        });
      }
      for (const r of allRequests) {
        const rid = String(r.id || '');
        const cat = String(r.service_category_id || '').toLowerCase();
        if ((rid.startsWith('tkt_req_') || rid.startsWith('ticket_') || cat === 'support_ticket') && normalizePhone(r.customer_phone) === phone) {
          pushTicket({
            id: rid,
            user_phone: phone,
            user_name: r.customer_name || 'مشتری تندیس',
            subject: r.service_title || 'پشتیبانی وب‌سایت',
            message: r.issue_description || '',
            admin_reply: r.customer_review_comment || null,
            status: r.customer_review_comment ? 'RESOLVED' : 'OPEN',
            messages: [
              ...(r.issue_description ? [{ sender: 'USER', text: r.issue_description }] : []),
              ...(r.customer_review_comment ? [{ sender: 'ADMIN', text: r.customer_review_comment }] : [])
            ],
            created_at_epoch: Number(r.created_at_epoch || Date.now())
          });
        }
      }
      for (const r of sortedReviews) {
        const rid = String(r.id || '');
        if ((rid.startsWith('ticket_') || rid.startsWith('tkt_')) && normalizePhone(r.customer_phone) === phone) {
          try {
            const obj = JSON.parse(r.comment || '{}');
            pushTicket({
              id: rid,
              user_phone: phone,
              user_name: obj.user_name || r.customer_name || 'مشتری تندیس',
              subject: obj.subject || r.service_title || 'پشتیبانی',
              message: obj.message || '',
              admin_reply: obj.admin_reply || null,
              status: obj.admin_reply ? 'RESOLVED' : (obj.status || 'OPEN'),
              messages: [
                ...(obj.message ? [{ sender: 'USER', text: obj.message }] : []),
                ...(obj.admin_reply ? [{ sender: 'ADMIN', text: obj.admin_reply }] : [])
              ],
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || Date.now())
            });
          } catch {}
        }
      }
      mergedCustomerTickets.sort((a, b) => Number(b.created_at_epoch || 0) - Number(a.created_at_epoch || 0));
    }

    // ۱۲. فهرست عمومی کارشناسان رسمی تاییدشده برای صفحه «مدیریت و کارشناسان» (بدون افشای شماره تماس خصوصی)
    const deletedMap = {};
    for (const r of sortedReviews) {
      if (String(r.id || '') === 'config_admin_deleted_records' || r.request_id === 'ADMIN_DELETED_RECORDS') {
        try {
          const parsed = JSON.parse(r.comment || '{}');
          const rec = parsed.records || parsed || {};
          for (const [k, v] of Object.entries(rec)) {
            const ts = Number(v || 0);
            if (ts > (deletedMap[k] || 0)) deletedMap[k] = ts;
          }
        } catch {}
      }
    }
    const isAdminDeleted = (key, createdAtEpoch = 0) => {
      const delTs = Number(deletedMap[key] || 0);
      if (!delTs) return false;
      if (createdAtEpoch && Number(createdAtEpoch) > delTs) return false;
      return true;
    };

    const officialSpecialists = allCustomers
      .filter((c) => String(c.phone || '').toLowerCase().startsWith('hamkar_'))
      .map((c) => parseHamkarCustomerRecord(c))
      .filter((s) => s && s.approvalStatus === 'APPROVED' && !isAdminDeleted(`specialist:${s.phone}`))
      .slice(0, 24)
      .map((s) => ({
        fullName: s.fullName,
        roleTitle: s.roleTitle || 'کارشناس رسمی تندیس',
        categoryGroup: s.categoryGroup || 'خدمات تخصصی تندیس',
        businessName: s.businessName || 'کارشناس تاییدشده تندیس',
        serviceCity: s.serviceCity || 'سراسر ایران',
        profilePhoto: s.profilePhoto || avatarByPhone.get(s.phone) || null
      }));

    res.json({
      online: reviewsRes.ok || requestsRes.ok,
      syncedAtEpoch: Date.now(),
      otaConfig,
      categories,
      sliders,
      categorySliders,
      requests: cleanRequests.filter((r) => !isAdminDeleted(`order:${r.id}`, r.created_at_epoch)),
      activeCustomer,
      isBlocked,
      walletBalanceToman,
      beautySpecialists: beautySpecialists.filter(
        (b) =>
          !isAdminDeleted(`specialist:${b.specialist_phone}`) &&
          !isAdminDeleted(`beauty_profile:beauty_spec_${b.specialist_phone}`) &&
          !isAdminDeleted(`beauty_profile:${b.id || ''}`)
      ),
      beautyAppointments: beautyAppointments.filter((b) => !isAdminDeleted(`beauty_booking:${b.id}`, b.created_at_epoch)),
      customerLoans: customerLoans.filter((l) => !isAdminDeleted(`loan:${l.id}`, l.created_at_epoch)),
      partInquiries,
      tickets: mergedCustomerTickets.filter((t) => !isAdminDeleted(`ticket:${t.id}`, t.created_at_epoch)),
      notifications: phone ? resolvedNotifications.filter((n) => !isAdminDeleted(`notification:${n.id}`, n.createdAtEpoch)) : [],
      notificationState: phone ? notificationState : { readIds: [], clearedIds: [], readAllBeforeEpoch: 0 },
      officialSpecialists
    });
  } catch (err) {
    res.status(500).json({ online: false, error: String(err?.message || err) });
  }
});

// ذخیره وضعیت خوانده‌شدن و پاک‌سازی اعلان‌های کاربر روی سرور مرکزی (ماندگار در تمام نشست‌ها)
app.post('/api/tandis/notifications/state', async (req, res) => {
  const phone = normalizeStrictIranPhone(req.body?.phone || '');
  if (!phone) {
    return res.status(400).json({ ok: false, message: 'شماره موبایل معتبر نیست.' });
  }
  const readIds = Array.isArray(req.body?.readIds)
    ? Array.from(new Set(req.body.readIds.map((x) => String(x || '').trim()).filter(Boolean))).slice(-200)
    : [];
  const clearedIds = Array.isArray(req.body?.clearedIds)
    ? Array.from(new Set(req.body.clearedIds.map((x) => String(x || '').trim()).filter(Boolean))).slice(-200)
    : [];
  const readAllBeforeEpoch = Number(req.body?.readAllBeforeEpoch || 0);
  const now = Date.now();
  const recordId = `user_notif_state_${phone}`;
  const payload = {
    id: recordId,
    request_id: 'USER_NOTIF_STATE',
    service_title: 'USER_NOTIF_STATE',
    specialist_id: 'notif_system',
    specialist_name: 'سامانه اعلان تندیس',
    customer_name: 'SYSTEM',
    customer_phone: phone,
    stars: 5,
    quality_tags: 'USER_NOTIF_STATE',
    comment: JSON.stringify({
      phone,
      readIds,
      clearedIds,
      readAllBeforeEpoch,
      updated_at_epoch: now
    }),
    created_at_epoch: now,
    synced_with_django: true
  };

  try {
    let saveRes = await fetchDjangoJson(`reviews/${encodeURIComponent(recordId)}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        comment: payload.comment,
        created_at_epoch: now
      })
    }).catch(() => ({ ok: false, status: 404 }));

    if (!saveRes.ok) {
      saveRes = await fetchDjangoJson('reviews/', {
        method: 'POST',
        body: JSON.stringify(payload)
      }).catch(() => ({ ok: false, status: 500 }));
    }

    return res.json({
      ok: Boolean(saveRes.ok),
      notificationState: { readIds, clearedIds, readAllBeforeEpoch }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// مسیر یکپارچه ارسال و دریافت تیکت پشتیبانی مشتری (تحویل تضمینی به نرم‌افزار تندیس مدیریت)
app.post('/api/tandis/tickets', async (req, res) => {
  const phone = normalizePhone(req.body?.user_phone || req.body?.sender_phone || '');
  const fullName = String(req.body?.user_name || req.body?.sender_name || 'مشتری تندیس').trim().slice(0, 120);
  const subject = String(req.body?.subject || '').trim().slice(0, 160);
  const message = String(req.body?.message || req.body?.initial_message || '').trim().slice(0, 2000);

  if (!phone || !subject || !message) {
    return res.status(400).json({ ok: false, message: 'شماره تماس، موضوع و متن پیام الزامی است.' });
  }

  const now = Date.now();
  const suffix = crypto.randomBytes(4).toString('hex');
  const ticketId = `tkt_${suffix}`;
  const reqMirrorId = `tkt_req_${suffix}`;

  try {
    const [supportRes, legacyRes] = await Promise.all([
      fetchDjangoJson('support/tickets/', {
        method: 'POST',
        body: JSON.stringify({
          id: ticketId,
          sender_phone: phone,
          sender_name: fullName,
          sender_role: 'CUSTOMER',
          subject,
          message,
          status: 'OPEN'
        })
      }).catch(() => ({ ok: false })),
      fetchDjangoJson('tickets/', {
        method: 'POST',
        body: JSON.stringify({
          user_phone: phone,
          user_name: fullName,
          subject,
          category: 'پشتیبانی وب‌سایت تندیس',
          priority: 'HIGH',
          initial_message: message
        })
      }).catch(() => ({ ok: false }))
    ]);

    // ثبت آینه تضمینی در requests (tkt_req_*) و reviews (ticket_*) جهت دیده‌شدن فوری در تندیس مدیریت
    await Promise.all([
      fetchDjangoJson('requests/', {
        method: 'POST',
        body: JSON.stringify({
          id: reqMirrorId,
          service_category_id: 'support_ticket',
          service_title: `[پشتیبانی سایت] ${subject}`,
          customer_name: fullName,
          customer_phone: phone,
          car_model: 'پشتیبانی وب‌سایت تندیس',
          issue_description: message,
          neighborhood: 'پشتیبانی برخط',
          home_address: 'وب‌سایت تندیس',
          city: 'مرکزی',
          price_toman: 0,
          is_urgent: true,
          status: 'PENDING_NEARBY',
          created_at_epoch: now,
          synced_with_django: true
        })
      }).catch(() => ({ ok: false })),
      fetchDjangoJson('reviews/', {
        method: 'POST',
        body: JSON.stringify({
          id: `ticket_${suffix}`,
          request_id: 'SUPPORT_TICKET',
          service_title: subject,
          specialist_id: 'admin_support',
          specialist_name: 'پشتیبانی مدیریت تندیس',
          customer_name: fullName,
          customer_phone: phone,
          stars: 5,
          quality_tags: 'SUPPORT_TICKET|ROLE:CUSTOMER|STATUS:OPEN',
          comment: JSON.stringify({
            id: ticketId,
            user_phone: phone,
            user_name: fullName,
            sender_role: 'CUSTOMER',
            subject,
            message,
            status: 'OPEN',
            created_at_epoch: now
          }),
          created_at_epoch: now,
          synced_with_django: true
        })
      }).catch(() => ({ ok: false }))
    ]);

    return res.json({
      ok: true,
      id: ticketId,
      user_phone: phone,
      user_name: fullName,
      subject,
      message,
      status: 'OPEN',
      messages: [{ sender: 'USER', text: message }],
      created_at_epoch: now,
      delivered_primary: Boolean(supportRes.ok || legacyRes.ok)
    });
  } catch (err) {
    return res.status(502).json({ ok: false, message: 'خطا در ثبت پیام پشتیبانی در سرور مرکزی.' });
  }
});

app.get('/api/tandis/tickets', async (req, res) => {
  const phone = normalizePhone(req.query.phone || req.query.user_phone || '');
  if (!phone) return res.json([]);
  try {
    const [supportRes, legacyRes, reqsRes, revsRes] = await Promise.all([
      fetchDjangoJson(`support/tickets/?phone=${encodeURIComponent(phone)}`).catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson(`tickets/?user_phone=${encodeURIComponent(phone)}`).catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('requests/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }))
    ]);

    const seen = new Set();
    const out = [];
    const add = (item) => {
      const k = String(item.id || item.ticket_id || `${item.subject}_${item.message}`);
      if (seen.has(k)) return;
      seen.add(k);
      out.push(item);
    };

    for (const src of [supportRes.data, legacyRes.data]) {
      if (!Array.isArray(src)) continue;
      for (const t of src) {
        const msg = t.message || t.initial_message || (Array.isArray(t.messages) && t.messages[0]?.text) || '';
        const reply = t.admin_reply || null;
        add({
          id: t.id || t.ticket_id,
          user_phone: t.sender_phone || t.user_phone || phone,
          user_name: t.sender_name || t.user_name || 'مشتری تندیس',
          subject: t.subject || 'پشتیبانی',
          message: msg,
          admin_reply: reply,
          status: reply ? 'RESOLVED' : (t.status || 'OPEN'),
          messages: Array.isArray(t.messages) && t.messages.length > 0
            ? t.messages
            : [...(msg ? [{ sender: 'USER', text: msg }] : []), ...(reply ? [{ sender: 'ADMIN', text: reply }] : [])],
          created_at_epoch: Number(t.created_at_epoch || Date.now())
        });
      }
    }

    const reqList = Array.isArray(reqsRes.data) ? reqsRes.data : [];
    for (const r of reqList) {
      const rid = String(r.id || '');
      if ((rid.startsWith('tkt_req_') || String(r.service_category_id || '') === 'support_ticket') && normalizePhone(r.customer_phone) === phone) {
        add({
          id: rid,
          user_phone: phone,
          user_name: r.customer_name || 'مشتری تندیس',
          subject: String(r.service_title || 'پشتیبانی').replace(/^\[پشتیبانی سایت\]\s*/, ''),
          message: r.issue_description || '',
          admin_reply: r.customer_review_comment || null,
          status: r.customer_review_comment ? 'RESOLVED' : 'OPEN',
          messages: [
            ...(r.issue_description ? [{ sender: 'USER', text: r.issue_description }] : []),
            ...(r.customer_review_comment ? [{ sender: 'ADMIN', text: r.customer_review_comment }] : [])
          ],
          created_at_epoch: Number(r.created_at_epoch || Date.now())
        });
      }
    }

    const revList = Array.isArray(revsRes.data) ? revsRes.data : [];
    for (const r of revList) {
      const rid = String(r.id || '');
      if ((rid.startsWith('ticket_') || rid.startsWith('tkt_')) && normalizePhone(r.customer_phone) === phone) {
        try {
          const obj = JSON.parse(r.comment || '{}');
          add({
            id: obj.id || rid,
            user_phone: phone,
            user_name: obj.user_name || r.customer_name || 'مشتری تندیس',
            subject: obj.subject || r.service_title || 'پشتیبانی',
            message: obj.message || '',
            admin_reply: obj.admin_reply || null,
            status: obj.admin_reply ? 'RESOLVED' : (obj.status || 'OPEN'),
            messages: [
              ...(obj.message ? [{ sender: 'USER', text: obj.message }] : []),
              ...(obj.admin_reply ? [{ sender: 'ADMIN', text: obj.admin_reply }] : [])
            ],
            created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || Date.now())
          });
        } catch {}
      }
    }

    out.sort((a, b) => Number(b.created_at_epoch || 0) - Number(a.created_at_epoch || 0));
    return res.json(out);
  } catch {
    return res.json([]);
  }
});

// ==================== مسیرهای اختصاصی پنل وب «تندیس همکار» ====================
const IRANPAYAMAK_SIMPLE_URL = 'https://api.iranpayamak.com/ws/v1/sms/simple';
const hamkarOtpSessions = new Map();

function cleanupExpiredHamkarOtpSessions() {
  const now = Date.now();
  for (const [k, v] of hamkarOtpSessions.entries()) {
    if (!v || now > v.expiresAt) hamkarOtpSessions.delete(k);
  }
}

async function sendIranPayamakSimpleSms(cfg, phone, message) {
  const lines = [cfg.line_number, cfg.backup_line_number, '50002178584000'].filter(
    (line, idx, arr) => Boolean(line) && arr.indexOf(line) === idx
  );
  const recipient = phone.startsWith('09') ? `+98${phone.slice(1)}` : phone;
  let lastError = 'ارسال پیامک ساده ناموفق بود.';

  for (const lineNumber of lines) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const resp = await fetch(IRANPAYAMAK_SIMPLE_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Api-Key': cfg.api_key
        },
        body: JSON.stringify({
          line_number: lineNumber,
          recipients: [recipient],
          message,
          number_format: 'english'
        })
      });
      const text = await resp.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {}
      const statusStr = String(data?.status || '').toLowerCase();
      if (resp.ok && statusStr !== 'error' && statusStr !== 'failed' && data?.ok !== false) {
        return { ok: true };
      }
      lastError = extractIranPayamakErrorMessage(data, resp.status);
    } catch (err) {
      lastError = err?.name === 'AbortError' ? 'پاسخ‌گویی درگاه پیامک طولانی شد.' : 'خطا در اتصال به درگاه پیامک.';
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: lastError };
}

function isTechnicalFilenameToken(val) {
  const s = String(val || '').trim();
  if (!s) return true;
  if (/\.(jpg|jpeg|png|webp|gif|pdf|svg)$/i.test(s)) return true;
  if (/^(shenas?name|shename|national|profile|skill|license|doc|img|photo|file|avatar|http|data:image|track-|shaba-|personnel_code|approved|pending|blocked|rejected|deleted)/i.test(s)) {
    return true;
  }
  return false;
}

function sanitizeHamkarDisplayField(val, fallback = '') {
  const s = String(val || '').trim();
  if (!s || isTechnicalFilenameToken(s)) return fallback;
  return s;
}

function isJalaliBirthDate(val) {
  const s = toStandardDigits(String(val || '').trim());
  return /^1[34]\d{2}[\/\-](0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])$/.test(s);
}

function parseHamkarCustomerRecord(raw, fallbackPhone = '') {
  if (!raw || typeof raw !== 'object') return null;
  const phone = normalizePhone(raw.phone || fallbackPhone);
  const parts = String(raw.full_name || '').split('|').map((s) => s.trim());

  const statusSegment = parts[11] || '';
  const statusTokens = statusSegment.split('::');
  let approvalStatus = String(raw.approval_status || raw.status || '').trim().toUpperCase();
  if (!approvalStatus || approvalStatus === 'ACTIVE') {
    const segStatus = (statusTokens[0] || '').trim().toUpperCase();
    if (['APPROVED', 'PENDING_ADMIN_APPROVAL', 'REJECTED', 'BLOCKED', 'DELETED'].includes(segStatus)) {
      approvalStatus = segStatus;
    } else if (/BLOCKED/i.test(String(raw.full_name || '')) || raw.is_blocked) {
      approvalStatus = 'BLOCKED';
    } else if (/APPROVED/i.test(String(raw.full_name || ''))) {
      approvalStatus = 'APPROVED';
    } else if (/REJECTED/i.test(String(raw.full_name || ''))) {
      approvalStatus = 'REJECTED';
    } else if (/DELETED/i.test(String(raw.full_name || ''))) {
      approvalStatus = 'DELETED';
    } else {
      approvalStatus = 'PENDING_ADMIN_APPROVAL';
    }
  }
  if (raw.is_blocked) approvalStatus = 'BLOCKED';

  const trackFromSeg = statusTokens.find((t) => t.startsWith('TRACK-'))?.replace('TRACK-', '') || '';
  const shabaFromSeg = statusTokens.find((t) => t.startsWith('SHABA-'))?.replace('SHABA-', '') || '';
  const personnelFromPart = (parts[13] || '').replace(/^PERSONNEL_CODE:/i, '').trim();
  const coordParts = (parts[9] || '').split(',').map((n) => Number(n.trim()));

  // تشخیص هوشمند تاریخ تولد و نام کسب‌وکار با پاکسازی کامل نام فایل‌های انگلیسی (مانند Shename_0991930.jpg)
  const detectedBirthDate =
    [raw.birth_date, raw.birthDate, parts[2], ...parts].find((v) => isJalaliBirthDate(v)) || '';
  const rawBusinessCandidate = raw.business_name || raw.businessName || parts[6] || '';
  const cleanBusinessName = sanitizeHamkarDisplayField(rawBusinessCandidate, '');
  const cleanRoleTitle = sanitizeHamkarDisplayField(raw.role_title || parts[3], 'متخصص تندیس');
  const cleanCategoryGroup = sanitizeHamkarDisplayField(raw.category_group || parts[5], 'خدمات تخصصی تندیس');
  const cleanServiceCity = sanitizeHamkarDisplayField(raw.service_city || raw.city || parts[7], 'آبادان');
  const cleanServiceAddress = sanitizeHamkarDisplayField(parts[8] || raw.address, '');
  const cleanSkillDescription = sanitizeHamkarDisplayField(parts[10], '');

  return {
    phone,
    rawPhone: raw.phone || `hamkar_${phone}`,
    fullName: sanitizeHamkarDisplayField(parts[0], 'متخصص تندیس'),
    nationalCode: /^\d{10}$/.test(toStandardDigits(parts[1] || '')) ? toStandardDigits(parts[1]) : '',
    birthDate: detectedBirthDate ? toStandardDigits(detectedBirthDate) : '',
    roleTitle: cleanRoleTitle,
    categoryCode: String(raw.category_code || parts[4] || '').trim(),
    categoryGroup: cleanCategoryGroup,
    businessName: cleanBusinessName,
    serviceCity: cleanServiceCity,
    serviceAddress: cleanServiceAddress,
    serviceLat: Number.isFinite(coordParts[0]) && coordParts[0] !== 0 ? coordParts[0] : 30.3392,
    serviceLng: Number.isFinite(coordParts[1]) && coordParts[1] !== 0 ? coordParts[1] : 48.3043,
    skillDescription: cleanSkillDescription,
    trackingCode: sanitizeHamkarDisplayField(parts[12] || trackFromSeg, ''),
    shabaNumber: String(raw.shaba_number || shabaFromSeg || '').trim(),
    personnelCode: sanitizeHamkarDisplayField(raw.personnel_code || personnelFromPart, `TND-${phone.slice(-6)}`),
    approvalStatus,
    isOnline: Boolean(raw.is_active_session),
    profilePhoto: raw.profile_photo || null,
    shenasnamehPhoto: raw.shenasnameh_photo || null,
    nationalCardPhoto: raw.national_card_photo || null,
    skillLicensePhoto: raw.skill_license_photo || null
  };
}

function isHamkarSystemReview(rev) {
  const id = String(rev?.id || '').trim().toLowerCase();
  const reqId = String(rev?.request_id || '').trim().toUpperCase();
  const title = String(rev?.service_title || '').trim().toUpperCase();
  const cName = String(rev?.customer_name || '').trim().toUpperCase();
  if (isSmsGatewayConfigRecord(rev)) return true;
  const sysPrefixes = [
    'config_', 'docs_', 'session_lock_', 'mission_', 'pricing_', 'dossier_',
    'payment_', 'cancel_req_', 'tx_settlement_', 'wallet_', 'settlement_',
    'presence_', 'spec_profile_', 'beauty_slots_', 'beauty_booking_',
    'beauty_apt_', 'beauty_spec_', 'tkt_', 'ticket_', 'support_', 'loan_',
    'part_inquiry_', 'parts_order_', 'blocked_', 'name_override_', 'app_ota_',
    'slider_', 'catslider_', 'notif_', 'user_notif_state_'
  ];
  if (sysPrefixes.some((p) => id.startsWith(p))) return true;
  const sysReqIds = [
    'SYSTEM_CATEGORIES', 'SYSTEM_COMMISSION', 'SYSTEM_SLIDERS', 'CATEGORY_SLIDERS',
    'SPECIALIST_DOCS', 'SESSION_LOCK', 'COMMISSION_SETTLEMENT', 'SYSTEM_WALLET_ADMIN',
    'SPECIALIST_SETTLEMENT', 'BEAUTY_SCHEDULE', 'BEAUTY_BOOKING', 'BEAUTY_APPOINTMENT',
    'BEAUTY_SPECIALIST_PROFILE', 'NAME_OVERRIDE', 'ACCOUNT_BLOCK', 'TANDIS_PAY_LOAN',
    'PART_INQUIRY', 'PARTS_ORDER', 'SUPPORT_TICKET',
    'ADMIN_NOTIFICATION', 'SYSTEM_NOTIFICATION', 'BROADCAST_NOTIFICATION', 'USER_NOTIF_STATE'
  ];
  if (sysReqIds.includes(reqId) || reqId.startsWith('WALLET_')) return true;
  if (
    [
      'CONFIG_CATEGORIES', 'CONFIG_COMMISSION', 'ACTIVE_DEVICE_SESSION', 'MISSION_SYNC',
      'SPECIALIST_PRICE_ENTRY', 'INVOICE_DOSSIER', 'CUSTOMER_CANCEL_REQUEST',
      'COMMISSION_SETTLEMENT', 'WALLET_LEDGER', 'SPECIALIST_SETTLEMENT',
      'SPECIALIST_PROFILE', 'BEAUTY_SPECIALIST_PROFILE', 'BEAUTY_SCHEDULE',
      'BEAUTY_APPOINTMENT_BOOKING', 'NAME_OVERRIDE'
    ].includes(title)
  ) {
    return true;
  }
  if (['SYSTEM_DOCS', 'SESSION_LOCK', 'SYSTEM'].includes(cName)) return true;
  return false;
}

// ارسال کد ۵ رقمی OTP اختصاصی تندیس همکار
app.post('/api/hamkar/auth/send-otp', async (req, res) => {
  cleanupExpiredHamkarOtpSessions();
  const phone = normalizeStrictIranPhone(req.body?.phone || '');
  if (!phone) {
    return res.status(400).json({ ok: false, message: 'شماره موبایل معتبر نیست (باید ۱۱ رقم و با ۰۹ شروع شود).' });
  }

  try {
    const reviewsRes = await fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }));
    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    const smsCfg = await getSmsGatewayConfig(allReviews, allReviews.length > 0);
    if (!smsCfg) {
      return res.status(503).json({
        ok: false,
        message: 'تنظیمات درگاه پیامک تندیس یافت نشد. لطفاً با پشتیبانی تماس بگیرید.'
      });
    }

    // کد ۵ رقمی مطابق اپلیکیشن تندیس همکار
    const otpCode = String(crypto.randomInt(10000, 100000));
    const expiresAt = Date.now() + 120 * 1000;
    hamkarOtpSessions.set(phone, { code: otpCode, createdAt: Date.now(), expiresAt });

    const [, patternResult] = await Promise.all([
      fetchDjangoJson('auth/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone: `hamkar_${phone}` })
      }).catch(() => ({ ok: false })),
      dispatchOtpViaIranPayamak(smsCfg, phone, otpCode)
    ]);

    let smsOk = patternResult.ok;
    let smsErr = patternResult.error;
    if (!smsOk) {
      const simpleAttempt = await sendIranPayamakSimpleSms(
        smsCfg,
        phone,
        `کد تایید ورود به پنل تندیس همکار: ${otpCode}`
      );
      smsOk = simpleAttempt.ok;
      if (!smsOk) smsErr = simpleAttempt.error || smsErr;
    }

    if (!smsOk) {
      hamkarOtpSessions.delete(phone);
      return res.status(502).json({
        ok: false,
        message: smsErr || 'ارسال پیامک کد تایید ناموفق بود.'
      });
    }

    return res.json({
      ok: true,
      message: 'کد تایید ۵ رقمی به شماره شما پیامک شد.',
      expiresInSeconds: 120
    });
  } catch {
    hamkarOtpSessions.delete(phone);
    return res.status(500).json({ ok: false, message: 'خطا در ارسال کد تایید.' });
  }
});

// تایید کد ۵ رقمی و استعلام وضعیت حساب همکار
app.post('/api/hamkar/auth/verify-otp', async (req, res) => {
  cleanupExpiredHamkarOtpSessions();
  const phone = normalizeStrictIranPhone(req.body?.phone || '');
  const cleanCode = toStandardDigits(req.body?.code || '').trim().replace(/\D/g, '');

  if (!phone) {
    return res.status(400).json({ ok: false, message: 'شماره موبایل معتبر نیست.' });
  }
  if (!/^\d{5}$/.test(cleanCode)) {
    return res.status(400).json({ ok: false, message: 'کد تایید باید دقیقاً ۵ رقم باشد.' });
  }

  const session = hamkarOtpSessions.get(phone);
  if (!session) {
    return res.status(400).json({ ok: false, message: 'کد تایید یافت نشد یا منقضی شده است.' });
  }
  if (Date.now() > session.expiresAt) {
    hamkarOtpSessions.delete(phone);
    return res.status(400).json({ ok: false, message: 'مهلت ۱۲۰ ثانیه‌ای کد تایید به پایان رسیده است.' });
  }
  if (session.code !== cleanCode) {
    return res.status(400).json({ ok: false, message: 'کد تایید نادرست است.' });
  }

  hamkarOtpSessions.delete(phone);

  try {
    const [directRes, allCustomersRes] = await Promise.all([
      fetchDjangoJson(`customers/hamkar_${phone}/`).catch(() => ({ ok: false, data: null })),
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] }))
    ]);

    let rawHamkar = directRes.ok && directRes.data && !Array.isArray(directRes.data) ? directRes.data : null;
    if (!rawHamkar && Array.isArray(allCustomersRes.data)) {
      rawHamkar =
        allCustomersRes.data.find((c) => String(c.phone || '').toLowerCase() === `hamkar_${phone}`) || null;
    }

    if (!rawHamkar) {
      return res.json({
        ok: true,
        phone,
        approvalStatus: 'NOT_FOUND',
        specialist: null
      });
    }

    const specialist = parseHamkarCustomerRecord(rawHamkar, phone);
    return res.json({
      ok: true,
      phone,
      approvalStatus: specialist.approvalStatus,
      specialist
    });
  } catch {
    return res.status(502).json({ ok: false, message: 'خطا در استعلام حساب همکار از سرور مرکزی.' });
  }
});

// استعلام یکتایی کد ملی میان تمام حساب‌های hamkar_*
app.get('/api/hamkar/check-national-code', async (req, res) => {
  const code = toStandardDigits(req.query.code || '').replace(/\D/g, '');
  const phone = normalizePhone(req.query.phone || '');
  if (!/^\d{10}$/.test(code)) {
    return res.status(400).json({ ok: false, available: false, message: 'کد ملی باید ۱۰ رقم باشد.' });
  }
  try {
    const customersRes = await fetchDjangoJson('customers/');
    const list = Array.isArray(customersRes.data) ? customersRes.data : [];
    for (const item of list) {
      if (!String(item.phone || '').toLowerCase().startsWith('hamkar_')) continue;
      const parsed = parseHamkarCustomerRecord(item);
      if (!parsed || parsed.nationalCode !== code) continue;

      if (parsed.approvalStatus === 'BLOCKED') {
        return res.json({ ok: true, available: false, reason: 'BLOCKED', message: 'این کد ملی در سامانه مسدود شده است.' });
      }
      if (parsed.phone !== phone && !['DELETED', 'REJECTED'].includes(parsed.approvalStatus)) {
        return res.json({
          ok: true,
          available: false,
          reason: 'DUPLICATE_OTHER_PHONE',
          message: 'این کد ملی قبلاً با شماره موبایل دیگری ثبت شده است.'
        });
      }
      if (parsed.phone === phone && ['APPROVED', 'PENDING_ADMIN_APPROVAL'].includes(parsed.approvalStatus)) {
        return res.json({
          ok: true,
          available: false,
          reason: 'ALREADY_REGISTERED',
          message: 'حساب همکار برای این کد ملی و شماره قبلاً ثبت شده است.'
        });
      }
    }
    return res.json({ ok: true, available: true });
  } catch {
    return res.status(502).json({ ok: false, available: false, message: 'خطا در بررسی کد ملی.' });
  }
});

// ارسال پیامک پذیرش سفارش به مشتری آفلاین (فقط در صورت آفلاین بودن مشتری)
app.post('/api/hamkar/notify-customer-sms', async (req, res) => {
  const customerPhone = normalizeStrictIranPhone(req.body?.customerPhone || '');
  const specialistName = String(req.body?.specialistName || 'متخصص تندیس').trim();
  const serviceTitle = String(req.body?.serviceTitle || 'سفارش تندیس').trim();
  if (!customerPhone) {
    return res.status(400).json({ ok: false, sent: false });
  }
  try {
    const [presenceRes, reviewsRes] = await Promise.all([
      fetchDjangoJson(`reviews/presence_${customerPhone}/`).catch(() => ({ ok: false, data: null })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }))
    ]);

    const presenceComment = String(presenceRes?.data?.comment || '').toUpperCase();
    const presenceTags = String(presenceRes?.data?.quality_tags || '').toUpperCase();
    if (presenceComment.includes('ONLINE_IN_APP') || presenceTags.includes('ONLINE_IN_APP')) {
      return res.json({ ok: true, sent: false, reason: 'CUSTOMER_ONLINE' });
    }

    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    const smsCfg = await getSmsGatewayConfig(allReviews, allReviews.length > 0);
    if (!smsCfg) return res.json({ ok: false, sent: false, reason: 'NO_SMS_CFG' });

    const message = `تندیس: درخواست «${serviceTitle}» شما توسط ${specialistName} پذیرفته شد و متخصص در حال هماهنگی است.`;
    const result = await sendIranPayamakSimpleSms(smsCfg, customerPhone, message);
    return res.json({ ok: result.ok, sent: result.ok });
  } catch {
    return res.json({ ok: false, sent: false });
  }
});

// وضعیت زنده جامع پنل وب تندیس همکار (هماهنگ با Polling ۲.۲ ثانیه‌ای)
app.get('/api/hamkar/live-state', async (req, res) => {
  const phone = normalizePhone(req.query.phone || '');
  if (!phone) {
    return res.status(400).json({ ok: false, error: 'شماره همکار ارسال نشده است.' });
  }

  try {
    const [directHamkarRes, requestsRes, reviewsRes, customersRes, ticketsRes, categoriesRes] = await Promise.all([
      fetchDjangoJson(`customers/hamkar_${phone}/`).catch(() => ({ ok: false, data: null })),
      fetchDjangoJson('requests/?role=specialist').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson(`support/tickets/?phone=${encodeURIComponent(phone)}`).catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('categories/').catch(() => ({ ok: false, data: [] }))
    ]);

    const allCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];
    const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    const allRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
    const sortedReviews = [...allReviews].sort(
      (a, b) => Number(a.created_at_epoch || 0) - Number(b.created_at_epoch || 0)
    );

    let rawHamkar = directHamkarRes.ok && directHamkarRes.data && !Array.isArray(directHamkarRes.data) ? directHamkarRes.data : null;
    if (!rawHamkar) {
      rawHamkar = allCustomers.find((c) => String(c.phone || '').toLowerCase() === `hamkar_${phone}`) || null;
    }

    const specialist = rawHamkar ? parseHamkarCustomerRecord(rawHamkar, phone) : null;

    // استخراج آواتار، تاریخ تولد، کسب‌وکار و پروفایل زیبایی از مدارک و پروفایل
    let beautyProfile = null;
    let avatarFromProfile = null;
    let birthDateFromDocs = '';
    let businessNameFromDocs = '';
    for (const r of sortedReviews) {
      const rid = String(r.id || '');
      if (rid === `spec_profile_${phone}`) {
        const c = String(r.comment || '').trim();
        if (String(r.service_title || '').toUpperCase() === 'BEAUTY_SPECIALIST_PROFILE' || c.startsWith('{')) {
          try {
            const parsed = JSON.parse(c);
            if (parsed.selected_skills || parsed.portfolio_items || parsed.open_slots_by_date || parsed.category_slug === 'cat-beauty-personal') {
              beautyProfile = parsed;
            }
            if (parsed.avatar_url || parsed.profile_photo) {
              avatarFromProfile = parsed.avatar_url || parsed.profile_photo;
            }
            if (isJalaliBirthDate(parsed.birth_date || parsed.birthDate)) {
              birthDateFromDocs = toStandardDigits(parsed.birth_date || parsed.birthDate);
            }
            const cleanBiz = sanitizeHamkarDisplayField(parsed.business_name || parsed.businessName, '');
            if (cleanBiz) businessNameFromDocs = cleanBiz;
          } catch {}
        } else if (c.startsWith('data:image') || c.startsWith('http')) {
          avatarFromProfile = c;
        }
      } else if (rid === `docs_hamkar_${phone}`) {
        try {
          const dObj = JSON.parse(r.comment || '{}');
          if (!avatarFromProfile && dObj.profile_photo) avatarFromProfile = dObj.profile_photo;
          if (!birthDateFromDocs && isJalaliBirthDate(dObj.birth_date || dObj.birthDate)) {
            birthDateFromDocs = toStandardDigits(dObj.birth_date || dObj.birthDate);
          }
          const cleanBiz = sanitizeHamkarDisplayField(dObj.business_name || dObj.businessName, '');
          if (!businessNameFromDocs && cleanBiz) businessNameFromDocs = cleanBiz;
        } catch {}
      }
    }
    if (specialist) {
      if (!specialist.profilePhoto && avatarFromProfile) specialist.profilePhoto = avatarFromProfile;
      if (!specialist.birthDate && birthDateFromDocs) specialist.birthDate = birthDateFromDocs;
      if (!specialist.businessName && businessNameFromDocs) specialist.businessName = businessNameFromDocs;
    }

    // قفل نشست تک‌دستگاهی
    let sessionLock = null;
    const lockRev = sortedReviews.filter((r) => String(r.id || '') === `session_lock_${phone}`).pop();
    if (lockRev?.comment) {
      try {
        sessionLock = JSON.parse(lockRev.comment);
      } catch {}
    }

    // تنظیمات کمیسیون داینامیک
    let commissionConfig = {
      default_rate_percent: 15,
      min_rate_percent: 0,
      max_rate_percent: 50,
      category_rates: {},
      updated_at_epoch: 0,
      updated_by: 'system',
      note: ''
    };
    const commRev = sortedReviews
      .filter((r) => String(r.id || '') === 'config_commission' || String(r.request_id || '') === 'SYSTEM_COMMISSION')
      .pop();
    if (commRev?.comment) {
      try {
        commissionConfig = { ...commissionConfig, ...JSON.parse(commRev.comment) };
      } catch {}
    } else {
      const commCust = allCustomers.find(
        (c) => String(c.phone || '') === 'config_commission' || String(c.role_title || '') === 'SYSTEM_COMMISSION'
      );
      if (commCust?.full_name && String(commCust.full_name).trim().startsWith('{')) {
        try {
          commissionConfig = { ...commissionConfig, ...JSON.parse(commCust.full_name) };
        } catch {}
      }
    }

    // دسته‌بندی و مهارت‌های داینامیک
    let dynamicCategories = null;
    const catRev = sortedReviews
      .filter((r) => String(r.id || '') === 'config_categories' || String(r.request_id || '') === 'SYSTEM_CATEGORIES')
      .pop();
    if (catRev?.comment) {
      try {
        dynamicCategories = JSON.parse(catRev.comment);
      } catch {}
    }
    if (!Array.isArray(dynamicCategories) || dynamicCategories.length === 0) {
      dynamicCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
    }

    // نقشه شهر فعال مشتریان از جدول customers
    const customerCityMap = {};
    for (const c of allCustomers) {
      const rawP = String(c.phone || '');
      if (rawP.toLowerCase().startsWith('hamkar_') || rawP === 'config_commission') continue;
      const np = normalizePhone(rawP);
      if (!np) continue;
      const nameParts = String(c.full_name || '').split('|');
      const extractedCity = String(c.city || nameParts[1] || '').trim();
      if (extractedCity) customerCityMap[np] = extractedCity;
    }

    // تجمیع mission_, pricing_, dossier_, payment_, cancel_req_
    const missionOverlay = new Map();
    const cancelRequestsMap = new Map();
    const dossiersByReqId = {};
    const settledTxIds = new Set();

    for (const r of sortedReviews) {
      const rid = String(r.id || '');
      let parsed = {};
      if (String(r.comment || '').trim().startsWith('{')) {
        try {
          parsed = JSON.parse(r.comment);
        } catch {}
      }

      if (rid.startsWith('cancel_req_')) {
        const reqId = rid.slice('cancel_req_'.length);
        cancelRequestsMap.set(reqId, {
          reason: parsed.reason || parsed.cancel_reason || r.comment || 'عدم توافق بر سر قیمت',
          requested_at_epoch: Number(parsed.updated_at_epoch || r.created_at_epoch || Date.now())
        });
        continue;
      }

      if (rid.startsWith('tx_settlement_')) {
        settledTxIds.add(rid.slice('tx_settlement_'.length));
        continue;
      }

      if (rid.startsWith('dossier_')) {
        const reqId = rid.slice('dossier_'.length);
        dossiersByReqId[reqId] = { ...parsed, request_id: reqId };
      }

      const prefix = ['mission_', 'pricing_', 'dossier_', 'payment_'].find((p) => rid.startsWith(p));
      if (!prefix) continue;
      const reqId = rid.slice(prefix.length);
      if (!reqId) continue;

      const prev = missionOverlay.get(reqId) || {};
      const qTags = String(r.quality_tags || '');
      const priceVal = Number(
        parsed.total_amount_toman || parsed.price_toman || parsed.final_price_toman || parsed.amount_toman || prev.price_toman || 0
      );
      const isPaid = Boolean(
        parsed.is_paid_online ||
        parsed.payment_status === 'PAID' ||
        parsed.payment_status === 'PAID_ONLINE' ||
        parsed.payment_status === 'SETTLED' ||
        /PAID:TRUE|IS_PAID_ONLINE:1|PAY_STATUS:PAID/i.test(qTags) ||
        prev.is_paid_online
      );
      missionOverlay.set(reqId, {
        status: String(parsed.status || prev.status || '').toUpperCase(),
        price_toman: priceVal > 0 ? priceVal : prev.price_toman || 0,
        is_paid_online: isPaid,
        payment_status: isPaid ? 'PAID' : parsed.payment_status || prev.payment_status || 'UNPAID',
        invoice_description: parsed.invoice_description || parsed.description || prev.invoice_description || '',
        has_invoice: Boolean(prev.has_invoice || prefix === 'pricing_' || prefix === 'dossier_'),
        admin_commission_toman: Number(parsed.admin_commission_toman || prev.admin_commission_toman || 0),
        specialist_net_toman: Number(parsed.specialist_net_toman || parsed.specialist_share_toman || prev.specialist_net_toman || 0)
      });
    }

    // سفارش‌های تمیز مشتریان
    const cleanOrders = allRequests
      .filter((r) => {
        const id = String(r?.id || '').toLowerCase();
        const cat = String(r?.service_category_id || '').toUpperCase();
        if (id.startsWith('docs_hamkar_') || id.startsWith('tkt_req_')) return false;
        if (cat === 'SPECIALIST_DOCS' || cat === 'SUPPORT_TICKET') return false;
        return !isSystemOrNonCustomerRecord(r);
      })
      .map((r) => {
        const ov = missionOverlay.get(r.id) || {};
        const cancelReq = cancelRequestsMap.get(r.id);
        const custPhone = normalizePhone(r.customer_phone);
        const tagsStr = String(r.customer_quality_tags || '');
        const isPaid = Boolean(
          ov.is_paid_online ||
          r.is_paid_online ||
          String(r.payment_status || '').toUpperCase() === 'PAID' ||
          /IS_PAID_ONLINE:1|PAY_STATUS:PAID|PAID:TRUE/i.test(tagsStr)
        );
        return {
          ...r,
          customer_city_from_profile: customerCityMap[custPhone] || '',
          price_toman: Number(ov.price_toman || r.price_toman || 0),
          is_paid_online: isPaid,
          payment_status: isPaid ? 'PAID' : ov.payment_status || r.payment_status || 'UNPAID',
          invoice_description: ov.invoice_description || r.invoice_description || '',
          has_invoice: Boolean(ov.has_invoice || Number(ov.price_toman || r.price_toman || 0) > 0),
          cancel_requested_by_customer: Boolean(r.cancel_requested_by_customer || cancelReq),
          customer_cancel_reason: cancelReq?.reason || r.customer_cancel_reason || '',
          dossier: dossiersByReqId[r.id] || null,
          is_commission_settled: settledTxIds.has(r.id)
        };
      })
      .sort((a, b) => Number(b.created_at_epoch || 0) - Number(a.created_at_epoch || 0));

    // کیف پول همکار و تسویه‌ها
    let wallet = {
      balance_toman: 0,
      total_net_earned_toman: 0,
      settled_request_ids: []
    };
    const walletRev = sortedReviews.filter((r) => String(r.id || '') === `wallet_hamkar_${phone}`).pop();
    if (walletRev?.comment) {
      try {
        const w = JSON.parse(walletRev.comment);
        wallet = {
          balance_toman: Number(w.balance_toman ?? w.wallet_balance_toman ?? 0),
          total_net_earned_toman: Number(w.total_net_earned_toman ?? 0),
          settled_request_ids: Array.isArray(w.settled_request_ids) ? w.settled_request_ids : []
        };
      } catch {}
    }

    const settlements = sortedReviews
      .filter((r) => String(r.id || '').startsWith(`settlement_${phone}_`) || (String(r.request_id || '') === 'SPECIALIST_SETTLEMENT' && normalizePhone(r.specialist_phone) === phone))
      .map((r) => {
        try {
          return { id: r.id, ...JSON.parse(r.comment || '{}') };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();

    // نظرات واقعی مشتریان برای این متخصص (حذف کامل رکوردهای سیستمی)
    const specialistReviews = sortedReviews
      .filter((r) => !isHamkarSystemReview(r))
      .filter((r) => normalizePhone(r.specialist_phone || r.specialist_id) === phone)
      .reverse();

    // تقویم ۳۰ روزه زیبایی و نوبت‌های رزروشده
    let beautySchedule = null;
    const slotsRev = sortedReviews.filter((r) => String(r.id || '') === `beauty_slots_${phone}`).pop();
    if (slotsRev?.comment) {
      try {
        beautySchedule = JSON.parse(slotsRev.comment);
      } catch {}
    }

    const beautyAppointments = sortedReviews
      .filter((r) => {
        const rid = String(r.id || '');
        return rid.startsWith('beauty_booking_') || rid.startsWith('beauty_apt_') || String(r.request_id || '') === 'BEAUTY_BOOKING';
      })
      .map((r) => {
        try {
          const obj = JSON.parse(r.comment || '{}');
          if (normalizePhone(obj.specialist_phone || r.specialist_phone) !== phone) return null;
          return { id: r.id, ...obj };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();

    // تیکت‌های پشتیبانی (ادغام support/tickets + tkt_req_*)
    const directTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
    const backupTickets = allRequests
      .filter((r) => (String(r.id || '').startsWith('tkt_req_') || String(r.service_category_id || '') === 'support_ticket') && normalizePhone(r.customer_phone) === phone)
      .map((r) => ({
        id: r.id,
        sender_phone: phone,
        sender_name: r.customer_name || specialist?.fullName || 'متخصص تندیس',
        sender_role: 'SPECIALIST',
        subject: r.service_title || 'پشتیبانی',
        message: r.issue_description || '',
        admin_reply: r.customer_review_comment || null,
        status: r.customer_review_comment ? 'ANSWERED' : 'OPEN',
        created_at: r.created_at || ''
      }));
    const seenTicketIds = new Set();
    const mergedTickets = [...directTickets, ...backupTickets].filter((t) => {
      const k = String(t.id || '');
      if (seenTicketIds.has(k)) return false;
      seenTicketIds.add(k);
      return true;
    });

    return res.json({
      ok: true,
      syncedAtEpoch: Date.now(),
      specialist,
      approvalStatus: specialist ? specialist.approvalStatus : 'NOT_FOUND',
      sessionLock,
      commissionConfig,
      categories: dynamicCategories,
      orders: cleanOrders,
      wallet,
      settlements,
      reviews: specialistReviews,
      tickets: mergedTickets,
      beautyProfile,
      beautySchedule,
      beautyAppointments
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// ==================== درگاه پرداخت زرین‌پال (آماده اتصال آنی با Merchant ID) ====================
const ZARINPAL_PENDING_TTL_MS = 30 * 60 * 1000;
const zarinpalPendingPayments = new Map();

function cleanupExpiredZarinpalPayments() {
  const now = Date.now();
  for (const [k, v] of zarinpalPendingPayments.entries()) {
    if (!v || now - v.createdAt > ZARINPAL_PENDING_TTL_MS) {
      zarinpalPendingPayments.delete(k);
    }
  }
}

function getZarinpalEndpoints() {
  const isSandbox = String(process.env.ZARINPAL_SANDBOX || '').toLowerCase() === 'true';
  const base = isSandbox ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com';
  return {
    requestUrl: `${base}/pg/v4/payment/request.json`,
    verifyUrl: `${base}/pg/v4/payment/verify.json`,
    startPayBase: `${base}/pg/StartPay/`
  };
}

function resolveTrustedOrigin(req) {
  const configured = String(process.env.PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
  if (/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(configured)) {
    return configured;
  }
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (/^(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|[a-z0-9.-]+\.run\.app|(www\.)?tandiis\.com)$/i.test(rawHost)) {
    const proto = /^(localhost|127\.0\.0\.1)/i.test(rawHost) ? 'http' : (req.headers['x-forwarded-proto'] || req.protocol || 'https');
    return `${proto}://${rawHost}`;
  }
  return 'https://tandiis.com';
}

async function settleVerifiedZarinpalPayment(pending, refId) {
  const now = Date.now();
  const meta = pending.meta && typeof pending.meta === 'object' ? pending.meta : {};
  const kind = String(meta.kind || '');
  const phone = normalizeStrictIranPhone(pending.phone || meta.phone || '');
  const customerName = String(pending.customerName || meta.customerName || 'مشتری تندیس').trim();
  const zRef = `ZP-${String(refId || now)}`;

  if (kind === 'wallet' && phone) {
    const curBal = Number(meta.currentBalance || 0);
    const newBal = Math.max(0, curBal + pending.amountToman);
    await fetchDjangoJson('reviews/', {
      method: 'POST',
      body: JSON.stringify({
        id: `wallet_${phone}`,
        request_id: 'CUSTOMER_WALLET',
        service_title: 'کیف پول تندیس',
        specialist_id: 'wallet_system',
        specialist_name: 'کیف پول تندیس',
        customer_name: customerName,
        customer_phone: phone,
        stars: 5,
        quality_tags: `WALLET:${newBal}|ZP_REF:${zRef}`,
        comment: JSON.stringify({
          phone,
          balance_toman: newBal,
          wallet_balance_toman: newBal,
          payment_reference_id: zRef,
          updated_at_epoch: now
        }),
        created_at_epoch: now,
        synced_with_django: true
      })
    });
    return;
  }

  if (kind === 'invoice' && meta.requestId && phone) {
    const reqId = String(meta.requestId);
    await fetchDjangoJson(`requests/${encodeURIComponent(reqId)}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        is_paid_online: true,
        payment_reference_id: zRef,
        customer_quality_tags: 'PAY_STATUS:PAID_ONLINE | IS_PAID_ONLINE:true'
      })
    }).catch(() => {});
    await fetchDjangoJson('reviews/', {
      method: 'POST',
      body: JSON.stringify({
        id: `payment_${reqId}`,
        request_id: reqId,
        service_title: 'ONLINE_PAYMENT',
        specialist_id: String(meta.specialistId || 'spec_101'),
        specialist_name: String(meta.specialistName || 'متخصص تندیس'),
        customer_name: customerName,
        customer_phone: phone,
        stars: 5,
        quality_tags: `PAID:true|PAY_STATUS:PAID_ONLINE|IS_PAID_ONLINE:true|REF:${zRef}`,
        comment: JSON.stringify({
          is_paid_online: true,
          payment_status: 'PAID_ONLINE',
          payment_reference_id: zRef,
          gateway: 'درگاه آنلاین زرین‌پال',
          total_amount_toman: pending.amountToman,
          updated_at_epoch: now
        }),
        created_at_epoch: now,
        synced_with_django: true
      })
    });
    return;
  }

  if (kind === 'parts' && phone) {
    const items = Array.isArray(meta.items) ? meta.items : [];
    const summaryTitle = items.map((i) => `${i.title} (${i.quantity} عدد)`).join('، ') || 'سفارش قطعات تندیس';
    const orderId = `parts_order_${phone}_${String(now).slice(-6)}`;
    await fetchDjangoJson('reviews/', {
      method: 'POST',
      body: JSON.stringify({
        id: orderId,
        request_id: 'PARTS_ORDER',
        service_title: summaryTitle,
        specialist_id: 'parts_store',
        specialist_name: 'فروشگاه قطعات تندیس',
        customer_name: customerName,
        customer_phone: phone,
        stars: 5,
        quality_tags: `PARTS_ORDER|TOTAL:${pending.amountToman}|METHOD:زرین‌پال|REF:${zRef}`,
        comment: JSON.stringify({
          id: orderId,
          items,
          total_toman: pending.amountToman,
          payment_method: 'درگاه آنلاین زرین‌پال',
          payment_reference_id: zRef,
          needs_install: Boolean(meta.needsInstall),
          city: String(meta.city || ''),
          address: String(meta.address || ''),
          created_at_epoch: now
        }),
        created_at_epoch: now,
        synced_with_django: true
      })
    });
    if (meta.needsInstall) {
      await fetchDjangoJson('requests/', {
        method: 'POST',
        body: JSON.stringify({
          id: `req_${crypto.randomBytes(4).toString('hex')}`,
          customer_name: customerName,
          customer_phone: phone,
          service_category_id: 'auto-mobile-mechanic',
          service_title: `نصب قطعات خریداری‌شده: ${summaryTitle}`,
          car_model: 'سفارش فروشگاه قطعات تندیس',
          issue_description: `نصب همزمان قطعات سفارش‌داده‌شده در نشانی: ${String(meta.address || '')}`,
          neighborhood: String(meta.city || ''),
          home_address: String(meta.address || ''),
          city: String(meta.city || 'آبادان'),
          price_toman: 0,
          is_urgent: false,
          status: 'PENDING_NEARBY',
          created_at_epoch: now,
          synced_with_django: true
        })
      });
    }
    return;
  }

  if (kind === 'beauty' && phone) {
    const aptId = `beauty_apt_${phone}_${String(now).slice(-6)}`;
    await fetchDjangoJson('reviews/', {
      method: 'POST',
      body: JSON.stringify({
        id: aptId,
        request_id: 'BEAUTY_APPOINTMENT',
        service_title: String(meta.serviceTitle || 'نوبت زیبایی تندیس'),
        specialist_id: String(meta.specialistPhone || ''),
        specialist_name: String(meta.specialistName || ''),
        customer_name: customerName,
        customer_phone: phone,
        stars: 5,
        quality_tags: `BEAUTY_APT|STATUS:CONFIRMED|DATE:${String(meta.dateKey || '')}|TIME:${String(meta.timeSlot || '')}`,
        comment: JSON.stringify({
          id: aptId,
          specialist_phone: String(meta.specialistPhone || ''),
          specialist_name: String(meta.specialistName || ''),
          business_name: String(meta.businessName || ''),
          service_title: String(meta.serviceTitle || 'نوبت زیبایی تندیس'),
          date_key: String(meta.dateKey || ''),
          jalali_date: String(meta.jalaliDate || ''),
          time_slot: String(meta.timeSlot || ''),
          deposit_toman: pending.amountToman,
          payment_method: 'درگاه آنلاین زرین‌پال',
          payment_reference_id: zRef,
          status: 'CONFIRMED',
          customer_phone: phone,
          customer_name: customerName,
          created_at_epoch: now
        }),
        created_at_epoch: now,
        synced_with_django: true
      })
    });
    return;
  }

  if (kind === 'service' && phone) {
    await fetchDjangoJson('requests/', {
      method: 'POST',
      body: JSON.stringify({
        id: `req_${crypto.randomBytes(4).toString('hex')}`,
        customer_name: customerName,
        customer_phone: phone,
        service_category_id: String(meta.serviceCategoryId || 'tech-washing-machine'),
        service_title: String(meta.serviceTitle || 'سفارش خدمت تندیس'),
        car_model: String(meta.carModel || 'ثبت از وب‌سایت تندیس'),
        car_plate: String(meta.carPlate || ''),
        issue_description: String(meta.issueDescription || ''),
        neighborhood: String(meta.neighborhood || ''),
        home_address: String(meta.address || ''),
        city: String(meta.city || 'آبادان'),
        customer_lat: Number(meta.lat || 30.3392),
        customer_lng: Number(meta.lng || 48.3043),
        price_toman: pending.amountToman,
        is_paid_online: true,
        payment_reference_id: zRef,
        customer_quality_tags: `PAY_STATUS:PAID_ONLINE | IS_PAID_ONLINE:true | REF:${zRef}`,
        is_urgent: Boolean(meta.isUrgent),
        status: 'PENDING_NEARBY',
        created_at_epoch: now,
        synced_with_django: true
      })
    });
  }
}

app.get('/api/tandis/payment/zarinpal/status', (_req, res) => {
  const merchantId = String(process.env.ZARINPAL_MERCHANT_ID || '').trim();
  res.json({
    configured: Boolean(merchantId && merchantId.length >= 30),
    provider: 'zarinpal'
  });
});

app.post('/api/tandis/payment/zarinpal/request', async (req, res) => {
  cleanupExpiredZarinpalPayments();
  const merchantId = String(process.env.ZARINPAL_MERCHANT_ID || '').trim();
  if (!merchantId || merchantId.length < 30) {
    return res.status(503).json({
      ok: false,
      configured: false,
      message: 'شناسه درگاه زرین‌پال هنوز روی سرور تنظیم نشده است.'
    });
  }

  const amountToman = Math.round(Number(req.body?.amountToman || 0));
  if (!Number.isFinite(amountToman) || amountToman < 1000 || amountToman > 500_000_000) {
    return res.status(400).json({ ok: false, message: 'مبلغ پرداخت باید بین ۱,۰۰۰ تا ۵۰۰,۰۰۰,۰۰۰ تومان باشد.' });
  }

  const amountRial = amountToman * 10;
  const title = String(req.body?.title || 'پرداخت آنلاین خدمات تندیس').slice(0, 200);
  const phone = normalizeStrictIranPhone(req.body?.phone || '') || '';
  const customerName = String(req.body?.customerName || 'مشتری تندیس').slice(0, 120);
  const origin = resolveTrustedOrigin(req);
  const callbackUrl = `${origin}/payment/zarinpal/callback`;
  const endpoints = getZarinpalEndpoints();

  try {
    const zpRes = await fetch(endpoints.requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amountRial,
        callback_url: callbackUrl,
        description: title,
        metadata: phone ? { mobile: phone } : undefined
      })
    });
    const zpJson = await zpRes.json().catch(() => ({}));
    const authority = String(zpJson?.data?.authority || '');
    const code = Number(zpJson?.data?.code || 0);
    if (!zpRes.ok || code !== 100 || !authority) {
      return res.status(502).json({
        ok: false,
        message: 'ایجاد تراکنش در درگاه زرین‌پال ناموفق بود. لطفاً لحظاتی دیگر تلاش کنید.'
      });
    }

    zarinpalPendingPayments.set(authority, {
      amountToman,
      amountRial,
      phone,
      customerName,
      title,
      meta: req.body?.meta || null,
      createdAt: Date.now(),
      completed: false
    });

    return res.json({
      ok: true,
      authority,
      gatewayUrl: `${endpoints.startPayBase}${encodeURIComponent(authority)}`
    });
  } catch {
    return res.status(502).json({
      ok: false,
      message: 'خطا در برقراری ارتباط با سرور زرین‌پال. لطفاً اتصال اینترنت را بررسی کنید.'
    });
  }
});

app.get('/payment/zarinpal/callback', async (req, res) => {
  cleanupExpiredZarinpalPayments();
  const authority = String(req.query.Authority || '').trim();
  const status = String(req.query.Status || '').trim().toUpperCase();
  const merchantId = String(process.env.ZARINPAL_MERCHANT_ID || '').trim();

  const redirectWithParams = (params) => {
    const qs = new URLSearchParams(params).toString();
    return res.redirect(`/?${qs}`);
  };

  if (!authority || !merchantId) {
    return redirectWithParams({ zarinpal: 'failed', reason: 'missing_authority' });
  }

  const pending = zarinpalPendingPayments.get(authority);
  if (!pending || pending.completed) {
    return redirectWithParams({ zarinpal: 'failed', reason: 'invalid_session' });
  }

  pending.completed = true;
  if (status !== 'OK') {
    zarinpalPendingPayments.delete(authority);
    return redirectWithParams({ zarinpal: 'cancelled' });
  }

  const endpoints = getZarinpalEndpoints();
  try {
    const verifyRes = await fetch(endpoints.verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: pending.amountRial,
        authority
      })
    });
    const verifyJson = await verifyRes.json().catch(() => ({}));
    const code = Number(verifyJson?.data?.code || 0);
    const refId = String(verifyJson?.data?.ref_id || '');

    if (verifyRes.ok && (code === 100 || code === 101)) {
      await settleVerifiedZarinpalPayment(pending, refId).catch(() => {});
      zarinpalPendingPayments.delete(authority);
      return redirectWithParams({
        zarinpal: 'success',
        ref_id: refId || authority.slice(-8)
      });
    }
    zarinpalPendingPayments.delete(authority);
    return redirectWithParams({ zarinpal: 'failed', reason: 'verify_rejected' });
  } catch {
    zarinpalPendingPayments.delete(authority);
    return redirectWithParams({ zarinpal: 'failed', reason: 'verify_error' });
  }
});

// پل مستقیم برای تمام مسیرهای نسخه یک سرور مرکزی تندیس
app.all('/api/v1/*', async (req, res) => {
  const subPath = req.params[0] || '';
  const queryIndex = req.originalUrl.indexOf('?');
  const queryStr = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
  const method = req.method.toUpperCase();
  try {
    const result = await fetchDjangoJson(subPath + queryStr, {
      method,
      body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(req.body || {})
    });
    // محافظت امنیتی: هرگز رکورد تنظیمات درگاه پیامک و کلید آن را به مرورگر برنگردان
    let safeData = result.data;
    if (method === 'GET' && Array.isArray(safeData)) {
      safeData = safeData.filter((item) => !isSmsGatewayConfigRecord(item));
    } else if (method === 'GET' && safeData && typeof safeData === 'object' && isSmsGatewayConfigRecord(safeData)) {
      return res.status(404).json({ error: 'رکورد مورد نظر یافت نشد.' });
    }
    res.status(result.status).json(safeData);
  } catch (err) {
    res.status(502).json({ error: 'خطا در برقراری ارتباط با سرور مرکزی تندیس', detail: String(err?.message || err) });
  }
});

// نقشه رسمی مسیرهای صفحات وب‌سایت تندیس (برای SSR متا تگ‌ها، سئو و لینک مستقیم هر صفحه)
const PAGE_SEO_ROUTES = [
  {
    paths: ['/', '/home'],
    canonical: '/',
    title: 'تندیس | خدمات در محل، تعمیرات، زیبایی و تندیس‌پی',
    description: 'تندیس؛ درخواست آنلاین خدمات در محل، تعمیرات لوازم خانگی، امداد خودرو، نظافت، زیبایی و سلامت، قطعات اصلی و اعتبار تندیس‌پی در سراسر ایران.',
  },
  {
    paths: ['/app', '/downloads', '/download'],
    canonical: '/app',
    title: 'دانلود اپلیکیشن تندیس و تندیس همکار | تندیس',
    description: 'دانلود مستقیم آخرین نسخه سوپر اپلیکیشن تندیس (مشتریان) و اپلیکیشن تندیس همکار (متخصصان) با لینک رسمی سرور تندیس.',
  },
  {
    paths: ['/services', '/services/:slug'],
    canonical: '/services',
    title: 'خدمات در محل تندیس | ۳۱ خدمت تخصصی با ضمانت',
    description: 'مشاهده و ثبت درخواست آنلاین ۳۱ خدمت تخصصی تندیس شامل تعمیرات، خودرو، نظافت، پزشکی، حقوقی، زیبایی و خدمات فنی.',
  },
  {
    paths: ['/beauty', '/services/beauty'],
    canonical: '/beauty',
    title: 'زیبایی بانوان و نوبت‌دهی آنلاین | تندیس',
    description: 'رزرو آنلاین نوبت خدمات زیبایی بانوان با متخصصان تاییدشده، مشاهده نمونه‌کارها و تقویم ۳۰ روزه تندیس.',
  },
  {
    paths: ['/store', '/parts'],
    canonical: '/store',
    title: 'فروشگاه قطعات اصلی تندیس | تندیس',
    description: 'استعلام و درخواست قطعات اصلی لوازم خانگی و فنی با ضمانت اصالت در فروشگاه آنلاین قطعات تندیس.',
  },
  {
    paths: ['/tandispay', '/wallet'],
    canonical: '/tandispay',
    title: 'تندیس‌پی؛ کیف پول و اعتبار اقساطی | تندیس',
    description: 'مدیریت کیف پول تندیس‌پی، شارژ آنلاین و درخواست اعتبار اقساطی خدمات بدون ضامن.',
  },
  {
    paths: ['/orders', '/requests'],
    canonical: '/orders',
    title: 'پیگیری درخواست‌ها و فاکتورها | تندیس',
    description: 'مشاهده وضعیت زنده درخواست‌های فعال، فاکتورهای رسمی صادرشده و امتیازدهی به متخصصان تندیس.',
  },
  {
    paths: ['/hamkar', '/hamkar/login', '/expert'],
    canonical: '/hamkar',
    title: 'پنل وب تندیس همکار | سامانه متخصصان تندیس',
    description: 'ورود پیامکی به پنل مستقل متخصصان تندیس همکار، رادار زنده سفارش‌ها، صدور فاکتور رسمی، کیف پول و تسویه شبا.',
  },
  {
    paths: ['/hamkar/signup', '/hamkar/register', '/provider-signup'],
    canonical: '/hamkar/signup',
    title: 'ثبت‌نام متخصص و همکار جدید | تندیس همکار',
    description: 'ثبت‌نام آنلاین ۵ مرحله‌ای متخصصان و کارشناسان در سامانه تندیس همکار و دریافت سفارش‌های زنده شهر شما.',
  },
  {
    paths: ['/signup', '/register'],
    canonical: '/signup',
    title: 'ثبت‌نام عضویت مشتری | تندیس',
    description: 'ساخت حساب کاربری در سامانه جامع خدمات تندیس برای ثبت و پیگیری سریع درخواست‌ها.',
  },
  {
    paths: ['/management', '/experts'],
    canonical: '/management',
    title: 'مدیریت و کارشناسان رسمی تندیس | تندیس',
    description: 'معرفی تیم مدیریت، استانداردهای گزینش و کارشناسان رسمی و تاییدشده سامانه خدمات تندیس.',
  },
  {
    paths: ['/dashboard', '/panel', '/profile'],
    canonical: '/dashboard',
    title: 'داشبورد مشتری، سفارشات، اقساط و تیکت‌ها | تندیس',
    description: 'پنل اختصاصی مشتریان تندیس؛ مشاهده تعداد سفارشات، وضعیت اقساط تندیس‌پی، چاپ فاکتور رسمی و ارسال تیکت پشتیبانی.',
  },
  {
    paths: ['/news', '/articles', '/blog'],
    canonical: '/news',
    title: 'مجله آموزشی، اخبار و مقالات تخصصی تندیس | تندیس',
    description: 'مقالات آموزشی نگهداری لوازم خانگی، سرویس دوره‌ای خودرو، راهنمای خدمات زیبایی و تازه‌ترین اخبار سامانه خدمات تندیس.',
  },
  {
    paths: ['/about', '/contact', '/terms', '/privacy'],
    canonical: '/about',
    title: 'درباره تندیس، قوانین عودت وجه و نماد اعتماد | تندیس',
    description: 'معرفی سامانه جامع تندیس، نماد اعتماد الکترونیکی (اینماد)، قوانین خرید، رویه لغو و عودت وجه، زمان ارسال و پشتیبانی ۲۴ ساعته.',
  },
];

function escapeHtmlAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderHtmlWithSeo(baseHtml, routeMeta) {
  if (!routeMeta) return baseHtml;
  const safeTitle = escapeHtmlAttr(routeMeta.title);
  const safeDesc = escapeHtmlAttr(routeMeta.description);
  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta property="og:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta property="og:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="twitter:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="twitter:description" content="${safeDesc}" />`
    );
}

// پنل مدیریت یکپارچه سایت و کارشناسان تندیس (۱۴ ماژول زنده با احراز هویت و کنترل دسترسی نقش‌ها)
app.use(
  '/api/admin',
  (req, res, next) => {
    res.removeHeader('Access-Control-Allow-Origin');
    res.setHeader('Cache-Control', 'no-store');
    next();
  },
  createAdminRouter({
    fetchDjangoJson,
    normalizePhone,
    normalizeStrictIranPhone,
    parseHamkarCustomerRecord,
    toStandardDigits
  })
);

// لیست رسمی لینک صفحات در API برای بررسی یا استفاده خارجی
app.get('/api/routes', (_req, res) => {
  res.json({
    ok: true,
    routes: PAGE_SEO_ROUTES.map((r) => ({
      path: r.canonical,
      aliases: r.paths,
      title: r.title,
    })),
  });
});

// فایل robots.txt و sitemap.xml داینامیک برای تمام مسیرهای صفحات
app.get('/robots.txt', (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers.host || 'tandiis.com';
  res
    .type('text/plain; charset=utf-8')
    .send(`User-agent: *\nAllow: /\nSitemap: ${proto}://${host}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers.host || 'tandiis.com';
  const urls = PAGE_SEO_ROUTES.map((r) => `  <url><loc>${proto}://${host}${r.canonical}</loc></url>`).join('\n');
  res
    .type('application/xml; charset=utf-8')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

// در محیط پیش‌نمایش (که WebSocket غیرفعال است)، کلاینت HMR وایت را با ماژول بی‌اثر جایگزین کن تا خطای WebSocket closed without opened رخ ندهد
app.get('/@vite/client', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`
export function createHotContext() {
  return {
    accept() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
    data: {}
  };
}
export function updateStyle(id, content) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector('style[data-vite-dev-id="' + id + '"]');
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('type', 'text/css');
    el.setAttribute('data-vite-dev-id', id);
    document.head.appendChild(el);
  }
  el.textContent = content;
}
export function removeStyle(id) {
  if (typeof document === 'undefined') return;
  const el = document.querySelector('style[data-vite-dev-id="' + id + '"]');
  if (el) el.remove();
}
export function injectQuery(url) { return url; }
`);
});

// سرو فایل‌های ساخته‌شده نسخه تولید وب‌سایت (و پشتیبانی خودکار از Vite در نبود پوشه dist)
async function startServer() {
  const distDir = path.join(__dirname, 'dist');
  const distIndex = path.join(distDir, 'index.html');

  if (fs.existsSync(distIndex)) {
    const baseIndexHtml = fs.readFileSync(distIndex, 'utf8');

    // در محیط پیش‌نمایش (run.app / localhost)، سرویس‌ورکر قبلی را خودکار پاک و صفحه را بازیابی کن تا هرگز صفحه سفید نشود
    app.get('/sw.js', (req, res, next) => {
      const host = String(req.headers.host || req.hostname || '');
      if (/(localhost|127\.0\.0\.1|\.run\.app)/i.test(host)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.send(`
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) {}
    try {
      await self.registration.unregister();
    } catch (e) {}
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    } catch (e) {}
  })());
});
`);
      }
      return next();
    });

    // ثبت صریح هر مسیر صفحه روی بک‌اند با متاتگ و عنوان اختصاصی خودش
    for (const routeDef of PAGE_SEO_ROUTES) {
      app.get(routeDef.paths, (_req, res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.type('text/html; charset=utf-8').send(renderHtmlWithSeo(baseIndexHtml, routeDef));
      });
    }

    app.use((req, res, next) => {
      if (req.path === '/' || req.path === '/index.html' || req.path === '/sw.js' || req.path === '/manifest.webmanifest') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      next();
    });
    app.use(
      express.static(distDir, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      // هرگز برای فایل‌های JS/CSS/تصویر مفقودشده، HTML برنگردان تا خطای MIME رخ ندهد
      if (
        req.path.startsWith('/assets/') ||
        req.path.startsWith('/api/') ||
        /\.(js|mjs|css|map|png|jpg|jpeg|webp|svg|ico|woff2?|ttf)$/i.test(req.path)
      ) {
        return res.status(404).type('text/plain').send('Not Found');
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.type('text/html; charset=utf-8').send(baseIndexHtml);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tandis Website Bridge Server running on port ${PORT} -> ${DJANGO_BASE_URL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Tandis server:', err);
  process.exit(1);
});
