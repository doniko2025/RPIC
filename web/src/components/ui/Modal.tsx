"use client";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm"|"md"|"lg"|"xl"|"full";
  footer?: React.ReactNode;
}

const sizes = { sm:"max-w-sm", md:"max-w-md", lg:"max-w-2xl", xl:"max-w-4xl", full:"max-w-6xl" };

export function Modal({ open, onClose, title, children, size="md", footer }: ModalProps) {
  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-2xl flex flex-col",
          "max-h-[90vh] animate-slide-up",
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 shrink-0">
            <h2 className="font-display text-xl font-semibold text-surface-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-end gap-3 shrink-0 bg-surface-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
