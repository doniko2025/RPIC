//web/src/components/layout/Header.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Bell, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get<number>("/notifications/unread-count")
      .then((n) => typeof n === "number" && setUnread(n))
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 border-b border-surface-200 bg-white/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-20">
      {title && (
        <h1 className="font-display text-xl font-semibold text-surface-900 truncate">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <Link href="/profil"
          className="p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
        {user && (
          <Link href="/profil"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-surface-800 leading-none">{user.prenom} {user.nom}</p>
              <p className="text-[10px] text-surface-500 leading-none mt-0.5">{user.role}</p>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
