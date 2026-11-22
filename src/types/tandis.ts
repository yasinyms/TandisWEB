export type NavTab = 'home' | 'beauty' | 'store' | 'tandispay' | 'orders' | 'downloads' | 'about';

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
  lat: number;
  lng: number;
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
}

export interface ServiceCategoryGroup {
  slug: string;
  title: string;
  subtitle: string;
  isComingSoon?: boolean;
  subcategories: SubServiceItem[];
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
  needs_specialist_install: boolean;
  city: string;
  description: string;
  status: string;
  quoted_price_toman?: number;
  created_at_epoch: number;
}

export interface InvoiceItem {
  title: string;
  quantity: number;
  unit_price_toman: number;
  row_total_toman: number;
  is_purchased_by_specialist?: boolean;
}

export interface ServiceRequestItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_category_id: string;
  service_title: string;
  car_model: string;
  car_plate: string;
  issue_description: string;
  neighborhood: string;
  home_address: string;
  city?: string;
  customer_lat: number;
  customer_lng: number;
  price_toman: number;
  is_urgent: boolean;
  status: string;
  assigned_specialist_id?: string | null;
  assigned_specialist_name?: string | null;
  assigned_specialist_phone?: string | null;
  assigned_specialist_plate?: string | null;
  clean_specialist_specialty?: string;
  specialist_avatar_url?: string | null;
  has_specialist_invoice?: boolean;
  invoice_items?: InvoiceItem[];
  invoice_description?: string;
  invoice_photo_base64?: string | null;
  is_paid_online?: boolean;
  payment_reference_id?: string;
  invoice_updated_at?: number;
  customer_rating?: number | null;
  customer_review_comment?: string;
  customer_quality_tags?: string;
  created_at_epoch: number;
}

export interface OtaConfig {
  ota_patch_version?: number;
  ota_version_label?: string;
  is_online_store_enabled?: boolean;
  online_store_enabled?: boolean;
  online_store_parts?: Array<{
    id?: string;
    title: string;
    category?: string;
    brand?: string;
    compatible_model?: string;
    part_code?: string;
    warranty?: string;
    price_toman?: number;
    in_stock?: boolean;
  }>;
  beauty_mandatory_deposit_toman?: number;
  support_phone?: string;
  global_announcement_text?: string;
}

export interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badge_text?: string;
  discount_tag?: string;
  image_url?: string;
  target_category_slug?: string;
  target_category_title?: string;
  duration_seconds?: number;
  order_index?: number;
  is_active?: boolean;
}

export interface CategorySliderItem {
  id: string;
  group_slug: string;
  badge?: string;
  title: string;
  subtitle: string;
  image_url?: string;
  is_active?: boolean;
}

export interface BeautyScheduleDay {
  date_key: string;
  jalali_date: string;
  jalali_short: string;
  weekday: string;
  day_offset: number;
  is_open: boolean;
  time_slots?: string[];
  slots?: string[];
}

export interface BeautySpecialist {
  id?: string;
  specialist_phone: string;
  specialist_name: string;
  business_name: string;
  category_code: string;
  role_title?: string;
  service_city?: string;
  bio?: string;
  salon_address?: string;
  salon_map_status?: string;
  avatar_url?: string | null;
  rating?: number;
  review_count?: number;
  skills?: string[];
  tariffs?: Array<{ title: string; price_toman: number; duration_min?: number }>;
  portfolio_notes?: string[];
  reviews?: Array<{ customer_name: string; stars: number; comment: string; date_label: string }>;
  days?: BeautyScheduleDay[];
}

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
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  customer_phone: string;
  customer_name: string;
  created_at_epoch: number;
}

export interface TandisPayLoan {
  id: string;
  customer_phone: string;
  customer_name: string;
  requested_amount_toman: number;
  installment_months: number;
  interest_rate_percent?: number;
  monthly_installment_toman?: number;
  total_repayment_toman?: number;
  national_code: string;
  status: string;
  admin_note?: string;
  created_at_epoch: number;
}

export interface LiveStatePayload {
  online: boolean;
  syncedAtEpoch: number;
  otaConfig: OtaConfig | null;
  categories: Array<Record<string, unknown>> | null;
  sliders: PromoSlide[] | null;
  categorySliders: Record<string, CategorySliderItem[]> | null;
  requests: ServiceRequestItem[];
  activeCustomer: {
    phone: string;
    full_name: string;
    city?: string;
    address?: string;
    wallet_balance_toman?: number;
  } | null;
  isBlocked?: boolean;
  walletBalanceToman: number;
  beautySpecialists: BeautySpecialist[];
  beautyAppointments: BeautyBooking[];
  customerLoans: TandisPayLoan[];
  partInquiries: PartInquiryItem[];
}

export interface SupportTicket {
  id?: string;
  ticket_id?: string;
  user_phone: string;
  user_name: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages?: Array<{
    sender: string;
    sender_name?: string;
    text: string;
    created_at_epoch?: number;
  }>;
}
