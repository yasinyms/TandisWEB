import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Plus,
  Save,
  Send,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import {
  type AdminExpertItem,
  type AdminLiveState,
  type AdminRoleCode,
  type AdminSliderItem,
  type AdminTicket,
  type AdminViolation,
  ROLE_OPTIONS,
  deleteNotificationAdmin,
  deleteTicketAdmin,
  deleteViolationAdmin,
  formatPersianDateTime,
  persianAudienceLabel,
  persianViolationStatus,
  replyTicketAdmin,
  safeImageSrc,
  saveExpertAdmin,
  saveSlidersAdmin,
  saveViolationAdmin,
  sendNotificationAdmin
} from '../../services/adminApi';
import { formatToman, toPersianDigits } from '../../services/tandisDefaults';

interface CommsSystemProps {
  data: AdminLiveState;
  globalQuery: string;
  onRefresh: () => Promise<void>;
  onToast: (msg: string) => void;
}

// ==================== ماژول ۱۰: ارسال پیام و اعلان سراسری ====================
export const AdminNotificationsView: React.FC<CommsSystemProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'CUSTOMERS' | 'SPECIALISTS' | 'SINGLE'>('ALL');
  const [targetPhone, setTargetPhone] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const allRecipients = useMemo(() => {
    const items: Array<{ phone: string; name: string; kind: string }> = [];
    const seen = new Set<string>();
    for (const c of data.customers) {
      if (!seen.has(c.phone)) {
        seen.add(c.phone);
        items.push({ phone: c.phone, name: c.fullName, kind: 'مشتری' });
      }
    }
    for (const s of data.specialists) {
      if (!seen.has(s.phone)) {
        seen.add(s.phone);
        items.push({ phone: s.phone, name: s.fullName, kind: 'متخصص' });
      }
    }
    return items;
  }, [data.customers, data.specialists]);

  const filteredRecipients = useMemo(() => {
    const q = recipientFilter.trim().toLowerCase();
    if (!q) return allRecipients.slice(0, 40);
    return allRecipients
      .filter((r) => r.name.toLowerCase().includes(q) || r.phone.includes(q))
      .slice(0, 40);
  }, [allRecipients, recipientFilter]);

  const filteredHistory = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return data.notifications;
    return data.notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.target_phone.includes(q)
    );
  }, [data.notifications, globalQuery]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      onToast('عنوان و متن پیام را کامل وارد کنید.');
      return;
    }
    if (audience === 'SINGLE' && !targetPhone.trim()) {
      onToast('شماره موبایل مخاطب خاص را انتخاب یا وارد کنید.');
      return;
    }
    setSending(true);
    try {
      await sendNotificationAdmin({
        title: title.trim(),
        message: message.trim(),
        target_audience: audience,
        target_phone: audience === 'SINGLE' ? targetPhone.trim() : 'ALL'
      });
      setTitle('');
      setMessage('');
      setTargetPhone('');
      onToast('اعلان با موفقیت ثبت و برای کاربران ارسال شد.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ارسال اعلان');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteNotificationAdmin(id);
      onToast('اعلان از تاریخچه حذف شد.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در حذف اعلان');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* فرم ارسال اعلان جدید */}
      <form
        onSubmit={handleSend}
        className="xl:col-span-5 bg-white rounded-2xl border border-[#dfece8] p-5 space-y-4 h-fit"
      >
        <div className="flex items-center gap-2.5 border-b border-[#edf4f1] pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#0E4D3B]/10 text-[#0E4D3B] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#12292c]">ارسال پیام و اعلان سراسری</h3>
            <p className="text-xs text-[#5d7671]">
              انتشار هم‌زمان در وب‌سایت، اپلیکیشن مشتری و اپلیکیشن همکار
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#1d3b37]">جامعه هدف اعلان</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'ALL', label: 'همه کاربران' },
                { id: 'CUSTOMERS', label: 'فقط مشتریان' },
                { id: 'SPECIALISTS', label: 'فقط متخصصین' },
                { id: 'SINGLE', label: 'کاربر مشخص' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAudience(opt.id)}
                className={`rounded-xl border px-3 py-2 text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                  audience === opt.id
                    ? 'bg-[#0E4D3B] text-white border-[#0E4D3B]'
                    : 'bg-[#f8fbfa] text-[#284540] border-[#dbe8e4] hover:border-[#0E4D3B]/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {audience === 'SINGLE' && (
          <div className="space-y-2.5 rounded-xl bg-[#f6faf8] border border-[#dceae5] p-3">
            <label className="block text-xs font-extrabold text-[#1d3b37]">انتخاب یا جستجوی مخاطب خاص</label>
            <input
              type="text"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              placeholder="جستجو با نام یا شماره موبایل..."
              className="w-full rounded-xl border border-[#d6e5e0] bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D3B]"
            />
            <select
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              className="w-full rounded-xl border border-[#d6e5e0] bg-white px-3 py-2 text-xs font-bold text-[#12292c] focus:outline-none focus:border-[#0E4D3B]"
            >
              <option value="">انتخاب از فهرست کاربران سامانه...</option>
              {filteredRecipients.map((r) => (
                <option key={r.phone} value={r.phone}>
                  {r.name} — {toPersianDigits(r.phone)} ({r.kind})
                </option>
              ))}
            </select>
            <input
              type="tel"
              dir="ltr"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="09123456789"
              className="w-full rounded-xl border border-[#d6e5e0] bg-white px-3 py-2 text-xs text-left tabular-nums focus:outline-none focus:border-[#0E4D3B]"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-[#1d3b37]">عنوان اعلان</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: اطلاعیه مهم تخفیف خدمات فصلی تندیس"
            className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#0E4D3B]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-[#1d3b37]">متن کامل پیام</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="متن پیام اطلاع‌رسانی را اینجا بنویسید..."
            className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3.5 py-2.5 text-xs leading-relaxed focus:outline-none focus:border-[#0E4D3B]"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] disabled:opacity-60 text-white py-2.5 px-4 text-xs font-black flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? 'در حال انتشار اعلان...' : 'انتشار فوری اعلان'}</span>
        </button>
      </form>

      {/* تاریخچه اعلان‌های ارسال‌شده */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-[#dfece8] p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#edf4f1] pb-3">
          <h3 className="text-sm font-black text-[#12292c]">تاریخچه اعلان‌های منتشرشده</h3>
          <span className="text-xs font-extrabold text-[#0E4D3B] bg-[#eef7f4] px-3 py-1 rounded-lg tabular-nums whitespace-nowrap">
            {toPersianDigits(filteredHistory.length)} اعلان
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="rounded-xl bg-[#f7fbfa] border border-dashed border-[#d7e6e1] p-10 text-center text-xs text-[#647d78] font-bold">
            هنوز هیچ اعلانی ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pl-1">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#e3efeb] bg-[#fcfefd] p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-black text-[#12292c]">{item.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#5d7671]">
                      <span className="rounded-md bg-[#eef7f4] text-[#0E4D3B] px-2 py-0.5 whitespace-nowrap">
                        {persianAudienceLabel(item.target_audience, item.target_phone)}
                      </span>
                      <span className="tabular-nums">{formatPersianDateTime(item.created_at_epoch)}</span>
                      {item.sender_role && <span>توسط: {item.sender_role}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 p-1.5 cursor-pointer transition-colors shrink-0"
                    title="حذف اعلان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#2b4541] leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== ماژول ۱۱: تیکت‌ها و پشتیبانی یکپارچه (۳ منبع هم‌زمان) ====================
export const AdminTicketsView: React.FC<CommsSystemProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CUSTOMER' | 'SPECIALIST'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'REPLIED'>('ALL');
  const [selectedId, setSelectedId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const filteredTickets = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    return data.tickets.filter((t) => {
      if (activeTab !== 'ALL' && t.sender_type !== activeTab) return false;
      const isReplied = Boolean(t.admin_reply) || String(t.status || '').toUpperCase() === 'REPLIED';
      if (statusFilter === 'OPEN' && isReplied) return false;
      if (statusFilter === 'REPLIED' && !isReplied) return false;
      if (!q) return true;
      return (
        t.sender_name.toLowerCase().includes(q) ||
        t.sender_phone.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    });
  }, [data.tickets, activeTab, statusFilter, globalQuery]);

  const selectedTicket: AdminTicket | null = useMemo(() => {
    if (!filteredTickets.length) return null;
    return filteredTickets.find((t) => t.id === selectedId) || filteredTickets[0];
  }, [filteredTickets, selectedId]);

  const customerCount = data.tickets.filter((t) => t.sender_type === 'CUSTOMER').length;
  const specialistCount = data.tickets.filter((t) => t.sender_type === 'SPECIALIST').length;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setSending(true);
    try {
      const existingMessages = Array.isArray(selectedTicket.messages) ? selectedTicket.messages : [];
      const nextMessages = [
        ...existingMessages.map((m) => ({ sender: m.sender, text: m.text })),
        { sender: 'ADMIN', text: replyText.trim() }
      ];
      await replyTicketAdmin(selectedTicket.id, {
        admin_reply: replyText.trim(),
        messages: nextMessages,
        sender_phone: selectedTicket.sender_phone,
        sender_name: selectedTicket.sender_name,
        subject: selectedTicket.subject,
        message: selectedTicket.message
      });
      setReplyText('');
      onToast('پاسخ کارشناس ثبت شد و به‌صورت هم‌زمان در پنل مشتری، همکار و مدیریت همگام‌سازی گردید.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ارسال پاسخ تیکت');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    setDeletingId(ticketId);
    try {
      await deleteTicketAdmin(ticketId);
      onToast('تیکت پشتیبانی با موفقیت از سامانه حذف شد.');
      setConfirmDeleteId('');
      if (selectedId === ticketId) setSelectedId('');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در حذف تیکت');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#dfece8] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#0E4D3B] text-white'
                : 'bg-[#f4f9f7] text-[#284540] hover:bg-[#e8f3ef]'
            }`}
          >
            همه تیکت‌ها ({toPersianDigits(data.tickets.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CUSTOMER')}
            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
              activeTab === 'CUSTOMER'
                ? 'bg-[#0E4D3B] text-white'
                : 'bg-[#f4f9f7] text-[#284540] hover:bg-[#e8f3ef]'
            }`}
          >
            تیکت مشتریان ({toPersianDigits(customerCount)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SPECIALIST')}
            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
              activeTab === 'SPECIALIST'
                ? 'bg-[#0E4D3B] text-white'
                : 'bg-[#f4f9f7] text-[#284540] hover:bg-[#e8f3ef]'
            }`}
          >
            تیکت متخصصین و همکاران ({toPersianDigits(specialistCount)})
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'ALL', label: 'همه وضعیت‌ها' },
              { id: 'OPEN', label: 'در انتظار پاسخ' },
              { id: 'REPLIED', label: 'پاسخ داده‌شده' }
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold whitespace-nowrap cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#D97706] text-white'
                  : 'bg-[#f6faf8] text-[#4c6762] hover:bg-[#ebf4f0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* فهرست تیکت‌ها */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#dfece8] p-3 space-y-2 max-h-[620px] overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#647d78] font-bold">
              تیکتی با این فیلتر یافت نشد.
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const isReplied = Boolean(t.admin_reply) || String(t.status || '').toUpperCase() === 'REPLIED';
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-right rounded-xl border p-3.5 space-y-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#eef7f4] border-[#0E4D3B]'
                      : 'bg-[#fcfefd] border-[#e6f0ed] hover:border-[#0E4D3B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#12292c] truncate">{t.subject || 'درخواست پشتیبانی'}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border whitespace-nowrap ${
                        isReplied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isReplied ? 'پاسخ داده‌شده' : 'در انتظار پاسخ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#5d7671]">
                    <span className="truncate">
                      {t.sender_name || 'کاربر تندیس'} ({t.sender_type === 'SPECIALIST' ? 'متخصص' : 'مشتری'})
                    </span>
                    <span className="tabular-nums">{toPersianDigits(t.sender_phone)}</span>
                  </div>
                  <p className="text-[11px] text-[#45605b] line-clamp-2">{t.message}</p>
                </button>
              );
            })
          )}
        </div>

        {/* پنجره گفتگو و ارسال پاسخ */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#dfece8] p-5 flex flex-col justify-between min-h-[520px]">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-[#647d78] font-bold gap-2">
              <MessageSquare className="w-8 h-8 text-[#9bb3ad]" />
              <span>یک تیکت را از فهرست سمت راست انتخاب کنید.</span>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf4f1] pb-3">
                  <div>
                    <h3 className="text-sm font-black text-[#12292c]">{selectedTicket.subject}</h3>
                    <div className="text-xs text-[#5d7671] font-bold mt-0.5 tabular-nums">
                      {selectedTicket.sender_name} · {toPersianDigits(selectedTicket.sender_phone)} ·{' '}
                      {selectedTicket.sender_type === 'SPECIALIST' ? 'پنل همکار و متخصص' : 'اپلیکیشن و وب‌سایت مشتری'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#647d78] tabular-nums">
                      {formatPersianDateTime(selectedTicket.created_at_epoch)}
                    </span>
                    {confirmDeleteId === selectedTicket.id ? (
                      <div className="inline-flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          disabled={deletingId === selectedTicket.id}
                          onClick={() => handleDeleteTicket(selectedTicket.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold whitespace-nowrap cursor-pointer"
                        >
                          {deletingId === selectedTicket.id ? 'حذف...' : 'تایید حذف'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId('')}
                          className="px-2 py-1 rounded-lg border border-[#d6e5e0] text-[#4c6762] font-bold whitespace-nowrap cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(selectedTicket.id)}
                        className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف تیکت</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* رشته پیام‌ها */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pl-1">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((m, idx) => {
                      const isAdmin = String(m.sender || '').toUpperCase() === 'ADMIN';
                      return (
                        <div
                          key={idx}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-[#0E4D3B] text-white rounded-tl-sm'
                                : 'bg-[#f3f8f6] text-[#12292c] border border-[#dceae5] rounded-tr-sm'
                            }`}
                          >
                            <div className={`text-[10px] font-extrabold mb-1 ${isAdmin ? 'text-emerald-200' : 'text-[#5d7671]'}`}>
                              {isAdmin ? 'پاسخ کارشناس پشتیبانی تندیس' : selectedTicket.sender_name}
                            </div>
                            <p className="whitespace-pre-wrap">{m.text}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#f3f8f6] text-[#12292c] border border-[#dceae5] px-4 py-3 text-xs leading-relaxed">
                          <div className="text-[10px] font-extrabold text-[#5d7671] mb-1">
                            {selectedTicket.sender_name}
                          </div>
                          <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                        </div>
                      </div>
                      {selectedTicket.admin_reply && (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#0E4D3B] text-white px-4 py-3 text-xs leading-relaxed">
                            <div className="text-[10px] font-extrabold text-emerald-200 mb-1">
                              پاسخ کارشناس پشتیبانی تندیس
                            </div>
                            <p className="whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleSendReply} className="pt-4 border-t border-[#edf4f1] space-y-2.5 mt-4">
                <label className="block text-xs font-extrabold text-[#1d3b37]">پاسخ رسمی پشتیبانی</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="پاسخ خود را بنویسید... این پاسخ به‌طور هم‌زمان در پنل مشتری و همکار نمایش داده می‌شود."
                  className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#0E4D3B]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] disabled:opacity-60 text-white px-5 py-2.5 text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'در حال ثبت پاسخ...' : 'ارسال و همگام‌سازی پاسخ'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ماژول ۱۲: مدیریت اسلایدرهای اصلی و بنر دسته‌بندی‌ها ====================
export const AdminSlidersView: React.FC<CommsSystemProps> = ({ data, onRefresh, onToast }) => {
  const [subTab, setSubTab] = useState<'HOME' | 'CATEGORY'>('HOME');
  const [homeDraft, setHomeDraft] = useState<AdminSliderItem[]>(() => data.homeSliders || []);
  const [catDraft, setCatDraft] = useState<Record<string, AdminSliderItem[]>>(
    () => data.categorySliders || {}
  );
  const [selectedSlug, setSelectedSlug] = useState<string>(
    () => data.categories[0]?.slug || 'cat-technical-repairs'
  );
  const [saving, setSaving] = useState(false);

  // فرم افزودن اسلاید جدید
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCtaLabel, setNewCtaLabel] = useState('ثبت درخواست');

  useEffect(() => {
    if (data.homeSliders.length > 0 && homeDraft.length === 0) {
      setHomeDraft(data.homeSliders);
    }
  }, [data.homeSliders, homeDraft.length]);

  useEffect(() => {
    if (Object.keys(data.categorySliders || {}).length > 0 && Object.keys(catDraft).length === 0) {
      setCatDraft(data.categorySliders);
    }
  }, [data.categorySliders, catDraft]);

  const handleAddHomeSlide = () => {
    if (homeDraft.length >= 5) {
      onToast('حداکثر ۵ اسلاید برای صفحه اصلی مجاز است.');
      return;
    }
    if (!newTitle.trim()) {
      onToast('عنوان اسلاید را وارد کنید.');
      return;
    }
    setHomeDraft((prev) => [
      ...prev,
      {
        id: `slide_${Date.now()}`,
        title: newTitle.trim(),
        subtitle: newSubtitle.trim(),
        badge: newBadge.trim() || 'پیشنهاد ویژه تندیس',
        image_url: newImageUrl.trim(),
        cta_label: newCtaLabel.trim() || 'مشاهده'
      }
    ]);
    setNewTitle('');
    setNewSubtitle('');
    setNewBadge('');
    setNewImageUrl('');
  };

  const handleAddCategorySlide = () => {
    if (!selectedSlug) return;
    if (!newTitle.trim()) {
      onToast('عنوان بنر دسته‌بندی را وارد کنید.');
      return;
    }
    setCatDraft((prev) => {
      const current = prev[selectedSlug] || [];
      return {
        ...prev,
        [selectedSlug]: [
          ...current,
          {
            id: `cat_slide_${Date.now()}`,
            title: newTitle.trim(),
            subtitle: newSubtitle.trim(),
            badge: newBadge.trim() || 'خدمات تخصصی',
            image_url: newImageUrl.trim(),
            cta_label: newCtaLabel.trim() || 'ثبت سفارش',
            target_slug: selectedSlug
          }
        ]
      };
    });
    setNewTitle('');
    setNewSubtitle('');
    setNewBadge('');
    setNewImageUrl('');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await saveSlidersAdmin({
        homeSliders: homeDraft.slice(0, 5),
        categorySliders: catDraft
      });
      onToast('اسلایدرها و بنرهای تبلیغاتی با موفقیت ذخیره و منتشر شدند.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ذخیره اسلایدرها');
    } finally {
      setSaving(false);
    }
  };

  const activeCategoryBanners = catDraft[selectedSlug] || [];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#dfece8] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('HOME')}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
              subTab === 'HOME'
                ? 'bg-[#0E4D3B] text-white'
                : 'bg-[#f4f9f7] text-[#284540] hover:bg-[#e8f3ef]'
            }`}
          >
            اسلایدر صفحه اصلی ({toPersianDigits(homeDraft.length)} از ۵)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('CATEGORY')}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
              subTab === 'CATEGORY'
                ? 'bg-[#0E4D3B] text-white'
                : 'bg-[#f4f9f7] text-[#284540] hover:bg-[#e8f3ef]'
            }`}
          >
            بنر اختصاصی دسته‌بندی‌ها
          </button>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          className="rounded-xl bg-[#D97706] hover:bg-[#b45309] disabled:opacity-60 text-white px-5 py-2 text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'در حال انتشار...' : 'ذخیره و انتشار زنده تغییرات'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* فرم افزودن بنر */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-[#dfece8] p-5 space-y-3.5 h-fit">
          <div className="flex items-center gap-2 border-b border-[#edf4f1] pb-3">
            <ImageIcon className="w-4 h-4 text-[#0E4D3B]" />
            <h3 className="text-sm font-black text-[#12292c]">
              {subTab === 'HOME' ? 'افزودن اسلاید صفحه اصلی' : 'افزودن بنر به دسته‌بندی'}
            </h3>
          </div>

          {subTab === 'CATEGORY' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">انتخاب دسته‌بندی</label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0E4D3B]"
              >
                {data.categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1d3b37]">عنوان اصلی</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثلاً: سرویس ویژه کولر با ضمانت ۶ ماهه"
              className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0E4D3B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1d3b37]">توضیح کوتاه</label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="اعزام فوری متخصصان تاییدشده در سراسر شهر"
              className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D3B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">برچسب کوتاه</label>
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="جشنواره فصلی"
                className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D3B]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">متن دکمه</label>
              <input
                type="text"
                value={newCtaLabel}
                onChange={(e) => setNewCtaLabel(e.target.value)}
                placeholder="ثبت درخواست"
                className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D3B]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1d3b37]">نشانی اینترنتی تصویر بنر (اختیاری)</label>
            <input
              type="url"
              dir="ltr"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs text-left focus:outline-none focus:border-[#0E4D3B]"
            />
          </div>

          <button
            type="button"
            onClick={subTab === 'HOME' ? handleAddHomeSlide : handleAddCategorySlide}
            className="w-full rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white py-2.5 text-xs font-black flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن به فهرست پیش‌نویس</span>
          </button>
        </div>

        {/* پیش‌نمایش و مدیریت اسلایدهای موجود */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-[#dfece8] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#edf4f1] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0E4D3B]" />
              <h3 className="text-sm font-black text-[#12292c]">
                {subTab === 'HOME'
                  ? 'اسلایدهای فعال صفحه اصلی'
                  : `بنرهای دسته‌بندی: ${data.categories.find((c) => c.slug === selectedSlug)?.title || 'انتخاب‌شده'}`}
              </h3>
            </div>
          </div>

          {(subTab === 'HOME' ? homeDraft : activeCategoryBanners).length === 0 ? (
            <div className="rounded-xl bg-[#f7fbfa] border border-dashed border-[#d7e6e1] p-10 text-center text-xs text-[#647d78] font-bold">
              هنوز اسلایدی در این بخش ثبت نشده است. از فرم کنار صفحه یک بنر جدید اضافه کنید.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(subTab === 'HOME' ? homeDraft : activeCategoryBanners).map((slide, idx) => {
                const imgSrc = safeImageSrc(slide.image_url);
                return (
                  <div
                    key={slide.id || idx}
                    className="rounded-2xl border border-[#dfece8] overflow-hidden bg-[#fcfefd] flex flex-col justify-between"
                  >
                    <div className="relative h-32 bg-gradient-to-l from-[#0E4D3B] to-[#146C53] p-4 flex flex-col justify-between text-white">
                      {imgSrc && (
                        <img
                          src={imgSrc}
                          alt={slide.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-35"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="rounded-md bg-[#D97706] text-white px-2.5 py-0.5 text-[10px] font-black whitespace-nowrap">
                          {slide.badge || 'تندیس'}
                        </span>
                        <span className="text-[11px] font-black tabular-nums bg-black/25 px-2 py-0.5 rounded-md">
                          اسلاید {toPersianDigits(idx + 1)}
                        </span>
                      </div>
                      <div className="relative z-10">
                        <div className="text-sm font-black truncate">{slide.title}</div>
                        {slide.subtitle && (
                          <div className="text-[11px] text-white/85 truncate mt-0.5">{slide.subtitle}</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-[#0E4D3B]">
                        دکمه: {slide.cta_label || 'مشاهده'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (subTab === 'HOME') {
                            setHomeDraft((prev) => prev.filter((_, i) => i !== idx));
                          } else {
                            setCatDraft((prev) => ({
                              ...prev,
                              [selectedSlug]: (prev[selectedSlug] || []).filter((_, i) => i !== idx)
                            }));
                          }
                        }}
                        className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ماژول ۱۳: شکایات، بازرسی و تخلفات متخصصین ====================
export const AdminViolationsView: React.FC<CommsSystemProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminViolation | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  // فرم ثبت پرونده تخلف جدید
  const [specPhone, setSpecPhone] = useState('');
  const [specName, setSpecName] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [fineToman, setFineToman] = useState('0');
  const [inspectionNote, setInspectionNote] = useState('');

  const filtered = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    return data.violations.filter((v) => {
      if (statusFilter !== 'ALL' && String(v.status || '').toUpperCase() !== statusFilter) return false;
      if (!q) return true;
      return (
        v.specialist_name.toLowerCase().includes(q) ||
        v.specialist_phone.includes(q) ||
        v.subject.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    });
  }, [data.violations, statusFilter, globalQuery]);

  const openEditModal = (v: AdminViolation) => {
    setEditingItem(v);
    setSpecPhone(v.specialist_phone);
    setSpecName(v.specialist_name);
    setReporterName(v.reporter_name);
    setReporterPhone(v.reporter_phone);
    setSubject(v.subject);
    setDescription(v.description);
    setStatus(v.status || 'UNDER_REVIEW');
    setFineToman(String(v.fine_toman || 0));
    setInspectionNote(v.inspection_note || '');
  };

  const openNewModal = () => {
    setEditingItem(null);
    setSpecPhone('');
    setSpecName('');
    setReporterName('');
    setReporterPhone('');
    setSubject('');
    setDescription('');
    setStatus('UNDER_REVIEW');
    setFineToman('0');
    setInspectionNote('');
    setShowCreateModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specPhone.trim() || !subject.trim()) {
      onToast('شماره متخصص و موضوع تخلف الزامی است.');
      return;
    }
    setSaving(true);
    try {
      await saveViolationAdmin({
        id: editingItem?.id,
        specialist_phone: specPhone.trim(),
        specialist_name: specName.trim() || 'متخصص تندیس',
        reporter_phone: reporterPhone.trim(),
        reporter_name: reporterName.trim() || 'گزارش مشتری / بازرسی',
        subject: subject.trim(),
        description: description.trim(),
        status,
        fine_toman: Number(fineToman) || 0,
        inspection_note: inspectionNote.trim(),
        created_at_epoch: editingItem?.created_at_epoch
      });
      setShowCreateModal(false);
      setEditingItem(null);
      onToast('پرونده بازرسی و تخلف با موفقیت ذخیره شد.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ثبت پرونده تخلف');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteViolation = async (violationId: string) => {
    setDeletingId(violationId);
    try {
      await deleteViolationAdmin(violationId);
      onToast('پرونده تخلف با موفقیت حذف شد.');
      setConfirmDeleteId('');
      if (editingItem?.id === violationId) {
        setEditingItem(null);
        setShowCreateModal(false);
      }
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در حذف پرونده تخلف');
    } finally {
      setDeletingId('');
    }
  };

  const modalOpen = showCreateModal || Boolean(editingItem);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#dfece8] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'همه پرونده‌ها' },
            { id: 'UNDER_REVIEW', label: 'در حال بررسی' },
            { id: 'WARNING_ISSUED', label: 'اخطار ثبت‌شده' },
            { id: 'FINED', label: 'جریمه نقدی' },
            { id: 'SPECIALIST_BLOCKED', label: 'مسدودسازی متخصص' },
            { id: 'CLOSED', label: 'مختومه' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#0E4D3B] text-white'
                  : 'bg-[#f4f9f7] text-[#284540] hover:bg-[#e8f3ef]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white px-4 py-2 text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت پرونده تخلف یا شکایت جدید</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#647d78] font-bold">
            پرونده تخلفی در این وضعیت ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f4f9f7] text-[#35524d] border-b border-[#dfece8]">
                <tr>
                  <th className="py-3 px-4 font-black whitespace-nowrap">متخصص مربوطه</th>
                  <th className="py-3 px-4 font-black whitespace-nowrap">موضوع شکایت / تخلف</th>
                  <th className="py-3 px-4 font-black whitespace-nowrap">گزارش‌دهنده</th>
                  <th className="py-3 px-4 font-black whitespace-nowrap">جریمه نقدی</th>
                  <th className="py-3 px-4 font-black whitespace-nowrap">وضعیت رسیدگی</th>
                  <th className="py-3 px-4 font-black whitespace-nowrap">تاریخ ثبت</th>
                  <th className="py-3 px-4 font-black whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf4f1]">
                {filtered.map((v) => {
                  const badge = persianViolationStatus(v.status);
                  return (
                    <tr key={v.id} className="hover:bg-[#f9fcfb]">
                      <td className="py-3 px-4">
                        <div className="font-black text-[#12292c]">{v.specialist_name}</div>
                        <div className="text-[11px] text-[#5d7671] tabular-nums">
                          {toPersianDigits(v.specialist_phone)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-extrabold text-[#12292c]">{v.subject}</div>
                        {v.description && (
                          <div className="text-[11px] text-[#5d7671] line-clamp-1 mt-0.5">{v.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#2b4541]">{v.reporter_name || 'واحد بازرسی'}</div>
                        {v.reporter_phone && (
                          <div className="text-[11px] text-[#5d7671] tabular-nums">
                            {toPersianDigits(v.reporter_phone)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-black tabular-nums text-rose-700 whitespace-nowrap">
                        {v.fine_toman > 0 ? formatToman(v.fine_toman) : 'بدون جریمه'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap ${badge.tone}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#5d7671] tabular-nums whitespace-nowrap">
                        {formatPersianDateTime(v.created_at_epoch)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(v)}
                            className="rounded-lg border border-[#0E4D3B]/30 text-[#0E4D3B] hover:bg-[#eef7f4] px-3 py-1.5 text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>رسیدگی و ویرایش</span>
                          </button>
                          {confirmDeleteId === v.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={deletingId === v.id}
                                onClick={() => handleDeleteViolation(v.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold whitespace-nowrap cursor-pointer"
                              >
                                {deletingId === v.id ? 'حذف...' : 'تایید حذف'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId('')}
                                className="px-2 py-1.5 rounded-lg border border-[#d6e5e0] text-[#4c6762] text-[11px] font-bold whitespace-nowrap cursor-pointer"
                              >
                                انصراف
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(v.id)}
                              className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف پرونده</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* پنجره ثبت / رسیدگی پرونده تخلف */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-[#dfece8] w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#edf4f1] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-sm font-black text-[#12292c]">
                  {editingItem ? 'رسیدگی و به‌روزرسانی پرونده تخلف' : 'ثبت پرونده تخلف یا شکایت جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[#f1f6f4] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!editingItem && (
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#1d3b37]">انتخاب سریع متخصص</label>
                <select
                  value={specPhone}
                  onChange={(e) => {
                    const p = e.target.value;
                    setSpecPhone(p);
                    const found = data.specialists.find((s) => s.phone === p);
                    if (found) setSpecName(found.fullName);
                  }}
                  className="w-full rounded-xl border border-[#d6e5e0] bg-[#fcfefd] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0E4D3B]"
                >
                  <option value="">انتخاب متخصص از فهرست...</option>
                  {data.specialists.map((s) => (
                    <option key={s.phone} value={s.phone}>
                      {s.fullName} — {toPersianDigits(s.phone)} ({s.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1d3b37]">نام متخصص</label>
                <input
                  type="text"
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1d3b37]">شماره موبایل متخصص</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={specPhone}
                  onChange={(e) => setSpecPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs text-left tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1d3b37]">نام گزارش‌دهنده</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="مشتری یا واحد بازرسی"
                  className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1d3b37]">موبایل گزارش‌دهنده</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs text-left tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1d3b37]">موضوع شکایت / تخلف</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً: دریافت وجه خارج از فاکتور رسمی"
                className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1d3b37]">شرح کامل گزارش</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1d3b37]">وضعیت تصمیم بازرسی</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs font-bold"
                >
                  <option value="UNDER_REVIEW">در حال بررسی</option>
                  <option value="WARNING_ISSUED">اخطار ثبت‌شده</option>
                  <option value="FINED">جریمه نقدی</option>
                  <option value="SPECIALIST_BLOCKED">مسدودسازی متخصص</option>
                  <option value="CLOSED">مختومه</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1d3b37]">مبلغ جریمه (تومان)</label>
                <input
                  type="number"
                  min={0}
                  dir="ltr"
                  value={fineToman}
                  onChange={(e) => setFineToman(e.target.value)}
                  className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs text-left tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1d3b37]">یادداشت کارشناس بازرسی</label>
              <textarea
                rows={2}
                value={inspectionNote}
                onChange={(e) => setInspectionNote(e.target.value)}
                placeholder="نتیجه تماس با مشتری و تصمیم نهایی..."
                className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#edf4f1]">
              {editingItem && (
                confirmDeleteId === `modal_${editingItem.id}` ? (
                  <div className="inline-flex items-center gap-1.5 mr-auto">
                    <button
                      type="button"
                      disabled={deletingId === editingItem.id}
                      onClick={() => handleDeleteViolation(editingItem.id)}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      تایید و حذف پرونده
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId('')}
                      className="rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs font-bold text-[#3c5752] cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(`modal_${editingItem.id}`)}
                    className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer mr-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف پرونده</span>
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                }}
                className="rounded-xl border border-[#d6e5e0] px-4 py-2 text-xs font-extrabold text-[#3c5752] cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white px-5 py-2 text-xs font-black cursor-pointer"
              >
                {saving ? 'در حال ذخیره...' : 'ثبت و ذخیره پرونده'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ==================== ماژول ۱۴: مدیریت کارشناسان و سطوح دسترسی ====================
export const AdminExpertsView: React.FC<CommsSystemProps> = ({
  data,
  globalQuery,
  onRefresh,
  onToast
}) => {
  const [modalMode, setModalMode] = useState<'NONE' | 'CREATE' | 'EDIT'>('NONE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRoleCode>('SUPPORT_EXPERT');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AdminExpertItem | null>(null);

  const filtered = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return data.experts;
    return data.experts.filter(
      (ex) =>
        ex.display_name.toLowerCase().includes(q) ||
        ex.username.toLowerCase().includes(q) ||
        ex.role_title.toLowerCase().includes(q)
    );
  }, [data.experts, globalQuery]);

  const openCreate = () => {
    setModalMode('CREATE');
    setUsername('');
    setPassword('');
    setDisplayName('');
    setRole('SUPPORT_EXPERT');
    setIsActive(true);
  };

  const openEdit = (ex: AdminExpertItem) => {
    setModalMode('EDIT');
    setUsername(ex.username);
    setPassword('');
    setDisplayName(ex.display_name);
    setRole(ex.role);
    setIsActive(ex.is_active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      onToast('نام کاربری و نام نمایشی کارشناس الزامی است.');
      return;
    }
    if (modalMode === 'CREATE' && password.trim().length < 4) {
      onToast('برای ایجاد حساب جدید، رمز عبور حداقل ۴ کاراکتر وارد کنید.');
      return;
    }
    setSaving(true);
    try {
      await saveExpertAdmin({
        mode: 'upsert',
        username: username.trim(),
        password: password.trim() || undefined,
        display_name: displayName.trim(),
        role,
        is_active: isActive
      });
      setModalMode('NONE');
      onToast('حساب کارشناس ذخیره شد و با اپلیکیشن مدیریت همگام‌سازی گردید.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در ذخیره حساب کارشناس');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;
    setSaving(true);
    try {
      await saveExpertAdmin({
        mode: 'delete',
        username: confirmDeleteUser.username
      });
      setConfirmDeleteUser(null);
      onToast('حساب کارشناس با موفقیت حذف شد.');
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'خطا در حذف حساب کارشناس');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#dfece8] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0E4D3B]/10 text-[#0E4D3B] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#12292c]">مدیریت کارشناسان و ماتریس دسترسی</h3>
            <p className="text-xs text-[#5d7671]">
              حساب‌های مدیر ارشد و مدیر عامل محافظت‌شده هستند و قابل حذف نیستند.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white px-4 py-2 text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>افزودن کارشناس جدید</span>
        </button>
      </div>

      {/* راهنمای ۷ سطح دسترسی */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {ROLE_OPTIONS.map((r) => (
          <div key={r.code} className="bg-white rounded-xl border border-[#e3efeb] p-3.5 space-y-1">
            <div className="text-xs font-black text-[#0E4D3B]">{r.title}</div>
            <p className="text-[11px] text-[#5d7671] leading-relaxed">{r.summary}</p>
          </div>
        ))}
      </div>

      {/* جدول کارشناسان */}
      <div className="bg-white rounded-2xl border border-[#dfece8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#f4f9f7] text-[#35524d] border-b border-[#dfece8]">
              <tr>
                <th className="py-3 px-4 font-black whitespace-nowrap">نام و سمت نمایشی</th>
                <th className="py-3 px-4 font-black whitespace-nowrap">نام کاربری ورود</th>
                <th className="py-3 px-4 font-black whitespace-nowrap">نقش و سطح دسترسی</th>
                <th className="py-3 px-4 font-black whitespace-nowrap">وضعیت حساب</th>
                <th className="py-3 px-4 font-black whitespace-nowrap">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4f1]">
              {filtered.map((ex) => (
                <tr key={ex.username} className="hover:bg-[#f9fcfb]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#12292c]">{ex.display_name}</span>
                      {ex.is_protected && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap">
                          <ShieldCheck className="w-3 h-3" />
                          حساب ارشد محافظت‌شده
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#35524d] tabular-nums" dir="ltr">
                    {ex.username}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-[#eef7f4] text-[#0E4D3B] px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap">
                      {ex.role_title}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap ${
                        ex.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {ex.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(ex)}
                        className="rounded-lg border border-[#0E4D3B]/30 text-[#0E4D3B] hover:bg-[#eef7f4] px-3 py-1.5 text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>
                      {!ex.is_protected && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteUser(ex)}
                          className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* پنجره افزودن / ویرایش کارشناس */}
      {modalMode !== 'NONE' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-[#dfece8] w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#edf4f1] pb-3">
              <h3 className="text-sm font-black text-[#12292c]">
                {modalMode === 'CREATE' ? 'تعریف کارشناس جدید' : 'ویرایش اطلاعات و دسترسی کارشناس'}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="p-1.5 rounded-lg hover:bg-[#f1f6f4] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">نام و عنوان نمایشی</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="مثلاً: سارا محمدی (کارشناس پشتیبانی)"
                className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">نام کاربری ورود</label>
              <input
                type="text"
                dir="ltr"
                disabled={modalMode === 'EDIT'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثلاً: support_01"
                className="w-full rounded-xl border border-[#d6e5e0] disabled:bg-[#f2f6f5] px-3 py-2 text-xs text-left font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">
                {modalMode === 'CREATE' ? 'رمز عبور ورود' : 'رمز عبور جدید (در صورت عدم تغییر خالی بگذارید)'}
              </label>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۴ کاراکتر"
                className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs text-left"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1d3b37]">نقش و سطح دسترسی</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRoleCode)}
                className="w-full rounded-xl border border-[#d6e5e0] px-3 py-2 text-xs font-bold"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.title} — {opt.summary}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-bold text-[#1d3b37] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#0E4D3B]"
              />
              <span>حساب کارشناس فعال باشد</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#edf4f1]">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="rounded-xl border border-[#d6e5e0] px-4 py-2 text-xs font-extrabold text-[#3c5752] cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#0E4D3B] hover:bg-[#146C53] text-white px-5 py-2 text-xs font-black cursor-pointer"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* پنجره تایید حذف کارشناس */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#dfece8] w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-[#12292c]">حذف حساب کارشناس</h3>
            <p className="text-xs text-[#4b6560] leading-relaxed">
              آیا از حذف حساب «{confirmDeleteUser.display_name}» مطمئن هستید؟ دسترسی این کارشناس بلافاصله لغو خواهد شد.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="rounded-xl border border-[#d6e5e0] px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-black cursor-pointer"
              >
                {saving ? 'در حال حذف...' : 'تایید و حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
