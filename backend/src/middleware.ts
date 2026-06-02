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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204 });
  if (!pathname.startsWith("/api")) return NextResponse.next();
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ success: false, error: "Token manquant." }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? "");
    const { payload } = await jwtVerify(token, secret);

    const headers = new Headers(req.headers);
    headers.set("x-user-id",    String(payload.userId   ?? ""));
    headers.set("x-user-email", String(payload.email    ?? ""));
    headers.set("x-user-role",  String(payload.role     ?? ""));

    return NextResponse.next({ request: { headers } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Token invalide ou expiré." },
      { status: 401 }
    );
  }
}

export const config = { matcher: ["/api/:path*"] };