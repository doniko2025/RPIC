"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  color?: "default"|"brand"|"green"|"orange"|"red";
  className?: string;
}

const colors = {
  default: "bg-white",
  brand:   "bg-brand-gradient text-white",
  green:   "bg-gradient-to-br from-green-600 to-emerald-500 text-white",
  orange:  "bg-gradient-to-br from-orange-500 to-amber-400 text-white",
  red:     "bg-gradient-to-br from-red-700 to-red-500 text-white",
};

export function StatCard({ label, value, sub, icon, trend, color="default", className }: Props) {
  const isColored = color !== "default";
  return (
    <div className={cn(
      "rounded-2xl p-5 shadow-card flex flex-col gap-2 transition-transform hover:-translate-y-0.5",
      colors[color], className,
      !isColored && "border border-surface-200"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-xs font-medium uppercase tracking-wider", isColored ? "text-white/80" : "text-surface-500")}>
          {label}
        </p>
        {icon && (
          <div className={cn("p-2 rounded-xl", isColored ? "bg-white/20" : "bg-surface-100")}>
            <div className={isColored ? "text-white" : "text-surface-600"}>{icon}</div>
          </div>
        )}
      </div>
      <p className={cn(
        "font-mono text-3xl font-bold leading-none",
        isColored ? "text-white" : "text-surface-900"
      )}>
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </p>
      <div className="flex items-center gap-2">
        {sub && <p className={cn("text-xs", isColored ? "text-white/70" : "text-surface-500")}>{sub}</p>}
        {trend && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-md",
            isColored ? "bg-white/20 text-white" :
            trend.value >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
