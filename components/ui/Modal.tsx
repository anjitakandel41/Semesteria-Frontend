"use client";

import React, { useEffect } from "react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  confirmVariant?: "primary" | "secondary" | "danger" | "outline";
  onConfirm?: () => void;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = "Confirm",
  confirmVariant = "primary",
  onConfirm,
  isLoading = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3
              id="modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {children && <div className="my-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
