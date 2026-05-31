"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Package, ArrowRightLeft, AlertTriangle, Truck, RotateCcw,
  Inbox, Box, Wrench, PackageX, CalendarDays, Bell, BarChart3, Users,
  Building2, MapPin, UserCheck, Warehouse, Hash, BookOpen, FileText,
  Mail, Shield, ChevronLeft, ChevronRight, LogOut, Settings, Layers
} from "lucide-react";

interface NavItem {
  label: string; href: string; icon: React.ReactNode;
  roles?: string[]; badge?: number;
}

const NAV: (NavItem | { group: string; items: NavItem[] })[] = [
  { label:"Tableau de bord", href:"/dashboard", icon:<LayoutDashboard className="w-4 h-4" /> },

  { group:"Tri & Expédition", items:[
    { label:"Triages",          href:"/triages",                icon:<Package className="w-4 h-4" /> },
    { label:"Recherche SET",    href:"/correspondances-set/search", icon:<Layers className="w-4 h-4" /> },
    { label:"Alertes RC",       href:"/alertes-rc",             icon:<AlertTriangle className="w-4 h-4" /> },
    { label:"Correspondances",  href:"/correspondances-set",    icon:<ArrowRightLeft className="w-4 h-4" /> },
  ]},

  { group:"Logistique", items:[
    { label:"Expéditions",       href:"/expeditions",           icon:<Truck className="w-4 h-4" /> },
    { label:"Retours",           href:"/retours-expedition",    icon:<RotateCcw className="w-4 h-4" /> },
    { label:"Réceptions",        href:"/receptions-logistique", icon:<Inbox className="w-4 h-4" /> },
    { label:"Pièces logistique", href:"/pieces-logistique",     icon:<Box className="w-4 h-4" /> },
  ]},

  { group:"Qualité", items:[
    { label:"Anomalies",         href:"/anomalies",             icon:<Wrench className="w-4 h-4" /> },
    { label:"Tri impossible",    href:"/pieces-tri-impossible", icon:<PackageX className="w-4 h-4" /> },
  ]},

  { group:"Personnel", items:[
    { label:"Congés",            href:"/conges",                icon:<CalendarDays className="w-4 h-4" /> },
    { label:"Notifications",     href:"/notifications",         icon:<Bell className="w-4 h-4" /> },
    { label:"Statistiques",      href:"/stats",                 icon:<BarChart3 className="w-4 h-4" /> },
  ]},

  { group:"Administration", items:[
    { label:"Utilisateurs",      href:"/admin/users",           icon:<Users className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"Fournisseurs",      href:"/admin/fournisseurs",    icon:<Building2 className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"Sites d'expéd.",    href:"/admin/sites-expedition",icon:<MapPin className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"Pilotes",           href:"/admin/pilotes",         icon:<UserCheck className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"Garages",           href:"/admin/garages",         icon:<Warehouse className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"SETs",              href:"/admin/sets",            icon:<Hash className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"Réf. pièces",       href:"/admin/references-piece",icon:<BookOpen className="w-4 h-4" />, roles:["ADMIN","MANAGER"] },
    { label:"Audit",             href:"/admin/audit-logs",      icon:<Shield className="w-4 h-4" />, roles:["ADMIN"] },
    { label:"Emails",            href:"/admin/mail-logs",       icon:<Mail className="w-4 h-4" />, roles:["ADMIN"] },
    { label:"Mentions légales",  href:"/admin/mentions-legales",icon:<FileText className="w-4 h-4" />, roles:["ADMIN"] },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const canSee = (roles?: string[]) =>
    !roles || roles.includes(user.role);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-surface-200 flex flex-col z-30",
      "transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-surface-100",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-surface-900 text-lg leading-tight">RPIC</p>
            <p className="text-xs text-surface-500 leading-tight">Guyancourt</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item, idx) => {
          if ("href" in item) {
            if (!canSee(item.roles)) return null;
            return (
              <Link
                key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }
          const visible = item.items.filter((i) => canSee(i.roles));
          if (!visible.length) return null;
          return (
            <div key={idx} className="mb-2">
              {!collapsed && (
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-2.5 py-1.5 mt-2">
                  {item.group}
                </p>
              )}
              {collapsed && <div className="border-t border-surface-100 my-1.5 mx-1" />}
              {visible.map((i) => (
                <Link
                  key={i.href} href={i.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm mb-0.5 transition-all",
                    isActive(i.href)
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-surface-600 hover:bg-surface-50 hover:text-surface-900",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? i.label : undefined}
                >
                  {i.icon}
                  {!collapsed && <span>{i.label}</span>}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer : user + toggle */}
      <div className="border-t border-surface-100 p-2 space-y-1">
        {!collapsed && (
          <Link href="/profil" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-surface-600 hover:bg-surface-50 transition-colors">
            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-surface-800 truncate">{user.prenom} {user.nom}</p>
              <p className="text-xs text-surface-400 truncate">{user.role}</p>
            </div>
          </Link>
        )}
        <button
          onClick={() => logout()}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-surface-500 hover:text-red-600 hover:bg-red-50 transition-colors",
            collapsed && "justify-center"
          )}
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 text-surface-400 hover:text-surface-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
