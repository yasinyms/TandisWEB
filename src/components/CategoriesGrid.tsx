import React from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Car,
  ChevronLeft,
  HeartPulse,
  Scale,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import type { ServiceCategoryGroup } from '../types/tandis';
import { toPersianDigits, toPurePersianText } from '../services/tandisDefaults';

interface CategoriesGridProps {
  categories?: ServiceCategoryGroup[];
  selectedCategoryId: string;
  onSelectCategory: (categorySlug: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'cat-technical-repairs': Wrench,
  'cat-automotive-mechanic': Car,
  'cat-cleaning-moving': Truck,
  'cat-medical-nursing': HeartPulse,
  'cat-legal-judicial': Scale,
  'cat-beauty-personal': Sparkles,
  'cat-business-tech-industry': Briefcase,
  'cat-ride-request': Car,
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories = [],
  selectedCategoryId,
  onSelectCategory
}) => {
  // نمایش دسته‌های اصلی به همراه هر دسته‌بندی جدیدی که از نرم‌افزار تندیس مدیریت اضافه شده است
  const orderedCategories = [...categories].sort((a, b) => {
    if (a.slug === 'cat-ride-request') return 1;
    if (b.slug === 'cat-ride-request') return -1;
    return 0;
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#0a8387] rounded-full" />
          <h2 className="text-base sm:text-lg font-black text-[#12292c]">دسته‌بندی خدمات تندیس</h2>
        </div>
        <span className="text-xs font-bold text-[#5f777b]">
          انتخاب سریع از بین {toPersianDigits(orderedCategories.length)} گروه تخصصی
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {orderedCategories.map((group) => {
          const isSelected = selectedCategoryId === group.slug;
          const IconComponent = CATEGORY_ICONS[group.slug] || Wrench;

          return (
            <motion.button
              key={group.slug}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCategory(group.slug)}
              className={`group relative rounded-2xl p-4 sm:p-5 text-right transition-all duration-200 cursor-pointer border flex flex-col justify-between min-h-[124px] ${
                isSelected
                  ? 'bg-[#0a8387] text-white border-[#0a8387] shadow-[0_12px_28px_-10px_rgba(10,131,135,0.45)]'
                  : 'bg-white text-[#12292c] border-[#e4f0f0] shadow-[0_4px_18px_-8px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_26px_-10px_rgba(10,131,135,0.14)] hover:border-[#0a8387]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#effcfb] text-[#0a8387] group-hover:bg-[#0a8387] group-hover:text-white border border-[#d2eceb]'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                {group.isComingSoon ? (
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                    }`}
                  >
                    به‌زودی
                  </span>
                ) : (
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-white/15 text-white'
                        : 'bg-[#f4fafa] text-[#5f777b] group-hover:bg-[#0a8387] group-hover:text-white'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="mt-3.5 space-y-1">
                <div
                  className={`text-sm sm:text-[15px] font-black leading-snug transition-colors ${
                    isSelected ? 'text-white' : 'text-[#12292c] group-hover:text-[#0a8387]'
                  }`}
                >
                  {toPurePersianText(group.title)}
                </div>
                <p
                  className={`text-[11px] leading-4 line-clamp-1 font-medium ${
                    isSelected ? 'text-white/80' : 'text-[#627d81]'
                  }`}
                >
                  {toPurePersianText(group.subtitle)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
};
