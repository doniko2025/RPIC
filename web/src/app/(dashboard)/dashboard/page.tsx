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

const PIE_COLORS = ["#3b82f6", "#f59e0b"]; // Couleurs plus claires/modernes pour coller au thème
const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

const CustomTooltip = ({ active, payload, label }: {active?:boolean;payload?:{name:string;value:number;color:string}[];label?:string}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"white", border:"1px solid #e5e7eb", borderRadius:12, padding:"12px 16px", boxShadow:"0 10px 25px -5px rgba(0,0,0,0.1)", fontSize:13 }}>
      <p style={{ color:"#6b7280", marginBottom:8, fontWeight:600 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span style={{ color:"#374151", fontWeight:600 }}>{p.name}</span>
          <span style={{ color:p.color, fontWeight:800, marginLeft:"auto", paddingLeft:20 }}>{p.value}</span>
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

  return (
    <>
      <Header title="Tableau de bord" />

      <div className="space-y-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto mt-6">

        {/* ── Erreurs ── */}
        {errors.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-bold text-red-700 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Erreurs de chargement
            </p>
            {errors.map((e,i) => <p key={i} className="text-xs text-red-600 font-mono ml-6">{e}</p>)}
          </div>
        )}

        {/* ── Bandeau alerte ── */}
        {data && data.alertesRC.depassements > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-red-50 border border-red-200 px-5 sm:px-6 py-5 flex items-center justify-between gap-4 flex-col sm:flex-row shadow-sm">
            <div className="relative flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-red-900 font-bold text-base">{data.alertesRC.depassements} pièce{data.alertesRC.depassements>1?"s":""} RC hors délai</p>
                <p className="text-red-600 text-sm mt-0.5">Expédition requise sous 24h — délai 7 jours dépassé</p>
              </div>
            </div>
            <Link href="/alertes-rc" className="w-full sm:w-auto text-center bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex-shrink-0">
              Traiter maintenant →
            </Link>
          </div>
        )}

        {/* ── Bonjour + actions ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-medium capitalize mb-1">{today}</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bonjour, Thierno 👋</h2>
            <p className="text-sm text-gray-400 mt-1">Voici un résumé de votre activité logistique.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/triages/nouveau"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" /> Nouveau tri
            </Link>
            {[
              { label:"Chercher SET", href:"/correspondances-set/search", icon:<Search className="w-4 h-4 text-gray-500" /> },
              { label:"Créer expédition", href:"/expeditions", icon:<Truck className="w-4 h-4 text-gray-500" /> },
              { label:"Anomalie", href:"/anomalies", icon:<Wrench className="w-4 h-4 text-gray-500" /> },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100 transition-all flex-1 sm:flex-none"
              >
                {a.icon} <span className="hidden sm:inline">{a.label}</span>
              </Link>
            ))}
            <button onClick={() => load(true)} disabled={refreshing}
              className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center"
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
              <div key={i} className="h-40 rounded-3xl bg-gray-100 animate-pulse border border-gray-200" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* ── INDICATEURS GÉNÉRAUX (L1) ── */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Indicateurs Généraux</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Pièces triées */}
                <Link href="/triages"
                  className="relative flex flex-col items-center justify-center p-6 bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all border border-gray-100 border-t-4 border-t-blue-500 group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pièces triées</span>
                  <p className="text-4xl font-black text-gray-900 tabular-nums">{data.triages.total.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    RC <span className="font-bold text-gray-700">{data.triages.rc}</span> • IC <span className="font-bold text-gray-700">{data.triages.ic}</span>
                  </p>
                </Link>

                {/* Expéditions */}
                <Link href="/expeditions"
                  className="relative flex flex-col items-center justify-center p-6 bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all border border-gray-100 border-t-4 border-t-purple-500 group"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Expéditions</span>
                  <p className="text-4xl font-black text-gray-900 tabular-nums">{data.expeditions.total.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    DHL <span className="font-bold text-gray-700">{data.expeditions.dhl}</span> • TRANS <span className="font-bold text-gray-700">{data.expeditions.trans}</span>
                  </p>
                </Link>

                {/* Retours */}
                <Link href="/retours-expedition"
                  className="relative flex flex-col items-center justify-center p-6 bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all border border-gray-100 border-t-4 border-t-emerald-500 group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Retours</span>
                  <p className="text-4xl font-black text-gray-900 tabular-nums">{data.retours.total.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    TRANS sans motif : <span className="font-bold text-gray-700">{data.retours.trans}</span>
                  </p>
                </Link>

                {/* Alertes RC */}
                <Link href="/alertes-rc"
                  className="relative flex flex-col items-center justify-center p-6 bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all border border-gray-100 border-t-4 border-t-orange-500 group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Alertes RC</span>
                  <p className={`text-4xl font-black tabular-nums ${data.alertesRC.actives > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {data.alertesRC.actives.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Dépassements : <span className={`font-bold ${data.alertesRC.depassements > 0 ? 'text-red-500' : 'text-gray-700'}`}>{data.alertesRC.depassements}</span>
                  </p>
                </Link>

              </div>
            </div>

            {/* ── SOUS-INDICATEURS (L2 - Façon Soldes par devise) ── */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1 mt-4">Performances & Qualité</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label:"Anomalies Ouvertes", value:data.anomalies.ouvertes,  icon:<Wrench className="w-5 h-5" />,       href:"/anomalies",           style:"bg-[#fffbeb] text-amber-600 border-amber-100", titleCol:"text-amber-700", valCol:"text-amber-600", sub:"En cours de traitement" },
                  { label:"IC Caffutées",       value:data.ic.caffutes,         icon:<CheckCircle2 className="w-5 h-5" />, href:"/triages",             style:"bg-[#f0fdf4] text-emerald-600 border-emerald-100", titleCol:"text-emerald-700", valCol:"text-emerald-600", sub:"Mises au rebut" },
                  { label:"SET Confirmés",      value:data.referentiel.confirmees, icon:<TrendingUp className="w-5 h-5" />,   href:"/correspondances-set", style:"bg-[#eff6ff] text-blue-600 border-blue-100", titleCol:"text-blue-700", valCol:"text-blue-600", sub:"Apprentissage réussi" },
                  { label:"Conflits SET",       value:data.referentiel.conflits,   icon:<TrendingDown className="w-5 h-5" />, href:"/correspondances-set", style:"bg-[#fdf4ff] text-fuchsia-600 border-fuchsia-100", titleCol:"text-fuchsia-700", valCol:"text-fuchsia-600", sub:"Action requise" },
                ].map(k => (
                  <Link key={k.label} href={k.href}
                    className={`flex flex-col items-center justify-center p-6 rounded-[20px] border hover:shadow-md transition-all group text-center ${k.style}`}
                  >
                    <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      {k.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${k.titleCol}`}>{k.label}</span>
                    <p className={`text-3xl font-black tabular-nums ${k.valCol}`}>{k.value.toLocaleString("fr-FR")}</p>
                    {k.sub && <p className={`text-[11px] mt-2 font-medium opacity-70 ${k.titleCol}`}>{k.sub}</p>}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Graphes & Colonne Droite ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

              {/* Graphe activité */}
              <div className="lg:col-span-2 bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Activité des 14 derniers jours</h3>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Évolution des triages et expéditions (DHL/TRANS)</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500 font-semibold self-start sm:self-auto">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Temps réel
                  </div>
                </div>
                
                {chartData.length === 0 ? (
                  <div className="h-[280px] flex flex-col items-center justify-center gap-4 text-gray-300">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-gray-500">Aucune activité enregistrée</p>
                      <p className="text-sm text-gray-400 mt-1">Les données apparaîtront après vos premiers traitements.</p>
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
                        <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="j" tick={{ fontSize:11, fill:"#9ca3af", fontWeight:500 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize:11, fill:"#9ca3af", fontWeight:500 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }} />
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
                      <div className="w-3.5 h-3.5 rounded-full" style={{ background:c }} />
                      <span className="text-sm font-semibold text-gray-600">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col gap-6">

                {/* Répartition RC/IC */}
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 sm:p-8 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-900 mb-6">Répartition RC / IC</h3>
                  
                  {totalPieces === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Aucune donnée de tri</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8 flex-1 justify-center">
                      <div className="flex justify-center relative">
                        <PieChart width={140} height={140}>
                          <Pie data={pieData} cx={65} cy={65} innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={4} stroke="white">
                            {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                        </PieChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
                          <span className="text-2xl font-black text-gray-900">{totalPieces}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        {pieData.map((d,i) => (
                          <div key={d.name}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ background:PIE_COLORS[i] }} />
                                <span className="text-sm font-bold text-gray-700">Pièces {d.name}</span>
                              </div>
                              <span className="text-sm font-black text-gray-900 tabular-nums">{d.value} <span className="text-xs font-normal text-gray-400 ml-1">({Math.round((d.value/totalPieces)*100)}%)</span></span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
                    className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Notifications</p>
                        <p className="text-xs text-gray-500 mt-0.5">Alertes et messages</p>
                      </div>
                    </div>
                    {data.notificationsNonLues > 0 ? (
                      <span className="min-w-[28px] h-7 bg-red-500 text-white text-xs font-black px-2.5 rounded-full flex items-center justify-center shadow-sm">
                        {data.notificationsNonLues > 99 ? "99+" : data.notificationsNonLues}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">À jour</span>
                    )}
                  </Link>

                  <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center relative">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 relative z-10" />
                      <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">Système opérationnel</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connecté au serveur
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Alertes RC (Vue Table / Liste moderne) ── */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/50 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">Alertes RC urgentes</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Dépassements de délais d'expédition</p>
                  </div>
                  {alertes.length > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{alertes.length}</span>
                  )}
                </div>
                <Link href="/alertes-rc" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl">
                  Gérer les alertes <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {alertes.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-900">Excellente nouvelle !</p>
                    <p className="text-sm text-gray-500 mt-1">Toutes les pièces RC sont traitées dans les délais impartis.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {alertes.map((a) => {
                    const j = a.joursRestants;
                    const styles =
                      j < 0  ? { badge:"bg-red-50 text-red-700 border-red-100",  dot:"bg-red-500",    row:"hover:bg-red-50/30" } :
                      j <= 1 ? { badge:"bg-orange-50 text-orange-700 border-orange-100", dot:"bg-orange-500", row:"hover:bg-orange-50/30" } :
                               { badge:"bg-yellow-50 text-yellow-700 border-yellow-100", dot:"bg-yellow-500", row:"hover:bg-yellow-50/30" };
                    
                    const txt = j < 0 ? `Dépassé de ${Math.abs(j)} jour${Math.abs(j)>1?'s':''}` : j === 0 ? "Aujourd'hui" : j === 1 ? "Demain" : `J+${j}`;
                    
                    return (
                      <Link key={a.id} href="/alertes-rc"
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 transition-colors group ${styles.row} gap-4`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${styles.dot}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 font-mono tracking-wider">{a.triage.nitgSaisi}</p>
                            <p className="text-xs font-medium text-gray-500 truncate mt-1 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 opacity-70" /> {a.fournisseur?.nom ?? "Fournisseur non défini"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${styles.badge}`}>
                            {txt}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-200 transition-all">
                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
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