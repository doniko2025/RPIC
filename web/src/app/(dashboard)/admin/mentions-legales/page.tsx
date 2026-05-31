"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import { FileText } from "lucide-react";

export default function MentionsLegalesPage() {
  const [f, setF] = useState<Record<string,string>>({ version:"", contenu:"", dateEntreeVigueur:"", isActive:"false" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Mentions légales" apiPath="/mentions-legales"
      emptyIcon={<FileText className="w-10 h-10"/>}
      columns={[
        { key:"version",            label:"Version",  mono:true },
        { key:"dateEntreeVigueur",  label:"En vigueur", render:r=>fmt.date(String(r.dateEntreeVigueur)) },
        { key:"isActive",           label:"Active",   render:r=><Badge color={r.isActive?"bg-green-100 text-green-800":"bg-gray-100 text-gray-600"}>{r.isActive?"Oui":"Non"}</Badge> },
        { key:"nbAcceptations",     label:"Acceptations", mono:true },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      buildPayload={(form)=>({ ...form, isActive: form.isActive==="true" })}
      formFields={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version *" value={f.version} onChange={e=>up("version",e.target.value)} required placeholder="v1.0"/>
            <Input label="Date entrée en vigueur *" type="date" value={f.dateEntreeVigueur} onChange={e=>up("dateEntreeVigueur",e.target.value)} required/>
            <Select label="Active" value={f.isActive} onChange={e=>up("isActive",e.target.value)}
              options={[{value:"false",label:"Non"},{value:"true",label:"Oui"}]}/>
          </div>
          <Textarea label="Contenu (HTML autorisé) *" value={f.contenu} onChange={e=>up("contenu",e.target.value)} required rows={10}/>
        </div>
      }
    />
  );
}
