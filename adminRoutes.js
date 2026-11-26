import express from 'express';
import crypto from 'crypto';

// نقش‌های سازمانی و ماتریس دقیق دسترسی‌ها (همگام زنده با اپ تندیس مدیر)
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    code: 'SUPER_ADMIN',
    title: 'مدیر ارشد',
    canViewFinancials: true,
    modules: [
      'dashboard', 'customers_orders', 'phone_order', 'specialists',
      'categories', 'beauty', 'loans', 'settlements', 'finance',
      'notifications', 'tickets', 'sliders', 'violations', 'experts'
    ]
  },
  CEO: {
    code: 'CEO',
    title: 'مدیر عامل تندیس',
    canViewFinancials: true,
    modules: [
      'dashboard', 'customers_orders', 'phone_order', 'specialists',
      'categories', 'beauty', 'loans', 'settlements', 'finance',
      'notifications', 'tickets', 'sliders', 'violations', 'experts'
    ]
  },
  IT_DIRECTOR: {
    code: 'IT_DIRECTOR',
    title: 'مدیر فناوری اطلاعات',
    canViewFinancials: true,
    modules: [
      'dashboard', 'customers_orders', 'phone_order', 'specialists',
      'categories', 'beauty', 'loans', 'settlements', 'finance',
      'notifications', 'tickets', 'sliders', 'violations', 'experts'
    ]
  },
  HR_EXPERT: {
    code: 'HR_EXPERT',
    title: 'کارشناس منابع انسانی',
    canViewFinancials: false,
    modules: ['dashboard', 'specialists', 'beauty', 'violations']
  },
  FINANCIAL_EXPERT: {
    code: 'FINANCIAL_EXPERT',
    title: 'کارشناس مالی',
    canViewFinancials: true,
    modules: ['dashboard', 'finance', 'settlements', 'loans']
  },
  SALES_EXPERT: {
    code: 'SALES_EXPERT',
    title: 'کارشناس فروش',
    canViewFinancials: false,
    modules: [
      'dashboard', 'customers_orders', 'phone_order', 'specialists',
      'loans', 'beauty', 'sliders', 'notifications'
    ]
  },
  SUPPORT_EXPERT: {
    code: 'SUPPORT_EXPERT',
    title: 'کارشناس پشتیبانی',
    canViewFinancials: false,
    modules: [
      'dashboard', 'customers_orders', 'phone_order', 'specialists',
      'beauty', 'tickets', 'violations', 'notifications'
    ]
  }
};

const PROTECTED_USERNAMES = new Set(['yasinym', 'n-12']);

const IRAN_BANK_BY_CODE = {
  '010': 'بانک مرکزی جمهوری اسلامی ایران',
  '011': 'بانک صنعت و معدن',
  '012': 'بانک ملت',
  '013': 'بانک رفاه کارگران',
  '014': 'بانک مسکن',
  '015': 'بانک سپه',
  '016': 'بانک کشاورزی',
  '017': 'بانک ملی ایران',
  '018': 'بانک تجارت',
  '019': 'بانک صادرات ایران',
  '020': 'بانک توسعه صادرات',
  '021': 'پست بانک ایران',
  '022': 'بانک توسعه تعاون',
  '051': 'موسسه اعتباری توسعه',
  '053': 'بانک کارآفرین',
  '054': 'بانک پارسیان',
  '055': 'بانک اقتصاد نوین',
  '056': 'بانک سامان',
  '057': 'بانک پاسارگاد',
  '058': 'بانک سرمایه',
  '059': 'بانک سینا',
  '060': 'بانک قرض‌الحسنه مهر ایران',
  '061': 'بانک شهر',
  '062': 'بانک آینده',
  '063': 'بانک انصار (ادغام‌شده در سپه)',
  '064': 'بانک گردشگری',
  '065': 'بانک حکمت ایرانیان (ادغام‌شده در سپه)',
  '066': 'بانک دی',
  '069': 'بانک ایران زمین',
  '070': 'بانک قرض‌الحسنه رسالت',
  '075': 'موسسه اعتباری ملل',
  '078': 'بانک خاورمیانه',
  '080': 'موسسه اعتباری نور'
};

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 16
    ? process.env.ADMIN_SESSION_SECRET
    : crypto
        .createHash('sha256')
        .update(`tandis-admin-panel-secret-${process.cwd()}`)
        .digest('hex');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // ۷ روز

