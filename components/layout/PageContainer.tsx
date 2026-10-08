import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  title,
  description,
  actions,
  className = "",
}: PageContainerProps) {
  return (
    <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {(title || actions) && (
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 mt-4 sm:mt-0">{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
