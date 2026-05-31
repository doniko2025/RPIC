import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export const ok       = <T>(d: T, s=200)      => NextResponse.json({ success:true, data:d }, { status:s });
export const created  = <T>(d: T)             => NextResponse.json({ success:true, data:d }, { status:201 });
export const noContent= ()                    => new NextResponse(null, { status:204 });
export const errRes   = (msg:string, s=400, details?:unknown) =>
  NextResponse.json({ success:false, error:msg, details }, { status:s });

export const paginated = <T>(data:T[], meta:PaginationMeta) =>
  NextResponse.json({ success:true, data, meta });

export interface PaginationMeta { page:number; limit:number; total:number; totalPages:number; }

export function handleError(e: unknown): NextResponse {
  if (e instanceof ZodError)  return errRes("Données invalides", 422, e.flatten());
  if (e instanceof AppError)  return errRes(e.message, e.statusCode, e.details);
  if (e instanceof Error && "statusCode" in e)
    return errRes(e.message, (e as AppError).statusCode);
  console.error("[API]", e);
  return errRes("Erreur interne", 500);
}

export function pagination(sp: URLSearchParams) {
  const page  = Math.max(1, parseInt(sp.get("page")  || "1",  10));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10)));
  return { page, limit, skip: (page-1)*limit };
}
export const meta = (total:number, page:number, limit:number): PaginationMeta =>
  ({ page, limit, total, totalPages: Math.ceil(total/limit) });
