//web/src/app/(dashboard)/admin/pilotes/page.tsx
"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { UserCheck } from "lucide-react";

export default function PilotesPage() {
  const [f, setF] = useState<Record<string,string>>({ code:"", nom:"", prenom:"", email:"", typePiece:"RC" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Pilotes" apiPath="/pilotes"
      emptyIcon={<UserCheck className="w-10 h-10"/>}
      columns={[
        { key:"code",  label:"Code",  mono:true },
        { key:"prenom",label:"Prénom" },
        { key:"nom",   label:"Nom" },
        { key:"email", label:"Email" },
        { key:"typePiece", label:"Type", render:r=><Badge color={r.typePiece==="RC"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}>{String(r.typePiece)}</Badge> },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="Code *" value={f.code} onChange={e=>up("code",e.target.value.toUpperCase())} required className="font-mono" placeholder="RC411"/>
          <Select label="Type pièce" value={f.typePiece} onChange={e=>up("typePiece",e.target.value)}
            options={[{value:"RC",label:"RC"},{value:"IC",label:"IC"}]}/>
          <Input label="Prénom *" value={f.prenom} onChange={e=>up("prenom",e.target.value)} required/>
          <Input label="Nom *"    value={f.nom}    onChange={e=>up("nom",   e.target.value)} required/>
          <Input label="Email"    value={f.email}  onChange={e=>up("email", e.target.value)} type="email" className="col-span-2"/>
        </div>
      }
    />
  );
}
