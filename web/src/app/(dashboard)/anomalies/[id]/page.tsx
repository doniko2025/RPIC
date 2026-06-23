//web/src/app/(dashboard)/anomalies/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { fmt } from "@/lib/utils";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";

interface Anomalie {
  id:string; titre:string; description:string; statut:string;
  typePiece?:string; nitg?:string; isDifficulteTri:boolean;
  actionCorrective?:string; actionAt?:string;
  createdAt:string; updatedAt:string;
  signaleur:{nom:string;prenom:string};
  traitePar?:{nom:string;prenom:string};
  commentaires:{id:string;contenu:string;auteur:{nom:string;prenom:string};createdAt:string}[];
}

export default function AnomalieDetailPage() {
  const { id } = useParams<{id:string}>();
  const [a,       setA]       = useState<Anomalie|null>(null);
  const [loading, setLoading] = useState(true);
  const [acModal, setAcModal] = useState(false);
  const [cmModal, setCmModal] = useState(false);
  const [ac,  setAc]  = useState("");
  const [cm,  setCm]  = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    api.get<Anomalie>(`/anomalies/${id}`).then(setA).finally(()=>setLoading(false));
  },[id]);

  async function postAC() {
    if (!ac.trim()) return;
    setSaving(true);
    try {
      await api.post(`/anomalies/${id}/action-corrective`,{actionCorrective:ac});
      toast.success("Action corrective enregistrée"); setAcModal(false);
      api.get<Anomalie>(`/anomalies/${id}`).then(setA);
    } catch { toast.error("Erreur"); } finally { setSaving(false); }
  }

  async function postComment() {
    if (!cm.trim()) return;
    setSaving(true);
    try {
      await api.post(`/anomalies/${id}/commentaires`,{contenu:cm});
      toast.success("Commentaire ajouté"); setCmModal(false); setCm("");
      api.get<Anomalie>(`/anomalies/${id}`).then(setA);
    } catch { toast.error("Erreur"); } finally { setSaving(false); }
  }

  if (loading) return <><Header/><PageLoader/></>;
  if (!a)      return <><Header/><Alert type="error" message="Introuvable"/></>;

  const sc = (s:string)=>s==="RESOLU"?"bg-green-100 text-green-800":s==="EN_COURS"?"bg-blue-100 text-blue-800":"bg-yellow-100 text-yellow-800";

  return (
    <>
      <Header title={`Anomalie — ${a.titre}`}/>
      <PageHeader title={a.titre}
        breadcrumb={[{label:"Anomalies",href:"/anomalies"},{label:"Détail"}]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<CheckCircle2 className="w-4 h-4"/>} onClick={()=>setAcModal(true)}>Action corrective</Button>
            <Button variant="secondary" size="sm" icon={<MessageSquare className="w-4 h-4"/>} onClick={()=>setCmModal(true)}>Commenter</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Informations</h3>
              <Badge color={sc(a.statut)}>{a.statut.replace("_"," ")}</Badge>
            </CardHeader>
            <CardBody className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-surface-400 mb-1">Description</p>
                <p className="text-surface-800 leading-relaxed">{a.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-surface-400 mb-0.5">NITG</p><p className="font-mono font-bold">{a.nitg||"—"}</p></div>
                <div><p className="text-xs text-surface-400 mb-0.5">Type pièce</p><p>{a.typePiece||"—"}</p></div>
                <div><p className="text-xs text-surface-400 mb-0.5">Signalé le</p><p>{fmt.datetime(a.createdAt)}</p></div>
                <div><p className="text-xs text-surface-400 mb-0.5">Agent</p><p>{a.signaleur.prenom} {a.signaleur.nom}</p></div>
                {a.isDifficulteTri && (
                  <div className="col-span-2"><Badge color="bg-orange-100 text-orange-800">Difficulté de tri identifiée</Badge></div>
                )}
              </div>
              {a.actionCorrective && (
                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">Action corrective</p>
                  <p className="text-sm text-green-900">{a.actionCorrective}</p>
                  {a.actionAt && <p className="text-xs text-green-600 mt-1">{fmt.datetime(a.actionAt)} · {a.traitePar?.prenom} {a.traitePar?.nom}</p>}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-display font-semibold">Commentaires ({a.commentaires.length})</h3></CardHeader>
            <CardBody className="space-y-3">
              {a.commentaires.length===0 ? (
                <p className="text-sm text-surface-400">Aucun commentaire.</p>
              ) : a.commentaires.map(c=>(
                <div key={c.id} className="rounded-xl bg-surface-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-surface-700">{c.auteur.prenom} {c.auteur.nom}</p>
                    <p className="text-xs text-surface-400">{fmt.datetime(c.createdAt)}</p>
                  </div>
                  <p className="text-sm text-surface-800">{c.contenu}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={acModal} onClose={()=>setAcModal(false)} title="Action corrective"
        footer={<><Button variant="secondary" onClick={()=>setAcModal(false)}>Annuler</Button><Button onClick={postAC} loading={saving} icon={<Send className="w-4 h-4"/>}>Enregistrer</Button></>}>
        <Textarea label="Description de l'action corrective *" value={ac} onChange={e=>setAc(e.target.value)} rows={4} required/>
      </Modal>

      <Modal open={cmModal} onClose={()=>setCmModal(false)} title="Ajouter un commentaire"
        footer={<><Button variant="secondary" onClick={()=>setCmModal(false)}>Annuler</Button><Button onClick={postComment} loading={saving}>Publier</Button></>}>
        <Textarea label="Commentaire *" value={cm} onChange={e=>setCm(e.target.value)} rows={3} required/>
      </Modal>
    </>
  );
}
