//web/src/app/(dashboard)/admin/sets/page.tsx
"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Hash } from "lucide-react";

export default function SetsPage() {
  const [f, setF] = useState<Record<string,string>>({ id:"", libelle:"", typePiece:"RC", siteExpeditionId:"", fournisseurId:"" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="SETs" apiPath="/sets"
      emptyIcon={<Hash className="w-10 h-10"/>}
      columns={[
        { key:"id",      label:"SET",     mono:true },
        { key:"libelle", label:"Libellé" },
        { key:"typePiece",label:"Type" },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="SET (5 chiffres) *" value={f.id} onChange={e=>up("id",e.target.value)} required maxLength={5} className="font-mono" placeholder="02958"/>
          <Select label="Type pièce" value={f.typePiece} onChange={e=>up("typePiece",e.target.value)}
            options={[{value:"RC",label:"RC"},{value:"IC",label:"IC"}]}/>
          <Input label="Libellé" value={f.libelle} onChange={e=>up("libelle",e.target.value)} className="col-span-2"/>
        </div>
      }
    />
  );
}
