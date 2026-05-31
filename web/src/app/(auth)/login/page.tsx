"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Package, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Tous les champs sont requis"); return; }
    setLoading(true); setError("");
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-card-md border border-surface-200 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-brand-gradient px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">RPIC</h1>
              <p className="text-white/70 text-xs">Gestion des pièces — Guyancourt</p>
            </div>
          </div>
          <p className="text-white/90 text-sm">
            Retour des Pièces Incidentées & Comex
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <h2 className="font-display text-xl font-semibold text-surface-900">Connexion</h2>

          {error && <Alert type="error" message={error} />}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@renault.fr"
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            suffix={
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-surface-400 hover:text-surface-600">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="flex justify-end">
            <Link href="/reset-password" className="text-xs text-brand-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Se connecter
          </Button>
        </form>
      </div>
      <p className="text-center text-xs text-surface-400 mt-4">
        © {new Date().getFullYear()} Renault — RPIC Technocentre Guyancourt
      </p>
    </div>
  );
}
