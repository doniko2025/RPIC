"use client";
import { useEffect, useState } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { fmt } from "@/lib/utils";
import { Plus, CalendarDays, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface Conge {
  id:string; dateDebut:string; dateFin:string; typeConge:string;
  statut:string; motif?:string; estVu:boolean;
  agent:{nom:string;prenom:string};
}

export default function CongesPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } = usePagination<Conge>("/conges");
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ dateDebut:"", dateFin:"", typeConge:"CONGE_PAYE", motif:"" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(()=>{ load(1); },[]);

  async function create(e:React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await api.post("/conges",{ ...form, motif: form.motif||undefined });
      toast.success("Congé déclaré"); setModal(false); load(1);
    } catch(err:unknown){ setError((err as {message?:string}).message??"Erreur"); } finally { setSaving(false); }
  }

  async function marquerVu(id:string) {
    try { await api.post(`/conges/${id}/marquer-vu`,{}); load(meta.page); } catch { toast.error("Erreur"); }
  }
  const up=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  const typeLabel: Record<string,string> = {
    CONGE_PAYE:"Congé payé", RTT:"RTT", MALADIE:"Maladie",
    FORMATION:"Formation", AUTRE:"Autre"
  };
  const statutColor=(s:string)=>s==="VALIDE"?"bg-green-100 text-green-800":s==="REFUSE"?"bg-red-100 text-red-800":"bg-yellow-100 text-yellow-800";

  return (
    <>
      <Header title="Congés"/>
      <PageHeader title="Congés"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Congés"}]}
        actions={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setModal(true)}>Déclarer un congé</Button>}
      />
      <div className="flex gap-3 mb-5">
        <Select options={[{value:"",label:"Tous statuts"},{value:"EN_ATTENTE",label:"En attente"},{value:"VALIDE",label:"Validé"},{value:"REFUSE",label:"Refusé"}]}
          value={filters.statut??""} onChange={e=>setFilter("statut",e.target.value)} className="w-44"/>
      </div>
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<CalendarDays className="w-10 h-10"/>} title="Aucun congé déclaré"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["Agent","Début","Fin","Type","Statut","Vu",""].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map(c=>(
                  <tr key={c.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">{c.agent.prenom} {c.agent.nom}</td>
                    <td className="px-4 py-3 text-xs text-surface-600 whitespace-nowrap">{fmt.date(c.dateDebut)}</td>
                    <td className="px-4 py-3 text-xs text-surface-600 whitespace-nowrap">{fmt.date(c.dateFin)}</td>
                    <td className="px-4 py-3 text-surface-600 text-xs">{typeLabel[c.typeConge]??c.typeConge}</td>
                    <td className="px-4 py-3"><Badge color={statutColor(c.statut)}>{c.statut.replace("_"," ")}</Badge></td>
                    <td className="px-4 py-3">{c.estVu ? <Badge color="bg-green-100 text-green-800">✓</Badge> : <Badge color="bg-gray-100 text-gray-500">Non</Badge>}</td>
                    <td className="px-4 py-3">
                      {!c.estVu && <Button size="xs" variant="ghost" icon={<Eye className="w-3.5 h-3.5"/>} onClick={()=>marquerVu(c.id)}>Marquer vu</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Déclarer un congé"
        footer={<><Button variant="secondary" onClick={()=>setModal(false)}>Annuler</Button><Button onClick={create} loading={saving}>Déclarer</Button></>}>
        <form onSubmit={create} className="space-y-4">
          {error && <Alert type="error" message={error}/>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date début *" type="date" value={form.dateDebut} onChange={e=>up("dateDebut",e.target.value)} required/>
            <Input label="Date fin *"   type="date" value={form.dateFin}   onChange={e=>up("dateFin",  e.target.value)} required/>
          </div>
          <Select label="Type de congé" value={form.typeConge} onChange={e=>up("typeConge",e.target.value)}
            options={[{value:"CONGE_PAYE",label:"Congé payé"},{value:"RTT",label:"RTT"},{value:"MALADIE",label:"Maladie"},{value:"FORMATION",label:"Formation"},{value:"AUTRE",label:"Autre"}]}/>
          <Textarea label="Motif (optionnel)" value={form.motif} onChange={e=>up("motif",e.target.value)} rows={2}/>
        </form>
      </Modal>
    </>
  );
}
