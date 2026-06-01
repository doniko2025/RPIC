"use client";
import { useEffect } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { fmt } from "@/lib/utils";
import { Mail, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

interface MailLog {
  id:string; to:string; subject:string; statut:string; tentatives:number;
  erreur?:string; sentAt?:string; createdAt:string;
}

export default function MailLogsPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<MailLog>("/mail-logs", { limit:50 });

  useEffect(()=>{ load(1); },[]);

  async function retry(id:string) {
    try {
      await api.post("/mail-logs/retry",{ id });
      toast.success("Renvoi planifié"); load(meta.page);
    } catch { toast.error("Erreur"); }
  }

  return (
    <>
      <Header title="Emails"/>
      <PageHeader title="Journal des emails"
        breadcrumb={[{label:"Admin",href:"/admin/users"},{label:"Emails"}]}
      />
      <div className="flex gap-3 mb-5">
        <Select options={[{value:"",label:"Tous"},{value:"ENVOYE",label:"Envoyé"},{value:"ECHEC",label:"Échec"},{value:"EN_ATTENTE",label:"En attente"}]}
          value={filters.statut??""} onChange={e=>setFilter("statut",e.target.value)} className="w-44"/>
      </div>
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<Mail className="w-10 h-10"/>} title="Aucun email"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["Destinataire","Sujet","Statut","Tentatives","Envoyé le","Erreur",""].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map(m=>(
                  <tr key={m.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-surface-700">{m.to}</td>
                    <td className="px-4 py-3 text-surface-700 max-w-[200px] truncate">{m.subject}</td>
                    <td className="px-4 py-3">
                      <Badge color={m.statut==="ENVOYE"?"bg-green-100 text-green-800":m.statut==="ECHEC"?"bg-red-100 text-red-800":"bg-yellow-100 text-yellow-800"}>
                        {m.statut}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-center">{m.tentatives}</td>
                    <td className="px-4 py-3 text-xs text-surface-400 whitespace-nowrap">{m.sentAt?fmt.datetime(m.sentAt):"—"}</td>
                    <td className="px-4 py-3 text-xs text-red-600 max-w-[160px] truncate">{m.erreur??"—"}</td>
                    <td className="px-4 py-3">
                      {m.statut==="ECHEC" && (
                        <Button size="xs" variant="ghost" icon={<RotateCcw className="w-3.5 h-3.5"/>} onClick={()=>retry(m.id)}>Renvoyer</Button>
                      )}
                    </td>
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
