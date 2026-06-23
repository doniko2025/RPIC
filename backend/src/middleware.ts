//backend/src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/health",
];

// FIX : CORS centralisé ici — next.config.mjs ne doit plus avoir de section headers()
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin":      ORIGIN,
    "Access-Control-Allow-Methods":     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":     "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

function addCors(res: NextResponse): NextResponse {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Preflight OPTIONS — DOIT renvoyer les headers CORS sinon le browser bloque
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }

  if (!pathname.startsWith("/api")) return NextResponse.next();

  // Routes publiques — on laisse passer + on ajoute CORS sur la réponse
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return addCors(NextResponse.next());
  }

  // Routes protégées — vérification JWT
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Token manquant." },
      { status: 401, headers: corsHeaders() },
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? "");
    const { payload } = await jwtVerify(token, secret);

    const headers = new Headers(req.headers);
    headers.set("x-user-id",    String(payload.userId ?? ""));
    headers.set("x-user-email", String(payload.email  ?? ""));
    headers.set("x-user-role",  String(payload.role   ?? ""));

    return addCors(NextResponse.next({ request: { headers } }));
  } catch {
    return NextResponse.json(
      { success: false, error: "Token invalide ou expiré." },
      { status: 401, headers: corsHeaders() },
    );
  }
}

export const config = { matcher: ["/api/:path*"] };