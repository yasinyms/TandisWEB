import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, Category } from '../data/mockData';
import { Fluent3DCategoryIcon } from './Fluent3DCategoryIcon';

interface CategoriesGridProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_DISPLAY_META: Record<string, { title: string; hoverGlow: string }> = {
  services: {
    title: 'فنی و تعمیرات',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(249,115,22,0.2)] hover:border-orange-200/90',
  },
  auto: {
    title: 'امداد خودرو',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(14,165,233,0.2)] hover:border-sky-200/90',
  },
  home: {
    title: 'نظافت و باربری',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(16,185,129,0.2)] hover:border-emerald-200/90',
  },
  events: {
    title: 'پزشکی و پرستاری',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(244,63,94,0.2)] hover:border-rose-200/90',
  },
  legal: {
    title: 'حقوقی و اداری',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(139,92,246,0.2)] hover:border-violet-200/90',
  },
  apparel: {
    title: 'زیبایی و سلامت',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(236,72,153,0.2)] hover:border-pink-200/90',
  },
  industrial: {
    title: 'صنعت و دیجیتال',
    hoverGlow: 'hover:shadow-[0_14px_30px_-10px_rgba(59,130,246,0.2)] hover:border-blue-200/90',
  },
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
  const [showRideNotice, setShowRideNotice] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleRideRequestClick = () => {
    setShowRideNotice(true);
    setTimeout(() => {
      setShowRideNotice(false);
    }, 2800);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-[#0a8387] rounded-full" />
          <h2 className="text-base sm:text-lg font-black text-[#12292c]">دسته‌بندی خدمات</h2>
        </div>

        <AnimatePresence>
          {showRideNotice && (
            <motion.span
              key="ride-notice"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[#0a8387] bg-[#effcfb] border border-[#0a8387]/25 px-3 py-1 rounded-xl text-xs font-bold"
            >
              درخواست خودرو به‌زودی فعال می‌شود
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-3xl bg-white border border-[#e2efef] px-4 py-6 sm:px-8 sm:py-8 shadow-[0_6px_26px_-14px_rgba(10,131,135,0.1)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 justify-items-center">
          <motion.button
            type="button"
            whileHover={{ y: -5, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onMouseEnter={() => setHoveredId('ride')}
            onMouseLeave={() => setHoveredId(null)}
            onClick={handleRideRequestClick}
            aria-disabled="true"
            title="درخواست خودرو (به‌زودی)"
            className="group relative w-34 h-34 sm:w-36 sm:h-36 md:w-38 md:h-38 lg:w-42 lg:h-42 rounded-full flex flex-col items-center justify-center p-3 text-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a900] bg-gradient-to-b from-[#0a8387] to-[#074d50] text-white border-2 border-[#f2a900] shadow-[0_14px_30px_-10px_rgba(10,131,135,0.42)] transition-shadow duration-300"
          >
            <div className="mb-2 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Fluent3DCategoryIcon
                id="ride"
                isHovered={hoveredId === 'ride'}
                className="w-13 h-13 sm:w-15 sm:h-15 lg:w-18 lg:h-18"
              />
            </div>

            <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap leading-tight">
              درخواست خودرو
            </span>
            <span className="text-[10px] text-[#fde68a] mt-0.5 font-medium">به‌زودی</span>
          </motion.button>

          {CATEGORIES.map((cat: Category) => {
            const meta = CATEGORY_DISPLAY_META[cat.id] || {
              title: cat.name,
              hoverGlow: '',
            };

            return (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ y: -5, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectCategory(cat.id)}
                title={meta.title}
                className={`group relative w-34 h-34 sm:w-36 sm:h-36 md:w-38 md:h-38 lg:w-42 lg:h-42 rounded-full flex flex-col items-center justify-center p-3 text-center cursor-pointer border select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a8387] bg-[#fbfefe] border-[#e2efef] shadow-[0_6px_18px_-8px_rgba(15,23,42,0.06)] transition-shadow duration-300 ${meta.hoverGlow}`}
              >
                <div className="mb-2 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Fluent3DCategoryIcon
                    id={cat.id}
                    isHovered={hoveredId === cat.id}
                    className="w-13 h-13 sm:w-15 sm:h-15 lg:w-18 lg:h-18"
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold text-[#12292c] group-hover:text-[#0a8387] whitespace-nowrap leading-tight transition-colors">
                  {meta.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
