//web/src/app/(dashboard)/admin/fournisseurs/page.tsx
"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Building2 } from "lucide-react";

export default function FournisseursPage() {
  const [f, setF] = useState<Record<string,string>>({ nom:"", code:"", typePiece:"RC", email:"", adresse:"", ville:"", pays:"France", delaiContractuel:"7" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Fournisseurs" apiPath="/fournisseurs"
      emptyIcon={<Building2 className="h-10 w-10"/>}
      columns={[
        { key:"code",    label:"Code",  mono:true },
        { key:"nom",     label:"Nom" },
        { key:"typePiece",label:"Type", render:r=><Badge color={r.typePiece==="RC"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}>{String(r.typePiece)}</Badge> },
        { key:"email",   label:"Email" },
        { key:"ville",   label:"Ville" },
        { key:"delaiContractuel", label:"Délai (j)", mono:true },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="Code *"  value={f.code} onChange={e=>up("code",e.target.value.toUpperCase())} required className="font-mono"/>
          <Input label="Nom *"   value={f.nom}  onChange={e=>up("nom", e.target.value)} required/>
          <Select label="Type pièce" value={f.typePiece} onChange={e=>up("typePiece",e.target.value)}
            options={[{value:"RC",label:"RC — Recours Comex"},{value:"IC",label:"IC — Incidentologie"}]}/>
          <Input label="Délai contractuel (j)" type="number" value={f.delaiContractuel} onChange={e=>up("delaiContractuel",e.target.value)}/>
          <Input label="Email" value={f.email} onChange={e=>up("email",e.target.value)} type="email" className="col-span-2"/>
          <Input label="Adresse" value={f.adresse} onChange={e=>up("adresse",e.target.value)} className="col-span-2"/>
          <Input label="Ville"  value={f.ville}   onChange={e=>up("ville", e.target.value)}/>
          <Input label="Pays"   value={f.pays}    onChange={e=>up("pays",  e.target.value)}/>
        </div>
      }
    />
  );
}
