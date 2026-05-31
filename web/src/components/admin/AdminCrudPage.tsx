"use client";
import React, { useEffect, useState } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

export interface ColDef {
  key: string;
  label: string;
  render?: (row: Record<string,unknown>) => React.ReactNode;
  mono?: boolean;
}

interface Props {
  title: string;
  apiPath: string;
  columns: ColDef[];
  breadcrumbParent?: string;
  formFields: React.ReactNode;
  formTitle?: string;
  searchPlaceholder?: string;
  canDelete?: boolean;
  extraActions?: (row: Record<string,unknown>) => React.ReactNode;
  onFormState?: (state: Record<string,string>, row: Record<string,unknown>|null) => void;
  formState: Record<string,string>;
  setFormState: (s: Record<string,string>) => void;
  buildPayload?: (form: Record<string,string>) => Record<string,unknown>;
  emptyIcon?: React.ReactNode;
}

export function AdminCrudPage({
  title, apiPath, columns, breadcrumbParent, formFields, formTitle,
  searchPlaceholder, canDelete=true, extraActions, onFormState,
  formState, setFormState, buildPayload, emptyIcon,
}: Props) {
  const { data, meta, loading, load, setFilter, goToPage } = usePagination<Record<string,unknown>>(apiPath);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [editRow,  setEditRow]  = useState<Record<string,unknown>|null>(null);
  const [delRow,   setDelRow]   = useState<Record<string,unknown>|null>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(()=>{ load(1); },[]);

  function openCreate() {
    setEditRow(null); setError("");
    onFormState?.({}, null);
    setModal(true);
  }

  function openEdit(row: Record<string,unknown>) {
    setEditRow(row); setError("");
    const init: Record<string,string> = {};
    for (const [k,v] of Object.entries(row)) {
      if (typeof v === "string" || typeof v === "number") init[k] = String(v);
    }
    onFormState?.(init, row);
    setFormState(init);
    setModal(true);
  }

  async function save() {
    setSaving(true); setError("");
    try {
      const payload = buildPayload ? buildPayload(formState) : formState;
      if (editRow) await api.patch(`${apiPath}/${editRow.id}`, payload);
      else         await api.post(apiPath, payload);
      toast.success(editRow ? "Modifié" : "Créé");
      setModal(false); load(meta.page);
    } catch(err:unknown){ setError((err as {message?:string}).message??"Erreur"); } finally { setSaving(false); }
  }

  async function del() {
    if (!delRow) return;
    setDeleting(true);
    try {
      await api.delete(`${apiPath}/${delRow.id}`);
      toast.success("Supprimé"); setDelRow(null); load(meta.page);
    } catch(err:unknown){ toast.error((err as {message?:string}).message??"Erreur"); } finally { setDeleting(false); }
  }

  return (
    <>
      <Header title={title}/>
      <PageHeader title={title}
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Admin",href:"/admin/users"},{label:breadcrumbParent??title}]}
        actions={<Button icon={<Plus className="w-4 h-4"/>} onClick={openCreate}>Ajouter</Button>}
      />
      <div className="flex gap-3 mb-5">
        <SearchInput value={search}
          onChange={(v)=>{ setSearch(v); setFilter("search",v); }}
          placeholder={searchPlaceholder??"Rechercher…"} className="w-64"/>
      </div>

      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={emptyIcon} title="Aucun élément"/>
      ) : (
        <Card>
          <div className="table-wrapper">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-100">
                {columns.map(c=>(
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-4 py-3"/>
              </tr></thead>
              <tbody className="divide-y divide-surface-50">
                {data.map((row,i)=>(
                  <tr key={String(row.id??i)} className="hover:bg-surface-50">
                    {columns.map(c=>(
                      <td key={c.key} className={["px-4 py-3",c.mono?"font-mono":""].join(" ")}>
                        {c.render ? c.render(row) : String(row[c.key]??"")||"—"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {extraActions?.(row)}
                        <Button size="xs" variant="ghost" icon={<Pencil className="w-3.5 h-3.5"/>} onClick={()=>openEdit(row)}>Éditer</Button>
                        {canDelete && <Button size="xs" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5 text-red-500"/>} onClick={()=>setDelRow(row)}/>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}

      <Modal open={modal} onClose={()=>setModal(false)}
        title={formTitle ?? (editRow ? `Modifier — ${title}` : `Ajouter — ${title}`)}
        size="lg"
        footer={<><Button variant="secondary" onClick={()=>setModal(false)}>Annuler</Button><Button onClick={save} loading={saving}>Enregistrer</Button></>}
      >
        <div className="space-y-4">
          {error && <Alert type="error" message={error}/>}
          {formFields}
        </div>
      </Modal>

      <ConfirmModal open={!!delRow} onClose={()=>setDelRow(null)} onConfirm={del} loading={deleting}
        title="Confirmer la suppression"
        message={`Supprimer définitivement cet élément ?`}
        confirmLabel="Supprimer"/>
    </>
  );
}
