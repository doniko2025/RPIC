//web/src/app/(dashboard)/admin/references-piece/page.tsx
"use client";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BookOpen } from "lucide-react";

export default function ReferencesPiecePage() {
  const [f, setF] = useState<Record<string,string>>({ refPiece:"", nomPiece:"", typePiece:"RC", photo1:"", photo2:"" });
  const up=(k:string,v:string)=>setF(x=>({...x,[k]:v}));

  return (
    <AdminCrudPage
      title="Références pièces" apiPath="/references-piece"
      emptyIcon={<BookOpen className="w-10 h-10"/>}
      columns={[
        { key:"refPiece", label:"Référence", mono:true },
        { key:"nomPiece", label:"Désignation" },
        { key:"typePiece",label:"Type" },
      ]}
      formState={f} setFormState={setF}
      onFormState={(init)=>setF(x=>({...x,...init}))}
      formFields={
        <div className="grid grid-cols-2 gap-4">
          <Input label="Référence *" value={f.refPiece} onChange={e=>up("refPiece",e.target.value.toUpperCase())} required maxLength={10} className="font-mono col-span-2"/>
          <Input label="Désignation *" value={f.nomPiece} onChange={e=>up("nomPiece",e.target.value)} required className="col-span-2"/>
          <Select label="Type pièce" value={f.typePiece} onChange={e=>up("typePiece",e.target.value)}
            options={[{value:"RC",label:"RC"},{value:"IC",label:"IC"}]}/>
          <div/>
          <Input label="URL photo 1" value={f.photo1} onChange={e=>up("photo1",e.target.value)} type="url" className="col-span-2"/>
          <Input label="URL photo 2" value={f.photo2} onChange={e=>up("photo2",e.target.value)} type="url" className="col-span-2"/>
        </div>
      }
    />
  );
}
