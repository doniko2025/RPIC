"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary"|"secondary"|"ghost"|"danger"|"outline";
type Size    = "xs"|"sm"|"md"|"lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant,string> = {
  primary:   "bg-brand-gradient text-white shadow-brand hover:opacity-90",
  secondary: "bg-surface-100 text-surface-800 border border-surface-200 hover:bg-surface-200",
  ghost:     "text-surface-700 hover:bg-surface-100",
  danger:    "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  outline:   "bg-white text-brand-700 border border-brand-300 hover:bg-brand-50",
};
const sizes: Record<Size,string> = {
  xs: "px-2.5 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant="primary", size="md", loading, icon, iconRight, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed font-sans",
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
);
Button.displayName = "Button";
