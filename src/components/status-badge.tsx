import { cn } from "@/lib/utils";
import { ApplicationStatus, VerificationStatus } from "@/types/scholarship";

interface StatusBadgeProps {
  status: ApplicationStatus | VerificationStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "verified_open":
    case "verified":
    case "Accepted":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[11px] font-medium text-[#047857]",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
          {status === "verified_open"
            ? "Verified & Open"
            : status === "verified"
            ? "Verified Source"
            : "Accepted"}
        </span>
      );

    case "opening_later":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#f0f6ff] px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          Opening Soon
        </span>
      );

    case "deadline_passed":
    case "Rejected":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[11px] font-medium text-[#86868b]",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#86868b]" />
          {status === "deadline_passed" ? "Cycle Closed" : "Rejected"}
        </span>
      );

    case "needs_verification":
    case "Under Review":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#fffbeb] px-2.5 py-0.5 text-[11px] font-medium text-[#b45309]",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
          {status === "needs_verification" ? "Review Pending" : "Under Review"}
        </span>
      );

    case "Applied":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#f0f6ff] px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          Applied
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[11px] font-medium text-[#6e6e73]",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#a1a1a6]" />
          {status}
        </span>
      );
  }
}
