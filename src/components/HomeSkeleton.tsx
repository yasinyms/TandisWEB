import React from 'react';

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10" aria-busy="true" aria-label="در حال بارگذاری...">
      {/* نوار جستجو و انتخاب شهر (SearchBar Skeleton) */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-2xl shadow-[0_4px_20px_rgba(11,92,96,0.04)] border border-[#e2efef] space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          <div className="w-full lg:w-40 h-11 rounded-xl tandis-skeleton" />
          <div className="flex-1 w-full h-11 rounded-xl tandis-skeleton" />
          <div className="w-full lg:w-28 h-11 rounded-xl tandis-skeleton" />
        </div>
        <div className="flex items-center gap-2 overflow-hidden pt-0.5">
          <div className="w-14 h-6 rounded-lg tandis-skeleton shrink-0" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-24 h-7 rounded-lg tandis-skeleton shrink-0" />
          ))}
        </div>
      </div>

      {/* اسلایدر عکس‌دار اصلی (HeroCarousel Skeleton) */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.3/1] lg:aspect-[2.6/1] max-h-[410px] rounded-2xl sm:rounded-3xl border border-[#e2efef] bg-white p-4 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden shadow-[0_10px_32px_-18px_rgba(11,92,96,0.12)]">
        <div className="absolute inset-0 tandis-skeleton opacity-65" />
        <div className="relative z-10 flex justify-end">
          <div className="w-20 h-6 rounded-full bg-white/80 backdrop-blur-xs px-2.5 flex items-center justify-center gap-1.5">
            <div className="w-5 h-1.5 rounded-full tandis-skeleton" />
            <div className="w-1.5 h-1.5 rounded-full tandis-skeleton" />
            <div className="w-1.5 h-1.5 rounded-full tandis-skeleton" />
          </div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-5">
          <div className="space-y-2 w-full max-w-md bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl">
            <div className="w-3/4 h-5 sm:h-6 rounded-lg tandis-skeleton" />
            <div className="w-1/2 h-3.5 sm:h-4 rounded-md tandis-skeleton hidden sm:block" />
          </div>
          <div className="w-24 h-9 rounded-xl bg-white/90 p-1.5 shrink-0">
            <div className="w-full h-full rounded-lg tandis-skeleton" />
          </div>
        </div>
      </div>

      {/* شبکه دسته‌بندی‌های سه‌بعدی (CategoriesGrid Skeleton - 8 circular cards) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-5 rounded-full bg-[#0a8387]/35" />
          <div className="w-32 h-5 rounded-lg tandis-skeleton" />
        </div>
        <div className="rounded-3xl bg-white border border-[#e2efef] px-4 py-6 sm:px-8 sm:py-8 shadow-[0_6px_26px_-14px_rgba(10,131,135,0.08)]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="w-34 h-34 sm:w-36 sm:h-36 md:w-38 md:h-38 lg:w-42 lg:h-42 rounded-full border border-[#e2efef] bg-[#fbfefe] flex flex-col items-center justify-center p-3 gap-2.5 shadow-[0_6px_18px_-8px_rgba(15,23,42,0.04)]"
              >
                <div className="w-13 h-13 sm:w-15 sm:h-15 lg:w-16 lg:h-16 rounded-2xl tandis-skeleton" />
                <div className="w-18 sm:w-20 h-3.5 rounded-md tandis-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* کارت‌های دسترسی سریع سرویس‌های تندیس (Quick Access Cards Skeleton) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#0a8387]/35" />
            <div className="w-36 h-5 rounded-lg tandis-skeleton" />
          </div>
          <div className="w-20 h-4 rounded-lg tandis-skeleton" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-[#e2efef] p-4 sm:p-5 shadow-[0_4px_16px_rgba(11,92,96,0.04)] flex flex-col justify-between gap-3"
            >
              <div className="w-11 h-11 rounded-xl tandis-skeleton" />
              <div className="space-y-2">
                <div className="w-24 h-4 rounded-md tandis-skeleton" />
                <div className="w-32 h-3 rounded-md tandis-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* بنر دعوت به همکاری + ۴ کارت آمار (CtaBanner & Stats Cards Skeleton) */}
      <div className="space-y-6">
        <div className="w-full rounded-3xl bg-white border border-[#e2efef] px-6 py-7 sm:px-10 sm:py-9 shadow-[0_6px_24px_rgba(11,92,96,0.05)]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="space-y-2.5 w-full lg:w-auto flex flex-col items-center lg:items-start">
              <div className="w-44 h-6 sm:h-7 rounded-xl tandis-skeleton" />
              <div className="w-64 sm:w-80 h-4 rounded-lg tandis-skeleton" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto shrink-0">
              <div className="w-full sm:w-36 h-11 rounded-xl tandis-skeleton" />
              <div className="w-full sm:w-36 h-11 rounded-xl tandis-skeleton" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl px-4 py-5 border border-[#e4f0f0] flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-20 sm:w-24 h-6 sm:h-7 rounded-lg tandis-skeleton" />
              <div className="w-16 sm:w-20 h-3.5 rounded-md tandis-skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ServiceCatalogSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری خدمات...">
      {/* جستجوی خدمات تخصصی */}
      <div className="rounded-3xl bg-white border border-[#dfecec] p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <div className="w-full h-11 rounded-2xl tandis-skeleton" />
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-14 h-6 rounded-lg tandis-skeleton shrink-0" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-7 rounded-xl tandis-skeleton shrink-0" />
          ))}
        </div>
      </div>

      {/* ۸ کارت گروه اصلی خدمات */}
      <div className="space-y-3">
        <div className="w-32 h-5 rounded-lg tandis-skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-white border border-[#dfecec] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-xl tandis-skeleton" />
                <div className="w-12 h-3.5 rounded-md tandis-skeleton" />
              </div>
              <div className="w-28 h-4 rounded-md tandis-skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* کارت‌های زیرخدمت تخصصی */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="w-40 h-5 rounded-lg tandis-skeleton" />
          <div className="w-64 h-3.5 rounded-md tandis-skeleton" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-white border border-[#dfecec] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-24 h-3.5 rounded-md tandis-skeleton" />
                  <div className="w-16 h-3.5 rounded-md tandis-skeleton" />
                </div>
                <div className="w-44 h-5 rounded-lg tandis-skeleton" />
                <div className="w-full h-3.5 rounded-md tandis-skeleton" />
                <div className="w-4/5 h-3.5 rounded-md tandis-skeleton" />
              </div>
              <div className="pt-3 border-t border-[#eef4f5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-24 h-3.5 rounded-md tandis-skeleton" />
                  <div className="w-28 h-4 rounded-md tandis-skeleton" />
                </div>
                <div className="w-full h-9 rounded-xl tandis-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
