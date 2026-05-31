"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g,"-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-surface-700">
            {label}{props.required && <span className="text-brand-600 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref} id={inputId} rows={3}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-surface-900 resize-y",
            "placeholder:text-surface-400 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
            error ? "border-red-400" : "border-surface-300", className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
