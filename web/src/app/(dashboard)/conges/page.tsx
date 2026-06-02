//web/src/app/(dashboard)/conges/page.tsx
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
import { Alert } from "@/components/ui/Alert";
import { fmt } from "@/lib/utils";
import { Plus, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

interface Conge {
  id: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  motif?: string;
  employe: { nom: string; prenom: string };
}

export default function CongesPage() {
  const { data, meta, loading, load, goToPage } = usePagination<Conge>("/conges");
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ dateDebut: "", dateFin: "", motif: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => { load(1); }, []);

  async function create() {
    setSaving(true); setError("");
    try {
      await api.post("/conges", { ...form, motif: form.motif || undefined });
      toast.success("Congé déclaré");
      setModal(false);
      setForm({ dateDebut: "", dateFin: "", motif: "" });
      load(1);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Erreur");
    } finally { setSaving(false); }
  }

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const statutColor = (s: string) =>
    s === "VALIDE"    ? "bg-green-100 text-green-800" :
    s === "REFUSE"    ? "bg-red-100 text-red-800"     :
                        "bg-yellow-100 text-yellow-800";

  return (
    <>
      <Header title="Congés" />
      <PageHeader
        title="Congés"
        breadcrumb={[{ label: "Accueil", href: "/dashboard" }, { label: "Congés" }]}
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModal(true)}>
            Déclarer un congé
          </Button>
        }
      />

      {loading ? <PageLoader /> : data.length === 0 ? (
        <EmptyState icon={<CalendarDays className="w-10 h-10" />} title="Aucun congé déclaré" />
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {["Agent", "Début", "Fin", "Statut", "Motif"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data.map(c => (
                  <tr key={c.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">
                      {c.employe.prenom} {c.employe.nom}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-600 whitespace-nowrap">
                      {fmt.date(c.dateDebut)}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-600 whitespace-nowrap">
                      {fmt.date(c.dateFin)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={statutColor(c.statut)}>
                        {c.statut.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500 max-w-[200px] truncate">
                      {c.motif ?? "—"}
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

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Déclarer un congé"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
            <Button onClick={create} loading={saving}>Déclarer</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date début *"
              type="date"
              value={form.dateDebut}
              onChange={e => up("dateDebut", e.target.value)}
              required
            />
            <Input
              label="Date fin *"
              type="date"
              value={form.dateFin}
              onChange={e => up("dateFin", e.target.value)}
              required
            />
          </div>
          <Textarea
            label="Motif (optionnel)"
            value={form.motif}
            onChange={e => up("motif", e.target.value)}
            rows={2}
          />
        </div>
      </Modal>
    </>
  );
}