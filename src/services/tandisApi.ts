import type {
  BeautyBooking,
  CartItem,
  LiveStatePayload,
  PartInquiryItem,
  ServiceRequestItem,
  SupportTicket
} from '../types/tandis';

export async function fetchLiveState(phone: string): Promise<LiveStatePayload> {
  const q = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const resp = await fetch(`/api/tandis/live-state${q}`);
  if (!resp.ok) throw new Error('خطا در دریافت وضعیت زنده سرور');
  return resp.json();
}

export async function checkAccountStatus(phone: string): Promise<{
  phone: string;
  existsAsCustomer: boolean;
  hasHamkarCollision: boolean;
  hasDualAccount: boolean;
  isBlocked: boolean;
  blockReason?: string;
  customer?: { full_name?: string; city?: string } | null;
}> {
  const resp = await fetch(`/api/tandis/account-check?phone=${encodeURIComponent(phone)}`);
  if (!resp.ok) throw new Error('خطا در بررسی وضعیت حساب کاربری');
  return resp.json();
}

export interface SendOtpResponse {
  ok: boolean;
  message: string;
  expiresInSeconds?: number;
  existsAsCustomer?: boolean;
  hasHamkarCollision?: boolean;
  fullName?: string;
  city?: string;
}

export interface VerifyOtpResponse {
  ok: boolean;
  phone: string;
  existsAsCustomer: boolean;
  fullName?: string;
  city?: string;
  message?: string;
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const resp = await fetch('/api/tandis/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  let data: Record<string, unknown> = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }
  if (!resp.ok || data?.ok === false) {
    throw new Error(String(data?.message || data?.error || data?.detail || 'خطا در ارسال کد تایید پیامکی'));
  }
  return {
    ok: true,
    message: String(data?.message || 'کد تایید ۶ رقمی به شماره شما پیامک شد.'),
    expiresInSeconds: typeof data?.expiresInSeconds === 'number' ? data.expiresInSeconds : 120,
    existsAsCustomer: Boolean(data?.existsAsCustomer),
    hasHamkarCollision: Boolean(data?.hasHamkarCollision),
    fullName: typeof data?.fullName === 'string' ? data.fullName : '',
    city: typeof data?.city === 'string' ? data.city : ''
  };
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  const resp = await fetch('/api/tandis/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  let data: Record<string, unknown> = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }
  if (!resp.ok || data?.ok === false) {
    throw new Error(String(data?.message || data?.error || data?.detail || 'کد تایید نامعتبر یا منقضی است'));
  }
  return {
    ok: true,
    phone: String(data?.phone || phone),
    existsAsCustomer: Boolean(data?.existsAsCustomer),
    fullName: typeof data?.fullName === 'string' ? data.fullName : '',
    city: typeof data?.city === 'string' ? data.city : '',
    message: typeof data?.message === 'string' ? data.message : 'ورود با موفقیت تایید شد.'
  };
}

export async function registerCustomer(payload: {
  phone: string;
  full_name: string;
  city: string;
  address?: string;
}): Promise<Record<string, unknown>> {
  const resp = await fetch('/api/v1/customers/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: payload.phone,
      full_name: `${payload.full_name} | ${payload.city}`,
      city: payload.city,
      address: payload.address || payload.city,
      wallet_balance_toman: 0,
      created_at_epoch: Date.now()
    })
  });
  return resp.json();
}

export async function updateCustomerName(params: {
  phone: string;
  fullName: string;
  city: string;
}): Promise<void> {
  const now = Date.now();
  const formattedName = `${params.fullName} | ${params.city}`;
  await fetch('/api/v1/customers/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: params.phone,
      full_name: formattedName,
      city: params.city,
      address: params.city
    })
  }).catch(() => {});

  await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `name_override_${params.phone}`,
      request_id: 'NAME_OVERRIDE',
      service_title: 'NAME_OVERRIDE',
      specialist_id: 'system',
      specialist_name: 'تغییر نام مشتری',
      customer_name: params.fullName,
      customer_phone: params.phone,
      stars: 5,
      quality_tags: `NAME:${params.fullName}|CITY:${params.city}`,
      comment: JSON.stringify({
        phone: params.phone,
        full_name: params.fullName,
        city: params.city,
        updated_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });
}

