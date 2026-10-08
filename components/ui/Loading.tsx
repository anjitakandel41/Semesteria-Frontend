import React from "react";

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = "Loading...", className = "" }: LoadingProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500 dark:border-slate-800 dark:border-t-sky-400" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
        {message}
      </p>
      <span className="sr-only">Loading</span>
    </div>
  );
}
