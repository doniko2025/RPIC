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
import { fmt, colorJours } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface AlerteRC {
  id:string; joursRestants:number; joursDepuisTri:number;
  statut:string; dateMaxExpedition:string;
  triage:{ nitgSaisi:string; nomPiece?:string; agentTri:{nom:string;prenom:string} };
  fournisseur?:{nom:string};
  traiteePar?:{nom:string;prenom:string};
}

export default function AlertesRCPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<AlerteRC>("/alertes-rc", { initialFilters:{statut:"ACTIVE"} });

  useEffect(() => { load(1); }, []);

  async function resoudre(id: string) {
    try {
      await api.post(`/alertes-rc/${id}/resoudre`, { note: "Résolu via interface" });
      toast.success("Alerte résolue");
      load(meta.page);
    } catch { toast.error("Erreur"); }
  }

  async function ignorer(id: string) {
    try {
      await api.post(`/alertes-rc/${id}/ignorer`, {});
      toast.success("Alerte ignorée");
      load(meta.page);
    } catch { toast.error("Erreur"); }
  }

  return (
    <>
      <Header title="Alertes RC" />
      <PageHeader title="Alertes RC"
        subtitle="Pièces RC proches ou dépassant le délai d'expédition de 7 jours"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Alertes RC"}]} />

      <div className="flex gap-3 mb-5">
        <Select
          options={[{value:"ACTIVE",label:"Actives"},{value:"RESOLUE",label:"Résolues"},{value:"IGNOREE",label:"Ignorées"},{value:"",label:"Toutes"}]}
          value={filters.statut ?? "ACTIVE"}
          onChange={(e) => setFilter("statut", e.target.value)}
          className="w-48"
        />
      </div>

      {loading ? <PageLoader /> : data.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="w-10 h-10 text-green-400" />}
          title="Aucune alerte active"
          description="Toutes les pièces RC sont dans les délais." />
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {["NITG","Pièce","Fournisseur","J restants","Délai max","Statut","Agent","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{a.triage.nitgSaisi}</td>
                    <td className="px-4 py-3 text-surface-700 max-w-[120px] truncate">{a.triage.nomPiece ?? "—"}</td>
                    <td className="px-4 py-3 text-surface-600">{a.fournisseur?.nom ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded-full ${colorJours(a.joursRestants)}`}>
                        {a.joursRestants <= 0 ? `J+${Math.abs(a.joursRestants)} dépassé` : `J-${a.joursRestants}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-500 text-xs whitespace-nowrap">{fmt.date(a.dateMaxExpedition)}</td>
                    <td className="px-4 py-3">
                      <Badge color={
                        a.statut==="ACTIVE"  ? "bg-red-100 text-red-800" :
                        a.statut==="RESOLUE" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-600"
                      }>{a.statut}</Badge>
                    </td>
                    <td className="px-4 py-3 text-surface-600 whitespace-nowrap text-xs">
                      {a.triage.agentTri.prenom} {a.triage.agentTri.nom}
                    </td>
                    <td className="px-4 py-3">
                      {a.statut === "ACTIVE" && (
                        <div className="flex gap-1.5">
                          <Button size="xs" variant="outline" icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => resoudre(a.id)}>Résoudre</Button>
                          <Button size="xs" variant="ghost" icon={<EyeOff className="w-3.5 h-3.5" />}
                            onClick={() => ignorer(a.id)}>Ignorer</Button>
                        </div>
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
    </>
  );
}
