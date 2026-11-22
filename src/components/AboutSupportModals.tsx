import React, { useState } from 'react';
import {
  CheckCircle2,
  Headphones,
  Info,
  MapPin,
  MessageSquarePlus,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  X
} from 'lucide-react';
import { formatToman, toPersianDigits, toPurePersianText } from '../services/tandisDefaults';
import type { ServiceRequestItem, SupportTicket } from '../types/tandis';

export const AboutTandisView: React.FC<{
  dark: boolean;
  supportPhone: string;
  otaVersionLabel: string;
}> = ({ dark, supportPhone, otaVersionLabel }) => {
  const [enamadLoaded, setEnamadLoaded] = useState(false);
  const cardCls = dark
    ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]'
    : 'bg-white border-[#E2EFEF] text-[#0F2926]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className={`rounded-3xl border p-6 shadow-sm ${cardCls}`}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img
            src="/logo.png"
            alt="نشان وب‌سایت جامع تندیس"
            className="w-24 h-24 rounded-2xl object-contain bg-white p-2 border border-[#E2EFEF]"
          />
          <div className="text-center sm:text-right space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#065A52] dark:text-[#14B8A6]">
              <Sparkles className="w-3.5 h-3.5" />
              وب‌سایت جامع تندیس — نسخه همگام ({toPurePersianText(otaVersionLabel) || toPersianDigits('۲.۷.۰')})
            </div>
            <h2 className="text-2xl font-black">درباره وب‌سایت و سامانه خدمات تندیس</h2>
            <p className={`text-sm leading-7 ${mutedCls}`}>
              تندیس سامانه هوشمند درخواست خدمات تخصصی در محل، رزرو آنلاین نوبت زیبایی بانوان، فروشگاه قطعات اصلی، خدمات حقوقی و پزشکی و تسهیلات اعتباری تندیس‌پی است که به‌صورت هم‌زمان با پنل همکاران و سامانه مدیریت مرکزی همگام‌سازی می‌شود.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <ShieldCheck className="w-6 h-6 text-[#065A52] dark:text-[#14B8A6]" />
            نماد اعتماد الکترونیکی و مجوزهای رسمی
          </div>
          <p className={`text-sm leading-7 ${mutedCls}`}>
            تمامی پرداخت‌های آنلاین، خرید قطعات و رزرو خدمات در وب‌سایت تندیس با نظارت قانونی و تحت پوشش نشان اعتماد الکترونیکی انجام می‌شود. برای استعلام اصالت، روی نشان رسمی کلیک کنید.
          </p>
          <div className="relative flex items-center justify-center p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E2D40] border border-[#E2EFEF] dark:border-[#26384E]">
            <a
              referrerPolicy="origin"
              target="_blank"
              href="https://trustseal.enamad.ir/?id=8499335&Code=8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e"
              className="inline-flex flex-col items-center gap-2 hover:scale-[1.03] transition-transform"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                {!enamadLoaded && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white border border-[#d6ebeb] text-[#0b5c60]">
                    <ShieldCheck className="w-8 h-8 text-[#0a8387]" />
                    <span className="text-[11px] font-bold">اینماد رسمی</span>
                  </div>
                )}
                <img
                  referrerPolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=8499335&Code=8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e"
                  alt=""
                  style={{ cursor: 'pointer' }}
                  onLoad={(e) => {
                    if (e.currentTarget.naturalWidth > 0) setEnamadLoaded(true);
                  }}
                  className={`relative z-10 w-28 h-28 object-contain ${enamadLoaded ? 'opacity-100' : 'opacity-0'}`}
                  {...({ code: '8FAu9BYMaRPCfgWkopmhdsgllvUtAL0e' } as Record<string, string>)}
                />
              </div>
              <span className="text-xs font-bold text-[#065A52] dark:text-[#14B8A6]">
                استعلام نشان اعتماد (شناسه {toPersianDigits('8499335')})
              </span>
            </a>
          </div>
        </div>

        <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <Info className="w-6 h-6 text-[#F59E0B]" />
            تماس با ما و پشتیبانی شبانه‌روزی
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
              <Phone className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
              <div>
                <div className={`text-xs ${mutedCls}`}>شماره پشتیبانی شبانه‌روزی (۲۴ ساعته)</div>
                <a href={`tel:${supportPhone}`} className="font-extrabold tabular-nums">
                  {toPersianDigits(supportPhone)}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
              <MapPin className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
              <div>
                <div className={`text-xs ${mutedCls}`}>گستره پوشش جغرافیایی</div>
                <div className="font-bold">تمامی {toPersianDigits(31)} استان و بیش از {toPersianDigits(350)} شهرستان کشور</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <div className="font-semibold">همگام‌سازی خودکار ۶ ثانیه‌ای با سامانه مدیریت و همکاران</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SupportTicketsModal: React.FC<{
  open: boolean;
  dark: boolean;
  tickets: SupportTicket[];
  onClose: () => void;
  onSubmitTicket: (subject: string, message: string) => Promise<void>;
}> = ({ open, dark, tickets, onClose, onSubmitTicket }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${panelCls}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EFEF] dark:border-[#26384E]">
          <div className="flex items-center gap-2 font-black text-lg">
            <Headphones className="w-5 h-5 text-[#10B981]" />
            پشتیبانی برخط ۲۴ ساعته تندیس
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 cursor-pointer" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-3">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع پیام یا تیکت..."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="متن پیام شما مستقیم به پنل مدیریت تندیس ارسال می‌شود..."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <button
              disabled={sending || !subject.trim() || !message.trim()}
              onClick={async () => {
                setSending(true);
                try {
                  await onSubmitTicket(subject.trim(), message.trim());
                  setSubject('');
                  setMessage('');
                } finally {
                  setSending(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3 font-extrabold text-sm cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {sending ? 'در حال ارسال به سرور...' : 'ارسال تیکت جدید'}
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold opacity-75">تیکت‌های ثبت‌شده شما ({toPersianDigits(tickets.length)})</div>
            {tickets.length === 0 ? (
              <div className="text-center py-6 text-xs opacity-60">هنوز تیکتی ثبت نشده است.</div>
            ) : (
              tickets.map((t, idx) => (
                <div key={t.id || t.ticket_id || idx} className="p-3.5 rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm">{t.subject}</span>
                    <span className="text-[11px] text-[#10B981] font-black">
                      {t.status === 'RESOLVED' ? 'پاسخ داده‌شده' : 'در حال بررسی'}
                    </span>
                  </div>
                  {t.messages && t.messages.length > 0 && (
                    <p className="text-xs opacity-80 leading-5">
                      {t.messages[t.messages.length - 1].text}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RatingDialog: React.FC<{
  request: ServiceRequestItem | null;
  dark: boolean;
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => Promise<void>;
}> = ({ request, dark, onClose, onSubmit }) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (!request) return null;

  const panelCls = dark ? 'bg-[#152232] text-[#F8FAFC] border-[#26384E]' : 'bg-white text-[#0F2926] border-[#E2EFEF]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${panelCls}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg">ثبت امتیاز و نظر به متخصص</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs opacity-80">
          سفارش: {request.service_title} ({formatToman(request.price_toman)})
        </div>
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setStars(s)} className="p-1 cursor-pointer">
              <Star className={`w-8 h-8 ${s <= stars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود درباره کیفیت کار را بنویسید..."
          className="w-full rounded-2xl border border-[#CBD5E1] dark:border-[#26384E] bg-transparent p-3 text-sm outline-none"
        />
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit(stars, comment);
            } finally {
              setSaving(false);
            }
          }}
          className="w-full rounded-2xl bg-[#065A52] text-white py-3 font-extrabold text-sm cursor-pointer"
        >
          {saving ? 'در حال ثبت...' : 'ثبت نهایی امتیاز'}
        </button>
      </div>
    </div>
  );
};
