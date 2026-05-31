"use client";
import { useEffect } from "react";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { fmt } from "@/lib/utils";
import { Bell, CheckCheck, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface Notif {
  id:string; titre:string; message:string; type:string; isRead:boolean; createdAt:string;
}

const typeColor: Record<string,string> = {
  ALERTE_RC:  "bg-red-100 text-red-800",
  RETOUR_TRANS:"bg-orange-100 text-orange-800",
  ANOMALIE:   "bg-yellow-100 text-yellow-800",
  INFO:       "bg-blue-100 text-blue-800",
};

export default function NotificationsPage() {
  const { data, meta, loading, load, goToPage } = usePagination<Notif>("/notifications");

  useEffect(()=>{ load(1); },[]);

  async function markRead(id:string) {
    try { await api.patch(`/notifications/${id}`,{isRead:true}); load(meta.page); } catch { toast.error("Erreur"); }
  }

  async function markAllRead() {
    try { await api.post("/notifications/tout-lire",{}); toast.success("Tout marqué lu"); load(1); } catch { toast.error("Erreur"); }
  }

  return (
    <>
      <Header title="Notifications"/>
      <PageHeader title="Notifications"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Notifications"}]}
        actions={<Button variant="secondary" size="sm" icon={<CheckCheck className="w-4 h-4"/>} onClick={markAllRead}>Tout marquer lu</Button>}
      />
      {loading ? <PageLoader/> : data.length===0 ? (
        <EmptyState icon={<Bell className="w-10 h-10"/>} title="Aucune notification"/>
      ) : (
        <Card>
          <div className="divide-y divide-surface-100">
            {data.map(n=>(
              <div key={n.id} className={["flex items-start gap-4 px-6 py-4 transition-colors",n.isRead?"":"bg-brand-50/40 hover:bg-brand-50"].join(" ")}>
                <div className="mt-0.5 shrink-0">
                  <div className={["w-2 h-2 rounded-full mt-1.5",n.isRead?"bg-surface-300":"bg-brand-600"].join(" ")}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-surface-900">{n.titre}</p>
                    <Badge color={typeColor[n.type]??"bg-gray-100 text-gray-600"} size="sm">{n.type.replace("_"," ")}</Badge>
                  </div>
                  <p className="text-sm text-surface-600">{n.message}</p>
                  <p className="text-xs text-surface-400 mt-1">{fmt.datetime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <Button size="xs" variant="ghost" icon={<Eye className="w-3.5 h-3.5"/>} onClick={()=>markRead(n.id)}>Lu</Button>
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-surface-100"><Pagination meta={meta} onPage={goToPage}/></div>
        </Card>
      )}
    </>
  );
}
