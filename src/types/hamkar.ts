export type HamkarApprovalStatus =
  | 'NOT_FOUND'
  | 'PENDING_ADMIN_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'BLOCKED'
  | 'DELETED';

export type HamkarTab =
  | 'RADAR'
  | 'ACTIVE_MISSION'
  | 'RECENT_REQUESTS'
  | 'REVIEWS_PROFILE'
  | 'WALLET'
  | 'SUPPORT'
  | 'ACCOUNT'
  | 'BEAUTY_DASHBOARD';

export type MissionStep =
  | 'PENDING_NEARBY'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type InvoiceEntryMode = 'ITEMIZED' | 'LUMP_SUM';

export interface HamkarSpecialistProfile {
  phone: string;
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
  isOnline: boolean;
  profilePhoto?: string | null;
  shenasnamehPhoto?: string | null;
  nationalCardPhoto?: string | null;
  skillLicensePhoto?: string | null;
}

export interface HamkarSessionLock {
  phone: string;
  device_id: string;
  session_token: string;
  active: boolean;
  updated_at_epoch: number;
}

export interface HamkarCommissionConfig {
  default_rate_percent: number;
  min_rate_percent: number;
  max_rate_percent: number;
  category_rates: Record<string, number>;
  updated_at_epoch: number;
  updated_by: string;
  note: string;
}

export interface InvoiceLineItem {
  row_index: number;
  id: string;
  title: string;
  quantity: number;
  unit_price_toman: number;
  row_total_toman: number;
  is_purchased_by_specialist: boolean;
}

export interface InvoiceDossier {
  request_id: string;
  tracking_code: string;
  service_title: string;
  customer_name: string;
  customer_phone: string;
  specialist_name: string;
  specialist_phone: string;
  invoice_mode: InvoiceEntryMode;
  line_items: InvoiceLineItem[];
  total_amount_toman: number;
  commission_percent: number;
  admin_commission_toman: number;
  specialist_net_toman: number;
  description: string;
  invoice_photo_base64?: string | null;
  issued_at_epoch: number;
  is_paid_online: boolean;
}

export interface HamkarOrderItem {
  id: string;
  service_category_id: string;
  service_title: string;
  customer_name: string;
  customer_phone: string;
  customer_lat: number;
  customer_lng: number;
  home_address: string;
  neighborhood: string;
  city: string;
  customer_city_from_profile?: string;
  car_model?: string;
  car_plate?: string;
  issue_description?: string;
  status: string;
  price_toman: number;
  is_urgent?: boolean;
  created_at?: string;
  created_at_epoch?: number;
  assigned_specialist_id?: string;
  assigned_specialist_name?: string;
  assigned_specialist_phone?: string;
  assigned_specialist_plate?: string;
  assigned_specialist_rating?: number;
  specialist_lat?: number;
  specialist_lng?: number;
  distance_km?: number;
  eta_minutes?: number;
  customer_rating?: number;
  customer_review_comment?: string;
  customer_quality_tags?: string;
  is_paid_online?: boolean;
  payment_status?: string;
  invoice_description?: string;
  parts_description?: string;
  has_invoice?: boolean;
  cancel_requested_by_customer?: boolean;
  customer_cancel_reason?: string;
  client_documents?: string;
  dossier?: InvoiceDossier | null;
  is_commission_settled?: boolean;
}

export interface HamkarWallet {
  balance_toman: number;
  total_net_earned_toman: number;
  settled_request_ids: string[];
}

export interface HamkarSettlementItem {
  id: string;
  settlement_id?: string;
  specialist_phone?: string;
  specialist_name?: string;
  shaba_number: string;
  amount_toman: number;
  commission_percent?: number;
  status: string;
  payment_method?: string;
  requested_at_epoch?: number;
  invoice_breakdowns?: Array<{
    request_id: string;
    service_title: string;
    gross_toman: number;
    commission_toman: number;
    net_toman: number;
  }>;
}

export interface HamkarReviewItem {
  id: string;
  request_id?: string;
  specialist_phone?: string;
  specialist_name?: string;
  customer_name?: string;
  service_title?: string;
  rating?: number;
  stars?: number;
  comment?: string;
  quality_tags?: string;
  created_at_epoch?: number;
}

export interface HamkarSupportTicket {
  id: string;
  sender_phone: string;
  sender_name: string;
  sender_role: string;
  subject: string;
  message: string;
  admin_reply?: string | null;
  status: string;
  created_at?: string;
}

export interface BeautyPortfolioItem {
  id: string;
  title: string;
  skill_title: string;
  image_url: string;
  created_at_epoch: number;
}

export interface BeautyServicePriceItem {
  skill_id: string;
  skill_title: string;
  proposed_price_toman: number;
  approved_price_toman: number;
  admin_approved: boolean;
  status: string;
}

export interface BeautySpecialistProfileJson {
  specialist_id: string;
  phone: string;
  full_name: string;
  category_slug: string;
  avatar_url?: string | null;
  rating: number;
  completed_jobs: number;
  selected_skills: string[];
  portfolio_items: BeautyPortfolioItem[];
  service_prices: BeautyServicePriceItem[];
  open_slots_by_date: Record<string, string[]>;
}

export interface BeautyScheduleDay {
  date_key: string;
  jalali_label: string;
  weekday_fa: string;
  is_open: boolean;
  time_slots: string[];
}

export interface BeautySchedulePayload {
  specialist_phone: string;
  updated_at_epoch: number;
  days: BeautyScheduleDay[];
}

export interface HamkarBeautyAppointment {
  id: string;
  specialist_phone: string;
  customer_name: string;
  customer_phone: string;
  skill_title?: string;
  service_title?: string;
  date_label?: string;
  jalali_date?: string;
  time_slot: string;
  payment_status?: string;
  status: string;
}

export interface HamkarSkillOption {
  categoryCode: string;
  categoryGroup: string;
  roleTitle: string;
  subtitle?: string;
}

export interface HamkarLiveStatePayload {
  ok: boolean;
  syncedAtEpoch: number;
  specialist: HamkarSpecialistProfile | null;
  approvalStatus: HamkarApprovalStatus;
  sessionLock: HamkarSessionLock | null;
  commissionConfig: HamkarCommissionConfig;
  categories: unknown[];
  orders: HamkarOrderItem[];
  wallet: HamkarWallet;
  settlements: HamkarSettlementItem[];
  reviews: HamkarReviewItem[];
  tickets: HamkarSupportTicket[];
  beautyProfile: BeautySpecialistProfileJson | null;
  beautySchedule: BeautySchedulePayload | null;
  beautyAppointments: HamkarBeautyAppointment[];
}
