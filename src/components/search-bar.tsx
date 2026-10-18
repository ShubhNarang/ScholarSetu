"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by scheme name, course, state, or provider…",
  className,
  onSubmit,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] py-2.5 pl-10 pr-10 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/15 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search query"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#86868b] hover:bg-black/[0.05] hover:text-[#1d1d1f]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
