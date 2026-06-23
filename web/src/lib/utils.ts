//web/src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // FIX : fromNow() nécessite ce plugin
import "dayjs/locale/fr";

dayjs.extend(relativeTime); // FIX : doit être appelé avant tout usage de fromNow()
dayjs.locale("fr");

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export const fmt = {
  date:     (d?: string | Date | null) => d ? dayjs(d).format("DD/MM/YYYY")       : "—",
  datetime: (d?: string | Date | null) => d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—",
  relative: (d?: string | Date | null) => d ? dayjs(d).fromNow()                  : "—",
  num:      (n?: number | null, dec=0) => n != null ? n.toLocaleString("fr-FR", {maximumFractionDigits:dec}) : "—",
  pct:      (n?: number | null)        => n != null ? `${Math.round(n * 100)}%`    : "—",
};

export function joursRestants(d: string | Date): number {
  return dayjs(d).diff(dayjs(), "day");
}

export function colorJours(restants: number): string {
  if (restants <= 0) return "text-red-700 bg-red-100";
  if (restants <= 2) return "text-orange-700 bg-orange-100";
  return "text-green-700 bg-green-100";
}

export function statutRCColor(s: string): string {
  const m: Record<string, string> = {
    EN_ATTENTE_EXPEDITION: "bg-yellow-100 text-yellow-800",
    EXPEDIE:               "bg-green-100 text-green-800",
    DEPASSEMENT_DELAI:     "bg-red-100 text-red-800",
    CLOTURE:               "bg-gray-100 text-gray-600",
  };
  return m[s] ?? "bg-gray-100 text-gray-600";
}

export function statutICColor(s: string): string {
  const m: Record<string, string> = {
    EN_KARDEX:    "bg-blue-100 text-blue-800",
    EN_ANALYSE:   "bg-purple-100 text-purple-800",
    A_REEXPEDIER: "bg-orange-100 text-orange-800",
    REEXPEDIE:    "bg-green-100 text-green-800",
    CAFFUTE:      "bg-gray-100 text-gray-600",
  };
  return m[s] ?? "bg-gray-100 text-gray-600";
}

export function statutCorrColor(s: string): string {
  const m: Record<string, string> = {
    PROPOSEE:   "bg-yellow-100 text-yellow-800",
    CONFIRMEE:  "bg-green-100 text-green-800",
    EN_CONFLIT: "bg-red-100 text-red-800",
    OBSOLETE:   "bg-gray-100 text-gray-500",
  };
  return m[s] ?? "bg-gray-100 text-gray-600";
}

export function transporteurColor(t: string): string {
  return t === "DHL"   ? "bg-yellow-100 text-yellow-800"
       : t === "TRANS" ? "bg-blue-100 text-blue-800"
       :                 "bg-gray-100 text-gray-700";
}

export function roleLabel(r: string): string {
  return r === "ADMIN" ? "Admin" : r === "MANAGER" ? "Manager" : "Employé";
}

export function roleBadge(r: string): string {
  return r === "ADMIN"   ? "bg-brand-100 text-brand-800"
       : r === "MANAGER" ? "bg-purple-100 text-purple-800"
       :                   "bg-gray-100 text-gray-700";
}

export function truncate(s: string, n = 80): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}