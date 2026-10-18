"use client";

import { cn } from "@/lib/utils";

interface CategoryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

export default function CategoryChip({
  label,
  active,
  onClick,
  count,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
        active
          ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30"
          : "border border-slate-200/90 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
