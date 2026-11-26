import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  Headphones,
  LayoutDashboard,
  MapPin,
  MessageSquarePlus,
  Printer,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  UserCheck,
  Wallet
} from 'lucide-react';
import {
  formatToman,
  statusPersianLabel,
  toPersianDigits,
  toPurePersianText
} from '../services/tandisDefaults';
import type {
  ServiceRequestItem,
  SupportTicket,
  TandisPayLoan
} from '../types/tandis';

interface CustomerDashboardViewProps {
  customerPhone: string;
  customerName: string;
  selectedCity: string;
  walletBalance: number;
  requests: ServiceRequestItem[];
  loans: TandisPayLoan[];
  tickets: SupportTicket[];
  onNavigateHome: () => void;
  onNavigateServices: () => void;
  onOpenInvoice: (req: ServiceRequestItem) => void;
  onOpenRating: (req: ServiceRequestItem) => void;
  onSubmitTicket: (subject: string, message: string) => Promise<void>;
  onRequireLogin: () => void;
}

interface ComputedInstallmentItem {
  index: number;
  dueEpoch: number;
  dueJalali: string;
  amountToman: number;
  isPaid: boolean;
  isOverdue: boolean;
}

function formatJalaliDate(epoch?: number, includeTime = false): string {
  if (!epoch || !Number.isFinite(epoch)) return '—';
  try {
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    };
    return new Intl.DateTimeFormat('fa-IR', opts).format(new Date(epoch));
  } catch {
    return '—';
  }
}

function resolvePaymentMethodLabel(req: ServiceRequestItem): string {
  const tags = String(req.customer_quality_tags || '');
  const ref = String(req.payment_reference_id || '');
  if (/کیف پول|WALLET/i.test(tags) || ref.startsWith('WLT-')) {
    return 'پرداخت از کیف پول تندیس';
  }
  if (req.is_paid_online || /PAID_ONLINE|PAID:true/i.test(tags) || ref.startsWith('ZP-') || ref.startsWith('SHP-')) {
    return 'پرداخت آنلاین (درگاه بانکی)';
  }
  if (String(req.status || '').toUpperCase() === 'COMPLETED') {
    return 'تسویه در محل با متخصص';
  }
  return 'در انتظار تسویه';
}

