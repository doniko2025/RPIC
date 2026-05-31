"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setTokens, clearTokens, getToken, TOKEN_KEY } from "./api";

export interface AuthUser {
  id: string; email: string; nom: string; prenom: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  typePrincipal?: "RC" | "IC" | null;
  lieuTravail: string; poste?: string;
  acceptedRgpdAt?: string | null;
  rgpdVersion?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const u = await api.get<AuthUser>("/auth/me");
      setUser(u);
    } catch { setUser(null); clearTokens(); }
  }, []);

  useEffect(() => {
    if (getToken()) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ accessToken:string; refreshToken:string; user:AuthUser }>("/auth/login", { email, password });
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem("rpic_refresh_token");
      if (rt) await api.post("/auth/logout", { refreshToken: rt });
    } catch {}
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const refresh = useCallback(async () => { await fetchMe(); }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
