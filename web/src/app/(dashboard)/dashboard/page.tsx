//web/src/app/(dashboard)/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import {
  Package, Truck, RotateCcw, AlertTriangle, Wrench,
  CheckCircle2, Clock, ArrowUpRight, TrendingUp, TrendingDown,
  Plus, Search, Bell, Activity, RefreshCw, Zap, ShieldCheck,
} from "lucide-react";

interface Dashboard {
  triages:     { total: number; rc: number; ic: number };
  expeditions: { total: number; dhl: number; trans: number };
  retours:     { total: number; trans: number; tauxTRANS: number };
  alertesRC:   { actives: number; depassements: number };
  anomalies:   { ouvertes: number };
  ic:          { caffutes: number };
  referentiel: { confirmees: number; conflits: number };
  notificationsNonLues: number;
}
interface Alerte {
  id: string;
  triage: { nitgSaisi: string };
  joursRestants: number;
  fournisseur?: { nom: string };
}
interface Stat {
  date: string;
  nbPiecesTrieesTotal: number;
  nbExpeditionsDHL: number;
  nbExpeditionsTRANS: number;
}

const PIE_COLORS = ["#3b82f6", "#f59e0b"];
const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

const CustomTooltip = ({ active, payload, label }: {active?:boolean;payload?:{name:string;value:number;color:string}[];label?:string}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xl text-[13px]">
      <p className="text-gray-500 mb-2 font-semibold">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background:p.color }} />
          <span className="text-gray-700 font-semibold">{p.name}</span>
          <span className="font-bold ml-auto pl-5" style={{ color:p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data,      setData]      = useState<Dashboard | null>(null);
  const [alertes,   setAlertes]   = useState<Alerte[]>([]);
  const [hist,      setHist]      = useState<Stat[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [errors,    setErrors]    = useState<string[]>([]);
  const [refreshing,setRefreshing]= useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const errs: string[] = [];
    const [d, a, h] = await Promise.all([
      api.get<Dashboard>("/dashboard").catch(e => { errs.push(`Dashboard: ${e?.message??e}`); return null; }),
      api.get("/alertes-rc?statut=ACTIVE&limit=5").catch(e => { errs.push(`Alertes: ${e?.message??e}`); return null; }),
      api.get("/stats?jours=14").catch(e => { errs.push(`Stats: ${e?.message??e}`); return null; }),
    ]);
    setData(d as Dashboard | null);
    setAlertes(Array.isArray(a) ? a : (a as {data?:Alerte[]})?.data ?? []);
    setHist((Array.isArray(h) ? h : []).slice(-14));
    setErrors(errs);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const chartData = hist.map(s => ({
    j: new Date(s.date).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit" }),
    Triages: s.nbPiecesTrieesTotal,
    DHL: s.nbExpeditionsDHL,
    TRANS: s.nbExpeditionsTRANS,
  }));

  const pieData = data ? [
    { name:"RC", value:data.triages.rc },
    { name:"IC", value:data.triages.ic },
  ] : [];

  const totalPieces = data?.triages.total ?? 0;

  // Classes partagées pour les cartes (Ombre renforcée + Animation)
  const cardClasses = "flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out group";

  return (
    <>
      <Header title="Tableau de bord" />

      <div className="space-y-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto mt-6">

        {/* ── Erreurs ── */}
        {errors.length > 0 && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Erreurs de chargement
            </p>
            {errors.map((e,i) => <p key={i} className="text-sm text-red-600 font-mono ml-7">{e}</p>)}
          </div>
        )}

        {/* ── Bandeau alerte ── */}
        {data && data.alertesRC.depassements > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-red-50 border border-red-200 px-6 py-5 flex items-center justify-between gap-4 flex-col sm:flex-row shadow-md">
            <div className="relative flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-red-900 font-bold text-base">{data.alertesRC.depassements} pièce{data.alertesRC.depassements>1?"s":""} RC hors délai</p>
                <p className="text-red-700 text-sm mt-0.5">Expédition requise sous 24h — délai 7 jours dépassé</p>
              </div>
            </div>
            <Link href="/alertes-rc" className="w-full sm:w-auto text-center bg-red-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex-shrink-0">
              Traiter maintenant →
            </Link>
          </div>
        )}

        {/* ── Bonjour + actions ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.06)] border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-medium capitalize mb-1">{today}</p>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bonjour, Thierno 👋</h2>
            <p className="text-sm text-gray-500 mt-1">Voici un résumé de votre activité logistique.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/triages/nouveau"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white shadow-md hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" /> Nouveau tri
            </Link>
            {[
              { label:"Chercher SET", href:"/correspondances-set/search", icon:<Search className="w-4 h-4 text-gray-600" /> },
              { label:"Créer expédition", href:"/expeditions", icon:<Truck className="w-4 h-4 text-gray-600" /> },
              { label:"Anomalie", href:"/anomalies", icon:<Wrench className="w-4 h-4 text-gray-600" /> },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex-1 sm:flex-none"
              >
                {a.icon} <span className="hidden sm:inline">{a.label}</span>
              </Link>
            ))}
            <button onClick={() => load(true)} disabled={refreshing}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing?"animate-spin":""}`} />
            </button>
          </div>
        </div>

        {/* ── Skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({length:8}).map((_,i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* ── INDICATEURS GÉNÉRAUX (L1) ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">Indicateurs Généraux</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Pièces triées */}
                <Link href="/triages" className={cardClasses}>
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pièces triées</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                      <Package className="w-5 h-5 text-blue-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-3xl font-semibold text-slate-800 tabular-nums tracking-tight">{data.triages.total.toLocaleString("fr-FR")}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <span>RC <strong className="text-slate-700 font-semibold">{data.triages.rc}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>IC <strong className="text-slate-700 font-semibold">{data.triages.ic}</strong></span>
                    </p>
                  </div>
                </Link>

                {/* Expéditions */}
                <Link href="/expeditions" className={cardClasses}>
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expéditions</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-300">
                      <Truck className="w-5 h-5 text-purple-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-3xl font-semibold text-slate-800 tabular-nums tracking-tight">{data.expeditions.total.toLocaleString("fr-FR")}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <span>DHL <strong className="text-slate-700 font-semibold">{data.expeditions.dhl}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>TRANS <strong className="text-slate-700 font-semibold">{data.expeditions.trans}</strong></span>
                    </p>
                  </div>
                </Link>

                {/* Retours */}
                <Link href="/retours-expedition" className={cardClasses}>
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Retours</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
                      <RotateCcw className="w-5 h-5 text-emerald-600 group-hover:scale-110 group-hover:-rotate-90 transition-transform duration-500" />
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-3xl font-semibold text-slate-800 tabular-nums tracking-tight">{data.retours.total.toLocaleString("fr-FR")}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      TRANS sans motif : <strong className="text-slate-700 font-semibold">{data.retours.trans}</strong>
                    </p>
                  </div>
                </Link>

                {/* Alertes RC */}
                <Link href="/alertes-rc" className={cardClasses}>
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alertes RC</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-300">
                      <AlertTriangle className="w-5 h-5 text-orange-600 group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="w-full">
                    <p className={`text-3xl font-semibold tabular-nums tracking-tight ${data.alertesRC.actives > 0 ? 'text-orange-600' : 'text-slate-800'}`}>
                      {data.alertesRC.actives.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Dépassements : <strong className={`font-semibold ${data.alertesRC.depassements > 0 ? 'text-red-500' : 'text-slate-700'}`}>{data.alertesRC.depassements}</strong>
                    </p>
                  </div>
                </Link>

              </div>
            </section>

            {/* ── SOUS-INDICATEURS (L2) ── */}
            <section className="mt-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">Performances & Qualité</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label:"Anomalies Ouvertes", value:data.anomalies.ouvertes,  icon:Wrench,       href:"/anomalies",             bgIcon:"bg-amber-100 text-amber-600", borderLeft:"border-l-amber-500", sub:"En cours de traitement" },
                  { label:"IC Caffutées",       value:data.ic.caffutes,         icon:CheckCircle2, href:"/triages",               bgIcon:"bg-emerald-100 text-emerald-600", borderLeft:"border-l-emerald-500", sub:"Mises au rebut" },
                  { label:"SET Confirmés",      value:data.referentiel.confirmees, icon:TrendingUp,   href:"/correspondances-set", bgIcon:"bg-blue-100 text-blue-600", borderLeft:"border-l-blue-500", sub:"Apprentissage réussi" },
                  { label:"Conflits SET",       value:data.referentiel.conflits,   icon:TrendingDown, href:"/correspondances-set", bgIcon:"bg-fuchsia-100 text-fuchsia-600", borderLeft:"border-l-fuchsia-500", sub:"Action requise" },
                ].map(k => (
                  <Link key={k.label} href={k.href}
                    className={`flex flex-col p-5 bg-white rounded-2xl border border-gray-100 border-l-4 ${k.borderLeft} shadow-[0_5px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out group`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${k.bgIcon} transition-colors duration-300`}>
                        <k.icon className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
                      </div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{k.label}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-slate-800 tabular-nums tracking-tight">{k.value.toLocaleString("fr-FR")}</p>
                      {k.sub && <p className="text-xs font-medium text-gray-500 mt-1">{k.sub}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Graphes & Colonne Droite ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

              {/* Graphe activité */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.06)] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Activité des 14 derniers jours</h3>
                    <p className="text-sm text-gray-500 mt-1">Évolution des triages et expéditions (DHL/TRANS)</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 font-semibold self-start sm:self-auto shadow-sm">
                    <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                    Temps réel
                  </div>
                </div>
                
                {chartData.length === 0 ? (
                  <div className="h-[280px] flex flex-col items-center justify-center gap-4 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-600">Aucune activité enregistrée</p>
                      <p className="text-sm text-gray-500 mt-1">Les données apparaîtront après vos premiers traitements.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                        <defs>
                          <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="j" tick={{ fontSize:11, fill:"#64748b", fontWeight:500 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize:11, fill:"#64748b", fontWeight:500 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="Triages" stroke="#3b82f6" strokeWidth={3} fill="url(#gT)" dot={false} activeDot={{ r:6, fill:"#3b82f6", strokeWidth:2, stroke:"white" }} />
                        <Area type="monotone" dataKey="DHL"     stroke="#8b5cf6" strokeWidth={3}   fill="url(#gD)" dot={false} activeDot={{ r:6, fill:"#8b5cf6", strokeWidth:2, stroke:"white" }} />
                        <Area type="monotone" dataKey="TRANS"   stroke="#f59e0b" strokeWidth={2.5} fill="none"     dot={false} strokeDasharray="6 4" activeDot={{ r:6, fill:"#f59e0b", strokeWidth:2, stroke:"white" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
                  {[["#3b82f6","Triages Globaux"],["#8b5cf6","Expéditions DHL"],["#f59e0b","Expéditions TRANS"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background:c }} />
                      <span className="text-sm font-semibold text-gray-600">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col gap-6">

                {/* Répartition RC/IC */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition RC / IC</h3>
                  
                  {totalPieces === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Aucune donnée de tri</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8 flex-1 justify-center">
                      <div className="flex justify-center relative hover:scale-105 transition-transform duration-500">
                        <PieChart width={150} height={150}>
                          <Pie data={pieData} cx={70} cy={70} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={3} stroke="white">
                            {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                        </PieChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2 pointer-events-none">
                          <span className="text-2xl font-bold text-slate-800">{totalPieces}</span>
                          <span className="text-xs font-semibold text-gray-400 uppercase">Total</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4 mt-2">
                        {pieData.map((d,i) => (
                          <div key={d.name}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ background:PIE_COLORS[i] }} />
                                <span className="text-sm font-semibold text-gray-700">Pièces {d.name}</span>
                              </div>
                              <span className="text-sm font-bold text-slate-800 tabular-nums">{d.value} <span className="text-xs font-medium text-gray-500 ml-1">({Math.round((d.value/totalPieces)*100)}%)</span></span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: totalPieces ? `${(d.value/totalPieces)*100}%` : "0%", background:PIE_COLORS[i] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications + Statut */}
                <div className="flex flex-col gap-4">
                  <Link href="/notifications"
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Bell className="w-5 h-5 text-blue-600 group-hover:rotate-[15deg] transition-transform duration-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Notifications</p>
                        <p className="text-xs text-gray-500 mt-0.5">Alertes et messages</p>
                      </div>
                    </div>
                    {data.notificationsNonLues > 0 ? (
                      <span className="min-w-[28px] h-7 bg-red-500 text-white text-xs font-bold px-2.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                        {data.notificationsNonLues > 99 ? "99+" : data.notificationsNonLues}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">À jour</span>
                    )}
                  </Link>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center relative">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">Système opérationnel</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> Connecté au serveur
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Alertes RC (Vue Liste moderne) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.06)] overflow-hidden mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200 shadow-sm">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Alertes RC urgentes</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Dépassements de délais d'expédition</p>
                  </div>
                  {alertes.length > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">{alertes.length}</span>
                  )}
                </div>
                <Link href="/alertes-rc" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl">
                  Gérer les alertes <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {alertes.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center hover:scale-110 transition-transform duration-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-slate-800">Excellente nouvelle !</p>
                    <p className="text-sm text-gray-500 mt-1">Toutes les pièces RC sont traitées dans les délais impartis.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {alertes.map((a) => {
                    const j = a.joursRestants;
                    const styles =
                      j < 0  ? { badge:"bg-red-50 text-red-700 border-red-200",  dot:"bg-red-500",    row:"hover:bg-red-50/30" } :
                      j <= 1 ? { badge:"bg-orange-50 text-orange-700 border-orange-200", dot:"bg-orange-500", row:"hover:bg-orange-50/30" } :
                               { badge:"bg-yellow-50 text-yellow-700 border-yellow-200", dot:"bg-yellow-500", row:"hover:bg-yellow-50/30" };
                    
                    const txt = j < 0 ? `Dépassé de ${Math.abs(j)} jour${Math.abs(j)>1?'s':''}` : j === 0 ? "Aujourd'hui" : j === 1 ? "Demain" : `J+${j}`;
                    
                    return (
                      <Link key={a.id} href="/alertes-rc"
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 transition-colors duration-300 group ${styles.row} gap-4`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${styles.dot} group-hover:scale-125 transition-transform duration-300`} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 font-mono tracking-wider">{a.triage.nitgSaisi}</p>
                            <p className="text-xs font-medium text-gray-500 truncate mt-1 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" /> {a.fournisseur?.nom ?? "Fournisseur non défini"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border shadow-sm ${styles.badge}`}>
                            {txt}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:bg-gray-50 group-hover:border-gray-300 group-hover:scale-110 transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-slate-800" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </>
  );
}