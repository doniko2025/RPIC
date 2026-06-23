//web/src/app/(dashboard)/triages/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { PageLoader } from "@/components/ui/Spinner";
import { fmt, statutRCColor, statutICColor } from "@/lib/utils";
import { STATUT_RC_LABELS, STATUT_IC_LABELS } from "@/lib/constants";
import toast from "react-hot-toast";
import { Trash2, Send } from "lucide-react";

interface Triage {
  id:string; nitgSaisi:string; typePiece:string; dateTri:string;
  nomPiece?:string; statutRC?:string; statutIC?:string; caffute?:boolean;
  caffutageMotif?:string; caffuteAt?:string;
  refPieceCauseSaisie?:string; setId?:string;
  projetMoteur?:string; indiceMoteur?:string;
  projetVehicule?:string; indiceVehicule?:string;
  projetBoite?:string; indiceBoite?:string;
  numOR?:string; verbatimClient?:string; diagReparateur?:string; conclusionTri?:string;
  typeRangement?:string; emplacement?:string;
  fournisseur?:{nom:string}; siteExpedition?:{nom:string;code6Plus2:string};
  set?:{id:string}; garageOrigine?:{nom:string};
  agentTri:{nom:string;prenom:string};
  referencePiece?:{nomPiece:string;photo1?:string;photo2?:string};
  correspondanceSet?:{setId:string;nbConfirmations:number;statut:string};
  alerteRC?:{statut:string;joursRestants:number;dateMaxExpedition:string};
}

function Field({ label, value, mono, bold }: { label:string; value?:string|null; mono?:boolean; bold?:boolean }) {
  return (
    <div>
      <p className="text-xs text-surface-400 mb-0.5">{label}</p>
      <p className={["text-surface-900", mono?"font-mono":"", bold?"font-bold":""].join(" ")}>{value || "—"}</p>
    </div>
  );
}

