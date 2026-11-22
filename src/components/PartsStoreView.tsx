import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Wrench
} from 'lucide-react';
import { submitPartInquiry, submitPartsOrder } from '../services/tandisApi';
import { toPersianDigits, toPurePersianText } from '../services/tandisDefaults';
import type { CartItem, OnlineStorePart, PartInquiryItem, TandisCityInfo } from '../types/tandis';

export const PartsStoreView: React.FC<{
  dark: boolean;
  isStoreEnabled: boolean;
  parts: OnlineStorePart[];
  inquiries: PartInquiryItem[];
  phone: string;
  customerName: string;
  cityInfo: TandisCityInfo;
  walletBalance: number;
  onRequireLogin: () => void;
  onRequestShaparak: (amountToman: number, title: string, onSuccess: () => Promise<void>) => void;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}> = ({
  dark,
  isStoreEnabled,
  parts,
  inquiries,
  phone,
  customerName,
  cityInfo,
  onRequireLogin,
  onRefresh,
  onToast
}) => {
  const [subTab, setSubTab] = useState<'catalog' | 'inquiry' | 'cart'>('catalog');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutAddress, setCheckoutAddress] = useState(cityInfo.defaultAddress);
  const [needsInstallCart, setNeedsInstallCart] = useState(false);
  const [busyOrder, setBusyOrder] = useState(false);

  // فرم استعلام هوشمند قطعه
  const [deviceType, setDeviceType] = useState<'خودرو' | 'لوازم خانگی'>('خودرو');
  const [partName, setPartName] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [partCode, setPartCode] = useState('');
  const [inquiryDesc, setInquiryDesc] = useState('');
  const [needsInstallInquiry, setNeedsInstallInquiry] = useState(true);
  const [busyInquiry, setBusyInquiry] = useState(false);

  const cardCls = dark ? 'bg-[#152232] border-[#26384E] text-[#F8FAFC]' : 'bg-white border-[#E2EFEF] text-[#0F2926]';
  const mutedCls = dark ? 'text-[#94A3B8]' : 'text-[#527371]';
  const inputCls = dark
    ? 'bg-[#1E2D40] border-[#26384E] text-white placeholder-[#94A3B8]'
    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F2926]';

  const filteredParts = useMemo(() => {
    const q = query.trim();
    if (!q) return parts;
    return parts.filter(
      (p) =>
        p.title.includes(q) ||
        p.category.includes(q) ||
        p.compatibleModel.includes(q) ||
        p.brand.includes(q)
    );
  }, [parts, query]);

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const addToCart = (part: OnlineStorePart) => {
    if (!part.inStock) return;
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.part.id === part.id);
      if (idx >= 0) {
        return prev.map((c, i) => (i === idx ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { part, quantity: 1 }];
    });
    onToast(`«${toPurePersianText(part.title)}» به لیست درخواست اضافه شد.`);
  };

  const updateQty = (partId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.part.id === partId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const handleRequestSubmit = async () => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (cart.length === 0 || !checkoutAddress.trim()) return;

    setBusyOrder(true);
    try {
      await submitPartsOrder({
        phone,
        customerName: customerName || 'مشتری تندیس',
        city: cityInfo.name,
        address: checkoutAddress.trim(),
        items: cart,
        totalToman: 0,
        paymentMethod: 'درخواست استعلام و تامین',
        needsInstall: needsInstallCart
      });
      setCart([]);
      onToast(
        needsInstallCart
          ? 'درخواست قطعات و اعزام متخصص برای نصب ثبت شد.'
          : 'درخواست قطعات شما ثبت شد.'
      );
      onRefresh();
    } finally {
      setBusyOrder(false);
    }
  };

  const handleInquirySubmit = async () => {
    if (!phone) {
      onRequireLogin();
      return;
    }
    if (!partName.trim() || !deviceModel.trim()) return;
    setBusyInquiry(true);
    try {
      await submitPartInquiry({
        customer_phone: phone,
        customer_name: customerName || 'مشتری تندیس',
        device_type: deviceType,
        part_name: partName.trim(),
        device_model: deviceModel.trim(),
        part_code: partCode.trim(),
        needs_specialist_install: needsInstallInquiry,
        city: cityInfo.name,
        description: inquiryDesc.trim()
      });
      setPartName('');
      setDeviceModel('');
      setPartCode('');
      setInquiryDesc('');
      onToast('فرم استعلام قیمت قطعه با موفقیت به واحد تامین قطعات تندیس ارسال شد.');
      onRefresh();
    } finally {
      setBusyInquiry(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={`rounded-3xl border p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 ${cardCls}`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#065A52] dark:text-[#14B8A6]">
            <ShoppingBag className="w-4 h-4" />
            متصل به موجودی زنده سرور مدیریت تندیس
          </div>
          <h2 className="text-xl font-black mt-1">فروشگاه آنلاین قطعات و استعلام هوشمند قیمت</h2>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40]">
          <button
            onClick={() => setSubTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              subTab === 'catalog' ? 'bg-[#065A52] text-white' : mutedCls
            }`}
          >
            قطعات موجود ({toPersianDigits(parts.length)})
          </button>
          <button
            onClick={() => setSubTab('inquiry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              subTab === 'inquiry' ? 'bg-[#065A52] text-white' : mutedCls
            }`}
          >
            استعلام قیمت قطعه
          </button>
          <button
            onClick={() => setSubTab('cart')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 ${
              subTab === 'cart' ? 'bg-[#F59E0B] text-[#0F172A]' : mutedCls
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            سبد خرید ({toPersianDigits(cartCount)})
          </button>
        </div>
      </div>

      {subTab === 'catalog' && (
        <>
          {!isStoreEnabled ? (
            <div className={`rounded-3xl border p-10 text-center text-sm ${cardCls}`}>
              فروشگاه قطعات در حال به‌روزرسانی از پنل مدیریت است؛ می‌توانید از بخش استعلام قیمت استفاده کنید.
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="w-4 h-4 absolute right-4 top-3.5 opacity-55" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجوی نام قطعه، برند یا مدل خودرو و لوازم خانگی..."
                  className={`w-full rounded-2xl border pr-11 pl-4 py-3 text-sm outline-none ${inputCls}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredParts.map((part) => (
                  <div key={part.id} className={`rounded-3xl border p-5 flex flex-col justify-between gap-4 ${cardCls}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[#065A52] dark:text-[#14B8A6]">
                          {toPurePersianText(part.category)}
                        </span>
                        <span className={`font-black ${part.inStock ? 'text-[#10B981]' : 'text-red-500'}`}>
                          {part.inStock ? 'موجود در انبار' : 'ناموجود'}
                        </span>
                      </div>
                      <h3 className="font-black text-base">{toPurePersianText(part.title)}</h3>
                      <div className={`text-xs space-y-1 ${mutedCls}`}>
                        <div>برند: {toPurePersianText(part.brand)}</div>
                        <div>سازگار با: {toPurePersianText(part.compatibleModel)}</div>
                        <div>ضمانت: {toPurePersianText(part.warranty)}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#E2EFEF] dark:border-[#26384E]">
                      <button
                        disabled={!part.inStock}
                        onClick={() => addToCart(part)}
                        className="w-full rounded-xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-45 text-white px-4 py-2.5 text-xs font-extrabold cursor-pointer"
                      >
                        درخواست
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {subTab === 'inquiry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center gap-2 font-black text-lg">
              <ClipboardList className="w-5 h-5 text-[#065A52] dark:text-[#14B8A6]" />
              فرم هوشمند استعلام قیمت قطعه خودرو و لوازم خانگی
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {(['خودرو', 'لوازم خانگی'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeviceType(t)}
                  className={`py-2.5 rounded-2xl text-xs font-extrabold border cursor-pointer ${
                    deviceType === t
                      ? 'bg-[#065A52] text-white border-[#065A52]'
                      : 'border-[#CBD5E1] dark:border-[#26384E]'
                  }`}
                >
                  قطعه {t}
                </button>
              ))}
            </div>
            <input
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="نام قطعه مورد نیاز (مثلاً کمپرسور یخچال، دیسک و صفحه...)"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <input
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder={deviceType === 'خودرو' ? 'مدل و سال ساخت خودرو' : 'برند و مدل دستگاه'}
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <input
              value={partCode}
              onChange={(e) => setPartCode(e.target.value)}
              placeholder="شماره فنی یا شناسه قطعه (اختیاری)"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <textarea
              rows={2}
              value={inquiryDesc}
              onChange={(e) => setInquiryDesc(e.target.value)}
              placeholder="توضیحات تکمیلی برای قیمت‌گذاری دقیق..."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
            />
            <label className="flex items-center justify-between rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-3.5 text-xs font-extrabold cursor-pointer">
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6]" />
                نیاز به نصب همزمان توسط متخصص اعزامی تندیس دارم
              </span>
              <input
                type="checkbox"
                checked={needsInstallInquiry}
                onChange={(e) => setNeedsInstallInquiry(e.target.checked)}
                className="accent-[#065A52] w-4 h-4"
              />
            </label>
            <button
              disabled={busyInquiry || !partName.trim() || !deviceModel.trim()}
              onClick={handleInquirySubmit}
              className="w-full rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white py-3.5 text-sm font-extrabold cursor-pointer"
            >
              {busyInquiry ? 'در حال ثبت استعلام...' : 'ارسال استعلام قیمت قطعه'}
            </button>
          </div>

          <div className={`rounded-3xl border p-6 space-y-4 ${cardCls}`}>
            <h3 className="font-black text-base">استعلام‌های ثبت‌شده شما</h3>
            {inquiries.length === 0 ? (
              <div className={`text-xs py-8 text-center ${mutedCls}`}>
                هنوز فرم استعلام قطعه‌ای ارسال نکرده‌اید.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-black">
                      <span>{inq.part_name} ({inq.device_type})</span>
                      <span className="text-[#065A52] dark:text-[#14B8A6]">{toPurePersianText(inq.status)}</span>
                    </div>
                    <div className={mutedCls}>
                      مدل: {inq.device_model} {inq.needs_specialist_install ? '· همراه با نصب متخصص' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'cart' && (
        <div className={`rounded-3xl border p-6 space-y-5 ${cardCls}`}>
          {cart.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="text-sm font-bold">سبد خرید شما خالی است.</div>
              <button
                onClick={() => setSubTab('catalog')}
                className="rounded-xl bg-[#065A52] text-white px-5 py-2.5 text-xs font-extrabold cursor-pointer"
              >
                مشاهده قطعات موجود
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.part.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2EFEF] dark:border-[#26384E] p-3.5"
                  >
                    <div>
                      <div className="font-black text-sm">{toPurePersianText(item.part.title)}</div>
                      <div className="text-xs opacity-70">{toPurePersianText(item.part.brand)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.part.id, -1)}
                        className="p-2 rounded-xl border border-[#CBD5E1] dark:border-[#26384E] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-sm w-6 text-center tabular-nums">
                        {toPersianDigits(item.quantity)}
                      </span>
                      <button
                        onClick={() => updateQty(item.part.id, 1)}
                        className="p-2 rounded-xl border border-[#CBD5E1] dark:border-[#26384E] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateQty(item.part.id, -item.quantity)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <input
                value={checkoutAddress}
                onChange={(e) => setCheckoutAddress(e.target.value)}
                placeholder="نشانی دقیق ارسال قطعه و نصب"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputCls}`}
              />

              <label className="flex items-center justify-between rounded-2xl bg-[#F3F8F8] dark:bg-[#1E2D40] p-3.5 text-xs font-extrabold cursor-pointer">
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#065A52] dark:text-[#14B8A6]" />
                  اعزام همزمان متخصص تندیس برای نصب قطعات خریداری‌شده
                </span>
                <input
                  type="checkbox"
                  checked={needsInstallCart}
                  onChange={(e) => setNeedsInstallCart(e.target.checked)}
                  className="accent-[#065A52] w-4 h-4"
                />
              </label>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2EFEF] dark:border-[#26384E]">
                <button
                  disabled={busyOrder || !checkoutAddress.trim()}
                  onClick={handleRequestSubmit}
                  className="flex items-center gap-2 rounded-2xl bg-[#065A52] hover:bg-[#054943] disabled:opacity-50 text-white px-6 py-3 text-xs font-extrabold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {busyOrder ? 'در حال ارسال...' : 'ارسال درخواست'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
