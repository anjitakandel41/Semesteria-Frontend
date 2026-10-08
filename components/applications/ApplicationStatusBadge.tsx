import React from "react";
import { ApplicationStage } from "@/types";

interface ApplicationStatusBadgeProps {
  stage: ApplicationStage;
  className?: string;
}

export function ApplicationStatusBadge({
  stage,
  className = "",
}: ApplicationStatusBadgeProps) {
  const stageStyles: Record<
    ApplicationStage,
    { bg: string; text: string; dot: string; border: string }
  > = {
    APPLIED: {
      bg: "bg-sky-50 dark:bg-sky-950/60",
      text: "text-sky-700 dark:text-sky-300",
      dot: "bg-sky-500",
      border: "border-sky-200 dark:border-sky-800",
    },
    SHORTLISTED: {
      bg: "bg-purple-50 dark:bg-purple-950/50",
      text: "text-purple-700 dark:text-purple-300",
      dot: "bg-purple-500",
      border: "border-purple-200 dark:border-purple-900",
    },
    INTERVIEWED: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-700 dark:text-amber-300",
      dot: "bg-amber-500",
      border: "border-amber-200 dark:border-amber-900",
    },
    HIRED: {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      text: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
      border: "border-emerald-200 dark:border-emerald-900",
    },
    REJECTED: {
      bg: "bg-rose-50 dark:bg-rose-950/50",
      text: "text-rose-700 dark:text-rose-300",
      dot: "bg-rose-500",
      border: "border-rose-200 dark:border-rose-900",
    },
    WITHDRAWN: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      dot: "bg-slate-400",
      border: "border-slate-200 dark:border-slate-700",
    },
  };

  const currentStyle = stageStyles[stage] || stageStyles.APPLIED;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${currentStyle.dot}`} />
      {stage}
    </span>
  );
}
