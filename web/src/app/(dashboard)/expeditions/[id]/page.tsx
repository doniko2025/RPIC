//web/src/app/(dashboard)/expeditions/[id]/page.tsx
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
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Expedition {
  id:string; numeroExpedition:string; transporteur:string;
  dateExpedition:string; statut:string; nitg?:string;
  designationPiece?:string; typePiece?:string; setId?:string; commentaire?:string;
  fournisseur?:{nom:string}; siteExpedition?:{nom:string;code6Plus2:string};
  expediteur:{nom:string;prenom:string};
  retours?:{id:string;dateRetour:string;causeRetour?:string}[];
}

function Field({label,value,mono}:{label:string;value?:string|null;mono?:boolean}) {
  return <div><p className="text-xs text-surface-400 mb-0.5">{label}</p><p className={["text-surface-900",mono?"font-mono":""].join(" ")}>{value||"—"}</p></div>;
}

export default function ExpeditionDetailPage() {
  const {id} = useParams<{id:string}>();
  const [exp, setExp] = useState<Expedition|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ api.get<Expedition>(`/expeditions/${id}`).then(setExp).finally(()=>setLoading(false)); },[id]);

  async function confirmerArrivee() {
    try {
      await api.post(`/expeditions/${id}/confirmer-arrivee`,{});
      toast.success("Arrivée confirmée");
      api.get<Expedition>(`/expeditions/${id}`).then(setExp);
    } catch { toast.error("Erreur"); }
  }

  if (loading) return <><Header/><PageLoader/></>;
  if (!exp)    return <><Header/><Alert type="error" message="Introuvable"/></>;

  return (
    <>
      <Header title={`Expédition ${exp.numeroExpedition}`}/>
      <PageHeader title={`Expédition ${exp.numeroExpedition}`}
        breadcrumb={[{label:"Expéditions",href:"/expeditions"},{label:exp.numeroExpedition}]}
        actions={exp.statut==="EXPEDIE" ? (
          <Button icon={<CheckCircle2 className="w-4 h-4"/>} onClick={confirmerArrivee}>Confirmer arrivée</Button>
        ) : undefined}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Détails</h3>
            <div className="flex gap-2">
              <Badge color={transporteurColor(exp.transporteur)}>{exp.transporteur}</Badge>
              <Badge color={exp.statut==="ARRIVE"?"bg-green-100 text-green-800":exp.statut==="RETOURNE"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}>{exp.statut}</Badge>
            </div>
          </CardHeader>
          <CardBody className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Field label="N° expédition" value={exp.numeroExpedition} mono/>
            <Field label="Transporteur"  value={exp.transporteur}/>
            <Field label="Date"          value={fmt.datetime(exp.dateExpedition)}/>
            <Field label="NITG"          value={exp.nitg} mono/>
            <Field label="Type pièce"    value={exp.typePiece}/>
            <Field label="SET"           value={exp.setId} mono/>
            <Field label="Désignation"   value={exp.designationPiece}/>
            <Field label="Site"          value={exp.siteExpedition?.nom}/>
            <Field label="Code 6+2"      value={exp.siteExpedition?.code6Plus2} mono/>
            <Field label="Fournisseur"   value={exp.fournisseur?.nom}/>
            <Field label="Expéditeur"    value={`${exp.expediteur.prenom} ${exp.expediteur.nom}`}/>
            {exp.commentaire && <div className="col-span-3"><Field label="Commentaire" value={exp.commentaire}/></div>}
          </CardBody>
        </Card>

        {exp.retours && exp.retours.length>0 && (
          <Card className="lg:col-span-2">
            <CardHeader><h3 className="font-display font-semibold">Retours associés</h3></CardHeader>
            <CardBody className="space-y-2">
              {exp.retours.map(r=>(
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-surface-50 px-4 py-3 text-sm">
                  <span className="text-surface-700">{fmt.date(r.dateRetour)}</span>
                  <span className="text-surface-500">{r.causeRetour||"Motif non communiqué"}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
}
