//web/src/app/(dashboard)/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageLoader } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import {
  Package, Truck, RotateCcw, AlertTriangle, Wrench,
  CheckCircle2, Clock, ArrowRight, TrendingUp, TrendingDown,
  Plus, Search, Bell, Calendar, Activity
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
  alertesRCActives: number;
}

interface Alerte {
  id: string;
  triage: { nitgSaisi: string; agentTri: { nom: string; prenom: string } };
  joursRestants: number;
  dateMaxExpedition: string;
  fournisseur?: { nom: string };
}

interface Stat {
  date: string;
  nbPiecesTrieesTotal: number;
  nbExpeditionsDHL: number;
  nbExpeditionsTRANS: number;
}

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});

function KpiCard({
  label, value, sub, icon, href, urgent = false, positive = false, neutral = false
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; href?: string; urgent?: boolean;
  positive?: boolean; neutral?: boolean;
}) {
  const bg = urgent ? "bg-red-50 border-red-200" :
             positive ? "bg-green-50 border-green-200" :
             neutral  ? "bg-blue-50 border-blue-200" :
             "bg-white border-gray-200";
  const numColor = urgent ? "text-red-700" :
                   positive ? "text-green-700" :
                   neutral  ? "text-blue-700" :
                   "text-gray-900";
  const iconBg   = urgent ? "bg-red-100 text-red-600" :
                   positive ? "bg-green-100 text-green-600" :
                   neutral  ? "bg-blue-100 text-blue-600" :
                   "bg-gray-100 text-gray-500";

  const inner = (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${bg}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">{label}</p>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-mono font-bold leading-none mb-1 ${numColor}`}>
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400">
          Voir le détail <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

function AlertRow({ a }: { a: Alerte }) {
  const j = a.joursRestants;
  const color = j < 0 ? "bg-red-100 text-red-700 border-red-200" :
                j <= 1 ? "bg-orange-100 text-orange-700 border-orange-200" :
                "bg-yellow-100 text-yellow-700 border-yellow-200";
  const label = j < 0  ? `Dépassé de ${Math.abs(j)}j` :
                j === 0 ? "Aujourd'hui" :
                j === 1 ? "Demain" :
                `J+${j}`;

  return (
    <Link href="/alertes-rc"
      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${j < 0 ? "bg-red-500" : j <= 1 ? "bg-orange-400" : "bg-yellow-400"}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 font-mono">{a.triage.nitgSaisi}</p>
          <p className="text-xs text-gray-400 truncate">{a.fournisseur?.nom ?? "Fournisseur non défini"}</p>
        </div>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ml-3 ${color}`}>
        {label}
      </span>
    </Link>
  );
}

const ACTIONS_RAPIDES = [
  { label: "Nouveau tri",      href: "/triages/nouveau",          icon: <Plus className="w-4 h-4" />,    color: "bg-red-600 hover:bg-red-700 text-white" },
  { label: "Rechercher SET",   href: "/correspondances-set/search", icon: <Search className="w-4 h-4" />, color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200" },
  { label: "Créer expédition", href: "/expeditions",              icon: <Truck className="w-4 h-4" />,   color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200" },
  { label: "Signaler anomalie",href: "/anomalies",                 icon: <Wrench className="w-4 h-4" />, color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200" },
];

const PIE_COLORS = ["#b91c1c", "#d97706"];

export default function DashboardPage() {
  const [data,    setData]    = useState<Dashboard | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [hist,    setHist]    = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Dashboard>("/dashboard"),
      api.get<{ data: Alerte[] }>("/alertes-rc?statut=ACTIVE&limit=6"),
      api.get<Stat[]>("/stats?jours=14"),
    ])
      .then(([d, a, h]) => {
        setData(d);
        setAlertes((a as { data: Alerte[] }).data ?? []);
        setHist(Array.isArray(h) ? h.slice(-14) : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="Tableau de bord" /><PageLoader /></>;
  if (error || !data) return (
    <><Header title="Tableau de bord" />
      <Alert type="error" message="Impossible de charger les données. Vérifiez que le backend est démarré." />
    </>
  );

  const pieData = [
    { name: "RC", value: data.triages.rc },
    { name: "IC", value: data.triages.ic },
  ];

  const chartData = hist.map((s) => ({
    j: new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    Triages: s.nbPiecesTrieesTotal,
    DHL: s.nbExpeditionsDHL,
    TRANS: s.nbExpeditionsTRANS,
  }));

  const hasAlerte = data.alertesRC.depassements > 0;

  return (
    <>
      <Header title="Tableau de bord" />
      <div className="space-y-6">

        {/* Bandeau alerte critique */}
        {hasAlerte && (
          <div className="bg-red-600 text-white rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">
                {data.alertesRC.depassements} pièce{data.alertesRC.depassements > 1 ? "s" : ""} RC ont dépassé le délai d&apos;expédition de 7 jours — action immédiate requise.
              </p>
            </div>
            <Link href="/alertes-rc" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              Traiter maintenant →
            </Link>
          </div>
        )}

        {/* Date + actions rapides */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 capitalize">{today}</p>
            <p className="text-lg font-semibold text-gray-800">Bonjour 👋</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ACTIONS_RAPIDES.map((a) => (
              <Link key={a.href} href={a.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${a.color}`}
              >
                {a.icon} {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* KPIs ligne 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Pièces triées"
            value={data.triages.total}
            sub={`RC : ${data.triages.rc} · IC : ${data.triages.ic}`}
            icon={<Package className="w-4 h-4" />}
            href="/triages"
          />
          <KpiCard
            label="Alertes RC actives"
            value={data.alertesRC.actives}
            sub={`${data.alertesRC.depassements} dépassement${data.alertesRC.depassements > 1 ? "s" : ""}`}
            icon={<AlertTriangle className="w-4 h-4" />}
            href="/alertes-rc"
            urgent={data.alertesRC.actives > 0}
          />
          <KpiCard
            label="Expéditions"
            value={data.expeditions.total}
            sub={`DHL : ${data.expeditions.dhl} · TRANS : ${data.expeditions.trans}`}
            icon={<Truck className="w-4 h-4" />}
            href="/expeditions"
            neutral
          />
          <KpiCard
            label="Retours reçus"
            value={data.retours.total}
            sub={`TRANS sans motif : ${data.retours.trans}`}
            icon={<RotateCcw className="w-4 h-4" />}
            href="/retours-expedition"
          />
        </div>

        {/* KPIs ligne 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Anomalies ouvertes"
            value={data.anomalies.ouvertes}
            icon={<Wrench className="w-4 h-4" />}
            href="/anomalies"
            urgent={data.anomalies.ouvertes > 0}
          />
          <KpiCard
            label="Pièces IC caffutées"
            value={data.ic.caffutes}
            icon={<CheckCircle2 className="w-4 h-4" />}
            href="/triages"
            positive
          />
          <KpiCard
            label="SET confirmés"
            value={data.referentiel.confirmees}
            sub="Auto-appris"
            icon={<TrendingUp className="w-4 h-4" />}
            href="/correspondances-set"
            positive
          />
          <KpiCard
            label="Conflits SET"
            value={data.referentiel.conflits}
            sub="À résoudre"
            icon={<TrendingDown className="w-4 h-4" />}
            href="/correspondances-set"
            urgent={data.referentiel.conflits > 0}
          />
        </div>

        {/* Graphes + alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Graphe activité 14j */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Activité des 14 derniers jours</h3>
                <p className="text-xs text-gray-400 mt-0.5">Triages, expéditions DHL et TRANS</p>
              </div>
              <Activity className="w-4 h-4 text-gray-300" />
            </div>
            {chartData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                Données insuffisantes pour afficher le graphe
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gTriages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#b91c1c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDHL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="j" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    cursor={{ stroke: "#e5e7eb" }}
                  />
                  <Area type="monotone" dataKey="Triages" stroke="#b91c1c" strokeWidth={2} fill="url(#gTriages)" dot={false} />
                  <Area type="monotone" dataKey="DHL"     stroke="#2563eb" strokeWidth={2} fill="url(#gDHL)"     dot={false} />
                  <Area type="monotone" dataKey="TRANS"   stroke="#d97706" strokeWidth={2} fill="none"           dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-5 mt-3">
              {[["#b91c1c","Triages"],["#2563eb","DHL"],["#d97706","TRANS"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-xs text-gray-400">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite : pie + raccourcis */}
          <div className="flex flex-col gap-4">

            {/* Répartition RC/IC */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Répartition RC / IC</h3>
              {data.triages.total === 0 ? (
                <div className="h-20 flex items-center justify-center text-xs text-gray-400">Aucune pièce</div>
              ) : (
                <div className="flex items-center gap-4">
                  <PieChart width={80} height={80}>
                    <Pie data={pieData} cx={35} cy={35} innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                  <div className="flex flex-col gap-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-xs text-gray-500">{d.name}</span>
                        <span className="text-sm font-bold text-gray-900 font-mono ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <Link href="/notifications"
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-400">Non lues</p>
                </div>
              </div>
              {data.notificationsNonLues > 0 ? (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.notificationsNonLues}
                </span>
              ) : (
                <span className="text-xs text-gray-300">Aucune</span>
              )}
            </Link>

          </div>
        </div>

        {/* Alertes RC urgentes */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Alertes RC — délai d&apos;expédition</h3>
              {alertes.length > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {alertes.length}
                </span>
              )}
            </div>
            <Link href="/alertes-rc" className="text-xs font-medium text-red-600 hover:underline flex items-center gap-1">
              Voir toutes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {alertes.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Aucune alerte active</p>
              <p className="text-xs text-gray-400 mt-1">Toutes les pièces RC sont dans les délais</p>
            </div>
          ) : (
            <div>
              {alertes.map((a) => <AlertRow key={a.id} a={a} />)}
            </div>
          )}
        </div>

      </div>
    </>
  );
}