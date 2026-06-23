//web/src/app/(dashboard)/anomalies/page.tsx
"use client";
import { useEffect, useState } from "react";
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
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { fmt } from "@/lib/utils";
import { Plus, Wrench, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Anomalie {
  id:string; titre:string; description:string; statut:string;
  typePiece?:string; nitg?:string; createdAt:string; isDifficulteTri:boolean;
  signaleur:{nom:string;prenom:string};
}

export default function AnomaliesPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<Anomalie>("/anomalies");
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ titre:"", description:"", nitg:"", typePiece:"", isDifficulteTri:"false" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => { load(1); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = { ...form, isDifficulteTri: form.isDifficulteTri==="true" };
      await api.post("/anomalies", payload);
      toast.success("Anomalie signalée"); setModal(false); load(1);
    } catch (err: unknown) {
      setError((err as {message?:string}).message ?? "Erreur");
    } finally { setSaving(false); }
  }

  const up = (k: string, v: string) => setForm(f => ({...f,[k]:v}));

  const statutColor = (s: string) =>
    s==="RESOLU" ? "bg-green-100 text-green-800" :
    s==="EN_COURS" ? "bg-blue-100 text-blue-800" :
    s==="IMPOSSIBLE" ? "bg-gray-100 text-gray-600" :
    "bg-yellow-100 text-yellow-800";

  return (
    <>
      <Header title="Anomalies" />
      <PageHeader title="Anomalies"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Anomalies"}]}
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setModal(true)}>Signaler une anomalie</Button>}
      />

      <div className="flex gap-3 mb-5">
        <Select options={[{value:"",label:"Tous statuts"},{value:"A_TRAITER",label:"À traiter"},{value:"EN_COURS",label:"En cours"},{value:"RESOLU",label:"Résolu"}]}
          value={filters.statut??""} onChange={(e) => setFilter("statut",e.target.value)} className="w-48" />
      </div>

      {loading ? <PageLoader /> : data.length === 0 ? (
        <EmptyState icon={<Wrench className="w-10 h-10" />} title="Aucune anomalie" description="Aucune anomalie signalée pour le moment." />
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {["Titre","NITG","Type","Statut","Difficile","Date","Agent",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-900 max-w-[180px] truncate">{a.titre}</td>
                    <td className="px-4 py-3 font-mono text-surface-700">{a.nitg ?? "—"}</td>
                    <td className="px-4 py-3">{a.typePiece && <Badge color="bg-gray-100 text-gray-700">{a.typePiece}</Badge>}</td>
                    <td className="px-4 py-3"><Badge color={statutColor(a.statut)}>{a.statut.replace("_"," ")}</Badge></td>
                    <td className="px-4 py-3">{a.isDifficulteTri && <Badge color="bg-orange-100 text-orange-800">Oui</Badge>}</td>
                    <td className="px-4 py-3 text-surface-500 text-xs whitespace-nowrap">{fmt.date(a.createdAt)}</td>
                    <td className="px-4 py-3 text-surface-600 text-xs whitespace-nowrap">{a.signaleur.prenom} {a.signaleur.nom}</td>
                    <td className="px-4 py-3">
                      <Link href={`/anomalies/${a.id}`}>
                        <Button size="xs" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />}>Voir</Button>
                      </Link>
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

      <Modal open={modal} onClose={() => setModal(false)} title="Signaler une anomalie"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button><Button onClick={create} loading={saving}>Signaler</Button></>}
      >
        <form onSubmit={create} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Titre *" value={form.titre} onChange={(e) => up("titre",e.target.value)} required />
          <Textarea label="Description *" value={form.description} onChange={(e) => up("description",e.target.value)} required rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="NITG" value={form.nitg} onChange={(e) => up("nitg",e.target.value.toUpperCase())} maxLength={4} className="font-mono" />
            <Select label="Type pièce" value={form.typePiece} onChange={(e) => up("typePiece",e.target.value)} options={[{value:"",label:"—"},{value:"RC",label:"RC"},{value:"IC",label:"IC"}]} />
            <Select label="Difficultés de tri" value={form.isDifficulteTri} onChange={(e) => up("isDifficulteTri",e.target.value)} options={[{value:"false",label:"Non"},{value:"true",label:"Oui"}]} />
          </div>
        </form>
      </Modal>
    </>
  );
}
