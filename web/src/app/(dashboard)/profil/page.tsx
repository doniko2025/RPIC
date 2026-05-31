"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { roleBadge, roleLabel, fmt } from "@/lib/utils";
import { Eye, EyeOff, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilPage() {
  const { user, refresh } = useAuth();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd,setConfPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  if (!user) return null;

  async function changePwd(e:React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confPwd) { setError("Les mots de passe ne correspondent pas"); return; }
    if (newPwd.length < 8)  { setError("Le nouveau mot de passe doit faire au moins 8 caractères"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await api.post("/auth/change-password",{ currentPassword:oldPwd, newPassword:newPwd });
      toast.success("Mot de passe modifié"); setOldPwd(""); setNewPwd(""); setConfPwd("");
      setSuccess("Mot de passe mis à jour avec succès.");
    } catch(err:unknown){ setError((err as {message?:string}).message??"Erreur"); } finally { setLoading(false); }
  }

  return (
    <>
      <Header title="Mon profil"/>
      <PageHeader title="Mon profil"
        breadcrumb={[{label:"Accueil",href:"/dashboard"},{label:"Profil"}]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Infos utilisateur */}
        <Card>
          <CardHeader>
            <h3 className="font-display font-semibold">Informations personnelles</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white">
                {user.prenom[0]}{user.nom[0]}
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-surface-900">{user.prenom} {user.nom}</p>
                <p className="text-sm text-surface-500">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-surface-400 mb-0.5">Rôle</p>
                <Badge color={roleBadge(user.role)}>{roleLabel(user.role)}</Badge>
              </div>
              <div><p className="text-xs text-surface-400 mb-0.5">Lieu de travail</p>
                <p className="text-surface-900">{user.lieuTravail}</p>
              </div>
              {user.poste && (
                <div><p className="text-xs text-surface-400 mb-0.5">Poste</p>
                  <p className="text-surface-900">{user.poste}</p>
                </div>
              )}
              {user.typePrincipal && (
                <div><p className="text-xs text-surface-400 mb-0.5">Type principal</p>
                  <Badge color={user.typePrincipal==="RC"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}>{user.typePrincipal}</Badge>
                </div>
              )}
            </div>
            {user.acceptedRgpdAt && (
              <p className="text-xs text-surface-400 border-t border-surface-100 pt-3">
                RGPD accepté le {fmt.date(user.acceptedRgpdAt)} — version {user.rgpdVersion}
              </p>
            )}
          </CardBody>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader><h3 className="font-display font-semibold">Changer de mot de passe</h3></CardHeader>
          <CardBody>
            <form onSubmit={changePwd} className="space-y-4">
              {error   && <Alert type="error"   message={error}/>}
              {success && <Alert type="success" message={success}/>}
              <Input
                label="Mot de passe actuel" type={showOld?"text":"password"}
                value={oldPwd} onChange={e=>setOldPwd(e.target.value)} required
                suffix={<button type="button" onClick={()=>setShowOld(!showOld)} className="text-surface-400 hover:text-surface-600">{showOld?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>}
              />
              <Input
                label="Nouveau mot de passe" type={showNew?"text":"password"}
                value={newPwd} onChange={e=>setNewPwd(e.target.value)} required minLength={8}
                hint="Minimum 8 caractères"
                suffix={<button type="button" onClick={()=>setShowNew(!showNew)} className="text-surface-400 hover:text-surface-600">{showNew?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>}
              />
              <Input
                label="Confirmer" type="password"
                value={confPwd} onChange={e=>setConfPwd(e.target.value)} required
                error={confPwd && confPwd!==newPwd ? "Les mots de passe ne correspondent pas" : ""}
              />
              <Button type="submit" loading={loading} icon={<Save className="w-4 h-4"/>} className="w-full">
                Mettre à jour
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
