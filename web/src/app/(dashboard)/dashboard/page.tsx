"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageLoader } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fmt, joursRestants, colorJours, statutRCColor } from "@/lib/utils";
import {
  Package, Truck, RotateCcw, AlertTriangle, Wrench,
  TrendingUp, CheckCircle2, Clock
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Dashboard {
  triages:      { total:number; rc:number; ic:number };
  expeditions:  { total:number; dhl:number; trans:number };
  retours:      { total:number; trans:number; tauxTRANS:number };
  alertesRC:    { actives:number; depassements:number };
  anomalies:    { ouvertes:number };
  ic:           { caffutes:number };
  referentiel:  { confirmees:number; conflits:number };
  notificationsNonLues: number;
  alertesRCActives: number;
}

interface Alerte { id:string; triage:{ nitgSaisi:string; nomPiece?:string; agentTri:{nom:string;prenom:string} }; joursRestants:number; dateMaxExpedition:string; fournisseur?:{nom:string} }
interface Stat   { date:string; nbPiecesTrieesTotal:number; nbExpeditionsDHL:number; nbExpeditionsTRANS:number }

export default function DashboardPage() {
  const [data,    setData]    = useState<Dashboard|null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [hist,    setHist]    = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Dashboard>("/dashboard"),
      api.get<{data:Alerte[];meta:unknown}>("/alertes-rc?statut=ACTIVE&limit=5"),
      api.get<Stat[]>("/stats?jours=14"),
    ])
    .then(([d, a, h]) => {
      setData(d);
      setAlertes((a as {data:Alerte[]}).data ?? []);
      setHist(Array.isArray(h) ? h : []);
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="Tableau de bord" /><PageLoader /></>;
  if (!data)   return <><Header title="Tableau de bord" /><Alert type="error" message="Erreur de chargement" /></>;

  const chartData = hist.map((s) => ({
    date: fmt.date(s.date),
    Triages: s.nbPiecesTrieesTotal,
    DHL: s.nbExpeditionsDHL,
    TRANS: s.nbExpeditionsTRANS,
  }));

  return (
    <>
      <Header title="Tableau de bord" />
      <div className="space-y-6 animate-fade-in">
        {/* Alertes critiques */}
        {data.alertesRC.depassements > 0 && (
          <Alert type="error" message={`${data.alertesRC.depassements} pièce(s) RC ont dépassé le délai d'expédition de 7 jours. Action immédiate requise.`} />
        )}

        {/* KPIs principaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Triages total" value={data.triages.total} sub={`RC:${data.triages.rc} IC:${data.triages.ic}`} icon={<Package className="w-4 h-4" />} color="brand" />
          <StatCard label="Expéditions" value={data.expeditions.total} sub={`DHL:${data.expeditions.dhl} TRANS:${data.expeditions.trans}`} icon={<Truck className="w-4 h-4" />} />
          <StatCard label="Retours" value={data.retours.total} sub={`TRANS: ${data.retours.tauxTRANS}%`} icon={<RotateCcw className="w-4 h-4" />} color={data.retours.tauxTRANS > 20 ? "orange" : "default"} />
          <StatCard label="Alertes RC actives" value={data.alertesRC.actives} sub={`${data.alertesRC.depassements} dépassements`} icon={<AlertTriangle className="w-4 h-4" />} color={data.alertesRC.actives > 0 ? "red" : "green"} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Anomalies ouvertes" value={data.anomalies.ouvertes} icon={<Wrench className="w-4 h-4" />} />
          <StatCard label="Pièces IC caffutées" value={data.ic.caffutes} icon={<CheckCircle2 className="w-4 h-4" />} color="green" />
          <StatCard label="Correspondances confirmées" value={data.referentiel.confirmees} icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard label="Conflits SET" value={data.referentiel.conflits} icon={<AlertTriangle className="w-4 h-4" />} color={data.referentiel.conflits > 0 ? "orange" : "default"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphe 14 jours */}
          <Card>
            <CardHeader>
              <h3 className="font-display font-semibold text-surface-900">Activité — 14 derniers jours</h3>
            </CardHeader>
            <CardBody>
              {chartData.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-8">Données insuffisantes</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize:11 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} />
                    <Bar dataKey="Triages" fill="#dc2626" radius={[3,3,0,0]} />
                    <Bar dataKey="DHL"     fill="#fbbf24" radius={[3,3,0,0]} />
                    <Bar dataKey="TRANS"   fill="#60a5fa" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>

          {/* Alertes RC urgentes */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-surface-900">Alertes RC urgentes</h3>
              <Link href="/alertes-rc" className="text-xs text-brand-600 hover:underline">Voir tout</Link>
            </CardHeader>
            <CardBody className="p-0">
              {alertes.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-surface-500">Aucune alerte active</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {alertes.map((a) => (
                    <Link key={a.id} href={`/alertes-rc`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 font-mono">{a.triage.nitgSaisi}</p>
                        <p className="text-xs text-surface-500 truncate">{a.fournisseur?.nom ?? "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <Clock className="w-3.5 h-3.5 text-surface-400" />
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${colorJours(a.joursRestants)}`}>
                          J{a.joursRestants >= 0 ? `+${a.joursRestants}` : a.joursRestants}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
