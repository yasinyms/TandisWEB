import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  User,
  Menu,
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Wallet,
  Edit3,
  LogOut,
  Search,
  Star,
  X
} from 'lucide-react';
import { toPersianDigits } from '../services/tandisDefaults';

const CUSTOMER_LOGO_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';

interface HeaderProps {
  selectedCity: string;
  onOpenCityModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDrawer: () => void;
  activeNav: string;
  onNavClick: (nav: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: () => void;
  customerPhone?: string;
  customerName?: string;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  pendingRatingServiceTitle?: string;
  onOpenRating?: () => void;
  onOpenEditName?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onOpenCityModal,
  onOpenAuthModal,
  onOpenDrawer,
  onNavClick,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  customerPhone,
  customerName,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  pendingRatingServiceTitle,
  onOpenRating,
  onOpenEditName,
  onLogout
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const isLoggedIn = Boolean(customerPhone && /^09\d{9}$/.test(customerPhone));

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 80);
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!isLoggedIn && accountMenuOpen) {
      setAccountMenuOpen(false);
    }
  }, [isLoggedIn, accountMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [accountMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/88 lg:bg-white/95 backdrop-blur-2xl lg:backdrop-blur-md border-b border-slate-200/75 lg:border-[#e0eeee] shadow-[0_2px_14px_-4px_rgba(11,92,96,0.05)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 lg:h-18 flex items-center justify-between gap-2 lg:gap-4">
        {/* موبایل: همبرگری - لوگو */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 rounded-xl bg-slate-100/90 text-[#0b5c60] active:bg-slate-200"
            aria-label="منوی اصلی"
          >
            <Menu className="w-5 h-5" />
          </button>

          <motion.div
            onClick={() => onNavClick('home')}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 shadow-xs border border-[#0a8387]/25 overflow-hidden shrink-0">
              {!logoFailed ? (
                <img
                  src={CUSTOMER_LOGO_SRC}
                  alt="تندیس"
                  onError={() => setLogoFailed(true)}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-[#0a8387] flex items-center justify-center text-white font-black">
                  ت
                </div>
              )}
            </div>
            <span className="text-sm font-black text-[#12292c]">تندیس</span>
          </motion.div>
        </div>

        {/* دسکتاپ: دکمه منو + لوگو */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenDrawer}
            className="p-2.5 rounded-2xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] transition-colors cursor-pointer border border-[#d6ebeb]"
            aria-label="منوی اصلی"
          >
            <Menu className="w-6 h-6" />
          </motion.button>

          <motion.div
            onClick={() => onNavClick('home')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow-md shadow-[#0b5c60]/15 border border-[#0a8387]/25 shrink-0 overflow-hidden">
              {!logoFailed ? (
                <img
                  src={CUSTOMER_LOGO_SRC}
                  alt="لوگوی رسمی تندیس | tandiis.com"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0a8387] to-[#0b5c60] flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-tighter">ت</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#12292c] leading-none">
                تندیس
              </span>
            </div>
          </motion.div>
        </div>

        {/* جستجوی دسکتاپ در وسط هدر (مخصوص دسکتاپ) */}
        {onSearchChange && (
          <div className="hidden lg:block flex-1 max-w-md mx-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#647d81] absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearchSubmit) {
                    onSearchSubmit();
                  }
                }}
                placeholder="جستجوی خدمت، تعمیرات، زیبایی..."
                className="w-full rounded-xl bg-[#f4fafa] focus:bg-white border border-[#dcecec] focus:border-[#0b5c60] pr-10 pl-8 py-2 text-sm text-[#12292c] placeholder:text-[#7c9296] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 p-0.5 rounded-full text-[#647d81] hover:text-[#12292c] cursor-pointer"
                  aria-label="پاک کردن"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* سمت چپ: حساب کاربری */}
        <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">

          {/* دکمه شهر در دسکتاپ */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCityModal}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f2f9f9] hover:bg-[#e5f4f4] text-[#12292c] border border-[#d6ebeb] transition-all cursor-pointer group"
          >
            <MapPin className="w-4 h-4 text-[#0a8387] shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={selectedCity}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-sm font-bold text-[#0b5c60] max-w-[130px] truncate"
              >
                {selectedCity}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {isLoggedIn ? (
            <div ref={accountMenuRef} className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-l from-[#0a8387] to-[#0b5c60] text-white hover:from-[#097478] hover:to-[#084b4e] transition-all shadow-md shadow-[#0b5c60]/20 text-xs sm:text-sm font-bold cursor-pointer"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-label="حساب کاربری"
              >
                <User className="w-4 h-4 shrink-0" />
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                />
                {unreadNotificationsCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-sm"
                    title={`${toPersianDigits(unreadNotificationsCount)} اعلان خوانده‌نشده`}
                  >
                    {toPersianDigits(unreadNotificationsCount)}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 mt-2 w-60 rounded-2xl bg-white border border-[#dcecec] shadow-[0_18px_40px_rgba(11,92,96,0.16)] overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-[#f4fbfb] border-b border-[#e3f0f0]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#12292c] truncate">
                          {customerName || 'مشتری تندیس'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                          فعال
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#5a7579] mt-0.5 tabular-nums" dir="ltr">
                        {toPersianDigits(customerPhone || '')}
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onNavClick('dashboard');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-l from-[#0a8387] to-[#0b5c60] hover:from-[#097478] hover:to-[#084b4e] transition-all cursor-pointer shadow-xs mb-1"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#f2a900]" />
                        <span>ورود به داشبورد</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onNavClick('orders');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1f3b3f] hover:bg-[#effcfb] hover:text-[#0b5c60] transition-colors cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 text-[#0a8387]" />
                        <span>پیگیری سفارش‌ها</span>
                      </button>

                      <div
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#8aa4a8] bg-[#f8fbfb] cursor-not-allowed select-none"
                        aria-disabled="true"
                      >
                        <span className="flex items-center gap-2.5">
                          <Wallet className="w-4 h-4 text-[#9cb3b7]" />
                          <span>تندیس‌پی</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                          به‌زودی
                        </span>
                      </div>

                      {onOpenNotifications && (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenNotifications();
                          }}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1f3b3f] hover:bg-[#effcfb] hover:text-[#0b5c60] transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-[#0a8387]" />
                            <span>اعلان‌ها و پیام‌ها</span>
                          </span>
                          {unreadNotificationsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                              {toPersianDigits(unreadNotificationsCount)}
                            </span>
                          )}
                        </button>
                      )}

                      {onOpenRating && (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenRating();
                          }}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-amber-800 bg-amber-50/70 hover:bg-amber-100/80 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Star className="w-4 h-4 text-[#d97706] fill-[#f2a900] shrink-0" />
                            <span className="truncate">
                              {pendingRatingServiceTitle
                                ? `ثبت نظر (${pendingRatingServiceTitle})`
                                : 'ثبت امتیاز و نظر'}
                            </span>
                          </span>
                          <span className="w-2 h-2 rounded-full bg-[#f2a900] shrink-0" />
                        </button>
                      )}

                      {onOpenEditName && (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenEditName();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1f3b3f] hover:bg-[#effcfb] hover:text-[#0b5c60] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 text-[#0a8387]" />
                          <span>ویرایش نام کاربری</span>
                        </button>
                      )}

                      {onLogout && (
                        <div className="pt-1 mt-1 border-t border-[#ebf4f4]">
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>خروج از حساب کاربری</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full lg:rounded-xl bg-gradient-to-l from-[#0a8387] to-[#0b5c60] text-white hover:from-[#097478] hover:to-[#084b4e] transition-all shadow-xs lg:shadow-md shadow-[#0b5c60]/20 text-xs lg:text-sm font-extrabold cursor-pointer"
            >
              <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>ورود</span>
            </motion.button>
          )}

        </div>
      </div>

      {/* کادر جستجوی بازشونده iOS Spotlight مخصوص موبایل آیفون */}
      <AnimatePresence>
        {onSearchChange && (mobileSearchOpen || Boolean(searchQuery)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-2xl"
          >
            <div className="px-3.5 py-2.5 flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-[#0a8387] absolute right-3.5 pointer-events-none" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSearchSubmit) {
                      onSearchSubmit();
                    }
                  }}
                  placeholder="جستجو در خدمات تندیس..."
                  className="w-full rounded-2xl bg-slate-100/90 focus:bg-white border border-slate-200/80 focus:border-[#0a8387] pr-10 pl-8 py-2 text-xs font-bold text-[#12292c] placeholder:text-slate-400 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute left-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="پاک کردن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setMobileSearchOpen(false);
                }}
                className="text-xs font-extrabold text-[#0b5c60] px-2 py-1.5 cursor-pointer shrink-0"
              >
                بستن
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
