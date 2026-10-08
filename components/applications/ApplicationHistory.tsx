import React from "react";
import { ApplicationHistoryItem } from "@/types";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

interface ApplicationHistoryProps {
  history: ApplicationHistoryItem[];
  isLoading?: boolean;
}

export function ApplicationHistory({
  history,
  isLoading = false,
}: ApplicationHistoryProps) {
  if (isLoading) {
    return (
      <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Loading application timeline...
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        No transition history records available yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => {
          const isLast = idx === history.length - 1;
          const formattedDate = new Date(item.timestamp).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Dot */}
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 ring-8 ring-white dark:ring-slate-900">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        <span className="text-sky-600 dark:text-sky-400 font-bold">{item.actor}</span>{" "}
                        transitioned stage
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <ApplicationStatusBadge stage={item.previous_stage} />
                        <span className="text-slate-400 font-bold text-xs">→</span>
                        <ApplicationStatusBadge stage={item.new_stage} />
                      </div>
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <time dateTime={item.timestamp}>{formattedDate}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
