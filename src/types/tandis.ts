export interface TandisCityInfo {
  name: string;
  province: string;
  lat: number;
  lng: number;
  defaultAddress: string;
  neighborhoods: string[];
}

export interface ProvinceCitiesGroup {
  province: string;
  cities: TandisCityInfo[];
}

export interface SubServiceItem {
  id: string;
  title: string;
  subtitle: string;
  basePriceToman: number;
  etaText: string;
  readyProblems: string[];
  isLegalMode?: boolean;
  isBeautyMode?: boolean;
  isComingSoon?: boolean;
  parentSlug?: string;
  parentTitle?: string;
  shortDesc?: string;
  iconKey?: string;
  iconUrl?: string;
  iconStyle?: string;
  colorHex?: string;
}

export interface ServiceCategoryGroup {
  slug: string;
  title: string;
  subtitle: string;
  isComingSoon?: boolean;
  accentHex?: string;
  colorHex?: string;
  iconName?: string;
  iconKey?: string;
  iconUrl?: string;
  iconStyle?: string;
  subcategories: SubServiceItem[];
}

export type CategoryGroup = ServiceCategoryGroup;

export interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeText?: string;
  ctaText?: string;
  image_url: string;
  target_category_slug?: string;
  targetCategorySlug?: string;
  duration_seconds?: number;
  is_active?: boolean;
  order_index?: number;
}

export interface CategorySliderItem {
  id?: string;
  group_slug?: string;
  categorySlug?: string;
  badge?: string;
  title: string;
  subtitle: string;
  image_url?: string;
}

export interface InvoiceLineItem {
  title: string;
  amount_toman?: number;
  price_toman?: number;
  quantity?: number;
  unit_price_toman?: number;
  row_total_toman?: number;
}

export interface ServiceRequestItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_category_id: string;
  service_title: string;
  car_model: string;
  car_plate?: string;
  issue_description: string;
  neighborhood: string;
  home_address: string;
  city: string;
  customer_lat?: number;
  customer_lng?: number;
  price_toman: number;
  is_urgent: boolean;
  status: string;
  created_at_epoch: number;
  assigned_specialist_id?: string | null;
  assigned_specialist_name?: string | null;
  assigned_specialist_phone?: string | null;
  assigned_specialist_plate?: string | null;
  clean_specialist_specialty?: string;
  specialist_avatar_url?: string | null;
  has_specialist_invoice?: boolean;
  invoice_items?: InvoiceLineItem[];
  invoice_description?: string;
  invoice_photo_base64?: string | null;
  is_paid_online?: boolean;
  payment_reference_id?: string;
  customer_rating?: number | null;
  customer_rating_stars?: number | null;
  customer_quality_tags?: string;
  customer_review_comment?: string;
  invoice_updated_at?: number;
}

export type ServiceRequestRecord = ServiceRequestItem;

export interface BeautyTariff {
  title: string;
  price_toman: number;
  duration_min: number;
}

export interface BeautyCustomerReview {
  customer_name: string;
  stars: number;
  comment: string;
  date_label: string;
}

export interface BeautyDaySchedule {
  date_key: string;
  jalali_date: string;
  jalali_short: string;
  weekday: string;
  day_offset: number;
  is_open: boolean;
  slots: string[];
  time_slots?: string[];
}

export interface BeautySpecialist {
  specialist_phone: string;
  specialist_name: string;
  business_name: string;
  category_code?: string;
  role_title?: string;
  service_city?: string;
  city?: string;
  bio: string;
  salon_address?: string;
  address?: string;
  salon_map_status?: string;
  rating: number;
  review_count?: number;
  reviews_count?: number;
  avatar_url?: string | null;
  skills: string[];
  tariffs: BeautyTariff[];
  portfolio_notes?: string[];
  reviews?: BeautyCustomerReview[];
  days: BeautyDaySchedule[];
}

export type BeautySpecialistProfile = BeautySpecialist;

export interface BeautyBooking {
  id: string;
  specialist_phone: string;
  specialist_name: string;
  business_name: string;
  service_title: string;
  date_key: string;
  jalali_date: string;
  time_slot: string;
  deposit_toman: number;
  payment_method: string;
  payment_reference_id?: string;
  status: string;
  customer_phone: string;
  customer_name: string;
  created_at_epoch: number;
}

