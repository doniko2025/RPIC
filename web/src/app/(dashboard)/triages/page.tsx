//web/src/app/(dashboard)/triages/page.tsx
"use client";
import { useEffect, useState } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
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
import { fmt, statutRCColor, statutICColor } from "@/lib/utils";
import { STATUT_RC_LABELS, STATUT_IC_LABELS } from "@/lib/constants";
import { Plus, Package, Eye } from "lucide-react";
import Link from "next/link";

interface Triage {
  id:string; nitgSaisi:string; typePiece:string; dateTri:string;
  nomPiece?:string; statutRC?:string; statutIC?:string; caffute?:boolean;
  fournisseur?:{nom:string}; siteExpedition?:{nom:string;code6Plus2:string};
  set?:{id:string}; agentTri:{nom:string;prenom:string};
  alerteRC?:{statut:string;joursRestants:number};
}

export default function TriagesPage() {
  const { data, meta, loading, load, setFilter, filters, goToPage } =
    usePagination<Triage>("/triages");
  const [search, setSearch] = useState("");

  useEffect(() => { load(1); }, []);

  const handleSearch = (v: string) => { setSearch(v); setFilter("nitg", v); };

  return (
    <>
      <Header title="Triages" />
      <PageHeader
        title="Triages"
        subtitle="Liste de toutes les pièces triées RC et IC"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Triages"}]}
        actions={
          <Link href="/triages/nouveau">
            <Button icon={<Plus className="w-4 h-4" />}>Nouveau tri</Button>
          </Link>
        }
      />

      {/* Filtres */}
      <Card className="mb-5">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="NITG, référence…"
            className="w-full sm:w-64"
          />
          <Select
            options={[{value:"",label:"Tous types"},{value:"RC",label:"RC — Recours Comex"},{value:"IC",label:"IC — Incidentologie"}]}
            value={filters.typePiece ?? ""}
            onChange={(e) => setFilter("typePiece", e.target.value)}
            className="w-full sm:w-52"
          />
          <Select
            options={[
              {value:"",label:"Tous statuts RC"},
              ...Object.entries(STATUT_RC_LABELS).map(([v,l]) => ({value:v,label:l}))
            ]}
            value={filters.statutRC ?? ""}
            onChange={(e) => setFilter("statutRC", e.target.value)}
            className="w-full sm:w-52"
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? <PageLoader /> : data.length === 0 ? (
        <EmptyState icon={<Package className="w-10 h-10" />} title="Aucun triage" description="Créez le premier tri via le bouton ci-dessus." />
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {["NITG","Type","Pièce","SET/Site","Statut","Délai","Date","Agent",""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-surface-900">{t.nitgSaisi}</td>
                    <td className="px-4 py-3">
                      <Badge color={t.typePiece==="RC" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>{t.typePiece}</Badge>
                    </td>
                    <td className="px-4 py-3 text-surface-700 max-w-[140px] truncate">{t.nomPiece ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-600">
                      {t.set?.id ? <span className="font-bold">{t.set.id}</span> : "—"}
                      {t.siteExpedition && <span className="block text-surface-400">{t.siteExpedition.code6Plus2}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {t.typePiece==="RC" && t.statutRC && (
                        <Badge color={statutRCColor(t.statutRC)}>{STATUT_RC_LABELS[t.statutRC] ?? t.statutRC}</Badge>
                      )}
                      {t.typePiece==="IC" && (
                        t.caffute
                          ? <Badge color="bg-gray-100 text-gray-600">Caffuté</Badge>
                          : t.statutIC && <Badge color={statutICColor(t.statutIC)}>{STATUT_IC_LABELS[t.statutIC] ?? t.statutIC}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.alerteRC && (
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          t.alerteRC.joursRestants <= 0 ? "bg-red-100 text-red-800" :
                          t.alerteRC.joursRestants <= 2 ? "bg-orange-100 text-orange-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          J+{t.alerteRC.joursRestants}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-surface-500 whitespace-nowrap text-xs">{fmt.datetime(t.dateTri)}</td>
                    <td className="px-4 py-3 text-surface-600 whitespace-nowrap">{t.agentTri.prenom} {t.agentTri.nom}</td>
                    <td className="px-4 py-3">
                      <Link href={`/triages/${t.id}`}>
                        <Button variant="ghost" size="xs" icon={<Eye className="w-3.5 h-3.5" />}>Voir</Button>
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
    </>
  );
}
