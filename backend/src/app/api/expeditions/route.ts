//backend/src/app/api/expeditions/route.ts
import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { ExpeditionService } from "@/services/expedition.service";
import { CreateExpSchema } from "@/validators/expedition.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await ExpeditionService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateExpSchema.parse(await req.json());
    return created(await ExpeditionService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
