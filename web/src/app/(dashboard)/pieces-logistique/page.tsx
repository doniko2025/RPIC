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
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { fmt, statutICColor } from "@/lib/utils";
import { STATUT_IC_LABELS } from "@/lib/constants";
import { Plus, Box } from "lucide-react";
import toast from "react-hot-toast";

interface PieceLog {
  id:string; nitg:string; refPiece?:string; statut:string;
  emplacement?:string; nomPiece?:string;
  fournisseur?:{nom:string}; responsable:{nom:string;prenom:string};
  createdAt:string;
}

export default function PiecesLogistiquePage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } = usePagination<PieceLog>("/pieces-logistique");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ nitg:"", refPiece:"", nomPiece:"", statut:"EN_STOCK", emplacement:"" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(()=>{ load(1); },[]);

  async function create(e:React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const p={...form}; for(const k in p) if(!(p as Record<string,string>)[k]) delete (p as Record<string,string>)[k];
      await api.post("/pieces-logistique",p);
      toast.success("Pièce enregistrée"); setModal(false); load(1);
    } catch(err:unknown){ setError((err as {message?:string}).message??"Erreur"); } finally { setSaving(false); }
  }
  const up=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  return (
    <>
      <Header title="Pièces logistique"/>
      <PageHeader title="Pièces logistique"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Pièces logistique"}]}
        actions={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setModal(true)}>Ajouter</Button>}
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={(v)=>{setSearch(v);setFilter("nitg",v);}} placeholder="NITG…" className="w-52"/>
        <Select options={[{value:"",label:"Tous statuts"},{value:"EN_STOCK",label:"En stock"},{value:"SORTI",label:"Sorti"},{value:"DEFECTUEUX",label:"Défectueux"}]}
          value={filters.statut??""} onChange={e=>setFilter("statut",e.target.value)} className="w-44"/>
      </div>
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<Box className="w-10 h-10"/>} title="Aucune pièce logistique"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["NITG","Référence","Désignation","Emplacement","Statut","Fournisseur","Date"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map(p=>(
                  <tr key={p.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{p.nitg}</td>
                    <td className="px-4 py-3 font-mono text-surface-700">{p.refPiece???"—"}</td>
                    <td className="px-4 py-3 text-surface-700 max-w-[140px] truncate">{p.nomPiece???"—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-600">{p.emplacement???"—"}</td>
                    <td className="px-4 py-3"><Badge color={p.statut==="EN_STOCK"?"bg-green-100 text-green-800":p.statut==="SORTI"?"bg-blue-100 text-blue-800":"bg-red-100 text-red-800"}>{p.statut}</Badge></td>
                    <td className="px-4 py-3 text-surface-600">{p.fournisseur?.nom???"—"}</td>
                    <td className="px-4 py-3 text-surface-400 text-xs whitespace-nowrap">{fmt.date(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Ajouter une pièce"
        footer={<><Button variant="secondary" onClick={()=>setModal(false)}>Annuler</Button><Button onClick={create} loading={saving}>Enregistrer</Button></>}>
        <form onSubmit={create} className="space-y-4">
          {error && <Alert type="error" message={error}/>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="NITG *" value={form.nitg} onChange={e=>up("nitg",e.target.value.toUpperCase())} required maxLength={4} className="font-mono"/>
            <Input label="Référence" value={form.refPiece} onChange={e=>up("refPiece",e.target.value.toUpperCase())} maxLength={10} className="font-mono"/>
          </div>
          <Input label="Désignation" value={form.nomPiece} onChange={e=>up("nomPiece",e.target.value)}/>
          <Input label="Emplacement" value={form.emplacement} onChange={e=>up("emplacement",e.target.value)}/>
          <Select label="Statut" value={form.statut} onChange={e=>up("statut",e.target.value)}
            options={[{value:"EN_STOCK",label:"En stock"},{value:"SORTI",label:"Sorti"},{value:"DEFECTUEUX",label:"Défectueux"}]}/>
        </form>
      </Modal>
    </>
  );
}
