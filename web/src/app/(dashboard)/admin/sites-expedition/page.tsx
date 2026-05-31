"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { MapPin } from "lucide-react";

export default function SitesExpeditionPage() {
  const [f, setF] = useState<Record<string,string>>({ code6Plus2:"", nom:"", adresse:"", ville:"", pays:"France", fournisseurId:"" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Sites d'expédition" apiPath="/sites-expedition"
      emptyIcon={<MapPin className="w-10 h-10"/>}
      columns={[
        { key:"code6Plus2", label:"Code 6+2",  mono:true },
        { key:"nom",        label:"Nom" },
        { key:"ville",      label:"Ville" },
        { key:"pays",       label:"Pays" },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="Code 6+2 *" value={f.code6Plus2} onChange={e=>up("code6Plus2",e.target.value.toUpperCase())} required className="font-mono" placeholder="417999-00"/>
          <Input label="Nom *"      value={f.nom}         onChange={e=>up("nom",e.target.value)} required/>
          <Input label="Adresse"    value={f.adresse}     onChange={e=>up("adresse",e.target.value)} className="col-span-2"/>
          <Input label="Ville"      value={f.ville}       onChange={e=>up("ville",e.target.value)}/>
          <Input label="Pays"       value={f.pays}        onChange={e=>up("pays",e.target.value)}/>
        </div>
      }
    />
  );
}
