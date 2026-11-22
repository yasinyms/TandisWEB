import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import type { PromoSlide } from '../types/tandis';
import { toPurePersianText } from '../services/tandisDefaults';

interface HeroCarouselProps {
  slides: PromoSlide[];
  onSlideAction?: (slide: PromoSlide) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, onSlideAction }) => {
  const activeSlides = useMemo(() => {
    const filtered = (slides || []).filter((s) => s && s.is_active !== false);
    return filtered.sort((a, b) => Number(a.order_index ?? 999) - Number(b.order_index ?? 999));
  }, [slides]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeIndex = activeSlides.length > 0 ? currentSlide % activeSlides.length : 0;
  const slide = activeSlides[safeIndex];
  const durationMs = Math.max(4, Number(slide?.duration_seconds || 6)) * 1000;

  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, durationMs);
    return () => window.clearInterval(timer);
  }, [isPaused, activeSlides.length, durationMs, safeIndex]);

  if (!slide) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const title = toPurePersianText(slide.title) || slide.title;
  const subtitle = toPurePersianText(slide.subtitle) || slide.subtitle;
  const hasImage = Boolean(slide.image_url && slide.image_url.trim().length > 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onSlideAction?.(slide)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSlideAction?.(slide);
        }
      }}
      className="relative w-full aspect-[16/9] sm:aspect-[2.3/1] lg:aspect-[2.6/1] max-h-[410px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0b5c60] shadow-[0_10px_32px_-18px_rgba(11,92,96,0.28)] cursor-pointer group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c60]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {hasImage ? (
            <img
              src={slide.image_url}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full tandis-calm-gradient" />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-5">
            <div className="space-y-0.5 text-right min-w-0 max-w-xl">
              <h1 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-snug line-clamp-1">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs lg:text-sm text-white/85 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>

            <span className="self-start sm:self-end inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/95 group-hover:bg-white text-[#12292c] text-xs font-extrabold transition-all whitespace-nowrap shrink-0">
              <span>مشاهده</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="قبلی"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="بعدی"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3.5 left-4 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1.5 rounded-full"
          >
            {activeSlides.map((s, idx) => {
              const isCurrent = idx === safeIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`اسلاید ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent ? 'w-5 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </motion.section>
  );
};
