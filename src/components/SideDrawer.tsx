import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Home,
  Handshake,
  Headphones,
  LogOut,
  LogIn,
  ChevronLeft,
  Wrench,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  ReceiptText,
  Download,
  Info,
  MapPin,
} from 'lucide-react';
import { formatToman, toPersianDigits } from '../services/tandisDefaults';

const CUSTOMER_LOGO_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeNav?: string;
  currentCity?: string;
  walletBalance?: number;
  supportPhone?: string;
  onSelectNav?: (nav: string) => void;
  onSelectCategory?: (catId: string) => void;
  onOpenCityModal?: () => void;
  onOpenSupport?: () => void;
  user?: {
    isLoggedIn: boolean;
    phone?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeNav = 'home',
  currentCity = 'آبادان',
  walletBalance = 0,
  supportPhone = '061-53220000',
  onSelectNav,
  onOpenCityModal,
  onOpenSupport,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const fullName =
    user?.name?.trim() ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'کاربر تندیس';

  const navItems = [
    { id: 'home', label: 'خانه', icon: Home },
    { id: 'services', label: 'خدمات در محل', icon: Wrench },
    { id: 'store', label: 'فروشگاه قطعات', icon: ShoppingBag },
    { id: 'tandispay', label: 'تندیس‌پی', icon: Wallet },
    { id: 'orders', label: 'درخواست‌ها', icon: ReceiptText },
    { id: 'downloads', label: 'دانلود اپلیکیشن', icon: Download },
    { id: 'hamkar-panel', label: 'پنل تندیس همکار (ورود)', icon: ShieldCheck },
    { id: 'provider-signup', label: 'ثبت‌نام متخصص جدید', icon: Handshake },
    { id: 'about', label: 'درباره ما', icon: Info },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 no-print">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#12292c]/40 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 z-10 h-full w-[310px] max-w-[85vw] bg-white shadow-[0_20px_50px_rgba(11,92,96,0.18)] flex flex-col border-l border-[#e2efef] text-right select-none"
            dir="rtl"
          >
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-[#eef4f5] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#dfecec] flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img
                    src={CUSTOMER_LOGO_SRC}
                    alt="تندیس"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <span className="font-black text-base text-[#12292c]">تندیس</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="بستن منو"
                className="w-8 h-8 rounded-xl bg-[#f4fafa] text-[#5f777b] hover:text-[#12292c] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 no-scrollbar">
              {/* Account & City */}
              <div className="rounded-2xl bg-[#f4fafa] border border-[#e0efef] p-3 space-y-2.5">
                {user?.isLoggedIn ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0b5c60] text-white flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#12292c] truncate">{fullName}</p>
                          <p dir="ltr" className="text-[11px] text-[#5f777b] text-right tabular-nums">
                            {user.phone ? toPersianDigits(user.phone) : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onLogout?.();
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#dcecec] text-xs">
                      <span className="text-[#5f777b]">کیف پول</span>
                      <span className="font-black text-[#0b5c60] tabular-nums">
                        {formatToman(walletBalance)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#12292c]">حساب کاربری</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth?.();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>ورود</span>
                    </button>
                  </div>
                )}

                {onOpenCityModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCityModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-[#eff8f8] border border-[#dcecec] text-xs font-bold text-[#12292c] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0b5c60]" />
                      {currentCity}
                    </span>
                    <span className="text-[11px] text-[#0a8387]">تغییر</span>
                  </button>
                )}
              </div>

              {/* Clean 1-line Nav */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectNav?.(item.id);
                        onClose();
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#eff8f8] text-[#0b5c60] font-extrabold'
                          : 'bg-white hover:bg-[#f6fbfb] text-[#12292c] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0b5c60]' : 'text-[#0a8387]'}`} />
                        <span className="text-xs truncate">{item.label}</span>
                      </div>
                      <ChevronLeft
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0b5c60]' : 'text-[#cbd5e1]'}`}
                      />
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSupport?.();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white hover:bg-[#f6fbfb] flex items-center justify-between text-[#12292c] font-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Headphones className="w-4 h-4 text-[#0a8387] shrink-0" />
                    <span className="text-xs truncate">پشتیبانی ۲۴/۷</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#cbd5e1] shrink-0" />
                </button>
              </nav>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-[#eef4f5] bg-[#fafdfd] shrink-0">
              <a
                href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-between px-1 text-xs text-[#5f777b] hover:text-[#0b5c60] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#0a8387]" />
                  <span>پشتیبانی تلفنی</span>
                </span>
                <span dir="ltr" className="font-bold text-[#12292c] tabular-nums">
                  {toPersianDigits(supportPhone)}
                </span>
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
