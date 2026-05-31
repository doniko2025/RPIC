"use client";
import { useEffect, useState } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { fmt, transporteurColor } from "@/lib/utils";
import { Plus, Inbox } from "lucide-react";
import toast from "react-hot-toast";

interface Reception {
  id:string; numeroReception:string; dateReception:string;
  transporteur?:string; nbPiecesRecues:number; statut:string;
  recepteur:{nom:string;prenom:string};
}

export default function ReceptionsPage() {
  const { data, meta, loading, load, setFilter, goToPage } = usePagination<Reception>("/receptions-logistique");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ numeroReception:"", dateReception:"", transporteur:"DHL", nbPiecesRecues:"1", commentaire:"" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(()=>{ load(1); },[]);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await api.post("/receptions-logistique", { ...form, nbPiecesRecues: Number(form.nbPiecesRecues) });
      toast.success("Réception enregistrée"); setModal(false); load(1);
    } catch(err:unknown){ setError((err as {message?:string}).message??"Erreur"); } finally { setSaving(false); }
  }
  const up = (k:string,v:string) => setForm(f=>({...f,[k]:v}));

  return (
    <>
      <Header title="Réceptions logistique"/>
      <PageHeader title="Réceptions logistique"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Réceptions"}]}
        actions={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setModal(true)}>Nouvelle réception</Button>}
      />
      <div className="flex gap-3 mb-5">
        <SearchInput value={search} onChange={(v)=>{setSearch(v);setFilter("search",v);}} className="w-64"/>
      </div>
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<Inbox className="w-10 h-10"/>} title="Aucune réception"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["N° Réception","Date","Transporteur","Pièces reçues","Statut","Récepteur"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((r)=>(
                  <tr key={r.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{r.numeroReception}</td>
                    <td className="px-4 py-3 text-xs text-surface-600 whitespace-nowrap">{fmt.datetime(r.dateReception)}</td>
                    <td className="px-4 py-3">{r.transporteur && <Badge color={transporteurColor(r.transporteur)}>{r.transporteur}</Badge>}</td>
                    <td className="px-4 py-3 font-mono text-center font-bold">{r.nbPiecesRecues}</td>
                    <td className="px-4 py-3"><Badge color="bg-green-100 text-green-800">{r.statut}</Badge></td>
                    <td className="px-4 py-3 text-surface-600 text-xs">{r.recepteur.prenom} {r.recepteur.nom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouvelle réception"
        footer={<><Button variant="secondary" onClick={()=>setModal(false)}>Annuler</Button><Button onClick={create} loading={saving}>Enregistrer</Button></>}>
        <form onSubmit={create} className="space-y-4">
          {error && <Alert type="error" message={error}/>}
          <Input label="N° réception *" value={form.numeroReception} onChange={e=>up("numeroReception",e.target.value)} required className="font-mono"/>
          <Input label="Date réception *" type="datetime-local" value={form.dateReception} onChange={e=>up("dateReception",e.target.value)} required/>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Transporteur" value={form.transporteur} onChange={e=>up("transporteur",e.target.value)}
              options={[{value:"DHL",label:"DHL"},{value:"TRANS",label:"TRANS"},{value:"AUTRE",label:"Autre"}]}/>
            <Input label="Nb pièces reçues *" type="number" min="1" value={form.nbPiecesRecues} onChange={e=>up("nbPiecesRecues",e.target.value)} required/>
          </div>
        </form>
      </Modal>
    </>
  );
}
