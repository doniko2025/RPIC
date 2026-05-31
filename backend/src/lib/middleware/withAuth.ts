import { NextRequest, NextResponse } from "next/server";
import { AppError, ForbiddenError } from "@/lib/errors";
import { handleError } from "@/lib/response";

export interface UserCtx { userId:string; email:string; role:string; }

export function getUserCtx(req: NextRequest): UserCtx {
  const userId = req.headers.get("x-user-id");
  const email  = req.headers.get("x-user-email");
  const role   = req.headers.get("x-user-role");
  if (!userId||!email||!role) throw new AppError("Contexte auth manquant",401);
  return { userId, email, role };
}

type H = (req: NextRequest, ctx: { params: Record<string,string> }) => Promise<NextResponse>;

export const withAuth = (h: H): H => async (req, ctx) => {
  try { getUserCtx(req); return await h(req, ctx); }
  catch(e) { return handleError(e); }
};

export const withRole = (roles: string[], h: H): H => async (req, ctx) => {
  try {
    const { role } = getUserCtx(req);
    if (!roles.includes(role)) throw new ForbiddenError(`Rôle requis : ${roles.join(" | ")}`);
    return await h(req, ctx);
  } catch(e) { return handleError(e); }
};

export const wrap = (h: H): H => async (req, ctx) => {
  try { return await h(req, ctx); } catch(e) { return handleError(e); }
};
