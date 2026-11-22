import React from 'react';
import { motion } from 'motion/react';
import { Home, Wrench, ReceiptText, Download, User } from 'lucide-react';

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
  onOpenDrawer,
  isLoggedIn,
}) => {
  const isServicesGroup = ['services', 'beauty', 'store', 'tandispay'].includes(activeNav);

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
      label: 'سفارش‌ها',
      icon: ReceiptText,
      onClick: () => onNavClick('orders'),
      isActive: activeNav === 'orders',
    },
    {
      id: 'downloads',
      label: 'دانلود',
      icon: Download,
      onClick: () => onNavClick('downloads'),
      isActive: activeNav === 'downloads',
    },
    {
      id: 'account',
      label: isLoggedIn ? 'حساب من' : 'ورود',
      icon: User,
      onClick: isLoggedIn ? onOpenDrawer : onOpenAuth,
      isActive: false,
    },
  ];

  return (
    <nav
      dir="rtl"
      aria-label="منوی پایین موبایل"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#dfecec] shadow-[0_-4px_20px_rgba(11,92,96,0.08)] px-1.5 pb-[env(safe-area-inset-bottom)] no-print"
    >
      <div className="max-w-md mx-auto h-16 grid grid-cols-5 items-center">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 transition-colors cursor-pointer ${
                item.isActive ? 'text-[#0b5c60]' : 'text-[#5f777b] hover:text-[#12292c]'
              }`}
            >
              {item.isActive && (
                <motion.span
                  layoutId="mobile-active-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute top-0 w-7 h-[3px] rounded-full bg-[#0a8387]"
                />
              )}
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] whitespace-nowrap ${item.isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