export type BeautyAppointmentRecord = BeautyBooking;

export interface TandisPayLoan {
  id: string;
  customer_phone: string;
  customer_name: string;
  requested_amount_toman: number;
  amount_toman?: number;
  installment_months: number;
  installments_count?: number;
  months?: number;
  interest_rate_percent: number;
  monthly_installment_toman: number;
  total_repayment_toman: number;
  paid_installments_count?: number;
  paid_installments?: number[];
  national_code: string;
  tracking_code?: string;
  wallet_credited?: boolean;
  documents_count?: number;
  documents_base64?: string[];
  status: string;
  admin_note?: string;
  reject_reason?: string;
  approved_at_epoch?: number;
  updated_at_epoch?: number;
  created_at_epoch: number;
}

export interface OnlineStorePart {
  id: string;
  title: string;
  category: string;
  brand: string;
  compatibleModel: string;
  partCode: string;
  warranty: string;
  priceToman: number;
  inStock: boolean;
  image_url?: string;
}

export interface CartItem {
  part: OnlineStorePart;
  quantity: number;
}

export interface PartInquiryItem {
  id: string;
  customer_phone: string;
  customer_name: string;
  device_type: 'خودرو' | 'لوازم خانگی';
  part_name: string;
  device_model: string;
  part_code?: string;
  description: string;
  needs_specialist_install: boolean;
  city: string;
  address?: string;
  status: string;
  quoted_price_toman?: number;
  created_at_epoch: number;
}

export interface SupportTicket {
  id?: string | number;
  ticket_id?: string | number;
  user_phone?: string;
  sender_phone?: string;
  user_name?: string;
  sender_name?: string;
  subject: string;
  message?: string;
  initial_message?: string;
  status?: string;
  admin_reply?: string | null;
  messages?: Array<{ sender?: string; text: string; created_at?: string }>;
  created_at?: string;
  created_at_epoch?: number;
}

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'SUPPORT' | 'ADMIN' | 'SYSTEM' | 'AUTH';
  createdAtEpoch: number;
  isRead: boolean;
  senderRole?: 'SYSTEM' | 'ADMIN';
  actionNav?: string;
}

export interface OtaRemoteConfig {
  force_update?: boolean;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  announcement_text?: string;
  global_announcement_text?: string;
  ota_version_label?: string;
  support_phone?: string;
  zarinpal_enabled?: boolean;
  commission_percent?: number;
  is_online_store_enabled?: boolean;
  online_store_enabled?: boolean;
  beauty_mandatory_deposit_toman?: number;
  online_store_parts?: Array<{
    id?: string;
    title?: string;
    category?: string;
    brand?: string;
    compatible_model?: string;
    part_code?: string;
    warranty?: string;
    price_toman?: number;
    in_stock?: boolean;
  }>;
}

export interface OfficialSpecialistSummary {
  fullName: string;
  roleTitle: string;
  categoryGroup: string;
  businessName: string;
  serviceCity: string;
  profilePhoto?: string | null;
}

export interface LiveStatePayload {
  online: boolean;
  syncedAtEpoch: number;
  otaConfig: OtaRemoteConfig | null;
  categories: Array<Record<string, unknown>> | null;
  sliders: PromoSlide[] | null;
  categorySliders: Record<string, CategorySliderItem[]> | null;
  requests: ServiceRequestItem[];
  activeCustomer: {
    id?: string | number;
    phone: string;
    full_name: string;
    city?: string;
  } | null;
  isBlocked: boolean;
  walletBalanceToman: number;
  beautySpecialists: BeautySpecialist[];
  beautyAppointments: BeautyBooking[];
  customerLoans: TandisPayLoan[];
  partInquiries: PartInquiryItem[];
  tickets?: SupportTicket[];
  notifications?: AppNotificationItem[];
  notificationState?: {
    readIds: string[];
    clearedIds: string[];
    readAllBeforeEpoch: number;
  };
  officialSpecialists?: OfficialSpecialistSummary[];
}

export type TandisLiveStateResponse = LiveStatePayload;
