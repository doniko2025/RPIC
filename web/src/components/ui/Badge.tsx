"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;   // classes tailwind ex: "bg-green-100 text-green-800"
  dot?: boolean;
  size?: "sm"|"md";
  className?: string;
}

export function Badge({ children, color="bg-gray-100 text-gray-700", dot, size="md", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      size==="sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      color, className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />}
      {children}
    </span>
  );
}
