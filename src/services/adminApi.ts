export type AdminRoleCode =
  | 'SUPER_ADMIN'
  | 'CEO'
  | 'IT_DIRECTOR'
  | 'HR_EXPERT'
  | 'FINANCIAL_EXPERT'
  | 'SALES_EXPERT'
  | 'SUPPORT_EXPERT';

export type AdminModuleId =
  | 'dashboard'
  | 'customers_orders'
  | 'phone_order'
  | 'specialists'
  | 'categories'
  | 'beauty'
  | 'loans'
  | 'settlements'
  | 'finance'
  | 'notifications'
  | 'tickets'
  | 'sliders'
  | 'violations'
  | 'seo'
  | 'ai_content'
  | 'visitors'
  | 'experts';

export interface AdminUserSession {
  username: string;
  displayName: string;
  role: AdminRoleCode;
  roleTitle: string;
  canViewFinancials: boolean;
  allowedModules: AdminModuleId[];
}

export interface AdminStats {
  customersTotal: number;
  customersActive: number;
  customersBlocked: number;
  specialistsTotal: number;
  specialistsApproved: number;
  specialistsPending: number;
  specialistsOnline: number;
  specialistsBlocked: number;
  ordersTotal: number;
  ordersCompleted: number;
  ordersInProgress: number;
  ordersPending: number;
  ordersCancelled: number;
  totalOrdersRevenue: number;
  totalCommissionRevenue: number;
  netSpecialistShare: number;
  settledTotalToman: number;
  pendingSettlementsCount: number;
  pendingLoansCount: number;
  pendingBeautyPricesCount: number;
  openTicketsCount: number;
  openViolationsCount: number;
}

export interface AdminLiveAlert {
  id: string;
  category: 'TICKETS' | 'DOCS' | 'VIOLATIONS' | 'SETTLEMENTS' | 'LOANS' | 'BEAUTY';
  title: string;
  subtitle: string;
  targetModule: AdminModuleId;
  createdAtEpoch: number;
}

export interface AdminCustomer {
  phone: string;
  fullName: string;
  city: string;
  walletBalance: number;
  isBlocked: boolean;
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  assigned_specialist_name: string;
  assigned_specialist_phone: string;
  service_category_id: string;
  service_title: string;
  car_model: string;
  car_plate: string;
  issue_description: string;
  neighborhood: string;
  home_address: string;
  price_toman: number;
  is_urgent: boolean;
  is_paid_online: boolean;
  status: string;
  quality_tags: string;
  created_at_epoch: number;
}

export interface AdminSpecialist {
  phone: string;
  fullName: string;
  nationalCode: string;
  fatherName: string;
  birthDate: string;
  roleTitle: string;
  categoryCode: string;
  categoryGroup: string;
  businessName: string;
  serviceCity: string;
  serviceAddress: string;
  trackingCode: string;
  shabaNumber: string;
  personnelCode: string;
  approvalStatus: string;
  reason: string;
  isOnlineNow: boolean;
  isAcceptingRequests: boolean;
  lastSeenEpoch: number;
  ipAddress: string;
  walletBalance: number;
  isDuplicateNationalCode: boolean;
  profilePhoto: string | null;
  shenasnamehPhoto: string | null;
  nationalCardPhoto: string | null;
  skillLicensePhoto: string | null;
}

export interface AdminSubCategory {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  base_price_toman?: number;
  eta_text?: string;
  is_coming_soon?: boolean;
  is_active?: boolean;
  ready_problems?: string[];
}

export interface AdminCategory {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon_key?: string;
  color_hex?: string;
  order_index?: number;
  is_active?: boolean;
  is_coming_soon?: boolean;
  subcategories?: AdminSubCategory[];
}

export interface AdminBeautyPriceItem {
  skill_title?: string;
  title?: string;
  proposed_price_toman?: number;
  price_toman?: number;
  approved_price_toman?: number;
  admin_approved?: boolean;
  status?: string;
}

export interface AdminBeautyProfile {
  id: string;
  specialist_phone: string;
  specialist_name: string;
  city: string;
  avatar_url: string | null;
  bio: string;
  selected_skills: string[];
  portfolio_items: Array<{ title?: string; image_url?: string; image_base64?: string }>;
  service_prices: AdminBeautyPriceItem[];
  updated_at_epoch: number;
}

