//backend/src/app/api/stats/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { StatsService } from "@/services/stats.service";

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    if (date) return ok(await StatsService.getJour(date));
    return ok(await StatsService.getHistorique(req.nextUrl.searchParams));
  } catch (e) { return handleError(e); }
}
