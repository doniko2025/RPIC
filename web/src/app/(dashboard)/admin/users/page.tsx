"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { roleBadge, roleLabel } from "@/lib/utils";
import { Users } from "lucide-react";

export default function UsersPage() {
  const [f, setF] = useState<Record<string,string>>({
    nom:"", prenom:"", email:"", role:"EMPLOYEE", lieuTravail:"", poste:"", typePrincipal:""
  });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Utilisateurs" apiPath="/users"
      emptyIcon={<Users className="w-10 h-10"/>}
      columns={[
        { key:"prenom",    label:"Prénom" },
        { key:"nom",       label:"Nom" },
        { key:"email",     label:"Email" },
        { key:"role",      label:"Rôle",   render:r=><Badge color={roleBadge(String(r.role))}>{roleLabel(String(r.role))}</Badge> },
        { key:"lieuTravail",label:"Lieu" },
        { key:"isActive",  label:"Actif",  render:r=><Badge color={r.isActive?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}>{r.isActive?"Oui":"Non"}</Badge> },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={f.prenom} onChange={e=>up("prenom",e.target.value)} required/>
          <Input label="Nom *"    value={f.nom}    onChange={e=>up("nom",   e.target.value)} required/>
          <Input label="Email *"  value={f.email}  onChange={e=>up("email", e.target.value)} type="email" required className="col-span-2"/>
          <Select label="Rôle" value={f.role} onChange={e=>up("role",e.target.value)}
            options={[{value:"ADMIN",label:"Admin"},{value:"MANAGER",label:"Manager"},{value:"EMPLOYEE",label:"Employé"}]}/>
          <Select label="Type principal" value={f.typePrincipal} onChange={e=>up("typePrincipal",e.target.value)}
            options={[{value:"",label:"—"},{value:"RC",label:"RC"},{value:"IC",label:"IC"}]}/>
          <Input label="Lieu de travail" value={f.lieuTravail} onChange={e=>up("lieuTravail",e.target.value)} className="col-span-2"/>
          <Input label="Poste" value={f.poste} onChange={e=>up("poste",e.target.value)} className="col-span-2"/>
        </div>
      }
    />
  );
}