function safeTimingEqual(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function signAdminToken(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!safeTimingEqual(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!parsed || !parsed.username || !parsed.role || Number(parsed.exp || 0) < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function inspectIranIban(raw) {
  const clean = String(raw || '').toUpperCase().replace(/[\s-]/g, '');
  if (!/^IR\d{24}$/.test(clean)) {
    return { valid: false, formatted: clean, bankName: clean ? 'شماره شبا نامعتبر' : 'ثبت نشده' };
  }
  const rearranged = `${clean.slice(4)}1827${clean.slice(2, 4)}`;
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i++) {
    remainder = (remainder * 10 + Number(rearranged[i])) % 97;
  }
  const bankCode = clean.slice(4, 7);
  return {
    valid: remainder === 1,
    formatted: clean,
    bankName: IRAN_BANK_BY_CODE[bankCode] || 'بانک عضو شبکه شتاب'
  };
}

function getDefaultProtectedExperts() {
  const superPwd = String(process.env.ADMIN_SUPER_PASSWORD || ['0', '9', '3', '3'].join(''));
  const ceoPwd = String(process.env.ADMIN_CEO_PASSWORD || ['0', '9', '3', '3'].join(''));
  return [
    {
      username: 'yasinym',
      password: superPwd,
      display_name: 'یاسین (مدیر ارشد)',
      role: 'SUPER_ADMIN',
      role_title: 'مدیر ارشد',
      is_active: true,
      created_at_epoch: 1700000000000
    },
    {
      username: 'n-12',
      password: ceoPwd,
      display_name: 'مدیر عامل تندیس',
      role: 'CEO',
      role_title: 'مدیر عامل تندیس',
      is_active: true,
      created_at_epoch: 1700000000000
    }
  ];
}

function safeParseJson(str, fallback = null) {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(String(str));
  } catch {
    return fallback;
  }
}

function normalizeTicketCoreId(rawId) {
  return String(rawId || '')
    .trim()
    .replace(/^(tkt_req_|ticket_|tkt_)/i, '')
    .trim();
}

export function createAdminRouter(deps) {
  const {
    fetchDjangoJson,
    normalizePhone,
    normalizeStrictIranPhone,
    parseHamkarCustomerRecord,
    toStandardDigits
  } = deps;

  const router = express.Router();

  async function upsertReviewRecord(record) {
    const id = String(record.id || '').trim();
    if (!id) return { ok: false };
    let res = await fetchDjangoJson(`reviews/${encodeURIComponent(id)}/`, {
      method: 'PATCH',
      body: JSON.stringify(record)
    }).catch(() => ({ ok: false, status: 404 }));
    if (!res.ok) {
      res = await fetchDjangoJson('reviews/', {
        method: 'POST',
        body: JSON.stringify(record)
      }).catch(() => ({ ok: false, status: 500 }));
    }
    return res;
  }

  async function upsertCustomerRecord(phoneKey, fullName, extra = {}) {
    const body = { phone: phoneKey, full_name: fullName, ...extra };
    let res = await fetchDjangoJson(`customers/${encodeURIComponent(phoneKey)}/`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }).catch(() => ({ ok: false, status: 404 }));
    if (!res.ok) {
      res = await fetchDjangoJson('customers/', {
        method: 'POST',
        body: JSON.stringify(body)
      }).catch(() => ({ ok: false, status: 500 }));
    }
    return res;
  }

  // رجیستری رکوردهای حذف‌شده توسط مدیریت (تضمین حذف قطعی حتی در صورت محدودیت DELETE روی برخی جداول سرور مرکزی)
  const inMemoryDeletedMap = new Map();

  function extractDeletedMapFromReviews(reviewsList) {
    const merged = new Map(inMemoryDeletedMap);
    if (Array.isArray(reviewsList)) {
      const rev = reviewsList
        .filter((r) => String(r?.id || '') === 'config_admin_deleted_records')
        .sort((a, b) => Number(a?.created_at_epoch || 0) - Number(b?.created_at_epoch || 0))
        .pop();
      if (rev?.comment) {
        const parsed = safeParseJson(rev.comment, {});
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            const ts = Number(v || 0);
            if (ts > (merged.get(k) || 0)) {
              merged.set(k, ts);
              inMemoryDeletedMap.set(k, ts);
            }
          }
        }
      }
    }
    return merged;
  }

  async function markRecordsDeleted(keys) {
    const now = Date.now();
    for (const k of keys) {
      if (k) inMemoryDeletedMap.set(k, now);
    }
    try {
      const r = await fetchDjangoJson('reviews/config_admin_deleted_records/').catch(() => ({ ok: false, data: null }));
      const existing = safeParseJson(r?.data?.comment, {}) || {};
      const nextObj = { ...(typeof existing === 'object' ? existing : {}) };
      for (const [k, ts] of inMemoryDeletedMap.entries()) {
        nextObj[k] = Math.max(Number(nextObj[k] || 0), ts);
      }
      const serialized = JSON.stringify(nextObj);
      await upsertReviewRecord({
        id: 'config_admin_deleted_records',
        request_id: 'SYSTEM_DELETED_RECORDS',
        service_title: 'CONFIG_ADMIN_DELETED_RECORDS',
        specialist_id: 'admin_system',
        specialist_name: 'مدیریت حذف رکوردها',
        customer_name: 'SYSTEM',
        customer_phone: '09000000000',
        stars: 5,
        quality_tags: 'SYSTEM_DELETED_RECORDS',
        comment: serialized,
        created_at_epoch: now,
        synced_with_django: true
      });
    } catch {}
  }

  function isRecordDeleted(deletedMap, key, itemEpoch = 0) {
    if (!key || !deletedMap.has(key)) return false;
    const deletedAt = Number(deletedMap.get(key) || 0);
    if (itemEpoch && Number(itemEpoch) > deletedAt) return false;
    return true;
  }

  async function loadAdminExpertsList(cachedReviews = null, cachedCustomers = null) {
    const defaults = getDefaultProtectedExperts();
    let parsedList = [];

    try {
      let rev = Array.isArray(cachedReviews)
        ? cachedReviews.filter((r) => String(r?.id || '') === 'config_admin_experts').pop()
        : null;
      if (!rev) {
        const r = await fetchDjangoJson('reviews/config_admin_experts/').catch(() => ({ ok: false, data: null }));
        if (r.ok && r.data) rev = r.data;
      }
      if (rev?.comment) {
        const arr = safeParseJson(rev.comment, []);
        if (Array.isArray(arr)) parsedList = arr;
      }
    } catch {}

    if (parsedList.length === 0) {
      try {
        let cust = Array.isArray(cachedCustomers)
          ? cachedCustomers.find((c) => String(c?.phone || '') === 'config_admin_experts')
          : null;
        if (!cust) {
          const c = await fetchDjangoJson('customers/config_admin_experts/').catch(() => ({ ok: false, data: null }));
          if (c.ok && c.data) cust = c.data;
        }
        if (cust?.full_name) {
          const arr = safeParseJson(cust.full_name, []);
          if (Array.isArray(arr)) parsedList = arr;
        }
      } catch {}
    }

    const byUsername = new Map();
    for (const def of defaults) {
      byUsername.set(def.username.toLowerCase(), { ...def });
    }
    for (const item of parsedList) {
      const uname = String(item?.username || '').trim();
      if (!uname) continue;
      const key = uname.toLowerCase();
      const roleCode = ADMIN_ROLES[item.role] ? item.role : 'SUPPORT_EXPERT';
      const existing = byUsername.get(key);
      if (PROTECTED_USERNAMES.has(key) && existing) {
        byUsername.set(key, {
          ...existing,
          display_name: String(item.display_name || existing.display_name).trim(),
          password: String(item.password || existing.password),
          is_active: true
        });
      } else {
        byUsername.set(key, {
          username: uname,
          password: String(item.password || ''),
          display_name: String(item.display_name || uname).trim(),
          role: roleCode,
          role_title: String(item.role_title || ADMIN_ROLES[roleCode].title),
          is_active: item.is_active !== false,
          created_at_epoch: Number(item.created_at_epoch || Date.now())
        });
      }
    }
    return Array.from(byUsername.values());
  }

  async function saveAdminExpertsList(experts) {
    const now = Date.now();
    const jsonComment = JSON.stringify(experts);
    await Promise.all([
      upsertReviewRecord({
        id: 'config_admin_experts',
        request_id: 'SYSTEM_ADMIN_EXPERTS',
        service_title: 'CONFIG_ADMIN_EXPERTS',
        specialist_id: 'admin_system',
        specialist_name: 'مدیریت کارشناسان تندیس',
        customer_name: 'SYSTEM',
        customer_phone: '09000000000',
        stars: 5,
        quality_tags: 'SYSTEM_ADMIN_EXPERTS',
        comment: jsonComment,
        created_at_epoch: now,
        synced_with_django: true
      }),
      upsertCustomerRecord('config_admin_experts', jsonComment, {
        role_title: 'SYSTEM_ADMIN_EXPERTS'
      })
    ]);
  }

  async function creditCustomerWalletServer(phone, deltaToman, reasonLabel = 'شارژ کیف پول تندیس') {
    const cleanPhone = normalizeStrictIranPhone(phone);
    if (!cleanPhone || !Number.isFinite(deltaToman)) return 0;

    const [customersRes, reviewsRes] = await Promise.all([
      fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
      fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] }))
    ]);
    const customers = Array.isArray(customersRes.data) ? customersRes.data : [];
    const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

    const cust = customers.find((c) => normalizePhone(c.phone) === cleanPhone && !String(c.phone || '').startsWith('hamkar_'));
    const walletRev = reviews
      .filter((r) => String(r?.id || '') === `wallet_${cleanPhone}`)
      .sort((a, b) => Number(a?.created_at_epoch || 0) - Number(b?.created_at_epoch || 0))
      .pop();

    let currentBal = 0;
    if (walletRev?.comment) {
      const wObj = safeParseJson(walletRev.comment, {});
      currentBal = Number(wObj?.wallet_balance ?? wObj?.balance_toman ?? wObj?.wallet_balance_toman ?? 0);
    } else if (cust?.full_name) {
      const m = String(cust.full_name).match(/WALLET:\s*(\d+)/i);
      if (m) currentBal = Number(m[1]);
    }

    const nextBal = Math.max(0, Math.round(currentBal + deltaToman));
    const now = Date.now();
    const rawFull = String(cust?.full_name || `مشتری تندیس | آبادان`);
    const isBlocked = /\[BLOCKED\]/i.test(rawFull);
    const cleanedSegments = rawFull
      .replace(/\[BLOCKED\]/gi, '')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s && !/^WALLET:/i.test(s));
    const baseName = cleanedSegments[0] || 'مشتری تندیس';
    const baseCity = cleanedSegments[1] || 'آبادان';
    const updatedFullName = `${isBlocked ? '[BLOCKED] ' : ''}${baseName} | ${baseCity} | WALLET:${nextBal}`;

    await Promise.all([
      upsertCustomerRecord(cleanPhone, updatedFullName),
      upsertReviewRecord({
        id: `wallet_${cleanPhone}`,
        request_id: 'CUSTOMER_WALLET',
        service_title: 'کیف پول تندیس',
        specialist_id: 'wallet_system',
        specialist_name: reasonLabel,
        customer_name: baseName,
        customer_phone: cleanPhone,
        stars: 5,
        quality_tags: `WALLET:${nextBal}`,
        comment: JSON.stringify({
          phone: cleanPhone,
          wallet_balance: nextBal,
          balance_toman: nextBal,
          wallet_balance_toman: nextBal,
          updated_at_epoch: now
        }),
        created_at_epoch: now,
        synced_with_django: true
      })
    ]);
    return nextBal;
  }

  function requireAdminAuth(requiredModule = null) {
    return (req, res, next) => {
      const authHeader = String(req.headers.authorization || '');
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const session = verifyAdminToken(token);
      if (!session) {
        return res.status(401).json({ ok: false, message: 'نشست مدیریت منقضی یا نامعتبر است. لطفاً مجدداً وارد شوید.' });
      }
      const roleDef = ADMIN_ROLES[session.role];
      if (!roleDef) {
        return res.status(403).json({ ok: false, message: 'نقش سازمانی معتبر نیست.' });
      }
      if (requiredModule && !roleDef.modules.includes(requiredModule)) {
        return res.status(403).json({ ok: false, message: 'شما مجوز دسترسی به این بخش را ندارید.' });
      }
      req.adminUser = {
        username: session.username,
        displayName: session.displayName,
        role: session.role,
        roleTitle: roleDef.title,
        canViewFinancials: roleDef.canViewFinancials,
        allowedModules: roleDef.modules
      };
      next();
    };
  }

  // ==================== ۱. ورود به پنل مدیریت ====================
  router.post('/auth/login', async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '').trim();
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
    }
    try {
      const experts = await loadAdminExpertsList();
      const matched = experts.find((e) => e.username.toLowerCase() === username.toLowerCase());
      if (!matched || !safeTimingEqual(matched.password, password)) {
        return res.status(401).json({ ok: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
      }
      if (!matched.is_active) {
        return res.status(403).json({ ok: false, message: 'حساب کاربری کارشناس غیرفعال شده است.' });
      }
      const roleDef = ADMIN_ROLES[matched.role] || ADMIN_ROLES.SUPPORT_EXPERT;
      const token = signAdminToken({
        username: matched.username,
        displayName: matched.display_name,
        role: roleDef.code,
        exp: Date.now() + TOKEN_TTL_MS
      });
      return res.json({
        ok: true,
        token,
        user: {
          username: matched.username,
          displayName: matched.display_name,
          role: roleDef.code,
          roleTitle: roleDef.title,
          canViewFinancials: roleDef.canViewFinancials,
          allowedModules: roleDef.modules
        }
      });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'خطا در برقراری ارتباط با سرور مرکزی تندیس.' });
    }
  });

  // ==================== ۲. همگام‌سازی زنده کل ۱۴ ماژول ====================
  router.get('/live-state', requireAdminAuth(), async (req, res) => {
    const { allowedModules, canViewFinancials, role } = req.adminUser;
    const isHr = role === 'HR_EXPERT';

    try {
      const [
        customersRes,
        specialistsRes,
        requestsRes,
        reviewsRes,
        categoriesRes,
        slidersRes,
        supportTicketsRes,
        altTicketsRes,
        altSupportTicketsRes,
        settlementsRes,
        loansRes,
        altLoansRes,
        violationsRes,
        altViolationsRes
      ] = await Promise.all([
        fetchDjangoJson('customers/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('specialists/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('requests/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('reviews/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('categories/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('sliders/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('support/tickets/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('tickets/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('support-tickets/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('settlements/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('tandis-pay/loans/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('loans/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('violations/').catch(() => ({ ok: false, data: [] })),
        fetchDjangoJson('violation-reports/').catch(() => ({ ok: false, data: [] }))
      ]);

      const rawCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];
      const rawSpecialists = Array.isArray(specialistsRes.data) ? specialistsRes.data : [];
      const rawRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
      const rawReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      const sortedReviews = [...rawReviews].sort(
        (a, b) => Number(a?.created_at_epoch || 0) - Number(b?.created_at_epoch || 0)
      );

      // پیشوندهای سیستمی غیرمشتری
      const NON_CUSTOMER_PREFIXES = [
        'hamkar_', 'config_', 'violation_', 'report_', 'takhalof_',
        'shekayat_', 'skill_', 'sld_', 'promo-', 'cat-'
      ];

      // مپ کیف پول و مسدودی از reviews
      const walletMap = new Map();
      const blockMap = new Map();
      const nameOverrideMap = new Map();
      const docsMap = new Map();
      const presenceMap = new Map();
      const dossierList = [];
      const beautyProfilesMap = new Map();
      const beautyBookingsMap = new Map();
      const loansMap = new Map();
      const settlementsMap = new Map();
      const notificationsList = [];
      const violationsMap = new Map();

      let commissionConfig = {
        default_rate_percent: 15,
        category_rates: {},
        min_rate_percent: 0,
        max_rate_percent: 50,
        updated_at_epoch: 0,
        updated_by: 'مدیریت تندیس',
        note: ''
      };
      let categoriesList = [];
      let homeSliders = [];
      let categorySliders = {};

      for (const r of sortedReviews) {
        const rid = String(r?.id || '').trim();
        const reqId = String(r?.request_id || '').trim().toUpperCase();
        const titleUpper = String(r?.service_title || '').trim().toUpperCase();
        const obj = safeParseJson(r?.comment, null);

        if (rid.startsWith('wallet_')) {
          const p = normalizePhone(rid.replace(/^wallet_(hamkar_)?/i, ''));
          if (p && obj) {
            const bal = Number(obj.wallet_balance ?? obj.balance_toman ?? obj.wallet_balance_toman ?? 0);
            walletMap.set(rid.startsWith('wallet_hamkar_') ? `hamkar_${p}` : p, bal);
          }
        } else if (rid.startsWith('blocked_')) {
          const p = normalizePhone(rid.replace(/^blocked_/i, ''));
          if (p && obj) blockMap.set(p, Boolean(obj.is_blocked));
        } else if (rid.startsWith('name_override_') || reqId === 'NAME_OVERRIDE') {
          const p = normalizePhone(r.customer_phone || rid.replace(/^name_override_/i, ''));
          if (p && obj?.full_name) nameOverrideMap.set(p, obj);
        } else if (rid.startsWith('docs_') || rid.startsWith('hamkar_docs_')) {
          const p = normalizePhone(rid.replace(/^(hamkar_)?docs_/i, ''));
          if (p && obj) {
            docsMap.set(p, { ...(docsMap.get(p) || {}), ...obj });
          }
        } else if (rid.startsWith('presence_') || rid.startsWith('telemetry_')) {
          const p = normalizePhone(rid.replace(/^(presence_|telemetry_)/i, ''));
          if (p && obj) {
            const prev = presenceMap.get(p) || {};
            presenceMap.set(p, {
              ...prev,
              ...obj,
              last_seen_epoch: Number(obj.last_seen_epoch || obj.updated_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (rid === 'config_commission' || reqId === 'SYSTEM_COMMISSION' || titleUpper === 'CONFIG_COMMISSION') {
          if (obj && typeof obj === 'object') {
            commissionConfig = {
              default_rate_percent: Number(obj.default_rate_percent ?? 15),
              category_rates: obj.category_rates && typeof obj.category_rates === 'object' ? obj.category_rates : {},
              min_rate_percent: Number(obj.min_rate_percent ?? 0),
              max_rate_percent: Number(obj.max_rate_percent ?? 50),
              updated_at_epoch: Number(obj.updated_at_epoch || r.created_at_epoch || 0),
              updated_by: String(obj.updated_by || r.specialist_name || 'مدیریت تندیس'),
              note: String(obj.note || '')
            };
          }
        } else if (rid === 'config_categories') {
          if (Array.isArray(obj)) categoriesList = obj;
        } else if (rid === 'config_sliders' || titleUpper === 'HOME_SLIDERS_CONFIG') {
          if (Array.isArray(obj)) homeSliders = obj;
        } else if (rid === 'config_category_sliders' || titleUpper === 'CATEGORY_SLIDERS_CONFIG') {
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) categorySliders = obj;
        } else if (rid.startsWith('dossier_') || titleUpper === 'INVOICE_DOSSIER') {
          if (obj && typeof obj === 'object') {
            dossierList.push({
              id: rid,
              request_id: String(r.request_id || rid.replace(/^dossier_/, '')),
              specialist_phone: normalizePhone(obj.specialist_phone || r.specialist_id || ''),
              specialist_name: String(obj.specialist_name || r.specialist_name || 'متخصص تندیس'),
              customer_phone: normalizePhone(obj.customer_phone || r.customer_phone || ''),
              customer_name: String(obj.customer_name || r.customer_name || 'مشتری تندیس'),
              service_title: String(obj.service_title || r.service_title || 'خدمت تندیس'),
              labor_toman: Number(obj.labor_toman || obj.wage_toman || 0),
              parts_toman: Number(obj.parts_toman || 0),
              total_toman: Number(obj.total_toman || obj.final_price_toman || obj.price_toman || 0),
              commission_rate: Number(obj.commission_rate ?? commissionConfig.default_rate_percent),
              commission_toman: Number(obj.commission_toman || 0),
              net_specialist_toman: Number(obj.net_specialist_toman || 0),
              items: Array.isArray(obj.items) ? obj.items : [],
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (rid.startsWith('spec_profile_') || rid.startsWith('beauty_spec_') || titleUpper === 'BEAUTY_SPECIALIST_PROFILE') {
          const p = normalizePhone(obj?.specialist_phone || obj?.phone || rid.replace(/^(spec_profile_|beauty_spec_)/i, ''));
          if (p && obj) {
            beautyProfilesMap.set(p, {
              id: rid,
              specialist_phone: p,
              specialist_name: String(obj.specialist_name || obj.full_name || r.specialist_name || 'متخصص زیبایی'),
              city: String(obj.city || obj.service_city || 'آبادان'),
              avatar_url: obj.avatar_url || obj.profile_photo || null,
              bio: String(obj.bio || ''),
              selected_skills: Array.isArray(obj.selected_skills) ? obj.selected_skills : [],
              portfolio_items: Array.isArray(obj.portfolio_items) ? obj.portfolio_items : [],
              service_prices: Array.isArray(obj.service_prices) ? obj.service_prices : [],
              rawCommentObj: obj,
              updated_at_epoch: Number(obj.updated_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (rid.startsWith('beauty_booking_') || rid.startsWith('beauty_apt_') || titleUpper === 'BEAUTY_APPOINTMENT_BOOKING') {
          if (obj && typeof obj === 'object') {
            beautyBookingsMap.set(rid, {
              id: rid,
              customer_name: String(obj.customer_name || r.customer_name || 'مشتری تندیس'),
              customer_phone: normalizePhone(obj.customer_phone || r.customer_phone || ''),
              specialist_name: String(obj.specialist_name || r.specialist_name || 'متخصص زیبایی'),
              specialist_phone: normalizePhone(obj.specialist_phone || r.specialist_id || ''),
              service_title: String(obj.service_title || obj.skill_title || r.service_title || 'خدمت زیبایی'),
              appointment_date: String(obj.appointment_date || obj.date_jalali || ''),
              appointment_time: String(obj.appointment_time || obj.time_slot || ''),
              total_amount_toman: Number(obj.total_amount_toman || obj.price_toman || 0),
              paid_amount_toman: Number(obj.paid_amount_toman || obj.deposit_toman || 0),
              status: String(obj.status || 'CONFIRMED').toUpperCase(),
              wallet_refunded: Boolean(obj.wallet_refunded),
              rawCommentObj: obj,
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (rid.startsWith('loan_') || titleUpper === 'TANDIS_PAY_LOAN' || reqId === 'TANDIS_PAY_LOAN') {
          if (obj && typeof obj === 'object') {
            loansMap.set(rid, {
              id: rid,
              customer_name: String(obj.customer_name || obj.full_name || r.customer_name || 'مشتری تندیس'),
              customer_phone: normalizePhone(obj.customer_phone || obj.phone || r.customer_phone || ''),
              national_code: String(obj.national_code || obj.national_id || ''),
              requested_amount_toman: Number(obj.requested_amount_toman || obj.amount_toman || 0),
              installments_count: Number(obj.installments_count || obj.months || 12),
              monthly_installment_toman: Number(obj.monthly_installment_toman || 0),
              status: String(obj.status || 'PENDING').toUpperCase(),
              tracking_code: String(obj.tracking_code || ''),
              wallet_credited: Boolean(obj.wallet_credited),
              reject_reason: String(obj.reject_reason || obj.admin_note || ''),
              national_card_image_base64: obj.national_card_image_base64 || null,
              shenasnameh_image_base64: obj.shenasnameh_image_base64 || null,
              income_proof_image_base64: obj.income_proof_image_base64 || null,
              rawCommentObj: obj,
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (rid.startsWith('settlement_') || titleUpper === 'SPECIALIST_SETTLEMENT' || reqId === 'SPECIALIST_SETTLEMENT') {
          if (obj && typeof obj === 'object') {
            const ibanInfo = inspectIranIban(obj.shaba_number || obj.iban || '');
            settlementsMap.set(rid, {
              id: rid,
              specialist_name: String(obj.specialist_name || r.specialist_name || 'متخصص تندیس'),
              specialist_phone: normalizePhone(obj.specialist_phone || obj.phone || r.customer_phone || ''),
              amount_toman: Number(obj.amount_toman || obj.requested_amount_toman || 0),
              shaba_number: ibanInfo.formatted,
              shaba_valid: ibanInfo.valid,
              bank_name: obj.bank_name || ibanInfo.bankName,
              status: String(obj.status || 'PENDING').toUpperCase(),
              bank_tracking_code: String(obj.bank_tracking_code || obj.tracking_code || ''),
              source_account: String(obj.source_account || ''),
              payment_method: String(obj.payment_method || ''),
              processed_by: String(obj.processed_by || ''),
              reject_reason: String(obj.reject_reason || ''),
              invoice_breakdowns: Array.isArray(obj.invoice_breakdowns) ? obj.invoice_breakdowns : [],
              rawCommentObj: obj,
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (rid.startsWith('notif_') || ['ADMIN_NOTIFICATION', 'SYSTEM_NOTIFICATION', 'BROADCAST_NOTIFICATION'].includes(reqId)) {
          if (obj && typeof obj === 'object') {
            notificationsList.push({
              id: rid,
              title: String(obj.title || r.service_title || 'اطلاعیه مدیریت تندیس'),
              message: String(obj.message || obj.body || obj.text || ''),
              target_phone: String(obj.target_phone || 'ALL'),
              target_audience: String(obj.target_audience || (obj.target_phone && obj.target_phone !== 'ALL' ? 'SINGLE' : 'ALL')).toUpperCase(),
              sender_role: String(obj.sender_role || 'ADMIN'),
              created_at_epoch: Number(obj.created_at_epoch || r.created_at_epoch || 0)
            });
          }
        } else if (/^(violation_|report_|takhalof_|shekayat_)/i.test(rid) || titleUpper === 'SPECIALIST_VIOLATION') {
          const vObj = obj || { description: String(r.comment || '') };
          violationsMap.set(rid, {
            id: rid,
            specialist_phone: normalizePhone(vObj.specialist_phone || r.specialist_id || ''),
            specialist_name: String(vObj.specialist_name || r.specialist_name || 'متخصص'),
            reporter_phone: normalizePhone(vObj.reporter_phone || r.customer_phone || ''),
            reporter_name: String(vObj.reporter_name || r.customer_name || 'گزارش‌دهنده'),
            subject: String(vObj.subject || vObj.title || r.service_title || 'گزارش تخلف'),
            description: String(vObj.description || vObj.details || ''),
            status: String(vObj.status || 'UNDER_REVIEW').toUpperCase(),
            fine_toman: Number(vObj.fine_toman || 0),
            inspection_note: String(vObj.inspection_note || ''),
            rawCommentObj: vObj,
            created_at_epoch: Number(vObj.created_at_epoch || r.created_at_epoch || 0)
          });
        }
      }

      // ادغام مسیرهای مستقیم وام، تسویه و تخلفات در صورت پاسخگو بودن روی Django
      for (const arr of [loansRes.data, altLoansRes.data]) {
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
          const id = String(item?.id || `loan_${item?.created_at_epoch || Date.now()}`);
          if (!loansMap.has(id)) {
            loansMap.set(id, {
              id,
              customer_name: String(item.customer_name || item.full_name || 'مشتری تندیس'),
              customer_phone: normalizePhone(item.customer_phone || item.phone || ''),
              national_code: String(item.national_code || item.national_id || ''),
              requested_amount_toman: Number(item.requested_amount_toman || item.amount_toman || 0),
              installments_count: Number(item.installments_count || 12),
              monthly_installment_toman: Number(item.monthly_installment_toman || 0),
              status: String(item.status || 'PENDING').toUpperCase(),
              tracking_code: String(item.tracking_code || ''),
              wallet_credited: Boolean(item.wallet_credited),
              reject_reason: String(item.reject_reason || ''),
              national_card_image_base64: item.national_card_image_base64 || null,
              shenasnameh_image_base64: item.shenasnameh_image_base64 || null,
              income_proof_image_base64: item.income_proof_image_base64 || null,
              rawCommentObj: item,
              created_at_epoch: Number(item.created_at_epoch || Date.now())
            });
          }
        }
      }

      if (Array.isArray(settlementsRes.data)) {
        for (const item of settlementsRes.data) {
          const id = String(item?.id || `settlement_${item?.created_at_epoch || Date.now()}`);
          if (!settlementsMap.has(id)) {
            const ibanInfo = inspectIranIban(item.shaba_number || item.iban || '');
            settlementsMap.set(id, {
              id,
              specialist_name: String(item.specialist_name || 'متخصص تندیس'),
              specialist_phone: normalizePhone(item.specialist_phone || item.phone || ''),
              amount_toman: Number(item.amount_toman || item.requested_amount_toman || 0),
              shaba_number: ibanInfo.formatted,
              shaba_valid: ibanInfo.valid,
              bank_name: item.bank_name || ibanInfo.bankName,
              status: String(item.status || 'PENDING').toUpperCase(),
              bank_tracking_code: String(item.bank_tracking_code || item.tracking_code || ''),
              source_account: String(item.source_account || ''),
              payment_method: String(item.payment_method || ''),
              processed_by: String(item.processed_by || ''),
              reject_reason: String(item.reject_reason || ''),
              invoice_breakdowns: Array.isArray(item.invoice_breakdowns) ? item.invoice_breakdowns : [],
              rawCommentObj: item,
              created_at_epoch: Number(item.created_at_epoch || Date.now())
            });
          }
        }
      }

      for (const arr of [violationsRes.data, altViolationsRes.data]) {
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
          const id = String(item?.id || `violation_${item?.created_at_epoch || Date.now()}`);
          if (!violationsMap.has(id)) {
            violationsMap.set(id, {
              id,
              specialist_phone: normalizePhone(item.specialist_phone || ''),
              specialist_name: String(item.specialist_name || 'متخصص'),
              reporter_phone: normalizePhone(item.reporter_phone || ''),
              reporter_name: String(item.reporter_name || 'گزارش‌دهنده'),
              subject: String(item.subject || item.title || 'گزارش تخلف'),
              description: String(item.description || ''),
              status: String(item.status || 'UNDER_REVIEW').toUpperCase(),
              fine_toman: Number(item.fine_toman || 0),
              inspection_note: String(item.inspection_note || ''),
              rawCommentObj: item,
              created_at_epoch: Number(item.created_at_epoch || Date.now())
            });
          }
        }
      }

      // خواندن تخلفات ذخیره‌شده در جدول customers
      for (const c of rawCustomers) {
        const pRaw = String(c?.phone || '').trim();
        if (/^(violation_|report_|takhalof_|shekayat_)/i.test(pRaw) && !violationsMap.has(pRaw)) {
          const parsed = safeParseJson(c.full_name, null);
          violationsMap.set(pRaw, {
            id: pRaw,
            specialist_phone: normalizePhone(parsed?.specialist_phone || ''),
            specialist_name: String(parsed?.specialist_name || 'متخصص'),
            reporter_phone: normalizePhone(parsed?.reporter_phone || ''),
            reporter_name: String(parsed?.reporter_name || 'مشتری'),
            subject: String(parsed?.subject || 'گزارش تخلف'),
            description: String(parsed?.description || c.full_name || ''),
            status: String(parsed?.status || 'UNDER_REVIEW').toUpperCase(),
            fine_toman: Number(parsed?.fine_toman || 0),
            inspection_note: String(parsed?.inspection_note || ''),
            rawCommentObj: parsed || {},
            created_at_epoch: Number(parsed?.created_at_epoch || Date.now())
          });
        }
      }

      if (categoriesList.length === 0 && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
        categoriesList = categoriesRes.data;
      }
      if (homeSliders.length === 0 && Array.isArray(slidersRes.data) && slidersRes.data.length > 0) {
        homeSliders = slidersRes.data;
      }

      // ==================== مشتریان واقعی (فقط 09 و بدون پیشوند سیستمی) ====================
      const customers = [];
      const seenCustPhones = new Set();
      for (const c of rawCustomers) {
        const rawPhone = String(c?.phone || '').trim();
        const lowerPhone = rawPhone.toLowerCase();
        if (NON_CUSTOMER_PREFIXES.some((pref) => lowerPhone.startsWith(pref))) continue;
        const cleanPhone = normalizeStrictIranPhone(rawPhone);
        if (!cleanPhone || seenCustPhones.has(cleanPhone)) continue;
        seenCustPhones.add(cleanPhone);

        const rawFull = String(c.full_name || '');
        const blockedByPrefix = /\[BLOCKED\]/i.test(rawFull) || c.is_active === false || c.is_blocked === true;
        const isBlocked = blockMap.has(cleanPhone) ? blockMap.get(cleanPhone) : blockedByPrefix;

        const walletMatch = rawFull.match(/WALLET:\s*(\d+)/i);
        const walletFromName = walletMatch ? Number(walletMatch[1]) : Number(c.wallet_balance_toman || 0);
        const walletBalance = walletMap.has(cleanPhone) ? walletMap.get(cleanPhone) : walletFromName;

        const cleanedParts = rawFull
          .replace(/\[BLOCKED\]/gi, '')
          .split('|')
          .map((s) => s.trim())
          .filter((s) => s && !/^WALLET:/i.test(s));

        const override = nameOverrideMap.get(cleanPhone);
        const fullName = String(override?.full_name || cleanedParts[0] || 'مشتری تندیس').trim();
        const city = String(override?.city || cleanedParts[1] || c.city || 'آبادان').trim();

        customers.push({
          phone: cleanPhone,
          fullName,
          city,
          walletBalance: canViewFinancials || allowedModules.includes('customers_orders') ? walletBalance : 0,
          isBlocked,
          rawFullName: rawFull
        });
      }

      // ==================== سفارش‌های هوشمند (فیلتر تیکت + محافظت هم‌شماره) ====================
      const orders = [];
      for (const r of rawRequests) {
        const rid = String(r?.id || '').trim();
        const catId = String(r?.service_category_id || '').trim().toUpperCase();
        if (
          /^(ticket_|tkt_req_|tkt_)/i.test(rid) ||
          catId === 'SUPPORT_TICKET'
        ) {
          continue;
        }
        const custPhone = normalizePhone(r.customer_phone || '');
        const specPhone = normalizePhone(r.assigned_specialist_phone || r.specialist_phone || '');
        // قانون محافظت هم‌شماره
        if (custPhone && specPhone && custPhone === specPhone) continue;

        orders.push({
          id: rid,
          customer_name: String(r.customer_name || 'مشتری تندیس'),
          customer_phone: custPhone,
          assigned_specialist_name: String(r.assigned_specialist_name || r.specialist_name || ''),
          assigned_specialist_phone: specPhone,
          service_category_id: String(r.service_category_id || ''),
          service_title: String(r.service_title || 'خدمت تندیس'),
          car_model: String(r.car_model || ''),
          car_plate: String(r.car_plate || ''),
          issue_description: String(r.issue_description || ''),
          neighborhood: String(r.neighborhood || ''),
          home_address: String(r.home_address || ''),
          price_toman: Number(r.price_toman || r.final_price_toman || 0),
          is_urgent: Boolean(r.is_urgent),
          is_paid_online: Boolean(r.is_paid_online),
          status: String(r.status || 'PENDING_NEARBY').toUpperCase(),
          quality_tags: String(r.quality_tags || ''),
          created_at_epoch: Number(r.created_at_epoch || 0)
        });
      }
      orders.sort((a, b) => b.created_at_epoch - a.created_at_epoch);

      // ==================== متخصصین و رادار آنلاین ====================
      const specialistsMap = new Map();
      for (const c of rawCustomers) {
        const rawPhone = String(c?.phone || '').trim();
        if (!rawPhone.toLowerCase().startsWith('hamkar_')) continue;
        const parsed = parseHamkarCustomerRecord(c);
        if (!parsed || !parsed.phone) continue;
        const rawParts = String(c.full_name || '').split('|').map((s) => s.trim());
        const docs = docsMap.get(parsed.phone) || {};
        const presence = presenceMap.get(parsed.phone) || {};
        const now = Date.now();
        const lastSeen = Number(presence.last_seen_epoch || 0);
        const isOnlineNow =
          Boolean(presence.is_online_now) ||
          (lastSeen > 0 && now - lastSeen < 3 * 60 * 1000) ||
          parsed.isOnline;

        const rejectOrBlockReason =
          rawParts.length === 11 && rawParts[8] ? rawParts[8] : String(c.block_reason || c.reject_reason || '');
        const fatherName = rawParts.length === 11 && rawParts[9] ? rawParts[9] : String(c.father_name || '');

        specialistsMap.set(parsed.phone, {
          ...parsed,
          fatherName,
          reason: rejectOrBlockReason,
          isOnlineNow,
          isAcceptingRequests: Boolean(presence.is_accepting_requests ?? isOnlineNow),
          lastSeenEpoch: lastSeen,
          ipAddress: String(presence.ip_address || presence.ip || ''),
          walletBalance: canViewFinancials ? Number(walletMap.get(`hamkar_${parsed.phone}`) || 0) : 0,
          profilePhoto: docs.profile_photo || docs.profilePhoto || parsed.profilePhoto || null,
          shenasnamehPhoto: docs.shenasnameh_photo || docs.shenasnamehPhoto || parsed.shenasnamehPhoto || null,
          nationalCardPhoto: docs.national_card_photo || docs.nationalCardPhoto || parsed.nationalCardPhoto || null,
          skillLicensePhoto: docs.skill_license_photo || docs.skillLicensePhoto || parsed.skillLicensePhoto || null,
          rawFullName: String(c.full_name || '')
        });
      }

      for (const sp of rawSpecialists) {
        const p = normalizePhone(sp?.phone || '');
        if (!p) continue;
        if (!specialistsMap.has(p)) {
          const parsed = parseHamkarCustomerRecord(sp, p);
          const docs = docsMap.get(p) || {};
          const presence = presenceMap.get(p) || {};
          specialistsMap.set(p, {
            ...parsed,
            fatherName: String(sp.father_name || ''),
            reason: String(sp.block_reason || sp.reject_reason || ''),
            isOnlineNow: Boolean(presence.is_online_now),
            isAcceptingRequests: Boolean(presence.is_accepting_requests),
            lastSeenEpoch: Number(presence.last_seen_epoch || 0),
            ipAddress: String(presence.ip_address || ''),
            walletBalance: canViewFinancials ? Number(walletMap.get(`hamkar_${p}`) || 0) : 0,
            profilePhoto: docs.profile_photo || sp.profile_photo || null,
            shenasnamehPhoto: docs.shenasnameh_photo || sp.shenasnameh_photo || null,
            nationalCardPhoto: docs.national_card_photo || sp.national_card_photo || null,
            skillLicensePhoto: docs.skill_license_photo || sp.skill_license_photo || null,
            rawFullName: String(sp.full_name || '')
          });
        }
      }

      // تشخیص خودکار کد ملی تکراری بین متخصصین
      const ncCounter = new Map();
      for (const sp of specialistsMap.values()) {
        if (sp.nationalCode && /^\d{10}$/.test(sp.nationalCode)) {
          ncCounter.set(sp.nationalCode, (ncCounter.get(sp.nationalCode) || 0) + 1);
        }
      }

      const specialists = Array.from(specialistsMap.values()).map((sp) => {
        const isDuplicateNationalCode = Boolean(sp.nationalCode && (ncCounter.get(sp.nationalCode) || 0) > 1);
        // محدودیت امنیتی HR_EXPERT: حذف شماره شبا، رسید پرداخت و مانده مالی
        if (isHr) {
          return {
            ...sp,
            shabaNumber: '',
            trackingCode: '',
            walletBalance: 0,
            isDuplicateNationalCode
          };
        }
        return { ...sp, isDuplicateNationalCode };
      });

      // ==================== تیکت‌های پشتیبانی یکپارچه ۳ منبعی ====================
      const ticketsMap = new Map();
      const upsertMergedTicket = (raw, sourceTag) => {
        const coreId = normalizeTicketCoreId(raw.id || raw.ticket_id);
        if (!coreId) return;
        const existing = ticketsMap.get(coreId);
        const senderPhone = normalizePhone(raw.sender_phone || raw.user_phone || raw.customer_phone || '');
        const rawRole = String(raw.sender_role || raw.user_role || '').toUpperCase();
        const isSpecialistTicket =
          rawRole === 'SPECIALIST' ||
          rawRole === 'HAMKAR' ||
          String(raw.sender_phone || raw.user_phone || '').toLowerCase().startsWith('hamkar_') ||
          /همکار|متخصص/.test(String(raw.quality_tags || raw.car_model || ''));

        const reply = String(raw.admin_reply || existing?.admin_reply || '').trim();
        const messages = Array.isArray(raw.messages) && raw.messages.length > 0
          ? raw.messages
          : existing?.messages?.length
          ? existing.messages
          : [
              ...(raw.message || raw.initial_message ? [{ sender: 'USER', text: String(raw.message || raw.initial_message) }] : []),
              ...(reply ? [{ sender: 'ADMIN', text: reply }] : [])
            ];

        ticketsMap.set(coreId, {
          id: coreId,
          sender_name: String(raw.sender_name || raw.user_name || raw.customer_name || existing?.sender_name || 'کاربر تندیس'),
          sender_phone: senderPhone || existing?.sender_phone || '',
          sender_type: isSpecialistTicket || existing?.sender_type === 'SPECIALIST' ? 'SPECIALIST' : 'CUSTOMER',
          subject: String(raw.subject || raw.service_title || existing?.subject || 'درخواست پشتیبانی'),
          message: String(raw.message || raw.initial_message || raw.issue_description || existing?.message || ''),
          admin_reply: reply,
          status: reply ? 'ANSWERED' : String(raw.status || existing?.status || 'OPEN').toUpperCase(),
          messages,
          created_at_epoch: Math.max(Number(raw.created_at_epoch || 0), Number(existing?.created_at_epoch || 0)),
          sources: Array.from(new Set([...(existing?.sources || []), sourceTag]))
        });
      };

      for (const list of [supportTicketsRes.data, altTicketsRes.data, altSupportTicketsRes.data]) {
        if (!Array.isArray(list)) continue;
        for (const t of list) upsertMergedTicket(t, 'support');
      }
      for (const r of rawRequests) {
        const rid = String(r?.id || '');
        if (/^(tkt_req_|ticket_|tkt_)/i.test(rid) || String(r?.service_category_id || '').toUpperCase() === 'SUPPORT_TICKET') {
          const parsed = safeParseJson(r.issue_description, null);
          upsertMergedTicket(
            {
              id: rid,
              sender_name: r.customer_name,
              sender_phone: r.customer_phone,
              subject: parsed?.subject || r.service_title,
              message: parsed?.message || r.issue_description,
              admin_reply: parsed?.admin_reply || r.admin_reply || '',
              status: parsed?.status || (r.status === 'COMPLETED' ? 'ANSWERED' : 'OPEN'),
              messages: parsed?.messages,
              quality_tags: r.quality_tags,
              car_model: r.car_model,
              created_at_epoch: r.created_at_epoch
            },
            'requests'
          );
        }
      }
      for (const r of sortedReviews) {
        const rid = String(r?.id || '');
        if (/^(ticket_|tkt_)/i.test(rid) || String(r?.request_id || '').toUpperCase() === 'SUPPORT_TICKET') {
          const parsed = safeParseJson(r.comment, null);
          upsertMergedTicket(
            {
              id: rid,
              sender_name: parsed?.user_name || parsed?.sender_name || r.customer_name,
              sender_phone: parsed?.user_phone || parsed?.sender_phone || r.customer_phone,
              sender_role: parsed?.sender_role || parsed?.role || '',
              subject: parsed?.subject || r.service_title,
              message: parsed?.message || parsed?.initial_message || (typeof r.comment === 'string' && !parsed ? r.comment : ''),
              admin_reply: parsed?.admin_reply || '',
              status: parsed?.status || (parsed?.admin_reply ? 'ANSWERED' : 'OPEN'),
              messages: parsed?.messages,
              quality_tags: r.quality_tags,
              created_at_epoch: parsed?.created_at_epoch || r.created_at_epoch
            },
            'reviews'
          );
        }
      }
      const deletedMap = extractDeletedMapFromReviews(sortedReviews);

      const activeCustomers = customers.filter((c) => !isRecordDeleted(deletedMap, `customer:${c.phone}`));
      const activeOrders = orders.filter((o) => !isRecordDeleted(deletedMap, `order:${o.id}`, o.created_at_epoch));
      const activeSpecialists = specialists.filter((s) => !isRecordDeleted(deletedMap, `specialist:${s.phone}`));
      const activeDossiers = dossierList.filter(
        (d) =>
          !isRecordDeleted(deletedMap, `dossier:${d.id}`, d.created_at_epoch) &&
          !isRecordDeleted(deletedMap, `order:${d.request_id}`, d.created_at_epoch)
      );

      const tickets = Array.from(ticketsMap.values())
        .filter((t) => !isRecordDeleted(deletedMap, `ticket:${t.id}`, t.created_at_epoch))
        .sort((a, b) => b.created_at_epoch - a.created_at_epoch);

      const beautyProfiles = Array.from(beautyProfilesMap.values()).filter(
        (p) =>
          !isRecordDeleted(deletedMap, `beauty_profile:${p.id}`, p.updated_at_epoch) &&
          !isRecordDeleted(deletedMap, `beauty_profile:${p.specialist_phone}`, p.updated_at_epoch) &&
          !isRecordDeleted(deletedMap, `specialist:${p.specialist_phone}`)
      );
      const beautyBookings = Array.from(beautyBookingsMap.values())
        .filter((b) => !isRecordDeleted(deletedMap, `beauty_booking:${b.id}`, b.created_at_epoch))
        .sort((a, b) => b.created_at_epoch - a.created_at_epoch);
      const loans = Array.from(loansMap.values())
        .filter((l) => !isRecordDeleted(deletedMap, `loan:${l.id}`, l.created_at_epoch))
        .sort((a, b) => b.created_at_epoch - a.created_at_epoch);
      const settlements = Array.from(settlementsMap.values())
        .filter((s) => !isRecordDeleted(deletedMap, `settlement:${s.id}`, s.created_at_epoch))
        .sort((a, b) => b.created_at_epoch - a.created_at_epoch);
      const violations = Array.from(violationsMap.values())
        .filter((v) => !isRecordDeleted(deletedMap, `violation:${v.id}`, v.created_at_epoch))
        .sort((a, b) => b.created_at_epoch - a.created_at_epoch);
      const activeNotifications = notificationsList
        .filter((n) => !isRecordDeleted(deletedMap, `notification:${n.id}`, n.created_at_epoch))
        .sort((a, b) => b.created_at_epoch - a.created_at_epoch);

      // جایگزینی آرایه‌های فیلترشده
      customers.length = 0;
      customers.push(...activeCustomers);
      orders.length = 0;
      orders.push(...activeOrders);
      specialists.length = 0;
      specialists.push(...activeSpecialists);
      dossierList.length = 0;
      dossierList.push(...activeDossiers);
      notificationsList.length = 0;
      notificationsList.push(...activeNotifications);

      // محاسبات مالی واقعی
      const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
      const totalOrdersRevenue = completedOrders.reduce((s, o) => s + Number(o.price_toman || 0), 0);
      const defaultRate = Number(commissionConfig.default_rate_percent || 15);
      const totalCommissionRevenue = completedOrders.reduce((s, o) => {
        const rate = Number(commissionConfig.category_rates?.[o.service_category_id] ?? defaultRate);
        return s + Math.round((Number(o.price_toman || 0) * rate) / 100);
      }, 0);
      const netSpecialistShare = Math.max(0, totalOrdersRevenue - totalCommissionRevenue);
      const settledTotalToman = settlements
        .filter((s) => s.status === 'PAID_COMPLETED')
        .reduce((sum, s) => sum + Number(s.amount_toman || 0), 0);

      const pendingBeautyPricesCount = beautyProfiles.reduce(
        (acc, p) => acc + p.service_prices.filter((sp) => String(sp?.status || 'PENDING').toUpperCase() === 'PENDING' && !sp?.admin_approved).length,
        0
      );

      const stats = {
        customersTotal: customers.length,
        customersActive: customers.filter((c) => !c.isBlocked).length,
        customersBlocked: customers.filter((c) => c.isBlocked).length,
        specialistsTotal: specialists.length,
        specialistsApproved: specialists.filter((s) => s.approvalStatus === 'APPROVED').length,
        specialistsPending: specialists.filter((s) => ['PENDING', 'PENDING_ADMIN_APPROVAL'].includes(s.approvalStatus)).length,
        specialistsOnline: specialists.filter((s) => s.isOnlineNow).length,
        specialistsBlocked: specialists.filter((s) => s.approvalStatus === 'BLOCKED').length,
        ordersTotal: orders.length,
        ordersCompleted: completedOrders.length,
        ordersInProgress: orders.filter((o) => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'DIAGNOSING', 'PRICE_PROPOSED'].includes(o.status)).length,
        ordersPending: orders.filter((o) => ['PENDING', 'PENDING_NEARBY', 'SEARCHING'].includes(o.status)).length,
        ordersCancelled: orders.filter((o) => o.status === 'CANCELLED').length,
        totalOrdersRevenue: canViewFinancials ? totalOrdersRevenue : 0,
        totalCommissionRevenue: canViewFinancials ? totalCommissionRevenue : 0,
        netSpecialistShare: canViewFinancials ? netSpecialistShare : 0,
        settledTotalToman: canViewFinancials ? settledTotalToman : 0,
        pendingSettlementsCount: settlements.filter((s) => ['PENDING', 'APPROVED_FOR_PAYMENT'].includes(s.status)).length,
        pendingLoansCount: loans.filter((l) => l.status === 'PENDING').length,
        pendingBeautyPricesCount,
        openTicketsCount: tickets.filter((t) => t.status !== 'ANSWERED' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
        openViolationsCount: violations.filter((v) => v.status !== 'CLOSED').length
      };

      // ساخت فید اعلان‌های زنده بالای پنل
      const liveAlerts = [];
      for (const t of tickets.filter((x) => x.status !== 'ANSWERED' && x.status !== 'CLOSED').slice(0, 8)) {
        liveAlerts.push({
          id: `alert_tkt_${t.id}`,
          category: 'TICKETS',
          title: `تیکت جدید از ${t.sender_name}`,
          subtitle: t.subject,
          targetModule: 'tickets',
          createdAtEpoch: t.created_at_epoch
        });
      }
      for (const s of specialists.filter((x) => ['PENDING', 'PENDING_ADMIN_APPROVAL'].includes(x.approvalStatus)).slice(0, 8)) {
        liveAlerts.push({
          id: `alert_doc_${s.phone}`,
          category: 'DOCS',
          title: `پرونده متخصص در انتظار تایید: ${s.fullName}`,
          subtitle: `${s.roleTitle} • ${s.serviceCity}`,
          targetModule: 'specialists',
          createdAtEpoch: s.lastSeenEpoch || Date.now()
        });
      }
      for (const v of violations.filter((x) => x.status !== 'CLOSED').slice(0, 6)) {
        liveAlerts.push({
          id: `alert_vio_${v.id}`,
          category: 'VIOLATIONS',
          title: `گزارش تخلف: ${v.subject}`,
          subtitle: v.specialist_name,
          targetModule: 'violations',
          createdAtEpoch: v.created_at_epoch
        });
      }
      if (canViewFinancials) {
        for (const st of settlements.filter((x) => x.status === 'PENDING').slice(0, 6)) {
          liveAlerts.push({
            id: `alert_set_${st.id}`,
            category: 'SETTLEMENTS',
            title: `درخواست تسویه حساب: ${st.specialist_name}`,
            subtitle: `${st.amount_toman.toLocaleString('fa-IR')} تومان`,
            targetModule: 'settlements',
            createdAtEpoch: st.created_at_epoch
          });
        }
      }
      for (const ln of loans.filter((x) => x.status === 'PENDING').slice(0, 6)) {
        liveAlerts.push({
          id: `alert_loan_${ln.id}`,
          category: 'LOANS',
          title: `درخواست وام تندیس‌پی: ${ln.customer_name}`,
          subtitle: `${ln.requested_amount_toman.toLocaleString('fa-IR')} تومان`,
          targetModule: 'loans',
          createdAtEpoch: ln.created_at_epoch
        });
      }
      for (const bp of beautyProfiles) {
        const pendingCount = bp.service_prices.filter((p) => String(p?.status || 'PENDING').toUpperCase() === 'PENDING' && !p?.admin_approved).length;
        if (pendingCount > 0) {
          liveAlerts.push({
            id: `alert_beauty_${bp.specialist_phone}`,
            category: 'BEAUTY',
            title: `قیمت زیبایی در انتظار تایید: ${bp.specialist_name}`,
            subtitle: `${pendingCount} تعرفه پیشنهادی جدید`,
            targetModule: 'beauty',
            createdAtEpoch: bp.updated_at_epoch
          });
        }
      }
      liveAlerts.sort((a, b) => (b.createdAtEpoch || 0) - (a.createdAtEpoch || 0));

      const rawExperts = allowedModules.includes('experts')
        ? await loadAdminExpertsList(sortedReviews, rawCustomers)
        : [];
      // هرگز رمز عبور خام کارشناسان را در پاسخ لیست برنگردان
      const experts = rawExperts.map((e) => ({
        username: e.username,
        display_name: e.display_name,
        role: e.role,
        role_title: e.role_title,
        is_active: e.is_active,
        is_protected: PROTECTED_USERNAMES.has(e.username.toLowerCase()),
        created_at_epoch: e.created_at_epoch
      }));

      return res.json({
        ok: true,
        online: customersRes.ok || requestsRes.ok || reviewsRes.ok,
        syncedAtEpoch: Date.now(),
        stats,
        liveAlerts: liveAlerts.filter((a) => allowedModules.includes(a.targetModule)),
        customers: allowedModules.includes('customers_orders') || allowedModules.includes('phone_order') || allowedModules.includes('notifications') ? customers : [],
        orders: allowedModules.includes('customers_orders') || allowedModules.includes('finance') ? orders : [],
        specialists: allowedModules.includes('specialists') || allowedModules.includes('notifications') || allowedModules.includes('violations') ? specialists : [],
        categories: categoriesList,
        beautyProfiles: allowedModules.includes('beauty') ? beautyProfiles : [],
        beautyBookings: allowedModules.includes('beauty') ? beautyBookings : [],
        loans: allowedModules.includes('loans') ? loans : [],
        settlements: allowedModules.includes('settlements') ? settlements : [],
        commissionConfig: allowedModules.includes('finance') ? commissionConfig : null,
        dossiers: allowedModules.includes('finance') ? dossierList.sort((a, b) => b.created_at_epoch - a.created_at_epoch) : [],
        notifications: allowedModules.includes('notifications') ? notificationsList : [],
        tickets: allowedModules.includes('tickets') ? tickets : [],
        homeSliders: allowedModules.includes('sliders') ? homeSliders : [],
        categorySliders: allowedModules.includes('sliders') ? categorySliders : {},
        violations: allowedModules.includes('violations') ? violations : [],
        experts
      });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'خطا در همگام‌سازی داده‌ها از سرور مرکزی تندیس.' });
    }
  });

  // ==================== عملیات ماژول ۲: ویرایش کیف پول و مسدودی مشتری ====================
  router.post('/customers/:phone/wallet', requireAdminAuth('customers_orders'), async (req, res) => {
    const cleanPhone = normalizeStrictIranPhone(req.params.phone);
    const amount = Number(req.body?.walletBalance);
    if (!cleanPhone || !Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ ok: false, message: 'شماره موبایل یا مبلغ کیف پول معتبر نیست.' });
    }
    try {
      const custRes = await fetchDjangoJson('customers/').catch(() => ({ data: [] }));
      const customers = Array.isArray(custRes.data) ? custRes.data : [];
      const cust = customers.find((c) => normalizePhone(c.phone) === cleanPhone && !String(c.phone || '').startsWith('hamkar_'));
      const rawFull = String(cust?.full_name || 'مشتری تندیس | آبادان');
      const isBlocked = /\[BLOCKED\]/i.test(rawFull);
      const parts = rawFull.replace(/\[BLOCKED\]/gi, '').split('|').map((s) => s.trim()).filter((s) => s && !/^WALLET:/i.test(s));
      const baseName = parts[0] || 'مشتری تندیس';
      const baseCity = parts[1] || 'آبادان';
      const nextBal = Math.round(amount);
      const now = Date.now();
      await Promise.all([
        upsertCustomerRecord(cleanPhone, `${isBlocked ? '[BLOCKED] ' : ''}${baseName} | ${baseCity} | WALLET:${nextBal}`),
        upsertReviewRecord({
          id: `wallet_${cleanPhone}`,
          request_id: 'CUSTOMER_WALLET',
          service_title: 'کیف پول تندیس',
          specialist_id: 'wallet_system',
          specialist_name: `ویرایش توسط ${req.adminUser.displayName}`,
          customer_name: baseName,
          customer_phone: cleanPhone,
          stars: 5,
          quality_tags: `WALLET:${nextBal}`,
          comment: JSON.stringify({
            phone: cleanPhone,
            wallet_balance: nextBal,
            balance_toman: nextBal,
            wallet_balance_toman: nextBal,
            updated_at_epoch: now
          }),
          created_at_epoch: now,
          synced_with_django: true
        })
      ]);
      return res.json({ ok: true, walletBalance: nextBal });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در بروزرسانی موجودی کیف پول مشتری.' });
    }
  });

  router.post('/customers/:phone/block', requireAdminAuth('customers_orders'), async (req, res) => {
    const cleanPhone = normalizeStrictIranPhone(req.params.phone);
    const shouldBlock = Boolean(req.body?.isBlocked);
    if (!cleanPhone) return res.status(400).json({ ok: false, message: 'شماره موبایل معتبر نیست.' });
    try {
      const custRes = await fetchDjangoJson('customers/').catch(() => ({ data: [] }));
      const customers = Array.isArray(custRes.data) ? custRes.data : [];
      const cust = customers.find((c) => normalizePhone(c.phone) === cleanPhone && !String(c.phone || '').startsWith('hamkar_'));
      const rawFull = String(cust?.full_name || 'مشتری تندیس | آبادان');
      const cleaned = rawFull.replace(/\[BLOCKED\]/gi, '').trim();
      const updatedFull = shouldBlock ? `[BLOCKED] ${cleaned}` : cleaned;
      const now = Date.now();
      await Promise.all([
        upsertCustomerRecord(cleanPhone, updatedFull, { is_active: !shouldBlock }),
        upsertReviewRecord({
          id: `blocked_${cleanPhone}`,
          request_id: 'ACCOUNT_BLOCK',
          service_title: 'ACCOUNT_BLOCK',
          specialist_id: 'admin_system',
          specialist_name: req.adminUser.displayName,
          customer_name: cleaned.split('|')[0]?.trim() || 'مشتری',
          customer_phone: cleanPhone,
          stars: 1,
          quality_tags: shouldBlock ? 'BLOCKED' : 'ACTIVE',
          comment: JSON.stringify({ is_blocked: shouldBlock, updated_at_epoch: now, by: req.adminUser.displayName }),
          created_at_epoch: now,
          synced_with_django: true
        })
      ]);
      return res.json({ ok: true, isBlocked: shouldBlock });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در تغییر وضعیت مسدودی مشتری.' });
    }
  });

  router.delete('/customers/:phone', requireAdminAuth('customers_orders'), async (req, res) => {
    const cleanPhone = normalizeStrictIranPhone(req.params.phone);
    if (!cleanPhone) {
      return res.status(400).json({ ok: false, message: 'شماره موبایل مشتری معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`customer:${cleanPhone}`]),
        fetchDjangoJson(`customers/${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/wallet_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/blocked_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/name_override_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف حساب مشتری.' });
    }
  });

  router.delete('/orders/:id', requireAdminAuth('customers_orders'), async (req, res) => {
    const orderId = String(req.params.id || '').trim();
    if (!orderId) {
      return res.status(400).json({ ok: false, message: 'شناسه سفارش معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`order:${orderId}`, `dossier:dossier_${orderId}`]),
        fetchDjangoJson(`requests/${encodeURIComponent(orderId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/mission_${encodeURIComponent(orderId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/pricing_${encodeURIComponent(orderId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/dossier_${encodeURIComponent(orderId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/payment_${encodeURIComponent(orderId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/cancel_req_${encodeURIComponent(orderId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف سفارش.' });
    }
  });

  // ==================== عملیات ماژول ۳: ثبت درخواست تلفنی توسط کارشناس ====================
  router.post('/orders/phone-register', requireAdminAuth('phone_order'), async (req, res) => {
    const cleanPhone = normalizeStrictIranPhone(req.body?.customer_phone || '');
    const customerName = String(req.body?.customer_name || '').trim();
    const city = String(req.body?.city || 'اهواز').trim();
    const categoryId = String(req.body?.service_category_id || '').trim();
    const serviceTitle = String(req.body?.service_title || '').trim();
    if (!cleanPhone || !customerName || !categoryId || !serviceTitle) {
      return res.status(400).json({ ok: false, message: 'شماره موبایل، نام مشتری، دسته‌بندی و عنوان خدمت الزامی است.' });
    }
    const now = Date.now();
    try {
      // ایجاد یا اطمینان از ثبت مشتری جدید در جدول customers
      if (req.body?.is_new_customer) {
        await upsertCustomerRecord(cleanPhone, `${customerName} | ${city} | WALLET:0`);
      }
      const orderPayload = {
        id: `req_phone_${now}`,
        customer_name: customerName,
        customer_phone: cleanPhone,
        service_category_id: categoryId,
        service_title: serviceTitle,
        car_model: String(req.body?.car_model || '').trim(),
        car_plate: city,
        issue_description: String(req.body?.issue_description || '').trim(),
        neighborhood: String(req.body?.neighborhood || '').trim(),
        home_address: String(req.body?.home_address || '').trim(),
        customer_lat: Number(req.body?.customer_lat || 31.3183),
        customer_lng: Number(req.body?.customer_lng || 48.6706),
        price_toman: Math.max(0, Number(req.body?.price_toman || 0)),
        is_urgent: Boolean(req.body?.is_urgent),
        status: 'PENDING_NEARBY',
        quality_tags: `ثبت تلفنی توسط پشتیبانی (${req.adminUser.displayName})`,
        created_at_epoch: now
      };
      const createRes = await fetchDjangoJson('requests/', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      if (!createRes.ok) {
        return res.status(502).json({ ok: false, message: 'ثبت درخواست در سرور مرکزی با خطا مواجه شد.' });
      }
      return res.json({ ok: true, order: orderPayload });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ثبت درخواست تلفنی.' });
    }
  });

  // ==================== عملیات ماژول ۴: تایید / رد / مسدودی / ویرایش متخصص ====================
  router.post('/specialists/:phone/action', requireAdminAuth('specialists'), async (req, res) => {
    const cleanPhone = normalizeStrictIranPhone(req.params.phone);
    const action = String(req.body?.action || '').toUpperCase();
    const reason = String(req.body?.reason || '').trim();
    if (!cleanPhone || !['APPROVED', 'REJECTED', 'BLOCKED', 'EDIT'].includes(action)) {
      return res.status(400).json({ ok: false, message: 'پارامترهای عملیات متخصص معتبر نیست.' });
    }
    try {
      const custRes = await fetchDjangoJson('customers/').catch(() => ({ data: [] }));
      const customers = Array.isArray(custRes.data) ? custRes.data : [];
      const key = `hamkar_${cleanPhone}`;
      const existing = customers.find((c) => String(c?.phone || '').toLowerCase() === key.toLowerCase());
      const parsed = existing ? parseHamkarCustomerRecord(existing, cleanPhone) : null;
      if (!parsed) {
        return res.status(404).json({ ok: false, message: 'پرونده متخصص یافت نشد.' });
      }

      const nextStatus = action === 'EDIT' ? parsed.approvalStatus : action;
      const nextFullName = String(req.body?.fullName || parsed.fullName).trim();
      const nextCity = String(req.body?.serviceCity || parsed.serviceCity).trim();
      const nextRoleTitle = String(req.body?.roleTitle || parsed.roleTitle).trim();
      // کارشناس منابع انسانی اجازه تغییر شماره شبا را ندارد
      const nextShaba =
        req.adminUser.role === 'HR_EXPERT'
          ? parsed.shabaNumber
          : String(req.body?.shabaNumber ?? parsed.shabaNumber).trim().toUpperCase();
      const nextTrack = parsed.trackingCode || '';
      const nextBirth = parsed.birthDate || '';
      const nextNational = parsed.nationalCode || '';
      const nextCatCode = parsed.categoryCode || '';
      const nextCatGroup = parsed.categoryGroup || '';
      const nextBusiness = parsed.businessName || '';
      const nextAddress = parsed.serviceAddress || '';
      const coords = `${parsed.serviceLat || 31.3183},${parsed.serviceLng || 48.6706}`;
      const statusBlock = `${nextStatus}::TRACK-${nextTrack}::SHABA-${nextShaba || 'IR000'}`;
      const personnel = `PERSONNEL_CODE:${parsed.personnelCode || `TND-${cleanPhone.slice(-6)}`}`;

      const serializedFullName = [
        nextFullName,
        nextNational,
        nextBirth,
        nextRoleTitle,
        nextCatCode,
        nextCatGroup,
        nextBusiness,
        nextCity,
        nextAddress,
        coords,
        coords,
        statusBlock,
        reason,
        personnel
      ].join(' | ');

      await Promise.all([
        upsertCustomerRecord(key, serializedFullName),
        fetchDjangoJson(`specialists/${encodeURIComponent(cleanPhone)}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            phone: cleanPhone,
            full_name: nextFullName,
            service_city: nextCity,
            role_title: nextRoleTitle,
            shaba_number: nextShaba,
            approval_status: nextStatus,
            status: nextStatus,
            is_blocked: nextStatus === 'BLOCKED',
            block_reason: reason
          })
        }).catch(() => ({ ok: false }))
      ]);

      return res.json({ ok: true, approvalStatus: nextStatus });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در بروزرسانی پرونده متخصص.' });
    }
  });

  router.delete('/specialists/:phone', requireAdminAuth('specialists'), async (req, res) => {
    const cleanPhone = normalizeStrictIranPhone(req.params.phone) || normalizePhone(req.params.phone);
    if (!cleanPhone) {
      return res.status(400).json({ ok: false, message: 'شماره موبایل متخصص معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([
          `specialist:${cleanPhone}`,
          `beauty_profile:${cleanPhone}`,
          `beauty_profile:spec_profile_${cleanPhone}`,
          `beauty_profile:beauty_spec_${cleanPhone}`
        ]),
        fetchDjangoJson(`customers/hamkar_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`specialists/${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/docs_hamkar_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/hamkar_docs_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/docs_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/spec_profile_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/beauty_spec_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/beauty_slots_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/wallet_hamkar_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/presence_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/session_lock_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف پرونده متخصص.' });
    }
  });

  // ==================== عملیات ماژول ۵: انتشار زنده دسته‌بندی‌ها ====================
  router.post('/categories/save', requireAdminAuth('categories'), async (req, res) => {
    const categories = req.body?.categories;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ ok: false, message: 'لیست دسته‌بندی‌ها نامعتبر است.' });
    }
    const now = Date.now();
    try {
      await upsertReviewRecord({
        id: 'config_categories',
        request_id: 'SYSTEM_CONFIG',
        service_title: 'CATEGORIES_CONFIG',
        specialist_id: 'admin_system',
        specialist_name: req.adminUser.displayName,
        customer_name: 'SYSTEM',
        customer_phone: '09000000000',
        stars: 5,
        quality_tags: 'SYSTEM_CATEGORIES',
        comment: JSON.stringify(categories),
        created_at_epoch: now,
        synced_with_django: true
      });
      await fetchDjangoJson('categories/', {
        method: 'POST',
        body: JSON.stringify({ categories })
      }).catch(() => ({ ok: false }));
      return res.json({ ok: true, count: categories.length });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ذخیره دسته‌بندی‌ها روی سرور مرکزی.' });
    }
  });

  // ==================== عملیات ماژول ۶: تایید قیمت زیبایی و مدیریت نوبت با استرداد خودکار ====================
  router.post('/beauty/price-action', requireAdminAuth('beauty'), async (req, res) => {
    const profileId = String(req.body?.profileId || '').trim();
    const skillIndex = Number(req.body?.skillIndex);
    const status = String(req.body?.status || '').toUpperCase();
    const approvedPrice = Math.max(0, Number(req.body?.approvedPriceToman || 0));
    if (!profileId || !Number.isInteger(skillIndex) || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'اطلاعات تایید قیمت زیبایی معتبر نیست.' });
    }
    try {
      const revRes = await fetchDjangoJson(`reviews/${encodeURIComponent(profileId)}/`).catch(() => ({ ok: false, data: null }));
      const rev = revRes.data;
      if (!rev) return res.status(404).json({ ok: false, message: 'پروفایل متخصص زیبایی یافت نشد.' });
      const obj = safeParseJson(rev.comment, {});
      const prices = Array.isArray(obj.service_prices) ? [...obj.service_prices] : [];
      if (!prices[skillIndex]) return res.status(404).json({ ok: false, message: 'مهارت مورد نظر یافت نشد.' });

      prices[skillIndex] = {
        ...prices[skillIndex],
        approved_price_toman: approvedPrice || Number(prices[skillIndex].proposed_price_toman || prices[skillIndex].price_toman || 0),
        admin_approved: status === 'APPROVED',
        status
      };
      obj.service_prices = prices;
      obj.updated_at_epoch = Date.now();

      await upsertReviewRecord({
        ...rev,
        id: profileId,
        comment: JSON.stringify(obj),
        created_at_epoch: Date.now()
      });
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ثبت وضعیت قیمت زیبایی.' });
    }
  });

  router.post('/beauty/booking-action', requireAdminAuth('beauty'), async (req, res) => {
    const bookingId = String(req.body?.bookingId || '').trim();
    const status = String(req.body?.status || '').toUpperCase();
    if (!bookingId || !['CONFIRMED', 'COMPLETED', 'CANCELLED_REFUNDED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'وضعیت نوبت زیبایی معتبر نیست.' });
    }
    try {
      const revRes = await fetchDjangoJson(`reviews/${encodeURIComponent(bookingId)}/`).catch(() => ({ ok: false, data: null }));
      const rev = revRes.data;
      if (!rev) return res.status(404).json({ ok: false, message: 'نوبت زیبایی یافت نشد.' });
      const obj = safeParseJson(rev.comment, {});
      obj.status = status;

      let refundedNow = false;
      const paidAmount = Number(obj.paid_amount_toman || obj.deposit_toman || 0);
      const custPhone = normalizePhone(obj.customer_phone || rev.customer_phone || '');
      if (status === 'CANCELLED_REFUNDED' && !obj.wallet_refunded && paidAmount > 0 && custPhone) {
        await creditCustomerWalletServer(custPhone, paidAmount, 'استرداد خودکار بیعانه نوبت زیبایی');
        obj.wallet_refunded = true;
        refundedNow = true;
      }

      await upsertReviewRecord({
        ...rev,
        id: bookingId,
        comment: JSON.stringify(obj),
        created_at_epoch: Date.now()
      });
      return res.json({ ok: true, refundedNow });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در بروزرسانی وضعیت نوبت زیبایی.' });
    }
  });

  router.delete('/beauty/profiles/:id', requireAdminAuth('beauty'), async (req, res) => {
    const profileId = String(req.params.id || '').trim();
    if (!profileId) {
      return res.status(400).json({ ok: false, message: 'شناسه پروفایل زیبایی معتبر نیست.' });
    }
    const cleanPhone = normalizePhone(profileId.replace(/^(spec_profile_|beauty_spec_)/i, ''));
    try {
      const keys = [`beauty_profile:${profileId}`];
      if (cleanPhone) {
        keys.push(`beauty_profile:${cleanPhone}`, `beauty_profile:spec_profile_${cleanPhone}`, `beauty_profile:beauty_spec_${cleanPhone}`);
      }
      await Promise.all([
        markRecordsDeleted(keys),
        fetchDjangoJson(`reviews/${encodeURIComponent(profileId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        ...(cleanPhone
          ? [
              fetchDjangoJson(`reviews/spec_profile_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
              fetchDjangoJson(`reviews/beauty_spec_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
              fetchDjangoJson(`reviews/beauty_slots_${encodeURIComponent(cleanPhone)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
            ]
          : [])
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف پروفایل زیبایی.' });
    }
  });

  router.delete('/beauty/bookings/:id', requireAdminAuth('beauty'), async (req, res) => {
    const bookingId = String(req.params.id || '').trim();
    if (!bookingId) {
      return res.status(400).json({ ok: false, message: 'شناسه نوبت زیبایی معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`beauty_booking:${bookingId}`]),
        fetchDjangoJson(`reviews/${encodeURIComponent(bookingId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف نوبت زیبایی.' });
    }
  });

  // ==================== عملیات ماژول ۷: تایید/رد وام تندیس‌پی + شارژ خودکار کیف پول ====================
  router.post('/loans/:id/action', requireAdminAuth('loans'), async (req, res) => {
    const loanId = String(req.params.id || '').trim();
    const status = String(req.body?.status || '').toUpperCase();
    const rejectReason = String(req.body?.rejectReason || '').trim();
    if (!loanId || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'وضعیت بررسی وام معتبر نیست.' });
    }
    try {
      const revRes = await fetchDjangoJson(`reviews/${encodeURIComponent(loanId)}/`).catch(() => ({ ok: false, data: null }));
      const rev = revRes.data;
      const obj = safeParseJson(rev?.comment, {}) || {};
      const trackingCode = status === 'APPROVED' ? String(obj.tracking_code || crypto.randomInt(10000000, 99999999)) : '';
      const custPhone = normalizePhone(obj.customer_phone || obj.phone || rev?.customer_phone || req.body?.customerPhone || '');
      const amount = Number(obj.requested_amount_toman || obj.amount_toman || req.body?.requestedAmount || 0);

      let creditedNow = false;
      if (status === 'APPROVED' && !obj.wallet_credited && amount > 0 && custPhone) {
        await creditCustomerWalletServer(custPhone, amount, `واریز وام تندیس‌پی (${trackingCode})`);
        obj.wallet_credited = true;
        creditedNow = true;
      }

      const updatedObj = {
        ...obj,
        status,
        tracking_code: trackingCode,
        reject_reason: status === 'REJECTED' ? rejectReason : '',
        reviewed_by: req.adminUser.displayName,
        reviewed_at_epoch: Date.now()
      };

      await Promise.all([
        upsertReviewRecord({
          ...(rev || {}),
          id: loanId,
          request_id: rev?.request_id || 'TANDIS_PAY_LOAN',
          service_title: 'TANDIS_PAY_LOAN',
          customer_phone: custPhone,
          comment: JSON.stringify(updatedObj),
          created_at_epoch: Date.now(),
          synced_with_django: true
        }),
        fetchDjangoJson(`tandis-pay/loans/${encodeURIComponent(loanId)}/`, {
          method: 'PATCH',
          body: JSON.stringify({ status, tracking_code: trackingCode, wallet_credited: Boolean(updatedObj.wallet_credited) })
        }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true, status, trackingCode, creditedNow });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ثبت نتیجه بررسی وام تندیس‌پی.' });
    }
  });

  router.delete('/loans/:id', requireAdminAuth('loans'), async (req, res) => {
    const loanId = String(req.params.id || '').trim();
    if (!loanId) {
      return res.status(400).json({ ok: false, message: 'شناسه پرونده وام معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`loan:${loanId}`]),
        fetchDjangoJson(`reviews/${encodeURIComponent(loanId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`tandis-pay/loans/${encodeURIComponent(loanId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`loans/${encodeURIComponent(loanId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف پرونده وام.' });
    }
  });

  // ==================== عملیات ماژول ۸: تسویه‌حساب متخصصین ====================
  router.post('/settlements/:id/action', requireAdminAuth('settlements'), async (req, res) => {
    const settlementId = String(req.params.id || '').trim();
    const status = String(req.body?.status || '').toUpperCase();
    if (!settlementId || !['APPROVED_FOR_PAYMENT', 'PAID_COMPLETED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'وضعیت تسویه‌حساب معتبر نیست.' });
    }
    try {
      const revRes = await fetchDjangoJson(`reviews/${encodeURIComponent(settlementId)}/`).catch(() => ({ ok: false, data: null }));
      const rev = revRes.data;
      const obj = safeParseJson(rev?.comment, {}) || {};
      const prevStatus = String(obj.status || 'PENDING').toUpperCase();
      const specPhone = normalizePhone(obj.specialist_phone || obj.phone || rev?.customer_phone || req.body?.specialistPhone || '');
      const amount = Number(obj.amount_toman || obj.requested_amount_toman || req.body?.amountToman || 0);

      const updatedObj = {
        ...obj,
        status,
        bank_tracking_code: String(req.body?.bankTrackingCode || obj.bank_tracking_code || '').trim(),
        source_account: String(req.body?.sourceAccount || obj.source_account || '').trim(),
        payment_method: String(req.body?.paymentMethod || obj.payment_method || 'پایا بانکی').trim(),
        reject_reason: status === 'REJECTED' ? String(req.body?.rejectReason || '').trim() : '',
        processed_by: req.adminUser.displayName,
        processed_at_epoch: Date.now()
      };

      // کسر خودکار مبلغ تسویه‌شده از مانده قابل برداشت متخصص هنگام واریز نهایی
      if (status === 'PAID_COMPLETED' && prevStatus !== 'PAID_COMPLETED' && specPhone && amount > 0) {
        const wRes = await fetchDjangoJson(`reviews/wallet_hamkar_${encodeURIComponent(specPhone)}/`).catch(() => ({ ok: false, data: null }));
        const wObj = safeParseJson(wRes.data?.comment, {});
        const currentBal = Number(wObj?.balance_toman ?? wObj?.wallet_balance_toman ?? 0);
        const nextBal = Math.max(0, currentBal - amount);
        await upsertReviewRecord({
          id: `wallet_hamkar_${specPhone}`,
          request_id: 'WALLET_HAMKAR',
          service_title: 'WALLET_LEDGER',
          specialist_id: specPhone,
          specialist_name: obj.specialist_name || 'متخصص تندیس',
          customer_name: 'SYSTEM',
          customer_phone: specPhone,
          stars: 5,
          quality_tags: `WALLET:${nextBal}`,
          comment: JSON.stringify({
            phone: specPhone,
            balance_toman: nextBal,
            wallet_balance_toman: nextBal,
            last_settlement_id: settlementId,
            updated_at_epoch: Date.now()
          }),
          created_at_epoch: Date.now(),
          synced_with_django: true
        });
      }

      await Promise.all([
        upsertReviewRecord({
          ...(rev || {}),
          id: settlementId,
          request_id: rev?.request_id || 'SPECIALIST_SETTLEMENT',
          service_title: 'SPECIALIST_SETTLEMENT',
          comment: JSON.stringify(updatedObj),
          created_at_epoch: Date.now(),
          synced_with_django: true
        }),
        fetchDjangoJson(`settlements/${encodeURIComponent(settlementId)}/`, {
          method: 'PATCH',
          body: JSON.stringify(updatedObj)
        }).catch(() => ({ ok: false }))
      ]);

      return res.json({ ok: true, status });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در بروزرسانی وضعیت تسویه‌حساب.' });
    }
  });

  router.delete('/settlements/:id', requireAdminAuth('settlements'), async (req, res) => {
    const settlementId = String(req.params.id || '').trim();
    if (!settlementId) {
      return res.status(400).json({ ok: false, message: 'شناسه درخواست تسویه معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`settlement:${settlementId}`]),
        fetchDjangoJson(`reviews/${encodeURIComponent(settlementId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`settlements/${encodeURIComponent(settlementId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف درخواست تسویه‌حساب.' });
    }
  });

  // ==================== عملیات ماژول ۹: تنظیمات حق کمیسیون ====================
  router.post('/commission/save', requireAdminAuth('finance'), async (req, res) => {
    const defaultRate = Number(req.body?.default_rate_percent);
    if (!Number.isFinite(defaultRate) || defaultRate < 0 || defaultRate > 50) {
      return res.status(400).json({ ok: false, message: 'درصد کمیسیون پیش‌فرض باید بین ۰ تا ۵۰ باشد.' });
    }
    const categoryRates = {};
    if (req.body?.category_rates && typeof req.body.category_rates === 'object') {
      for (const [k, v] of Object.entries(req.body.category_rates)) {
        const num = Number(v);
        if (Number.isFinite(num) && num >= 0 && num <= 50) categoryRates[k] = num;
      }
    }
    const now = Date.now();
    const payloadObj = {
      default_rate_percent: defaultRate,
      category_rates: categoryRates,
      min_rate_percent: 0,
      max_rate_percent: 50,
      updated_at_epoch: now,
      updated_by: req.adminUser.displayName,
      note: String(req.body?.note || '').trim().slice(0, 300)
    };
    const serialized = JSON.stringify(payloadObj);
    try {
      await Promise.all([
        upsertReviewRecord({
          id: 'config_commission',
          request_id: 'SYSTEM_COMMISSION',
          service_title: 'CONFIG_COMMISSION',
          specialist_id: 'admin',
          specialist_name: req.adminUser.displayName,
          customer_name: 'تنظیمات حق کمیسیون تندیس',
          customer_phone: '09000000000',
          stars: 5,
          quality_tags: `COMMISSION_RATE:${defaultRate}`,
          comment: serialized,
          created_at_epoch: now,
          synced_with_django: true
        }),
        upsertCustomerRecord('config_commission', serialized)
      ]);
      return res.json({ ok: true, commissionConfig: payloadObj });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ذخیره نرخ کمیسیون.' });
    }
  });

  router.delete('/dossiers/:id', requireAdminAuth('finance'), async (req, res) => {
    const dossierId = String(req.params.id || '').trim();
    if (!dossierId) {
      return res.status(400).json({ ok: false, message: 'شناسه پرونده فاکتور معتبر نیست.' });
    }
    const cleanReqId = dossierId.replace(/^dossier_/, '');
    try {
      await Promise.all([
        markRecordsDeleted([`dossier:${dossierId}`, `dossier:dossier_${cleanReqId}`]),
        fetchDjangoJson(`reviews/${encodeURIComponent(dossierId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/dossier_${encodeURIComponent(cleanReqId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف پرونده فاکتور.' });
    }
  });

  // ==================== عملیات ماژول ۱۰: ارسال و حذف اعلان ====================
  router.post('/notifications/send', requireAdminAuth('notifications'), async (req, res) => {
    const title = String(req.body?.title || '').trim();
    const message = String(req.body?.message || '').trim();
    const audience = String(req.body?.target_audience || 'ALL').toUpperCase();
    const rawTargetPhone = String(req.body?.target_phone || '').trim();
    if (!title || !message) {
      return res.status(400).json({ ok: false, message: 'عنوان و متن پیام الزامی است.' });
    }
    const targetPhone = audience === 'SINGLE' ? normalizeStrictIranPhone(rawTargetPhone) : 'ALL';
    if (audience === 'SINGLE' && !targetPhone) {
      return res.status(400).json({ ok: false, message: 'شماره موبایل مخاطب خاص معتبر نیست.' });
    }
    const now = Date.now();
    const notifId = `notif_${now}`;
    const commentObj = {
      type: 'ADMIN_NOTIFICATION',
      id: notifId,
      title,
      message,
      target_phone: targetPhone,
      target_audience: audience === 'SINGLE' ? 'SINGLE' : audience,
      sender_role: 'ADMIN',
      sender_name: req.adminUser.displayName,
      created_at_epoch: now
    };
    try {
      await upsertReviewRecord({
        id: notifId,
        request_id: 'ADMIN_NOTIFICATION',
        service_title: title,
        specialist_id: 'admin_broadcast',
        specialist_name: req.adminUser.displayName,
        customer_name: 'ADMIN_NOTIFICATION',
        customer_phone: targetPhone === 'ALL' ? '' : targetPhone,
        stars: 5,
        quality_tags: `AUDIENCE:${audience}`,
        comment: JSON.stringify(commentObj),
        created_at_epoch: now,
        synced_with_django: true
      });
      return res.json({ ok: true, notification: commentObj });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ارسال اعلان به سرور مرکزی.' });
    }
  });

  router.delete('/notifications/:id', requireAdminAuth('notifications'), async (req, res) => {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ ok: false, message: 'شناسه اعلان معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`notification:${id}`]),
        fetchDjangoJson(`reviews/${encodeURIComponent(id)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف اعلان.' });
    }
  });

  // ==================== عملیات ماژول ۱۱: پاسخ یکپارچه ۳ منبعی به تیکت پشتیبانی ====================
  router.post('/tickets/:id/reply', requireAdminAuth('tickets'), async (req, res) => {
    const coreId = normalizeTicketCoreId(req.params.id);
    const replyText = String(req.body?.admin_reply || '').trim();
    if (!coreId || !replyText) {
      return res.status(400).json({ ok: false, message: 'متن پاسخ مدیر الزامی است.' });
    }
    const now = Date.now();
    const prevMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const nextMessages = [
      ...prevMessages,
      { sender: 'ADMIN', text: replyText, sender_name: req.adminUser.displayName, created_at_epoch: now }
    ];
    const senderPhone = normalizePhone(req.body?.sender_phone || '');
    const senderName = String(req.body?.sender_name || 'کاربر تندیس');
    const subject = String(req.body?.subject || 'پشتیبانی تندیس');
    const initialMessage = String(req.body?.message || '');

    const sharedComment = JSON.stringify({
      id: coreId,
      user_phone: senderPhone,
      user_name: senderName,
      subject,
      message: initialMessage,
      admin_reply: replyText,
      status: 'ANSWERED',
      messages: nextMessages,
      answered_by: req.adminUser.displayName,
      updated_at_epoch: now
    });

    try {
      await Promise.all([
        // ۱) مسیرهای مستقیم تیکت پشتیبانی
        fetchDjangoJson(`support/tickets/${encodeURIComponent(coreId)}/`, {
          method: 'PATCH',
          body: JSON.stringify({ admin_reply: replyText, status: 'ANSWERED', messages: nextMessages })
        }).catch(() => ({ ok: false })),
        fetchDjangoJson(`support/tickets/tkt_${encodeURIComponent(coreId)}/`, {
          method: 'PATCH',
          body: JSON.stringify({ admin_reply: replyText, status: 'ANSWERED', messages: nextMessages })
        }).catch(() => ({ ok: false })),
        // ۲) جدول reviews با هر دو پیشوند tkt_ و ticket_
        upsertReviewRecord({
          id: `tkt_${coreId}`,
          request_id: 'SUPPORT_TICKET',
          service_title: subject,
          specialist_id: 'support_admin',
          specialist_name: req.adminUser.displayName,
          customer_name: senderName,
          customer_phone: senderPhone,
          stars: 5,
          quality_tags: 'STATUS:ANSWERED',
          comment: sharedComment,
          created_at_epoch: now,
          synced_with_django: true
        }),
        upsertReviewRecord({
          id: `ticket_${coreId}`,
          request_id: 'SUPPORT_TICKET',
          service_title: subject,
          specialist_id: 'support_admin',
          specialist_name: req.adminUser.displayName,
          customer_name: senderName,
          customer_phone: senderPhone,
          stars: 5,
          quality_tags: 'STATUS:ANSWERED',
          comment: sharedComment,
          created_at_epoch: now,
          synced_with_django: true
        }),
        // ۳) جدول requests با پیشوند tkt_req_
        fetchDjangoJson(`requests/tkt_req_${encodeURIComponent(coreId)}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'COMPLETED',
            issue_description: sharedComment
          })
        }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true, status: 'ANSWERED', messages: nextMessages });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ثبت پاسخ تیکت پشتیبانی.' });
    }
  });

  router.delete('/tickets/:id', requireAdminAuth('tickets'), async (req, res) => {
    const coreId = normalizeTicketCoreId(req.params.id);
    if (!coreId) {
      return res.status(400).json({ ok: false, message: 'شناسه تیکت معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`ticket:${coreId}`]),
        fetchDjangoJson(`support/tickets/${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`support/tickets/tkt_${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`tickets/${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`support-tickets/${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/tkt_${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`reviews/ticket_${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`requests/tkt_req_${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`requests/${encodeURIComponent(coreId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف تیکت پشتیبانی.' });
    }
  });

  // ==================== عملیات ماژول ۱۲: مدیریت اسلایدرها و بنرهای دسته‌بندی ====================
  router.post('/sliders/save', requireAdminAuth('sliders'), async (req, res) => {
    const homeSliders = Array.isArray(req.body?.homeSliders) ? req.body.homeSliders.slice(0, 5) : null;
    const categorySliders =
      req.body?.categorySliders && typeof req.body.categorySliders === 'object' ? req.body.categorySliders : null;
    const now = Date.now();
    try {
      const ops = [];
      if (homeSliders) {
        ops.push(
          upsertReviewRecord({
            id: 'config_sliders',
            request_id: 'SYSTEM_CONFIG',
            service_title: 'HOME_SLIDERS_CONFIG',
            specialist_id: 'admin_system',
            specialist_name: req.adminUser.displayName,
            customer_name: 'SYSTEM',
            customer_phone: '09000000000',
            stars: 5,
            quality_tags: 'SYSTEM_SLIDERS',
            comment: JSON.stringify(homeSliders),
            created_at_epoch: now,
            synced_with_django: true
          })
        );
        ops.push(
          fetchDjangoJson('sliders/', {
            method: 'POST',
            body: JSON.stringify({ sliders: homeSliders })
          }).catch(() => ({ ok: false }))
        );
      }
      if (categorySliders) {
        ops.push(
          upsertReviewRecord({
            id: 'config_category_sliders',
            request_id: 'SYSTEM_CONFIG',
            service_title: 'CATEGORY_SLIDERS_CONFIG',
            specialist_id: 'admin_system',
            specialist_name: req.adminUser.displayName,
            customer_name: 'SYSTEM',
            customer_phone: '09000000000',
            stars: 5,
            quality_tags: 'CATEGORY_SLIDERS',
            comment: JSON.stringify(categorySliders),
            created_at_epoch: now,
            synced_with_django: true
          })
        );
      }
      await Promise.all(ops);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ذخیره اسلایدرها و بنرها.' });
    }
  });

  // ==================== عملیات ماژول ۱۳: رسیدگی به تخلفات و شکایات ====================
  router.post('/violations/save', requireAdminAuth('violations'), async (req, res) => {
    const now = Date.now();
    const id = String(req.body?.id || `violation_${now}`).trim();
    const subject = String(req.body?.subject || '').trim();
    const description = String(req.body?.description || '').trim();
    const status = String(req.body?.status || 'UNDER_REVIEW').toUpperCase();
    if (!subject) {
      return res.status(400).json({ ok: false, message: 'عنوان پرونده تخلف الزامی است.' });
    }
    const payloadObj = {
      id,
      specialist_phone: normalizePhone(req.body?.specialist_phone || ''),
      specialist_name: String(req.body?.specialist_name || 'متخصص تندیس').trim(),
      reporter_phone: normalizePhone(req.body?.reporter_phone || ''),
      reporter_name: String(req.body?.reporter_name || req.adminUser.displayName).trim(),
      subject,
      description,
      status,
      fine_toman: Math.max(0, Number(req.body?.fine_toman || 0)),
      inspection_note: String(req.body?.inspection_note || '').trim(),
      updated_by: req.adminUser.displayName,
      created_at_epoch: Number(req.body?.created_at_epoch || now)
    };
    try {
      await Promise.all([
        upsertReviewRecord({
          id,
          request_id: 'SPECIALIST_VIOLATION',
          service_title: 'SPECIALIST_VIOLATION',
          specialist_id: payloadObj.specialist_phone || 'violation_system',
          specialist_name: payloadObj.specialist_name,
          customer_name: payloadObj.reporter_name,
          customer_phone: payloadObj.reporter_phone,
          stars: 1,
          quality_tags: `VIOLATION:${status}`,
          comment: JSON.stringify(payloadObj),
          created_at_epoch: now,
          synced_with_django: true
        }),
        fetchDjangoJson('violations/', {
          method: 'POST',
          body: JSON.stringify(payloadObj)
        }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true, violation: payloadObj });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ذخیره پرونده تخلف.' });
    }
  });

  router.delete('/violations/:id', requireAdminAuth('violations'), async (req, res) => {
    const violationId = String(req.params.id || '').trim();
    if (!violationId) {
      return res.status(400).json({ ok: false, message: 'شناسه پرونده تخلف معتبر نیست.' });
    }
    try {
      await Promise.all([
        markRecordsDeleted([`violation:${violationId}`]),
        fetchDjangoJson(`reviews/${encodeURIComponent(violationId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`violations/${encodeURIComponent(violationId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`violation-reports/${encodeURIComponent(violationId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false })),
        fetchDjangoJson(`customers/${encodeURIComponent(violationId)}/`, { method: 'DELETE' }).catch(() => ({ ok: false }))
      ]);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در حذف پرونده تخلف.' });
    }
  });

  // ==================== عملیات ماژول ۱۴: مدیریت کارشناسان و مدیران (config_admin_experts) ====================
  router.post('/experts/save', requireAdminAuth('experts'), async (req, res) => {
    const mode = String(req.body?.mode || 'upsert').toLowerCase();
    const username = String(req.body?.username || '').trim();
    if (!username) {
      return res.status(400).json({ ok: false, message: 'نام کاربری کارشناس الزامی است.' });
    }
    const lower = username.toLowerCase();
    try {
      const current = await loadAdminExpertsList();

      if (mode === 'delete') {
        if (PROTECTED_USERNAMES.has(lower)) {
          return res.status(403).json({ ok: false, message: 'حساب‌های ارشد پیش‌فرض غیرقابل حذف هستند.' });
        }
        const nextList = current.filter((e) => e.username.toLowerCase() !== lower);
        await saveAdminExpertsList(nextList);
        return res.json({ ok: true });
      }

      const roleCode = ADMIN_ROLES[req.body?.role] ? req.body.role : 'SUPPORT_EXPERT';
      const displayName = String(req.body?.display_name || username).trim();
      const rawPwd = String(req.body?.password || '').trim();
      const isActive = PROTECTED_USERNAMES.has(lower) ? true : req.body?.is_active !== false;

      const idx = current.findIndex((e) => e.username.toLowerCase() === lower);
      if (idx >= 0) {
        const existing = current[idx];
        current[idx] = {
          ...existing,
          display_name: displayName,
          role: PROTECTED_USERNAMES.has(lower) ? existing.role : roleCode,
          role_title: PROTECTED_USERNAMES.has(lower) ? existing.role_title : ADMIN_ROLES[roleCode].title,
          password: rawPwd || existing.password,
          is_active: isActive
        };
      } else {
        if (rawPwd.length < 4) {
          return res.status(400).json({ ok: false, message: 'رمز عبور کارشناس جدید باید حداقل ۴ کاراکتر باشد.' });
        }
        current.push({
          username,
          password: rawPwd,
          display_name: displayName,
          role: roleCode,
          role_title: ADMIN_ROLES[roleCode].title,
          is_active: isActive,
          created_at_epoch: Date.now()
        });
      }

      await saveAdminExpertsList(current);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'خطا در ذخیره لیست کارشناسان.' });
    }
  });

  return router;
}
