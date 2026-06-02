//backend/src/app/api/triages/search/route.ts
import { NextRequest } from "next/server";
import { paginated, handleError } from "@/lib/response";
import { PieceTriageService } from "@/services/piece-triage.service";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await PieceTriageService.search(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