export async function createServiceRequest(req: Partial<ServiceRequestItem>): Promise<ServiceRequestItem> {
  const id = req.id || `req_${Math.random().toString(16).slice(2, 10)}`;
  const body = {
    id,
    customer_name: req.customer_name || 'مشتری تندیس',
    customer_phone: req.customer_phone || '',
    service_category_id: req.service_category_id || 'auto-mobile-mechanic',
    service_title: req.service_title || 'سفارش خدمت تندیس',
    car_model: req.car_model || 'ثبت از وب‌سایت تندیس',
    car_plate: req.car_plate || '',
    issue_description: req.issue_description || '',
    neighborhood: req.neighborhood || '',
    home_address: req.home_address || '',
    city: req.city || 'آبادان',
    customer_lat: req.customer_lat ?? 30.3392,
    customer_lng: req.customer_lng ?? 48.3043,
    price_toman: req.price_toman ?? 0,
    is_paid_online: Boolean(req.is_paid_online),
    ...(req.payment_reference_id ? { payment_reference_id: req.payment_reference_id } : {}),
    ...(req.is_paid_online ? { customer_quality_tags: 'PAY_STATUS:PAID_ONLINE | IS_PAID_ONLINE:true' } : {}),
    is_urgent: Boolean(req.is_urgent),
    status: 'PENDING_NEARBY',
    created_at_epoch: Date.now(),
    synced_with_django: true
  };
  const resp = await fetch('/api/v1/requests/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error('ثبت درخواست در سرور مرکزی با خطا روبرو شد');
  return resp.json();
}

export async function payRequestInvoice(params: {
  request: ServiceRequestItem;
  phone: string;
  customerName: string;
  methodLabel: string;
  newWalletBalance?: number;
}): Promise<void> {
  const now = Date.now();
  const refId = `تندیس-${String(now).slice(-6)}`;
  const { request, phone, customerName, methodLabel, newWalletBalance } = params;

  await fetch(`/api/v1/requests/${encodeURIComponent(request.id)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      is_paid_online: true,
      payment_reference_id: refId,
      customer_quality_tags: 'PAY_STATUS:PAID_ONLINE | IS_PAID_ONLINE:true'
    })
  });

  await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `payment_${request.id}`,
      request_id: request.id,
      service_title: 'ONLINE_PAYMENT',
      specialist_id: request.assigned_specialist_id || 'spec_101',
      specialist_name: request.assigned_specialist_name || 'متخصص تندیس',
      customer_name: customerName,
      customer_phone: phone,
      stars: 5,
      quality_tags: `PAID:true|PAY_STATUS:PAID_ONLINE|IS_PAID_ONLINE:true|REF:${refId}`,
      comment: JSON.stringify({
        is_paid_online: true,
        payment_status: 'PAID_ONLINE',
        payment_reference_id: refId,
        gateway: methodLabel,
        total_amount_toman: request.price_toman,
        updated_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });

  if (typeof newWalletBalance === 'number') {
    await updateCustomerWallet(phone, customerName, newWalletBalance);
  }
}

export async function updateCustomerWallet(phone: string, customerName: string, newBalance: number): Promise<void> {
  const now = Date.now();
  await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `wallet_${phone}`,
      request_id: 'CUSTOMER_WALLET',
      service_title: 'کیف پول تندیس',
      specialist_id: 'wallet_system',
      specialist_name: 'کیف پول تندیس',
      customer_name: customerName,
      customer_phone: phone,
      stars: 5,
      quality_tags: `WALLET:${newBalance}`,
      comment: JSON.stringify({
        phone,
        balance_toman: newBalance,
        wallet_balance_toman: newBalance,
        updated_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });
}

export async function cancelRequestWithReason(request: ServiceRequestItem, reason: string): Promise<void> {
  const now = Date.now();
  await fetch(`/api/v1/requests/${encodeURIComponent(request.id)}/status/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CANCELLED' })
  });
  await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `cancel_req_${request.id}`,
      request_id: request.id,
      service_title: 'CUSTOMER_CANCEL_REQUEST',
      specialist_id: request.assigned_specialist_id || '',
      specialist_name: request.assigned_specialist_name || 'متخصص تندیس',
      customer_name: request.customer_name,
      customer_phone: request.customer_phone,
      stars: 1,
      quality_tags: `STATUS:CANCELLED|CANCEL_REQ:1|CANCEL_REASON:${reason}`,
      comment: JSON.stringify({ status: 'CANCELLED', cancel_reason: reason, updated_at_epoch: now }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });
}

