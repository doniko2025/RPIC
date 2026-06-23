//web/src/app/(dashboard)/retours-expedition/page.tsx
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
import { Plus, RotateCcw, CheckSquare, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Retour {
  id:string; dateRetour:string; transporteurOrigine?:string;
  motifDisponible:boolean; causeRetour?:string; estTraite:boolean;
  nitg?:string; fournisseur?:{nom:string}; alerteTransGeneree:boolean;
  recepteur:{nom:string;prenom:string};
}

export default function RetoursPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<Retour>("/retours-expedition");
  const [newModal, setNewModal] = useState(false);
  const [form, setForm] = useState({
    dateRetour:"", transporteurOrigine:"TRANS", motifDisponible:"true",
    causeRetour:"", nitg:"", numeroExpeditionOrigine:"",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => { load(1); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        motifDisponible: form.motifDisponible === "true",
        causeRetour: form.causeRetour || undefined,
      };
      await api.post("/retours-expedition", payload);
      toast.success("Retour enregistré"); setNewModal(false); load(1);
    } catch (err: unknown) {
      setError((err as {message?:string}).message ?? "Erreur");
    } finally { setSaving(false); }
  }

  async function traiter(id: string) {
    try {
      await api.post(`/retours-expedition/${id}/traiter`, {});
      toast.success("Retour traité"); load(meta.page);
    } catch { toast.error("Erreur"); }
  }

  const up = (k: string, v: string) => setForm(f => ({...f,[k]:v}));

  return (
    <>
      <Header title="Retours expédition" />
      <PageHeader title="Retours expédition"
        subtitle="Pièces retournées par DHL ou TRANS"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Retours"}]}
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setNewModal(true)}>Saisir un retour</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <Select options={[{value:"",label:"Tous transporteurs"},{value:"DHL",label:"DHL"},{value:"TRANS",label:"TRANS"}]}
          value={filters.transporteurOrigine??""} onChange={(e) => setFilter("transporteurOrigine",e.target.value)} className="w-44" />
        <Select options={[{value:"",label:"Tous"},{value:"false",label:"Non traités"},{value:"true",label:"Traités"}]}
          value={filters.estTraite??""} onChange={(e) => setFilter("estTraite",e.target.value)} className="w-44" />
      </div>

      {loading ? <PageLoader /> : data.length === 0 ? (
        <EmptyState icon={<RotateCcw className="w-10 h-10" />} title="Aucun retour" />
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {["Date","Transporteur","NITG","Fournisseur","Motif","Alerte","Traité","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 text-surface-700 whitespace-nowrap text-xs">{fmt.date(r.dateRetour)}</td>
                    <td className="px-4 py-3">
                      {r.transporteurOrigine && <Badge color={transporteurColor(r.transporteurOrigine)}>{r.transporteurOrigine}</Badge>}
                    </td>
                    <td className="px-4 py-3 font-mono text-surface-900">{r.nitg ?? "—"}</td>
                    <td className="px-4 py-3 text-surface-600">{r.fournisseur?.nom ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.motifDisponible
                        ? <span className="text-xs text-surface-600">{r.causeRetour ?? "Connu"}</span>
                        : <Badge color="bg-red-100 text-red-800">Sans motif</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      {r.alerteTransGeneree && <Badge color="bg-orange-100 text-orange-800" dot>TRANS !</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={r.estTraite ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {r.estTraite ? "Traité" : "En attente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {!r.estTraite && (
                        <Button size="xs" variant="outline" icon={<CheckSquare className="w-3.5 h-3.5" />}
                          onClick={() => traiter(r.id)}>Traiter</Button>
                      )}
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

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Saisir un retour" size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setNewModal(false)}>Annuler</Button>
          <Button onClick={create} loading={saving}>Enregistrer</Button>
        </>}
      >
        <form onSubmit={create} className="grid grid-cols-2 gap-4">
          {error && <div className="col-span-2"><Alert type="error" message={error} /></div>}
          <Input label="Date retour *" type="datetime-local" value={form.dateRetour} onChange={(e) => up("dateRetour",e.target.value)} required className="col-span-2" />
          <Select label="Transporteur origine" value={form.transporteurOrigine} onChange={(e) => up("transporteurOrigine",e.target.value)}
            options={[{value:"DHL",label:"DHL"},{value:"TRANS",label:"TRANS"},{value:"AUTRE",label:"Autre"}]} />
          <Select label="Motif disponible" value={form.motifDisponible} onChange={(e) => up("motifDisponible",e.target.value)}
            options={[{value:"true",label:"Oui — motif connu"},{value:"false",label:"Non — TRANS sans motif"}]} />
          {form.motifDisponible==="false" && (
            <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
              <p className="text-sm text-orange-800">Une alerte sera automatiquement envoyée pour ce retour TRANS sans motif.</p>
            </div>
          )}
          <Input label="N° expédition d'origine" value={form.numeroExpeditionOrigine} onChange={(e) => up("numeroExpeditionOrigine",e.target.value)} className="col-span-2 font-mono" />
          <Input label="NITG" value={form.nitg} onChange={(e) => up("nitg",e.target.value.toUpperCase())} maxLength={4} className="font-mono" />
        </form>
      </Modal>
    </>
  );
}
