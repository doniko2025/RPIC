/**
 * JWT — sign & verify
 * Utilisé par : middleware.ts, auth.service.ts, withAuth.ts
 */
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email:  string;
  role:   string;
}

const ACCESS_SECRET  = () => process.env.JWT_ACCESS_SECRET  ?? "dev_access_secret_change_in_prod";
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_in_prod";
const ACCESS_EXPIRY  = () => (process.env.JWT_ACCESS_EXPIRY  ?? "15m") as jwt.SignOptions["expiresIn"];
const REFRESH_EXPIRY = () => (process.env.JWT_REFRESH_EXPIRY ?? "7d")  as jwt.SignOptions["expiresIn"];

export function signAccess(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET(), { expiresIn: ACCESS_EXPIRY() });
}

export function signRefresh(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRY() });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET()) as JwtPayload;
}
