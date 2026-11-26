import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { SEARCH_TRENDS } from '../data/mockData';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentCity: string;
  isLoggedIn?: boolean;
  onSearchSubmit: () => void;
  onOpenCityModal?: () => void;
  selectedCategoryName?: string;
  onResetCategory?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  currentCity,
  isLoggedIn = false,
  onSearchSubmit,
  onOpenCityModal,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-white p-3 sm:p-4 rounded-2xl shadow-[0_4px_20px_rgba(11,92,96,0.04)] border border-[#e2efef]"
    >
      <div className="flex flex-col lg:flex-row items-center gap-2.5">
        {isLoggedIn && (
          <div className="w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={onOpenCityModal}
              className="w-full lg:w-40 flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl bg-[#f4fafa] hover:bg-[#e7f4f4] border border-[#dcecec] text-[#12292c] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#0b5c60] shrink-0" />
                <span className="truncate">{currentCity}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#5f777b] shrink-0" />
            </button>
          </div>
        )}

        <div className="flex-1 w-full relative flex items-center">
          <Search className="w-4 h-4 absolute right-3.5 text-[#5f777b] pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="جستجوی خدمت..."
            className="w-full pl-9 pr-10 py-3 rounded-xl bg-white text-[#12292c] placeholder:text-[#7c9296] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0b5c60]/18 border border-[#d6e5e5] focus:border-[#0b5c60] transition-all text-right"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="پاک کردن"
              className="absolute left-2.5 p-1 rounded-full text-[#64748b] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={onSearchSubmit}
            className="w-full lg:w-auto flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <span>جستجو</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[#5f777b] font-semibold shrink-0 ml-0.5">پرتقاضا:</span>
        {SEARCH_TRENDS.map((trend) => (
          <button
            key={trend}
            type="button"
            onClick={() => {
              onSearchChange(trend);
              onSearchSubmit();
            }}
            className="px-3 py-1 rounded-lg bg-[#f4fafa] hover:bg-[#e5f3f3] text-[#12292c] border border-[#e2efef] transition-colors shrink-0 whitespace-nowrap cursor-pointer text-xs font-medium"
          >
            {trend}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
