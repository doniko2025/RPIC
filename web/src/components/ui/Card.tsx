import { cn } from "@/lib/utils";
import React from "react";

interface CardProps { children: React.ReactNode; className?: string; glass?: boolean; }

export function Card({ children, className, glass }: CardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-surface-200 shadow-card",
      glass ? "glass" : "bg-white",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-b border-surface-100", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-t border-surface-100 bg-surface-50 rounded-b-2xl", className)}>{children}</div>;
}
