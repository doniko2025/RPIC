//web/src/app/(dashboard)/correspondances-set/search/page.tsx
"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Search, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface CorrResult {
  count:number; unique:boolean;
  correspondances:{
    id:string; nitg:string; refPieceCause:string; setId:string;
    nbConfirmations:number; statut:string;
    set?:{id:string;siteExpedition?:{nom:string;code6Plus2:string;fournisseur?:{nom:string}}};
    fournisseur?:{nom:string};
    referencePiece?:{nomPiece:string;photo1?:string};
  }[];
}

export default function SetSearchPage() {
  const [f, setF] = useState({ nitg:"",ref:"",pm:"",im:"",pv:"",iv:"",pb:"",ib:"" });
  const up = (k: string, v: string) => setF(x => ({...x,[k]:v.toUpperCase()}));
  const [result,  setResult]  = useState<CorrResult|null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!f.nitg || f.nitg.length !== 4) { setError("NITG : exactement 4 caractères"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const q = new URLSearchParams({ nitg: f.nitg });
      if (f.ref) q.set("refPieceCause", f.ref);
      if (f.pm)  q.set("projetMoteur",  f.pm);
      if (f.im)  q.set("indiceMoteur",  f.im);
      if (f.pv)  q.set("projetVehicule",f.pv);
      if (f.iv)  q.set("indiceVehicule",f.iv);
      if (f.pb)  q.set("projetBoite",   f.pb);
      if (f.ib)  q.set("indiceBoite",   f.ib);
      setResult(await api.get<CorrResult>(`/correspondances-set/search?${q}`));
    } catch (err: unknown) {
      setError((err as {message?:string}).message ?? "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <>
      <Header title="Recherche SET" />
      <PageHeader title="Recherche du SET" subtitle="Déduisez le SET d'une pièce à partir de son NITG et des critères projet"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Recherche SET"}]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-display font-semibold">Critères</h3></CardHeader>
          <CardBody>
            <form onSubmit={search} className="space-y-4">
              {error && <Alert type="error" message={error} />}
              <div className="grid grid-cols-2 gap-3">
                <Input label="NITG *" value={f.nitg} onChange={(e) => up("nitg",e.target.value)} placeholder="M42F" maxLength={4} required className="font-mono col-span-2" />
                <Input label="Réf. pièce cause" value={f.ref} onChange={(e) => up("ref",e.target.value)} placeholder="147101423R" maxLength={10} className="font-mono col-span-2" />
                <Input label="Projet moteur"   value={f.pm} onChange={(e) => up("pm",e.target.value)} className="font-mono" />
                <Input label="Indice moteur"   value={f.im} onChange={(e) => up("im",e.target.value)} className="font-mono" />
                <Input label="Projet véhicule" value={f.pv} onChange={(e) => up("pv",e.target.value)} className="font-mono" />
                <Input label="Indice véhicule" value={f.iv} onChange={(e) => up("iv",e.target.value)} className="font-mono" />
                <Input label="Projet boîte"    value={f.pb} onChange={(e) => up("pb",e.target.value)} className="font-mono" />
                <Input label="Indice boîte"    value={f.ib} onChange={(e) => up("ib",e.target.value)} className="font-mono" />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg" icon={<Search className="w-4 h-4" />}>
                Rechercher le SET
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {loading && <Card><CardBody className="flex justify-center py-12"><Spinner size="lg" /></CardBody></Card>}

          {result && !loading && (
            <>
              <div className={[
                "rounded-2xl p-4 flex items-center gap-3",
                result.count===0 ? "bg-surface-100" :
                result.unique    ? "bg-green-50 border border-green-200" :
                                   "bg-yellow-50 border border-yellow-200"
              ].join(" ")}>
                {result.count===0 ? <AlertTriangle className="w-5 h-5 shrink-0 text-surface-500" />
                  : result.unique ? <CheckCircle2  className="w-5 h-5 shrink-0 text-green-600" />
                  :                 <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-600" />}
                <p className="font-semibold text-sm">
                  {result.count===0 ? "Aucune correspondance" :
                   result.unique    ? "SET identifié avec certitude" :
                                      `${result.count} correspondances — affinez les critères`}
                </p>
              </div>

              {result.correspondances.map((c) => (
                <Card key={c.id} className="animate-slide-in">
                  <CardBody className="flex items-start gap-4">
                    {c.referencePiece?.photo1 && (
                      <img src={c.referencePiece.photo1} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-3xl font-black text-surface-900">{c.setId}</span>
                        <button onClick={() => { navigator.clipboard.writeText(c.setId); toast.success(`SET ${c.setId} copié`); }}
                          className="text-surface-400 hover:text-brand-600">
                          <Copy className="w-4 h-4" />
                        </button>
                        <Badge color={c.statut==="CONFIRMEE"?"bg-green-100 text-green-800":c.statut==="EN_CONFLIT"?"bg-red-100 text-red-800":"bg-yellow-100 text-yellow-800"}>{c.statut}</Badge>
                      </div>
                      <p className="text-sm font-medium text-surface-700">{c.referencePiece?.nomPiece ?? c.nitg}</p>
                      <p className="text-xs text-surface-500 mt-1">
                        {c.set?.siteExpedition?.nom ?? "—"}
                        {c.set?.siteExpedition?.code6Plus2 && ` · ${c.set.siteExpedition.code6Plus2}`}
                        {c.fournisseur?.nom && ` · ${c.fournisseur.nom}`}
                      </p>
                      <p className="text-xs text-surface-400 mt-1">{c.nbConfirmations} confirmation(s)</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </>
          )}

          {!result && !loading && (
            <div className="rounded-2xl border-2 border-dashed border-surface-200 p-12 text-center">
              <Search className="w-8 h-8 text-surface-300 mx-auto mb-3" />
              <p className="text-sm text-surface-400">Entrez un NITG et lancez la recherche</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