export async function rateCompletedRequest(requestId: string, stars: number, comment: string): Promise<void> {
  await fetch(`/api/v1/requests/${encodeURIComponent(requestId)}/rate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: stars,
      quality_tags: 'رضایت از کیفیت خدمات',
      comment
    })
  });
}

export async function fetchCustomerTickets(phone: string): Promise<SupportTicket[]> {
  if (!phone) return [];
  const resp = await fetch(`/api/tandis/tickets?phone=${encodeURIComponent(phone)}`);
  if (!resp.ok) return [];
  const data = await resp.json();
  return Array.isArray(data) ? data : [];
}

export async function createTicket(payload: {
  user_phone: string;
  user_name: string;
  subject: string;
  message: string;
}): Promise<SupportTicket> {
  const resp = await fetch('/api/tandis/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_phone: payload.user_phone,
      user_name: payload.user_name,
      subject: payload.subject,
      message: payload.message
    })
  });
  if (!resp.ok) throw new Error('ارسال پیام پشتیبانی با خطا مواجه شد');
  return resp.json();
}

export async function submitTandisPayLoan(payload: {
  phone: string;
  fullName: string;
  amountToman: number;
  months: number;
  interestRatePercent: number;
  monthlyInstallmentToman: number;
  totalRepaymentToman: number;
  nationalCode: string;
  docsBase64: string[];
}): Promise<void> {
  const now = Date.now();
  const loanId = `loan_${payload.phone}_${String(now).slice(-5)}`;
  const resp = await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: loanId,
      request_id: 'TANDIS_PAY_LOAN',
      service_title: 'TANDIS_PAY_LOAN',
      specialist_id: 'tandis_pay',
      specialist_name: 'تندیس پی',
      customer_name: payload.fullName,
      customer_phone: payload.phone,
      stars: 5,
      quality_tags: `LOAN_AMOUNT:${payload.amountToman}|MONTHS:${payload.months}|STATUS:PENDING`,
      comment: JSON.stringify({
        id: loanId,
        customer_phone: payload.phone,
        customer_name: payload.fullName,
        requested_amount_toman: payload.amountToman,
        installment_months: payload.months,
        interest_rate_percent: payload.interestRatePercent,
        monthly_installment_toman: payload.monthlyInstallmentToman,
        total_repayment_toman: payload.totalRepaymentToman,
        national_code: payload.nationalCode,
        documents_count: payload.docsBase64.length,
        documents_base64: payload.docsBase64,
        status: 'PENDING',
        created_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });
  if (!resp.ok) throw new Error('ثبت پرونده تسهیلات تندیس‌پی با خطا روبرو شد');
}

export async function bookBeautyAppointment(params: {
  specialist_phone: string;
  specialist_name: string;
  business_name: string;
  service_title: string;
  date_key: string;
  jalali_date: string;
  time_slot: string;
  deposit_toman: number;
  payment_method: string;
  customer_phone: string;
  customer_name: string;
  newWalletBalance?: number;
}): Promise<void> {
  const now = Date.now();
  const aptId = `beauty_apt_${params.customer_phone}_${String(now).slice(-6)}`;
  const resp = await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: aptId,
      request_id: 'BEAUTY_APPOINTMENT',
      service_title: params.service_title,
      specialist_id: params.specialist_phone,
      specialist_name: params.specialist_name,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      stars: 5,
      quality_tags: `BEAUTY_APT|STATUS:CONFIRMED|DATE:${params.date_key}|TIME:${params.time_slot}`,
      comment: JSON.stringify({
        id: aptId,
        specialist_phone: params.specialist_phone,
        specialist_name: params.specialist_name,
        business_name: params.business_name,
        service_title: params.service_title,
        date_key: params.date_key,
        jalali_date: params.jalali_date,
        time_slot: params.time_slot,
        deposit_toman: params.deposit_toman,
        payment_method: params.payment_method,
        status: 'CONFIRMED',
        customer_phone: params.customer_phone,
        customer_name: params.customer_name,
        created_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });
  if (!resp.ok) throw new Error('ثبت نوبت زیبایی در سرور با خطا روبرو شد');
  if (typeof params.newWalletBalance === 'number') {
    await updateCustomerWallet(params.customer_phone, params.customer_name, params.newWalletBalance);
  }
}

export async function cancelBeautyAppointment(params: {
  booking: BeautyBooking;
  currentWalletBalance: number;
}): Promise<number> {
  const now = Date.now();
  const { booking, currentWalletBalance } = params;
  const refundedBalance = currentWalletBalance + (booking.deposit_toman || 0);

  await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: booking.id,
      request_id: 'BEAUTY_APPOINTMENT',
      service_title: booking.service_title,
      specialist_id: booking.specialist_phone,
      specialist_name: booking.specialist_name,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      stars: 5,
      quality_tags: `BEAUTY_APT|STATUS:CANCELLED|REFUNDED:${booking.deposit_toman}`,
      comment: JSON.stringify({
        ...booking,
        status: 'CANCELLED',
        cancelled_at_epoch: now,
        refunded_toman: booking.deposit_toman
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });

  if (booking.deposit_toman > 0) {
    await updateCustomerWallet(booking.customer_phone, booking.customer_name, refundedBalance);
  }
  return refundedBalance;
}

export async function submitPartInquiry(payload: Omit<PartInquiryItem, 'id' | 'status' | 'created_at_epoch'>): Promise<void> {
  const now = Date.now();
  const id = `part_inquiry_${payload.customer_phone}_${String(now).slice(-6)}`;
  const resp = await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      request_id: 'PART_INQUIRY',
      service_title: payload.part_name,
      specialist_id: 'parts_desk',
      specialist_name: 'تامین قطعات تندیس',
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      stars: 5,
      quality_tags: `PART_INQUIRY|INSTALL:${payload.needs_specialist_install ? 'YES' : 'NO'}`,
      comment: JSON.stringify({
        id,
        ...payload,
        status: 'در انتظار استعلام قیمت',
        created_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });
  if (!resp.ok) throw new Error('ثبت فرم استعلام قطعه با خطا روبرو شد');
}

export async function submitPartsOrder(params: {
  phone: string;
  customerName: string;
  city: string;
  address: string;
  items: CartItem[];
  totalToman: number;
  paymentMethod: string;
  needsInstall: boolean;
  newWalletBalance?: number;
}): Promise<void> {
  const now = Date.now();
  const orderId = `parts_order_${params.phone}_${String(now).slice(-6)}`;
  const summaryTitle = params.items.map((i) => `${i.part.title} (${i.quantity} عدد)`).join('، ');
  await fetch('/api/v1/reviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: orderId,
      request_id: 'PARTS_ORDER',
      service_title: summaryTitle,
      specialist_id: 'parts_store',
      specialist_name: 'فروشگاه قطعات تندیس',
      customer_name: params.customerName,
      customer_phone: params.phone,
      stars: 5,
      quality_tags: `PARTS_ORDER|TOTAL:${params.totalToman}|METHOD:${params.paymentMethod}`,
      comment: JSON.stringify({
        id: orderId,
        items: params.items.map((i) => ({
          id: i.part.id,
          title: i.part.title,
          quantity: i.quantity,
          price_toman: i.part.priceToman
        })),
        total_toman: params.totalToman,
        payment_method: params.paymentMethod,
        needs_install: params.needsInstall,
        city: params.city,
        address: params.address,
        created_at_epoch: now
      }),
      created_at_epoch: now,
      synced_with_django: true
    })
  });

  if (params.needsInstall) {
    await createServiceRequest({
      customer_name: params.customerName,
      customer_phone: params.phone,
      service_category_id: 'auto-mobile-mechanic',
      service_title: `نصب قطعات خریداری‌شده: ${summaryTitle}`,
      car_model: 'سفارش فروشگاه قطعات تندیس',
      issue_description: `نصب همزمان قطعات سفارش‌داده‌شده در نشانی: ${params.address}`,
      neighborhood: params.city,
      home_address: params.address,
      city: params.city,
      price_toman: 0,
      is_urgent: false
    });
  }

  if (typeof params.newWalletBalance === 'number') {
    await updateCustomerWallet(params.phone, params.customerName, params.newWalletBalance);
  }
}

export async function compressImageToBase64(file: File, maxDim = 1024, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('عدم دسترسی به پردازش تصویر'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('فایل تصویر معتبر نیست'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsDataURL(file);
  });
}