function printOfficialOrderInvoice(req: ServiceRequestItem, customerName: string, customerPhone: string) {
  const specialistName = toPurePersianText(req.assigned_specialist_name) || 'متخصص رسمی تندیس';
  const specialty = toPurePersianText(req.clean_specialist_specialty) || 'کارشناس فنی تندیس';
  const paymentMethod = resolvePaymentMethodLabel(req);
  const dateStr = formatJalaliDate(req.invoice_updated_at || req.created_at_epoch, true);
  const items = Array.isArray(req.invoice_items) && req.invoice_items.length > 0
    ? req.invoice_items
    : [
        {
          title: toPurePersianText(req.service_title) || 'انجام خدمات تخصصی در محل',
          quantity: 1,
          unit_price_toman: req.price_toman || 0,
          row_total_toman: req.price_toman || 0
        }
      ];

  const rowsHtml = items
    .map((item, idx) => {
      const qty = Number(item.quantity || 1);
      const unit = Number(item.unit_price_toman || item.price_toman || item.amount_toman || req.price_toman || 0);
      const total = Number(item.row_total_toman || qty * unit || unit);
      return `
        <tr>
          <td>${toPersianDigits(idx + 1)}</td>
          <td>${toPurePersianText(item.title) || 'شرح خدمت'}</td>
          <td>${toPersianDigits(qty)}</td>
          <td>${formatToman(unit)}</td>
          <td><strong>${formatToman(total)}</strong></td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!doctype html>
    <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>فاکتور رسمی خدمات تندیس - ${toPersianDigits(req.id)}</title>
        <style>
          body {
            font-family: Tahoma, 'Vazirmatn', Arial, sans-serif;
            direction: rtl;
            color: #12292c;
            margin: 0;
            padding: 24px;
            background: #ffffff;
          }
          .invoice-box {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #0b5c60;
            border-radius: 16px;
            padding: 24px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2efef;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 22px;
            font-weight: 900;
            color: #0b5c60;
          }
          .meta {
            font-size: 12px;
            line-height: 1.9;
            text-align: left;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            background: #f4fbfb;
            border: 1px solid #d6ebeb;
            border-radius: 12px;
            padding: 14px;
            font-size: 13px;
            line-height: 1.9;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #cfe3e3;
            padding: 10px 12px;
            text-align: right;
          }
          th {
            background: #0b5c60;
            color: #ffffff;
          }
          .summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #effcfb;
            border: 1px solid #0a8387;
            border-radius: 12px;
            padding: 14px 18px;
            font-size: 15px;
            font-weight: bold;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #5f777b;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="brand">سامانه جامع خدمات تندیس</div>
              <div style="font-size:12px;color:#527371;margin-top:4px;">صورت‌حساب و گزارش رسمی انجام خدمات تخصصی</div>
            </div>
            <div class="meta">
              <div><strong>شماره فاکتور:</strong> ${toPersianDigits(req.id)}</div>
              <div><strong>تاریخ صدور:</strong> ${dateStr}</div>
              <div><strong>وضعیت سفارش:</strong> ${statusPersianLabel(req.status)}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div><strong>نام مشتری:</strong> ${toPurePersianText(customerName || req.customer_name) || 'مشتری تندیس'}</div>
              <div><strong>شماره تماس:</strong> ${toPersianDigits(customerPhone || req.customer_phone || '')}</div>
              <div><strong>شهر و نشانی:</strong> ${toPurePersianText(req.city)} — ${toPurePersianText(req.home_address)}</div>
            </div>
            <div>
              <div><strong>متخصص انجام‌دهنده:</strong> ${specialistName}</div>
              <div><strong>رسته تخصصی:</strong> ${specialty}</div>
              <div><strong>نحوه پرداخت:</strong> ${paymentMethod}</div>
              ${req.payment_reference_id ? `<div><strong>شناسه پرداخت:</strong> ${toPersianDigits(req.payment_reference_id)}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>شرح خدمت / قطعه</th>
                <th>تعداد</th>
                <th>مبلغ واحد</th>
                <th>مبلغ کل</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          ${
            req.invoice_description
              ? `<div style="font-size:12px;margin-bottom:16px;padding:10px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                  <strong>گزارش فنی متخصص:</strong> ${toPurePersianText(req.invoice_description)}
                </div>`
              : ''
          }

          <div class="summary">
            <span>مبلغ نهایی فاکتور:</span>
            <span style="color:#0b5c60;font-size:18px;">${
              req.price_toman > 0 ? formatToman(req.price_toman) : 'طبق تعرفه مصوب'
            }</span>
          </div>

          <div class="footer">
            <span>صادرشده به‌صورت الکترونیکی در سامانه جامع تندیس</span>
            <span>امضا و تایید دیجیتال سامانه تندیس</span>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `;

  // چاپ فاکتور از طریق iframe مخفی جهت سازگاری کامل با تمامی مرورگرها و موبایل
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {}
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 350);
  }
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  customerPhone,
  customerName,
  selectedCity,
  requests,
  loans,
  tickets,
  onNavigateHome,
  onNavigateServices,
  onOpenInvoice,
  onOpenRating,
  onSubmitTicket,
  onRequireLogin
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'installments' | 'tickets'>('overview');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'COMPLETED' | 'ACTIVE'>('ALL');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [sendingTicket, setSendingTicket] = useState(false);

  const isLoggedIn = Boolean(customerPhone && /^09\d{9}$/.test(customerPhone));

  // ۱. محاسبه آمار سفارشات انجام‌شده و فعال
  const completedOrders = useMemo(
    () =>
      requests.filter((r) => {
        const st = String(r.status || '').toUpperCase();
        return st === 'COMPLETED' || Boolean(r.is_paid_online);
      }),
    [requests]
  );

  const activeOrders = useMemo(
    () =>
      requests.filter(
        (r) => !['COMPLETED', 'CANCELLED'].includes(String(r.status || '').toUpperCase())
      ),
    [requests]
  );

  const totalSpentToman = useMemo(
    () =>
      completedOrders.reduce((acc, r) => acc + Number(r.price_toman || 0), 0),
    [completedOrders]
  );

  // ۲. بررسی وام‌ها و اقساط تندیس‌پی از سرور (فقط در صورتی که وام فعال/تاییدشده یا دارای قسط در سرور وجود داشته باشد نمایش داده می‌شود)
  const activeCustomerLoans = useMemo(
    () =>
      (loans || []).filter((l) => {
        const st = String(l.status || '').toUpperCase();
        const amt = Number(l.requested_amount_toman || l.amount_toman || 0);
        return amt > 0 && st !== 'REJECTED' && st !== 'CANCELLED';
      }),
    [loans]
  );

  const hasAnyLoanInstallments = activeCustomerLoans.length > 0;

  // محاسبه جدول زمان‌بندی ماهانه اقساط برای هر وام از زمان پرداخت/تایید وام
  const loansWithSchedule = useMemo(() => {
    const now = Date.now();
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

    return activeCustomerLoans.map((loan) => {
      const totalMonths = Math.max(
        1,
        Number(loan.installment_months || loan.installments_count || loan.months || 12)
      );
      const principal = Number(loan.requested_amount_toman || loan.amount_toman || 0);
      const interestRate = Number(loan.interest_rate_percent ?? 4);
      const totalRepayment = Number(
        loan.total_repayment_toman || Math.round(principal * (1 + interestRate / 100))
      );
      const monthlyAmount = Number(
        loan.monthly_installment_toman || Math.round(totalRepayment / totalMonths)
      );

      // زمان مبدا شروع اقساط: از زمان پرداخت/تایید وام (approved_at_epoch یا updated_at_epoch یا created_at_epoch)
      const payoutStartEpoch = Number(
        loan.approved_at_epoch || loan.updated_at_epoch || loan.created_at_epoch || now
      );

      const explicitPaidSet = new Set(
        Array.isArray(loan.paid_installments) ? loan.paid_installments.map(Number) : []
      );
      const paidCountFromServer = Number(loan.paid_installments_count ?? explicitPaidSet.size ?? 0);

      const schedule: ComputedInstallmentItem[] = [];
      for (let i = 1; i <= totalMonths; i += 1) {
        const dueEpoch = payoutStartEpoch + i * ONE_MONTH_MS;
        const isPaid = explicitPaidSet.has(i) || i <= paidCountFromServer;
        const isOverdue = !isPaid && dueEpoch < now;
        schedule.push({
          index: i,
          dueEpoch,
          dueJalali: formatJalaliDate(dueEpoch, false),
          amountToman: monthlyAmount,
          isPaid,
          isOverdue
        });
      }

      const paidCount = schedule.filter((s) => s.isPaid).length;
      const unpaidCount = totalMonths - paidCount;
      const nextUnpaid = schedule.find((s) => !s.isPaid) || null;

      return {
        loan,
        totalMonths,
        principal,
        totalRepayment,
        monthlyAmount,
        payoutStartJalali: formatJalaliDate(payoutStartEpoch, false),
        paidCount,
        unpaidCount,
        nextUnpaid,
        schedule
      };
    });
  }, [activeCustomerLoans]);

  const filteredRequests = useMemo(() => {
    if (orderFilter === 'COMPLETED') return completedOrders;
    if (orderFilter === 'ACTIVE') return activeOrders;
    return requests;
  }, [requests, completedOrders, activeOrders, orderFilter]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="rounded-3xl bg-white border border-[#dcecec] p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#effcfb] text-[#0b5c60] flex items-center justify-center mx-auto">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#12292c]">
            ورود به داشبورد اختصاصی مشتری
          </h1>
          <p className="text-xs sm:text-sm text-[#5f777b] leading-7">
            برای مشاهده آمار سفارشات انجام‌شده، گزارش مالی و چاپ فاکتور، وضعیت اقساط تندیس‌پی و تیکت‌های پشتیبانی، ابتدا وارد حساب کاربری خود شوید.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRequireLogin}
              className="px-6 py-3 rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs font-black cursor-pointer transition-colors"
            >
              ورود پیامکی به حساب
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-5 py-3 rounded-2xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] text-xs font-extrabold cursor-pointer transition-colors"
            >
              صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-3 space-y-6">
      {/* هدر داشبورد مشتری */}
      <div className="rounded-3xl bg-white border border-[#dcecec] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0b5c60] to-[#0a8387] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {(customerName || 'م').slice(0, 1)}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0a8387]">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>داشبورد یکپارچه مشتری تندیس</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#12292c]">
              {customerName || 'مشتری گرامی تندیس'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5f777b] font-bold">
              <span dir="ltr" className="tabular-nums">{toPersianDigits(customerPhone)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0a8387]" />
                شهر فعال: {selectedCity}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateServices}
            className="px-4 py-2.5 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs font-black cursor-pointer transition-colors"
          >
            ثبت سفارش جدید
          </button>
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f2f9f9] hover:bg-[#e3f3f3] border border-[#cde6e6] text-[#0b5c60] text-xs font-extrabold cursor-pointer transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به خانه</span>
          </button>
        </div>
      </div>

      {/* بخش ۲-۱: کارت‌های خلاصه تعداد سفارشات انجام‌شده و وضعیت حساب */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-[#dcecec] p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5f777b]">سفارشات انجام‌شده</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#12292c] tabular-nums">
            {toPersianDigits(completedOrders.length)}
            <span className="text-xs font-bold text-[#5f777b] mr-1.5">سفارش</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-700">
            تکمیل و تسویه‌شده
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#dcecec] p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5f777b]">کل سفارشات ثبت‌شده</span>
            <div className="w-9 h-9 rounded-xl bg-[#effcfb] text-[#0b5c60] flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#12292c] tabular-nums">
            {toPersianDigits(requests.length)}
            <span className="text-xs font-bold text-[#5f777b] mr-1.5">درخواست</span>
          </div>
          <div className="text-[11px] font-bold text-[#5f777b]">
            {toPersianDigits(activeOrders.length)} سفارش در جریان
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#dcecec] p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5f777b]">مجموع مبالغ خدمات</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-[#0b5c60] tabular-nums pt-1">
            {formatToman(totalSpentToman)}
          </div>
          <div className="text-[11px] font-bold text-[#5f777b]">
            دارای فاکتور رسمی قابل چاپ
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#dcecec] p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5f777b]">تیکت‌های پشتیبانی</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#12292c] tabular-nums">
            {toPersianDigits(tickets.length)}
            <span className="text-xs font-bold text-[#5f777b] mr-1.5">تیکت</span>
          </div>
          <div className="text-[11px] font-bold text-sky-700">
            ارتباط مستقیم با مدیریت
          </div>
        </div>
      </div>

      {/* نوار تب‌های داخلی داشبورد */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'overview' as const, label: 'نمای کلی داشبورد' },
          {
            id: 'orders' as const,
            label: `سفارشات و گزارش فاکتورها (${toPersianDigits(requests.length)})`
          },
          ...(hasAnyLoanInstallments
            ? [
                {
                  id: 'installments' as const,
                  label: `اقساط تندیس‌پی (${toPersianDigits(activeCustomerLoans.length)})`
                }
              ]
            : []),
          {
            id: 'tickets' as const,
            label: `تیکت‌های پشتیبانی (${toPersianDigits(tickets.length)})`
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap border transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0b5c60] text-white border-[#0b5c60] shadow-2xs'
                : 'bg-white text-[#4a666a] border-[#dcecec] hover:border-[#0a8387]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* بخش ۲-۲: اقساط تندیس‌پی — صرفاً در صورتی که کاربر در سرور وام یا قسط داشته باشد نمایش داده می‌شود */}
      {hasAnyLoanInstallments && (activeTab === 'overview' || activeTab === 'installments') && (
        <section className="rounded-3xl bg-white border border-[#dcecec] p-5 sm:p-7 space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef5f5] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0a8387]">
                <Wallet className="w-4 h-4" />
                <span>وضعیت اعتبار و اقساط تندیس‌پی (دریافت‌شده از سرور مرکزی)</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                جدول زمان‌بندی ماهانه و وضعیت پرداخت اقساط وام شما
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {loansWithSchedule.map((item) => {
              const stUpper = String(item.loan.status || '').toUpperCase();
              const isApproved = stUpper === 'APPROVED' || stUpper === 'ACTIVE' || Boolean(item.loan.wallet_credited);

              return (
                <div
                  key={item.loan.id}
                  className="rounded-2xl bg-[#f8fcfc] border border-[#d8ecec] p-4 sm:p-6 space-y-5"
                >
                  {/* مشخصات کلی وام و شرایط انتخاب‌شده توسط مشتری */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-[#5f777b]">
                        شناسه پرونده اعتبار: <span className="font-black text-[#12292c]">{toPersianDigits(item.loan.id)}</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-[#0b5c60] mt-0.5">
                        مبلغ اعتبار: {formatToman(item.principal)} ({toPersianDigits(item.totalMonths)} قسط ماهانه)
                      </div>
                    </div>

                    <span
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isApproved ? 'فعال و واریزشده — در دوره بازپرداخت' : 'در حال بررسی و تایید نهایی'}
                    </span>
                  </div>

                  {/* آمار کل اقساط، پرداخت‌شده، باقی‌مانده و تاریخ شروع */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-white border border-[#e2efef] p-3.5 space-y-1">
                      <div className="text-[11px] font-bold text-[#5f777b]">تعداد کل اقساط انتخابی</div>
                      <div className="text-sm sm:text-base font-black text-[#12292c]">
                        {toPersianDigits(item.totalMonths)} قسط ماهانه
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-[#e2efef] p-3.5 space-y-1">
                      <div className="text-[11px] font-bold text-[#5f777b]">اقساط پرداخت‌شده</div>
                      <div className="text-sm sm:text-base font-black text-emerald-700">
                        {toPersianDigits(item.paidCount)} قسط پرداخت‌شده
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-[#e2efef] p-3.5 space-y-1">
                      <div className="text-[11px] font-bold text-[#5f777b]">اقساط باقی‌مانده</div>
                      <div className="text-sm sm:text-base font-black text-amber-700">
                        {toPersianDigits(item.unpaidCount)} قسط پرداخت‌نشده
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-[#e2efef] p-3.5 space-y-1">
                      <div className="text-[11px] font-bold text-[#5f777b]">مبلغ هر قسط ماهانه</div>
                      <div className="text-sm sm:text-base font-black text-[#0b5c60] tabular-nums">
                        {formatToman(item.monthlyAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4a666a] bg-white rounded-xl px-4 py-3 border border-[#e4f0f0]">
                    <span>
                      <strong>تاریخ پرداخت وام و شروع زمان‌بندی:</strong> {item.payoutStartJalali}
                    </span>
                    <span>
                      <strong>نحوه تقسیط انتخابی شخص:</strong> بازپرداخت ماهانه ({toPersianDigits(item.totalMonths)} ماهه)
                    </span>
                    {item.nextUnpaid && (
                      <span className="text-[#0b5c60] font-black">
                        سررسید قسط بعدی (قسط {toPersianDigits(item.nextUnpaid.index)}): {item.nextUnpaid.dueJalali}
                      </span>
                    )}
                  </div>

                  {/* جدول کامل زمان‌بندی تک‌تک اقساط (پرداخت‌شده و پرداخت‌نشده) */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#dcecec] text-[#5f777b]">
                          <th className="py-2.5 px-3 font-extrabold">شماره قسط</th>
                          <th className="py-2.5 px-3 font-extrabold">تاریخ سررسید ماهانه</th>
                          <th className="py-2.5 px-3 font-extrabold">مبلغ قسط</th>
                          <th className="py-2.5 px-3 font-extrabold">وضعیت پرداخت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eef5f5]">
                        {item.schedule.map((inst) => (
                          <tr
                            key={inst.index}
                            className={
                              inst.isPaid
                                ? 'bg-emerald-50/40'
                                : inst.isOverdue
                                  ? 'bg-rose-50/40'
                                  : 'bg-white'
                            }
                          >
                            <td className="py-3 px-3 font-black text-[#12292c]">
                              قسط {toPersianDigits(inst.index)} از {toPersianDigits(item.totalMonths)}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#284246] tabular-nums">
                              {inst.dueJalali}
                            </td>
                            <td className="py-3 px-3 font-black text-[#0b5c60] tabular-nums">
                              {formatToman(inst.amountToman)}
                            </td>
                            <td className="py-3 px-3">
                              {inst.isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  پرداخت‌شده
                                </span>
                              ) : inst.isOverdue ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-[11px]">
                                  <Clock className="w-3.5 h-3.5" />
                                  پرداخت‌نشده (سررسید گذشته)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-black text-[11px]">
                                  <Calendar className="w-3.5 h-3.5" />
                                  پرداخت‌نشده (سررسید ماهانه)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* بخش ۲-۳: سفارشات انجام‌شده و گزارشات سفارشات + چاپ فاکتور رسمی */}
      {(activeTab === 'overview' || activeTab === 'orders') && (
        <section className="rounded-3xl bg-white border border-[#dcecec] p-5 sm:p-7 space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef5f5] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0a8387]">
                <FileText className="w-4 h-4" />
                <span>گزارش کامل سفارشات، متخصص انجام‌دهنده، مبلغ و نحوه پرداخت</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                سفارشات انجام‌شده و چاپ فاکتور رسمی
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL' as const, label: `همه (${toPersianDigits(requests.length)})` },
                { id: 'COMPLETED' as const, label: `انجام‌شده (${toPersianDigits(completedOrders.length)})` },
                { id: 'ACTIVE' as const, label: `در جریان (${toPersianDigits(activeOrders.length)})` }
              ].map((flt) => (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() => setOrderFilter(flt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                    orderFilter === flt.id
                      ? 'bg-[#0b5c60] text-white'
                      : 'bg-[#f4fafa] text-[#4a666a] hover:bg-[#e5f3f3]'
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ReceiptText className="w-10 h-10 text-[#0a8387]/35 mx-auto" />
              <div className="text-sm font-black text-[#12292c]">
                در این بخش 아직 سفارشی ثبت نشده است
              </div>
              <p className="text-xs text-[#5f777b]">
                پس از ثبت و انجام هر سفارش، مشخصات متخصص، مبلغ، نحوه پرداخت و دکمه چاپ فاکتور در اینجا قرار می‌گیرد.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRequests.map((req) => {
                const specialistName =
                  toPurePersianText(req.assigned_specialist_name) || 'در انتظار تخصیص متخصص';
                const paymentMethod = resolvePaymentMethodLabel(req);
                const isCompleted = String(req.status || '').toUpperCase() === 'COMPLETED';

                return (
                  <div
                    key={req.id}
                    className="rounded-2xl bg-[#fbfefe] border border-[#dcecec] p-4 sm:p-5 space-y-4 hover:border-[#0a8387]/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm sm:text-base text-[#12292c]">
                            {toPurePersianText(req.service_title)}
                          </span>
                          <span className="text-[11px] font-bold text-[#5f777b] bg-[#f2f9f9] px-2.5 py-0.5 rounded-lg border border-[#e0eeee]">
                            کد: {toPersianDigits(req.id)}
                          </span>
                        </div>
                        <div className="text-xs text-[#5f777b]">
                          تاریخ ثبت: {formatJalaliDate(req.created_at_epoch, true)} · شهر {toPurePersianText(req.city)}
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#effcfb] text-[#0b5c60] border border-[#c5ecea]'
                        }`}
                      >
                        {statusPersianLabel(req.status)}
                      </span>
                    </div>

                    {/* جزئیات گزارش سفارش: چه فردی بوده، مبلغ چقدر بوده، به چه صورت پرداخت شده */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white rounded-xl p-3.5 border border-[#e8f2f2] text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#effcfb] text-[#0b5c60] flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[#5f777b] font-bold">متخصص انجام‌دهنده:</div>
                          <div className="font-black text-[#12292c]">{specialistName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[#5f777b] font-bold">مبلغ فاکتور:</div>
                          <div className="font-black text-[#0b5c60] tabular-nums">
                            {req.price_toman > 0 ? formatToman(req.price_toman) : 'طبق تعرفه مصوب'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[#5f777b] font-bold">نحوه پرداخت:</div>
                          <div className="font-black text-[#12292c]">{paymentMethod}</div>
                        </div>
                      </div>
                    </div>

                    {/* دکمه‌های چاپ فاکتور و مشاهده رسید */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-[#5f777b]">
                        نشانی انجام خدمت: {toPurePersianText(req.neighborhood)} — {toPurePersianText(req.home_address)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => printOfficialOrderInvoice(req, customerName, customerPhone)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs font-black cursor-pointer transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>چاپ فاکتور رسمی</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenInvoice(req)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#f2f9f9] border border-[#cde6e6] text-[#0b5c60] text-xs font-extrabold cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>جزئیات فاکتور</span>
                        </button>

                        {isCompleted && !req.customer_rating && (
                          <button
                            type="button"
                            onClick={() => onOpenRating(req)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black cursor-pointer transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                            <span>ثبت نظر</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* بخش ۲-۴: تیکت‌های پشتیبانی مشتری */}
      {(activeTab === 'overview' || activeTab === 'tickets') && (
        <section className="rounded-3xl bg-white border border-[#dcecec] p-5 sm:p-7 space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef5f5] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0a8387]">
                <Headphones className="w-4 h-4" />
                <span>ارتباط مستقیم با پشتیبانی و پنل مدیریت تندیس</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#12292c]">
                تیکت‌های پشتیبانی شما ({toPersianDigits(tickets.length)})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* فرم ثبت تیکت جدید */}
            <div className="lg:col-span-5 rounded-2xl bg-[#f8fcfc] border border-[#d8ecec] p-4 sm:p-5 space-y-3.5 self-start">
              <div className="text-xs sm:text-sm font-black text-[#12292c] flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-[#0a8387]" />
                <span>ارسال تیکت جدید به پشتیبانی</span>
              </div>

              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="موضوع تیکت (مثلاً پیگیری فاکتور یا سفارش)..."
                className="w-full rounded-xl bg-white border border-[#cde6e6] focus:border-[#0b5c60] px-3.5 py-2.5 text-xs sm:text-sm outline-none"
              />

              <textarea
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="شرح کامل پیام یا درخواست خود را بنویسید..."
                className="w-full rounded-xl bg-white border border-[#cde6e6] focus:border-[#0b5c60] px-3.5 py-2.5 text-xs sm:text-sm outline-none"
              />

              <button
                type="button"
                disabled={sendingTicket || !ticketSubject.trim() || !ticketMessage.trim()}
                onClick={async () => {
                  setSendingTicket(true);
                  try {
                    await onSubmitTicket(ticketSubject.trim(), ticketMessage.trim());
                    setTicketSubject('');
                    setTicketMessage('');
                  } finally {
                    setSendingTicket(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:opacity-50 text-white py-3 text-xs font-black cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingTicket ? 'در حال ثبت تیکت...' : 'ثبت و ارسال تیکت'}</span>
              </button>
            </div>

            {/* فهرست تیکت‌های ثبت‌شده و پاسخ‌ها */}
            <div className="lg:col-span-7 space-y-3">
              {tickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#cde6e6] p-8 text-center space-y-2">
                  <Headphones className="w-8 h-8 text-[#0a8387]/40 mx-auto" />
                  <div className="text-xs sm:text-sm font-bold text-[#12292c]">
                    هنوز تیکتی ثبت نکرده‌اید
                  </div>
                  <p className="text-xs text-[#5f777b]">
                    هرگونه سوال یا درخواست پشتیبانی خود را از طریق کادر مقابل ارسال کنید تا پاسخ مدیریت در همین بخش ثبت شود.
                  </p>
                </div>
              ) : (
                tickets.map((t, idx) => {
                  const bodyText =
                    t.message ||
                    t.initial_message ||
                    (t.messages && t.messages.length > 0 ? t.messages[0].text : '');
                  const isAnswered =
                    Boolean(t.admin_reply) ||
                    ['RESOLVED', 'ANSWERED', 'CLOSED'].includes(String(t.status || '').toUpperCase());

                  return (
                    <div
                      key={t.id || t.ticket_id || idx}
                      className="rounded-2xl bg-[#fbfefe] border border-[#dcecec] p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs sm:text-sm text-[#12292c]">
                          {t.subject}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                            isAnswered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isAnswered ? 'پاسخ داده‌شده' : 'در حال بررسی'}
                        </span>
                      </div>

                      {bodyText && (
                        <p className="text-xs text-[#4a666a] leading-6">{bodyText}</p>
                      )}

                      {t.admin_reply && (
                        <div className="rounded-xl bg-[#effcfb] border border-[#bce6e4] p-3 text-xs space-y-1">
                          <div className="font-black text-[#0b5c60]">پاسخ پشتیبانی و مدیریت تندیس:</div>
                          <div className="text-[#12292c] leading-6">{t.admin_reply}</div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
