import React from 'react';

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10" aria-busy="true" aria-label="در حال بارگذاری...">
      {/* SearchBar Skeleton */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-2xl border border-[#e2efef] space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          <div className="w-full lg:w-40 h-11 rounded-xl tandis-skeleton" />
          <div className="flex-1 w-full h-11 rounded-xl tandis-skeleton" />
          <div className="w-full lg:w-28 h-11 rounded-xl tandis-skeleton" />
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-14 h-6 rounded-lg tandis-skeleton shrink-0" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-20 h-7 rounded-lg tandis-skeleton shrink-0" />
          ))}
        </div>
      </div>

      {/* HeroCarousel Skeleton */}
      <div className="w-full aspect-[16/9] sm:aspect-[2.3/1] lg:aspect-[2.6/1] max-h-[410px] rounded-2xl sm:rounded-3xl tandis-skeleton" />

      {/* CategoriesGrid Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-5 rounded-full bg-[#dcecec]" />
          <div className="w-32 h-5 rounded-lg tandis-skeleton" />
        </div>
        <div className="rounded-3xl bg-white border border-[#e2efef] px-4 py-6 sm:px-8 sm:py-8">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="w-34 h-34 sm:w-36 sm:h-36 md:w-38 md:h-38 lg:w-42 lg:h-42 rounded-full tandis-skeleton"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Strip Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="w-36 h-5 rounded-lg tandis-skeleton" />
          <div className="w-20 h-4 rounded-lg tandis-skeleton" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-[#e2efef] p-4 sm:p-5 space-y-3"
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

      {/* CTA Banner Skeleton */}
      <div className="w-full h-36 rounded-3xl tandis-skeleton" />
    </div>
  );
};
