"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/api";

interface Props { meta: PaginationMeta; onPage: (p: number) => void; className?: string; }

export function Pagination({ meta, onPage, className }: Props) {
  if (meta.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const pages: (number|"…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className={cn("flex items-center justify-between gap-4 text-sm", className)}>
      <span className="text-surface-500 text-xs font-mono">
        {from}–{to} sur {total.toLocaleString("fr-FR")}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-surface-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={cn(
                "min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-brand-gradient text-white shadow-sm"
                  : "hover:bg-surface-100 text-surface-700"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
