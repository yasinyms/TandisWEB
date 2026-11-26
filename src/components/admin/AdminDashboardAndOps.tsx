import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  FileCheck2,
  PhoneCall,
  Radio,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
  XCircle
} from 'lucide-react';
import {
  type AdminCategory,
  type AdminCustomer,
  type AdminLiveState,
  type AdminModuleId,
  type AdminOrder,
  type AdminSpecialist,
  type AdminUserSession,
  deleteCustomerAdmin,
  deleteOrderAdmin,
  deleteSpecialistAdmin,
  formatPersianDateTime,
  parseSmartOrderDetails,
  persianOrderStatus,
  persianSpecialistStatus,
  registerPhoneOrderAdmin,
  runSpecialistActionAdmin,
  safeImageSrc,
  toggleCustomerBlockAdmin,
  updateCustomerWalletAdmin
} from '../../services/adminApi';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';

interface OpsSharedProps {
  data: AdminLiveState;
  user: AdminUserSession;
  globalQuery: string;
  onRefresh: () => Promise<void>;
  onToast: (msg: string) => void;
  onNavigateModule: (mod: AdminModuleId) => void;
}

// ==================== ماژول ۱: پیشخوان مدیریتی ====================
export const AdminDashboardView: React.FC<OpsSharedProps> = ({
  data,
  user,
  onNavigateModule
}) => {
  const { stats } = data;
  const canSee = (m: AdminModuleId) => user.allowedModules.includes(m);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4e6b62]">
            <span>مشتریان سامانه</span>
            <Users className="w-4 h-4 text-[#0E4D3B]" />
          </div>
          <div className="text-2xl font-black text-[#0f2922] mt-2 tabular-nums">
            {toPersianDigits(stats.customersTotal)} نفر
          </div>
          <div className="text-xs text-[#5d7970] mt-2 flex items-center gap-2">
            <span>فعال: {toPersianDigits(stats.customersActive)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700">مسدود: {toPersianDigits(stats.customersBlocked)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4e6b62]">
            <span>متخصصین و همکاران</span>
            <UserCheck className="w-4 h-4 text-[#146C53]" />
          </div>
          <div className="text-2xl font-black text-[#0f2922] mt-2 tabular-nums">
            {toPersianDigits(stats.specialistsTotal)} نفر
          </div>
          <div className="text-xs text-[#5d7970] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-emerald-700">تاییدشده: {toPersianDigits(stats.specialistsApproved)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700">در انتظار: {toPersianDigits(stats.specialistsPending)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#0E4D3B] font-bold">آنلاین: {toPersianDigits(stats.specialistsOnline)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700">مسدود: {toPersianDigits(stats.specialistsBlocked)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4e6b62]">
            <span>کل سفارش‌های خدمات</span>
            <ClipboardList className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-black text-[#0f2922] mt-2 tabular-nums">
            {toPersianDigits(stats.ordersTotal)} سفارش
          </div>
          <div className="text-xs text-[#5d7970] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-emerald-700">تکمیل: {toPersianDigits(stats.ordersCompleted)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700">جاری: {toPersianDigits(stats.ordersInProgress)}</span>
            <span aria-hidden="true">·</span>
            <span>در انتظار: {toPersianDigits(stats.ordersPending)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700">لغو: {toPersianDigits(stats.ordersCancelled)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4e6b62]">
            <span>صف اقدام فوری</span>
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-black text-[#0f2922] mt-2 tabular-nums">
            {toPersianDigits(
              stats.openTicketsCount +
                stats.specialistsPending +
                stats.pendingLoansCount +
                stats.pendingBeautyPricesCount +
                (user.canViewFinancials ? stats.pendingSettlementsCount : 0)
            )}{' '}
            مورد
          </div>
          <div className="text-xs text-[#5d7970] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>تیکت باز: {toPersianDigits(stats.openTicketsCount)}</span>
            <span aria-hidden="true">·</span>
            <span>وام: {toPersianDigits(stats.pendingLoansCount)}</span>
            <span aria-hidden="true">·</span>
            <span>زیبایی: {toPersianDigits(stats.pendingBeautyPricesCount)}</span>
          </div>
        </div>
      </div>

      {user.canViewFinancials && (
        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#0f2922]">خلاصه گردش مالی و کمیسیون سامانه</h2>
            {canSee('finance') && (
              <button
                type="button"
                onClick={() => onNavigateModule('finance')}
                className="px-3 py-1.5 rounded-xl bg-[#eef7f4] hover:bg-[#dff1eb] text-[#0E4D3B] text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                مشاهده گزارش کامل مالی
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-[#e8f0ed]">
            <div className="pt-2 sm:pt-0 sm:px-3 first:pr-0">
              <div className="text-xs text-[#5d7970]">درآمد کل سفارش‌های تکمیل‌شده</div>
              <div className="text-lg font-black text-[#0f2922] mt-1 tabular-nums">
                {formatToman(stats.totalOrdersRevenue)}
              </div>
            </div>
            <div className="pt-3 sm:pt-0 sm:px-3">
              <div className="text-xs text-[#5d7970]">درآمد حق کمیسیون تندیس</div>
              <div className="text-lg font-black text-[#0E4D3B] mt-1 tabular-nums">
                {formatToman(stats.totalCommissionRevenue)}
              </div>
            </div>
            <div className="pt-3 sm:pt-0 sm:px-3">
              <div className="text-xs text-[#5d7970]">سهم خالص متخصصین</div>
              <div className="text-lg font-black text-[#146C53] mt-1 tabular-nums">
                {formatToman(stats.netSpecialistShare)}
              </div>
            </div>
            <div className="pt-3 sm:pt-0 sm:px-3">
              <div className="text-xs text-[#5d7970]">مبالغ تسویه‌شده نهایی</div>
              <div className="text-lg font-black text-[#D97706] mt-1 tabular-nums">
                {formatToman(stats.settledTotalToman)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-[#0f2922]">پرونده‌های در انتظار اقدام</h3>
            <span className="text-xs text-[#5d7970]">بروزرسانی زنده</span>
          </div>
          <div className="divide-y divide-[#edf4f1] text-xs">
            {[
              { label: 'تسویه‌حساب‌های در انتظار بررسی', count: stats.pendingSettlementsCount, mod: 'settlements' as const, visible: canSee('settlements') },
              { label: 'درخواست‌های وام تندیس‌پی', count: stats.pendingLoansCount, mod: 'loans' as const, visible: canSee('loans') },
              { label: 'پرونده متخصصین در انتظار تایید مدارک', count: stats.specialistsPending, mod: 'specialists' as const, visible: canSee('specialists') },
              { label: 'تعرفه‌های زیبایی در انتظار تایید', count: stats.pendingBeautyPricesCount, mod: 'beauty' as const, visible: canSee('beauty') },
              { label: 'تیکت‌های باز پشتیبانی', count: stats.openTicketsCount, mod: 'tickets' as const, visible: canSee('tickets') },
              { label: 'پرونده‌های باز تخلفات و شکایات', count: stats.openViolationsCount, mod: 'violations' as const, visible: canSee('violations') }
            ]
              .filter((r) => r.visible)
              .map((row) => (
                <div key={row.mod} className="py-3 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#1d3931]">{row.label}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-sm tabular-nums text-[#0E4D3B]">
                      {toPersianDigits(row.count)} مورد
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateModule(row.mod)}
                      className="px-3 py-1.5 rounded-lg border border-[#d6e7e2] hover:bg-[#eef7f4] text-[#0E4D3B] font-bold whitespace-nowrap cursor-pointer"
                    >
                      بررسی
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dfece8] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-[#0f2922]">دسترسی سریع کارشناس</h3>
            <span className="text-xs text-[#5d7970]">{user.roleTitle}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {canSee('phone_order') && (
              <button
                type="button"
                onClick={() => onNavigateModule('phone_order')}
                className="px-4 py-3 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span>ثبت درخواست تلفنی</span>
              </button>
            )}
            {canSee('specialists') && (
              <button
                type="button"
                onClick={() => onNavigateModule('specialists')}
                className="px-4 py-3 rounded-xl bg-[#eef7f4] hover:bg-[#dff1eb] text-[#0E4D3B] border border-[#cde3dc] text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 shrink-0" />
                <span>تایید مدارک متخصصین</span>
              </button>
            )}
            {canSee('tickets') && (
              <button
                type="button"
                onClick={() => onNavigateModule('tickets')}
                className="px-4 py-3 rounded-xl bg-[#eef7f4] hover:bg-[#dff1eb] text-[#0E4D3B] border border-[#cde3dc] text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>پاسخ به تیکت‌ها</span>
              </button>
            )}
            {canSee('notifications') && (
              <button
                type="button"
                onClick={() => onNavigateModule('notifications')}
                className="px-4 py-3 rounded-xl bg-[#fff8eb] hover:bg-[#fef0d4] text-[#9a5404] border border-[#f5d59c] text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>ارسال اعلان زنده</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ماژول ۲: مدیریت مشتریان و بررسی هوشمند سفارش‌ها ====================
export const AdminCustomersOrdersView: React.FC<OpsSharedProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [subTab, setSubTab] = useState<'orders' | 'customers'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [walletTarget, setWalletTarget] = useState<AdminCustomer | null>(null);
  const [walletValue, setWalletValue] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState('');

  const q = globalQuery.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return data.orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.service_title.toLowerCase().includes(q) ||
        o.car_plate.toLowerCase().includes(q) ||
        o.car_model.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [data.orders, statusFilter, q]);

  const filteredCustomers = useMemo(() => {
    return data.customers.filter((c) => {
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [data.customers, q]);

  const handleSaveWallet = async () => {
    if (!walletTarget) return;
    const num = Number(walletValue.replace(/[^\d]/g, ''));
    if (!Number.isFinite(num) || num < 0) {
      onToast('مبلغ کیف پول معتبر نیست.');
      return;
    }
    setBusyKey(`wallet_${walletTarget.phone}`);
    try {
      await updateCustomerWalletAdmin(walletTarget.phone, num);
      onToast(`موجودی کیف پول ${walletTarget.fullName} با موفقیت بروزرسانی شد.`);
      setWalletTarget(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در ویرایش کیف پول');
    } finally {
      setBusyKey('');
    }
  };

  const handleToggleBlock = async (cust: AdminCustomer) => {
    setBusyKey(`block_${cust.phone}`);
    try {
      await toggleCustomerBlockAdmin(cust.phone, !cust.isBlocked);
      onToast(cust.isBlocked ? 'رفع مسدودی مشتری انجام شد.' : 'حساب مشتری مسدود شد.');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در تغییر وضعیت مشتری');
    } finally {
      setBusyKey('');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setBusyKey(`del_order_${orderId}`);
    try {
      await deleteOrderAdmin(orderId);
      onToast('سفارش با موفقیت از سامانه حذف شد.');
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      setConfirmDeleteKey('');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف سفارش');
    } finally {
      setBusyKey('');
    }
  };

  const handleDeleteCustomer = async (phone: string, fullName: string) => {
    setBusyKey(`del_cust_${phone}`);
    try {
      await deleteCustomerAdmin(phone);
      onToast(`حساب و پرونده مشتری «${fullName}» با موفقیت حذف شد.`);
      setConfirmDeleteKey('');
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف مشتری');
    } finally {
      setBusyKey('');
    }
  };

  const parsedSelected = selectedOrder
    ? parseSmartOrderDetails(selectedOrder.car_model, selectedOrder.issue_description)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-[#dfece8] p-3">
        <div className="flex items-center gap-1.5 bg-[#f2f7f5] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSubTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === 'orders' ? 'bg-[#0E4D3B] text-white' : 'text-[#44635a] hover:text-[#0f2922]'
            }`}
          >
            سفارش‌های هوشمند ({toPersianDigits(data.orders.length)})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('customers')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === 'customers' ? 'bg-[#0E4D3B] text-white' : 'text-[#44635a] hover:text-[#0f2922]'
            }`}
          >
            مشتریان ثبت‌شده ({toPersianDigits(data.customers.length)})
          </button>
        </div>

        {subTab === 'orders' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'همه' },
              { id: 'PENDING_NEARBY', label: 'در انتظار' },
              { id: 'IN_PROGRESS', label: 'در حال انجام' },
              { id: 'COMPLETED', label: 'تکمیل‌شده' },
              { id: 'CANCELLED', label: 'لغوشده' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[#eef7f4] text-[#0E4D3B] border border-[#b9d9cf]'
                    : 'text-[#5b776e] hover:bg-[#f4f8f7]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {subTab === 'orders' ? (
        <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
                <tr>
                  <th className="py-3 px-4 font-extrabold">خدمت و مدل</th>
                  <th className="py-3 px-4 font-extrabold">مشتری</th>
                  <th className="py-3 px-4 font-extrabold">متخصص</th>
                  <th className="py-3 px-4 font-extrabold">شهر / محله</th>
                  <th className="py-3 px-4 font-extrabold">مبلغ</th>
                  <th className="py-3 px-4 font-extrabold">وضعیت</th>
                  <th className="py-3 px-4 font-extrabold">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf4f1]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#68837b] font-bold">
                      سفارشی مطابق جستجوی شما یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const st = persianOrderStatus(o.status);
                    return (
                      <tr key={o.id} className="hover:bg-[#f9fcfb]">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-[#0f2922]">{o.service_title}</div>
                          {o.car_model && <div className="text-[11px] text-[#5e7a71] mt-0.5">{o.car_model}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#19352d]">{o.customer_name}</div>
                          <div className="text-[11px] text-[#607b72] tabular-nums" dir="ltr">
                            {toPersianDigits(o.customer_phone)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {o.assigned_specialist_name ? (
                            <div>
                              <div className="font-bold text-[#19352d]">{o.assigned_specialist_name}</div>
                              <div className="text-[11px] text-[#607b72] tabular-nums" dir="ltr">
                                {toPersianDigits(o.assigned_specialist_phone)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#809991]">در انتظار تخصیص</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#436158]">
                          {[o.car_plate, o.neighborhood].filter(Boolean).join(' · ') || 'ثبت نشده'}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-[#0E4D3B] tabular-nums whitespace-nowrap">
                          {o.price_toman > 0 ? formatToman(o.price_toman) : 'توافقی'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${st.tone}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="px-3 py-1.5 rounded-lg bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>بررسی هوشمند</span>
                            </button>
                            {confirmDeleteKey === `order_${o.id}` ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={busyKey === `del_order_${o.id}`}
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                                >
                                  {busyKey === `del_order_${o.id}` ? 'حذف...' : 'تایید حذف'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteKey('')}
                                  className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                                >
                                  انصراف
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteKey(`order_${o.id}`)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
                <tr>
                  <th className="py-3 px-4 font-extrabold">نام و نام خانوادگی</th>
                  <th className="py-3 px-4 font-extrabold">شماره موبایل</th>
                  <th className="py-3 px-4 font-extrabold">شهر</th>
                  <th className="py-3 px-4 font-extrabold">موجودی کیف پول</th>
                  <th className="py-3 px-4 font-extrabold">وضعیت حساب</th>
                  <th className="py-3 px-4 font-extrabold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf4f1]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#68837b] font-bold">
                      مشتری مطابق جستجوی شما یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.phone} className="hover:bg-[#f9fcfb]">
                      <td className="py-3 px-4 font-extrabold text-[#0f2922]">{c.fullName}</td>
                      <td className="py-3 px-4 tabular-nums font-bold text-[#35534a]" dir="ltr">
                        {toPersianDigits(c.phone)}
                      </td>
                      <td className="py-3 px-4 text-[#4c6960]">{c.city}</td>
                      <td className="py-3 px-4 font-extrabold text-[#0E4D3B] tabular-nums whitespace-nowrap">
                        {formatToman(c.walletBalance)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${
                            c.isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {c.isBlocked ? 'مسدودشده' : 'فعال'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setWalletTarget(c);
                              setWalletValue(String(c.walletBalance));
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>ویرایش کیف پول</span>
                          </button>
                          <button
                            type="button"
                            disabled={busyKey === `block_${c.phone}`}
                            onClick={() => handleToggleBlock(c)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                              c.isBlocked
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{c.isBlocked ? 'رفع مسدودی' : 'مسدودسازی'}</span>
                          </button>
                          {confirmDeleteKey === `cust_${c.phone}` ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busyKey === `del_cust_${c.phone}`}
                                onClick={() => handleDeleteCustomer(c.phone, c.fullName)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                              >
                                {busyKey === `del_cust_${c.phone}` ? 'حذف...' : 'تایید حذف'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteKey('')}
                                className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                              >
                                انصراف
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(`cust_${c.phone}`)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* پنجره تجزیه و بررسی هوشمند جزئیات سفارش */}
      {selectedOrder && parsedSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#dceae5] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[#e5f0ec] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0f2922]">بررسی هوشمند جزئیات سفارش</h3>
                <div className="text-xs text-[#5d7970] mt-0.5">
                  {selectedOrder.service_title} · ثبت در {formatPersianDateTime(selectedOrder.created_at_epoch)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-[#f2f7f5] cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f7fbf9] p-4 rounded-2xl border border-[#e3efe9]">
                <div>
                  <span className="text-[#5f7b72]">نام مشتری: </span>
                  <strong className="text-[#0f2922]">{selectedOrder.customer_name}</strong>
                </div>
                <div>
                  <span className="text-[#5f7b72]">شماره تماس مشتری: </span>
                  <strong className="text-[#0f2922] tabular-nums" dir="ltr">
                    {toPersianDigits(selectedOrder.customer_phone)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#5f7b72]">شهر و محله: </span>
                  <strong className="text-[#0f2922]">
                    {[selectedOrder.car_plate, selectedOrder.neighborhood].filter(Boolean).join(' · ') || 'ثبت نشده'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#5f7b72]">مبلغ سفارش: </span>
                  <strong className="text-[#0E4D3B] tabular-nums">
                    {selectedOrder.price_toman > 0 ? formatToman(selectedOrder.price_toman) : 'توافقی'}
                  </strong>
                </div>
                {selectedOrder.home_address && (
                  <div className="sm:col-span-2">
                    <span className="text-[#5f7b72]">نشانی دقیق: </span>
                    <strong className="text-[#0f2922]">{selectedOrder.home_address}</strong>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-black text-[#0E4D3B] mb-2">جدول مشخصات فنی سفارش</h4>
                <div className="border border-[#e3efe9] rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <tbody className="divide-y divide-[#edf4f1]">
                      {parsedSelected.specs.length === 0 ? (
                        <tr>
                          <td className="py-3 px-4 text-[#68837b]">مشخصات فنی تفکیک‌شده ثبت نشده است.</td>
                        </tr>
                      ) : (
                        parsedSelected.specs.map((row, idx) => (
                          <tr key={idx} className="odd:bg-[#fafdfb]">
                            <td className="py-2.5 px-4 font-bold text-[#4e6b62] w-1/3">{row.label}</td>
                            <td className="py-2.5 px-4 font-extrabold text-[#0f2922]">{row.value}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {parsedSelected.reportedProblems.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-[#D97706] mb-2">مشکلات اعلامی توسط مشتری</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedSelected.reportedProblems.map((prob, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-[#fff8eb] text-[#9a5404] border border-[#f5d59c] font-bold"
                      >
                        {prob}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-black text-[#0E4D3B] mb-2">توضیحات تکمیلی مشتری</h4>
                <div className="p-3.5 rounded-2xl bg-[#f7fbf9] border border-[#e3efe9] leading-6 text-[#1a362e]">
                  {parsedSelected.customerNotes || selectedOrder.issue_description || 'توضیح اضافه‌ای ثبت نشده است.'}
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5f0ec] flex items-center justify-between">
                {confirmDeleteKey === `modal_order_${selectedOrder.id}` ? (
                  <div className="flex items-center gap-2">
                    <span className="text-rose-700 font-extrabold">آیا از حذف کامل این سفارش مطمئن هستید؟</span>
                    <button
                      type="button"
                      disabled={busyKey === `del_order_${selectedOrder.id}`}
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      {busyKey === `del_order_${selectedOrder.id}` ? 'در حال حذف...' : 'تایید و حذف سفارش'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey('')}
                      className="px-3 py-1.5 rounded-xl border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteKey(`modal_order_${selectedOrder.id}`)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف این سفارش</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] font-extrabold whitespace-nowrap cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* پنجره ویرایش کیف پول مشتری */}
      {walletTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#dceae5] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0f2922]">ویرایش موجودی کیف پول مشتری</h3>
              <button type="button" onClick={() => setWalletTarget(null)} className="p-1.5 rounded-xl hover:bg-[#f2f7f5] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#547168]">
              مشتری: <strong className="text-[#0f2922]">{walletTarget.fullName}</strong> ({toPersianDigits(walletTarget.phone)})
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#35534a]">مبلغ جدید کیف پول (تومان)</label>
              <input
                type="number"
                min={0}
                value={walletValue}
                onChange={(e) => setWalletValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#cfe0da] text-sm font-bold tabular-nums outline-none focus:border-[#0E4D3B]"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setWalletTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#d6e7e2] text-xs font-bold text-[#44635a] whitespace-nowrap cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={busyKey === `wallet_${walletTarget.phone}`}
                onClick={handleSaveWallet}
                className="px-5 py-2 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
              >
                ذخیره موجودی جدید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ماژول ۳: ثبت درخواست تلفنی توسط کارشناس پشتیبانی ====================
export const AdminPhoneOrderView: React.FC<OpsSharedProps> = ({
  data,
  onRefresh,
  onToast
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('اهواز');
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const [selectedSubIdx, setSelectedSubIdx] = useState(0);
  const [carModel, setCarModel] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [issueText, setIssueText] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [priceToman, setPriceToman] = useState('450000');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const normalizedPhone = phoneInput.replace(/[^\d]/g, '');
  const matchedCustomer = useMemo(
    () => (normalizedPhone.length === 11 ? data.customers.find((c) => c.phone === normalizedPhone) || null : null),
    [data.customers, normalizedPhone]
  );

  const customerHistory = useMemo(
    () => (matchedCustomer ? data.orders.filter((o) => o.customer_phone === matchedCustomer.phone).slice(0, 4) : []),
    [data.orders, matchedCustomer]
  );

  const availableCategories: AdminCategory[] = useMemo(() => {
    if (data.categories.length > 0) return data.categories;
    return [
      {
        id: 'cat-technical',
        slug: 'technical-repairs',
        title: 'تعمیرات فنی و لوازم خانگی',
        subcategories: [
          {
            id: 'sub-ac-repair',
            slug: 'ac-repair',
            title: 'تعمیر کولر گازی',
            base_price_toman: 450000,
            ready_problems: ['باد گرم می‌زند', 'نیاز به شارژ گاز دارد', 'آبریزی از پنل داخلی', 'روشن نمی‌شود']
          }
        ]
      }
    ];
  }, [data.categories]);

  const activeCategory = availableCategories[selectedCatIdx] || availableCategories[0];
  const activeSubs = activeCategory?.subcategories || [];
  const activeSub = activeSubs[selectedSubIdx] || activeSubs[0];

  const handlePhoneChange = (val: string) => {
    setPhoneInput(val);
    const digits = val.replace(/[^\d]/g, '');
    const found = data.customers.find((c) => c.phone === digits);
    if (found) {
      setCustomerName(found.fullName);
      if (found.city) setCity(found.city);
      const lastOrder = data.orders.find((o) => o.customer_phone === found.phone && o.home_address);
      if (lastOrder) {
        if (lastOrder.home_address && !homeAddress) setHomeAddress(lastOrder.home_address);
        if (lastOrder.neighborhood && !neighborhood) setNeighborhood(lastOrder.neighborhood);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      onToast('شماره موبایل ۱۱ رقمی معتبر با شروع ۰۹ وارد کنید.');
      return;
    }
    if (!customerName.trim()) {
      onToast('نام و نام خانوادگی مشتری الزامی است.');
      return;
    }
    const combinedDesc = [
      selectedProblems.length > 0 ? `مشکلات اعلامی: ${selectedProblems.join('، ')}` : '',
      issueText.trim() ? `توضیحات مشتری: ${issueText.trim()}` : ''
    ]
      .filter(Boolean)
      .join(' | ');

    setSubmitting(true);
    try {
      await registerPhoneOrderAdmin({
        customer_phone: normalizedPhone,
        customer_name: customerName.trim(),
        city: city.trim() || 'اهواز',
        is_new_customer: !matchedCustomer,
        service_category_id: activeCategory?.slug || activeCategory?.id || 'technical-repairs',
        service_title: activeSub?.title || activeCategory?.title || 'خدمات تندیس',
        car_model: carModel.trim(),
        issue_description: combinedDesc || 'ثبت درخواست تلفنی توسط پشتیبانی تندیس',
        neighborhood: neighborhood.trim(),
        home_address: homeAddress.trim(),
        price_toman: Number(priceToman) || 0,
        is_urgent: isUrgent
      });
      onToast('درخواست تلفنی با موفقیت ثبت و برای متخصصین ارسال شد.');
      setCarModel('');
      setSelectedProblems([]);
      setIssueText('');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ثبت درخواست تلفنی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dfece8] p-5 space-y-5">
        <div>
          <h2 className="text-base font-black text-[#0f2922]">ثبت سریع درخواست تلفنی مشتری</h2>
          <p className="text-xs text-[#5d7970] mt-1">
            بلافاصله پس از ثبت، سفارش برای متخصصین آماده در اپلیکیشن تندیس همکار ارسال می‌شود.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">شماره موبایل مشتری</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneInput}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="مثلاً 09123456789"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm font-bold tabular-nums outline-none focus:border-[#0E4D3B]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">نام و نام خانوادگی</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="نام مشتری"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm font-bold outline-none focus:border-[#0E4D3B]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">شهر</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="مثلاً اهواز یا آبادان"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm font-bold outline-none focus:border-[#0E4D3B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">دسته‌بندی اصلی</label>
            <select
              value={selectedCatIdx}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedCatIdx(idx);
                setSelectedSubIdx(0);
                setSelectedProblems([]);
                const nextSub = availableCategories[idx]?.subcategories?.[0];
                if (nextSub?.base_price_toman) setPriceToman(String(nextSub.base_price_toman));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] bg-white text-sm font-bold outline-none focus:border-[#0E4D3B]"
            >
              {availableCategories.map((c, idx) => (
                <option key={c.id || idx} value={idx}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">زیرخدمت (مهارت)</label>
            <select
              value={selectedSubIdx}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedSubIdx(idx);
                setSelectedProblems([]);
                const nextSub = activeSubs[idx];
                if (nextSub?.base_price_toman) setPriceToman(String(nextSub.base_price_toman));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] bg-white text-sm font-bold outline-none focus:border-[#0E4D3B]"
            >
              {activeSubs.length === 0 ? (
                <option value={0}>{activeCategory?.title}</option>
              ) : (
                activeSubs.map((s, idx) => (
                  <option key={s.id || idx} value={idx}>
                    {s.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">مدل دستگاه یا خودرو</label>
            <input
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="مثلاً اسپلیت ال‌جی ۲۴ هزار یا پژو پارس"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm outline-none focus:border-[#0E4D3B]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">مبلغ پایه یا توافقی (تومان)</label>
            <input
              type="number"
              min={0}
              value={priceToman}
              onChange={(e) => setPriceToman(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm font-bold tabular-nums outline-none focus:border-[#0E4D3B]"
            />
          </div>
        </div>

        {Array.isArray(activeSub?.ready_problems) && activeSub.ready_problems.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#2a4940]">مشکلات آماده پرتکرار</label>
            <div className="flex flex-wrap gap-2">
              {activeSub.ready_problems.map((prob) => {
                const active = selectedProblems.includes(prob);
                return (
                  <button
                    key={prob}
                    type="button"
                    onClick={() =>
                      setSelectedProblems((prev) =>
                        prev.includes(prob) ? prev.filter((x) => x !== prob) : [...prev, prob]
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#0E4D3B] text-white border-[#0E4D3B]'
                        : 'bg-[#f6faf8] text-[#35534a] border-[#d7e6e0] hover:bg-[#eaf4f0]'
                    }`}
                  >
                    {prob}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">محله</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="مثلاً کیانپارس"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm outline-none focus:border-[#0E4D3B]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2a4940]">نشانی دقیق محل</label>
            <input
              type="text"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder="خیابان، کوچه، پلاک و واحد"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm outline-none focus:border-[#0E4D3B]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-[#2a4940]">شرح مشکل و توضیحات تماس</label>
          <textarea
            rows={3}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            placeholder="توضیحات کامل مشتری را اینجا وارد کنید..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-sm outline-none focus:border-[#0E4D3B]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e8f0ed]">
          <label className="inline-flex items-center gap-2 text-xs font-extrabold text-[#9a5404] cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 accent-[#D97706]"
            />
            <span>ارسال به‌عنوان سفارش فوری</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] disabled:opacity-50 text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
          >
            {submitting ? 'در حال ثبت و ارسال...' : 'ثبت و ارسال برای متخصصین'}
          </button>
        </div>
      </div>

      {/* ستون وضعیت مشتری جستجوشده */}
      <div className="bg-white rounded-2xl border border-[#dfece8] p-5 space-y-4 h-fit">
        <h3 className="text-sm font-black text-[#0f2922]">سوابق مشتری</h3>
        {matchedCustomer ? (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#eef7f4] border border-[#cde3dc] space-y-1">
              <div className="font-black text-[#0E4D3B]">{matchedCustomer.fullName}</div>
              <div className="text-[#4a6960]">شهر: {matchedCustomer.city}</div>
              <div className="font-bold text-[#0f2922] tabular-nums">
                موجودی کیف پول: {formatToman(matchedCustomer.walletBalance)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[#4a6960]">آخرین سفارش‌های این مشتری</div>
              {customerHistory.length === 0 ? (
                <div className="text-[#78928a]">سفارش قبلی ثبت نشده است.</div>
              ) : (
                customerHistory.map((ord) => (
                  <div key={ord.id} className="p-2.5 rounded-xl border border-[#e6f0ec] space-y-0.5">
                    <div className="font-bold text-[#0f2922]">{ord.service_title}</div>
                    <div className="text-[11px] text-[#607b72]">
                      {persianOrderStatus(ord.status).label} · {formatPersianDateTime(ord.created_at_epoch)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#607b72] leading-6">
            {normalizedPhone.length === 11
              ? 'این شماره در سامانه ثبت نشده است؛ هنگام ثبت سفارش، حساب مشتری به‌صورت خودکار ایجاد خواهد شد.'
              : 'با وارد کردن شماره موبایل ۱۱ رقمی مشتری، مشخصات، موجودی کیف پول و سوابق قبلی او به‌صورت آنی نمایش داده می‌شود.'}
          </div>
        )}
      </div>
    </form>
  );
};

// ==================== ماژول ۴: بررسی و تایید پرونده متخصصین و رادار آنلاین ====================
export const AdminSpecialistsView: React.FC<OpsSharedProps> = ({
  data,
  user,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'ONLINE' | 'BLOCKED'>('ALL');
  const [selected, setSelected] = useState<AdminSpecialist | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editShaba, setEditShaba] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDeletePhone, setConfirmDeletePhone] = useState('');
  const isHr = user.role === 'HR_EXPERT';

  const q = globalQuery.trim().toLowerCase();
  const filtered = useMemo(() => {
    return data.specialists.filter((s) => {
      if (statusFilter === 'PENDING' && !['PENDING', 'PENDING_ADMIN_APPROVAL'].includes(s.approvalStatus)) return false;
      if (statusFilter === 'APPROVED' && s.approvalStatus !== 'APPROVED') return false;
      if (statusFilter === 'ONLINE' && !s.isOnlineNow) return false;
      if (statusFilter === 'BLOCKED' && s.approvalStatus !== 'BLOCKED') return false;
      if (!q) return true;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.nationalCode.includes(q) ||
        s.serviceCity.toLowerCase().includes(q) ||
        s.roleTitle.toLowerCase().includes(q)
      );
    });
  }, [data.specialists, statusFilter, q]);

  const openDossier = (sp: AdminSpecialist) => {
    setSelected(sp);
    setEditMode(false);
    setReasonText(sp.reason || '');
    setEditName(sp.fullName);
    setEditCity(sp.serviceCity);
    setEditRole(sp.roleTitle);
    setEditShaba(sp.shabaNumber || '');
  };

  const handleAction = async (action: 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'EDIT') => {
    if (!selected) return;
    if ((action === 'REJECTED' || action === 'BLOCKED') && reasonText.trim().length < 3) {
      onToast('لطفاً علت رد یا مسدودسازی پرونده را وارد کنید.');
      return;
    }
    setBusy(true);
    try {
      await runSpecialistActionAdmin(selected.phone, {
        action,
        reason: reasonText.trim(),
        fullName: editMode ? editName : undefined,
        serviceCity: editMode ? editCity : undefined,
        roleTitle: editMode ? editRole : undefined,
        shabaNumber: editMode && !isHr ? editShaba : undefined
      });
      const label =
        action === 'APPROVED'
          ? 'پرونده متخصص تایید نهایی شد.'
          : action === 'REJECTED'
          ? 'پرونده متخصص رد شد.'
          : action === 'BLOCKED'
          ? 'حساب متخصص مسدود شد.'
          : 'اطلاعات پرونده متخصص ذخیره شد.';
      onToast(label);
      setSelected(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در بروزرسانی پرونده متخصص');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSpecialist = async (phone: string, fullName: string) => {
    setBusy(true);
    try {
      await deleteSpecialistAdmin(phone);
      onToast(`پرونده متخصص «${fullName}» با موفقیت حذف شد.`);
      setConfirmDeletePhone('');
      if (selected?.phone === phone) setSelected(null);
      await onRefresh();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'خطا در حذف پرونده متخصص');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-2xl border border-[#dfece8] p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL' as const, label: `همه (${toPersianDigits(data.specialists.length)})` },
            { id: 'PENDING' as const, label: `در انتظار تایید (${toPersianDigits(data.stats.specialistsPending)})` },
            { id: 'APPROVED' as const, label: `تاییدشده (${toPersianDigits(data.stats.specialistsApproved)})` },
            { id: 'ONLINE' as const, label: `آنلاین در رادار (${toPersianDigits(data.stats.specialistsOnline)})` },
            { id: 'BLOCKED' as const, label: `مسدود (${toPersianDigits(data.stats.specialistsBlocked)})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#0E4D3B] text-white'
                  : 'bg-[#f4f8f7] text-[#46655c] hover:bg-[#e8f2ef]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isHr && (
          <span className="text-[11px] font-bold text-[#9a5404] bg-[#fff8eb] px-3 py-1.5 rounded-xl border border-[#f5d59c]">
            محدودیت منابع انسانی: اطلاعات مالی و شماره شبا مخفی است
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#f4f9f7] text-[#3d5b52] border-b border-[#dfece8]">
              <tr>
                <th className="py-3 px-4 font-extrabold">متخصص و کد ملی</th>
                <th className="py-3 px-4 font-extrabold">تخصص و شهر</th>
                <th className="py-3 px-4 font-extrabold">رادار آنلاین</th>
                <th className="py-3 px-4 font-extrabold">وضعیت پرونده</th>
                <th className="py-3 px-4 font-extrabold">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4f1]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#68837b] font-bold">
                    متخصصی مطابق این فیلتر یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((sp) => {
                  const st = persianSpecialistStatus(sp.approvalStatus);
                  return (
                    <tr key={sp.phone} className="hover:bg-[#f9fcfb]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0f2922]">{sp.fullName}</span>
                          {sp.isDuplicateNationalCode && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" />
                              کد ملی تکراری
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#5e7a71] mt-0.5 tabular-nums flex items-center gap-2">
                          <span dir="ltr">{toPersianDigits(sp.phone)}</span>
                          {sp.nationalCode && (
                            <>
                              <span>·</span>
                              <span>کد ملی: {toPersianDigits(sp.nationalCode)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1d3931]">{sp.roleTitle}</div>
                        <div className="text-[11px] text-[#607b72]">{sp.serviceCity}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Radio className={`w-3.5 h-3.5 ${sp.isOnlineNow ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className={`font-bold ${sp.isOnlineNow ? 'text-emerald-700' : 'text-[#6c867e]'}`}>
                            {sp.isOnlineNow ? 'آنلاین و آماده پذیرش' : 'آفلاین'}
                          </span>
                        </div>
                        {sp.lastSeenEpoch > 0 && (
                          <div className="text-[10px] text-[#738e86] mt-0.5">
                            آخرین فعالیت: {formatPersianDateTime(sp.lastSeenEpoch)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${st.tone}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDossier(sp)}
                            className="px-3 py-1.5 rounded-lg bg-[#eef7f4] hover:bg-[#dcefe9] text-[#0E4D3B] font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>بررسی پرونده و مدارک</span>
                          </button>
                          {confirmDeletePhone === sp.phone ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDeleteSpecialist(sp.phone, sp.fullName)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                              >
                                تایید حذف
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePhone('')}
                                className="px-2 py-1.5 rounded-lg border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                              >
                                انصراف
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePhone(sp.phone)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف پرونده</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* پنجره بررسی پرونده کامل و مدارک متخصص */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#dceae5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[#e5f0ec] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0f2922]">پرونده متخصص: {selected.fullName}</h3>
                <div className="text-xs text-[#5d7970] mt-0.5 tabular-nums">
                  {toPersianDigits(selected.phone)} · {selected.serviceCity} · کد پرسنلی: {selected.personnelCode}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode((v) => !v)}
                  className="px-3 py-1.5 rounded-xl bg-[#f3f8f6] hover:bg-[#e5f0ec] text-[#0E4D3B] text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editMode ? 'بستن ویرایش' : 'ویرایش اطلاعات'}</span>
                </button>
                <button type="button" onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-[#f2f7f5] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {selected.isDuplicateNationalCode && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>هشدار امنیتی: این کد ملی برای بیش از یک متخصص در سامانه ثبت شده است.</span>
                </div>
              )}

              {editMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f7fbf9] p-4 rounded-2xl border border-[#e3efe9]">
                  <div className="space-y-1">
                    <label className="font-bold text-[#35534a]">نام و نام خانوادگی</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#35534a]">شهر خدمت</label>
                    <input
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#35534a]">رشته تخصصی و مهارت‌ها</label>
                    <input
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white"
                    />
                  </div>
                  {!isHr && (
                    <div className="space-y-1">
                      <label className="font-bold text-[#35534a]">شماره شبا</label>
                      <input
                        value={editShaba}
                        onChange={(e) => setEditShaba(e.target.value)}
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-[#cfe0da] bg-white tabular-nums"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction('EDIT')}
                      className="px-4 py-2 rounded-xl bg-[#0E4D3B] text-white font-bold whitespace-nowrap cursor-pointer"
                    >
                      ذخیره تغییرات پرونده
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f7fbf9] p-4 rounded-2xl border border-[#e3efe9]">
                  <div>
                    <span className="text-[#5f7b72]">کد ملی: </span>
                    <strong className="tabular-nums">{selected.nationalCode ? toPersianDigits(selected.nationalCode) : 'ثبت نشده'}</strong>
                  </div>
                  <div>
                    <span className="text-[#5f7b72]">نام پدر: </span>
                    <strong>{selected.fatherName || 'ثبت نشده'}</strong>
                  </div>
                  <div>
                    <span className="text-[#5f7b72]">تاریخ تولد: </span>
                    <strong className="tabular-nums">{selected.birthDate ? toPersianDigits(selected.birthDate) : 'ثبت نشده'}</strong>
                  </div>
                  <div>
                    <span className="text-[#5f7b72]">تخصص: </span>
                    <strong>{selected.roleTitle}</strong>
                  </div>
                  <div>
                    <span className="text-[#5f7b72]">وضعیت رادار: </span>
                    <strong>{selected.isOnlineNow ? 'آنلاین' : 'آفلاین'}</strong>
                  </div>
                  {!isHr && (
                    <>
                      <div>
                        <span className="text-[#5f7b72]">شماره شبا: </span>
                        <strong className="tabular-nums" dir="ltr">{selected.shabaNumber || 'ثبت نشده'}</strong>
                      </div>
                      <div>
                        <span className="text-[#5f7b72]">کد رهگیری پرداخت: </span>
                        <strong className="tabular-nums">{selected.trackingCode || 'ثبت نشده'}</strong>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-black text-[#0E4D3B] mb-2.5">تصاویر مدارک هویتی و تخصصی</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'عکس پرسنلی', raw: selected.profilePhoto },
                    { label: 'تصویر کارت ملی', raw: selected.nationalCardPhoto },
                    { label: 'تصویر شناسنامه', raw: selected.shenasnamehPhoto },
                    { label: 'مدرک فنی / جواز کسب', raw: selected.skillLicensePhoto }
                  ].map((doc) => {
                    const src = safeImageSrc(doc.raw);
                    return (
                      <div key={doc.label} className="rounded-2xl border border-[#e3efe9] overflow-hidden bg-[#f8fbfa]">
                        <div className="h-28 flex items-center justify-center overflow-hidden bg-[#eef4f2]">
                          {src ? (
                            <img
                              src={src}
                              alt={doc.label}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[11px] text-[#7c968e] font-bold">بارگذاری نشده</span>
                          )}
                        </div>
                        <div className="p-2 text-center text-[11px] font-bold text-[#2b4a41]">{doc.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#e5f0ec]">
                <label className="font-bold text-[#35534a]">دلیل رد پرونده یا مسدودسازی (در صورت اقدام)</label>
                <input
                  type="text"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="مثلاً نقص تصویر کارت ملی یا گزارش تخلف..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe0da] text-xs outline-none focus:border-[#0E4D3B]"
                />
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAction('APPROVED')}
                    className="px-4 py-2 rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تایید نهایی پرونده</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAction('REJECTED')}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رد پرونده</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAction('BLOCKED')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Ban className="w-4 h-4" />
                    <span>مسدودسازی متخصص</span>
                  </button>
                  {confirmDeletePhone === `modal_${selected.phone}` ? (
                    <div className="inline-flex items-center gap-1.5 mr-auto">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteSpecialist(selected.phone, selected.fullName)}
                        className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold whitespace-nowrap cursor-pointer"
                      >
                        تایید و حذف کامل پرونده
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePhone('')}
                        className="px-3 py-2 rounded-xl border border-[#d6e7e2] text-[#44635a] font-bold whitespace-nowrap cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmDeletePhone(`modal_${selected.phone}`)}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer mr-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف کامل پرونده</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
