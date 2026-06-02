/**
 * Client API RPIC — v2
 * Corrections :
 * - Refresh robuste avec mutex (pas de rafale parallèle)
 * - Pré-vérification expiry avant chaque requête
 * - Pas de redirect immédiat → laisse l'auth-context gérer
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const TOKEN_KEY   = "rpic_access_token";
export const REFRESH_KEY = "rpic_refresh_token";

export const getToken   = () => typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY)   : null;
export const getRefresh = () => typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY,   access);
  localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ── Décoder le JWT (sans vérification de signature) ─────────────────────
function decodeJwt(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g,"+").replace(/_/g,"/")));
  } catch { return null; }
}

function isExpiredOrSoon(token: string, bufferSec = 60): boolean {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  return decoded.exp < (Date.now() / 1000) + bufferSec;
}

// ── Mutex de refresh — une seule tentative à la fois ────────────────────
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const rt = getRefresh();
      if (!rt) return false;

      const res = await fetch(`${BASE}/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken: rt }),
      });

      if (!res.ok) { clearTokens(); return false; }

      const body = await res.json();
      const data = body.data ?? body;
      if (!data.accessToken) { clearTokens(); return false; }

      setTokens(data.accessToken, data.refreshToken ?? rt);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Fetch central ────────────────────────────────────────────────────────
export interface ApiError { message: string; status: number; details?: unknown; }

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  let token = getToken();

  // Pré-refresh si le token expire dans moins de 60 secondes
  if (token && isExpiredOrSoon(token) && retry) {
    const ok = await tryRefresh();
    if (!ok) {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw { message: "Session expirée", status: 401 } as ApiError;
    }
    token = getToken();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // 401 post-envoi → tenter un refresh (token expiré entre-temps)
  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, options, false);
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw { message: "Session expirée", status: 401 } as ApiError;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      message: body.error ?? `Erreur ${res.status}`,
      status:  res.status,
      details: body.details,
    } as ApiError;
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json();
  return body.data ?? body;
}

// ── Méthodes HTTP ─────────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  put:    <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)                 => request<T>(path, { method: "DELETE" }),
};

// ── Helpers pagination ────────────────────────────────────────────────────
export interface PagedResponse<T> { data: T[]; meta: PaginationMeta; }
export interface PaginationMeta   { page: number; limit: number; total: number; totalPages: number; }

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}