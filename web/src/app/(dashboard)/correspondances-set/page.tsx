//web/src/app/(dashboard)/correspondances-set/page.tsx
"use client";
import { useEffect, useState } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { fmt, statutCorrColor } from "@/lib/utils";
import { STATUT_CORR_LABELS } from "@/lib/constants";
import { ArrowRightLeft, CheckCircle2, AlertTriangle, Trash2, Layers } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Corr {
  id:string; nitg:string; refPieceCause:string; setId:string;
  nbConfirmations:number; statut:string; cleUnique:string;
  set?:{id:string;siteExpedition?:{nom:string;code6Plus2:string}};
  fournisseur?:{nom:string};
  updatedAt:string;
}

export default function CorrespondancesPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<Corr>("/correspondances-set");
  const [search, setSearch] = useState("");
  const [delId, setDelId] = useState<string|null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(1); }, []);

  async function confirm(id: string) {
    try {
      await api.post(`/correspondances-set/${id}/confirmer`, {});
      toast.success("Correspondance confirmée"); load(meta.page);
    } catch { toast.error("Erreur"); }
  }

  async function del() {
    if (!delId) return;
    setDeleting(true);
    try {
      await api.delete(`/correspondances-set/${delId}`);
      toast.success("Supprimé"); setDelId(null); load(meta.page);
    } catch { toast.error("Erreur"); } finally { setDeleting(false); }
  }

  return (
    <>
      <Header title="Correspondances SET" />
      <PageHeader title="Correspondances SET"
        subtitle="Référentiel auto-apprenant NITG → SET"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Correspondances"}]}
        actions={<Link href="/correspondances-set/search"><Button variant="outline" icon={<Layers className="w-4 h-4"/>}>Recherche SET</Button></Link>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={(v)=>{setSearch(v);setFilter("nitg",v);}} placeholder="NITG…" className="w-48"/>
        <SearchInput value={filters.refPieceCause??""} onChange={(v)=>setFilter("refPieceCause",v)} placeholder="Réf. pièce…" className="w-48"/>
        <Select
          options={[{value:"",label:"Tous statuts"},...Object.entries(STATUT_CORR_LABELS).map(([v,l])=>({value:v,label:l}))]}
          value={filters.statut??""} onChange={(e)=>setFilter("statut",e.target.value)} className="w-44"/>
      </div>

      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<ArrowRightLeft className="w-10 h-10"/>} title="Aucune correspondance"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["NITG","Réf. pièce","SET","Site","Fournisseur","Confirmations","Statut","MàJ","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((c)=>(
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{c.nitg}</td>
                    <td className="px-4 py-3 font-mono text-surface-700">{c.refPieceCause}</td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">{c.setId}</td>
                    <td className="px-4 py-3 text-xs text-surface-600">{c.set?.siteExpedition?.code6Plus2 ?? "—"}</td>
                    <td className="px-4 py-3 text-surface-600">{c.fournisseur?.nom ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-center">{c.nbConfirmations}</td>
                    <td className="px-4 py-3"><Badge color={statutCorrColor(c.statut)}>{STATUT_CORR_LABELS[c.statut]??c.statut}</Badge></td>
                    <td className="px-4 py-3 text-surface-400 text-xs whitespace-nowrap">{fmt.date(c.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {c.statut==="PROPOSEE" && (
                          <Button size="xs" variant="outline" icon={<CheckCircle2 className="w-3.5 h-3.5"/>} onClick={()=>confirm(c.id)}>Confirmer</Button>
                        )}
                        <Button size="xs" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5 text-red-500"/>} onClick={()=>setDelId(c.id)}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100">
            <Pagination meta={meta} onPage={goToPage}/>
          </div>
        </Card>
      )}
      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={del} loading={deleting}
        title="Supprimer la correspondance"
        message="Cette correspondance sera définitivement supprimée du référentiel. Continuer ?"
        confirmLabel="Supprimer"/>
    </>
  );
}