export default function TriageDetailPage() {
  const { id }   = useParams<{id:string}>();
  const router   = useRouter();
  const [triage,  setTriage]  = useState<Triage|null>(null);
  const [loading, setLoading] = useState(true);
  const [cafModal,setCafModal]= useState(false);
  const [motif,   setMotif]   = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get<Triage>(`/triages/${id}`).then(setTriage).finally(() => setLoading(false));
  }, [id]);

  async function updateRC(statut: string) {
    try {
      await api.post(`/triages/${id}/statut-rc`, { statut });
      toast.success("Statut mis à jour");
      setTriage(t => t ? {...t, statutRC:statut} : t);
    } catch { toast.error("Erreur"); }
  }

  async function updateIC(statut: string) {
    try {
      await api.post(`/triages/${id}/statut-ic`, { statut });
      toast.success("Statut mis à jour");
      setTriage(t => t ? {...t, statutIC:statut} : t);
    } catch { toast.error("Erreur"); }
  }

  async function caffuter() {
    if (!motif.trim()) { toast.error("Motif requis"); return; }
    setSaving(true);
    try {
      await api.post(`/triages/${id}/caffuter`, { motif });
      toast.success("Pièce caffutée");
      router.push("/triages");
    } catch (err: unknown) {
      toast.error((err as {message?:string}).message ?? "Erreur");
    } finally { setSaving(false); }
  }

  if (loading) return <><Header /><PageLoader /></>;
  if (!triage) return <><Header /><Alert type="error" message="Triage introuvable" /></>;

  const isRC = triage.typePiece === "RC";
  const isIC = triage.typePiece === "IC";

  return (
    <>
      <Header title={`Triage — ${triage.nitgSaisi}`} />
      <PageHeader
        title={`Tri : ${triage.nitgSaisi}`}
        subtitle={triage.nomPiece}
        breadcrumb={[{label:"Triages",href:"/triages"},{label:triage.nitgSaisi}]}
        actions={
          <div className="flex gap-2">
            {isRC && !triage.caffute && triage.statutRC !== "EXPEDIE" && (
              <Button variant="outline" size="sm" icon={<Send className="w-4 h-4" />} onClick={() => updateRC("EXPEDIE")}>
                Marquer expédié
              </Button>
            )}
            {isIC && !triage.caffute && (
              <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => setCafModal(true)}>
                Caffuter
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Identification</h3>
              <div className="flex gap-2">
                <Badge color={isRC ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>{triage.typePiece}</Badge>
                {isRC && triage.statutRC && <Badge color={statutRCColor(triage.statutRC)}>{STATUT_RC_LABELS[triage.statutRC]}</Badge>}
                {isIC && triage.statutIC && <Badge color={statutICColor(triage.statutIC)}>{STATUT_IC_LABELS[triage.statutIC]}</Badge>}
                {triage.caffute && <Badge color="bg-gray-100 text-gray-600">Caffuté</Badge>}
              </div>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-4 text-sm">
              <Field label="NITG"          value={triage.nitgSaisi}             mono />
              <Field label="Réf. cause"    value={triage.refPieceCauseSaisie}   mono />
              <Field label="Date de tri"   value={fmt.datetime(triage.dateTri)} />
              <Field label="Agent"         value={`${triage.agentTri.prenom} ${triage.agentTri.nom}`} />
              <Field label="Proj. moteur"  value={triage.projetMoteur}  mono />
              <Field label="Ind. moteur"   value={triage.indiceMoteur}  mono />
              <Field label="Proj. véhicule" value={triage.projetVehicule} mono />
              <Field label="Ind. véhicule"  value={triage.indiceVehicule} mono />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-display font-semibold">SET & Destination</h3></CardHeader>
            <CardBody className="grid grid-cols-2 gap-4 text-sm">
              <Field label="SET"         value={triage.set?.id}                     mono bold />
              <Field label="Site 6+2"   value={triage.siteExpedition?.code6Plus2}  mono />
              <Field label="Site"       value={triage.siteExpedition?.nom} />
              <Field label="Fournisseur" value={triage.fournisseur?.nom} />
              <Field label="Rangement"  value={triage.typeRangement} />
              <Field label="Emplacement" value={triage.emplacement} />
            </CardBody>
          </Card>

          {(triage.verbatimClient || triage.diagReparateur || triage.conclusionTri) && (
            <Card>
              <CardHeader><h3 className="font-display font-semibold">Contexte OR</h3></CardHeader>
              <CardBody className="space-y-3 text-sm">
                {triage.numOR && <Field label="N° OR" value={triage.numOR} />}
                {triage.verbatimClient && <div><p className="text-xs text-surface-400 mb-1">Verbatim client</p><p>{triage.verbatimClient}</p></div>}
                {triage.diagReparateur && <div><p className="text-xs text-surface-400 mb-1">Diagnostic</p><p>{triage.diagReparateur}</p></div>}
                {triage.conclusionTri  && <div><p className="text-xs text-surface-400 mb-1">Conclusion</p><p>{triage.conclusionTri}</p></div>}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {isRC && triage.alerteRC && (
            <Card>
              <CardHeader><h3 className="font-display font-semibold text-red-700">Alerte RC</h3></CardHeader>
              <CardBody className="text-center space-y-2">
                <p className={`font-mono text-4xl font-black ${
                  triage.alerteRC.joursRestants<=0 ? "text-red-700" :
                  triage.alerteRC.joursRestants<=2 ? "text-orange-600" : "text-green-600"
                }`}>J+{triage.alerteRC.joursRestants}</p>
                <p className="text-xs text-surface-500">Limite : {fmt.date(triage.alerteRC.dateMaxExpedition)}</p>
              </CardBody>
            </Card>
          )}

          {isRC && !triage.caffute && (
            <Card>
              <CardHeader><h3 className="font-display font-semibold">Statut RC</h3></CardHeader>
              <CardBody className="flex flex-col gap-1.5">
                {Object.entries(STATUT_RC_LABELS).map(([k,l]) => (
                  <Button key={k} variant={triage.statutRC===k?"primary":"ghost"} size="sm"
                    onClick={() => updateRC(k)} className="justify-start">{l}</Button>
                ))}
              </CardBody>
            </Card>
          )}

          {isIC && !triage.caffute && (
            <Card>
              <CardHeader><h3 className="font-display font-semibold">Statut IC</h3></CardHeader>
              <CardBody className="flex flex-col gap-1.5">
                {Object.entries(STATUT_IC_LABELS).map(([k,l]) => (
                  <Button key={k} variant={triage.statutIC===k?"primary":"ghost"} size="sm"
                    onClick={() => updateIC(k)} className="justify-start">{l}</Button>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal open={cafModal} onClose={() => setCafModal(false)} title="Caffuter la pièce"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCafModal(false)}>Annuler</Button>
            <Button variant="danger" onClick={caffuter} loading={saving}>Confirmer</Button>
          </>
        }
      >
        <p className="text-sm text-surface-600 mb-4">Suppression informatique définitive + mise au rebut physique.</p>
        <Textarea label="Motif *" value={motif} onChange={(e) => setMotif(e.target.value)} required />
      </Modal>
    </>
  );
}
