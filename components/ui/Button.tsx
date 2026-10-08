import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-semibold",
      md: "px-4 py-2 text-sm font-semibold",
      lg: "px-5 py-2.5 text-base font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white focus:ring-sky-400 shadow-sm shadow-sky-500/20",
      secondary:
        "bg-slate-900 hover:bg-black text-white focus:ring-slate-400 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 shadow-sm",
      danger:
        "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-sm",
      outline:
        "border border-slate-200 bg-white text-slate-800 hover:bg-sky-50/80 hover:text-sky-700 hover:border-sky-300 focus:ring-sky-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-sky-950/40 dark:hover:border-sky-700 dark:hover:text-sky-300 shadow-2xs",
      ghost:
        "bg-transparent text-slate-700 hover:bg-sky-50 hover:text-sky-700 focus:ring-sky-400 dark:text-slate-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-300",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
