"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", handleEsc);
      return () => { document.removeEventListener("keydown", handleEsc); document.body.style.overflow = ""; };
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconBg = variant === "danger" ? "bg-red-100" : variant === "warning" ? "bg-amber-100" : "bg-blue-100";
  const iconColor = variant === "danger" ? "text-red-500" : variant === "warning" ? "text-amber-500" : "text-blue-500";
  const btnClass = variant === "danger"
    ? "bg-red-500 hover:bg-red-600 text-white"
    : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600 text-white"
      : "bg-emerald-500 hover:bg-emerald-600 text-white";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm animate-slide-up sm:animate-none">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {variant === "danger" ? <Trash2 className={`w-5 h-5 ${iconColor}`} /> : <AlertTriangle className={`w-5 h-5 ${iconColor}`} />}
          </div>
          <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p id="confirm-desc" className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${btnClass} disabled:opacity-50`}
          >
            {loading ? "A processar..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
