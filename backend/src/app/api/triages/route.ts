//backend/src/app/api/triages/route.ts
import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PieceTriageService } from "@/services/piece-triage.service";
import { CreateTriageSchema } from "@/validators/piece-triage.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await PieceTriageService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateTriageSchema.parse(await req.json());
    return created(await PieceTriageService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
