import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Home,
  Wrench,
  ShoppingBag,
  Info,
  Briefcase,
  UserCheck,
  ChevronLeft,
  Wallet,
  ClipboardList,
  Download,
  UserPlus,
  LogOut,
  Edit3,
  Users,
  Newspaper,
  Bell
} from 'lucide-react';
import { toPersianDigits } from '../services/tandisDefaults';

const CUSTOMER_LOGO_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onNavClick: (nav: string) => void;
  onOpenAuth: () => void;
  onOpenSupport?: () => void;
  onOpenEditName?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onLogout?: () => void;
  selectedCity: string;
  customerPhone?: string;
  customerName?: string;
  supportPhone?: string;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeNav,
  onNavClick,
  onOpenAuth,
  onOpenEditName,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onLogout,
  selectedCity,
  customerPhone,
  customerName
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const isLoggedIn = Boolean(customerPhone && /^09\d{9}$/.test(customerPhone));

  const menuLinks = [
    { id: 'home', label: 'صفحه اصلی تندیس', icon: Home, badge: '', disabled: false },
    ...(isLoggedIn
      ? [{ id: 'dashboard', label: 'داشبورد مشتری', icon: ClipboardList, badge: '', disabled: false }]
      : []),
    { id: 'services', label: 'خدمات تخصصی در محل', icon: Wrench, badge: '', disabled: false },
    { id: 'store', label: 'فروشگاه', icon: ShoppingBag, badge: 'به‌زودی', disabled: true },
    { id: 'tandispay', label: 'تندیس‌پی', icon: Wallet, badge: 'به‌زودی', disabled: true },
    ...(isLoggedIn
      ? [{ id: 'orders', label: 'پیگیری درخواست‌ها و فاکتور', icon: ClipboardList, badge: '', disabled: false }]
      : []),
    { id: 'management', label: 'مدیریت و کارشناسان', icon: Users, badge: '', disabled: false },
    { id: 'news', label: 'اخبار و مقالات', icon: Newspaper, badge: '', disabled: false },
    { id: 'downloads', label: 'دانلود اپلیکیشن موبایل', icon: Download, badge: '', disabled: false },
    { id: 'about', label: 'درباره تندیس و قوانین', icon: Info, badge: '', disabled: false }
  ];

  const handleSelect = (id: string, disabled?: boolean) => {
    if (disabled) return;
    onNavClick(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071e20]/60 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-[85vw] max-w-sm bg-white h-full shadow-2xl border-l border-[#d8ecec] flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="p-5 bg-gradient-to-br from-[#0b5c60] via-[#0a8387] to-[#064245] text-white relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white p-0.5 flex items-center justify-center border border-white/40 shadow-lg overflow-hidden shrink-0">
                      {!logoFailed ? (
                        <img
                          src={CUSTOMER_LOGO_SRC}
                          alt="لوگوی تندیس"
                          referrerPolicy="no-referrer"
                          onError={() => setLogoFailed(true)}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <span className="text-2xl font-black text-[#0b5c60]">ت</span>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-lg leading-tight">تندیس</div>
                      {isLoggedIn && (
                        <div className="text-xs text-[#c5ecea] font-medium mt-0.5">
                          شهر فعال: {selectedCity}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    aria-label="بستن منو"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isLoggedIn && (
                  <div className="mt-4 flex items-center justify-between gap-2 bg-black/20 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 text-xs">
                    <span className="font-medium text-white/95 truncate">
                      {customerName || 'مشتری تندیس'} ({toPersianDigits(customerPhone || '')})
                    </span>
                    {onOpenEditName && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenEditName();
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        ویرایش نام
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-b border-[#e5f2f2] space-y-2.5">
                {isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-2">
                    {onOpenEditName && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenEditName();
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#effcfb] hover:bg-[#dff6f5] text-[#0b5c60] border border-[#bce6e4] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تغییر نام کاربری</span>
                      </button>
                    )}
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onLogout();
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج از حساب</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="py-3 px-3 rounded-2xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] border border-[#cde6e6] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-[#0a8387]" />
                      <span>ورود</span>
                    </button>

                    <button
                      onClick={() => handleSelect('customer-signup')}
                      className="py-3 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      <span>ثبت‌نام</span>
                    </button>
                  </div>
                )}

                {isLoggedIn && onOpenNotifications && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNotifications();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#f8fcfc] hover:bg-[#effcfb] text-[#12292c] border border-[#dcecec] font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#0a8387]" />
                      اعلان‌ها و پیام‌ها
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                        {toPersianDigits(unreadNotificationsCount)}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleSelect('expert-login')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-[#f2a900]" />
                  <span>تندیس همکار</span>
                </button>
              </div>

              <div className="p-3 space-y-1">
                {menuLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = !item.disabled && activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => handleSelect(item.id, item.disabled)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        item.disabled
                          ? 'text-[#8aa4a8] bg-[#f8fbfb] cursor-not-allowed opacity-75'
                          : isActive
                            ? 'bg-[#effcfb] text-[#0a8387] border border-[#c5ecea] cursor-pointer'
                            : 'text-[#284246] hover:bg-[#f5fbfb] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            item.disabled
                              ? 'text-[#9cb3b7]'
                              : isActive
                                ? 'text-[#0a8387]'
                                : 'text-[#5b7a7e]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                            {item.badge}
                          </span>
                        )}
                        {!item.disabled && <ChevronLeft className="w-4 h-4 text-[#8aa4a8]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