export interface AdminBeautyBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  specialist_name: string;
  specialist_phone: string;
  service_title: string;
  appointment_date: string;
  appointment_time: string;
  total_amount_toman: number;
  paid_amount_toman: number;
  status: string;
  wallet_refunded: boolean;
  created_at_epoch: number;
}

export interface AdminLoan {
  id: string;
  customer_name: string;
  customer_phone: string;
  national_code: string;
  requested_amount_toman: number;
  installments_count: number;
  monthly_installment_toman: number;
  status: string;
  tracking_code: string;
  wallet_credited: boolean;
  reject_reason: string;
  national_card_image_base64: string | null;
  shenasnameh_image_base64: string | null;
  income_proof_image_base64: string | null;
  created_at_epoch: number;
}

export interface AdminSettlementBreakdown {
  service_title?: string;
  description?: string;
  date_jalali?: string;
  total_toman?: number;
  commission_percent?: number;
  commission_toman?: number;
  net_toman?: number;
}

export interface AdminSettlement {
  id: string;
  specialist_name: string;
  specialist_phone: string;
  amount_toman: number;
  shaba_number: string;
  shaba_valid: boolean;
  bank_name: string;
  status: string;
  bank_tracking_code: string;
  source_account: string;
  payment_method: string;
  processed_by: string;
  reject_reason: string;
  invoice_breakdowns: AdminSettlementBreakdown[];
  created_at_epoch: number;
}

export interface AdminCommissionConfig {
  default_rate_percent: number;
  category_rates: Record<string, number>;
  min_rate_percent: number;
  max_rate_percent: number;
  updated_at_epoch: number;
  updated_by: string;
  note: string;
}

export interface AdminDossier {
  id: string;
  request_id: string;
  specialist_phone: string;
  specialist_name: string;
  customer_phone: string;
  customer_name: string;
  service_title: string;
  labor_toman: number;
  parts_toman: number;
  total_toman: number;
  commission_rate: number;
  commission_toman: number;
  net_specialist_toman: number;
  items: Array<{ title?: string; price_toman?: number }>;
  created_at_epoch: number;
}

export interface AdminSentNotification {
  id: string;
  title: string;
  message: string;
  target_phone: string;
  target_audience: string;
  sender_role: string;
  created_at_epoch: number;
}

export interface AdminTicket {
  id: string;
  sender_name: string;
  sender_phone: string;
  sender_type: 'CUSTOMER' | 'SPECIALIST';
  subject: string;
  message: string;
  admin_reply: string;
  status: string;
  messages: Array<{ sender: string; text: string; created_at_epoch?: number }>;
  created_at_epoch: number;
}

export interface AdminSliderItem {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image_url?: string;
  cta_label?: string;
  target_slug?: string;
}

export interface AdminViolation {
  id: string;
  specialist_phone: string;
  specialist_name: string;
  reporter_phone: string;
  reporter_name: string;
  subject: string;
  description: string;
  status: string;
  fine_toman: number;
  inspection_note: string;
  created_at_epoch: number;
}

export interface AdminExpertItem {
  username: string;
  display_name: string;
  role: AdminRoleCode;
  role_title: string;
  is_active: boolean;
  is_protected: boolean;
  created_at_epoch: number;
}

export interface AdminSeoKeywordItem {
  id: string;
  keyword: string;
  target_url: string;
  tool_source: string;
  current_rank: number;
  previous_rank: number;
  monthly_volume: number;
  difficulty: number;
  intent: string;
}

export interface AdminSeoIndexedPage {
  path: string;
  title: string;
  priority: string;
  changefreq: string;
  status: string;
}

export interface AdminSeoCrawledRow {
  url: string;
  title: string;
  status_code: number;
  indexability: string;
  title_length: number;
  meta_desc_length: number;
  h1_status: string;
  canonical_url: string;
  schema_types: string;
  response_time_ms: number;
  word_count: number;
}

export interface AdminSeoConfig {
  site_domain: string;
  canonical_base_url: string;
  site_title: string;
  meta_description: string;
  focus_keywords: string[];
  robots_directive: string;
  gsc_verification_code: string;
  gsc_html_filename: string;
  gsc_sitemap_submitted: boolean;
  gsc_last_ping_epoch: number;
  ga4_measurement_id: string;
  ga4_enabled: boolean;
  ga4_track_orders: boolean;
  ga4_track_phones: boolean;
  ga4_track_beauty: boolean;
  ga4_track_downloads: boolean;
  rank_tracker_keywords: AdminSeoKeywordItem[];
  cwv_targets: {
    lcp_ms: number;
    inp_ms: number;
    cls_score: number;
    fcp_ms: number;
    ttfb_ms: number;
    mobile_score: number;
    desktop_score: number;
    preload_fonts: boolean;
    lazy_load_images: boolean;
    compress_assets: boolean;
  };
  content_seo_rules: {
    min_word_count: number;
    target_keyword_density_percent: number;
    require_faq_schema: boolean;
    require_internal_links: boolean;
    nlp_terms: string[];
  };
  indexed_pages: AdminSeoIndexedPage[];
  updated_at_epoch: number;
  updated_by: string;
}

