import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Store, Download } from 'lucide-react';

interface CtaBannerProps {
  onOpenProviderSignup?: () => void;
  onExploreAllListings?: () => void;
  onOpenDownloads?: () => void;
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function toPersianFormattedNumber(num: number, withCommas = true): string {
  const rounded = Math.round(num);
  const str = withCommas
    ? rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : rounded.toString();
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export const CtaBanner: React.FC<CtaBannerProps> = ({
  onOpenProviderSignup,
  onOpenDownloads,
}) => {
  const statsContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = statsContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEnteredView) return;

    let animationFrameId: number;
    const duration = 1400;
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      setProgress(easedProgress);

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      }
    };

    animationFrameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasEnteredView]);

  const stats = [
    {
      value: `${toPersianFormattedNumber(5200000 * progress, true)}+`,
      label: 'کاربر فعال',
      valueColor: 'text-[#0b5c60]',
    },
    {
      value: `${toPersianFormattedNumber(100 * progress, false)}٪`,
      label: 'احراز هویت',
      valueColor: 'text-[#c98000]',
    },
    {
      value: `${toPersianFormattedNumber(85000 * progress, true)}+`,
      label: 'متخصص و همکار',
      valueColor: 'text-[#0b5c60]',
    },
    {
      value: `${toPersianFormattedNumber(24 * progress, false)}/${toPersianFormattedNumber(7 * progress, false)}`,
      label: 'پشتیبانی آنلاین',
      valueColor: 'text-[#c98000]',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-3xl bg-gradient-to-l from-[#0b5c60] to-[#063c3f] px-6 py-7 sm:px-10 sm:py-9 text-white shadow-[0_14px_38px_-18px_rgba(6,53,56,0.4)]"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center lg:text-right">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              همکار تندیس شوید
            </h2>
            <p className="text-xs sm:text-sm text-white/85">
              دریافت سفارش آنلاین در سراسر ایران، بدون واسطه.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={onOpenProviderSignup}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#f2a900] hover:bg-[#f6b826] text-[#12292c] font-extrabold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <Store className="w-4 h-4" />
              <span>ثبت‌نام همکار</span>
            </button>
            {onOpenDownloads && (
              <button
                type="button"
                onClick={onOpenDownloads}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/12 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>دانلود اپلیکیشن</span>
              </button>
            )}
          </div>
        </div>
      </motion.section>

      <div
        ref={statsContainerRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl px-4 py-5 border border-[#e4f0f0] text-center space-y-1"
          >
            <div className={`text-xl sm:text-2xl font-black tabular-nums ${stat.valueColor}`}>
              {stat.value}
            </div>
            <div className="text-xs text-[#5f777b] font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
