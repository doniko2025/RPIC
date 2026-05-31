"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Warehouse } from "lucide-react";

export default function GaragesPage() {
  const [f, setF] = useState<Record<string,string>>({ nom:"", code:"", adresse:"", ville:"", codePostal:"", pays:"France" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Garages" apiPath="/garages"
      emptyIcon={<Warehouse className="w-10 h-10"/>}
      columns={[
        { key:"code", label:"Code", mono:true },
        { key:"nom",  label:"Nom" },
        { key:"ville",label:"Ville" },
        { key:"pays", label:"Pays" },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="Code *" value={f.code} onChange={e=>up("code",e.target.value.toUpperCase())} required className="font-mono"/>
          <Input label="Nom *"  value={f.nom}  onChange={e=>up("nom", e.target.value)} required/>
          <Input label="Adresse"    value={f.adresse}    onChange={e=>up("adresse",   e.target.value)} className="col-span-2"/>
          <Input label="Code postal" value={f.codePostal} onChange={e=>up("codePostal",e.target.value)}/>
          <Input label="Ville"      value={f.ville}      onChange={e=>up("ville",     e.target.value)}/>
          <Input label="Pays"       value={f.pays}       onChange={e=>up("pays",      e.target.value)}/>
        </div>
      }
    />
  );
}