export interface AdminLiveState {
  ok: boolean;
  online: boolean;
  syncedAtEpoch: number;
  stats: AdminStats;
  liveAlerts: AdminLiveAlert[];
  customers: AdminCustomer[];
  orders: AdminOrder[];
  specialists: AdminSpecialist[];
  categories: AdminCategory[];
  beautyProfiles: AdminBeautyProfile[];
  beautyBookings: AdminBeautyBooking[];
  loans: AdminLoan[];
  settlements: AdminSettlement[];
  commissionConfig: AdminCommissionConfig | null;
  dossiers: AdminDossier[];
  notifications: AdminSentNotification[];
  tickets: AdminTicket[];
  homeSliders: AdminSliderItem[];
  categorySliders: Record<string, AdminSliderItem[]>;
  violations: AdminViolation[];
  seoConfig: AdminSeoConfig | null;
  experts: AdminExpertItem[];
}

export const ROLE_OPTIONS: Array<{ code: AdminRoleCode; title: string; summary: string }> = [
  { code: 'SUPER_ADMIN', title: 'مدیر ارشد', summary: 'دسترسی کامل به تمام ۱۵ بخش، سئو و اطلاعات مالی' },
  { code: 'CEO', title: 'مدیر عامل تندیس', summary: 'دسترسی کامل اجرایی، سئو و مالی به کل سامانه' },
  { code: 'IT_DIRECTOR', title: 'مدیر فناوری اطلاعات', summary: 'دسترسی کامل فنی، سئو و مدیریتی به تمام بخش‌ها' },
  { code: 'HR_EXPERT', title: 'کارشناس منابع انسانی', summary: 'متخصصین، تایید مدارک، زیبایی و تخلفات (بدون دسترسی مالی و شبا)' },
  { code: 'FINANCIAL_EXPERT', title: 'کارشناس مالی', summary: 'گزارش مالی، حق کمیسیون، تسویه حساب و وام تندیس‌پی' },
  { code: 'SALES_EXPERT', title: 'کارشناس فروش', summary: 'مشتریان، سفارش‌ها، ثبت تلفنی، وام، زیبایی، اسلایدرها، سئو و اعلان‌ها' },
  { code: 'SUPPORT_EXPERT', title: 'کارشناس پشتیبانی', summary: 'مشتریان، سفارش‌ها، ثبت تلفنی، تیکت‌ها، تخلفات، زیبایی و اعلان‌ها' }
];

// نشست پنل مدیریت به‌طور کامل از نشست مشتری سایت جداست و هنگام جابه‌جایی بین سایت و پنل مدیریت حفظ می‌شود
let inMemoryAdminToken = '';
let inMemoryAdminUser: AdminUserSession | null = null;

export function setAdminToken(token: string): void {
  inMemoryAdminToken = token;
}

export function getAdminToken(): string {
  return inMemoryAdminToken;
}

export function getAdminUserSession(): AdminUserSession | null {
  return inMemoryAdminUser;
}

export function clearAdminToken(): void {
  inMemoryAdminToken = '';
  inMemoryAdminUser = null;
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined)
  };
  if (inMemoryAdminToken) {
    headers.Authorization = `Bearer ${inMemoryAdminToken}`;
  }
  const resp = await fetch(`/api/admin${path}`, { ...init, headers });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data?.ok === false) {
    throw new Error(String(data?.message || 'خطا در ارتباط با سرور مرکزی تندیس'));
  }
  return data as T;
}

export async function adminLogin(
  username: string,
  password: string
): Promise<{ token: string; user: AdminUserSession }> {
  const res = await adminFetch<{ ok: true; token: string; user: AdminUserSession }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  setAdminToken(res.token);
  inMemoryAdminUser = res.user;
  return { token: res.token, user: res.user };
}

