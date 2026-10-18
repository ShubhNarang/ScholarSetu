"use client";

import { Search, X, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
  onSubmit?: () => void;
  onTinyFishSearch?: (query: string) => void;
  isSearchingLive?: boolean;
  quickPills?: string[];
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search scholarships by scheme, course, caste, or state…",
  className,
  size = "default",
  onSubmit,
  onTinyFishSearch,
  isSearchingLive = false,
  quickPills,
}: SearchBarProps) {
  const isLarge = size === "large";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (onTinyFishSearch && value.trim()) {
        onTinyFishSearch(value.trim());
      } else if (onSubmit) {
        onSubmit();
      }
    }
  };

  const handleQuickClick = (pill: string) => {
    onChange(pill);
    if (onTinyFishSearch) {
      onTinyFishSearch(pill);
    }
  };

  return (
    <div className={cn("flex flex-col w-full gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center w-full rounded-2xl border transition-all duration-200",
          isLarge
            ? "bg-white p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-black/[0.1] focus-within:border-[#0071e3] focus-within:ring-4 focus-within:ring-[#0071e3]/10"
            : "bg-[#f5f5f7] p-1 border-black/[0.08] focus-within:border-[#0071e3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071e3]/15"
        )}
      >
        <div className="relative flex flex-1 items-center">
          <Search
            className={cn(
              "absolute text-[#86868b] pointer-events-none transition-colors",
              isLarge ? "left-4 h-5 w-5" : "left-3 h-4 w-4"
            )}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none font-normal",
              isLarge ? "py-3 pl-12 pr-10 text-[15px]" : "py-1.5 pl-9 pr-8 text-[13px]"
            )}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className={cn(
                "absolute rounded-full text-[#86868b] hover:bg-black/[0.05] hover:text-[#1d1d1f] transition-colors",
                isLarge ? "right-3 p-1.5" : "right-2 p-1"
              )}
            >
              <X className={cn(isLarge ? "h-4 w-4" : "h-3.5 w-3.5")} />
            </button>
          )}
        </div>

        {onTinyFishSearch && (
          <button
            type="button"
            onClick={() => onTinyFishSearch(value.trim())}
            disabled={!value.trim() || isSearchingLive}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all flex-shrink-0 cursor-pointer",
              isLarge ? "px-5 py-3 text-[14px]" : "px-3.5 py-1.5 text-[12px]",
              value.trim() && !isSearchingLive
                ? "bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98] shadow-xs"
                : "bg-black/[0.04] text-[#86868b] border border-black/[0.05] cursor-not-allowed opacity-75"
            )}
            title="Search in real-time across 33 official government & foundation portals using TinyFish"
          >
            {isSearchingLive ? (
              <>
                <RefreshCw className={cn("animate-spin text-white", isLarge ? "h-4 w-4" : "h-3.5 w-3.5")} />
                <span className="text-white">Scanning 33 Portals…</span>
              </>
            ) : (
              <>
                <Sparkles className={cn(isLarge ? "h-4 w-4" : "h-3.5 w-3.5")} />
                <span>TinyFish Live Search</span>
                <span className="hidden sm:inline-block rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold">
                  33 Sites
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {quickPills && quickPills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-[12px] text-[#6e6e73]">
          <span className="font-medium text-[#86868b]">Try searching:</span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handleQuickClick(pill)}
              className="rounded-full border border-black/[0.08] bg-[#fbfbfd] px-2.5 py-0.5 text-[11px] font-medium text-[#1d1d1f] hover:bg-black/[0.04] hover:border-black/[0.15] transition-all"
            >
              {pill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
