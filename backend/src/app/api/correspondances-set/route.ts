//backend/src/app/api/correspondances-set/route.ts
import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { CorrespondanceSetService } from "@/services/correspondance-set.service";
import { CreateCorrSchema } from "@/validators/correspondance-set.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await CorrespondanceSetService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateCorrSchema.parse(await req.json());
    const res = await CorrespondanceSetService.upsertFromTriage(dto, userId);
    return created(res);
  } catch (e) { return handleError(e); }
}
