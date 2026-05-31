import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center gap-3", className)}>
      {icon && <div className="text-surface-300 mb-1">{icon}</div>}
      <p className="font-display text-lg font-semibold text-surface-700">{title}</p>
      {description && <p className="text-sm text-surface-500 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
