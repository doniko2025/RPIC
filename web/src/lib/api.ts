//web/src/lib/api.ts
/**
 * Client API RPIC
 * - Ajoute automatiquement l'Authorization header
 * - Renouvelle le token si 401
 * - Retourne les données typées
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

// ─── Storage des tokens ────────────────────────────────────────────────────
export const TOKEN_KEY   = "rpic_access_token";
export const REFRESH_KEY = "rpic_refresh_token";

export function getToken()   { return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY)   : null; }
export function getRefresh() { return typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null; }

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY,   access);
  localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Renouvellement du token ───────────────────────────────────────────────
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const rt = getRefresh();
      if (!rt) return false;
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) { clearTokens(); return false; }
      const { data } = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch { return false; }
    finally { refreshing = null; }
  })();
  return refreshing;
}

// ─── Fetch central ────────────────────────────────────────────────────────
export interface ApiError { message: string; status: number; details?: unknown; }

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Token expiré → tenter le refresh
  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, options, false);
    clearTokens();
    window.location.href = "/login";
    throw { message: "Session expirée", status: 401 } as ApiError;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { message: body.error ?? "Erreur serveur", status: res.status, details: body.details } as ApiError;
  }

  if (res.status === 204) return undefined as T;
  return res.json().then((b) => b.data ?? b);
}

// ─── Méthodes HTTP ─────────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                       => request<T>(path),
  post:   <T>(path: string, body?: unknown)       => request<T>(path, { method:"POST",  body: JSON.stringify(body)  }),
  patch:  <T>(path: string, body?: unknown)       => request<T>(path, { method:"PATCH", body: JSON.stringify(body)  }),
  put:    <T>(path: string, body?: unknown)       => request<T>(path, { method:"PUT",   body: JSON.stringify(body)  }),
  delete: <T>(path: string)                       => request<T>(path, { method:"DELETE" }),
};

// ─── Helpers pagination ────────────────────────────────────────────────────
export interface PagedResponse<T> { data: T[]; meta: PaginationMeta; }
export interface PaginationMeta   { page: number; limit: number; total: number; totalPages: number; }

export function buildQuery(params: Record<string, string|number|boolean|undefined|null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
