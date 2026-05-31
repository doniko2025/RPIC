import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const PUBLIC = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/reset-password",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const payload = verifyAccessToken(auth.slice(7));
    const h = new Headers(req.headers);
    h.set("x-user-id", payload.userId);
    h.set("x-user-email", payload.email);
    h.set("x-user-role", payload.role);
    return NextResponse.next({ request: { headers: h } });
  } catch {
    return NextResponse.json({ success: false, error: "Token invalide" }, { status: 401 });
  }
}
export const config = { matcher: ["/api/:path*"] };
