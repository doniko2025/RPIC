//backend/src/lib/middleware/withAuth.ts
/**
 * Helper pour extraire le contexte utilisateur dans les route handlers.
 * Le middleware.ts a déjà vérifié le token et injecté les headers x-user-*.
 *
 * Usage dans une route :
 *   const { userId, role } = getUserCtx(req);
 */
import { NextRequest } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

export interface UserCtx {
  userId: string;
  email:  string;
  role:   string;
}

export function getUserCtx(req: NextRequest): UserCtx {
  const userId = req.headers.get("x-user-id");
  const email  = req.headers.get("x-user-email");
  const role   = req.headers.get("x-user-role");

  if (!userId || !email || !role) {
    throw new UnauthorizedError("Contexte utilisateur manquant.");
  }

  return { userId, email, role };
}

export function requireRole(req: NextRequest, ...roles: string[]): UserCtx {
  const ctx = getUserCtx(req);
  if (!roles.includes(ctx.role)) {
    throw new ForbiddenError(`Rôle requis : ${roles.join(" ou ")}`);
  }
  return ctx;
}
