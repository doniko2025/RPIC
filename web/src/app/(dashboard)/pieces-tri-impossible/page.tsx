//web/src/app/(dashboard)/pieces-tri-impossible/page.tsx
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
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { fmt } from "@/lib/utils";
import { Plus, PackageX, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface PieceTI {
  id:string; nitg?:string; refPiece?:string; raisonImpossibilite:string;
  statut:string; typePiece?:string; createdAt:string;
  declarant:{nom:string;prenom:string};
}

export default function PiecesTriImpossiblePage() {
  const { data, meta, loading, load, goToPage } = usePagination<PieceTI>("/pieces-tri-impossible");
  const [modal,  setModal]  = useState(false);
  const [cmId,   setCmId]   = useState<string|null>(null);
  const [cm,     setCm]     = useState("");
  const [form,   setForm]   = useState({ nitg:"", refPiece:"", raisonImpossibilite:"", typePiece:"" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(()=>{ load(1); },[]);

  async function create(e:React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const p={...form}; for(const k in p) if(!(p as Record<string,string>)[k]) delete (p as Record<string,string>)[k];
      await api.post("/pieces-tri-impossible",p);
      toast.success("Enregistré"); setModal(false); load(1);
    } catch(err:unknown){ setError((err as {message?:string}).message??"Erreur"); } finally { setSaving(false); }
  }

  async function addComment() {
    if (!cmId||!cm.trim()) return;
    try {
      await api.post(`/pieces-tri-impossible/${cmId}/commentaires`,{contenu:cm});
      toast.success("Commentaire ajouté"); setCmId(null); setCm("");
    } catch { toast.error("Erreur"); }
  }
  const up=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  return (
    <>
      <Header title="Tri impossible"/>
      <PageHeader title="Pièces — tri impossible"
        subtitle="Pièces pour lesquelles le tri n'a pas pu être effectué"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Tri impossible"}]}
        actions={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setModal(true)}>Déclarer</Button>}
      />
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<PackageX className="w-10 h-10"/>} title="Aucune pièce déclarée"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {["NITG","Référence","Type","Raison","Statut","Date","Agent",""].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map(p=>(
                  <tr key={p.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{p.nitg??"—"}</td>
                    <td className="px-4 py-3 font-mono text-surface-700">{p.refPiece??"—"}</td>
                    <td className="px-4 py-3">{p.typePiece && <Badge color="bg-gray-100 text-gray-700">{p.typePiece}</Badge>}</td>
                    <td className="px-4 py-3 text-surface-600 max-w-[180px] truncate">{p.raisonImpossibilite}</td>
                    <td className="px-4 py-3"><Badge color={p.statut==="RESOLU"?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"}>{p.statut}</Badge></td>
                    <td className="px-4 py-3 text-xs text-surface-400 whitespace-nowrap">{fmt.date(p.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-surface-600">{p.declarant.prenom} {p.declarant.nom}</td>
                    <td className="px-4 py-3">
                      <Button size="xs" variant="ghost" icon={<MessageSquare className="w-3.5 h-3.5"/>} onClick={()=>setCmId(p.id)}>Commenter</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title="Déclarer un tri impossible"
        footer={<><Button variant="secondary" onClick={()=>setModal(false)}>Annuler</Button><Button onClick={create} loading={saving}>Déclarer</Button></>}>
        <form onSubmit={create} className="space-y-4">
          {error && <Alert type="error" message={error}/>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="NITG" value={form.nitg} onChange={e=>up("nitg",e.target.value.toUpperCase())} maxLength={4} className="font-mono"/>
            <Input label="Référence" value={form.refPiece} onChange={e=>up("refPiece",e.target.value.toUpperCase())} maxLength={10} className="font-mono"/>
            <Select label="Type pièce" value={form.typePiece} onChange={e=>up("typePiece",e.target.value)} className="col-span-2"
              options={[{value:"",label:"—"},{value:"RC",label:"RC"},{value:"IC",label:"IC"}]}/>
          </div>
          <Textarea label="Raison de l'impossibilité *" value={form.raisonImpossibilite} onChange={e=>up("raisonImpossibilite",e.target.value)} required rows={3}/>
        </form>
      </Modal>

      <Modal open={!!cmId} onClose={()=>setCmId(null)} title="Ajouter un commentaire"
        footer={<><Button variant="secondary" onClick={()=>setCmId(null)}>Annuler</Button><Button onClick={addComment}>Publier</Button></>}>
        <Textarea label="Commentaire *" value={cm} onChange={e=>setCm(e.target.value)} required rows={3}/>
      </Modal>
    </>
  );
}
