import React from "react";
import { JobStatus } from "@/types";

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className = "" }: JobStatusBadgeProps) {
  const isOpen = status === "OPEN";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
        isOpen
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
          isOpen ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}
