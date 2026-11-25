import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  User,
  Menu,
  Briefcase,
  Sparkles,
  Download,
  UserPlus,
  Bell,
  Newspaper,
  ChevronDown,
  ClipboardList,
  Wallet,
  Edit3,
  LogOut
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
  customerPhone?: string;
  customerName?: string;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenEditName?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onOpenCityModal,
  onOpenAuthModal,
  onOpenDrawer,
  activeNav,
  onNavClick,
  customerPhone,
  customerName,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenEditName,
  onLogout
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { id: 'home', label: 'خانه' },
    { id: 'services', label: 'خدمات در محل' },
    { id: 'beauty', label: 'زیبایی و سلامت', isPink: true },
    { id: 'store', label: 'فروشگاه قطعات' },
    { id: 'tandispay', label: 'تندیس‌پی' },
    { id: 'news', label: 'اخبار و مقالات', isSoon: true },
    { id: 'downloads', label: 'دانلود اپلیکیشن', isHighlight: true },
    { id: 'orders', label: 'پیگیری سفارش‌ها' }
  ];

  const isLoggedIn = Boolean(customerPhone && /^09\d{9}$/.test(customerPhone));

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e0eeee] shadow-[0_4px_20px_-4px_rgba(11,92,96,0.06)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenDrawer}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] transition-colors cursor-pointer border border-[#d6ebeb]"
            aria-label="منوی اصلی"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>

          <motion.div
            onClick={() => onNavClick('home')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow-md shadow-[#0b5c60]/15 group-hover:shadow-[#0a8387]/25 transition-all shrink-0 overflow-hidden border-2 border-[#0a8387]/25">
              {!logoFailed ? (
                <img
                  src={CUSTOMER_LOGO_SRC}
                  alt="لوگوی تندیس"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0a8387] to-[#0b5c60] flex items-center justify-center">
                  <span className="text-white font-black text-xl sm:text-2xl tracking-tighter">ت</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-[#12292c]">
                  تندیس
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#effcfb] text-[#0a8387] border border-[#c5ecea]">
                  <Sparkles className="w-2.5 h-2.5 text-[#f2a900]" />
                  سراسر ایران
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-[#4a666a] font-medium -mt-0.5 hidden xs:block">
                جامع‌ترین سامانه خدمات در محل
              </span>
            </div>
          </motion.div>
        </div>

        <nav className="hidden xl:flex items-center gap-1 bg-[#f2f9f9] p-1.5 rounded-2xl border border-[#dcecec]">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`relative px-3 py-2 text-xs font-bold transition-colors rounded-xl cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? item.isPink
                      ? 'text-pink-700'
                      : 'text-[#0b5c60]'
                    : item.isHighlight
                    ? 'text-[#0a8387] hover:text-[#0b5c60]'
                    : item.isPink
                    ? 'text-pink-600 hover:text-pink-700'
                    : 'text-[#4a666a] hover:text-[#12292c]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className={`absolute inset-0 bg-white rounded-xl shadow-sm border ${
                      item.isPink ? 'border-pink-200' : 'border-[#d8ecec]'
                    }`}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  {item.isHighlight && <Download className="w-3.5 h-3.5 text-[#f2a900]" />}
                  {item.isPink && <Sparkles className="w-3.5 h-3.5 text-pink-500" />}
                  {item.isSoon && <Newspaper className="w-3.5 h-3.5 text-[#0a8387]" />}
                  <span>{item.label}</span>
                  {item.isSoon && (
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md">
                      به‌زودی
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* دکمه مرکز اعلان‌ها (فقط پس از ورود به حساب کاربری) */}
          {isLoggedIn && onOpenNotifications && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenNotifications}
              className="relative p-2 sm:p-2.5 rounded-xl bg-[#f2f9f9] hover:bg-[#e3f3f3] text-[#0b5c60] border border-[#d6ebeb] transition-colors cursor-pointer"
              aria-label="اعلان‌ها و پیام‌های سیستم"
              title="اعلان‌ها و پیام‌های مدیریت"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  {toPersianDigits(unreadNotificationsCount)}
                </span>
              )}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCityModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#f2f9f9] hover:bg-[#e5f4f4] text-[#12292c] border border-[#d6ebeb] transition-all cursor-pointer group"
          >
            <MapPin className="w-4 h-4 text-[#0a8387] group-hover:animate-bounce shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={selectedCity}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-xs sm:text-sm font-bold text-[#0b5c60] max-w-[85px] sm:max-w-[120px] truncate"
              >
                {selectedCity}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavClick('expert-login')}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#effcfb] text-[#0b5c60] hover:bg-[#dff6f5] border border-[#bce6e4] transition-all text-xs font-extrabold cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#0a8387]" />
            <span>پنل همکار</span>
          </motion.button>

          {!isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavClick('customer-signup')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all text-xs font-extrabold cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-600" />
              <span>ثبت‌نام</span>
            </motion.button>
          )}

          {isLoggedIn ? (
            <div ref={accountMenuRef} className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-l from-[#0a8387] to-[#0b5c60] text-white hover:from-[#097478] hover:to-[#084b4e] transition-all shadow-md shadow-[#0b5c60]/20 text-xs sm:text-sm font-bold cursor-pointer"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="max-w-[96px] truncate">
                  {customerName || toPersianDigits(customerPhone || '')}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                />
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
                          onNavClick('orders');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1f3b3f] hover:bg-[#effcfb] hover:text-[#0b5c60] transition-colors cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 text-[#0a8387]" />
                        <span>پیگیری سفارش‌ها</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onNavClick('tandispay');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1f3b3f] hover:bg-[#effcfb] hover:text-[#0b5c60] transition-colors cursor-pointer"
                      >
                        <Wallet className="w-4 h-4 text-[#0a8387]" />
                        <span>کیف پول تندیس‌پی</span>
                      </button>

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
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-l from-[#0a8387] to-[#0b5c60] text-white hover:from-[#097478] hover:to-[#084b4e] transition-all shadow-md shadow-[#0b5c60]/20 text-xs sm:text-sm font-bold cursor-pointer"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>ورود</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
