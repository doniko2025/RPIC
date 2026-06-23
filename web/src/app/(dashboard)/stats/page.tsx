//web/src/app/(dashboard)/stats/page.tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { StatCard } from "@/components/dashboard/StatCard";
import { fmt } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import { BarChart3, Package, Truck, AlertTriangle } from "lucide-react";

interface StatDay {
  date:string; nbPiecesTrieesTotal:number; nbTriRC:number; nbTriIC:number;
  nbExpeditionsDHL:number; nbExpeditionsTRANS:number; nbRetours:number; nbAlertes:number;
}
interface StatGlobal {
  totalTriages:number; totalRC:number; totalIC:number; totalExpeditions:number;
  totalRetours:number; tauxRetour:number; tauxAlerteRC:number; caffutages:number;
  corrConfirmees:number; corrConflits:number; autoResolutionTaux:number;
}

const COLORS = ["#dc2626","#3b82f6","#22c55e","#f59e0b","#8b5cf6"];

export default function StatsPage() {
  const [jours,    setJours]    = useState("30");
  const [days,     setDays]     = useState<StatDay[]>([]);
  const [global_,  setGlobal]   = useState<StatGlobal|null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      api.get<StatDay[]>(`/stats?jours=${jours}`),
      api.get<StatGlobal>("/stats/global"),
    ]).then(([d,g])=>{ setDays(Array.isArray(d)?d:[]); setGlobal(g); })
      .finally(()=>setLoading(false));
  },[jours]);

  const chartData = days.map(d=>({
    date: fmt.date(d.date),
    RC: d.nbTriRC, IC: d.nbTriIC,
    DHL: d.nbExpeditionsDHL, TRANS: d.nbExpeditionsTRANS,
    Retours: d.nbRetours, Alertes: d.nbAlertes,
  }));

  const pieData = global_ ? [
    { name:"RC", value:global_.totalRC },
    { name:"IC", value:global_.totalIC },
  ] : [];

  return (
    <>
      <Header title="Statistiques"/>
      <PageHeader title="Statistiques"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Statistiques"}]}
        actions={
          <Select options={[{value:"7",label:"7 jours"},{value:"14",label:"14 jours"},{value:"30",label:"30 jours"},{value:"90",label:"90 jours"}]}
            value={jours} onChange={e=>setJours(e.target.value)} className="w-32"/>
        }
      />

      {loading ? <PageLoader/> : (
        <div className="space-y-6">
          {global_ && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total triages" value={global_.totalTriages} icon={<Package className="w-4 h-4"/>} color="brand"/>
              <StatCard label="Total expéditions" value={global_.totalExpeditions} icon={<Truck className="w-4 h-4"/>}/>
              <StatCard label="Taux retour" value={`${global_.tauxRetour.toFixed(1)}%`} icon={<BarChart3 className="w-4 h-4"/>}/>
              <StatCard label="Taux alerte RC" value={`${global_.tauxAlerteRC.toFixed(1)}%`} icon={<AlertTriangle className="w-4 h-4"/>} color={global_.tauxAlerteRC>20?"red":"default"}/>
              <StatCard label="Caffutages" value={global_.caffutages} color="green"/>
              <StatCard label="Corr. confirmées" value={global_.corrConfirmees}/>
              <StatCard label="Conflits SET" value={global_.corrConflits} color={global_.corrConflits>0?"orange":"default"}/>
              <StatCard label="Auto-résolution SET" value={`${(global_.autoResolutionTaux*100).toFixed(1)}%`} color="green"/>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><h3 className="font-display font-semibold">Triages RC / IC</h3></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="date" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:10}}/>
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}}/>
                    <Legend/>
                    <Bar dataKey="RC"  fill="#dc2626" radius={[3,3,0,0]}/>
                    <Bar dataKey="IC"  fill="#3b82f6" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-display font-semibold">Expéditions DHL / TRANS</h3></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="date" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:10}}/>
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}}/>
                    <Legend/>
                    <Line type="monotone" dataKey="DHL"   stroke="#f59e0b" strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="TRANS" stroke="#3b82f6" strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-display font-semibold">Retours & Alertes RC</h3></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="date" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:10}}/>
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}}/>
                    <Legend/>
                    <Line type="monotone" dataKey="Retours" stroke="#ef4444" strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="Alertes" stroke="#f97316" strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {global_ && (
              <Card>
                <CardHeader><h3 className="font-display font-semibold">Répartition RC / IC</h3></CardHeader>
                <CardBody className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                        {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}
