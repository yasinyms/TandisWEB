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
      className="space-y-3 lg:space-y-4"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 lg:h-5 bg-[#0a8387] rounded-full" />
          <h2 className="text-sm sm:text-base lg:text-lg font-black text-[#12292c]">دسته‌بندی خدمات</h2>
        </div>
        <span className="text-[11px] lg:text-xs font-bold text-[#5f777b]">
          {toPersianDigits(orderedCategories.length)} گروه تخصصی
        </span>
      </div>

      {/* نسخه ویژه موبایل آیفون (iOS Home Screen Squircle Grid) — کاملاً مینیمال و ۴ ستونه */}
      <div className="lg:hidden rounded-[28px] bg-white/95 backdrop-blur-xl border border-slate-200/80 p-4 shadow-[0_6px_24px_-10px_rgba(11,92,96,0.08)]">
        <div className="grid grid-cols-4 gap-x-2.5 gap-y-4">
          {orderedCategories.map((group) => {
            const isSelected = selectedCategoryId === group.slug;
            const IconComponent = CATEGORY_ICONS[group.slug] || Wrench;
            const shortTitle = toPurePersianText(group.title)
              .replace('خدمات ', '')
              .replace('تعمیرات و ', 'تعمیرات ')
              .replace('امداد و ', 'امداد ');

            return (
              <motion.button
                key={group.slug}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelectCategory(group.slug)}
                className="flex flex-col items-center text-center gap-1.5 cursor-pointer group select-none"
              >
                <div
                  className={`relative w-14 h-14 rounded-[19px] flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#0a8387] to-[#0b5c60] text-white shadow-[0_10px_20px_-6px_rgba(10,131,135,0.5)] ring-2 ring-[#0a8387]/30'
                      : 'bg-gradient-to-b from-[#f3fbfb] to-[#e6f5f5] text-[#0b5c60] border border-[#d0eaea] shadow-2xs active:bg-[#d8f0f0]'
                  }`}
                >
                  <IconComponent className="w-6 h-6 stroke-[2.1]" />
                  {group.isComingSoon && (
                    <span className="absolute -top-1.5 -left-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[8px] font-black shadow-2xs">
                      به‌زودی
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] leading-4 font-extrabold line-clamp-1 max-w-[76px] ${
                    isSelected ? 'text-[#0a8387] font-black' : 'text-[#12292c]'
                  }`}
                >
                  {shortTitle}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* نسخه دسکتاپ وب‌سایت (کارت‌های کامل ۴ ستونه) */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
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
              className={`group relative rounded-2xl p-5 text-right transition-all duration-200 cursor-pointer border flex flex-col justify-between min-h-[124px] ${
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
                  className={`text-[15px] font-black leading-snug transition-colors ${
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
