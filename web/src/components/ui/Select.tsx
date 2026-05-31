"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Option { value: string; label: string; }

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>,"children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-surface-700">
            {label}
            {props.required && <span className="text-brand-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm text-surface-900",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
              "disabled:bg-surface-50 disabled:cursor-not-allowed transition-colors",
              error ? "border-red-400" : "border-surface-300",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
