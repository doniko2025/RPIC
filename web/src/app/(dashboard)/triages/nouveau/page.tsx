"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface SetResult {
  count: number; unique: boolean;
  correspondances: {
    id:string; setId:string; nbConfirmations:number; statut:string;
    set?:{ siteExpedition?:{nom:string;code6Plus2:string; fournisseur?:{nom:string}} };
    fournisseur?:{nom:string};
  }[];
}

export default function NouveauTriagePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nitgSaisi:"", refPieceCauseSaisie:"", typePiece:"RC",
    nomPiece:"", setId:"", siteExpeditionId:"", fournisseurId:"",
    projetVehicule:"", indiceVehicule:"",
    projetMoteur:"",  indiceMoteur:"",
    projetBoite:"",   indiceBoite:"",
    numOR:"", verbatimClient:"", diagReparateur:"", conclusionTri:"",
    emplacement:"", typeRangement:"",
  });
  const [setResults, setSetResults]   = useState<SetResult|null>(null);
  const [searching,  setSearching]    = useState(false);
  const [selectedSet, setSelectedSet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const searchSet = useCallback(async () => {
    if (!form.nitgSaisi || form.nitgSaisi.length !== 4) {
      toast.error("NITG doit faire exactement 4 caractères"); return;
    }
    setSearching(true); setSetResults(null);
    try {
      const q = new URLSearchParams({ nitg: form.nitgSaisi });
      if (form.refPieceCauseSaisie) q.set("refPieceCause", form.refPieceCauseSaisie);
      if (form.projetMoteur) q.set("projetMoteur", form.projetMoteur);
      if (form.projetVehicule) q.set("projetVehicule", form.projetVehicule);
      const res = await api.get<SetResult>(`/correspondances-set/search?${q}`);
      setSetResults(res);
      if (res.unique && res.correspondances[0]) {
        const c = res.correspondances[0];
        setSelectedSet(c.setId);
        update("setId", c.setId);
        if (c.fournisseurId) update("fournisseurId", c.fournisseurId);
        toast.success(`SET ${c.setId} trouvé automatiquement (${c.nbConfirmations} confirmation(s))`);
      }
    } catch { toast.error("Erreur lors de la recherche SET"); }
    finally { setSearching(false); }
  }, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nitgSaisi || !form.typePiece) { setError("NITG et type de pièce sont requis"); return; }
    setLoading(true); setError("");
    try {
      const payload = { ...form };
      // Nettoyer les champs vides
      for (const k in payload) { if ((payload as Record<string,string>)[k] === "") delete (payload as Record<string,string>)[k]; }
      await api.post("/triages", payload);
      toast.success("Tri enregistré avec succès !");
      router.push("/triages");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <>
      <Header title="Nouveau tri" />
      <PageHeader
        title="Nouveau tri"
        breadcrumb={[{label:"Triages",href:"/triages"},{label:"Nouveau"}]}
      />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {error && <Alert type="error" message={error} />}

        {/* Identification pièce */}
        <Card>
          <CardHeader><h3 className="font-display font-semibold">Identification de la pièce</h3></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="NITG" value={form.nitgSaisi} onChange={(e) => update("nitgSaisi", e.target.value.toUpperCase())}
              placeholder="ex: M42F" maxLength={4} required className="font-mono" />
            <Input label="Référence pièce cause" value={form.refPieceCauseSaisie} onChange={(e) => update("refPieceCauseSaisie", e.target.value.toUpperCase())}
              placeholder="ex: 147101423R" maxLength={10} className="font-mono" />
            <Select label="Type de pièce" value={form.typePiece} required
              onChange={(e) => update("typePiece", e.target.value)}
              options={[{value:"RC",label:"RC — Recours Comex"},{value:"IC",label:"IC — Incidentologie"}]} />
            <Input label="Désignation / Nom pièce" value={form.nomPiece} onChange={(e) => update("nomPiece", e.target.value)} />
          </CardBody>
        </Card>

        {/* Recherche SET */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Déduction du SET</h3>
            <Button type="button" variant="outline" size="sm" onClick={searchSet} loading={searching}
              icon={<Search className="w-4 h-4" />}>
              Rechercher le SET
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input label="Projet véhicule" value={form.projetVehicule} onChange={(e) => update("projetVehicule", e.target.value.toUpperCase())} className="font-mono" />
              <Input label="Indice véhicule"  value={form.indiceVehicule} onChange={(e) => update("indiceVehicule", e.target.value.toUpperCase())} className="font-mono" />
              <Input label="Projet moteur"   value={form.projetMoteur}   onChange={(e) => update("projetMoteur", e.target.value.toUpperCase())} className="font-mono" />
              <Input label="Indice moteur"   value={form.indiceMoteur}   onChange={(e) => update("indiceMoteur", e.target.value.toUpperCase())} className="font-mono" />
              <Input label="Projet boîte"    value={form.projetBoite}    onChange={(e) => update("projetBoite", e.target.value.toUpperCase())} className="font-mono" />
              <Input label="Indice boîte"    value={form.indiceBoite}    onChange={(e) => update("indiceBoite", e.target.value.toUpperCase())} className="font-mono" />
            </div>

            {/* Résultats SET */}
            {setResults && (
              <div className="rounded-xl border border-surface-200 overflow-hidden">
                <div className="px-4 py-3 bg-surface-50 flex items-center justify-between">
                  <p className="text-sm font-medium text-surface-700">
                    {setResults.count} correspondance(s) trouvée(s)
                    {setResults.unique && <Badge color="bg-green-100 text-green-800" className="ml-2">Unique ✓</Badge>}
                  </p>
                </div>
                {setResults.count === 0 ? (
                  <p className="text-sm text-surface-400 px-4 py-3">Aucun SET connu — le tri enrichira la base.</p>
                ) : (
                  <div className="divide-y divide-surface-100">
                    {setResults.correspondances.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50">
                        <input type="radio" name="setChoice" value={c.setId} checked={selectedSet===c.setId}
                          onChange={() => { setSelectedSet(c.setId); update("setId", c.setId); }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-surface-900">{c.setId}</span>
                            <Badge color="bg-blue-100 text-blue-800" size="sm">{c.nbConfirmations} conf.</Badge>
                            <Badge color={c.statut==="CONFIRMEE"?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"} size="sm">{c.statut}</Badge>
                          </div>
                          <p className="text-xs text-surface-500 mt-0.5">
                            {c.set?.siteExpedition?.nom ?? "—"} · {c.fournisseur?.nom ?? "—"}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-300" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SET manuel si non trouvé */}
            <Input label="SET (5 chiffres)" value={form.setId}
              onChange={(e) => { update("setId", e.target.value); setSelectedSet(e.target.value); }}
              placeholder="ex: 02958" maxLength={5} className="font-mono w-48"
              hint="Renseignez manuellement si la recherche ne trouve rien" />
          </CardBody>
        </Card>

        {/* Contexte OR */}
        <Card>
          <CardHeader><h3 className="font-display font-semibold">Contexte OR (optionnel)</h3></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="N° OR" value={form.numOR} onChange={(e) => update("numOR", e.target.value)} />
            <Textarea label="Verbatim client" value={form.verbatimClient}
              onChange={(e) => update("verbatimClient", e.target.value)} rows={2} />
            <Textarea label="Diagnostic réparateur" value={form.diagReparateur}
              onChange={(e) => update("diagReparateur", e.target.value)} rows={2} />
            <Textarea label="Conclusion du tri" value={form.conclusionTri}
              onChange={(e) => update("conclusionTri", e.target.value)} rows={2} />
          </CardBody>
        </Card>

        {/* Rangement */}
        <Card>
          <CardHeader><h3 className="font-display font-semibold">Rangement</h3></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Type de rangement"
              value={form.typeRangement}
              onChange={(e) => update("typeRangement", e.target.value)}
              options={[
                {value:"PETITE_BOITE_RC",label:"Petite boîte RC"},
                {value:"KARDEX_IC",label:"Kardex IC"},
                {value:"AUTRE",label:"Autre"},
              ]} placeholder="Sélectionner…"
            />
            <Input label="Emplacement / référence" value={form.emplacement}
              onChange={(e) => update("emplacement", e.target.value)} />
          </CardBody>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Annuler</Button>
          <Button type="submit" loading={loading}>Enregistrer le tri</Button>
        </div>
      </form>
    </>
  );
}
