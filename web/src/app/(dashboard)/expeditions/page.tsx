//web/src/app/(dashboard)/expeditions/page.tsx
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
import { fmt, transporteurColor } from "@/lib/utils";
import { Plus, Truck, Eye, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Expedition {
  id:string; numeroExpedition:string; transporteur:string; dateExpedition:string;
  statut:string; nitg?:string; designationPiece?:string; typePiece?:string;
  fournisseur?:{nom:string}; siteExpedition?:{nom:string;code6Plus2:string};
  expediteur:{nom:string;prenom:string};
}

export default function ExpeditionsPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<Expedition>("/expeditions");
  const [search, setSearch] = useState("");
  const [newModal, setNewModal] = useState(false);
  const [form, setForm] = useState({ numeroExpedition:"", transporteur:"DHL", dateExpedition:"", nitg:"", designationPiece:"", typePiece:"RC", setId:"", commentaire:"" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => { load(1); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      for (const k in payload) { if (!(payload as Record<string,string>)[k]) delete (payload as Record<string,string>)[k]; }
      await api.post("/expeditions", payload);
      toast.success("Expédition créée"); setNewModal(false);
      load(1);
    } catch (err: unknown) {
      setError((err as {message?:string}).message ?? "Erreur");
    } finally { setSaving(false); }
  }

  async function confirmerArrivee(id: string) {
    try {
      await api.post(`/expeditions/${id}/confirmer-arrivee`, {});
      toast.success("Arrivée confirmée"); load(meta.page);
    } catch { toast.error("Erreur"); }
  }

  const up = (k: string, v: string) => setForm(f => ({...f,[k]:v}));

  return (
    <>
      <Header title="Expéditions" />
      <PageHeader title="Expéditions"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Expéditions"}]}
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setNewModal(true)}>Nouvelle expédition</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setFilter("search", v); }} className="w-64" />
        <Select options={[{value:"",label:"Tous transporteurs"},{value:"DHL",label:"DHL"},{value:"TRANS",label:"TRANS"},{value:"AUTRE",label:"Autre"}]}
          value={filters.transporteur??""} onChange={(e) => setFilter("transporteur",e.target.value)} className="w-44" />
        <Select options={[{value:"",label:"Tous statuts"},{value:"EXPEDIE",label:"Expédié"},{value:"ARRIVE",label:"Arrivé"},{value:"RETOURNE",label:"Retourné"}]}
          value={filters.statut??""} onChange={(e) => setFilter("statut",e.target.value)} className="w-44" />
      </div>

      {loading ? <PageLoader /> : data.length === 0 ? (
        <EmptyState icon={<Truck className="w-10 h-10" />} title="Aucune expédition" />
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {["N° Expédition","Transporteur","NITG","Pièce","Fournisseur","Statut","Date","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{e.numeroExpedition}</td>
                    <td className="px-4 py-3"><Badge color={transporteurColor(e.transporteur)}>{e.transporteur}</Badge></td>
                    <td className="px-4 py-3 font-mono text-surface-700">{e.nitg ?? "—"}</td>
                    <td className="px-4 py-3 text-surface-600 max-w-[120px] truncate">{e.designationPiece ?? "—"}</td>
                    <td className="px-4 py-3 text-surface-600">{e.fournisseur?.nom ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge color={
                        e.statut==="ARRIVE"   ? "bg-green-100 text-green-800" :
                        e.statut==="RETOURNE" ? "bg-red-100 text-red-800" :
                        e.statut==="EXPEDIE"  ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      }>{e.statut}</Badge>
                    </td>
                    <td className="px-4 py-3 text-surface-500 text-xs whitespace-nowrap">{fmt.date(e.dateExpedition)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link href={`/expeditions/${e.id}`}>
                          <Button size="xs" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />}>Voir</Button>
                        </Link>
                        {e.statut==="EXPEDIE" && (
                          <Button size="xs" variant="outline" icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => confirmerArrivee(e.id)}>Arrivée</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100">
            <Pagination meta={meta} onPage={goToPage} />
          </div>
        </Card>
      )}

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Nouvelle expédition" size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setNewModal(false)}>Annuler</Button>
          <Button onClick={create} loading={saving}>Créer</Button>
        </>}
      >
        <form onSubmit={create} className="grid grid-cols-2 gap-4">
          {error && <div className="col-span-2"><Alert type="error" message={error} /></div>}
          <Input label="N° expédition *" value={form.numeroExpedition} onChange={(e) => up("numeroExpedition",e.target.value)} required className="col-span-2 font-mono" />
          <Select label="Transporteur" value={form.transporteur} onChange={(e) => up("transporteur",e.target.value)} options={[{value:"DHL",label:"DHL"},{value:"TRANS",label:"TRANS"},{value:"AUTRE",label:"Autre"}]} />
          <Input label="Date expédition *" type="datetime-local" value={form.dateExpedition} onChange={(e) => up("dateExpedition",e.target.value)} required />
          <Input label="NITG" value={form.nitg} onChange={(e) => up("nitg",e.target.value.toUpperCase())} maxLength={4} className="font-mono" />
          <Select label="Type pièce" value={form.typePiece} onChange={(e) => up("typePiece",e.target.value)} options={[{value:"RC",label:"RC"},{value:"IC",label:"IC"}]} />
          <Input label="Désignation pièce" value={form.designationPiece} onChange={(e) => up("designationPiece",e.target.value)} className="col-span-2" />
          <Input label="SET (5 chiffres)" value={form.setId} onChange={(e) => up("setId",e.target.value)} maxLength={5} className="font-mono" />
        </form>
      </Modal>
    </>
  );
}
