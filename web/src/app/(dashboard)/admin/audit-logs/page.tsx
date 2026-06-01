"use client";
import { useEffect, useState } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { fmt } from "@/lib/utils";
import { Shield } from "lucide-react";

interface AuditLog {
  id:string; action:string; entity?:string; entityId?:string;
  details?:string; ipAddress?:string; createdAt:string;
  user?:{nom:string;prenom:string;email:string};
}

const actionColor: Record<string,string> = {
  CREATE:"bg-green-100 text-green-800", UPDATE:"bg-blue-100 text-blue-800",
  DELETE:"bg-red-100 text-red-800",     LOGIN:"bg-purple-100 text-purple-800",
  LOGOUT:"bg-gray-100 text-gray-600",
};

export default function AuditLogsPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<AuditLog>("/audit-logs", { limit:50 });
  const [search, setSearch] = useState("");

  useEffect(()=>{ load(1); },[]);

  return (
    <>
      <Header title="Audit"/>
      <PageHeader title="Journal d'audit"
        subtitle="Toutes les actions effectuées sur le système"
        breadcrumb={[{label:"Admin",href:"/admin/users"},{label:"Audit"}]}
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={(v)=>{setSearch(v);setFilter("search",v);}} placeholder="Utilisateur, entité…" className="w-64"/>
        <Select options={[{value:"",label:"Toutes actions"},{value:"CREATE",label:"Création"},{value:"UPDATE",label:"Modification"},{value:"DELETE",label:"Suppression"},{value:"LOGIN",label:"Connexion"}]}
          value={filters.action??""} onChange={e=>setFilter("action",e.target.value)} className="w-48"/>
      </div>
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<Shield className="w-10 h-10"/>} title="Aucun log"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["Date","Utilisateur","Action","Entité","ID","IP"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map(l=>(
                  <tr key={l.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-xs text-surface-500 whitespace-nowrap">{fmt.datetime(l.createdAt)}</td>
                    <td className="px-4 py-3 text-xs">
                      {l.user ? <div><p className="font-medium text-surface-800">{l.user.prenom} {l.user.nom}</p><p className="text-surface-400">{l.user.email}</p></div> : "—"}
                    </td>
                    <td className="px-4 py-3"><Badge color={actionColor[l.action]??"bg-gray-100 text-gray-600"}>{l.action}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-600">{l.entity??"—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-400">{l.entityId ? l.entityId.slice(0,8)+"…" : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-400">{l.ipAddress??"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}
    </>
  );
}
