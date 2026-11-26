import React from 'react';
import { motion } from 'motion/react';
import { Home, Wrench, Sparkles, ReceiptText, BookOpen, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeNav: string;
  onNavClick: (nav: string) => void;
  onOpenSupport?: () => void;
  onOpenAuth: () => void;
  onOpenDrawer: () => void;
  isLoggedIn?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav,
  onNavClick,
  onOpenAuth,
  isLoggedIn,
}) => {
  const isServicesGroup = ['services', 'store', 'tandispay'].includes(activeNav);

  const items = [
    {
      id: 'home',
      label: 'خانه',
      icon: Home,
      onClick: () => onNavClick('home'),
      isActive: activeNav === 'home',
    },
    {
      id: 'services',
      label: 'خدمات',
      icon: Wrench,
      onClick: () => onNavClick('services'),
      isActive: isServicesGroup,
    },
    {
      id: 'orders',
      label: 'درخواست',
      icon: ReceiptText,
      onClick: () => onNavClick('orders'),
      isActive: activeNav === 'orders',
    },
    {
      id: 'news',
      label: 'آموزش‌ها',
      icon: BookOpen,
      onClick: () => onNavClick('news'),
      isActive: activeNav === 'news',
    },
    {
      id: 'account',
      label: isLoggedIn ? 'داشبورد' : 'حساب من',
      icon: User,
      onClick: isLoggedIn ? () => onNavClick('dashboard') : onOpenAuth,
      isActive: activeNav === 'dashboard',
    },
  ];

  return (
    <nav
      dir="rtl"
      aria-label="نوار ناوبری آیفون تندیس"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/88 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-8px_28px_-10px_rgba(11,92,96,0.12)] px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] no-print"
    >
      <div className="max-w-md mx-auto h-15 grid grid-cols-5 items-center">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={item.onClick}
              className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer select-none ${
                item.isActive ? 'text-[#0a8387]' : 'text-slate-500 active:text-[#12292c]'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-11 h-7 rounded-2xl transition-colors ${
                  item.isActive ? 'bg-[#0a8387]/12 text-[#0a8387]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
              </div>
              <span
                className={`text-[10px] leading-tight whitespace-nowrap ${
                  item.isActive ? 'font-black text-[#0b5c60]' : 'font-bold text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
