import jwt from "jsonwebtoken";

export interface JwtPayload { userId: string; email: string; role: string; iat?: number; exp?: number; }

const AS = process.env.JWT_ACCESS_SECRET!;
const RS = process.env.JWT_REFRESH_SECRET!;
const AE = (process.env.JWT_ACCESS_EXPIRY || "15m") as string;
const RE = (process.env.JWT_REFRESH_EXPIRY || "7d") as string;

export const signAccess  = (p: Omit<JwtPayload,"iat"|"exp">) => jwt.sign(p, AS, { expiresIn: AE } as jwt.SignOptions);
export const signRefresh = (p: Omit<JwtPayload,"iat"|"exp">) => jwt.sign(p, RS, { expiresIn: RE } as jwt.SignOptions);

export function verifyAccessToken(token: string): JwtPayload {
  try { return jwt.verify(token, AS) as JwtPayload; }
  catch { throw Object.assign(new Error("Token invalide"), { statusCode: 401 }); }
}
export function verifyRefreshToken(token: string): JwtPayload {
  try { return jwt.verify(token, RS) as JwtPayload; }
  catch { throw Object.assign(new Error("Refresh token invalide"), { statusCode: 401 }); }
}
export function extractToken(h: string | null): string {
  if (!h?.startsWith("Bearer ")) throw Object.assign(new Error("Token manquant"), { statusCode: 401 });
  return h.slice(7);
}
