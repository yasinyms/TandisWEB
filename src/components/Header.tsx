import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  User,
  LogIn,
  LogOut,
  Phone,
  BadgeCheck,
  UserCheck,
  MapPin,
  Wallet,
  Edit3,
  ReceiptText,
  RefreshCw,
} from 'lucide-react';
import { formatToman, toPersianDigits } from '../services/tandisDefaults';

const CUSTOMER_LOGO_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-15_at_17.37.57_b48837a8.jpeg';

interface HeaderUser {
  isLoggedIn: boolean;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface HeaderProps {
  currentCity: string;
  activeNav: string;
  onNavClick: (nav: string) => void;
  onOpenDrawer: () => void;
  onOpenCityModal?: () => void;
  user?: HeaderUser | null;
  walletBalance?: number;
  syncing?: boolean;
  onManualSync?: () => void;
  onOpenAuth?: () => void;
  onEditName?: () => void;
  onOpenOrders?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  activeNav,
  onNavClick,
  onOpenDrawer,
  onOpenCityModal,
  user,
  walletBalance = 0,
  syncing = false,
  onManualSync,
  onOpenAuth,
  onEditName,
  onOpenOrders,
  onLogout,
}) => {
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const displayName =
    user?.name?.trim() ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'کاربر تندیس';
  const phoneDisplay = user?.phone ? toPersianDigits(user.phone) : '۰۹۱۲۰۰۰۰۰۰۰';
  const membershipType = user?.role || 'عضو تندیس';

  const navLinks = [
    { id: 'home', label: 'خانه' },
    { id: 'services', label: 'خدمات' },
    { id: 'downloads', label: 'دانلود' },
    { id: 'hamkar-panel', label: 'پنل همکار' },
  ];

  return (
    <header className="fixed top-0 w-full z-40 transition-all no-print">
      <div className="relative border-b border-[#e2efef] shadow-[0_2px_16px_rgba(11,92,96,0.04)]">
        <div className="absolute inset-0 bg-white/94 backdrop-blur-xl -z-10 pointer-events-none" />

        <div className="h-16 lg:h-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          {/* Right section: Menu + Minimal Nav */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onOpenDrawer}
              aria-label="منوی اصلی"
              type="button"
              className="w-10 h-10 p-2 rounded-xl text-[#12292c] hover:bg-[#eff8f8] transition-colors flex items-center justify-center cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive =
                  activeNav === link.id ||
                  (link.id === 'services' &&
                    ['services', 'beauty', 'store', 'tandispay', 'orders'].includes(activeNav));

                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onNavClick(link.id)}
                    className={`relative text-sm transition-colors cursor-pointer py-2 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-[#0b5c60] font-extrabold'
                        : 'text-[#526a6e] hover:text-[#12292c] font-medium'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="header-active-nav"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-x-0 -bottom-0.5 h-[2.5px] rounded-full bg-[#0b5c60]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center Brand */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onNavClick('home')}
            className="flex items-center gap-2.5 text-right cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white border border-[#d6ebeb] shadow-2xs flex items-center justify-center shrink-0 overflow-hidden p-1">
              <img
                src={CUSTOMER_LOGO_SRC}
                alt="لوگوی تندیس"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg tandis-logo-motion"
              />
            </div>
            <span className="text-lg sm:text-xl font-black text-[#12292c] tracking-tight">
              تندیس
            </span>
          </motion.button>

          {/* Left Actions: City + Sync + Auth/Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenCityModal && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onOpenCityModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] border border-[#dcecec] text-[#12292c] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0b5c60] shrink-0" />
                <span>{currentCity}</span>
              </motion.button>
            )}

            {onManualSync && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={onManualSync}
                title="به‌روزرسانی"
                aria-label="به‌روزرسانی"
                className="hidden md:flex w-9 h-9 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] border border-[#dcecec] text-[#0b5c60] items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </motion.button>
            )}

            {user?.isLoggedIn ? (
              <div
                className="relative"
                onMouseEnter={() => setIsProfileHovered(true)}
                onMouseLeave={() => setIsProfileHovered(false)}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsProfileHovered((prev) => !prev)}
                  aria-label="حساب کاربری"
                  className="h-9 lg:h-10 px-3 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline text-xs font-bold max-w-[96px] truncate">
                    {displayName}
                  </span>
                </motion.button>

                <div
                  dir="rtl"
                  aria-hidden={!isProfileHovered}
                  className={`absolute left-0 top-full pt-2.5 w-[calc(100vw-2rem)] max-w-[280px] sm:w-72 sm:max-w-none z-50 ${
                    isProfileHovered ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                >
                  <div
                    className={`rounded-2xl bg-white border border-[#dfecec] shadow-[0_20px_44px_-12px_rgba(11,92,96,0.22)] p-4 space-y-3 transform-gpu origin-top-left transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isProfileHovered
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-1.5 scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-[#edf4f4]">
                      <div className="w-10 h-10 rounded-xl bg-[#0b5c60] text-white flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-[#12292c] truncate">{displayName}</p>
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-[#0b5c60]">
                          <BadgeCheck className="w-3 h-3 text-[#0a8387]" />
                          {membershipType}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f6fbfb]">
                        <span className="text-[#5f777b] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#0b5c60]" />
                          موبایل
                        </span>
                        <span dir="ltr" className="font-bold text-[#12292c] tabular-nums">
                          {phoneDisplay}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f6fbfb]">
                        <span className="text-[#5f777b] flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-[#0b5c60]" />
                          کیف پول
                        </span>
                        <span className="font-bold text-[#0b5c60] tabular-nums">
                          {formatToman(walletBalance)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileHovered(false);
                          onOpenOrders?.();
                        }}
                        className="w-full h-9 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ReceiptText className="w-3.5 h-3.5" />
                        <span>سفارش‌ها</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileHovered(false);
                            onEditName?.();
                          }}
                          className="h-9 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] text-[#12292c] border border-[#dcecec] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#0b5c60]" />
                          <span>ویرایش</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileHovered(false);
                            onLogout?.();
                          }}
                          className="h-9 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>خروج</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onOpenAuth}
                  aria-label="ورود"
                  className="lg:hidden w-9 h-9 rounded-xl bg-[#0b5c60] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
