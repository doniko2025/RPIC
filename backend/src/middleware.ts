/**
 * Next.js Middleware — protection des routes API
 * S'exécute AVANT chaque requête.
 * 
 * Logique :
 * - Routes publiques (/api/auth/*, /api/health) → passe directement
 * - Toutes les autres routes /api/* → vérifie le Bearer token JWT
 * - Pages frontend : pas concernées (gérées par le layout frontend)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/register",
  "/api/auth/reset-password/request",
  "/api/auth/reset-password/confirm",
  "/api/health",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":      "http://localhost:3001",
  "Access-Control-Allow-Methods":     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":     "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Preflight OPTIONS → répondre immédiatement avec les headers CORS
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // Routes non-API → passe directement
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Routes publiques → passe avec headers CORS
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    const res = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // Routes protégées → vérifier le token
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Token manquant. Authentifiez-vous d'abord." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const payload = verifyAccessToken(token);
    const headers = new Headers(req.headers);
    headers.set("x-user-id",    payload.userId);
    headers.set("x-user-email", payload.email);
    headers.set("x-user-role",  payload.role);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
    const res = NextResponse.next({ request: { headers } });
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: "Token invalide ou expiré. Reconnectez-vous." },
      { status: 401, headers: CORS_HEADERS }
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};