import { cn } from "@/lib/utils";
import { ApplicationStatus, VerificationStatus } from "@/types/scholarship";
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

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
            "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80",
            className
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {status === "verified_open"
            ? "Verified & Open"
            : status === "verified"
            ? "Verified Official"
            : "Accepted"}
        </span>
      );

    case "opening_later":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200/80",
            className
          )}
        >
          <Clock className="h-3.5 w-3.5 text-sky-600" />
          Opening Soon
        </span>
      );

    case "deadline_passed":
    case "Rejected":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200/80",
            className
          )}
        >
          <XCircle className="h-3.5 w-3.5 text-rose-600" />
          {status === "deadline_passed" ? "Deadline Passed" : "Rejected"}
        </span>
      );

    case "needs_verification":
    case "Under Review":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80",
            className
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          {status === "needs_verification" ? "Needs Verification" : "Under Review"}
        </span>
      );

    case "Applied":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80",
            className
          )}
        >
          <Clock className="h-3.5 w-3.5 text-indigo-600" />
          Applied
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700",
            className
          )}
        >
          <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
          {status}
        </span>
      );
  }
}
