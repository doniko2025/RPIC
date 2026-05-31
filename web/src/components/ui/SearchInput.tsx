"use client";
import React, { useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { value: string; onChange: (v:string)=>void; placeholder?:string; className?:string; }

export function SearchInput({ value, onChange, placeholder="Rechercher…", className }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const clear = useCallback(() => { onChange(""); ref.current?.focus(); }, [onChange]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 w-4 h-4 text-surface-400 pointer-events-none" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg border border-surface-300 bg-white text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
      />
      {value && (
        <button onClick={clear} className="absolute right-2.5 text-surface-400 hover:text-surface-700">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
