//web/src/app/(dashboard)/retours-expedition/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageLoader } from "@/components/ui/Spinner";
import { fmt, transporteurColor } from "@/lib/utils";
import { CAUSE_RETOUR_LABELS } from "@/lib/constants";
import { CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

interface Retour {
  id:string; dateRetour:string; transporteurOrigine?:string; transporteurReexpedition?:string;
  motifDisponible:boolean; causeRetour?:string; estTraite:boolean;
  alerteTransGeneree:boolean; reexpeditionReussie?:boolean;
  nitg?:string; fournisseur?:{nom:string};
  expeditionOrigine?:{numeroExpedition:string};
  recepteur:{nom:string;prenom:string};
  createdAt:string;
}

function Field({label,value}:{label:string;value?:string|null}) {
  return <div><p className="text-xs text-surface-400 mb-0.5">{label}</p><p className="text-surface-900">{value||"—"}</p></div>;
}

export default function RetourDetailPage() {
  const {id}=useParams<{id:string}>();
  const [r,setR]=useState<Retour|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ api.get<Retour>(`/retours-expedition/${id}`).then(setR).finally(()=>setLoading(false)); },[id]);

  async function traiter() {
    try {
      await api.post(`/retours-expedition/${id}/traiter`,{});
      toast.success("Retour traité");
      api.get<Retour>(`/retours-expedition/${id}`).then(setR);
    } catch { toast.error("Erreur"); }
  }

  if (loading) return <><Header/><PageLoader/></>;
  if (!r)      return <><Header/><Alert type="error" message="Introuvable"/></>;

  return (
    <>
      <Header title="Détail retour"/>
      <PageHeader title="Retour expédition"
        breadcrumb={[{label:"Retours",href:"/retours-expedition"},{label:"Détail"}]}
        actions={!r.estTraite ? <Button icon={<CheckSquare className="w-4 h-4"/>} onClick={traiter}>Marquer traité</Button> : undefined}
      />
      <div className="max-w-2xl space-y-5">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Informations</h3>
            <div className="flex gap-2">
              {r.transporteurOrigine && <Badge color={transporteurColor(r.transporteurOrigine)}>{r.transporteurOrigine}</Badge>}
              <Badge color={r.estTraite?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"}>{r.estTraite?"Traité":"En attente"}</Badge>
            </div>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Date retour" value={fmt.datetime(r.dateRetour)}/>
            <Field label="Transporteur origine" value={r.transporteurOrigine}/>
            <Field label="NITG" value={r.nitg}/>
            <Field label="Fournisseur" value={r.fournisseur?.nom}/>
            <Field label="N° expédition origine" value={r.expeditionOrigine?.numeroExpedition}/>
            <Field label="Récepteur" value={`${r.recepteur.prenom} ${r.recepteur.nom}`}/>
            <div className="col-span-2">
              <p className="text-xs text-surface-400 mb-0.5">Cause du retour</p>
              {r.motifDisponible
                ? <p className="text-surface-900">{r.causeRetour ? (CAUSE_RETOUR_LABELS[r.causeRetour]??r.causeRetour) : "—"}</p>
                : <Badge color="bg-red-100 text-red-800">Motif non communiqué (TRANS)</Badge>}
            </div>
            {r.alerteTransGeneree && (
              <div className="col-span-2 rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
                <p className="text-sm text-orange-800 font-medium">Alerte TRANS générée automatiquement</p>
                <p className="text-xs text-orange-600 mt-0.5">Un email de notification a été envoyé à l'agent concerné.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