export async function fetchAdminLiveState(): Promise<AdminLiveState> {
  return adminFetch<AdminLiveState>('/live-state');
}

export async function updateCustomerWalletAdmin(phone: string, walletBalance: number): Promise<void> {
  await adminFetch(`/customers/${encodeURIComponent(phone)}/wallet`, {
    method: 'POST',
    body: JSON.stringify({ walletBalance })
  });
}

export async function toggleCustomerBlockAdmin(phone: string, isBlocked: boolean): Promise<void> {
  await adminFetch(`/customers/${encodeURIComponent(phone)}/block`, {
    method: 'POST',
    body: JSON.stringify({ isBlocked })
  });
}

export async function registerPhoneOrderAdmin(payload: {
  customer_phone: string;
  customer_name: string;
  city: string;
  is_new_customer: boolean;
  service_category_id: string;
  service_title: string;
  car_model: string;
  issue_description: string;
  neighborhood: string;
  home_address: string;
  price_toman: number;
  is_urgent: boolean;
}): Promise<void> {
  await adminFetch('/orders/phone-register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function runSpecialistActionAdmin(
  phone: string,
  payload: {
    action: 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'EDIT';
    reason?: string;
    fullName?: string;
    serviceCity?: string;
    roleTitle?: string;
    shabaNumber?: string;
  }
): Promise<void> {
  await adminFetch(`/specialists/${encodeURIComponent(phone)}/action`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveCategoriesAdmin(categories: AdminCategory[]): Promise<void> {
  await adminFetch('/categories/save', {
    method: 'POST',
    body: JSON.stringify({ categories })
  });
}

export async function runBeautyPriceActionAdmin(payload: {
  profileId: string;
  skillIndex: number;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  approvedPriceToman?: number;
}): Promise<void> {
  await adminFetch('/beauty/price-action', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function runBeautyBookingActionAdmin(payload: {
  bookingId: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED_REFUNDED' | 'CANCELLED';
}): Promise<{ refundedNow?: boolean }> {
  return adminFetch('/beauty/booking-action', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function runLoanActionAdmin(
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED'; rejectReason?: string; customerPhone?: string; requestedAmount?: number }
): Promise<{ trackingCode?: string; creditedNow?: boolean }> {
  return adminFetch(`/loans/${encodeURIComponent(id)}/action`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function runSettlementActionAdmin(
  id: string,
  payload: {
    status: 'APPROVED_FOR_PAYMENT' | 'PAID_COMPLETED' | 'REJECTED';
    bankTrackingCode?: string;
    sourceAccount?: string;
    paymentMethod?: string;
    rejectReason?: string;
    specialistPhone?: string;
    amountToman?: number;
  }
): Promise<void> {
  await adminFetch(`/settlements/${encodeURIComponent(id)}/action`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveCommissionAdmin(payload: {
  default_rate_percent: number;
  category_rates: Record<string, number>;
  note: string;
}): Promise<void> {
  await adminFetch('/commission/save', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function sendNotificationAdmin(payload: {
  title: string;
  message: string;
  target_audience: 'ALL' | 'CUSTOMERS' | 'SPECIALISTS' | 'SINGLE';
  target_phone?: string;
}): Promise<void> {
  await adminFetch('/notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteNotificationAdmin(id: string): Promise<void> {
  await adminFetch(`/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function replyTicketAdmin(
  id: string,
  payload: {
    admin_reply: string;
    messages: Array<{ sender: string; text: string }>;
    sender_phone: string;
    sender_name: string;
    subject: string;
    message: string;
  }
): Promise<void> {
  await adminFetch(`/tickets/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveSlidersAdmin(payload: {
  homeSliders?: AdminSliderItem[];
  categorySliders?: Record<string, AdminSliderItem[]>;
}): Promise<void> {
  await adminFetch('/sliders/save', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveViolationAdmin(payload: {
  id?: string;
  specialist_phone: string;
  specialist_name: string;
  reporter_phone?: string;
  reporter_name?: string;
  subject: string;
  description: string;
  status: string;
  fine_toman?: number;
  inspection_note?: string;
  created_at_epoch?: number;
}): Promise<void> {
  await adminFetch('/violations/save', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveExpertAdmin(payload: {
  mode: 'upsert' | 'delete';
  username: string;
  password?: string;
  display_name?: string;
  role?: AdminRoleCode;
  is_active?: boolean;
}): Promise<void> {
  await adminFetch('/experts/save', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteCustomerAdmin(phone: string): Promise<void> {
  await adminFetch(`/customers/${encodeURIComponent(phone)}`, {
    method: 'DELETE'
  });
}

export async function deleteOrderAdmin(id: string): Promise<void> {
  await adminFetch(`/orders/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteSpecialistAdmin(phone: string): Promise<void> {
  await adminFetch(`/specialists/${encodeURIComponent(phone)}`, {
    method: 'DELETE'
  });
}

export async function deleteBeautyProfileAdmin(id: string): Promise<void> {
  await adminFetch(`/beauty/profiles/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteBeautyBookingAdmin(id: string): Promise<void> {
  await adminFetch(`/beauty/bookings/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteLoanAdmin(id: string): Promise<void> {
  await adminFetch(`/loans/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteSettlementAdmin(id: string): Promise<void> {
  await adminFetch(`/settlements/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteDossierAdmin(id: string): Promise<void> {
  await adminFetch(`/dossiers/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteTicketAdmin(id: string): Promise<void> {
  await adminFetch(`/tickets/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function deleteViolationAdmin(id: string): Promise<void> {
  await adminFetch(`/violations/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function saveSeoConfigAdmin(seoConfig: Partial<AdminSeoConfig>): Promise<{ ok: true; seoConfig: AdminSeoConfig }> {
  return adminFetch<{ ok: true; seoConfig: AdminSeoConfig }>('/seo/save', {
    method: 'POST',
    body: JSON.stringify({ seoConfig })
  });
}

export async function pingGoogleSeoAdmin(): Promise<{
  ok: true;
  sitemapUrl: string;
  robotsUrl: string;
  pingedAtEpoch: number;
  seoConfig: AdminSeoConfig;
}> {
  return adminFetch('/seo/ping-google', {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function runSeoCrawlAuditAdmin(): Promise<{
  ok: true;
  auditedAtEpoch: number;
  domain: string;
  healthScore: number;
  crawledRows: AdminSeoCrawledRow[];
}> {
  return adminFetch('/seo/crawl-audit', {
    method: 'POST',
    body: JSON.stringify({})
  });
}

// ==================== تبدیل‌گرهای ۱۰۰٪ فارسی وضعیت‌ها (بدون هیچ کد انگلیسی در رابط کاربری) ====================
export function persianOrderStatus(status: string): { label: string; tone: string } {
  switch (String(status || '').toUpperCase()) {
    case 'COMPLETED':
      return { label: 'تکمیل‌شده', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'CANCELLED':
      return { label: 'لغوشده', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'ACCEPTED':
      return { label: 'پذیرفته‌شده', tone: 'text-teal-800 bg-teal-50 border-teal-200' };
    case 'ON_THE_WAY':
      return { label: 'در مسیر اعزام', tone: 'text-sky-800 bg-sky-50 border-sky-200' };
    case 'ARRIVED':
      return { label: 'رسیده به محل', tone: 'text-indigo-800 bg-indigo-50 border-indigo-200' };
    case 'IN_PROGRESS':
    case 'DIAGNOSING':
      return { label: 'در حال انجام', tone: 'text-amber-800 bg-amber-50 border-amber-200' };
    case 'PRICE_PROPOSED':
      return { label: 'صدور پیش‌فاکتور', tone: 'text-amber-900 bg-amber-50 border-amber-300' };
    default:
      return { label: 'در انتظار پذیرش متخصص', tone: 'text-slate-700 bg-slate-100 border-slate-200' };
  }
}

export function persianSpecialistStatus(status: string): { label: string; tone: string } {
  switch (String(status || '').toUpperCase()) {
    case 'APPROVED':
      return { label: 'تاییدشده', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'REJECTED':
      return { label: 'ردشده', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'BLOCKED':
      return { label: 'مسدودشده', tone: 'text-red-800 bg-red-50 border-red-200' };
    default:
      return { label: 'در انتظار بررسی مدارک', tone: 'text-amber-800 bg-amber-50 border-amber-200' };
  }
}

export function persianSettlementStatus(status: string): { label: string; tone: string } {
  switch (String(status || '').toUpperCase()) {
    case 'PAID_COMPLETED':
      return { label: 'واریز نهایی انجام شد', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'APPROVED_FOR_PAYMENT':
      return { label: 'در نوبت واریز پایا', tone: 'text-sky-800 bg-sky-50 border-sky-200' };
    case 'REJECTED':
      return { label: 'ردشده', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: 'در انتظار بررسی مالی', tone: 'text-amber-800 bg-amber-50 border-amber-200' };
  }
}

export function persianLoanStatus(status: string): { label: string; tone: string } {
  switch (String(status || '').toUpperCase()) {
    case 'APPROVED':
      return { label: 'تایید و شارژشده', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'REJECTED':
      return { label: 'ردشده', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: 'در انتظار بررسی اعتبار', tone: 'text-amber-800 bg-amber-50 border-amber-200' };
  }
}

export function persianBeautyBookingStatus(status: string): { label: string; tone: string } {
  switch (String(status || '').toUpperCase()) {
    case 'COMPLETED':
      return { label: 'انجام‌شده', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'CANCELLED_REFUNDED':
      return { label: 'لغو با استرداد بیعانه', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'CANCELLED':
      return { label: 'لغوشده', tone: 'text-slate-700 bg-slate-100 border-slate-200' };
    default:
      return { label: 'رزرو تاییدشده', tone: 'text-teal-800 bg-teal-50 border-teal-200' };
  }
}

export function persianViolationStatus(status: string): { label: string; tone: string } {
  switch (String(status || '').toUpperCase()) {
    case 'WARNING_ISSUED':
      return { label: 'اخطار ثبت‌شده', tone: 'text-amber-800 bg-amber-50 border-amber-200' };
    case 'FINED':
      return { label: 'جریمه نقدی', tone: 'text-orange-800 bg-orange-50 border-orange-200' };
    case 'SPECIALIST_BLOCKED':
      return { label: 'مسدودسازی متخصص', tone: 'text-red-800 bg-red-50 border-red-200' };
    case 'CLOSED':
      return { label: 'مختومه', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    default:
      return { label: 'در حال بررسی', tone: 'text-sky-800 bg-sky-50 border-sky-200' };
  }
}

export function persianAudienceLabel(audience: string, targetPhone: string): string {
  const aud = String(audience || '').toUpperCase();
  if (aud === 'CUSTOMERS') return 'فقط مشتریان';
  if (aud === 'SPECIALISTS') return 'فقط متخصصین';
  if (aud === 'SINGLE' || (targetPhone && targetPhone !== 'ALL')) return `مخاطب خاص (${targetPhone})`;
  return 'همه کاربران سامانه';
}

export function formatPersianDateTime(epoch: number): string {
  if (!epoch || !Number.isFinite(epoch)) return 'نامشخص';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(epoch));
  } catch {
    return 'نامشخص';
  }
}

export function safeImageSrc(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(trimmed)) return trimmed;
  if (/^[A-Za-z0-9+/=\r\n]{100,}$/.test(trimmed)) {
    return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, '')}`;
  }
  return null;
}

// تجزیه‌گر هوشمند جزئیات سفارش (تفکیک مدل، مشخصات فنی جداشده با |، مشکلات آماده و توضیحات مشتری)
export interface ParsedOrderSpecs {
  specs: Array<{ label: string; value: string }>;
  reportedProblems: string[];
  customerNotes: string;
}

export function parseSmartOrderDetails(carModel: string, issueDescription: string): ParsedOrderSpecs {
  const specs: Array<{ label: string; value: string }> = [];
  const reportedProblems: string[] = [];
  const noteLines: string[] = [];

  if (carModel && carModel.trim()) {
    specs.push({ label: 'برند / مدل دستگاه یا خودرو', value: carModel.trim() });
  }

  const segments = String(issueDescription || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    const colonIdx = seg.indexOf(':');
    const persianColonIdx = seg.indexOf('：');
    const idx = colonIdx >= 0 ? colonIdx : persianColonIdx;

    if (idx > 0 && idx < 45) {
      const key = seg.slice(0, idx).trim();
      const val = seg.slice(idx + 1).trim();
      if (!val) continue;
      if (/مشکل|ایراد|خطا|علائم/.test(key)) {
        val
          .split(/[،,؛+]/)
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((p) => reportedProblems.push(p));
      } else if (/توضیح|شرح/.test(key)) {
        noteLines.push(val);
      } else {
        specs.push({ label: key, value: val });
      }
    } else if (seg.length <= 42 && !seg.includes('؟') && segments.length > 1) {
      reportedProblems.push(seg);
    } else {
      noteLines.push(seg);
    }
  }

  return {
    specs,
    reportedProblems: Array.from(new Set(reportedProblems)),
    customerNotes: noteLines.join(' — ')
  };
}
