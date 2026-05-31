import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label:string; href?:string }[];
  className?: string;
}

export function PageHeader({ title, subtitle, actions, breadcrumb, className }: Props) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-3 mb-6", className)}>
      <div className="flex-1 min-w-0">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {b.href
                  ? <a href={b.href} className="hover:text-surface-700 transition-colors">{b.label}</a>
                  : <span className="text-surface-600">{b.label}</span>
                }
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display text-2xl font-semibold text-surface-900 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
