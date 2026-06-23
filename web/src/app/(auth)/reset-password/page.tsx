//web/src/app/(auth)/reset-password/page.tsx
"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Package, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const sp     = useSearchParams();
  const token  = sp.get("token");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/auth/reset-password/request", { email });
      setDone(true);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Erreur");
    } finally { setLoading(false); }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true); setError("");
    try {
      await api.post("/auth/reset-password/confirm", { token, password });
      setDone(true);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="bg-white rounded-3xl shadow-card-md border border-surface-200 overflow-hidden">
        <div className="bg-brand-gradient px-8 py-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-xl font-bold text-white">RPIC</h1>
        </div>
        <div className="px-8 py-7 space-y-5">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-display text-lg font-semibold">
                {token ? "Mot de passe modifié" : "Email envoyé"}
              </p>
              <p className="text-sm text-surface-500">
                {token ? "Vous pouvez maintenant vous connecter." : "Vérifiez votre boîte mail."}
              </p>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mt-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
              </Link>
            </div>
          ) : token ? (
            <>
              <h2 className="font-display text-xl font-semibold">Nouveau mot de passe</h2>
              {error && <Alert type="error" message={error} />}
              <form onSubmit={handleConfirm} className="space-y-4">
                <Input label="Nouveau mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                <Input label="Confirmer" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                <Button type="submit" loading={loading} className="w-full">Modifier</Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold">Mot de passe oublié</h2>
              <p className="text-sm text-surface-500">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              {error && <Alert type="error" message={error} />}
              <form onSubmit={handleRequest} className="space-y-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nom@renault.fr" />
                <Button type="submit" loading={loading} className="w-full">Envoyer le lien</Button>
              </form>
              <Link href="/login" className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
